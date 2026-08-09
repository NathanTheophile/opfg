import type { CareerEndReason, CareerPhase, GameState, ItemStack, NpcState, NpcStats, PowerState, ShipState, TravelState } from '../model/schema';
import { createDefaultPowerState } from './powers';

export const SAVE_KEY = 'jam-op-fan-game.save';
const CURRENT_SAVE_VERSION = 13;
const NPC_STATUSES = new Set(['known', 'crew', 'departed', 'unavailable', 'dead']);

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

export function deserializeGameState(raw: string): GameState | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  return readGameState(migrateLegacySave(value));
}

export function saveGameState(storage: StorageLike, state: GameState): boolean {
  try {
    storage.setItem(SAVE_KEY, serializeGameState(state));
    return true;
  } catch {
    return false;
  }
}

export function loadGameState(storage: StorageLike): GameState | null {
  try {
    const raw = storage.getItem(SAVE_KEY);
    return raw === null ? null : deserializeGameState(raw);
  } catch {
    return null;
  }
}

export function clearGameState(storage: StorageLike): boolean {
  try {
    storage.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}

function readGameState(value: unknown): GameState | null {
  if (!isRecord(value) || value.version !== CURRENT_SAVE_VERSION) return null;
  if (!isUint32(value.rngState) || !isNonNegativeInteger(value.ageMonths) || !(value.slotInMonth === 0 || value.slotInMonth === 1)) return null;
  if (!isCareerPhase(value.careerPhase) || !isTravelState(value.travelState) || !isString(value.locationId)) return null;
  if (!isRecord(value.player) || !isRecord(value.player.stats) || !isStringArray(value.player.traits)) return null;
  const inventory = readInventory(value.player.inventory);
  if (inventory === null || inventory.capacity !== 2) return null;
  const profile = readPlayerProfile(value.player.profile);
  if (profile === null) return null;
  if (!isFiniteNumber(value.player.stats.health)) return null;
  if (!isStatValue(value.player.stats.morale)) return null;
  if (!isStatValue(value.player.stats.strength)) return null;
  if (!isStatValue(value.player.stats.agility)) return null;
  if (!isStatValue(value.player.stats.observation)) return null;
  if (!isStatValue(value.player.stats.intelligence)) return null;
  if (!isStatValue(value.player.stats.navigation)) return null;
  if (!isStatValue(value.player.stats.charisma)) return null;
  if (!isStatValue(value.player.stats.luck)) return null;
  const playerPowers = readPowerState(value.player.powers);
  if (playerPowers === null) return null;
  const ship = readShip(value.ship);
  const pendingShip = readShip(value.pendingShip);
  if (ship === undefined || pendingShip === undefined || typeof value.isLeader !== 'boolean' || !isUniqueStringArray(value.passengerNpcIds) || !isNonNegativeInteger(value.berries)) return null;
  if (!isStringArray(value.flags)) return null;

  const npcs = readNpcs(value.npcs);
  const history = readHistory(value.history);
  const scheduledEvents = readScheduledEvents(value.scheduledEvents);
  if (npcs === null || history === null || scheduledEvents === null || !isStringArray(value.immediateEventQueue)) return null;
  if (!(value.pendingSlotPhase === null || isCareerPhase(value.pendingSlotPhase))) return null;
  if (!isNonNegativeInteger(value.immediateEventsResolvedInChain) || value.immediateEventsResolvedInChain > 1000) return null;
  if (!(value.navigationDecisionAgeMonths === null || (isNonNegativeInteger(value.navigationDecisionAgeMonths) && value.navigationDecisionAgeMonths <= value.ageMonths))) return null;
  if (value.passengerNpcIds.some((npcId) => npcs[npcId] === undefined || npcs[npcId].status === 'crew' || npcs[npcId].status === 'dead')) return null;
  if (!(value.currentEventId === null || isString(value.currentEventId))) return null;
  if (!(value.careerStatus === 'active' || value.careerStatus === 'ended')) return null;
  if (!isCareerEndReason(value.careerEndReason)) return null;
  if (value.careerStatus === 'active' && value.careerEndReason !== null) return null;
  if (value.careerStatus === 'ended' && value.careerEndReason === null) return null;
  if (value.careerPhase !== 'active' && value.slotInMonth !== 0) return null;

  return {
    version: CURRENT_SAVE_VERSION,
    rngState: value.rngState,
    careerPhase: value.careerPhase,
    ageMonths: value.ageMonths,
    slotInMonth: value.slotInMonth,
    travelState: value.travelState,
    locationId: value.locationId,
    player: {
      profile,
      stats: {
        health: value.player.stats.health,
        morale: value.player.stats.morale,
        strength: value.player.stats.strength,
        agility: value.player.stats.agility,
        observation: value.player.stats.observation,
        intelligence: value.player.stats.intelligence,
        navigation: value.player.stats.navigation,
        charisma: value.player.stats.charisma,
        luck: value.player.stats.luck,
      },
      traits: [...value.player.traits],
      inventory,
      powers: playerPowers,
    },
    ship,
    pendingShip,
    isLeader: value.isLeader,
    passengerNpcIds: [...value.passengerNpcIds],
    berries: value.berries,
    flags: [...value.flags],
    npcs,
    history,
    scheduledEvents,
    immediateEventQueue: [...value.immediateEventQueue],
    pendingSlotPhase: value.pendingSlotPhase,
    immediateEventsResolvedInChain: value.immediateEventsResolvedInChain,
    navigationDecisionAgeMonths: value.navigationDecisionAgeMonths,
    currentEventId: value.currentEventId,
    careerStatus: value.careerStatus,
    careerEndReason: value.careerEndReason,
  };
}

function migrateLegacySave(value: unknown): unknown {
  let migrated = value;
  if (isRecord(migrated) && migrated.version === 7 && isRecord(migrated.player)) {
    const legacyItems = isStringArray(migrated.items) ? migrated.items : [];
    const legacyShip = isRecord(migrated.ship) && isIntegerInRange(migrated.ship.condition, 0, 3)
      ? { shipId: 'starter_sloop', name: 'Wind Finch', health: migrated.ship.condition * 10, cargo: [] }
      : migrated.ship === null ? null : migrated.ship;
    const { items: _items, ...withoutItems } = migrated;
    migrated = {
      ...withoutItems,
      version: 8,
      player: { ...migrated.player, inventory: { capacity: 2, stacks: legacyItems.map((itemId) => ({ itemId, quantity: 1 })) } },
      ship: legacyShip,
      pendingShip: null,
      berries: 0,
    };
  }
  if (isRecord(migrated) && migrated.version === 8) {
    migrated = { ...migrated, version: 9, isLeader: true, passengerNpcIds: [] };
  }
  if (isRecord(migrated) && migrated.version === 9 && isRecord(migrated.player) && isRecord(migrated.player.stats)) {
    migrated = {
      ...migrated,
      version: 10,
      player: { ...migrated.player, stats: { ...migrated.player.stats, agility: 25 } },
    };
  }
  if (isRecord(migrated) && migrated.version === 10 && isRecord(migrated.player) && isRecord(migrated.player.profile)) {
    migrated = {
      ...migrated,
      version: 11,
      player: {
        ...migrated.player,
        profile: { ...migrated.player.profile, familyStructureId: null, socialClassId: null },
      },
    };
  }
  if (isRecord(migrated) && migrated.version === 11) {
    migrated = {
      ...migrated,
      version: 12,
      immediateEventQueue: [],
      pendingSlotPhase: null,
      immediateEventsResolvedInChain: 0,
      navigationDecisionAgeMonths: null,
    };
  }
  if (isRecord(migrated) && migrated.version === 12 && isRecord(migrated.player)) {
    const player = migrated.player;
    const stats = isRecord(player.stats) ? { ...player.stats } : player.stats;
    if (isRecord(stats)) delete stats.awakening;
    const npcs = isRecord(migrated.npcs) ? Object.fromEntries(Object.entries(migrated.npcs).map(([id, npc]) => [id, isRecord(npc) ? { ...npc, powers: createDefaultPowerState() } : npc])) : migrated.npcs;
    migrated = { ...migrated, version: CURRENT_SAVE_VERSION, player: { ...player, stats, powers: createDefaultPowerState() }, npcs };
  }
  return migrated;
}

function readInventory(value: unknown): GameState['player']['inventory'] | null {
  if (!isRecord(value) || !isNonNegativeInteger(value.capacity)) return null;
  const stacks = readStacks(value.stacks);
  if (stacks === null || stacks.length > value.capacity) return null;
  return { capacity: value.capacity, stacks };
}

function readShip(value: unknown): ShipState | null | undefined {
  if (value === null) return null;
  if (!isRecord(value) || !isString(value.shipId) || !isString(value.name) || !isFiniteNumber(value.health) || value.health < 0) return undefined;
  const cargo = readStacks(value.cargo);
  if (cargo === null) return undefined;
  return { shipId: value.shipId, name: value.name, health: value.health, cargo };
}

function readStacks(value: unknown): ItemStack[] | null {
  if (!Array.isArray(value)) return null;
  const seen = new Set<string>();
  const stacks: ItemStack[] = [];
  for (const entry of value) {
    if (!isRecord(entry) || !isString(entry.itemId) || !Number.isInteger(entry.quantity) || (entry.quantity as number) <= 0 || seen.has(entry.itemId)) return null;
    seen.add(entry.itemId);
    stacks.push({ itemId: entry.itemId, quantity: entry.quantity as number });
  }
  return stacks;
}

function readNpcs(value: unknown): GameState['npcs'] | null {
  if (!isRecord(value)) return null;
  const npcs: GameState['npcs'] = {};
  for (const [npcId, npc] of Object.entries(value)) {
    if (!isString(npcId) || !isRecord(npc)) return null;
    if (!isNpcStatus(npc.status)) return null;
    if (!isFiniteNumber(npc.relationship) || npc.relationship < -100 || npc.relationship > 100) return null;
    const stats = readNpcStats(npc.stats);
    if (stats === null) return null;
    const powers = readPowerState(npc.powers);
    if (powers === null) return null;
    npcs[npcId] = { status: npc.status, relationship: npc.relationship, stats, powers };
  }
  return npcs;
}

function readPowerState(value: unknown): PowerState | null {
  if (!isRecord(value) || !isNullableString(value.devilFruitId)) return null;
  if (!isIntegerInRange(value.devilFruitAwakening, 0, 10) || !isRecord(value.haki)) return null;
  if (!isIntegerInRange(value.haki.observation, 0, 5) || !isIntegerInRange(value.haki.armament, 0, 5) || !isIntegerInRange(value.haki.conqueror, 0, 5)) return null;
  if (value.devilFruitId === null && value.devilFruitAwakening !== 0) return null;
  return { devilFruitId: value.devilFruitId, devilFruitAwakening: value.devilFruitAwakening, haki: { observation: value.haki.observation, armament: value.haki.armament, conqueror: value.haki.conqueror } };
}

function readNpcStats(value: unknown): NpcStats | null {
  if (!isRecord(value)) return null;
  if (!isStatValue(value.health) || !isStatValue(value.morale) || !isStatValue(value.strength)) return null;
  if (!isStatValue(value.observation) || !isStatValue(value.intelligence) || !isStatValue(value.luck)) return null;
  if (!isStatValue(value.loyalty) || !isStatValue(value.calm)) return null;
  return {
    health: value.health,
    morale: value.morale,
    strength: value.strength,
    observation: value.observation,
    intelligence: value.intelligence,
    luck: value.luck,
    loyalty: value.loyalty,
    calm: value.calm,
  };
}

function readHistory(value: unknown): GameState['history'] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every(
    (entry) =>
      isRecord(entry) &&
      isString(entry.eventId) &&
      isString(entry.choiceId) &&
      isString(entry.outcomeId) &&
      isNonNegativeInteger(entry.ageMonths),
  )) return null;
  return value.map((entry) => ({
    eventId: entry.eventId as string,
    choiceId: entry.choiceId as string,
    outcomeId: entry.outcomeId as string,
    ageMonths: entry.ageMonths as number,
  }));
}

