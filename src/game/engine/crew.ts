import type { ContentCatalog } from '../content/schema';
import type { CrewRoleId, GameState, NpcId } from '../model/schema';

export type CrewRoleAssignments = Partial<Record<CrewRoleId, NpcId>>;

const currentYearIndex = (state: GameState) => Math.floor(state.ageMonths / 12);

export function currentCrewIds(state: GameState): NpcId[] {
  return Object.entries(state.npcs)
    .filter(([, npc]) => npc.status === 'crew')
    .map(([npcId]) => npcId)
    .sort();
}

export function crewRoleHolderId(state: GameState, roleId: CrewRoleId): NpcId | undefined {
  return Object.entries(state.npcs)
    .filter(([, npc]) => npc.status === 'crew' && npc.crewRoleId === roleId)
    .map(([npcId]) => npcId)
    .sort()[0];
}

export function vacantCrewRoleIds(state: GameState, catalog: ContentCatalog): CrewRoleId[] {
  const occupied = new Set(
    Object.values(state.npcs)
      .filter(({ status }) => status === 'crew')
      .flatMap(({ crewRoleId }) => crewRoleId === null ? [] : [crewRoleId]),
  );
  const year = currentYearIndex(state);
  return catalog.crewRoles
    .map(({ id }) => id)
    .filter((roleId) => !occupied.has(roleId) && state.crewRoleVacatedYear[roleId] !== year);
}

export function requiresCrewManagement(state: GameState): boolean {
  return state.crewReassignmentPending
    || Object.values(state.npcs).some(({ status, crewRoleId }) => status === 'crew' && crewRoleId === null);
}

export function assignCrewRoleToRecruit(
  state: GameState,
  catalog: ContentCatalog,
  npcId: NpcId,
  roleId: CrewRoleId,
): void {
  if (state.crewReassignmentPending) {
    throw new Error('Annual crew reassignment is pending; resolve the full crew panel instead.');
  }
  const npc = state.npcs[npcId];
  if (!npc || npc.status !== 'crew') throw new Error(`NPC "${npcId}" is not a current crewmate.`);
  if (npc.crewRoleId !== null) throw new Error(`NPC "${npcId}" already has Crew Role "${npc.crewRoleId}".`);
  if (!catalog.crewRoles.some(({ id }) => id === roleId)) throw new Error(`Unknown Crew Role "${roleId}".`);
  if (crewRoleHolderId(state, roleId) !== undefined) throw new Error(`Crew Role "${roleId}" is already occupied.`);
  if (state.crewRoleVacatedYear[roleId] === currentYearIndex(state)) {
    throw new Error(`Crew Role "${roleId}" was vacated this year and cannot be refilled before the next yearly reassignment.`);
  }

  state.npcs[npcId] = { ...npc, crewRoleId: roleId };
}

export function completeAnnualCrewReassignment(
  state: GameState,
  catalog: ContentCatalog,
  assignments: CrewRoleAssignments,
): void {
  if (!state.crewReassignmentPending) throw new Error('No annual crew reassignment is pending.');

  const crewIds = currentCrewIds(state);
  const knownRoles = new Set(catalog.crewRoles.map(({ id }) => id));
  const entries = Object.entries(assignments)
    .filter((entry): entry is [CrewRoleId, NpcId] => entry[1] !== undefined);

  if (entries.length !== crewIds.length) throw new Error('Annual crew reassignment must assign every current crewmate exactly once.');
  const assignedNpcIds = entries.map(([, npcId]) => npcId);
  if (new Set(assignedNpcIds).size !== assignedNpcIds.length) throw new Error('A crewmate cannot occupy multiple Crew Roles.');
  if (entries.some(([roleId]) => !knownRoles.has(roleId))) throw new Error('Annual crew reassignment contains an unknown Crew Role.');

  const crewIdSet = new Set(crewIds);
  if (assignedNpcIds.some((npcId) => !crewIdSet.has(npcId)) || crewIds.some((npcId) => !assignedNpcIds.includes(npcId))) {
    throw new Error('Annual crew reassignment may only contain current crewmates.');
  }

  const roleByNpcId = new Map(entries.map(([roleId, npcId]) => [npcId, roleId]));
  for (const npcId of crewIds) {
    state.npcs[npcId] = { ...state.npcs[npcId], crewRoleId: roleByNpcId.get(npcId) ?? null };
  }
  state.crewReassignmentPending = false;
}

export function annualCrewIncome(state: GameState, catalog: ContentCatalog): number {
  const activeRoleIds = new Set(
    Object.values(state.npcs)
      .filter(({ status, stats }) => status === 'crew' && stats.health > 0)
      .flatMap(({ crewRoleId }) => crewRoleId === null ? [] : [crewRoleId]),
  );
  return catalog.crewRoles.reduce((sum, role) => {
    if (!activeRoleIds.has(role.id) || role.passive?.type !== 'annualIncome') return sum;
    return sum + (role.passive.berries ?? 0);
  }, 0);
}
