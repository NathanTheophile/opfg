import { performance } from 'node:perf_hooks';
import type { ObservedEventResolution, ObservedNavigationResolution, SimulationObserver } from '../src/game/simulation/observation';
import { simulateObservedRun } from '../src/game/simulation/simulateObservedRun';
import { ageLabel, average, inc, loadValidatedCatalog, parseSpecializedArgs, pct, quantile, topEntries, writeJson } from './simulation-specialized/shared';

const args = parseSpecializedArgs(process.argv.slice(2), 'reports/sim-ships.json');
const catalog = loadValidatedCatalog();
const startedAt = performance.now();

const firstShipAges: number[] = [];
const firstSeaAges: number[] = [];
const lossAges: number[] = [];
const shiplessDurations: number[] = [];
const acquisitionMethods: Record<string, number> = {};
const acquisitionShipIds: Record<string, number> = {};
const acquisitionSources: Record<string, number> = {};
const firstSeaSources: Record<string, number> = {};
const lossSources: Record<string, number> = {};
const lossShipIds: Record<string, number> = {};
const zeroHealthSources: Record<string, number> = {};
const replacementSources: Record<string, number> = {};
const errors: Record<string, number> = {};
const samples: unknown[] = [];

let runsWithShip = 0;
let runsEnteringSea = 0;
let firstSeaWithoutShip = 0;
let anyAtSeaWithoutShip = 0;
let totalAcquisitions = 0;
let totalLosses = 0;
let totalReplacements = 0;
let runsWithLoss = 0;
let runsWithReacquisition = 0;

for (let index = 0; index < args.runs; index += 1) {
  const seed = (args.seed + index) >>> 0;
  let firstShipAge: number | null = null;
  let firstSeaAge: number | null = null;
  let shiplessSince: number | null = null;
  let sawLoss = false;
  let sawReacquisition = false;
  let reportedAtSeaWithoutShip = false;

  const checkSeaIntegrity = (ageMonths: number, travelState: string, hasShip: boolean, source: string) => {
    if (travelState !== 'at_sea' || hasShip) return;
    if (!reportedAtSeaWithoutShip) {
      anyAtSeaWithoutShip += 1;
      reportedAtSeaWithoutShip = true;
      if (samples.length < 30) samples.push({ seed, type: 'at_sea_without_ship', ageMonths, source });
    }
  };

  const observer: SimulationObserver = {
    onNavigationResolved(entry) {
      inspectTravel(entry, `navigation:${entry.choice}`);
    },
    onEventResolved(entry) {
      const before = entry.beforeState;
      const after = entry.afterState;
      const source = `${entry.event.id}/${entry.choice.id}/${entry.outcome.id}`;
      const berryDelta = after.berries - before.berries;
      const acquireEffects = entry.outcome.effects.filter((effect) => effect.type === 'acquireShip');

      if (before.ship === null && after.ship !== null) {
        totalAcquisitions += 1;
        inc(acquisitionShipIds, after.ship.shipId);
        inc(acquisitionSources, entry.event.id);
        const method = acquireEffects.length > 0
          ? berryDelta < 0 ? 'purchase_like_event' : 'event_grant_or_free'
          : 'system_or_unknown';
        inc(acquisitionMethods, method);

        if (firstShipAge === null) {
          firstShipAge = after.ageMonths;
          firstShipAges.push(after.ageMonths);
        } else {
          sawReacquisition = true;
        }

        if (shiplessSince !== null) {
          shiplessDurations.push(Math.max(0, after.ageMonths - shiplessSince));
          shiplessSince = null;
        }
      }

      if (before.ship !== null && after.ship === null) {
        totalLosses += 1;
        sawLoss = true;
        lossAges.push(after.ageMonths);
        inc(lossSources, entry.event.id);
        inc(lossShipIds, before.ship.shipId);
        shiplessSince = after.ageMonths;
        if (samples.length < 30) samples.push({
          seed, type: 'ship_loss', ageMonths: after.ageMonths, source,
          shipId: before.ship.shipId, healthBefore: before.ship.health,
          locationId: before.locationId, travelState: before.travelState,
        });
      }

      if (before.ship !== null && after.ship !== null && (
        before.ship.shipId !== after.ship.shipId || before.ship.name !== after.ship.name
      )) {
        totalReplacements += 1;
        inc(replacementSources, entry.event.id);
      }

      if (before.ship !== null && before.ship.health > 0 && after.ship !== null && after.ship.health <= 0) {
        inc(zeroHealthSources, entry.event.id);
      }

      inspectTravelEvent(entry, source);
      checkSeaIntegrity(after.ageMonths, after.travelState, after.ship !== null, source);
    },
    onTermination({ error }) {
      if (error) inc(errors, error);
    },
  };

  const result = simulateObservedRun({
    seed,
    catalog,
    maxResolvedEvents: args.maxEvents,
    observer,
  });

  if (firstShipAge !== null) runsWithShip += 1;
  if (firstSeaAge !== null) runsEnteringSea += 1;
  if (sawLoss) runsWithLoss += 1;
  if (sawReacquisition) runsWithReacquisition += 1;

  function inspectTravel(entry: ObservedNavigationResolution, source: string) {
    const before = entry.beforeState;
    const after = entry.afterState;
    if (before.travelState !== 'at_sea' && after.travelState === 'at_sea') {
      onSeaEntry(after.ageMonths, after.ship !== null, source);
    }
    checkSeaIntegrity(after.ageMonths, after.travelState, after.ship !== null, source);
  }

  function inspectTravelEvent(entry: ObservedEventResolution, source: string) {
    if (entry.beforeState.travelState !== 'at_sea' && entry.afterState.travelState === 'at_sea') {
      onSeaEntry(entry.afterState.ageMonths, entry.afterState.ship !== null, source);
    }
  }

  function onSeaEntry(ageMonths: number, hasShip: boolean, source: string) {
    if (firstSeaAge !== null) return;
    firstSeaAge = ageMonths;
    firstSeaAges.push(ageMonths);
    inc(firstSeaSources, source.split('/')[0]);
    if (!hasShip) {
      firstSeaWithoutShip += 1;
      if (samples.length < 30) samples.push({ seed, type: 'first_sea_without_ship', ageMonths, source });
    }
  }
}

