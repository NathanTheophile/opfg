import { useEffect, useMemo, useRef, useState, type InputHTMLAttributes } from 'react';
import { Background, Controls, MiniMap, ReactFlow, ReactFlowProvider, type Connection, type Edge, type NodeChange, type ReactFlowInstance } from '@xyflow/react';
import { AUTHORING_VERSION, type AuthoringProject, type AuthoringStatus, type ContentFolder } from './authoring/types';
import { createDemoProject } from './authoring/demo';
import { serializeProject } from './authoring/serialization';
import { createEvent } from './gameSchema/current/defaults';
import { CONTENT_SCHEMA_VERSION, type Condition, type ContentCatalog, type EventDefinition, type GameRegistries } from './gameSchema/current/contract';
import { exportToGameCatalog, toRuntimeEvent } from './gameSchema/current/exporter';
import { migrateImportedProject } from './gameSchema/migrations';
import EventNode, { type EventFlowNode, type EventNodeData } from './components/EventNode';
import Inspector from './components/Inspector';
import RegistryPanel from './components/RegistryPanel';
import { collectEventLocalizationKeys, normalizeEventLocalizationKeys } from './localization/keys';
import { createEntry, ensureKeys, eventLocalizationStatus, getStatus, getText, removeEventLocalization, setLocalizedText, syncEventLocalization } from './localization/store';
import type { LocalizationAuthoringStore, LocalizationStatus } from './localization/types';
import { validateProject } from './validation/validateProject';
import { downloadBytes, downloadText } from './utils/download';
import { uniqueId } from './utils/ids';
import { renameEventId } from './utils/references';
import { applyLocaleDictionaries, createEventsArchive, createLocalesArchive, importEventFiles, inferContentFolder, readEventsBundle, type EventImportFile, type ImportProblem } from './io/events';

const STORAGE_KEY = 'opfg-event-tool-project';
const nodeTypes = { event: EventNode };
const folderFilters = ['origins', 'childhood', 'active', 'scheduled', 'critical', 'fixtures'] as const;
const statusFilters = ['ready', 'draft', 'needsReview', 'invalid'] as const;
type FolderFilter = typeof folderFilters[number];
type FilterKey = typeof statusFilters[number] | FolderFilter | 'locMissingSelected' | 'locOutdatedSelected' | 'locMissingAny' | 'locOutdatedAny' | 'locComplete';
interface BatchReport { imported: number; warnings: ImportProblem[]; rejected: ImportProblem[]; title: string; }

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isFlatDictionary = (value: unknown): value is Record<string, string> => isRecord(value) && Object.values(value).every((item) => typeof item === 'string');
const isContentCatalog = (value: unknown): value is ContentCatalog => isRecord(value) && value.schemaVersion === CONTENT_SCHEMA_VERSION && Array.isArray(value.events);
const localeFromFile = (name: string, path?: string): string => {
  const normalized = (path || name).replace(/\\/g, '/');
  const basename = normalized.split('/').at(-1) ?? name;
  return basename.replace(/\.json$/i, '').replace(/^locales[-_]/i, '').toLowerCase();
};

const emptyRegistries = (): GameRegistries => ({ races: [], seas: [], affiliations: [], careerAffiliations: [], careerRanks: [], careerTitles: [], endings: [], familyStructures: [], socialClasses: [], traits: [], items: [], devilFruits: [], ships: [], crewRoles: [], npcs: [], locations: [], flags: [] });
const blankProject = (): AuthoringProject => {
  const now = new Date().toISOString();
  return { authoringVersion: AUTHORING_VERSION, gameSchemaVersion: CONTENT_SCHEMA_VERSION, name: 'OPFG Events', sourceLocale: 'fr', supportedLocales: ['fr', 'en'], events: [], nodes: [], edges: [], registries: emptyRegistries(), localization: {}, metadata: { createdAt: now, updatedAt: now } };
};

const collectPositiveBadges = (condition?: Condition): string[] => {
  if (!condition) return [];
  if (condition.type === 'all') return [...new Set(condition.conditions.flatMap(collectPositiveBadges))];
  if (condition.type === 'careerPhaseIs') return [condition.phase === 'origins' ? 'Origins' : condition.phase === 'childhood' ? 'Childhood' : 'Active'];
  if (condition.type === 'isAtSea') return ['At Sea'];
  if (condition.type === 'isOnLand') return ['On Land'];
  return [];
};

