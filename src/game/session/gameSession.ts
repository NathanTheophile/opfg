import type { ContentCatalog, EventDefinition } from '../content/schema';
import { getChoiceState } from '../engine/conditions';
import { findCurrentEvent, selectNextEvent } from '../engine/events';
import { createArrivalMarketEvent, marketReturnEvent } from '../engine/marketEvents';
import { resolveChoice, type ChoiceResolutionResult } from '../engine/resolution';
import { createInitialGameState } from '../model/initialState';
import type { GameState } from '../model/schema';
import { applyMonthlyNavigationChoice, getMonthlyNavigationOptions, type MonthlyNavigationChoice } from '../engine/navigation';

export interface GameSessionState {
  gameState: GameState | null;
  previousState: GameState | null;
  lastResolution: ChoiceResolutionResult | null;
  systemEvent: EventDefinition | null;
  pendingSystemEvent: EventDefinition | null;
  systemResolutionPending: boolean;
}

function activateSystemEvent(state: GameState, event: EventDefinition): GameState {
  return { ...state, currentEventId: event.id };
}

export function createSessionState(gameState: GameState | null = null, catalog?: ContentCatalog): GameSessionState {
  const systemEvent = gameState && catalog ? createArrivalMarketEvent(gameState, catalog) : null;
  return { gameState: gameState && systemEvent ? activateSystemEvent(gameState, systemEvent) : gameState, previousState: null, lastResolution: null, systemEvent, pendingSystemEvent: null, systemResolutionPending: false };
}

export function startNewRun(catalog: ContentCatalog, seed: number): GameSessionState {
  return createSessionState(selectNextEvent(createInitialGameState(seed), catalog), catalog);
}

export function chooseInSession(session: GameSessionState, catalog: ContentCatalog, choiceId: string, input?: string): GameSessionState {
  if (session.gameState === null) throw new Error('Cannot choose without an active run.');
  const event = session.systemEvent ?? findCurrentEvent(session.gameState, catalog);
  if (!event) throw new Error('Cannot choose without a current Event.');
  const choice = event.choices.find(({ id }) => id === choiceId);
  if (choice === undefined) throw new Error(`Unknown Choice "${choiceId}".`);
  const runtimeCatalog = session.systemEvent ? { ...catalog, events: [...catalog.events, event] } : catalog;
  const state = getChoiceState(choice, session.gameState, runtimeCatalog);
  if (!state.visible || !state.available) throw new Error(`Choice "${choiceId}" is not available.`);
  const resolution = resolveChoice(session.gameState, runtimeCatalog, event.id, choice.id, input);
  if (!session.systemEvent) {
    const systemEvent = createArrivalMarketEvent(resolution.state, catalog);
    return { ...session, gameState: systemEvent ? activateSystemEvent(resolution.state, systemEvent) : resolution.state, previousState: session.gameState, lastResolution: resolution, systemEvent };
  }
  const pendingSystemEvent = marketReturnEvent(resolution.state, catalog, event.id, choiceId);
  return { gameState: resolution.state, previousState: session.gameState, lastResolution: resolution, systemEvent: event, pendingSystemEvent, systemResolutionPending: true };
}

export function dismissResolution(session: GameSessionState, catalog?: ContentCatalog): GameSessionState {
  if (!session.systemResolutionPending) return { ...session, previousState: null, lastResolution: null };
  if (!session.gameState || !catalog) throw new Error('Cannot continue a System Event without state and catalog.');
  if (session.pendingSystemEvent) return {
    ...session, gameState: activateSystemEvent(session.gameState, session.pendingSystemEvent), previousState: null, lastResolution: null,
    systemEvent: session.pendingSystemEvent, pendingSystemEvent: null, systemResolutionPending: false,
  };
  const resumed = selectNextEvent({ ...session.gameState, shipMarketArrivalPending: false, currentEventId: null }, catalog);
  return { gameState: resumed, previousState: null, lastResolution: null, systemEvent: null, pendingSystemEvent: null, systemResolutionPending: false };
}

export function chooseMonthlyNavigationInSession(session: GameSessionState, catalog: ContentCatalog, choice: MonthlyNavigationChoice): GameSessionState {
  if (session.gameState === null) throw new Error('Cannot choose navigation without an active run.');
  const next = applyMonthlyNavigationChoice(session.gameState, catalog, choice);
  return createSessionState(selectNextEvent(next, catalog), catalog);
}

export function getSessionNavigationOptions(session: GameSessionState, catalog: ContentCatalog) {
  return session.gameState === null ? [] : getMonthlyNavigationOptions(session.gameState, catalog);
}
