import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../content/definitions';
import { createInitialGameState } from '../model/initialState';
import { createDefaultNpcState } from '../model/npcState';
import { assignCrewRoleToRecruit } from './crew';
import { navigatorDestinations, useCrewRolePower } from './crewPowers';
import { applyEffects } from './effects';
import { findCriticalEvent, isNormalOccurrenceEligible, selectNextEvent } from './events';
import { resolveChoice } from './resolution';
import {
  REVERSE_MOUNTAIN_ATTEMPT_FLAG,
  REVERSE_MOUNTAIN_FIRST_NAVIGATOR_ASSIGNMENT_FLAG,
  REVERSE_MOUNTAIN_NAVIGATOR_OFFER_EVENT_ID,
  REVERSE_MOUNTAIN_ROOT_BY_SEA,
  REVERSE_MOUNTAIN_ROOT_IDS,
} from './reverseMountain';

function stateInBlue(seaId: keyof typeof REVERSE_MOUNTAIN_ROOT_BY_SEA, shipId: 'dinghy' | 'sloop' = 'sloop') {
  const state = createInitialGameState(1234);
  state.careerPhase = 'active';
  state.ageMonths = 180;
  state.travelState = 'on_land';
  state.isLeader = true;
  state.locationId = contentCatalog.locations.find((location) => location.seaId === seaId && location.allowsDocking)!.id;
  const ship = contentCatalog.ships.find(({ id }) => id === shipId)!;
  state.ship = { shipId, name: 'Test', health: ship.maxHealth, cargo: [] };
  return state;
}

function navigatorCrewmate() {
  const npc = createDefaultNpcState();
  return { ...npc, status: 'crew' as const, crewRoleId: null, statsGenerated: true };
}

