import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../src/game/model/initialState';
import { deserializeGameState, serializeGameState } from '../src/game/engine/save';
import { createDefaultPowerState } from '../src/game/engine/powers';

describe('save v18', () => {
  it('migrates v13 through v15 Career defaults and Ending state', () => {
    const legacy = structuredClone(createInitialGameState(13)) as unknown as Record<string, unknown>;
    legacy.version = 13;
    delete legacy.endingId;
    delete (legacy.player as Record<string, unknown>).career;
    expect(deserializeGameState(JSON.stringify(legacy))).toMatchObject({
      version: 18,
      player: { career: { affiliationId: 'civilian', reputation: 0, bounty: 0, rankId: null, titleId: null } },
      endingId: null,
    });
  });
  it('migrates v11 sequentially through v12 to complete v13 Powers and immediate/navigation state', () => {
    const current = createInitialGameState(11);
    const legacy = structuredClone(current) as unknown as Record<string, unknown>;
    legacy.version = 11;
    delete legacy.immediateEventQueue;
    delete legacy.pendingSlotPhase;
    delete legacy.immediateEventsResolvedInChain;
    delete legacy.navigationDecisionAgeMonths;
    const player = legacy.player as Record<string, unknown>;
    delete player.powers;
    (player.stats as Record<string, unknown>).awakening = null;
    for (const npc of Object.values(legacy.npcs as Record<string, Record<string, unknown>>)) delete npc.powers;

    const restored = deserializeGameState(JSON.stringify(legacy));

    expect(restored).toMatchObject({
      version: 18,
      immediateEventQueue: [],
      pendingSlotPhase: null,
      immediateEventsResolvedInChain: 0,
      navigationDecisionAgeMonths: null,
      player: { powers: createDefaultPowerState() },
      npcs: { mira: { powers: createDefaultPowerState() } },
    });
    expect(restored?.player.stats).not.toHaveProperty('awakening');
  });

  it('migrates v12 directly to v13 Powers defaults', () => {
    const legacy = structuredClone(createInitialGameState(12)) as unknown as Record<string, unknown>;
    legacy.version = 12;
    const player = legacy.player as Record<string, unknown>;
    delete player.powers;
    (player.stats as Record<string, unknown>).awakening = null;
    for (const npc of Object.values(legacy.npcs as Record<string, Record<string, unknown>>)) delete npc.powers;

    const restored = deserializeGameState(JSON.stringify(legacy));

    expect(restored?.version).toBe(18);
    expect(restored?.player.powers).toEqual(createDefaultPowerState());
    expect(restored?.npcs.mira.powers).toEqual(createDefaultPowerState());
    expect(restored?.player.stats).not.toHaveProperty('awakening');
  });

  it('migrates v16 ship-market arrival tracking without duplicating resolved arrivals', () => {
    const legacy = structuredClone(createInitialGameState(16)) as unknown as Record<string, unknown>;
    legacy.version = 16;
    legacy.careerPhase = 'active';
    legacy.ageMonths = 180;
    legacy.ship = null;
    legacy.travelState = 'on_land';
    delete legacy.shipMarketArrivalPending;

    expect(deserializeGameState(JSON.stringify(legacy))).toMatchObject({
      version: 18,
      shipMarketArrivalPending: true,
    });
  });
  it('migrates v17 NPC interaction timestamps to null', () => {
    const legacy = structuredClone(createInitialGameState(17)) as unknown as Record<string, unknown>;
    legacy.version = 17;
    (legacy.npcs as Record<string, unknown>).second_npc = structuredClone((legacy.npcs as Record<string, unknown>).mira);
    for (const npc of Object.values(legacy.npcs as Record<string, Record<string, unknown>>)) delete npc.lastInteractionAgeMonths;

    expect(deserializeGameState(JSON.stringify(legacy))).toMatchObject({
      version: 18,
      npcs: {
        mira: { lastInteractionAgeMonths: null },
        second_npc: { lastInteractionAgeMonths: null },
      },
    });
  });
  it('round-trips every v11 field including Origins profile, unbounded health, leadership, passengers, and inventories', () => {
    const state = createInitialGameState(123);
    state.careerPhase = 'active';
    state.ageMonths = 204;
    state.slotInMonth = 1;
    state.ship = null;
    state.pendingShip = { shipId: 'merchant_ship', name: 'New Dawn', health: 20, cargo: [] };
    state.isLeader = false;
    state.npcs.guest = { raceId: null, status: 'known', relationship: 0, lastInteractionAgeMonths: 198, powers: createDefaultPowerState(), stats: { health: 25, morale: 25, strength: 25, observation: 25, intelligence: 25, luck: 25, loyalty: 25, calm: 25 } };
    state.passengerNpcIds = ['guest'];
    state.berries = 42;
    state.player.stats.agility = 37;
    state.player.stats.health = 75;
    state.player.profile.familyStructureId = 'orphan';
    state.player.profile.socialClassId = 'poor';
    state.player.inventory.stacks = [{ itemId: 'sealed_chart', quantity: 2 }];
    state.npcs.mira = { raceId: null, status: 'dead', relationship: 4, lastInteractionAgeMonths: 204, powers: createDefaultPowerState(), stats: { health: 0, morale: 10, strength: 10, observation: 10, intelligence: 10, luck: 10, loyalty: 10, calm: 10 } };
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
    expect(migrated).toMatchObject({ version: 18, ship: { shipId: 'sloop', health: 20 }, isLeader: true, passengerNpcIds: [], berries: 0, player: { career: { affiliationId: 'civilian', reputation: 0, bounty: 0 } }, endingId: null });
    expect(migrated?.player.stats.agility).toBe(25);
    expect(migrated?.player.inventory.stacks).toEqual([{ itemId: 'sealed_chart', quantity: 1 }]);
    const v8 = { ...createInitialGameState(), version: 8, isLeader: undefined, passengerNpcIds: undefined };
    expect(deserializeGameState(JSON.stringify(v8))).toMatchObject({ version: 18, isLeader: true, passengerNpcIds: [] });
    const v9 = JSON.parse(JSON.stringify({ ...createInitialGameState(), version: 9 })) as { player: { stats: Record<string, unknown> } };
    delete v9.player.stats.agility;
    expect(deserializeGameState(JSON.stringify(v9))).toMatchObject({ version: 18, player: { stats: { agility: 25 }, profile: { familyStructureId: null, socialClassId: null } } });
    const v10 = JSON.parse(JSON.stringify({ ...createInitialGameState(), version: 10 })) as { player: { profile: Record<string, unknown> } };
    delete v10.player.profile.familyStructureId;
    delete v10.player.profile.socialClassId;
    expect(deserializeGameState(JSON.stringify(v10))).toMatchObject({ version: 18, player: { profile: { familyStructureId: null, socialClassId: null } } });
    const legacy = { ...createInitialGameState(), version: 6 };
    expect(deserializeGameState(JSON.stringify(legacy))).toBeNull();
    const invalid = { ...createInitialGameState(), slotInMonth: 1 };
    expect(deserializeGameState(JSON.stringify(invalid))).toBeNull();
  });
});
