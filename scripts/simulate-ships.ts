import { performance } from 'node:perf_hooks';
import type { GameState } from '../src/game/model/schema';
import type { ObservedEventResolution, ObservedNavigationResolution, SimulationObserver } from '../src/game/simulation/observation';
import { simulateObservedRun } from '../src/game/simulation/simulateObservedRun';
import {
  ageLabel,
  average,
  inc,
  loadValidatedCatalog,
  parseSpecializedArgs,
  pct,
  quantile,
  topEntries,
  writeJson,
} from './simulation-specialized/shared';

const args = parseSpecializedArgs(process.argv.slice(2), 'reports/sim-ships.json');
const catalog = loadValidatedCatalog();
const startedAt = performance.now();

type YearBucket = {
  runsObserved: number;
  withShip: number;
  atSea: number;
  atSeaWithoutShip: number;
  health: number[];
  shipIds: Record<string, number>;
  acquisitions: number;
  destructiveLosses: number;
  voluntaryDisposals: number;
  replacements: number;
  reacquisitions: number;
};

const yearly = new Map<number, YearBucket>();

const firstOwnedShipAges: number[] = [];
const firstGameplayAcquisitionAges: number[] = [];
const firstSeaAges: number[] = [];
const destructiveLossAges: number[] = [];
const voluntaryDisposalAges: number[] = [];
const reacquisitionAges: number[] = [];
const shiplessDurations: number[] = [];

const initialShipIds: Record<string, number> = {};
const acquisitionMethods: Record<string, number> = {};
const acquisitionShipIds: Record<string, number> = {};
const acquisitionSources: Record<string, number> = {};
const firstSeaSources: Record<string, number> = {};
const destructiveLossSources: Record<string, number> = {};
const voluntaryDisposalSources: Record<string, number> = {};
const zeroHealthSources: Record<string, number> = {};
const replacementSources: Record<string, number> = {};
const invalidSeaEventSources: Record<string, number> = {};
const errors: Record<string, number> = {};
const errorEvents: Record<string, number> = {};
const anomalySamples: unknown[] = [];

let runsStartingWithShip = 0;
let runsEverOwningShip = 0;
let runsWithGameplayAcquisition = 0;
let runsEnteringSea = 0;
let firstSeaWithoutShip = 0;
let runsEverObservedAtSeaWithoutShip = 0;
let runsResolvingNonCriticalAtSeaWithoutShip = 0;
let totalGameplayAcquisitions = 0;
let totalDestructiveLosses = 0;
let totalVoluntaryDisposals = 0;
let totalReplacements = 0;
let runsWithDestructiveLoss = 0;
let runsWithReacquisition = 0;

