import { describe, expect, it } from 'vitest';
import { loadNodeContentCatalog } from '../content/nodeContentCatalog';
import { createInitialGameState } from '../model/initialState';
import { createDefaultNpcState } from '../model/npcState';
import type { GameState, RaceId, FamilyStructureId } from '../model/schema';
import { selectNextEvent } from './events';

const catalog = loadNodeContentCatalog();

function state(ageMonths: number, raceId: RaceId = 'human', familyStructureId: FamilyStructureId = 'two_parents'): GameState {
  const s = createInitialGameState(98765);
  s.careerPhase = 'childhood';
  s.ageMonths = ageMonths;
  s.player.profile.affiliationId = 'marine';
  s.player.profile.raceId = raceId;
  s.player.profile.familyStructureId = familyStructureId;
  s.currentEventId = null;
  s.immediateEventQueue = [];
  s.scheduledEvents = [];
  return s;
}

function lived(eventId: string, choiceId: string, outcomeId: string, ageMonths: number) {
  return { eventId, choiceId, outcomeId, ageMonths };
}

const C1 = lived('family_marine_01_no_box_on_form', 'giant_invite', 'giant_invite', 12);
const B1 = lived('family_marine_01_family_pennant', 'inspect', 'inspect', 12);

describe('Family Marine Layer 3 routing', () => {
  it('routes Giant agency into the demonstration Special Path', () => {
    const s = state(84, 'giant', 'single_parent');
    s.history = [
      C1,
      lived('family_marine_04_quartermaster_measure', 'cooperate', 'cooperate', 48),
      lived('family_marine_04_quartermaster_measure_i03_before_father', 'answer_self', 'giant_claims_choice', 48),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_07_giant_demonstration');
  });

  it('routes Giant boundary history into Not an Exhibit', () => {
    const s = state(84, 'giant', 'single_parent');
    s.history = [
      C1,
      lived('family_marine_04_quartermaster_measure', 'stop', 'stop', 48),
      lived('family_marine_04_quartermaster_measure_i03_before_father', 'refuse_alone', 'giant_sets_boundary', 48),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_07_not_an_exhibit');
  });

  it('routes unresolved office-door doubt into the bad-order node', () => {
    const s = state(84);
    s.history = [
      B1,
      lived('family_marine_04_behind_office_door', 'listen', 'listen_s', 48),
      lived('family_marine_04_behind_office_door_i03_why_no', 'doubt', 'keeps_doubt', 48),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_07_bad_order');
  });

  it('lets a strong protection history cross into What the Marine Protects', () => {
    const s = state(84);
    s.history = [
      B1,
      lived('family_marine_04_dinner_interrupted', 'say_stay', 'stay_s', 48),
      lived('family_marine_04_dinner_interrupted_i02_messenger_waits', 'delay', 'compromise', 48),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_07_what_marines_protect');
  });

  it('uses the service fallback when no specialized descendant matches X2', () => {
    const s = state(84);
    s.history = [
      B1,
      lived('family_marine_04_behind_office_door', 'call', 'call', 48),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_07_fallback_service_legacy');
  });

  it('routes absent father from service fallback into the old-sergeant node', () => {
    const s = state(84);
    s.npcs.player_parent_1 = {
      ...createDefaultNpcState(),
      status: 'dead',
    };
    s.history = [
      B1,
      lived('family_marine_04_fallback_service', 'verify', 'verify', 48),
      lived('family_marine_04_fallback_service_i01_ledger', 'learn', 'learned_routine', 48),
    ];
    expect(selectNextEvent(s, catalog).currentEventId).toBe('family_marine_07_old_sergeant');
  });
});
