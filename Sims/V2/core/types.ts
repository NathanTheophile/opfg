import type { DiceResult, StatId } from '../../../src/game/content/schema';
import type { CareerAffiliationId, CrewRoleId, GameState, TravelState } from '../../../src/game/model/schema';
import type { SimulationTerminationReason } from '../../../src/game/simulation/types';

export type V2PolicyId = 'random' | 'progression' | 'minmax';
export type V2SuiteId =
  | 'sanity'
  | 'health'
  | 'travel'
  | 'crew'
  | 'economy-ships'
  | 'progression'
  | 'narrative'
  | 'dice'
  | 'endings';

export interface V2CliArgs {
  runs: number;
  seed: number;
  maxEvents: number;
  policy: V2PolicyId;
  jsonPath?: string;
  progress: boolean;
  progressEveryMs: number;
  top: number;
  includeRuns: boolean;
}

export interface DiceObservation {
  eventId: string;
  statId: StatId;
  rawRoll: number;
  modifierTotal: number;
  total: number;
  result: DiceResult;
  actor: 'player' | 'crew';
}

export interface V2RunSample {
  seed: number;
  terminationReason: SimulationTerminationReason;
  error?: string;
  playerDeath: boolean;
  careerEndReason: string | null;
  endingId: string | null;
  finalAgeMonths: number;
  reachedAge35: boolean;
  eventCount: number;
  normalEvents: number;
  scheduledEvents: number;
  criticalEvents: number;
  immediateEvents: number;
  fallbackEvents: number;
  maximumFallbackStreak: number;
  maximumImmediateChainLength: number;
  immediateGuardTriggered: boolean;
  possibleCriticalLoop: boolean;
  lifetimeThreadStarted: boolean;

  raceId: string | null;
  originSeaId: string | null;
  initialHealth: number | null;
  finalHealth: number;
  minimumHealth: number;
  totalDamage: number;
  totalHealing: number;
  medicHealing: number;
  deathAgeMonths: number | null;
  lethalEventId: string | null;
  damageByTravelState: Record<TravelState, number>;
  healingByTravelState: Record<TravelState, number>;
  damageByEvent: Record<string, number>;

  finalCareer: CareerAffiliationId;
  careersSeen: CareerAffiliationId[];
  finalBerries: number;
  totalIncome: number;
  totalSpend: number;
  minimumBerries: number;
  maximumBerries: number;

  everHadShip: boolean;
  firstShipAgeMonths: number | null;
  shipAcquisitions: number;
  shipLosses: number;
  shipIdsSeen: string[];
  finalShipId: string | null;
  finalShipHealth: number | null;
  everAtSeaWithoutShip: boolean;

  maxCrewSize: number;
  crewIdsEver: string[];
  crewRolesEver: CrewRoleId[];
  crewRecruitments: number;
  crewDepartures: number;
  crewPowerUses: Record<string, number>;
  crewPowerEffectiveHealing: number;
  rolePresenceYears: Record<string, number[]>;
  roleAvailableYears: Record<string, number[]>;
  roleUsedYears: Record<string, number[]>;

  visitedLocations: string[];
  visitedSeas: string[];
  finalLocationId: string;
  finalSeaId: string;
  paradiseRouteIds: string[];
  reverseMountainAttempted: boolean;
  reverseMountainReached: boolean;
  reverseMountainPassed: boolean;
  paradiseReached: boolean;
  thrillerBarkReached: boolean;
  sabaodyReached: boolean;
  fishManIslandReached: boolean;
  newWorldReached: boolean;
  reverseMountainAttemptWithNavigator: boolean;

  finalTraits: string[];
  traitsEver: string[];
  devilFruitId: string | null;
  finalFruitAwakening: number;
  finalHaki: Record<'observation' | 'armament' | 'conqueror', number>;
  finalStats: GameState['player']['stats'];

  eventIdsSeen: string[];
  eventCounts: Record<string, number>;
  dice: DiceObservation[];
}

export interface ProgressMetric {
  label: string;
  value: string | number;
}

export interface SuiteDefinition {
  id: V2SuiteId;
  title: string;
  objective: string;
  summarize(samples: readonly V2RunSample[], top: number): unknown;
  progress(samples: readonly V2RunSample[]): ProgressMetric[];
}

export interface V2Report {
  telemetryVersion: '2.0';
  suite: {
    id: V2SuiteId;
    title: string;
    objective: string;
  };
  config: V2CliArgs;
  startedAt: string;
  completedAt: string;
  elapsedMs: number;
  common: unknown;
  summary: unknown;
  runs?: unknown[];
  policyTelemetry?: unknown;
}
