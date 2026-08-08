import { describe, expect, it } from 'vitest';
import type { ContentCatalog, EventDefinition } from '../src/game/content/schema';
import { selectNextEvent } from '../src/game/engine/events';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';

const event = (id: string): EventDefinition => ({ id, kind: 'normal', titleKey: 'fixture.childhood.title', textKey: 'fixture.childhood.text', choices: [{ id: 'go', textKey: 'fixture.childhood.choice', resolution: { type: 'deterministic', outcome: { id: 'done', textKey: 'fixture.childhood.outcome', effects: [] } } }] });
const catalog = (events: EventDefinition[]): ContentCatalog => ({ schemaVersion: 2, races: [], seas: [], affiliations: [], locations: [{ id: 'starter_port', blocksScheduledEvents: false }], traits: [], items: [], npcs: [], events });

describe('deterministic event loop v2', () => {
  it('selects normal events uniformly through the seeded RNG and only once', () => {
    const content = catalog([event('a'), event('b')]);
    const first = selectNextEvent(createInitialGameState(99), content);
    const second = selectNextEvent(createInitialGameState(99), content);
    expect(first).toEqual(second);
    const resolved = resolveChoice(first, content, first.currentEventId!, 'go').state;
    expect(resolved.history).toHaveLength(1);
    expect(resolved.currentEventId).not.toBe(first.currentEventId);
  });

  it('consumes two active normal events per month', () => {
    const content = catalog([event('a'), event('b'), event('c')]);
    let state = createInitialGameState(1);
    state.careerPhase = 'active';
    state.ageMonths = 180;
    state = selectNextEvent(state, content);
    state = resolveChoice(state, content, state.currentEventId!, 'go').state;
    expect(state).toMatchObject({ ageMonths: 180, slotInMonth: 1 });
    state = resolveChoice(state, content, state.currentEventId!, 'go').state;
    expect(state).toMatchObject({ ageMonths: 181, slotInMonth: 0 });
  });
});
