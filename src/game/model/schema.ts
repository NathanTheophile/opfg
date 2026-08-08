export type EventId = string;
export type ChoiceId = string;
export type OutcomeId = string;
export type LocationId = string;
export type TraitId = string;
export type FlagId = string;
export type ItemId = string;
export type NpcId = string;

export interface PlayerStats {
  navigation: number;
  presence: number;
  willpower: number;
}

export interface PlayerState {
  stats: PlayerStats;
  traits: TraitId[];
}

export interface ShipState {
  condition: number;
}

export type NpcStatus = 'known' | 'crew' | 'departed' | 'unavailable';

export interface NpcState {
  status: NpcStatus;
  relationship: number;
}

export interface HistoryEntry {
  eventId: EventId;
  choiceId: ChoiceId;
  outcomeId: OutcomeId;
  month: number;
}

export interface ScheduledEvent {
  eventId: EventId;
  dueMonth: number;
  sourceEventId: EventId;
  sourceChoiceId: ChoiceId;
}

export type CareerStatus = 'active' | 'ended';
export type CareerPhase = 'origins' | 'childhood' | 'active';
export type TravelState = 'at_sea' | 'on_land';

export interface GameState {
  version: number;
  rngState: number;
  careerPhase: CareerPhase;
  ageMonths: number;
  month: number;
  travelState: TravelState;
  locationId: LocationId;
  player: PlayerState;
  ship: ShipState;
  flags: FlagId[];
  items: ItemId[];
  npcs: Record<NpcId, NpcState>;
  history: HistoryEntry[];
  scheduledEvents: ScheduledEvent[];
  currentEventId: EventId | null;
  careerStatus: CareerStatus;
}
