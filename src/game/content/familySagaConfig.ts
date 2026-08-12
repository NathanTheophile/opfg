import type { NpcSex } from './schema';

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
  marine: null,
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
