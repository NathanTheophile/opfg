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
  IslandId,
  ShipDamageCause,
} from '../model/schema';
import type { LocalizationKey } from '../localization/keys';

export const CONTENT_SCHEMA_VERSION = 15;

export const V1_CAREER_HORIZON_MONTHS = 420;

export const NARRATIVE_FAMILIES = [
  'origin_family',
  'origin_race',
  'origin_birthplace',
  'origin_cross',
  'child_peer',
] as const;

export type NarrativeFamily =
  typeof NARRATIVE_FAMILIES[number];

export const OPENING_ROLES = [
  'origin_echo',
  'friend_intro',
  'friend_callback',
  'rival_intro',
] as const;

export type OpeningRole =
  typeof OPENING_ROLES[number];

export const MAJOR_NARRATIVE_TRACK_TYPES = ['family_legacy', 'personal_affiliation'] as const;
export type MajorNarrativeTrackType = typeof MAJOR_NARRATIVE_TRACK_TYPES[number];

export interface MajorNarrativeChapterDefinition {
  id: string;
  phase: CareerPhase;
  dueAgeMonths: number;
}

export interface MajorNarrativeTrackDefinition {
  id: string;
  type: MajorNarrativeTrackType;
  eligibility: Condition;
  chapters: MajorNarrativeChapterDefinition[];
}

export interface MajorTrackEventRef {
  trackId: string;
  chapterId: string;
  nodeId: string;
  /** OR reachability from node IDs in the immediately previous temporal layer. */
  parentNodeIds?: string[];
  /** Highest eligible value wins; ties stay seeded-uniform. Default 0. */
  selectionPriority?: number;
  /** Route-local safety continuation, considered only when no specialized descendant is eligible. */
  fallback?: true;
  /** High-yield authored intersection such as Marine × Giant. */
  specialPathId?: string;
  /** Stable notable endpoint; future achievement systems may map this ID account-wide. */
  milestoneId?: string;
}

export const ITEM_CATEGORIES = ['item', 'equipment'] as const;
export type ItemCategory = typeof ITEM_CATEGORIES[number];

export interface ItemMarketDefinition {
  basePriceBerries: number;
  mode: MarketMode;
}

export interface EconomyDefinition {}
export type MarketMode = 'none' | 'buy_sell' | 'buy_only' | 'sell_only';
export type WeaponDamageType = 'cutting' | 'blunt' | 'explosive';
export type WeaponRangeType = 'melee' | 'ranged';
export type LogPoseType = 'paradise' | 'new_world';

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

export const NPC_SEXES = ['male', 'female'] as const;
export type NpcSex = typeof NPC_SEXES[number];

export const NPC_FAMILY_ROLES = ['father', 'mother'] as const;
export type NpcFamilyRole = typeof NPC_FAMILY_ROLES[number];

export type Condition =
  | { type: 'all'; conditions: Condition[] }
  | { type: 'any'; conditions: Condition[] }
  | { type: 'not'; condition: Condition }
  | { type: 'hasTrait'; traitId: TraitId }
  | { type: 'statAtLeast'; statId: StatId; value: number }
  | { type: 'hasFlag'; flagId: FlagId }
  | { type: 'hasItem'; itemId: ItemId }
  | { type: 'activeLogPoseIs'; logPoseType: LogPoseType }
  | { type: 'hasActiveCompanion' }
  | { type: 'activeCompanionIs'; itemId: ItemId }
  | { type: 'hasEquipped'; itemId: ItemId }
  | { type: 'hasEquippedWeapon'; damageType?: WeaponDamageType; rangeType?: WeaponRangeType }
  | { type: 'itemQuantityAtLeast'; itemId: ItemId; quantity: number }
  | { type: 'inventoryFreeSlotsAtLeast'; value: number }
  | { type: 'canBuyItem'; itemId: ItemId; quantity: number }
  | { type: 'canSellItem'; itemId: ItemId; quantity: number }
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
  | { type: 'sameIslandPortExists' }
  | { type: 'currentSeaHasPort' }
  | { type: 'fallbackStreakAtLeast'; value: number }
  | { type: 'shipDestructionCauseIs'; cause: ShipDamageCause }
  | { type: 'maritimeEmergencyActive' }
  | { type: 'hasEligibleSwimmingRescuer' }
  | { type: 'hasCrewMemberWithDevilFruit' }
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
  | { type: 'npcRelationshipAtMost'; npcId: NpcId; value: number }
  | { type: 'npcMonthsSinceInteractionAtLeast'; npcId: NpcId; value: number }
  | { type: 'npcMonthsSinceInteractionAtMost'; npcId: NpcId; value: number }
  | { type: 'npcStatAtLeast'; npcId: NpcId; statId: NpcStatId; value: number }
  | { type: 'npcSexIs'; npcId: NpcId; sex: NpcSex }
  | { type: 'singleParentSexIs'; sex: NpcSex }
  | { type: 'originParentPresent'; role: NpcFamilyRole }
  | { type: 'hasChosen'; eventId: EventId; choiceId: ChoiceId }
  | { type: 'hasPlayed'; eventId: EventId }
  | { type: 'hasOutcome'; eventId: EventId; outcomeId: OutcomeId }
  | { type: 'raceIs'; raceId: RaceId }
  | { type: 'racePlayableV1'; raceId: RaceId }
  | { type: 'originSeaIs'; seaId: SeaId }
  | { type: 'affiliationIs'; affiliationId: AffiliationId }
  | { type: 'affiliationPlayableV1'; affiliationId: AffiliationId }
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
  | { type: 'addItem'; itemId: ItemId; quantity: number; mandatory?: boolean }
  | { type: 'removeItem'; itemId: ItemId; quantity: number }
  | { type: 'buyItem'; itemId: ItemId; quantity: number; negotiation?: DiceResult }
  | { type: 'sellItem'; itemId: ItemId; quantity: number; negotiation?: DiceResult }
  | { type: 'buyShip'; shipId: ShipId; negotiation?: DiceResult }
  | { type: 'sellShip'; negotiation?: DiceResult }
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
  | { type: 'moveToSameIslandPort' }
  | { type: 'recoverToLandInCurrentSea' }
  | { type: 'recoverToOtherRegion' }
  | { type: 'beginMaritimeEmergency'; cause: ShipDamageCause | 'ship_missing' | 'sea_monster' }
  | { type: 'resolveMaritimeEmergencyLandfall' }
  | ({ type: 'setNpcStatus'; status: NpcStatus; allowWithoutLeadership?: boolean } & NpcTarget)
  | { type: 'setNpcPassenger'; npcId: NpcId; passenger: boolean; allowWithoutLeadership?: boolean }
  | { type: 'setLeadership'; isLeader: boolean }
  | { type: 'modifyNpcRelationship'; npcId: NpcId; amount: number }
  | ({ type: 'modifyNpcStat'; statId: NpcStatId; amount: number } & NpcTarget)
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
  | { type: 'endCareerWithEnding'; endingId: EndingId; reason?: CareerEndReason };

