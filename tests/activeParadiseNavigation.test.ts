import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { evaluateCondition } from '../src/game/engine/conditions';
import { selectNextEvent } from '../src/game/engine/events';
import {
  activeParadiseRouteId,
  paradiseArrivalProbabilityForCrossingRoot,
  resolveOrdinaryParadiseArrivalAfterMonthlyRoot,
  seedParadiseRouteAtTwinCapes,
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

describe('Active Paradise navigation foundation', () => {
  it('seeds exactly one stable Paradise route at Twin Capes', () => {
    const seeded = seedParadiseRouteAtTwinCapes(activeState(7));
    const routeId = activeParadiseRouteId(seeded);
    expect(routeId).toMatch(/^P[1-7]_/);
    expect(seeded.flags.filter((flag) => flag.startsWith('paradise_route:'))).toHaveLength(1);

    const seededAgain = seedParadiseRouteAtTwinCapes(seeded);
    expect(activeParadiseRouteId(seededAgain)).toBe(routeId);
    expect(seededAgain.rngState).toBe(seeded.rngState);
  });

  it('keeps shared Paradise nodes on the seeded route', () => {
    const classic = activeState();
    classic.locationId = 'water_seven';
    classic.travelState = 'at_sea';
    classic.flags = ['paradise_route:P1_CLASSIC'];
    classic.ageMonths = 186;
    expect(resolveOrdinaryParadiseArrivalAfterMonthlyRoot(classic, contentCatalog)).toBe(true);
    expect(classic.locationId).toBe('thriller_bark');

    const trade = activeState();
    trade.locationId = 'water_seven';
    trade.travelState = 'at_sea';
    trade.flags = ['paradise_route:P2_TRADE'];
    trade.ageMonths = 186;
    expect(resolveOrdinaryParadiseArrivalAfterMonthlyRoot(trade, contentCatalog)).toBe(true);
    expect(trade.locationId).toBe('sabaody_archipelago');
  });

  it('doubles the Paradise crossing clock without an active Log Pose', () => {
    expect(paradiseArrivalProbabilityForCrossingRoot(1, true)).toBe(0.35);
    expect(paradiseArrivalProbabilityForCrossingRoot(2, true)).toBe(0.70);
    expect(paradiseArrivalProbabilityForCrossingRoot(3, true)).toBe(1);
    expect(paradiseArrivalProbabilityForCrossingRoot(1, false)).toBe(0);
    expect(paradiseArrivalProbabilityForCrossingRoot(2, false)).toBe(0.35);
    expect(paradiseArrivalProbabilityForCrossingRoot(4, false)).toBe(0.70);
    expect(paradiseArrivalProbabilityForCrossingRoot(6, false)).toBe(1);
  });

  it('adds the dangerous Paradise root only when no Paradise Log Pose is active', () => {
    const hazard = contentCatalog.events.find(({ id }) => id === 'active_paradise_no_log_pose_hazard')!;
    const state = activeState();
    state.locationId = 'twin_capes';
    state.travelState = 'at_sea';
    state.flags = ['paradise_route:P3_WILD'];
    expect(evaluateCondition(hazard.eligibility!, state, contentCatalog)).toBe(true);

    state.player.logPose = {
      itemId: 'paradise_log_pose',
      quantity: 1,
      provenance: [{ locationId: null, quantity: 1 }],
    };
    expect(evaluateCondition(hazard.eligibility!, state, contentCatalog)).toBe(false);
  });

  it('forces the Reverse Mountain mini-arc and lands at Twin Capes before seeding the route', () => {
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
    expect(activeParadiseRouteId(state)).toMatch(/^P[1-7]_/);
    expect(state.ageMonths).toBe(181);
  });
});
