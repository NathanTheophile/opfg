import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { evaluateCondition } from '../src/game/engine/conditions';
import { createInitialGameState } from '../src/game/model/initialState';

describe('Childhood opening variety', () => {
  it('has several geography-neutral Normal roots eligible at age one', () => {
    const state = createInitialGameState(0x12345678);
    state.careerPhase = 'childhood';
    state.ageMonths = 12;

    const openingIds = new Set([
      'ch_family_social_01_shared_bowl',
      'ch_generic_early_01_den_den_ring',
      'ch_generic_early_01_crab_in_basket',
      'ch_generic_early_01_red_mask',
    ]);

    const eligible = contentCatalog.events.filter((event) =>
      event.kind === 'normal'
      && openingIds.has(event.id)
      && (event.eligibility === undefined || evaluateCondition(event.eligibility, state, contentCatalog)),
    );

    expect(eligible.map(({ id }) => id).sort()).toEqual([...openingIds].sort());
  });
});
