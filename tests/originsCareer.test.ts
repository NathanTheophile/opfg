import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { selectNextEvent } from '../src/game/engine/events';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';

function resolveFirst(state: ReturnType<typeof createInitialGameState>) {
  const event = contentCatalog.events.find(({ id }) => id === state.currentEventId)!;
  if (!event) throw new Error(`No event at age ${state.ageMonths}; history ${state.history.length}; scheduled ${JSON.stringify(state.scheduledEvents)}`);
  const choice = event.choices[0];
  return resolveChoice(state, contentCatalog, event.id, choice.id, choice.input ? 'Luffy' : undefined).state;
}

describe('complete pre-career pipeline', () => {
  it('plays origins then exactly 20 childhood occurrences before active age 15', () => {
    let state = selectNextEvent(createInitialGameState(42), contentCatalog);
    while (state.careerPhase === 'origins') state = resolveFirst(state);
    expect(state.ageMonths).toBe(12);
    const historyAtChildhood = state.history.length;
    while (state.careerPhase === 'childhood') state = resolveFirst(state);
    expect(state.history.length - historyAtChildhood).toBe(20);
    expect(state).toMatchObject({ careerPhase: 'active', ageMonths: 180, slotInMonth: 0 });
    expect(state.player.traits).toEqual(expect.arrayContaining(['resilient', 'audacious']));
    expect(state.history.some(({ eventId }) => eventId === 'childhood_memory')).toBe(true);
    expect(state.history.every((entry) => !Object.prototype.hasOwnProperty.call(entry, 'month'))).toBe(true);
    for (let adultEvents = 0; adultEvents < 3; adultEvents += 1) state = resolveFirst(state);
    expect(state).toMatchObject({ careerPhase: 'active', ageMonths: 181, slotInMonth: 1 });
  });
});
