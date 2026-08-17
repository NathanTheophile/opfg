import worldData from '../content/data/locationsV1.json';
import type { ContentCatalog, LocationDefinition } from '../content/schema';
import type { GameState, LocationId, SeaId, TravelState } from '../model/schema';
import { nextRandom } from './rng';

export function findLocation(catalog: ContentCatalog, locationId: LocationId): LocationDefinition | undefined {
  return catalog.locations.find(({ id }) => id === locationId);
}

export function movePlayerToLocation(state: GameState, locationId: LocationId, travelState: TravelState): void {
  const departsToSea =
    travelState === 'at_sea'
    && state.travelState === 'on_land';
  const arrivesOnLand =
    travelState === 'on_land'
    && (state.locationId !== locationId || state.travelState !== 'on_land');

  state.locationId = locationId;
  state.travelState = travelState;

  if (departsToSea) {
    state.navigationDecisionAgeMonths = state.ageMonths;
  } else if (arrivesOnLand) {
    state.shipMarketArrivalPending = true;
    state.navigationDecisionAgeMonths = state.ageMonths;
  }
}

export function getLocationAncestors(catalog: ContentCatalog, locationId: LocationId): LocationDefinition[] {
  const ancestors: LocationDefinition[] = [];
  const visited = new Set<LocationId>();
  let current = findLocation(catalog, locationId);
  while (current?.parentLocationId) {
    if (visited.has(current.id)) break;
    visited.add(current.id);
    current = findLocation(catalog, current.parentLocationId);
    if (!current) break;
    ancestors.push(current);
  }
  return ancestors;
}

export function isLocationWithin(catalog: ContentCatalog, currentId: LocationId, targetId: LocationId): boolean {
  return currentId === targetId || getLocationAncestors(catalog, currentId).some(({ id }) => id === targetId);
}

export function findDockableAccess(catalog: ContentCatalog, locationId: LocationId): LocationDefinition | undefined {
  const current = findLocation(catalog, locationId);
  return [current, ...getLocationAncestors(catalog, locationId)].find((location) => location?.allowsDocking);
}

const BLUE_SEAS = new Set<SeaId>([
  'east_blue',
  'west_blue',
  'north_blue',
  'south_blue',
]);

const STANDARD_MARITIME_SEAS = new Set<SeaId>([
  ...BLUE_SEAS,
  'grand_line_paradise',
  'new_world',
]);

const PLAYER_DIRECT_NAVIGATION_SEAS = new Set<SeaId>([
  'east_blue',
  'west_blue',
  'north_blue',
  'south_blue',
  'grand_line_paradise',
]);

const OUTSIDE_LOCATION_METADATA = new Map(worldData.outsideBlueLocations.map((location) => [location.id, location]));

const ORDINARY_ACCESS_LOCATION_IDS = new Set<LocationId>([
  ...worldData.blueLocations.map(({ id }) => id),
  ...worldData.outsideBlueLocations.filter(({ access }) => access === 'normal').map(({ id }) => id),
]);

export function getNavigableDestinationIds(currentId: LocationId, catalog: ContentCatalog): LocationId[] {
  const current = findLocation(catalog, currentId);
  if (!current || !PLAYER_DIRECT_NAVIGATION_SEAS.has(current.seaId)) return [];

  return fallbackDestinationIds(currentId, catalog)
    .filter((id) => {
      const destination = findLocation(catalog, id);
      return destination !== undefined && destination.islandId !== current.islandId;
    });
}

/** Destinations a Navigator may reach directly: dockable, ordinary and in the current sea. */
export function getOrdinaryDestinationIds(currentId: LocationId, catalog: ContentCatalog): LocationId[] {
  const current = findLocation(catalog, currentId);
  if (!current) return [];

  return catalog.locations
    .filter((location) => location.seaId === current.seaId
      && location.islandId !== current.islandId
      && location.allowsDocking
      && ORDINARY_ACCESS_LOCATION_IDS.has(location.id))
    .map(({ id }) => id)
    .sort();
}

