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
  civilian: 'male',
  marine: 'male',
  pirate: 'female',
  revolutionary: 'female',
  royal_family: 'female',

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
  // H5D Ã¢â‚¬â€ L'insigne dans la paume
  'family_marine_13_insignia_in_palm_i02_meaning:active_marine': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_insignia_in_palm_i02_meaning:active_civilian_symbol': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_insignia_in_palm_i02_meaning:active_civilian_undecided': { affiliationId: 'civilian', rankId: null },

  // H5F Ã¢â‚¬â€ Ton avenir t'appartient
  'family_marine_13_your_future_is_yours_i02_keep:active_marine': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_your_future_is_yours_i02_keep:active_civilian': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_your_future_is_yours_i02_keep:active_civilian_deferred': { affiliationId: 'civilian', rankId: null },

  // H5A Ã¢â‚¬â€ Le coffre qu'il a laissÃƒÂ©
  'family_marine_13_chest_he_left_i03_answer:active_marine': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_chest_he_left_i03_answer:active_civilian_memory': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_chest_he_left_i03_answer:active_civilian_distance': { affiliationId: 'civilian', rankId: null },

  // H5P Ã¢â‚¬â€ Porte-le mieux que moi
  'family_marine_13_wear_it_better_i03_answer:active_marine': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_wear_it_better_i03_answer:active_civilian_legacy': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_wear_it_better_i03_answer:active_civilian_break': { affiliationId: 'civilian', rankId: null },

  // H5R Ã¢â‚¬â€ Le devoir n'est pas l'obÃƒÂ©issance
  'family_marine_13_duty_not_obedience_i03_answer:active_marine_reform': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_duty_not_obedience_i03_answer:active_civilian_protect': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_duty_not_obedience_i03_answer:active_civilian_open': { affiliationId: 'civilian', rankId: null },

  // H5X Ã¢â‚¬â€ Notre nom ne leur appartient pas
  'family_marine_13_our_name_is_not_theirs_i03_answer:active_civilian_break': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_our_name_is_not_theirs_i03_answer:active_marine_despite_break': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_our_name_is_not_theirs_i03_answer:active_civilian_open': { affiliationId: 'civilian', rankId: null },

  // H5M Ã¢â‚¬â€ Ce qu'il reste de lui
  'family_marine_13_what_remains_of_him_i03_answer:active_marine_memory': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_what_remains_of_him_i03_answer:active_civilian_memory': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_what_remains_of_him_i03_answer:active_civilian_own': { affiliationId: 'civilian', rankId: null },

  // H5S Ã¢â‚¬â€ DÃƒÂ©cide toi-mÃƒÂªme
  'family_marine_13_decide_for_yourself_i02_opportunity:active_marine': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_decide_for_yourself_i02_opportunity:active_civilian': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_decide_for_yourself_i02_opportunity:active_civilian_deferred': { affiliationId: 'civilian', rankId: null },

  // H5C Ã¢â‚¬â€ Ton nom sur le registre
  'family_marine_13_your_name_on_roll_i03_signature:active_marine_registered': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_your_name_on_roll_i03_signature:active_civilian_declined': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_your_name_on_roll_i03_signature:active_civilian_deferred': { affiliationId: 'civilian', rankId: null },

  // H5G Ã¢â‚¬â€ Ãƒâ‚¬ tes conditions
  'family_marine_13_on_your_terms_i04_resolution:active_marine_own_terms': { affiliationId: 'marine', rankId: 'marine_recruit' },
  'family_marine_13_on_your_terms_i04_resolution:active_civilian_own_terms': { affiliationId: 'civilian', rankId: null },
  'family_marine_13_on_your_terms_i04_resolution:active_civilian_deferred': { affiliationId: 'civilian', rankId: null },

  // Family Pirate Ã¢â‚¬â€ Layer 5 inheritance handoff
  // family_pirate_13_flag_means_mine
  'family_pirate_13_flag_means_mine_i01_take_pirate:active_pirate_take_pirate': { affiliationId: 'pirate', rankId: null },
  'family_pirate_13_flag_means_mine_i01_keep_only:active_civilian_keep_only': { affiliationId: 'civilian', rankId: null },
  'family_pirate_13_flag_means_mine_i01_defer:active_civilian_defer': { affiliationId: 'civilian', rankId: null },

  // family_pirate_13_safe_harbor_key
  'family_pirate_13_safe_harbor_key_i01_use_network:active_pirate_use_network': { affiliationId: 'pirate', rankId: null },
  'family_pirate_13_safe_harbor_key_i01_keep_memory:active_civilian_keep_memory': { affiliationId: 'civilian', rankId: null },
  'family_pirate_13_safe_harbor_key_i01_defer:active_civilian_defer': { affiliationId: 'civilian', rankId: null },

  // family_pirate_13_ledger_of_names
  'family_pirate_13_ledger_of_names_i01_pirate_with_ledger:active_pirate_pirate_with_ledger': { affiliationId: 'pirate', rankId: null },
  'family_pirate_13_ledger_of_names_i01_keep_accounts:active_civilian_keep_accounts': { affiliationId: 'civilian', rankId: null },
  'family_pirate_13_ledger_of_names_i01_defer:active_civilian_defer': { affiliationId: 'civilian', rankId: null },

  // family_pirate_13_mothers_salt_chart
  'family_pirate_13_mothers_salt_chart_i01_follow_sea:active_pirate_follow_sea': { affiliationId: 'pirate', rankId: null },
  'family_pirate_13_mothers_salt_chart_i01_keep_chart:active_civilian_keep_chart': { affiliationId: 'civilian', rankId: null },
  'family_pirate_13_mothers_salt_chart_i01_defer:active_civilian_defer': { affiliationId: 'civilian', rankId: null },

  // family_pirate_13_crew_has_limits
  'family_pirate_13_crew_has_limits_i01_captain_rules:active_pirate_captain_rules': { affiliationId: 'pirate', rankId: null },
  'family_pirate_13_crew_has_limits_i01_keep_home:active_civilian_keep_home': { affiliationId: 'civilian', rankId: null },
  'family_pirate_13_crew_has_limits_i01_defer:active_civilian_defer': { affiliationId: 'civilian', rankId: null },

  // family_pirate_13_return_the_share
  'family_pirate_13_return_the_share_i01_pirate_repay:active_pirate_pirate_repay': { affiliationId: 'pirate', rankId: null },
  'family_pirate_13_return_the_share_i01_repay_civil:active_civilian_repay_civil': { affiliationId: 'civilian', rankId: null },
  'family_pirate_13_return_the_share_i01_keep_debt:active_civilian_keep_debt': { affiliationId: 'civilian', rankId: null },

  // family_pirate_13_no_innocents_code
  'family_pirate_13_no_innocents_code_i01_pirate_code:active_pirate_pirate_code': { affiliationId: 'pirate', rankId: null },
  'family_pirate_13_no_innocents_code_i01_keep_code:active_civilian_keep_code': { affiliationId: 'civilian', rankId: null },
  'family_pirate_13_no_innocents_code_i01_reject_symbol:active_civilian_reject_symbol': { affiliationId: 'civilian', rankId: null },

  // family_pirate_13_own_depth
  'family_pirate_13_own_depth_i01_pirate_terms:active_pirate_pirate_terms': { affiliationId: 'pirate', rankId: null },
  'family_pirate_13_own_depth_i01_keep_bell:active_civilian_keep_bell': { affiliationId: 'civilian', rankId: null },
  'family_pirate_13_own_depth_i01_refuse_job:active_civilian_refuse_job': { affiliationId: 'civilian', rankId: null },

  // family_pirate_13_fallback_pursuit
  'family_pirate_13_fallback_pursuit_i01_pirate_network:active_pirate_pirate_network': { affiliationId: 'pirate', rankId: null },
  'family_pirate_13_fallback_pursuit_i01_keep_key:active_civilian_keep_key': { affiliationId: 'civilian', rankId: null },
  'family_pirate_13_fallback_pursuit_i01_defer:active_civilian_defer': { affiliationId: 'civilian', rankId: null },

  // family_pirate_13_fallback_household
  'family_pirate_13_fallback_household_i01_take_sea:active_pirate_take_sea': { affiliationId: 'pirate', rankId: null },
  'family_pirate_13_fallback_household_i01_leave_home:active_civilian_leave_home': { affiliationId: 'civilian', rankId: null },
  'family_pirate_13_fallback_household_i01_keep_pocket:active_civilian_keep_pocket': { affiliationId: 'civilian', rankId: null },

  // family_pirate_13_fallback_legacy
  'family_pirate_13_fallback_legacy_i01_pirate_history:active_pirate_pirate_history': { affiliationId: 'pirate', rankId: null },
  'family_pirate_13_fallback_legacy_i01_civil_history:active_civilian_civil_history': { affiliationId: 'civilian', rankId: null },
  'family_pirate_13_fallback_legacy_i01_defer:active_civilian_defer': { affiliationId: 'civilian', rankId: null },

};

export function deriveFamilyActiveCareerHandoff(history: readonly HistoryEntry[]): FamilyActiveCareerHandoff | null {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const entry = history[index];
    if (entry.eventId.startsWith('family_revolutionary_13_')) {
      if (entry.outcomeId.startsWith('active_revolutionary_')) {
        return { affiliationId: 'revolutionary', rankId: 'revolutionary_recruit' };
      }
      if (entry.outcomeId.startsWith('active_civilian_')) {
        return { affiliationId: 'civilian', rankId: null };
      }
    }

    const handoff = FAMILY_ACTIVE_CAREER_HANDOFF_BY_HISTORY[`${entry.eventId}:${entry.outcomeId}`];
    if (handoff !== undefined) return handoff;
  }
  return null;
}
