import { CONTENT_SCHEMA_VERSION, type ContentCatalog, type EventDefinition } from './contract';
import type { AuthoringProject } from '../../authoring/types';
import { exportLocaleDictionary } from '../../localization/store';
import { validateProject } from '../../validation/validateProject';

export interface GameExportResult {
  catalog?: ContentCatalog;
  locales?: Record<string, Record<string, string>>;
  blockedEventIds: string[];
  blockingProjectErrors: number;
}

export const toRuntimeCatalog = (project: AuthoringProject): ContentCatalog => ({
  schemaVersion: CONTENT_SCHEMA_VERSION,
  races: structuredClone(project.registries.races),
  seas: structuredClone(project.registries.seas),
  affiliations: structuredClone(project.registries.affiliations),
  locations: structuredClone(project.registries.locations),
  traits: structuredClone(project.registries.traits),
  items: structuredClone(project.registries.items),
  ships: structuredClone(project.registries.ships),
  npcs: structuredClone(project.registries.npcs),
  events: structuredClone(project.events),
});

export const toRuntimeEvent = (event: EventDefinition): EventDefinition => structuredClone(event);

export const exportToGameCatalog = (project: AuthoringProject): GameExportResult => {
  const validation = validateProject(project);
  const blockedEventIds = [...validation.errorEventIds];
  const blockingProjectErrors = validation.issues.filter((issue) => issue.severity === 'error' && !issue.eventId).length;
  const reviewIds = project.nodes.filter((node) => node.status === 'needsReview').map((node) => node.eventId);
  const blocked = [...new Set([...blockedEventIds, ...reviewIds])];
  if (blocked.length || blockingProjectErrors) return { blockedEventIds: blocked, blockingProjectErrors };

  return {
    catalog: toRuntimeCatalog(project),
    locales: Object.fromEntries(project.supportedLocales.map((locale) => [locale, exportLocaleDictionary(project.localization, locale)])),
    blockedEventIds: [],
    blockingProjectErrors: 0,
  };
};
