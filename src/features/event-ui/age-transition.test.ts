import { describe, expect, it } from 'vitest';
import { getAgeTransition } from './age-transition';

const state = (
  ageMonths: number,
  careerPhase: 'origins' | 'childhood' | 'active',
) => ({ ageMonths, careerPhase });

describe('getAgeTransition', () => {
  it('detects a whole-year childhood birthday', () => {
    expect(
      getAgeTransition(
        state(96, 'childhood'),
        state(108, 'childhood'),
      ),
    ).toEqual({ fromAge: 8, toAge: 9 });
  });

  it('does not trigger on the first six-month childhood slot', () => {
    expect(
      getAgeTransition(
        state(108, 'childhood'),
        state(114, 'childhood'),
      ),
    ).toBeNull();
  });

  it('includes the childhood-to-active birthday at age 15', () => {
    expect(
      getAgeTransition(
        state(174, 'childhood'),
        state(180, 'active'),
      ),
    ).toEqual({ fromAge: 14, toAge: 15 });
  });

  it('detects Active birthdays', () => {
    expect(
      getAgeTransition(
        state(191, 'active'),
        state(192, 'active'),
      ),
    ).toEqual({ fromAge: 15, toAge: 16 });
  });

  it('does not trigger during ordinary Active monthly progression', () => {
    expect(
      getAgeTransition(
        state(190, 'active'),
        state(191, 'active'),
      ),
    ).toBeNull();
  });

  it('does not trigger when entering childhood from Origins', () => {
    expect(
      getAgeTransition(
        state(0, 'origins'),
        state(12, 'childhood'),
      ),
    ).toBeNull();
  });
});