const collectRegistryKeys = (r: GameRegistries): string[] => [
  ...r.races.map((x) => x.nameKey), ...r.seas.map((x) => x.nameKey), ...r.affiliations.map((x) => x.nameKey),
  ...r.careerAffiliations.map((x) => x.nameKey), ...r.careerRanks.map((x) => x.nameKey), ...r.careerTitles.flatMap((x) => [x.nameKey, x.descriptionKey]), ...r.endings.flatMap((x) => [x.nameKey, x.descriptionKey]),
  ...r.familyStructures.map((x) => x.nameKey), ...r.socialClasses.map((x) => x.nameKey),
  ...r.locations.map((x) => x.nameKey), ...r.devilFruits.map((x) => x.nameKey),
  ...r.traits.flatMap((x) => [x.nameKey, x.descriptionKey]), ...r.items.map((x) => x.nameKey), ...r.ships.map((x) => x.nameKey), ...r.crewRoles.map((x) => x.nameKey), ...r.npcs.map((x) => x.nameKey),
];
const collectProjectKeys = (project: AuthoringProject): string[] => [...new Set([...project.events.flatMap(collectEventLocalizationKeys), ...collectRegistryKeys(project.registries)])];
const collectFlagIds = (events: EventDefinition[]): string[] => {
  const flags = new Set<string>();
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) { value.forEach(walk); return; }
    if (!isRecord(value)) return;
    if ((value.type === 'hasFlag' || value.type === 'setFlag' || value.type === 'clearFlag') && typeof value.flagId === 'string' && value.flagId) flags.add(value.flagId);
    Object.values(value).forEach(walk);
  };
  events.forEach(walk);
  return [...flags].sort();
};

const catalogToProject = (catalog: ContentCatalog, dictionaries: Record<string, Record<string, string>>): AuthoringProject => {
  const now = new Date().toISOString();
  const events = structuredClone(catalog.events);
  const registries: GameRegistries = {
    races: structuredClone(catalog.races), seas: structuredClone(catalog.seas), affiliations: structuredClone(catalog.affiliations), careerAffiliations: structuredClone(catalog.careerAffiliations), careerRanks: structuredClone(catalog.careerRanks), careerTitles: structuredClone(catalog.careerTitles), endings: structuredClone(catalog.endings),
    familyStructures: structuredClone(catalog.familyStructures), socialClasses: structuredClone(catalog.socialClasses),
    traits: structuredClone(catalog.traits), items: structuredClone(catalog.items), devilFruits: structuredClone(catalog.devilFruits), ships: structuredClone(catalog.ships), crewRoles: structuredClone(catalog.crewRoles), npcs: structuredClone(catalog.npcs),
    locations: structuredClone(catalog.locations), flags: collectFlagIds(events).map((id) => ({ id })),
  };
  const temp: AuthoringProject = {
    authoringVersion: AUTHORING_VERSION, gameSchemaVersion: CONTENT_SCHEMA_VERSION, name: 'Imported Catalog', sourceLocale: 'fr',
    supportedLocales: ['fr'], events,
    nodes: events.map((event, index) => ({ eventId: event.id, position: { x: (index % 6) * 200 + 70, y: Math.floor(index / 6) * 125 + 70 }, notes: '', status: 'draft', contentFolder: inferContentFolder(undefined, event) })),
    edges: [], registries, localization: {}, metadata: { createdAt: now, updatedAt: now },
  };
  const locales = [...new Set(['fr', ...Object.keys(dictionaries)])];
  temp.supportedLocales = locales;
  for (const key of collectProjectKeys(temp)) {
    const entry = createEntry(key, dictionaries.fr?.[key] ?? '');
    for (const locale of locales.filter((x) => x !== 'fr')) {
      const value = dictionaries[locale]?.[key];
      if (value !== undefined) entry.values[locale] = { text: value, sourceRevision: entry.sourceRevision };
    }
    temp.localization[key] = entry;
  }
  return temp;
};

const loadInitialProject = (): AuthoringProject => {
  try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) return migrateImportedProject(JSON.parse(saved) as unknown).project; }
  catch (error) { console.warn('Failed to restore local autosave.', error); }
  return createDemoProject();
};

