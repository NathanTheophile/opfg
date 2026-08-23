import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../model/initialState';
import {
  archiveCompletedRun,
  completedRunId,
  COMPLETED_RUNS_KEY,
  loadCompletedRuns,
} from './completedRuns';

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe('completed run history', () => {
  it('archives ended runs once and keeps active saves out', () => {
    const storage = new MemoryStorage();
    const active = createInitialGameState(123);

    archiveCompletedRun(storage, active, 1);
    expect(storage.getItem(COMPLETED_RUNS_KEY)).toBeNull();

    const ended = {
      ...active,
      careerStatus: 'ended' as const,
      careerEndReason: 'legacy' as const,
      endingId: 'career_complete',
    };

    archiveCompletedRun(storage, ended, 10);

    const sameRunAfterPresentationCleanup = {
      ...ended,
      currentEventId: 'presentation-only-event-id',
    };
    expect(completedRunId(sameRunAfterPresentationCleanup)).toBe(completedRunId(ended));

    archiveCompletedRun(storage, sameRunAfterPresentationCleanup, 20);

    const runs = loadCompletedRuns(storage);
    expect(runs).toHaveLength(1);
    expect(runs[0].completedAt).toBe(10);
    expect(runs[0].state.endingId).toBe('career_complete');
  });
});
