import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../src/game/model/initialState';

describe('createInitialGameState', () => {
  it('creates a career matching the Slice 0 invariants', () => {
    const state = createInitialGameState(1234);

    expect(state).toEqual({
      version: 4,
      rngState: 1234,
      careerPhase: 'active',
      ageMonths: 180,
      month: 0,
      travelState: 'on_land',
      locationId: 'starter_port',
      player: {
        stats: {
          health: 25,
          morale: 25,
          strength: 25,
          observation: 25,
          intelligence: 25,
          navigation: 25,
          charisma: 25,
          luck: 25,
          awakening: null,
        },
        traits: [],
      },
      ship: { condition: 3 },
      flags: [],
      items: [],
      npcs: {
        mira: {
          status: 'unavailable',
          relationship: 0,
        },
      },
      history: [],
      scheduledEvents: [],
      currentEventId: null,
      careerStatus: 'active',
      careerEndReason: null,
    });
  });

  it('does not share mutable objects or arrays between careers', () => {
    const first = createInitialGameState();
    const second = createInitialGameState();

    expect(first.player).not.toBe(second.player);
    expect(first.player.stats).not.toBe(second.player.stats);
    expect(first.player.traits).not.toBe(second.player.traits);
    expect(first.ship).not.toBe(second.ship);
    expect(first.flags).not.toBe(second.flags);
    expect(first.items).not.toBe(second.items);
    expect(first.npcs).not.toBe(second.npcs);
    expect(first.history).not.toBe(second.history);
    expect(first.scheduledEvents).not.toBe(second.scheduledEvents);
  });

  it('survives a JSON round-trip without data loss', () => {
    const state = createInitialGameState(9876);
    const restored: unknown = JSON.parse(JSON.stringify(state));

    expect(restored).toEqual(state);
  });
});
