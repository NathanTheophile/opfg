import { describe, expect, it } from 'vitest';
import { loadNodeContentCatalog } from '../content/nodeContentCatalog';
import { createInitialGameState } from '../model/initialState';
import { consumePhaseSlot } from './time';

const catalog = loadNodeContentCatalog();

function h(eventId: string, choiceId: string, outcomeId: string, ageMonths: number) {
  return { eventId, choiceId, outcomeId, ageMonths };
}

describe('Family Pirate integration', () => {
  it('registers the five Pirate inheritance items', () => {
    const ids = new Set(catalog.items.map(({ id }) => id));
    for (const id of [
      'family_pirate_black_flag_patch',
      'family_pirate_safe_harbor_key',
      'family_pirate_debt_ledger',
      'family_pirate_salt_chart',
      'family_pirate_diver_bell',
    ]) expect(ids.has(id)).toBe(true);
  });

  it('applies Pirate only at the Childhood -> Active boundary', () => {
    const s = createInitialGameState(1);
    s.careerPhase = 'childhood';
    s.ageMonths = 174;
    s.player.profile.affiliationId = 'pirate';
    s.player.career.affiliationId = 'civilian';
    s.player.career.rankId = null;
    s.history = [
      h('family_pirate_13_flag_means_mine_i01_take_pirate', 'resolve', 'active_pirate_take_pirate', 168),
    ];

    const next = consumePhaseSlot(s, 'childhood', catalog);
    expect(next.ageMonths).toBe(180);
    expect(next.careerPhase).toBe('active');
    expect(next.player.profile.affiliationId).toBe('pirate');
    expect(next.player.career.affiliationId).toBe('pirate');
    expect(next.player.career.rankId).toBeNull();
  });

  it('keeps a rejected/deferred inheritance Civilian at the boundary', () => {
    const s = createInitialGameState(1);
    s.careerPhase = 'childhood';
    s.ageMonths = 174;
    s.player.profile.affiliationId = 'pirate';
    s.player.career.affiliationId = 'civilian';
    s.player.career.rankId = null;
    s.history = [
      h('family_pirate_13_flag_means_mine_i01_defer', 'resolve', 'active_civilian_defer', 168),
    ];

    const next = consumePhaseSlot(s, 'childhood', catalog);
    expect(next.careerPhase).toBe('active');
    expect(next.player.profile.affiliationId).toBe('pirate');
    expect(next.player.career.affiliationId).toBe('civilian');
    expect(next.player.career.rankId).toBeNull();
  });
});
