import type { ContentCatalog } from '../content/schema';
import type { GameState, ItemId, ItemStack } from '../model/schema';
import { getPlayerMaxHealth } from './health';

export type StorageSlot =
  | { type: 'pocket'; index: 0 | 1 }
  | { type: 'cargo'; index: number }
  | { type: 'equipment'; index: 0 | 1 }
  | { type: 'logPose' }
  | { type: 'companion' };

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
  clampCurrentHealth(state, catalog);
  return true;
}

export function moveItem(state: GameState, catalog: ContentCatalog, source: StorageSlot, destination: StorageSlot): boolean {
  if (sameSlot(source, destination)) return true;
  const snapshot = structuredClone(state);
  try {
    const sourceStack = slotValue(state, source);
    if (!sourceStack) return false;
    if (destination.type === 'equipment') return moveToEquipment(state, catalog, source, destination.index);
    if (destination.type === 'logPose') return moveToLogPose(state, catalog, source);
    if (destination.type === 'companion') return moveToCompanion(state, catalog, source);
    if (source.type === 'equipment') return moveEquipmentToStorage(state, catalog, source.index, destination);
    if (source.type === 'logPose') return moveLogPoseToStorage(state, destination);
    if (source.type === 'companion') return moveCompanionToStorage(state, catalog, destination);
    return swapStorage(state, catalog, source, destination);
  } catch {
    Object.assign(state, snapshot);
    return false;
  }
}

function moveToEquipment(state: GameState, catalog: ContentCatalog, source: StorageSlot, destinationIndex: 0 | 1): boolean {
  if (source.type !== 'pocket' && source.type !== 'cargo') return false;
  const stacks = storage(state, source.type);
  const stack = stacks?.[source.index];
  const definition = stack && catalog.items.find(({ id }) => id === stack.itemId);
  if (!stack || definition?.category !== 'equipment' || state.player.equipment[destinationIndex] !== null) return false;
  if (definition.unique && state.player.equipment.some((entry) => entry?.itemId === stack.itemId)) return false;
  if (definition.twoHanded && state.player.equipment.some((entry) => entry !== null)) return false;
  const equipped = takeOne(stack, stacks!);
  state.player.equipment[destinationIndex] = equipped;
  if (definition.twoHanded) state.player.equipment[destinationIndex === 0 ? 1 : 0] = structuredClone(equipped);
  return true;
}

function moveEquipmentToStorage(state: GameState, catalog: ContentCatalog, index: 0 | 1, destination: StorageSlot): boolean {
  if (destination.type !== 'pocket' && destination.type !== 'cargo') return false;
  const equipped = state.player.equipment[index];
  const target = storage(state, destination.type);
  if (!equipped || !target || destination.index > target.length || (target[destination.index] && target.length >= capacity(state, catalog, destination.type))) return false;
  const definition = catalog.items.find(({ id }) => id === equipped.itemId);
  const displaced = target[destination.index] ?? null;
  if (displaced) return false;
  target.splice(destination.index, 0, equipped);
  state.player.equipment = definition?.twoHanded ? [null, null] : state.player.equipment.map((entry, slot) => slot === index ? null : entry) as GameState['player']['equipment'];
  clampCurrentHealth(state, catalog);
  return true;
}

function moveToLogPose(state: GameState, catalog: ContentCatalog, source: StorageSlot): boolean {
  if (state.player.logPose || (source.type !== 'pocket' && source.type !== 'cargo')) return false;
  return activateLogPose(state, catalog, source);
}

function moveLogPoseToStorage(state: GameState, destination: StorageSlot): boolean {
  if ((destination.type !== 'pocket' && destination.type !== 'cargo') || !state.player.logPose) return false;
  const target = storage(state, destination.type);
  if (!target || target[destination.index]) return false;
  target.splice(destination.index, 0, state.player.logPose);
  state.player.logPose = null;
  return true;
}

