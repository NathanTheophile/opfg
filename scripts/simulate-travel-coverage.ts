import { performance } from 'node:perf_hooks';
import type { GameState } from '../src/game/model/schema';
import type { SimulationObserver } from '../src/game/simulation/observation';
import { simulateObservedRun } from '../src/game/simulation/simulateObservedRun';
import { progressionSimulationPolicy } from '../src/game/simulation/simulationPolicy';
import { activeParadiseRouteId } from '../src/game/engine/maritime';
import {
  REVERSE_MOUNTAIN_NAVIGATOR_OVERRIDE_FLAG,
  REVERSE_MOUNTAIN_ROOT_IDS,
} from '../src/game/engine/reverseMountain';
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

const LAND_FALLBACK = 'dead_end_on_land';
const SEA_FALLBACK = 'dead_end_at_sea';
const SABAODY_RED_LINE_PASSAGE_EVENT_ID = 'active_sabaody_red_line_passage';
const REVERSE_MOUNTAIN_LOCATION_ID = 'reverse_mountain';
const TWIN_CAPES_LOCATION_ID = 'twin_capes';
const THRILLER_BARK_LOCATION_ID = 'thriller_bark';
const SABAODY_LOCATION_ID = 'sabaody_archipelago';
const FISH_MAN_ISLAND_LOCATION_ID = 'fish_man_island';
const BLUE_SEAS = new Set(['east_blue', 'west_blue', 'north_blue', 'south_blue']);

const args = parseSpecializedArgs(process.argv.slice(2), 'reports/sim-travel-coverage.json');
const catalog = loadValidatedCatalog();
const startedAt = performance.now();
const locationById = new Map<string, (typeof catalog.locations)[number]>(
  catalog.locations.map((location) => [location.id, location]),
);

type Counter = Record<string, number>;

type MilestoneKey =
  | 'reverseMountainAttempted'
  | 'reverseMountainReached'
  | 'reverseMountainPassed'
  | 'paradiseReached'
  | 'thrillerBarkReached'
  | 'sabaodyReached'
  | 'sabaodyPassageStarted'
  | 'fishManIslandReached'
  | 'newWorldReached';

type MilestoneSnapshot = {
  ageMonths: number;
  order: number;
  locationId: string;
  seaId: string;
};

type RunMilestones = Partial<Record<MilestoneKey, MilestoneSnapshot>>;

type FunnelStage =
  | 'blues_only'
  | 'reverse_mountain_attempted_not_reached'
  | 'reverse_mountain_reached_not_passed'
  | 'paradise_before_sabaody'
  | 'sabaody_before_fish_man_island'
  | 'fish_man_island_before_new_world'
  | 'new_world';

const milestoneKeys: MilestoneKey[] = [
  'reverseMountainAttempted',
  'reverseMountainReached',
  'reverseMountainPassed',
  'paradiseReached',
  'thrillerBarkReached',
  'sabaodyReached',
  'sabaodyPassageStarted',
  'fishManIslandReached',
  'newWorldReached',
];

const fallbackPerRun: number[] = [];
const firstFallbackAges: number[] = [];
const uniqueLocationsPerRun: number[] = [];
const seaEventsPerRun: number[] = [];
const landEventsPerRun: number[] = [];
const travelTransitionsPerRun: number[] = [];
const fallbackByLocation: Counter = {};
const fallbackBySea: Counter = {};
const fallbackByCareer: Counter = {};
const fallbackByAgeBand: Counter = {};
const fallbackByTravel: Counter = {};
const normalEventsByCareer: Counter = {};
const locationVisits: Counter = {};
const transitionSources: Counter = {};
const terminationReasons: Counter = {};
const careerEndReasons: Counter = {};
const endings: Counter = {};
const errors: Counter = {};
const longFallbackStreakSamples: unknown[] = [];

const milestoneCounts: Counter = {};
const milestoneAges: Record<MilestoneKey, number[]> = Object.fromEntries(
  milestoneKeys.map((key) => [key, [] as number[]]),
) as Record<MilestoneKey, number[]>;
const finalLocations: Counter = {};
const finalSeas: Counter = {};
const finalRegions: Counter = {};
const furthestStages: Counter = {};
const deathsByFurthestStage: Counter = {};
const deathsByFinalLocation: Counter = {};
const deathsByFinalSea: Counter = {};
const reverseMountainAttemptSourceEvents: Counter = {};
const reverseMountainAttemptMethods: Counter = {};
const paradiseRoutes: Counter = {};
const progressionAnomalies: Counter = {};
const runOutcomes: unknown[] = [];

