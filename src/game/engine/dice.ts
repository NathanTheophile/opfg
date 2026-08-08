import type { DiceBand, DiceCheck, Outcome } from '../content/schema';
import type { GameState } from '../model/schema';
import { evaluateCondition } from './conditions';
import { nextRandom } from './rng';

export interface AppliedDiceModifier {
  label: string;
  value: number;
  displayInfluence: string;
}

export interface DiceRollResult {
  rawRoll: number;
  modifiers: AppliedDiceModifier[];
  modifierTotal: number;
  total: number;
  outcomeId: string;
}

export interface DiceCheckResult {
  outcome: Outcome;
  dice: DiceRollResult;
  nextRngState: number;
}

export function rollD20(rngState: number): { rawRoll: number; nextRngState: number } {
  const random = nextRandom(rngState);
  return {
    rawRoll: Math.floor(random.value * 20) + 1,
    nextRngState: random.nextState,
  };
}

export function resolveDiceCheck(check: DiceCheck, state: GameState): DiceCheckResult {
  const { rawRoll, nextRngState } = rollD20(state.rngState);
  const modifiers = check.modifiers.flatMap((modifier): AppliedDiceModifier[] => {
    if (modifier.type === 'statModifier') {
      const stat = state.player.stats[modifier.statId];
      if (stat === null) throw new Error(`Cannot use inactive stat "${modifier.statId}" in a DiceCheck.`);
      return [{
        label: modifier.displayLabel,
        value: stat * modifier.multiplier,
        displayInfluence: modifier.displayInfluence,
      }];
    }
    if (!evaluateCondition(modifier.condition, state)) return [];
    return [{
      label: modifier.displayLabel,
      value: modifier.value,
      displayInfluence: modifier.displayInfluence,
    }];
  });
  const modifierTotal = modifiers.reduce((sum, modifier) => sum + modifier.value, 0);
  const total = rawRoll + modifierTotal;
  const outcome = selectDiceOutcome(check.bands, total);

  return {
    outcome,
    nextRngState,
    dice: { rawRoll, modifiers, modifierTotal, total, outcomeId: outcome.id },
  };
}

export function selectDiceOutcome(bands: readonly DiceBand[], total: number): Outcome {
  const band = bands.find(({ maxInclusive }) => maxInclusive === null || total <= maxInclusive);
  if (!band) throw new Error(`No DiceBand matches total ${total}.`);
  return band.outcome;
}
