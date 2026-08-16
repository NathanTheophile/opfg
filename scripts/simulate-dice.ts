import { performance } from 'node:perf_hooks';
import type { DiceResult } from '../src/game/content/schema';
import { evaluateDiceRoll, getDicePreview } from '../src/game/engine/dice';
import type { SimulationObserver } from '../src/game/simulation/observation';
import { simulateObservedRun } from '../src/game/simulation/simulateObservedRun';
import {
  average,
  inc,
  loadValidatedCatalog,
  parseSpecializedArgs,
  pct,
  quantile,
  writeJson,
} from './simulation-specialized/shared';

const RESULT_KEYS: DiceResult[] = ['criticalFailure', 'failure', 'success', 'criticalSuccess'];
const RAW_ROLLS = Array.from({ length: 20 }, (_, index) => index + 1);
const CHANCE_BUCKETS = Array.from({ length: 19 }, (_, index) => (index + 1) * 5);

const args = parseSpecializedArgs(process.argv.slice(2), 'reports/sim-dice-childhood-20000.json');
if (!process.argv.includes('--runs')) args.runs = 20000;

const catalog = loadValidatedCatalog();
const startedAt = performance.now();

type RollCounts = Record<string, number>;

type Aggregate = {
  checks: number;
  results: Record<DiceResult, number>;
  successCount: number;
  advertised: number[];
  chanceDistribution: Record<string, number>;
};

type ChoiceAggregate = Aggregate & {
  eventId: string;
  choiceId: string;
  threshold: number;
  statValues: number[];
  statModifiers: number[];
  failuresByRawRoll: RollCounts;
  successesByRawRoll: RollCounts;
};

type Example = {
  seed: number;
  ageMonths: number;
  eventId: string;
  choiceId: string;
  statId: string;
  statValue: number | null;
  statModifier: number;
  conditionalModifiers: Array<{ labelKey: string; value: number }>;
  modifierTotal: number;
  rawRoll: number;
  total: number;
  successThreshold: number;
  result: DiceResult;
  advertisedProbability: number;
};

type Violation = Example & { kind: string; expected?: DiceResult; enumeratedProbability?: number };

const globalAgg = makeAggregate();
const byAgeBand = new Map<string, Aggregate>();
const byStat = new Map<string, Aggregate>();
const byChoice = new Map<string, ChoiceAggregate>();
const chanceBands = new Map<string, Aggregate>();
const rawRollDistribution: RollCounts = {};
const highRollFailures: Example[] = [];
const lowRollSuccesses: Example[] = [];
const violations: Violation[] = [];
const terminationReasons: Record<string, number> = {};
const errors: Record<string, number> = {};

for (let runIndex = 0; runIndex < args.runs; runIndex += 1) {
  const seed = (args.seed + runIndex) >>> 0;

  const observer: SimulationObserver = {
    onEventResolved(entry) {
      if (entry.beforeState.careerPhase !== 'childhood') return;
      if (entry.choice.resolution.type !== 'dice' || !entry.dice) return;

      const resolution = entry.choice.resolution;
      const dice = entry.dice;
      const preview = getDicePreview(resolution, entry.beforeState, catalog);
      if (!preview.available) {
        violations.push({ ...example(seed, entry, 0), kind: 'preview-unavailable' });
        return;
      }

      const probability = preview.successProbability;
      const enumerated = RAW_ROLLS.map((rawRoll) => evaluateDiceRoll(resolution, entry.beforeState, rawRoll, false, catalog));
      const enumeratedProbability = enumerated.filter(isSuccess).length / 20;
      const expected = evaluateDiceRoll(resolution, entry.beforeState, dice.rawRoll, false, catalog);
      const row = example(seed, entry, probability);

      if (expected.result !== dice.result) {
        violations.push({ ...row, kind: 'actual-vs-evaluator', expected: expected.result });
      }
      if (probability !== enumeratedProbability) {
        violations.push({ ...row, kind: 'preview-vs-enumeration', enumeratedProbability });
      }
      if (isSuccess(expected) !== isSuccess(dice)) {
        violations.push({ ...row, kind: 'success-classification', expected: expected.result });
      }

      record(globalAgg, dice.result, probability);
      record(getAggregate(byAgeBand, ageBand(entry.beforeState.ageMonths)), dice.result, probability);
      record(getAggregate(byStat, dice.statId), dice.result, probability);
      record(getAggregate(chanceBands, chanceBucket(probability)), dice.result, probability);

      const choiceAgg = getChoiceAggregate(entry.event.id, entry.choice.id, resolution.successThreshold);
      record(choiceAgg, dice.result, probability);
      choiceAgg.statValues.push(dice.statValue ?? 0);
      choiceAgg.statModifiers.push(dice.statModifier);
      inc(isSuccess(dice) ? choiceAgg.successesByRawRoll : choiceAgg.failuresByRawRoll, String(dice.rawRoll));
      inc(rawRollDistribution, String(dice.rawRoll));

      if (!isSuccess(dice) && dice.rawRoll >= 14 && highRollFailures.length < 30) highRollFailures.push(row);
      if (isSuccess(dice) && dice.rawRoll <= 10 && lowRollSuccesses.length < 30) lowRollSuccesses.push(row);
    },

    onTermination({ reason, error }) {
      inc(terminationReasons, reason);
      if (error) inc(errors, error);
    },
  };

  simulateObservedRun({ seed, catalog, maxResolvedEvents: args.maxEvents, observer });
}

