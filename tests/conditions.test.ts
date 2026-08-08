import { describe, expect, it } from 'vitest';
import type { Condition } from '../src/game/content/schema';
import { evaluateCondition, getChoiceState } from '../src/game/engine/conditions';
import { createInitialGameState } from '../src/game/model/initialState';

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
    [{ type: 'hasTrait', traitId: 'steady_nerves' }, false],
    [{ type: 'hasItem', itemId: 'sealed_chart' }, false],
    [{ type: 'monthAtLeast', value: 1 }, false],
  ] satisfies [Condition, boolean][])('evaluates %s', (condition, expected) => {
    expect(evaluateCondition(condition, createInitialGameState())).toBe(expected);
  });

  it('returns false for conditions targeting an absent NPC', () => {
    const state = createInitialGameState();

    expect(evaluateCondition({ type: 'npcStatusIs', npcId: 'mira', status: 'known' }, state)).toBe(false);
    expect(evaluateCondition({ type: 'npcRelationshipAtLeast', npcId: 'mira', value: -100 }, state)).toBe(false);
  });

  it('evaluates NPC relationship and hasChosen from state history', () => {
    const state = createInitialGameState();
    state.npcs.mira = { status: 'crew', relationship: 40 };
    state.history.push({ eventId: 'departure', choiceId: 'set_sail', outcomeId: 'left_port', month: 1 });

    expect(evaluateCondition({ type: 'npcRelationshipAtLeast', npcId: 'mira', value: 40 }, state)).toBe(true);
    expect(evaluateCondition({ type: 'hasChosen', eventId: 'departure', choiceId: 'set_sail' }, state)).toBe(true);
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
          availableIf: { type: 'statAtLeast', statId: 'navigation', value: 3 },
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
