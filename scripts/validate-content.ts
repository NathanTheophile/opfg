import { loadNodeContentCatalog } from '../src/game/content/nodeContentCatalog';
import { diagnoseContent } from '../src/game/simulation/diagnostics';
import { validateContent } from '../src/game/validation/validateContent';

const catalog = loadNodeContentCatalog();
const errors = validateContent(catalog);
const warnings = diagnoseContent(catalog);
const counts = {
  normal: catalog.events.filter(({ kind }) => kind === 'normal').length,
  immediate: catalog.events.filter(({ kind }) => kind === 'immediate').length,
  scheduled: catalog.events.filter(({ kind }) => kind === 'scheduled').length,
  critical: catalog.events.filter(({ kind }) => kind === 'critical').length,
};

console.log('OPFG Content Validation\n');
console.log(`Schema: ${catalog.schemaVersion}\n`);
console.log(`Events: ${catalog.events.length}`);
console.log(`  Normal: ${counts.normal}`);
console.log(`  Immediate: ${counts.immediate}`);
console.log(`  Scheduled: ${counts.scheduled}`);
console.log(`  Critical: ${counts.critical}\n`);
console.log(`Structural validation: ${errors.length} error(s)`);
errors.forEach(({ path, message }) => console.error(`ERROR ${path}: ${message}`));
console.log(`\nDiagnostics: ${warnings.length} warning(s)`);
warnings.forEach(({ message }) => console.log(`WARNING ${message}`));

if (errors.length > 0) process.exitCode = 1;
