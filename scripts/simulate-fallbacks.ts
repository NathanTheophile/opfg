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
  topEntries,
  writeJson,
} from './simulation-specialized/shared';

const FALLBACK_LAND = 'dead_end_on_land';
const FALLBACK_SEA = 'dead_end_at_sea';
const FALLBACK_IDS = new Set([FALLBACK_LAND, FALLBACK_SEA]);

const args = parseSpecializedArgs(process.argv.slice(2), 'reports/sim-fallbacks.json');
const catalog = loadValidatedCatalog();
const startedAt = performance.now();

type CounterMap = Record<string, number>;

type ContextStat = {
  occurrences: number;
  runs: Set<number>;
  rootSlots: number;
};

type EpisodeStep = {
  eventId: string;
  ageMonths: number;
  beforeLocationId: string;
  beforeSeaId: string;
  beforeTravelState: string;
  afterLocationId: string;
  afterSeaId: string;
  afterTravelState: string;
  career: string;
  shipId: string | null;
};

type Episode = {
  seed: number;
  startAgeMonths: number;
  endAgeMonths: number;
  length: number;
  fallbackLand: number;
  fallbackSea: number;
  startLocationId: string;
  startSeaId: string;
  startTravelState: string;
  startCareer: string;
  uniqueLocations: Set<string>;
  uniqueSeas: Set<string>;
  repeatedStateCount: number;
  alternations: number;
  previousFallbackId: string | null;
  seenStateKeys: Set<string>;
  transitionCounts: CounterMap;
  firstSteps: EpisodeStep[];
  lastSteps: EpisodeStep[];
};

const maxStreakPerRun: number[] = [];
const episodeCountPerRun: number[] = [];
const episodesPerActiveYear: number[] = [];
const episodeLengths: number[] = [];
const recoveredEpisodeLengths: number[] = [];
const terminalEpisodeLengths: number[] = [];
const episodeStartIntervalsMonths: number[] = [];
const firstEpisodeAgeMonths: number[] = [];

const episodeLengthHistogram: CounterMap = {};
const fallbackPairTransitions: CounterMap = {};
const fallbackExitTransitions: CounterMap = {};
const recoveryEvents: CounterMap = {};
const terminationReasons: CounterMap = {};
const errors: CounterMap = {};
const safetyLimitTerminalStreaks: number[] = [];
const simulationErrorTerminalStreaks: number[] = [];

const ageYearStats = new Map<string, ContextStat>();
const ageBandStats = new Map<string, ContextStat>();
const careerStats = new Map<string, ContextStat>();
const seaStats = new Map<string, ContextStat>();
const travelStats = new Map<string, ContextStat>();
const locationStats = new Map<string, ContextStat>();

// "Where does dead_end_at_sea send me, and does real content resume there?"
type DestinationStat = {
  arrivals: number;
  runs: Set<number>;
  nextMeaningfulFallback: number;
  nextMeaningfulRealContent: number;
  nextMeaningfulTermination: number;
};
const seaFallbackDestinations = new Map<string, DestinationStat>();

let totalFallbacks = 0;
let totalEpisodes = 0;
let recoveredEpisodes = 0;
let terminalEpisodes = 0;
let isolatedEpisodes = 0;
let episodes2Plus = 0;
let episodes3Plus = 0;
let episodes5Plus = 0;
let episodes10Plus = 0;
let episodes25Plus = 0;
let episodes50Plus = 0;
let episodes100Plus = 0;
let episodes250Plus = 0;
let episodesWithRepeatedState = 0;
let fallbackOccurrencesInside5PlusEpisodes = 0;
let fallbackOccurrencesInside10PlusEpisodes = 0;
let safetyLimits = 0;
let safetyLimitsDuringFallbackEpisode = 0;
let simulationErrors = 0;
let simulationErrorsDuringFallbackEpisode = 0;

const longestEpisodes: Array<Record<string, unknown>> = [];

