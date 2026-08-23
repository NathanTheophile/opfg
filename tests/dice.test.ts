import { describe, expect, it } from 'vitest';
import type { DiceResolution, EventDefinition, Outcome } from '../src/game/content/schema';
import { contentCatalog } from '../src/game/content/definitions';
import {
  evaluateDiceRoll,
  getDicePreview,
  resolveDiceCheck,
  rollD20,
  statToDiceModifier,
} from '../src/game/engine/dice';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';

function outcome(id: string): Outcome {
  return { id, textKey: 'fixture.childhood.outcome', effects: [] };
}

function resolution(overrides: Partial<DiceResolution> = {}): DiceResolution {
  return {
    type: 'dice',
    statId: 'navigation',
    successThreshold: 14,
    outcomes: {
      criticalFailure: outcome('critical_failure'),
      failure: outcome('failure'),
      success: outcome('success'),
      criticalSuccess: outcome('critical_success'),
    },
    ...overrides,
  };
}

describe('statToDiceModifier', () => {
  it.each([
    [0, -5], [3, -5], [4, -4], [7, -4], [8, -3], [11, -3], [12, -2], [15, -2],
    [16, -1], [19, -1], [20, 0], [25, 0], [30, 0], [31, 1], [34, 1], [35, 2],
    [38, 2], [39, 3], [42, 3], [43, 4], [46, 4], [47, 5], [50, 5],
  ])('maps %i to %i', (value, expected) => {
    expect(statToDiceModifier(value)).toBe(expected);
  });
});

describe('seeded d20', () => {
  it('is deterministic, stays within 1..20, and advances rngState', () => {
    for (let seed = 0; seed < 100; seed += 1) {
      const first = rollD20(seed);
      expect(first).toEqual(rollD20(seed));
      expect(first.rawRoll).toBeGreaterThanOrEqual(1);
      expect(first.rawRoll).toBeLessThanOrEqual(20);
      expect(first.nextRngState).not.toBe(seed);
    }
  });
});

describe('vNext roll evaluation', () => {
  it('makes raw 1 an absolute critical failure before bonuses or legacy Trait overrides', () => {
    const state = createInitialGameState();
    state.player.stats.navigation = 50;
    state.player.traits = ['lucky'];
    const check = resolution({
      modifiers: [{ condition: { type: 'hasFlag', flagId: 'bonus' }, value: 100, displayLabelKey: 'test.bonus' }],
      traitOverrides: [{ traitId: 'lucky', forceResult: 'criticalSuccess' }],
    });
    state.flags = ['bonus'];

    const result = evaluateDiceRoll(check, state, 1);
    expect(result).toMatchObject({ result: 'criticalFailure', total: 1, modifierTotal: 0 });
    expect('traitOverrideApplied' in result).toBe(false);
  });

  it('never makes raw 2 a critical failure, including with a legacy Trait override', () => {
    const state = createInitialGameState();
    state.player.stats.navigation = 0;
    state.player.traits = ['clumsy'];
    const check = resolution({
      traitOverrides: [{ traitId: 'clumsy', forceResult: 'criticalFailure' }],
    });

    expect(evaluateDiceRoll(check, state, 2)).toMatchObject({
      rawRoll: 2,
      statModifier: -5,
      total: -3,
      result: 'failure',
    });
  });

  it('makes raw 19 a critical success when the Stat bonus raises the total to 20', () => {
    const state = createInitialGameState();
    state.player.stats.navigation = 31;

    expect(evaluateDiceRoll(resolution(), state, 19)).toMatchObject({
      rawRoll: 19,
      statModifier: 1,
      total: 20,
      result: 'criticalSuccess',
    });
  });

  it('keeps raw 19 at normal success when the final total is 19', () => {
    const state = createInitialGameState();
    state.player.stats.navigation = 25;
    state.player.traits = ['lucky'];
    const check = resolution({
      traitOverrides: [{ traitId: 'lucky', forceResult: 'criticalSuccess' }],
    });

    expect(evaluateDiceRoll(check, state, 19)).toMatchObject({
      rawRoll: 19,
      statModifier: 0,
      total: 19,
      result: 'success',
    });
  });

  it('makes a low raw roll critical when explicit bonuses raise the final total to 20', () => {
    const state = createInitialGameState();
    state.flags = ['large_bonus'];
    const check = resolution({
      modifiers: [{ condition: { type: 'hasFlag', flagId: 'large_bonus' }, value: 15, displayLabelKey: 'test.bonus' }],
    });

    expect(evaluateDiceRoll(check, state, 5)).toMatchObject({
      rawRoll: 5,
      modifierTotal: 15,
      total: 20,
      result: 'criticalSuccess',
    });
  });

  it('does not make a natural 20 critical when a malus lowers total below 20', () => {
    const state = createInitialGameState();
    state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
    state.ship.health = 10;
    const check = resolution({
      successThreshold: 13,
      modifiers: [{ condition: { type: 'shipHealthAtMost', value: 10 }, value: -3, displayLabelKey: 'test.ship' }],
    });

    expect(evaluateDiceRoll(check, state, 20)).toMatchObject({ total: 17, result: 'success' });
  });
});

