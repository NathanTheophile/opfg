import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { getChoiceState } from '../src/game/engine/conditions';
import { selectNextEvent } from '../src/game/engine/events';
import { applyMonthlyNavigationChoice, needsMonthlyNavigationDecision } from '../src/game/engine/navigation';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';

function resolveFirst(state: ReturnType<typeof createInitialGameState>) {
  if (needsMonthlyNavigationDecision(state)) {
    state = selectNextEvent(
      applyMonthlyNavigationChoice(state, contentCatalog, 'stay'),
      contentCatalog,
    );
  }

  const event = contentCatalog.events.find(({ id }) => id === state.currentEventId);

  if (!event) {
    throw new Error(
      `No event at age ${state.ageMonths}; history ${state.history.length}; scheduled ${JSON.stringify(state.scheduledEvents)}`,
    );
  }

  const choice = event.choices.find((candidate) => {
    const choiceState = getChoiceState(candidate, state, contentCatalog);
    return choiceState.visible && choiceState.available;
  });

  if (!choice) {
    throw new Error(
      `No available choice for event "${event.id}" at age ${state.ageMonths}.`,
    );
  }

  return resolveChoice(
    state,
    contentCatalog,
    event.id,
    choice.id,
    choice.input ? 'Luffy' : undefined,
  ).state;
}

describe('complete pre-career pipeline', () => {
  it('plays origins then exactly 20 slot-consuming childhood events before active age 15', () => {
    let state = selectNextEvent(createInitialGameState(42), contentCatalog);

    while (state.careerPhase === 'origins') {
      state = resolveFirst(state);
    }

    expect(state.ageMonths).toBe(12);

    expect(state).toMatchObject({
      locationId: expect.any(String),
      player: {
        profile: {
          name: 'Luffy',
          raceId: 'human',
          familyStructureId: 'two_parents',
          affiliationId: 'civilian',
          socialClassId: 'poor',
          originSeaId: 'east_blue',
        },
        stats: {
          health: 35,
          morale: 25,
          strength: 25,
          agility: 23,
          observation: 28,
          intelligence: 26,
          navigation: 25,
          charisma: 27,
          luck: 23,
        },
      },
    });

    const historyAtChildhood = state.history.length;

    while (state.careerPhase === 'childhood') {
      state = resolveFirst(state);
    }

    const childhoodHistory = state.history.slice(historyAtChildhood);

    const slotConsumingChildhoodEvents = childhoodHistory.filter(({ eventId }) => {
      const event = contentCatalog.events.find(({ id }) => id === eventId);
      return event?.kind === 'normal' || event?.kind === 'scheduled';
    });

    expect(slotConsumingChildhoodEvents).toHaveLength(20);
    expect(childhoodHistory.length).toBeGreaterThanOrEqual(20);

    expect(state).toMatchObject({
      careerPhase: 'active',
      ageMonths: 180,
      slotInMonth: 0,
    });

    expect(
      state.history.every(
        (entry) => !Object.prototype.hasOwnProperty.call(entry, 'month'),
      ),
    ).toBe(true);

    for (let adultEvents = 0; adultEvents < 3; adultEvents += 1) {
      state = resolveFirst(state);
    }

    expect(state).toMatchObject({
      careerPhase: 'active',
      ageMonths: 181,
      slotInMonth: 1,
    });
  });
});