for (let runIndex = 0; runIndex < args.runs; runIndex += 1) {
  const seed = (args.seed + runIndex) >>> 0;

  let activeEpisode: Episode | null = null;
  let previousFallbackStep: EpisodeStep | null = null;
  let previousEpisodeStartAge: number | null = null;
  let runEpisodeCount = 0;
  let runMaxStreak = 0;
  let maxAgeMonths = 0;
  let activeReached = false;

  // Per-run exposure sets are maintained by ContextStat.runs.
  const observer: SimulationObserver = {
    onInitialState(state) {
      maxAgeMonths = Math.max(maxAgeMonths, state.ageMonths);
      activeReached ||= state.careerPhase === 'active';
    },

    onNavigationResolved(entry) {
      maxAgeMonths = Math.max(maxAgeMonths, entry.afterState.ageMonths);
      activeReached ||= entry.afterState.careerPhase === 'active';
    },

    onEventResolved(entry) {
      const before = entry.beforeState;
      const after = entry.afterState;
      maxAgeMonths = Math.max(maxAgeMonths, after.ageMonths);
      activeReached ||= after.careerPhase === 'active';

      // We define a meaningful root slot as Normal or Scheduled.
      // Critical and Immediate may interrupt an episode but do not count as recovery.
      const meaningfulRoot = entry.event.kind === 'normal' || entry.event.kind === 'scheduled';
      if (!meaningfulRoot) return;

      const isFallback = FALLBACK_IDS.has(entry.event.id);
      recordExposure(before, isFallback, seed);

      // Resolve what happened AFTER the previous fallback on the next meaningful root.
      if (previousFallbackStep !== null) {
        const from = previousFallbackStep;
        const transitionKey =
          `${from.eventId}@${from.afterLocationId}/${from.afterTravelState}` +
          ` -> ${entry.event.id}@${before.locationId}/${before.travelState}`;
        inc(fallbackExitTransitions, transitionKey);

        if (from.eventId === FALLBACK_SEA) {
          const destinationKey = `${from.afterSeaId}:${from.afterLocationId}`;
          const dest = getDestination(destinationKey);
          if (isFallback) dest.nextMeaningfulFallback += 1;
          else dest.nextMeaningfulRealContent += 1;
        }

        previousFallbackStep = null;
      }

      if (!isFallback) {
        if (activeEpisode !== null) {
          inc(recoveryEvents, entry.event.id);
          closeEpisode(activeEpisode, true, {
            recoveryEventId: entry.event.id,
            recoveryKind: entry.event.kind,
            recoveryLocationId: before.locationId,
            recoveryTravelState: before.travelState,
          });
          activeEpisode = null;
        }
        return;
      }

      totalFallbacks += 1;

      if (activeEpisode === null) {
        activeEpisode = createEpisode(seed, before);
        totalEpisodes += 1;
        runEpisodeCount += 1;

        if (previousEpisodeStartAge !== null) {
          episodeStartIntervalsMonths.push(Math.max(0, before.ageMonths - previousEpisodeStartAge));
        } else {
          firstEpisodeAgeMonths.push(before.ageMonths);
        }
        previousEpisodeStartAge = before.ageMonths;
      }

      const step = makeStep(entry.event.id, before, after);
      appendStep(activeEpisode, step);
      previousFallbackStep = step;

      if (entry.event.id === FALLBACK_SEA) {
        const destinationKey = `${step.afterSeaId}:${step.afterLocationId}`;
        const dest = getDestination(destinationKey);
        dest.arrivals += 1;
        dest.runs.add(seed);
      }

      runMaxStreak = Math.max(runMaxStreak, activeEpisode.length);
    },

    onTermination({ state, reason, error }) {
      maxAgeMonths = Math.max(maxAgeMonths, state.ageMonths);
      inc(terminationReasons, reason);

      if (reason === 'safetyLimit') {
        safetyLimits += 1;
        if (activeEpisode !== null) {
          safetyLimitsDuringFallbackEpisode += 1;
          safetyLimitTerminalStreaks.push(activeEpisode.length);
        }
      }

      if (reason === 'simulationError') {
        simulationErrors += 1;
        if (error) inc(errors, error);
        if (activeEpisode !== null) {
          simulationErrorsDuringFallbackEpisode += 1;
          simulationErrorTerminalStreaks.push(activeEpisode.length);
        }
      }

      if (previousFallbackStep?.eventId === FALLBACK_SEA) {
        const destinationKey = `${previousFallbackStep.afterSeaId}:${previousFallbackStep.afterLocationId}`;
        getDestination(destinationKey).nextMeaningfulTermination += 1;
      }

      if (activeEpisode !== null) {
        closeEpisode(activeEpisode, false, {
          terminationReason: reason,
          terminalLocationId: state.locationId,
          terminalTravelState: state.travelState,
          terminalEventId: state.currentEventId,
          ...(error ? { error } : {}),
        });
        activeEpisode = null;
      }
    },
  };

  simulateObservedRun({
    seed,
    catalog,
    maxResolvedEvents: args.maxEvents,
    observer,
  });

  maxStreakPerRun.push(runMaxStreak);
  episodeCountPerRun.push(runEpisodeCount);

  if (activeReached && maxAgeMonths > 180) {
    const activeYears = Math.max(1 / 12, (maxAgeMonths - 180) / 12);
    episodesPerActiveYear.push(runEpisodeCount / activeYears);
  }
}

