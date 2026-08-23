import type { ContentCatalog } from '../content/schema';
import { getChoiceState } from '../engine/conditions';
import { findCurrentEvent, selectNextEvent } from '../engine/events';
import { resolveChoice, type ChoiceResolutionResult } from '../engine/resolution';
import { createInitialGameState } from '../model/initialState';
import type { GameState } from '../model/schema';
import {
  applyMonthlyNavigationChoice,
  getMonthlyNavigationOptions,
  type MonthlyNavigationChoice,
} from '../engine/navigation';

export interface GameSessionState {
  gameState: GameState | null;
  previousState: GameState | null;
  lastResolution: ChoiceResolutionResult | null;
}

export function createSessionState(
  gameState: GameState | null = null,
  catalog?: ContentCatalog,
): GameSessionState {
  const normalized =
    gameState !== null
    && catalog !== undefined
    && gameState.currentEventId === null
      ? selectNextEvent(gameState, catalog)
      : gameState;

  return {
    gameState: normalized,
    previousState: null,
    lastResolution: null,
  };
}

export function startNewRun(catalog: ContentCatalog, seed: number): GameSessionState {
  return createSessionState(selectNextEvent(createInitialGameState(seed), catalog));
}

export function chooseInSession(
  session: GameSessionState,
  catalog: ContentCatalog,
  choiceId: string,
  input?: string,
): GameSessionState {
  if (session.gameState === null) throw new Error('Cannot choose without an active run.');

  const event = findCurrentEvent(session.gameState, catalog);
  if (!event) throw new Error('Cannot choose without a current Event.');

  const choice = event.choices.find(({ id }) => id === choiceId);
  if (choice === undefined) throw new Error(`Unknown Choice "${choiceId}".`);

  const state = getChoiceState(choice, session.gameState, catalog);
  if (!state.visible || !state.available) throw new Error(`Choice "${choiceId}" is not available.`);

  const resolution = resolveChoice(
    session.gameState,
    catalog,
    event.id,
    choice.id,
    input,
  );

  return {
    gameState: resolution.state,
    previousState: session.gameState,
    lastResolution: resolution,
  };
}

export function dismissResolution(
  session: GameSessionState,
  _catalog?: ContentCatalog,
): GameSessionState {
  return {
    ...session,
    previousState: null,
    lastResolution: null,
  };
}

export function chooseMonthlyNavigationInSession(
  session: GameSessionState,
  catalog: ContentCatalog,
  choice: MonthlyNavigationChoice,
): GameSessionState {
  if (session.gameState === null) throw new Error('Cannot choose navigation without an active run.');
  const navigated = applyMonthlyNavigationChoice(session.gameState, catalog, choice);
  return createSessionState(selectNextEvent(navigated, catalog));
}

export function getSessionNavigationOptions(
  session: GameSessionState,
  catalog: ContentCatalog,
) {
  return session.gameState === null
    ? []
    : getMonthlyNavigationOptions(session.gameState, catalog);
}
