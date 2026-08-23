import type { DiceResult, EventDefinition } from '../content/schema';
import type { GameState, HistoryEntry, NpcId, ScheduledEvent } from '../model/schema';

export type SimulationTerminationReason = 'careerEnded' | 'deadEnd' | 'safetyLimit' | 'simulationError';

export interface ResolvedSimulationEvent {
  eventId: string;
  choiceId: string;
  outcomeId: string;
  kind: EventDefinition['kind'];
  ageMonths: number;
  diceResult?: DiceResult;
  travelState: GameState['travelState'];
}

export interface DeadEndSnapshot {
  seed: number;
  careerPhase: GameState['careerPhase'];
  ageMonths: number;
  slotInMonth: GameState['slotInMonth'];
  locationId: string;
  travelState: GameState['travelState'];
  isLeader: boolean;
  passengerNpcIds: NpcId[];
  traits: string[];
  flags: string[];
  items: string[];
  npcStatuses: Record<NpcId, string>;
  scheduledEvents: ScheduledEvent[];
  recentHistory: HistoryEntry[];
}

export interface SimulationRunResult {
  seed: number;
  terminationReason: SimulationTerminationReason;
  finalState: GameState;
  resolvedEvents: ResolvedSimulationEvent[];
  normalEvents: number;
  scheduledEvents: number;
  criticalEvents: number;
  immediateEvents: number;
  fallbackEvents: { land: number; sea: number; total: number };
  maximumImmediateChainLength: number;
  immediateGuardTriggered: boolean;
  diceChecks: Record<DiceResult, number> & { total: number };
  traits: string[];
  items: string[];
  playerDeath: boolean;
  npcDeaths: NpcId[];
  shipLosses: number;
  maxAgeMonths: number;
  childhoodReached: boolean;
  activeReached: boolean;
  lifetimeThreadStarted: boolean;
  pendingScheduled: { due: ScheduledEvent[]; notDue: ScheduledEvent[] };
  possibleCriticalLoop: boolean;
  deadEnd?: DeadEndSnapshot;
  error?: string;
}
