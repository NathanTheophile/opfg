import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { getPlayerMaxHealth, modifyPlayerHealth } from '../src/game/engine/health';
import { createInitialGameState } from '../src/game/model/initialState';

describe('Player Health', () => {
  it.each(contentCatalog.races)('uses $id initial Health as maximum', (race) => {
    const state = createInitialGameState();
    state.player.profile.raceId = race.id;
    expect(getPlayerMaxHealth(state, contentCatalog)).toBe(race.initialHealth);
  });

  it('clamps damage and healing between zero and Race maximum', () => {
    const state = createInitialGameState();
    state.player.profile.raceId = 'human';
    state.player.stats.health = 10;

    modifyPlayerHealth(state, contentCatalog, -20);
    expect(state.player.stats.health).toBe(0);

    modifyPlayerHealth(state, contentCatalog, 100);
    expect(state.player.stats.health).toBe(40);
  });

  it('requires a defined, known Race', () => {
    const state = createInitialGameState();
    state.player.profile.raceId = null;
    expect(() => getPlayerMaxHealth(state, contentCatalog)).toThrow(/before Race is set/);
  });
});
