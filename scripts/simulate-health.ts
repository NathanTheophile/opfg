import { performance } from 'node:perf_hooks';
import type { GameState } from '../src/game/model/schema';
import type { SimulationObserver } from '../src/game/simulation/observation';
import { simulateObservedRun } from '../src/game/simulation/simulateObservedRun';
import {
  progressionSimulationPolicy,
  randomSimulationPolicy,
  type SimulationPolicy,
} from '../src/game/simulation/simulationPolicy';
import {
  average,
  inc,
  loadValidatedCatalog,
  parseSpecializedArgs,
  pct,
  quantile,
  topEntries,
  writeJson,
} from './simulation-specialized/shared';

type HealthPolicyId = 'random' | 'progression';

const { policyId, remainingArgs } = parseHealthPolicyArgs(process.argv.slice(2));
const args = parseSpecializedArgs(remainingArgs, 'reports/sim-health.json');
const policy: SimulationPolicy = policyId === 'progression'
  ? progressionSimulationPolicy
  : randomSimulationPolicy;
const catalog = loadValidatedCatalog();
const startedAt = performance.now();

type CounterMap = Record<string, number>;

type DamageSourceStat = {
  hits: number;
  totalDamage: number;
  lethalHits: number;
  deathResolutions: number;
  minDelta: number;
};

type ContextStat = {
  events: number;
  damageEvents: number;
  totalDamage: number;
  healingEvents: number;
  totalHealing: number;
  lethalHits: number;
  deaths: number;
  damagedRuns: Set<number>;
};

type RaceStat = {
  runs: number;
  deaths: number;
  damagedRuns: number;
  totalDamage: number;
  baselineHealth: number[];
  finalHealth: number[];
  minimumHealth: number[];
};

const damageSources = new Map<string, DamageSourceStat>();
const damageResolutionSources = new Map<string, DamageSourceStat>();
const byAgeYear = new Map<string, ContextStat>();
const byAgeBand = new Map<string, ContextStat>();
const byTravelState = new Map<string, ContextStat>();
const byCareer = new Map<string, ContextStat>();
const raceStats = new Map<string, RaceStat>();

const terminationReasons: CounterMap = {};
const lethalDamageSources: CounterMap = {};
const deathResolutionSources: CounterMap = {};
const damageByEventKind: CounterMap = {};
const damageByResolution: CounterMap = {};
const errors: CounterMap = {};

const finalAges: number[] = [];
const deathAges: number[] = [];
const survivorFinalHealth: number[] = [];
const allFinalHealth: number[] = [];
const minimumHealthPerRun: number[] = [];
const damagePerRun: number[] = [];
const healingPerRun: number[] = [];
const damageEventCountPerRun: number[] = [];
const baselineHealthPerRun: number[] = [];

const firstBelow75Ages: number[] = [];
const firstBelow50Ages: number[] = [];
const firstBelow25Ages: number[] = [];
const firstZeroOrLessAges: number[] = [];

let deaths = 0;
let runsWithAnyDamage = 0;
let runsWithAnyHealing = 0;
let runsBelow75 = 0;
let runsBelow50 = 0;
let runsBelow25 = 0;
let runsAtZeroOrLess = 0;
let runsEndingBelowBaseline = 0;
let runsEndingAtFullOrAbove = 0;
let totalDamage = 0;
let totalHealing = 0;
let totalDamageEvents = 0;
let totalHealingEvents = 0;
let totalLethalHits = 0;
let deathWithoutObservedLethalHit = 0;

