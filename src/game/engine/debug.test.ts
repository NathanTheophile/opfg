import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../content/definitions';
import { createInitialGameState } from '../model/initialState';
import { createDefaultNpcState } from '../model/npcState';
import { evaluateCondition } from './conditions';
import { debugRecruitCrewMember, debugTeleportToLocation } from './debug';

const crewNpc = (roleId: string) => ({
  ...createDefaultNpcState(),
  status: 'crew' as const,
  crewRoleId: roleId,
  statsGenerated: true,
});

describe('gameplay debug engine commands', () => {
  it('recruits through normal crew runtime and assigns the selected role without leadership', () => {
    const state = createInitialGameState(123);
    state.isLeader = false;

    debugRecruitCrewMember(state, contentCatalog, 'mira', 'navigator');

    expect(state.npcs.mira.status).toBe('crew');
    expect(state.npcs.mira.crewRoleId).toBe('navigator');
    expect(state.npcs.mira.statsGenerated).toBe(true);
    expect(evaluateCondition(
      { type: 'hasCrewRole', roleId: 'navigator' },
      state,
      contentCatalog,
    )).toBe(true);
  });

  it('rejects dead NPCs', () => {
    const state = createInitialGameState();
    state.npcs.mira = {
      ...createDefaultNpcState(),
      status: 'dead',
    };

    expect(() => debugRecruitCrewMember(
      state,
      contentCatalog,
      'mira',
      'navigator',
    )).toThrow();
  });

  it('rejects an occupied Crew Role', () => {
    const state = createInitialGameState();
    state.npcs.existing = crewNpc('navigator');

    expect(() => debugRecruitCrewMember(
      state,
      contentCatalog,
      'mira',
      'navigator',
    )).toThrow(/not currently vacant/);
  });

  it('preserves crew-capacity rules', () => {
    const state = createInitialGameState();
    state.npcs.a = crewNpc('cook');
    state.npcs.b = crewNpc('musician');
    state.npcs.c = crewNpc('scholar');

    expect(() => debugRecruitCrewMember(
      state,
      contentCatalog,
      'mira',
      'navigator',
    )).toThrow(/crew capacity/);
  });

  it('teleports without consuming time, History, Scheduled or Immediate state', () => {
    const state = createInitialGameState();
    state.ageMonths = 193;
    state.locationId = 'foosha_village';
    state.travelState = 'at_sea';
    state.maritimeEmergency = {
      kind: 'shipwreck',
      seaId: 'east_blue',
      cause: 'accident',
    };
    state.history = [{
      eventId: 'fixture',
      choiceId: 'choice',
      outcomeId: 'outcome',
      ageMonths: 192,
    }];
    state.scheduledEvents = [{
      eventId: 'scheduled_fixture',
      dueAgeMonths: 200,
      sourceEventId: 'fixture',
      sourceChoiceId: 'choice',
    }];
    state.immediateEventQueue = ['immediate_fixture'];

    const history = structuredClone(state.history);
    const scheduled = structuredClone(state.scheduledEvents);
    const immediate = [...state.immediateEventQueue];

    debugTeleportToLocation(state, contentCatalog, 'water_seven');

    expect(state.locationId).toBe('water_seven');
    expect(state.travelState).toBe('on_land');
    expect(state.maritimeEmergency).toBeNull();
    expect(state.ageMonths).toBe(193);
    expect(state.history).toEqual(history);
    expect(state.scheduledEvents).toEqual(scheduled);
    expect(state.immediateEventQueue).toEqual(immediate);
  });

  it.each(contentCatalog.locations.map(({ id }) => [id]))(
    'produces a coherent land state when teleporting to %s',
    (locationId) => {
      const state = createInitialGameState();
      state.travelState = 'at_sea';

      debugTeleportToLocation(state, contentCatalog, locationId);

      expect(state.locationId).toBe(locationId);
      expect(state.travelState).toBe('on_land');
      expect(state.maritimeEmergency).toBeNull();
    },
  );

  it('rejects unknown Locations', () => {
    const state = createInitialGameState();
    expect(() => debugTeleportToLocation(
      state,
      contentCatalog,
      '__unknown_location__',
    )).toThrow(/Unknown Location/);
  });
});
