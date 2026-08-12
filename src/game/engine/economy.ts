import type { ContentCatalog, DiceResult, ItemDefinition } from '../content/schema';
import type { GameState, InventoryState, ItemId, ItemStack, ShipId } from '../model/schema';
import { addStack, availableCargoSlots, findShipDefinition } from './ship';
import { statToDiceModifier } from './dice';
import { effectivePlayerStat } from './stats';

export function findItemDefinition(catalog: ContentCatalog, itemId: ItemId): ItemDefinition {
  const definition = catalog.items.find(({ id }) => id === itemId);
  if (!definition) throw new Error(`Unknown Item "${itemId}".`);
  return definition;
}

export function itemQuantity(stacks: readonly ItemStack[], itemId: ItemId): number {
  return stacks.find((stack) => stack.itemId === itemId)?.quantity ?? 0;
}

export function inventoryFreeSlots(inventory: InventoryState): number {
  return Math.max(0, inventory.capacity - inventory.stacks.length);
}

export function itemBuyPrice(catalog: ContentCatalog, itemId: ItemId, quantity = 1, negotiation?: DiceResult): number {
  assertQuantity(quantity);
  const market = findItemDefinition(catalog, itemId).market;
  if (market === null) throw new Error(`Item "${itemId}" has no generic market price.`);
  return Math.floor(market.basePriceBerries * quantity * negotiationMultiplier('purchase', negotiation));
}

export function resaleMultiplier(state: GameState, catalog: ContentCatalog): number {
  const combined = statToDiceModifier(effectivePlayerStat(state, catalog, 'charisma')) + statToDiceModifier(effectivePlayerStat(state, catalog, 'luck'));
  return Math.max(0, 1 + 0.1 * combined);
}

export function negotiationMultiplier(kind: 'purchase' | 'resale', result?: DiceResult): number {
  if (result === 'criticalFailure') return kind === 'purchase' ? 1.2 : 0.8;
  if (result === 'success' || result === 'criticalSuccess') return kind === 'purchase' ? 0.8 : 1.2;
  return 1;
}

export function itemSellPrice(catalog: ContentCatalog, itemId: ItemId, quantity = 1, state?: GameState, negotiation?: DiceResult): number {
  assertQuantity(quantity);
  const definition = findItemDefinition(catalog, itemId);
  if (definition.market === null) throw new Error(`Item "${itemId}" has no generic market price.`);
  return Math.floor(definition.market.basePriceBerries * quantity * (state ? resaleMultiplier(state, catalog) : 1) * negotiationMultiplier('resale', negotiation));
}

export function canBuyItem(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1, negotiation?: DiceResult): boolean {
  if (!Number.isInteger(quantity) || quantity <= 0) return false;
  const definition = catalog.items.find(({ id }) => id === itemId);
  if (!definition?.market) return false;
  const location = catalog.locations.find(({ id }) => id === state.locationId);
  if (!location || !['buy_sell', 'buy_only'].includes(definition.market.mode) || !location.marketItemIds.includes(itemId)) return false;
  if (state.berries < itemBuyPrice(catalog, itemId, quantity, negotiation)) return false;
  return findPurchaseDestination(state, catalog, itemId, quantity) !== null;
}

export function canSellItem(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1): boolean {
  if (!Number.isInteger(quantity) || quantity <= 0) return false;
  const definition = catalog.items.find(({ id }) => id === itemId);
  if (!definition?.market) return false;
  const location = catalog.locations.find(({ id }) => id === state.locationId);
  const sellable = [...state.player.inventory.stacks, ...(state.ship?.cargo ?? [])]
    .filter((stack) => stack.itemId === itemId)
    .flatMap((stack) => stack.provenance)
    .filter((batch) => batch.locationId !== state.locationId)
    .reduce((sum, batch) => sum + batch.quantity, 0);
  return location !== undefined
    && location.marketItemIds.includes(itemId)
    && ['buy_sell', 'sell_only'].includes(definition.market.mode)
    && sellable >= quantity;
}

export function buyItem(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1, negotiation?: DiceResult): void {
  if (!canBuyItem(state, catalog, itemId, quantity, negotiation)) throw new Error(`Item "${itemId}" cannot be bought in the current state.`);
  const definition = findItemDefinition(catalog, itemId);
  const destination = findPurchaseDestination(state, catalog, itemId, quantity);
  if (!destination) throw new Error(`Item "${itemId}" has no valid purchase destination.`);
  state.berries -= itemBuyPrice(catalog, itemId, quantity, negotiation);
  addStack(destination.stacks, itemId, quantity, destination.capacity, definition.stackLimit, state.locationId);
}

