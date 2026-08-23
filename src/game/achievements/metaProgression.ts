import type { ContentCatalog } from '../content/schema';
import type { GameState, ItemId } from '../model/schema';
import { ACHIEVEMENTS, FAMILY_UNIQUE_ITEM_IDS, ORIGIN_ACHIEVEMENT_SEAS, PLAYABLE_ACHIEVEMENT_RACES } from './catalog';
import type { AchievementDefinition, AchievementId, FamilyCollectionId, MetaProgressionState } from './model';

export const META_PROGRESSION_VERSION = 1 as const;

export function createMetaProgressionState(): MetaProgressionState {
  return {
    version: META_PROGRESSION_VERSION,
    unlocks: {},
    completedChildhoodRaceIds: [],
    discoveredFamilyUniqueItemIds: [],
    consumedDevilFruitTypes: [],
    startedOriginSeaIds: [],
  };
}

export interface AchievementSyncResult {
  state: MetaProgressionState;
  newlyUnlocked: AchievementId[];
}

export function syncAchievements(
  meta: MetaProgressionState,
  gameState: GameState,
  catalog: ContentCatalog,
  unlockedAt: number,
): AchievementSyncResult {
  const state = collectMetaProgression(meta, gameState, catalog);
  const newlyUnlocked = ACHIEVEMENTS
    .filter(({ id }) => state.unlocks[id] === undefined)
    .filter((achievement) => evaluateAchievement(achievement, state, gameState, catalog))
    .map(({ id }) => id);

  if (newlyUnlocked.length === 0) return { state, newlyUnlocked };

  const unlocks = { ...state.unlocks };
  for (const id of newlyUnlocked) unlocks[id] = { unlockedAt };
  return { state: { ...state, unlocks }, newlyUnlocked };
}

export function evaluateAchievement(
  achievement: AchievementDefinition,
  meta: MetaProgressionState,
  gameState: GameState,
  catalog: ContentCatalog,
): boolean {
  const condition = achievement.condition;
  switch (condition.type) {
    case 'careerPhaseReached':
      return gameState.careerPhase === condition.phase;
    case 'completedChildhoodRace':
      return meta.completedChildhoodRaceIds.includes(condition.raceId);
    case 'completedAllChildhoodRaces':
      return condition.raceIds.every((id) => meta.completedChildhoodRaceIds.includes(id));
    case 'familyCollectionComplete':
      return isFamilyCollectionComplete(condition.collectionId, meta);
    case 'allFamilyCollectionsComplete':
      return condition.collectionIds.every((id) => isFamilyCollectionComplete(id, meta));
    case 'careerRankReached':
      return hasReachedCareerRank(gameState, catalog, condition.rankId);
    case 'bountyAtLeast':
      return gameState.player.career.bounty >= condition.value;
    case 'consumedAnyDevilFruit':
      return meta.consumedDevilFruitTypes.length > 0;
    case 'hakiAwakened':
      return gameState.player.powers.haki[condition.hakiType] > 0;
    case 'startedAllOriginSeas':
      return condition.seaIds.every((id) => meta.startedOriginSeaIds.includes(id));
    case 'currentSeaReached':
      return catalog.locations.find(({ id }) => id === gameState.locationId)?.seaId === condition.seaId;
    case 'crewSizeAtLeast':
      return Object.values(gameState.npcs).filter(({ status }) => status === 'crew').length >= condition.value;
    case 'careerEnded':
      return gameState.careerStatus === 'ended';
  }
}

function collectMetaProgression(
  meta: MetaProgressionState,
  gameState: GameState,
  catalog: ContentCatalog,
): MetaProgressionState {
  const completedChildhoodRaceIds = new Set(meta.completedChildhoodRaceIds);
  const discoveredFamilyUniqueItemIds = new Set(meta.discoveredFamilyUniqueItemIds);
  const consumedDevilFruitTypes = new Set(meta.consumedDevilFruitTypes);
  const startedOriginSeaIds = new Set(meta.startedOriginSeaIds);

  const raceId = gameState.player.profile.raceId;
  if (gameState.careerPhase === 'active' && raceId !== null && (PLAYABLE_ACHIEVEMENT_RACES as readonly string[]).includes(raceId)) {
    completedChildhoodRaceIds.add(raceId);
  }

  const originSeaId = gameState.player.profile.originSeaId;
  if (gameState.careerPhase !== 'origins' && originSeaId !== null && (ORIGIN_ACHIEVEMENT_SEAS as readonly string[]).includes(originSeaId)) {
    startedOriginSeaIds.add(originSeaId);
  }

  for (const itemId of getOwnedItemIds(gameState)) {
    if (isFamilyUniqueItem(itemId)) discoveredFamilyUniqueItemIds.add(itemId);
  }

  const devilFruitId = gameState.player.powers.devilFruitId;
  if (devilFruitId !== null) {
    const type = catalog.devilFruits.find(({ id }) => id === devilFruitId)?.type;
    if (type !== undefined) consumedDevilFruitTypes.add(type);
  }

  return {
    ...meta,
    completedChildhoodRaceIds: [...completedChildhoodRaceIds],
    discoveredFamilyUniqueItemIds: [...discoveredFamilyUniqueItemIds],
    consumedDevilFruitTypes: [...consumedDevilFruitTypes],
    startedOriginSeaIds: [...startedOriginSeaIds],
  };
}

function isFamilyCollectionComplete(collectionId: FamilyCollectionId, meta: MetaProgressionState): boolean {
  return FAMILY_UNIQUE_ITEM_IDS[collectionId].every((id) => meta.discoveredFamilyUniqueItemIds.includes(id));
}

function isFamilyUniqueItem(itemId: ItemId): boolean {
  return Object.values(FAMILY_UNIQUE_ITEM_IDS).some((ids) => ids.includes(itemId));
}

function getOwnedItemIds(state: GameState): ItemId[] {
  const ids = [
    ...state.player.inventory.stacks.map(({ itemId }) => itemId),
    ...state.player.equipment.flatMap((stack) => stack === null ? [] : [stack.itemId]),
    ...(state.player.logPose === null ? [] : [state.player.logPose.itemId]),
    ...(state.player.companion === null ? [] : [state.player.companion.itemId]),
    ...(state.ship?.cargo.map(({ itemId }) => itemId) ?? []),
    ...(state.pendingShip?.cargo.map(({ itemId }) => itemId) ?? []),
    ...(state.pendingOverflow === null ? [] : [state.pendingOverflow.itemId]),
  ];
  return [...new Set(ids)];
}

function hasReachedCareerRank(gameState: GameState, catalog: ContentCatalog, requiredRankId: string): boolean {
  const currentRankId = gameState.player.career.rankId;
  if (currentRankId === null) return false;
  const current = catalog.careerRanks.find(({ id }) => id === currentRankId);
  const required = catalog.careerRanks.find(({ id }) => id === requiredRankId);
  return current !== undefined
    && required !== undefined
    && current.affiliationId === required.affiliationId
    && current.sortOrder >= required.sortOrder;
}