const choiceRows = [...byChoice.values()].map(choiceRow)
  .sort((a, b) => a.avgAdvertisedChance - b.avgAdvertisedChance || a.eventId.localeCompare(b.eventId) || a.choiceId.localeCompare(b.choiceId));

const report = {
  telemetryVersion: 'dice-childhood-diagnostic-v1',
  config: args,
  elapsedMs: performance.now() - startedAt,
  global: {
    ...aggregateRow(globalAgg),
    rawRollDistribution: orderedRollCounts(rawRollDistribution),
  },
  childhoodAgeBands: Object.fromEntries([...byAgeBand.entries()].sort((a, b) => ageBandOrder(a[0]) - ageBandOrder(b[0])).map(([key, value]) => [key, aggregateRow(value)])),
  byStat: Object.fromEntries([...byStat.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, aggregateRow(value)])),
  byEventChoice: choiceRows,
  chanceBands: Object.fromEntries(CHANCE_BUCKETS.map((bucket) => {
    const key = String(bucket);
    return [key, aggregateRow(chanceBands.get(key) ?? makeAggregate())];
  })),
  consistencyAudit: {
    violationCount: violations.length,
    violations,
  },
  outliers: {
    highRollFailures,
    lowRollSuccesses,
  },
  hardestDiceChoices: choiceRows.slice(0, 20),
  easiestDiceChoices: [...choiceRows].reverse().slice(0, 20),
  terminationReasons,
  errors: Object.entries(errors).sort((a, b) => b[1] - a[1]).map(([key, value]) => ({ key, value })),
};

console.log('OPFG Specialized Simulation - CHILDHOOD DICE DIAGNOSTIC v1');
console.log(`Runs: ${args.runs}`);
console.log(`DiceChecks: ${globalAgg.checks}`);
console.log(`Consistency violations: ${violations.length}`);
console.log(`Global success rate: ${aggregateRow(globalAgg).successRatePct.toFixed(2)}%`);
console.log(`Average advertised chance: ${aggregateRow(globalAgg).averageAdvertisedChancePct.toFixed(2)}%`);
console.log('');
console.log('Success by age band:');
for (const [band, value] of Object.entries(report.childhoodAgeBands)) {
  console.log(`  ${band}: ${value.checks} checks | ${value.successRatePct.toFixed(2)}% success | advertised ${value.averageAdvertisedChancePct.toFixed(2)}%`);
}
console.log('');
console.log('Advertised chance buckets:');
for (const [bucket, value] of Object.entries(report.chanceBands)) {
  if (value.checks > 0) console.log(`  ${bucket}%: ${value.checks} | empirical ${value.successRatePct.toFixed(2)}%`);
}
console.log('');
console.log('20 hardest Dice Choices:');
for (const row of report.hardestDiceChoices) {
  console.log(`  ${row.eventId}/${row.choiceId}: n=${row.occurrences} threshold=${row.threshold} advertised=${row.avgAdvertisedChancePct.toFixed(1)}% empirical=${row.empiricalSuccessRatePct.toFixed(1)}%`);
}
console.log('');
console.log('20 easiest Dice Choices:');
for (const row of report.easiestDiceChoices) {
  console.log(`  ${row.eventId}/${row.choiceId}: n=${row.occurrences} threshold=${row.threshold} advertised=${row.avgAdvertisedChancePct.toFixed(1)}% empirical=${row.empiricalSuccessRatePct.toFixed(1)}%`);
}
console.log('');
console.log('Representative high-roll failures / low-roll successes are diagnostic outliers caused by thresholds and modifiers; see JSON outliers.');

writeJson(args.jsonPath, report);

