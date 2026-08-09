import type { ContentCatalog, DiceResult, EventDefinition } from '../content/schema';
import type { SimulationRunResult, SimulationTerminationReason } from './types';
import { simulateRun } from './simulateRun';

export interface SimulateBatchOptions {
  runs: number;
  baseSeed: number;
  catalog: ContentCatalog;
  maxResolvedEvents?: number;
}

export interface EventMetric {
  eventId: string;
  kind: EventDefinition['kind'];
  timesResolved: number;
  runsContaining: number;
  runPercentage: number;
}

export interface SimulationBatchResult {
  config: { runs: number; baseSeed: number; maxResolvedEvents: number; policy: 'random'; seedDerivation: 'baseSeed + runIndex (uint32)' };
  summary: {
    runs: number;
    successfulSimulations: number;
    terminations: Record<SimulationTerminationReason, number>;
    reachedChildhood: number;
    reachedActive: number;
    averageFinalAgeMonths: number;
    minFinalAgeMonths: number;
    maxFinalAgeMonths: number;
    averageResolvedEvents: number;
    normalResolved: number;
    scheduledResolved: number;
    criticalResolved: number;
    immediateResolved: number;
    averageImmediatePerSlot: number;
    maximumImmediateChainLength: number;
    immediateGuardsTriggered: number;
    eventsAtSea: number;
    eventsOnLand: number;
    playerDeaths: number;
    npcDeaths: number;
    npcDeathsById: Record<string, number>;
    shipLosses: number;
    pendingScheduled: number;
    dueScheduledPending: number;
    possibleCriticalLoops: number;
    fallbackEvents: { land: number; sea: number; total: number };
  };
  dice: Record<DiceResult, number> & { total: number };
  events: EventMetric[];
  traits: Record<string, number>;
  items: Record<string, number>;
  pendingScheduledById: Record<string, { due: number; notDue: number }>;
  problematicRuns: SimulationRunResult[];
  runResults: SimulationRunResult[];
}

