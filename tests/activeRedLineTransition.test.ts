import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { NEW_WORLD_ROUTE_START_EVENT_IDS, selectNextEvent } from '../src/game/engine/events';
import { getNavigatorDestinationIds } from '../src/game/engine/locations';
import { ordinaryDepartureHasDestination } from '../src/game/engine/maritime';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';
import type { GameState } from '../src/game/model/schema';

const NEW_WORLD_DESTINATION_BY_EVENT_ID = {
  active_new_world_route_start_raijin: 'raijin_island',
  active_new_world_route_start_risky_red: 'risky_red_island',
  active_new_world_route_start_mystoria: 'mystoria_island',
} as const;

function activeState(seed = 123): GameState {
  const state = createInitialGameState(seed);
  state.careerPhase = 'active';
  state.ageMonths = 180;
  state.locationId = 'sabaody_archipelago';
  state.travelState = 'on_land';
  state.navigationDecisionAgeMonths = 180;
  state.shipMarketArrivalPending = false;
  state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
  return state;
}

function leaveFishManMarket(state: GameState): GameState {
  return state.currentEventId?.startsWith('system_market:')
    ? resolveChoice(state, contentCatalog, state.currentEventId, 'market:explore').state
    : state;
}

describe('Active Red Line transition', () => {
  it('forces the authored Sabaody passage, then seed-selects one New World entrance at Fish-Man Island', () => {
    let state = selectNextEvent(activeState(7), contentCatalog);
    expect(state.currentEventId).toBe('active_sabaody_red_line_passage');

    state = resolveChoice(state, contentCatalog, 'active_sabaody_red_line_passage', 'descend').state;
    expect(state.locationId).toBe('fish_man_island');

    state = leaveFishManMarket(state);
    expect(NEW_WORLD_ROUTE_START_EVENT_IDS).toContain(state.currentEventId);

    const routeEventId = state.currentEventId as keyof typeof NEW_WORLD_DESTINATION_BY_EVENT_ID;
    const destinationId = NEW_WORLD_DESTINATION_BY_EVENT_ID[routeEventId];
    state = resolveChoice(state, contentCatalog, routeEventId, 'follow_needle').state;

    expect(state.locationId).toBe(destinationId);
    expect(contentCatalog.locations.find(({ id }) => id === destinationId)?.seaId).toBe('new_world');
  });

  it('uses the same Fish-Man route for the same seed and exposes all three entrances across seeds', () => {
    const selectedRoute = (seed: number) => {
      let state = selectNextEvent(activeState(seed), contentCatalog);
      state = resolveChoice(state, contentCatalog, 'active_sabaody_red_line_passage', 'descend').state;
      return leaveFishManMarket(state).currentEventId;
    };

    expect(selectedRoute(17)).toBe(selectedRoute(17));

    const seen = new Set(Array.from({ length: 64 }, (_, index) => selectedRoute(index + 1)));
    expect(seen).toEqual(new Set(NEW_WORLD_ROUTE_START_EVENT_IDS));
  });

  it('keeps Sabaody and Fish-Man Island Event-driven rather than exposing direct Navigator destinations', () => {
    const sabaody = activeState();
    expect(ordinaryDepartureHasDestination(sabaody, contentCatalog)).toBe(false);
    expect(getNavigatorDestinationIds('sabaody_archipelago', contentCatalog)).toEqual([]);
    expect(getNavigatorDestinationIds('fish_man_island', contentCatalog)).toEqual([]);
  });

  it('does not expose an ordinary departure from Sabaody while the Red Line passage is required', () => {
    const state = activeState();
    state.ageMonths = 240;
    state.navigationDecisionAgeMonths = 180;

    expect(ordinaryDepartureHasDestination(state, contentCatalog)).toBe(false);
  });

  it('registers exactly the three authored New World entrance Events', () => {
    expect(NEW_WORLD_ROUTE_START_EVENT_IDS).toHaveLength(3);
    expect(NEW_WORLD_ROUTE_START_EVENT_IDS.every((eventId) =>
      contentCatalog.events.some(({ id, kind }) => id === eventId && kind === 'normal'),
    )).toBe(true);
  });
});
