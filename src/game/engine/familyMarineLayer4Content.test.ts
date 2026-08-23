import { describe, expect, it } from 'vitest';
import { loadNodeContentCatalog } from '../content/nodeContentCatalog';
import { createInitialGameState } from '../model/initialState';
import type { GameState, RaceId, FamilyStructureId } from '../model/schema';
import { selectNextEvent } from './events';

const catalog = loadNodeContentCatalog();

function state(raceId: RaceId = 'human', familyStructureId: FamilyStructureId = 'two_parents'): GameState {
  const s = createInitialGameState(41004);
  s.careerPhase = 'childhood';
  s.ageMonths = 120;
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

describe('Family Marine Layer 4 routing', () => {
  it('routes Giant protective judgment into the early-offer special path', () => {
    const s = state('giant', 'single_parent');
    s.history = [
      C1G,
      h('family_marine_04_quartermaster_measure', 'cooperate', 'cooperate', 48),
      h('family_marine_07_giant_demonstration', 'as_asked', 'as_asked', 84),
      h('family_marine_07_giant_demonstration_i04_officers', 'protective', 'protects_over_score', 84),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_10_giant_offer_too_early');
  });

  it('routes Giant representation history into the display fracture', () => {
    const s = state('giant', 'single_parent');
    s.history = [
      C1G,
      h('family_marine_04_quartermaster_measure', 'stop', 'stop', 48),
      h('family_marine_07_not_an_exhibit', 'say_no', 'no_s', 84),
      h('family_marine_07_not_an_exhibit_i03_boundary', 'reframe', 'redefines_display', 84),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_10_giant_on_display');
  });

  it('routes justice-question history into Keep This Quiet', () => {
    const s = state();
    s.history = [
      B1,
      h('family_marine_04_behind_office_door', 'listen', 'listen_s', 48),
      h('family_marine_07_bad_order', 'challenge', 'challenge_s', 84),
      h('family_marine_07_bad_order_i03_father_answer', 'separate', 'questions_justice', 84),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_10_keep_this_quiet');
  });

  it('routes protection-first history into Protect or Obey', () => {
    const s = state();
    s.history = [
      B1,
      h('family_marine_04_dinner_interrupted', 'say_stay', 'stay_s', 48),
      h('family_marine_07_what_marines_protect', 'act', 'act_s', 84),
      h('family_marine_07_what_marines_protect_i03_after', 'people_first', 'protection_first', 84),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_10_protect_or_obey');
  });

  it('routes inherited merit into the future-uniform node', () => {
    const s = state();
    s.history = [
      B1,
      h('family_marine_04_dinner_interrupted', 'say_stay', 'stay_s', 48),
      h('family_marine_07_fathers_name', 'accept', 'accept', 84),
      h('family_marine_07_fathers_name_i03_officer', 'carry', 'accepts_legacy', 84),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_10_they_discuss_your_uniform');
  });

  it('uses the identity fallback when a C/G/X route has no specialized History match', () => {
    const s = state('mink');
    s.history = [
      h('family_marine_01_no_box_on_form', 'cooperate', 'cooperate', 12),
      h('family_marine_04_fallback_adaptation', 'accept_help', 'accept_help', 48),
      h('family_marine_07_fallback_belonging', 'try', 'try', 84),
      h('family_marine_07_fallback_belonging_i02_resolution', 'tolerate', 'tolerates_mismatch', 84),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_10_fallback_identity');
  });
});
