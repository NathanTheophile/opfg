import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import {
  assignCrewRoleToRecruit,
  completeAnnualCrewReassignment,
} from '../src/game/engine/crew';
import { selectNextEvent } from '../src/game/engine/events';
import { loadGameState, saveGameState } from '../src/game/engine/save';
import { createInitialGameState } from '../src/game/model/initialState';
import { createDefaultNpcState } from '../src/game/model/npcState';
import type { GameState } from '../src/game/model/schema';
import {
  annualAssignmentsAreComplete,
  firstMateTargetRoleIds,
  initialAnnualAssignments,
  recruitAssignmentView,
} from '../src/features/event-ui/crewManagementView';

function activeState(): GameState {
  const state = createInitialGameState(12);
  state.careerPhase = 'active';
  state.ageMonths = 180;
  state.locationId = 'open_sea';
  state.travelState = 'at_sea';
  state.flags = ['castaway_resolved'];
  state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
  return state;
}

function crew(roleId: string | null = null) {
  return {
    ...createDefaultNpcState(),
    status: 'crew' as const,
    crewRoleId: roleId,
    stats: { ...createDefaultNpcState().stats, health: 30 },
  };
}

describe('Crew management UI helpers', () => {
  it('blocks root selection for a new recruit until a valid role is assigned', () => {
    const state = activeState();
    state.npcs.mira = crew(null);

    const blocked = selectNextEvent(state, contentCatalog);
    expect(blocked.currentEventId).toBeNull();
    expect(recruitAssignmentView(blocked, contentCatalog)?.availableRoles.map(({ id }) => id))
      .toContain('navigator');

    assignCrewRoleToRecruit(blocked, contentCatalog, 'mira', 'navigator');
    const resumed = selectNextEvent(blocked, contentCatalog);

    expect(resumed.npcs.mira.crewRoleId).toBe('navigator');
    expect(resumed.currentEventId).not.toBeNull();
  });

  it('rejects occupied and same-year vacated roles for recruit assignment', () => {
    const state = activeState();
    state.npcs.mira = crew('navigator');
    state.npcs.rohan = crew(null);
    state.crewRoleVacatedYear.cook = 15;

    expect(() => assignCrewRoleToRecruit(state, contentCatalog, 'rohan', 'navigator'))
      .toThrow(/already occupied/);
    expect(() => assignCrewRoleToRecruit(state, contentCatalog, 'rohan', 'cook'))
      .toThrow(/vacated this year/);
  });

  it('builds an annual full reassignment payload that supports swaps and clears the gate', () => {
    const state = activeState();
    state.npcs.mira = crew('navigator');
    state.npcs.rohan = crew('cook');
    state.crewReassignmentPending = true;

    const initial = initialAnnualAssignments(state, contentCatalog);
    expect(initial).toMatchObject({ navigator: 'mira', cook: 'rohan' });

    const swapped = { navigator: 'rohan', cook: 'mira' };
    expect(annualAssignmentsAreComplete(state, swapped)).toBe(true);

    completeAnnualCrewReassignment(state, contentCatalog, swapped);
    expect(state.crewReassignmentPending).toBe(false);
    expect(state.npcs.mira.crewRoleId).toBe('cook');
    expect(state.npcs.rohan.crewRoleId).toBe('navigator');
    expect(selectNextEvent(state, contentCatalog).currentEventId).not.toBeNull();
  });

  it('lists only occupied living used active roles as First Mate targets', () => {
    const state = activeState();
    state.npcs.mira = crew('first_mate');
    state.npcs.ari = crew('medic');
    state.npcs.owen = crew('shipwright');
    state.npcs.rohan = crew('cook');
    state.npcs.owen.stats.health = 0;
    state.crewRoleLastUsedYear = {
      first_mate: 14,
      medic: 15,
      shipwright: 15,
      recruiter: 15,
      cook: 15,
    };

    expect(firstMateTargetRoleIds(state, contentCatalog)).toEqual(['medic']);
  });

  it('preserves completed crew role management across save and load', () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => { memory.set(key, value); },
      removeItem: (key: string) => { memory.delete(key); },
    };
    const state = activeState();
    state.npcs.mira = crew(null);
    assignCrewRoleToRecruit(state, contentCatalog, 'mira', 'navigator');
    state.crewReassignmentPending = true;
    completeAnnualCrewReassignment(state, contentCatalog, { medic: 'mira' });

    saveGameState(storage, state);
    const loaded = loadGameState(storage);

    expect(loaded?.npcs.mira.crewRoleId).toBe('medic');
    expect(loaded?.crewReassignmentPending).toBe(false);
  });
});
