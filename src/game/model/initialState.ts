import type { GameState } from './schema';
import { createDefaultNpcState } from './npcState';

const DEFAULT_SEED = 0x1a2b3c4d;

export function createInitialGameState(seed: number = DEFAULT_SEED): GameState {
  return {
    version: 5,
    rngState: seed >>> 0,
    careerPhase: 'active',
    ageMonths: 15 * 12,
    month: 0,
    travelState: 'on_land',
    locationId: 'starter_port',
    player: {
      // Temporary, deliberately simple Slice 0 starting data.
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
    ship: {
      condition: 3,
    },
    flags: [],
    items: [],
    npcs: {
      mira: {
        ...createDefaultNpcState(),
        status: 'unavailable',
      },
    },
    history: [],
    scheduledEvents: [],
    currentEventId: null,
    careerStatus: 'active',
    careerEndReason: null,
  };
}
