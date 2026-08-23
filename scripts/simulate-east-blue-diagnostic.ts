import { performance } from 'node:perf_hooks';
import { selectNextEvent } from '../src/game/engine/events';
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

const LAND_FALLBACK = 'dead_end_on_land';
const SEA_FALLBACK = 'dead_end_at_sea';
const FALLBACKS = new Set([LAND_FALLBACK, SEA_FALLBACK]);
const MILESTONES = new Set([1, 5, 10, 25, 100]);

const args = parseSpecializedArgs(process.argv.slice(2), 'reports/sim-east-blue-diagnostic.json');
const catalog = loadValidatedCatalog();
const startedAt = performance.now();
const eventById = new Map(catalog.events.map((event) => [event.id, event] as const));
const eastBlueLocations = catalog.locations.filter((location) => location.seaId === 'east_blue');

if (eastBlueLocations.length === 0) throw new Error('No East Blue locations found.');

type Counter = Record<string, number>;
type Exposure = { roots: number; fallbacks: number; runs: Set<number> };
type Probe = {
  land: string[];
  sea: string[];
  selectedLandEvents: Counter;
  selectedSeaEvents: Counter;
  total: number;
  exhausted: boolean;
};
type Episode = {
  seed: number;
  startAgeMonths: number;
  startCareer: string;
  startLocationId: string;
  startTravelState: string;
  startShipId: string | null;
  startShipHealth: number | null;
  startBerries: number;
  startHistoryLength: number;
  startNormalRootsPlayed: number;
  startPendingScheduled: number;
  startDueScheduled: number;
  lastRealRootEventId: string | null;
  length: number;
  land: number;
  sea: number;
  uniqueLocations: Set<string>;
  seenTransitions: Set<string>;
  repeatedTransitions: number;
  probes: Record<string, Probe>;
};
type Cohort = {
  episodes: number;
  totalLength: number;
  ages: number[];
  noShip: number;
  exhaustedAtStart: number;
  recoverableAtStart: number;
  recoverableCountAtStart: number[];
  careers: Counter;
  locations: Counter;
  travelStates: Counter;
  lastRealRoots: Counter;
  recoveryEvents: Counter;
  terminalReasons: Counter;
};

const exposureCareer = new Map<string, Exposure>();
const exposureShip = new Map<string, Exposure>();
const exposureLocation = new Map<string, Exposure>();
const exposureAge = new Map<string, Exposure>();
const exposureTravel = new Map<string, Exposure>();

const cohorts = new Map<string, Cohort>(
  ['1', '2-4', '5-9', '10-24', '25-99', '100+'].map((key) => [key, newCohort()]),
);
const milestoneStats: Record<string, { probes: number; exhausted: number; recoverableSum: number; noShip: number }> =
  Object.fromEntries([...MILESTONES].map((n) => [String(n), { probes: 0, exhausted: 0, recoverableSum: 0, noShip: 0 }]));

const episodeLengths: number[] = [];
const maxEpisodePerRun: number[] = [];
const firstFallbackAge: number[] = [];
const fallbackByCareer: Counter = {};
const fallbackByLocation: Counter = {};
const fallbackByShip: Counter = {};
const fallbackByAge: Counter = {};
const fallbackByTravel: Counter = {};
const startsByLastRealRoot: Counter = {};
const startsByCareer: Counter = {};
const startsByLocation: Counter = {};
const startsByShip: Counter = {};
const candidateLandLocations: Counter = {};
const candidateSeaLocations: Counter = {};
const candidateLandEvents: Counter = {};
const candidateSeaEvents: Counter = {};
const actualRecoveryEvents: Counter = {};
const safetyStartProfiles: Counter = {};
const terminationReasons: Counter = {};
const errors: Counter = {};
const longestEpisodes: Array<Record<string, unknown>> = [];

let fallbackOccurrences = 0;
let episodeCount = 0;
let recoveredEpisodes = 0;
let terminalEpisodes = 0;
let safetyLimitsInEastBlue = 0;
let safetyLimitsInsideEpisode = 0;
let errorsInEastBlue = 0;
let errorsInsideEpisode = 0;

