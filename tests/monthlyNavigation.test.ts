import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import {
  applyMonthlyNavigationChoice,
  createDepartureSystemEvent,
  getMonthlyNavigationOptions,
  needsMonthlyNavigationDecision,
} from '../src/game/engine/navigation';
import { createInitialGameState } from '../src/game/model/initialState';

const activeState = () => {
  const state = createInitialGameState(1);
  state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
  state.careerPhase = 'active';
  state.ageMonths = 187;
  state.slotInMonth = 0;
  state.locationId = 'foosha_village';
  state.travelState = 'on_land';
  state.navigationDecisionAgeMonths = 180;
  return state;
};

describe('deprecated monthly navigation compatibility', () => {
  it('keeps the old monthly picker disabled in Active V1', () => {
    const state = activeState();

    expect(needsMonthlyNavigationDecision(state)).toBe(false);
    expect(getMonthlyNavigationOptions(state, contentCatalog)).toEqual([]);
    expect(() => applyMonthlyNavigationChoice(state, contentCatalog, 'stay'))
      .toThrow('disabled in Active V1');
  });

  it('routes ordinary navigation through the departure System Event instead', () => {
    const departure = createDepartureSystemEvent(activeState(), contentCatalog);

    expect(departure?.id).toBe('system_navigation:departure');
    expect(departure?.kind).toBe('system');
    expect(departure?.choices.map(({ id }) => id)).toEqual(
      expect.arrayContaining(['navigation:depart', 'navigation:stay', 'navigation:grand_line']),
    );
  });

  it('does not create a departure System Event without leadership or a ship', () => {
    const nonLeader = activeState();
    nonLeader.isLeader = false;
    expect(createDepartureSystemEvent(nonLeader, contentCatalog)).toBeNull();

    const noShip = activeState();
    noShip.ship = null;
    expect(createDepartureSystemEvent(noShip, contentCatalog)).toBeNull();
  });
});
