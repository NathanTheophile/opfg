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
  PlayerAttributeId,
  TraitId,
  TravelState,
  RaceId,
  SeaId,
  AffiliationId,
  FamilyStructureId,
  SocialClassId,
  ShipId,
  CrewRoleId,
  DevilFruitId,
  DevilFruitTagId,
  HakiType,
  CareerAffiliationId,
  CareerRankId,
  CareerTitleId,
  EndingId,
} from '../model/schema';
import type { LocalizationKey } from '../localization/keys';

export const CONTENT_SCHEMA_VERSION = 6;

export const DEVIL_FRUIT_TYPES = ['paramecia', 'zoan', 'logia'] as const;
export type DevilFruitType = typeof DEVIL_FRUIT_TYPES[number];
export const DEVIL_FRUIT_TAGS = ['flight', 'fire', 'cold', 'electricity', 'mobility', 'intangibility', 'transformation', 'enhanced_strength', 'healing', 'barrier', 'ranged', 'environmental'] as const satisfies readonly DevilFruitTagId[];
export const LOCATION_SERVICES = ['food', 'lodging', 'general_goods', 'weapons', 'medical', 'trade', 'ship_repair', 'crew_recruitment', 'marine_services', 'black_market'] as const;
export type LocationServiceId = typeof LOCATION_SERVICES[number];
export const LOCATION_TAGS = ['capital','city','village','coastal','port','trade','shipyard','marine_presence','pirate_presence','revolutionary_presence','government','royal','wealthy','poor','industrial','agricultural','criminal','military','prison','research','medical','historic','religious','entertainment','touristic','dangerous','isolated','urban','rural','desert','forest','mountain','snow','tropical','wilderness','sky','underwater'] as const;
export type LocationTagId = typeof LOCATION_TAGS[number];
export type ShipMarket = 'none' | 'small_craft' | 'full';
export type LocationType = 'city' | 'facility' | 'island' | 'kingdom' | 'marine_base' | 'pirate_haven' | 'port' | 'village' | 'wilderness';

export type StatId = PlayerAttributeId;

