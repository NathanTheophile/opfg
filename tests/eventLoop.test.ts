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

describe('deterministic resolution', () => {
  it('plays all three temporary events with effects, post-advance history, and next selection', () => {
    let state = selectNextEvent(createInitialGameState(), contentCatalog.events);
    expect(state.currentEventId).toBe('departure');

    state = resolveChoice(state, contentCatalog.events, 'departure', 'set_sail').state;
    expect(state).toMatchObject({ month: 1, locationId: 'open_sea', currentEventId: 'open_sea' });
    expect(state.flags).toContain('left_starter_port');
    expect(state.scheduledEvents).toEqual([
      {
        eventId: 'delayed_warning',
        dueMonth: 2,
        sourceEventId: 'departure',
        sourceChoiceId: 'set_sail',
      },
    ]);
    expect(state.history[0]).toEqual({
      eventId: 'departure',
      choiceId: 'set_sail',
      outcomeId: 'left_port',
      month: 1,
    });

    state = resolveChoice(state, contentCatalog.events, 'open_sea', 'recover_chart').state;
    expect(state).toMatchObject({ month: 2, locationId: 'reefs', currentEventId: 'delayed_warning' });
    expect(state.items).toContain('sealed_chart');

    state = resolveChoice(state, contentCatalog.events, 'delayed_warning', 'heed_warning').state;
    expect(state).toMatchObject({ month: 2, currentEventId: 'reefs' });
    expect(state.scheduledEvents).toEqual([]);

    const finalResult = resolveChoice(state, contentCatalog.events, 'reefs', 'use_chart');
    state = finalResult.state;
    expect(state).toMatchObject({ month: 3, careerStatus: 'ended', currentEventId: null });
    expect(state.items).not.toContain('sealed_chart');
    expect(state.history).toHaveLength(4);
    expect(finalResult.outcome.id).toBe('chart_crossing');
    expect(finalResult.dice).toBeUndefined();
  });

  it('rejects a locked choice even when called directly', () => {
    let state = selectNextEvent(createInitialGameState(), contentCatalog.events);
    state = resolveChoice(state, contentCatalog.events, 'departure', 'set_sail').state;
    state = resolveChoice(state, contentCatalog.events, 'open_sea', 'recover_chart').state;
    state = resolveChoice(state, contentCatalog.events, 'delayed_warning', 'heed_warning').state;

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
            check: {
              modifiers: [],
              bands: [
                {
                  maxInclusive: null,
                  outcome: { id: 'rolled', text: 'Rolled', advanceMonths: 0, effects: [] },
                },
              ],
            },
          },
        },
      ],
    };
    const state = selectNextEvent(createInitialGameState(), [diceEvent]);

    const result = resolveChoice(state, [diceEvent], 'dice', 'roll');

    expect(result.state).toMatchObject({ month: 0, currentEventId: null });
    expect(result.state.history[0].outcomeId).toBe('rolled');
    expect(result.outcome.id).toBe('rolled');
    expect(result.dice).toMatchObject({ outcomeId: 'rolled', modifierTotal: 0 });
  });
});