function moveToCompanion(state: GameState, catalog: ContentCatalog, source: StorageSlot): boolean {
  if (source.type !== 'pocket' && source.type !== 'cargo') return false;
  const stacks = storage(state, source.type);
  const stack = stacks?.[source.index];
  const definition = stack && catalog.items.find(({ id }) => id === stack.itemId);
  if (!stack || definition?.companion !== true) return false;

  const active = state.player.companion;
  if (active) {
    const activeDefinition = catalog.items.find(({ id }) => id === active.itemId);
    if (!activeDefinition || activeDefinition.companion !== true) return false;

    if (stack.quantity === 1) {
      stacks![source.index] = active;
      state.player.companion = stack;
      clampCurrentHealth(state, catalog);
      return true;
    }

    const existing = stacks!.find((entry, index) => index !== source.index && entry.itemId === active.itemId);
    if (existing) {
      if (existing.quantity + active.quantity > activeDefinition.stackLimit) return false;
    } else if (stacks!.length >= capacity(state, catalog, source.type)) {
      return false;
    }

    const incoming = takeOne(stack, stacks!);
    if (existing) mergeStack(existing, active);
    else stacks!.push(active);
    state.player.companion = incoming;
  } else {
    state.player.companion = takeOne(stack, stacks!);
  }

  clampCurrentHealth(state, catalog);
  return true;
}

function moveCompanionToStorage(state: GameState, catalog: ContentCatalog, destination: StorageSlot): boolean {
  if ((destination.type !== 'pocket' && destination.type !== 'cargo') || !state.player.companion) return false;
  const target = storage(state, destination.type);
  if (!target || target[destination.index] || destination.index > target.length || target.length >= capacity(state, catalog, destination.type)) return false;
  target.splice(destination.index, 0, state.player.companion);
  state.player.companion = null;
  clampCurrentHealth(state, catalog);
  return true;
}

function swapStorage(state: GameState, catalog: ContentCatalog, source: StorageSlot, destination: StorageSlot): boolean {
  if ((source.type !== 'pocket' && source.type !== 'cargo') || (destination.type !== 'pocket' && destination.type !== 'cargo')) return false;
  const from = storage(state, source.type);
  const to = storage(state, destination.type);
  if (!from || !to || !from[source.index] || destination.index > to.length) return false;
  if (from === to) {
    const displaced = from[destination.index];
    from[destination.index] = from[source.index];
    if (displaced) from[source.index] = displaced;
    else from.splice(source.index, 1);
    return true;
  }
  const incoming = from[source.index];
  const displaced = to[destination.index];
  if (!displaced && to.length >= capacity(state, catalog, destination.type)) return false;
  if (displaced) from[source.index] = displaced;
  else from.splice(source.index, 1);
  if (displaced) to[destination.index] = incoming;
  else to.splice(destination.index, 0, incoming);
  return true;
}

function storage(state: GameState, type: 'pocket' | 'cargo') { return type === 'pocket' ? state.player.inventory.stacks : state.ship?.cargo; }
function capacity(state: GameState, catalog: ContentCatalog, type: 'pocket' | 'cargo') { return type === 'pocket' ? 2 : shipCapacity(state, catalog); }
function slotValue(state: GameState, slot: StorageSlot) {
  if (slot.type === 'pocket' || slot.type === 'cargo') return storage(state, slot.type)?.[slot.index] ?? null;
  if (slot.type === 'equipment') return state.player.equipment[slot.index];
  return slot.type === 'logPose' ? state.player.logPose : state.player.companion;
}
function sameSlot(left: StorageSlot, right: StorageSlot) { return left.type === right.type && ('index' in left ? 'index' in right && left.index === right.index : !('index' in right)); }

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
  return [...state.player.inventory.stacks, ...(state.ship?.cargo ?? []), ...state.player.equipment.filter((entry): entry is ItemStack => entry !== null), ...(state.player.logPose ? [state.player.logPose] : []), ...(state.player.companion ? [state.player.companion] : [])].some((stack) => stack.itemId === itemId);
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

function mergeStack(target: ItemStack, incoming: ItemStack): void {
  target.quantity += incoming.quantity;
  for (const batch of incoming.provenance) {
    const existing = target.provenance.find(({ locationId }) => locationId === batch.locationId);
    if (existing) existing.quantity += batch.quantity;
    else target.provenance.push({ ...batch });
  }
}

function clampCurrentHealth(state: GameState, catalog: ContentCatalog): void {
  if (state.player.profile.raceId === null) return;
  state.player.stats.health = Math.max(1, Math.min(state.player.stats.health, getPlayerMaxHealth(state, catalog)));
}
