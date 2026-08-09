import { createDemoProject } from '../src/authoring/demo';
import { serializeProject, deserializeProject } from '../src/authoring/serialization';
import { CONTENT_SCHEMA_VERSION } from '../src/gameSchema/current/contract';
import { exportToGameCatalog } from '../src/gameSchema/current/exporter';
import { validateContent } from '../src/gameSchema/current/validator';
import { createEventsArchive, importEventFiles, readEventsBundle } from '../src/io/events';
import { validateProject } from '../src/validation/validateProject';

const assert = (condition: unknown, message: string): void => { if (!condition) throw new Error(message); };

async function main(): Promise<void> {
  const project = createDemoProject();
  assert(CONTENT_SCHEMA_VERSION === 2, 'Content Schema must be v2');
  assert(JSON.stringify(deserializeProject(serializeProject(project))) === JSON.stringify(project), 'authoring round-trip failed');
  assert(validateContent({ ...exportToGameCatalog(project).catalog }).length === 0, 'runtime catalog validation failed');
  assert(validateProject(project).issues.every((issue) => issue.severity !== 'error'), 'authoring validation has errors');
  const exported = exportToGameCatalog(project);
  assert(exported.catalog?.schemaVersion === 2, 'runtime export blocked or wrong schema');
  assert(!('flags' in (exported.catalog as object)), 'authoring-only flags leaked into ContentCatalog');
  const bundle = await readEventsBundle(createEventsArchive(project, { bundle: true, includeLocales: true }));
  assert(bundle.eventFiles.length === project.events.length, 'bundle Event count mismatch');
  const target = structuredClone(project); target.events = []; target.nodes = []; target.edges = []; target.localization = {};
  const imported = importEventFiles(target, bundle.eventFiles);
  assert(imported.report.imported === project.events.length, 'bundle re-import failed');
  console.log('Core smoke tests passed: Content Schema v2, validation, serialization, bundle export/import.');
}

void main();

