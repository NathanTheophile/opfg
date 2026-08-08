import { describe, expect, it } from 'vitest';
import type { DiceCheck } from '../src/game/content/schema';
import { contentCatalog } from '../src/game/content/definitions';
import { resolveDiceCheck, rollD20, selectDiceOutcome } from '../src/game/engine/dice';
import { selectNextEvent } from '../src/game/engine/events';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';

const outcomes = {
  low: { id: 'low', text: 'Low', advanceMonths: 1, effects: [] },
  middle: { id: 'middle', text: 'Middle', advanceMonths: 1, effects: [] },
  high: { id: 'high', text: 'High', advanceMonths: 1, effects: [] },
};

const bands = [
  { maxInclusive: 7, outcome: outcomes.low },
  { maxInclusive: 14, outcome: outcomes.middle },
  { maxInclusive: null, outcome: outcomes.high },
];

describe('seeded d20', () => {
  it('is deterministic, stays within 1..20, and advances rngState', () => {
    for (let seed = 0; seed < 100; seed += 1) {
      const first = rollD20(seed);
      const second = rollD20(seed);

      expect(first).toEqual(second);
      expect(first.rawRoll).toBeGreaterThanOrEqual(1);
      expect(first.rawRoll).toBeLessThanOrEqual(20);
      expect(first.nextRngState).not.toBe(seed);
    }
  });
});

describe('dice modifiers', () => {
  const check: DiceCheck = {
    modifiers: [
      {
        type: 'statModifier',
        statId: 'navigation',
        multiplier: 2,
        displayLabel: 'Navigation',
        displayInfluence: 'strong',
      },
      {
        type: 'conditionalModifier',
        condition: { type: 'shipConditionAtMost', value: 2 },
        value: -3,
        displayLabel: 'Damaged ship',
        displayInfluence: 'penalty',
      },
    ],
    bands: [{ maxInclusive: null, outcome: outcomes.high }],
  };

  it('calculates stat modifiers and applies true conditional modifiers', () => {
    const state = createInitialGameState(10);
    state.player.stats.navigation = 3;
    state.ship.condition = 2;

    const result = resolveDiceCheck(check, state);

    expect(result.dice.modifiers).toEqual([
      { label: 'Navigation', value: 6, displayInfluence: 'strong' },
      { label: 'Damaged ship', value: -3, displayInfluence: 'penalty' },
    ]);
    expect(result.dice.modifierTotal).toBe(3);
    expect(result.dice.total).toBe(result.dice.rawRoll + 3);
  });

  it('omits false conditional modifiers', () => {
    const result = resolveDiceCheck(check, createInitialGameState(10));

    expect(result.dice.modifiers).toEqual([
      { label: 'Navigation', value: 2, displayInfluence: 'strong' },
    ]);
    expect(result.dice.modifierTotal).toBe(2);
  });
});

describe('dice bands', () => {
  it('includes exact thresholds and moves to the next band above them', () => {
    expect(selectDiceOutcome(bands, 7).id).toBe('low');
    expect(selectDiceOutcome(bands, 8).id).toBe('middle');
    expect(selectDiceOutcome(bands, 14).id).toBe('middle');
    expect(selectDiceOutcome(bands, 15).id).toBe('high');
    expect(selectDiceOutcome(bands, 100).id).toBe('high');
  });
});

describe('DiceResolution integration', () => {
  it('applies the selected outcome and exposes roll details without persisting them', () => {
    let state = selectNextEvent(createInitialGameState(123), contentCatalog.events);
    state = resolveChoice(state, contentCatalog.events, 'departure', 'set_sail').state;
    state = resolveChoice(state, contentCatalog.events, 'open_sea', 'recover_chart').state;
    state = resolveChoice(state, contentCatalog.events, 'delayed_warning', 'heed_warning').state;
    const rngBeforeRoll = state.rngState;

    const result = resolveChoice(state, contentCatalog.events, 'reefs', 'risk_crossing');

    expect(result.state).toMatchObject({ month: 3, careerStatus: 'ended', currentEventId: null });
    expect(result.state.rngState).not.toBe(rngBeforeRoll);
    expect(result.state.history.at(-1)).toEqual({
      eventId: 'reefs',
      choiceId: 'risk_crossing',
      outcomeId: result.outcome.id,
      month: 3,
    });
    expect(result.dice).toMatchObject({
      modifierTotal: 0,
      outcomeId: result.outcome.id,
    });
    expect(result.dice?.modifiers).toEqual([
      { label: 'Navigation', value: 2, displayInfluence: 'strong influence' },
      { label: 'Damaged ship', value: -2, displayInfluence: 'significant penalty' },
    ]);
    expect('lastRoll' in result.state).toBe(false);
    expect('lastOutcome' in result.state).toBe(false);
  });
});