for (let runIndex = 0; runIndex < args.runs; runIndex += 1) {
  const seed = (args.seed + runIndex) >>> 0;
  let episode: Episode | null = null;
  let lastRealRootEventId: string | null = null;
  let runMax = 0;
  let sawFirstFallback = false;

  const observer: SimulationObserver = {
    onEventResolved(entry) {
      const before = entry.beforeState;
      const after = entry.afterState;
      const event = entry.event;
      const meaningfulRoot = event.kind === 'normal' || event.kind === 'scheduled';
      if (!meaningfulRoot) return;

      const east = seaOf(before.locationId) === 'east_blue';
      const fallback = FALLBACKS.has(event.id);
      if (east) recordExposure(before, fallback, seed);

      if (!fallback) {
        if (episode !== null) {
          inc(actualRecoveryEvents, event.id);
          closeEpisode(episode, true, { recoveryEventId: event.id, recoveryLocationId: before.locationId });
          episode = null;
        }
        lastRealRootEventId = event.id;
        return;
      }

      if (!east) {
        if (episode !== null) {
          closeEpisode(episode, true, { recoveryEventId: 'left_east_blue', recoveryLocationId: before.locationId });
          episode = null;
        }
        return;
      }

      fallbackOccurrences += 1;
      inc(fallbackByCareer, before.player.career.affiliationId);
      inc(fallbackByLocation, before.locationId);
      inc(fallbackByShip, shipKey(before));
      inc(fallbackByAge, String(Math.floor(before.ageMonths / 12)));
      inc(fallbackByTravel, before.travelState);

      if (!sawFirstFallback) {
        firstFallbackAge.push(before.ageMonths);
        sawFirstFallback = true;
      }

      if (episode === null) {
        episode = createEpisode(seed, before, lastRealRootEventId);
        episodeCount += 1;
        inc(startsByLastRealRoot, lastRealRootEventId ?? 'none');
        inc(startsByCareer, episode.startCareer);
        inc(startsByLocation, episode.startLocationId);
        inc(startsByShip, episode.startShipId === null ? 'no_ship' : `ship:${episode.startShipId}`);
      }

      appendFallback(episode, event.id, before, after);
      runMax = Math.max(runMax, episode.length);

      if (MILESTONES.has(episode.length)) {
        const probe = probeRegion(before);
        episode.probes[String(episode.length)] = probe;
        const m = milestoneStats[String(episode.length)];
        m.probes += 1;
        m.recoverableSum += probe.total;
        if (probe.exhausted) m.exhausted += 1;
        if (before.ship === null) m.noShip += 1;

        if (episode.length === 1) {
          for (const id of probe.land) inc(candidateLandLocations, id);
          for (const id of probe.sea) inc(candidateSeaLocations, id);
          for (const [id, count] of Object.entries(probe.selectedLandEvents)) inc(candidateLandEvents, id, count);
          for (const [id, count] of Object.entries(probe.selectedSeaEvents)) inc(candidateSeaEvents, id, count);
        }
      }
    },

    onTermination({ state, reason, error }) {
      inc(terminationReasons, reason);
      const east = seaOf(state.locationId) === 'east_blue';
      if (east && reason === 'safetyLimit') safetyLimitsInEastBlue += 1;
      if (east && reason === 'simulationError') errorsInEastBlue += 1;

      if (episode !== null) {
        if (reason === 'safetyLimit') {
          safetyLimitsInsideEpisode += 1;
          inc(safetyStartProfiles, `${episode.startCareer}|${episode.startShipId ?? 'no_ship'}|${episode.startTravelState}|${episode.startLocationId}`);
        }
        if (reason === 'simulationError') errorsInsideEpisode += 1;
        closeEpisode(episode, false, {
          terminationReason: reason,
          terminalLocationId: state.locationId,
          terminalEventId: state.currentEventId,
          ...(error ? { error } : {}),
        });
        episode = null;
      }
      if (error) inc(errors, error);
    },
  };

  simulateObservedRun({ seed, catalog, maxResolvedEvents: args.maxEvents, observer });
  maxEpisodePerRun.push(runMax);
}

