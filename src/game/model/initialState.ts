import type { GameState } from './schema';
import { createDefaultNpcState } from './npcState';

const DEFAULT_SEED = 0x1a2b3c4d;

export function createInitialGameState(seed: number = DEFAULT_SEED): GameState {
  return {
    version: 17,
    rngState: seed >>> 0,
    careerPhase: 'origins',
    ageMonths: 0,
    slotInMonth: 0,
    travelState: 'on_land',
    locationId: 'foosha_village',
    player: {
      profile: { name: null, raceId: null, originSeaId: null, affiliationId: null, familyStructureId: null, socialClassId: null },
      career: { affiliationId: 'civilian', reputation: 0, bounty: 0, rankId: null, titleId: null },
      // Temporary, deliberately simple Slice 0 starting data.
      stats: {
        health: 35,
        morale: 25,
        strength: 25,
        agility: 25,
        observation: 25,
        intelligence: 25,
        navigation: 25,
        charisma: 25,
        luck: 25,
      },
      traits: [],
      inventory: { capacity: 2, stacks: [] },
      powers: { devilFruitId: null, devilFruitAwakening: 0, haki: { observation: 0, armament: 0, conqueror: 0 } },
    },
    ship: null,
    pendingShip: null,
    maritimeEmergency: null,
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
    immediateEventQueue: [],
    pendingSlotPhase: null,
    immediateEventsResolvedInChain: 0,
    navigationDecisionAgeMonths: null,
    shipMarketArrivalPending: false,
    currentEventId: null,
    careerStatus: 'active',
    careerEndReason: null,
    endingId: null,
  };
}
