import type { EventDefinition } from './schema';
import { buildEventCatalog, type EventModules } from './eventCatalogBuilder';

const eventModules = import.meta.glob('./events/**/*.json', {
  eager: true,
  import: 'default',
}) as EventModules;

export const eventCatalog: EventDefinition[] = buildEventCatalog(eventModules);

export { buildEventCatalog } from './eventCatalogBuilder';
