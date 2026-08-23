import { runSuiteCli } from './core/runner';

runSuiteCli('economy-ships').catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
