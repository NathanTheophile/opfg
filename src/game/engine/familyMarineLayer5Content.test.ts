import { describe, expect, it } from 'vitest';
import { loadNodeContentCatalog } from '../content/nodeContentCatalog';
import { createInitialGameState } from '../model/initialState';
import type { GameState, RaceId, FamilyStructureId } from '../model/schema';
import { selectNextEvent } from './events';
import { consumePhaseSlot } from './time';

const catalog = loadNodeContentCatalog();

function state(raceId: RaceId = 'human', familyStructureId: FamilyStructureId = 'two_parents'): GameState {
  const s = createInitialGameState(51313);
  s.careerPhase = 'childhood';
  s.ageMonths = 168;
  s.player.profile.affiliationId = 'marine';
  s.player.profile.raceId = raceId;
  s.player.profile.familyStructureId = familyStructureId;
  s.currentEventId = null;
  s.immediateEventQueue = [];
  s.scheduledEvents = [];
  return s;
}

function h(eventId: string, choiceId: string, outcomeId: string, ageMonths: number) {
  return { eventId, choiceId, outcomeId, ageMonths };
}

const B1 = h('family_marine_01_family_pennant', 'inspect', 'inspect', 12);
const C1G = h('family_marine_01_no_box_on_form', 'giant_invite', 'giant_invite', 12);

describe('Family Marine Layer 5 inheritance', () => {
  it('routes recognized Giant conditions into the unique own-terms inheritance', () => {
    const s = state('giant', 'single_parent');
    s.history = [
      C1G,
      h('family_marine_04_quartermaster_measure', 'cooperate', 'cooperate', 48),
      h('family_marine_07_giant_demonstration', 'as_asked', 'as_asked', 84),
      h('family_marine_10_giant_offer_too_early', 'meeting', 'meeting', 120),
      h('family_marine_10_giant_offer_too_early_i04_record', 'recognized', 'conditions_recognized', 120),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_13_on_your_terms');
  });

  it('routes accepted inherited expectation into the recruitment-roll terminal', () => {
    const s = state();
    s.history = [
      B1,
      h('family_marine_04_dinner_interrupted', 'say_stay', 'stay_s', 48),
      h('family_marine_07_fathers_name', 'accept', 'accept', 84),
      h('family_marine_10_they_discuss_your_uniform', 'lean_in', 'lean_in', 120),
      h('family_marine_10_they_discuss_your_uniform_i03_future', 'accept', 'accepts_expectation', 120),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_13_your_name_on_roll');
  });

  it('routes protection-before-obedience into the reformist inheritance', () => {
    const s = state();
    s.history = [
      B1,
      h('family_marine_04_dinner_interrupted', 'say_stay', 'stay_s', 48),
      h('family_marine_07_what_marines_protect', 'act', 'act_s', 84),
      h('family_marine_10_protect_or_obey', 'open', 'open_s', 120),
      h('family_marine_10_protect_or_obey_i04_belief', 'protection', 'protects_before_obeys', 120),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_13_duty_not_obedience');
  });

  it('routes Giant rejection of display into the institutional-break terminal', () => {
    const s = state('giant', 'single_parent');
    s.history = [
      C1G,
      h('family_marine_04_quartermaster_measure', 'stop', 'stop', 48),
      h('family_marine_07_not_an_exhibit', 'say_no', 'no_s', 84),
      h('family_marine_10_giant_on_display', 'walk', 'walk', 120),
      h('family_marine_10_giant_on_display_i03_voice', 'withdraw', 'rejects_display', 120),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_13_our_name_is_not_theirs');
  });

  it('uses the identity-family fallback when no specialized terminal matches', () => {
    const s = state('mink');
    s.history = [
      h('family_marine_01_no_box_on_form', 'cooperate', 'cooperate', 12),
      h('family_marine_04_fallback_adaptation', 'accept_help', 'accept_help', 48),
      h('family_marine_07_fallback_belonging', 'try', 'try', 84),
      h('family_marine_10_fallback_identity', 'carry', 'carry', 120),
      h('family_marine_10_fallback_identity_i02_resolution', 'family', 'represents_family', 120),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_13_your_future_is_yours');
  });

  it('registers all five persistent inheritance reward definitions', () => {
    const ids = new Set(catalog.items.map(({ id }) => id));
    for (const id of [
      'family_marine_insignia',
      'family_marine_service_journal',
      'family_marine_field_compass',
      'family_marine_sealed_report',
      'giant_marine_training_bracer',
    ]) expect(ids.has(id)).toBe(true);

    const bracer = catalog.items.find(({ id }) => id === 'giant_marine_training_bracer');
    expect(bracer).toMatchObject({ category: 'equipment', unique: true, modifiers: { strength: 1 } });
  });

  it('applies Marine + recruit only at the Childhood -> Active boundary', () => {
    const s = createInitialGameState(1);
    s.careerPhase = 'childhood';
    s.ageMonths = 174;
    s.player.profile.affiliationId = 'marine';
    s.player.career.affiliationId = 'civilian';
    s.player.career.rankId = null;
    s.history = [
      h('family_marine_13_your_name_on_roll_i03_signature', 'sign', 'active_marine_registered', 168),
    ];

    const next = consumePhaseSlot(s, 'childhood', catalog);
    expect(next.ageMonths).toBe(180);
    expect(next.careerPhase).toBe('active');
    expect(next.player.profile.affiliationId).toBe('marine');
    expect(next.player.career.affiliationId).toBe('marine');
    expect(next.player.career.rankId).toBe('marine_recruit');
  });

  it('keeps a rejecting inheritance Civilian at the Active boundary', () => {
    const s = createInitialGameState(1);
    s.careerPhase = 'childhood';
    s.ageMonths = 174;
    s.player.profile.affiliationId = 'marine';
    s.player.career.affiliationId = 'civilian';
    s.player.career.rankId = null;
    s.history = [
      h('family_marine_13_our_name_is_not_theirs_i03_answer', 'civilian', 'active_civilian_break', 168),
    ];

    const next = consumePhaseSlot(s, 'childhood', catalog);
    expect(next.careerPhase).toBe('active');
    expect(next.player.profile.affiliationId).toBe('marine');
    expect(next.player.career.affiliationId).toBe('civilian');
    expect(next.player.career.rankId).toBeNull();
  });
});
