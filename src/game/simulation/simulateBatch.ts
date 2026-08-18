import type { ContentCatalog, DiceResult, EventDefinition, StatId } from '../content/schema';
import type { GameState, ItemId, ItemStack } from '../model/schema';
import type { SimulationRunResult, SimulationTerminationReason } from './types';
import { simulateRun } from './simulateRun';
import { randomSimulationPolicy, type SimulationPolicy } from './simulationPolicy';

export interface SimulateBatchOptions {
  runs: number;
  baseSeed: number;
  catalog: ContentCatalog;
  maxResolvedEvents?: number;
  policy?: SimulationPolicy;
}

export interface EventMetric {
  eventId: string;
  kind: EventDefinition['kind'];
  timesResolved: number;
  runsContaining: number;
  runPercentage: number;
}

export interface NumericDistribution {
  min: number;
  p10: number;
  p50: number;
  p90: number;
  max: number;
  average: number;
}

export interface ActiveFinalStateMetrics {
  runs: number;
  berries: NumericDistribution;
  stats: Record<StatId, NumericDistribution>;
  traitCount: NumericDistribution;
  ordinaryItemStacks: NumericDistribution;
  ordinaryItemCount: NumericDistribution;
  equipmentOwned: NumericDistribution;
  equipmentEquipped: NumericDistribution;
  companionItemsOwned: NumericDistribution;
  activeCompanionSlotOccupancy: { occupied: number; empty: number; occupancyPercentage: number };
  equipmentItemIdsOwned: Record<ItemId, number>;
  equipmentItemIdsEquipped: Record<ItemId, number>;
  companionItemIdsOwned: Record<ItemId, number>;
  activeCompanionItemIds: Record<ItemId, number>;
}

