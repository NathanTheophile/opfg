import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { applyEffects } from '../src/game/engine/effects';
import { evaluateCondition } from '../src/game/engine/conditions';
import { HAKI_DUE_ROOT_IDS, selectNextEvent } from '../src/game/engine/events';
import { createInitialGameState } from '../src/game/model/initialState';

const context = { sourceEventId: 'test_haki', sourceChoiceId: 'test_choice' };

describe('Active Haki V1 progression', () => {
  it('uses effective Stats for Haki source thresholds', () => {
    const catalog = structuredClone(contentCatalog);
    catalog.items.push({
      id: 'test_haki_lens',
      nameKey: 'item.sealed_chart.name',
      category: 'equipment',
      stackLimit: 1,
      market: null,
      modifiers: { observation: 10, intelligence: 5 },
    });

    const state = createInitialGameState();
    state.player.stats.observation = 30;
    state.player.stats.intelligence = 30;
    state.player.equipment[0] = {
      itemId: 'test_haki_lens',
      quantity: 1,
      provenance: [{ locationId: null, quantity: 1 }],
    };

    expect(state.player.stats.observation + state.player.stats.intelligence).toBe(60);
    expect(evaluateCondition(
      { type: 'hakiSourceTotalAtLeast', hakiType: 'observation', value: 75 },
      state,
      catalog,
    )).toBe(true);
  });

  it('awards authored Haki levels without stat-only auto-promotion or later regression', () => {
    const state = createInitialGameState();
    state.player.stats.observation = 50;
    state.player.stats.intelligence = 45;

    const levelOne = applyEffects(
      state,
      contentCatalog,
      [{ type: 'raiseHakiTo', hakiType: 'observation', level: 1 }],
      context,
    );

    expect(levelOne.player.powers.haki.observation).toBe(1);

    levelOne.player.stats.observation = 10;
    levelOne.player.stats.intelligence = 10;

    const afterDrop = applyEffects(
      levelOne,
      contentCatalog,
      [{ type: 'modifyStat', statId: 'morale', amount: 1 }],
      context,
    );

    expect(afterDrop.player.powers.haki.observation).toBe(1);

    expect(() => applyEffects(
      afterDrop,
      contentCatalog,
      [{ type: 'raiseHakiTo', hakiType: 'observation', level: 3 }],
      context,
    )).toThrow();
  });

  it('makes already-satisfied Observation thresholds due sequentially', () => {
    const catalog = structuredClone(contentCatalog);
    catalog.majorNarrativeTracks = [];
    catalog.events = catalog.events.filter(({ id }) =>
      id.startsWith('active_haki_observation_') || id.startsWith('active_haki_armament_'),
    );

    const expected = [...HAKI_DUE_ROOT_IDS.observation];
    let state = createInitialGameState(123456);
    state.careerPhase = 'active';
    state.ageMonths = 180;
    state.travelState = 'on_land';
    state.player.stats.observation = 50;
    state.player.stats.intelligence = 45;
    state.player.stats.strength = 0;
    state.player.stats.agility = 0;

    for (let level = 0; level < 5; level += 1) {
      state.player.powers.haki.observation = level;
      state.currentEventId = null;
      const selected = selectNextEvent(state, catalog);
      expect(selected.currentEventId).toBe(expected[level]);
    }
  });

  it('waits for the authored Armament sea context', () => {
    const catalog = structuredClone(contentCatalog);
    catalog.majorNarrativeTracks = [];
    catalog.events = catalog.events.filter(({ id }) =>
      id.startsWith('active_haki_observation_') || id.startsWith('active_haki_armament_'),
    );

    let state = createInitialGameState(42);
    state.careerPhase = 'active';
    state.ageMonths = 180;
    state.player.stats.observation = 0;
    state.player.stats.intelligence = 0;
    state.player.stats.strength = 40;
    state.player.stats.agility = 40;
    state.player.powers.haki.armament = 1;
    state.travelState = 'on_land';
    state.ship = null;

    const levelTwo = catalog.events.find(({ id }) => id === HAKI_DUE_ROOT_IDS.armament[1]);
    expect(levelTwo?.eligibility).toBeDefined();
    expect(evaluateCondition(levelTwo!.eligibility!, state, catalog)).toBe(false);

    state.travelState = 'at_sea';
    state.ship = { shipId: 'sloop', name: 'Test', health: 30, cargo: [] };

    expect(evaluateCondition(levelTwo!.eligibility!, state, catalog)).toBe(true);
    expect(selectNextEvent(state, catalog).currentEventId).toBe(HAKI_DUE_ROOT_IDS.armament[1]);
  });

  it('ships exactly the two audited 45-event Haki batches', () => {
    for (const [prefix, roots] of [
      ['active_haki_observation_', HAKI_DUE_ROOT_IDS.observation],
      ['active_haki_armament_', HAKI_DUE_ROOT_IDS.armament],
    ] as const) {
      const events = contentCatalog.events.filter(({ id }) => id.startsWith(prefix));
      expect(events).toHaveLength(45);
      expect(events.filter(({ kind }) => kind === 'normal')).toHaveLength(5);
      expect(events.filter(({ kind }) => kind === 'immediate')).toHaveLength(40);
      expect(events.filter(({ id }) => roots.includes(id as never))).toHaveLength(5);

      for (const event of events) {
        for (const choice of event.choices) {
          const outcomes = choice.resolution.type === 'deterministic'
            ? [choice.resolution.outcome]
            : Object.values(choice.resolution.outcomes);

          for (const outcome of outcomes) {
            expect(outcome.effects.some((effect) =>
              effect.type === 'modifyStat'
              && ['strength', 'agility', 'observation', 'intelligence'].includes(effect.statId),
            )).toBe(false);
            expect(outcome.effects.some((effect) =>
              effect.type === 'modifyBerries' && effect.amount < 0,
            )).toBe(false);
            expect(outcome.effects.some((effect) =>
              effect.type === 'modifyReputation' && effect.amount < 0,
            )).toBe(false);
          }
        }
      }
    }
  });
});