describe('Blues -> Reverse Mountain V1', () => {
  it('does not expose the natural Root to a Dinghy without Navigator override', () => {
    const state = stateInBlue('east_blue', 'dinghy');
    const next = selectNextEvent(state, contentCatalog);
    expect(next.currentEventId === null || !REVERSE_MOUNTAIN_ROOT_IDS.has(next.currentEventId)).toBe(true);
  });

  it.each(Object.entries(REVERSE_MOUNTAIN_ROOT_BY_SEA))('makes the correct Root due for a Sloop in %s', (seaId, rootId) => {
    const state = stateInBlue(seaId as keyof typeof REVERSE_MOUNTAIN_ROOT_BY_SEA, 'sloop');
    expect(selectNextEvent(state, contentCatalog).currentEventId).toBe(rootId);
  });

  it('keeps natural Sloop access available when a Navigator is already assigned', () => {
    const state = stateInBlue('east_blue', 'sloop');
    state.flags.push(REVERSE_MOUNTAIN_FIRST_NAVIGATOR_ASSIGNMENT_FLAG);
    state.npcs.mira = { ...navigatorCrewmate(), crewRoleId: 'navigator' };
    expect(selectNextEvent(state, contentCatalog).currentEventId).toBe(REVERSE_MOUNTAIN_ROOT_BY_SEA.east_blue);
  });

  it('offers the free attempt on the first Navigator assignment and refusal consumes neither month nor annual power', () => {
    const state = stateInBlue('east_blue', 'dinghy');
    state.npcs.mira = navigatorCrewmate();
    assignCrewRoleToRecruit(state, contentCatalog, 'mira', 'navigator');
    expect(state.currentEventId).toBe(REVERSE_MOUNTAIN_NAVIGATOR_OFFER_EVENT_ID);
    expect(state.flags).toContain(REVERSE_MOUNTAIN_FIRST_NAVIGATOR_ASSIGNMENT_FLAG);

    const ageBefore = state.ageMonths;
    const resolved = resolveChoice(state, contentCatalog, REVERSE_MOUNTAIN_NAVIGATOR_OFFER_EVENT_ID, 'not_now');
    expect(resolved.state.ageMonths).toBe(ageBefore);
    expect(resolved.state.crewRoleLastUsedYear.navigator).toBeUndefined();
    expect(resolved.state.flags).not.toContain('reverse_mountain_navigator_override');
  });

  it('accepts the first Navigator offer as a free Dinghy attempt', () => {
    const state = stateInBlue('east_blue', 'dinghy');
    state.npcs.mira = navigatorCrewmate();
    assignCrewRoleToRecruit(state, contentCatalog, 'mira', 'navigator');
    const ageBefore = state.ageMonths;

    const accepted = resolveChoice(state, contentCatalog, REVERSE_MOUNTAIN_NAVIGATOR_OFFER_EVENT_ID, 'try_reverse_mountain');
    expect(accepted.state.currentEventId).toBe(REVERSE_MOUNTAIN_ROOT_BY_SEA.east_blue);
    expect(accepted.state.ageMonths).toBe(ageBefore);
    expect(accepted.state.crewRoleLastUsedYear.navigator).toBeUndefined();

    const root = contentCatalog.events.find(({ id }) => id === accepted.state.currentEventId)!;
    const rootResolved = resolveChoice(accepted.state, contentCatalog, root.id, root.choices[0].id);
    expect(rootResolved.state.ageMonths).toBe(ageBefore);
    expect(rootResolved.state.pendingSlotPhase).toBeNull();
  });

  it('starts a Dinghy attempt through the annual Navigator power without consuming the normal root slot', () => {
    const state = stateInBlue('east_blue', 'dinghy');
    state.flags.push(REVERSE_MOUNTAIN_FIRST_NAVIGATOR_ASSIGNMENT_FLAG);
    state.npcs.mira = { ...navigatorCrewmate(), crewRoleId: 'navigator' };
    expect(navigatorDestinations(state, contentCatalog).map(({ id }) => id)).toContain('reverse_mountain');

    const originLocationId = state.locationId;
    useCrewRolePower(state, contentCatalog, 'navigator', 'reverse_mountain');
    expect(state.currentEventId).toBe(REVERSE_MOUNTAIN_ROOT_BY_SEA.east_blue);
    expect(state.locationId).toBe(originLocationId);
    expect(state.crewRoleLastUsedYear.navigator).toBe(Math.floor(state.ageMonths / 12));

    const root = contentCatalog.events.find(({ id }) => id === state.currentEventId)!;
    const ageBefore = state.ageMonths;
    const resolved = resolveChoice(state, contentCatalog, root.id, root.choices[0].id);
    expect(resolved.state.ageMonths).toBe(ageBefore);
    expect(resolved.state.pendingSlotPhase).toBeNull();
    expect(resolved.state.currentEventId).toContain('_i01_');
  });

  it('keeps natural Sloop attempts tied to the monthly root slot', () => {
    const state = selectNextEvent(stateInBlue('east_blue', 'sloop'), contentCatalog);
    const root = contentCatalog.events.find(({ id }) => id === state.currentEventId)!;
    const resolved = resolveChoice(state, contentCatalog, root.id, root.choices[0].id);
    expect(resolved.state.pendingSlotPhase).toBe('active');
  });

  it('triggers RM Criticals at 2 / 4 / 6 accumulated risks in order', () => {
    const state = stateInBlue('east_blue', 'sloop');
    state.flags.push(REVERSE_MOUNTAIN_ATTEMPT_FLAG, 'reverse_mountain_risk_01', 'reverse_mountain_risk_02');
    expect(findCriticalEvent(state, contentCatalog.events)?.id).toBe('critical_reverse_mountain_01_undertow');

    state.flags.push('reverse_mountain_risk_03', 'reverse_mountain_risk_04', 'reverse_mountain_critical_01_resolved');
    expect(findCriticalEvent(state, contentCatalog.events)?.id).toBe('critical_reverse_mountain_02_breaking_point');

    state.flags.push('reverse_mountain_risk_05', 'reverse_mountain_risk_06', 'reverse_mountain_critical_02_resolved');
    expect(findCriticalEvent(state, contentCatalog.events)?.id).toBe('critical_reverse_mountain_03_last_chance');
  });

  it('keeps hard Health Criticals above Reverse Mountain Criticals', () => {
    const state = stateInBlue('east_blue', 'sloop');
    state.flags.push(REVERSE_MOUNTAIN_ATTEMPT_FLAG, 'reverse_mountain_risk_01', 'reverse_mountain_risk_02');
    state.player.stats.health = 0;
    const critical = findCriticalEvent(state, contentCatalog.events);
    expect(critical?.kind).toBe('critical');
    if (!critical || critical.kind !== 'critical') throw new Error('Expected a hard Critical Event.');
    expect(critical.trigger.type).toBe('playerHealthDepleted');
  });

  it('does not lose the Immediate queue while resolving an RM Critical', () => {
    const state = stateInBlue('east_blue', 'sloop');
    const nextImmediate = 'active_reverse_mountain_approach_east_blue_i03_wreckers';
    state.flags.push(REVERSE_MOUNTAIN_ATTEMPT_FLAG, 'reverse_mountain_risk_01', 'reverse_mountain_risk_02');
    state.immediateEventQueue = [nextImmediate];
    state.pendingSlotPhase = 'active';
    state.currentEventId = 'critical_reverse_mountain_01_undertow';

    const resolved = resolveChoice(state, contentCatalog, state.currentEventId, 'encaisser_en_protegeant');
    expect(resolved.state.immediateEventQueue[0]).toBe(nextImmediate);
    expect(resolved.state.currentEventId).toBe(nextImmediate);
  });

  it('terminates the RM Immediate queue when a hard ship-destruction Critical takes over', () => {
    const state = stateInBlue('east_blue', 'sloop');
    const eventId = 'active_reverse_mountain_approach_east_blue_i03_wreckers';
    state.flags.push(REVERSE_MOUNTAIN_ATTEMPT_FLAG);
    state.ship!.health = 2;
    state.currentEventId = eventId;
    state.immediateEventQueue = [eventId];
    state.pendingSlotPhase = 'active';

    const resolved = resolveChoice(state, contentCatalog, eventId, 'laisser_filer_un_bord');
    expect(resolved.state.immediateEventQueue).toEqual([]);
    expect(resolved.state.flags).not.toContain(REVERSE_MOUNTAIN_ATTEMPT_FLAG);
    const critical = contentCatalog.events.find(({ id }) => id === resolved.state.currentEventId);
    expect(critical?.kind).toBe('critical');
    if (!critical || critical.kind !== 'critical') throw new Error('Expected ship-destruction Critical.');
    expect(critical.trigger.type).toBe('shipDestroyed');
  });

  it('moves only successful terminal outcomes to Reverse Mountain and leaves failure in the Blue', () => {
    const event = contentCatalog.events.find(({ id }) => id === 'active_reverse_mountain_approach_east_blue_i06_upward_commitment')!;
    const choice = event.choices.find(({ resolution }) => resolution.type === 'dice')!;
    if (choice.resolution.type !== 'dice') throw new Error('Expected Dice terminal Choice.');

    const base = stateInBlue('east_blue', 'sloop');
    base.flags.push(REVERSE_MOUNTAIN_ATTEMPT_FLAG);
    const failure = applyEffects(base, contentCatalog, choice.resolution.outcomes.failure.effects, { sourceEventId: event.id, sourceChoiceId: choice.id });
    expect(failure.locationId).toBe(base.locationId);
    expect(failure.flags).toContain('reverse_mountain_risk_06');

    const success = applyEffects(base, contentCatalog, choice.resolution.outcomes.success.effects, { sourceEventId: event.id, sourceChoiceId: choice.id });
    expect(success.locationId).toBe('reverse_mountain');
    expect(success.travelState).toBe('on_land');
  });

  it('allows retry after one month and not before', () => {
    const state = stateInBlue('east_blue', 'sloop');
    const root = contentCatalog.events.find((event) => event.id === REVERSE_MOUNTAIN_ROOT_BY_SEA.east_blue && event.kind === 'normal');
    if (!root || root.kind !== 'normal') throw new Error('Missing Reverse Mountain root.');
    state.history.push({ eventId: root.id, choiceId: 'fixture', outcomeId: 'fixture', ageMonths: state.ageMonths });
    expect(isNormalOccurrenceEligible(root, state)).toBe(false);
    state.ageMonths += 1;
    expect(isNormalOccurrenceEligible(root, state)).toBe(true);
  });
});
