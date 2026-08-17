import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { getOrdinaryNewWorldDestinationIds } from '../src/game/engine/locations';
import { resolveOrdinaryBlueArrivalAfterMonthlyRoot } from '../src/game/engine/maritime';
import { createInitialGameState } from '../src/game/model/initialState';
import type { GameState } from '../src/game/model/schema';

function newWorldCrossingState(seed = 123): GameState {
  const state = createInitialGameState(seed);
  state.careerPhase = 'active';
  state.ageMonths = 183;
  state.locationId = 'raijin_island';
  state.travelState = 'at_sea';
  state.navigationDecisionAgeMonths = 180;
  state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
  return state;
}

describe('Active New World ordinary navigation', () => {
  it('uses only ordinary route nodes and major hubs as generic New World landfalls', () => {
    const destinations = getOrdinaryNewWorldDestinationIds('raijin_island', contentCatalog);

    expect(destinations).not.toContain('raijin_island');
    expect(destinations).toContain('dressrosa');
    expect(destinations).toContain('sphinx');
    expect(destinations).toContain('yukiryu_island');
    expect(destinations).toContain('ironcurrent_island');
    expect(destinations).toContain('stormgrave_island');

    expect(destinations).not.toContain('new_marineford');
    expect(destinations).not.toContain('punk_hazard_island');
    expect(destinations).not.toContain('zou');
    expect(destinations).not.toContain('wano_country');
    expect(destinations).not.toContain('pirate_island_hachinosu');
    expect(destinations).not.toContain('lode_star_island');
  });

  it('lands in the New World through the existing monthly maritime resolver', () => {
    const state = newWorldCrossingState(17);
    const destinations = getOrdinaryNewWorldDestinationIds(state.locationId, contentCatalog);

    expect(resolveOrdinaryBlueArrivalAfterMonthlyRoot(state, contentCatalog)).toBe(true);
    expect(state.travelState).toBe('on_land');
    expect(destinations).toContain(state.locationId);
    expect(contentCatalog.locations.find(({ id }) => id === state.locationId)?.seaId).toBe('new_world');
  });

  it('is deterministic for the same seed and guarantees a landfall by the third monthly root', () => {
    const first = newWorldCrossingState(91);
    const second = newWorldCrossingState(91);

    expect(resolveOrdinaryBlueArrivalAfterMonthlyRoot(first, contentCatalog)).toBe(true);
    expect(resolveOrdinaryBlueArrivalAfterMonthlyRoot(second, contentCatalog)).toBe(true);
    expect(first.locationId).toBe(second.locationId);
    expect(first.rngState).toBe(second.rngState);
  });
});
