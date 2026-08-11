import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import {
  selectNextEvent,
} from '../src/game/engine/events';
import { originNarrativeInterpolationParams } from '../src/game/engine/originNarrative';
import { createInitialGameState } from '../src/game/model/initialState';
import type {
  GameState,
  HistoryEntry,
} from '../src/game/model/schema';

function historyEntry(
  eventId: string,
  ageMonths: number,
  choiceId = 'test',
  outcomeId = 'test',
): HistoryEntry {
  return {
    eventId,
    choiceId,
    outcomeId,
    ageMonths,
  };
}

function childhoodState(
  ageMonths: number,
  patch: {
    affiliationId?: string;
    familyStructureId?: string;
    socialClassId?: string;
    raceId?: string;
    locationId?: string;
    history?: HistoryEntry[];
    rngState?: number;
  } = {},
): GameState {
  const state = createInitialGameState(
    patch.rngState ?? 1234,
  );

  state.careerPhase = 'childhood';
  state.ageMonths = ageMonths;
  state.currentEventId = null;
  state.locationId =
    patch.locationId ?? 'foosha_village';

  state.player.profile = {
    name: 'Test',
    raceId: patch.raceId ?? 'human',
    originSeaId: 'east_blue',
    affiliationId:
      patch.affiliationId ?? 'civilian',
    familyStructureId:
      patch.familyStructureId ?? 'two_parents',
    socialClassId:
      patch.socialClassId ?? 'modest',
  };

  state.history = patch.history ?? [];
  return state;
}

function selectedDefinition(
  state: GameState,
) {
  const selected =
    selectNextEvent(state, contentCatalog);

  return contentCatalog.events.find(
    ({ id }) => id === selected.currentEventId,
  );
}

describe(
  'D1.9 early Childhood composition',
  () => {
    it(
      'keeps age one anchored in an Origin Echo',
      () => {
        const selected =
          selectedDefinition(
            childhoodState(12, {
              affiliationId: 'marine',
              locationId: 'shells_town',
            }),
          );

        expect(selected?.openingRole).toBe(
          'origin_echo',
        );
        expect(
          selected?.narrativeFamily,
        ).toMatch(/^origin_/);
      },
    );

    it(
      'guarantees a friend introduction at the age-three checkpoint when still missing',
      () => {
        const selected =
          selectedDefinition(
            childhoodState(36, {
              history: [
                historyEntry(
                  'ch_opening_household_civilian_modest_01',
                  12,
                ),
                historyEntry(
                  'ch_opening_birthplace_rural_01',
                  24,
                ),
              ],
            }),
          );

        expect(selected?.openingRole).toBe(
          'friend_intro',
        );
      },
    );

    it(
      'guarantees a second Origin Echo by the age-four checkpoint',
      () => {
        const selected =
          selectedDefinition(
            childhoodState(48, {
              history: [
                historyEntry(
                  'ch_opening_household_civilian_modest_01',
                  12,
                ),
                historyEntry(
                  'ch_opening_friend_intro_01',
                  24,
                  'return_boat',
                  'boat_returned',
                ),
                historyEntry(
                  'ch_opening_friend_return_01',
                  36,
                ),
              ],
            }),
          );

        expect(selected?.openingRole).toBe(
          'origin_echo',
        );
      },
    );

    it(
      'does not allow a third child-peer Event in a row when a non-peer Opening Event is eligible',
      () => {
        const nonPeerAlternative = {
          id: 'test_origin_cross_alternative',
          kind: 'normal' as const,
          titleKey:
            'event.ch_opening_household_civilian_modest_01.title',
          textKey:
            'event.ch_opening_household_civilian_modest_01.text',
          narrativeFamily:
            'origin_cross' as const,
          openingRole:
            'origin_echo' as const,
          eligibility: {
            type: 'all' as const,
            conditions: [
              {
                type: 'careerPhaseIs' as const,
                phase: 'childhood' as const,
              },
              {
                type: 'ageAtLeastMonths' as const,
                value: 60,
              },
              {
                type: 'ageAtMostMonths' as const,
                value: 71,
              },
            ],
          },
          choices: [
            {
              id: 'test',
              textKey:
                'event.ch_opening_household_civilian_modest_01.choice.point_tool.text',
              resolution: {
                type: 'deterministic' as const,
                outcome: {
                  id: 'test',
                  textKey:
                    'event.ch_opening_household_civilian_modest_01.choice.point_tool.outcome.tool_found.text',
                  effects: [],
                },
              },
            },
          ],
        };

        const catalog = {
          ...contentCatalog,
          events: [
            ...contentCatalog.events,
            nonPeerAlternative,
          ],
        };

        const state =
          childhoodState(60, {
            history: [
              historyEntry(
                'ch_opening_household_civilian_modest_01',
                12,
              ),
              historyEntry(
                'ch_opening_birthplace_rural_01',
                24,
              ),
              historyEntry(
                'ch_opening_friend_intro_01',
                36,
                'return_boat',
                'boat_returned',
              ),
              historyEntry(
                'ch_opening_friend_return_01',
                48,
              ),
            ],
          });

        const selectedState =
          selectNextEvent(
            state,
            catalog,
          );

        const selected =
          catalog.events.find(
            ({ id }) =>
              id ===
              selectedState.currentEventId,
          );

        expect(
          selected?.narrativeFamily,
        ).not.toBe('child_peer');

        expect(
          selected?.id,
        ).toBe(
          'test_origin_cross_alternative',
        );
      },
    );

    it(
      'derives birth prose from Location metadata and Origins choices',
      () => {
        const state = childhoodState(12, {
          affiliationId: 'marine',
          familyStructureId:
            'single_parent',
          raceId: 'fishman',
          locationId: 'shells_town',
        });

        const params =
          originNarrativeInterpolationParams(
            state,
            contentCatalog,
            (key, values = {}) => {
              let text = key;

              for (
                const [name, value]
                of Object.entries(values)
              ) {
                text = text.replace(
                  new RegExp(
                    `{{${name}}}`,
                    'g',
                  ),
                  String(value),
                );
              }

              return text;
            },
          );

        expect(params).toMatchObject({
          birthplaceName:
            'location.shells_town.name',
          birthplaceFlavor:
            'originNarrative.location.military',
          raceFlavor:
            'originNarrative.race.fishman',
        });

        expect(
          params.householdFlavor,
        ).toContain(
          'originNarrative.household.marine',
        );
      },
    );
  },
);