const report = {
  telemetryVersion: 'east-blue-diagnostic-v1',
  config: args,
  elapsedMs: performance.now() - startedAt,
  eastBlueLocations: eastBlueLocations.map((location) => location.id),
  summary: {
    runs: args.runs,
    fallbackOccurrences,
    episodeCount,
    avgEpisodesPerRun: episodeCount / args.runs,
    recoveredEpisodes,
    recoveredPct: pct(recoveredEpisodes, episodeCount),
    terminalEpisodes,
    episodeP50: quantile(episodeLengths, 0.50),
    episodeP90: quantile(episodeLengths, 0.90),
    episodeP95: quantile(episodeLengths, 0.95),
    episodeP99: quantile(episodeLengths, 0.99),
    episodeMax: episodeLengths.length ? Math.max(...episodeLengths) : 0,
    runMaxP50: quantile(maxEpisodePerRun, 0.50),
    runMaxP90: quantile(maxEpisodePerRun, 0.90),
    runMaxP99: quantile(maxEpisodePerRun, 0.99),
    streak5Plus: threshold(maxEpisodePerRun, 5),
    streak10Plus: threshold(maxEpisodePerRun, 10),
    streak25Plus: threshold(maxEpisodePerRun, 25),
    streak100Plus: threshold(maxEpisodePerRun, 100),
    firstFallbackAgeMonths: stats(firstFallbackAge),
    safetyLimitsInEastBlue,
    safetyLimitsInsideEpisode,
    safetyLimitsInsideEpisodePct: pct(safetyLimitsInsideEpisode, safetyLimitsInEastBlue),
    errorsInEastBlue,
    errorsInsideEpisode,
  },
  cohorts: Object.fromEntries([...cohorts.entries()].map(([key, c]) => [key, cohortReport(c)])),
  probeMilestones: Object.fromEntries(Object.entries(milestoneStats).map(([key, m]) => [key, {
    probes: m.probes,
    exhausted: m.exhausted,
    exhaustedPct: pct(m.exhausted, m.probes),
    avgRecoverableContexts: m.probes ? m.recoverableSum / m.probes : 0,
    noShip: m.noShip,
    noShipPct: pct(m.noShip, m.probes),
  }])),
  normalizedExposure: {
    byCareer: exposureRows(exposureCareer),
    byShipState: exposureRows(exposureShip),
    byLocation: exposureRows(exposureLocation),
    byAgeYear: exposureRows(exposureAge),
    byTravelState: exposureRows(exposureTravel),
  },
  fallbackContext: {
    byCareer: topEntries(fallbackByCareer, 20),
    byLocation: topEntries(fallbackByLocation, 40),
    byShipState: topEntries(fallbackByShip, 20),
    byAgeYear: topEntries(fallbackByAge, 100),
    byTravelState: topEntries(fallbackByTravel, 10),
  },
  episodeStarts: {
    byLastRealRoot: topEntries(startsByLastRealRoot, 50),
    byCareer: topEntries(startsByCareer, 20),
    byLocation: topEntries(startsByLocation, 40),
    byShipState: topEntries(startsByShip, 20),
  },
  counterfactualRecoveryAtEpisodeStart: {
    bestLandLocations: topEntries(candidateLandLocations, 40),
    bestSeaLocations: topEntries(candidateSeaLocations, 40),
    selectedLandEvents: topEntries(candidateLandEvents, 60),
    selectedSeaEvents: topEntries(candidateSeaEvents, 60),
  },
  actualRecoveryEvents: topEntries(actualRecoveryEvents, 60),
  safetyLimitStartProfiles: topEntries(safetyStartProfiles, 40),
  terminationReasons: topEntries(terminationReasons, 20),
  errors: topEntries(errors, 20),
  longestEpisodes,
};

console.log('OPFG — EAST BLUE DIAGNOSTIC v1');
console.log(`Runs: ${args.runs}`);
console.log(`Fallbacks: ${fallbackOccurrences} | episodes: ${episodeCount}`);
console.log(`Episode p50/p90/p99/max: ${quantile(episodeLengths, .5)} / ${quantile(episodeLengths, .9)} / ${quantile(episodeLengths, .99)} / ${episodeLengths.length ? Math.max(...episodeLengths) : 0}`);
console.log(`Runs streak >=10: ${threshold(maxEpisodePerRun, 10).runs} | >=100: ${threshold(maxEpisodePerRun, 100).runs}`);
console.log(`Safety limits inside East Blue fallback episode: ${safetyLimitsInsideEpisode}/${safetyLimitsInEastBlue}`);
for (const key of ['1', '2-4', '5-9', '10-24', '25-99', '100+']) {
  const c = cohortReport(cohorts.get(key)!);
  console.log(`${key.padStart(5)} n=${String(c.episodes).padStart(6)} | noShip=${c.noShipPct.toFixed(1)}% | exhaustedStart=${c.exhaustedAtStartPct.toFixed(1)}% | recoverableElsewhere=${c.recoverableAtStartPct.toFixed(1)}%`);
}
console.log('Milestones:');
for (const key of ['1', '5', '10', '25', '100']) {
  const m = milestoneStats[key];
  console.log(`${key.padStart(3)}: n=${m.probes} | exhausted=${pct(m.exhausted, m.probes).toFixed(1)}% | avgRecoverable=${(m.probes ? m.recoverableSum / m.probes : 0).toFixed(2)} | noShip=${pct(m.noShip, m.probes).toFixed(1)}%`);
}
writeJson(args.jsonPath, report);

