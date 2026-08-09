/** Canonical runtime contract from OPFG. Keep authoring-only helpers in this adapter. */
export {
  CONTENT_SCHEMA_VERSION,
  type AffiliationDefinition,
  type ChoiceDefinition,
  type Condition,
  type ConditionalDiceModifier,
  type ContentCatalog,
  type CriticalTrigger,
  type DeterministicResolution,
  type DiceResolution,
  type DiceResult,
  type Effect,
  type EventDefinition,
  type ItemDefinition,
  type LocationDefinition,
  type NpcDefinition,
  type Outcome,
  type RaceDefinition,
  type Resolution,
  type ScheduledPriority,
  type ScheduledReach,
  type SeaDefinition,
  type StatId,
  type TextChoiceInput,
  type TraitDefinition,
  type TraitResultOverride,
} from '../../../../../src/game/content/schema';

export type {
  AffiliationId,
  CareerEndReason,
  CareerPhase,
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
  TraitId,
  TravelState,
} from '../../../../../src/game/model/schema';
export type { LocalizationKey } from '../../../../../src/game/localization/keys';

import { CONTENT_SCHEMA_VERSION } from '../../../../../src/game/content/schema';
import type {
  AffiliationDefinition,
  ConditionalDiceModifier,
  ItemDefinition,
  LocationDefinition,
  NpcDefinition,
  RaceDefinition,
  SeaDefinition,
  StatId,
  TextChoiceInput,
  TraitDefinition,
} from '../../../../../src/game/content/schema';
import type { FlagId, NpcStatId, NpcStatus } from '../../../../../src/game/model/schema';

export const GAME_SCHEMA_VERSION = CONTENT_SCHEMA_VERSION;

/** Editor option lists derived from the canonical key unions. */
export const PLAYER_STAT_IDS = [
  'health', 'morale', 'strength', 'observation', 'intelligence',
  'navigation', 'charisma', 'luck', 'awakening',
] as const satisfies readonly StatId[];
export type PlayerStatId = StatId;

export const NPC_STAT_IDS = [
  'health', 'morale', 'strength', 'observation', 'intelligence',
  'luck', 'loyalty', 'calm',
] as const satisfies readonly NpcStatId[];

export const NPC_STATUSES = ['known', 'crew', 'departed', 'unavailable', 'dead'] as const satisfies readonly NpcStatus[];

export type ConditionalModifier = ConditionalDiceModifier;
export type TextInputDefinition = TextChoiceInput;
export interface FlagDefinition { id: FlagId }

/** Tool-only registries. `flags` never enters the runtime ContentCatalog. */
export interface GameRegistries {
  races: RaceDefinition[];
  seas: SeaDefinition[];
  affiliations: AffiliationDefinition[];
  locations: LocationDefinition[];
  traits: TraitDefinition[];
  items: ItemDefinition[];
  npcs: NpcDefinition[];
  flags: FlagDefinition[];
}