const streakThresholds = [2, 3, 5, 10, 25, 50, 100, 250];
const runsByMaxStreakThreshold = Object.fromEntries(
  streakThresholds.map((threshold) => {
    const count = maxStreakPerRun.filter((value) => value >= threshold).length;
    return [`${threshold}+`, { runs: count, pct: pct(count, args.runs) }];
  }),
);

const seaDestinationRows = [...seaFallbackDestinations.entries()]
  .map(([destination, value]) => {
    const evaluated = value.nextMeaningfulFallback + value.nextMeaningfulRealContent;
    return {
      destination,
      arrivals: value.arrivals,
      uniqueRuns: value.runs.size,
      nextMeaningfulFallback: value.nextMeaningfulFallback,
      nextMeaningfulRealContent: value.nextMeaningfulRealContent,
      nextMeaningfulTermination: value.nextMeaningfulTermination,
      evaluatedNextMeaningfulRoots: evaluated,
      immediateRecoveryPct: pct(value.nextMeaningfulRealContent, evaluated),
      immediateRefallbackPct: pct(value.nextMeaningfulFallback, evaluated),
    };
  })
  .sort((a, b) => b.arrivals - a.arrivals || a.destination.localeCompare(b.destination));

const report = {
  telemetryVersion: '2.0',
  config: args,
  elapsedMs: performance.now() - startedAt,

  summary: {
    runs: args.runs,
    totalFallbacks,
    totalEpisodes,
    avgFallbacksPerRun: totalFallbacks / args.runs,
    avgEpisodesPerRun: average(episodeCountPerRun),
    avgEpisodesPerActiveYear: average(episodesPerActiveYear),

    isolatedEpisodes,
    isolatedEpisodesPct: pct(isolatedEpisodes, totalEpisodes),
    recoveredEpisodes,
    recoveredEpisodesPct: pct(recoveredEpisodes, totalEpisodes),
    terminalEpisodes,
    terminalEpisodesPct: pct(terminalEpisodes, totalEpisodes),

    maxStreakObserved: maxStreakPerRun.reduce((max, value) => Math.max(max, value), 0),    maxStreakP50: quantile(maxStreakPerRun, 0.50),
    maxStreakP90: quantile(maxStreakPerRun, 0.90),
    maxStreakP95: quantile(maxStreakPerRun, 0.95),
    maxStreakP99: quantile(maxStreakPerRun, 0.99),
    runsByMaxStreakThreshold,

    episodeLengthP50: quantile(episodeLengths, 0.50),
    episodeLengthP90: quantile(episodeLengths, 0.90),
    episodeLengthP99: quantile(episodeLengths, 0.99),
    episodeLengthMax: episodeLengths.reduce((max, value) => Math.max(max, value), 0),

    fallbackOccurrencesInside5PlusEpisodes,
    fallbackOccurrencesInside5PlusEpisodesPct: pct(fallbackOccurrencesInside5PlusEpisodes, totalFallbacks),
    fallbackOccurrencesInside10PlusEpisodes,
    fallbackOccurrencesInside10PlusEpisodesPct: pct(fallbackOccurrencesInside10PlusEpisodes, totalFallbacks),

    episodesWithRepeatedState,
    episodesWithRepeatedStatePct: pct(episodesWithRepeatedState, totalEpisodes),

    firstEpisodeAgeMonths: stats(firstEpisodeAgeMonths),
    intervalBetweenEpisodeStartsMonths: stats(episodeStartIntervalsMonths),

    safetyLimits,
    safetyLimitsDuringFallbackEpisode,
    safetyLimitsDuringFallbackEpisodePct: pct(safetyLimitsDuringFallbackEpisode, safetyLimits),
    safetyLimitTerminalStreak: stats(safetyLimitTerminalStreaks),

    simulationErrors,
    simulationErrorsDuringFallbackEpisode,
    simulationErrorsDuringFallbackEpisodePct: pct(simulationErrorsDuringFallbackEpisode, simulationErrors),
    simulationErrorTerminalStreak: stats(simulationErrorTerminalStreaks),
  },

  episodeLengthHistogram,
  fallbackPairTransitions: topEntries(fallbackPairTransitions, 30),
  fallbackExitTransitions: topEntries(fallbackExitTransitions, 50),
  recoveryEvents: topEntries(recoveryEvents, 40),

  // This is the direct answer to "dead_end_at_sea sends me where, and do I recover?"
  seaFallbackDestinations: seaDestinationRows,

  normalizedContext: {
    byAgeYear: contextRows(ageYearStats),
    byAgeBand: contextRows(ageBandStats),
    byCareer: contextRows(careerStats),
    bySea: contextRows(seaStats),
    byTravelState: contextRows(travelStats),
    topLocationsByOccurrences: contextRows(locationStats)
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 60),
    topLocationsByFallbackRate: contextRows(locationStats)
      .filter((row) => row.rootSlots >= 25)
      .sort((a, b) => b.fallbackRatePer100RootSlots - a.fallbackRatePer100RootSlots)
      .slice(0, 60),
  },

  terminationReasons,
  errors: topEntries(errors, 30),

  // Only compact summaries of the worst episodes; never every GameState.
  longestEpisodes,
};

