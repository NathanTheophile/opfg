import type { NpcState, NpcStats } from './schema';

export function createDefaultNpcStats(): NpcStats {
  return {
    health: 25,
    morale: 25,
    strength: 25,
    observation: 25,
    intelligence: 25,
    luck: 25,
    loyalty: 25,
    calm: 25,
  };
}

export function createDefaultNpcState(): NpcState {
  return {
    status: 'known',
    relationship: 0,
    stats: createDefaultNpcStats(),
  };
}
