import type { ContentCatalog } from '../content/schema';
import { canUseCrewRolePower, useCrewRolePower } from '../engine/crewPowers';
import type { CrewRoleId, GameState } from '../model/schema';
import type { SimulationPolicy } from './simulationPolicy';

export type SimulationCrewPowerResolution =
  | {
      used: false;
      state: GameState;
      nextRngState: number;
    }
  | {
      used: true;
      state: GameState;
      nextRngState: number;
      roleId: CrewRoleId;
      parameterId?: string;
    };

export function resolveOptionalSimulationCrewPower(
  state: GameState,
  catalog: ContentCatalog,
  policy: SimulationPolicy,
  rngState: number,
): SimulationCrewPowerResolution {
  if (policy.chooseCrewPower === undefined) {
    return { used: false, state, nextRngState: rngState };
  }

  const availableRoleIds = catalog.crewRoles
    .filter(({ id, annualPower }) =>
      annualPower !== undefined
      && canUseCrewRolePower(state, catalog, id)
      && (id !== 'navigator' || state.currentEventId === null),
    )
    .map(({ id }) => id);

  if (availableRoleIds.length === 0) {
    return { used: false, state, nextRngState: rngState };
  }

  const selection = policy.chooseCrewPower(availableRoleIds, rngState, { state, catalog });
  if (selection === undefined) {
    return { used: false, state, nextRngState: rngState };
  }
  if (!availableRoleIds.includes(selection.roleId)) {
    throw new Error(
      `Simulation policy \"${policy.id}\" selected unavailable Crew Role power \"${selection.roleId}\".`,
    );
  }

  const nextState = cloneForCrewPower(state);
  useCrewRolePower(nextState, catalog, selection.roleId, selection.parameterId);

  return {
    used: true,
    state: nextState,
    nextRngState: selection.nextRngState,
    roleId: selection.roleId,
    ...(selection.parameterId !== undefined ? { parameterId: selection.parameterId } : {}),
  };
}

function cloneForCrewPower(state: GameState): GameState {
  return {
    ...state,
    flags: [...state.flags],
    player: {
      ...state.player,
      stats: { ...state.player.stats },
    },
    npcs: Object.fromEntries(
      Object.entries(state.npcs).map(([npcId, npc]) => [
        npcId,
        { ...npc, stats: { ...npc.stats } },
      ]),
    ),
    ship: state.ship === null ? null : { ...state.ship },
    crewRoleLastUsedYear: { ...state.crewRoleLastUsedYear },
  };
}
