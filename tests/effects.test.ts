import { describe, expect, it } from 'vitest';
import type { Effect } from '../src/game/content/schema';
import { applyEffects } from '../src/game/engine/effects';
import { createInitialGameState } from '../src/game/model/initialState';
import { createDefaultNpcStats } from '../src/game/model/npcState';

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
    expect(related.npcs.new_npc).toEqual({ status: 'known', relationship: 100, stats: createDefaultNpcStats() });
    expect(state.npcs).toEqual({
      mira: { status: 'unavailable', relationship: 0, stats: createDefaultNpcStats() },
    });
  });

  it('initializes an absent NPC deterministically when setting status', () => {
    const result = applyEffects(
      createInitialGameState(),
      [{ type: 'setNpcStatus', npcId: 'mira', status: 'crew' }],
      context,
    );

    expect(result.npcs.mira).toEqual({ status: 'crew', relationship: 0, stats: createDefaultNpcStats() });
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
      { eventId: 'return', dueAgeMonths: 186, sourceEventId: 'source_event', sourceChoiceId: 'source_choice' },
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

  it('modifies active stats and rejects inactive awakening', () => {
    const state = createInitialGameState();
    const modified = applyEffects(state, [{ type: 'modifyStat', statId: 'health', amount: 2 }], context);

    expect(modified.player.stats.health).toBe(27);
    expect(() => applyEffects(state, [{ type: 'modifyStat', statId: 'awakening', amount: 1 }], context))
      .toThrow('Cannot modify inactive stat "awakening".');
  });

  it('clamps active stats to the 0..50 contract', () => {
    const state = createInitialGameState();
    const high = applyEffects(state, [{ type: 'modifyStat', statId: 'health', amount: 100 }], context);
    const low = applyEffects(state, [{ type: 'modifyStat', statId: 'health', amount: -100 }], context);

    expect(high.player.stats.health).toBe(50);
    expect(low.player.stats.health).toBe(0);
  });

  it('modifies and clamps NPC stats while keeping relationship independent', () => {
    const state = createInitialGameState();
    state.npcs.mira.relationship = 80;
    state.npcs.mira.stats.loyalty = 10;
    state.npcs.mira.stats.calm = 48;
    state.npcs.mira.stats.morale = 2;

    const relationshipChanged = applyEffects(
      state,
      [{ type: 'modifyNpcRelationship', npcId: 'mira', amount: -20 }],
      context,
    );
    const statsChanged = applyEffects(relationshipChanged, [
      { type: 'modifyNpcStat', npcId: 'mira', statId: 'loyalty', amount: 5 },
      { type: 'modifyNpcStat', npcId: 'mira', statId: 'calm', amount: 10 },
      { type: 'modifyNpcStat', npcId: 'mira', statId: 'morale', amount: -10 },
    ], context);

    expect(relationshipChanged.npcs.mira).toMatchObject({ relationship: 60, stats: { loyalty: 10 } });
    expect(statsChanged.npcs.mira).toMatchObject({
      relationship: 60,
      stats: { loyalty: 15, calm: 50, morale: 0 },
    });
  });

  it('materializes an absent NPC with one coherent default profile', () => {
    const state = createInitialGameState();
    const result = applyEffects(
      state,
      [{ type: 'modifyNpcStat', npcId: 'new_npc', statId: 'loyalty', amount: 5 }],
      context,
    );

    expect(result.npcs.new_npc).toEqual({
      status: 'known',
      relationship: 0,
      stats: { ...createDefaultNpcStats(), loyalty: 30 },
    });
  });

  it('adds and removes traits idempotently', () => {
    const added = applyEffects(
      createInitialGameState(),
      [
        { type: 'addTrait', traitId: 'audacious' },
        { type: 'addTrait', traitId: 'audacious' },
        { type: 'removeTrait', traitId: 'missing' },
      ],
      context,
    );
    const removed = applyEffects(added, [{ type: 'removeTrait', traitId: 'audacious' }], context);

    expect(added.player.traits).toEqual(['audacious']);
    expect(removed.player.traits).toEqual([]);
  });

  it('sets career phase without implicit side effects', () => {
    const state = createInitialGameState();
    const result = applyEffects(state, [{ type: 'setCareerPhase', phase: 'childhood' }], context);

    expect(result).toMatchObject({ careerPhase: 'childhood', ageMonths: 180, month: 0, locationId: 'starter_port' });
    expect(result.player.stats).toEqual(state.player.stats);
  });

  it.each(['death', 'legacy'] as const)('ends a career with reason %s', (reason) => {
    const result = applyEffects(createInitialGameState(), [{ type: 'endCareer', reason }], context);

    expect(result).toMatchObject({ careerStatus: 'ended', careerEndReason: reason });
  });
});
