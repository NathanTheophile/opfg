import type { ChoiceDefinition } from '../content/schema';
import { nextRandom } from '../engine/rng';

export interface SimulationChoice {
  choice: ChoiceDefinition;
  nextRngState: number;
}

export interface SimulationPolicy {
  readonly id: string;
  choose(choices: readonly ChoiceDefinition[], rngState: number): SimulationChoice;
}

export const randomSimulationPolicy: SimulationPolicy = {
  id: 'random',
  choose(choices, rngState) {
    if (choices.length === 0) throw new Error('No available Choice for the selected Event.');
    if (choices.length === 1) return { choice: choices[0], nextRngState: rngState };
    const random = nextRandom(rngState);
    return {
      choice: choices[Math.floor(random.value * choices.length)],
      nextRngState: random.nextState,
    };
  },
};

export function derivePolicySeed(gameplaySeed: number): number {
  return (gameplaySeed ^ 0x9e3779b9) >>> 0;
}