console.log('OPFG Specialized Simulation — FALLBACK LOOPS / RECOVERY v2.0');
console.log(`Runs: ${args.runs}`);
console.log(`Fallback occurrences: ${totalFallbacks} | episodes: ${totalEpisodes}`);
console.log(`Episodes/run: ${average(episodeCountPerRun).toFixed(2)} | episodes/Active-year: ${average(episodesPerActiveYear).toFixed(2)}`);
console.log(`Max streak p50/p90/p99/max: ${quantile(maxStreakPerRun, 0.50)} / ${quantile(maxStreakPerRun, 0.90)} / ${quantile(maxStreakPerRun, 0.99)} / ${maxStreakPerRun.reduce((max, value) => Math.max(max, value), 0)}`);
for (const threshold of streakThresholds) {
  const row = runsByMaxStreakThreshold[`${threshold}+`];
  console.log(`Runs with streak >= ${String(threshold).padStart(3)}: ${row.runs} (${row.pct.toFixed(2)}%)`);
}
console.log(`Safety limits during fallback episode: ${safetyLimitsDuringFallbackEpisode}/${safetyLimits}`);
console.log(`Fallback occurrences inside 10+ episodes: ${fallbackOccurrencesInside10PlusEpisodes} (${pct(fallbackOccurrencesInside10PlusEpisodes, totalFallbacks).toFixed(1)}%)`);

