import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../src/game/model/initialState';

describe('GameState v7', () => {
  it('creates an isolated JSON-compatible origin state', () => {
    const first = createInitialGameState(42);
    const second = createInitialGameState(42);
    expect(first).toMatchObject({ version: 7, careerPhase: 'origins', ageMonths: 0, slotInMonth: 0, ship: { condition: 3 } });
    expect(first).not.toHaveProperty('month');
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    first.flags.push('changed');
    expect(second.flags).toEqual([]);
    expect(second.player).not.toBe(first.player);
  });
});
