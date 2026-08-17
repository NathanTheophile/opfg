import type { NpcState, NpcStats } from './schema';

export function createDefaultNpcStats(): NpcStats {
  return {
    health: 25,
    morale: 25,
    strength: 25,
    agility: 25,
    observation: 25,
    intelligence: 25,
    navigation: 25,
    charisma: 25,
    luck: 25,
  };
}

export function createDefaultNpcState(): NpcState {
  return {
    raceId: null,
    displayName: null,
    status: 'known',
    relationship: 0,
    lastInteractionAgeMonths: null,
    crewRoleId: null,
    statsGenerated: false,
    stats: createDefaultNpcStats(),
    powers: { devilFruitId: null, devilFruitAwakening: 0, haki: { observation: 0, armament: 0, conqueror: 0 } },
  };
}
