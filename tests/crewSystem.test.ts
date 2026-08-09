import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { evaluateCondition, getChoiceState } from '../src/game/engine/conditions';
import { applyEffects } from '../src/game/engine/effects';
import { createInitialGameState } from '../src/game/model/initialState';
import { createDefaultNpcState } from '../src/game/model/npcState';

const context = { sourceEventId: 'crew_fixture', sourceChoiceId: 'choice' };
const npc = (status: 'known' | 'crew' | 'unavailable' = 'known') => ({ ...createDefaultNpcState(), status });

describe('Crew System V1', () => {
  it('recruits with room, excludes the player from capacity, greys a full Choice, and rejects overflow at runtime', () => {
    const state = createInitialGameState();
    state.npcs.a = npc('crew'); state.npcs.b = npc('crew');
    const recruited = applyEffects(state, contentCatalog, [{ type: 'setNpcStatus', npcId: 'mira', status: 'crew' }], context);
    expect(evaluateCondition({ type: 'crewSizeAtLeast', value: 3 }, recruited, contentCatalog)).toBe(true);
    const choice = { id: 'recruit', textKey: 'x', availableIf: { type: 'canRecruitNpc', npcId: 'candidate' } as const, resolution: { type: 'deterministic' as const, outcome: { id: 'x', textKey: 'x', effects: [] } } };
    recruited.npcs.candidate = npc();
    expect(getChoiceState(choice, recruited, contentCatalog)).toEqual({ visible: true, available: false });
    expect(() => applyEffects(recruited, contentCatalog, [{ type: 'setNpcStatus', npcId: 'candidate', status: 'crew' }], context)).toThrow(/free crew capacity/);
  });

  it('keeps crew after ship loss and refuses a ship too small for the current NPC crew', () => {
    const state = createInitialGameState();
    state.npcs.mira.status = 'crew';
    const lost = applyEffects(state, contentCatalog, [{ type: 'loseShip', locationId: 'shipwreck_shore', travelState: 'on_land', allowWithoutLeadership: true }], context);
    expect(lost.npcs.mira.status).toBe('crew');
    for (const id of ['a', 'b', 'c']) lost.npcs[id] = npc('crew');
    expect(() => applyEffects(lost, contentCatalog, [{ type: 'acquireShip', shipId: 'sloop', name: 'Too Small' }], context)).toThrow(/cannot be acquired/);
  });

  it('uses one cargo slot per passenger without consuming crew capacity', () => {
    const state = createInitialGameState();
    state.npcs.guest = npc();
    const withPassenger = applyEffects(state, contentCatalog, [{ type: 'setNpcPassenger', npcId: 'guest', passenger: true }], context);
    expect(withPassenger.passengerNpcIds).toEqual(['guest']);
    expect(evaluateCondition({ type: 'hasCrew' }, withPassenger, contentCatalog)).toBe(false);
    expect(evaluateCondition({ type: 'shipCargoSpaceAtLeast', value: 1 }, withPassenger, contentCatalog)).toBe(true);
    const full = applyEffects(withPassenger, contentCatalog, [{ type: 'addCargoItem', itemId: 'sealed_chart', quantity: 1 }], context);
    expect(evaluateCondition({ type: 'shipCargoSpaceAtLeast', value: 1 }, full, contentCatalog)).toBe(false);
    full.npcs.second_guest = npc();
    expect(() => applyEffects(full, contentCatalog, [{ type: 'setNpcPassenger', npcId: 'second_guest', passenger: true }], context)).toThrow(/cargo slot/);
  });

  it('keeps relationship and loyalty independent', () => {
    const state = createInitialGameState();
    const related = applyEffects(state, contentCatalog, [{ type: 'modifyNpcRelationship', npcId: 'mira', amount: 20 }], context);
    expect(related.npcs.mira.relationship).toBe(20);
    expect(related.npcs.mira.stats.loyalty).toBe(25);
    const loyal = applyEffects(related, contentCatalog, [{ type: 'modifyNpcStat', npcId: 'mira', statId: 'loyalty', amount: -5 }], context);
    expect(loyal.npcs.mira).toMatchObject({ relationship: 20, stats: { loyalty: 20 } });
  });

  it('tests immutable authored roles and allows several crew NPCs with the same role', () => {
    const catalog = structuredClone(contentCatalog);
    catalog.npcs.push({ ...catalog.npcs[0], id: 'second_navigator', nameKey: 'npc.mira.name' });
    const state = createInitialGameState();
    state.npcs.mira.status = 'crew';
    state.npcs.second_navigator = npc('crew');
    expect(evaluateCondition({ type: 'hasCrewRole', roleId: 'navigator' }, state, catalog)).toBe(true);
    expect(catalog.npcs.filter(({ crewRoleId }) => crewRoleId === 'navigator')).toHaveLength(2);
  });

  it('does not let unavailable alter crew capacity without an explicit authored status change', () => {
    const state = createInitialGameState();
    state.npcs.a = npc('crew'); state.npcs.b = npc('crew');
    state.npcs.mira.status = 'unavailable';
    expect(evaluateCondition({ type: 'crewSizeAtLeast', value: 2 }, state, contentCatalog)).toBe(true);
    expect(evaluateCondition({ type: 'crewSizeAtLeast', value: 3 }, state, contentCatalog)).toBe(false);
    const captured = { ...state, npcs: { ...state.npcs, a: npc('crew') } };
    const explicitlyUnavailable = applyEffects(captured, contentCatalog, [{ type: 'setNpcStatus', npcId: 'a', status: 'unavailable' }], context);
    expect(evaluateCondition({ type: 'crewSizeAtLeast', value: 2 }, explicitlyUnavailable, contentCatalog)).toBe(false);
  });

  it('blocks non-Leader management while allowing narrative overrides and travel', () => {
    const state = createInitialGameState();
    state.isLeader = false;
    expect(evaluateCondition({ type: 'isLeader' }, state, contentCatalog)).toBe(false);
    expect(() => applyEffects(state, contentCatalog, [{ type: 'setNpcStatus', npcId: 'mira', status: 'crew' }], context)).toThrow(/leadership/);
    expect(() => applyEffects(state, contentCatalog, [{ type: 'addCargoItem', itemId: 'sealed_chart', quantity: 1 }], context)).toThrow(/leadership/);
    expect(() => applyEffects(state, contentCatalog, [{ type: 'acquireShip', shipId: 'merchant_ship', name: 'Commandeered', allowWithoutLeadership: true }], context)).toThrow(/cannot be acquired/);
    const marineTravel = applyEffects(state, contentCatalog, [{ type: 'moveToLocation', locationId: 'open_sea', travelState: 'at_sea' }], context);
    expect(marineTravel).toMatchObject({ isLeader: false, locationId: 'open_sea', travelState: 'at_sea', ship: { shipId: 'sloop' } });
    const orderedRecruitment = applyEffects(state, contentCatalog, [{ type: 'setNpcStatus', npcId: 'mira', status: 'crew', allowWithoutLeadership: true }], context);
    expect(orderedRecruitment.npcs.mira.status).toBe('crew');
    const transported = applyEffects({ ...state, ship: null }, contentCatalog, [{ type: 'acquireShip', shipId: 'sloop', name: 'Marine Transport', allowWithoutLeadership: true }], context);
    expect(transported).toMatchObject({ isLeader: false, ship: { name: 'Marine Transport' }, pendingShip: null });
  });
});
