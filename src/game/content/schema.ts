import type {
  ChoiceId,
  CareerEndReason,
  CareerPhase,
  EventId,
  FlagId,
  ItemId,
  LocationId,
  NpcId,
  NpcStatus,
  OutcomeId,
  PlayerStats,
  TraitId,
  TravelState,
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
  | { type: 'hasChosen'; eventId: EventId; choiceId: ChoiceId }
  | { type: 'hasPlayed'; eventId: EventId }
  | { type: 'hasOutcome'; eventId: EventId; outcomeId: OutcomeId }
  | { type: 'monthAtLeast'; value: number };

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
  | { type: 'scheduleEvent'; eventId: EventId; delayMonths: number }
  | { type: 'setCareerPhase'; phase: CareerPhase }
  | { type: 'endCareer'; reason: CareerEndReason };

export interface Outcome {
  id: OutcomeId;
  text: string;
  advanceMonths: number;
  effects: Effect[];
}

export interface StatModifier {
  type: 'statModifier';
  statId: StatId;
  multiplier: number;
  displayLabel: string;
  displayInfluence: string;
}

export interface ConditionalModifier {
  type: 'conditionalModifier';
  condition: Condition;
  value: number;
  displayLabel: string;
  displayInfluence: string;
}

export type DiceModifier = StatModifier | ConditionalModifier;

export interface DiceBand {
  maxInclusive: number | null;
  outcome: Outcome;
}

export interface DiceCheck {
  modifiers: DiceModifier[];
  bands: DiceBand[];
}

export interface DeterministicResolution {
  type: 'deterministic';
  outcome: Outcome;
}

export interface DiceResolution {
  type: 'dice';
  check: DiceCheck;
}

export type Resolution = DeterministicResolution | DiceResolution;

export interface ChoiceDefinition {
  id: ChoiceId;
  text: string;
  visibleIf?: Condition;
  availableIf?: Condition;
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
}

export interface ContentCatalog {
  traits: TraitDefinition[];
  items: ItemDefinition[];
  npcs: NpcDefinition[];
  events: EventDefinition[];
}