function EditorApp() {
  const [project, setProject] = useState<AuthoringProject>(loadInitialProject);
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Set<FilterKey>>(new Set());
  const [localizationFilterLocale, setLocalizationFilterLocale] = useState('en');
  const [activeLocale, setActiveLocale] = useState('fr');
  const [newLocale, setNewLocale] = useState('');
  const [validationOpen, setValidationOpen] = useState(true);
  const [registryOpen, setRegistryOpen] = useState(false);
  const [message, setMessage] = useState<string>();
  const [batchReport, setBatchReport] = useState<BatchReport>();
  const importRef = useRef<HTMLInputElement | null>(null);
  const folderImportRef = useRef<HTMLInputElement | null>(null);
  const flowRef = useRef<ReactFlowInstance<EventFlowNode, Edge> | null>(null);

  const validation = useMemo(() => validateProject(project), [project]);
  const eventMap = useMemo(() => new Map(project.events.map((event) => [event.id, event])), [project.events]);
  const nodeMap = useMemo(() => new Map(project.nodes.map((node) => [node.eventId, node])), [project.nodes]);
  const usedLocalizationKeys = useMemo(() => collectProjectKeys(project), [project]);

  const touch = (updater: (current: AuthoringProject) => AuthoringProject) => setProject((current) => { const next = updater(current); return { ...next, metadata: { ...next.metadata, updatedAt: new Date().toISOString() } }; });
  useEffect(() => { localStorage.setItem(STORAGE_KEY, serializeProject(project)); }, [project]);
  useEffect(() => { if (!message) return; const id = window.setTimeout(() => setMessage(undefined), 4000); return () => window.clearTimeout(id); }, [message]);
  useEffect(() => { if (!project.supportedLocales.includes(activeLocale)) setActiveLocale('fr'); if (!project.supportedLocales.includes(localizationFilterLocale)) setLocalizationFilterLocale(project.supportedLocales.find((x) => x !== 'fr') ?? 'fr'); }, [project.supportedLocales, activeLocale, localizationFilterLocale]);

  const statusFor = (eventId: string): EventNodeData['status'] => validation.errorEventIds.has(eventId) ? 'invalid' : nodeMap.get(eventId)?.status ?? 'draft';
  const localeStatusFor = (event: EventDefinition, locale: string): LocalizationStatus => eventLocalizationStatus(project.localization, event, locale, project.sourceLocale);

  const matchesFilters = (eventId: string): boolean => {
    const event = eventMap.get(eventId); if (!event) return false;
    const node = nodeMap.get(eventId);
    const title = getText(project.localization, event.titleKey, project.sourceLocale);
    const needle = search.trim().toLowerCase();
    if (needle && !event.id.toLowerCase().includes(needle) && !title.toLowerCase().includes(needle)) return false;
    if (filters.size === 0) return true;
    const activeStatuses = statusFilters.filter((filter) => filters.has(filter));
    if (activeStatuses.length && !activeStatuses.includes(statusFor(eventId) as typeof activeStatuses[number])) return false;
    const activeFolders = folderFilters.filter((filter) => filters.has(filter));
    const folder = node?.contentFolder ?? inferContentFolder(undefined, event);
    if (activeFolders.length && !activeFolders.some((filter) => filter === 'fixtures' ? folder.startsWith('fixtures/') : filter === folder)) return false;
    const statuses = project.supportedLocales.map((locale) => localeStatusFor(event, locale));
    if (filters.has('locMissingSelected') && localeStatusFor(event, localizationFilterLocale) !== 'missing') return false;
    if (filters.has('locOutdatedSelected') && localeStatusFor(event, localizationFilterLocale) !== 'outdated') return false;
    if (filters.has('locMissingAny') && !statuses.includes('missing')) return false;
    if (filters.has('locOutdatedAny') && !statuses.includes('outdated')) return false;
    if (filters.has('locComplete') && !statuses.every((value) => value === 'current')) return false;
    return true;
  };

  const addNewEventLocalization = (store: LocalizationAuthoringStore, event: EventDefinition) => {
    const next = ensureKeys(store, collectEventLocalizationKeys(event));
    next[event.titleKey] = createEntry(event.titleKey, 'Nouvel événement');
    return next;
  };

  const createChild = (parentId: string) => {
    const parentNode = nodeMap.get(parentId); if (!parentNode) return;
    const id = uniqueId(`${parentId}_child`, project.events.map((event) => event.id)); const event = createEvent(id);
    touch((current) => ({ ...current, events: [...current.events, event], localization: addNewEventLocalization(current.localization, event), nodes: [...current.nodes, { eventId: id, position: { x: parentNode.position.x + 200, y: parentNode.position.y + 60 }, notes: '', status: 'draft', contentFolder: 'active' }], edges: [...current.edges, { id: uniqueId(`${parentId}-${id}`, current.edges.map((edge) => edge.id)), sourceEventId: parentId, targetEventId: id }] }));
    setSelectedEventId(id);
  };

  const flowNodes = useMemo<EventFlowNode[]>(() => project.nodes.flatMap((authoringNode): EventFlowNode[] => {
    const event = eventMap.get(authoringNode.eventId); if (!event) return [];
    const badges = collectPositiveBadges(event.eligibility); if (event.kind === 'immediate') badges.push('Immediate'); if (event.kind === 'scheduled') badges.push('Scheduled'); if (event.kind === 'critical') badges.push('Critical');
    return [{ id: event.id, type: 'event', position: authoringNode.position, hidden: !matchesFilters(event.id), selected: selectedEventId === event.id, data: {
      eventId: event.id, title: getText(project.localization, event.titleKey, project.sourceLocale), kind: event.kind, priority: event.kind === 'scheduled' ? event.priority : undefined, folder: authoringNode.contentFolder, choiceCount: event.choices.length, status: statusFor(event.id), badges,
      localeStatuses: project.supportedLocales.map((locale) => ({ locale, status: localeStatusFor(event, locale) })), onCreateChild: createChild,
    } }];
  }), [project, eventMap, validation.errorEventIds, filters, search, selectedEventId, localizationFilterLocale]);

  const visibleEventIds = useMemo(() => new Set(flowNodes.filter((node) => !node.hidden).map((node) => node.id)), [flowNodes]);
  const flowEdges = useMemo<Edge[]>(() => project.edges.map((edge) => ({ id: edge.id, source: edge.sourceEventId, target: edge.targetEventId, hidden: !visibleEventIds.has(edge.sourceEventId) || !visibleEventIds.has(edge.targetEventId) })).filter((edge) => eventMap.has(edge.source) && eventMap.has(edge.target)), [project.edges, visibleEventIds, eventMap]);

  const deleteEvents = (eventIdsToDelete: Set<string>) => {
    touch((current) => {
      let localization = current.localization;
      for (const event of current.events.filter((value) => eventIdsToDelete.has(value.id))) localization = removeEventLocalization(localization, event);
      return { ...current, localization, events: current.events.filter((event) => !eventIdsToDelete.has(event.id)), nodes: current.nodes.filter((node) => !eventIdsToDelete.has(node.eventId)), edges: current.edges.filter((edge) => !eventIdsToDelete.has(edge.sourceEventId) && !eventIdsToDelete.has(edge.targetEventId)) };
    });
    if (selectedEventId && eventIdsToDelete.has(selectedEventId)) setSelectedEventId(undefined);
  };

  const onNodesChange = (changes: NodeChange<EventFlowNode>[]) => {
    const positions = new Map<string, { x: number; y: number }>(); const removed = new Set<string>();
    for (const change of changes) { if (change.type === 'position' && change.position) positions.set(change.id, change.position); if (change.type === 'remove') removed.add(change.id); }
    if (positions.size) touch((current) => ({ ...current, nodes: current.nodes.map((node) => positions.has(node.eventId) ? { ...node, position: positions.get(node.eventId)! } : node) }));
    if (removed.size) deleteEvents(removed);
  };

  const createRootEvent = () => {
    const id = uniqueId('new_event', project.events.map((event) => event.id)); const event = createEvent(id);
    const center = flowRef.current?.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }) ?? { x: 120, y: 120 };
    touch((current) => ({ ...current, events: [...current.events, event], localization: addNewEventLocalization(current.localization, event), nodes: [...current.nodes, { eventId: id, position: center, notes: '', status: 'draft', contentFolder: 'active' }] }));
    setSelectedEventId(id);
  };

  const updateEvent = (nextRaw: EventDefinition) => touch((current) => {
    const previous = current.events.find((event) => event.id === nextRaw.id) ?? (selectedEventId ? current.events.find((event) => event.id === selectedEventId) : undefined);
    const next = normalizeEventLocalizationKeys(nextRaw);
    if (!previous) return current;
    const localization = syncEventLocalization(current.localization, previous, next);
    const nodes = current.nodes.map((node) => {
      if (node.eventId !== previous.id) return node;
      if (next.kind === 'scheduled') return { ...node, contentFolder: 'scheduled' as const };
      if (next.kind === 'critical') return { ...node, contentFolder: 'critical' as const };
      if (next.kind === 'immediate') return { ...node, contentFolder: 'immediate' as const };
      return ['origins','childhood','active','fixtures/childhood'].includes(node.contentFolder) ? node : { ...node, contentFolder: 'active' as const };
    });
    return { ...current, localization, nodes, events: current.events.map((event) => event.id === previous.id ? next : event) };
  });

  const renameSelected = (newId: string) => {
    if (!selectedEventId || selectedEventId === newId) return;
    touch((current) => {
      const previous = current.events.find((event) => event.id === selectedEventId); if (!previous) return current;
      let renamed = renameEventId(current, selectedEventId, newId);
      const rawNext = renamed.events.find((event) => event.id === newId); if (!rawNext) return current;
      const nextEvent = normalizeEventLocalizationKeys(rawNext);
      renamed = { ...renamed, events: renamed.events.map((event) => event.id === newId ? nextEvent : event), localization: syncEventLocalization(current.localization, previous, nextEvent) };
      return renamed;
    });
    setSelectedEventId(newId);
  };

  const duplicateSelected = () => {
    if (!selectedEventId) return; const source = eventMap.get(selectedEventId); const sourceNode = nodeMap.get(selectedEventId); if (!source || !sourceNode) return;
    const id = uniqueId(`${source.id}_copy`, project.events.map((event) => event.id)); const copy = normalizeEventLocalizationKeys({ ...structuredClone(source), id });
    touch((current) => {
      let localization = syncEventLocalization(current.localization, source, copy, true);
      const title = `${getText(current.localization, source.titleKey, current.sourceLocale)} copie`;
      localization = setLocalizedText(localization, copy.titleKey, current.sourceLocale, title, current.sourceLocale);
      return { ...current, localization, events: [...current.events, copy], nodes: [...current.nodes, { eventId: id, position: { x: sourceNode.position.x + 30, y: sourceNode.position.y + 30 }, notes: sourceNode.notes, status: 'draft', contentFolder: sourceNode.contentFolder }] };
    }); setSelectedEventId(id);
  };

  const onConnect = (connection: Connection) => { if (!connection.source || !connection.target || connection.source === connection.target) return; touch((current) => ({ ...current, edges: [...current.edges, { id: uniqueId(`${connection.source}-${connection.target}`, current.edges.map((edge) => edge.id)), sourceEventId: connection.source!, targetEventId: connection.target! }] })); };
  const onLocalizedTextChange = (key: string, locale: string, text: string) => touch((current) => ({ ...current, localization: setLocalizedText(current.localization, key, locale, text, current.sourceLocale) }));

  const assertWorkspaceExportable = (): boolean => {
    const result = exportToGameCatalog(project);
    if (result.catalog) return true;
    setMessage(`Export blocked: ${result.blockedEventIds.length} Event(s) + ${result.blockingProjectErrors} project error(s).`);
    return false;
  };
  const exportProject = () => downloadText('opfg-authoring-project-v0.4.json', serializeProject(project));
  const exportSelectedEvent = () => {
    const event = selectedEventId ? eventMap.get(selectedEventId) : undefined; if (!event) return;
    const issues = validation.issues.filter((issue) => issue.eventId === event.id && issue.severity === 'error');
    const needsReview = nodeMap.get(event.id)?.status === 'needsReview';
    if (issues.length || needsReview) { setMessage(`Event export blocked: ${issues.length} error(s)${needsReview ? ' + migration review' : ''}.`); return; }
    downloadText(`${event.id}.json`, `${JSON.stringify(toRuntimeEvent(event), null, 2)}\n`); setMessage(`Exported ${event.id}.json`);
  };
  const exportAll = () => { if (!assertWorkspaceExportable()) return; downloadBytes('opfg-events.zip', createEventsArchive(project, { bundle: false, includeLocales: false })); setMessage(`Exported ${project.events.length} Event files.`); };
  const exportLocales = () => { downloadBytes('opfg-locales.zip', createLocalesArchive(project)); setMessage(`Exported ${project.supportedLocales.length} locale dictionaries.`); };
  const exportBundle = () => { if (!assertWorkspaceExportable()) return; downloadBytes('opfg-events-bundle.zip', createEventsArchive(project, { bundle: true, includeLocales: true })); setMessage(`Bundle exported: ${project.events.length} Events + ${project.supportedLocales.length} locale(s).`); };

  const appendReport = (report: BatchReport, imported: number, warnings: ImportProblem[], rejected: ImportProblem[]): BatchReport => ({ ...report, imported: report.imported + imported, warnings: [...report.warnings, ...warnings], rejected: [...report.rejected, ...rejected] });
  const importFiles = async (files: FileList) => {
    let report: BatchReport = { title: 'Import report', imported: 0, warnings: [], rejected: [] };
    try {
      const selected = [...files];
      const jsonFiles = selected.filter((file) => file.name.toLowerCase().endsWith('.json'));
      const zipFiles = selected.filter((file) => file.name.toLowerCase().endsWith('.zip'));
      const parsedJson = await Promise.all(jsonFiles.map(async (file) => {
        const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
        const text = await file.text(); let raw: unknown;
        try { raw = JSON.parse(text) as unknown; } catch { raw = undefined; }
        return { file, path, text, raw };
      }));

      const authoring = parsedJson.filter(({ raw }) => isRecord(raw) && 'authoringVersion' in raw);
      if (authoring.length === 1 && selected.length === 1) {
        const result = migrateImportedProject(authoring[0].raw); setProject(result.project); setSelectedEventId(undefined); setActiveLocale('fr');
        report = { title: 'Authoring project import', imported: result.project.events.length, warnings: result.warnings.map((message) => ({ file: authoring[0].file.name, message })), rejected: [] };
        setBatchReport(report); setMessage(result.migrated ? `Project migrated to v0.4 · ${result.reviewEventIds.length} need review.` : 'Authoring project imported.');
        window.setTimeout(() => flowRef.current?.fitView({ padding: 0.2 }), 0); return;
      }

      const catalogs = parsedJson.filter(({ raw }) => isContentCatalog(raw));
      const dictionaries: Record<string, Record<string, string>> = {};
      for (const item of parsedJson) if (isFlatDictionary(item.raw)) dictionaries[localeFromFile(item.file.name, item.path)] = item.raw;
      if (catalogs.length === 1 && parsedJson.every((item) => item === catalogs[0] || isFlatDictionary(item.raw)) && zipFiles.length === 0) {
        const imported = catalogToProject(catalogs[0].raw as ContentCatalog, dictionaries); setProject(imported); setSelectedEventId(undefined); setActiveLocale('fr');
        report = { title: 'ContentCatalog import', imported: imported.events.length, warnings: [], rejected: [] }; setBatchReport(report); setMessage(`Imported ContentCatalog v2 · ${imported.events.length} Events.`); window.setTimeout(() => flowRef.current?.fitView({ padding: 0.2 }), 0); return;
      }

      let next = project;
      const eventFiles: EventImportFile[] = parsedJson.filter((item) => !isFlatDictionary(item.raw) && !isContentCatalog(item.raw) && !(isRecord(item.raw) && 'authoringVersion' in item.raw)).map((item) => ({ name: item.file.name, path: item.path, text: item.text }));
      if (eventFiles.length) { const result = importEventFiles(next, eventFiles); next = result.project; report = appendReport(report, result.report.imported, result.report.warnings, result.report.rejected); }
      if (Object.keys(dictionaries).length) next = applyLocaleDictionaries(next, dictionaries);

      for (const file of zipFiles) {
        try {
          const bundle = await readEventsBundle(await file.arrayBuffer());
          const result = importEventFiles(next, bundle.eventFiles); next = applyLocaleDictionaries(result.project, bundle.dictionaries);
          report = appendReport(report, result.report.imported, [...result.report.warnings, ...bundle.warnings.map((message) => ({ file: file.name, message }))], result.report.rejected);
        } catch (error) { report.rejected.push({ file: file.name, message: error instanceof Error ? error.message : String(error) }); }
      }
      for (const item of parsedJson) if (item.raw === undefined) report.rejected.push({ file: item.path, message: 'Invalid JSON.' });
      for (const item of authoring) if (selected.length > 1) report.rejected.push({ file: item.path, message: 'Authoring project files must be imported alone because they replace the workspace.' });
      for (const item of catalogs) if (!(catalogs.length === 1 && parsedJson.length === 1)) report.rejected.push({ file: item.path, message: 'ContentCatalog files must be imported alone (optionally with locale dictionaries).' });

      if (!eventFiles.length && !zipFiles.length && Object.keys(dictionaries).length) report.warnings.push({ file: 'locales', message: 'Localization dictionaries imported without Events.' });
      setProject(next); setBatchReport(report); setMessage(`Imported: ${report.imported} · Warnings: ${report.warnings.length} · Rejected: ${report.rejected.length}`);
      if (report.imported) window.setTimeout(() => flowRef.current?.fitView({ padding: 0.2 }), 0);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Import failed.'); }
    finally { if (importRef.current) importRef.current.value = ''; if (folderImportRef.current) folderImportRef.current.value = ''; }
  };

  const selectAndCenter = (eventId: string) => { const node = nodeMap.get(eventId); if (!node) return; setSelectedEventId(eventId); flowRef.current?.setCenter(node.position.x + 82, node.position.y + 35, { zoom: 1.1, duration: 250 }); };
  const selectedEvent = selectedEventId ? eventMap.get(selectedEventId) : undefined;
  const selectedNode = selectedEventId ? nodeMap.get(selectedEventId) : undefined;
  const selectedIssues = selectedEventId ? validation.issues.filter((issue) => issue.eventId === selectedEventId) : [];
  const warnings = validation.issues.filter((issue) => issue.severity === 'warning').length;
  const needsReview = project.nodes.filter((node) => node.status === 'needsReview').length;
  const invalid = validation.errorEventIds.size;
  const ready = project.nodes.filter((node) => statusFor(node.eventId) === 'ready').length;
  const toggleFilter = (key: FilterKey) => setFilters((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; });

  const localizationSummary = project.supportedLocales.map((locale) => {
    const statuses = usedLocalizationKeys.map((key) => getStatus(project.localization, key, locale, project.sourceLocale));
    const current = statuses.filter((value) => value === 'current').length;
    return { locale, percent: statuses.length ? Math.round((current / statuses.length) * 100) : 100, outdated: statuses.filter((x) => x === 'outdated').length, missing: statuses.filter((x) => x === 'missing').length };
  });
  const addLocale = () => {
    const locale = newLocale.trim().toLowerCase(); if (!/^[a-z]{2,8}(?:-[a-z0-9]{2,8})?$/.test(locale) || project.supportedLocales.includes(locale)) return;
    touch((current) => ({ ...current, supportedLocales: [...current.supportedLocales, locale] })); setNewLocale(''); setActiveLocale(locale); setLocalizationFilterLocale(locale);
  };
  const directoryProps = { webkitdirectory: '', directory: '' } as unknown as InputHTMLAttributes<HTMLInputElement>;

  return <div className={`app-shell ${validationOpen ? '' : 'validation-collapsed'}`}>
    <header className="toolbar">
      <div className="brand">OPFG EVENT TOOL <span>v0.4</span></div>
      <input className="search" placeholder="Search ID or FR title…" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="toolbar-actions">
        <button onClick={() => { if (confirm('Create a new empty authoring project?')) { setProject(blankProject()); setSelectedEventId(undefined); } }}>New</button>
        <button onClick={createRootEvent}>+ Event</button><button disabled={!selectedEventId} onClick={duplicateSelected}>Duplicate</button>
        <button onClick={() => setRegistryOpen(true)}>Registries</button><button onClick={() => importRef.current?.click()}>Import Files/ZIP</button><button onClick={() => folderImportRef.current?.click()}>Import Folder</button>
        <button onClick={exportProject}>Project</button><button disabled={!selectedEventId} onClick={exportSelectedEvent}>Export Event</button><button onClick={exportAll}>Export All</button><button onClick={exportLocales}>Locales</button><button onClick={exportBundle}>Bundle</button>
        <button onClick={() => { localStorage.setItem(STORAGE_KEY, serializeProject(project)); setMessage('Saved locally.'); }}>Save</button>
      </div>
      <input ref={importRef} type="file" accept=".json,.zip,application/json,application/zip" multiple hidden onChange={(e) => e.target.files?.length && void importFiles(e.target.files)} />
      <input ref={folderImportRef} type="file" accept=".json,application/json" multiple hidden {...directoryProps} onChange={(e) => e.target.files?.length && void importFiles(e.target.files)} />
    </header>

    <aside className="sidebar">
      <div className="panel-title">Folders</div><div className="filter-stack">{folderFilters.map((filter) => <button key={filter} className={filters.has(filter) ? 'active' : ''} onClick={() => toggleFilter(filter)}>{filter === 'fixtures' ? 'Fixtures' : filter[0].toUpperCase() + filter.slice(1)}</button>)}</div>
      <div className="panel-title">Status</div><div className="filter-stack">{statusFilters.map((filter) => <button key={filter} className={filters.has(filter) ? 'active' : ''} onClick={() => toggleFilter(filter)}>{filter}</button>)}</div>
      <div className="panel-title">Localization filters</div>
      <select value={localizationFilterLocale} onChange={(e) => setLocalizationFilterLocale(e.target.value)}>{project.supportedLocales.map((locale) => <option key={locale} value={locale}>{locale.toUpperCase()}</option>)}</select>
      <div className="filter-stack loc-filters">
        <button className={filters.has('locMissingSelected') ? 'active' : ''} onClick={() => toggleFilter('locMissingSelected')}>Missing {localizationFilterLocale.toUpperCase()}</button>
        <button className={filters.has('locOutdatedSelected') ? 'active' : ''} onClick={() => toggleFilter('locOutdatedSelected')}>Outdated {localizationFilterLocale.toUpperCase()}</button>
        <button className={filters.has('locMissingAny') ? 'active' : ''} onClick={() => toggleFilter('locMissingAny')}>Missing any</button>
        <button className={filters.has('locOutdatedAny') ? 'active' : ''} onClick={() => toggleFilter('locOutdatedAny')}>Outdated any</button>
        <button className={filters.has('locComplete') ? 'active' : ''} onClick={() => toggleFilter('locComplete')}>Localization complete</button>
        {filters.size > 0 && <button className="ghost" onClick={() => setFilters(new Set())}>All / Clear</button>}
      </div>
      <div className="panel-title">Localization</div><div className="locale-summary">{localizationSummary.map((row) => <div key={row.locale}><strong>{row.locale.toUpperCase()}</strong><span>{row.percent}%</span><small>{row.outdated ? `${row.outdated}⚠ ` : ''}{row.missing ? `${row.missing}✕` : ''}</small></div>)}</div>
      <div className="locale-add"><input value={newLocale} placeholder="es" onChange={(e) => setNewLocale(e.target.value)} /><button onClick={addLocale}>+</button></div>
      <div className="panel-title">Project</div><div className="project-stats"><span>{project.events.length} Events</span><span>{project.edges.length} Edges</span><span>Authoring v{project.authoringVersion}</span><span>Content schema v{project.gameSchemaVersion}</span></div>
      <div className="panel-title">Registries</div><div className="project-stats compact-stats"><span>{project.registries.races.length} Races</span><span>{project.registries.seas.length} Seas</span><span>{project.registries.affiliations.length} Affiliations</span><span>{project.registries.traits.length} Traits</span><span>{project.registries.items.length} Items</span><span>{project.registries.npcs.length} NPCs</span><span>{project.registries.flags.length} Flags*</span></div>
    </aside>

    <main className="canvas-panel"><ReactFlow<EventFlowNode, Edge> nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes} onInit={(instance) => { flowRef.current = instance; }} onNodesChange={onNodesChange} onNodesDelete={(nodes) => deleteEvents(new Set(nodes.map((node) => node.id)))} onEdgesDelete={(edges) => touch((current) => ({ ...current, edges: current.edges.filter((edge) => !edges.some((deleted) => deleted.id === edge.id)) }))} onConnect={onConnect} onNodeClick={(_, node) => setSelectedEventId(node.id)} onPaneClick={() => setSelectedEventId(undefined)} fitView minZoom={0.15} maxZoom={2} deleteKeyCode="Delete" multiSelectionKeyCode="Shift"><Background gap={12} size={0.7} /><Controls position="bottom-left" /><MiniMap position="bottom-right" pannable zoomable style={{ width: 84, height: 58 }} /></ReactFlow></main>

    <Inspector event={selectedEvent} contentFolder={selectedNode?.contentFolder ?? (selectedEvent ? inferContentFolder(undefined, selectedEvent) : 'active')} notes={selectedNode?.notes ?? ''} status={selectedNode?.status ?? 'draft'} issues={selectedIssues} registries={project.registries} eventIds={project.events.map((event) => event.id)} scheduledEventIds={project.events.filter((event) => event.kind === 'scheduled').map((event) => event.id)} immediateEventIds={project.events.filter((event) => event.kind === 'immediate').map((event) => event.id)} localization={project.localization} activeLocale={activeLocale} sourceLocale={project.sourceLocale} supportedLocales={project.supportedLocales} onLocaleChange={setActiveLocale} onLocalizedTextChange={onLocalizedTextChange} onChange={updateEvent} onContentFolderChange={(contentFolder: ContentFolder) => selectedEventId && touch((current) => ({ ...current, nodes: current.nodes.map((node) => node.eventId === selectedEventId ? { ...node, contentFolder } : node) }))} onRename={renameSelected} onNotesChange={(notes) => selectedEventId && touch((current) => ({ ...current, nodes: current.nodes.map((node) => node.eventId === selectedEventId ? { ...node, notes } : node) }))} onStatusChange={(status: AuthoringStatus) => selectedEventId && touch((current) => ({ ...current, nodes: current.nodes.map((node) => node.eventId === selectedEventId ? { ...node, status } : node) }))} />

    <section className="validation-panel"><button className="validation-header" onClick={() => setValidationOpen((open) => !open)}><span>Runtime + Authoring validation</span><span className="validation-summary">{project.events.length} Events · {ready} Ready · {warnings} Warnings · {needsReview} Needs Review · {invalid} Invalid</span><span>{validationOpen ? '▾' : '▴'}</span></button>{validationOpen && <div className="validation-body">{validation.issues.length === 0 ? <div className="success-message">No validation issues.</div> : validation.issues.map((issue, index) => <button key={`${issue.code}-${issue.eventId}-${index}`} className={`validation-row ${issue.severity}`} onClick={() => issue.eventId && selectAndCenter(issue.eventId)}><strong>{issue.category} · {issue.severity}</strong><code>{issue.eventId ?? 'project'}</code><span>{issue.message}</span></button>)}</div>}</section>

    <RegistryPanel open={registryOpen} project={project} activeLocale={activeLocale} onClose={() => setRegistryOpen(false)} onChange={(next) => touch(() => next)} onLocalizedTextChange={onLocalizedTextChange} />
    {batchReport && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setBatchReport(undefined); }}><section className="import-report"><div className="modal-header"><strong>{batchReport.title}</strong><span className="muted">Imported: {batchReport.imported} · Warnings: {batchReport.warnings.length} · Rejected: {batchReport.rejected.length}</span><button onClick={() => setBatchReport(undefined)}>×</button></div><div className="import-report-body">{batchReport.warnings.length === 0 && batchReport.rejected.length === 0 ? <div className="success-message">Import completed without warnings.</div> : <>{batchReport.warnings.map((item, index) => <div className="import-problem warning" key={`w-${index}`}><code>{item.file}</code><span>{item.message}</span></div>)}{batchReport.rejected.map((item, index) => <div className="import-problem error" key={`e-${index}`}><code>{item.file}</code><span>{item.message}</span></div>)}</>}</div></section></div>}
    {message && <div className="toast">{message}</div>}
  </div>;
}

export default function App() { return <ReactFlowProvider><EditorApp /></ReactFlowProvider>; }
