import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../src/game/model/initialState';

describe('GameState v21', () => {
  it('creates an isolated JSON-compatible origin state', () => {
    const first = createInitialGameState(42);
    const second = createInitialGameState(42);
    expect(first).toMatchObject({ version: 21, careerPhase: 'origins', ageMonths: 0, slotInMonth: 0, player: { career: { affiliationId: 'civilian', reputation: 0, bounty: 0, rankId: null, titleId: null } }, ship: null, pendingShip: null, maritimeEmergency: null, isLeader: true, passengerNpcIds: [], berries: 0, endingId: null });
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
