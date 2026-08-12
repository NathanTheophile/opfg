import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import type { EventDefinition } from '../src/game/content/schema';
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

    expect(session.gameState?.currentEventId).toBe('origin_to_childhood');

    const birthLocation = contentCatalog.locations.find(({ id }) => id === session.gameState?.locationId);
    expect(birthLocation).toMatchObject({ seaId: 'east_blue', canBeBirthLocation: true });

    session = choose(session, 'begin_childhood');

    expect(session.gameState).toMatchObject({
      careerPhase: 'childhood',
      ageMonths: 12,
      locationId: expect.any(String),
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
    const outcome = (id: string) => ({ id, textKey: 'fixture.outcome', effects: [{ type: 'setFlag' as const, flagId: 'dice_session_resolved' }] });
    const event: EventDefinition = { id: 'dice_session_fixture', kind: 'normal', titleKey: 'fixture.title', textKey: 'fixture.text', choices: [{ id: 'roll', textKey: 'fixture.choice', resolution: { type: 'dice', statId: 'charisma', successThreshold: 10, outcomes: { criticalFailure: outcome('critical_failure'), failure: outcome('failure'), success: outcome('success'), criticalSuccess: outcome('critical_success') } } }] };
    const catalog = { ...contentCatalog, events: [...contentCatalog.events, event] };
    const state = createInitialGameState(123);
    state.careerPhase = 'active';
    state.ageMonths = 180;
    state.locationId = 'open_sea';
    state.travelState = 'at_sea';
    state.flags = ['castaway_resolved'];
    state.currentEventId = 'dice_session_fixture';
    const expected = resolveChoice(structuredClone(state), catalog, 'dice_session_fixture', 'roll');

    const actual = chooseInSession(createSessionState(state), catalog, 'roll');

    expect(actual.lastResolution).toEqual(expected);
    expect(actual.gameState).toEqual(expected.state);
  });

  it('exposes monthly navigation as session state without creating history', () => {
    const state = createInitialGameState(5);
    state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
    state.careerPhase = 'active'; state.ageMonths = 180; state.locationId = 'foosha_village'; state.travelState = 'on_land';
    const session = createSessionState(state);
    const options = getSessionNavigationOptions(session, contentCatalog);
    expect(options[0]?.id).toBe('stay');
    expect(options.some(({ id }) => id.startsWith('sailTo:'))).toBe(true);
    const next = chooseMonthlyNavigationInSession(session, contentCatalog, options.find(({ id }) => id.startsWith('sailTo:'))!.id);
    expect(next.gameState).toMatchObject({ travelState: 'at_sea', slotInMonth: 0, navigationDecisionAgeMonths: 180 });
    expect(next.gameState?.history).toEqual([]);
  });
});
