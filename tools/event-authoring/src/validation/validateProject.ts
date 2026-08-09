import type { AuthoringProject } from '../authoring/types';
import type { Condition, Effect, EventDefinition, GameRegistries, Resolution } from '../gameSchema/current/contract';
import { CONTENT_SCHEMA_VERSION } from '../gameSchema/current/contract';
import { validateContent } from '../gameSchema/current/validator';
import { collectEventLocalizationKeys } from '../localization/keys';
import { getStatus, getText, placeholdersMatch } from '../localization/store';

export type ValidationSeverity = 'error' | 'warning' | 'needsReview';
export type ValidationCategory = 'Gameplay' | 'Localization' | 'Authoring';
export interface ValidationIssue { severity: ValidationSeverity; category: ValidationCategory; code: string; message: string; eventId?: string; }
export interface ValidationResult { issues: ValidationIssue[]; errorEventIds: Set<string>; }

const ids = <T extends { id: string }>(values: T[]) => new Set(values.map((x) => x.id));
const collectRegistryKeys = (r: GameRegistries): Array<[string,string]> => [
  ...r.races.map((x) => [x.nameKey, 'Race'] as [string,string]), ...r.seas.map((x) => [x.nameKey, 'Sea'] as [string,string]),
  ...r.affiliations.map((x) => [x.nameKey, 'Affiliation'] as [string,string]), ...r.traits.flatMap((x) => [[x.nameKey, 'Trait'], [x.descriptionKey, 'Trait description']] as [string,string][]),
  ...r.items.map((x) => [x.nameKey, 'Item'] as [string,string]), ...r.npcs.map((x) => [x.nameKey, 'NPC'] as [string,string]),
];

const validateLocalizationKey = (project: AuthoringProject, key: string, label: string, issues: ValidationIssue[], eventId?: string) => {
  if (getStatus(project.localization, key, project.sourceLocale, project.sourceLocale) === 'missing') {
    issues.push({ severity: 'error', category: 'Localization', code: 'missing-source', message: `Missing FR source for ${label} '${key}'.`, eventId });
    return;
  }
  const source = getText(project.localization, key, project.sourceLocale);
  for (const locale of project.supportedLocales.filter((x) => x !== project.sourceLocale)) {
    const status = getStatus(project.localization, key, locale, project.sourceLocale);
    if (status === 'missing') issues.push({ severity: 'warning', category: 'Localization', code: 'missing-translation', message: `${locale.toUpperCase()} missing for '${key}'.`, eventId });
    else {
      if (status === 'outdated') issues.push({ severity: 'warning', category: 'Localization', code: 'outdated-translation', message: `${locale.toUpperCase()} outdated for '${key}'.`, eventId });
      if (!placeholdersMatch(source, getText(project.localization, key, locale))) issues.push({ severity: 'error', category: 'Localization', code: 'placeholder-mismatch', message: `${locale.toUpperCase()} placeholders differ from FR for '${key}'.`, eventId });
    }
  }
};

const walkCondition = (condition: Condition | undefined, visit: (condition: Condition) => void): void => {
  if (!condition) return; visit(condition);
  if (condition.type === 'all' || condition.type === 'any') condition.conditions.forEach((x) => walkCondition(x, visit));
  if (condition.type === 'not') walkCondition(condition.condition, visit);
};
const walkResolution = (resolution: Resolution, onEffect: (effect: Effect) => void, onCondition: (condition: Condition) => void) => {
  const outcomes = resolution.type === 'deterministic' ? [resolution.outcome] : Object.values(resolution.outcomes);
  outcomes.forEach((outcome) => outcome.effects.forEach(onEffect));
  if (resolution.type === 'dice') resolution.modifiers?.forEach((modifier) => walkCondition(modifier.condition, onCondition));
};

const runtimeCatalog = (project: AuthoringProject) => ({
  schemaVersion: CONTENT_SCHEMA_VERSION,
  races: project.registries.races,
  seas: project.registries.seas,
  affiliations: project.registries.affiliations,
  locations: project.registries.locations,
  traits: project.registries.traits,
  items: project.registries.items,
  npcs: project.registries.npcs,
  events: project.events,
});

