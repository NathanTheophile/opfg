import type { ChoiceDefinition, ContentCatalog, EventDefinition } from '../content/schema';
import type { GameState, LocationId } from '../model/schema';
import { findDockableAccess } from './locations';
import { ordinaryDepartureHasDestination, paradiseNextDestinationId } from './maritime';

export const DEPARTURE_SYSTEM_EVENT_ID = 'system_navigation:departure';

/** @deprecated Active V1 no longer exposes a monthly destination picker. */
export type MonthlyNavigationChoice = 'stay' | 'dock' | `sailTo:${LocationId}`;

/** @deprecated Active V1 no longer exposes a monthly destination picker. */
export interface MonthlyNavigationOption {
  id: MonthlyNavigationChoice;
  available: boolean;
  destinationId?: LocationId;
}

/** @deprecated Kept temporarily for UI/session compatibility; always false in Active V1. */
export function needsMonthlyNavigationDecision(_state: GameState): boolean {
  return false;
}

/** @deprecated Kept temporarily for UI/session compatibility; always empty in Active V1. */
export function getMonthlyNavigationOptions(_state: GameState, _catalog: ContentCatalog): MonthlyNavigationOption[] {
  return [];
}

/** @deprecated Ordinary Active navigation now goes through the non-root departure System Event. */
export function applyMonthlyNavigationChoice(
  _state: GameState,
  _catalog: ContentCatalog,
  choice: MonthlyNavigationChoice,
): GameState {
  throw new Error(`Monthly navigation choice "${choice}" is disabled in Active V1.`);
}

export function isNavigationSystemEventId(eventId: string): boolean {
  return eventId === DEPARTURE_SYSTEM_EVENT_ID;
}

export function createDepartureSystemEvent(
  state: GameState,
  catalog: ContentCatalog,
  forceForLocalExhaustion = false,
): EventDefinition | null {
  if (
    state.careerStatus !== 'active'
    || state.careerPhase !== 'active'
    || state.travelState !== 'on_land'
    || !state.isLeader
    || state.ship === null
    || (
      findDockableAccess(catalog, state.locationId) === undefined
      && paradiseNextDestinationId(state, catalog) === undefined
    )
    || !ordinaryDepartureHasDestination(state, catalog)
  ) return null;

  const hasResolvedActiveRoot = state.history.some(({ ageMonths }) => ageMonths >= 180);
  const dueToFreshShip = state.navigationDecisionAgeMonths === null && hasResolvedActiveRoot;
  const anchorAgeMonths = state.navigationDecisionAgeMonths ?? Math.min(state.ageMonths, 180);
  const dueByResidence = state.ageMonths - anchorAgeMonths > 6;

  if (!forceForLocalExhaustion && !dueToFreshShip && !dueByResidence) return null;

  const choice = (id: 'navigation:depart' | 'navigation:stay', textKey: string, depart: boolean): ChoiceDefinition => ({
    id,
    textKey,
    resolution: {
      type: 'deterministic',
      outcome: {
        id: `${id}_outcome`,
        textKey: depart ? 'ui.departure.departOutcome' : 'ui.departure.stayOutcome',
        effects: depart
          ? [{ type: 'moveToLocation', locationId: state.locationId, travelState: 'at_sea' }]
          : [],
      },
    },
  });

  return {
    id: DEPARTURE_SYSTEM_EVENT_ID,
    kind: 'system',
    titleKey: 'ui.departure.title',
    textKey: 'ui.departure.body',
    choices: [
      choice('navigation:depart', 'ui.departure.depart', true),
      choice('navigation:stay', 'ui.departure.stay', false),
    ],
  };
}

export function materializeNavigationEvent(
  state: GameState,
  catalog: ContentCatalog,
  eventId: string,
): EventDefinition | undefined {
  if (!isNavigationSystemEventId(eventId)) return undefined;
  return createDepartureSystemEvent(state, catalog, true) ?? undefined;
}

export function applyNavigationSystemResolution(state: GameState, choiceId: string): GameState {
  if (choiceId !== 'navigation:stay') return state;
  return {
    ...state,
    navigationDecisionAgeMonths: state.ageMonths,
  };
}
