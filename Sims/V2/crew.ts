import { runSuiteCli } from './core/runner';

runSuiteCli('crew').catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
