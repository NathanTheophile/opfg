import { describe, expect, it, vi } from 'vitest';
import type { EventDefinition } from '../src/game/content/schema';
import { contentCatalog } from '../src/game/content/definitions';
import { createInitialGameState } from '../src/game/model/initialState';
import { diagnoseContent } from '../src/game/simulation/diagnostics';
import { simulateBatch } from '../src/game/simulation/simulateBatch';
import { simulateRun } from '../src/game/simulation/simulateRun';

const withEvents = (events: EventDefinition[]) => ({ ...contentCatalog, events });

const criticalLoopEvent: EventDefinition = {
  id: 'critical_loop',
  kind: 'critical',
  trigger: { type: 'playerHealthDepleted' },
  titleKey: 'fixture.childhood.title',
  textKey: 'fixture.childhood.text',
  choices: [{
    id: 'continue',
    textKey: 'fixture.childhood.choice',
    resolution: {
      type: 'deterministic',
      outcome: {
        id: 'unchanged',
        textKey: 'fixture.childhood.outcome',
        effects: [],
      },
    },
  }],
};

describe('simulation integration', () => {
  it('is reproducible and never uses Math.random', () => {
    const random = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Math.random is forbidden');
    });

    try {
      const first = simulateRun({
        seed: 42,
        catalog: contentCatalog,
        maxResolvedEvents: 120,
      });
      const second = simulateRun({
        seed: 42,
        catalog: contentCatalog,
        maxResolvedEvents: 120,
      });

      expect(second).toEqual(first);
      expect(first.childhoodReached).toBe(true);
      expect(first.activeReached).toBe(true);
    } finally {
      random.mockRestore();
    }
  });

  it('distinguishes a dead end from a normal career end', () => {
    const result = simulateRun({ seed: 1, catalog: withEvents([]) });
    expect(result.terminationReason).toBe('deadEnd');
    expect(result.deadEnd).toMatchObject({
      seed: 1,
      careerPhase: 'origins',
      locationId: 'foosha_village',
    });
  });

  it('stops a repeating Critical at the safety limit without consuming a slot', () => {
    const initialState = createInitialGameState(7);
    initialState.player.stats.health = 0;

    const result = simulateRun({
      seed: 7,
      catalog: withEvents([criticalLoopEvent]),
      initialState,
      maxResolvedEvents: 3,
    });

    expect(result).toMatchObject({
      terminationReason: 'safetyLimit',
      criticalEvents: 3,
      normalEvents: 0,
      possibleCriticalLoop: true,
    });
    expect(result.finalState).toMatchObject({
      ageMonths: 0,
      slotInMonth: 0,
    });
  });

  it('keeps a small real batch deterministic', () => {
    const config = {
      runs: 3,
      baseSeed: 100,
      catalog: contentCatalog,
      maxResolvedEvents: 120,
    };

    const first = simulateBatch(config);
    const second = simulateBatch(config);

    expect(second).toEqual(first);
    expect(first.runResults.map(({ seed }) => seed)).toEqual([100, 101, 102]);
    expect(first.summary.runs).toBe(3);
  });

  it('reports representative production diagnostics', () => {
    const normal: EventDefinition = {
      id: 'flags',
      kind: 'normal',
      titleKey: 'x',
      textKey: 'x',
      eligibility: { type: 'hasFlag', flagId: 'read_only' },
      choices: [{
        id: 'go',
        textKey: 'x',
        resolution: {
          type: 'deterministic',
          outcome: {
            id: 'done',
            textKey: 'x',
            effects: [{ type: 'setFlag', flagId: 'write_only' }],
          },
        },
      }],
    };
    const orphanScheduled: EventDefinition = {
      id: 'orphan',
      kind: 'scheduled',
      priority: 100,
      titleKey: 'x',
      textKey: 'x',
      choices: [],
    };

    const diagnostics = diagnoseContent(withEvents([normal, orphanScheduled]));
    expect(diagnostics.map(({ code }) => code)).toEqual(expect.arrayContaining([
      'scheduled-never-scheduled',
      'flag-read-never-written',
      'flag-written-never-read',
    ]));
  });
});
