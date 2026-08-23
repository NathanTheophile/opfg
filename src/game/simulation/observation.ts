import type { ChoiceDefinition, ContentCatalog, EventDefinition, Outcome } from '../content/schema';
import type { DiceRollResult } from '../engine/dice';
import type { CrewRoleId, GameState } from '../model/schema';
import type { MonthlyNavigationChoice } from '../engine/navigation';
import type { SimulationTerminationReason } from './types';

export interface ObservedEventResolution {
  beforeState: GameState;
  afterState: GameState;
  event: EventDefinition;
  choice: ChoiceDefinition;
  outcome: Outcome;
  diceResult?: 'criticalFailure' | 'failure' | 'success' | 'criticalSuccess';
  dice?: DiceRollResult;
}

export interface ObservedNavigationResolution {
  beforeState: GameState;
  afterState: GameState;
  choice: MonthlyNavigationChoice;
}

export interface ObservedCrewPowerUse {
  beforeState: GameState;
  afterState: GameState;
  roleId: CrewRoleId;
  parameterId?: string;
}

export interface ObservedTermination {
  state: GameState;
  reason: SimulationTerminationReason;
  error?: string;
}

export interface SimulationObserver {
  onInitialState?(state: GameState, catalog: ContentCatalog): void;
  onNavigationResolved?(entry: ObservedNavigationResolution, catalog: ContentCatalog): void;
  onCrewPowerUsed?(entry: ObservedCrewPowerUse, catalog: ContentCatalog): void;
  onEventResolved?(entry: ObservedEventResolution, catalog: ContentCatalog): void;
  onTermination?(entry: ObservedTermination, catalog: ContentCatalog): void;
}
