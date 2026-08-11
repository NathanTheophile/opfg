import { describe, expect, it } from 'vitest';
import type { EventDefinition } from '../src/game/content/schema';
import { contentCatalog } from '../src/game/content/definitions';
import { materializeEventCast } from '../src/game/engine/npcNames';
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
});
