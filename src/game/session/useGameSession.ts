import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ContentCatalog } from '../content/schema';
import { syncAchievements } from '../achievements/metaProgression';
import type { AchievementId } from '../achievements/model';
import { loadMetaProgression, saveMetaProgression } from '../achievements/storage';
import { clearGameState, loadGameState, saveGameState, type StorageLike } from '../engine/save';
import { archiveCompletedRun } from '../engine/completedRuns';
import { findCurrentEvent, selectNextEvent } from '../engine/events';
import {
  chooseInSession,
  chooseMonthlyNavigationInSession,
  createSessionState,
  dismissResolution,
  getSessionNavigationOptions,
  startNewRun,
} from './gameSession';
import type { MonthlyNavigationChoice } from '../engine/navigation';
import type { GameState } from '../model/schema';
import {
  GAMEPLAY_DEBUG_STATE_EVENT,
  type GameplayDebugBridge,
} from './devGameplayDebugBridge';

let fallbackSeed = Date.now() >>> 0;

function generateSeed(): number {
  if (globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
  }
  fallbackSeed = (fallbackSeed + 0x6d2b79f5) >>> 0;
  return fallbackSeed;
}

export function useGameSession(catalog: ContentCatalog, storage: StorageLike) {
  const [session, setSession] = useState(() =>
    createSessionState(loadGameState(storage), catalog),
  );
  const [metaProgression, setMetaProgression] = useState(() => loadMetaProgression(storage));
  const metaProgressionRef = useRef(metaProgression);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<AchievementId[]>([]);
  const initialAchievementSyncHandledRef = useRef(false);

  const syncMetaProgression = useCallback((gameState: GameState | null) => {
    if (gameState === null) return;

    const result = syncAchievements(
      metaProgressionRef.current,
      gameState,
      catalog,
      Date.now(),
    );

    metaProgressionRef.current = result.state;
    setMetaProgression(result.state);
    saveMetaProgression(storage, result.state);

    if (result.newlyUnlocked.length > 0) {
      setNewlyUnlockedAchievements((current) => [
        ...current,
        ...result.newlyUnlocked.filter((id) => !current.includes(id)),
      ]);
    }
  }, [catalog, storage]);

  useEffect(() => {
    if (initialAchievementSyncHandledRef.current || session.gameState === null) return;
    initialAchievementSyncHandledRef.current = true;
    if (session.gameState.careerStatus === 'ended') {
      archiveCompletedRun(storage, session.gameState);
    }
    syncMetaProgression(session.gameState);
  }, [session.gameState, syncMetaProgression]);

  const currentEvent = useMemo(
    () =>
      session.gameState === null
        ? null
        : findCurrentEvent(session.gameState, catalog),
    [catalog, session.gameState],
  );

  const start = (seed = generateSeed()) => {
    clearGameState(storage);
    const next = startNewRun(catalog, seed);
    if (next.gameState) {
      saveGameState(storage, next.gameState);
      syncMetaProgression(next.gameState);
    }
    setSession(next);
  };

  const choose = (choiceId: string, input?: string) => {
    const next = chooseInSession(session, catalog, choiceId, input);
    if (next.gameState) {
      saveGameState(storage, next.gameState);
      if (next.gameState.careerStatus === 'ended') {
        archiveCompletedRun(storage, next.gameState);
      }
      syncMetaProgression(next.gameState);
    }
    setSession(next);
    return next.lastResolution;
  };

  const continueAfterResolution = () =>
    setSession((current) => {
      const next = dismissResolution(current, catalog);
      if (next.gameState) saveGameState(storage, next.gameState);
      return next;
    });

  const navigationOptions = useMemo(
    () => getSessionNavigationOptions(session, catalog),
    [catalog, session],
  );

  const chooseNavigation = (choice: MonthlyNavigationChoice) => {
    const next = chooseMonthlyNavigationInSession(session, catalog, choice);
    if (next.gameState) {
      saveGameState(storage, next.gameState);
      syncMetaProgression(next.gameState);
    }
    setSession(next);
  };

  const applySystemAction = (action: (state: GameState) => void) => {
    if (!session.gameState) return false;

    const nextState = structuredClone(session.gameState);
    action(nextState);

    const normalized =
      nextState.currentEventId === null
        ? selectNextEvent(nextState, catalog)
        : nextState;

    const next = createSessionState(normalized);
    if (next.gameState) {
      saveGameState(storage, next.gameState);
      if (next.gameState.careerStatus === 'ended') {
        archiveCompletedRun(storage, next.gameState);
      }
      syncMetaProgression(next.gameState);
    }
    setSession(next);
    return true;
  };

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;

    const bridge: GameplayDebugBridge = {
      getSnapshot: () => ({
        gameState: session.gameState,
        catalog,
      }),
      applySystemAction,
    };

    window.__OPFG_GAMEPLAY_DEBUG__ = bridge;
    window.dispatchEvent(new Event(GAMEPLAY_DEBUG_STATE_EVENT));

    return () => {
      if (window.__OPFG_GAMEPLAY_DEBUG__ === bridge) {
        delete window.__OPFG_GAMEPLAY_DEBUG__;
      }
    };
  }, [catalog, session]);

  const dismissAchievementUnlock = (achievementId?: AchievementId) =>
    setNewlyUnlockedAchievements((current) =>
      achievementId === undefined
        ? current.slice(1)
        : current.filter((id) => id !== achievementId),
    );

  return {
    ...session,
    metaProgression,
    newlyUnlockedAchievements,
    dismissAchievementUnlock,
    currentEvent,
    navigationOptions,
    startNewRun: start,
    restartRun: start,
    choose,
    chooseNavigation,
    applySystemAction,
    continueAfterResolution,
  };
}
