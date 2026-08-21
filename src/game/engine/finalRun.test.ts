import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../content/definitions';
import { createInitialGameState } from '../model/initialState';
import { buildFinalRunReport } from './finalRun';

describe('final run report', () => {
  it('is deterministic, bounded and derived without mutating GameState', () => {
    const state = createInitialGameState(42);
    state.careerStatus = 'ended';
    state.careerEndReason = 'legacy';
    state.endingId = 'career_complete';
    state.player.career.reputation = 50;
    state.berries = 25_000;
    const before = structuredClone(state);

    const first = buildFinalRunReport(state, contentCatalog);
    const second = buildFinalRunReport(state, contentCatalog);

    expect(second).toEqual(first);
    expect(first.score).toBeGreaterThanOrEqual(0);
    expect(first.score).toBeLessThanOrEqual(100);
    expect(first.axes.reduce((sum, axis) => sum + axis.maxPoints, 0))
      .toBe(100);
    expect(state).toEqual(before);
  });
});