function makeAggregate(): Aggregate {
  return {
    checks: 0,
    results: { criticalFailure: 0, failure: 0, success: 0, criticalSuccess: 0 },
    successCount: 0,
    advertised: [],
    chanceDistribution: {},
  };
}

function record(aggregate: Aggregate, result: DiceResult, probability: number) {
  aggregate.checks += 1;
  aggregate.results[result] += 1;
  if (result === 'success' || result === 'criticalSuccess') aggregate.successCount += 1;
  aggregate.advertised.push(probability);
  inc(aggregate.chanceDistribution, chanceBucket(probability));
}

function aggregateRow(aggregate: Aggregate) {
  return {
    checks: aggregate.checks,
    results: aggregate.results,
    successRate: aggregate.checks === 0 ? 0 : aggregate.successCount / aggregate.checks,
    successRatePct: pct(aggregate.successCount, aggregate.checks),
    averageAdvertisedChance: average(aggregate.advertised),
    averageAdvertisedChancePct: average(aggregate.advertised) * 100,
    chanceDistribution: Object.fromEntries(CHANCE_BUCKETS.map((bucket) => [String(bucket), aggregate.chanceDistribution[String(bucket)] ?? 0])),
  };
}

function choiceRow(value: ChoiceAggregate) {
  return {
    eventId: value.eventId,
    choiceId: value.choiceId,
    occurrences: value.checks,
    threshold: value.threshold,
    avgStatValue: average(value.statValues),
    avgStatModifier: average(value.statModifiers),
    advertisedChance: {
      p10: quantile(value.advertised, 0.10),
      p50: quantile(value.advertised, 0.50),
      p90: quantile(value.advertised, 0.90),
    },
    avgAdvertisedChance: average(value.advertised),
    avgAdvertisedChancePct: average(value.advertised) * 100,
    empiricalSuccessRate: value.checks === 0 ? 0 : value.successCount / value.checks,
    empiricalSuccessRatePct: pct(value.successCount, value.checks),
    failuresByRawRoll: orderedRollCounts(value.failuresByRawRoll),
    successesByRawRoll: orderedRollCounts(value.successesByRawRoll),
  };
}

function getAggregate(map: Map<string, Aggregate>, key: string): Aggregate {
  let value = map.get(key);
  if (!value) {
    value = makeAggregate();
    map.set(key, value);
  }
  return value;
}

function getChoiceAggregate(eventId: string, choiceId: string, threshold: number): ChoiceAggregate {
  const key = `${eventId}/${choiceId}`;
  let value = byChoice.get(key);
  if (!value) {
    value = {
      ...makeAggregate(),
      eventId,
      choiceId,
      threshold,
      statValues: [],
      statModifiers: [],
      failuresByRawRoll: {},
      successesByRawRoll: {},
    };
    byChoice.set(key, value);
  }
  return value;
}

function example(seed: number, entry: Parameters<NonNullable<SimulationObserver['onEventResolved']>>[0], advertisedProbability: number): Example {
  const dice = entry.dice!;
  return {
    seed,
    ageMonths: entry.beforeState.ageMonths,
    eventId: entry.event.id,
    choiceId: entry.choice.id,
    statId: dice.statId,
    statValue: dice.statValue,
    statModifier: dice.statModifier,
    conditionalModifiers: dice.conditionalModifiers,
    modifierTotal: dice.modifierTotal,
    rawRoll: dice.rawRoll,
    total: dice.total,
    successThreshold: entry.choice.resolution.type === 'dice' ? entry.choice.resolution.successThreshold : 0,
    result: dice.result,
    advertisedProbability,
  };
}

function isSuccess(value: { result: DiceResult }): boolean {
  return value.result === 'success' || value.result === 'criticalSuccess';
}

function chanceBucket(probability: number): string {
  const percent = Math.round(probability * 100);
  const bucket = Math.min(95, Math.max(5, Math.round(percent / 5) * 5));
  return String(bucket);
}

function ageBand(ageMonths: number): string {
  const years = Math.floor(ageMonths / 12);
  if (years <= 3) return '1-3';
  if (years <= 6) return '4-6';
  if (years <= 9) return '7-9';
  if (years <= 12) return '10-12';
  return '13-14';
}

function ageBandOrder(value: string): number {
  return ['1-3', '4-6', '7-9', '10-12', '13-14'].indexOf(value);
}

function orderedRollCounts(counts: RollCounts): RollCounts {
  return Object.fromEntries(RAW_ROLLS.map((roll) => [String(roll), counts[String(roll)] ?? 0]));
}
