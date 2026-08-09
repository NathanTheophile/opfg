import { describe, expect, it, vi } from 'vitest';
import type { ContentCatalog, EventDefinition } from '../src/game/content/schema';
import { contentCatalog } from '../src/game/content/definitions';
import { diagnoseContent } from '../src/game/simulation/diagnostics';
import { simulateBatch } from '../src/game/simulation/simulateBatch';
import { simulateRun } from '../src/game/simulation/simulateRun';
import { createInitialGameState } from '../src/game/model/initialState';

const baseCatalog = (events: EventDefinition[], extra: Partial<ContentCatalog> = {}): ContentCatalog => ({
  schemaVersion: 3,
  races: [], seas: [], affiliations: [], familyStructures: [], socialClasses: [], traits: [], items: [], devilFruits: [], crewRoles: [], npcs: [],
  ships: [{ id: 'starter_sloop', nameKey: 'x', maxHealth: 30, crewCapacity: 3, cargoSlots: 2 }],
  locations: [{ id: 'starter_port', seaId: null, blocksScheduledEvents: false, allowsShipSale: true, allowsDocking: true }],
  events,
  ...extra,
});

const criticalLoopEvent: EventDefinition = {
  id: 'critical_loop', kind: 'critical', trigger: { type: 'playerHealthDepleted' },
  titleKey: 'fixture.childhood.title', textKey: 'fixture.childhood.text',
  choices: [{ id: 'continue', textKey: 'fixture.childhood.choice', resolution: { type: 'deterministic', outcome: {
    id: 'unchanged', textKey: 'fixture.childhood.outcome', effects: [],
  } } }],
};

describe('simulation', () => {
  it('is reproducible, resolves Origins and Childhood, reaches Active, and never uses Math.random', () => {
    const random = vi.spyOn(Math, 'random').mockImplementation(() => { throw new Error('Math.random is forbidden'); });
    const first = simulateRun({ seed: 42, catalog: contentCatalog });
    const second = simulateRun({ seed: 42, catalog: contentCatalog });
    expect(second).toEqual(first);
    expect(first.finalState.player.profile.name).toBe('SimPlayer');
    expect(first.childhoodReached).toBe(true);
    expect(first.activeReached).toBe(true);
    expect(first.scheduledEvents).toBeGreaterThan(0);
    random.mockRestore();
  });

  it('distinguishes a dead end from a normal career end', () => {
    const result = simulateRun({ seed: 1, catalog: baseCatalog([]) });
    expect(result.terminationReason).toBe('deadEnd');
    expect(result.deadEnd).toMatchObject({ seed: 1, careerPhase: 'origins', locationId: 'starter_port' });
  });

  it('stops a repeating Critical at the safety limit without consuming a slot', () => {
    const initialState = createInitialGameState(7);
    initialState.player.stats.health = 0;
    const result = simulateRun({ seed: 7, catalog: baseCatalog([criticalLoopEvent]), initialState, maxResolvedEvents: 3 });
    expect(result).toMatchObject({ terminationReason: 'safetyLimit', criticalEvents: 3, normalEvents: 0, possibleCriticalLoop: true });
    expect(result.finalState).toMatchObject({ ageMonths: 0, slotInMonth: 0 });
  });

  it('aggregates deterministic seeds and metrics across a real batch', () => {
    const config = { runs: 10, baseSeed: 100, catalog: contentCatalog, maxResolvedEvents: 200 };
    const first = simulateBatch(config);
    const second = simulateBatch(config);
    expect(second).toEqual(first);
    expect(first.runResults.map(({ seed }) => seed)).toEqual([100, 101, 102, 103, 104, 105, 106, 107, 108, 109]);
    expect(first.summary.runs).toBe(10);
    expect(first.summary.reachedActive).toBe(10);
    expect(first.summary.scheduledResolved).toBeGreaterThan(0);
    expect(first.events).toHaveLength(contentCatalog.events.length);
  });

  it('drives monthly navigation and counts a complete Immediate chain as one slot', () => {
    const outcome = (effects: import('../src/game/content/schema').Effect[]) => ({ id: 'done', textKey: 'x', effects });
    const events: EventDefinition[] = [
      { id: 'root', kind: 'normal', titleKey: 'x', textKey: 'x', choices: [{ id: 'go', textKey: 'x', resolution: { type: 'deterministic', outcome: outcome([{ type: 'queueImmediateEvent', eventId: 'a' }]) } }] },
      { id: 'a', kind: 'immediate', titleKey: 'x', textKey: 'x', choices: [{ id: 'go', textKey: 'x', resolution: { type: 'deterministic', outcome: outcome([{ type: 'queueImmediateEvent', eventId: 'b' }]) } }] },
      { id: 'b', kind: 'immediate', titleKey: 'x', textKey: 'x', choices: [{ id: 'go', textKey: 'x', resolution: { type: 'deterministic', outcome: outcome([]) } }] },
    ];
    const state = createInitialGameState(9); state.careerPhase = 'active'; state.ageMonths = 180;
    const result = simulateRun({ seed: 9, catalog: baseCatalog(events), initialState: state });
    expect(result).toMatchObject({ normalEvents: 1, immediateEvents: 2, maximumImmediateChainLength: 2 });
    expect(result.finalState).toMatchObject({ ageMonths: 180, slotInMonth: 1, navigationDecisionAgeMonths: 180 });
  });

  it('reports simple production diagnostics without pretending to solve reachability', () => {
    const normal: EventDefinition = {
      id: 'flags', kind: 'normal', titleKey: 'x', textKey: 'x',
      eligibility: { type: 'hasFlag', flagId: 'read_only' },
      choices: [{ id: 'go', textKey: 'x', resolution: { type: 'deterministic', outcome: {
        id: 'done', textKey: 'x', effects: [{ type: 'setFlag', flagId: 'write_only' }],
      } } }],
    };
    const orphanScheduled: EventDefinition = {
      id: 'orphan', kind: 'scheduled', priority: 100, titleKey: 'x', textKey: 'x', choices: [],
    };
    const diagnostics = diagnoseContent(baseCatalog([normal, orphanScheduled], {
      traits: [{ id: 'unused_trait', nameKey: 'x', descriptionKey: 'x' }],
      items: [{ id: 'unused_item', nameKey: 'x' }],
    }));
    expect(diagnostics.map(({ code }) => code)).toEqual(expect.arrayContaining([
      'scheduled-never-scheduled', 'trait-never-granted', 'item-never-granted',
      'flag-read-never-written', 'flag-written-never-read',
    ]));
  });
});
