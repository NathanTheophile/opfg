import { describe, expect, it, vi } from 'vitest';
import type { ContentCatalog } from '../content/schema';
import { createInitialGameState } from '../model/initialState';
import type { GameState, ItemStack } from '../model/schema';
import type { SimulationRunResult } from './types';

const mockedRuns = vi.hoisted(() => [] as SimulationRunResult[]);

vi.mock('./simulateRun', () => ({
  simulateRun: vi.fn(() => {
    const next = mockedRuns.shift();
    if (!next) throw new Error('Missing mocked run.');
    return next;
  }),
}));

describe('simulateBatch final-state reporting', () => {
  it('aggregates Active final-state metrics without changing run selection', async () => {
    const { simulateBatch } = await import('./simulateBatch');
    mockedRuns.push(
      runResult({ activeReached: true, state: stateAtActive({
        berries: 100,
        stats: { morale: 10, strength: 20 },
        traits: ['resourceful'],
        inventory: [stack('keepsake', 2), stack('sword', 1), stack('cat', 1)],
        cargo: [stack('timber', 3)],
        equipment: [stack('boots', 1), null],
        companion: stack('gull', 1),
      }) }),
      runResult({ activeReached: true, state: stateAtActive({
        berries: 300,
        stats: { morale: 30, strength: 40 },
        traits: ['resourceful', 'proud', 'loyal'],
        inventory: [stack('sword', 1)],
        cargo: [],
        equipment: [null, null],
        companion: null,
      }) }),
      runResult({ activeReached: false, state: stateAtActive({
        berries: 9999,
        stats: { morale: 50, strength: 50 },
        traits: ['ignored'],
        inventory: [stack('cat', 1)],
        cargo: [],
        equipment: [null, null],
        companion: stack('gull', 1),
      }) }),
    );

    const result = simulateBatch({ runs: 3, baseSeed: 1, maxResolvedEvents: 10, catalog });

    expect(result.activeFinalState.runs).toBe(2);
    expect(result.activeFinalState.berries).toEqual({ min: 100, p10: 100, p50: 100, p90: 300, max: 300, average: 200 });
    expect(result.activeFinalState.stats.morale).toMatchObject({ min: 10, p50: 10, p90: 30, max: 30, average: 20 });
    expect(result.activeFinalState.stats.strength).toMatchObject({ min: 20, p50: 20, p90: 40, max: 40, average: 30 });
    expect(result.activeFinalState.traitCount.average).toBe(2);
    expect(result.activeFinalState.ordinaryItemStacks.average).toBe(1);
    expect(result.activeFinalState.ordinaryItemCount.average).toBe(2.5);
    expect(result.activeFinalState.equipmentOwned.average).toBe(1.5);
    expect(result.activeFinalState.equipmentEquipped.average).toBe(0.5);
    expect(result.activeFinalState.companionItemsOwned.average).toBe(1);
    expect(result.activeFinalState.activeCompanionSlotOccupancy).toEqual({ occupied: 1, empty: 1, occupancyPercentage: 50 });
    expect(result.activeFinalState.equipmentItemIdsOwned).toEqual({ boots: 1, sword: 2 });
    expect(result.activeFinalState.equipmentItemIdsEquipped).toEqual({ boots: 1 });
    expect(result.activeFinalState.companionItemIdsOwned).toEqual({ cat: 1, gull: 1 });
    expect(result.activeFinalState.activeCompanionItemIds).toEqual({ gull: 1 });
  });
});

const catalog = {
  events: [],
  items: [
    { id: 'keepsake', nameKey: 'item.keepsake.name', category: 'item', stackLimit: 99, market: null },
    { id: 'timber', nameKey: 'item.timber.name', category: 'item', stackLimit: 99, market: null },
    { id: 'sword', nameKey: 'item.sword.name', category: 'equipment', stackLimit: 1, market: null },
    { id: 'boots', nameKey: 'item.boots.name', category: 'equipment', stackLimit: 1, market: null },
    { id: 'cat', nameKey: 'item.cat.name', category: 'item', stackLimit: 1, market: null, companion: true },
    { id: 'gull', nameKey: 'item.gull.name', category: 'item', stackLimit: 1, market: null, companion: true },
  ],
} as unknown as ContentCatalog;

function runResult({ activeReached, state }: { activeReached: boolean; state: GameState }): SimulationRunResult {
  return {
    seed: 1,
    terminationReason: 'deadEnd',
    finalState: state,
    resolvedEvents: [],
    normalEvents: 0,
    scheduledEvents: 0,
    criticalEvents: 0,
    immediateEvents: 0,
    fallbackEvents: { land: 0, sea: 0, total: 0 },
    maximumImmediateChainLength: 0,
    immediateGuardTriggered: false,
    diceChecks: { total: 0, criticalFailure: 0, failure: 0, success: 0, criticalSuccess: 0 },
    traits: [...state.player.traits],
    items: state.player.inventory.stacks.map(({ itemId }) => itemId),
    playerDeath: false,
    npcDeaths: [],
    shipLosses: 0,
    maxAgeMonths: state.ageMonths,
    childhoodReached: true,
    activeReached,
    lifetimeThreadStarted: false,
    pendingScheduled: { due: [], notDue: [] },
    possibleCriticalLoop: false,
  };
}

function stateAtActive(options: {
  berries: number;
  stats: Partial<GameState['player']['stats']>;
  traits: string[];
  inventory: ItemStack[];
  cargo: ItemStack[];
  equipment: GameState['player']['equipment'];
  companion: ItemStack | null;
}): GameState {
  const state = createInitialGameState(1);
  state.careerPhase = 'active';
  state.ageMonths = 180;
  state.berries = options.berries;
  state.player.stats = { ...state.player.stats, ...options.stats };
  state.player.traits = options.traits;
  state.player.inventory.stacks = options.inventory;
  state.player.equipment = options.equipment;
  state.player.companion = options.companion;
  state.ship = { shipId: 'dinghy', name: 'Test', health: 1, cargo: options.cargo };
  return state;
}

function stack(itemId: string, quantity: number): ItemStack {
  return { itemId, quantity, provenance: [{ locationId: null, quantity }] };
}
