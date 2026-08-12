import { describe, expect, it } from 'vitest';
import type { ContentCatalog, EventDefinition } from '../src/game/content/schema';
import { selectNextEvent } from '../src/game/engine/events';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';

const outcome = { id: 'done', textKey: 'fixture.childhood.outcome' as const, effects: [] };
const choice = [{ id: 'go', textKey: 'fixture.childhood.choice' as const, resolution: { type: 'deterministic' as const, outcome } }];
const scheduled = (id: string, priority: 50|100|200|300, extra: Partial<Extract<EventDefinition,{kind:'scheduled'}>> = {}): EventDefinition => ({ id, kind: 'scheduled', priority, titleKey: 'fixture.childhood.title', textKey: 'fixture.childhood.text', choices: choice, ...extra });
const normal: EventDefinition = { id: 'normal', kind: 'normal', titleKey: 'fixture.childhood.title', textKey: 'fixture.childhood.text', choices: choice };
const catalog = (events: EventDefinition[]): ContentCatalog => ({ schemaVersion: 4, races: [], seas: [], affiliations: [], careerAffiliations: [], marineRanks: [], careerTitles: [], endings: [], majorNarrativeTracks: [], familyStructures: [], socialClasses: [], traits: [], items: [], devilFruits: [], ships: [{ id: 'starter_sloop', nameKey: 'x', maxHealth: 30, crewCapacity: 3, cargoSlots: 2 }], crewRoles: [], npcs: [], locations: [{ id: 'starter_port', seaId: null, blocksScheduledEvents: false, allowsShipSale: true, allowsDocking: true }, { id: 'blocked', seaId: null, blocksScheduledEvents: true, allowsShipSale: false, allowsDocking: true }], events });

describe('scheduled events v2', () => {
  it('uses due age, conventional priority, then deterministic tie-breaks without RNG', () => {
    const content = catalog([normal, scheduled('low', 50), scheduled('high', 300)]);
    const state = createInitialGameState(4);
    state.scheduledEvents = [
      { eventId: 'low', dueAgeMonths: 0, sourceEventId: 's', sourceChoiceId: 'c' },
      { eventId: 'high', dueAgeMonths: 0, sourceEventId: 's', sourceChoiceId: 'c' },
    ];
    const selected = selectNextEvent(state, content);
    expect(selected.currentEventId).toBe('high');
    expect(selected.rngState).toBe(state.rngState);
  });

  it('defers normal reach in a blocking location but permits unrestricted reach', () => {
    const content = catalog([normal, scheduled('restricted', 300), scheduled('unrestricted', 100, { scheduledReach: 'unrestricted' })]);
    const state = createInitialGameState(); state.locationId = 'blocked';
    state.scheduledEvents = [
      { eventId: 'restricted', dueAgeMonths: 0, sourceEventId: 's', sourceChoiceId: 'c' },
      { eventId: 'unrestricted', dueAgeMonths: 0, sourceEventId: 's', sourceChoiceId: 'c' },
    ];
    expect(selectNextEvent(state, content).currentEventId).toBe('unrestricted');
  });

  it('cancels or redirects a due occurrence and consumes only the selected occurrence', () => {
    const fallback = scheduled('fallback', 100);
    const source = scheduled('source', 200, { cancelIf: { type: 'hasFlag', flagId: 'cancel' }, fallbackEventId: 'fallback' });
    const content = catalog([normal, source, fallback]);
    const state = createInitialGameState(); state.flags = ['cancel'];
    state.scheduledEvents = [{ eventId: 'source', dueAgeMonths: 0, sourceEventId: 's', sourceChoiceId: 'c' }];
    const selected = selectNextEvent(state, content);
    expect(selected.currentEventId).toBe('fallback');
    expect(resolveChoice(selected, content, 'fallback', 'go').state.scheduledEvents).toEqual([]);
  });
});
