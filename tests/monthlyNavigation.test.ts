import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { applyMonthlyNavigationChoice, getMonthlyNavigationOptions, needsMonthlyNavigationDecision } from '../src/game/engine/navigation';
import { deserializeGameState, serializeGameState } from '../src/game/engine/save';
import { createInitialGameState } from '../src/game/model/initialState';

const activeState = () => {
  const state = createInitialGameState(1);
  state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
  state.careerPhase = 'active'; state.ageMonths = 180; state.slotInMonth = 0; state.locationId = 'foosha_village'; state.travelState = 'on_land';
  return state;
};

describe('monthly navigation', () => {
  it('offers real destinations on land and sailing changes Location without consuming time', () => {
    const state = activeState();
    const options = getMonthlyNavigationOptions(state, contentCatalog);
    expect(options).toContainEqual({ id: 'stay', available: true });

    const sail = options.find((option) => option.destinationId !== undefined && option.available);
    expect(sail?.destinationId).toBeTruthy();

    const origin = contentCatalog.locations.find(({ id }) => id === state.locationId)!;
    const destination = contentCatalog.locations.find(({ id }) => id === sail!.destinationId)!;
    expect(destination.islandId).not.toBe(origin.islandId);

    const next = applyMonthlyNavigationChoice(state, contentCatalog, sail!.id);
    expect(next).toMatchObject({
      travelState: 'at_sea',
      locationId: sail!.destinationId,
      ageMonths: 180,
      slotInMonth: 0,
      navigationDecisionAgeMonths: 180,
    });
    expect(needsMonthlyNavigationDecision(next)).toBe(false);
  });

  it('offers docking at a port and blocks it where docking is forbidden', () => {
    const state = activeState(); state.travelState = 'at_sea';
    expect(getMonthlyNavigationOptions(state, contentCatalog)).toContainEqual({ id: 'dock', available: true });
    state.locationId = 'arlong_park';
    expect(getMonthlyNavigationOptions(state, contentCatalog)).toContainEqual({ id: 'dock', available: false });
    expect(() => applyMonthlyNavigationChoice(state, contentCatalog, 'dock')).toThrow('not available');
  });

  it('does not prompt non-Leaders or players without ships', () => {
    const state = activeState(); state.isLeader = false;
    expect(needsMonthlyNavigationDecision(state)).toBe(false);
    state.isLeader = true; state.ship = null;
    expect(needsMonthlyNavigationDecision(state)).toBe(false);
  });

  it('persists the monthly decision and only asks again next month after chains finish', () => {
    let state = applyMonthlyNavigationChoice(activeState(), contentCatalog, 'stay');
    const restored = deserializeGameState(serializeGameState(state))!;
    expect(needsMonthlyNavigationDecision(restored)).toBe(false);
    state = { ...restored, ageMonths: 181, pendingSlotPhase: 'active', immediateEventQueue: ['continuation'] };
    expect(needsMonthlyNavigationDecision(state)).toBe(false);
    state = { ...state, pendingSlotPhase: null, immediateEventQueue: [] };
    expect(needsMonthlyNavigationDecision(state)).toBe(true);
  });
});
