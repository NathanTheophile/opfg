import { describe, expect, it } from 'vitest';
import { createContentCatalog } from '../content/catalogFactory';
import { createInitialGameState } from '../model/initialState';
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
  it('records completed Childhood race and origin sea account-wide', () => {
    const result = syncAchievements(createMetaProgressionState(), activeState(), catalog, 123);
    expect(result.state.completedChildhoodRaceIds).toContain('human');
    expect(result.state.startedOriginSeaIds).toContain('east_blue');
    expect(result.newlyUnlocked).toEqual(expect.arrayContaining([
      'progression_first_active',
      'origins_human_childhood',
      'world_start_east_blue',
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

  it('tracks Devil Fruit types across runs', () => {
    let meta = createMetaProgressionState();
    for (const type of ['paramecia', 'zoan', 'logia'] as const) {
      const fruit = catalog.devilFruits.find((entry) => entry.type === type && entry.playableV1);
      expect(fruit).toBeDefined();
      const state = activeState();
      state.player.powers.devilFruitId = fruit!.id;
      meta = syncAchievements(meta, state, catalog, 123).state;
    }
    expect(meta.unlocks.power_all_devil_fruit_types).toBeDefined();
  });

  it('tracks family unique items once even after they leave inventory', () => {
    let meta = createMetaProgressionState();
    for (const itemId of ['civilian_workshop_toolkit', 'civilian_trust_ledger', 'civilian_workshop_cat']) {
      const state = activeState();
      state.player.inventory.stacks = [{ itemId, quantity: 1, provenance: [{ locationId: null, quantity: 1 }] }];
      meta = syncAchievements(meta, state, catalog, 123).state;
    }
    expect(meta.unlocks.family_civilian_collection).toBeDefined();
  });

  it('uses current rank ladder order for Admiral achievements', () => {
    const state = activeState();
    state.player.career.affiliationId = 'marine';
    state.player.career.rankId = 'marine_fleet_admiral';
    const meta = syncAchievements(createMetaProgressionState(), state, catalog, 123).state;
    expect(meta.unlocks.grade_marine_admiral).toBeDefined();
    expect(meta.unlocks.grade_marine_fleet_admiral).toBeDefined();
  });
});
