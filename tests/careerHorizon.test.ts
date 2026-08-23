import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { V1_CAREER_HORIZON_MONTHS } from '../src/game/content/schema';
import { findCriticalEvent } from '../src/game/engine/events';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';

describe('V1 career horizon', () => {
  it('triggers at 420 Active months, but not before or during Childhood', () => {
    const state = createInitialGameState(1);
    state.careerPhase = 'active';
    state.ageMonths = V1_CAREER_HORIZON_MONTHS - 1;
    expect(findCriticalEvent(state, contentCatalog.events)?.id).not.toBe('critical_career_horizon');
    state.ageMonths += 1;
    expect(findCriticalEvent(state, contentCatalog.events)?.id).toBe('critical_career_horizon');
    state.careerPhase = 'childhood';
    expect(findCriticalEvent(state, contentCatalog.events)?.id).not.toBe('critical_career_horizon');
  });

  it('keeps death urgent and resolves the horizon to the legacy Ending', () => {
    const state = createInitialGameState(1);
    state.careerPhase = 'active';
    state.ageMonths = V1_CAREER_HORIZON_MONTHS;
    state.player.stats.health = 0;
    expect(findCriticalEvent(state, contentCatalog.events)?.id).toBe('critical_player_death');
    state.player.stats.health = 1;
    state.currentEventId = 'critical_career_horizon';
    const resolved = resolveChoice(state, contentCatalog, 'critical_career_horizon', 'accept_legacy').state;
    expect(resolved).toMatchObject({ careerStatus: 'ended', careerEndReason: 'legacy', endingId: 'v1_career_horizon' });
  });
});
