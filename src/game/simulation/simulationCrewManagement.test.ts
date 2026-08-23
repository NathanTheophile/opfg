import { describe, expect, it } from 'vitest';
import type { ContentCatalog } from '../content/schema';
import type { CrewRoleId, GameState } from '../model/schema';
import { createInitialGameState } from '../model/initialState';
import { resolveRequiredSimulationCrewManagement } from './simulationCrewManagement';
import type { SimulationPolicy } from './simulationPolicy';

const catalog = {
  crewRoles: [
    { id: 'navigator' },
    { id: 'medic' },
    { id: 'shipwright' },
  ],
} as unknown as ContentCatalog;

const firstRolePolicy: SimulationPolicy = {
  id: 'test-first-role',
  choose() {
    throw new Error('Narrative choice should not be requested in this test.');
  },
  chooseCrewRole(roleIds, rngState) {
    return { roleId: roleIds[0], nextRngState: rngState };
  },
};

function baseState(overrides: Partial<GameState>): GameState {
  return {
    ...createInitialGameState(),
    careerPhase: 'active',
    ageMonths: 192,
    npcs: {},
    ...overrides,
  };
}

describe('resolveRequiredSimulationCrewManagement', () => {
  it('assigns a role to a newly recruited role-less crewmate', () => {
    const initial = baseState({
      npcs: {
        recruit: {
          status: 'crew',
          crewRoleId: null,
        },
      } as unknown as GameState['npcs'],
    });

    const result = resolveRequiredSimulationCrewManagement(initial, catalog, firstRolePolicy, 10);

    expect(result.resolved).toBe(true);
    expect(result.state.npcs.recruit.crewRoleId).toBe('navigator');
    expect(initial.npcs.recruit.crewRoleId).toBeNull();
  });

  it('resolves annual reassignment with one distinct role per crewmate', () => {
    const initial = baseState({
      crewReassignmentPending: true,
      npcs: {
        alpha: { status: 'crew', crewRoleId: 'medic' as CrewRoleId },
        beta: { status: 'crew', crewRoleId: 'navigator' as CrewRoleId },
      } as unknown as GameState['npcs'],
    });

    const result = resolveRequiredSimulationCrewManagement(initial, catalog, firstRolePolicy, 10);

    expect(result.state.crewReassignmentPending).toBe(false);
    const assigned = [
      result.state.npcs.alpha.crewRoleId,
      result.state.npcs.beta.crewRoleId,
    ];
    expect(new Set(assigned).size).toBe(2);
    expect(assigned).toEqual(['navigator', 'medic']);
  });
});
