import type { ItemId, RaceId, SeaId } from '../model/schema';
import type { DevilFruitType } from '../content/schema';
import type { AchievementDefinition, FamilyCollectionId } from './model';

export const PLAYABLE_ACHIEVEMENT_RACES = ['human', 'fishman', 'mink', 'giant'] as const satisfies readonly RaceId[];
export const ORIGIN_ACHIEVEMENT_SEAS = ['east_blue', 'west_blue', 'north_blue', 'south_blue'] as const satisfies readonly SeaId[];
export const DEVIL_FRUIT_ACHIEVEMENT_TYPES = ['paramecia', 'zoan', 'logia'] as const satisfies readonly DevilFruitType[];
export const FAMILY_COLLECTION_IDS = ['civilian', 'marine', 'pirate', 'revolutionary'] as const satisfies readonly FamilyCollectionId[];

export const FAMILY_UNIQUE_ITEM_IDS: Record<FamilyCollectionId, readonly ItemId[]> = {
  civilian: [
    'civilian_workshop_toolkit',
    'civilian_trust_ledger',
    'civilian_workshop_cat',
  ],
  marine: [
    'family_marine_insignia',
    'family_marine_service_journal',
    'family_marine_field_compass',
    'family_marine_sealed_report',
    'giant_marine_training_bracer',
    'marine_courtyard_hound',
  ],
  pirate: [
    'family_pirate_black_flag_patch',
    'family_pirate_safe_harbor_key',
    'family_pirate_debt_ledger',
    'family_pirate_salt_chart',
    'family_pirate_diver_bell',
    'pirate_safe_harbor_gull',
  ],
  revolutionary: [
    'revolutionary_handoff_notebook',
    'revolutionary_boundary_keys',
    'revolutionary_courier_ferret',
  ],
};

const def = (
  id: AchievementDefinition['id'],
  family: AchievementDefinition['family'],
  condition: AchievementDefinition['condition'],
): AchievementDefinition => ({
  id,
  family,
  nameKey: `achievement.${id}.name`,
  descriptionKey: `achievement.${id}.description`,
  condition,
});

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  def('progression_first_active', 'progression', { type: 'careerPhaseReached', phase: 'active' }),

  def('origins_human_childhood', 'origins', { type: 'completedChildhoodRace', raceId: 'human' }),
  def('origins_fishman_childhood', 'origins', { type: 'completedChildhoodRace', raceId: 'fishman' }),
  def('origins_mink_childhood', 'origins', { type: 'completedChildhoodRace', raceId: 'mink' }),
  def('origins_giant_childhood', 'origins', { type: 'completedChildhoodRace', raceId: 'giant' }),
  def('origins_all_playable_races', 'origins', { type: 'completedAllChildhoodRaces', raceIds: [...PLAYABLE_ACHIEVEMENT_RACES] }),

  def('family_civilian_collection', 'family', { type: 'familyCollectionComplete', collectionId: 'civilian' }),
  def('family_marine_collection', 'family', { type: 'familyCollectionComplete', collectionId: 'marine' }),
  def('family_pirate_collection', 'family', { type: 'familyCollectionComplete', collectionId: 'pirate' }),
  def('family_revolutionary_collection', 'family', { type: 'familyCollectionComplete', collectionId: 'revolutionary' }),
  def('family_all_collections', 'family', { type: 'allFamilyCollectionsComplete', collectionIds: [...FAMILY_COLLECTION_IDS] }),

  def('grade_marine_admiral', 'grades', { type: 'careerRankReached', rankId: 'marine_admiral' }),
  def('grade_marine_fleet_admiral', 'grades', { type: 'careerRankReached', rankId: 'marine_fleet_admiral' }),

  def('bounty_first', 'bounty', { type: 'bountyAtLeast', value: 1 }),
  def('bounty_10m', 'bounty', { type: 'bountyAtLeast', value: 10_000_000 }),
  def('bounty_100m', 'bounty', { type: 'bountyAtLeast', value: 100_000_000 }),
  def('bounty_1b', 'bounty', { type: 'bountyAtLeast', value: 1_000_000_000 }),

  def('power_first_devil_fruit', 'powers', { type: 'consumedAnyDevilFruit' }),
  def('power_all_devil_fruit_types', 'powers', { type: 'consumedAllDevilFruitTypes', fruitTypes: [...DEVIL_FRUIT_ACHIEVEMENT_TYPES] }),
  def('power_first_haki', 'powers', { type: 'hakiAwakened' }),
  def('power_devil_fruit_awakened', 'powers', { type: 'devilFruitAwakened' }),

  def('world_start_east_blue', 'world', { type: 'startedOriginSea', seaId: 'east_blue' }),
  def('world_start_west_blue', 'world', { type: 'startedOriginSea', seaId: 'west_blue' }),
  def('world_start_north_blue', 'world', { type: 'startedOriginSea', seaId: 'north_blue' }),
  def('world_start_south_blue', 'world', { type: 'startedOriginSea', seaId: 'south_blue' }),
  def('world_start_all_blues', 'world', { type: 'startedAllOriginSeas', seaIds: [...ORIGIN_ACHIEVEMENT_SEAS] }),
  def('world_reach_paradise', 'world', { type: 'currentSeaReached', seaId: 'grand_line_paradise' }),
  def('world_reach_new_world', 'world', { type: 'currentSeaReached', seaId: 'new_world' }),

  def('crew_first_member', 'crew', { type: 'crewSizeAtLeast', value: 1 }),
  def('ending_first', 'endings', { type: 'careerEnded' }),
];
