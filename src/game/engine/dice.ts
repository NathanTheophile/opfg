import type {
  DiceResolution,
  DiceResult,
  Outcome,
  StatId,
} from '../content/schema';
import type { GameState } from '../model/schema';
import { evaluateCondition } from './conditions';
import { nextRandom } from './rng';

export interface AppliedDiceModifier {
  labelKey: string;
  value: number;
}

export interface DiceRollResult {
  rawRoll: number;
  statId: StatId;
  statValue: number | null;
  statModifier: number;
  conditionalModifiers: AppliedDiceModifier[];
  modifierTotal: number;
  total: number;
  result: DiceResult;
  outcomeId: string;
  traitOverrideApplied?: boolean;
}

export interface DiceCheckResult {
  outcome: Outcome;
  dice: DiceRollResult;
  nextRngState: number;
}

export type DicePreview =
  | {
      available: true;
      statId: StatId;
      statValue: number;
      statModifier: number;
      knownModifierTotal: number;
      successProbability: number;
    }
  | { available: false; statId: StatId };

export function statToDiceModifier(statValue: number): number {
  if (statValue >= 20 && statValue <= 30) return 0;
  if (statValue > 30) return Math.ceil((statValue - 30) / 4);
  return -Math.ceil((20 - statValue) / 4);
}

export function rollD20(rngState: number): { rawRoll: number; nextRngState: number } {
  const random = nextRandom(rngState);
  return {
    rawRoll: Math.floor(random.value * 20) + 1,
    nextRngState: random.nextState,
  };
}

export function evaluateDiceRoll(
  resolution: DiceResolution,
  state: GameState,
  rawRoll: number,
  includeSecretOverrides = true,
  catalog?: import('../content/schema').ContentCatalog,
): DiceRollResult {
  if (rawRoll === 1) {
    const result = 'criticalFailure';
    return {
      rawRoll,
      statId: resolution.statId,
      statValue: null,
      statModifier: 0,
      conditionalModifiers: [],
      modifierTotal: 0,
      total: 1,
      result,
      outcomeId: resolution.outcomes[result].id,
    };
  }

  const statValue = state.player.stats[resolution.statId];
  if (statValue === null) throw new Error(`Cannot use inactive stat "${resolution.statId}" in a DiceCheck.`);
  const statModifier = statToDiceModifier(statValue);
  const conditionalModifiers = (resolution.modifiers ?? []).flatMap((modifier): AppliedDiceModifier[] =>
    evaluateCondition(modifier.condition, state, catalog)
      ? [{ labelKey: modifier.displayLabelKey, value: modifier.value }]
      : [],
  );
  const modifierTotal = statModifier + conditionalModifiers.reduce((sum, modifier) => sum + modifier.value, 0);
  const total = rawRoll + modifierTotal;
  let result: DiceResult = total >= 20
    ? 'criticalSuccess'
    : total >= resolution.successThreshold
      ? 'success'
      : 'failure';
  let traitOverrideApplied = false;

  if (includeSecretOverrides) {
    const forcedResults = new Set(
      (resolution.traitOverrides ?? [])
        .filter(({ traitId }) => state.player.traits.includes(traitId))
        .map(({ forceResult }) => forceResult),
    );
    if (forcedResults.size > 1) throw new Error('Active TraitResultOverrides force conflicting DiceResults.');
    const forcedResult = forcedResults.values().next().value as DiceResult | undefined;
    if (forcedResult !== undefined) {
      result = forcedResult;
      traitOverrideApplied = true;
    }
  }

  return {
    rawRoll,
    statId: resolution.statId,
    statValue,
    statModifier,
    conditionalModifiers,
    modifierTotal,
    total,
    result,
    outcomeId: resolution.outcomes[result].id,
    ...(traitOverrideApplied ? { traitOverrideApplied: true } : {}),
  };
}

export function resolveDiceCheck(resolution: DiceResolution, state: GameState, catalog?: import('../content/schema').ContentCatalog): DiceCheckResult {
  const { rawRoll, nextRngState } = rollD20(state.rngState);
  const dice = evaluateDiceRoll(resolution, state, rawRoll, true, catalog);
  return { outcome: resolution.outcomes[dice.result], dice, nextRngState };
}

export function getDicePreview(resolution: DiceResolution, state: GameState, catalog?: import('../content/schema').ContentCatalog): DicePreview {
  const statValue = state.player.stats[resolution.statId];
  if (statValue === null) return { available: false, statId: resolution.statId };
  const rolls = Array.from({ length: 20 }, (_, index) =>
    evaluateDiceRoll(resolution, state, index + 1, false, catalog),
  );
  const successes = rolls.filter(({ result }) => result === 'success' || result === 'criticalSuccess').length;
  const representative = rolls[1];
  return {
    available: true,
    statId: resolution.statId,
    statValue,
    statModifier: representative.statModifier,
    knownModifierTotal: representative.modifierTotal - representative.statModifier,
    successProbability: successes / 20,
  };
}