export type NpcSelector = 'diceActor' | 'highestRelationshipCrewWithDevilFruit';
export type NpcTarget = { npcId: NpcId; npcSelector?: never } | { npcId?: never; npcSelector: NpcSelector };

export interface Outcome {
  id: OutcomeId;
  textKey: LocalizationKey;
  effects: Effect[];
  shipDamageCause?: ShipDamageCause;
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
  actor?: { type: 'player' } | { type: 'bestCrew'; statId: NpcStatId; requireNoDevilFruit?: boolean } | { type: 'crewRole'; roleId: CrewRoleId; statId: NpcStatId };
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
  interpolation?: Record<string, string | number>;
  visibleIf?: Condition;
  availableIf?: Condition;
  input?: TextChoiceInput;
  resolution: Resolution;
}

interface EventBase {
  id: EventId;
  cast?: NpcId[];
  narrativeFamily?: NarrativeFamily;
  openingRole?: OpeningRole;
  titleKey: LocalizationKey;
  textKey: LocalizationKey;
  interpolation?: Record<string, string | number>;
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
  | { type: 'shipReplacementPending' }
  | { type: 'careerAgeAtLeast'; value: number }
  | { type: 'fallbackStreakAtLeast'; value: number };
export type EventDefinition =
  | (EventBase & { kind: 'system' })
  | (EventBase & { kind: 'normal'; lifetimeThreadSeed?: true; majorTrack?: MajorTrackEventRef; replay?: { cooldownMonths: number; maxOccurrences?: number } })
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
  category: ItemCategory;
  stackLimit: number;
  market: ItemMarketDefinition | null;
  modifiers?: Partial<Record<keyof import('../model/schema').PlayerStats, number>>;
  weapon?: { damageType: WeaponDamageType; rangeType: WeaponRangeType };
  twoHanded?: boolean;
  unique?: boolean;
  logPoseType?: LogPoseType;
  /** Dedicated active animal-object slot; Companion is never an NPC. */
  companion?: true;
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
  priceBerries: number;
}

export interface NpcDefinition {
  id: NpcId;
  nameKey: LocalizationKey;
  sex: NpcSex;
  familyRole?: NpcFamilyRole;
  namePoolId?: string;
  raceId: RaceId | null;
  originSeaId: SeaId | null;
  affiliationId: AffiliationId | null;
  crewRoleId: CrewRoleId | null;
  initialStats: NpcStats;
}

export interface CrewRoleDefinition { id: CrewRoleId; nameKey: LocalizationKey; annualPower?: 'medic' | 'shipwright' | 'navigator' }

export interface RaceDefinition { id: RaceId; nameKey: LocalizationKey; playableV1: boolean; initialHealth: number; attributeModifiers: Partial<Record<StatId, number>> }
export interface SeaDefinition { id: SeaId; nameKey: LocalizationKey }
export interface AffiliationDefinition { id: AffiliationId; nameKey: LocalizationKey; playableV1: boolean; singleParentSex: NpcSex | null }
export interface FamilyStructureDefinition { id: FamilyStructureId; nameKey: LocalizationKey; attributeModifiers: Partial<Record<StatId, number>> }
export interface SocialClassDefinition { id: SocialClassId; nameKey: LocalizationKey; attributeModifiers: Partial<Record<StatId, number>> }
export interface LocationDefinition { id: LocationId; nameKey: LocalizationKey; seaId: SeaId; islandId: IslandId; type: LocationType; parentLocationId: LocationId | null; canBeBirthLocation: boolean; blocksScheduledEvents: boolean; allowsDocking: boolean; shipMarket: ShipMarket; services: LocationServiceId[]; tags: LocationTagId[]; hasMarketHub: boolean; marketItemIds: ItemId[] }
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
  economy: EconomyDefinition;
  items: ItemDefinition[];
  devilFruits: DevilFruitDefinition[];
  ships: ShipDefinition[];
  crewRoles: CrewRoleDefinition[];
  npcs: NpcDefinition[];
  majorNarrativeTracks: MajorNarrativeTrackDefinition[];
  events: EventDefinition[];
}