const report = {
  config: args,
  elapsedMs: performance.now() - startedAt,
  summary: {
    runs: args.runs,
    runsWithShip,
    runsWithShipPct: pct(runsWithShip, args.runs),
    runsEnteringSea,
    runsEnteringSeaPct: pct(runsEnteringSea, args.runs),
    firstSeaWithoutShip,
    firstSeaWithoutShipPct: pct(firstSeaWithoutShip, Math.max(1, runsEnteringSea)),
    runsEverObservedAtSeaWithoutShip: anyAtSeaWithoutShip,
    runsWithLoss,
    runsWithLossPct: pct(runsWithLoss, args.runs),
    runsWithReacquisition,
    totalAcquisitions,
    totalLosses,
    totalReplacements,
  },
  ages: {
    firstShip: stats(firstShipAges),
    firstSea: stats(firstSeaAges),
    shipLoss: stats(lossAges),
    shiplessDurationMonths: stats(shiplessDurations),
  },
  acquisitionMethods,
  topAcquiredShipIds: topEntries(acquisitionShipIds),
  topAcquisitionSources: topEntries(acquisitionSources),
  topFirstSeaSources: topEntries(firstSeaSources),
  topLossSources: topEntries(lossSources),
  topLostShipIds: topEntries(lossShipIds),
  topShipHealthZeroSources: topEntries(zeroHealthSources),
  topReplacementSources: topEntries(replacementSources),
  errors: topEntries(errors),
  samples,
};

console.log('OPFG Specialized Simulation — SHIPS / SEA INTEGRITY');
console.log(`Runs: ${args.runs}`);
console.log(`First ship obtained: ${runsWithShip} (${pct(runsWithShip, args.runs).toFixed(1)}%)`);
console.log(`First sea entry: ${runsEnteringSea} (${pct(runsEnteringSea, args.runs).toFixed(1)}%)`);
console.log(`FIRST SEA WITHOUT SHIP: ${firstSeaWithoutShip}`);
console.log(`Runs ever observed at sea without ship: ${anyAtSeaWithoutShip}`);
console.log(`Ship losses: ${totalLosses} across ${runsWithLoss} runs`);
console.log(`First ship avg age: ${ageLabel(Math.round(average(firstShipAges)))}`);
console.log(`First sea avg age: ${ageLabel(Math.round(average(firstSeaAges)))}`);
console.log(`Acquisition methods: ${JSON.stringify(acquisitionMethods)}`);
writeJson(args.jsonPath, report);

function stats(values: number[]) {
  return {
    count: values.length,
    average: average(values),
    p10: quantile(values, 0.10),
    p50: quantile(values, 0.50),
    p90: quantile(values, 0.90),
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
  };
}
