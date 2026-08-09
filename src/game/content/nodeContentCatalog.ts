import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createContentCatalog } from './catalogFactory';
import { buildEventCatalog, type EventModules } from './eventCatalogBuilder';
import type { ContentCatalog } from './schema';

export function loadNodeContentCatalog(rootDirectory = process.cwd()): ContentCatalog {
  const eventsDirectory = join(rootDirectory, 'src', 'game', 'content', 'events');
  const modules: EventModules = {};
  for (const path of findJsonFiles(eventsDirectory)) {
    modules[relative(eventsDirectory, path).replaceAll('\\', '/')] = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  }
  return createContentCatalog(buildEventCatalog(modules));
}

function findJsonFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? findJsonFiles(path) : entry.isFile() && entry.name.endsWith('.json') ? [path] : [];
  });
}
