import { describe, expect, it } from 'vitest';
import {
  CURRENT_SAVE_VERSION,
  clearGameState,
  deserializeGameState,
  loadGameState,
  saveGameState,
  serializeGameState,
} from '../src/game/engine/save';
import { createInitialGameState } from '../src/game/model/initialState';

describe(`save v${CURRENT_SAVE_VERSION}`, () => {
  it('round-trips the current GameState without data loss', () => {
    const state = createInitialGameState(123);
    state.careerPhase = 'active';
    state.ageMonths = 204;
    state.berries = 42;
    state.flags = ['save_round_trip'];
    state.player.stats.health = 47;

    expect(deserializeGameState(serializeGameState(state))).toEqual(state);
  });

  it('rejects malformed JSON and unsupported save versions', () => {
    expect(deserializeGameState('{broken')).toBeNull();
    expect(deserializeGameState(JSON.stringify({}))).toBeNull();

    const unsupported = {
      ...createInitialGameState(),
      version: CURRENT_SAVE_VERSION + 100,
    };
    expect(deserializeGameState(JSON.stringify(unsupported))).toBeNull();
  });

  it('migrates v22 crew role state to the current save version', () => {
    const legacy = structuredClone(createInitialGameState(22)) as unknown as Record<string, any>;
    legacy.version = 22;
    legacy.npcs.mira.status = 'crew';
    delete legacy.npcs.mira.crewRoleId;
    delete legacy.npcs.mira.statsGenerated;
    delete legacy.crewRoleVacatedYear;
    delete legacy.crewReassignmentPending;
    delete legacy.pendingCrewRecruitment;

    const restored = deserializeGameState(JSON.stringify(legacy));

    expect(restored).toMatchObject({
      version: CURRENT_SAVE_VERSION,
      crewRoleVacatedYear: {},
      crewReassignmentPending: false,
      pendingCrewRecruitment: false,
      npcs: {
        mira: {
          crewRoleId: 'navigator',
          statsGenerated: true,
        },
      },
    });
  });

  it('migrates the v21 legacy companion field through v22 and v23', () => {
    const legacy = structuredClone(createInitialGameState(21)) as unknown as Record<string, any>;
    legacy.version = 21;
    legacy.companionNpcId = 'mira';
    delete legacy.player.companion;
    delete legacy.crewRoleVacatedYear;
    delete legacy.crewReassignmentPending;
    delete legacy.pendingCrewRecruitment;

    const restored = deserializeGameState(JSON.stringify(legacy));

    expect(restored).toMatchObject({
      version: CURRENT_SAVE_VERSION,
      player: { companion: null },
      crewRoleVacatedYear: {},
      pendingCrewRecruitment: false,
    });
    expect(restored).not.toHaveProperty('companionNpcId');
  });

  it('persists and clears the current save through StorageLike helpers', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    };
    const state = createInitialGameState(7);
    state.berries = 999;

    expect(saveGameState(storage, state)).toBe(true);
    expect(loadGameState(storage)).toEqual(state);
    expect(clearGameState(storage)).toBe(true);
    expect(loadGameState(storage)).toBeNull();
  });
});
