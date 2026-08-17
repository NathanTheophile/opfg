import { describe, expect, it } from 'vitest';
import type { EventDefinition } from '../src/game/content/schema';
import { contentCatalog } from '../src/game/content/definitions';
import { ensureNpcMaterialized, materializeEventCast, npcInterpolationParams } from '../src/game/engine/npcNames';
import { dictionaries } from '../src/game/localization';
import { interpolate } from '../src/game/localization/interpolate';
import { createInitialGameState } from '../src/game/model/initialState';

const castEvent = {
  id: 'test_generated_cast',
  kind: 'normal',
  cast: ['player_parent_1', 'player_parent_2'],
  titleKey: 'test.title',
  textKey: 'test.text',
  choices: [],
} as EventDefinition;

describe('runtime NPC names', () => {
  it('assigns deterministic, unique names once for pooled cast NPCs', () => {
    const firstBase = createInitialGameState(0x12345678);
    firstBase.npcs = {};
    const first = materializeEventCast(firstBase, contentCatalog, castEvent);

    const secondBase = createInitialGameState(0x12345678);
    secondBase.npcs = {};
    const second = materializeEventCast(secondBase, contentCatalog, castEvent);

    expect(first.npcs.player_parent_1.displayName).toBeTruthy();
    expect(first.npcs.player_parent_2.displayName).toBeTruthy();
    expect(first.npcs.player_parent_1.displayName).not.toBe(first.npcs.player_parent_2.displayName);
    expect(second.npcs.player_parent_1.displayName).toBe(first.npcs.player_parent_1.displayName);
    expect(second.npcs.player_parent_2.displayName).toBe(first.npcs.player_parent_2.displayName);

    const rngAfterFirstMaterialization = first.rngState;
    const again = materializeEventCast(first, contentCatalog, castEvent);
    expect(again.npcs.player_parent_1.displayName).toBe(first.npcs.player_parent_1.displayName);
    expect(again.rngState).toBe(rngAfterFirstMaterialization);
  });

  it('assigns seeded names and Stats without authored Crew Roles', () => {
    const first = createInitialGameState(1);
    const second = createInitialGameState(1);
    const otherSeed = createInitialGameState(2);

    const firstName = ensureNpcMaterialized(first, contentCatalog, 'mira').displayName;
    const secondName = ensureNpcMaterialized(second, contentCatalog, 'mira').displayName;
    const otherName = ensureNpcMaterialized(otherSeed, contentCatalog, 'mira').displayName;

    expect(firstName).toBeTruthy();
    expect(firstName).toBe(secondName);
    expect(otherName).not.toBe(firstName);

    expect(contentCatalog.npcs.find(({ id }) => id === 'mira')).toMatchObject({ namePoolId: 'childhood_female' });
    expect(contentCatalog.npcs.find(({ id }) => id === 'rohan')).toMatchObject({ namePoolId: 'childhood_male' });
    expect(contentCatalog.npcs.find(({ id }) => id === 'ari')).toMatchObject({ namePoolId: 'childhood_female' });
    expect(contentCatalog.npcs.find(({ id }) => id === 'owen')).toMatchObject({ namePoolId: 'childhood_male' });
    expect(contentCatalog.npcs.some(({ crewRoleId }) => crewRoleId !== undefined && crewRoleId !== null)).toBe(false);
  });

  it('backfills one seeded name for existing null display names and never rerolls', () => {
    const state = createInitialGameState(3);
    expect(state.npcs.mira.displayName).toBeNull();

    const materialized = ensureNpcMaterialized(state, contentCatalog, 'mira');
    const name = materialized.displayName;
    const rngAfterBackfill = state.rngState;

    expect(name).toBeTruthy();
    expect(state.npcs.mira.displayName).toBe(name);

    const again = ensureNpcMaterialized(state, contentCatalog, 'mira');
    expect(again.displayName).toBe(name);
    expect(state.rngState).toBe(rngAfterBackfill);
  });

  it('keeps existing non-null display names unchanged while materializing Stats once', () => {
    const state = createInitialGameState(4);
    state.npcs.mira = { ...state.npcs.mira, displayName: 'Existing Name' };
    const rngBefore = state.rngState;

    expect(ensureNpcMaterialized(state, contentCatalog, 'mira').displayName).toBe('Existing Name');
    expect(state.npcs.mira.statsGenerated).toBe(true);
    expect(state.rngState).not.toBe(rngBefore);
    const rngAfter = state.rngState;

    expect(ensureNpcMaterialized(state, contentCatalog, 'mira').displayName).toBe('Existing Name');
    expect(state.rngState).toBe(rngAfter);
  });

  it('interpolates recruited NPC identities with their seeded display names', () => {
    const state = createInitialGameState(5);
    const name = ensureNpcMaterialized(state, contentCatalog, 'mira').displayName;
    const params = npcInterpolationParams(state, contentCatalog, (key) => dictionaries.en[key] ?? dictionaries.fr[key] ?? key);

    expect(interpolate('{{npc_mira}} joins the crew.', params)).toBe(`${name} joins the crew.`);
  });
});