const routeFunnel = new Map<string, {
  selected: number;
  reachedSabaody: number;
  reachedFishManIsland: number;
  reachedNewWorld: number;
  deaths: number;
}>();

let totalFallbacks = 0;
let runsWithFallback = 0;
let runsWith10PlusFallback = 0;
let maxFallbackStreakObserved = 0;
let runsEverAtSeaWithoutShip = 0;
let runsStayedInBlues = 0;
let runsNeverAttemptedReverseMountain = 0;
let runsNeverPassedReverseMountain = 0;
let runsReachedThrillerBark = 0;
let runsReachedSabaodyAfterThrillerBark = 0;
let playerDeaths = 0;

for (let index = 0; index < args.runs; index += 1) {
  const seed = (args.seed + index) >>> 0;
  const visited = new Set<string>();
  const milestones: RunMilestones = {};
  let fallbacks = 0;
  let firstFallback: number | null = null;
  let seaEvents = 0;
  let landEvents = 0;
  let transitions = 0;
  let fallbackStreak = 0;
  let maxFallbackStreak = 0;
  let seaWithoutShip = false;
  let observationOrder = 0;
  let reverseMountainAttemptSourceEventId: string | null = null;
  let reverseMountainAttemptMethod: 'navigator_override' | 'ordinary' | null = null;

  const markMilestone = (key: MilestoneKey, state: GameState) => {
    if (milestones[key] !== undefined) return;
    const seaId = seaIdOf(state.locationId);
    milestones[key] = {
      ageMonths: state.ageMonths,
      order: observationOrder,
      locationId: state.locationId,
      seaId,
    };
  };

  const recordState = (state: GameState) => {
    observationOrder += 1;
    visited.add(state.locationId);
    if (state.travelState === 'at_sea' && state.ship === null) seaWithoutShip = true;

    const seaId = seaIdOf(state.locationId);
    if (state.locationId === REVERSE_MOUNTAIN_LOCATION_ID) {
      markMilestone('reverseMountainReached', state);
    }
    if (state.locationId === TWIN_CAPES_LOCATION_ID) {
      markMilestone('reverseMountainPassed', state);
      markMilestone('paradiseReached', state);
    }
    if (seaId === 'grand_line_paradise') {
      markMilestone('paradiseReached', state);
    }
    if (isWithinLocation(state.locationId, THRILLER_BARK_LOCATION_ID)) {
      markMilestone('thrillerBarkReached', state);
    }
    if (isWithinLocation(state.locationId, SABAODY_LOCATION_ID)) {
      markMilestone('sabaodyReached', state);
    }
    if (isWithinLocation(state.locationId, FISH_MAN_ISLAND_LOCATION_ID)) {
      markMilestone('fishManIslandReached', state);
    }
    if (seaId === 'new_world') {
      markMilestone('newWorldReached', state);
    }
  };

  const observer: SimulationObserver = {
    onInitialState(state) {
      recordState(state);
    },
    onNavigationResolved(entry) {
      recordState(entry.beforeState);
      recordState(entry.afterState);
      if (entry.beforeState.locationId !== entry.afterState.locationId) {
        inc(locationVisits, entry.afterState.locationId);
      }
      if (entry.beforeState.travelState !== entry.afterState.travelState) {
        transitions += 1;
        inc(transitionSources, `navigation:${entry.choice}`);
      }
    },
    onEventResolved(entry) {
      const before = entry.beforeState;
      const after = entry.afterState;
      recordState(before);

      if (REVERSE_MOUNTAIN_ROOT_IDS.has(entry.event.id)) {
        markMilestone('reverseMountainAttempted', before);
        if (reverseMountainAttemptSourceEventId === null) {
          reverseMountainAttemptSourceEventId = entry.event.id;
          reverseMountainAttemptMethod = before.flags.includes(REVERSE_MOUNTAIN_NAVIGATOR_OVERRIDE_FLAG)
            ? 'navigator_override'
            : 'ordinary';
        }
      }

      if (entry.event.id === SABAODY_RED_LINE_PASSAGE_EVENT_ID) {
        markMilestone('sabaodyPassageStarted', before);
      }

      recordState(after);

      if (before.locationId !== after.locationId) {
        inc(locationVisits, after.locationId);
      }

      if (before.travelState !== after.travelState) {
        transitions += 1;
        inc(transitionSources, `event:${entry.event.id}`);
      }

      if (entry.event.kind === 'normal') {
        inc(normalEventsByCareer, after.player.career.affiliationId);
      }

      if (after.travelState === 'at_sea') seaEvents += 1;
      else landEvents += 1;

      const isFallback = entry.event.id === LAND_FALLBACK || entry.event.id === SEA_FALLBACK;
      if (isFallback) {
        fallbacks += 1;
        totalFallbacks += 1;
        fallbackStreak += 1;
        maxFallbackStreak = Math.max(maxFallbackStreak, fallbackStreak);
        if (firstFallback === null) firstFallback = after.ageMonths;
        inc(fallbackByLocation, before.locationId);
        inc(fallbackByCareer, before.player.career.affiliationId);
        inc(fallbackByAgeBand, ageBand(before.ageMonths));
        inc(fallbackByTravel, before.travelState);
        const seaId = seaIdOf(before.locationId);
        inc(fallbackBySea, seaId);

        if (fallbackStreak >= 5 && longFallbackStreakSamples.length < 30) {
          longFallbackStreakSamples.push({
            seed,
            streak: fallbackStreak,
            ageMonths: before.ageMonths,
            locationId: before.locationId,
            seaId,
            career: before.player.career.affiliationId,
            travelState: before.travelState,
            shipId: before.ship?.shipId ?? null,
          });
        }
      } else if (entry.event.kind !== 'critical' && entry.event.kind !== 'immediate') {
        fallbackStreak = 0;
      }
    },
    onTermination({ state, error }) {
      recordState(state);
      if (error) inc(errors, error);
    },
  };

  const result = simulateObservedRun({
    seed,
    catalog,
    maxResolvedEvents: args.maxEvents,
    observer,
    policy: progressionSimulationPolicy,
  });

  const finalState = result.finalState;
  recordState(finalState);

  fallbackPerRun.push(fallbacks);
  uniqueLocationsPerRun.push(visited.size);
  seaEventsPerRun.push(seaEvents);
  landEventsPerRun.push(landEvents);
  travelTransitionsPerRun.push(transitions);
  maxFallbackStreakObserved = Math.max(maxFallbackStreakObserved, maxFallbackStreak);
  if (fallbacks > 0) runsWithFallback += 1;
  if (fallbacks >= 10) runsWith10PlusFallback += 1;
  if (firstFallback !== null) firstFallbackAges.push(firstFallback);
  if (seaWithoutShip) runsEverAtSeaWithoutShip += 1;
  inc(terminationReasons, result.terminationReason);
  inc(careerEndReasons, finalState.careerEndReason ?? 'none');
  inc(endings, finalState.endingId ?? 'none');

  for (const key of milestoneKeys) {
    const milestone = milestones[key];
    if (milestone === undefined) continue;
    inc(milestoneCounts, key);
    milestoneAges[key].push(milestone.ageMonths);
  }

  if (milestones.reverseMountainReached === undefined) runsStayedInBlues += 1;
  if (milestones.reverseMountainAttempted === undefined) runsNeverAttemptedReverseMountain += 1;
  if (milestones.reverseMountainPassed === undefined) runsNeverPassedReverseMountain += 1;

  if (reverseMountainAttemptSourceEventId !== null) {
    inc(reverseMountainAttemptSourceEvents, reverseMountainAttemptSourceEventId);
  }
  if (reverseMountainAttemptMethod !== null) {
    inc(reverseMountainAttemptMethods, reverseMountainAttemptMethod);
  }

  const thrillerBark = milestones.thrillerBarkReached;
  const sabaody = milestones.sabaodyReached;
  if (thrillerBark !== undefined) {
    runsReachedThrillerBark += 1;
    if (sabaody !== undefined && sabaody.order > thrillerBark.order) {
      runsReachedSabaodyAfterThrillerBark += 1;
    }
  }

  if (milestones.paradiseReached !== undefined && milestones.reverseMountainPassed === undefined) {
    inc(progressionAnomalies, 'paradise_without_reverse_mountain_pass');
  }
  if (milestones.sabaodyReached !== undefined && milestones.paradiseReached === undefined) {
    inc(progressionAnomalies, 'sabaody_without_paradise');
  }
  if (milestones.fishManIslandReached !== undefined && milestones.sabaodyReached === undefined) {
    inc(progressionAnomalies, 'fish_man_island_without_sabaody');
  }
  if (milestones.newWorldReached !== undefined && milestones.fishManIslandReached === undefined) {
    inc(progressionAnomalies, 'new_world_without_fish_man_island');
  }
  if (thrillerBark !== undefined && sabaody !== undefined && sabaody.order <= thrillerBark.order) {
    inc(progressionAnomalies, 'thriller_bark_not_before_sabaody');
  }

  const finalSeaId = seaIdOf(finalState.locationId);
  const finalRegion = finalRegionOf(finalState.locationId);
  const furthestStage = furthestStageOf(milestones);
  inc(finalLocations, finalState.locationId);
  inc(finalSeas, finalSeaId);
  inc(finalRegions, finalRegion);
  inc(furthestStages, furthestStage);

  const died = finalState.careerEndReason === 'death';
  if (died) {
    playerDeaths += 1;
    inc(deathsByFurthestStage, furthestStage);
    inc(deathsByFinalLocation, finalState.locationId);
    inc(deathsByFinalSea, finalSeaId);
  }

  const routeId = activeParadiseRouteId(finalState);
  if (routeId !== undefined) {
    inc(paradiseRoutes, routeId);
    const route = getRouteFunnel(routeId);
    route.selected += 1;
    if (milestones.sabaodyReached !== undefined) route.reachedSabaody += 1;
    if (milestones.fishManIslandReached !== undefined) route.reachedFishManIsland += 1;
    if (milestones.newWorldReached !== undefined) route.reachedNewWorld += 1;
    if (died) route.deaths += 1;
  }

  runOutcomes.push({
    seed,
    terminationReason: result.terminationReason,
    careerEndReason: finalState.careerEndReason,
    endingId: finalState.endingId,
    died,
    finalAgeMonths: finalState.ageMonths,
    finalLocationId: finalState.locationId,
    finalSeaId,
    finalRegion,
    furthestStage,
    paradiseRouteId: routeId ?? null,
    reverseMountainAttemptSourceEventId,
    reverseMountainAttemptMethod,
    fallbacks,
    maxFallbackStreak,
    uniqueLocations: visited.size,
    milestones: Object.fromEntries(
      milestoneKeys.map((key) => [key, milestones[key] ?? null]),
    ),
  });
}

