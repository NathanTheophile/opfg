import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { selectNextEvent } from '../src/game/engine/events';
import { originNarrativeInterpolationParams } from '../src/game/engine/originNarrative';
import { createInitialGameState } from '../src/game/model/initialState';
import type { GameState, HistoryEntry } from '../src/game/model/schema';

function childhoodState(
  ageMonths: number,
  patch: {
    affiliationId?: string;
    familyStructureId?: string;
    socialClassId?: string;
    raceId?: string;
    locationId?: string;
    history?: HistoryEntry[];
  } = {},
): GameState {
  const state = createInitialGameState(1234);
  state.careerPhase = 'childhood';
  state.ageMonths = ageMonths;
  state.currentEventId = null;
  state.locationId = patch.locationId ?? 'foosha_village';
  state.player.profile = {
    name: 'Test',
    raceId: patch.raceId ?? 'human',
    originSeaId: 'east_blue',
    affiliationId: patch.affiliationId ?? 'civilian',
    familyStructureId: patch.familyStructureId ?? 'two_parents',
    socialClassId: patch.socialClassId ?? 'modest',
  };
  state.history = patch.history ?? [];
  return state;
}

describe('D1.8 Childhood opening spine', () => {
  it('prioritizes the authored household opener at age one', () => {
    const marine = selectNextEvent(
      childhoodState(12, {
        affiliationId: 'marine',
        locationId: 'shells_town',
      }),
      contentCatalog,
    );
    expect(marine.currentEventId).toBe(
      'ch_opening_household_marine_01',
    );

    const orphan = selectNextEvent(
      childhoodState(12, {
        affiliationId: 'pirate',
        familyStructureId: 'orphan',
      }),
      contentCatalog,
    );
    expect(orphan.currentEventId).toBe(
      'ch_opening_household_orphan_01',
    );
  });

  it('uses Birth Location tags for the age-two scene', () => {
    expect(
      selectNextEvent(
        childhoodState(24, {
          locationId: 'loguetown',
        }),
        contentCatalog,
      ).currentEventId,
    ).toBe('ch_opening_birthplace_military_01');

    expect(
      selectNextEvent(
        childhoodState(24, {
          locationId: 'foosha_village',
        }),
        contentCatalog,
      ).currentEventId,
    ).toBe('ch_opening_birthplace_rural_01');
  });

  it('introduces the friend before a choice-specific callback', () => {
    expect(
      selectNextEvent(
        childhoodState(36),
        contentCatalog,
      ).currentEventId,
    ).toBe('ch_opening_friend_intro_01');

    const history: HistoryEntry[] = [
      {
        eventId: 'ch_opening_friend_intro_01',
        choiceId: 'add_cargo',
        outcomeId: 'cargo_added',
        ageMonths: 36,
      },
    ];

    expect(
      selectNextEvent(
        childhoodState(48, { history }),
        contentCatalog,
      ).currentEventId,
    ).toBe('ch_opening_friend_cargo_01');
  });

  it('introduces the persistent rival at age five', () => {
    expect(
      selectNextEvent(
        childhoodState(60),
        contentCatalog,
      ).currentEventId,
    ).toBe('ch_opening_rival_intro_01');
  });

  it('derives birth prose from Location metadata and Origins choices', () => {
    const state = childhoodState(12, {
      affiliationId: 'marine',
      familyStructureId: 'single_parent',
      raceId: 'fishman',
      locationId: 'shells_town',
    });

    const params =
      originNarrativeInterpolationParams(
        state,
        contentCatalog,
        (key, values = {}) => {
          let text = key;
          for (const [name, value] of Object.entries(values)) {
            text = text.replace(
              new RegExp(`{{${name}}}`, 'g'),
              String(value),
            );
          }
          return text;
        },
      );

    expect(params).toMatchObject({
      birthplaceName: 'location.shells_town.name',
      birthplaceFlavor:
        'originNarrative.location.military',
      raceFlavor:
        'originNarrative.race.fishman',
    });
    expect(params.householdFlavor).toContain(
      'originNarrative.household.marine',
    );
  });
});
