import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../content/definitions';
import { createInitialGameState } from '../model/initialState';
import { createDefaultNpcState } from '../model/npcState';
import { deserializeGameState, serializeGameState } from './save';
import { equipFromStorage, activateLogPose, activeLogPoseNavigationBonus, resolveOverflow, tryAutoPlaceReward } from './inventory';
import { effectivePlayerStat } from './stats';
import { itemSellPrice, negotiationMultiplier } from './economy';
import { canUseCrewRolePower, useCrewRolePower } from './crewPowers';
import { findCrewRoleActor } from './dice';

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
    expect(itemSellPrice(contentCatalog, 'timber', 1, state)).toBe(500);
    state.player.stats.charisma = 50;
    state.player.stats.luck = 50;
    expect(itemSellPrice(contentCatalog, 'timber', 1, state)).toBe(1000);
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
});
