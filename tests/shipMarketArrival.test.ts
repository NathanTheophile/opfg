import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import type { ContentCatalog, EventDefinition } from '../src/game/content/schema';
import { evaluateCondition } from '../src/game/engine/conditions';
import { selectNextEvent } from '../src/game/engine/events';
import { movePlayerToLocation } from '../src/game/engine/locations';
import { resolveChoice } from '../src/game/engine/resolution';
import { consumePhaseSlot } from '../src/game/engine/time';
import { createInitialGameState } from '../src/game/model/initialState';

const PURCHASE_EVENT_ID = 'active_port_trade_01_ship_purchase_offer';

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
  it('offers the ship market from shipMarket metadata even when the Location has no port tag', () => {
    const state = activeShiplessState();
    state.shipMarketArrivalPending = true;

    const selected = selectNextEvent(state, contentCatalog);

    expect(selected.currentEventId).toBe(PURCHASE_EVENT_ID);
    expect(selected.shipMarketArrivalPending).toBe(false);
  });

  it('consumes the offer once per arrival, then offers it again after leaving and returning', () => {
    let state = activeShiplessState();
    state.shipMarketArrivalPending = true;
    state = selectNextEvent(state, contentCatalog);

    const refused = resolveChoice(state, contentCatalog, PURCHASE_EVENT_ID, 'rien').state;
    expect(refused.shipMarketArrivalPending).toBe(false);
    expect(refused.currentEventId).not.toBe(PURCHASE_EVENT_ID);

    state = { ...refused, currentEventId: null };
    movePlayerToLocation(state, 'loguetown', 'on_land');
    state.shipMarketArrivalPending = false;
    movePlayerToLocation(state, 'foosha_village', 'on_land');

    const returned = selectNextEvent(state, contentCatalog);
    expect(returned.currentEventId).toBe(PURCHASE_EVENT_ID);
    expect(returned.shipMarketArrivalPending).toBe(false);
  });

  it('does not create a new arrival when only travelState changes at the same Location', () => {
    const state = activeShiplessState();

    movePlayerToLocation(state, 'foosha_village', 'at_sea');

    expect(state.shipMarketArrivalPending).toBe(false);
  });

  it('keeps Immediate ahead of the arrival offer and the arrival offer ahead of due Scheduled Events', () => {
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
    withScheduled.scheduledEvents = [{
      eventId: scheduled.id,
      dueAgeMonths: 180,
      sourceEventId: 'source',
      sourceChoiceId: 'choice',
    }];
    expect(selectNextEvent(withScheduled, catalog)).toMatchObject({
      currentEventId: PURCHASE_EVENT_ID,
      shipMarketArrivalPending: false,
    });
  });

  it('pays exactly 50 Berrys per birthday and reaches 750 Berrys at age 15', () => {
    let state = createInitialGameState(1);
    state.careerPhase = 'childhood';
    state = consumePhaseSlot(state, 'origins');

    expect(state).toMatchObject({ ageMonths: 12, berries: 50 });

    while (state.careerPhase === 'childhood') state = consumePhaseSlot(state, 'childhood');

    expect(state).toMatchObject({
      ageMonths: 180,
      berries: 750,
      careerPhase: 'active',
      shipMarketArrivalPending: true,
    });

    state.ageMonths = 191;
    state.slotInMonth = 1;
    state = consumePhaseSlot(state, 'active');
    expect(state).toMatchObject({ ageMonths: 192, berries: 800, slotInMonth: 0 });
  });

  it('keeps departure ineligible without a ship and eligible with one', () => {
    const departure = contentCatalog.events.find(({ id }) => id === 'departure');
    expect(departure?.eligibility).toBeDefined();

    const state = activeShiplessState();
    expect(evaluateCondition(departure!.eligibility!, state, contentCatalog)).toBe(false);

    state.ship = { shipId: 'dinghy', name: 'Test Dinghy', health: 10, cargo: [] };
    expect(evaluateCondition(departure!.eligibility!, state, contentCatalog)).toBe(true);
  });
});