for (let runIndex = 0; runIndex < args.runs; runIndex += 1) {
  const seed = (args.seed + runIndex) >>> 0;

  let baselineHealth: number | null = null;
  let raceId: string | null = null;
  let minHealth = Infinity;
  let runDamage = 0;
  let runHealing = 0;
  let runDamageEvents = 0;
  let sawDamage = false;
  let sawHealing = false;
  let sawLethalHit = false;
  let deathRecorded = false;
  let firstBelow75: number | null = null;
  let firstBelow50: number | null = null;
  let firstBelow25: number | null = null;
  let firstZeroOrLess: number | null = null;

  function ensureBaseline(state: GameState) {
    if (baselineHealth !== null || state.player.profile.raceId === null) return;
    const race = catalog.races.find(({ id }) => id === state.player.profile.raceId);
    baselineHealth = race?.initialHealth ?? state.player.stats.health;
    raceId = state.player.profile.raceId;
    baselineHealthPerRun.push(baselineHealth);
    minHealth = Math.min(minHealth, state.player.stats.health);
  }

  function recordThresholds(state: GameState) {
    ensureBaseline(state);
    if (baselineHealth === null) return;

    const health = state.player.stats.health;
    minHealth = Math.min(minHealth, health);

    if (health <= baselineHealth * 0.75 && firstBelow75 === null) {
      firstBelow75 = state.ageMonths;
      firstBelow75Ages.push(state.ageMonths);
    }
    if (health <= baselineHealth * 0.50 && firstBelow50 === null) {
      firstBelow50 = state.ageMonths;
      firstBelow50Ages.push(state.ageMonths);
    }
    if (health <= baselineHealth * 0.25 && firstBelow25 === null) {
      firstBelow25 = state.ageMonths;
      firstBelow25Ages.push(state.ageMonths);
    }
    if (health <= 0 && firstZeroOrLess === null) {
      firstZeroOrLess = state.ageMonths;
      firstZeroOrLessAges.push(state.ageMonths);
    }
  }

  const observer: SimulationObserver = {
    onInitialState(state) {
      ensureBaseline(state);
      recordThresholds(state);
    },

    onNavigationResolved(entry) {
      ensureBaseline(entry.afterState);
      recordThresholds(entry.afterState);
    },

    onEventResolved(entry) {
      const before = entry.beforeState;
      const after = entry.afterState;

      ensureBaseline(before);
      ensureBaseline(after);

      const explicitHealthDelta = entry.outcome.effects.reduce(
        (sum, effect) => effect.type === 'modifyHealth' ? sum + effect.amount : sum,
        0,
      );

      const sameEstablishedRace =
        before.player.profile.raceId !== null
        && before.player.profile.raceId === after.player.profile.raceId;

      // setRace resets Health to the race's initial value during Origins.
      // Do not misclassify that setup reset as damage/healing.
      const healthDelta = sameEstablishedRace
        ? after.player.stats.health - before.player.stats.health
        : explicitHealthDelta;

      const ageYear = String(Math.floor(before.ageMonths / 12));
      const band = ageBand(before.ageMonths);
      const career = before.player.career.affiliationId;
      const travel = before.travelState;

      const contexts = [
        getContext(byAgeYear, ageYear),
        getContext(byAgeBand, band),
        getContext(byCareer, career),
        getContext(byTravelState, travel),
      ];
      for (const context of contexts) context.events += 1;

      if (healthDelta < 0) {
        const damage = -healthDelta;
        sawDamage = true;
        runDamage += damage;
        runDamageEvents += 1;
        totalDamage += damage;
        totalDamageEvents += 1;

        const lethal = before.player.stats.health > 0 && after.player.stats.health <= 0;
        if (lethal) {
          sawLethalHit = true;
          totalLethalHits += 1;
          inc(lethalDamageSources, entry.event.id);
        }

        addDamageSource(damageSources, entry.event.id, damage, healthDelta, lethal);
        addDamageSource(
          damageResolutionSources,
          `${entry.event.id}/${entry.choice.id}/${entry.outcome.id}`,
          damage,
          healthDelta,
          lethal,
        );

        inc(damageByEventKind, entry.event.kind, damage);
        const resolutionKey = entry.choice.resolution.type === 'dice'
          ? `dice:${entry.diceResult ?? 'unknown'}`
          : 'deterministic';
        inc(damageByResolution, resolutionKey, damage);

        for (const context of contexts) {
          context.damageEvents += 1;
          context.totalDamage += damage;
          context.damagedRuns.add(seed);
          if (lethal) context.lethalHits += 1;
        }
      } else if (healthDelta > 0) {
        sawHealing = true;
        runHealing += healthDelta;
        totalHealing += healthDelta;
        totalHealingEvents += 1;

        for (const context of contexts) {
          context.healingEvents += 1;
          context.totalHealing += healthDelta;
        }
      }

      recordThresholds(after);

      if (
        after.careerStatus === 'ended'
        && after.careerEndReason === 'death'
        && !deathRecorded
      ) {
        deathRecorded = true;
        deaths += 1;
        deathAges.push(after.ageMonths);
        inc(deathResolutionSources, entry.event.id);

        const source = getDamageSource(damageSources, entry.event.id);
        source.deathResolutions += 1;

        const resolutionSource = getDamageSource(
          damageResolutionSources,
          `${entry.event.id}/${entry.choice.id}/${entry.outcome.id}`,
        );
        resolutionSource.deathResolutions += 1;

        for (const context of contexts) context.deaths += 1;
      }
    },

    onTermination({ state, reason, error }) {
      inc(terminationReasons, reason);
      if (error) inc(errors, error);

      ensureBaseline(state);
      recordThresholds(state);
      finalAges.push(state.ageMonths);

      if (baselineHealth !== null) {
        const finalHealth = state.player.stats.health;
        allFinalHealth.push(finalHealth);

        if (state.careerEndReason !== 'death') survivorFinalHealth.push(finalHealth);
        if (finalHealth < baselineHealth) runsEndingBelowBaseline += 1;
        if (finalHealth >= baselineHealth) runsEndingAtFullOrAbove += 1;
      }

      if (!deathRecorded && state.careerStatus === 'ended' && state.careerEndReason === 'death') {
        deathRecorded = true;
        deaths += 1;
        deathAges.push(state.ageMonths);
        inc(deathResolutionSources, state.currentEventId ?? 'death_without_current_event');
      }

      if (deathRecorded && !sawLethalHit) deathWithoutObservedLethalHit += 1;
    },
  };

  simulateObservedRun({
    seed,
    catalog,
    maxResolvedEvents: args.maxEvents,
    observer,
    policy,
  });

  if (sawDamage) runsWithAnyDamage += 1;
  if (sawHealing) runsWithAnyHealing += 1;
  if (firstBelow75 !== null) runsBelow75 += 1;
  if (firstBelow50 !== null) runsBelow50 += 1;
  if (firstBelow25 !== null) runsBelow25 += 1;
  if (firstZeroOrLess !== null) runsAtZeroOrLess += 1;

  damagePerRun.push(runDamage);
  healingPerRun.push(runHealing);
  damageEventCountPerRun.push(runDamageEvents);
  if (Number.isFinite(minHealth)) minimumHealthPerRun.push(minHealth);

  const resolvedRaceId = raceId;
  if (resolvedRaceId !== null && baselineHealth !== null) {
    const race = getRaceStat(resolvedRaceId);
    race.runs += 1;
    if (deathRecorded) race.deaths += 1;
    if (sawDamage) race.damagedRuns += 1;
    race.totalDamage += runDamage;
    race.baselineHealth.push(baselineHealth);
    if (Number.isFinite(minHealth)) race.minimumHealth.push(minHealth);
  }
}

