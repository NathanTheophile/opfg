import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { evaluateCondition, getChoiceState } from '../src/game/engine/conditions';
import { applyEffects } from '../src/game/engine/effects';
import { selectNextEvent } from '../src/game/engine/events';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';
import { createDefaultNpcState } from '../src/game/model/npcState';
import { assertValidSimulationState } from '../src/game/simulation/stateDiagnostics';

const context = { sourceEventId: 'fixture', sourceChoiceId: 'choice' };
const withShip = () => {
  const state = createInitialGameState();
  state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
  return state;
};

describe('Ship System V1', () => {
  it('acquires a first named ship at max or authored damaged health and modifies HP within definition bounds', () => {
    const withoutShip = { ...createInitialGameState(), locationId: 'loguetown', ship: null };
    const acquired = applyEffects(withoutShip, contentCatalog, [{ type: 'acquireShip', shipId: 'merchant_ship', name: 'Golden Gull' }], context);
    expect(acquired.ship).toMatchObject({ shipId: 'merchant_ship', name: 'Golden Gull', health: 42, cargo: [] });

    const damaged = applyEffects(withoutShip, contentCatalog, [{ type: 'acquireShip', shipId: 'sloop', name: 'Old Gull', health: 12 }], context);
    expect(damaged.ship?.health).toBe(12);
    expect(applyEffects(damaged, contentCatalog, [{ type: 'modifyShipHealth', amount: 100 }], context).ship?.health).toBe(30);
    expect(applyEffects(damaged, contentCatalog, [{ type: 'modifyShipHealth', amount: -20 }], context).ship?.health).toBe(0);
  });

  it('keeps personal stacks separate from cargo and enforces slots and quantities', () => {
    const state = withShip();
    const stacked = applyEffects(state, contentCatalog, [
      { type: 'addItem', itemId: 'timber', quantity: 2 },
      { type: 'addItem', itemId: 'timber', quantity: 3 },
      { type: 'addCargoItem', itemId: 'timber', quantity: 4 },
      { type: 'modifyBerries', amount: 10 },
    ], context);
    expect(stacked.player.inventory.stacks).toEqual([
      { itemId: 'timber', quantity: 2, provenance: [{ locationId: 'foosha_village', quantity: 2 }] },
      { itemId: 'timber', quantity: 3, provenance: [{ locationId: 'foosha_village', quantity: 3 }] },
    ]);
    expect(stacked.ship?.cargo).toEqual([{ itemId: 'timber', quantity: 4, provenance: [{ locationId: null, quantity: 4 }] }]);
    expect(stacked.berries).toBe(10);
    expect(state.player.inventory.stacks).toEqual([]);
    expect(() => applyEffects(stacked, contentCatalog, [{ type: 'removeItem', itemId: 'timber', quantity: 10 }], context)).toThrow(/Not enough/);
  });

  it('blocks acquisition when the authored ship cannot accommodate current NPC crew', () => {
    const state = withShip();
    for (const id of ['a', 'b', 'c', 'd']) state.npcs[id] = { ...createDefaultNpcState(), status: 'crew' };
    expect(evaluateCondition({ type: 'canAcquireShip', shipId: 'sloop' }, state, contentCatalog)).toBe(false);
    const choice = { id: 'acquire', textKey: 'x', availableIf: { type: 'canAcquireShip', shipId: 'sloop' } as const, resolution: { type: 'deterministic' as const, outcome: { id: 'x', textKey: 'x', effects: [] } } };
    expect(getChoiceState(choice, state, contentCatalog)).toEqual({ visible: true, available: false });
    expect(() => applyEffects(state, contentCatalog, [{ type: 'acquireShip', shipId: 'sloop', name: 'Too Small' }], context)).toThrow(/cannot be acquired/);
  });

  it('queues replacement, transfers cargo, and resolves abandon or location-gated sale through the Critical pipeline', () => {
    const state = withShip();
    state.locationId = 'loguetown';
    state.ship!.cargo = [{ itemId: 'timber', quantity: 2, provenance: [{ locationId: 'foosha_village', quantity: 2 }] }];
    const pending = applyEffects(state, contentCatalog, [{ type: 'acquireShip', shipId: 'merchant_ship', name: 'New Dawn' }], context);
    expect(pending.ship?.shipId).toBe('sloop');
    expect(pending.pendingShip?.shipId).toBe('merchant_ship');
    expect(selectNextEvent(pending, contentCatalog).currentEventId).toBe('critical_ship_replacement');

    const atPort = selectNextEvent(pending, contentCatalog);
    const sold = resolveChoice(atPort, contentCatalog, 'critical_ship_replacement', 'sell_old_ship').state;
    expect(sold).toMatchObject({ pendingShip: null, berries: 25, ship: { shipId: 'merchant_ship', name: 'New Dawn' } });
    expect(sold.ship?.cargo).toEqual([{ itemId: 'timber', quantity: 2, provenance: [{ locationId: 'foosha_village', quantity: 2 }] }]);

    const atSea = { ...pending, locationId: 'open_sea', travelState: 'at_sea' as const };
    const selected = selectNextEvent(atSea, contentCatalog);
    const event = contentCatalog.events.find(({ id }) => id === selected.currentEventId)!;
    expect(getChoiceState(event.choices.find(({ id }) => id === 'sell_old_ship')!, selected, contentCatalog).available).toBe(false);
    const abandoned = resolveChoice(selected, contentCatalog, 'critical_ship_replacement', 'abandon_old_ship').state;
    expect(abandoned).toMatchObject({ pendingShip: null, berries: 0, ship: { shipId: 'merchant_ship' } });
  });

  it('resolves destruction and shipless-at-sea states before any slot-consuming event while preserving crew', () => {
    const destroyed = withShip();
    destroyed.careerPhase = 'active';
    destroyed.ageMonths = 180;
    destroyed.ship!.health = 0;
    destroyed.npcs.mira.status = 'crew';
    let selected = selectNextEvent(destroyed, contentCatalog);
    expect(selected.currentEventId).toBe('critical_ship_destroyed');
    selected = resolveChoice(selected, contentCatalog, 'critical_ship_destroyed', 'reach_shore').state;
    expect(selected).toMatchObject({ ship: null, travelState: 'on_land', ageMonths: 180, slotInMonth: 0 });
    expect(selected.npcs.mira.status).toBe('crew');

    const adrift = { ...createInitialGameState(), ship: null, travelState: 'at_sea' as const, locationId: 'open_sea' };
    expect(selectNextEvent(adrift, contentCatalog).currentEventId).toBe('critical_ship_missing_at_sea');
  });

  it('does not turn a voluntary sale or a wreck into a free legacy replacement', () => {
    const state = withShip(); state.locationId = 'loguetown';
    const sold = applyEffects(state, contentCatalog, [{ type: 'loseShip', locationId: 'loguetown', travelState: 'on_land' }], context);
    expect(sold).toMatchObject({ ship: null, pendingShip: null });
    expect(selectNextEvent(sold, contentCatalog).currentEventId).not.toBe('critical_ship_replacement');
    const wrecked = applyEffects({ ...state, locationId: 'foosha_village', travelState: 'at_sea' }, contentCatalog, [{ type: 'beginMaritimeEmergency', cause: 'accident' }], context);
    expect(wrecked).toMatchObject({ ship: null, pendingShip: null, maritimeEmergency: { cause: 'accident' } });
    expect(selectNextEvent(wrecked, contentCatalog).currentEventId).not.toBe('critical_ship_replacement');
  });

  it('guards ship damage when no ship exists after the Content Reset', () => {
    const state = createInitialGameState();
    expect(evaluateCondition({ type: 'hasShip' }, state, contentCatalog)).toBe(false);
    expect(() => applyEffects(state, contentCatalog, [{ type: 'modifyShipHealth', amount: -1 }], context)).toThrow(/ship/i);
  });

  it('reports invalid simulation state for HP, slots, quantities, and ShipId', () => {
    const state = withShip();
    state.ship!.health = 31;
    expect(() => assertValidSimulationState(state, contentCatalog)).toThrow(/health/);
    state.ship!.health = 30;
    state.ship!.cargo = [{ itemId: 'sealed_chart', quantity: 0, provenance: [] }];
    expect(() => assertValidSimulationState(state, contentCatalog)).toThrow(/invalid stacks/);
    state.ship!.cargo = [];
    state.ship!.shipId = 'missing_ship';
    expect(() => assertValidSimulationState(state, contentCatalog)).toThrow(/Unknown ShipId/);
  });
});
