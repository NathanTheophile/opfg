import { describe, expect, it } from 'vitest';
import type { EventDefinition } from '../src/game/content/schema';
import { selectNextEvent } from '../src/game/engine/events';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';

function event(
  id: string,
  priority: number,
  scheduledOnly = false,
  eligibility?: EventDefinition['eligibility'],
): EventDefinition {
  return {
    id,
    title: id,
    text: id,
    priority,
    scheduledOnly,
    eligibility,
    choices: [
      {
        id: 'resolve',
        text: 'Resolve',
        resolution: {
          type: 'deterministic',
          outcome: { id: 'resolved', text: 'Resolved', advanceMonths: 0, effects: [] },
        },
      },
    ],
  };
}

function schedule(state: ReturnType<typeof createInitialGameState>, eventId: string, dueMonth: number) {
  state.scheduledEvents.push({
    eventId,
    dueMonth,
    sourceEventId: 'source',
    sourceChoiceId: 'choice',
  });
}

describe('scheduled event selection', () => {
  it('never selects scheduledOnly events from the normal pool', () => {
    const selected = selectNextEvent(createInitialGameState(), [
      event('scheduled', 100, true),
      event('normal', 0),
    ]);

    expect(selected.currentEventId).toBe('normal');
  });

  it('ignores non-due entries and selects a due eligible event before normal content', () => {
    const events = [event('scheduled', 0, true), event('normal', 100)];
    const futureState = createInitialGameState();
    schedule(futureState, 'scheduled', 2);
    expect(selectNextEvent(futureState, events).currentEventId).toBe('normal');

    const dueState = createInitialGameState();
    dueState.month = 2;
    schedule(dueState, 'scheduled', 2);
    expect(selectNextEvent(dueState, events).currentEventId).toBe('scheduled');
  });

  it('keeps an ineligible due entry pending until state changes', () => {
    const events = [
      event('scheduled', 0, true, { type: 'hasFlag', flagId: 'ready' }),
      event('normal', 10),
    ];
    const state = createInitialGameState();
    schedule(state, 'scheduled', 0);

    const ineligible = selectNextEvent(state, events);
    expect(ineligible.currentEventId).toBe('normal');
    expect(ineligible.scheduledEvents).toEqual(state.scheduledEvents);

    const eligible = selectNextEvent({ ...state, flags: ['ready'] }, events);
    expect(eligible.currentEventId).toBe('scheduled');
    expect(eligible.scheduledEvents).toEqual(state.scheduledEvents);
  });

  it('uses definition priority, then seeded RNG for equal scheduled priorities', () => {
    const prioritizedState = createInitialGameState(123);
    schedule(prioritizedState, 'low', 0);
    schedule(prioritizedState, 'high', 0);
    const prioritized = selectNextEvent(prioritizedState, [
      event('low', 1, true),
      event('high', 10, true),
    ]);
    expect(prioritized.currentEventId).toBe('high');
    expect(prioritized.rngState).toBe(prioritizedState.rngState);

    const tiedState = createInitialGameState(123);
    schedule(tiedState, 'a', 0);
    schedule(tiedState, 'b', 0);
    const tiedEvents = [event('a', 10, true), event('b', 10, true)];
    const first = selectNextEvent(tiedState, tiedEvents);
    const second = selectNextEvent(structuredClone(tiedState), tiedEvents);
    expect(first.currentEventId).toBe(second.currentEventId);
    expect(first.rngState).toBe(second.rngState);
    expect(first.rngState).not.toBe(tiedState.rngState);
  });
});

describe('scheduled event consumption', () => {
  it('removes only the resolved due entry', () => {
    const state = createInitialGameState();
    schedule(state, 'scheduled', 0);
    schedule(state, 'other', 3);
    const events = [event('scheduled', 10, true), event('other', 0, true)];
    const selected = selectNextEvent(state, events);

    const result = resolveChoice(selected, events, 'scheduled', 'resolve');

    expect(result.state.scheduledEvents).toEqual([
      { eventId: 'other', dueMonth: 3, sourceEventId: 'source', sourceChoiceId: 'choice' },
    ]);
    expect(result.state.history[0].eventId).toBe('scheduled');
  });
});
