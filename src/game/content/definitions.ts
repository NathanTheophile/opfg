import { CONTENT_SCHEMA_VERSION } from './schema';
import { eventTitleKey, eventTextKey, choiceTextKey, outcomeTextKey, choicePlaceholderKey, modifierLabelKey, traitNameKey, traitDescriptionKey, itemNameKey, raceNameKey, seaNameKey, affiliationNameKey, npcNameKey } from '../localization/keys';
import type { ContentCatalog, EventDefinition } from './schema';

const childhoodFixtureEvents = Array.from({ length: 20 }, (_, index): EventDefinition => {
  const id = `childhood_fixture_${String(index + 1).padStart(2, '0')}`;
  return {
    id, kind: 'normal', titleKey: 'fixture.childhood.title', textKey: 'fixture.childhood.text',
    eligibility: { type: 'careerPhaseIs', phase: 'childhood' },
    choices: [{ id: 'continue', textKey: 'fixture.childhood.choice', resolution: { type: 'deterministic', outcome: {
      id: 'continued', textKey: 'fixture.childhood.outcome', effects: [],
    } } }],
  };
});

export const contentCatalog = {
  schemaVersion: CONTENT_SCHEMA_VERSION,
  // Temporary T12 registries, pending final game-design catalogs.
  races: [{ id: 'human', nameKey: raceNameKey('human') }],
  seas: [{ id: 'starter_sea', nameKey: seaNameKey('starter_sea') }],
  affiliations: [{ id: 'independent_family', nameKey: affiliationNameKey('independent_family') }],
  locations: [
    { id: 'starter_port', blocksScheduledEvents: false }, { id: 'open_sea', blocksScheduledEvents: false },
    { id: 'outer_route', blocksScheduledEvents: false }, { id: 'isolated_cove', blocksScheduledEvents: true },
    { id: 'shipwreck_shore', blocksScheduledEvents: false },
  ],
  traits: [
    { id: 'audacious', nameKey: traitNameKey('audacious'), descriptionKey: traitDescriptionKey('audacious'), oppositeTraitId: 'cautious' },
    { id: 'cautious', nameKey: traitNameKey('cautious'), descriptionKey: traitDescriptionKey('cautious'), oppositeTraitId: 'audacious' },
    { id: 'resilient', nameKey: traitNameKey('resilient'), descriptionKey: traitDescriptionKey('resilient') },
  ],
  items: [
    { id: 'sealed_chart', nameKey: itemNameKey('sealed_chart') },
    { id: 'mira_letter_of_passage', nameKey: itemNameKey('mira_letter_of_passage') },
  ],
  npcs: [{
    id: 'mira',
    nameKey: npcNameKey('mira'),
    raceId: null,
    originSeaId: null,
    affiliationId: null,
    initialStats: {
      health: 25,
      morale: 25,
      strength: 25,
      observation: 25,
      intelligence: 25,
      luck: 25,
      loyalty: 25,
      calm: 25,
    },
  }],
  events: [
    {
      id: 'origin_name', titleKey: eventTitleKey('origin_name'), textKey: eventTextKey('origin_name'), kind: 'normal',
      eligibility: { type: 'careerPhaseIs', phase: 'origins' },
      choices: [{
        id: 'confirm_name', textKey: choiceTextKey('origin_name', 'confirm_name'),
        input: { type: 'text', target: 'playerName', minLength: 1, maxLength: 32, placeholderKey: choicePlaceholderKey('origin_name', 'confirm_name') },
        resolution: { type: 'deterministic', outcome: { id: 'name_chosen', textKey: outcomeTextKey('origin_name', 'confirm_name', 'name_chosen'), effects: [] } },
      }],
    },
    {
      id: 'origin_race', titleKey: eventTitleKey('origin_race'), textKey: eventTextKey('origin_race'), kind: 'normal',
      eligibility: { type: 'all', conditions: [{ type: 'careerPhaseIs', phase: 'origins' }, { type: 'hasPlayed', eventId: 'origin_name' }] },
      choices: [{ id: 'human', textKey: choiceTextKey('origin_race', 'human'), resolution: { type: 'deterministic', outcome: { id: 'human_origin', textKey: outcomeTextKey('origin_race', 'human', 'human_origin'), effects: [{ type: 'setRace', raceId: 'human' }] } } }],
    },
    {
      id: 'origin_sea', titleKey: eventTitleKey('origin_sea'), textKey: eventTextKey('origin_sea'), kind: 'normal',
      eligibility: { type: 'all', conditions: [{ type: 'careerPhaseIs', phase: 'origins' }, { type: 'hasPlayed', eventId: 'origin_race' }] },
      choices: [{ id: 'starter_sea', textKey: choiceTextKey('origin_sea', 'starter_sea'), resolution: { type: 'deterministic', outcome: { id: 'starter_sea_origin', textKey: outcomeTextKey('origin_sea', 'starter_sea', 'starter_sea_origin'), effects: [{ type: 'setOriginSea', seaId: 'starter_sea' }] } } }],
    },
    {
      id: 'origin_affiliation', titleKey: eventTitleKey('origin_affiliation'), textKey: eventTextKey('origin_affiliation'), kind: 'normal',
      eligibility: { type: 'all', conditions: [{ type: 'careerPhaseIs', phase: 'origins' }, { type: 'hasPlayed', eventId: 'origin_sea' }] },
      choices: [{ id: 'independent_family', textKey: choiceTextKey('origin_affiliation', 'independent_family'), resolution: { type: 'deterministic', outcome: { id: 'independent_origin', textKey: outcomeTextKey('origin_affiliation', 'independent_family', 'independent_origin'), effects: [{ type: 'setAffiliation', affiliationId: 'independent_family' }] } } }],
    },
    {
      id: 'origin_tendency', titleKey: eventTitleKey('origin_tendency'), textKey: eventTextKey('origin_tendency'), kind: 'normal',
      eligibility: { type: 'all', conditions: [{ type: 'careerPhaseIs', phase: 'origins' }, { type: 'hasPlayed', eventId: 'origin_affiliation' }] },
      choices: [{ id: 'observe', textKey: choiceTextKey('origin_tendency', 'observe'), resolution: { type: 'deterministic', outcome: { id: 'observant_start', textKey: outcomeTextKey('origin_tendency', 'observe', 'observant_start'), effects: [{ type: 'modifyStat', statId: 'observation', amount: 2 }] } } }],
    },
    {
      id: 'origin_to_childhood', titleKey: eventTitleKey('origin_to_childhood'), textKey: eventTextKey('origin_to_childhood'), kind: 'normal',
      eligibility: { type: 'all', conditions: [{ type: 'careerPhaseIs', phase: 'origins' }, { type: 'hasPlayed', eventId: 'origin_tendency' }] },
      choices: [{ id: 'begin_childhood', textKey: choiceTextKey('origin_to_childhood', 'begin_childhood'), resolution: { type: 'deterministic', outcome: { id: 'childhood_begins', textKey: outcomeTextKey('origin_to_childhood', 'begin_childhood', 'childhood_begins'), effects: [{ type: 'setCareerPhase', phase: 'childhood' }, { type: 'addTrait', traitId: 'audacious' }, { type: 'scheduleEvent', eventId: 'childhood_memory', delayMonths: 48 }] } } }],
    },
    {
      id: 'childhood_early', titleKey: eventTitleKey('childhood_early'), textKey: eventTextKey('childhood_early'), kind: 'normal',
      eligibility: { type: 'all', conditions: [{ type: 'careerPhaseIs', phase: 'childhood' }, { type: 'ageAtMostMonths', value: 59 }] },
      choices: [{ id: 'explore', textKey: choiceTextKey('childhood_early', 'explore'), resolution: { type: 'deterministic', outcome: { id: 'early_growth', textKey: outcomeTextKey('childhood_early', 'explore', 'early_growth'), effects: [{ type: 'modifyStat', statId: 'health', amount: 1 }] } } }],
    },
    {
      id: 'childhood_middle', titleKey: eventTitleKey('childhood_middle'), textKey: eventTextKey('childhood_middle'), kind: 'normal',
      eligibility: { type: 'all', conditions: [{ type: 'careerPhaseIs', phase: 'childhood' }, { type: 'ageAtLeastMonths', value: 60 }, { type: 'ageAtMostMonths', value: 107 }, { type: 'originSeaIs', seaId: 'starter_sea' }] },
      choices: [{ id: 'watch_horizon', textKey: choiceTextKey('childhood_middle', 'watch_horizon'), resolution: { type: 'deterministic', outcome: { id: 'middle_growth', textKey: outcomeTextKey('childhood_middle', 'watch_horizon', 'middle_growth'), effects: [{ type: 'modifyStat', statId: 'navigation', amount: 2 }] } } }],
    },
    {
      id: 'childhood_memory', titleKey: eventTitleKey('childhood_memory'), textKey: eventTextKey('childhood_memory'), kind: 'scheduled', priority: 100, scheduledReach: 'normal',
      eligibility: { type: 'careerPhaseIs', phase: 'childhood' },
      choices: [{ id: 'remember', textKey: choiceTextKey('childhood_memory', 'remember'), resolution: { type: 'deterministic', outcome: { id: 'memory_kept', textKey: outcomeTextKey('childhood_memory', 'remember', 'memory_kept'), effects: [{ type: 'addTrait', traitId: 'resilient' }] } } }],
    },
    {
      id: 'childhood_late', titleKey: eventTitleKey('childhood_late'), textKey: eventTextKey('childhood_late'), kind: 'normal',
      eligibility: { type: 'all', conditions: [{ type: 'careerPhaseIs', phase: 'childhood' }, { type: 'ageAtLeastMonths', value: 108 }, { type: 'ageAtMostMonths', value: 143 }] },
      choices: [{ id: 'learn', textKey: choiceTextKey('childhood_late', 'learn'), resolution: { type: 'deterministic', outcome: { id: 'late_growth', textKey: outcomeTextKey('childhood_late', 'learn', 'late_growth'), effects: [{ type: 'modifyStat', statId: 'intelligence', amount: 2 }] } } }],
    },
    {
      id: 'childhood_final', titleKey: eventTitleKey('childhood_final'), textKey: eventTextKey('childhood_final'), kind: 'normal',
      eligibility: { type: 'all', conditions: [{ type: 'careerPhaseIs', phase: 'childhood' }, { type: 'ageAtLeastMonths', value: 144 }, { type: 'ageAtMostMonths', value: 179 }] },
      choices: [{ id: 'prepare', textKey: choiceTextKey('childhood_final', 'prepare'), resolution: { type: 'deterministic', outcome: { id: 'final_growth', textKey: outcomeTextKey('childhood_final', 'prepare', 'final_growth'), effects: [{ type: 'addTrait', traitId: 'audacious' }] } } }],
    },
    {
      id: 'childhood_to_active', titleKey: eventTitleKey('childhood_to_active'), textKey: eventTextKey('childhood_to_active'), kind: 'normal',
      eligibility: { type: 'all', conditions: [{ type: 'careerPhaseIs', phase: 'childhood' }, { type: 'ageAtLeastMonths', value: 180 }] },
      choices: [{ id: 'begin_active', textKey: choiceTextKey('childhood_to_active', 'begin_active'), resolution: { type: 'deterministic', outcome: { id: 'active_begins', textKey: outcomeTextKey('childhood_to_active', 'begin_active', 'active_begins'), effects: [{ type: 'setCareerPhase', phase: 'active' }] } } }],
    },
    ...childhoodFixtureEvents,
    {
      id: 'critical_player_death', kind: 'critical', trigger: { type: 'playerHealthDepleted' }, titleKey: eventTitleKey('critical_player_death'), textKey: eventTextKey('critical_player_death'),
      choices: [{ id: 'accept_death', textKey: choiceTextKey('critical_player_death', 'accept_death'), resolution: { type: 'deterministic', outcome: { id: 'death', textKey: outcomeTextKey('critical_player_death', 'accept_death', 'death'), effects: [{ type: 'endCareer', reason: 'death' }] } } }],
    },
    {
      id: 'critical_mira_death', kind: 'critical', trigger: { type: 'npcHealthDepleted', npcId: 'mira' }, titleKey: eventTitleKey('critical_mira_death'), textKey: eventTextKey('critical_mira_death'),
      choices: [{ id: 'mourn_mira', textKey: choiceTextKey('critical_mira_death', 'mourn_mira'), resolution: { type: 'deterministic', outcome: { id: 'mira_dead', textKey: outcomeTextKey('critical_mira_death', 'mourn_mira', 'mira_dead'), effects: [{ type: 'setNpcStatus', npcId: 'mira', status: 'dead' }] } } }],
    },
    {
      id: 'critical_ship_destroyed', kind: 'critical', trigger: { type: 'shipDestroyed' }, titleKey: eventTitleKey('critical_ship_destroyed'), textKey: eventTextKey('critical_ship_destroyed'),
      choices: [{ id: 'reach_shore', textKey: choiceTextKey('critical_ship_destroyed', 'reach_shore'), resolution: { type: 'deterministic', outcome: { id: 'ship_lost', textKey: outcomeTextKey('critical_ship_destroyed', 'reach_shore', 'ship_lost'), effects: [{ type: 'loseShip', locationId: 'shipwreck_shore', travelState: 'on_land' }] } } }],
    },
    {
      id: 'departure',
      titleKey: eventTitleKey('departure'),
      textKey: eventTextKey('departure'),
      eligibility: { type: 'all', conditions: [{ type: 'careerPhaseIs', phase: 'active' }, { type: 'locationIs', locationId: 'starter_port' }] },
      kind: 'normal',
      choices: [
        {
          id: 'set_sail',
          textKey: choiceTextKey('departure', 'set_sail'),
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'departure_set_sail',
              textKey: outcomeTextKey('departure', 'set_sail', 'departure_set_sail'),
              effects: [
                { type: 'setFlag', flagId: 'career_departed' },
                { type: 'moveToLocation', locationId: 'open_sea', travelState: 'at_sea' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'mira_castaway',
      titleKey: eventTitleKey('mira_castaway'),
      textKey: eventTextKey('mira_castaway'),
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'careerPhaseIs', phase: 'active' },
          { type: 'hasFlag', flagId: 'career_departed' },
          { type: 'locationIs', locationId: 'open_sea' },
          { type: 'npcStatusIs', npcId: 'mira', status: 'unavailable' },
        ],
      },
      kind: 'normal',
      choices: [
        {
          id: 'rescue_recruit',
          textKey: choiceTextKey('mira_castaway', 'rescue_recruit'),
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_castaway_recruited',
              textKey: outcomeTextKey('mira_castaway', 'rescue_recruit', 'mira_castaway_recruited'),
              effects: [
                { type: 'setNpcStatus', npcId: 'mira', status: 'crew' },
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: 25 },
                { type: 'setFlag', flagId: 'mira_rescued' },
                { type: 'setFlag', flagId: 'castaway_resolved' },
              ],
            },
          },
        },
        {
          id: 'rescue_dropoff',
          textKey: choiceTextKey('mira_castaway', 'rescue_dropoff'),
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_castaway_dropped_off',
              textKey: outcomeTextKey('mira_castaway', 'rescue_dropoff', 'mira_castaway_dropped_off'),
              effects: [
                { type: 'setNpcStatus', npcId: 'mira', status: 'departed' },
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: 15 },
                { type: 'setFlag', flagId: 'mira_rescued' },
                { type: 'setFlag', flagId: 'castaway_resolved' },
                { type: 'scheduleEvent', eventId: 'mira_returns_favor', delayMonths: 6 },
              ],
            },
          },
        },
        {
          id: 'leave_mira',
          textKey: choiceTextKey('mira_castaway', 'leave_mira'),
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_castaway_abandoned',
              textKey: outcomeTextKey('mira_castaway', 'leave_mira', 'mira_castaway_abandoned'),
              effects: [
                { type: 'setNpcStatus', npcId: 'mira', status: 'unavailable' },
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: -20 },
                { type: 'setFlag', flagId: 'mira_abandoned' },
                { type: 'setFlag', flagId: 'castaway_resolved' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'black_squall',
      titleKey: eventTitleKey('black_squall'),
      textKey: eventTextKey('black_squall'),
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'careerPhaseIs', phase: 'active' },
          { type: 'hasFlag', flagId: 'castaway_resolved' },
          { type: 'locationIs', locationId: 'open_sea' },
        ],
      },
      kind: 'normal',
      choices: [
        {
          id: 'cut_through_squall',
          textKey: choiceTextKey('black_squall', 'cut_through_squall'),
          resolution: {
            type: 'dice',
            statId: 'navigation',
            successThreshold: 13,
            modifiers: [
              {
                condition: { type: 'shipConditionAtMost', value: 1 },
                value: -4,
                displayLabelKey: modifierLabelKey('black_squall', 'cut_through_squall', '0'),
              },
            ],
            outcomes: {
              criticalFailure: {
                    id: 'black_squall_catastrophe', textKey: outcomeTextKey('black_squall', 'cut_through_squall', 'black_squall_catastrophe'),
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'setFlag', flagId: 'black_squall_disaster' },
                      { type: 'setFlag', flagId: 'black_squall_resolved' },
                    ],
              },
              failure: {
                    id: 'black_squall_failure', textKey: outcomeTextKey('black_squall', 'cut_through_squall', 'black_squall_failure'),
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'setFlag', flagId: 'black_squall_resolved' },
                    ],
              },
              success: {
                    id: 'black_squall_success', textKey: outcomeTextKey('black_squall', 'cut_through_squall', 'black_squall_success'),
                    effects: [{ type: 'setFlag', flagId: 'black_squall_resolved' }],
              },
              criticalSuccess: {
                    id: 'black_squall_exceptional', textKey: outcomeTextKey('black_squall', 'cut_through_squall', 'black_squall_exceptional'),
                    effects: [
                      { type: 'setFlag', flagId: 'black_squall_mastered' },
                      { type: 'setFlag', flagId: 'black_squall_resolved' },
                    ],
              },
            },
          },
        },
        {
          id: 'heave_to',
          textKey: choiceTextKey('black_squall', 'heave_to'),
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'black_squall_waited', textKey: outcomeTextKey('black_squall', 'heave_to', 'black_squall_waited'),
              effects: [
                { type: 'setFlag', flagId: 'black_squall_delayed' },
                { type: 'setFlag', flagId: 'black_squall_resolved' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'wreck',
      titleKey: eventTitleKey('wreck'),
      textKey: eventTextKey('wreck'),
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'careerPhaseIs', phase: 'active' },
          { type: 'hasFlag', flagId: 'black_squall_resolved' },
          { type: 'locationIs', locationId: 'open_sea' },
        ],
      },
      kind: 'normal',
      choices: [
        {
          id: 'search_wreck',
          textKey: choiceTextKey('wreck', 'search_wreck'),
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'wreck_chart_found', textKey: outcomeTextKey('wreck', 'search_wreck', 'wreck_chart_found'),
              effects: [
                { type: 'addItem', itemId: 'sealed_chart' },
                { type: 'setFlag', flagId: 'wreck_searched' },
                { type: 'setFlag', flagId: 'wreck_resolved' },
              ],
            },
          },
        },
        {
          id: 'leave_wreck',
          textKey: choiceTextKey('wreck', 'leave_wreck'),
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'wreck_ignored', textKey: outcomeTextKey('wreck', 'leave_wreck', 'wreck_ignored'),
              effects: [{ type: 'setFlag', flagId: 'wreck_resolved' }],
            },
          },
        },
      ],
    },
    {
      id: 'reefs',
      titleKey: eventTitleKey('reefs'),
      textKey: eventTextKey('reefs'),
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'careerPhaseIs', phase: 'active' },
          { type: 'hasFlag', flagId: 'wreck_resolved' },
          { type: 'locationIs', locationId: 'open_sea' },
        ],
      },
      kind: 'normal',
      choices: [
        {
          id: 'force_passage',
          textKey: choiceTextKey('reefs', 'force_passage'),
          resolution: {
            type: 'dice',
            statId: 'navigation',
            successThreshold: 13,
            modifiers: [{
              condition: { type: 'shipConditionAtMost', value: 1 },
              value: -3,
              displayLabelKey: modifierLabelKey('reefs', 'force_passage', '0'),
            }],
            outcomes: {
              criticalFailure: {
                    id: 'reefs_force_catastrophe', textKey: outcomeTextKey('reefs', 'force_passage', 'reefs_force_catastrophe'),
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'setFlag', flagId: 'reefs_hard_crossing' },
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
              failure: {
                    id: 'reefs_force_failure', textKey: outcomeTextKey('reefs', 'force_passage', 'reefs_force_failure'),
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
              success: {
                    id: 'reefs_force_success', textKey: outcomeTextKey('reefs', 'force_passage', 'reefs_force_success'),
                    effects: [
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
              criticalSuccess: {
                    id: 'reefs_force_exceptional', textKey: outcomeTextKey('reefs', 'force_passage', 'reefs_force_exceptional'),
                    effects: [
                      { type: 'setFlag', flagId: 'reefs_clean_crossing' },
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
            },
          },
        },
        {
          id: 'read_currents',
          textKey: choiceTextKey('reefs', 'read_currents'),
          availableIf: { type: 'statAtLeast', statId: 'navigation', value: 35 },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'reefs_navigation_solution', textKey: outcomeTextKey('reefs', 'read_currents', 'reefs_navigation_solution'),
              effects: [
                { type: 'setFlag', flagId: 'reefs_clean_crossing' },
                { type: 'setFlag', flagId: 'reefs_crossed' },
                { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
              ],
            },
          },
        },
        {
          id: 'use_sealed_chart',
          textKey: choiceTextKey('reefs', 'use_sealed_chart'),
          visibleIf: { type: 'hasItem', itemId: 'sealed_chart' },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'reefs_chart_solution', textKey: outcomeTextKey('reefs', 'use_sealed_chart', 'reefs_chart_solution'),
              effects: [
                { type: 'setFlag', flagId: 'reefs_clean_crossing' },
                { type: 'setFlag', flagId: 'reefs_crossed' },
                { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
              ],
            },
          },
        },
        {
          id: 'ride_breakers',
          textKey: choiceTextKey('reefs', 'ride_breakers'),
          visibleIf: { type: 'hasTrait', traitId: 'audacious' },
          resolution: {
            type: 'dice',
            statId: 'morale',
            successThreshold: 13,
            modifiers: [{
              condition: { type: 'shipConditionAtMost', value: 1 },
              value: -3,
              displayLabelKey: modifierLabelKey('reefs', 'ride_breakers', '0'),
            }],
            outcomes: {
              criticalFailure: {
                    id: 'reefs_breakers_catastrophe', textKey: outcomeTextKey('reefs', 'ride_breakers', 'reefs_breakers_catastrophe'),
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'setFlag', flagId: 'reefs_hard_crossing' },
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
              failure: {
                    id: 'reefs_breakers_failure', textKey: outcomeTextKey('reefs', 'ride_breakers', 'reefs_breakers_failure'),
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
              success: {
                    id: 'reefs_breakers_success', textKey: outcomeTextKey('reefs', 'ride_breakers', 'reefs_breakers_success'),
                    effects: [
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
              criticalSuccess: {
                    id: 'reefs_breakers_exceptional', textKey: outcomeTextKey('reefs', 'ride_breakers', 'reefs_breakers_exceptional'),
                    effects: [
                      { type: 'setFlag', flagId: 'reefs_clean_crossing' },
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
            },
          },
        },
      ],
    },
    {
      id: 'mira_confession',
      titleKey: eventTitleKey('mira_confession'),
      textKey: eventTextKey('mira_confession'),
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'careerPhaseIs', phase: 'active' },
          { type: 'hasFlag', flagId: 'black_squall_resolved' },
          { type: 'npcStatusIs', npcId: 'mira', status: 'crew' },
          
        ],
      },
      kind: 'normal',
      choices: [
        {
          id: 'trust_mira',
          textKey: choiceTextKey('mira_confession', 'trust_mira'),
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_confession_trusted', textKey: outcomeTextKey('mira_confession', 'trust_mira', 'mira_confession_trusted'),
              effects: [
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: 20 },
                { type: 'setFlag', flagId: 'mira_trusted' },
                { type: 'setFlag', flagId: 'mira_confession_resolved' },
              ],
            },
          },
        },
        {
          id: 'keep_watch',
          textKey: choiceTextKey('mira_confession', 'keep_watch'),
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_confession_watched', textKey: outcomeTextKey('mira_confession', 'keep_watch', 'mira_confession_watched'),
              effects: [
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: -5 },
                { type: 'setFlag', flagId: 'mira_mistrusted' },
                { type: 'setFlag', flagId: 'mira_confession_resolved' },
              ],
            },
          },
        },
        {
          id: 'put_mira_ashore',
          textKey: choiceTextKey('mira_confession', 'put_mira_ashore'),
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_confession_exiled', textKey: outcomeTextKey('mira_confession', 'put_mira_ashore', 'mira_confession_exiled'),
              effects: [
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: -20 },
                { type: 'setNpcStatus', npcId: 'mira', status: 'departed' },
                { type: 'setFlag', flagId: 'mira_confession_resolved' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'mira_hunters',
      titleKey: eventTitleKey('mira_hunters'),
      textKey: eventTextKey('mira_hunters'),
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'careerPhaseIs', phase: 'active' },
          { type: 'hasFlag', flagId: 'reefs_crossed' },
          { type: 'locationIs', locationId: 'outer_route' },
          { type: 'npcStatusIs', npcId: 'mira', status: 'crew' },
          {
            type: 'any',
            conditions: [
              { type: 'hasChosen', eventId: 'mira_confession', choiceId: 'trust_mira' },
              { type: 'hasChosen', eventId: 'mira_confession', choiceId: 'keep_watch' },
            ],
          },
          
        ],
      },
      kind: 'normal',
      choices: [
        {
          id: 'let_mira_speak',
          textKey: choiceTextKey('mira_hunters', 'let_mira_speak'),
          availableIf: { type: 'npcRelationshipAtLeast', npcId: 'mira', value: 40 },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_hunters_negotiated', textKey: outcomeTextKey('mira_hunters', 'let_mira_speak', 'mira_hunters_negotiated'),
              effects: [
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: 10 },
                { type: 'setFlag', flagId: 'mira_hunters_peaceful' },
                { type: 'setFlag', flagId: 'mira_hunters_resolved' },
              ],
            },
          },
        },
        {
          id: 'bluff_hunters',
          textKey: choiceTextKey('mira_hunters', 'bluff_hunters'),
          availableIf: { type: 'statAtLeast', statId: 'charisma', value: 35 },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_hunters_bluffed', textKey: outcomeTextKey('mira_hunters', 'bluff_hunters', 'mira_hunters_bluffed'),
              effects: [
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: 5 },
                { type: 'setFlag', flagId: 'mira_hunters_resolved' },
              ],
            },
          },
        },
        {
          id: 'outrun_hunters',
          textKey: choiceTextKey('mira_hunters', 'outrun_hunters'),
          resolution: {
            type: 'dice',
            statId: 'navigation',
            successThreshold: 13,
            modifiers: [{
              condition: { type: 'shipConditionAtMost', value: 1 },
              value: -4,
              displayLabelKey: modifierLabelKey('mira_hunters', 'outrun_hunters', '0'),
            }],
            outcomes: {
              criticalFailure: {
                    id: 'mira_hunters_escape_catastrophe', textKey: outcomeTextKey('mira_hunters', 'outrun_hunters', 'mira_hunters_escape_catastrophe'),
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'modifyNpcRelationship', npcId: 'mira', amount: -10 },
                      { type: 'setNpcStatus', npcId: 'mira', status: 'departed' },
                      { type: 'setFlag', flagId: 'mira_hunters_resolved' },
                    ],
              },
              failure: {
                    id: 'mira_hunters_escape_failure', textKey: outcomeTextKey('mira_hunters', 'outrun_hunters', 'mira_hunters_escape_failure'),
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'modifyNpcRelationship', npcId: 'mira', amount: -5 },
                      { type: 'setFlag', flagId: 'mira_hunters_resolved' },
                    ],
              },
              success: {
                    id: 'mira_hunters_escape_success', textKey: outcomeTextKey('mira_hunters', 'outrun_hunters', 'mira_hunters_escape_success'),
                    effects: [
                      { type: 'modifyNpcRelationship', npcId: 'mira', amount: 10 },
                      { type: 'setFlag', flagId: 'mira_hunters_resolved' },
                    ],
              },
              criticalSuccess: {
                    id: 'mira_hunters_escape_exceptional', textKey: outcomeTextKey('mira_hunters', 'outrun_hunters', 'mira_hunters_escape_exceptional'),
                    effects: [
                      { type: 'modifyNpcRelationship', npcId: 'mira', amount: 15 },
                      { type: 'setFlag', flagId: 'mira_hunters_resolved' },
                    ],
              },
            },
          },
        },
        {
          id: 'hand_over_mira',
          textKey: choiceTextKey('mira_hunters', 'hand_over_mira'),
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_hunters_betrayed', textKey: outcomeTextKey('mira_hunters', 'hand_over_mira', 'mira_hunters_betrayed'),
              effects: [
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: -50 },
                { type: 'setNpcStatus', npcId: 'mira', status: 'unavailable' },
                { type: 'setFlag', flagId: 'mira_betrayed' },
                { type: 'setFlag', flagId: 'mira_hunters_resolved' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'mira_returns_favor',
      titleKey: eventTitleKey('mira_returns_favor'),
      textKey: eventTextKey('mira_returns_favor'),
      kind: 'scheduled',
      priority: 100,
      scheduledReach: 'normal',
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'careerPhaseIs', phase: 'active' },
          { type: 'hasChosen', eventId: 'mira_castaway', choiceId: 'rescue_dropoff' },
          { type: 'npcStatusIs', npcId: 'mira', status: 'departed' },
        ],
      },
      choices: [
        {
          id: 'accept_mira_favor',
          textKey: choiceTextKey('mira_returns_favor', 'accept_mira_favor'),
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_favor_received', textKey: outcomeTextKey('mira_returns_favor', 'accept_mira_favor', 'mira_favor_received'),
              effects: [
                { type: 'addItem', itemId: 'mira_letter_of_passage' },
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: 10 },
                { type: 'setFlag', flagId: 'mira_returned_favor' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'year_one_end',
      titleKey: eventTitleKey('year_one_end'),
      textKey: eventTextKey('year_one_end'),
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'careerPhaseIs', phase: 'active' },
          { type: 'hasFlag', flagId: 'reefs_crossed' },
          { type: 'locationIs', locationId: 'outer_route' },
          
          {
            type: 'any',
            conditions: [
              { type: 'not', condition: { type: 'npcStatusIs', npcId: 'mira', status: 'crew' } },
              { type: 'hasFlag', flagId: 'mira_hunters_resolved' },
            ],
          },
        ],
      },
      kind: 'normal',
      choices: [
        {
          id: 'press_on',
          textKey: choiceTextKey('year_one_end', 'press_on'),
          availableIf: { type: 'shipConditionAtLeast', value: 1 },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'year_one_continues', textKey: outcomeTextKey('year_one_end', 'press_on', 'year_one_continues'),
              effects: [{ type: 'setFlag', flagId: 'ending_press_on' }, { type: 'endCareer', reason: 'legacy' }],
            },
          },
        },
        {
          id: 'use_mira_passage',
          textKey: choiceTextKey('year_one_end', 'use_mira_passage'),
          visibleIf: {
            type: 'all',
            conditions: [
              { type: 'hasItem', itemId: 'mira_letter_of_passage' },
              { type: 'shipConditionAtLeast', value: 1 },
            ],
          },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'year_one_mira_favor', textKey: outcomeTextKey('year_one_end', 'use_mira_passage', 'year_one_mira_favor'),
              effects: [{ type: 'setFlag', flagId: 'ending_mira_favor' }, { type: 'endCareer', reason: 'legacy' }],
            },
          },
        },
        {
          id: 'sail_with_mira',
          textKey: choiceTextKey('year_one_end', 'sail_with_mira'),
          visibleIf: {
            type: 'all',
            conditions: [
              { type: 'npcStatusIs', npcId: 'mira', status: 'crew' },
              { type: 'npcRelationshipAtLeast', npcId: 'mira', value: 40 },
              { type: 'shipConditionAtLeast', value: 1 },
            ],
          },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'year_one_with_mira', textKey: outcomeTextKey('year_one_end', 'sail_with_mira', 'year_one_with_mira'),
              effects: [{ type: 'setFlag', flagId: 'ending_with_mira' }, { type: 'endCareer', reason: 'legacy' }],
            },
          },
        },
        {
          id: 'make_landfall',
          textKey: choiceTextKey('year_one_end', 'make_landfall'),
          visibleIf: { type: 'shipConditionAtMost', value: 0 },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'year_one_ship_broken', textKey: outcomeTextKey('year_one_end', 'make_landfall', 'year_one_ship_broken'),
              effects: [{ type: 'setFlag', flagId: 'ending_ship_broken' }, { type: 'endCareer', reason: 'legacy' }],
            },
          },
        },
      ],
    },
  ],
} satisfies ContentCatalog;
