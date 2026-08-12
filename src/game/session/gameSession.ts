import type { ContentCatalog } from '../content/schema';
import { getChoiceState } from '../engine/conditions';
import { findCurrentEvent, isArrivalMarketHubAvailable, selectNextEvent } from '../engine/events';
import { resolveChoice, type ChoiceResolutionResult } from '../engine/resolution';
import { createInitialGameState } from '../model/initialState';
import type { GameState } from '../model/schema';
import { applyMonthlyNavigationChoice, getMonthlyNavigationOptions, type MonthlyNavigationChoice } from '../engine/navigation';

export interface GameSessionState {
  gameState: GameState | null;
  previousState: GameState | null;
  lastResolution: ChoiceResolutionResult | null;
  marketHubView: 'hub' | 'merchant' | 'port' | null;
}

export function createSessionState(gameState: GameState | null = null): GameSessionState {
  return { gameState, previousState: null, lastResolution: null, marketHubView: gameState?.shipMarketArrivalPending ? 'hub' : null };
}

export function startNewRun(catalog: ContentCatalog, seed: number): GameSessionState {
  return createSessionState(selectNextEvent(createInitialGameState(seed), catalog));
}

export function chooseInSession(session: GameSessionState, catalog: ContentCatalog, choiceId: string, input?: string): GameSessionState {
  if (session.gameState === null) throw new Error('Cannot choose without an active run.');
  const event = findCurrentEvent(session.gameState, catalog);
  if (!event) throw new Error('Cannot choose without a current Event.');
  const choice = event.choices.find(({ id }) => id === choiceId);
  if (choice === undefined) throw new Error(`Unknown Choice "${choiceId}".`);
  const state = getChoiceState(choice, session.gameState, catalog);
  if (!state.visible || !state.available) throw new Error(`Choice "${choiceId}" is not available.`);
  const resolution = resolveChoice(session.gameState, catalog, event.id, choice.id, input);
  return { gameState: resolution.state, previousState: session.gameState, lastResolution: resolution, marketHubView: resolution.state.shipMarketArrivalPending ? 'hub' : null };
}

export function dismissResolution(session: GameSessionState): GameSessionState {
  return { ...session, previousState: null, lastResolution: null };
}

export function chooseMonthlyNavigationInSession(session: GameSessionState, catalog: ContentCatalog, choice: MonthlyNavigationChoice): GameSessionState {
  if (session.gameState === null) throw new Error('Cannot choose navigation without an active run.');
  const next = applyMonthlyNavigationChoice(session.gameState, catalog, choice);
  return { gameState: selectNextEvent(next, catalog), previousState: session.gameState, lastResolution: null, marketHubView: next.shipMarketArrivalPending ? 'hub' : null };
}

export function openMarketHubView(session: GameSessionState, catalog: ContentCatalog, view: 'merchant' | 'port'): GameSessionState {
  if (!session.gameState || !isArrivalMarketHubAvailable(session.gameState, catalog)) throw new Error('No Arrival Market Hub is available.');
  const location = catalog.locations.find(({ id }) => id === session.gameState!.locationId)!;
  if (view === 'merchant' && location.marketItemIds.length === 0) throw new Error('This Market Hub has no merchant catalog.');
  if (view === 'port' && location.shipMarket === 'none') throw new Error('This Market Hub has no port market.');
  return { ...session, marketHubView: view };
}

export function returnToMarketHub(session: GameSessionState, catalog: ContentCatalog): GameSessionState {
  if (!session.gameState || !isArrivalMarketHubAvailable(session.gameState, catalog)) throw new Error('No Arrival Market Hub is available.');
  return { ...session, marketHubView: 'hub' };
}

export function exploreFromMarketHub(session: GameSessionState, catalog: ContentCatalog): GameSessionState {
  if (!session.gameState || !isArrivalMarketHubAvailable(session.gameState, catalog)) throw new Error('No Arrival Market Hub is available.');
  const previousState = session.gameState;
  const resumed = selectNextEvent({ ...previousState, shipMarketArrivalPending: false }, catalog);
  return { gameState: resumed, previousState, lastResolution: null, marketHubView: null };
}

export function getSessionNavigationOptions(session: GameSessionState, catalog: ContentCatalog) {
  return session.gameState === null ? [] : getMonthlyNavigationOptions(session.gameState, catalog);
}