export type Condition =
  | { type: 'all'; conditions: Condition[] }
  | { type: 'any'; conditions: Condition[] }
  | { type: 'not'; condition: Condition }
  | { type: 'hasTrait'; traitId: TraitId }
  | { type: 'statAtLeast'; statId: StatId; value: number }
  | { type: 'hasFlag'; flagId: FlagId }
  | { type: 'hasItem'; itemId: ItemId }
  | { type: 'berriesAtLeast'; value: number }
  | { type: 'hasCrew' }
  | { type: 'crewSizeAtLeast'; value: number }
  | { type: 'hasCrewRole'; roleId: CrewRoleId }
  | { type: 'canRecruitNpc'; npcId: NpcId }
  | { type: 'isLeader' }
  | { type: 'locationIs'; locationId: LocationId }
  | { type: 'locationHasTag'; tagId: LocationTagId }
  | { type: 'locationHasService'; serviceId: LocationServiceId }
  | { type: 'locationWithin'; locationId: LocationId }
  | { type: 'currentSeaIs'; seaId: SeaId }
  | { type: 'isAtSea' }
  | { type: 'isOnLand' }
  | { type: 'careerPhaseIs'; phase: CareerPhase }
  | { type: 'ageAtLeastMonths'; value: number }
  | { type: 'ageAtMostMonths'; value: number }
  | { type: 'hasShip' }
  | { type: 'shipIs'; shipId: ShipId }
  | { type: 'shipHealthAtLeast'; value: number }
  | { type: 'shipHealthAtMost'; value: number }
  | { type: 'shipCrewCapacityAtLeast'; value: number }
  | { type: 'shipCargoSpaceAtLeast'; value: number }
  | { type: 'canAcquireShip'; shipId: ShipId }
  | { type: 'canSellShip' }
  | { type: 'npcStatusIs'; npcId: NpcId; status: NpcStatus }
  | { type: 'npcRelationshipAtLeast'; npcId: NpcId; value: number }
  | { type: 'npcStatAtLeast'; npcId: NpcId; statId: NpcStatId; value: number }
  | { type: 'hasChosen'; eventId: EventId; choiceId: ChoiceId }
  | { type: 'hasPlayed'; eventId: EventId }
  | { type: 'hasOutcome'; eventId: EventId; outcomeId: OutcomeId }
  | { type: 'raceIs'; raceId: RaceId }
  | { type: 'originSeaIs'; seaId: SeaId }
  | { type: 'affiliationIs'; affiliationId: AffiliationId }
  | { type: 'familyStructureIs'; familyStructureId: FamilyStructureId }
  | { type: 'socialClassIs'; socialClassId: SocialClassId }
  | { type: 'hasDevilFruit' }
  | { type: 'canConsumeDevilFruit'; fruitId: DevilFruitId }
  | { type: 'devilFruitIs'; fruitId: DevilFruitId }
  | { type: 'devilFruitTypeIs'; fruitType: DevilFruitType }
  | { type: 'devilFruitHasTag'; tagId: DevilFruitTagId }
  | { type: 'devilFruitAwakeningAtLeast'; value: number }
  | { type: 'devilFruitIsAwakened' }
  | { type: 'hakiAtLeast'; hakiType: HakiType; level: number }
  | { type: 'hakiIsAwakened'; hakiType: HakiType }
  | { type: 'hakiSourceTotalAtLeast'; hakiType: 'observation' | 'armament'; value: number }
  | { type: 'npcHasDevilFruit'; npcId: NpcId }
  | { type: 'npcDevilFruitIs'; npcId: NpcId; fruitId: DevilFruitId }
  | { type: 'npcDevilFruitTypeIs'; npcId: NpcId; fruitType: DevilFruitType }
  | { type: 'npcDevilFruitHasTag'; npcId: NpcId; tagId: DevilFruitTagId }
  | { type: 'npcDevilFruitAwakeningAtLeast'; npcId: NpcId; value: number }
  | { type: 'npcHakiAtLeast'; npcId: NpcId; hakiType: HakiType; level: number }
  | { type: 'npcHakiIsAwakened'; npcId: NpcId; hakiType: HakiType }
  | { type: 'careerAffiliationIs'; affiliationId: CareerAffiliationId }
  | { type: 'reputationAtLeast'; value: number }
  | { type: 'reputationAtMost'; value: number }
  | { type: 'bountyAtLeast'; value: number }
  | { type: 'careerRankIs'; rankId: CareerRankId }
  | { type: 'careerRankAtLeast'; rankId: CareerRankId }
  | { type: 'careerTitleIs'; titleId: CareerTitleId };

