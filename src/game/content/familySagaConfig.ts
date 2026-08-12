import type { NpcSex } from './schema';
import type { CareerAffiliationId, CareerRankId, HistoryEntry } from '../model/schema';

/**
 * Family Saga authority.
 *
 * A non-null value fixes the sex of the sole present parent for the complete
 * Family Legacy tree of that parental affiliation. It is never rerolled
 * chapter-by-chapter.
 *
 * Keep null until that affiliation's Family Saga blueprint explicitly locks
 * the value. Before authored Family Legacy Events for an affiliation ship,
 * its entry must be 'male' or 'female'.
 */
export const SINGLE_PARENT_SEX_BY_AFFILIATION: Readonly<Record<string, NpcSex | null>> = {
  civilian: null,
  marine: 'male',
  pirate: null,
  revolutionary: null,
  royal_family: null,

  // Reference-only / locked affiliations stay null until they receive a
  // complete authored Family Saga.
  bandit: null,
  prisoner: null,
  slave: null,
  celestial_dragon: null,
};

export interface FamilyActiveCareerHandoff {
  affiliationId: CareerAffiliationId;
  rankId: CareerRankId | null;
}

const FAMILY_ACTIVE_CAREER_HANDOFF_BY_HISTORY: Readonly<Record<string, FamilyActiveCareerHandoff>> = {
  // H5D — L'insigne dans la paume
  'family_marine_13_insignia_in_palm_i02_meaning:active_marine': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_insignia_in_palm_i02_meaning:active_civilian_symbol': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_insignia_in_palm_i02_meaning:active_civilian_undecided': { affiliationId: 'civilian', rankId: null },

  // H5F — Ton avenir t'appartient
  'family_marine_13_your_future_is_yours_i02_keep:active_marine': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_your_future_is_yours_i02_keep:active_civilian': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_your_future_is_yours_i02_keep:active_civilian_deferred': { affiliationId: 'civilian', rankId: null },

  // H5A — Le coffre qu'il a laissé
  'family_marine_13_chest_he_left_i03_answer:active_marine': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_chest_he_left_i03_answer:active_civilian_memory': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_chest_he_left_i03_answer:active_civilian_distance': { affiliationId: 'civilian', rankId: null },

  // H5P — Porte-le mieux que moi
  'family_marine_13_wear_it_better_i03_answer:active_marine': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_wear_it_better_i03_answer:active_civilian_legacy': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_wear_it_better_i03_answer:active_civilian_break': { affiliationId: 'civilian', rankId: null },

  // H5R — Le devoir n'est pas l'obéissance
  'family_marine_13_duty_not_obedience_i03_answer:active_marine_reform': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_duty_not_obedience_i03_answer:active_civilian_protect': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_duty_not_obedience_i03_answer:active_civilian_open': { affiliationId: 'civilian', rankId: null },

  // H5X — Notre nom ne leur appartient pas
  'family_marine_13_our_name_is_not_theirs_i03_answer:active_civilian_break': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_our_name_is_not_theirs_i03_answer:active_marine_despite_break': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_our_name_is_not_theirs_i03_answer:active_civilian_open': { affiliationId: 'civilian', rankId: null },

  // H5M — Ce qu'il reste de lui
  'family_marine_13_what_remains_of_him_i03_answer:active_marine_memory': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_what_remains_of_him_i03_answer:active_civilian_memory': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_what_remains_of_him_i03_answer:active_civilian_own': { affiliationId: 'civilian', rankId: null },

  // H5S — Décide toi-même
  'family_marine_13_decide_for_yourself_i02_opportunity:active_marine': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_decide_for_yourself_i02_opportunity:active_civilian': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_decide_for_yourself_i02_opportunity:active_civilian_deferred': { affiliationId: 'civilian', rankId: null },

  // H5C — Ton nom sur le registre
  'family_marine_13_your_name_on_roll_i03_signature:active_marine_registered': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_your_name_on_roll_i03_signature:active_civilian_declined': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_your_name_on_roll_i03_signature:active_civilian_deferred': { affiliationId: 'civilian', rankId: null },

  // H5G — À tes conditions
  'family_marine_13_on_your_terms_i04_resolution:active_marine_own_terms': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_on_your_terms_i04_resolution:active_civilian_own_terms': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_on_your_terms_i04_resolution:active_civilian_deferred': { affiliationId: 'civilian', rankId: null },
};

export function deriveFamilyActiveCareerHandoff(history: readonly HistoryEntry[]): FamilyActiveCareerHandoff | null {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const entry = history[index];
    const handoff = FAMILY_ACTIVE_CAREER_HANDOFF_BY_HISTORY[`${entry.eventId}:${entry.outcomeId}`];
    if (handoff !== undefined) return handoff;
  }
  return null;
}
