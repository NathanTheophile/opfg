import { performance } from 'node:perf_hooks';
import type { SimulationObserver } from '../src/game/simulation/observation';
import { simulateObservedRun } from '../src/game/simulation/simulateObservedRun';
import { progressionSimulationPolicy } from '../src/game/simulation/simulationPolicy';
import { average, inc, loadValidatedCatalog, parseSpecializedArgs, pct, quantile, topEntries, writeJson } from './simulation-specialized/shared';

const args = parseSpecializedArgs(process.argv.slice(2), 'reports/sim-travel-coverage.json');
const catalog = loadValidatedCatalog();
const startedAt = performance.now();

const fallbackPerRun: number[] = [];
const firstFallbackAges: number[] = [];
const uniqueLocationsPerRun: number[] = [];
const seaEventsPerRun: number[] = [];
const landEventsPerRun: number[] = [];
const travelTransitionsPerRun: number[] = [];
const fallbackByLocation: Record<string, number> = {};
const fallbackBySea: Record<string, number> = {};
const fallbackByCareer: Record<string, number> = {};
const fallbackByAgeBand: Record<string, number> = {};
const fallbackByTravel: Record<string, number> = {};
const normalEventsByCareer: Record<string, number> = {};
const locationVisits: Record<string, number> = {};
const transitionSources: Record<string, number> = {};
const terminationReasons: Record<string, number> = {};
const errors: Record<string, number> = {};
const longFallbackStreakSamples: unknown[] = [];

let totalFallbacks = 0;
let runsWithFallback = 0;
let runsWith10PlusFallback = 0;
let maxFallbackStreakObserved = 0;
let runsEverAtSeaWithoutShip = 0;

for (let index = 0; index < args.runs; index += 1) {
  const seed = (args.seed + index) >>> 0;
  const visited = new Set<string>();
  let fallbacks = 0;
  let firstFallback: number | null = null;
  let seaEvents = 0;
  let landEvents = 0;
  let transitions = 0;
  let fallbackStreak = 0;
  let maxFallbackStreak = 0;
  let seaWithoutShip = false;

  const recordState = (locationId: string, travelState: string, ship: unknown) => {
    visited.add(locationId);
    if (travelState === 'at_sea' && ship === null) seaWithoutShip = true;
  };

  const observer: SimulationObserver = {
    onInitialState(state) {
      recordState(state.locationId, state.travelState, state.ship);
    },
    onNavigationResolved(entry) {
      recordState(entry.afterState.locationId, entry.afterState.travelState, entry.afterState.ship);
      if (entry.beforeState.travelState !== entry.afterState.travelState) {
        transitions += 1;
        inc(transitionSources, `navigation:${entry.choice}`);
      }
    },
    onEventResolved(entry) {
      const before = entry.beforeState;
      const after = entry.afterState;
      recordState(after.locationId, after.travelState, after.ship);

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

      const isFallback = entry.event.id === 'dead_end_on_land' || entry.event.id === 'dead_end_at_sea';
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
        const seaId = catalog.locations.find(({ id }) => id === before.locationId)?.seaId ?? 'unknown';
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
    onTermination({ error }) {
      if (error) inc(errors, error);
    },
  };

  const result = simulateObservedRun({ seed, catalog, maxResolvedEvents: args.maxEvents, observer, policy: progressionSimulationPolicy });
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
}

const report = {
  config: { ...args, policy: progressionSimulationPolicy.id },
  elapsedMs: performance.now() - startedAt,
  summary: {
    runs: args.runs,
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
  fallbackByAgeBand,
  fallbackByTravel,
  topFallbackLocations: topEntries(fallbackByLocation, 40),
  topFallbackSeas: topEntries(fallbackBySea, 20),
  topFallbackCareers: topEntries(fallbackByCareer, 20),
  normalEventsByCareer,
  topVisitedDestinationLocations: topEntries(locationVisits, 40),
  topTravelTransitionSources: topEntries(transitionSources, 40),
  terminationReasons,
  errors: topEntries(errors),
  longFallbackStreakSamples,
};

console.log('OPFG Specialized Simulation — TRAVEL / CONTENT COVERAGE');
console.log(`Policy: ${progressionSimulationPolicy.id}`);
console.log(`Runs: ${args.runs}`);
console.log(`Fallbacks/run avg/p50/p90: ${average(fallbackPerRun).toFixed(2)} / ${quantile(fallbackPerRun, 0.50)} / ${quantile(fallbackPerRun, 0.90)}`);
console.log(`Runs with fallback: ${runsWithFallback} (${pct(runsWithFallback, args.runs).toFixed(1)}%)`);
console.log(`Max fallback streak: ${maxFallbackStreakObserved}`);
console.log(`Avg unique Locations/run: ${average(uniqueLocationsPerRun).toFixed(2)}`);
console.log(`Avg sea/land events per run: ${average(seaEventsPerRun).toFixed(1)} / ${average(landEventsPerRun).toFixed(1)}`);
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