export type Effect =
  | { type: 'setFlag'; flagId: FlagId }
  | { type: 'clearFlag'; flagId: FlagId }
  | { type: 'addItem'; itemId: ItemId; quantity: number }
  | { type: 'removeItem'; itemId: ItemId; quantity: number }
  | { type: 'addTrait'; traitId: TraitId }
  | { type: 'removeTrait'; traitId: TraitId }
  | { type: 'modifyStat'; statId: StatId; amount: number }
  | { type: 'modifyHealth'; amount: number }
  | { type: 'acquireShip'; shipId: ShipId; name: string; health?: number; allowWithoutLeadership?: boolean }
  | { type: 'loseShip'; locationId: LocationId; travelState: TravelState; allowWithoutLeadership?: boolean }
  | { type: 'modifyShipHealth'; amount: number }
  | { type: 'addCargoItem'; itemId: ItemId; quantity: number; allowWithoutLeadership?: boolean }
  | { type: 'removeCargoItem'; itemId: ItemId; quantity: number; allowWithoutLeadership?: boolean }
  | { type: 'resolveShipReplacement'; disposition: 'destroy' | 'sell' | 'abandon'; berries?: number; allowWithoutLeadership?: boolean }
  | { type: 'modifyBerries'; amount: number }
  | { type: 'moveToLocation'; locationId: LocationId; travelState: TravelState }
  | { type: 'setBirthLocation'; locationId: LocationId }
  | { type: 'recoverTravel'; mode: 'land' | 'sea' }
  | { type: 'setNpcStatus'; npcId: NpcId; status: NpcStatus; allowWithoutLeadership?: boolean }
  | { type: 'setNpcPassenger'; npcId: NpcId; passenger: boolean; allowWithoutLeadership?: boolean }
  | { type: 'setLeadership'; isLeader: boolean }
  | { type: 'modifyNpcRelationship'; npcId: NpcId; amount: number }
  | { type: 'modifyNpcStat'; npcId: NpcId; statId: NpcStatId; amount: number }
  | { type: 'scheduleEvent'; eventId: EventId; delayMonths: number }
  | { type: 'queueImmediateEvent'; eventId: EventId }
  | { type: 'setCareerPhase'; phase: CareerPhase }
  | { type: 'setRace'; raceId: RaceId }
  | { type: 'setOriginSea'; seaId: SeaId }
  | { type: 'setAffiliation'; affiliationId: AffiliationId }
  | { type: 'setFamilyStructure'; familyStructureId: FamilyStructureId }
  | { type: 'setSocialClass'; socialClassId: SocialClassId }
  | { type: 'endCareer'; reason: CareerEndReason }
  | { type: 'consumeDevilFruit'; fruitId: DevilFruitId }
  | { type: 'increaseDevilFruitAwakening'; amount: number }
  | { type: 'awakenHaki'; hakiType: HakiType }
  | { type: 'raiseConquerorHakiTo'; level: number }
  | { type: 'setNpcDevilFruit'; npcId: NpcId; fruitId: DevilFruitId }
  | { type: 'increaseNpcDevilFruitAwakening'; npcId: NpcId; amount: number }
  | { type: 'raiseNpcHakiTo'; npcId: NpcId; hakiType: HakiType; level: number }
  | { type: 'setCareerAffiliation'; affiliationId: CareerAffiliationId }
  | { type: 'modifyReputation'; amount: number }
  | { type: 'setBounty'; value: number }
  | { type: 'modifyBounty'; amount: number }
  | { type: 'setCareerRank'; rankId: CareerRankId | null }
  | { type: 'setCareerTitle'; titleId: CareerTitleId }
  | { type: 'clearCareerTitle' }
  | { type: 'endCareerWithEnding'; endingId: EndingId };

export interface Outcome {
  id: OutcomeId;
  textKey: LocalizationKey;
  effects: Effect[];
}

export type DiceResult = 'criticalFailure' | 'failure' | 'success' | 'criticalSuccess';

export interface ConditionalDiceModifier {
  condition: Condition;
  value: number;
  displayLabelKey: LocalizationKey;
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
  placeholderKey?: LocalizationKey;
}

export interface ChoiceDefinition {
  id: ChoiceId;
  textKey: LocalizationKey;
  visibleIf?: Condition;
  availableIf?: Condition;
  input?: TextChoiceInput;
  resolution: Resolution;
}

interface EventBase {
  id: EventId;
  titleKey: LocalizationKey;
  textKey: LocalizationKey;
  eligibility?: Condition;
  choices: ChoiceDefinition[];
}

export type ScheduledPriority = 50 | 100 | 200 | 300;
export type ScheduledReach = 'normal' | 'unrestricted';
export type CriticalTrigger =
  | { type: 'playerHealthDepleted' }
  | { type: 'npcHealthDepleted'; npcId: NpcId }
  | { type: 'shipDestroyed' }
  | { type: 'shipMissingAtSea' }
  | { type: 'shipReplacementPending' };
