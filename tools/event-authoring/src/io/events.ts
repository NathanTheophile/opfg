import type { AuthoringProject, ContentFolder } from '../authoring/types';
import { CONTENT_SCHEMA_VERSION, type EventDefinition } from '../gameSchema/current/contract';
import { validateSingleEventShape } from '../gameSchema/current/validator';
import { collectEventLocalizationKeys } from '../localization/keys';
import { createEntry, ensureKeys, exportLocaleDictionary } from '../localization/store';
import { createZip, readZip } from '../utils/zip';

export interface EventImportFile { name: string; path?: string; text: string; }
export interface ImportProblem { file: string; message: string; }
export interface ImportReport { imported: number; warnings: ImportProblem[]; rejected: ImportProblem[]; importedIds: string[]; }
export interface ImportResult { project: AuthoringProject; report: ImportReport; }

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const eventFilename = (path: string) => path.replace(/\\/g, '/').split('/').at(-1)?.replace(/\.json$/i, '') ?? '';

const collectReferencedFlags = (value: unknown, result = new Set<string>()): Set<string> => {
  if (Array.isArray(value)) { value.forEach((entry) => collectReferencedFlags(entry, result)); return result; }
  if (!isRecord(value)) return result;
  if ((value.type === 'hasFlag' || value.type === 'setFlag' || value.type === 'clearFlag') && typeof value.flagId === 'string' && value.flagId) result.add(value.flagId);
  Object.values(value).forEach((entry) => collectReferencedFlags(entry, result));
  return result;
};

const phaseFromCondition = (condition: unknown): string | undefined => {
  if (!isRecord(condition)) return undefined;
  if (condition.type === 'careerPhaseIs' && typeof condition.phase === 'string') return condition.phase;
  if ((condition.type === 'all' || condition.type === 'any') && Array.isArray(condition.conditions)) return condition.conditions.map(phaseFromCondition).find(Boolean);
  if (condition.type === 'not') return undefined;
  return undefined;
};

export const inferContentFolder = (path: string | undefined, event: EventDefinition): ContentFolder => {
  const normalized = (path ?? '').replace(/\\/g, '/').toLowerCase();
  if (normalized.includes('fixtures/childhood/')) return 'fixtures/childhood';
  for (const folder of ['origins','childhood','active','immediate','scheduled','critical'] as const) if (normalized.includes(`/events/${folder}/`) || normalized.startsWith(`events/${folder}/`) || normalized.includes(`/${folder}/`)) return folder;
  if (event.kind === 'scheduled') return 'scheduled';
  if (event.kind === 'critical') return 'critical';
  if (event.kind === 'immediate') return 'immediate';
  const phase = phaseFromCondition(event.eligibility);
  return phase === 'origins' ? 'origins' : phase === 'childhood' ? 'childhood' : 'active';
};

export const parseEventImportFile = (file: EventImportFile): { event?: EventDefinition; folder?: ContentFolder; errors: string[]; warnings: string[] } => {
  let raw: unknown;
  try { raw = JSON.parse(file.text) as unknown; } catch (error) { return { errors: [`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`], warnings: [] }; }
  const shape = validateSingleEventShape(raw);
  if (shape.length) return { errors: shape.map((x) => `${x.path}: ${x.message}`), warnings: [] };
  const event = raw as EventDefinition;
  const filename = eventFilename(file.path || file.name);
  const errors: string[] = [];
  if (filename && filename !== event.id) errors.push(`Filename "${filename}" does not match EventId "${event.id}".`);
  const folder = inferContentFolder(file.path, event);
  const warnings: string[] = [];
  if (!file.path && event.kind === 'normal' && !phaseFromCondition(event.eligibility)) warnings.push(`No folder path/phase found; defaulted contentFolder to "${folder}".`);
  if (event.kind === 'scheduled' && folder !== 'scheduled') warnings.push('Scheduled Event folder was normalized to scheduled/.');
  if (event.kind === 'critical' && folder !== 'critical') warnings.push('Critical Event folder was normalized to critical/.');
  return { event, folder: event.kind === 'scheduled' ? 'scheduled' : event.kind === 'critical' ? 'critical' : folder, errors, warnings };
};

export const importEventFiles = (project: AuthoringProject, files: EventImportFile[]): ImportResult => {
  const next = structuredClone(project); const report: ImportReport = { imported: 0, warnings: [], rejected: [], importedIds: [] };
  const existing = new Set(next.events.map((x) => x.id)); const batch = new Set<string>(); let addIndex = next.nodes.length;
  for (const file of files) {
    const parsed = parseEventImportFile(file);
    if (!parsed.event || parsed.errors.length) { report.rejected.push({ file: file.path || file.name, message: parsed.errors.join(' | ') || 'Invalid Event.' }); continue; }
    const event = parsed.event;
    if (batch.has(event.id)) { report.rejected.push({ file: file.path || file.name, message: `Duplicate EventId "${event.id}" in this import batch.` }); continue; }
    batch.add(event.id);
    if (existing.has(event.id)) { report.rejected.push({ file: file.path || file.name, message: `EventId "${event.id}" already exists in the workspace.` }); continue; }
    next.events.push(structuredClone(event));
    next.nodes.push({ eventId: event.id, position: { x: (addIndex % 6) * 200 + 80, y: Math.floor(addIndex / 6) * 125 + 80 }, notes: '', status: 'draft', contentFolder: parsed.folder! });
    next.localization = ensureKeys(next.localization, collectEventLocalizationKeys(event));
    const flagIds = new Set(next.registries.flags.map((flag) => flag.id));
    collectReferencedFlags(event).forEach((id) => { if (!flagIds.has(id)) { next.registries.flags.push({ id }); flagIds.add(id); } });
    existing.add(event.id); addIndex += 1; report.imported += 1; report.importedIds.push(event.id);
    parsed.warnings.forEach((message) => report.warnings.push({ file: file.path || file.name, message }));
  }
  next.metadata.updatedAt = new Date().toISOString();
  return { project: next, report };
};

