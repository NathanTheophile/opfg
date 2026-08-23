import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { loadNodeContentCatalog } from '../../../src/game/content/nodeContentCatalog';
import { validateContent } from '../../../src/game/validation/validateContent';
import { parseV2Args } from './cli';
import { collectV2Run } from './collector';
import { buildCommonSummary } from './commonSummary';
import { assertCrewAwareProgressionPolicy, policyTelemetry, resetPolicyTelemetry, resolvePolicy } from './policies';
import { ProgressReporter, formatDuration } from './progress';
import { compactRunSample } from './stats';
import type { V2Report, V2RunSample, V2SuiteId } from './types';
import { suiteById } from '../suites';

export async function runSuiteCli(suiteId: V2SuiteId, argv = process.argv.slice(2)): Promise<void> {
  const suite = suiteById(suiteId);
  const args = parseV2Args(argv, suiteId);
  const catalog = loadNodeContentCatalog();
  const validationErrors = validateContent(catalog);
  if (validationErrors.length > 0) {
    validationErrors.slice(0, 20).forEach(({ path, message }) => console.error(`ERROR ${path}: ${message}`));
    throw new Error(`Sims/V2 aborted: ContentCatalog has ${validationErrors.length} structural error(s).`);
  }

  const policy = resolvePolicy(args.policy);
  assertCrewAwareProgressionPolicy(policy);
  resetPolicyTelemetry(args.policy);

  const reporter = new ProgressReporter({
    suite: suite.id,
    policy: policy.id,
    total: args.runs,
    enabled: args.progress,
    intervalMs: args.progressEveryMs,
  });
  reporter.header(args.seed, args.maxEvents, args.jsonPath);
  console.log(`Objective: ${suite.objective}\n`);

  const startedAt = new Date();
  const samples: V2RunSample[] = [];

  for (let index = 0; index < args.runs; index += 1) {
    const seed = (args.seed + index) >>> 0;
    const sample = collectV2Run(seed, catalog, policy, args.maxEvents);
    samples.push(sample);
    reporter.tick(samples.length, suite.progress(samples));
  }
  reporter.finish(samples.length, suite.progress(samples));

  const completedAt = new Date();
  const report: V2Report = {
    telemetryVersion: '2.0',
    suite: {
      id: suite.id,
      title: suite.title,
      objective: suite.objective,
    },
    config: args,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    elapsedMs: reporter.elapsedMs(),
    common: buildCommonSummary(samples),
    summary: suite.summarize(samples, args.top),
    ...(args.includeRuns ? { runs: samples.map(compactRunSample) } : {}),
    ...(policyTelemetry(args.policy) !== undefined ? { policyTelemetry: policyTelemetry(args.policy) } : {}),
  };

  writeJson(args.jsonPath, report);

  const deaths = samples.filter(({ playerDeath }) => playerDeath).length;
  const errors = samples.filter(({ error }) => error !== undefined).length;
  const age35 = samples.filter(({ reachedAge35 }) => reachedAge35).length;
  console.log('');
  console.log(`Completed ${samples.length}/${args.runs} runs in ${formatDuration(report.elapsedMs)}.`);
  console.log(`Deaths: ${deaths} | Age 35: ${age35} | Errors: ${errors}`);
  console.log(`Report: ${resolve(args.jsonPath ?? '')}`);
}

export async function runManySuites(
  suiteIds: readonly V2SuiteId[],
  argv = process.argv.slice(2),
): Promise<void> {
  for (let index = 0; index < suiteIds.length; index += 1) {
    const suiteId = suiteIds[index];
    console.log(`\n=== V2 suite ${index + 1}/${suiteIds.length}: ${suiteId} ===\n`);
    await runSuiteCli(suiteId, argvWithSuiteSpecificJson(argv, suiteId));
  }
}

function argvWithSuiteSpecificJson(argv: readonly string[], suiteId: V2SuiteId): string[] {
  const result = [...argv];
  const jsonIndex = result.indexOf('--json');
  if (jsonIndex >= 0) {
    const basePath = result[jsonIndex + 1];
    if (basePath) {
      result[jsonIndex + 1] = basePath.replace(/\.json$/i, `-${suiteId}.json`);
    }
  }
  return result;
}

function writeJson(path: string | undefined, value: unknown): void {
  if (!path) return;
  const output = resolve(path);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
