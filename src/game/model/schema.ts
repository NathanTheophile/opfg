export type EventId = string;
export type ChoiceId = string;
export type OutcomeId = string;
export type LocationId = string;
export type TraitId = string;
export type FlagId = string;
export type ItemId = string;
export type NpcId = string;
export type RaceId = string;
export type SeaId = string;
export type AffiliationId = string;
export type ShipId = string;
export type CrewRoleId = string;

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
  awakening: number | null;
}

export interface PlayerState {
  profile: PlayerProfile;
  stats: PlayerStats;
  traits: TraitId[];
  inventory: InventoryState;
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
  status: NpcStatus;
  relationship: number;
  stats: NpcStats;
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
  isLeader: boolean;
  passengerNpcIds: NpcId[];
  berries: number;
  flags: FlagId[];
  npcs: Record<NpcId, NpcState>;
  history: HistoryEntry[];
  scheduledEvents: ScheduledEvent[];
  currentEventId: EventId | null;
  careerStatus: CareerStatus;
  careerEndReason: CareerEndReason | null;
}
