export type EventId = string;
export type ChoiceId = string;
export type OutcomeId = string;
export type LocationId = string;
export type IslandId = string;
export type TraitId = string;
export type FlagId = string;
export type ItemId = string;
export type NpcId = string;
export type RaceId = string;
export type SeaId = string;
export type AffiliationId = string;
export type FamilyStructureId = string;
export type SocialClassId = string;
export type ShipId = string;
export type CrewRoleId = string;
export type DevilFruitId = string;
export type DevilFruitTagId = string;
export type HakiType = 'observation' | 'armament' | 'conqueror';
export type CareerAffiliationId = 'civilian' | 'pirate' | 'marine' | 'revolutionary' | 'bounty_hunter';
export type CareerRankId = string;
/** @deprecated Use CareerRankId. */
export type MarineRankId = CareerRankId;
export type CareerTitleId = string;
export type EndingId = string;

export interface CareerState {
  affiliationId: CareerAffiliationId;
  reputation: number;
  bounty: number;
  rankId: CareerRankId | null;
  titleId: CareerTitleId | null;
}

export interface PowerState {
  devilFruitId: DevilFruitId | null;
  devilFruitAwakening: number;
  haki: Record<HakiType, number>;
}

export interface ItemStack {
  itemId: ItemId;
  quantity: number;
}

export interface InventoryState {
  capacity: number;
  stacks: ItemStack[];
}

export interface PlayerProfile {
  name: string | null;
  raceId: RaceId | null;
  originSeaId: SeaId | null;
  affiliationId: AffiliationId | null;
  familyStructureId: FamilyStructureId | null;
  socialClassId: SocialClassId | null;
}

export interface PlayerStats {
  health: number;
  morale: number;
  strength: number;
  agility: number;
  observation: number;
  intelligence: number;
  navigation: number;
  charisma: number;
  luck: number;
}

export type PlayerAttributeId = Exclude<keyof PlayerStats, 'health'>;

export interface PlayerState {
  profile: PlayerProfile;
  career: CareerState;
  stats: PlayerStats;
  traits: TraitId[];
  inventory: InventoryState;
  powers: PowerState;
}

export interface ShipState {
  shipId: ShipId;
  name: string;
  health: number;
  cargo: ItemStack[];
}

export type NpcStatus = 'known' | 'crew' | 'departed' | 'unavailable' | 'dead';

export interface NpcStats {
  health: number;
  morale: number;
  strength: number;
  observation: number;
  intelligence: number;
  luck: number;
  loyalty: number;
  calm: number;
}

export type NpcStatId = keyof NpcStats;

export interface NpcState {
  raceId: RaceId | null;
  displayName: string | null;
  status: NpcStatus;
  relationship: number;
  lastInteractionAgeMonths: number | null;
  stats: NpcStats;
  powers: PowerState;
}

export interface HistoryEntry {
  eventId: EventId;
  choiceId: ChoiceId;
  outcomeId: OutcomeId;
  ageMonths: number;
}

export interface ScheduledEvent {
  eventId: EventId;
  dueAgeMonths: number;
  sourceEventId: EventId;
  sourceChoiceId: ChoiceId;
}

export type CareerStatus = 'active' | 'ended';
export type CareerEndReason = 'death' | 'legacy';
export type CareerPhase = 'origins' | 'childhood' | 'active';
export type TravelState = 'at_sea' | 'on_land';
export type ShipDamageCause = 'enemy' | 'accident';
export interface MaritimeEmergencyState {
  kind: 'shipwreck';
  seaId: SeaId;
  cause: ShipDamageCause | 'ship_missing' | 'sea_monster';
}

export interface GameState {
  version: number;
  rngState: number;
  careerPhase: CareerPhase;
  ageMonths: number;
  slotInMonth: 0 | 1;
  travelState: TravelState;
  locationId: LocationId;
  player: PlayerState;
  ship: ShipState | null;
  pendingShip: ShipState | null;
  maritimeEmergency: MaritimeEmergencyState | null;
  isLeader: boolean;
  passengerNpcIds: NpcId[];
  berries: number;
  flags: FlagId[];
  npcs: Record<NpcId, NpcState>;
  history: HistoryEntry[];
  scheduledEvents: ScheduledEvent[];
  immediateEventQueue: EventId[];
  pendingSlotPhase: CareerPhase | null;
  immediateEventsResolvedInChain: number;
  navigationDecisionAgeMonths: number | null;
  shipMarketArrivalPending: boolean;
  currentEventId: EventId | null;
  careerStatus: CareerStatus;
  careerEndReason: CareerEndReason | null;
  endingId: EndingId | null;
}
