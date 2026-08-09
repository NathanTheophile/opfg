import type { GameState } from './schema';
import { createDefaultNpcState } from './npcState';

const DEFAULT_SEED = 0x1a2b3c4d;

export function createInitialGameState(seed: number = DEFAULT_SEED): GameState {
  return {
    version: 10,
    rngState: seed >>> 0,
    careerPhase: 'origins',
    ageMonths: 0,
    slotInMonth: 0,
    travelState: 'on_land',
    locationId: 'starter_port',
    player: {
      profile: { name: null, raceId: null, originSeaId: null, affiliationId: null },
      // Temporary, deliberately simple Slice 0 starting data.
      stats: {
        health: 25,
        morale: 25,
        strength: 25,
        agility: 25,
        observation: 25,
        intelligence: 25,
        navigation: 25,
        charisma: 25,
        luck: 25,
        awakening: null,
      },
      traits: [],
      inventory: { capacity: 2, stacks: [] },
    },
    ship: {
      shipId: 'starter_sloop',
      name: 'Wind Finch',
      health: 30,
      cargo: [],
    },
    pendingShip: null,
    isLeader: true,
    passengerNpcIds: [],
    berries: 0,
    flags: [],
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
