import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { resolveDiceCheck } from '../src/game/engine/dice';
import {
  clearGameState,
  deserializeGameState,
  loadGameState,
  SAVE_KEY,
  saveGameState,
  serializeGameState,
} from '../src/game/engine/save';
import type { StorageLike } from '../src/game/engine/save';
import { createInitialGameState } from '../src/game/model/initialState';
import type { GameState } from '../src/game/model/schema';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

function detailedState(): GameState {
  const state = createInitialGameState(0xfedcba98);
  state.month = 6;
  state.ageMonths = 186;
  state.travelState = 'at_sea';
  state.locationId = 'reefs';
  state.player.stats = {
    health: 2,
    morale: 4,
    strength: 2,
    observation: 3,
    intelligence: 3,
    navigation: 3,
    charisma: 2,
    luck: 1,
    awakening: null,
  };
  state.player.traits = ['audacious'];
  state.ship.condition = 1;
  state.flags = ['left_starter_port'];
  state.items = ['sealed_chart'];
  state.npcs = { mira: { status: 'crew', relationship: 42 } };
  state.history = [
    { eventId: 'departure', choiceId: 'set_sail', outcomeId: 'left_port', month: 1 },
  ];
  state.scheduledEvents = [
    {
      eventId: 'mira_returns_favor',
      dueMonth: 7,
      sourceEventId: 'departure',
      sourceChoiceId: 'set_sail',
    },
  ];
  state.currentEventId = 'reefs';
  return state;
}

describe('GameState serialization', () => {
  it('round-trips every persistent Slice 0 structure exactly', () => {
    const state = detailedState();

    expect(deserializeGameState(serializeGameState(state))).toEqual(state);
  });

  it('preserves scheduled events and the already selected current event', () => {
    const state = detailedState();
    const restored = deserializeGameState(JSON.stringify(state));

    expect(restored?.scheduledEvents).toEqual(state.scheduledEvents);
    expect(restored?.currentEventId).toBe('reefs');
    expect(restored?.rngState).toBe(state.rngState);
  });

  it('round-trips active and inactive awakening values', () => {
    const inactive = detailedState();
    const active = detailedState();
    active.player.stats.awakening = 5;

    expect(deserializeGameState(serializeGameState(inactive))?.player.stats.awakening).toBeNull();
    expect(deserializeGameState(serializeGameState(active))?.player.stats.awakening).toBe(5);
  });
});

describe('storage persistence', () => {
  it('saves under the single slot key, loads exactly, and clears it', () => {
    const storage = new MemoryStorage();
    const state = detailedState();

    expect(saveGameState(storage, state)).toBe(true);
    expect(storage.values.get(SAVE_KEY)).toBe(JSON.stringify(state));
    expect(loadGameState(storage)).toEqual(state);
    expect(clearGameState(storage)).toBe(true);
    expect(storage.values.has(SAVE_KEY)).toBe(false);
    expect(loadGameState(storage)).toBeNull();
  });

  it('returns safe values when storage operations throw', () => {
    const storage: StorageLike = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };

    expect(loadGameState(storage)).toBeNull();
    expect(saveGameState(storage, detailedState())).toBe(false);
    expect(clearGameState(storage)).toBe(false);
  });
});

describe('restored deterministic RNG', () => {
  it('produces the same next DiceCheck as the uninterrupted state', () => {
    const state = detailedState();
    const reefs = contentCatalog.events.find(({ id }) => id === 'reefs');
    const riskyChoice = reefs?.choices.find(({ id }) => id === 'force_passage');
    if (riskyChoice?.resolution.type !== 'dice') throw new Error('Missing risky DiceCheck fixture.');

    const restored = deserializeGameState(serializeGameState(state));
    if (!restored) throw new Error('Expected a valid restored state.');

    expect(resolveDiceCheck(riskyChoice.resolution.check, restored)).toEqual(
      resolveDiceCheck(riskyChoice.resolution.check, state),
    );
  });
});

describe('invalid saves', () => {
  it.each([
    ['not json', '{broken'],
    ['legacy version 2', JSON.stringify({ ...detailedState(), version: 2 })],
    ['unknown version', JSON.stringify({ ...detailedState(), version: 99 })],
  ])('rejects %s', (_label, raw) => {
    expect(deserializeGameState(raw)).toBeNull();
  });

  it('rejects malformed nested state instead of normalizing it', () => {
    const malformed = detailedState();
    const raw = JSON.stringify({ ...malformed, ship: { condition: 99 } });

    expect(deserializeGameState(raw)).toBeNull();
  });
});
