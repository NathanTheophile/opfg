import { describe, expect, it } from 'vitest';
import { getChildhoodAgeTransition } from './age-transition';

const state = (
  ageMonths: number,
  careerPhase: 'origins' | 'childhood' | 'active',
) => ({ ageMonths, careerPhase });

describe('getChildhoodAgeTransition', () => {
  it('detects a whole-year childhood birthday', () => {
    expect(
      getChildhoodAgeTransition(
        state(96, 'childhood'),
        state(108, 'childhood'),
      ),
    ).toEqual({ fromAge: 8, toAge: 9 });
  });

  it('does not trigger on the first six-month slot from age 9 onward', () => {
    expect(
      getChildhoodAgeTransition(
        state(108, 'childhood'),
        state(114, 'childhood'),
      ),
    ).toBeNull();
  });

  it('triggers when the second six-month slot crosses the birthday', () => {
    expect(
      getChildhoodAgeTransition(
        state(114, 'childhood'),
        state(120, 'childhood'),
      ),
    ).toEqual({ fromAge: 9, toAge: 10 });
  });

  it('includes the childhood-to-active transition at age 15', () => {
    expect(
      getChildhoodAgeTransition(
        state(174, 'childhood'),
        state(180, 'active'),
      ),
    ).toEqual({ fromAge: 14, toAge: 15 });
  });

  it('does not trigger when entering childhood from origins', () => {
    expect(
      getChildhoodAgeTransition(
        state(0, 'origins'),
        state(12, 'childhood'),
      ),
    ).toBeNull();
  });

  it('does not trigger for active monthly progression', () => {
    expect(
      getChildhoodAgeTransition(
        state(180, 'active'),
        state(181, 'active'),
      ),
    ).toBeNull();
  });
});