function createEpisode(seed: number, state: GameState, lastRealRootEventId: string | null): Episode {
  return {
    seed,
    startAgeMonths: state.ageMonths,
    startCareer: state.player.career.affiliationId,
    startLocationId: state.locationId,
    startTravelState: state.travelState,
    startShipId: state.ship?.shipId ?? null,
    startShipHealth: state.ship?.health ?? null,
    startBerries: state.berries,
    startHistoryLength: state.history.length,
    startNormalRootsPlayed: state.history.filter((h) => eventById.get(h.eventId)?.kind === 'normal' && !FALLBACKS.has(h.eventId)).length,
    startPendingScheduled: state.scheduledEvents.length,
    startDueScheduled: state.scheduledEvents.filter((s) => s.dueAgeMonths <= state.ageMonths).length,
    lastRealRootEventId,
    length: 0,
    land: 0,
    sea: 0,
    uniqueLocations: new Set(),
    seenTransitions: new Set(),
    repeatedTransitions: 0,
    probes: {},
  };
}

function appendFallback(ep: Episode, eventId: string, before: GameState, after: GameState) {
  ep.length += 1;
  if (eventId === LAND_FALLBACK) ep.land += 1;
  if (eventId === SEA_FALLBACK) ep.sea += 1;
  ep.uniqueLocations.add(before.locationId);
  ep.uniqueLocations.add(after.locationId);
  const key = `${eventId}|${before.locationId}|${before.travelState}>${after.locationId}|${after.travelState}|${before.ship?.shipId ?? 'no_ship'}`;
  if (ep.seenTransitions.has(key)) ep.repeatedTransitions += 1;
  ep.seenTransitions.add(key);
}

function closeEpisode(ep: Episode, recovered: boolean, ending: Record<string, unknown>) {
  episodeLengths.push(ep.length);
  if (recovered) recoveredEpisodes += 1;
  else terminalEpisodes += 1;
  const c = cohorts.get(cohortKey(ep.length))!;
  c.episodes += 1;
  c.totalLength += ep.length;
  c.ages.push(ep.startAgeMonths);
  if (ep.startShipId === null) c.noShip += 1;
  const startProbe = ep.probes['1'];
  if (startProbe) {
    c.recoverableCountAtStart.push(startProbe.total);
    if (startProbe.exhausted) c.exhaustedAtStart += 1;
    else c.recoverableAtStart += 1;
  }
  inc(c.careers, ep.startCareer);
  inc(c.locations, ep.startLocationId);
  inc(c.travelStates, ep.startTravelState);
  inc(c.lastRealRoots, ep.lastRealRootEventId ?? 'none');
  if (typeof ending.recoveryEventId === 'string') inc(c.recoveryEvents, ending.recoveryEventId);
  if (typeof ending.terminationReason === 'string') inc(c.terminalReasons, ending.terminationReason);

  longestEpisodes.push({
    seed: ep.seed,
    length: ep.length,
    startAgeMonths: ep.startAgeMonths,
    startCareer: ep.startCareer,
    startLocationId: ep.startLocationId,
    startTravelState: ep.startTravelState,
    startShipId: ep.startShipId,
    startShipHealth: ep.startShipHealth,
    startBerries: ep.startBerries,
    startHistoryLength: ep.startHistoryLength,
    startNormalRootsPlayed: ep.startNormalRootsPlayed,
    startPendingScheduled: ep.startPendingScheduled,
    startDueScheduled: ep.startDueScheduled,
    lastRealRootEventId: ep.lastRealRootEventId,
    landFallbacks: ep.land,
    seaFallbacks: ep.sea,
    uniqueLocations: ep.uniqueLocations.size,
    repeatedExactTransitions: ep.repeatedTransitions,
    probes: Object.fromEntries(Object.entries(ep.probes).map(([k, p]) => [k, {
      exhausted: p.exhausted,
      totalRecoverableContexts: p.total,
      land: p.land,
      sea: p.sea,
      landEvents: topEntries(p.selectedLandEvents, 10),
      seaEvents: topEntries(p.selectedSeaEvents, 10),
    }])),
    recovered,
    ...ending,
  });
  longestEpisodes.sort((a, b) => Number(b.length) - Number(a.length));
  if (longestEpisodes.length > 40) longestEpisodes.length = 40;
}

