import { describe, expect, it } from 'vitest';
import { createContentCatalog } from '../src/game/content/catalogFactory';
import { findCurrentEvent, selectNextEvent } from '../src/game/engine/events';
import { movePlayerToLocation } from '../src/game/engine/locations';
import { applyMonthlyNavigationChoice } from '../src/game/engine/navigation';
import { resolveChoice } from '../src/game/engine/resolution';
import { deserializeGameState, serializeGameState } from '../src/game/engine/save';
import { consumePhaseSlot } from '../src/game/engine/time';
import { createInitialGameState } from '../src/game/model/initialState';

const catalog = createContentCatalog([]);

function activeState(seed = 1) {
  const state = createInitialGameState(seed);
  state.careerPhase = 'active';
  state.ageMonths = 180;
  state.slotInMonth = 0;
  state.navigationDecisionAgeMonths = null;
  return state;
}

describe('event-driven commerce architecture', () => {
  it('does not invent a market arrival when Childhood becomes Active', () => {
    const state = createInitialGameState(1);
    state.careerPhase = 'childhood';
    state.ageMonths = 174;
    state.shipMarketArrivalPending = false;

    const advanced = consumePhaseSlot(state, 'childhood', catalog);

    expect(advanced).toMatchObject({
      careerPhase: 'active',
      ageMonths: 180,
      shipMarketArrivalPending: false,
    });
  });

  it('marks a real landfall, not an at-sea destination change, as a market arrival', () => {
    const marketLocation = catalog.locations.find(
      (location) =>
        location.allowsDocking
        && location.hasMarketHub
        && location.shipMarket !== 'none',
    );
    expect(marketLocation).toBeDefined();

    const state = activeState(2);
    state.ship = {
      shipId: 'sloop',
      name: 'Test Sloop',
      health: 30,
      cargo: [],
    };

    movePlayerToLocation(state, marketLocation!.id, 'at_sea');
    expect(state.shipMarketArrivalPending).toBe(false);

    const docked = applyMonthlyNavigationChoice(state, catalog, 'dock');
    expect(docked).toMatchObject({
      locationId: marketLocation!.id,
      travelState: 'on_land',
      shipMarketArrivalPending: true,
      navigationDecisionAgeMonths: 180,
    });

    const selected = selectNextEvent(docked, catalog);
    expect(selected.currentEventId).toBe('system_market:arrival');
    expect(findCurrentEvent(selected, catalog)?.kind).toBe('system');
  });

  it('runs ship browse, purchase, sale and exit entirely through zero-time Events', () => {
    const marketLocation = catalog.locations.find(
      (location) => location.hasMarketHub && location.shipMarket !== 'none',
    );
    expect(marketLocation).toBeDefined();

    const initial = activeState(3);
    initial.locationId = marketLocation!.id;
    initial.travelState = 'on_land';
    initial.shipMarketArrivalPending = true;
    initial.berries = 1_000_000;

    const selected = selectNextEvent(initial, catalog);
    expect(selected.currentEventId).toBe('system_market:arrival');

    const enteredPort = resolveChoice(
      selected,
      catalog,
      'system_market:arrival',
      'market:port',
    );

    expect(enteredPort.state.currentEventId).toBe('system_market:port');
    expect(enteredPort.state.ageMonths).toBe(initial.ageMonths);
    expect(enteredPort.state.slotInMonth).toBe(initial.slotInMonth);
    expect(enteredPort.state.history).toEqual(initial.history);

    const portEvent = findCurrentEvent(enteredPort.state, catalog);
    expect(portEvent?.kind).toBe('system');

    const buyChoice = portEvent?.choices.find(({ id }) =>
      id.startsWith('market:ship:buy:'),
    );
    expect(buyChoice).toBeDefined();

    const shipId = buyChoice!.id.slice('market:ship:buy:'.length);
    const confirmation = resolveChoice(
      enteredPort.state,
      catalog,
      'system_market:port',
      buyChoice!.id,
    );

    expect(confirmation.state.currentEventId).toBe(
      `system_market:confirm:ship:buy:${shipId}`,
    );

    const confirmEvent = findCurrentEvent(confirmation.state, catalog);
    const negotiation = confirmEvent?.choices.find(
      ({ id }) => id === 'market:negotiate',
    );
    expect(negotiation?.resolution.type).toBe('dice');

    const purchased = resolveChoice(
      confirmation.state,
      catalog,
      confirmation.state.currentEventId!,
      'market:accept',
    );

    expect(purchased.state.ship?.shipId).toBe(shipId);
    expect(purchased.state.currentEventId).toBe('system_market:port');
    expect(purchased.state.ageMonths).toBe(initial.ageMonths);
    expect(purchased.state.slotInMonth).toBe(initial.slotInMonth);
    expect(purchased.state.history).toEqual(initial.history);

    const saleChoice = findCurrentEvent(purchased.state, catalog)?.choices.find(
      ({ id }) => id === `market:ship:sell:${shipId}`,
    );
    expect(saleChoice).toBeDefined();

    const saleConfirmation = resolveChoice(
      purchased.state,
      catalog,
      'system_market:port',
      saleChoice!.id,
    );
    expect(saleConfirmation.state.currentEventId).toBe(
      `system_market:confirm:ship:sell:${shipId}`,
    );

    const sold = resolveChoice(
      saleConfirmation.state,
      catalog,
      saleConfirmation.state.currentEventId!,
      'market:accept',
    );
    expect(sold.state.ship).toBeNull();
    expect(sold.state.currentEventId).toBe('system_market:port');
    expect(sold.state.history).toEqual(initial.history);

    const exited = resolveChoice(
      sold.state,
      catalog,
      'system_market:port',
      'market:explore',
    );
    expect(exited.state.shipMarketArrivalPending).toBe(false);
    expect(exited.state.currentEventId?.startsWith('system_market:')).not.toBe(true);
    expect(exited.state.ageMonths).toBe(initial.ageMonths);
    expect(exited.state.slotInMonth).toBe(initial.slotInMonth);
    expect(exited.state.history).toEqual(initial.history);
  });

  it('keeps generic merchant buying in the same Event pipeline and unified inventory', () => {
    const marketLocation = catalog.locations.find(
      (location) => location.hasMarketHub && location.marketItemIds.length > 0,
    );
    expect(marketLocation).toBeDefined();

    const initial = activeState(4);
    initial.locationId = marketLocation!.id;
    initial.travelState = 'on_land';
    initial.shipMarketArrivalPending = true;
    initial.berries = 100_000;

    const arrival = selectNextEvent(initial, catalog);
    const merchant = resolveChoice(
      arrival,
      catalog,
      'system_market:arrival',
      'market:merchant',
    );
    const list = resolveChoice(
      merchant.state,
      catalog,
      'system_market:merchant',
      'market:buy:list',
    );

    const listEvent = findCurrentEvent(list.state, catalog);
    const itemChoice = listEvent?.choices.find(({ id }) =>
      id.startsWith('market:item:buy:'),
    );
    expect(itemChoice).toBeDefined();

    const itemId = itemChoice!.id.slice('market:item:buy:'.length);
    const confirmation = resolveChoice(
      list.state,
      catalog,
      'system_market:buy',
      itemChoice!.id,
    );

    const purchased = resolveChoice(
      confirmation.state,
      catalog,
      confirmation.state.currentEventId!,
      'market:accept',
    );

    expect(
      purchased.state.player.inventory.stacks.find(
        (stack) => stack.itemId === itemId,
      )?.quantity,
    ).toBe(1);
    expect(purchased.state.currentEventId).toBe('system_market:merchant');
    expect(purchased.state.history).toEqual(initial.history);
    expect(purchased.state.ageMonths).toBe(initial.ageMonths);
  });

  it('can save and reload in the middle of a dynamic Market Event', () => {
    const marketLocation = catalog.locations.find(
      (location) => location.hasMarketHub && location.shipMarket !== 'none',
    );
    expect(marketLocation).toBeDefined();

    const initial = activeState(5);
    initial.locationId = marketLocation!.id;
    initial.travelState = 'on_land';
    initial.shipMarketArrivalPending = true;

    const arrival = selectNextEvent(initial, catalog);
    const port = resolveChoice(
      arrival,
      catalog,
      'system_market:arrival',
      'market:port',
    );

    const restored = deserializeGameState(serializeGameState(port.state));

    expect(restored?.currentEventId).toBe('system_market:port');
    expect(restored && findCurrentEvent(restored, catalog)?.id).toBe(
      'system_market:port',
    );
  });
});
