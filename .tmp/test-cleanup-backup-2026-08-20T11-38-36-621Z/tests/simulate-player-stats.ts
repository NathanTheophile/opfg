import { performance } from 'node:perf_hooks';
import type { GameState } from '../src/game/model/schema';
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

const AGE_20_MONTHS = 20 * 12;

const args = parseSpecializedArgs(process.argv.slice(2), 'reports/sim-player-stats.json');
const catalog = loadValidatedCatalog();
const startedAt = performance.now();

type NumericStats = Record<string, number>;

type Snapshot = {
  seed: number;
  ageMonths: number;
  stats: NumericStats;
  career: string;
  race: string;
};

const at20: Snapshot[] = [];
const finalAll: Snapshot[] = [];
const finalCareerEnded: Snapshot[] = [];

const terminationReasons: Record<string, number> = {};
const errors: Record<string, number> = {};

let reachedAge20 = 0;
let endedBefore20 = 0;

for (let index = 0; index < args.runs; index += 1) {
  const seed = (args.seed + index) >>> 0;
  let captured20 = false;

  const observer: SimulationObserver = {
    onInitialState(state) {
      maybeCapture20(state);
    },

    onNavigationResolved(entry) {
      maybeCapture20(entry.beforeState);
      maybeCapture20(entry.afterState);
    },

    onEventResolved(entry) {
      maybeCapture20(entry.beforeState);
      maybeCapture20(entry.afterState);
    },

    onTermination({ state, reason, error }) {
      maybeCapture20(state);

      inc(terminationReasons, reason);
      if (error) inc(errors, error);

      const snapshot = makeSnapshot(seed, state);
      finalAll.push(snapshot);

      if (reason === 'careerEnded') {
        finalCareerEnded.push(snapshot);
      }

      if (!captured20) endedBefore20 += 1;
    },
  };

  simulateObservedRun({
    seed,
    catalog,
    maxResolvedEvents: args.maxEvents,
    observer,
  });

  function maybeCapture20(state: GameState) {
    if (captured20 || state.ageMonths < AGE_20_MONTHS) return;
    captured20 = true;
    reachedAge20 += 1;
    at20.push(makeSnapshot(seed, state));
  }
}

const allStatKeys = collectStatKeys([...at20, ...finalAll]);

const report = {
  telemetryVersion: 'player-stats-v1',
  config: args,
  elapsedMs: performance.now() - startedAt,

  summary: {
    runs: args.runs,
    reachedAge20,
    reachedAge20Pct: pct(reachedAge20, args.runs),
    endedBefore20,
    endedBefore20Pct: pct(endedBefore20, args.runs),
    finalCareerEndedRuns: finalCareerEnded.length,
    finalCareerEndedPct: pct(finalCareerEnded.length, args.runs),
    statKeys: allStatKeys,
  },

  // Primary requested outputs.
  atAge20: summarizeSnapshots(at20, allStatKeys),
  finalAllRuns: summarizeSnapshots(finalAll, allStatKeys),
  finalCareerEndedOnly: summarizeSnapshots(finalCareerEnded, allStatKeys),

  // Growth from age 20 -> final, only for seeds that reached age 20.
  growthFrom20ToFinal: summarizeGrowth(at20, finalAll, allStatKeys),

  terminationReasons,
  errors: Object.entries(errors)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value),
};

console.log('OPFG Specialized Simulation — PLAYER STATS v1');
console.log(`Runs: ${args.runs}`);
console.log(`Reached age 20: ${reachedAge20}/${args.runs} (${pct(reachedAge20, args.runs).toFixed(1)}%)`);
console.log(`Career-ended final sample: ${finalCareerEnded.length}/${args.runs}`);
console.log('');

console.log('AGE 20 — mean / median');
for (const stat of allStatKeys) {
  const row = report.atAge20.byStat[stat];
  console.log(
    `${stat.padEnd(14)} mean ${row.average.toFixed(2).padStart(6)} | ` +
    `p50 ${String(row.p50).padStart(5)} | p10 ${String(row.p10).padStart(5)} | p90 ${String(row.p90).padStart(5)}`
  );
}

