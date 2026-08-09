import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { applyMonthlyNavigationChoice, getMonthlyNavigationOptions, needsMonthlyNavigationDecision } from '../src/game/engine/navigation';
import { deserializeGameState, serializeGameState } from '../src/game/engine/save';
import { createInitialGameState } from '../src/game/model/initialState';

const activeState = () => {
  const state = createInitialGameState(1);
  state.careerPhase = 'active'; state.ageMonths = 180; state.slotInMonth = 0; state.locationId = 'foosha_village'; state.travelState = 'on_land';
  return state;
};

describe('monthly navigation', () => {
  it('offers stay/go to sea on land and consumes no slot', () => {
    const state = activeState();
    expect(getMonthlyNavigationOptions(state, contentCatalog).map(({ id, available }) => [id, available])).toEqual([['stay', true], ['goToSea', true]]);
    const next = applyMonthlyNavigationChoice(state, contentCatalog, 'goToSea');
    expect(next).toMatchObject({ travelState: 'at_sea', ageMonths: 180, slotInMonth: 0, navigationDecisionAgeMonths: 180 });
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
    state = { ...restored, travelState: 'at_sea', slotInMonth: 1 };
    expect(needsMonthlyNavigationDecision(state)).toBe(false);
    state = { ...state, slotInMonth: 0, ageMonths: 181, pendingSlotPhase: 'active', immediateEventQueue: ['continuation'] };
    expect(needsMonthlyNavigationDecision(state)).toBe(false);
    state = { ...state, pendingSlotPhase: null, immediateEventQueue: [] };
    expect(needsMonthlyNavigationDecision(state)).toBe(true);
  });
});
