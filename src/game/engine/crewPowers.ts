import type { ContentCatalog } from '../content/schema';
import type { CrewRoleId, GameState, LocationId } from '../model/schema';
import { effectivePlayerStat } from './stats';
import { getNavigatorDestinationIds, movePlayerToLocation } from './locations';

export const currentYearIndex = (state: GameState) => Math.floor(state.ageMonths / 12);

export function canUseCrewRolePower(state: GameState, catalog: ContentCatalog, roleId: CrewRoleId): boolean {
  const role = catalog.crewRoles.find(({ id }) => id === roleId);
  if (role?.annualPower === undefined) return false;
  const available = Object.entries(state.npcs).some(([npcId, npc]) => npc.status === 'crew' && npc.stats.health > 0 && catalog.npcs.find(({ id }) => id === npcId)?.crewRoleId === roleId)
    && state.crewRoleLastUsedYear[roleId] !== currentYearIndex(state);
  if (!available) return false;
  if (role.annualPower === 'navigator') return state.isLeader && state.ship !== null && navigatorDestinations(state, catalog).length > 0;
  return true;
}

export function useCrewRolePower(state: GameState, catalog: ContentCatalog, roleId: CrewRoleId, destinationId?: LocationId): void {
  if (!canUseCrewRolePower(state, catalog, roleId)) throw new Error(`Crew role "${roleId}" power is unavailable.`);
  const power = catalog.crewRoles.find(({ id }) => id === roleId)?.annualPower;
  if (power === 'medic') state.player.stats.health = Math.min(effectivePlayerStat(state, catalog, 'health'), state.player.stats.health + 12);
  else if (power === 'shipwright') {
    if (!state.ship) throw new Error('Shipwright power requires a ship.');
    const maximum = catalog.ships.find(({ id }) => id === state.ship?.shipId)?.maxHealth ?? state.ship.health;
    state.ship.health = Math.min(maximum, state.ship.health + 10);
  } else if (power === 'navigator') {
    if (!destinationId || !navigatorDestinations(state, catalog).some(({ id }) => id === destinationId)) throw new Error('Navigator power requires a valid destination.');
    movePlayerToLocation(state, destinationId, 'on_land');
  } else throw new Error(`Crew role "${roleId}" has no annual power.`);
  state.crewRoleLastUsedYear[roleId] = currentYearIndex(state);
}

export function navigatorDestinations(state: GameState, catalog: ContentCatalog) {
  const destinationIds = new Set(getNavigatorDestinationIds(state.locationId, catalog));
  return catalog.locations.filter(({ id }) => destinationIds.has(id));
}

