import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { requiresCrewManagement } from '../src/game/engine/crew';
import { consumePhaseSlot } from '../src/game/engine/time';
import { createInitialGameState } from '../src/game/model/initialState';

describe('Year-end runtime boundary', () => {
  it('never opens annual crew management during Childhood and clears stale pending state', () => {
    const state = createInitialGameState();
    state.careerPhase = 'childhood';
    state.ageMonths = 96;
    state.npcs.mira.status = 'crew';
    state.npcs.mira.crewRoleId = 'medic';
    state.crewReassignmentPending = true;

    const next = consumePhaseSlot(state, 'childhood', contentCatalog);

    expect(next.ageMonths).toBe(108);
    expect(next.crewReassignmentPending).toBe(false);
    expect(requiresCrewManagement(next)).toBe(false);
  });

  it('opens crew reassignment and recharges annual powers on an Active birthday', () => {
    const state = createInitialGameState();
    state.careerPhase = 'active';
    state.ageMonths = 191;
    state.npcs.mira.status = 'crew';
    state.npcs.mira.crewRoleId = 'medic';
    state.crewRoleLastUsedYear.medic = 15;

    const next = consumePhaseSlot(state, 'active', contentCatalog);

    expect(next.ageMonths).toBe(192);
    expect(next.crewReassignmentPending).toBe(true);
    expect(next.crewRoleLastUsedYear).toEqual({});
    expect(requiresCrewManagement(next)).toBe(true);
  });
});