const report = {
  telemetryVersion: 'travel-world-funnel-v2',
  config: { ...args, policy: progressionSimulationPolicy.id },
  elapsedMs: performance.now() - startedAt,
  summary: {
    runs: args.runs,
    playerDeaths,
    playerDeathPct: pct(playerDeaths, args.runs),
    totalFallbacks,
    avgFallbacksPerRun: average(fallbackPerRun),
    fallbackP50: quantile(fallbackPerRun, 0.50),
    fallbackP90: quantile(fallbackPerRun, 0.90),
    fallbackP99: quantile(fallbackPerRun, 0.99),
    runsWithFallback,
    runsWithFallbackPct: pct(runsWithFallback, args.runs),
    runsWith10PlusFallback,
    maxFallbackStreakObserved,
    avgFirstFallbackAgeMonths: average(firstFallbackAges),
    firstFallbackAgeP50: quantile(firstFallbackAges, 0.50),
    avgUniqueLocationsPerRun: average(uniqueLocationsPerRun),
    uniqueLocationsP50: quantile(uniqueLocationsPerRun, 0.50),
    uniqueLocationsP90: quantile(uniqueLocationsPerRun, 0.90),
    avgSeaEventsPerRun: average(seaEventsPerRun),
    avgLandEventsPerRun: average(landEventsPerRun),
    avgTravelTransitionsPerRun: average(travelTransitionsPerRun),
    runsEverAtSeaWithoutShip,
  },
  worldFunnel: {
    semantics: {
      stayedInBlues: 'Run never reached the reverse_mountain Location.',
      reverseMountainAttempted: 'At least one authored Reverse Mountain approach root resolved.',
      reverseMountainReached: 'reverse_mountain Location was observed.',
      reverseMountainPassed: 'twin_capes Location was observed.',
      paradiseReached: 'twin_capes or any grand_line_paradise Location was observed.',
      thrillerBarkReached: 'thriller_bark or one of its runtime descendants was observed.',
      sabaodyReached: 'sabaody_archipelago or one of its runtime descendants was observed.',
      fishManIslandReached: 'fish_man_island or one of its runtime descendants was observed.',
      newWorldReached: 'Any Location whose seaId is new_world was observed.',
    },
    stayedInBlues: rateRow(runsStayedInBlues),
    neverAttemptedReverseMountain: rateRow(runsNeverAttemptedReverseMountain),
    neverPassedReverseMountain: rateRow(runsNeverPassedReverseMountain),
    milestones: Object.fromEntries(
      milestoneKeys.map((key) => [key, {
        ...rateRow(milestoneCounts[key] ?? 0),
        firstAgeMonths: distribution(milestoneAges[key]),
      }]),
    ),
    furthestStage: topEntries(furthestStages, 20),
    finalRegion: topEntries(finalRegions, 20),
    finalSea: topEntries(finalSeas, 20),
    finalLocation: topEntries(finalLocations, 60),
  },
  reverseMountain: {
    attemptSources: topEntries(reverseMountainAttemptSourceEvents, 20),
    attemptMethods: topEntries(reverseMountainAttemptMethods, 10),
  },
  paradise: {
    routeSelection: topEntries(paradiseRoutes, 20),
    routeFunnel: Object.fromEntries(
      [...routeFunnel.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([routeId, row]) => [routeId, {
          ...row,
          sabaodyPct: pct(row.reachedSabaody, row.selected),
          fishManIslandPct: pct(row.reachedFishManIsland, row.selected),
          newWorldPct: pct(row.reachedNewWorld, row.selected),
          deathPct: pct(row.deaths, row.selected),
        }]),
    ),
  },
  thrillerBarkToSabaody: {
    runsReachedThrillerBark,
    runsReachedSabaodyAfterThrillerBark,
    successPct: pct(runsReachedSabaodyAfterThrillerBark, runsReachedThrillerBark),
  },
  deathsByGeography: {
    total: playerDeaths,
    byFurthestStage: topEntries(deathsByFurthestStage, 20),
    byFinalSea: topEntries(deathsByFinalSea, 20),
    byFinalLocation: topEntries(deathsByFinalLocation, 60),
  },
  progressionAnomalies: topEntries(progressionAnomalies, 20),
  fallbackByAgeBand,
  fallbackByTravel,
  topFallbackLocations: topEntries(fallbackByLocation, 40),
  topFallbackSeas: topEntries(fallbackBySea, 20),
  topFallbackCareers: topEntries(fallbackByCareer, 20),
  normalEventsByCareer,
  topVisitedDestinationLocations: topEntries(locationVisits, 40),
  topTravelTransitionSources: topEntries(transitionSources, 40),
  terminationReasons,
  careerEndReasons,
  endings,
  errors: topEntries(errors),
  longFallbackStreakSamples,
  runOutcomes,
};

