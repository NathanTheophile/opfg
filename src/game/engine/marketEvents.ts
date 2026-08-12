import type { ChoiceDefinition, ContentCatalog, DiceResult, Effect, EventDefinition, Outcome } from '../content/schema';
import type { GameState, ItemId, ShipId } from '../model/schema';
import { canBuyItem, canBuyShip, canSellItem, canSellShip, itemBuyPrice, itemSellPrice, shipBuyPrice, shipSellPrice } from './economy';

const ID = 'system_market';

const outcome = (id: string, effects: Effect[] = []): Outcome => ({ id, textKey: effects.length ? 'ui.market.transactionDone' : 'ui.market.continue', effects });
const deterministic = (id: string, textKey: string, effects: Effect[] = [], interpolation?: Record<string, string | number>): ChoiceDefinition => ({
  id, textKey, ...(interpolation ? { interpolation } : {}), resolution: { type: 'deterministic', outcome: outcome(`${id}_outcome`, effects) },
});

function shell(id: string, titleKey: string, textKey: string, choices: ChoiceDefinition[], interpolation?: Record<string, string | number>): EventDefinition {
  return { id, kind: 'system', titleKey, textKey, choices, ...(interpolation ? { interpolation } : {}) };
}

export function createArrivalMarketEvent(state: GameState, catalog: ContentCatalog): EventDefinition | null {
  const location = catalog.locations.find(({ id }) => id === state.locationId);
  if (!state.shipMarketArrivalPending || !location?.hasMarketHub) return null;
  const visitedFlag = `market_visited:${location.id}`;
  const visitEffect: Effect = { type: 'setFlag', flagId: visitedFlag };
  const choices: ChoiceDefinition[] = [];
  if (location.marketItemIds.length > 0) choices.push(deterministic('market:merchant', 'ui.marketHub.merchant', [visitEffect]));
  if (location.shipMarket !== 'none') choices.push(deterministic('market:port', 'ui.marketHub.port', [visitEffect]));
  choices.push(deterministic('market:explore', 'ui.marketHub.explore', [visitEffect]));
  return shell(`${ID}:arrival`, 'ui.marketHub.title', state.flags.includes(visitedFlag) ? 'ui.marketHub.returning' : 'ui.marketHub.arrival', choices);
}

function merchantEvent(): EventDefinition {
  return shell(`${ID}:merchant`, 'ui.marketHub.merchant', 'ui.market.merchantDescription', [
    deterministic('market:buy:list', 'ui.market.buy'), deterministic('market:sell:list', 'ui.market.sell'),
    deterministic('market:port', 'ui.marketHub.port'), deterministic('market:explore', 'ui.marketHub.explore'),
  ]);
}

function itemListEvent(state: GameState, catalog: ContentCatalog, operation: 'buy' | 'sell'): EventDefinition {
  const location = catalog.locations.find(({ id }) => id === state.locationId);
  const itemIds = operation === 'buy'
    ? (location?.marketItemIds ?? [])
    : catalog.items.filter(({ id }) => canSellItem(state, catalog, id)).map(({ id }) => id);
  const choices = itemIds.map((itemId) => deterministic(`market:item:${operation}:${itemId}`, catalog.items.find(({ id }) => id === itemId)!.nameKey));
  choices.push(deterministic('market:merchant', 'ui.marketHub.back'));
  return shell(`${ID}:${operation}`, operation === 'buy' ? 'ui.market.buy' : 'ui.market.sell', 'ui.market.chooseItem', choices);
}

function negotiationChoice(effectFor: (result: DiceResult) => Effect): ChoiceDefinition {
  const make = (result: DiceResult): Outcome => outcome(`market_negotiate_${result}`, [effectFor(result)]);
  return {
    id: 'market:negotiate', textKey: 'ui.market.negotiate',
    resolution: { type: 'dice', statId: 'charisma', successThreshold: 10, actor: { type: 'player' }, outcomes: {
      criticalFailure: make('criticalFailure'), failure: make('failure'), success: make('success'), criticalSuccess: make('criticalSuccess'),
    } },
  };
}

