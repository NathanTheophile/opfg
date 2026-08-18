import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { recoverTravel } from '../src/game/engine/locations';
import { createDepartureSystemEvent } from '../src/game/engine/navigation';
import { createInitialGameState } from '../src/game/model/initialState';
import type { GameState } from '../src/game/model/schema';

function activeState(seed = 123): GameState {
  const state = createInitialGameState(seed);
  state.careerPhase = 'active';
  state.ageMonths = 187;
  state.travelState = 'on_land';
  state.navigationDecisionAgeMonths = 180;
  state.shipMarketArrivalPending = false;
  state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
  return state;
}

describe('Active world traversal continuity', () => {
  it('does not let ordinary Blue departure enter the Grand Line', () => {
    const state = activeState(17);
    state.locationId = 'loguetown';

    const departure = createDepartureSystemEvent(state, contentCatalog, true)!;
    expect(departure.choices.map(({ id }) => id)).not.toContain('navigation:grand_line');
  });

  it('does not expose the Grand Line ingress choice outside the four Blues either', () => {
    const state = activeState();
    state.locationId = 'raijin_island';

    const departure = createDepartureSystemEvent(state, contentCatalog, true)!;
    expect(departure.choices.map(({ id }) => id)).not.toContain('navigation:grand_line');
  });

  it('keeps Paradise emergency fallback moving forward from nested route nodes', () => {
    const whiskyPeak = activeState(31);
    whiskyPeak.locationId = 'whisky_peak';
    recoverTravel(whiskyPeak, contentCatalog, 'sea');
    expect(whiskyPeak.locationId).toBe('giant_island_little_garden');
    expect(whiskyPeak.travelState).toBe('on_land');

    const sakura = activeState(31);
    sakura.locationId = 'sakura_kingdom';
    recoverTravel(sakura, contentCatalog, 'sea');
    expect(sakura.locationId).toBe('alabasta_kingdom');
    expect(sakura.travelState).toBe('on_land');
  });
});
