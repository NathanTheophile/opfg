import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../src/game/model/initialState';
import { deserializeGameState, serializeGameState } from '../src/game/engine/save';
import { createDefaultPowerState } from '../src/game/engine/powers';

describe('save v13', () => {
  it('round-trips every v11 field including Origins profile, unbounded health, leadership, passengers, and inventories', () => {
    const state = createInitialGameState(123);
    state.careerPhase = 'active';
    state.ageMonths = 204;
    state.slotInMonth = 1;
    state.ship = null;
    state.pendingShip = { shipId: 'trade_cog', name: 'New Dawn', health: 20, cargo: [] };
    state.isLeader = false;
    state.npcs.guest = { status: 'known', relationship: 0, powers: createDefaultPowerState(), stats: { health: 25, morale: 25, strength: 25, observation: 25, intelligence: 25, luck: 25, loyalty: 25, calm: 25 } };
    state.passengerNpcIds = ['guest'];
    state.berries = 42;
    state.player.stats.agility = 37;
    state.player.stats.health = 75;
    state.player.profile.familyStructureId = 'orphan';
    state.player.profile.socialClassId = 'poor';
    state.player.inventory.stacks = [{ itemId: 'sealed_chart', quantity: 2 }];
    state.npcs.mira = { status: 'dead', relationship: 4, powers: createDefaultPowerState(), stats: { health: 0, morale: 10, strength: 10, observation: 10, intelligence: 10, luck: 10, loyalty: 10, calm: 10 } };
    state.history.push({ eventId: 'event', choiceId: 'choice', outcomeId: 'outcome', ageMonths: 204 });
    state.immediateEventQueue = ['immediate_next'];
    state.pendingSlotPhase = 'active';
    state.immediateEventsResolvedInChain = 2;
    state.navigationDecisionAgeMonths = 204;
    expect(deserializeGameState(serializeGameState(state))).toEqual(state);
  });

  it('migrates v7 and rejects v6 and invalid non-active slots', () => {
    const current = createInitialGameState();
    const v7 = { ...current, version: 7, player: { ...current.player, inventory: undefined }, ship: { condition: 2 }, items: ['sealed_chart'], pendingShip: undefined, berries: undefined };
    const migrated = deserializeGameState(JSON.stringify(v7));
    expect(migrated).toMatchObject({ version: 13, ship: { shipId: 'starter_sloop', health: 20 }, isLeader: true, passengerNpcIds: [], berries: 0 });
    expect(migrated?.player.stats.agility).toBe(25);
    expect(migrated?.player.inventory.stacks).toEqual([{ itemId: 'sealed_chart', quantity: 1 }]);
    const v8 = { ...createInitialGameState(), version: 8, isLeader: undefined, passengerNpcIds: undefined };
    expect(deserializeGameState(JSON.stringify(v8))).toMatchObject({ version: 13, isLeader: true, passengerNpcIds: [] });
    const v9 = JSON.parse(JSON.stringify({ ...createInitialGameState(), version: 9 })) as { player: { stats: Record<string, unknown> } };
    delete v9.player.stats.agility;
    expect(deserializeGameState(JSON.stringify(v9))).toMatchObject({ version: 13, player: { stats: { agility: 25 }, profile: { familyStructureId: null, socialClassId: null } } });
    const v10 = JSON.parse(JSON.stringify({ ...createInitialGameState(), version: 10 })) as { player: { profile: Record<string, unknown> } };
    delete v10.player.profile.familyStructureId;
    delete v10.player.profile.socialClassId;
    expect(deserializeGameState(JSON.stringify(v10))).toMatchObject({ version: 13, player: { profile: { familyStructureId: null, socialClassId: null } } });
    const legacy = { ...createInitialGameState(), version: 6 };
    expect(deserializeGameState(JSON.stringify(legacy))).toBeNull();
    const invalid = { ...createInitialGameState(), slotInMonth: 1 };
    expect(deserializeGameState(JSON.stringify(invalid))).toBeNull();
  });
});
