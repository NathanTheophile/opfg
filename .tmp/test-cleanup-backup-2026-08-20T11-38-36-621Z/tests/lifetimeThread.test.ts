import { describe, expect, it } from 'vitest';
import type { EventDefinition } from '../src/game/content/schema';
import { contentCatalog } from '../src/game/content/definitions';
import { selectNextEvent } from '../src/game/engine/events';
import { createInitialGameState } from '../src/game/model/initialState';

const choice = [{ id: 'go', textKey: 'fixture.childhood.choice', resolution: { type: 'deterministic' as const, outcome: { id: 'done', textKey: 'fixture.childhood.outcome', effects: [] } } }];
const normal = (id: string, lifetimeThreadSeed = false): EventDefinition => ({
  id, kind: 'normal', titleKey: 'fixture.childhood.title', textKey: 'fixture.childhood.text', choices: choice,
  ...(lifetimeThreadSeed ? { lifetimeThreadSeed: true as const } : {}),
});
const catalog = (events: EventDefinition[]) => ({ ...contentCatalog, events });
const childhood = (ageMonths: number, rngState = 1) => {
  const state = createInitialGameState(rngState);
  state.careerPhase = 'childhood'; state.ageMonths = ageMonths; state.rngState = rngState;
  return state;
};

describe('Lifetime Thread selection guarantee', () => {
  it('does not force seeds before 120 months', () => {
    const content = catalog([normal('ordinary'), normal('seed', true)]);
    const selected = new Set(Array.from({ length: 64 }, (_, seed) => selectNextEvent(childhood(114, seed), content).currentEventId));
    expect(selected).toEqual(new Set(['ordinary', 'seed']));
  });

  it('forces only eligible seeds at the checkpoint with deterministic uniform selection', () => {
    const content = catalog([normal('ordinary'), normal('seed_a', true), normal('seed_b', true)]);
    const first = Array.from({ length: 64 }, (_, seed) => selectNextEvent(childhood(120, seed), content).currentEventId);
    const second = Array.from({ length: 64 }, (_, seed) => selectNextEvent(childhood(120, seed), content).currentEventId);
    expect(second).toEqual(first);
    expect(new Set(first)).toEqual(new Set(['seed_a', 'seed_b']));
  });

  it('returns to the ordinary pool after a seed appears in History', () => {
    const content = catalog([normal('ordinary'), normal('seed_a', true), normal('seed_b', true)]);
    const selected = new Set(Array.from({ length: 64 }, (_, seed) => {
      const state = childhood(120, seed);
      state.history.push({ eventId: 'seed_a', choiceId: 'go', outcomeId: 'done', ageMonths: 96 });
      return selectNextEvent(state, content).currentEventId;
    }));
    expect(selected).toEqual(new Set(['ordinary', 'seed_b']));
  });

  it('preserves Scheduled and Immediate priority over the guarantee', () => {
    const scheduled: EventDefinition = { id: 'due', kind: 'scheduled', priority: 100, titleKey: 'fixture.childhood.title', textKey: 'fixture.childhood.text', choices: choice };
    const immediate: EventDefinition = { id: 'continuation', kind: 'immediate', titleKey: 'fixture.childhood.title', textKey: 'fixture.childhood.text', choices: choice };
    const content = catalog([normal('seed', true), scheduled, immediate]);
    const withScheduled = childhood(120); withScheduled.scheduledEvents = [{ eventId: 'due', dueAgeMonths: 120, sourceEventId: 'source', sourceChoiceId: 'go' }];
    expect(selectNextEvent(withScheduled, content).currentEventId).toBe('due');
    const withImmediate = childhood(120); withImmediate.immediateEventQueue = ['continuation'];
    expect(selectNextEvent(withImmediate, content).currentEventId).toBe('continuation');
  });

  it('falls back to the ordinary pool when no seed is eligible', () => {
    const ineligibleSeed = { ...normal('seed', true), eligibility: { type: 'hasFlag' as const, flagId: 'missing' } };
    expect(selectNextEvent(childhood(120), catalog([normal('ordinary'), ineligibleSeed])).currentEventId).toBe('ordinary');
  });
});
