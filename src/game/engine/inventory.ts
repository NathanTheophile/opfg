import type { ContentCatalog, ItemDefinition } from '../content/schema';
import type { GameState, ItemId, ItemStack } from '../model/schema';
import { effectivePlayerStat } from './stats';

export type StorageSlot =
  | { type: 'pocket'; index: 0 | 1 }
  | { type: 'cargo'; index: number }
  | { type: 'equipment'; index: 0 | 1 }
  | { type: 'logPose' };

export function equipFromStorage(state: GameState, catalog: ContentCatalog, source: { type: 'pocket' | 'cargo'; index: number }): boolean {
  const stacks = source.type === 'pocket' ? state.player.inventory.stacks : state.ship?.cargo;
  const stack = stacks?.[source.index];
  const definition = stack && catalog.items.find(({ id }) => id === stack.itemId);
  if (!stack || definition?.category !== 'equipment') return false;
  if (definition.unique && state.player.equipment.some((entry) => entry?.itemId === stack.itemId)) return false;
  const free = state.player.equipment.flatMap((entry, index) => entry === null ? [index as 0 | 1] : []);
  if (free.length < (definition.twoHanded ? 2 : 1)) return false;
  const equipped = takeOne(stack, stacks!);
  state.player.equipment[free[0]] = equipped;
  if (definition.twoHanded) state.player.equipment[free[1]] = { ...equipped, provenance: equipped.provenance.map((batch) => ({ ...batch })) };
  return true;
}

export function unequipToPocket(state: GameState, catalog: ContentCatalog, index: 0 | 1): boolean {
  const stack = state.player.equipment[index];
  if (!stack || state.player.inventory.stacks.length >= 2) return false;
  const definition = catalog.items.find(({ id }) => id === stack.itemId);
  state.player.equipment = definition?.twoHanded ? [null, null] : state.player.equipment.map((entry, slot) => slot === index ? null : entry) as GameState['player']['equipment'];
  state.player.inventory.stacks.push(stack);
  state.player.stats.health = Math.max(1, Math.min(state.player.stats.health, effectivePlayerStat(state, catalog, 'health')));
  return true;
}

export function activateLogPose(state: GameState, catalog: ContentCatalog, source: { type: 'pocket' | 'cargo'; index: number }): boolean {
  if (state.player.logPose !== null) return false;
  const stacks = source.type === 'pocket' ? state.player.inventory.stacks : state.ship?.cargo;
  const stack = stacks?.[source.index];
  if (!stack || !catalog.items.find(({ id }) => id === stack.itemId)?.logPoseType) return false;
  state.player.logPose = takeOne(stack, stacks!);
  return true;
}

export function tryAutoPlaceReward(state: GameState, catalog: ContentCatalog, itemId: ItemId, quantity = 1, locationId = state.locationId): boolean {
  const definition = catalog.items.find(({ id }) => id === itemId);
  if (!definition || quantity <= 0 || (definition.unique && ownsUsableCopy(state, itemId))) return definition?.unique === true;
  if (definition.category === 'equipment' && quantity === 1) {
    const temp: ItemStack = { itemId, quantity: 1, provenance: [{ locationId, quantity: 1 }] };
    state.player.inventory.stacks.push(temp);
    if (equipFromStorage(state, catalog, { type: 'pocket', index: state.player.inventory.stacks.length - 1 })) return true;
    state.player.inventory.stacks.pop();
  }
  const destination = state.player.inventory.stacks.length < 2 ? state.player.inventory.stacks : state.ship && state.ship.cargo.length < shipCapacity(state, catalog) ? state.ship.cargo : undefined;
  if (!destination) return false;
  destination.push({ itemId, quantity, provenance: [{ locationId, quantity }] });
  return true;
}

export function activeLogPoseNavigationBonus(state: GameState, catalog: ContentCatalog): number {
  return state.player.logPose && catalog.items.find(({ id }) => id === state.player.logPose?.itemId)?.logPoseType ? 3 : 0;
}

export function resolveOverflow(state: GameState, catalog: ContentCatalog, action: { type: 'discardStored'; storage: 'pocket' | 'cargo'; index: number } | { type: 'abandonIncoming' }): void {
  const incoming = state.pendingOverflow;
  if (!incoming) throw new Error('No pending overflow reward.');
  if (action.type === 'abandonIncoming') {
    if (incoming.mandatory) throw new Error('Mandatory reward cannot be abandoned.');
    state.pendingOverflow = null;
    return;
  }
  const stacks = action.storage === 'pocket' ? state.player.inventory.stacks : state.ship?.cargo;
  if (!stacks?.[action.index]) throw new Error('Overflow discard target is unavailable.');
  stacks.splice(action.index, 1);
  state.pendingOverflow = null;
  if (!tryAutoPlaceReward(state, catalog, incoming.itemId, incoming.quantity, incoming.locationId ?? state.locationId)) throw new Error('Incoming reward still cannot be placed after discard.');
}

function ownsUsableCopy(state: GameState, itemId: ItemId): boolean {
  return [...state.player.inventory.stacks, ...(state.ship?.cargo ?? []), ...state.player.equipment.filter((entry): entry is ItemStack => entry !== null), ...(state.player.logPose ? [state.player.logPose] : [])].some((stack) => stack.itemId === itemId);
}

function shipCapacity(state: GameState, catalog: ContentCatalog): number {
  return catalog.ships.find(({ id }) => id === state.ship?.shipId)?.cargoSlots ?? 0;
}

function takeOne(stack: ItemStack, stacks: ItemStack[]): ItemStack {
  const batch = stack.provenance[0];
  const result = { itemId: stack.itemId, quantity: 1, provenance: [{ locationId: batch.locationId, quantity: 1 }] };
  stack.quantity--;
  batch.quantity--;
  if (batch.quantity === 0) stack.provenance.shift();
  if (stack.quantity === 0) stacks.splice(stacks.indexOf(stack), 1);
  return result;
}
