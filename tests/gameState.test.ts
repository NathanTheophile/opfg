import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../src/game/model/initialState';

describe('GameState v10', () => {
  it('creates an isolated JSON-compatible origin state', () => {
    const first = createInitialGameState(42);
    const second = createInitialGameState(42);
    expect(first).toMatchObject({ version: 10, careerPhase: 'origins', ageMonths: 0, slotInMonth: 0, ship: { shipId: 'starter_sloop', health: 30, cargo: [] }, pendingShip: null, isLeader: true, passengerNpcIds: [], berries: 0 });
    expect(first.player.stats.agility).toBe(25);
    expect(first.player.inventory).toEqual({ capacity: 2, stacks: [] });
    expect(first).not.toHaveProperty('month');
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    first.flags.push('changed');
    expect(second.flags).toEqual([]);
    expect(second.player).not.toBe(first.player);
    expect(second.player.inventory).not.toBe(first.player.inventory);
  });
});
