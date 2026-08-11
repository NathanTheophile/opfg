import type { ContentCatalog } from '../content/schema';
import type { GameState, LocationId } from '../model/schema';
import {
  findDockableAccess,
  findLocation,
  getNavigableDestinationIds,
  movePlayerToLocation,
} from './locations';

export type MonthlyNavigationChoice = 'stay' | 'dock' | `sailTo:${LocationId}`;

export interface MonthlyNavigationOption {
  id: MonthlyNavigationChoice;
  available: boolean;
  destinationId?: LocationId;
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

  const canDepart = state.travelState === 'at_sea'
    || findDockableAccess(catalog, state.locationId) !== undefined;

  const sailOptions: MonthlyNavigationOption[] = getNavigableDestinationIds(state.locationId, catalog)
    .map((destinationId) => ({
      id: `sailTo:${destinationId}` as MonthlyNavigationChoice,
      available: canDepart,
      destinationId,
    }));

  if (state.travelState === 'on_land') {
    return [
      { id: 'stay', available: true },
      ...sailOptions,
    ];
  }

  const location = findLocation(catalog, state.locationId);
  return [
    { id: 'stay', available: true },
    { id: 'dock', available: location?.allowsDocking === true },
    ...sailOptions,
  ];
}

export function applyMonthlyNavigationChoice(
  state: GameState,
  catalog: ContentCatalog,
  choice: MonthlyNavigationChoice,
): GameState {
  const option = getMonthlyNavigationOptions(state, catalog).find(({ id }) => id === choice);
  if (!option?.available) throw new Error(`Monthly navigation choice "${choice}" is not available.`);

  const next: GameState = {
    ...state,
    navigationDecisionAgeMonths: state.ageMonths,
    currentEventId: null,
  };

  if (option.destinationId) {
    movePlayerToLocation(next, option.destinationId, 'at_sea');
    return next;
  }

  if (choice === 'dock') {
    next.travelState = 'on_land';
  }

  return next;
}