const report = {
  telemetryVersion: '1.1',
  config: { ...args, policy: policy.id },
  elapsedMs: performance.now() - startedAt,

  summary: {
    runs: args.runs,
    deaths,
    deathPct: pct(deaths, args.runs),
    runsWithAnyDamage,
    runsWithAnyDamagePct: pct(runsWithAnyDamage, args.runs),
    runsWithAnyHealing,
    runsWithAnyHealingPct: pct(runsWithAnyHealing, args.runs),

    runsBelow75,
    runsBelow75Pct: pct(runsBelow75, args.runs),
    runsBelow50,
    runsBelow50Pct: pct(runsBelow50, args.runs),
    runsBelow25,
    runsBelow25Pct: pct(runsBelow25, args.runs),
    runsAtZeroOrLess,
    runsAtZeroOrLessPct: pct(runsAtZeroOrLess, args.runs),

    runsEndingBelowBaseline,
    runsEndingBelowBaselinePct: pct(runsEndingBelowBaseline, args.runs),
    runsEndingAtFullOrAbove,
    runsEndingAtFullOrAbovePct: pct(runsEndingAtFullOrAbove, args.runs),

    totalDamage,
    totalDamageEvents,
    averageDamagePerDamagingEvent: totalDamageEvents === 0 ? 0 : totalDamage / totalDamageEvents,
    totalHealing,
    totalHealingEvents,
    totalLethalHits,
    deathWithoutObservedLethalHit,
  },

  distributions: {
    finalAgeMonths: stats(finalAges),
    deathAgeMonths: stats(deathAges),
    baselineHealth: stats(baselineHealthPerRun),
    finalHealthAll: stats(allFinalHealth),
    finalHealthSurvivors: stats(survivorFinalHealth),
    minimumHealthPerRun: stats(minimumHealthPerRun),
    damagePerRun: stats(damagePerRun),
    healingPerRun: stats(healingPerRun),
    damageEventsPerRun: stats(damageEventCountPerRun),

    firstBelow75AgeMonths: stats(firstBelow75Ages),
    firstBelow50AgeMonths: stats(firstBelow50Ages),
    firstBelow25AgeMonths: stats(firstBelow25Ages),
    firstZeroOrLessAgeMonths: stats(firstZeroOrLessAges),
  },

  damageByEventKind,
  damageByResolution,
  topDamageEvents: damageSourceRows(damageSources).slice(0, 40),
  topDamageResolutions: damageSourceRows(damageResolutionSources).slice(0, 50),
  lethalDamageSources: topEntries(lethalDamageSources, 30),
  deathResolutionSources: topEntries(deathResolutionSources, 30),

  normalizedContext: {
    byAgeYear: contextRows(byAgeYear),
    byAgeBand: contextRows(byAgeBand),
    byTravelState: contextRows(byTravelState),
    byCareer: contextRows(byCareer),
  },

  byRace: [...raceStats.entries()]
    .map(([id, value]) => ({
      raceId: id,
      runs: value.runs,
      deaths: value.deaths,
      deathPct: pct(value.deaths, value.runs),
      damagedRuns: value.damagedRuns,
      damagedRunsPct: pct(value.damagedRuns, value.runs),
      totalDamage: value.totalDamage,
      averageDamagePerRun: value.runs === 0 ? 0 : value.totalDamage / value.runs,
      baselineHealth: stats(value.baselineHealth),
      minimumHealth: stats(value.minimumHealth),
    }))
    .sort((a, b) => b.runs - a.runs || a.raceId.localeCompare(b.raceId)),

  terminationReasons,
  errors: topEntries(errors, 30),
};

