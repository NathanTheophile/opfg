import type { ContentCatalog } from '../content/schema';
import type { GameState } from '../model/schema';

export const GAMEPLAY_DEBUG_STATE_EVENT = 'opfg:gameplay-debug-state';

export interface GameplayDebugSnapshot {
  gameState: GameState | null;
  catalog: ContentCatalog;
}

export interface GameplayDebugBridge {
  getSnapshot: () => GameplayDebugSnapshot;
  applySystemAction: (action: (state: GameState) => void) => boolean;
}

declare global {
  interface Window {
    __OPFG_GAMEPLAY_DEBUG__?: GameplayDebugBridge;
  }
}

export function getGameplayDebugBridge(): GameplayDebugBridge | null {
  return window.__OPFG_GAMEPLAY_DEBUG__ ?? null;
}
