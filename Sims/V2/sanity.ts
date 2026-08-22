import { runSuiteCli } from './core/runner';

runSuiteCli('sanity').catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