export function simulateBatch(options: SimulateBatchOptions): SimulationBatchResult {
  if (!Number.isInteger(options.runs) || options.runs < 1) throw new Error('runs must be a positive integer.');
  const maximum = options.maxResolvedEvents ?? 1000;
  const runResults = Array.from({ length: options.runs }, (_, index) => simulateRun({
    seed: (options.baseSeed + index) >>> 0,
    catalog: options.catalog,
    maxResolvedEvents: maximum,
  }));
  const terminations = { careerEnded: 0, deadEnd: 0, safetyLimit: 0, simulationError: 0 };
  const dice = { total: 0, criticalFailure: 0, failure: 0, success: 0, criticalSuccess: 0 };
  const npcDeathsById: Record<string, number> = {};
  const traits: Record<string, number> = {};
  const items: Record<string, number> = {};
  const pendingScheduledById: Record<string, { due: number; notDue: number }> = {};
  const eventCounters = new Map(options.catalog.events.map((event) => [event.id, { event, times: 0, runs: 0 }]));

  for (const result of runResults) {
    terminations[result.terminationReason] += 1;
    for (const key of ['criticalFailure', 'failure', 'success', 'criticalSuccess'] as const) dice[key] += result.diceChecks[key];
    dice.total += result.diceChecks.total;
    result.npcDeaths.forEach((id) => increment(npcDeathsById, id));
    result.traits.forEach((id) => increment(traits, id));
    result.items.forEach((id) => increment(items, id));
    result.pendingScheduled.due.forEach(({ eventId }) => incrementPending(pendingScheduledById, eventId, 'due'));
    result.pendingScheduled.notDue.forEach(({ eventId }) => incrementPending(pendingScheduledById, eventId, 'notDue'));
    const seen = new Set<string>();
    for (const entry of result.resolvedEvents) {
      const counter = eventCounters.get(entry.eventId);
      if (!counter) continue;
      counter.times += 1;
      if (!seen.has(entry.eventId)) counter.runs += 1;
      seen.add(entry.eventId);
    }
  }

  const finalAges = runResults.map(({ finalState }) => finalState.ageMonths);
  const totalResolved = runResults.reduce((sum, result) => sum + result.resolvedEvents.length, 0);
  return {
    config: { runs: options.runs, baseSeed: options.baseSeed >>> 0, maxResolvedEvents: maximum, policy: 'random', seedDerivation: 'baseSeed + runIndex (uint32)' },
    summary: {
      runs: options.runs,
      successfulSimulations: options.runs - terminations.simulationError,
      terminations,
      reachedChildhood: runResults.filter(({ childhoodReached }) => childhoodReached).length,
      reachedActive: runResults.filter(({ activeReached }) => activeReached).length,
      averageFinalAgeMonths: average(finalAges),
      minFinalAgeMonths: Math.min(...finalAges),
      maxFinalAgeMonths: Math.max(...finalAges),
      averageResolvedEvents: totalResolved / options.runs,
      normalResolved: runResults.reduce((sum, result) => sum + result.normalEvents, 0),
      scheduledResolved: runResults.reduce((sum, result) => sum + result.scheduledEvents, 0),
      criticalResolved: runResults.reduce((sum, result) => sum + result.criticalEvents, 0),
      immediateResolved: runResults.reduce((sum, result) => sum + result.immediateEvents, 0),
      averageImmediatePerSlot: runResults.reduce((sum, result) => sum + result.immediateEvents, 0) / Math.max(1, runResults.reduce((sum, result) => sum + result.normalEvents + result.scheduledEvents, 0)),
      maximumImmediateChainLength: Math.max(...runResults.map(({ maximumImmediateChainLength }) => maximumImmediateChainLength)),
      immediateGuardsTriggered: runResults.filter(({ immediateGuardTriggered }) => immediateGuardTriggered).length,
      eventsAtSea: runResults.reduce((sum, result) => sum + result.resolvedEvents.filter(({ travelState }) => travelState === 'at_sea').length, 0),
      eventsOnLand: runResults.reduce((sum, result) => sum + result.resolvedEvents.filter(({ travelState }) => travelState === 'on_land').length, 0),
      playerDeaths: runResults.filter(({ playerDeath }) => playerDeath).length,
      npcDeaths: Object.values(npcDeathsById).reduce((sum, count) => sum + count, 0),
      npcDeathsById,
      shipLosses: runResults.reduce((sum, result) => sum + result.shipLosses, 0),
      pendingScheduled: runResults.reduce((sum, result) => sum + result.pendingScheduled.due.length + result.pendingScheduled.notDue.length, 0),
      dueScheduledPending: runResults.reduce((sum, result) => sum + result.pendingScheduled.due.length, 0),
      possibleCriticalLoops: runResults.filter(({ possibleCriticalLoop }) => possibleCriticalLoop).length,
      fallbackEvents: {
        land: runResults.reduce((sum, result) => sum + result.fallbackEvents.land, 0),
        sea: runResults.reduce((sum, result) => sum + result.fallbackEvents.sea, 0),
        total: runResults.reduce((sum, result) => sum + result.fallbackEvents.total, 0),
      },
    },
    dice,
    events: [...eventCounters.values()].map(({ event, times, runs }) => ({
      eventId: event.id, kind: event.kind, timesResolved: times, runsContaining: runs, runPercentage: runs / options.runs * 100,
    })),
    traits,
    items,
    pendingScheduledById,
    problematicRuns: runResults.filter(({ terminationReason, possibleCriticalLoop }) => terminationReason !== 'careerEnded' || possibleCriticalLoop),
    runResults,
  };
}

function increment(target: Record<string, number>, id: string): void {
  target[id] = (target[id] ?? 0) + 1;
}

function incrementPending(target: Record<string, { due: number; notDue: number }>, id: string, key: 'due' | 'notDue'): void {
  target[id] ??= { due: 0, notDue: 0 };
  target[id][key] += 1;
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
