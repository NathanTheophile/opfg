import worldData from '../content/data/locationsV1.json';
import type { ContentCatalog, LocationDefinition } from '../content/schema';
import type { GameState, LocationId } from '../model/schema';
import { nextRandom } from './rng';

export function findLocation(catalog: ContentCatalog, locationId: LocationId): LocationDefinition | undefined {
  return catalog.locations.find(({ id }) => id === locationId);
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
  state.locationId = destinationIds[Math.floor(random.value * destinationIds.length)];
  state.travelState = 'on_land';
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