export const applyLocaleDictionaries = (project: AuthoringProject, dictionaries: Record<string, Record<string, string>>): AuthoringProject => {
  const next = structuredClone(project); const locales = [...new Set([project.sourceLocale, ...project.supportedLocales, ...Object.keys(dictionaries)])]; next.supportedLocales = locales;
  for (const [locale, dictionary] of Object.entries(dictionaries)) {
    for (const [key, text] of Object.entries(dictionary)) {
      const entry = next.localization[key] ?? createEntry(key, locale === project.sourceLocale ? text : ''); next.localization[key] = entry;
      if (locale === project.sourceLocale) { entry.values[project.sourceLocale] = { text, sourceRevision: entry.sourceRevision }; }
      else entry.values[locale] = { text, sourceRevision: entry.sourceRevision };
    }
  }
  return next;
};

const eventPath = (project: AuthoringProject, event: EventDefinition): string => {
  const node = project.nodes.find((x) => x.eventId === event.id); const folder = event.kind === 'immediate' ? 'immediate' : event.kind === 'scheduled' ? 'scheduled' : event.kind === 'critical' ? 'critical' : node?.contentFolder ?? 'active';
  return `events/${folder}/${event.id}.json`;
};

export const createEventsArchive = (project: AuthoringProject, options: { bundle: boolean; includeLocales?: boolean } = { bundle: false }): Uint8Array => {
  const entries = project.events.slice().sort((a,b) => a.id.localeCompare(b.id)).map((event) => ({ path: eventPath(project, event), data: `${JSON.stringify(event, null, 2)}\n` }));
  const includeLocales = options.includeLocales ?? options.bundle;
  if (includeLocales) for (const locale of project.supportedLocales) entries.push({ path: `locales/${locale}.json`, data: `${JSON.stringify(exportLocaleDictionary(project.localization, locale), null, 2)}\n` });
  if (options.bundle) entries.unshift({ path: 'manifest.json', data: `${JSON.stringify({ format: 'opfg-events-bundle', version: 1, schemaVersion: CONTENT_SCHEMA_VERSION, name: project.name, eventCount: project.events.length, locales: project.supportedLocales }, null, 2)}\n` });
  return createZip(entries);
};

export const createLocalesArchive = (project: AuthoringProject): Uint8Array => createZip(
  project.supportedLocales.map((locale) => ({
    path: `locales/${locale}.json`,
    data: `${JSON.stringify(exportLocaleDictionary(project.localization, locale), null, 2)}\n`,
  })),
);

export interface BundleReadResult { eventFiles: EventImportFile[]; dictionaries: Record<string, Record<string,string>>; warnings: string[]; manifest?: Record<string, unknown>; }
export const readEventsBundle = async (bytes: ArrayBuffer | Uint8Array): Promise<BundleReadResult> => {
  const entries = await readZip(bytes); const decoder = new TextDecoder(); const eventFiles: EventImportFile[] = []; const dictionaries: Record<string, Record<string,string>> = {}; const warnings: string[] = []; let manifest: Record<string, unknown> | undefined;
  for (const [path, data] of entries) {
    if (path === 'manifest.json') { try { const raw = JSON.parse(decoder.decode(data)); if (isRecord(raw)) manifest = raw; } catch { warnings.push('manifest.json is invalid JSON.'); } continue; }
    if (/^events\/.*\.json$/i.test(path)) { eventFiles.push({ name: eventFilename(path) + '.json', path, text: decoder.decode(data) }); continue; }
    const localeMatch = /^locales\/([^/]+)\.json$/i.exec(path);
    if (localeMatch) {
      try { const raw = JSON.parse(decoder.decode(data)); if (isRecord(raw) && Object.values(raw).every((x) => typeof x === 'string')) dictionaries[localeMatch[1].toLowerCase()] = raw as Record<string,string>; else warnings.push(`${path} is not a flat localization dictionary.`); } catch { warnings.push(`${path} is invalid JSON.`); }
    }
  }
  if (manifest) {
    if (manifest.format !== 'opfg-events-bundle') warnings.push(`Unknown manifest format "${String(manifest.format)}".`);
    if (manifest.schemaVersion !== CONTENT_SCHEMA_VERSION) warnings.push(`Bundle schemaVersion is ${String(manifest.schemaVersion)}, expected ${CONTENT_SCHEMA_VERSION}.`);
  }
  if (!eventFiles.length) warnings.push('ZIP contains no events/**/*.json files.');
  return { eventFiles, dictionaries, warnings, manifest };
};
