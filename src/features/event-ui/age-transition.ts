import type { GameState } from '@/game/model/schema';

export interface AgeTransition {
  fromAge: number;
  toAge: number;
}

type AgeTransitionState = Pick<
  GameState,
  'ageMonths' | 'careerPhase'
>;

export function getChildhoodAgeTransition(
  before: AgeTransitionState | null,
  after: AgeTransitionState | null,
): AgeTransition | null {
  if (!before || !after) return null;
  if (before.careerPhase !== 'childhood') return null;

  const fromAge = Math.floor(before.ageMonths / 12);
  const toAge = Math.floor(after.ageMonths / 12);

  return toAge > fromAge
    ? { fromAge, toAge }
    : null;
}
