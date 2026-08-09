/** Canonical runtime contract from OPFG. Keep authoring-only helpers in this adapter. */
export {
  CONTENT_SCHEMA_VERSION,
  type AffiliationDefinition,
  type ChoiceDefinition,
  type Condition,
  type ConditionalDiceModifier,
  type ContentCatalog,
  type CrewRoleDefinition,
  type CriticalTrigger,
  type DeterministicResolution,
  type DiceResolution,
  type DiceResult,
  type Effect,
  type EventDefinition,
  type FamilyStructureDefinition,
  type ItemDefinition,
  type DevilFruitDefinition,
  type LocationDefinition,
  type NpcDefinition,
  type Outcome,
  type RaceDefinition,
  type Resolution,
  type ScheduledPriority,
  type ScheduledReach,
  type SeaDefinition,
  type SocialClassDefinition,
  type ShipDefinition,
  type StatId,
  type CareerAffiliationDefinition,
  type CareerRankDefinition,
  type CareerTitleDefinition,
  type EndingDefinition,
  type TextChoiceInput,
  type TraitDefinition,
  type TraitResultOverride,
} from '../../../../../src/game/content/schema';

export type {
  AffiliationId,
  FamilyStructureId,
  CareerEndReason,
  CareerPhase,
  CrewRoleId,
  ChoiceId,
  EventId,
  FlagId,
  ItemId,
  LocationId,
  NpcId,
  NpcStatId,
  NpcStats,
  NpcStatus,
  OutcomeId,
  RaceId,
  SeaId,
  SocialClassId,
  ShipId,
  TraitId,
  TravelState,
} from '../../../../../src/game/model/schema';
export type { LocalizationKey } from '../../../../../src/game/localization/keys';

import { CONTENT_SCHEMA_VERSION } from '../../../../../src/game/content/schema';
import type {
  AffiliationDefinition,
  FamilyStructureDefinition,
  ConditionalDiceModifier,
  CrewRoleDefinition,
  ItemDefinition,
  DevilFruitDefinition,
  LocationDefinition,
  NpcDefinition,
  RaceDefinition,
  SeaDefinition,
  SocialClassDefinition,
  ShipDefinition,
  StatId,
  TextChoiceInput,
  TraitDefinition,
} from '../../../../../src/game/content/schema';
import type { FlagId, NpcStatId, NpcStatus } from '../../../../../src/game/model/schema';

export const GAME_SCHEMA_VERSION = CONTENT_SCHEMA_VERSION;

/** Editor option lists derived from the canonical key unions. */
export const PLAYER_STAT_IDS = [
  'morale', 'strength', 'agility', 'observation', 'intelligence',
  'navigation', 'charisma', 'luck',
] as const satisfies readonly StatId[];
export type PlayerStatId = StatId;

export const NPC_STAT_IDS = [
  'health', 'morale', 'strength', 'observation', 'intelligence',
  'luck', 'loyalty', 'calm',
] as const satisfies readonly NpcStatId[];

export const NPC_STATUSES = ['known', 'crew', 'departed', 'unavailable', 'dead'] as const satisfies readonly NpcStatus[];
export const HAKI_TYPES = ['observation', 'armament', 'conqueror'] as const;
export { DEVIL_FRUIT_TAGS, DEVIL_FRUIT_TYPES, LOCATION_SERVICES, LOCATION_TAGS } from '../../../../../src/game/content/schema';

export type ConditionalModifier = ConditionalDiceModifier;
export type TextInputDefinition = TextChoiceInput;
export interface FlagDefinition { id: FlagId }

/** Tool-only registries. `flags` never enters the runtime ContentCatalog. */
export interface GameRegistries {
  races: RaceDefinition[];
  seas: SeaDefinition[];
  affiliations: AffiliationDefinition[];
  careerAffiliations: import('../../../../../src/game/content/schema').CareerAffiliationDefinition[];
  careerRanks: import('../../../../../src/game/content/schema').CareerRankDefinition[];
  careerTitles: import('../../../../../src/game/content/schema').CareerTitleDefinition[];
  endings: import('../../../../../src/game/content/schema').EndingDefinition[];
  familyStructures: FamilyStructureDefinition[];
  socialClasses: SocialClassDefinition[];
  locations: LocationDefinition[];
  traits: TraitDefinition[];
  items: ItemDefinition[];
  devilFruits: DevilFruitDefinition[];
  ships: ShipDefinition[];
  crewRoles: CrewRoleDefinition[];
  npcs: NpcDefinition[];
  flags: FlagDefinition[];
}
