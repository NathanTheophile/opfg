import { runManySuites } from './core/runner';
import { SUITE_IDS } from './suites';

runManySuites(SUITE_IDS).catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
