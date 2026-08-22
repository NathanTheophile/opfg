import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import type { Effect, StatId } from '../src/game/content/schema';
import { evaluateCondition } from '../src/game/engine/conditions';
import { applyEffects } from '../src/game/engine/effects';
import { selectNextEvent } from '../src/game/engine/events';
import { createInitialGameState } from '../src/game/model/initialState';

const context = { sourceEventId: 'origin_fixture', sourceChoiceId: 'choice' };
const attributes: StatId[] = ['morale', 'strength', 'agility', 'observation', 'intelligence', 'navigation', 'charisma', 'luck'];
const expectedRaces: Record<string, { health: number; modifiers: Partial<Record<StatId, number>> }> = {
  human: { health: 40, modifiers: { observation: 1, intelligence: 1, charisma: 1, luck: 1, morale: -2 } },
  fishman: { health: 50, modifiers: { strength: 4, agility: 1, observation: 2, intelligence: -2, navigation: 3, charisma: -3, luck: -2, morale: -3 } },
  mink: { health: 40, modifiers: { strength: -1, agility: 4, observation: 4, intelligence: -2, navigation: -3, charisma: 1, luck: -2, morale: -1 } },
  giant: { health: 60, modifiers: { strength: 6, agility: -6, observation: -2, intelligence: -2, navigation: -4, charisma: -1, luck: -2, morale: 5 } },
  longarm: { health: 45, modifiers: { strength: 2, agility: 4, observation: 3, intelligence: 1, navigation: -3, charisma: -2, luck: -2, morale: -3 } },
  buccaneer: { health: 55, modifiers: { strength: 4, agility: -3, observation: 1, intelligence: -1, navigation: -2, charisma: -1, luck: -2, morale: 4 } },
};

function apply(effect: Effect) {
  return applyEffects(createInitialGameState(), contentCatalog, [effect], context);
}

describe('Origins V1 rules', () => {
  it.each(Object.entries(expectedRaces).filter(([raceId]) => !['longarm', 'buccaneer'].includes(raceId)))('applies exact %s race health and modifiers', (raceId, expected) => {
    const state = apply({ type: 'setRace', raceId });
    expect(state.player.stats.health).toBe(expected.health);
    for (const statId of attributes) expect(state.player.stats[statId]).toBe(25 + (expected.modifiers[statId] ?? 0));
  });

  it.each(['longarm', 'buccaneer'])('keeps exact %s metadata but rejects the locked race during Origins', (raceId) => {
    const definition = contentCatalog.races.find(({ id }) => id === raceId)!;
    expect(definition).toMatchObject({ playableV1: false, initialHealth: expectedRaces[raceId].health, attributeModifiers: expectedRaces[raceId].modifiers });
    expect(() => apply({ type: 'setRace', raceId })).toThrow(/locked/);
  });

  it.each([
    ['two_parents', { morale: 2, charisma: 1, observation: -1, agility: -2 }],
    ['single_parent', { intelligence: 2, observation: 1, morale: -2, luck: -1 }],
    ['orphan', { observation: 3, agility: 2, morale: -4, charisma: -1 }],
  ] as const)('applies exact %s family modifiers', (familyStructureId, modifiers) => {
    const state = apply({ type: 'setFamilyStructure', familyStructureId });
    for (const statId of attributes) expect(state.player.stats[statId]).toBe(25 + (modifiers[statId as keyof typeof modifiers] ?? 0));
  });

  it.each([
    ['poor', { observation: 3, luck: -3 }],
    ['modest', {}],
    ['wealthy', { luck: 3, observation: -3 }],
  ] as const)('applies exact %s social modifiers', (socialClassId, modifiers) => {
    const state = apply({ type: 'setSocialClass', socialClassId });
    for (const statId of attributes) expect(state.player.stats[statId]).toBe(25 + (modifiers[statId as keyof typeof modifiers] ?? 0));
    expect(state.berries).toBe(0);
  });

  it('keeps affiliation, sea, and birthplace stat-neutral and enforces sea compatibility', () => {
    const initial = createInitialGameState();
    const afterContext = applyEffects(initial, contentCatalog, [
      { type: 'setAffiliation', affiliationId: 'marine' },
      { type: 'setOriginSea', seaId: 'west_blue' },
      { type: 'setBirthLocation', locationId: 'kano_happo_port' },
    ], context);
    expect(afterContext.player.stats).toEqual(initial.player.stats);
    expect(afterContext).toMatchObject({ locationId: 'kano_happo_port', player: { profile: { affiliationId: 'marine', originSeaId: 'west_blue' } } });
    expect(() => applyEffects(initial, contentCatalog, [{ type: 'setOriginSea', seaId: 'west_blue' }, { type: 'setBirthLocation', locationId: 'foosha_village' }], context)).toThrow(/incompatible/);
  });

  it('exposes new profile dimensions to Conditions', () => {
    const state = applyEffects(createInitialGameState(), contentCatalog, [
      { type: 'setFamilyStructure', familyStructureId: 'orphan' },
      { type: 'setSocialClass', socialClassId: 'poor' },
      { type: 'setOriginSea', seaId: 'north_blue' },
    ], context);
    expect(evaluateCondition({ type: 'familyStructureIs', familyStructureId: 'orphan' }, state)).toBe(true);
    expect(evaluateCondition({ type: 'socialClassIs', socialClassId: 'poor' }, state)).toBe(true);
  });

  it('does not apply race, family, or social modifiers twice', () => {
    for (const effect of [
      { type: 'setRace', raceId: 'human' },
      { type: 'setFamilyStructure', familyStructureId: 'orphan' },
      { type: 'setSocialClass', socialClassId: 'poor' },
    ] as Effect[]) {
      const once = applyEffects(createInitialGameState(), contentCatalog, [effect], context);
      expect(() => applyEffects(once, contentCatalog, [effect], context)).toThrow(/only be set once/);
    }
  });

  it('clamps player health to Race maximum and preserves the existing death Critical', () => {
    const human = apply({ type: 'setRace', raceId: 'human' });
    const healed = applyEffects(human, contentCatalog, [{ type: 'modifyHealth', amount: 50 }], context);
    expect(healed.player.stats.health).toBe(40);
    const depleted = applyEffects(healed, contentCatalog, [{ type: 'modifyHealth', amount: -100 }], context);
    expect(selectNextEvent(depleted, contentCatalog).currentEventId).toBe('critical_player_death');
  });
});
