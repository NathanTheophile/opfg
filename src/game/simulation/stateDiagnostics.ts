import type { ContentCatalog, ShipDefinition } from '../content/schema';
import { countCurrentCrew } from '../engine/ship';
import type { GameState, ItemStack, ShipState } from '../model/schema';

export function assertValidSimulationState(state: GameState, catalog: ContentCatalog): void {
  if (!Number.isInteger(state.berries) || state.berries < 0) throw new Error('Invalid negative or fractional Berrys state.');
  validateStacks(state.player.inventory.stacks, state.player.inventory.capacity, 'player inventory');
  validateShip(state.ship, state, catalog, 'active ship');
  validateShip(state.pendingShip, state, catalog, 'pending ship');
  if (state.pendingShip !== null && countCurrentCrew(state) > getShipDefinition(catalog, state.pendingShip.shipId).crewCapacity) {
    throw new Error(`Pending Ship "${state.pendingShip.shipId}" cannot accommodate the current crew.`);
  }
  if (new Set(state.passengerNpcIds).size !== state.passengerNpcIds.length) throw new Error('Passenger list contains duplicate NPCs.');
  for (const npcId of state.passengerNpcIds) {
    const npc = state.npcs[npcId];
    if (!npc || npc.status === 'crew' || npc.status === 'dead') throw new Error(`Invalid passenger NPC "${npcId}".`);
  }
  if (state.careerStatus === 'active' && state.currentEventId === null && (state.pendingShip !== null || (state.ship === null && state.travelState === 'at_sea') || (state.ship?.health ?? 1) <= 0)) {
    throw new Error('Critical ship state was left unresolved by the content pipeline.');
  }
}

function validateShip(ship: ShipState | null, state: GameState, catalog: ContentCatalog, label: string): void {
  if (ship === null) return;
  const definition = getShipDefinition(catalog, ship.shipId);
  if (!Number.isFinite(ship.health) || ship.health < 0 || ship.health > definition.maxHealth) throw new Error(`${label} health is outside its ShipDefinition bounds.`);
  validateStacks(ship.cargo, definition.cargoSlots - state.passengerNpcIds.length, `${label} cargo`);
  if (label === 'active ship' && countCurrentCrew(state) > definition.crewCapacity) throw new Error(`Active Ship "${ship.shipId}" is over crew capacity.`);
}

function validateStacks(stacks: ItemStack[], capacity: number, label: string): void {
  if (!Number.isInteger(capacity) || capacity < 0 || stacks.length > capacity) throw new Error(`${label} exceeds its slot capacity.`);
  const ids = new Set<string>();
  for (const stack of stacks) {
    if (!Number.isInteger(stack.quantity) || stack.quantity <= 0 || ids.has(stack.itemId)) throw new Error(`${label} contains invalid stacks.`);
    ids.add(stack.itemId);
  }
}

function getShipDefinition(catalog: ContentCatalog, shipId: string): ShipDefinition {
  const definition = catalog.ships.find(({ id }) => id === shipId);
  if (!definition) throw new Error(`Unknown ShipId "${shipId}".`);
  return definition;
}
