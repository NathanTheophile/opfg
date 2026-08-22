import { runSuiteCli } from './core/runner';
import { SUITE_IDS } from './suites';
import type { V2SuiteId } from './core/types';

const [suiteValue, ...args] = process.argv.slice(2);
if (!suiteValue || !SUITE_IDS.includes(suiteValue as V2SuiteId)) {
  console.error(`Usage: npx jiti Sims/V2/run.ts <suite> [options]`);
  console.error(`Suites: ${SUITE_IDS.join(', ')}`);
  process.exitCode = 1;
} else {
  runSuiteCli(suiteValue as V2SuiteId, args).catch((error) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
  });
}
