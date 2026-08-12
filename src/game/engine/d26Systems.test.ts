import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../content/definitions';
import { createInitialGameState } from '../model/initialState';
import { createDefaultNpcState } from '../model/npcState';
import { deserializeGameState, serializeGameState } from './save';
import { equipFromStorage, activateLogPose, activeLogPoseNavigationBonus, resolveOverflow, tryAutoPlaceReward } from './inventory';
import { effectiveNpcStat, effectivePlayerStat } from './stats';
import { itemSellPrice, negotiationMultiplier } from './economy';
import { canUseCrewRolePower, navigatorDestinations, setActiveCompanion, useCrewRolePower } from './crewPowers';
import { findCrewRoleActor } from './dice';
import { getPlayerMaxHealth } from './health';
import { moveItem } from './inventory';
import { beginMaritimeEmergency } from './maritime';
import { consumePhaseSlot } from './time';

describe('D2.6 systems hardening', () => {
  it('uses Save 21 and rejects Save 20', () => {
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
    state.npcs.mira = { ...createDefaultNpcState(), status: 'crew', stats: { ...createDefaultNpcState().stats, navigation: 40 } };
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

  it('wrecks cargo, passengers and companion but preserves Log Pose', () => {
    const state = createInitialGameState();
    state.ship = { shipId: 'sloop', name: 'Test', health: 0, cargo: [{ itemId: 'timber', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] }] };
    state.npcs.mira = { ...createDefaultNpcState(), status: 'known' }; state.npcs.guest = createDefaultNpcState();
    state.passengerNpcIds = ['guest']; state.companionNpcId = 'mira'; state.player.logPose = { itemId: 'paradise_log_pose', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] };
    beginMaritimeEmergency(state, contentCatalog, 'accident');
    expect(state.ship).toBeNull(); expect(state.npcs.guest.status).toBe('dead'); expect(state.npcs.mira.status).toBe('dead'); expect(state.companionNpcId).toBeNull(); expect(state.player.logPose?.itemId).toBe('paradise_log_pose');
  });

  it('moves Navigator through the arrival pipeline and excludes gated destinations', () => {
    const state = createInitialGameState();
    state.locationId = 'dressrosa';
    state.npcs.mira = { ...createDefaultNpcState(), status: 'crew' };
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

  it('selects only living companion-capable NPCs without treating them as crew or cargo', () => {
    const catalog = structuredClone(contentCatalog);
    const mira = catalog.npcs.find(({ id }) => id === 'mira')!;
    mira.companionCapable = true;
    mira.companionModifiers = { navigation: 2, morale: -1 };
    const state = createInitialGameState();
    state.ship = { shipId: 'dinghy', name: 'Test', health: 18, cargo: [] };
    state.npcs.mira = { ...createDefaultNpcState(), status: 'known' };
    const crewCount = Object.values(state.npcs).filter(({ status }) => status === 'crew').length;

    setActiveCompanion(state, catalog, 'mira');

    expect(state.companionNpcId).toBe('mira');
    expect(Object.values(state.npcs).filter(({ status }) => status === 'crew')).toHaveLength(crewCount);
    expect(state.ship.cargo).toEqual([]);
    expect(state.passengerNpcIds).toEqual([]);

    state.npcs.mira.stats.health = 0;
    expect(() => setActiveCompanion(state, catalog, 'mira')).toThrow(/living companion-capable/);
    state.npcs.mira.stats.health = 25;
    mira.companionCapable = false;
    expect(() => setActiveCompanion(state, catalog, 'mira')).toThrow(/living companion-capable/);
  });

  it('applies active companion modifiers only to crew NPCs', () => {
    const catalog = structuredClone(contentCatalog);
    const mira = catalog.npcs.find(({ id }) => id === 'mira')!;
    mira.companionCapable = true;
    mira.companionModifiers = { navigation: 2 };
    const state = createInitialGameState();
    state.npcs.mira = { ...createDefaultNpcState(), status: 'known' };
    state.npcs.childhood_friend = { ...createDefaultNpcState(), status: 'crew' };
    state.npcs.childhood_rival = { ...createDefaultNpcState(), status: 'known' };
    setActiveCompanion(state, catalog, 'mira');

    expect(effectiveNpcStat(state, catalog, 'childhood_friend', 'navigation')).toBe(27);
    expect(effectiveNpcStat(state, catalog, 'childhood_rival', 'navigation')).toBe(25);
    expect(effectiveNpcStat(state, catalog, 'mira', 'navigation')).toBe(25);
  });

  it.each([['poor', 5000], ['modest', 7500], ['wealthy', 15000]] as const)('pays %s Childhood income', (socialClassId, expected) => {
    let state = createInitialGameState(); state.careerPhase = 'childhood'; state.player.profile.raceId = 'human'; state.player.profile.socialClassId = socialClassId;
    while (state.careerPhase === 'childhood') state = consumePhaseSlot(state, 'childhood', contentCatalog);
    expect(state.berries).toBe(expected);
  });
});
