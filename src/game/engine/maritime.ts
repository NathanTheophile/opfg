import worldData from '../content/data/locationsV1.json';
import type { ContentCatalog, EventDefinition } from '../content/schema';
import type { GameState, LocationId, MaritimeEmergencyState, NpcId, ShipDamageCause } from '../model/schema';
import { nextRandom } from './rng';
import {
  getLocationAncestors,
  getOrdinaryDestinationIds,
  getOrdinaryNewWorldDestinationIds,
  movePlayerToLocation,
} from './locations';

const FALLBACK_IDS = new Set(['dead_end_on_land', 'dead_end_at_sea']);
const EXCLUDED_EXTREME_SEAS = new Set(['sky', 'underwater', 'red_line']);
const outsideMetadata = new Map(worldData.outsideBlueLocations.map((location) => [location.id, location]));
const BLUE_SEAS = new Set(['east_blue', 'west_blue', 'north_blue', 'south_blue']);

const LEGACY_PARADISE_ROUTE_FLAG_PREFIX = 'paradise_route:';
const PARADISE_ROUTE_IDS = Object.keys(worldData.paradiseRouteGraph)
  .filter((routeId) => routeId !== 'P0_INGRESS')
  .sort();

export const PARADISE_ROUTE_START_EVENT_IDS = PARADISE_ROUTE_IDS
  .map((routeId) => `active_paradise_route_start_${routeId.toLowerCase()}`);

const PARADISE_ROUTE_BY_START_EVENT_ID = new Map<string, string>(
  PARADISE_ROUTE_IDS.map((routeId) => [`active_paradise_route_start_${routeId.toLowerCase()}`, routeId]),
);

export function isParadiseRouteStartEventId(eventId: string): boolean {
  return PARADISE_ROUTE_BY_START_EVENT_ID.has(eventId);
}

/** History is authoritative. The old flag is read-only compatibility for current Save 22 states. */
export function activeParadiseRouteId(state: GameState): string | undefined {
  for (let index = state.history.length - 1; index >= 0; index -= 1) {
    const routeId = PARADISE_ROUTE_BY_START_EVENT_ID.get(state.history[index].eventId);
    if (routeId !== undefined) return routeId;
  }

  return PARADISE_ROUTE_IDS.find((routeId) => state.flags.includes(`${LEGACY_PARADISE_ROUTE_FLAG_PREFIX}${routeId}`));
}

function paradiseRouteSequence(routeId: string): readonly string[] | undefined {
  const route = worldData.paradiseRouteGraph[routeId as keyof typeof worldData.paradiseRouteGraph];
  return route?.sequence;
}

function paradiseRouteLocationId(
  state: GameState,
  catalog: ContentCatalog,
  sequence: readonly string[],
): LocationId | undefined {
  const current = catalog.locations.find(({ id }) => id === state.locationId);
  if (!current) return undefined;
  return [current, ...getLocationAncestors(catalog, state.locationId)]
    .find(({ id }) => sequence.includes(id))?.id;
}

export function paradiseNextDestinationId(state: GameState, catalog: ContentCatalog): LocationId | undefined {
  const routeId = activeParadiseRouteId(state);
  const sequence = routeId === undefined ? undefined : paradiseRouteSequence(routeId);
  if (!sequence || sequence.length === 0) return undefined;
  if (state.locationId === 'twin_capes') return sequence[0];

  const routeLocationId = paradiseRouteLocationId(state, catalog, sequence);
  if (routeLocationId === undefined) return undefined;

  const currentIndex = sequence.indexOf(routeLocationId);
  return currentIndex >= 0 && currentIndex + 1 < sequence.length
    ? sequence[currentIndex + 1]
    : undefined;
}

/** Preserve existing departure behavior everywhere except a finished Paradise route. */
export function ordinaryDepartureHasDestination(state: GameState, catalog: ContentCatalog): boolean {
  const current = catalog.locations.find(({ id }) => id === state.locationId);
  return current?.seaId !== 'grand_line_paradise' || paradiseNextDestinationId(state, catalog) !== undefined;
}

export function paradiseArrivalProbabilityForCrossingRoot(rootCount: number, hasParadiseLogPose: boolean): number {
  if (!hasParadiseLogPose && rootCount % 2 !== 0) return 0;
  const effectiveRootCount = hasParadiseLogPose ? rootCount : rootCount / 2;
  return blueArrivalProbabilityForCrossingRoot(effectiveRootCount);
}

function hasActiveParadiseLogPose(state: GameState, catalog: ContentCatalog): boolean {
  if (state.player.logPose === null) return false;
  return catalog.items.find(({ id }) => id === state.player.logPose?.itemId)?.logPoseType === 'paradise';
}