console.log('OPFG Specialized Simulation — TRAVEL / WORLD FUNNEL');
console.log(`Policy: ${progressionSimulationPolicy.id}`);
console.log(`Runs: ${args.runs}`);
console.log(`Deaths: ${playerDeaths} (${pct(playerDeaths, args.runs).toFixed(1)}%)`);
console.log(`Fallbacks/run avg/p50/p90: ${average(fallbackPerRun).toFixed(2)} / ${quantile(fallbackPerRun, 0.50)} / ${quantile(fallbackPerRun, 0.90)}`);
console.log(`Runs with fallback: ${runsWithFallback} (${pct(runsWithFallback, args.runs).toFixed(1)}%)`);
console.log(`Max fallback streak: ${maxFallbackStreakObserved}`);
console.log(`Avg unique Locations/run: ${average(uniqueLocationsPerRun).toFixed(2)}`);
console.log(`Avg sea/land events per run: ${average(seaEventsPerRun).toFixed(1)} / ${average(landEventsPerRun).toFixed(1)}`);
console.log('World funnel:');
console.log(`  Stayed in Blues:          ${formatRate(runsStayedInBlues)}`);
console.log(`  Reverse Mountain attempt: ${formatRate(milestoneCounts.reverseMountainAttempted ?? 0)}`);
console.log(`  Reverse Mountain reached: ${formatRate(milestoneCounts.reverseMountainReached ?? 0)}`);
console.log(`  Reverse Mountain passed:  ${formatRate(milestoneCounts.reverseMountainPassed ?? 0)}`);
console.log(`  Paradise reached:         ${formatRate(milestoneCounts.paradiseReached ?? 0)}`);
console.log(`  Thriller Bark reached:    ${formatRate(milestoneCounts.thrillerBarkReached ?? 0)}`);
console.log(`  Sabaody reached:          ${formatRate(milestoneCounts.sabaodyReached ?? 0)}`);
console.log(`  Fish-Man Island reached:  ${formatRate(milestoneCounts.fishManIslandReached ?? 0)}`);
console.log(`  New World reached:        ${formatRate(milestoneCounts.newWorldReached ?? 0)}`);
console.log(`Thriller Bark -> Sabaody: ${runsReachedSabaodyAfterThrillerBark}/${runsReachedThrillerBark} (${pct(runsReachedSabaodyAfterThrillerBark, runsReachedThrillerBark).toFixed(1)}%)`);
console.log(`Progression anomalies: ${Object.values(progressionAnomalies).reduce((sum, value) => sum + value, 0)}`);
writeJson(args.jsonPath, report);

