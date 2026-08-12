import { describe, expect, it } from 'vitest';
import type { ContentCatalog } from '../src/game/content/schema';
import { contentCatalog } from '../src/game/content/definitions';
import { evaluateCondition } from '../src/game/engine/conditions';
import {
  getPresentOriginParentNpcIds,
  getSingleParentSex,
  isOriginParentPresent,
} from '../src/game/engine/family';
import { ensureNpcMaterialized, npcInterpolationParams } from '../src/game/engine/npcNames';
import { dictionaries } from '../src/game/localization';
import { extractSelectors, interpolate } from '../src/game/localization/interpolate';
import { createInitialGameState } from '../src/game/model/initialState';
import { validateContent } from '../src/game/validation/validateContent';

function catalogWithMarineSingleParentSex(sex: 'male' | 'female'): ContentCatalog {
  const catalog = structuredClone(contentCatalog);
  const marine = catalog.affiliations.find(({ id }) => id === 'marine');
  if (!marine) throw new Error('Missing marine affiliation fixture.');
  marine.singleParentSex = sex;
  return catalog;
}

describe('D2.7 NPC sex and Family Saga identity', () => {
  it('defines canonical father/mother identities with sex-safe name pools', () => {
    const father = contentCatalog.npcs.find(({ familyRole }) => familyRole === 'father');
    const mother = contentCatalog.npcs.find(({ familyRole }) => familyRole === 'mother');

    expect(father).toMatchObject({
      id: 'player_parent_1',
      sex: 'male',
      familyRole: 'father',
      namePoolId: 'childhood_male',
    });
    expect(mother).toMatchObject({
      id: 'player_parent_2',
      sex: 'female',
      familyRole: 'mother',
      namePoolId: 'childhood_female',
    });
    expect(contentCatalog.npcs.every(({ sex }) => sex === 'male' || sex === 'female')).toBe(true);
  });

  it('resolves parent presence from Family Structure + affiliation without cartesian Conditions', () => {
    const state = createInitialGameState();
    state.player.profile.affiliationId = 'marine';
    const catalog = catalogWithMarineSingleParentSex('male');

    state.player.profile.familyStructureId = 'single_parent';
    expect(getSingleParentSex(state, catalog)).toBe('male');
    expect(isOriginParentPresent(state, catalog, 'father')).toBe(true);
    expect(isOriginParentPresent(state, catalog, 'mother')).toBe(false);
    expect(getPresentOriginParentNpcIds(state, catalog)).toEqual(['player_parent_1']);
    expect(evaluateCondition({ type: 'singleParentSexIs', sex: 'male' }, state, catalog)).toBe(true);
    expect(evaluateCondition({ type: 'originParentPresent', role: 'father' }, state, catalog)).toBe(true);
    expect(evaluateCondition({ type: 'originParentPresent', role: 'mother' }, state, catalog)).toBe(false);

    state.player.profile.familyStructureId = 'two_parents';
    expect(getPresentOriginParentNpcIds(state, catalog)).toEqual(['player_parent_1', 'player_parent_2']);

    state.player.profile.familyStructureId = 'orphan';
    expect(getPresentOriginParentNpcIds(state, catalog)).toEqual([]);
  });

  it('lets current NPC status override structural parent presence after materialization', () => {
    const state = createInitialGameState();
    state.player.profile.affiliationId = 'marine';
    state.player.profile.familyStructureId = 'single_parent';
    state.player.profile.raceId = 'fishman';
    const catalog = catalogWithMarineSingleParentSex('male');

    const father = ensureNpcMaterialized(state, catalog, 'player_parent_1');
    expect(father.raceId).toBe('fishman');
    expect(isOriginParentPresent(state, catalog, 'father')).toBe(true);

    father.status = 'departed';
    expect(isOriginParentPresent(state, catalog, 'father')).toBe(false);
    father.status = 'unavailable';
    expect(isOriginParentPresent(state, catalog, 'father')).toBe(false);
    father.status = 'dead';
    expect(isOriginParentPresent(state, catalog, 'father')).toBe(false);
  });

  it('evaluates NPC sex from content identity without materializing the NPC', () => {
    const state = createInitialGameState();
    expect(state.npcs.player_parent_1).toBeUndefined();
    expect(evaluateCondition({ type: 'npcSexIs', npcId: 'player_parent_1', sex: 'male' }, state, contentCatalog)).toBe(true);
    expect(evaluateCondition({ type: 'npcSexIs', npcId: 'player_parent_1', sex: 'female' }, state, contentCatalog)).toBe(false);
  });

  it('provides localized pronouns, family roles and locale-local agreement selectors', () => {
    const fr = npcInterpolationParams(null, contentCatalog, (key) => dictionaries.fr[key] ?? key);

    expect(fr.npc_player_parent_1_subject).toBe('il');
    expect(fr.npc_player_parent_2_subject).toBe('elle');
    expect(fr.npc_player_parent_1_role).toBe('père');
    expect(fr.npc_player_parent_2_role).toBe('mère');

    const fatherText = "{{npc_player_parent_1_subject_cap}} est {{select:npc_player_parent_1_sex|male:revenu|female:revenue}} avant l'aube.";
    const motherText = "{{npc_player_parent_2_subject_cap}} est {{select:npc_player_parent_2_sex|male:revenu|female:revenue}} avant l'aube.";

    expect(interpolate(fatherText, fr)).toBe("Il est revenu avant l'aube.");
    expect(interpolate(motherText, fr)).toBe("Elle est revenue avant l'aube.");
    expect(extractSelectors(fatherText)).toEqual(['npc_player_parent_1_sex']);

    const en = npcInterpolationParams(null, contentCatalog, (key) => dictionaries.en[key] ?? dictionaries.fr[key] ?? key);
    expect(en.npc_player_parent_1_subject).toBe('he');
    expect(en.npc_player_parent_2_reflexive).toBe('herself');
  });

  it('rejects invalid NPC sex, family role/name-pool mismatch and single-parent sex', () => {
    const broken = structuredClone(contentCatalog) as unknown as Record<string, any>;
    broken.npcs[0].sex = 'unknown';
    const father = broken.npcs.find((npc: Record<string, any>) => npc.familyRole === 'father');
    father.sex = 'female';
    broken.affiliations[0].singleParentSex = 'random';

    const messages = validateContent(broken).map(({ message }) => message);
    expect(messages).toEqual(expect.arrayContaining([
      expect.stringContaining('NPC sex must be male or female'),
      expect.stringContaining('Canonical father must have sex male'),
      expect.stringContaining('*_male name pool requires NPC sex male'),
      expect.stringContaining('singleParentSex must be male, female, or null'),
    ]));
  });
});
