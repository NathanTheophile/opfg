import type { ContentCatalog } from '../content/schema';
import type { GameState } from '../model/schema';

export type MonthlyNavigationChoice = 'stay' | 'goToSea' | 'dock';

export interface MonthlyNavigationOption {
  id: MonthlyNavigationChoice;
  available: boolean;
}

export function needsMonthlyNavigationDecision(state: GameState): boolean {
  return state.careerStatus === 'active'
    && state.careerPhase === 'active'
    && state.slotInMonth === 0
    && state.pendingSlotPhase === null
    && state.immediateEventQueue.length === 0
    && state.isLeader
    && state.ship !== null
    && state.navigationDecisionAgeMonths !== state.ageMonths;
}

export function getMonthlyNavigationOptions(state: GameState, catalog: ContentCatalog): MonthlyNavigationOption[] {
  if (!needsMonthlyNavigationDecision(state)) return [];
  if (state.travelState === 'on_land') return [
    { id: 'stay', available: true },
    { id: 'goToSea', available: true },
  ];
  const location = catalog.locations.find(({ id }) => id === state.locationId);
  return [
    { id: 'stay', available: true },
    { id: 'dock', available: location?.allowsDocking === true },
  ];
}

export function applyMonthlyNavigationChoice(state: GameState, catalog: ContentCatalog, choice: MonthlyNavigationChoice): GameState {
  const option = getMonthlyNavigationOptions(state, catalog).find(({ id }) => id === choice);
  if (!option?.available) throw new Error(`Monthly navigation choice "${choice}" is not available.`);
  const travelState = choice === 'goToSea' ? 'at_sea' : choice === 'dock' ? 'on_land' : state.travelState;
  return { ...state, travelState, navigationDecisionAgeMonths: state.ageMonths, currentEventId: null };
}
