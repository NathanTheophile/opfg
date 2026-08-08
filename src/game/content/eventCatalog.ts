import type { EventDefinition } from './schema';

type JsonModules = Record<string, unknown>;

const eventModules = import.meta.glob('./events/**/*.json', {
  eager: true,
  import: 'default',
}) as JsonModules;

export const eventCatalog: EventDefinition[] = buildEventCatalog(eventModules);

export function buildEventCatalog(modules: JsonModules): EventDefinition[] {
  const events = Object.entries(modules).map(([path, value]) => {
    if (!isRecord(value) || typeof value.id !== 'string' || value.id.length === 0) {
      throw new Error(`Event file "${path}" must contain one EventDefinition with a non-empty id.`);
    }

    const filename = path.split('/').at(-1)?.replace(/\.json$/, '');
    if (filename !== value.id) {
      throw new Error(`Event filename "${filename}" does not match EventId "${value.id}" in "${path}".`);
    }

    return value as unknown as EventDefinition;
  });

  return events.sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