for (let index = 0; index < args.runs; index += 1) {
  const seed = (args.seed + index) >>> 0;

  let firstOwnedShipAge: number | null = null;
  let firstGameplayAcquisitionAge: number | null = null;
  let firstSeaAge: number | null = null;
  let shiplessSince: number | null = null;
  let sawDestructiveLoss = false;
  let sawReacquisition = false;
  let reportedAtSeaWithoutShip = false;
  let reportedInvalidSeaResolution = false;

  // One snapshot max per age-year and per run.
  const capturedYears = new Set<number>();

  function captureYear(state: GameState) {
    const year = Math.floor(state.ageMonths / 12);
    if (capturedYears.has(year)) return;
    capturedYears.add(year);

    const bucket = getYearBucket(year);
    bucket.runsObserved += 1;

    if (state.ship !== null) {
      bucket.withShip += 1;
      bucket.health.push(state.ship.health);
      inc(bucket.shipIds, state.ship.shipId);

      if (firstOwnedShipAge === null) {
        firstOwnedShipAge = state.ageMonths;
        firstOwnedShipAges.push(state.ageMonths);
      }
    }

    if (state.travelState === 'at_sea') {
      bucket.atSea += 1;
      if (state.ship === null) bucket.atSeaWithoutShip += 1;
    }
  }

  function bucketTransition(ageMonths: number, field: keyof Pick<
    YearBucket,
    'acquisitions' | 'destructiveLosses' | 'voluntaryDisposals' | 'replacements' | 'reacquisitions'
  >) {
    const year = Math.floor(ageMonths / 12);
    getYearBucket(year)[field] += 1;
  }

  function inspectSeaState(state: GameState, source: string) {
    if (state.travelState !== 'at_sea' || state.ship !== null) return;

    if (!reportedAtSeaWithoutShip) {
      runsEverObservedAtSeaWithoutShip += 1;
      reportedAtSeaWithoutShip = true;
      if (anomalySamples.length < 50) {
        anomalySamples.push({
          seed,
          type: 'at_sea_without_ship',
          ageMonths: state.ageMonths,
          source,
          currentEventId: state.currentEventId,
          locationId: state.locationId,
        });
      }
    }
  }

  const observer: SimulationObserver = {
    onInitialState(state) {
      captureYear(state);

      if (state.ship !== null) {
        runsStartingWithShip += 1;
        inc(initialShipIds, state.ship.shipId);
      }
    },

    onNavigationResolved(entry) {
      captureYear(entry.beforeState);
      captureYear(entry.afterState);

      if (entry.beforeState.travelState !== 'at_sea' && entry.afterState.travelState === 'at_sea') {
        onSeaEntry(entry.afterState, `navigation:${entry.choice}`);
      }

      inspectSeaState(entry.afterState, `navigation:${entry.choice}`);
    },

    onEventResolved(entry) {
      captureYear(entry.beforeState);

      const before = entry.beforeState;
      const after = entry.afterState;
      const source = `${entry.event.id}/${entry.choice.id}/${entry.outcome.id}`;
      const berryDelta = after.berries - before.berries;

      // Every explicit acquireShip Effect is a gameplay acquisition attempt/success source.
      const acquireEffects = entry.outcome.effects.filter((effect) => effect.type === 'acquireShip');

      for (const effect of acquireEffects) {
        totalGameplayAcquisitions += 1;
        bucketTransition(after.ageMonths, 'acquisitions');
        inc(acquisitionShipIds, effect.shipId);
        inc(acquisitionSources, entry.event.id);
        inc(acquisitionMethods, berryDelta < 0 ? 'purchase_like_event' : 'event_grant_or_free');

        if (firstGameplayAcquisitionAge === null) {
          firstGameplayAcquisitionAge = after.ageMonths;
          firstGameplayAcquisitionAges.push(after.ageMonths);
        }

        if (shiplessSince !== null && after.ship !== null) {
          sawReacquisition = true;
          reacquisitionAges.push(after.ageMonths);
          shiplessDurations.push(Math.max(0, after.ageMonths - shiplessSince));
          shiplessSince = null;
          bucketTransition(after.ageMonths, 'reacquisitions');
        }
      }

      if (before.ship !== null && after.ship === null) {
        const explicitLose = entry.outcome.effects.some((effect) => effect.type === 'loseShip');
        const voluntaryPaidDisposal =
          explicitLose &&
          berryDelta > 0 &&
          before.ship.health > 0 &&
          entry.event.id !== 'critical_ship_destroyed';

        if (voluntaryPaidDisposal) {
          totalVoluntaryDisposals += 1;
          voluntaryDisposalAges.push(after.ageMonths);
          inc(voluntaryDisposalSources, entry.event.id);
          bucketTransition(after.ageMonths, 'voluntaryDisposals');
        } else {
          totalDestructiveLosses += 1;
          destructiveLossAges.push(after.ageMonths);
          inc(destructiveLossSources, entry.event.id);
          bucketTransition(after.ageMonths, 'destructiveLosses');
          sawDestructiveLoss = true;
        }

        shiplessSince = after.ageMonths;

        if (anomalySamples.length < 50) {
          anomalySamples.push({
            seed,
            type: voluntaryPaidDisposal ? 'voluntary_ship_disposal' : 'destructive_ship_loss',
            ageMonths: after.ageMonths,
            source,
            shipId: before.ship.shipId,
            healthBefore: before.ship.health,
            locationId: before.locationId,
            travelState: before.travelState,
          });
        }
      }

      if (
        before.ship !== null &&
        after.ship !== null &&
        (before.ship.shipId !== after.ship.shipId || before.ship.name !== after.ship.name)
      ) {
        totalReplacements += 1;
        inc(replacementSources, entry.event.id);
        bucketTransition(after.ageMonths, 'replacements');
      }

      if (
        before.ship !== null &&
        before.ship.health > 0 &&
        after.ship !== null &&
        after.ship.health <= 0
      ) {
        inc(zeroHealthSources, entry.event.id);
      }

      // Strong invariant check: a non-Critical event is actually resolving while
      // the player is already at sea and has no personal ship.
      if (
        before.travelState === 'at_sea' &&
        before.ship === null &&
        entry.event.kind !== 'critical'
      ) {
        inc(invalidSeaEventSources, entry.event.id);

        if (!reportedInvalidSeaResolution) {
          runsResolvingNonCriticalAtSeaWithoutShip += 1;
          reportedInvalidSeaResolution = true;
        }
      }

      if (before.travelState !== 'at_sea' && after.travelState === 'at_sea') {
        onSeaEntry(after, source);
      }

      inspectSeaState(after, source);
      captureYear(after);
    },

    onTermination({ state, error }) {
      captureYear(state);

      if (error) {
        inc(errors, error);
        inc(errorEvents, state.currentEventId ?? 'no-current-event');
      }
    },
  };

  simulateObservedRun({
    seed,
    catalog,
    maxResolvedEvents: args.maxEvents,
    observer,
  });

  if (firstOwnedShipAge !== null) runsEverOwningShip += 1;
  if (firstGameplayAcquisitionAge !== null) runsWithGameplayAcquisition += 1;
  if (firstSeaAge !== null) runsEnteringSea += 1;
  if (sawDestructiveLoss) runsWithDestructiveLoss += 1;
  if (sawReacquisition) runsWithReacquisition += 1;

  function onSeaEntry(state: GameState, source: string) {
    if (firstSeaAge !== null) return;

    firstSeaAge = state.ageMonths;
    firstSeaAges.push(state.ageMonths);
    inc(firstSeaSources, source.split('/')[0]);

    if (state.ship === null) {
      firstSeaWithoutShip += 1;

      if (anomalySamples.length < 50) {
        anomalySamples.push({
          seed,
          type: 'first_sea_without_ship',
          ageMonths: state.ageMonths,
          source,
          locationId: state.locationId,
        });
      }
    }
  }
}

