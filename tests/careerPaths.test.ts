import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { getChoiceState } from '../src/game/engine/conditions';
import { selectNextEvent } from '../src/game/engine/events';
import { resolveChoice } from '../src/game/engine/resolution';
import { deserializeGameState, serializeGameState } from '../src/game/engine/save';
import { createInitialGameState } from '../src/game/model/initialState';
import type { GameState } from '../src/game/model/schema';
import { createDefaultNpcStats } from '../src/game/model/npcState';

function newCareer(seed = 123): GameState {
  return selectNextEvent(createInitialGameState(seed), contentCatalog.events);
}

function play(state: GameState, eventId: string, choiceId: string): GameState {
  expect(state.currentEventId).toBe(eventId);
  return resolveChoice(state, contentCatalog.events, eventId, choiceId).state;
}

function choice(eventId: string, choiceId: string) {
  const event = contentCatalog.events.find(({ id }) => id === eventId);
  const result = event?.choices.find(({ id }) => id === choiceId);
  if (!result) throw new Error(`Missing choice ${eventId}/${choiceId}.`);
  return result;
}

describe('real Slice 0 career paths', () => {
  it('contains exactly the nine locked catalog events and priorities', () => {
    expect(contentCatalog.events.map(({ id, priority, scheduledOnly }) => ({ id, priority, scheduledOnly }))).toEqual([
      { id: 'departure', priority: 100, scheduledOnly: false },
      { id: 'mira_castaway', priority: 90, scheduledOnly: false },
      { id: 'black_squall', priority: 80, scheduledOnly: false },
      { id: 'wreck', priority: 70, scheduledOnly: false },
      { id: 'reefs', priority: 70, scheduledOnly: false },
      { id: 'mira_confession', priority: 85, scheduledOnly: false },
      { id: 'mira_hunters', priority: 85, scheduledOnly: false },
      { id: 'mira_returns_favor', priority: 100, scheduledOnly: true },
      { id: 'year_one_end', priority: 100, scheduledOnly: false },
    ]);
  });

  it('completes the recruited Mira branch in catalog priority order', () => {
    let state = newCareer();
    state = play(state, 'departure', 'set_sail');
    state = play(state, 'mira_castaway', 'rescue_recruit');
    state = play(state, 'black_squall', 'heave_to');
    expect(state.currentEventId).toBe('mira_confession');
    state = play(state, 'mira_confession', 'trust_mira');
    state = play(state, 'wreck', 'search_wreck');
    state = play(state, 'reefs', 'use_sealed_chart');
    state = play(state, 'mira_hunters', 'let_mira_speak');
    state = play(state, 'year_one_end', 'sail_with_mira');

    expect(state.careerStatus).toBe('ended');
    expect(state.currentEventId).toBeNull();
    expect(state.month).toBe(15);
    expect(state.npcs.mira).toEqual({ status: 'crew', relationship: 55, stats: createDefaultNpcStats() });
    expect(state.flags).toContain('ending_with_mira');
    expect(state.history.map(({ eventId }) => eventId)).toEqual([
      'departure',
      'mira_castaway',
      'black_squall',
      'mira_confession',
      'wreck',
      'reefs',
      'mira_hunters',
      'year_one_end',
    ]);
  });

  it('delivers Mira’s delayed favor with causal IDs and ends through her passage', () => {
    let state = newCareer();
    state = play(state, 'departure', 'set_sail');
    state = play(state, 'mira_castaway', 'rescue_dropoff');
    expect(state.scheduledEvents).toEqual([
      {
        eventId: 'mira_returns_favor',
        dueAgeMonths: 187,
        sourceEventId: 'mira_castaway',
        sourceChoiceId: 'rescue_dropoff',
      },
    ]);

    state = play(state, 'black_squall', 'heave_to');
    state = play(state, 'wreck', 'search_wreck');
    expect(state.currentEventId).toBe('mira_returns_favor');
    state = play(state, 'mira_returns_favor', 'accept_mira_favor');
    expect(state.items).toContain('mira_letter_of_passage');
    expect(state.scheduledEvents).toEqual([]);
    state = play(state, 'reefs', 'use_sealed_chart');
    state = play(state, 'year_one_end', 'use_mira_passage');

    expect(state.careerStatus).toBe('ended');
    expect(state.careerEndReason).toBe('legacy');
    expect(state.flags).toContain('ending_mira_favor');
  });

  it('keeps Mira arc events unavailable after abandonment and still reaches Year One End', () => {
    let state = newCareer();
    state = play(state, 'departure', 'set_sail');
    state = play(state, 'mira_castaway', 'leave_mira');
    state = play(state, 'black_squall', 'heave_to');
    state = play(state, 'wreck', 'leave_wreck');
    state = play(state, 'reefs', 'force_passage');
    expect(state.currentEventId).toBe('year_one_end');
    state = play(state, 'year_one_end', 'press_on');

    const played = state.history.map(({ eventId }) => eventId);
    expect(played).not.toContain('mira_confession');
    expect(played).not.toContain('mira_hunters');
    expect(played).not.toContain('mira_returns_favor');
    expect(state.scheduledEvents).toEqual([]);
    expect(state.careerStatus).toBe('ended');
  });

  it('keeps a real career GameState exact through save serialization', () => {
    let state = newCareer();
    state = play(state, 'departure', 'set_sail');
    state = play(state, 'mira_castaway', 'rescue_dropoff');

    expect(deserializeGameState(serializeGameState(state))).toEqual(state);
  });
});

describe('real catalog conditional choices', () => {
  it('applies locked and hidden Reefs choice rules', () => {
    const state = createInitialGameState();
    expect(getChoiceState(choice('reefs', 'read_currents'), state)).toEqual({ visible: true, available: false });
    expect(getChoiceState(choice('reefs', 'use_sealed_chart'), state)).toEqual({ visible: false, available: false });
    expect(getChoiceState(choice('reefs', 'ride_breakers'), state)).toEqual({ visible: false, available: false });

    state.player.stats.navigation = 35;
    state.items.push('sealed_chart');
    state.player.traits.push('audacious');
    expect(getChoiceState(choice('reefs', 'read_currents'), state).available).toBe(true);
    expect(getChoiceState(choice('reefs', 'use_sealed_chart'), state).visible).toBe(true);
    expect(getChoiceState(choice('reefs', 'ride_breakers'), state).visible).toBe(true);
  });

  it('unlocks Mira Hunters choices at the specified relation and Charisma thresholds', () => {
    const state = createInitialGameState();
    state.npcs.mira = { status: 'crew', relationship: 39, stats: createDefaultNpcStats() };
    expect(getChoiceState(choice('mira_hunters', 'let_mira_speak'), state).available).toBe(false);
    expect(getChoiceState(choice('mira_hunters', 'bluff_hunters'), state).available).toBe(false);

    state.npcs.mira.relationship = 40;
    state.player.stats.charisma = 35;
    expect(getChoiceState(choice('mira_hunters', 'let_mira_speak'), state).available).toBe(true);
    expect(getChoiceState(choice('mira_hunters', 'bluff_hunters'), state).available).toBe(true);
  });
});
