import { describe, expect, it } from 'vitest';
import { createContentCatalog } from '../src/game/content/catalogFactory';
import { evaluateCondition } from '../src/game/engine/conditions';
import { applyEffects } from '../src/game/engine/effects';
import { deserializeGameState, serializeGameState } from '../src/game/engine/save';
import { createInitialGameState } from '../src/game/model/initialState';

const catalog = createContentCatalog([]);
const context = { sourceEventId: 'powers_test', sourceChoiceId: 'choice' };
const apply = (state: ReturnType<typeof createInitialGameState>, effects: Parameters<typeof applyEffects>[2]) => applyEffects(state, catalog, effects, context);

describe('Powers V1', () => {
  it('starts without a Fruit or hidden Haki roll', () => {
    const state = createInitialGameState(123);
    expect(state.player.powers).toEqual({ devilFruitId: null, devilFruitAwakening: 0, haki: { observation: 0, armament: 0, conqueror: 0 } });
    expect(createInitialGameState(123).player.powers).toEqual(state.player.powers);
  });

  it('keeps the physical Fruit as an Item until explicit protected consumption', () => {
    const empty = createInitialGameState();
    expect(() => apply(empty, [{ type: 'consumeDevilFruit', fruitId: 'yuki_yuki' }])).toThrow('cannot be consumed');
    const carrying = apply(empty, [{ type: 'addItem', itemId: 'yuki_yuki_fruit_item', quantity: 2 }]);
    expect(carrying.player.powers.devilFruitId).toBeNull();
    expect(evaluateCondition({ type: 'canConsumeDevilFruit', fruitId: 'yuki_yuki' }, carrying, catalog)).toBe(true);
    const consumed = apply(carrying, [{ type: 'consumeDevilFruit', fruitId: 'yuki_yuki' }]);
    expect(consumed.player.inventory.stacks).toEqual([{ itemId: 'yuki_yuki_fruit_item', quantity: 1, provenance: [{ locationId: 'foosha_village', quantity: 1 }] }]);
    expect(consumed.player.powers.devilFruitId).toBe('yuki_yuki');
    expect(consumed.player.powers.devilFruitAwakening).toBe(0);
    expect(() => apply(consumed, [{ type: 'consumeDevilFruit', fruitId: 'tori_tori_falcon' }])).toThrow('cannot be consumed');
    expect(evaluateCondition({ type: 'devilFruitTypeIs', fruitType: 'logia' }, consumed, catalog)).toBe(true);
    expect(evaluateCondition({ type: 'hasDevilFruit' }, consumed, catalog)).toBe(true);
    expect(evaluateCondition({ type: 'devilFruitIs', fruitId: 'yuki_yuki' }, consumed, catalog)).toBe(true);
    expect(evaluateCondition({ type: 'devilFruitHasTag', tagId: 'cold' }, consumed, catalog)).toBe(true);
  });

  it('increases Fruit Awakening monotonically and clamps it to 10', () => {
    let state = createInitialGameState();
    state = apply(state, [{ type: 'addItem', itemId: 'yuki_yuki_fruit_item', quantity: 1 }, { type: 'consumeDevilFruit', fruitId: 'yuki_yuki' }]);
    state = apply(state, [{ type: 'increaseDevilFruitAwakening', amount: 20 }]);
    expect(state.player.powers.devilFruitAwakening).toBe(10);
    expect(evaluateCondition({ type: 'devilFruitIsAwakened' }, state, catalog)).toBe(true);
    expect(() => apply(state, [{ type: 'increaseDevilFruitAwakening', amount: -1 }])).toThrow('positive integer');
  });

  it.each([
    ['observation', 'observation', 'intelligence'],
    ['armament', 'strength', 'agility'],
  ] as const)('%s Haki requires 75 to awaken, then source Stats alone never auto-promote or regress it', (hakiType, first, second) => {
    let state = createInitialGameState();
    state.player.stats[first] = 49; state.player.stats[second] = 25;
    expect(() => apply(state, [{ type: 'awakenHaki', hakiType }])).toThrow('requires a source total of 75');
    state.player.stats[first] = 50;
    state = apply(state, [{ type: 'awakenHaki', hakiType }]);
    expect(state.player.powers.haki[hakiType]).toBe(1);
    state = apply(state, [{ type: 'modifyStat', statId: second, amount: 20 }]);
    expect(state.player.powers.haki[hakiType]).toBe(1);
    state = apply(state, [{ type: 'modifyStat', statId: second, amount: -20 }]);
    expect(state.player.powers.haki[hakiType]).toBe(1);
  });

  it.each([80, 85, 90, 95])('keeps Observation Haki at its authored level when source total reaches %i', (total) => {
    let state = createInitialGameState();
    state.player.stats.observation = 50;
    state.player.stats.intelligence = 25;
    state = apply(state, [{ type: 'awakenHaki', hakiType: 'observation' }]);
    state.player.stats.intelligence = total - 50;
    state = apply(state, []);
    expect(state.player.powers.haki.observation).toBe(1);
  });

  it('never awakens from stats alone and keeps Conqueror progression event-driven', () => {
    let state = createInitialGameState();
    state.player.stats.observation = 50; state.player.stats.intelligence = 50;
    state = apply(state, []);
    expect(state.player.powers.haki.observation).toBe(0);
    state = apply(state, [{ type: 'raiseConquerorHakiTo', level: 4 }]);
    expect(state.player.powers.haki.conqueror).toBe(4);
    expect(() => apply(state, [{ type: 'raiseConquerorHakiTo', level: 3 }])).toThrow('monotonically');
  });

  it('persists Player and NPC Powers and rejects pre-reset Save v12', () => {
    const state = createInitialGameState();
    state.player.powers.haki.conqueror = 2;
    state.npcs.mira.powers.devilFruitId = 'tori_tori_falcon';
    expect(deserializeGameState(serializeGameState(state))).toEqual(state);
    const legacy = structuredClone(state) as unknown as Record<string, unknown>;
    legacy.version = 12;
    const player = legacy.player as Record<string, unknown>; delete player.powers;
    const stats = player.stats as Record<string, unknown>; stats.awakening = null;
    for (const npc of Object.values(legacy.npcs as Record<string, Record<string, unknown>>)) delete npc.powers;
    const restored = deserializeGameState(JSON.stringify(legacy));
    expect(restored).toBeNull();
  });

  it('keeps NPC Fruit assignment monotone and rejects replacing a different Fruit', () => {
    let state = createInitialGameState();
    state = apply(state, [{ type: 'setNpcDevilFruit', npcId: 'mira', fruitId: 'yuki_yuki' }]);
    expect(evaluateCondition({ type: 'npcHasDevilFruit', npcId: 'mira' }, state, catalog)).toBe(true);
    state = apply(state, [{ type: 'increaseNpcDevilFruitAwakening', npcId: 'mira', amount: 7 }]);
    const repeated = apply(state, [{ type: 'setNpcDevilFruit', npcId: 'mira', fruitId: 'yuki_yuki' }]);
    expect(repeated.npcs.mira.powers).toMatchObject({ devilFruitId: 'yuki_yuki', devilFruitAwakening: 7 });
    expect(() => apply(repeated, [{ type: 'setNpcDevilFruit', npcId: 'mira', fruitId: 'tori_tori_falcon' }])).toThrow('already has a Devil Fruit');
  });

  it('requires an NPC Fruit before evaluating its Awakening threshold', () => {
    const state = createInitialGameState();
    expect(evaluateCondition({ type: 'npcDevilFruitAwakeningAtLeast', npcId: 'mira', value: 0 }, state, catalog)).toBe(false);
    state.npcs.mira.powers.devilFruitId = 'yuki_yuki';
    expect(evaluateCondition({ type: 'npcDevilFruitAwakeningAtLeast', npcId: 'mira', value: 0 }, state, catalog)).toBe(true);
  });
});
