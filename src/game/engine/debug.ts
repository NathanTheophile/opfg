import type { ContentCatalog } from '../content/schema';
import type { CrewRoleId, GameState, LocationId, NpcId } from '../model/schema';
import { assignCrewRoleToRecruit, vacantCrewRoleIds } from './crew';
import { applyEffects } from './effects';
import { findLocation, movePlayerToLocation } from './locations';
import { canRecruitNpc } from './ship';

const DEBUG_EFFECT_CONTEXT = {
  sourceEventId: '__debug__',
  sourceChoiceId: '__debug__',
} as const;

export function debugRecruitCrewMember(
  state: GameState,
  catalog: ContentCatalog,
  npcId: NpcId,
  roleId: CrewRoleId,
): void {
  if (!catalog.npcs.some(({ id }) => id === npcId)) {
    throw new Error(`Unknown NPC "${npcId}".`);
  }
  if (!catalog.crewRoles.some(({ id }) => id === roleId)) {
    throw new Error(`Unknown Crew Role "${roleId}".`);
  }
  if (state.npcs[npcId]?.status === 'crew') {
    throw new Error(`NPC "${npcId}" is already a crewmate.`);
  }
  if (state.crewReassignmentPending) {
    throw new Error('Annual crew reassignment is pending; resolve it before debug recruitment.');
  }
  if (!vacantCrewRoleIds(state, catalog).includes(roleId)) {
    throw new Error(`Crew Role "${roleId}" is not currently vacant.`);
  }
  if (!canRecruitNpc(state, catalog, npcId, true)) {
    throw new Error(`NPC "${npcId}" cannot be recruited with the current crew capacity.`);
  }

  const recruitedState = applyEffects(
    state,
    catalog,
    [{
      type: 'setNpcStatus',
      npcId,
      status: 'crew',
      allowWithoutLeadership: true,
    }],
    DEBUG_EFFECT_CONTEXT,
  );

  Object.assign(state, recruitedState);
  assignCrewRoleToRecruit(state, catalog, npcId, roleId);
}

export function debugTeleportToLocation(
  state: GameState,
  catalog: ContentCatalog,
  locationId: LocationId,
): void {
  if (!findLocation(catalog, locationId)) {
    throw new Error(`Unknown Location "${locationId}".`);
  }

  state.maritimeEmergency = null;
  movePlayerToLocation(state, locationId, 'on_land');
}