const yearlyShipStats = [...yearly.entries()]
  .sort(([a], [b]) => a - b)
  .map(([ageYears, bucket]) => ({
    ageYears,
    runsObserved: bucket.runsObserved,
    withShip: bucket.withShip,
    withShipPct: pct(bucket.withShip, bucket.runsObserved),
    withoutShip: bucket.runsObserved - bucket.withShip,
    atSea: bucket.atSea,
    atSeaPct: pct(bucket.atSea, bucket.runsObserved),
    atSeaWithoutShip: bucket.atSeaWithoutShip,
    shipHealth: {
      count: bucket.health.length,
      average: average(bucket.health),
      p10: quantile(bucket.health, 0.10),
      p50: quantile(bucket.health, 0.50),
      p90: quantile(bucket.health, 0.90),
    },
    shipIds: topEntries(bucket.shipIds, 10),
    transitionsDuringYear: {
      acquisitions: bucket.acquisitions,
      destructiveLosses: bucket.destructiveLosses,
      voluntaryDisposals: bucket.voluntaryDisposals,
      replacements: bucket.replacements,
      reacquisitions: bucket.reacquisitions,
    },
  }));

const report = {
  telemetryVersion: '1.2',
  config: args,
  elapsedMs: performance.now() - startedAt,

  summary: {
    runs: args.runs,

    // Ownership vs acquisition are intentionally separate.
    runsStartingWithShip,
    runsStartingWithShipPct: pct(runsStartingWithShip, args.runs),
    runsEverOwningShip,
    runsEverOwningShipPct: pct(runsEverOwningShip, args.runs),
    runsWithGameplayAcquisition,
    runsWithGameplayAcquisitionPct: pct(runsWithGameplayAcquisition, args.runs),

    runsEnteringSea,
    runsEnteringSeaPct: pct(runsEnteringSea, args.runs),
    firstSeaWithoutShip,
    firstSeaWithoutShipPct: pct(firstSeaWithoutShip, Math.max(1, runsEnteringSea)),

    runsEverObservedAtSeaWithoutShip,
    runsResolvingNonCriticalAtSeaWithoutShip,

    runsWithDestructiveLoss,
    runsWithDestructiveLossPct: pct(runsWithDestructiveLoss, args.runs),
    runsWithReacquisition,

    totalGameplayAcquisitions,
    totalDestructiveLosses,
    totalVoluntaryDisposals,
    totalReplacements,
  },

  ages: {
    firstOwnedShip: stats(firstOwnedShipAges),
    firstGameplayAcquisition: stats(firstGameplayAcquisitionAges),
    firstSea: stats(firstSeaAges),
    destructiveLoss: stats(destructiveLossAges),
    voluntaryDisposal: stats(voluntaryDisposalAges),
    reacquisition: stats(reacquisitionAges),
    shiplessDurationMonths: stats(shiplessDurations),
  },

  // Main new output requested: annual ownership / HP / sea / transitions.
  yearlyShipStats,

  initialShipIds: topEntries(initialShipIds),
  acquisitionMethods,
  topAcquiredShipIds: topEntries(acquisitionShipIds),
  topAcquisitionSources: topEntries(acquisitionSources),
  topFirstSeaSources: topEntries(firstSeaSources),
  topDestructiveLossSources: topEntries(destructiveLossSources),
  topVoluntaryDisposalSources: topEntries(voluntaryDisposalSources),
  topShipHealthZeroSources: topEntries(zeroHealthSources),
  topReplacementSources: topEntries(replacementSources),

  invalidNonCriticalSeaEventSources: topEntries(invalidSeaEventSources),
  errors: topEntries(errors),
  errorEvents: topEntries(errorEvents),
  anomalySamples,
};

