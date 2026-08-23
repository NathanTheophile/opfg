import { describe, expect, it } from 'vitest';
import type { EventDefinition } from '../src/game/content/schema';
import { createContentCatalog } from '../src/game/content/catalogFactory';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';
import { createDefaultNpcState } from '../src/game/model/npcState';

const makeEvent = (cast?: string[]): EventDefinition => ({
  id: 'cast_fixture', kind: 'normal', cast, titleKey: 'x', textKey: 'x',
  choices: [{ id: 'go', textKey: 'x', resolution: { type: 'deterministic', outcome: { id: 'done', textKey: 'x', effects: [] } } }],
});

function resolve(cast?: string[]) {
  const event = makeEvent(cast);
  const catalog = createContentCatalog([event]);
  const state = createInitialGameState(1);
  state.ageMonths = 42;
  state.currentEventId = event.id;
  state.npcs.mira.lastInteractionAgeMonths = 3;
  state.npcs.player_parent_1 = createDefaultNpcState();
  return { before: state, after: resolveChoice(state, catalog, event.id, 'go').state };
}

describe('Event cast interaction metadata', () => {
  it('updates one cast NPC without changing relationship or status', () => {
    const { before, after } = resolve(['mira']);
    expect(after.npcs.mira).toMatchObject({ lastInteractionAgeMonths: 42, relationship: before.npcs.mira.relationship, status: before.npcs.mira.status });
  });

  it('updates multiple existing cast NPCs', () => {
    const { after } = resolve(['mira', 'player_parent_1']);
    expect(after.npcs.mira.lastInteractionAgeMonths).toBe(42);
    expect(after.npcs.player_parent_1.lastInteractionAgeMonths).toBe(42);
  });

  it('does nothing without cast and never creates absent NPC state', () => {
    const { before, after } = resolve();
    expect(after.npcs.mira.lastInteractionAgeMonths).toBe(before.npcs.mira.lastInteractionAgeMonths);
    expect(after.npcs).not.toHaveProperty('player_parent_2');
  });
});