function itemConfirmation(state: GameState, catalog: ContentCatalog, operation: 'buy' | 'sell', itemId: ItemId): EventDefinition {
  const price = operation === 'buy' ? itemBuyPrice(catalog, itemId) : itemSellPrice(catalog, itemId, 1, state);
  const effectFor = (negotiation?: DiceResult): Effect => ({ type: operation === 'buy' ? 'buyItem' : 'sellItem', itemId, quantity: 1, ...(negotiation ? { negotiation } : {}) });
  const available = operation === 'buy' ? canBuyItem(state, catalog, itemId) : canSellItem(state, catalog, itemId);
  const normalCondition = { type: operation === 'buy' ? 'canBuyItem' : 'canSellItem', itemId, quantity: 1 } as const;
  const negotiationCondition = operation === 'buy'
    ? { type: 'all' as const, conditions: [normalCondition, { type: 'berriesAtLeast' as const, value: itemBuyPrice(catalog, itemId, 1, 'criticalFailure') }] }
    : normalCondition;
  return shell(`${ID}:confirm:item:${operation}:${itemId}`, catalog.items.find(({ id }) => id === itemId)!.nameKey, 'ui.market.confirmDescription', [
    { ...deterministic('market:accept', 'ui.market.acceptPrice', [effectFor()], { price }), availableIf: available ? undefined : normalCondition },
    { ...negotiationChoice((result) => effectFor(result)), availableIf: negotiationCondition },
    deterministic(`market:${operation}:list`, 'ui.market.back'),
  ], { price });
}

function portEvent(state: GameState, catalog: ContentCatalog): EventDefinition {
  const market = catalog.locations.find(({ id }) => id === state.locationId)?.shipMarket ?? 'none';
  const offered = catalog.ships.filter(({ id }) => market === 'full' || (market === 'small_craft' && ['dinghy', 'sloop'].includes(id)));
  const choices = offered.map(({ id, nameKey }) => deterministic(`market:ship:buy:${id}`, nameKey));
  if (state.ship && canSellShip(state, catalog)) choices.push(deterministic(`market:ship:sell:${state.ship.shipId}`, 'ui.market.sellShip'));
  choices.push(deterministic('market:merchant', 'ui.marketHub.merchant'), deterministic('market:explore', 'ui.marketHub.explore'));
  return shell(`${ID}:port`, 'ui.marketHub.port', 'ui.market.portDescription', choices);
}

function shipConfirmation(state: GameState, catalog: ContentCatalog, operation: 'buy' | 'sell', shipId: ShipId): EventDefinition {
  const price = operation === 'buy' ? shipBuyPrice(catalog, shipId) : shipSellPrice(state, catalog, shipId);
  const effectFor = (negotiation?: DiceResult): Effect => operation === 'buy'
    ? { type: 'buyShip', shipId, ...(negotiation ? { negotiation } : {}) }
    : { type: 'sellShip', ...(negotiation ? { negotiation } : {}) };
  const available = operation === 'buy' ? canBuyShip(state, catalog, shipId) : canSellShip(state, catalog);
  const normalCondition = operation === 'buy'
    ? { type: 'all' as const, conditions: [{ type: 'canAcquireShip' as const, shipId }, { type: 'berriesAtLeast' as const, value: price }] }
    : { type: 'canSellShip' as const };
  const negotiationCondition = operation === 'buy'
    ? { type: 'all' as const, conditions: [{ type: 'canAcquireShip' as const, shipId }, { type: 'berriesAtLeast' as const, value: shipBuyPrice(catalog, shipId, 'criticalFailure') }] }
    : normalCondition;
  return shell(`${ID}:confirm:ship:${operation}:${shipId}`, catalog.ships.find(({ id }) => id === shipId)!.nameKey, 'ui.market.confirmDescription', [
    { ...deterministic('market:accept', 'ui.market.acceptPrice', [effectFor()], { price }), availableIf: available ? undefined : normalCondition },
    { ...negotiationChoice((result) => effectFor(result)), availableIf: negotiationCondition },
    deterministic('market:port', 'ui.market.back'),
  ], { price });
}

export function nextMarketEvent(state: GameState, catalog: ContentCatalog, choiceId: string): EventDefinition | null {
  if (choiceId === 'market:explore') return null;
  if (choiceId === 'market:merchant' || choiceId === 'market:accept' || choiceId === 'market:negotiate') return merchantEvent();
  if (choiceId === 'market:port') return portEvent(state, catalog);
  if (choiceId === 'market:buy:list') return itemListEvent(state, catalog, 'buy');
  if (choiceId === 'market:sell:list') return itemListEvent(state, catalog, 'sell');
  const parts = choiceId.split(':');
  if (parts[1] === 'item') return itemConfirmation(state, catalog, parts[2] as 'buy' | 'sell', parts.slice(3).join(':'));
  if (parts[1] === 'ship') return shipConfirmation(state, catalog, parts[2] as 'buy' | 'sell', parts.slice(3).join(':'));
  throw new Error(`Unknown Market System Choice "${choiceId}".`);
}

export function marketReturnEvent(state: GameState, catalog: ContentCatalog, resolvedEventId: string, choiceId: string): EventDefinition | null {
  if (choiceId === 'market:explore') return null;
  if (choiceId === 'market:accept' || choiceId === 'market:negotiate') return resolvedEventId.includes(':confirm:ship:') ? portEvent(state, catalog) : merchantEvent();
  return nextMarketEvent(state, catalog, choiceId);
}