export type EventDefinition =
  | (EventBase & { kind: 'normal'; lifetimeThreadSeed?: true })
  | (EventBase & { kind: 'immediate' })
  | (EventBase & { kind: 'scheduled'; priority: ScheduledPriority; scheduledReach?: ScheduledReach; cancelIf?: Condition; fallbackEventId?: EventId })
  | (EventBase & { kind: 'critical'; trigger: CriticalTrigger });

export interface TraitDefinition {
  id: TraitId;
  nameKey: LocalizationKey;
  descriptionKey: LocalizationKey;
  oppositeTraitId?: TraitId;
}

export interface ItemDefinition {
  id: ItemId;
  nameKey: LocalizationKey;
}

export interface DevilFruitDefinition {
  id: DevilFruitId;
  nameKey: LocalizationKey;
  type: DevilFruitType;
  playableV1: boolean;
  itemId: ItemId | null;
  tags: DevilFruitTagId[];
}

export interface ShipDefinition {
  id: ShipId;
  nameKey: LocalizationKey;
  maxHealth: number;
  crewCapacity: number;
  cargoSlots: number;
}

export interface NpcDefinition {
  id: NpcId;
  nameKey: LocalizationKey;
  raceId: RaceId | null;
  originSeaId: SeaId | null;
  affiliationId: AffiliationId | null;
  crewRoleId: CrewRoleId | null;
  initialStats: NpcStats;
}

export interface CrewRoleDefinition { id: CrewRoleId; nameKey: LocalizationKey }

export interface RaceDefinition { id: RaceId; nameKey: LocalizationKey; initialHealth: number; attributeModifiers: Partial<Record<StatId, number>> }
export interface SeaDefinition { id: SeaId; nameKey: LocalizationKey }
export interface AffiliationDefinition { id: AffiliationId; nameKey: LocalizationKey }
export interface FamilyStructureDefinition { id: FamilyStructureId; nameKey: LocalizationKey; attributeModifiers: Partial<Record<StatId, number>> }
export interface SocialClassDefinition { id: SocialClassId; nameKey: LocalizationKey; attributeModifiers: Partial<Record<StatId, number>> }
export interface LocationDefinition { id: LocationId; nameKey: LocalizationKey; seaId: SeaId; type: LocationType; parentLocationId: LocationId | null; canBeBirthLocation: boolean; blocksScheduledEvents: boolean; allowsDocking: boolean; shipMarket: ShipMarket; services: LocationServiceId[]; tags: LocationTagId[] }
export interface CareerAffiliationDefinition { id: CareerAffiliationId; nameKey: LocalizationKey }
export interface CareerRankDefinition { id: CareerRankId; nameKey: LocalizationKey; affiliationId: Extract<CareerAffiliationId, 'marine' | 'revolutionary' | 'bounty_hunter'>; sortOrder: number }
export interface CareerTitleDefinition { id: CareerTitleId; nameKey: LocalizationKey; descriptionKey: LocalizationKey }
export interface EndingDefinition { id: EndingId; nameKey: LocalizationKey; descriptionKey: LocalizationKey }

export interface ContentCatalog {
  schemaVersion: number;
  races: RaceDefinition[];
  seas: SeaDefinition[];
  affiliations: AffiliationDefinition[];
  careerAffiliations: CareerAffiliationDefinition[];
  careerRanks: CareerRankDefinition[];
  careerTitles: CareerTitleDefinition[];
  endings: EndingDefinition[];
  familyStructures: FamilyStructureDefinition[];
  socialClasses: SocialClassDefinition[];
  locations: LocationDefinition[];
  traits: TraitDefinition[];
  items: ItemDefinition[];
  devilFruits: DevilFruitDefinition[];
  ships: ShipDefinition[];
  crewRoles: CrewRoleDefinition[];
  npcs: NpcDefinition[];
  events: EventDefinition[];
}