console.log('OPFG Specialized Simulation — PLAYER HEALTH / MORTALITY v1.1');
console.log(`Policy: ${policy.id}`);
console.log(`Runs: ${args.runs}`);
console.log(`Deaths: ${deaths} (${pct(deaths, args.runs).toFixed(2)}%)`);
console.log(`Any HP loss: ${runsWithAnyDamage} (${pct(runsWithAnyDamage, args.runs).toFixed(2)}%)`);
console.log(
  `Below 75/50/25% baseline: `
  + `${runsBelow75} / ${runsBelow50} / ${runsBelow25} `
  + `(${pct(runsBelow75, args.runs).toFixed(1)}% / ${pct(runsBelow50, args.runs).toFixed(1)}% / ${pct(runsBelow25, args.runs).toFixed(1)}%)`,
);
console.log(
  `Final age p50/p90/max: `
  + `${quantile(finalAges, 0.50)} / ${quantile(finalAges, 0.90)} / ${safeMax(finalAges)}`,
);
console.log(
  `Death age p10/p50/p90: `
  + `${quantile(deathAges, 0.10)} / ${quantile(deathAges, 0.50)} / ${quantile(deathAges, 0.90)}`,
);
console.log(
  `Damage/run avg/p50/p90/max: `
  + `${average(damagePerRun).toFixed(2)} / ${quantile(damagePerRun, 0.50)} / ${quantile(damagePerRun, 0.90)} / ${safeMax(damagePerRun)}`,
);
console.log(
  `Minimum HP/run avg/p10/min: `
  + `${average(minimumHealthPerRun).toFixed(2)} / ${quantile(minimumHealthPerRun, 0.10)} / ${safeMin(minimumHealthPerRun)}`,
);

console.log('');
console.log('Top damage Events:');
for (const row of damageSourceRows(damageSources).slice(0, 15)) {
  console.log(
    `  ${row.eventId}: damage=${row.totalDamage} | hits=${row.hits} | `
    + `avg=${row.averageDamage.toFixed(2)} | lethal=${row.lethalHits}`,
  );
}

console.log('');
console.log('Lethal damage sources:');
for (const row of topEntries(lethalDamageSources, 15)) {
  console.log(`  ${row.key}: ${row.value}`);
}

console.log('');
console.log('Death resolution sources:');
for (const row of topEntries(deathResolutionSources, 15)) {
  console.log(`  ${row.key}: ${row.value}`);
}

writeJson(args.jsonPath, report);

