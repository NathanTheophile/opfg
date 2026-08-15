import { describe, expect, it } from 'vitest';
import { evaluateCondition } from '../src/game/engine/conditions';
import { createInitialGameState } from '../src/game/model/initialState';
import { contentCatalog } from '../src/game/content/definitions';

describe('conditions v2', () => {
  it('evaluates recursive composition and history conditions', () => {
    const state = createInitialGameState();
    state.flags.push('ready');
    state.history.push({ eventId: 'past', choiceId: 'go', outcomeId: 'ok', ageMonths: 12 });
    expect(evaluateCondition({ type: 'all', conditions: [
      { type: 'hasFlag', flagId: 'ready' },
      { type: 'not', condition: { type: 'hasChosen', eventId: 'past', choiceId: 'stay' } },
      { type: 'any', conditions: [{ type: 'hasPlayed', eventId: 'past' }, { type: 'hasItem', itemId: 'missing' }] },
    ] }, state)).toBe(true);
  });

  it('treats ship predicates as false without a ship', () => {
    const state = { ...createInitialGameState(), ship: null };
    expect(evaluateCondition({ type: 'shipHealthAtLeast', value: 0 }, state)).toBe(false);
    expect(evaluateCondition({ type: 'shipHealthAtMost', value: 30 }, state)).toBe(false);
  });

  it('supports agility as a regular player stat', () => {
    const state = createInitialGameState();
    state.player.stats.agility = 30;
    expect(evaluateCondition({ type: 'statAtLeast', statId: 'agility', value: 30 }, state)).toBe(true);
  });

  it('supports NPC relationship upper bounds and interaction recency', () => {
    const state = createInitialGameState();
    state.ageMonths = 40;
    state.npcs.mira.relationship = -10;
    state.npcs.mira.lastInteractionAgeMonths = 28;
    expect(evaluateCondition({ type: 'npcRelationshipAtMost', npcId: 'mira', value: -5 }, state)).toBe(true);
    expect(evaluateCondition({ type: 'npcMonthsSinceInteractionAtLeast', npcId: 'mira', value: 12 }, state)).toBe(true);
    expect(evaluateCondition({ type: 'npcMonthsSinceInteractionAtMost', npcId: 'mira', value: 12 }, state)).toBe(true);
    expect(evaluateCondition({ type: 'npcMonthsSinceInteractionAtMost', npcId: 'mira', value: 11 }, state)).toBe(false);
  });

  it('returns false for both recency conditions when never interacted', () => {
    const state = createInitialGameState();
    state.npcs.mira.lastInteractionAgeMonths = null;
    expect(evaluateCondition({ type: 'npcMonthsSinceInteractionAtLeast', npcId: 'mira', value: 0 }, state)).toBe(false);
    expect(evaluateCondition({ type: 'npcMonthsSinceInteractionAtMost', npcId: 'mira', value: 999 }, state)).toBe(false);
  });

  it('queries only the active Log Pose and companion slots', () => {
    const state = createInitialGameState();
    state.player.inventory.stacks = [{ itemId: 'triple_log_pose', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] }];
    state.player.logPose = { itemId: 'paradise_log_pose', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] };
    expect(evaluateCondition({ type: 'activeLogPoseIs', logPoseType: 'paradise' }, state, contentCatalog)).toBe(true);
    expect(evaluateCondition({ type: 'activeLogPoseIs', logPoseType: 'new_world' }, state, contentCatalog)).toBe(false);
    expect(evaluateCondition({ type: 'hasActiveCompanion' }, state, contentCatalog)).toBe(false);
    expect(evaluateCondition({ type: 'activeCompanionIs', itemId: 'test_puppy' }, state, contentCatalog)).toBe(false);

    state.player.companion = {
      itemId: 'test_puppy',
      quantity: 1,
      provenance: [{ locationId: null, quantity: 1 }],
    };
    expect(evaluateCondition({ type: 'hasActiveCompanion' }, state, contentCatalog)).toBe(true);
    expect(evaluateCondition({ type: 'activeCompanionIs', itemId: 'test_puppy' }, state, contentCatalog)).toBe(true);
  });

  it('uses the real economy rule for canSellShip without requiring pendingShip', () => {
    const state = createInitialGameState();
    const fullShipMarket = contentCatalog.locations.find(({ shipMarket }) => shipMarket === 'full');
    expect(fullShipMarket).toBeDefined();

    state.locationId = fullShipMarket!.id;
    state.isLeader = true;
    state.pendingShip = null;
    state.passengerNpcIds = [];
    state.ship = { shipId: 'dinghy', name: 'Test', health: 18, cargo: [] };

    expect(evaluateCondition({ type: 'canSellShip' }, state, contentCatalog)).toBe(true);
  });
});