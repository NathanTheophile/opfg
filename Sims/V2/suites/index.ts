import type { SuiteDefinition, V2SuiteId } from '../core/types';
import { sanitySuite } from './sanity';
import { healthSuite } from './health';
import { travelSuite } from './travel';
import { crewSuite } from './crew';
import { economyShipsSuite } from './economy-ships';
import { progressionSuite } from './progression';
import { narrativeSuite } from './narrative';
import { diceSuite } from './dice';
import { endingsSuite } from './endings';

export const SUITES: Record<V2SuiteId, SuiteDefinition> = {
  sanity: sanitySuite,
  health: healthSuite,
  travel: travelSuite,
  crew: crewSuite,
  'economy-ships': economyShipsSuite,
  progression: progressionSuite,
  narrative: narrativeSuite,
  dice: diceSuite,
  endings: endingsSuite,
};

export const SUITE_IDS = Object.keys(SUITES) as V2SuiteId[];

export function suiteById(id: V2SuiteId): SuiteDefinition {
  return SUITES[id];
}
