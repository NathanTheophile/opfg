import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { evaluateCondition } from '../src/game/engine/conditions';
import { EARLY_WINDFALL_ROOT_IDS, selectNextEvent } from '../src/game/engine/events';
import { createInitialGameState } from '../src/game/model/initialState';

const ALL_ROOTS = Object.values(EARLY_WINDFALL_ROOT_IDS).flat();

function windfallCatalog() {
  const catalog = structuredClone(contentCatalog);
  catalog.majorNarrativeTracks = [];
  catalog.events = catalog.events.filter(({ id }) => id.startsWith('active_early_windfall_'));
  return catalog;
}

describe('Active Early Career Windfall V1', () => {
  it('ships exactly 56 Events with the approved topology', () => {
    const events = contentCatalog.events.filter(({ id }) => id.startsWith('active_early_windfall_'));

    expect(events).toHaveLength(56);
    expect(events.filter(({ kind }) => kind === 'normal')).toHaveLength(8);
    expect(events.filter(({ kind }) => kind === 'immediate')).toHaveLength(48);

    for (const rootId of ALL_ROOTS) {
      const root = events.find(({ id }) => id === rootId);
      expect(root?.kind).toBe('normal');

      for (let index = 1; index <= 6; index += 1) {
        expect(events.filter(({ id }) => id.startsWith(`${rootId}_i${String(index).padStart(2, '0')}_`))).toHaveLength(1);
      }
    }
  });

  it('makes only the two current-affiliation roots due at age 16+ on land', () => {
    const catalog = windfallCatalog();
    const state = createInitialGameState(1234);
    state.careerPhase = 'active';
    state.ageMonths = 192;
    state.travelState = 'on_land';
    state.player.career.affiliationId = 'civilian';

    const eligible = catalog.events
      .filter(({ kind }) => kind === 'normal')
      .filter((event) => event.eligibility !== undefined && evaluateCondition(event.eligibility, state, catalog))
      .map(({ id }) => id)
      .sort();

    expect(eligible).toEqual([...EARLY_WINDFALL_ROOT_IDS.civilian].sort());
  });

  it('uses the current career affiliation if it changed before the milestone', () => {
    const catalog = windfallCatalog();
    const state = createInitialGameState(7);
    state.careerPhase = 'active';
    state.ageMonths = 204;
    state.travelState = 'on_land';
    state.player.career.affiliationId = 'revolutionary';

    const eligible = catalog.events
      .filter(({ kind }) => kind === 'normal')
      .filter((event) => event.eligibility !== undefined && evaluateCondition(event.eligibility, state, catalog))
      .map(({ id }) => id)
      .sort();

    expect(eligible).toEqual([...EARLY_WINDFALL_ROOT_IDS.revolutionary].sort());
  });

  it('excludes the entire family once any one root was played', () => {
    const catalog = windfallCatalog();
    const state = createInitialGameState();
    state.careerPhase = 'active';
    state.ageMonths = 240;
    state.travelState = 'on_land';
    state.player.career.affiliationId = 'marine';
    state.history.push({
      eventId: EARLY_WINDFALL_ROOT_IDS.civilian[0],
      choiceId: 'test',
      outcomeId: 'test',
      ageMonths: 192,
    });

    const eligible = catalog.events
      .filter(({ kind }) => kind === 'normal')
      .filter((event) => event.eligibility !== undefined && evaluateCondition(event.eligibility, state, catalog));

    expect(eligible).toHaveLength(0);
  });

  it('selects seeded-uniformly between the two eligible affiliation variants', () => {
    const catalog = windfallCatalog();
    const selected = new Set<string>();

    for (let seed = 1; seed <= 40; seed += 1) {
      const state = createInitialGameState(seed);
      state.careerPhase = 'active';
      state.ageMonths = 192;
      state.travelState = 'on_land';
      state.player.career.affiliationId = 'pirate';

      const next = selectNextEvent(state, catalog);
      expect(EARLY_WINDFALL_ROOT_IDS.pirate).toContain(next.currentEventId as never);
      selected.add(next.currentEventId!);
    }

    expect(selected).toEqual(new Set(EARLY_WINDFALL_ROOT_IDS.pirate));
  });

  it('waits until age 16 and land context', () => {
    const catalog = windfallCatalog();
    const root = catalog.events.find(({ id }) => id === EARLY_WINDFALL_ROOT_IDS.marine[0])!;
    const state = createInitialGameState();
    state.careerPhase = 'active';
    state.player.career.affiliationId = 'marine';
    state.ageMonths = 191;
    state.travelState = 'on_land';

    expect(evaluateCondition(root.eligibility!, state, catalog)).toBe(false);

    state.ageMonths = 192;
    state.travelState = 'at_sea';
    expect(evaluateCondition(root.eligibility!, state, catalog)).toBe(false);

    state.travelState = 'on_land';
    expect(evaluateCondition(root.eligibility!, state, catalog)).toBe(true);
  });

  it('keeps all Berry rewards terminal, safe, and calibrated to 10k..40k', () => {
    const events = contentCatalog.events.filter(({ id }) => id.startsWith('active_early_windfall_'));

    for (const event of events) {
      for (const choice of event.choices) {
        const resolution = choice.resolution;
        const outcomes = resolution.type === 'deterministic'
          ? [resolution.outcome]
          : Object.values(resolution.outcomes);

        for (const outcome of outcomes) {
          for (const effect of outcome.effects) {
            if (effect.type === 'modifyBerries') {
              expect(event.id).toContain('_i06_');
              expect([10000, 20000, 30000, 40000]).toContain(effect.amount);
            }
            if (effect.type === 'modifyReputation') expect(effect.amount).toBeGreaterThanOrEqual(0);
            expect(effect.type).not.toBe('acquireShip');
          }
        }

        if (event.id.includes('_i06_') && resolution.type === 'dice') {
          expect(resolution.successThreshold).toBe(10);
          expect(resolution.outcomes.criticalFailure.effects).toContainEqual({ type: 'modifyBerries', amount: 10000 });
          expect(resolution.outcomes.failure.effects).toContainEqual({ type: 'modifyBerries', amount: 20000 });
          expect(resolution.outcomes.success.effects).toContainEqual({ type: 'modifyBerries', amount: 30000 });
          expect(resolution.outcomes.criticalSuccess.effects).toContainEqual({ type: 'modifyBerries', amount: 40000 });
        }
      }
    }
  });
});
