import { runSuiteCli } from './core/runner';

runSuiteCli('endings').catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