function probeRegion(state: GameState): Probe {
  const land: string[] = [];
  const sea: string[] = [];
  const selectedLandEvents: Counter = {};
  const selectedSeaEvents: Counter = {};
  for (const location of eastBlueLocations) {
    const landEvent = probeLocation(state, location.id, 'on_land');
    if (landEvent) {
      land.push(location.id);
      inc(selectedLandEvents, landEvent);
    }
    if (state.ship !== null) {
      const seaEvent = probeLocation(state, location.id, 'at_sea');
      if (seaEvent) {
        sea.push(location.id);
        inc(selectedSeaEvents, seaEvent);
      }
    }
  }
  const total = land.length + sea.length;
  return { land, sea, selectedLandEvents, selectedSeaEvents, total, exhausted: total === 0 };
}

function probeLocation(state: GameState, locationId: string, travelState: GameState['travelState']): string | null {
  try {
    const selected = selectNextEvent({ ...state, currentEventId: null, locationId, travelState }, catalog);
    const eventId = selected.currentEventId;
    if (eventId === null || FALLBACKS.has(eventId)) return null;
    return eventId;
  } catch {
    return null;
  }
}

function recordExposure(state: GameState, fallback: boolean, seed: number) {
  updateExposure(exposureCareer, state.player.career.affiliationId, fallback, seed);
  updateExposure(exposureShip, shipKey(state), fallback, seed);
  updateExposure(exposureLocation, state.locationId, fallback, seed);
  updateExposure(exposureAge, String(Math.floor(state.ageMonths / 12)), fallback, seed);
  updateExposure(exposureTravel, state.travelState, fallback, seed);
}
function updateExposure(map: Map<string, Exposure>, key: string, fallback: boolean, seed: number) {
  let row = map.get(key);
  if (!row) {
    row = { roots: 0, fallbacks: 0, runs: new Set() };
    map.set(key, row);
  }
  row.roots += 1;
  if (fallback) {
    row.fallbacks += 1;
    row.runs.add(seed);
  }
}
function exposureRows(map: Map<string, Exposure>) {
  return [...map.entries()].map(([key, row]) => ({
    key,
    roots: row.roots,
    fallbacks: row.fallbacks,
    fallbackRatePer100Roots: row.roots ? row.fallbacks / row.roots * 100 : 0,
    uniqueRunsWithFallback: row.runs.size,
  })).sort((a, b) => b.fallbackRatePer100Roots - a.fallbackRatePer100Roots || b.fallbacks - a.fallbacks);
}

function shipKey(state: GameState) { return state.ship === null ? 'no_ship' : `ship:${state.ship.shipId}`; }
function seaOf(locationId: string) { return catalog.locations.find((location) => location.id === locationId)?.seaId ?? 'unknown'; }
function cohortKey(length: number) { if (length === 1) return '1'; if (length <= 4) return '2-4'; if (length <= 9) return '5-9'; if (length <= 24) return '10-24'; if (length <= 99) return '25-99'; return '100+'; }
function newCohort(): Cohort { return { episodes: 0, totalLength: 0, ages: [], noShip: 0, exhaustedAtStart: 0, recoverableAtStart: 0, recoverableCountAtStart: [], careers: {}, locations: {}, travelStates: {}, lastRealRoots: {}, recoveryEvents: {}, terminalReasons: {} }; }
function cohortReport(c: Cohort) { return { episodes: c.episodes, avgLength: c.episodes ? c.totalLength / c.episodes : 0, ageMonths: stats(c.ages), noShip: c.noShip, noShipPct: pct(c.noShip, c.episodes), exhaustedAtStart: c.exhaustedAtStart, exhaustedAtStartPct: pct(c.exhaustedAtStart, c.episodes), recoverableAtStart: c.recoverableAtStart, recoverableAtStartPct: pct(c.recoverableAtStart, c.episodes), recoverableContextsAtStart: stats(c.recoverableCountAtStart), careers: topEntries(c.careers, 10), startLocations: topEntries(c.locations, 20), travelStates: topEntries(c.travelStates, 10), lastRealRoots: topEntries(c.lastRealRoots, 30), recoveryEvents: topEntries(c.recoveryEvents, 30), terminalReasons: topEntries(c.terminalReasons, 10) }; }
function threshold(values: number[], n: number) { const runs = values.filter((value) => value >= n).length; return { runs, pct: pct(runs, values.length) }; }
function stats(values: number[]) { return { count: values.length, average: average(values), p10: quantile(values, .1), p50: quantile(values, .5), p90: quantile(values, .9), p99: quantile(values, .99), min: values.length ? Math.min(...values) : null, max: values.length ? Math.max(...values) : null }; }
