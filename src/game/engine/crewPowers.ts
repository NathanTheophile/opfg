import type { ContentCatalog } from '../content/schema';
import type { CrewRoleId, GameState, LocationId, NpcId } from '../model/schema';
import { effectivePlayerStat } from './stats';
import { getOrdinaryDestinationIds, movePlayerToLocation } from './locations';

export const currentYearIndex = (state: GameState) => Math.floor(state.ageMonths / 12);

export function canUseCrewRolePower(state: GameState, catalog: ContentCatalog, roleId: CrewRoleId): boolean {
  return catalog.crewRoles.some(({ id, annualPower }) => id === roleId && annualPower !== undefined)
    && Object.entries(state.npcs).some(([npcId, npc]) => npc.status === 'crew' && catalog.npcs.find(({ id }) => id === npcId)?.crewRoleId === roleId)
    && state.crewRoleLastUsedYear[roleId] !== currentYearIndex(state);
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
  const destinationIds = new Set(getOrdinaryDestinationIds(state.locationId, catalog));
  return catalog.locations.filter(({ id }) => destinationIds.has(id));
}

export function isCompanionCandidate(state: GameState, catalog: ContentCatalog, npcId: NpcId): boolean {
  const npc = state.npcs[npcId];
  const definition = catalog.npcs.find(({ id }) => id === npcId);
  return npc !== undefined && npc.status === 'known' && npc.stats.health > 0 && definition?.companionCapable === true;
}

export function setActiveCompanion(state: GameState, catalog: ContentCatalog, npcId: NpcId | null): void {
  if (npcId === null) {
    state.companionNpcId = null;
    return;
  }
  if (!isCompanionCandidate(state, catalog, npcId)) throw new Error(`Companion "${npcId}" must be a living companion-capable NPC.`);
  state.companionNpcId = npcId;
}