function ageBand(ageMonths: number): string {
  const years = ageMonths / 12;
  if (years < 15) return '<15';
  if (years < 18) return '15-17';
  if (years < 21) return '18-20';
  if (years < 26) return '21-25';
  if (years < 36) return '26-35';
  return '36+';
}

function seaIdOf(locationId: string): string {
  return locationById.get(locationId)?.seaId ?? 'unknown';
}

function isWithinLocation(locationId: string, targetId: string): boolean {
  let currentId: string | null | undefined = locationId;
  const visited = new Set<string>();

  while (currentId !== null && currentId !== undefined && !visited.has(currentId)) {
    if (currentId === targetId) return true;
    visited.add(currentId);
    currentId = locationById.get(currentId)?.parentLocationId ?? null;
  }
  return false;
}

function finalRegionOf(locationId: string): string {
  if (isWithinLocation(locationId, FISH_MAN_ISLAND_LOCATION_ID)) return 'fish_man_island';
  if (isWithinLocation(locationId, SABAODY_LOCATION_ID)) return 'sabaody';
  if (locationId === TWIN_CAPES_LOCATION_ID) return 'twin_capes';
  if (locationId === REVERSE_MOUNTAIN_LOCATION_ID) return 'reverse_mountain';

  const seaId = seaIdOf(locationId);
  if (BLUE_SEAS.has(seaId)) return 'blues';
  if (seaId === 'grand_line_paradise') return 'paradise';
  if (seaId === 'new_world') return 'new_world';
  if (seaId === 'underwater') return 'underwater';
  if (seaId === 'red_line') return 'red_line';
  return seaId;
}

