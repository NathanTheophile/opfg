import { describe, expect, it } from 'vitest';
import { createContentCatalog } from '../content/catalogFactory';
import type { EventDefinition } from '../content/schema';
import { createInitialGameState } from '../model/initialState';
import { chooseInSession, createSessionState, dismissResolution } from '../session/gameSession';
import { buyItem, buyShip, canBuyItem, canSellItem, sellItem, shipBuyPrice, shipSellPrice } from './economy';

const event: EventDefinition = {
  id: 'market_test_event', kind: 'normal', titleKey: 'x', textKey: 'x',
  choices: [{ id: 'x', textKey: 'x', resolution: { type: 'deterministic', outcome: { id: 'x', textKey: 'x', effects: [] } } }],
};

function marketState() {
  const catalog = createContentCatalog([event]);
  const markets = catalog.locations.filter(({ marketItemIds }) => marketItemIds.includes('timber'));
  const state = createInitialGameState(1);
  state.careerPhase = 'active';
  state.ageMonths = 180;
  state.navigationDecisionAgeMonths = 180;
  state.locationId = markets[0].id;
  state.berries = 100_000;
  return { catalog, markets, state };
}

describe('D2.6 fixed markets and Arrival Hub', () => {
  it('authors hubs/catalogs and carries the market mode on the Item', () => {
    const { catalog, markets } = marketState();
    expect(catalog.items.find(({ id }) => id === 'timber')?.market).toEqual({ basePriceBerries: 5000, mode: 'buy_sell' });
    expect(markets.length).toBeGreaterThan(1);
    expect(markets.every(({ hasMarketHub }) => hasMarketHub)).toBe(true);
  });

  it('auto-places purchases in pockets then cargo and sells cargo across locations', () => {
    const { catalog, markets, state } = marketState();
    state.player.inventory.stacks = ['sealed_chart', 'mira_letter_of_passage'].map((itemId) => ({ itemId, quantity: 1, provenance: [{ locationId: null, quantity: 1 }] }));
    state.ship = { shipId: 'sloop', name: 'Test', health: 30, cargo: [] };
    expect(canBuyItem(state, catalog, 'timber')).toBe(true);
    buyItem(state, catalog, 'timber');
    expect(state.ship.cargo[0]).toMatchObject({ itemId: 'timber', quantity: 1 });
    expect(canSellItem(state, catalog, 'timber')).toBe(false);
    state.locationId = markets[1].id;
    expect(canSellItem(state, catalog, 'timber')).toBe(true);
    sellItem(state, catalog, 'timber');
    expect(state.ship.cargo).toEqual([]);
  });

  it('preserves same-location provenance in a mixed stack when selling', () => {
    const { catalog, markets, state } = marketState();
    state.player.inventory.stacks = [{ itemId: 'timber', quantity: 3, provenance: [
      { locationId: state.locationId, quantity: 2 }, { locationId: markets[1].id, quantity: 1 },
    ] }];
    expect(canSellItem(state, catalog, 'timber', 2)).toBe(false);
    sellItem(state, catalog, 'timber', 1);
    expect(state.player.inventory.stacks[0]).toEqual({ itemId: 'timber', quantity: 2, provenance: [{ locationId: state.locationId, quantity: 2 }] });
  });

  it('applies optional negotiation to the atomic item transaction', () => {
    const { catalog, state } = marketState();
    buyItem(state, catalog, 'timber', 1, 'success');
    expect(state.berries).toBe(96_000);
  });

  it('uses fixed ship prices with the same resale and negotiation rules', () => {
    const { catalog, state } = marketState();
    const full = catalog.locations.find(({ shipMarket }) => shipMarket === 'full')!;
    state.locationId = full.id;
    expect(shipBuyPrice(catalog, 'dinghy', 'success')).toBe(4000);
    buyShip(state, catalog, 'dinghy', 'Petit');
    expect(state.berries).toBe(95_000);
    expect(shipSellPrice(state, catalog, 'dinghy', 'success')).toBe(6000);
  });

  it('runs Arrival, Merchant, confirmation, Dice negotiation and Explore as slotless System Events', () => {
    const { catalog, state } = marketState();
    state.shipMarketArrivalPending = true;
    const before = { ageMonths: state.ageMonths, slotInMonth: state.slotInMonth, historyLength: state.history.length };
    let session = createSessionState(state, catalog);
    expect(session.systemEvent?.kind).toBe('system');
    session = dismissResolution(chooseInSession(session, catalog, 'market:merchant'), catalog);
    session = dismissResolution(chooseInSession(session, catalog, 'market:buy:list'), catalog);
    session = dismissResolution(chooseInSession(session, catalog, 'market:item:buy:timber'), catalog);
    const negotiated = chooseInSession(session, catalog, 'market:negotiate');
    expect(negotiated.lastResolution?.dice?.rawRoll).toBeGreaterThanOrEqual(1);
    session = dismissResolution(negotiated, catalog);
    expect(session.systemEvent?.id).toBe('system_market:merchant');
    session = dismissResolution(chooseInSession(session, catalog, 'market:explore'), catalog);
    expect(session.systemEvent).toBeNull();
    expect(session.gameState).toMatchObject({ ageMonths: before.ageMonths, slotInMonth: before.slotInMonth, shipMarketArrivalPending: false, currentEventId: event.id });
    expect(session.gameState?.history).toHaveLength(before.historyLength);
  });
});