console.log('');
console.log('FINAL (careerEnded only) — mean / median');
for (const stat of allStatKeys) {
  const row = report.finalCareerEndedOnly.byStat[stat];
  console.log(
    `${stat.padEnd(14)} mean ${row.average.toFixed(2).padStart(6)} | ` +
    `p50 ${String(row.p50).padStart(5)} | p10 ${String(row.p10).padStart(5)} | p90 ${String(row.p90).padStart(5)}`
  );
}

console.log('');
console.log('D20 attribute aggregate');
console.log(
  `Age 20 average attribute value: ${report.atAge20.d20Aggregate.averageAttributeValue.toFixed(2)} | ` +
  `average sum: ${report.atAge20.d20Aggregate.averageSum.toFixed(2)}`
);
console.log(
  `Final average attribute value: ${report.finalCareerEndedOnly.d20Aggregate.averageAttributeValue.toFixed(2)} | ` +
  `average sum: ${report.finalCareerEndedOnly.d20Aggregate.averageSum.toFixed(2)}`
);

writeJson(args.jsonPath, report);

function makeSnapshot(seed: number, state: GameState): Snapshot {
  const stats: NumericStats = {};
  for (const [key, value] of Object.entries(state.player.stats as Record<string, unknown>)) {
    if (typeof value === 'number' && Number.isFinite(value)) stats[key] = value;
  }

  return {
    seed,
    ageMonths: state.ageMonths,
    stats,
    career: state.player.career.affiliationId,
    race: state.player.profile.raceId ?? 'unknown',
  };
}

function collectStatKeys(snapshots: Snapshot[]): string[] {
  const keys = new Set<string>();
  for (const snapshot of snapshots) {
    for (const key of Object.keys(snapshot.stats)) keys.add(key);
  }

  // Keep health first if present, then stable alphabetical ordering.
  return [...keys].sort((a, b) => {
    if (a === 'health') return -1;
    if (b === 'health') return 1;
    return a.localeCompare(b);
  });
}

function summarizeSnapshots(snapshots: Snapshot[], statKeys: string[]) {
  const byStat: Record<string, ReturnType<typeof summarizeValues>> = {};

  for (const stat of statKeys) {
    const values = snapshots
      .map((snapshot) => snapshot.stats[stat])
      .filter((value): value is number => typeof value === 'number');

    byStat[stat] = summarizeValues(values);
  }

  const d20Keys = statKeys.filter((key) => key !== 'health');
  const sums: number[] = [];
  const averages: number[] = [];
  const below20Counts: number[] = [];
  const neutral20to30Counts: number[] = [];
  const above30Counts: number[] = [];
  const at40PlusCounts: number[] = [];
  const capped50Counts: number[] = [];

  for (const snapshot of snapshots) {
    const values = d20Keys
      .map((key) => snapshot.stats[key])
      .filter((value): value is number => typeof value === 'number');

    if (values.length === 0) continue;

    sums.push(values.reduce((sum, value) => sum + value, 0));
    averages.push(average(values));
    below20Counts.push(values.filter((value) => value < 20).length);
    neutral20to30Counts.push(values.filter((value) => value >= 20 && value <= 30).length);
    above30Counts.push(values.filter((value) => value > 30).length);
    at40PlusCounts.push(values.filter((value) => value >= 40).length);
    capped50Counts.push(values.filter((value) => value >= 50).length);
  }

  return {
    sampleSize: snapshots.length,
    byStat,
    d20Aggregate: {
      attributeCount: d20Keys.length,
      attributes: d20Keys,
      averageSum: average(sums),
      sumP10: quantile(sums, 0.10),
      sumP50: quantile(sums, 0.50),
      sumP90: quantile(sums, 0.90),
      averageAttributeValue: average(averages),
      avgAttributesBelow20PerPlayer: average(below20Counts),
      avgAttributes20to30PerPlayer: average(neutral20to30Counts),
      avgAttributesAbove30PerPlayer: average(above30Counts),
      avgAttributes40PlusPerPlayer: average(at40PlusCounts),
      avgAttributesAt50PerPlayer: average(capped50Counts),
    },
    modifierBands: Object.fromEntries(
      d20Keys.map((stat) => {
        const values = snapshots
          .map((snapshot) => snapshot.stats[stat])
          .filter((value): value is number => typeof value === 'number');

        return [stat, modifierBandDistribution(values)];
      })
    ),
  };
}

