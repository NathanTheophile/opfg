import type { GameState } from './schema';

const DEFAULT_SEED = 0x1a2b3c4d;

export function createInitialGameState(seed: number = DEFAULT_SEED): GameState {
  return {
    version: 1,
    rngState: seed >>> 0,
    month: 0,
    locationId: 'starter_port',
    player: {
      // Temporary, deliberately simple Slice 0 starting data.
      stats: {
        navigation: 1,
        presence: 1,
        willpower: 1,
      },
      traits: [],
    },
    ship: {
      condition: 3,
    },
    flags: [],
    items: [],
    npcs: {},
    history: [],
    scheduledEvents: [],
    currentEventId: null,
    careerStatus: 'active',
  };
}
