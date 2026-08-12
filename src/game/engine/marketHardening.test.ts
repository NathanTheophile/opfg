import { describe, expect, it } from 'vitest';
import { createContentCatalog } from '../content/catalogFactory';
import type { EventDefinition } from '../content/schema';
import { createInitialGameState } from '../model/initialState';
import { createSessionState, exploreFromMarketHub, openMarketHubView, returnToMarketHub } from '../session/gameSession';
import { buyItem, buyShip, canBuyItem, canSellItem, rollMarketNegotiation, sellItem, shipBuyPrice, shipSellPrice } from './economy';

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

  it('rolls a real Charisma d20 negotiation without consuming time', () => {
    const { catalog, state } = marketState();
    const before = { rngState: state.rngState, ageMonths: state.ageMonths, slotInMonth: state.slotInMonth };
    const roll = rollMarketNegotiation(state, catalog);
    expect(roll.rawRoll).toBeGreaterThanOrEqual(1);
    expect(roll.rawRoll).toBeLessThanOrEqual(20);
    expect(['criticalFailure', 'failure', 'success', 'criticalSuccess']).toContain(roll.result);
    expect(state.rngState).not.toBe(before.rngState);
    expect(state).toMatchObject({ ageMonths: before.ageMonths, slotInMonth: before.slotInMonth });
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

  it('loops Merchant/Port without consuming a slot and Explore resumes selection', () => {
    const { catalog, state } = marketState();
    state.shipMarketArrivalPending = true;
    const before = { ageMonths: state.ageMonths, slotInMonth: state.slotInMonth };
    let session = createSessionState(state);
    session = openMarketHubView(session, catalog, 'merchant');
    session = returnToMarketHub(session, catalog);
    session = exploreFromMarketHub(session, catalog);
    expect(session.marketHubView).toBeNull();
    expect(session.gameState).toMatchObject({ ...before, shipMarketArrivalPending: false, currentEventId: event.id });
  });
});
