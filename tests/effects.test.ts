import { describe, expect, it } from 'vitest';
import type { Effect } from '../src/game/content/schema';
import { applyEffects } from '../src/game/engine/effects';
import { createInitialGameState } from '../src/game/model/initialState';

const context = { sourceEventId: 'source_event', sourceChoiceId: 'source_choice' };

describe('applyEffects', () => {
  it('keeps flags and items unique and tolerates absent removals', () => {
    const original = createInitialGameState();
    const effects: Effect[] = [
      { type: 'setFlag', flagId: 'ready' },
      { type: 'setFlag', flagId: 'ready' },
      { type: 'clearFlag', flagId: 'missing' },
      { type: 'addItem', itemId: 'chart' },
      { type: 'addItem', itemId: 'chart' },
      { type: 'removeItem', itemId: 'missing' },
    ];

    const result = applyEffects(original, effects, context);

    expect(result.flags).toEqual(['ready']);
    expect(result.items).toEqual(['chart']);
    expect(original.flags).toEqual([]);
    expect(original.items).toEqual([]);
  });

  it('clamps ship condition and NPC relationship', () => {
    const state = createInitialGameState();
    const damaged = applyEffects(state, [{ type: 'modifyShipCondition', amount: -10 }], context);
    const repaired = applyEffects(damaged, [{ type: 'modifyShipCondition', amount: 10 }], context);
    const related = applyEffects(
      state,
      [{ type: 'modifyNpcRelationship', npcId: 'new_npc', amount: 150 }],
      context,
    );

    expect(damaged.ship.condition).toBe(0);
    expect(repaired.ship.condition).toBe(3);
    expect(related.npcs.new_npc).toEqual({ status: 'known', relationship: 100 });
    expect(state.npcs).toEqual({ mira: { status: 'unavailable', relationship: 0 } });
  });

  it('initializes an absent NPC deterministically when setting status', () => {
    const result = applyEffects(
      createInitialGameState(),
      [{ type: 'setNpcStatus', npcId: 'mira', status: 'crew' }],
      context,
    );

    expect(result.npcs.mira).toEqual({ status: 'crew', relationship: 0 });
  });

  it('schedules an event with due month and causal source IDs', () => {
    const state = createInitialGameState();
    state.month = 4;

    const result = applyEffects(
      state,
      [{ type: 'scheduleEvent', eventId: 'return', delayMonths: 6 }],
      context,
    );

    expect(result.scheduledEvents).toEqual([
      { eventId: 'return', dueMonth: 10, sourceEventId: 'source_event', sourceChoiceId: 'source_choice' },
    ]);
  });

  it('moves location and sea/land context atomically', () => {
    const result = applyEffects(
      createInitialGameState(),
      [{ type: 'moveToLocation', locationId: 'open_sea', travelState: 'at_sea' }],
      context,
    );

    expect(result).toMatchObject({ locationId: 'open_sea', travelState: 'at_sea' });
  });
});
