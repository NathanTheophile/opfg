import { describe, expect, it } from 'vitest';
import { createMetaProgressionState } from './metaProgression';
import { deserializeMetaProgression } from './storage';

describe('achievement meta storage', () => {
  it('falls back safely on invalid JSON', () => {
    expect(deserializeMetaProgression('{')).toEqual(createMetaProgressionState());
  });

  it('drops unknown achievement IDs instead of trusting persisted data', () => {
    const state = deserializeMetaProgression(JSON.stringify({
      version: 1,
      unlocks: {
        progression_first_active: { unlockedAt: 10 },
        future_unknown: { unlockedAt: 20 },
      },
      completedChildhoodRaceIds: [],
      discoveredFamilyUniqueItemIds: [],
      consumedDevilFruitTypes: [],
      startedOriginSeaIds: [],
    }));
    expect(state.unlocks.progression_first_active).toEqual({ unlockedAt: 10 });
    expect(state.unlocks).not.toHaveProperty('future_unknown');
  });
});
