import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';
import { chooseInSession, chooseMonthlyNavigationInSession, createSessionState, getSessionNavigationOptions, startNewRun, type GameSessionState } from '../src/game/session/gameSession';

function choose(session: GameSessionState, choiceId: string, input?: string): GameSessionState {
  return chooseInSession(session, contentCatalog, choiceId, input);
}

describe('GameSession', () => {
  it('starts a real run at the first Origins Event', () => {
    const session = startNewRun(contentCatalog, 42);
    expect(session.gameState).toMatchObject({ careerPhase: 'origins', currentEventId: 'origin_name' });
  });

  it('drives Giant, Orphan and Poor Origins into Childhood with authored modifiers', () => {
    let session = startNewRun(contentCatalog, 42);
    session = choose(session, 'confirm_name', 'SimPlayer');
    session = choose(session, 'giant');
    session = choose(session, 'orphan');
    session = choose(session, 'civilian');
    session = choose(session, 'poor');
    session = choose(session, 'east_blue');

    expect(session.gameState?.currentEventId).toBe('origin_birthplace');
    expect(() => choose(session, 'west_blue_port')).toThrow('is not available');

    session = choose(session, 'east_blue_port');
    session = choose(session, 'begin_childhood');

    expect(session.gameState).toMatchObject({
      careerPhase: 'childhood',
      ageMonths: 12,
      locationId: 'foosha_village',
      player: {
        profile: {
          name: 'SimPlayer', raceId: 'giant', familyStructureId: 'orphan', affiliationId: 'civilian',
          socialClassId: 'poor', originSeaId: 'east_blue',
        },
        stats: {
          health: 60, morale: 26, strength: 31, agility: 21, observation: 29,
          intelligence: 23, navigation: 21, charisma: 23, luck: 20,
        },
      },
    });
  });

  it('exposes the exact Dice resolution returned by the engine', () => {
    const state = createInitialGameState(123);
    state.careerPhase = 'active';
    state.ageMonths = 180;
    state.locationId = 'open_sea';
    state.travelState = 'at_sea';
    state.flags = ['castaway_resolved'];
    state.currentEventId = 'black_squall';
    const expected = resolveChoice(structuredClone(state), contentCatalog, 'black_squall', 'cut_through_squall');

    const actual = choose(createSessionState(state), 'cut_through_squall');

    expect(actual.lastResolution).toEqual(expected);
    expect(actual.gameState).toEqual(expected.state);
  });

  it('exposes monthly navigation as session state without creating history', () => {
    const state = createInitialGameState(5);
    state.careerPhase = 'active'; state.ageMonths = 180; state.locationId = 'foosha_village'; state.travelState = 'on_land';
    const session = createSessionState(state);
    expect(getSessionNavigationOptions(session, contentCatalog).map(({ id }) => id)).toEqual(['stay', 'goToSea']);
    const next = chooseMonthlyNavigationInSession(session, contentCatalog, 'goToSea');
    expect(next.gameState).toMatchObject({ travelState: 'at_sea', slotInMonth: 0, navigationDecisionAgeMonths: 180 });
    expect(next.gameState?.history).toEqual([]);
  });
});