console.log('');
console.log('Top dead_end_at_sea destinations:');
for (const row of seaDestinationRows.slice(0, 15)) {
  console.log(
    `${row.destination}: arrivals ${row.arrivals} | ` +
    `recover ${row.immediateRecoveryPct.toFixed(1)}% | ` +
    `refallback ${row.immediateRefallbackPct.toFixed(1)}%`
  );
}

writeJson(args.jsonPath, report);

function recordExposure(state: GameState, isFallback: boolean, seed: number) {
  const seaId = locationSeaId(state.locationId);
  const year = Math.floor(state.ageMonths / 12);
  const band = ageBand(state.ageMonths);
  const career = state.player.career.affiliationId;

  updateContext(ageYearStats, String(year), isFallback, seed);
  updateContext(ageBandStats, band, isFallback, seed);
  updateContext(careerStats, career, isFallback, seed);
  updateContext(seaStats, seaId, isFallback, seed);
  updateContext(travelStats, state.travelState, isFallback, seed);
  updateContext(locationStats, state.locationId, isFallback, seed);
}

function updateContext(map: Map<string, ContextStat>, key: string, fallback: boolean, seed: number) {
  let row = map.get(key);
  if (!row) {
    row = { occurrences: 0, runs: new Set<number>(), rootSlots: 0 };
    map.set(key, row);
  }

  row.rootSlots += 1;
  if (fallback) {
    row.occurrences += 1;
    row.runs.add(seed);
  }
}

function contextRows(map: Map<string, ContextStat>) {
  return [...map.entries()]
    .map(([key, value]) => ({
      key,
      occurrences: value.occurrences,
      uniqueRunsWithFallback: value.runs.size,
      rootSlots: value.rootSlots,
      fallbackRatePer100RootSlots: value.rootSlots === 0 ? 0 : value.occurrences / value.rootSlots * 100,
    }))
    .sort((a, b) => Number(a.key) - Number(b.key) || a.key.localeCompare(b.key));
}

function createEpisode(seed: number, state: GameState): Episode {
  return {
    seed,
    startAgeMonths: state.ageMonths,
    endAgeMonths: state.ageMonths,
    length: 0,
    fallbackLand: 0,
    fallbackSea: 0,
    startLocationId: state.locationId,
    startSeaId: locationSeaId(state.locationId),
    startTravelState: state.travelState,
    startCareer: state.player.career.affiliationId,
    uniqueLocations: new Set<string>(),
    uniqueSeas: new Set<string>(),
    repeatedStateCount: 0,
    alternations: 0,
    previousFallbackId: null,
    seenStateKeys: new Set<string>(),
    transitionCounts: {},
    firstSteps: [],
    lastSteps: [],
  };
}

function makeStep(eventId: string, before: GameState, after: GameState): EpisodeStep {
  return {
    eventId,
    ageMonths: before.ageMonths,
    beforeLocationId: before.locationId,
    beforeSeaId: locationSeaId(before.locationId),
    beforeTravelState: before.travelState,
    afterLocationId: after.locationId,
    afterSeaId: locationSeaId(after.locationId),
    afterTravelState: after.travelState,
    career: before.player.career.affiliationId,
    shipId: before.ship?.shipId ?? null,
  };
}

function appendStep(episode: Episode, step: EpisodeStep) {
  episode.length += 1;
  episode.endAgeMonths = step.ageMonths;
  episode.uniqueLocations.add(step.beforeLocationId);
  episode.uniqueLocations.add(step.afterLocationId);
  episode.uniqueSeas.add(step.beforeSeaId);
  episode.uniqueSeas.add(step.afterSeaId);

  if (step.eventId === FALLBACK_LAND) episode.fallbackLand += 1;
  if (step.eventId === FALLBACK_SEA) episode.fallbackSea += 1;

  if (episode.previousFallbackId !== null) {
    inc(fallbackPairTransitions, `${episode.previousFallbackId}->${step.eventId}`);
    inc(episode.transitionCounts, `${episode.previousFallbackId}->${step.eventId}`);
    if (episode.previousFallbackId !== step.eventId) episode.alternations += 1;
  }
  episode.previousFallbackId = step.eventId;

  const stateKey =
    `${step.eventId}|${step.beforeSeaId}|${step.beforeLocationId}|${step.beforeTravelState}` +
    `>${step.afterSeaId}|${step.afterLocationId}|${step.afterTravelState}`;
  if (episode.seenStateKeys.has(stateKey)) episode.repeatedStateCount += 1;
  episode.seenStateKeys.add(stateKey);

  if (episode.firstSteps.length < 12) episode.firstSteps.push(step);
  episode.lastSteps.push(step);
  if (episode.lastSteps.length > 12) episode.lastSteps.shift();
}