/** Direct destinations exposed only by the annual Navigator crew-role power. */
export function getNavigatorDestinationIds(currentId: LocationId, catalog: ContentCatalog): LocationId[] {
  const current = findLocation(catalog, currentId);
  if (!current) return [];

  if (BLUE_SEAS.has(current.seaId)) {
    const destinationIds = new Set(getOrdinaryDestinationIds(currentId, catalog));
    if (catalog.locations.some(({ id }) => id === 'reverse_mountain')) destinationIds.add('reverse_mountain');
    return [...destinationIds].sort();
  }

  if (current.seaId === 'grand_line_paradise') return [];
  if (current.seaId !== 'new_world') return [];

  return catalog.locations
    .filter((location) => location.islandId !== current.islandId)
    .filter((location) => STANDARD_MARITIME_SEAS.has(location.seaId))
    .filter((location) => location.allowsDocking)
    .filter((location) => location.id !== 'reverse_mountain')
    .filter((location) => {
      const access = OUTSIDE_LOCATION_METADATA.get(location.id)?.access;
      return access === undefined || access === 'normal' || access === 'route';
    })
    .map(({ id }) => id)
    .sort();
}

export function getLocationDisplayName(catalog: ContentCatalog, locationId: LocationId, translate: (key: string) => string): string {
  const current = findLocation(catalog, locationId);
  if (!current) return locationId;
  const ancestors = getLocationAncestors(catalog, locationId);
  const root = ancestors.at(-1);
  return root ? `${translate(root.nameKey)} - ${translate(current.nameKey)}` : translate(current.nameKey);
}

export function recoverTravel(state: GameState, catalog: ContentCatalog, mode: 'land' | 'sea'): void {
  if (mode === 'land') {
    if (!findDockableAccess(catalog, state.locationId)) throw new Error(`Location "${state.locationId}" has no dockable sea access.`);
    if (state.ship === null) {
      moveToFallbackDestination(state, catalog);
      return;
    }
    state.travelState = 'at_sea';
    return;
  }
  moveToFallbackDestination(state, catalog);
}

function moveToFallbackDestination(state: GameState, catalog: ContentCatalog): void {
  const destinationIds = fallbackDestinationIds(state.locationId, catalog);
  if (destinationIds.length === 0) throw new Error(`No safe fallback destination from "${state.locationId}".`);
  const random = nextRandom(state.rngState);
  state.rngState = random.nextState;
  movePlayerToLocation(state, destinationIds[Math.floor(random.value * destinationIds.length)], 'on_land');
}

function fallbackDestinationIds(currentId: LocationId, catalog: ContentCatalog): LocationId[] {
  const current = findLocation(catalog, currentId);
  if (!current) return [];
  if (current.seaId === 'grand_line_paradise') {
    const routeCurrent = getLocationAncestors(catalog, currentId).at(-1)?.id ?? currentId;
    const forward = Object.values(worldData.paradiseRouteGraph).flatMap((route) => {
      const index = route.sequence.indexOf(routeCurrent);
      return index >= 0 && index + 1 < route.sequence.length ? [route.sequence[index + 1]] : [];
    });
    const safeForward = [...new Set(forward)].filter((id) => isSafeDestination(id, catalog));
    if (safeForward.length > 0) return safeForward;
  }
  const metadata = new Map(worldData.outsideBlueLocations.map((location) => [location.id, location]));
  return catalog.locations
    .filter((location) => location.id !== currentId && location.seaId === current.seaId && location.allowsDocking)
    .filter((location) => {
      const access = metadata.get(location.id)?.access;
      return access === undefined || access === 'normal' || access === 'route';
    })
    .map(({ id }) => id)
    .sort();
}

function isSafeDestination(id: LocationId, catalog: ContentCatalog): boolean {
  const location = findLocation(catalog, id);
  const metadata = worldData.outsideBlueLocations.find((entry) => entry.id === id);
  return location?.allowsDocking === true && (metadata?.access === 'normal' || metadata?.access === 'route');
}
