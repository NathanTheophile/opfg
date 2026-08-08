import { describe, expect, it } from 'vitest';
import { evaluateCondition } from '../src/game/engine/conditions';
import { createInitialGameState } from '../src/game/model/initialState';

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
    expect(evaluateCondition({ type: 'shipConditionAtLeast', value: 0 }, state)).toBe(false);
    expect(evaluateCondition({ type: 'shipConditionAtMost', value: 3 }, state)).toBe(false);
  });
});
