import { describe, expect, it } from 'vitest';
import type { EventDefinition } from '../src/game/content/schema';
import { isNormalOccurrenceEligible } from '../src/game/engine/events';
import { createInitialGameState } from '../src/game/model/initialState';

const normal = (replay?: { cooldownMonths: number; maxOccurrences?: number }): Extract<EventDefinition, { kind: 'normal' }> => ({
  id: 'evergreen', kind: 'normal', replay, titleKey: 'x', textKey: 'x', choices: [],
});

const played = (ages: number[]) => {
  const state = createInitialGameState(1);
  state.ageMonths = 100;
  state.history = ages.map((ageMonths) => ({ eventId: 'evergreen', choiceId: 'go', outcomeId: 'done', ageMonths }));
  return state;
};

describe('Normal Event replay eligibility', () => {
  it('keeps Events without replay one-shot', () => {
    expect(isNormalOccurrenceEligible(normal(), played([]))).toBe(true);
    expect(isNormalOccurrenceEligible(normal(), played([1]))).toBe(false);
  });

  it('uses the last occurrence for the cooldown boundary', () => {
    expect(isNormalOccurrenceEligible(normal({ cooldownMonths: 24 }), played([10, 77]))).toBe(false);
    expect(isNormalOccurrenceEligible(normal({ cooldownMonths: 24 }), played([10, 76]))).toBe(true);
  });

  it('counts the first occurrence toward maxOccurrences', () => {
    expect(isNormalOccurrenceEligible(normal({ cooldownMonths: 1, maxOccurrences: 2 }), played([1]))).toBe(true);
    expect(isNormalOccurrenceEligible(normal({ cooldownMonths: 1, maxOccurrences: 2 }), played([1, 2]))).toBe(false);
  });
});
