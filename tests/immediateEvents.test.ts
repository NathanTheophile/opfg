import { describe, expect, it } from 'vitest';
import type { ContentCatalog, Effect, EventDefinition } from '../src/game/content/schema';
import { selectNextEvent } from '../src/game/engine/events';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';
import { validateContent } from '../src/game/validation/validateContent';

const choice = (effects: Effect[] = []) => [{ id: 'go', textKey: 'fixture.childhood.choice', resolution: { type: 'deterministic' as const, outcome: { id: 'done', textKey: 'fixture.childhood.outcome', effects } } }];
const event = (id: string, kind: 'normal' | 'immediate', effects: Effect[] = []): EventDefinition => ({ id, kind, titleKey: 'fixture.childhood.title', textKey: 'fixture.childhood.text', choices: choice(effects) });
const critical: EventDefinition = { id: 'ship_critical', kind: 'critical', trigger: { type: 'shipDestroyed' }, titleKey: 'fixture.childhood.title', textKey: 'fixture.childhood.text', choices: choice([{ type: 'loseShip', locationId: 'starter_port', travelState: 'on_land' }]) };
const scheduled: EventDefinition = { id: 'later', kind: 'scheduled', priority: 100, titleKey: 'fixture.childhood.title', textKey: 'fixture.childhood.text', choices: choice() };
const catalog = (events: EventDefinition[]): ContentCatalog => ({ schemaVersion: 4, races: [], seas: [], affiliations: [], careerAffiliations: [], marineRanks: [], careerTitles: [], endings: [], familyStructures: [], socialClasses: [], traits: [], items: [], devilFruits: [], ships: [{ id: 'starter_sloop', nameKey: 'x', maxHealth: 30, crewCapacity: 3, cargoSlots: 2 }], crewRoles: [], npcs: [], locations: [{ id: 'starter_port', seaId: null, blocksScheduledEvents: false, allowsShipSale: true, allowsDocking: true }], events });
const activeState = (slotInMonth: 0 | 1 = 0) => {
  const state = createInitialGameState(1);
  state.careerPhase = 'active'; state.ageMonths = 180; state.slotInMonth = slotInMonth; state.navigationDecisionAgeMonths = 180;
  return state;
};

describe('Immediate Event chains', () => {
  it('resolves Normal -> Immediate -> Immediate at one time and consumes one slot', () => {
    const content = catalog([event('root', 'normal', [{ type: 'queueImmediateEvent', eventId: 'a' }]), event('a', 'immediate', [{ type: 'queueImmediateEvent', eventId: 'b' }, { type: 'scheduleEvent', eventId: 'later', delayMonths: 3 }]), event('b', 'immediate'), scheduled]);
    let state = selectNextEvent(activeState(), content);
    state = resolveChoice(state, content, 'root', 'go').state;
    expect(state).toMatchObject({ currentEventId: 'a', ageMonths: 180, slotInMonth: 0, pendingSlotPhase: 'active' });
    state = resolveChoice(state, content, 'a', 'go').state;
    expect(state).toMatchObject({ currentEventId: 'b', ageMonths: 180, slotInMonth: 0 });
    expect(state.scheduledEvents).toContainEqual(expect.objectContaining({ eventId: 'later', dueAgeMonths: 183 }));
    state = resolveChoice(state, content, 'b', 'go').state;
    expect(state).toMatchObject({ ageMonths: 180, slotInMonth: 1, pendingSlotPhase: null });
    expect(state.history.map(({ eventId }) => eventId)).toEqual(['root', 'a', 'b']);
  });

  it('finishes a slot-2 chain before advancing the month', () => {
    const content = catalog([event('root', 'normal', [{ type: 'queueImmediateEvent', eventId: 'a' }]), event('a', 'immediate', [{ type: 'queueImmediateEvent', eventId: 'b' }]), event('b', 'immediate')]);
    let state = selectNextEvent(activeState(1), content);
    state = resolveChoice(state, content, 'root', 'go').state;
    state = resolveChoice(state, content, 'a', 'go').state;
    expect(state.ageMonths).toBe(180);
    state = resolveChoice(state, content, 'b', 'go').state;
    expect(state).toMatchObject({ ageMonths: 181, slotInMonth: 0, currentEventId: null });
  });

  it('lets Critical stabilize before resuming the pending chain', () => {
    const content = catalog([event('root', 'normal', [{ type: 'queueImmediateEvent', eventId: 'a' }]), event('a', 'immediate', [{ type: 'modifyShipHealth', amount: -30 }, { type: 'queueImmediateEvent', eventId: 'b' }]), event('b', 'immediate'), critical]);
    let state = selectNextEvent(activeState(), content);
    state = resolveChoice(state, content, 'root', 'go').state;
    state = resolveChoice(state, content, 'a', 'go').state;
    expect(state.currentEventId).toBe('ship_critical');
    state = resolveChoice(state, content, 'ship_critical', 'go').state;
    expect(state).toMatchObject({ currentEventId: 'b', ageMonths: 180, slotInMonth: 0, ship: null });
    state = resolveChoice(state, content, 'b', 'go').state;
    expect(state.slotInMonth).toBe(1);
  });

  it('skips an Immediate continuation whose eligibility no longer holds', () => {
    const followup = { ...event('a', 'immediate'), eligibility: { type: 'hasFlag' as const, flagId: 'required' } };
    const content = catalog([event('root', 'normal', [{ type: 'queueImmediateEvent', eventId: 'a' }]), followup]);
    const root = selectNextEvent(activeState(), content);
    const state = resolveChoice(root, content, 'root', 'go').state;
    expect(state).toMatchObject({ ageMonths: 180, slotInMonth: 1, pendingSlotPhase: null });
    expect(state.history.map(({ eventId }) => eventId)).toEqual(['root']);
  });

  it('rejects invalid targets and static cycles, with a runtime corruption guard', () => {
    const invalid = catalog([event('root', 'normal', [{ type: 'queueImmediateEvent', eventId: 'root' }])]);
    expect(validateContent(invalid).map(({ message }) => message)).toEqual(expect.arrayContaining([expect.stringContaining('Unknown Immediate EventId')]));
    const cyclic = catalog([event('root', 'normal', [{ type: 'queueImmediateEvent', eventId: 'a' }]), event('a', 'immediate', [{ type: 'queueImmediateEvent', eventId: 'b' }]), event('b', 'immediate', [{ type: 'queueImmediateEvent', eventId: 'a' }])]);
    expect(validateContent(cyclic).map(({ message }) => message)).toEqual(expect.arrayContaining([expect.stringContaining('Immediate Event cycle detected')]));
    const guarded = activeState(); guarded.immediateEventQueue = ['a']; guarded.currentEventId = 'a'; guarded.immediateEventsResolvedInChain = 1000;
    expect(() => resolveChoice(guarded, catalog([event('a', 'immediate')]), 'a', 'go')).toThrow('runtime guard');
  });
});