export function sellItem(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1, negotiation?: DiceResult): void {
  if (!canSellItem(state, catalog, itemId, quantity)) throw new Error(`Item "${itemId}" cannot be sold in the current state.`);
  const removedFromPockets = removeSellableQuantity(state.player.inventory.stacks, itemId, quantity, state.locationId);
  const remaining = quantity - removedFromPockets;
  if (remaining > 0 && state.ship) removeSellableQuantity(state.ship.cargo, itemId, remaining, state.locationId);
  state.berries += itemSellPrice(catalog, itemId, quantity, state, negotiation);
}

export function shipBuyPrice(catalog: ContentCatalog, shipId: ShipId, negotiation?: DiceResult): number {
  return Math.floor(findShipDefinition(catalog, shipId).priceBerries * negotiationMultiplier('purchase', negotiation));
}

export function shipSellPrice(state: GameState, catalog: ContentCatalog, shipId: ShipId, negotiation?: DiceResult): number {
  return Math.floor(findShipDefinition(catalog, shipId).priceBerries * resaleMultiplier(state, catalog) * negotiationMultiplier('resale', negotiation));
}

export function canBuyShip(state: GameState, catalog: ContentCatalog, shipId: ShipId, negotiation?: DiceResult): boolean {
  const market = catalog.locations.find(({ id }) => id === state.locationId)?.shipMarket ?? 'none';
  const offered = market === 'full' || (market === 'small_craft' && ['dinghy', 'sloop'].includes(shipId));
  return offered && state.isLeader && state.ship === null && state.pendingShip === null && state.berries >= shipBuyPrice(catalog, shipId, negotiation);
}

export function buyShip(state: GameState, catalog: ContentCatalog, shipId: ShipId, name: string, negotiation?: DiceResult): void {
  if (!canBuyShip(state, catalog, shipId, negotiation)) throw new Error(`Ship "${shipId}" cannot be bought in the current state.`);
  const definition = findShipDefinition(catalog, shipId);
  state.berries -= shipBuyPrice(catalog, shipId, negotiation);
  state.ship = { shipId, name, health: definition.maxHealth, cargo: [] };
}

export function canSellShip(state: GameState, catalog: ContentCatalog): boolean {
  if (!state.ship || !state.isLeader || state.ship.cargo.length > 0 || state.passengerNpcIds.length > 0) return false;
  const market = catalog.locations.find(({ id }) => id === state.locationId)?.shipMarket ?? 'none';
  return market === 'full' || (market === 'small_craft' && ['dinghy', 'sloop'].includes(state.ship.shipId));
}

export function sellShip(state: GameState, catalog: ContentCatalog, negotiation?: DiceResult): void {
  if (!canSellShip(state, catalog)) throw new Error('The active ship cannot be sold in the current state.');
  state.berries += shipSellPrice(state, catalog, state.ship!.shipId, negotiation);
  state.ship = null;
}

function findPurchaseDestination(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity: number): { stacks: ItemStack[]; capacity: number } | null {
  const definition = findItemDefinition(catalog, itemId);
  const pocket = state.player.inventory;
  const pocketStack = pocket.stacks.find((stack) => stack.itemId === itemId);
  if ((pocketStack && pocketStack.quantity + quantity <= definition.stackLimit)
    || (!pocketStack && pocket.stacks.length < pocket.capacity && quantity <= definition.stackLimit)) return pocket;
  if (!state.ship) return null;
  const cargoStack = state.ship.cargo.find((stack) => stack.itemId === itemId);
  const capacity = state.ship.cargo.length + availableCargoSlots(state.ship, catalog, state.passengerNpcIds.length);
  return (cargoStack && cargoStack.quantity + quantity <= definition.stackLimit)
    || (!cargoStack && state.ship.cargo.length < capacity && quantity <= definition.stackLimit)
    ? { stacks: state.ship.cargo, capacity }
    : null;
}

function removeSellableQuantity(stacks: ItemStack[], itemId: ItemId, quantity: number, currentLocationId: GameState['locationId']): number {
  const stack = stacks.find((entry) => entry.itemId === itemId);
  if (!stack) return 0;
  let remaining = quantity;
  let removed = 0;
  for (let index = 0; index < stack.provenance.length && remaining > 0; index++) {
    const batch = stack.provenance[index];
    if (batch.locationId === currentLocationId) continue;
    const amount = Math.min(batch.quantity, remaining);
    batch.quantity -= amount;
    removed += amount;
    remaining -= amount;
  }
  stack.provenance = stack.provenance.filter(({ quantity: batchQuantity }) => batchQuantity > 0);
  stack.quantity -= removed;
  if (stack.quantity === 0) stacks.splice(stacks.indexOf(stack), 1);
  return removed;
}

function assertQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Item quantity must be a positive integer.');
}
