import { resolve } from 'node:path';
import type { V2CliArgs, V2PolicyId, V2SuiteId } from './types';

const POLICY_IDS = new Set<V2PolicyId>(['random', 'progression', 'minmax']);

export function parseV2Args(values: readonly string[], suiteId: V2SuiteId): V2CliArgs {
  const result: V2CliArgs = {
    runs: 500,
    seed: 1,
    maxEvents: 1000,
    policy: 'progression',
    progress: true,
    progressEveryMs: 1000,
    top: 30,
    includeRuns: false,
  };

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--runs') result.runs = positiveInteger(values[++index], '--runs');
    else if (value === '--seed') result.seed = uint32(values[++index], '--seed');
    else if (value === '--max-events') result.maxEvents = positiveInteger(values[++index], '--max-events');
    else if (value === '--policy') result.policy = policy(values[++index]);
    else if (value === '--json') result.jsonPath = requiredValue(values[++index], '--json');
    else if (value === '--progress') result.progress = true;
    else if (value === '--no-progress') result.progress = false;
    else if (value === '--progress-every') result.progressEveryMs = positiveNumber(values[++index], '--progress-every') * 1000;
    else if (value === '--top') result.top = positiveInteger(values[++index], '--top');
    else if (value === '--include-runs') result.includeRuns = true;
    else if (value === '--help' || value === '-h') {
      printHelp(suiteId);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument "${value}". Use --help.`);
    }
  }

  result.jsonPath ??= resolve(
    'Sims',
    'V2',
    'reports',
    `${suiteId}-${result.policy}-seed${result.seed}-runs${result.runs}.json`,
  );
  return result;
}

export function printHelp(suiteId: V2SuiteId): void {
  console.log(`OPFG Sims V2 — ${suiteId}\n`);
  console.log(`Usage:`);
  console.log(`  npx jiti Sims/V2/${suiteId}.ts [options]\n`);
  console.log(`Options:`);
  console.log(`  --policy random|progression|minmax   Simulation policy (default: progression)`);
  console.log(`  --runs N                            Number of runs (default: 500)`);
  console.log(`  --seed N                            First seed (default: 1)`);
  console.log(`  --max-events N                      Safety cap per run (default: 1000)`);
  console.log(`  --json PATH                         Output report path`);
  console.log(`  --progress / --no-progress          Enable/disable CLI progress (default: enabled)`);
  console.log(`  --progress-every SECONDS             Refresh interval (default: 1)`);
  console.log(`  --top N                             Top-N tables in report (default: 30)`);
  console.log(`  --include-runs                      Include compact per-run outcomes in JSON`);
  console.log(`  --help                              Show this help`);
}

function policy(value: string | undefined): V2PolicyId {
  const parsed = requiredValue(value, '--policy') as V2PolicyId;
  if (!POLICY_IDS.has(parsed)) {
    throw new Error('--policy must be "random", "progression", or "minmax".');
  }
  return parsed;
}

function positiveInteger(value: string | undefined, label: string): number {
  const parsed = Number(requiredValue(value, label));
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${label} must be a positive integer.`);
  return parsed;
}

function positiveNumber(value: string | undefined, label: string): number {
  const parsed = Number(requiredValue(value, label));
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${label} must be a positive number.`);
  return parsed;
}

function uint32(value: string | undefined, label: string): number {
  const parsed = Number(requiredValue(value, label));
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 0xffffffff) {
    throw new Error(`${label} must be an integer from 0 to 4294967295.`);
  }
  return parsed;
}

function requiredValue(value: string | undefined, label: string): string {
  if (!value || value.startsWith('--')) throw new Error(`${label} requires a value.`);
  return value;
}
