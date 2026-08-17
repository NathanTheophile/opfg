import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { selectNextEvent } from '../src/game/engine/events';
import { getOrdinaryNewWorldDestinationIds } from '../src/game/engine/locations';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';
import type { GameState } from '../src/game/model/schema';

function activeState(seed = 123): GameState {
  const state = createInitialGameState(seed);
  state.careerPhase = 'active';
  state.ageMonths = 183;
  state.travelState = 'at_sea';
  state.navigationDecisionAgeMonths = 180;
  state.shipMarketArrivalPending = false;
  state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
  return state;
}

function resolveCritical(state: GameState, eventId: 'critical_ship_destroyed' | 'critical_ship_missing_at_sea'): GameState {
  state = selectNextEvent(state, contentCatalog);
  expect(state.currentEventId).toBe(eventId);
  return resolveChoice(state, contentCatalog, eventId, 'reach_shore').state;
}

describe('Critical maritime recovery continuity', () => {
  it('keeps a Paradise shipwreck on the active route instead of teleporting across the world', () => {
    const state = activeState(17);
    state.locationId = 'whisky_peak';
    state.ship!.health = 0;
    state.history.push({
      eventId: 'active_paradise_route_start_p1_classic',
      choiceId: 'follow_needle',
      outcomeId: 'route_locked',
      ageMonths: 180,
    });

    const recovered = resolveCritical(state, 'critical_ship_destroyed');

    expect(recovered.ship).toBeNull();
    expect(recovered.maritimeEmergency).toBeNull();
    expect(recovered.travelState).toBe('on_land');
    expect(recovered.locationId).toBe('giant_island_little_garden');
    expect(contentCatalog.locations.find(({ id }) => id === recovered.locationId)?.seaId).toBe('grand_line_paradise');
  });

  it('uses only ordinary New World landfalls when the ship is already missing at sea', () => {
    const state = activeState(91);
    state.locationId = 'raijin_island';
    state.ship = null;
    const allowed = getOrdinaryNewWorldDestinationIds(state.locationId, contentCatalog);

    const recovered = resolveCritical(state, 'critical_ship_missing_at_sea');

    expect(recovered.ship).toBeNull();
    expect(recovered.maritimeEmergency).toBeNull();
    expect(recovered.travelState).toBe('on_land');
    expect(allowed).toContain(recovered.locationId);
    expect(contentCatalog.locations.find(({ id }) => id === recovered.locationId)?.seaId).toBe('new_world');
    expect(recovered.locationId).not.toBe('lode_star_island');
    expect(recovered.locationId).not.toBe('wano_country');
    expect(recovered.locationId).not.toBe('new_marineford');
  });

  it('keeps generic Blue recovery inside the current Blue', () => {
    const state = activeState(33);
    state.locationId = 'loguetown';
    state.ship!.health = 0;

    const recovered = resolveCritical(state, 'critical_ship_destroyed');

    expect(recovered.ship).toBeNull();
    expect(recovered.maritimeEmergency).toBeNull();
    expect(recovered.travelState).toBe('on_land');
    expect(contentCatalog.locations.find(({ id }) => id === recovered.locationId)?.seaId).toBe('east_blue');
  });

  it('can safely fall back to the current location when a transition sea has no alternative normal landfall', () => {
    const state = activeState(7);
    state.locationId = 'reverse_mountain';
    state.ship = null;

    const recovered = resolveCritical(state, 'critical_ship_missing_at_sea');

    expect(recovered.ship).toBeNull();
    expect(recovered.maritimeEmergency).toBeNull();
    expect(recovered.travelState).toBe('on_land');
    expect(contentCatalog.locations.find(({ id }) => id === recovered.locationId)?.seaId)
      .toBe(contentCatalog.locations.find(({ id }) => id === 'reverse_mountain')?.seaId);
  });
});
