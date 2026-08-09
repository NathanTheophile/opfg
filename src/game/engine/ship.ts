import type { ContentCatalog, ShipDefinition } from '../content/schema';
import type { GameState, InventoryState, ItemId, ItemStack, ShipId, ShipState } from '../model/schema';

export function findShipDefinition(catalog: ContentCatalog, shipId: ShipId): ShipDefinition {
  const definition = catalog.ships.find(({ id }) => id === shipId);
  if (!definition) throw new Error(`Unknown ship "${shipId}".`);
  return definition;
}

export function countCurrentCrew(state: GameState): number {
  // GAME_DESIGN intentionally leaves whether the player consumes capacity open.
  return Object.values(state.npcs).filter(({ status }) => status === 'crew').length;
}

export function canAcquireShip(state: GameState, catalog: ContentCatalog, shipId: ShipId, allowWithoutLeadership = false): boolean {
  const definition = catalog.ships.find(({ id }) => id === shipId);
  if (!definition || state.pendingShip !== null) return false;
  if (!state.isLeader && (!allowWithoutLeadership || state.ship !== null)) return false;
  if (countCurrentCrew(state) > definition.crewCapacity) return false;
  return (state.ship?.cargo.length ?? 0) + state.passengerNpcIds.length <= definition.cargoSlots;
}

export function availableCargoSlots(ship: ShipState, catalog: ContentCatalog, passengerCount = 0): number {
  return findShipDefinition(catalog, ship.shipId).cargoSlots - ship.cargo.length - passengerCount;
}

export function canRecruitNpc(state: GameState, catalog: ContentCatalog, npcId: string, allowWithoutLeadership = false): boolean {
  if (!state.isLeader && !allowWithoutLeadership) return false;
  if (state.npcs[npcId]?.status === 'crew') return true;
  if (state.ship === null) return true;
  return countCurrentCrew(state) + 1 <= findShipDefinition(catalog, state.ship.shipId).crewCapacity;
}

export function addStack(stacks: ItemStack[], itemId: ItemId, quantity: number, capacity: number): void {
  assertQuantity(quantity);
  const existing = stacks.find((stack) => stack.itemId === itemId);
  if (existing) {
    existing.quantity += quantity;
    return;
  }
  if (stacks.length >= capacity) throw new Error(`No free inventory slot for Item "${itemId}".`);
  stacks.push({ itemId, quantity });
}

export function removeStack(stacks: ItemStack[], itemId: ItemId, quantity: number): void {
  assertQuantity(quantity);
  const existing = stacks.find((stack) => stack.itemId === itemId);
  if (!existing || existing.quantity < quantity) throw new Error(`Not enough Item "${itemId}" to remove ${quantity}.`);
  existing.quantity -= quantity;
  if (existing.quantity === 0) stacks.splice(stacks.indexOf(existing), 1);
}

export function cloneInventory(inventory: InventoryState): InventoryState {
  return { capacity: inventory.capacity, stacks: inventory.stacks.map((stack) => ({ ...stack })) };
}

export function cloneShip(ship: ShipState | null): ShipState | null {
  return ship === null ? null : { ...ship, cargo: ship.cargo.map((stack) => ({ ...stack })) };
}

function assertQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Item quantity must be a positive integer.');
}
