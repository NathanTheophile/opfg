import { describe, expect, it } from 'vitest';
import { createContentCatalog } from '../content/catalogFactory';
import { createInitialGameState } from '../model/initialState';
import { ACHIEVEMENTS, FAMILY_UNIQUE_ITEM_IDS } from './catalog';
import { createMetaProgressionState, syncAchievements } from './metaProgression';

const catalog = createContentCatalog([]);

function activeState() {
  const state = createInitialGameState(1);
  state.careerPhase = 'active';
  state.ageMonths = 180;
  state.player.profile.raceId = 'human';
  state.player.profile.originSeaId = 'east_blue';
  return state;
}

describe('achievement meta progression', () => {
  it('ships the pruned 21-achievement V1 catalogue', () => {
    expect(ACHIEVEMENTS).toHaveLength(21);
  });

  it('tracks exactly three unique achievement items per family', () => {
    expect(FAMILY_UNIQUE_ITEM_IDS.civilian).toHaveLength(3);
    expect(FAMILY_UNIQUE_ITEM_IDS.marine).toEqual([
      'family_marine_sealed_report',
      'giant_marine_training_bracer',
      'marine_courtyard_hound',
    ]);
    expect(FAMILY_UNIQUE_ITEM_IDS.pirate).toEqual([
      'family_pirate_salt_chart',
      'family_pirate_diver_bell',
      'pirate_safe_harbor_gull',
    ]);
    expect(FAMILY_UNIQUE_ITEM_IDS.revolutionary).toHaveLength(3);
  });

  it('records completed Childhood race and origin sea account-wide', () => {
    const result = syncAchievements(createMetaProgressionState(), activeState(), catalog, 123);
    expect(result.state.completedChildhoodRaceIds).toContain('human');
    expect(result.state.startedOriginSeaIds).toContain('east_blue');
    expect(result.newlyUnlocked).toEqual(expect.arrayContaining([
      'progression_first_active',
      'origins_human_childhood',
    ]));
  });

  it('unlocks the four-race meta achievement across runs', () => {
    let meta = createMetaProgressionState();

    for (const raceId of ['human', 'fishman', 'mink', 'giant']) {
      const state = activeState();
      state.player.profile.raceId = raceId;
      meta = syncAchievements(meta, state, catalog, 123).state;
    }

    expect(meta.unlocks.origins_all_playable_races).toBeDefined();
  });

  it('unlocks Les quatre Blues across runs', () => {
    let meta = createMetaProgressionState();

    for (const seaId of ['east_blue', 'west_blue', 'north_blue', 'south_blue']) {
      const state = activeState();
      state.player.profile.originSeaId = seaId;
      meta = syncAchievements(meta, state, catalog, 123).state;
    }

    expect(meta.unlocks.world_start_all_blues).toBeDefined();
  });

  it('persists family discoveries after the items leave inventory', () => {
    let meta = createMetaProgressionState();

    for (const itemId of FAMILY_UNIQUE_ITEM_IDS.civilian) {
      const state = activeState();
      state.player.inventory.stacks = [{
        itemId,
        quantity: 1,
        provenance: [{ locationId: null, quantity: 1 }],
      }];

      meta = syncAchievements(meta, state, catalog, 123).state;
    }

    meta = syncAchievements(meta, activeState(), catalog, 123).state;

    expect(meta.discoveredFamilyUniqueItemIds).toEqual(
      expect.arrayContaining([...FAMILY_UNIQUE_ITEM_IDS.civilian]),
    );
    expect(meta.unlocks.family_civilian_collection).toBeDefined();
  });

  it.each([
    ['observation', 'power_haki_observation'],
    ['armament', 'power_haki_armament'],
  ] as const)(
    'unlocks the dedicated %s Haki achievement',
    (hakiType, achievementId) => {
      const state = activeState();
      state.player.powers.haki[hakiType] = 1;

      const meta = syncAchievements(
        createMetaProgressionState(),
        state,
        catalog,
        123,
      ).state;

      expect(meta.unlocks[achievementId]).toBeDefined();
    },
  );

  it('keeps only the Fleet Admiral achievement', () => {
    const state = activeState();
    state.player.career.affiliationId = 'marine';
    state.player.career.rankId = 'marine_fleet_admiral';

    const meta = syncAchievements(createMetaProgressionState(), state, catalog, 123).state;
    expect(meta.unlocks.grade_marine_fleet_admiral).toBeDefined();
  });

  it('unlocks Une destinée when the career ends', () => {
    const state = activeState();
    state.careerStatus = 'ended';

    const meta = syncAchievements(createMetaProgressionState(), state, catalog, 123).state;
    expect(meta.unlocks.ending_first).toBeDefined();
  });
});
