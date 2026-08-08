import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../src/game/model/initialState';
import { deserializeGameState, serializeGameState } from '../src/game/engine/save';

describe('save v7', () => {
  it('round-trips every v7 field including slot, dead NPCs, and a lost ship', () => {
    const state = createInitialGameState(123);
    state.careerPhase = 'active';
    state.ageMonths = 204;
    state.slotInMonth = 1;
    state.ship = null;
    state.npcs.mira = { status: 'dead', relationship: 4, stats: { health: 0, morale: 10, strength: 10, observation: 10, intelligence: 10, luck: 10, loyalty: 10, calm: 10 } };
    state.history.push({ eventId: 'event', choiceId: 'choice', outcomeId: 'outcome', ageMonths: 204 });
    expect(deserializeGameState(serializeGameState(state))).toEqual(state);
  });

  it('rejects legacy v6 and invalid non-active slots', () => {
    const legacy = { ...createInitialGameState(), version: 6 };
    expect(deserializeGameState(JSON.stringify(legacy))).toBeNull();
    const invalid = { ...createInitialGameState(), slotInMonth: 1 };
    expect(deserializeGameState(JSON.stringify(invalid))).toBeNull();
  });
});
