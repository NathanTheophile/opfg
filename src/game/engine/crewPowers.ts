import type { ContentCatalog } from '../content/schema';
import type { CrewRoleId, GameState, LocationId } from '../model/schema';
import { crewRoleHolderId } from './crew';
import { hasEligibleCrewRecruitmentEvent } from './events';
import { modifyPlayerHealth } from './health';
import { getNavigatorDestinationIds, movePlayerToLocation } from './locations';
import { canStartNavigatorReverseMountainAttempt, startNavigatorReverseMountainAttempt } from './reverseMountain';

const MEDIC_HEAL = 12;
const SHIPWRIGHT_REPAIR = 10;

export const currentYearIndex = (state: GameState) => Math.floor(state.ageMonths / 12);

export function canUseCrewRolePower(state: GameState, catalog: ContentCatalog, roleId: CrewRoleId): boolean {
  if (state.ship === null) return false;

  const role = catalog.crewRoles.find(({ id }) => id === roleId);
  if (role?.annualPower === undefined) return false;

  const holderId = crewRoleHolderId(state, roleId);
  if (holderId === undefined || state.npcs[holderId].stats.health <= 0) return false;
  if (state.crewRoleLastUsedYear[roleId] === currentYearIndex(state)) return false;

  if (role.annualPower === 'navigator') {
    return state.isLeader && navigatorDestinations(state, catalog).length > 0;
  }
  if (role.annualPower === 'recruiter') {
    return !state.pendingCrewRecruitment && hasEligibleCrewRecruitmentEvent(state, catalog);
  }
  if (role.annualPower === 'first_mate') {
    return catalog.crewRoles.some((candidate) => {
      if (candidate.id === roleId || candidate.annualPower === undefined) return false;
      const targetHolderId = crewRoleHolderId(state, candidate.id);
      return targetHolderId !== undefined
        && state.npcs[targetHolderId].stats.health > 0
        && state.crewRoleLastUsedYear[candidate.id] === currentYearIndex(state);
    });
  }
  return true;
}

export function useCrewRolePower(
  state: GameState,
  catalog: ContentCatalog,
  roleId: CrewRoleId,
  parameterId?: string,
): void {
  if (!canUseCrewRolePower(state, catalog, roleId)) throw new Error(`Crew role "${roleId}" power is unavailable.`);
  if (state.ship === null) throw new Error('Crew Role powers require a ship.');
  const power = catalog.crewRoles.find(({ id }) => id === roleId)?.annualPower;

  if (power === 'medic') {
    modifyPlayerHealth(state, catalog, MEDIC_HEAL);
    for (const [npcId, npc] of Object.entries(state.npcs)) {
      if (npc.status !== 'crew' || npc.stats.health <= 0) continue;
      state.npcs[npcId] = {
        ...npc,
        stats: { ...npc.stats, health: Math.min(50, npc.stats.health + MEDIC_HEAL) },
      };
    }
  } else if (power === 'shipwright') {
    const maximum = catalog.ships.find(({ id }) => id === state.ship?.shipId)?.maxHealth ?? state.ship.health;
    state.ship.health = Math.min(maximum, state.ship.health + SHIPWRIGHT_REPAIR);
  } else if (power === 'navigator') {
    const destinationId = parameterId as LocationId | undefined;
    if (!destinationId || !navigatorDestinations(state, catalog).some(({ id }) => id === destinationId)) {
      throw new Error('Navigator power requires a valid destination.');
    }
    if (destinationId === 'reverse_mountain') startNavigatorReverseMountainAttempt(state, catalog);
    else movePlayerToLocation(state, destinationId, 'on_land');
  } else if (power === 'recruiter') {
    state.pendingCrewRecruitment = true;
  } else if (power === 'first_mate') {
    const targetRoleId = parameterId as CrewRoleId | undefined;
    const target = targetRoleId === undefined ? undefined : catalog.crewRoles.find(({ id }) => id === targetRoleId);
    const targetHolderId = targetRoleId === undefined ? undefined : crewRoleHolderId(state, targetRoleId);
    if (
      targetRoleId === undefined
      || targetRoleId === roleId
      || target?.annualPower === undefined
      || targetHolderId === undefined
      || state.npcs[targetHolderId].stats.health <= 0
      || state.crewRoleLastUsedYear[targetRoleId] !== currentYearIndex(state)
    ) {
      throw new Error('First Mate power requires another occupied Active Role already used this year.');
    }
    delete state.crewRoleLastUsedYear[targetRoleId];
  } else {
    throw new Error(`Crew role "${roleId}" has no annual power.`);
  }

  state.crewRoleLastUsedYear[roleId] = currentYearIndex(state);
}

export function navigatorDestinations(state: GameState, catalog: ContentCatalog) {
  const destinationIds = new Set(getNavigatorDestinationIds(state.locationId, catalog));
  if (!canStartNavigatorReverseMountainAttempt(state, catalog)) destinationIds.delete('reverse_mountain');
  return catalog.locations.filter(({ id }) => destinationIds.has(id));
}
