import { describe, expect, it } from 'vitest';
import { createMetaProgressionState } from './metaProgression';
import { deserializeMetaProgression, loadMetaProgression, saveMetaProgression } from './storage';
import { clearGameState } from '../engine/save';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

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

  it('filters unknown collected identifiers from persisted meta progression', () => {
    const state = deserializeMetaProgression(JSON.stringify({
      version: 1,
      unlocks: {},
      completedChildhoodRaceIds: ['human', 'future_race'],
      discoveredFamilyUniqueItemIds: ['civilian_workshop_toolkit', 'future_item'],
      consumedDevilFruitTypes: ['paramecia', 'ancient'],
      startedOriginSeaIds: ['east_blue', 'moon_blue'],
    }));

    expect(state.completedChildhoodRaceIds).toEqual(['human']);
    expect(state.discoveredFamilyUniqueItemIds).toEqual(['civilian_workshop_toolkit']);
    expect(state.consumedDevilFruitTypes).toEqual(['paramecia']);
    expect(state.startedOriginSeaIds).toEqual(['east_blue']);
  });

  it('survives clearing the current run save', () => {
    const storage = new MemoryStorage();
    const meta = createMetaProgressionState();
    meta.unlocks.progression_first_active = { unlockedAt: 10 };

    expect(saveMetaProgression(storage, meta)).toBe(true);
    clearGameState(storage);

    expect(loadMetaProgression(storage).unlocks.progression_first_active).toEqual({ unlockedAt: 10 });
  });
});
