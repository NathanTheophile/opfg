import type { ContentCatalog, ItemDefinition } from '../content/schema';
import type { GameState, InventoryState, ItemId, ItemStack } from '../model/schema';
import { addStack, removeStack } from './ship';

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

export function itemBuyPrice(catalog: ContentCatalog, itemId: ItemId, quantity = 1): number {
  assertQuantity(quantity);
  const market = findItemDefinition(catalog, itemId).market;
  if (market === null) throw new Error(`Item "${itemId}" has no generic market price.`);
  return market.basePriceBerries * quantity;
}

export function itemSellPrice(catalog: ContentCatalog, itemId: ItemId, quantity = 1): number {
  assertQuantity(quantity);
  const definition = findItemDefinition(catalog, itemId);
  if (definition.market === null) throw new Error(`Item "${itemId}" has no generic market price.`);
  const unit = Math.max(1, Math.floor(definition.market.basePriceBerries * catalog.economy.defaultSellRatePercent / 100));
  return unit * quantity;
}

export function canBuyItem(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1): boolean {
  if (!Number.isInteger(quantity) || quantity <= 0) return false;
  const definition = catalog.items.find(({ id }) => id === itemId);
  if (!definition?.market) return false;
  const location = catalog.locations.find(({ id }) => id === state.locationId);
  if (!location?.services.includes(definition.market.serviceId)) return false;
  if (state.berries < definition.market.basePriceBerries * quantity) return false;
  const existing = state.player.inventory.stacks.find((stack) => stack.itemId === itemId);
  if (existing) return existing.quantity + quantity <= definition.stackLimit;
  return state.player.inventory.stacks.length < state.player.inventory.capacity && quantity <= definition.stackLimit;
}

export function canSellItem(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1): boolean {
  if (!Number.isInteger(quantity) || quantity <= 0) return false;
  const definition = catalog.items.find(({ id }) => id === itemId);
  if (!definition?.market) return false;
  const location = catalog.locations.find(({ id }) => id === state.locationId);
  return location?.services.includes(definition.market.serviceId) === true
    && itemQuantity(state.player.inventory.stacks, itemId) >= quantity;
}

export function buyItem(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1): void {
  if (!canBuyItem(state, catalog, itemId, quantity)) throw new Error(`Item "${itemId}" cannot be bought in the current state.`);
  const definition = findItemDefinition(catalog, itemId);
  state.berries -= itemBuyPrice(catalog, itemId, quantity);
  addStack(state.player.inventory.stacks, itemId, quantity, state.player.inventory.capacity, definition.stackLimit);
}

export function sellItem(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1): void {
  if (!canSellItem(state, catalog, itemId, quantity)) throw new Error(`Item "${itemId}" cannot be sold in the current state.`);
  removeStack(state.player.inventory.stacks, itemId, quantity);
  state.berries += itemSellPrice(catalog, itemId, quantity);
}

function assertQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Item quantity must be a positive integer.');
}
