import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { evaluateCondition } from '../src/game/engine/conditions';
import { selectNextEvent } from '../src/game/engine/events';
import {
  activeParadiseRouteId,
  ordinaryDepartureHasDestination,
  PARADISE_ROUTE_START_EVENT_IDS,
  paradiseArrivalProbabilityForCrossingRoot,
  paradiseNextDestinationId,
  resolveOrdinaryParadiseArrivalAfterMonthlyRoot,
} from '../src/game/engine/maritime';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';
import type { GameState } from '../src/game/model/schema';

function activeState(seed = 123): GameState {
  const state = createInitialGameState(seed);
  state.careerPhase = 'active';
  state.ageMonths = 180;
  state.locationId = 'twin_capes';
  state.travelState = 'on_land';
  state.navigationDecisionAgeMonths = 180;
  state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
  return state;
}

function lockRouteFromHistory(state: GameState, routeStartEventId: string): void {
  state.history.push({
    eventId: routeStartEventId,
    choiceId: 'take_course',
    outcomeId: 'course_set',
    ageMonths: state.ageMonths,
  });
}

describe('Active Paradise navigation foundation', () => {
  it('seed-selects one of the seven route-start Events at Twin Capes and derives the route from History', () => {
    expect(PARADISE_ROUTE_START_EVENT_IDS).toHaveLength(7);
    expect(PARADISE_ROUTE_START_EVENT_IDS.every((eventId) => contentCatalog.events.some(({ id }) => id === eventId))).toBe(true);

    let state = selectNextEvent(activeState(7), contentCatalog);
    const routeStartEventId = state.currentEventId!;
    const sameSeed = selectNextEvent(activeState(7), contentCatalog);

    expect(PARADISE_ROUTE_START_EVENT_IDS).toContain(routeStartEventId);
    expect(sameSeed.currentEventId).toBe(routeStartEventId);
    expect(activeParadiseRouteId(state)).toBeUndefined();

    state = resolveChoice(state, contentCatalog, routeStartEventId, 'take_course').state;
    expect(activeParadiseRouteId(state)).toMatch(/^P[1-7]_/);
    expect(state.flags.filter((flag) => flag.startsWith('paradise_route:'))).toHaveLength(0);
  });

  it('keeps shared Paradise nodes on the route recorded at Twin Capes', () => {
    const classic = activeState();
    classic.locationId = 'water_seven';
    classic.travelState = 'at_sea';
    lockRouteFromHistory(classic, 'active_paradise_route_start_p1_classic');
    classic.ageMonths = 186;
    expect(resolveOrdinaryParadiseArrivalAfterMonthlyRoot(classic, contentCatalog)).toBe(true);
    expect(classic.locationId).toBe('thriller_bark');

    const trade = activeState();
    trade.locationId = 'water_seven';
    trade.travelState = 'at_sea';
    lockRouteFromHistory(trade, 'active_paradise_route_start_p2_trade');
    trade.ageMonths = 186;
    expect(resolveOrdinaryParadiseArrivalAfterMonthlyRoot(trade, contentCatalog)).toBe(true);
    expect(trade.locationId).toBe('sabaody_archipelago');
  });

  it('resolves the nearest route node before its ancestors and preserves sub-location progression', () => {
    const state = activeState();
    lockRouteFromHistory(state, 'active_paradise_route_start_p1_classic');

    state.locationId = 'whisky_peak';
    expect(paradiseNextDestinationId(state, contentCatalog)).toBe('giant_island_little_garden');
    expect(ordinaryDepartureHasDestination(state, contentCatalog)).toBe(true);

    state.locationId = 'sakura_kingdom';
    expect(paradiseNextDestinationId(state, contentCatalog)).toBe('alabasta_kingdom');
    expect(ordinaryDepartureHasDestination(state, contentCatalog)).toBe(true);

    state.locationId = 'sabaody_archipelago';
    expect(paradiseNextDestinationId(state, contentCatalog)).toBeUndefined();
    expect(ordinaryDepartureHasDestination(state, contentCatalog)).toBe(false);
  });

  it('keeps the old route flag as read-only Save 22 compatibility', () => {
    const state = activeState();
    state.flags = ['paradise_route:P3_WILD'];
    expect(activeParadiseRouteId(state)).toBe('P3_WILD');
  });

  it('doubles the Paradise crossing clock without an active Log Pose', () => {
    expect(paradiseArrivalProbabilityForCrossingRoot(1, true)).toBe(0.35);
    expect(paradiseArrivalProbabilityForCrossingRoot(2, true)).toBe(0.70);
    expect(paradiseArrivalProbabilityForCrossingRoot(3, true)).toBe(1);
    expect(paradiseArrivalProbabilityForCrossingRoot(1, false)).toBe(0);
    expect(paradiseArrivalProbabilityForCrossingRoot(2, false)).toBe(0.35);
    expect(paradiseArrivalProbabilityForCrossingRoot(3, false)).toBe(0);
    expect(paradiseArrivalProbabilityForCrossingRoot(4, false)).toBe(0.70);
    expect(paradiseArrivalProbabilityForCrossingRoot(5, false)).toBe(0);
    expect(paradiseArrivalProbabilityForCrossingRoot(6, false)).toBe(1);
  });

  it('adds the dangerous Paradise root only when no Paradise Log Pose is active', () => {
    const hazard = contentCatalog.events.find(({ id }) => id === 'active_paradise_no_log_pose_hazard')!;
    const state = activeState();
    state.locationId = 'twin_capes';
    state.travelState = 'at_sea';
    expect(evaluateCondition(hazard.eligibility!, state, contentCatalog)).toBe(true);

    state.player.logPose = {
      itemId: 'paradise_log_pose',
      quantity: 1,
      provenance: [{ locationId: null, quantity: 1 }],
    };
    expect(evaluateCondition(hazard.eligibility!, state, contentCatalog)).toBe(false);
  });

  it('forces the Reverse Mountain mini-arc, lands at Twin Capes, then selects a route-start root', () => {
    let state = activeState(11);
    state.locationId = 'reverse_mountain';
    state = selectNextEvent(state, contentCatalog);
    expect(state.currentEventId).toBe('active_reverse_mountain_01_entry');

    state = resolveChoice(state, contentCatalog, 'active_reverse_mountain_01_entry', 'hold_line').state;
    expect(state.currentEventId).toBe('active_reverse_mountain_01_climb');
    state = resolveChoice(state, contentCatalog, 'active_reverse_mountain_01_climb', 'follow_current').state;
    expect(state.currentEventId).toBe('active_reverse_mountain_01_descent');
    state = resolveChoice(state, contentCatalog, 'active_reverse_mountain_01_descent', 'enter_paradise').state;

    expect(state.locationId).toBe('twin_capes');
    expect(PARADISE_ROUTE_START_EVENT_IDS).toContain(state.currentEventId);
    expect(activeParadiseRouteId(state)).toBeUndefined();
    expect(state.ageMonths).toBe(181);

    const routeStartEventId = state.currentEventId!;
    state = resolveChoice(state, contentCatalog, routeStartEventId, 'take_course').state;
    expect(activeParadiseRouteId(state)).toMatch(/^P[1-7]_/);
    expect(state.ageMonths).toBe(182);
  });

  it('does not let ordinary departure or fallback bypass the Reverse Mountain passage', () => {
    const state = activeState();
    state.locationId = 'reverse_mountain';
    state.navigationDecisionAgeMonths = 170;

    expect(ordinaryDepartureHasDestination(state, contentCatalog)).toBe(false);
  });
});
