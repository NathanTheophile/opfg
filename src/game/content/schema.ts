import type {
  ChoiceId,
  CareerEndReason,
  CareerPhase,
  EventId,
  FlagId,
  ItemId,
  LocationId,
  NpcId,
  NpcStatId,
  NpcStats,
  NpcStatus,
  OutcomeId,
  PlayerStats,
  TraitId,
  TravelState,
  RaceId,
  SeaId,
  AffiliationId,
} from '../model/schema';

export type StatId = keyof PlayerStats;

export type Condition =
  | { type: 'all'; conditions: Condition[] }
  | { type: 'any'; conditions: Condition[] }
  | { type: 'not'; condition: Condition }
  | { type: 'hasTrait'; traitId: TraitId }
  | { type: 'statAtLeast'; statId: StatId; value: number }
  | { type: 'hasFlag'; flagId: FlagId }
  | { type: 'hasItem'; itemId: ItemId }
  | { type: 'locationIs'; locationId: LocationId }
  | { type: 'isAtSea' }
  | { type: 'isOnLand' }
  | { type: 'careerPhaseIs'; phase: CareerPhase }
  | { type: 'ageAtLeastMonths'; value: number }
  | { type: 'ageAtMostMonths'; value: number }
  | { type: 'shipConditionAtLeast'; value: number }
  | { type: 'shipConditionAtMost'; value: number }
  | { type: 'npcStatusIs'; npcId: NpcId; status: NpcStatus }
  | { type: 'npcRelationshipAtLeast'; npcId: NpcId; value: number }
  | { type: 'npcStatAtLeast'; npcId: NpcId; statId: NpcStatId; value: number }
  | { type: 'hasChosen'; eventId: EventId; choiceId: ChoiceId }
  | { type: 'hasPlayed'; eventId: EventId }
  | { type: 'hasOutcome'; eventId: EventId; outcomeId: OutcomeId }
  | { type: 'monthAtLeast'; value: number }
  | { type: 'raceIs'; raceId: RaceId }
  | { type: 'originSeaIs'; seaId: SeaId }
  | { type: 'affiliationIs'; affiliationId: AffiliationId };

export type Effect =
  | { type: 'setFlag'; flagId: FlagId }
  | { type: 'clearFlag'; flagId: FlagId }
  | { type: 'addItem'; itemId: ItemId }
  | { type: 'removeItem'; itemId: ItemId }
  | { type: 'addTrait'; traitId: TraitId }
  | { type: 'removeTrait'; traitId: TraitId }
  | { type: 'modifyStat'; statId: StatId; amount: number }
  | { type: 'modifyShipCondition'; amount: number }
  | { type: 'moveToLocation'; locationId: LocationId; travelState: TravelState }
  | { type: 'setNpcStatus'; npcId: NpcId; status: NpcStatus }
  | { type: 'modifyNpcRelationship'; npcId: NpcId; amount: number }
  | { type: 'modifyNpcStat'; npcId: NpcId; statId: NpcStatId; amount: number }
  | { type: 'scheduleEvent'; eventId: EventId; delayMonths: number }
  | { type: 'setCareerPhase'; phase: CareerPhase }
  | { type: 'setRace'; raceId: RaceId }
  | { type: 'setOriginSea'; seaId: SeaId }
  | { type: 'setAffiliation'; affiliationId: AffiliationId }
  | { type: 'endCareer'; reason: CareerEndReason };

export interface Outcome {
  id: OutcomeId;
  text: string;
  advanceMonths: number;
  effects: Effect[];
}

export type DiceResult = 'criticalFailure' | 'failure' | 'success' | 'criticalSuccess';

export interface ConditionalDiceModifier {
  condition: Condition;
  value: number;
  displayLabel: string;
}

export interface TraitResultOverride {
  traitId: TraitId;
  forceResult: 'criticalFailure' | 'criticalSuccess';
}

export interface DeterministicResolution {
  type: 'deterministic';
  outcome: Outcome;
}

export interface DiceResolution {
  type: 'dice';
  statId: StatId;
  successThreshold: number;
  modifiers?: ConditionalDiceModifier[];
  traitOverrides?: TraitResultOverride[];
  outcomes: Record<DiceResult, Outcome>;
}

export type Resolution = DeterministicResolution | DiceResolution;

export interface TextChoiceInput {
  type: 'text';
  target: 'playerName';
  minLength: number;
  maxLength: number;
  placeholder?: string;
}

export interface ChoiceDefinition {
  id: ChoiceId;
  text: string;
  visibleIf?: Condition;
  availableIf?: Condition;
  input?: TextChoiceInput;
  resolution: Resolution;
}

export interface EventDefinition {
  id: EventId;
  title: string;
  text: string;
  scheduledOnly?: boolean;
  eligibility?: Condition;
  priority: number;
  choices: ChoiceDefinition[];
}

export interface TraitDefinition {
  id: TraitId;
  name: string;
  description: string;
  oppositeTraitId?: TraitId;
}

export interface ItemDefinition {
  id: ItemId;
}

export interface NpcDefinition {
  id: NpcId;
  name: string;
  raceId: RaceId | null;
  originSeaId: SeaId | null;
  affiliationId: AffiliationId | null;
  initialStats: NpcStats;
}

export interface RaceDefinition { id: RaceId; name: string }
export interface SeaDefinition { id: SeaId; name: string }
export interface AffiliationDefinition { id: AffiliationId; name: string }

export interface ContentCatalog {
  races: RaceDefinition[];
  seas: SeaDefinition[];
  affiliations: AffiliationDefinition[];
  traits: TraitDefinition[];
  items: ItemDefinition[];
  npcs: NpcDefinition[];
  events: EventDefinition[];
}