function closeEpisode(episode: Episode, recovered: boolean, ending: Record<string, unknown>) {
  episodeLengths.push(episode.length);
  inc(episodeLengthHistogram, episode.length >= 100 ? '100+' : String(episode.length));

  if (episode.length === 1) isolatedEpisodes += 1;
  if (episode.length >= 2) episodes2Plus += 1;
  if (episode.length >= 3) episodes3Plus += 1;
  if (episode.length >= 5) {
    episodes5Plus += 1;
    fallbackOccurrencesInside5PlusEpisodes += episode.length;
  }
  if (episode.length >= 10) {
    episodes10Plus += 1;
    fallbackOccurrencesInside10PlusEpisodes += episode.length;
  }
  if (episode.length >= 25) episodes25Plus += 1;
  if (episode.length >= 50) episodes50Plus += 1;
  if (episode.length >= 100) episodes100Plus += 1;
  if (episode.length >= 250) episodes250Plus += 1;

  if (episode.repeatedStateCount > 0) episodesWithRepeatedState += 1;

  if (recovered) {
    recoveredEpisodes += 1;
    recoveredEpisodeLengths.push(episode.length);
  } else {
    terminalEpisodes += 1;
    terminalEpisodeLengths.push(episode.length);
  }

  const summary = {
    seed: episode.seed,
    length: episode.length,
    startAgeMonths: episode.startAgeMonths,
    endAgeMonths: episode.endAgeMonths,
    spanMonths: episode.endAgeMonths - episode.startAgeMonths,
    fallbackLand: episode.fallbackLand,
    fallbackSea: episode.fallbackSea,
    alternations: episode.alternations,
    startLocationId: episode.startLocationId,
    startSeaId: episode.startSeaId,
    startTravelState: episode.startTravelState,
    startCareer: episode.startCareer,
    uniqueLocations: episode.uniqueLocations.size,
    uniqueSeas: episode.uniqueSeas.size,
    repeatedStateCount: episode.repeatedStateCount,
    pairTransitions: topEntries(episode.transitionCounts, 10),
    firstSteps: episode.firstSteps,
    lastSteps: episode.lastSteps,
    recovered,
    ...ending,
  };

  longestEpisodes.push(summary);
  longestEpisodes.sort((a, b) => Number(b.length) - Number(a.length));
  if (longestEpisodes.length > 30) longestEpisodes.length = 30;
}

function getDestination(key: string): DestinationStat {
  let row = seaFallbackDestinations.get(key);
  if (!row) {
    row = {
      arrivals: 0,
      runs: new Set<number>(),
      nextMeaningfulFallback: 0,
      nextMeaningfulRealContent: 0,
      nextMeaningfulTermination: 0,
    };
    seaFallbackDestinations.set(key, row);
  }
  return row;
}

function locationSeaId(locationId: string): string {
  return catalog.locations.find((location) => location.id === locationId)?.seaId ?? 'unknown';
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

function stats(values: number[]) {
  return {
    count: values.length,
    average: average(values),
    p10: quantile(values, 0.10),
    p50: quantile(values, 0.50),
    p90: quantile(values, 0.90),
    p99: quantile(values, 0.99),
    min: values.length ? values.reduce((min, value) => Math.min(min, value), Infinity) : null,
    max: values.length ? values.reduce((max, value) => Math.max(max, value), -Infinity) : null,
  };
}
