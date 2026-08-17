import type { StorageLike } from '../engine/save';
import { ACHIEVEMENT_IDS } from './model';
import type { AchievementId, MetaProgressionState } from './model';
import { createMetaProgressionState, META_PROGRESSION_VERSION } from './metaProgression';

export const META_PROGRESSION_KEY = 'jam-op-fan-game.meta-progression';

export function loadMetaProgression(storage: StorageLike): MetaProgressionState {
  try {
    const raw = storage.getItem(META_PROGRESSION_KEY);
    return raw === null ? createMetaProgressionState() : deserializeMetaProgression(raw);
  } catch {
    return createMetaProgressionState();
  }
}

export function saveMetaProgression(storage: StorageLike, state: MetaProgressionState): boolean {
  try {
    storage.setItem(META_PROGRESSION_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function deserializeMetaProgression(raw: string): MetaProgressionState {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== META_PROGRESSION_VERSION) return createMetaProgressionState();

    const unlockedIds = isRecord(value.unlocks)
      ? Object.entries(value.unlocks)
          .filter(([id, unlock]) => isAchievementId(id) && isRecord(unlock) && typeof unlock.unlockedAt === 'number' && Number.isFinite(unlock.unlockedAt))
          .map(([id, unlock]) => [id as AchievementId, { unlockedAt: (unlock as { unlockedAt: number }).unlockedAt }] as const)
      : [];

    return {
      version: META_PROGRESSION_VERSION,
      unlocks: Object.fromEntries(unlockedIds),
      completedChildhoodRaceIds: readStringArray(value.completedChildhoodRaceIds),
      discoveredFamilyUniqueItemIds: readStringArray(value.discoveredFamilyUniqueItemIds),
      consumedDevilFruitTypes: readStringArray(value.consumedDevilFruitTypes).filter((type): type is 'paramecia' | 'zoan' | 'logia' => ['paramecia', 'zoan', 'logia'].includes(type)),
      startedOriginSeaIds: readStringArray(value.startedOriginSeaIds),
    };
  } catch {
    return createMetaProgressionState();
  }
}

function isAchievementId(value: string): value is AchievementId {
  return (ACHIEVEMENT_IDS as readonly string[]).includes(value);
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((entry): entry is string => typeof entry === 'string'))] : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
