import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { evaluateCondition } from '../src/game/engine/conditions';
import { selectNextEvent } from '../src/game/engine/events';
import { resolveChoice } from '../src/game/engine/resolution';
import { deserializeGameState, serializeGameState } from '../src/game/engine/save';
import { createInitialGameState } from '../src/game/model/initialState';
import type { GameState } from '../src/game/model/schema';

function start(): GameState {
  return selectNextEvent(createInitialGameState(42), contentCatalog.events);
}

function resolve(state: GameState, eventId: string, choiceId: string, input?: string): GameState {
  expect(state.currentEventId).toBe(eventId);
  return resolveChoice(state, contentCatalog.events, eventId, choiceId, input).state;
}

function completeOrigins(state = start()): GameState {
  state = resolve(state, 'origin_name', 'confirm_name', '  Robin  ');
  state = resolve(state, 'origin_race', 'human');
  state = resolve(state, 'origin_sea', 'starter_sea');
  state = resolve(state, 'origin_affiliation', 'independent_family');
  state = resolve(state, 'origin_tendency', 'observe');
  return resolve(state, 'origin_to_childhood', 'begin_childhood');
}

describe('Origins profile and text input', () => {
  it.each([undefined, '', '   ', 'x'.repeat(33)])('rejects invalid name input %s without advancing', (input) => {
    const state = start();
    expect(() => resolveChoice(state, contentCatalog.events, 'origin_name', 'confirm_name', input)).toThrow();
    expect(state.currentEventId).toBe('origin_name');
    expect(state.player.profile.name).toBeNull();
    expect(state.history).toEqual([]);
  });

  it('trims and persists a complete profile before Childhood', () => {
    const state = completeOrigins();
    expect(state.player.profile).toEqual({
      name: 'Robin', raceId: 'human', originSeaId: 'starter_sea', affiliationId: 'independent_family',
    });
    expect(state.careerPhase).toBe('childhood');
    expect(state.player.stats.observation).toBe(27);
    expect(deserializeGameState(serializeGameState(state))).toEqual(state);
  });

  it('evaluates profile Conditions as false while null and true after Origins', () => {
    expect(evaluateCondition({ type: 'raceIs', raceId: 'human' }, start())).toBe(false);
    const state = completeOrigins();
    expect(evaluateCondition({ type: 'raceIs', raceId: 'human' }, state)).toBe(true);
    expect(evaluateCondition({ type: 'originSeaIs', seaId: 'starter_sea' }, state)).toBe(true);
    expect(evaluateCondition({ type: 'affiliationIs', affiliationId: 'independent_family' }, state)).toBe(true);
  });
});

describe('complete fixture career pipeline', () => {
  it('progresses through all Childhood bands, a due scheduled memory, Active, then Departure', () => {
    let state = completeOrigins();
    state = resolve(state, 'childhood_early', 'explore');
    expect(state).toMatchObject({ ageMonths: 60, month: 0, currentEventId: 'childhood_memory' });
    state = resolve(state, 'childhood_memory', 'remember');
    state = resolve(state, 'childhood_middle', 'watch_horizon');
    expect(state.ageMonths).toBe(108);
    state = resolve(state, 'childhood_late', 'learn');
    expect(state.ageMonths).toBe(144);
    state = resolve(state, 'childhood_final', 'prepare');
    expect(state.ageMonths).toBe(180);
    state = resolve(state, 'childhood_to_active', 'begin_active');
    expect(state).toMatchObject({ careerPhase: 'active', ageMonths: 180, month: 0, currentEventId: 'departure' });
    state = resolve(state, 'departure', 'set_sail');
    expect(state).toMatchObject({ month: 1, ageMonths: 181, currentEventId: 'mira_castaway' });
    expect(state.history.find(({ eventId }) => eventId === 'childhood_middle')?.ageMonths).toBe(108);
    expect(state.player.stats.navigation).toBe(27);
    expect(state.player.traits).toContain('audacious');
    expect(deserializeGameState(serializeGameState(state))).toEqual(state);
  });
});
