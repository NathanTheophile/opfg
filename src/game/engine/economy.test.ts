import { describe, expect, it } from 'vitest';
import { createContentCatalog } from '../content/catalogFactory';
import { createInitialGameState } from '../model/initialState';
import { buyItem, canBuyItem, itemSellPrice, sellItem } from './economy';

describe('V2 item economy', () => {
  it('buys and resells a market item atomically', () => {
    const catalog = createContentCatalog([]);
    const state = createInitialGameState(1);
    state.locationId = catalog.locations.find((location) => location.services.includes('trade'))!.id;
    state.berries = 10000;
    expect(canBuyItem(state, catalog, 'timber', 1)).toBe(true);
    buyItem(state, catalog, 'timber', 1);
    expect(state.berries).toBe(5000);
    expect(state.player.inventory.stacks).toEqual([{ itemId: 'timber', quantity: 1, provenance: [{ locationId: state.locationId, quantity: 1 }] }]);
    expect(itemSellPrice(catalog, 'timber', 1)).toBe(5000);
    state.locationId = catalog.locations.find((location) => location.id !== state.locationId && location.marketItemIds.includes('timber'))!.id;
    sellItem(state, catalog, 'timber', 1);
    expect(state.berries).toBe(10000);
    expect(state.player.inventory.stacks).toEqual([]);
  });
});
