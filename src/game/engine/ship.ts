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
  const market = catalog.locations.find(({ id }) => id === state.locationId)?.shipMarket ?? 'none';
  if (market === 'none' || (market === 'small_craft' && shipId !== 'dinghy' && shipId !== 'sloop')) return false;
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

export function addStack(stacks: ItemStack[], itemId: ItemId, quantity: number, capacity: number, stackLimit = Number.MAX_SAFE_INTEGER, locationId: import('../model/schema').LocationId | null = null): void {
  assertQuantity(quantity);
  if (!Number.isInteger(stackLimit) || stackLimit <= 0) throw new Error('Item stack limit must be a positive integer.');
  const existing = stacks.find((stack) => stack.itemId === itemId);
  if (existing) {
    if (existing.quantity + quantity > stackLimit) throw new Error(`Item "${itemId}" exceeds stack limit ${stackLimit}.`);
    existing.quantity += quantity;
    const batch = existing.provenance.find((entry) => entry.locationId === locationId);
    if (batch) batch.quantity += quantity;
    else existing.provenance.push({ locationId, quantity });
    return;
  }
  if (quantity > stackLimit) throw new Error(`Item "${itemId}" exceeds stack limit ${stackLimit}.`);
  if (stacks.length >= capacity) throw new Error(`No free inventory slot for Item "${itemId}".`);
  stacks.push({ itemId, quantity, provenance: [{ locationId, quantity }] });
}

export function removeStack(stacks: ItemStack[], itemId: ItemId, quantity: number): void {
  assertQuantity(quantity);
  const existing = stacks.find((stack) => stack.itemId === itemId);
  if (!existing || existing.quantity < quantity) throw new Error(`Not enough Item "${itemId}" to remove ${quantity}.`);
  existing.quantity -= quantity;
  let remaining = quantity;
  for (let index = existing.provenance.length - 1; index >= 0 && remaining > 0; index--) {
    const removed = Math.min(remaining, existing.provenance[index].quantity);
    existing.provenance[index].quantity -= removed;
    remaining -= removed;
    if (existing.provenance[index].quantity === 0) existing.provenance.splice(index, 1);
  }
  if (existing.quantity === 0) stacks.splice(stacks.indexOf(existing), 1);
}

export function cloneInventory(inventory: InventoryState): InventoryState {
  return { capacity: inventory.capacity, stacks: inventory.stacks.map((stack) => ({ ...stack, provenance: stack.provenance.map((batch) => ({ ...batch })) })) };
}

export function cloneShip(ship: ShipState | null): ShipState | null {
  return ship === null ? null : { ...ship, cargo: ship.cargo.map((stack) => ({ ...stack, provenance: stack.provenance.map((batch) => ({ ...batch })) })) };
}

function assertQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Item quantity must be a positive integer.');
}
