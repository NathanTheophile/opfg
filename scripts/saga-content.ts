import {
  assertRoundTripFromRuntime,
  checkSaga,
  formatProblems,
  importSagaFromRuntime,
  loadSagaSource,
  validateSagaAuthoring,
  writeCompiledSaga,
  writeImportedSaga,
} from './saga-content/lib';

const rootDirectory = process.cwd();
const [command, sagaId] = process.argv.slice(2);

if (!command || !sagaId) {
  usage();
  process.exitCode = 1;
} else {
  try {
    if (command === 'import') {
      const source = importSagaFromRuntime(rootDirectory, sagaId);
      const result = validateSagaAuthoring(source);
      if (result.errors.length > 0) throw new Error(formatProblems('Imported Saga is structurally invalid', result));
      writeImportedSaga(rootDirectory, source);
      console.log(`Imported ${source.events.length} EventDefinitions -> content-authoring/sagas/${sagaId}.authoring.json`);
      result.warnings.forEach((warning) => console.log(`WARNING ${warning}`));
    } else if (command === 'compile') {
      const source = loadSagaSource(rootDirectory, sagaId);
      writeCompiledSaga(rootDirectory, source);
      console.log(`Compiled ${source.events.length} authored EventDefinitions for ${sagaId}.`);
    } else if (command === 'check') {
      const source = loadSagaSource(rootDirectory, sagaId);
      const result = checkSaga(rootDirectory, source);
      console.log(formatProblems(`Saga check: ${sagaId}`, result));
      if (result.errors.length > 0) process.exitCode = 1;
    } else if (command === 'roundtrip') {
      assertRoundTripFromRuntime(rootDirectory, sagaId);
      console.log(`Round-trip OK: ${sagaId} runtime -> authoring -> runtime.`);
    } else {
      usage();
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

function usage(): void {
  console.log(`
Usage:
  npm run saga:import -- <sagaId>
  npm run saga:compile -- <sagaId>
  npm run saga:check -- <sagaId>
  npm run saga:roundtrip -- <sagaId>
`);
}