export function resolveOrdinaryParadiseArrivalAfterMonthlyRoot(state: GameState, catalog: ContentCatalog): boolean {
  if (state.careerStatus !== 'active' || state.careerPhase !== 'active' || state.travelState !== 'at_sea' || state.ship === null || state.maritimeEmergency !== null) return false;
  if (state.player.stats.health <= 0 || state.ship.health <= 0 || state.navigationDecisionAgeMonths === null) return false;
  const current = catalog.locations.find(({ id }) => id === state.locationId);
  if (current?.seaId !== 'grand_line_paradise') return false;

  const destinationId = paradiseNextDestinationId(state, catalog);
  if (destinationId === undefined || !catalog.locations.some(({ id }) => id === destinationId)) return false;

  const crossingRoots = state.ageMonths - state.navigationDecisionAgeMonths;
  const probability = paradiseArrivalProbabilityForCrossingRoot(crossingRoots, hasActiveParadiseLogPose(state, catalog));
  if (probability <= 0) return false;

  const arrivalRoll = nextRandom(state.rngState);
  state.rngState = arrivalRoll.nextState;
  if (arrivalRoll.value >= probability) return false;

  movePlayerToLocation(state, destinationId, 'on_land');
  return true;
}


export function blueArrivalProbabilityForCrossingRoot(rootCount: number): number {
  if (rootCount <= 0) return 0;
  if (rootCount === 1) return 0.35;
  if (rootCount === 2) return 0.70;
  return 1;
}

export function resolveOrdinaryBlueArrivalAfterMonthlyRoot(state: GameState, catalog: ContentCatalog): boolean {
  if (state.careerStatus !== 'active' || state.careerPhase !== 'active' || state.travelState !== 'at_sea' || state.ship === null || state.maritimeEmergency !== null) return false;
  if (state.player.stats.health <= 0 || state.ship.health <= 0 || state.navigationDecisionAgeMonths === null) return false;
  const current = catalog.locations.find(({ id }) => id === state.locationId);
  if (!current) return false;
  if (!BLUE_SEAS.has(current.seaId)) {
    if (current.seaId === 'grand_line_paradise') {
      return resolveOrdinaryParadiseArrivalAfterMonthlyRoot(state, catalog);
    }
    if (current.seaId === 'new_world') {
      return resolveOrdinaryNewWorldArrivalAfterMonthlyRoot(state, catalog);
    }
    return false;
  }

  const crossingRoots = state.ageMonths - state.navigationDecisionAgeMonths;
  const probability = blueArrivalProbabilityForCrossingRoot(crossingRoots);
  if (probability <= 0) return false;

  const destinationIds = getOrdinaryDestinationIds(state.locationId, catalog);
  if (destinationIds.length === 0) return false;

  const arrivalRoll = nextRandom(state.rngState);
  state.rngState = arrivalRoll.nextState;
  if (arrivalRoll.value >= probability) return false;

  const destinationRoll = nextRandom(state.rngState);
  state.rngState = destinationRoll.nextState;
  movePlayerToLocation(state, destinationIds[Math.floor(destinationRoll.value * destinationIds.length)], 'on_land');
  return true;
}

export function resolveOrdinaryNewWorldArrivalAfterMonthlyRoot(state: GameState, catalog: ContentCatalog): boolean {
  if (state.careerStatus !== 'active' || state.careerPhase !== 'active' || state.travelState !== 'at_sea' || state.ship === null || state.maritimeEmergency !== null) return false;
  if (state.player.stats.health <= 0 || state.ship.health <= 0 || state.navigationDecisionAgeMonths === null) return false;

  const current = catalog.locations.find(({ id }) => id === state.locationId);
  if (current?.seaId !== 'new_world') return false;

  const crossingRoots = state.ageMonths - state.navigationDecisionAgeMonths;
  const probability = blueArrivalProbabilityForCrossingRoot(crossingRoots);
  if (probability <= 0) return false;

  const destinationIds = getOrdinaryNewWorldDestinationIds(state.locationId, catalog);
  if (destinationIds.length === 0) return false;

  const arrivalRoll = nextRandom(state.rngState);
  state.rngState = arrivalRoll.nextState;
  if (arrivalRoll.value >= probability) return false;

  const destinationRoll = nextRandom(state.rngState);
  state.rngState = destinationRoll.nextState;
  movePlayerToLocation(state, destinationIds[Math.floor(destinationRoll.value * destinationIds.length)], 'on_land');
  return true;
}

export function findBestSwimmingRescuer(state: GameState, requireNoDevilFruit = true): NpcId | undefined {
  return Object.entries(state.npcs)
    .filter(([, npc]) => npc.status === 'crew' && npc.stats.health > 0 && (!requireNoDevilFruit || npc.powers.devilFruitId === null))
    .sort(([leftId, left], [rightId, right]) => right.stats.strength - left.stats.strength || leftId.localeCompare(rightId))[0]?.[0];
}

export function findHighestRelationshipFruitCrew(state: GameState): NpcId | undefined {
  return Object.entries(state.npcs)
    .filter(([, npc]) => npc.status === 'crew' && npc.stats.health > 0 && npc.powers.devilFruitId !== null)
    .sort(([leftId, left], [rightId, right]) => right.relationship - left.relationship || leftId.localeCompare(rightId))[0]?.[0];
}