function furthestStageOf(milestones: RunMilestones): FunnelStage {
  if (milestones.newWorldReached !== undefined) return 'new_world';
  if (milestones.fishManIslandReached !== undefined) return 'fish_man_island_before_new_world';
  if (milestones.sabaodyReached !== undefined) return 'sabaody_before_fish_man_island';
  if (milestones.paradiseReached !== undefined) return 'paradise_before_sabaody';
  if (milestones.reverseMountainReached !== undefined) return 'reverse_mountain_reached_not_passed';
  if (milestones.reverseMountainAttempted !== undefined) return 'reverse_mountain_attempted_not_reached';
  return 'blues_only';
}

function distribution(values: number[]) {
  return {
    count: values.length,
    average: average(values),
    p10: quantile(values, 0.10),
    p50: quantile(values, 0.50),
    p90: quantile(values, 0.90),
    min: values.length > 0 ? Math.min(...values) : null,
    max: values.length > 0 ? Math.max(...values) : null,
  };
}

function rateRow(count: number) {
  return {
    count,
    pct: pct(count, args.runs),
  };
}

function formatRate(count: number): string {
  return `${count}/${args.runs} (${pct(count, args.runs).toFixed(1)}%)`;
}

function getRouteFunnel(routeId: string) {
  let row = routeFunnel.get(routeId);
  if (row === undefined) {
    row = {
      selected: 0,
      reachedSabaody: 0,
      reachedFishManIsland: 0,
      reachedNewWorld: 0,
      deaths: 0,
    };
    routeFunnel.set(routeId, row);
  }
  return row;
}