describe('probability preview', () => {
  it('evaluates all 20 rolls, excludes secret Traits, and caps normal success at 95%', () => {
    const state = createInitialGameState();
    state.flags = ['huge_bonus'];
    state.player.traits = ['clumsy'];
    const check = resolution({
      successThreshold: 2,
      modifiers: [{ condition: { type: 'hasFlag', flagId: 'huge_bonus' }, value: 100, displayLabelKey: 'test.bonus' }],
      traitOverrides: [{ traitId: 'clumsy', forceResult: 'criticalFailure' }],
    });

    expect(getDicePreview(check, state)).toMatchObject({ available: true, successProbability: 0.95 });
  });
});

describe('DiceResolution integration', () => {
  it('uses agility without special-case handling', () => {
    const state = createInitialGameState();
    state.player.stats.agility = 35;
    expect(evaluateDiceRoll(resolution({ statId: 'agility' }), state, 12)).toMatchObject({
      statId: 'agility', statValue: 35, statModifier: 2,
    });
  });

  it('executes the Outcome keyed by the same DiceResult consumed by the UI', () => {
    const resolvedOutcomes: DiceResolution['outcomes'] = {
      criticalFailure: { ...outcome('critical_failure'), effects: [{ type: 'setFlag', flagId: 'executed_critical_failure' }] },
      failure: { ...outcome('failure'), effects: [{ type: 'setFlag', flagId: 'executed_failure' }] },
      success: { ...outcome('success'), effects: [{ type: 'setFlag', flagId: 'executed_success' }] },
      criticalSuccess: { ...outcome('critical_success'), effects: [{ type: 'setFlag', flagId: 'executed_critical_success' }] },
    };
    const event: EventDefinition = {
      id: 'dice_fixture',
      kind: 'normal',
      titleKey: 'fixture.title',
      textKey: 'fixture.text',
      choices: [{
        id: 'roll',
        textKey: 'fixture.choice',
        resolution: resolution({ outcomes: resolvedOutcomes }),
      }],
    };
    const catalog = { ...contentCatalog, events: [...contentCatalog.events, event] };
    const state = createInitialGameState(123);
    state.currentEventId = 'dice_fixture';
    const rngBeforeRoll = state.rngState;

    const result = resolveChoice(state, catalog, 'dice_fixture', 'roll');
    expect(result.dice).toBeDefined();
    const dice = result.dice!;
    const displayedOutcome = resolvedOutcomes[dice.result];

    expect(result.state.rngState).not.toBe(rngBeforeRoll);
    expect(dice).toMatchObject({ statId: 'navigation', statValue: 25, outcomeId: result.outcome.id });
    expect(result.outcome.id).toBe(displayedOutcome.id);
    expect(result.state.flags).toContain(`executed_${displayedOutcome.id}`);
    expect(result.state.history[result.state.history.length - 1]?.outcomeId).toBe(displayedOutcome.id);
    expect('lastRoll' in result.state).toBe(false);
  });

  it('is deterministic across identical state and resolution', () => {
    const check = resolution();
    const first = createInitialGameState(456);
    const second = structuredClone(first);
    expect(resolveDiceCheck(check, first)).toEqual(resolveDiceCheck(check, second));
  });
});