console.log('OPFG Specialized Simulation — SHIPS / SEA INTEGRITY v1.2');
console.log(`Runs: ${args.runs}`);
console.log(`START WITH SHIP: ${runsStartingWithShip} (${pct(runsStartingWithShip, args.runs).toFixed(1)}%)`);
console.log(`EVER OWNED SHIP: ${runsEverOwningShip} (${pct(runsEverOwningShip, args.runs).toFixed(1)}%)`);
console.log(`Gameplay acquisition event: ${runsWithGameplayAcquisition} (${pct(runsWithGameplayAcquisition, args.runs).toFixed(1)}%)`);
console.log(`First sea entry: ${runsEnteringSea} | FIRST SEA WITHOUT SHIP: ${firstSeaWithoutShip}`);
console.log(`Observed at sea without ship later: ${runsEverObservedAtSeaWithoutShip}`);
console.log(`Non-Critical Events resolved at sea without ship: ${runsResolvingNonCriticalAtSeaWithoutShip}`);
console.log(`Destructive losses: ${totalDestructiveLosses} | voluntary disposals: ${totalVoluntaryDisposals}`);
console.log('');
console.log('Annual ownership snapshot:');
for (const row of yearlyShipStats) {
  console.log(
    `Age ${String(row.ageYears).padStart(2)}: ` +
    `${row.withShip}/${row.runsObserved} ship (${row.withShipPct.toFixed(1)}%) | ` +
    `sea ${row.atSeaPct.toFixed(1)}% | ` +
    `sea-without-ship ${row.atSeaWithoutShip} | ` +
    `HP avg ${row.shipHealth.average.toFixed(1)}`
  );
}

writeJson(args.jsonPath, report);

function getYearBucket(ageYears: number): YearBucket {
  const existing = yearly.get(ageYears);
  if (existing) return existing;

  const created: YearBucket = {
    runsObserved: 0,
    withShip: 0,
    atSea: 0,
    atSeaWithoutShip: 0,
    health: [],
    shipIds: {},
    acquisitions: 0,
    destructiveLosses: 0,
    voluntaryDisposals: 0,
    replacements: 0,
    reacquisitions: 0,
  };

  yearly.set(ageYears, created);
  return created;
}

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
