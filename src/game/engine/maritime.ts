import worldData from '../content/data/locationsV1.json';
import type { ContentCatalog, EventDefinition } from '../content/schema';
import type { GameState, LocationId, MaritimeEmergencyState, NpcId, ShipDamageCause } from '../model/schema';
import { nextRandom } from './rng';

const FALLBACK_IDS = new Set(['dead_end_on_land', 'dead_end_at_sea']);
const EXCLUDED_EXTREME_SEAS = new Set(['sky', 'underwater', 'red_line']);
const outsideMetadata = new Map(worldData.outsideBlueLocations.map((location) => [location.id, location]));

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
  state.locationId = port.id;
  state.travelState = 'on_land';
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
  state.locationId = ids[Math.floor(random.value * ids.length)];
  state.travelState = 'on_land';
}

function isNormalAccess(locationId: string): boolean {
  const access = outsideMetadata.get(locationId)?.access;
  return access === undefined || access === 'normal' || access === 'route';
}

function byId(left: { id: string }, right: { id: string }): number { return left.id.localeCompare(right.id); }
