import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import type { EventDefinition } from '../src/game/content/schema';
import { selectNextEvent } from '../src/game/engine/events';
import { resolveChoice } from '../src/game/engine/resolution';
import { nextRandom } from '../src/game/engine/rng';
import { createInitialGameState } from '../src/game/model/initialState';

function event(id: string, priority: number, eligibility?: EventDefinition['eligibility']): EventDefinition {
  return {
    id,
    title: id,
    text: id,
    priority,
    eligibility,
    choices: [
      {
        id: 'continue',
        text: 'Continue',
        resolution: {
          type: 'deterministic',
          outcome: { id: 'done', text: 'Done', advanceMonths: 0, effects: [] },
        },
      },
    ],
  };
}

describe('normal event selection', () => {
  it('excludes played and ineligible events, then keeps maximum priority', () => {
    const state = createInitialGameState();
    state.history.push({ eventId: 'played', choiceId: 'continue', outcomeId: 'done', month: 0 });
    const selected = selectNextEvent(state, [
      event('played', 100),
      event('ineligible', 90, { type: 'hasFlag', flagId: 'missing' }),
      event('low', 1),
      event('high', 10),
    ]);

    expect(selected.currentEventId).toBe('high');
    expect(selected.rngState).toBe(state.rngState);
  });

  it('uses deterministic RNG for priority ties and advances its state', () => {
    const first = createInitialGameState(123);
    const second = createInitialGameState(123);
    const events = [event('a', 10), event('b', 10)];

    const firstResult = selectNextEvent(first, events);
    const secondResult = selectNextEvent(second, events);

    expect(firstResult.currentEventId).toBe(secondResult.currentEventId);
    expect(firstResult.rngState).toBe(secondResult.rngState);
    expect(firstResult.rngState).not.toBe(first.rngState);
    expect(nextRandom(123)).toEqual(nextRandom(123));
  });
});

describe('catalog resolution', () => {
  it('starts the real Slice 0 with departure followed by Mira Castaway', () => {
    let state = selectNextEvent(createInitialGameState(), contentCatalog.events);
    expect(state.currentEventId).toBe('departure');

    state = resolveChoice(state, contentCatalog.events, 'departure', 'set_sail').state;
    expect(state).toMatchObject({
      ageMonths: 181,
      month: 1,
      travelState: 'at_sea',
      locationId: 'open_sea',
      currentEventId: 'mira_castaway',
    });
    expect(state.flags).toContain('career_departed');
    expect(state.history[0]).toEqual({
      eventId: 'departure',
      choiceId: 'set_sail',
      outcomeId: 'departure_set_sail',
      month: 1,
    });

    const result = resolveChoice(state, contentCatalog.events, 'mira_castaway', 'rescue_recruit');
    expect(result.state.currentEventId).toBe('black_squall');
    expect(result.state.npcs.mira).toEqual({ status: 'crew', relationship: 25 });
    expect(result.dice).toBeUndefined();
  });

  it('rejects a locked choice even when called directly', () => {
    const state = createInitialGameState();
    state.currentEventId = 'reefs';

    expect(() => resolveChoice(state, contentCatalog.events, 'reefs', 'read_currents')).toThrow(
      'Choice "read_currents" is not available.',
    );
  });

  it('resolves DiceResolution and returns its transient roll details', () => {
    const diceEvent: EventDefinition = {
      ...event('dice', 1),
      choices: [
        {
          id: 'roll',
          text: 'Roll',
          resolution: {
            type: 'dice',
            statId: 'navigation',
            successThreshold: 13,
            outcomes: {
              criticalFailure: { id: 'critical_failure', text: 'Critical failure', advanceMonths: 0, effects: [] },
              failure: { id: 'failure', text: 'Failure', advanceMonths: 0, effects: [] },
              success: { id: 'success', text: 'Success', advanceMonths: 0, effects: [] },
              criticalSuccess: { id: 'critical_success', text: 'Critical success', advanceMonths: 0, effects: [] },
            },
          },
        },
      ],
    };
    const state = selectNextEvent(createInitialGameState(), [diceEvent]);

    const result = resolveChoice(state, [diceEvent], 'dice', 'roll');

    expect(result.state).toMatchObject({ month: 0, currentEventId: null });
    expect(result.state.history[0].outcomeId).toBe(result.outcome.id);
    expect(['critical_failure', 'failure', 'success', 'critical_success']).toContain(result.outcome.id);
    expect(result.dice).toMatchObject({ outcomeId: result.outcome.id, modifierTotal: 0 });
  });

  it('advances age in childhood without advancing active-career month', () => {
    const childhoodEvent: EventDefinition = {
      ...event('childhood_time', 1),
      choices: [{
        id: 'grow',
        text: 'Grow',
        resolution: {
          type: 'deterministic',
          outcome: { id: 'one_year', text: 'One year passes.', advanceMonths: 12, effects: [] },
        },
      }],
    };
    const state = createInitialGameState();
    state.careerPhase = 'childhood';
    state.ageMonths = 120;
    state.currentEventId = childhoodEvent.id;

    const result = resolveChoice(state, [childhoodEvent], childhoodEvent.id, 'grow').state;

    expect(result).toMatchObject({ careerPhase: 'childhood', ageMonths: 132, month: 0 });
    expect(result.history[0].month).toBe(0);
  });

  it('advances absolute age and career month together in the active phase', () => {
    const activeEvent: EventDefinition = {
      ...event('active_time', 1),
      choices: [{
        id: 'advance',
        text: 'Advance',
        resolution: {
          type: 'deterministic',
          outcome: { id: 'three_months', text: 'Three months pass.', advanceMonths: 3, effects: [] },
        },
      }],
    };
    const state = createInitialGameState();
    state.currentEventId = activeEvent.id;

    const result = resolveChoice(state, [activeEvent], activeEvent.id, 'advance').state;

    expect(result).toMatchObject({ careerPhase: 'active', ageMonths: 183, month: 3 });
    expect(result.history[0].month).toBe(3);
  });
});
