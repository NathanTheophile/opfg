import type { GameState } from '../model/schema';
import {
  deserializeGameState,
  serializeGameState,
  type StorageLike,
} from './save';

export const COMPLETED_RUNS_KEY = 'jam-op-fan-game.completed-runs';

export interface CompletedRun {
  id: string;
  completedAt: number;
  state: GameState;
}

export function loadCompletedRuns(storage: StorageLike): CompletedRun[] {
  try {
    const raw = storage.getItem(COMPLETED_RUNS_KEY);
    if (raw === null) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .flatMap((value): CompletedRun[] => {
        if (
          !isRecord(value)
          || typeof value.id !== 'string'
          || typeof value.completedAt !== 'number'
          || !Number.isFinite(value.completedAt)
        ) {
          return [];
        }

        const state = deserializeGameState(JSON.stringify(value.state));
        return state?.careerStatus === 'ended'
          ? [{
              id: value.id,
              completedAt: value.completedAt,
              state,
            }]
          : [];
      })
      .sort((a, b) => b.completedAt - a.completedAt || a.id.localeCompare(b.id));
  } catch {
    return [];
  }
}

export function archiveCompletedRun(
  storage: StorageLike,
  state: GameState,
  completedAt = Date.now(),
): CompletedRun[] {
  if (state.careerStatus !== 'ended') return loadCompletedRuns(storage);

  const existing = loadCompletedRuns(storage);
  const id = completedRunId(state);
  if (existing.some((run) => run.id === id)) return existing;

  const next = [
    {
      id,
      completedAt,
      state: structuredClone(state),
    },
    ...existing,
  ].sort((a, b) => b.completedAt - a.completedAt || a.id.localeCompare(b.id));

  try {
    storage.setItem(COMPLETED_RUNS_KEY, JSON.stringify(next));
  } catch {
    return existing;
  }

  return next;
}

export function completedRunId(state: GameState): string {
  const signature = serializeGameState({
    ...state,
    currentEventId: null,
  });

  return `run-${fnv1a(signature).toString(36)}`;
}

function fnv1a(value: string): number {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
