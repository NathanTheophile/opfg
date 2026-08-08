import type { CareerEndReason, CareerPhase, GameState, NpcState, NpcStats, TravelState } from '../model/schema';

export const SAVE_KEY = 'jam-op-fan-game.save';
const CURRENT_SAVE_VERSION = 6;
const NPC_STATUSES = new Set(['known', 'crew', 'departed', 'unavailable']);

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

  return readGameState(value);
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
  if (!isUint32(value.rngState) || !isNonNegativeInteger(value.ageMonths) || !isNonNegativeInteger(value.month)) return null;
  if (!isCareerPhase(value.careerPhase) || !isTravelState(value.travelState) || !isString(value.locationId)) return null;
  if (!isRecord(value.player) || !isRecord(value.player.stats) || !isStringArray(value.player.traits)) return null;
  const profile = readPlayerProfile(value.player.profile);
  if (profile === null) return null;
  if (!isStatValue(value.player.stats.health)) return null;
  if (!isStatValue(value.player.stats.morale)) return null;
  if (!isStatValue(value.player.stats.strength)) return null;
  if (!isStatValue(value.player.stats.observation)) return null;
  if (!isStatValue(value.player.stats.intelligence)) return null;
  if (!isStatValue(value.player.stats.navigation)) return null;
  if (!isStatValue(value.player.stats.charisma)) return null;
  if (!isStatValue(value.player.stats.luck)) return null;
  if (!(value.player.stats.awakening === null || isStatValue(value.player.stats.awakening))) return null;
  if (!isRecord(value.ship) || !isIntegerInRange(value.ship.condition, 0, 3)) return null;
  if (!isStringArray(value.flags) || !isStringArray(value.items)) return null;

  const npcs = readNpcs(value.npcs);
  const history = readHistory(value.history);
  const scheduledEvents = readScheduledEvents(value.scheduledEvents);
  if (npcs === null || history === null || scheduledEvents === null) return null;
  if (!(value.currentEventId === null || isString(value.currentEventId))) return null;
  if (!(value.careerStatus === 'active' || value.careerStatus === 'ended')) return null;
  if (!isCareerEndReason(value.careerEndReason)) return null;
  if (value.careerStatus === 'active' && value.careerEndReason !== null) return null;
  if (value.careerStatus === 'ended' && value.careerEndReason === null) return null;

  return {
    version: CURRENT_SAVE_VERSION,
    rngState: value.rngState,
    careerPhase: value.careerPhase,
    ageMonths: value.ageMonths,
    month: value.month,
    travelState: value.travelState,
    locationId: value.locationId,
    player: {
      profile,
      stats: {
        health: value.player.stats.health,
        morale: value.player.stats.morale,
        strength: value.player.stats.strength,
        observation: value.player.stats.observation,
        intelligence: value.player.stats.intelligence,
        navigation: value.player.stats.navigation,
        charisma: value.player.stats.charisma,
        luck: value.player.stats.luck,
        awakening: value.player.stats.awakening,
      },
      traits: [...value.player.traits],
    },
    ship: { condition: value.ship.condition },
    flags: [...value.flags],
    items: [...value.items],
    npcs,
    history,
    scheduledEvents,
    currentEventId: value.currentEventId,
    careerStatus: value.careerStatus,
    careerEndReason: value.careerEndReason,
  };
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
    npcs[npcId] = { status: npc.status, relationship: npc.relationship, stats };
  }
  return npcs;
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
      isNonNegativeInteger(entry.month) &&
      isNonNegativeInteger(entry.ageMonths),
  )) return null;
  return value.map((entry) => ({
    eventId: entry.eventId as string,
    choiceId: entry.choiceId as string,
    outcomeId: entry.outcomeId as string,
    month: entry.month as number,
    ageMonths: entry.ageMonths as number,
  }));
}

function readPlayerProfile(value: unknown): GameState['player']['profile'] | null {
  if (!isRecord(value)) return null;
  if (!(value.name === null || (typeof value.name === 'string' && value.name.trim().length > 0))) return null;
  if (!isNullableString(value.raceId) || !isNullableString(value.originSeaId) || !isNullableString(value.affiliationId)) return null;
  return {
    name: value.name === null ? null : value.name.trim(),
    raceId: value.raceId,
    originSeaId: value.originSeaId,
    affiliationId: value.affiliationId,
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
