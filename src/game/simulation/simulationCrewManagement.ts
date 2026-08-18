import type { ContentCatalog } from '../content/schema';
import {
  assignCrewRoleToRecruit,
  completeAnnualCrewReassignment,
  currentCrewIds,
  requiresCrewManagement,
  vacantCrewRoleIds,
  type CrewRoleAssignments,
} from '../engine/crew';
import type { CrewRoleId, GameState } from '../model/schema';
import { randomSimulationPolicy, type SimulationPolicy } from './simulationPolicy';

export interface SimulationCrewManagementResult {
  state: GameState;
  nextRngState: number;
  resolved: boolean;
}

export function resolveRequiredSimulationCrewManagement(
  state: GameState,
  catalog: ContentCatalog,
  policy: SimulationPolicy,
  rngState: number,
): SimulationCrewManagementResult {
  if (!requiresCrewManagement(state)) {
    return { state, nextRngState: rngState, resolved: false };
  }

  const nextState: GameState = {
    ...state,
    npcs: Object.fromEntries(
      Object.entries(state.npcs).map(([npcId, npc]) => [npcId, { ...npc }]),
    ),
  };
  let nextRngState = rngState;
  const chooseCrewRole = policy.chooseCrewRole ?? randomSimulationPolicy.chooseCrewRole!;

  if (nextState.crewReassignmentPending) {
    const assignments: CrewRoleAssignments = {};
    const availableRoles = catalog.crewRoles.map(({ id }) => id);

    for (const npcId of currentCrewIds(nextState)) {
      if (availableRoles.length === 0) {
        throw new Error('Annual crew reassignment has more crewmates than available Crew Roles.');
      }

      const selection = chooseCrewRole(
        availableRoles,
        nextRngState,
        {
          state: nextState,
          catalog,
          npcId,
          reason: 'annual_reassignment',
        },
      );
      nextRngState = selection.nextRngState;
      assignments[selection.roleId] = npcId;
      availableRoles.splice(availableRoles.indexOf(selection.roleId), 1);
    }

    completeAnnualCrewReassignment(nextState, catalog, assignments);
    return { state: nextState, nextRngState, resolved: true };
  }

  const unassignedCrew = currentCrewIds(nextState)
    .filter((npcId) => nextState.npcs[npcId].crewRoleId === null);

  for (const npcId of unassignedCrew) {
    const availableRoles = vacantCrewRoleIds(nextState, catalog);
    if (availableRoles.length === 0) {
      throw new Error(`No Crew Role is available for newly recruited NPC "${npcId}".`);
    }

    const selection = chooseCrewRole(
      availableRoles,
      nextRngState,
      {
        state: nextState,
        catalog,
        npcId,
        reason: 'recruitment',
      },
    );
    nextRngState = selection.nextRngState;
    assignCrewRoleToRecruit(nextState, catalog, npcId, selection.roleId);
  }

  return { state: nextState, nextRngState, resolved: true };
}
