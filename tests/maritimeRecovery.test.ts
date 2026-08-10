import { describe, expect, it } from 'vitest';
import { createContentCatalog } from '../src/game/content/catalogFactory';
import type { DiceResolution, EventDefinition } from '../src/game/content/schema';
import { evaluateCondition } from '../src/game/engine/conditions';
import { evaluateDiceRoll } from '../src/game/engine/dice';
import { applyEffects } from '../src/game/engine/effects';
import { countFallbackStreak, findBestSwimmingRescuer, sameIslandPorts } from '../src/game/engine/maritime';
import { deserializeGameState, serializeGameState } from '../src/game/engine/save';
import { createInitialGameState } from '../src/game/model/initialState';
import { createDefaultNpcState } from '../src/game/model/npcState';

const catalog = createContentCatalog([]);
const context = { sourceEventId: 'wreck', sourceChoiceId: 'survive' };
const ship = { shipId: 'sloop', name: 'Test Sloop', health: 1, cargo: [{ itemId: 'sealed_chart', quantity: 2 }] };
const rescuerRoll: DiceResolution = {
  type: 'dice', statId: 'strength', actor: { type: 'bestCrew', statId: 'strength', requireNoDevilFruit: true }, successThreshold: 10,
  outcomes: Object.fromEntries(['criticalFailure', 'failure', 'success', 'criticalSuccess'].map((result) => [result, { id: result, textKey: result, effects: [] }])) as DiceResolution['outcomes'],
};

function crew(strength: number, fruitId: string | null = null) {
  return { ...createDefaultNpcState(), status: 'crew' as const, stats: { ...createDefaultNpcState().stats, strength }, powers: { ...createDefaultNpcState().powers, devilFruitId: fruitId } };
}

describe('Ship survival/recovery runtime', () => {
  it('persists and clears maritimeEmergency while wrecking only ship-owned state', () => {
    const state = createInitialGameState(7);
    state.locationId = 'foosha_village'; state.travelState = 'at_sea'; state.ship = ship;
    state.player.inventory.stacks = [{ itemId: 'mira_letter_of_passage', quantity: 1 }]; state.berries = 42;
    const wrecked = applyEffects(state, catalog, [{ type: 'beginMaritimeEmergency', cause: 'accident' }], context);
    expect(wrecked).toMatchObject({ ship: null, pendingShip: null, berries: 42, maritimeEmergency: { kind: 'shipwreck', seaId: 'east_blue', cause: 'accident' } });
    expect(wrecked.player.inventory.stacks).toEqual(state.player.inventory.stacks);
    expect(deserializeGameState(serializeGameState(wrecked))).toEqual(wrecked);
    const landed = applyEffects(wrecked, catalog, [{ type: 'resolveMaritimeEmergencyLandfall' }], context);
    expect(landed).toMatchObject({ maritimeEmergency: null, travelState: 'on_land' });
    expect(catalog.locations.find(({ id }) => id === landed.locationId)?.seaId).toBe('east_blue');
  });

  it('finds a same-island port deterministically and reports its absence', () => {
    const state = createInitialGameState(); state.locationId = 'foosha_village';
    expect(sameIslandPorts(state, catalog).length).toBeGreaterThan(0);
    const moved = applyEffects(state, catalog, [{ type: 'moveToSameIslandPort' }], context);
    expect(moved.locationId).toBe(sameIslandPorts(state, catalog)[0].id);
    state.locationId = 'open_sea';
    expect(evaluateCondition({ type: 'sameIslandPortExists' }, state, catalog)).toBe(false);
    expect(() => applyEffects(state, catalog, [{ type: 'moveToSameIslandPort' }], context)).toThrow('No same-island port');
  });

  it('derives a five-root fallback streak while ignoring Immediate/Critical history', () => {
    const events = [
      { id: 'dead_end_at_sea', kind: 'normal' }, { id: 'noise', kind: 'immediate' }, { id: 'critical', kind: 'critical' },
    ] as EventDefinition[];
    const state = createInitialGameState();
    state.history = ['dead_end_at_sea', 'noise', 'dead_end_at_sea', 'critical', 'dead_end_at_sea', 'dead_end_at_sea', 'dead_end_at_sea'].map((eventId) => ({ eventId, choiceId: 'x', outcomeId: 'x', ageMonths: 180 }));
    expect(countFallbackStreak(state, events)).toBe(5);
  });

  it('uses the strongest living non-Fruit Crew rescuer with a stable lexical tie-break', () => {
    const state = createInitialGameState(); state.player.powers.devilFruitId = 'yuki_yuki';
    state.npcs.zoe = crew(40); state.npcs.anna = crew(40); state.npcs.fruit = crew(50, 'yuki_yuki');
    expect(findBestSwimmingRescuer(state)).toBe('anna');
    expect(evaluateDiceRoll(rescuerRoll, state, 10).actorNpcId).toBe('anna');
    state.npcs.anna.powers.devilFruitId = 'yuki_yuki'; state.npcs.zoe.powers.devilFruitId = 'yuki_yuki';
    expect(() => evaluateDiceRoll(rescuerRoll, state, 10)).toThrow('No eligible Crew NPC');
  });

  it('targets the Dice rescuer for both fatal raw-1 and successful shared damage outcomes', () => {
    const state = createInitialGameState(); state.npcs.mira = crew(35);
    const rolled = evaluateDiceRoll(rescuerRoll, state, 1);
    const dead = applyEffects(state, catalog, [
      { type: 'modifyHealth', amount: -99 }, { type: 'modifyNpcStat', npcSelector: 'diceActor', statId: 'health', amount: -99 },
    ], { ...context, diceActorNpcId: rolled.actorNpcId });
    expect(dead.player.stats.health).toBeLessThanOrEqual(0); expect(dead.npcs.mira.stats.health).toBeLessThanOrEqual(0);
    const hurt = applyEffects(state, catalog, [
      { type: 'modifyHealth', amount: -2 }, { type: 'modifyNpcStat', npcSelector: 'diceActor', statId: 'health', amount: -3 },
    ], { ...context, diceActorNpcId: evaluateDiceRoll(rescuerRoll, state, 12).actorNpcId });
    expect(hurt.player.stats.health).toBe(state.player.stats.health - 2); expect(hurt.npcs.mira.stats.health).toBe(state.npcs.mira.stats.health - 3);
  });

  it('keeps Fishman swimming eligibility dependent on not having a Fruit', () => {
    const state = createInitialGameState(); state.player.profile.raceId = 'fishman';
    const canSwim = { type: 'all', conditions: [{ type: 'raceIs', raceId: 'fishman' }, { type: 'not', condition: { type: 'hasDevilFruit' } }] } as const;
    expect(evaluateCondition(canSwim, state, catalog)).toBe(true);
    state.player.powers.devilFruitId = 'yuki_yuki';
    expect(evaluateCondition(canSwim, state, catalog)).toBe(false);
  });

  it.each([['stranded', 'legacy'], ['lost_at_sea', 'death']] as const)('ends with %s and clears the emergency', (endingId, reason) => {
    const state = createInitialGameState(); state.maritimeEmergency = { kind: 'shipwreck', seaId: 'east_blue', cause: 'accident' };
    const ended = applyEffects(state, catalog, [{ type: 'endCareerWithEnding', endingId, reason }], context);
    expect(ended).toMatchObject({ careerStatus: 'ended', careerEndReason: reason, endingId, maritimeEmergency: null });
  });
});
