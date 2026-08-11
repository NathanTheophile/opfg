import { describe, expect, it, vi } from 'vitest';
import type { ContentCatalog, EventDefinition } from '../src/game/content/schema';
import { contentCatalog } from '../src/game/content/definitions';
import { diagnoseContent } from '../src/game/simulation/diagnostics';
import { simulateBatch } from '../src/game/simulation/simulateBatch';
import { simulateRun } from '../src/game/simulation/simulateRun';
import { createInitialGameState } from '../src/game/model/initialState';

const baseCatalog = (events: EventDefinition[], extra: Partial<ContentCatalog> = {}): ContentCatalog => ({
  schemaVersion: 6,
  races: [], seas: [], affiliations: [], careerAffiliations: [], careerRanks: [], careerTitles: [], endings: [], familyStructures: [], socialClasses: [], traits: [], items: [], devilFruits: [], crewRoles: [], npcs: [],
  ships: [{ id: 'sloop', nameKey: 'x', maxHealth: 30, crewCapacity: 3, cargoSlots: 2 }],
  locations: [{ id: 'foosha_village', nameKey: 'x', seaId: 'east_blue', type: 'village', parentLocationId: null, canBeBirthLocation: true, blocksScheduledEvents: false, allowsDocking: true, shipMarket: 'small_craft', services: [], tags: [] }],
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
    expect(result.deadEnd).toMatchObject({ seed: 1, careerPhase: 'origins', locationId: 'foosha_village' });
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

  it('counts runs reaching Active with and without a Lifetime Thread', () => {
    const eventsWithoutSeeds = contentCatalog.events.map(
      (event): EventDefinition =>
        event.kind === 'normal' && event.lifetimeThreadSeed
          ? { ...event, lifetimeThreadSeed: undefined }
          : event,
    );

    const withoutSeeds = simulateBatch({
      runs: 3,
      baseSeed: 10,
      catalog: { ...contentCatalog, events: eventsWithoutSeeds },
      maxResolvedEvents: 200,
    });

    expect(withoutSeeds.summary).toMatchObject({
      lifetimeThreadStarted: 0,
      reachedActiveWithoutLifetimeThread: 3,
    });

    const withSeeds = simulateBatch({
      runs: 3,
      baseSeed: 10,
      catalog: contentCatalog,
      maxResolvedEvents: 200,
    });

    expect(withSeeds.summary).toMatchObject({
      lifetimeThreadStarted: 3,
      reachedActiveWithoutLifetimeThread: 0,
    });
  });

  it('drives monthly navigation and counts a complete Immediate chain as one slot', () => {
    const outcome = (effects: import('../src/game/content/schema').Effect[]) => ({ id: 'done', textKey: 'x', effects });
    const events: EventDefinition[] = [
      { id: 'root', kind: 'normal', titleKey: 'x', textKey: 'x', choices: [{ id: 'go', textKey: 'x', resolution: { type: 'deterministic', outcome: outcome([{ type: 'queueImmediateEvent', eventId: 'a' }]) } }] },
      { id: 'a', kind: 'immediate', titleKey: 'x', textKey: 'x', choices: [{ id: 'go', textKey: 'x', resolution: { type: 'deterministic', outcome: outcome([{ type: 'queueImmediateEvent', eventId: 'b' }]) } }] },
      { id: 'b', kind: 'immediate', titleKey: 'x', textKey: 'x', choices: [{ id: 'go', textKey: 'x', resolution: { type: 'deterministic', outcome: outcome([]) } }] },
    ];
    const state = createInitialGameState(9); state.careerPhase = 'active'; state.ageMonths = 180;
    state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
    const result = simulateRun({ seed: 9, catalog: baseCatalog(events), initialState: state });
    expect(result).toMatchObject({ normalEvents: 1, immediateEvents: 2, maximumImmediateChainLength: 2 });
    expect(result.finalState).toMatchObject({ ageMonths: 181, slotInMonth: 0, navigationDecisionAgeMonths: 181 });
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

  it('reports cast consistency and Lifetime Thread NPC diagnostics', () => {
    const outcome = (effects: import('../src/game/content/schema').Effect[]) => ({ id: 'done', textKey: 'x', effects });
    const events: EventDefinition[] = [
      {
        id: 'seed', kind: 'normal', lifetimeThreadSeed: true, cast: ['recurring'], titleKey: 'x', textKey: 'x',
        choices: [{ id: 'go', textKey: 'x', resolution: { type: 'deterministic', outcome: outcome([
          { type: 'modifyNpcRelationship', npcId: 'outside', amount: 1 },
          { type: 'scheduleEvent', eventId: 'chapter', delayMonths: 12 },
        ]) } }],
      },
      {
        id: 'chapter', kind: 'scheduled', priority: 100, cast: ['recurring', 'cameo'], titleKey: 'x', textKey: 'x',
        choices: [{ id: 'go', textKey: 'x', resolution: { type: 'deterministic', outcome: outcome([]) } }],
      },
      {
        id: 'lonely', kind: 'normal', cast: ['throwaway'], titleKey: 'x', textKey: 'x',
        choices: [{ id: 'go', textKey: 'x', resolution: { type: 'deterministic', outcome: outcome([]) } }],
      },
      {
        id: 'empty_seed', kind: 'normal', lifetimeThreadSeed: true, titleKey: 'x', textKey: 'x',
        choices: [{ id: 'go', textKey: 'x', resolution: { type: 'deterministic', outcome: outcome([]) } }],
      },
    ];
    const npc = (id: string) => ({
      id, nameKey: 'x', raceId: null, originSeaId: null, affiliationId: null, crewRoleId: null,
      initialStats: { health: 10, morale: 10, strength: 10, observation: 10, intelligence: 10, luck: 10, loyalty: 10, calm: 10 },
    });
    const diagnostics = diagnoseContent(baseCatalog(events, { npcs: [npc('recurring'), npc('cameo'), npc('outside'), npc('throwaway')] }));

    expect(diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'npc-relationship-outside-cast', id: 'seed:outside' }),
      expect.objectContaining({ code: 'npc-single-event-cast', id: 'throwaway' }),
      expect.objectContaining({ code: 'lifetime-thread-no-cast', id: 'empty_seed' }),
      expect.objectContaining({ code: 'lifetime-thread-single-node-cast', id: 'seed:cameo' }),
    ]));
    expect(diagnostics).not.toContainEqual(expect.objectContaining({ code: 'lifetime-thread-single-node-cast', id: 'seed:recurring' }));
  });
});
