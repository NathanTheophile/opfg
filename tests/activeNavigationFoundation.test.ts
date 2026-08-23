import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { applyEffects } from '../src/game/engine/effects';
import {
  applyNavigationSystemResolution,
  createDepartureSystemEvent,
  getMonthlyNavigationOptions,
} from '../src/game/engine/navigation';
import { createInitialGameState } from '../src/game/model/initialState';

const context = { sourceEventId: 'system_navigation:departure', sourceChoiceId: 'navigation:depart' };

function activeState() {
  const state = createInitialGameState(123);
  state.careerPhase = 'active';
  state.ageMonths = 180;
  state.travelState = 'on_land';
  state.locationId = 'foosha_village';
  state.ship = { shipId: 'dinghy', name: 'Test Dinghy', health: 20, cargo: [] };
  state.isLeader = true;
  state.navigationDecisionAgeMonths = 180;
  return state;
}

describe('Active V1 departure foundation', () => {
  it('removes the old monthly destination picker', () => {
    const state = activeState();
    expect(getMonthlyNavigationOptions(state, contentCatalog)).toEqual([]);
  });

  it('offers the non-root departure system event only after more than six months', () => {
    const state = activeState();
    state.ageMonths = 186;
    expect(createDepartureSystemEvent(state, contentCatalog)).toBeNull();

    state.ageMonths = 187;
    const event = createDepartureSystemEvent(state, contentCatalog);
    expect(event).toMatchObject({
      id: 'system_navigation:departure',
      kind: 'system',
    });
  });

  it('offers departure after the first Active root when a first ship has just been acquired', () => {
    const state = activeState();
    state.navigationDecisionAgeMonths = null;
    state.history.push({ eventId: 'active_opener', choiceId: 'continue', outcomeId: 'done', ageMonths: 180 });
    expect(createDepartureSystemEvent(state, contentCatalog)?.id).toBe('system_navigation:departure');
  });

  it('can force the departure offer immediately when local roots are exhausted', () => {
    const state = activeState();
    expect(createDepartureSystemEvent(state, contentCatalog)).toBeNull();
    expect(createDepartureSystemEvent(state, contentCatalog, true)?.id).toBe('system_navigation:departure');
  });

  it('does not create generic self-directed departure without a personal ship', () => {
    const state = activeState();
    state.ship = null;
    state.ageMonths = 240;
    expect(createDepartureSystemEvent(state, contentCatalog, true)).toBeNull();
  });

  it('resets the six-month cooldown when the player stays without consuming time', () => {
    const state = activeState();
    state.ageMonths = 187;
    const stayed = applyNavigationSystemResolution(state, 'navigation:stay');
    expect(stayed.ageMonths).toBe(187);
    expect(stayed.navigationDecisionAgeMonths).toBe(187);
    expect(createDepartureSystemEvent(stayed, contentCatalog)).toBeNull();
  });

  it('sends the player to sea without choosing a destination or consuming time', () => {
    const state = activeState();
    state.ageMonths = 187;
    const event = createDepartureSystemEvent(state, contentCatalog)!;
    const depart = event.choices.find(({ id }) => id === 'navigation:depart')!;
    if (depart.resolution.type !== 'deterministic') throw new Error('Expected deterministic departure.');

    const moved = applyEffects(state, contentCatalog, depart.resolution.outcome.effects, context);
    expect(moved.ageMonths).toBe(187);
    expect(moved.travelState).toBe('at_sea');
    expect(moved.locationId).toBe('foosha_village');
  });

  it('does not expose Reverse Mountain as a generic Blue departure choice', () => {
    const state = activeState();
    state.ageMonths = 187;
    const event = createDepartureSystemEvent(state, contentCatalog)!;

    expect(event.choices.map(({ id }) => id)).toEqual(['navigation:depart', 'navigation:stay']);
  });
});