export const validateProject = (project: AuthoringProject): ValidationResult => {
  const issues: ValidationIssue[] = [];
  const runtimeErrors = validateContent(runtimeCatalog(project));
  for (const error of runtimeErrors) {
    const match = /^events\[(\d+)\]/.exec(error.path);
    const eventId = match ? project.events[Number(match[1])]?.id : undefined;
    issues.push({ severity: 'error', category: 'Gameplay', code: 'runtime-catalog', message: `${error.path}: ${error.message}`, eventId });
  }

  const nodeByEvent = new Map(project.nodes.map((node) => [node.eventId, node]));
  for (const event of project.events) {
    const node = nodeByEvent.get(event.id);
    if (!node) issues.push({ severity: 'error', category: 'Authoring', code: 'missing-node', message: 'Event has no authoring node.', eventId: event.id });
    else {
      const expected = event.kind === 'scheduled' ? 'scheduled' : event.kind === 'critical' ? 'critical' : undefined;
      if (expected && node.contentFolder !== expected) issues.push({ severity: 'error', category: 'Authoring', code: 'folder-kind-mismatch', message: `${event.kind} Event must export under ${expected}/.`, eventId: event.id });
      if (event.kind === 'normal' && !['origins','childhood','active','fixtures/childhood'].includes(node.contentFolder)) issues.push({ severity: 'error', category: 'Authoring', code: 'folder-kind-mismatch', message: 'Normal Event requires origins, childhood, active, or fixtures/childhood folder.', eventId: event.id });
      if (node.status === 'needsReview') issues.push({ severity: 'needsReview', category: 'Authoring', code: 'migration-review', message: 'Event requires manual migration review.', eventId: event.id });
    }
    for (const key of collectEventLocalizationKeys(event)) validateLocalizationKey(project, key, 'Event key', issues, event.id);
  }
  for (const [key, label] of collectRegistryKeys(project.registries)) validateLocalizationKey(project, key, label, issues);

  const flagIds = ids(project.registries.flags);
  const checkFlagCondition = (eventId: string) => (condition: Condition) => {
    if (condition.type === 'hasFlag' && !flagIds.has(condition.flagId)) issues.push({ severity: 'error', category: 'Authoring', code: 'unknown-authoring-flag', message: `Unknown authoring Flag '${condition.flagId}'. Add it to the Flags registry or correct the ID.`, eventId });
  };
  const checkFlagEffect = (eventId: string) => (effect: Effect) => {
    if ((effect.type === 'setFlag' || effect.type === 'clearFlag') && !flagIds.has(effect.flagId)) issues.push({ severity: 'error', category: 'Authoring', code: 'unknown-authoring-flag', message: `Unknown authoring Flag '${effect.flagId}'. Add it to the Flags registry or correct the ID.`, eventId });
  };
  for (const event of project.events) {
    const onCondition = checkFlagCondition(event.id); const onEffect = checkFlagEffect(event.id);
    walkCondition(event.eligibility, onCondition);
    if (event.kind === 'scheduled') walkCondition(event.cancelIf, onCondition);
    for (const choice of event.choices) { walkCondition(choice.visibleIf, onCondition); walkCondition(choice.availableIf, onCondition); walkResolution(choice.resolution, onEffect, onCondition); }
  }

  const duplicateFlags = project.registries.flags.map((x) => x.id).filter((id, index, all) => all.indexOf(id) !== index);
  for (const id of [...new Set(duplicateFlags)]) issues.push({ severity: 'error', category: 'Authoring', code: 'duplicate-authoring-flag', message: `Duplicate authoring Flag '${id}'.` });
  for (const warning of project.metadata.migrationWarnings ?? []) issues.push({ severity: 'warning', category: 'Authoring', code: 'migration-warning', message: warning });

  const errorEventIds = new Set(issues.filter((issue) => issue.severity === 'error' && issue.eventId).map((issue) => issue.eventId!));
  return { issues, errorEventIds };
};