function readPlayerProfile(value: unknown): GameState['player']['profile'] | null {
  if (!isRecord(value)) return null;
  if (!(value.name === null || (typeof value.name === 'string' && value.name.trim().length > 0))) return null;
  if (!isNullableString(value.raceId) || !isNullableString(value.originSeaId) || !isNullableString(value.affiliationId)) return null;
  if (!isNullableString(value.familyStructureId) || !isNullableString(value.socialClassId)) return null;
  return {
    name: value.name === null ? null : value.name.trim(),
    raceId: value.raceId,
    originSeaId: value.originSeaId,
    affiliationId: value.affiliationId,
    familyStructureId: value.familyStructureId,
    socialClassId: value.socialClassId,
  };
}

function readScheduledEvents(value: unknown): GameState['scheduledEvents'] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every(
    (entry) =>
      isRecord(entry) &&
      isString(entry.eventId) &&
      isNonNegativeInteger(entry.dueAgeMonths) &&
      isString(entry.sourceEventId) &&
      isString(entry.sourceChoiceId),
  )) return null;
  return value.map((entry) => ({
    eventId: entry.eventId as string,
    dueAgeMonths: entry.dueAgeMonths as number,
    sourceEventId: entry.sourceEventId as string,
    sourceChoiceId: entry.sourceChoiceId as string,
  }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isNpcStatus(value: unknown): value is NpcState['status'] {
  return typeof value === 'string' && NPC_STATUSES.has(value);
}

function isCareerPhase(value: unknown): value is CareerPhase {
  return value === 'origins' || value === 'childhood' || value === 'active';
}

function isTravelState(value: unknown): value is TravelState {
  return value === 'at_sea' || value === 'on_land';
}

function isCareerEndReason(value: unknown): value is CareerEndReason | null {
  return value === null || value === 'death' || value === 'legacy';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isUniqueStringArray(value: unknown): value is string[] {
  return isStringArray(value) && new Set(value).size === value.length;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStatValue(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0 && value <= 50;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isUint32(value: unknown): value is number {
  return isNonNegativeInteger(value) && value <= 0xffffffff;
}

function isIntegerInRange(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= maximum;
}
