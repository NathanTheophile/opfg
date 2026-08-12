import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import type { ContentCatalog, EventDefinition } from '../src/game/content/schema';
import { selectNextEvent } from '../src/game/engine/events';
import { movePlayerToLocation } from '../src/game/engine/locations';
import { consumePhaseSlot } from '../src/game/engine/time';
import { createInitialGameState } from '../src/game/model/initialState';
import { createSessionState, exploreFromMarketHub, openMarketHubView, returnToMarketHub } from '../src/game/session/gameSession';

function activeShiplessState() {
  const state = createInitialGameState(1);
  state.careerPhase = 'active';
  state.ageMonths = 180;
  state.locationId = 'foosha_village';
  state.travelState = 'on_land';
  state.ship = null;
  state.berries = 750;
  state.shipMarketArrivalPending = false;
  return state;
}

function fixtureEvent(id: string, kind: 'immediate' | 'scheduled'): EventDefinition {
  const base = {
    id,
    titleKey: 'event.departure.title',
    textKey: 'event.departure.text',
    choices: [{
      id: 'continue',
      textKey: 'event.departure.choice.set_sail.text',
      resolution: {
        type: 'deterministic' as const,
        outcome: {
          id: 'done',
          textKey: 'event.departure.choice.set_sail.outcome.departure_set_sail.text',
          effects: [],
        },
      },
    }],
  };
  return kind === 'immediate'
    ? { ...base, kind: 'immediate' }
    : { ...base, kind: 'scheduled', priority: 300 };
}

describe('ship market arrival and annual income', () => {
  it('opens the no-slot Hub from explicit arrival metadata', () => {
    const state = activeShiplessState();
    state.shipMarketArrivalPending = true;
    state.navigationDecisionAgeMonths = state.ageMonths;
    const selected = selectNextEvent(state, contentCatalog);
    expect(selected.currentEventId).toBeNull();
    expect(selected.shipMarketArrivalPending).toBe(true);
  });

  it('loops through Merchant and resumes real selection only on Explore', () => {
    const state = activeShiplessState();
    state.shipMarketArrivalPending = true;
    state.navigationDecisionAgeMonths = state.ageMonths;
    let session = createSessionState(state);
    session = openMarketHubView(session, contentCatalog, 'merchant');
    expect(session.marketHubView).toBe('merchant');
    session = returnToMarketHub(session, contentCatalog);
    session = exploreFromMarketHub(session, contentCatalog);
    expect(session.marketHubView).toBeNull();
    expect(session.gameState?.shipMarketArrivalPending).toBe(false);
  });

  it('does not create a new arrival when only travelState changes at the same Location', () => {
    const state = activeShiplessState();

    movePlayerToLocation(state, 'foosha_village', 'at_sea');

    expect(state.shipMarketArrivalPending).toBe(false);
  });

  it('keeps Immediate ahead of the arrival Hub and the Hub ahead of due Scheduled Events', () => {
    const immediate = fixtureEvent('test_ship_market_immediate', 'immediate');
    const scheduled = fixtureEvent('test_ship_market_scheduled', 'scheduled');
    const catalog: ContentCatalog = { ...contentCatalog, events: [...contentCatalog.events, immediate, scheduled] };

    const withImmediate = activeShiplessState();
    withImmediate.shipMarketArrivalPending = true;
    withImmediate.immediateEventQueue = [immediate.id];
    withImmediate.pendingSlotPhase = 'active';
    expect(selectNextEvent(withImmediate, catalog)).toMatchObject({
      currentEventId: immediate.id,
      shipMarketArrivalPending: true,
    });

    const withScheduled = activeShiplessState();
    withScheduled.shipMarketArrivalPending = true;
    withScheduled.navigationDecisionAgeMonths = withScheduled.ageMonths;
    withScheduled.scheduledEvents = [{
      eventId: scheduled.id,
      dueAgeMonths: 180,
      sourceEventId: 'source',
      sourceChoiceId: 'choice',
    }];
    expect(selectNextEvent(withScheduled, catalog)).toMatchObject({
      currentEventId: null,
      shipMarketArrivalPending: true,
    });
  });

  it('pays poor Childhood income on birthdays ages 5 through 14 only', () => {
    let state = createInitialGameState(1);
    state.careerPhase = 'childhood';
    state.player.profile.raceId = 'human';
    state.player.profile.socialClassId = 'poor';
    state.player.stats.health = 20;
    state = consumePhaseSlot(state, 'origins', contentCatalog);

    expect(state).toMatchObject({ ageMonths: 12, berries: 0, player: { stats: { health: 21 } } });

    while (state.careerPhase === 'childhood') state = consumePhaseSlot(state, 'childhood', contentCatalog);

    expect(state).toMatchObject({
      ageMonths: 180,
      berries: 5000,
      careerPhase: 'active',
      shipMarketArrivalPending: true,
      player: { stats: { health: 35 } },
    });

    state.ageMonths = 191;
    state.slotInMonth = 1;
    state.player.stats.health = 30;
    state = consumePhaseSlot(state, 'active', contentCatalog);
    expect(state).toMatchObject({ ageMonths: 192, berries: 5000, slotInMonth: 0, player: { stats: { health: 31 } } });
  });
});
