import type { ContentCatalog, CrewRoleDefinition } from '@/game/content/schema';
import {
  crewRoleHolderId,
  currentCrewIds,
  vacantCrewRoleIds,
} from '@/game/engine/crew';
import { currentYearIndex } from '@/game/engine/crewPowers';
import type {
  CrewRoleId,
  GameState,
  NpcId,
} from '@/game/model/schema';

export interface CrewMemberOption {
  npcId: NpcId;
  nameKey: string | null;
  displayName: string | null;
  crewRoleId: CrewRoleId | null;
}

export interface RecruitAssignmentView {
  recruit: CrewMemberOption;
  availableRoles: CrewRoleDefinition[];
}

export interface AnnualReassignmentView {
  crew: CrewMemberOption[];
  roles: CrewRoleDefinition[];
}

export function crewMemberOptions(
  state: GameState,
  catalog: ContentCatalog,
): CrewMemberOption[] {
  return currentCrewIds(state).map((npcId) => {
    const definition = catalog.npcs.find(({ id }) => id === npcId);
    const npc = state.npcs[npcId];
    return {
      npcId,
      nameKey: definition?.nameKey ?? null,
      displayName: npc.displayName,
      crewRoleId: npc.crewRoleId,
    };
  });
}

export function recruitAssignmentView(
  state: GameState,
  catalog: ContentCatalog,
): RecruitAssignmentView | null {
  const recruit = crewMemberOptions(state, catalog).find(
    ({ crewRoleId }) => crewRoleId === null,
  );
  if (!recruit || state.crewReassignmentPending) return null;

  const availableRoleIds = new Set(vacantCrewRoleIds(state, catalog));
  return {
    recruit,
    availableRoles: catalog.crewRoles.filter(({ id }) => availableRoleIds.has(id)),
  };
}

export function annualReassignmentView(
  state: GameState,
  catalog: ContentCatalog,
): AnnualReassignmentView | null {
  if (!state.crewReassignmentPending) return null;
  return {
    crew: crewMemberOptions(state, catalog),
    roles: catalog.crewRoles,
  };
}

export function initialAnnualAssignments(
  state: GameState,
  catalog: ContentCatalog,
): Partial<Record<CrewRoleId, NpcId>> {
  return Object.fromEntries(
    catalog.crewRoles.flatMap(({ id }) => {
      const holderId = crewRoleHolderId(state, id);
      return holderId === undefined ? [] : [[id, holderId]];
    }),
  );
}

export function annualAssignmentsAreComplete(
  state: GameState,
  assignments: Partial<Record<CrewRoleId, NpcId>>,
): boolean {
  const crewIds = currentCrewIds(state);
  const assignedIds = Object.values(assignments).filter(
    (npcId): npcId is NpcId => npcId !== undefined,
  );
  return assignedIds.length === crewIds.length
    && new Set(assignedIds).size === assignedIds.length
    && crewIds.every((npcId) => assignedIds.includes(npcId));
}

export function firstMateTargetRoleIds(
  state: GameState,
  catalog: ContentCatalog,
): CrewRoleId[] {
  const year = currentYearIndex(state);
  return catalog.crewRoles
    .filter(({ id, annualPower }) => {
      if (id === 'first_mate' || annualPower === undefined) return false;
      const holderId = crewRoleHolderId(state, id);
      return holderId !== undefined
        && state.npcs[holderId].stats.health > 0
        && state.crewRoleLastUsedYear[id] === year;
    })
    .map(({ id }) => id);
}
