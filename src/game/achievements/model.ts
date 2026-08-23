import type { DevilFruitType } from '../content/schema';
import type { HakiType, ItemId, RaceId, SeaId } from '../model/schema';
import type { LocalizationKey } from '../localization/keys';

export const ACHIEVEMENT_IDS = [
  'progression_first_active',
  'origins_human_childhood',
  'origins_fishman_childhood',
  'origins_mink_childhood',
  'origins_giant_childhood',
  'origins_all_playable_races',
  'family_civilian_collection',
  'family_marine_collection',
  'family_pirate_collection',
  'family_revolutionary_collection',
  'family_all_collections',
  'grade_marine_fleet_admiral',
  'bounty_100m',
  'power_first_devil_fruit',
  'power_haki_observation',
  'power_haki_armament',
  'world_start_all_blues',
  'world_reach_paradise',
  'world_reach_new_world',
  'crew_first_member',
  'ending_first',
] as const;

export type AchievementId = typeof ACHIEVEMENT_IDS[number];
export type AchievementFamily = 'progression' | 'origins' | 'family' | 'grades' | 'bounty' | 'powers' | 'world' | 'crew' | 'endings';
export type FamilyCollectionId = 'civilian' | 'marine' | 'pirate' | 'revolutionary';

export type AchievementCondition =
  | { type: 'careerPhaseReached'; phase: 'active' }
  | { type: 'completedChildhoodRace'; raceId: RaceId }
  | { type: 'completedAllChildhoodRaces'; raceIds: RaceId[] }
  | { type: 'familyCollectionComplete'; collectionId: FamilyCollectionId }
  | { type: 'allFamilyCollectionsComplete'; collectionIds: FamilyCollectionId[] }
  | { type: 'careerRankReached'; rankId: string }
  | { type: 'bountyAtLeast'; value: number }
  | { type: 'consumedAnyDevilFruit' }
  | { type: 'hakiAwakened'; hakiType: Extract<HakiType, 'observation' | 'armament'> }
  | { type: 'startedAllOriginSeas'; seaIds: SeaId[] }
  | { type: 'currentSeaReached'; seaId: SeaId }
  | { type: 'crewSizeAtLeast'; value: number }
  | { type: 'careerEnded' };

export interface AchievementDefinition {
  id: AchievementId;
  family: AchievementFamily;
  nameKey: LocalizationKey;
  descriptionKey: LocalizationKey;
  condition: AchievementCondition;
}

export interface AchievementUnlock {
  unlockedAt: number;
}

export interface MetaProgressionState {
  version: 1;
  unlocks: Partial<Record<AchievementId, AchievementUnlock>>;
  completedChildhoodRaceIds: RaceId[];
  discoveredFamilyUniqueItemIds: ItemId[];
  consumedDevilFruitTypes: DevilFruitType[];
  startedOriginSeaIds: SeaId[];
}