export interface SimulationBatchResult {
  config: { runs: number; baseSeed: number; maxResolvedEvents: number; policy: string; seedDerivation: 'baseSeed + runIndex (uint32)' };
  summary: {
    runs: number;
    successfulSimulations: number;
    terminations: Record<SimulationTerminationReason, number>;
    reachedChildhood: number;
    reachedActive: number;
    lifetimeThreadStarted: number;
    reachedActiveWithoutLifetimeThread: number;
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
  activeFinalState: ActiveFinalStateMetrics;
  pendingScheduledById: Record<string, { due: number; notDue: number }>;
  problematicRuns: SimulationRunResult[];
  runResults: SimulationRunResult[];
}

export function simulateBatch(options: SimulateBatchOptions): SimulationBatchResult {
  if (!Number.isInteger(options.runs) || options.runs < 1) throw new Error('runs must be a positive integer.');
  const maximum = options.maxResolvedEvents ?? 1000;
  const policy = options.policy ?? randomSimulationPolicy;
  const runResults = Array.from({ length: options.runs }, (_, index) => simulateRun({
    seed: (options.baseSeed + index) >>> 0,
    catalog: options.catalog,
    maxResolvedEvents: maximum,
    policy,
  }));
  const terminations = { careerEnded: 0, deadEnd: 0, safetyLimit: 0, simulationError: 0 };
  const dice = { total: 0, criticalFailure: 0, failure: 0, success: 0, criticalSuccess: 0 };
  const npcDeathsById: Record<string, number> = {};
  const traits: Record<string, number> = {};
  const items: Record<string, number> = {};
  const pendingScheduledById: Record<string, { due: number; notDue: number }> = {};
  const eventCounters = new Map(options.catalog.events.map((event) => [event.id, { event, times: 0, runs: 0 }]));
  const activeFinalState = createActiveFinalStateAccumulator(options.catalog);

  for (const result of runResults) {
    terminations[result.terminationReason] += 1;
    for (const key of ['criticalFailure', 'failure', 'success', 'criticalSuccess'] as const) dice[key] += result.diceChecks[key];
    dice.total += result.diceChecks.total;
    result.npcDeaths.forEach((id) => increment(npcDeathsById, id));
    result.traits.forEach((id) => increment(traits, id));
    result.items.forEach((id) => increment(items, id));
    if (result.activeReached) activeFinalState.add(result.finalState);
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
    config: { runs: options.runs, baseSeed: options.baseSeed >>> 0, maxResolvedEvents: maximum, policy: policy.id, seedDerivation: 'baseSeed + runIndex (uint32)' },
    summary: {
      runs: options.runs,
      successfulSimulations: options.runs - terminations.simulationError,
      terminations,
      reachedChildhood: runResults.filter(({ childhoodReached }) => childhoodReached).length,
      reachedActive: runResults.filter(({ activeReached }) => activeReached).length,
      lifetimeThreadStarted: runResults.filter(({ lifetimeThreadStarted }) => lifetimeThreadStarted).length,
      reachedActiveWithoutLifetimeThread: runResults.filter(({ activeReached, lifetimeThreadStarted }) => activeReached && !lifetimeThreadStarted).length,
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
    activeFinalState: activeFinalState.finalize(),
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

const basePlayerStats = ['morale', 'strength', 'agility', 'observation', 'intelligence', 'navigation', 'charisma', 'luck'] as const satisfies readonly StatId[];

function createActiveFinalStateAccumulator(catalog: ContentCatalog): { add(state: GameState): void; finalize(): ActiveFinalStateMetrics } {
  const itemDefinitions = new Map(catalog.items.map((item) => [item.id, item]));
  const values = {
    berries: [] as number[],
    stats: Object.fromEntries(basePlayerStats.map((statId) => [statId, [] as number[]])) as Record<StatId, number[]>,
    traitCount: [] as number[],
    ordinaryItemStacks: [] as number[],
    ordinaryItemCount: [] as number[],
    equipmentOwned: [] as number[],
    equipmentEquipped: [] as number[],
    companionItemsOwned: [] as number[],
  };
  const equipmentItemIdsOwned: Record<ItemId, number> = {};
  const equipmentItemIdsEquipped: Record<ItemId, number> = {};
  const companionItemIdsOwned: Record<ItemId, number> = {};
  const activeCompanionItemIds: Record<ItemId, number> = {};
  let activeCompanionOccupied = 0;

  return {
    add(state) {
      const storedStacks = [...state.player.inventory.stacks, ...(state.ship?.cargo ?? [])];
      const ordinaryStacks = storedStacks.filter((stack) => {
        const definition = itemDefinitions.get(stack.itemId);
        return definition?.category === 'item' && definition.companion !== true && definition.logPoseType === undefined;
      });
      const storedEquipment = storedStacks.filter((stack) => itemDefinitions.get(stack.itemId)?.category === 'equipment');
      const equipped = state.player.equipment.filter((stack): stack is ItemStack => stack !== null);
      const storedCompanions = storedStacks.filter((stack) => itemDefinitions.get(stack.itemId)?.companion === true);
      const activeCompanion = state.player.companion;
      const companionItems = activeCompanion ? [...storedCompanions, activeCompanion] : storedCompanions;

      values.berries.push(state.berries);
      basePlayerStats.forEach((statId) => values.stats[statId].push(state.player.stats[statId]));
      values.traitCount.push(state.player.traits.length);
      values.ordinaryItemStacks.push(ordinaryStacks.length);
      values.ordinaryItemCount.push(sumQuantities(ordinaryStacks));
      values.equipmentOwned.push(sumQuantities(storedEquipment) + sumQuantities(equipped));
      values.equipmentEquipped.push(equipped.length);
      values.companionItemsOwned.push(sumQuantities(companionItems));
      [...storedEquipment, ...equipped].forEach((stack) => addQuantity(equipmentItemIdsOwned, stack));
      equipped.forEach((stack) => addQuantity(equipmentItemIdsEquipped, stack));
      companionItems.forEach((stack) => addQuantity(companionItemIdsOwned, stack));
      if (activeCompanion) {
        activeCompanionOccupied += 1;
        addQuantity(activeCompanionItemIds, activeCompanion);
      }
    },
    finalize() {
      const runs = values.berries.length;
      return {
        runs,
        berries: distribution(values.berries),
        stats: Object.fromEntries(basePlayerStats.map((statId) => [statId, distribution(values.stats[statId])])) as Record<StatId, NumericDistribution>,
        traitCount: distribution(values.traitCount),
        ordinaryItemStacks: distribution(values.ordinaryItemStacks),
        ordinaryItemCount: distribution(values.ordinaryItemCount),
        equipmentOwned: distribution(values.equipmentOwned),
        equipmentEquipped: distribution(values.equipmentEquipped),
        companionItemsOwned: distribution(values.companionItemsOwned),
        activeCompanionSlotOccupancy: {
          occupied: activeCompanionOccupied,
          empty: runs - activeCompanionOccupied,
          occupancyPercentage: runs === 0 ? 0 : activeCompanionOccupied / runs * 100,
        },
        equipmentItemIdsOwned,
        equipmentItemIdsEquipped,
        companionItemIdsOwned,
        activeCompanionItemIds,
      };
    },
  };
}

function sumQuantities(stacks: ItemStack[]): number {
  return stacks.reduce((sum, stack) => sum + stack.quantity, 0);
}

function addQuantity(target: Record<ItemId, number>, stack: ItemStack): void {
  target[stack.itemId] = (target[stack.itemId] ?? 0) + stack.quantity;
}

function distribution(values: number[]): NumericDistribution {
  if (values.length === 0) return { min: 0, p10: 0, p50: 0, p90: 0, max: 0, average: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  return {
    min: sorted[0],
    p10: percentile(sorted, 0.1),
    p50: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    max: sorted[sorted.length - 1],
    average: average(sorted),
  };
}

function percentile(sortedValues: number[], percentileValue: number): number {
  const index = Math.ceil(percentileValue * sortedValues.length) - 1;
  return sortedValues[Math.min(sortedValues.length - 1, Math.max(0, index))];
}
