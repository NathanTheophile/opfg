import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../content/definitions';
import { createInitialGameState } from '../model/initialState';
import { createDefaultNpcState } from '../model/npcState';
import { deserializeGameState, serializeGameState } from './save';
import { equipFromStorage, activateLogPose, activeLogPoseNavigationBonus, resolveOverflow, tryAutoPlaceReward } from './inventory';
import { effectivePlayerStat } from './stats';
import { itemSellPrice, negotiationMultiplier } from './economy';
import { canUseCrewRolePower, navigatorDestinations, useCrewRolePower } from './crewPowers';
import { findCrewRoleActor } from './dice';
import { getPlayerMaxHealth } from './health';
import { moveItem } from './inventory';
import { beginMaritimeEmergency, blueArrivalProbabilityForCrossingRoot, resolveOrdinaryBlueArrivalAfterMonthlyRoot } from './maritime';
import { movePlayerToLocation } from './locations';
import { consumePhaseSlot } from './time';

describe('D2.6 systems hardening', () => {
  it('uses Save 23 and rejects Save 20', () => {
    const state = createInitialGameState();
    expect(deserializeGameState(serializeGameState(state))).toEqual(state);
    expect(deserializeGameState(JSON.stringify({ ...state, version: 20 }))).toBeNull();
  });

  it('equips only equipment, derives stats, and activates only Log Poses', () => {
    const catalog = structuredClone(contentCatalog);
    catalog.items.push({ id: 'sword', nameKey: 'item.sealed_chart.name', category: 'equipment', stackLimit: 1, market: null, modifiers: { strength: 30 }, weapon: { damageType: 'cutting', rangeType: 'melee' } });
    const state = createInitialGameState();
    state.player.inventory.stacks = [{ itemId: 'sword', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] }, { itemId: 'paradise_log_pose', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] }];
    expect(equipFromStorage(state, catalog, { type: 'pocket', index: 0 })).toBe(true);
    expect(effectivePlayerStat(state, catalog, 'strength')).toBe(50);
    expect(activateLogPose(state, catalog, { type: 'pocket', index: 0 })).toBe(true);
    expect(activeLogPoseNavigationBonus(state, catalog)).toBe(3);
  });

  it('uses fixed resale, passive multiplier floor, and negotiation deltas', () => {
    const state = createInitialGameState();
    expect(itemSellPrice(contentCatalog, 'timber', 1, state)).toBe(5000);
    state.player.stats.charisma = 50;
    state.player.stats.luck = 50;
    expect(itemSellPrice(contentCatalog, 'timber', 1, state)).toBe(10000);
    expect(negotiationMultiplier('purchase', 'success')).toBe(.8);
    expect(negotiationMultiplier('resale', 'criticalFailure')).toBe(.8);
  });

  it('shares annual role cooldown and selects crewRole actor by effective stat then ID', () => {
    const state = createInitialGameState();
    state.npcs.mira = { ...createDefaultNpcState(), status: 'crew', crewRoleId: 'navigator', stats: { ...createDefaultNpcState().stats, navigation: 40 } };
    state.ship = { shipId: 'sloop', name: 'Test', health: 30, cargo: [] };
    expect(canUseCrewRolePower(state, contentCatalog, 'navigator')).toBe(true);
    expect(findCrewRoleActor(state, contentCatalog, 'navigator', 'navigation')).toBe('mira');
    const destination = contentCatalog.locations.find(({ id, seaId, allowsDocking }) => id !== state.locationId && seaId === 'east_blue' && allowsDocking)!;
    useCrewRolePower(state, contentCatalog, 'navigator', destination.id);
    expect(canUseCrewRolePower(state, contentCatalog, 'navigator')).toBe(false);
  });

  it('never destroys an overflowing reward and resolves it after a discard', () => {
    const state = createInitialGameState();
    state.player.inventory.stacks = ['sealed_chart', 'mira_letter_of_passage'].map((itemId) => ({ itemId, quantity: 1, provenance: [{ locationId: null, quantity: 1 }] }));
    expect(tryAutoPlaceReward(state, contentCatalog, 'timber')).toBe(false);
    state.pendingOverflow = { itemId: 'timber', quantity: 1, locationId: state.locationId, mandatory: true };
    resolveOverflow(state, contentCatalog, { type: 'discardStored', storage: 'pocket', index: 0 });
    expect(state.pendingOverflow).toBeNull();
    expect(state.player.inventory.stacks.some(({ itemId }) => itemId === 'timber')).toBe(true);
  });

  it('keeps Giant Health above 50 and treats equipment Health as max Health', () => {
    const catalog = structuredClone(contentCatalog);
    catalog.items.push({ id: 'coat', nameKey: 'item.sealed_chart.name', category: 'equipment', stackLimit: 1, market: null, modifiers: { health: 10 } });
    const state = createInitialGameState();
    state.player.profile.raceId = 'giant'; state.player.stats.health = 60;
    state.player.inventory.stacks = [{ itemId: 'coat', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] }];
    equipFromStorage(state, catalog, { type: 'pocket', index: 0 });
    expect(getPlayerMaxHealth(state, catalog)).toBe(70); expect(state.player.stats.health).toBe(60);
    state.player.stats.health = 70;
    expect(moveItem(state, catalog, { type: 'equipment', index: 0 }, { type: 'pocket', index: 0 })).toBe(true);
    expect(state.player.stats.health).toBe(60);
  });

  it('moves and swaps ordinary storage', () => {
    const state = createInitialGameState();
    state.ship = { shipId: 'sloop', name: 'Test', health: 30, cargo: [{ itemId: 'timber', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] }] };
    state.player.inventory.stacks = [{ itemId: 'sealed_chart', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] }];
    expect(moveItem(state, contentCatalog, { type: 'pocket', index: 0 }, { type: 'cargo', index: 0 })).toBe(true);
    expect(state.player.inventory.stacks[0].itemId).toBe('timber'); expect(state.ship.cargo[0].itemId).toBe('sealed_chart');
  });

  it('wrecks cargo and passengers but preserves active Item slots', () => {
    const state = createInitialGameState();
    state.ship = { shipId: 'sloop', name: 'Test', health: 0, cargo: [{ itemId: 'timber', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] }] };
    state.npcs.guest = createDefaultNpcState();
    state.passengerNpcIds = ['guest'];
    state.player.logPose = { itemId: 'paradise_log_pose', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] };
    state.player.companion = { itemId: 'sealed_chart', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] };

    beginMaritimeEmergency(state, contentCatalog, 'accident');

    expect(state.ship).toBeNull();
    expect(state.npcs.guest.status).toBe('dead');
    expect(state.player.logPose?.itemId).toBe('paradise_log_pose');
    expect(state.player.companion?.itemId).toBe('sealed_chart');
  });

  it('moves Navigator through the arrival pipeline and excludes gated destinations', () => {
    const state = createInitialGameState();
    state.locationId = 'dressrosa';
    state.npcs.mira = { ...createDefaultNpcState(), status: 'crew', crewRoleId: 'navigator' };
    state.ship = { shipId: 'sloop', name: 'Test', health: 30, cargo: [] };
    state.shipMarketArrivalPending = false;
    const destinations = navigatorDestinations(state, contentCatalog);
    const marketDestination = destinations.find(({ hasMarketHub }) => hasMarketHub);

    expect(destinations.some(({ id }) => id === 'egghead_island')).toBe(false);
    expect(destinations.some(({ id }) => id === 'raijin_island')).toBe(true);
    expect(marketDestination).toBeDefined();

    const ageMonths = state.ageMonths;
    const slotInMonth = state.slotInMonth;
    useCrewRolePower(state, contentCatalog, 'navigator', marketDestination!.id);

    expect(state.locationId).toBe(marketDestination!.id);
    expect(state.travelState).toBe('on_land');
    expect(state.shipMarketArrivalPending).toBe(true);
    expect(state.ageMonths).toBe(ageMonths);
    expect(state.slotInMonth).toBe(slotInMonth);
  });


  it('keeps ordinary Blue crossings seeded, rising, and capped at three monthly roots', () => {
    expect([0, 1, 2, 3, 4].map(blueArrivalProbabilityForCrossingRoot)).toEqual([0, 0.35, 0.70, 1, 1]);

    const state = createInitialGameState(12345);
    state.careerPhase = 'active';
    state.ageMonths = 180;
    state.locationId = 'foosha_village';
    state.ship = { shipId: 'sloop', name: 'Test', health: 30, cargo: [] };
    movePlayerToLocation(state, state.locationId, 'at_sea');

    expect(state.navigationDecisionAgeMonths).toBe(180);
    expect(resolveOrdinaryBlueArrivalAfterMonthlyRoot(state, contentCatalog)).toBe(false);

    state.ageMonths = 183;
    expect(resolveOrdinaryBlueArrivalAfterMonthlyRoot(state, contentCatalog)).toBe(true);
    expect(state.travelState).toBe('on_land');
    expect(contentCatalog.locations.find(({ id }) => id === state.locationId)?.seaId).toBe('east_blue');
    expect(contentCatalog.locations.find(({ id }) => id === state.locationId)?.islandId).not.toBe('dawn_island');
    expect(state.locationId).not.toBe('reverse_mountain');
    expect(state.shipMarketArrivalPending).toBe(true);
  });

  it('locks Navigator geography to Blue + Reverse Mountain, none in Paradise, global from New World', () => {
    const state = createInitialGameState();
    state.careerPhase = 'active';
    state.ageMonths = 180;
    state.npcs.mira = { ...createDefaultNpcState(), status: 'crew', crewRoleId: 'navigator' };
    state.ship = { shipId: 'sloop', name: 'Test', health: 30, cargo: [] };

    state.locationId = 'foosha_village';
    const blueIds = navigatorDestinations(state, contentCatalog).map(({ id }) => id);
    expect(blueIds).toContain('reverse_mountain');
    expect(blueIds).toContain('orange_town');
    expect(blueIds).not.toContain('baterilla');

    state.locationId = 'alabasta_kingdom';
    expect(navigatorDestinations(state, contentCatalog)).toEqual([]);
    expect(canUseCrewRolePower(state, contentCatalog, 'navigator')).toBe(false);

    state.locationId = 'dressrosa';
    const newWorldIds = navigatorDestinations(state, contentCatalog).map(({ id }) => id);
    expect(newWorldIds).toContain('orange_town');
    expect(newWorldIds).toContain('alabasta_kingdom');
    expect(newWorldIds).not.toContain('reverse_mountain');
    expect(newWorldIds).not.toContain('egghead_island');
  });

  it.each([['poor', 5000], ['modest', 7500], ['wealthy', 15000]] as const)('pays %s Childhood income', (socialClassId, expected) => {
    let state = createInitialGameState(); state.careerPhase = 'childhood'; state.player.profile.raceId = 'human'; state.player.profile.socialClassId = socialClassId;
    while (state.careerPhase === 'childhood') state = consumePhaseSlot(state, 'childhood', contentCatalog);
    expect(state.berries).toBe(expected);
  });
});
