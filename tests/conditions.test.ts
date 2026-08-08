import { describe, expect, it } from 'vitest';
import type { Condition } from '../src/game/content/schema';
import { evaluateCondition, getChoiceState } from '../src/game/engine/conditions';
import { createInitialGameState } from '../src/game/model/initialState';
import { createDefaultNpcStats } from '../src/game/model/npcState';

describe('evaluateCondition', () => {
  it('evaluates all, any, and not including empty compositions', () => {
    const state = createInitialGameState();

    expect(evaluateCondition({ type: 'all', conditions: [] }, state)).toBe(true);
    expect(evaluateCondition({ type: 'any', conditions: [] }, state)).toBe(false);
    expect(
      evaluateCondition(
        {
          type: 'all',
          conditions: [
            { type: 'not', condition: { type: 'hasFlag', flagId: 'blocked' } },
            { type: 'any', conditions: [{ type: 'locationIs', locationId: 'starter_port' }] },
          ],
        },
        state,
      ),
    ).toBe(true);
  });

  it.each([
    [{ type: 'statAtLeast', statId: 'navigation', value: 1 }, true],
    [{ type: 'hasTrait', traitId: 'audacious' }, false],
    [{ type: 'hasItem', itemId: 'sealed_chart' }, false],
    [{ type: 'monthAtLeast', value: 1 }, false],
  ] satisfies [Condition, boolean][])('evaluates %s', (condition, expected) => {
    expect(evaluateCondition(condition, createInitialGameState())).toBe(expected);
  });

  it('returns false for conditions targeting an absent NPC', () => {
    const state = createInitialGameState();

    expect(evaluateCondition({ type: 'npcStatusIs', npcId: 'absent', status: 'known' }, state)).toBe(false);
    expect(evaluateCondition({ type: 'npcRelationshipAtLeast', npcId: 'absent', value: -100 }, state)).toBe(false);
    expect(evaluateCondition({ type: 'npcStatAtLeast', npcId: 'absent', statId: 'loyalty', value: 0 }, state)).toBe(false);
  });

  it('evaluates NPC stats at exact boundaries independently from relationship', () => {
    const state = createInitialGameState();
    state.npcs.mira.relationship = -30;
    state.npcs.mira.stats.loyalty = 30;

    expect(evaluateCondition({ type: 'npcStatAtLeast', npcId: 'mira', statId: 'loyalty', value: 30 }, state)).toBe(true);
    expect(evaluateCondition({ type: 'npcStatAtLeast', npcId: 'mira', statId: 'loyalty', value: 31 }, state)).toBe(false);
    expect(evaluateCondition({ type: 'npcRelationshipAtLeast', npcId: 'mira', value: 0 }, state)).toBe(false);
  });

  it('evaluates new core stats and handles inactive awakening', () => {
    const state = createInitialGameState();

    expect(evaluateCondition({ type: 'statAtLeast', statId: 'navigation', value: 25 }, state)).toBe(true);
    expect(evaluateCondition({ type: 'statAtLeast', statId: 'charisma', value: 25 }, state)).toBe(true);
    expect(evaluateCondition({ type: 'statAtLeast', statId: 'awakening', value: 0 }, state)).toBe(false);
    state.player.stats.awakening = 5;
    expect(evaluateCondition({ type: 'statAtLeast', statId: 'awakening', value: 5 }, state)).toBe(true);
  });

  it('evaluates career phase, age boundaries, and geography', () => {
    const state = createInitialGameState();

    expect(evaluateCondition({ type: 'careerPhaseIs', phase: 'active' }, state)).toBe(true);
    expect(evaluateCondition({ type: 'ageAtLeastMonths', value: 180 }, state)).toBe(true);
    expect(evaluateCondition({ type: 'ageAtMostMonths', value: 180 }, state)).toBe(true);
    expect(evaluateCondition({ type: 'ageAtLeastMonths', value: 181 }, state)).toBe(false);
    expect(evaluateCondition({ type: 'ageAtMostMonths', value: 179 }, state)).toBe(false);
    expect(evaluateCondition({ type: 'isOnLand' }, state)).toBe(true);
    expect(evaluateCondition({ type: 'isAtSea' }, state)).toBe(false);
    expect(evaluateCondition({ type: 'locationIs', locationId: 'starter_port' }, state)).toBe(true);
  });

  it('evaluates NPC relationship and hasChosen from state history', () => {
    const state = createInitialGameState();
    state.npcs.mira = { status: 'crew', relationship: 40, stats: createDefaultNpcStats() };
    state.history.push({ eventId: 'departure', choiceId: 'set_sail', outcomeId: 'left_port', month: 1 });

    expect(evaluateCondition({ type: 'npcRelationshipAtLeast', npcId: 'mira', value: 40 }, state)).toBe(true);
    expect(evaluateCondition({ type: 'hasChosen', eventId: 'departure', choiceId: 'set_sail' }, state)).toBe(true);
  });

  it('keeps hasPlayed, hasChosen, and hasOutcome semantics distinct', () => {
    const state = createInitialGameState();
    state.history.push({ eventId: 'event_a', choiceId: 'choice_x', outcomeId: 'failure', month: 1 });

    expect(evaluateCondition({ type: 'hasPlayed', eventId: 'event_a' }, state)).toBe(true);
    expect(evaluateCondition({ type: 'hasChosen', eventId: 'event_a', choiceId: 'choice_x' }, state)).toBe(true);
    expect(evaluateCondition({ type: 'hasChosen', eventId: 'event_a', choiceId: 'choice_y' }, state)).toBe(false);
    expect(evaluateCondition({ type: 'hasOutcome', eventId: 'event_a', outcomeId: 'failure' }, state)).toBe(true);
    expect(evaluateCondition({ type: 'hasOutcome', eventId: 'event_a', outcomeId: 'success' }, state)).toBe(false);
  });
});

describe('getChoiceState', () => {
  it('distinguishes hidden, locked, and available choices', () => {
    const state = createInitialGameState();
    const outcome = { id: 'done', text: 'Done', advanceMonths: 0, effects: [] };

    expect(getChoiceState({ id: 'open', text: 'Open', resolution: { type: 'deterministic', outcome } }, state)).toEqual({
      visible: true,
      available: true,
    });
    expect(
      getChoiceState(
        {
          id: 'locked',
          text: 'Locked',
          availableIf: { type: 'statAtLeast', statId: 'navigation', value: 35 },
          resolution: { type: 'deterministic', outcome },
        },
        state,
      ),
    ).toEqual({ visible: true, available: false });
    expect(
      getChoiceState(
        {
          id: 'hidden',
          text: 'Hidden',
          visibleIf: { type: 'hasTrait', traitId: 'missing' },
          resolution: { type: 'deterministic', outcome },
        },
        state,
      ),
    ).toEqual({ visible: false, available: false });
  });
});