function summarizeGrowth(age20: Snapshot[], final: Snapshot[], statKeys: string[]) {
  const age20BySeed = new Map(age20.map((snapshot) => [snapshot.seed, snapshot]));
  const finalBySeed = new Map(final.map((snapshot) => [snapshot.seed, snapshot]));

  const byStat: Record<string, ReturnType<typeof summarizeValues>> = {};
  let pairedRuns = 0;

  for (const seed of age20BySeed.keys()) {
    if (finalBySeed.has(seed)) pairedRuns += 1;
  }

  for (const stat of statKeys) {
    const deltas: number[] = [];

    for (const [seed, before] of age20BySeed) {
      const after = finalBySeed.get(seed);
      if (!after) continue;

      const a = before.stats[stat];
      const b = after.stats[stat];
      if (typeof a === 'number' && typeof b === 'number') {
        deltas.push(b - a);
      }
    }

    byStat[stat] = summarizeValues(deltas);
  }

  return {
    pairedRuns,
    byStat,
  };
}

function summarizeValues(values: number[]) {
  if (values.length === 0) {
    return {
      count: 0,
      average: 0,
      min: null,
      p10: 0,
      p25: 0,
      p50: 0,
      p75: 0,
      p90: 0,
      max: null,
      atOrBelow19Pct: 0,
      from20To30Pct: 0,
      above30Pct: 0,
      at40PlusPct: 0,
      at50Pct: 0,
    };
  }

  return {
    count: values.length,
    average: average(values),
    min: Math.min(...values),
    p10: quantile(values, 0.10),
    p25: quantile(values, 0.25),
    p50: quantile(values, 0.50),
    p75: quantile(values, 0.75),
    p90: quantile(values, 0.90),
    max: Math.max(...values),

    // Useful directly against the current D20 stat design.
    atOrBelow19Pct: pct(values.filter((value) => value <= 19).length, values.length),
    from20To30Pct: pct(values.filter((value) => value >= 20 && value <= 30).length, values.length),
    above30Pct: pct(values.filter((value) => value > 30).length, values.length),
    at40PlusPct: pct(values.filter((value) => value >= 40).length, values.length),
    at50Pct: pct(values.filter((value) => value >= 50).length, values.length),
  };
}

function modifierBandDistribution(values: number[]) {
  const bands = {
    '-5 (0-3)': 0,
    '-4 (4-7)': 0,
    '-3 (8-11)': 0,
    '-2 (12-15)': 0,
    '-1 (16-19)': 0,
    '0 (20-30)': 0,
    '+1 (31-34)': 0,
    '+2 (35-38)': 0,
    '+3 (39-42)': 0,
    '+4 (43-46)': 0,
    '+5 (47-50)': 0,
  };

  for (const value of values) {
    if (value <= 3) bands['-5 (0-3)'] += 1;
    else if (value <= 7) bands['-4 (4-7)'] += 1;
    else if (value <= 11) bands['-3 (8-11)'] += 1;
    else if (value <= 15) bands['-2 (12-15)'] += 1;
    else if (value <= 19) bands['-1 (16-19)'] += 1;
    else if (value <= 30) bands['0 (20-30)'] += 1;
    else if (value <= 34) bands['+1 (31-34)'] += 1;
    else if (value <= 38) bands['+2 (35-38)'] += 1;
    else if (value <= 42) bands['+3 (39-42)'] += 1;
    else if (value <= 46) bands['+4 (43-46)'] += 1;
    else bands['+5 (47-50)'] += 1;
  }

  return Object.fromEntries(
    Object.entries(bands).map(([band, count]) => [
      band,
      { count, pct: pct(count, values.length) },
    ])
  );
}
