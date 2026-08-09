import { useMemo, useState } from 'react';
import type { ContentCatalog } from '../content/schema';
import { clearGameState, loadGameState, saveGameState, type StorageLike } from '../engine/save';
import { findCurrentEvent } from '../engine/events';
import { chooseInSession, chooseMonthlyNavigationInSession, createSessionState, dismissResolution, getSessionNavigationOptions, startNewRun } from './gameSession';
import type { MonthlyNavigationChoice } from '../engine/navigation';

let fallbackSeed = Date.now() >>> 0;
function generateSeed(): number {
  if (globalThis.crypto?.getRandomValues) return globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
  fallbackSeed = (fallbackSeed + 0x6d2b79f5) >>> 0;
  return fallbackSeed;
}

export function useGameSession(catalog: ContentCatalog, storage: StorageLike) {
  const [session, setSession] = useState(() => createSessionState(loadGameState(storage)));
  const currentEvent = useMemo(() => session.gameState === null ? null : findCurrentEvent(session.gameState, catalog), [catalog, session.gameState]);

  const start = (seed = generateSeed()) => {
    clearGameState(storage);
    const next = startNewRun(catalog, seed);
    if (next.gameState) saveGameState(storage, next.gameState);
    setSession(next);
  };
  const choose = (choiceId: string, input?: string) => {
    const next = chooseInSession(session, catalog, choiceId, input);
    if (next.gameState) saveGameState(storage, next.gameState);
    setSession(next);
    return next.lastResolution;
  };
  const continueAfterResolution = () => setSession((current) => dismissResolution(current));
  const navigationOptions = useMemo(() => getSessionNavigationOptions(session, catalog), [catalog, session]);
  const chooseNavigation = (choice: MonthlyNavigationChoice) => {
    const next = chooseMonthlyNavigationInSession(session, catalog, choice);
    if (next.gameState) saveGameState(storage, next.gameState);
    setSession(next);
  };

  return { ...session, currentEvent, navigationOptions, startNewRun: start, restartRun: start, choose, chooseNavigation, continueAfterResolution };
}
