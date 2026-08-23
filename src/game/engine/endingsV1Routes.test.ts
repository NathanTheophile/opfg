import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../content/definitions';
import { createInitialGameState } from '../model/initialState';
import { findCareerHorizonEndingRoot, findCriticalEvent, selectNextEvent } from './events';

const fallbacks = {
  pirate: 'active_ending_pirate_beyond_chart',
  marine: 'active_ending_marine_institutional_standard',
  revolutionary: 'active_ending_revolutionary_records_secured',
  civilian: 'active_ending_civilian_work_outlives_you',
} as const;

describe('Ending V1 final routes', () => {
  it.each(Object.entries(fallbacks))('has authored broad fallback for %s', (career, expectedId) => {
    const state = createInitialGameState(123);
    state.careerPhase = 'active';
    state.ageMonths = 420;
    state.player.career.affiliationId = career as keyof typeof fallbacks;
    state.player.career.reputation = 0;
    state.player.career.bounty = 0;
    state.player.career.rankId = null;
    state.player.career.titleId = null;
    state.berries = 0;
    state.history = [];
    expect(findCareerHorizonEndingRoot(state, contentCatalog)?.id).toBe(expectedId);
  });

  it('does not select an authored Ending route before 420 months', () => {
    const state = createInitialGameState(123);
    state.careerPhase = 'active';
    state.ageMonths = 419;
    state.player.career.affiliationId = 'pirate';
    expect(findCareerHorizonEndingRoot(state, contentCatalog)).toBeUndefined();
  });

  it('lets a queued finale Immediate beat the generic age horizon', () => {
    const state = createInitialGameState(123);
    state.careerPhase = 'active';
    state.ageMonths = 420;
    state.player.career.affiliationId = 'pirate';
    state.immediateEventQueue = ['active_ending_pirate_beyond_chart_i01'];
    expect(selectNextEvent(state, contentCatalog).currentEventId).toBe('active_ending_pirate_beyond_chart_i01');
  });

  it('keeps hard death Critical above a queued finale Immediate', () => {
    const state = createInitialGameState(123);
    state.careerPhase = 'active';
    state.ageMonths = 420;
    state.player.career.affiliationId = 'pirate';
    state.player.stats.health = 0;
    state.immediateEventQueue = ['active_ending_pirate_beyond_chart_i01'];
    const death = findCriticalEvent(state, contentCatalog.events);
    expect(death).toBeDefined();
    expect(selectNextEvent(state, contentCatalog).currentEventId).toBe(death?.id);
  });

  it('leaves disabled Bounty Hunter to the generic horizon fallback', () => {
    const state = createInitialGameState(123);
    state.careerPhase = 'active';
    state.ageMonths = 420;
    state.player.career.affiliationId = 'bounty_hunter';
    expect(findCareerHorizonEndingRoot(state, contentCatalog)).toBeUndefined();
    expect(selectNextEvent(state, contentCatalog).currentEventId).toBe('critical_career_horizon');
  });

  it('registers all 16 semantic Ending definitions', () => {
    const ids = new Set(contentCatalog.endings.map(({ id }) => id));
    const expected = [
      'ending_pirate_world_scale_flag',
      'ending_pirate_free_harbor_power',
      'ending_pirate_last_impossible_score',
      'ending_pirate_beyond_chart',
      'ending_marine_top_command',
      'ending_marine_people_over_rank',
      'ending_marine_last_order',
      'ending_marine_institutional_standard',
      'ending_revolutionary_network_preserved',
      'ending_revolutionary_cells_unbroken',
      'ending_revolutionary_truce_won',
      'ending_revolutionary_records_secured',
      'ending_civilian_trading_house',
      'ending_civilian_chartered_explorer',
      'ending_civilian_maritime_magnate',
      'ending_civilian_work_outlives_you',
    ];
    for (const id of expected) expect(ids.has(id), id).toBe(true);
  });
});