export function countFallbackStreak(state: GameState, events: readonly EventDefinition[]): number {
  const kinds = new Map(events.map((event) => [event.id, event.kind]));
  let count = 0;
  for (let index = state.history.length - 1; index >= 0; index -= 1) {
    const entry = state.history[index];
    const kind = kinds.get(entry.eventId);
    if (kind === 'immediate' || kind === 'critical') continue;
    if (FALLBACK_IDS.has(entry.eventId)) count += 1;
    else if (kind === 'normal' || kind === 'scheduled') break;
  }
  return count;
}

export function currentShipDestructionCause(state: GameState, catalog: ContentCatalog): ShipDamageCause {
  const latest = state.history.at(-1);
  if (!latest) return 'accident';
  const event = catalog.events.find(({ id }) => id === latest.eventId);
  if (!event) return 'accident';
  for (const choice of event.choices) {
    const resolution = choice.resolution;
    const outcomes = resolution.type === 'deterministic' ? [resolution.outcome] : Object.values(resolution.outcomes);
    const outcome = outcomes.find(({ id }) => id === latest.outcomeId);
    if (outcome) return outcome.shipDamageCause ?? 'accident';
  }
  return 'accident';
}

export function sameIslandPorts(state: GameState, catalog: ContentCatalog) {
  const current = catalog.locations.find(({ id }) => id === state.locationId);
  return current ? catalog.locations.filter(({ islandId, allowsDocking }) => islandId === current.islandId && allowsDocking).sort(byId) : [];
}

export function currentSeaPorts(state: GameState, catalog: ContentCatalog) {
  const seaId = currentSeaId(state, catalog);
  return seaId === undefined ? [] : catalog.locations.filter((location) => location.seaId === seaId && location.id !== state.locationId && location.allowsDocking && isNormalAccess(location.id)).sort(byId);
}

export function moveToSameIslandPort(state: GameState, catalog: ContentCatalog): void {
  const port = sameIslandPorts(state, catalog)[0];
  if (!port) throw new Error(`No same-island port exists for "${state.locationId}".`);
  movePlayerToLocation(state, port.id, 'on_land');
}

export function recoverToLandInCurrentSea(state: GameState, catalog: ContentCatalog): void {
  const seaId = currentSeaId(state, catalog);
  moveSeeded(state, catalog.locations.filter((location) => location.seaId === seaId && location.id !== state.locationId && isNormalAccess(location.id)).map(({ id }) => id));
}

export function recoverToPortInCurrentSea(state: GameState, catalog: ContentCatalog): void {
  moveSeeded(state, currentSeaPorts(state, catalog).map(({ id }) => id));
}

export function recoverToOtherRegion(state: GameState, catalog: ContentCatalog): void {
  const current = currentSeaId(state, catalog);
  moveSeeded(state, catalog.locations.filter((location) => location.seaId !== current && !EXCLUDED_EXTREME_SEAS.has(location.seaId) && isNormalAccess(location.id)).map(({ id }) => id));
}

export function beginMaritimeEmergency(state: GameState, catalog: ContentCatalog, cause: MaritimeEmergencyState['cause']): void {
  const seaId = currentSeaId(state, catalog);
  if (!seaId) throw new Error(`Cannot begin maritime emergency outside a known sea at "${state.locationId}".`);
  state.maritimeEmergency = { kind: 'shipwreck', seaId, cause };
  for (const npcId of state.passengerNpcIds) if (state.npcs[npcId]) state.npcs[npcId] = { ...state.npcs[npcId], status: 'dead', stats: { ...state.npcs[npcId].stats, health: 0 } };
  state.passengerNpcIds = [];
  state.ship = null;
  state.pendingShip = null;
  state.travelState = 'at_sea';
}

export function resolveMaritimeEmergencyLandfall(state: GameState, catalog: ContentCatalog): void {
  if (!state.maritimeEmergency) throw new Error('No maritime emergency to resolve.');
  recoverToLandInCurrentSea(state, catalog);
  state.maritimeEmergency = null;
}

function currentSeaId(state: GameState, catalog: ContentCatalog): string | undefined {
  return state.maritimeEmergency?.seaId ?? catalog.locations.find(({ id }) => id === state.locationId)?.seaId;
}

function moveSeeded(state: GameState, candidateIds: LocationId[]): void {
  const ids = [...new Set(candidateIds)].sort();
  if (ids.length === 0) throw new Error(`No valid recovery destination from "${state.locationId}".`);
  const random = nextRandom(state.rngState);
  state.rngState = random.nextState;
  movePlayerToLocation(state, ids[Math.floor(random.value * ids.length)], 'on_land');
}

function isNormalAccess(locationId: string): boolean {
  const access = outsideMetadata.get(locationId)?.access;
  return access === undefined || access === 'normal' || access === 'route';
}

function byId(left: { id: string }, right: { id: string }): number { return left.id.localeCompare(right.id); }