function parseHealthPolicyArgs(values: string[]): {
  policyId: HealthPolicyId;
  remainingArgs: string[];
} {
  let policyId: HealthPolicyId = 'random';
  const remainingArgs: string[] = [];

  for (let index = 0; index < values.length; index += 1) {
    if (values[index] !== '--policy') {
      remainingArgs.push(values[index]);
      continue;
    }

    const value = values[++index];
    if (value !== 'random' && value !== 'progression') {
      throw new Error('--policy for simulate-health must be "random" or "progression".');
    }
    policyId = value;
  }

  return { policyId, remainingArgs };
}

function getContext(map: Map<string, ContextStat>, key: string): ContextStat {
  let row = map.get(key);
  if (!row) {
    row = {
      events: 0,
      damageEvents: 0,
      totalDamage: 0,
      healingEvents: 0,
      totalHealing: 0,
      lethalHits: 0,
      deaths: 0,
      damagedRuns: new Set<number>(),
    };
    map.set(key, row);
  }
  return row;
}

function contextRows(map: Map<string, ContextStat>) {
  return [...map.entries()]
    .map(([key, value]) => ({
      key,
      events: value.events,
      damageEvents: value.damageEvents,
      damagingEventPct: pct(value.damageEvents, value.events),
      totalDamage: value.totalDamage,
      damagePer100Events: value.events === 0 ? 0 : value.totalDamage / value.events * 100,
      averageDamagePerDamagingEvent: value.damageEvents === 0 ? 0 : value.totalDamage / value.damageEvents,
      healingEvents: value.healingEvents,
      totalHealing: value.totalHealing,
      lethalHits: value.lethalHits,
      deaths: value.deaths,
      uniqueRunsDamaged: value.damagedRuns.size,
    }))
    .sort((a, b) => numericKey(a.key) - numericKey(b.key) || a.key.localeCompare(b.key));
}

function addDamageSource(
  map: Map<string, DamageSourceStat>,
  key: string,
  damage: number,
  delta: number,
  lethal: boolean,
) {
  const row = getDamageSource(map, key);
  row.hits += 1;
  row.totalDamage += damage;
  row.minDelta = Math.min(row.minDelta, delta);
  if (lethal) row.lethalHits += 1;
}

function getDamageSource(map: Map<string, DamageSourceStat>, key: string): DamageSourceStat {
  let row = map.get(key);
  if (!row) {
    row = { hits: 0, totalDamage: 0, lethalHits: 0, deathResolutions: 0, minDelta: 0 };
    map.set(key, row);
  }
  return row;
}

function damageSourceRows(map: Map<string, DamageSourceStat>) {
  return [...map.entries()]
    .map(([eventId, value]) => ({
      eventId,
      ...value,
      averageDamage: value.hits === 0 ? 0 : value.totalDamage / value.hits,
    }))
    .sort((a, b) => b.totalDamage - a.totalDamage || b.lethalHits - a.lethalHits || a.eventId.localeCompare(b.eventId));
}

function getRaceStat(id: string): RaceStat {
  let row = raceStats.get(id);
  if (!row) {
    row = {
      runs: 0,
      deaths: 0,
      damagedRuns: 0,
      totalDamage: 0,
      baselineHealth: [],
      finalHealth: [],
      minimumHealth: [],
    };
    raceStats.set(id, row);
  }
  return row;
}

function ageBand(ageMonths: number): string {
  const years = ageMonths / 12;
  if (years < 15) return '<15';
  if (years < 18) return '15-17';
  if (years < 21) return '18-20';
  if (years < 26) return '21-25';
  if (years < 36) return '26-35';
  return '36+';
}

function numericKey(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function stats(values: number[]) {
  return {
    count: values.length,
    average: average(values),
    p10: quantile(values, 0.10),
    p50: quantile(values, 0.50),
    p90: quantile(values, 0.90),
    p99: quantile(values, 0.99),
    min: values.length ? safeMin(values) : null,
    max: values.length ? safeMax(values) : null,
  };
}

function safeMin(values: number[]): number {
  return values.length === 0
    ? 0
    : values.reduce((min, value) => Math.min(min, value), Number.POSITIVE_INFINITY);
}

function safeMax(values: number[]): number {
  return values.length === 0
    ? 0
    : values.reduce((max, value) => Math.max(max, value), Number.NEGATIVE_INFINITY);
}
