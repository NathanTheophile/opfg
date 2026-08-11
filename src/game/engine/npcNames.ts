import { NPC_NAME_POOLS } from '../content/npcNamePools';
import type { ContentCatalog, EventDefinition } from '../content/schema';
import type { GameState, NpcId, NpcState } from '../model/schema';
import { createDefaultNpcState } from '../model/npcState';
import { nextRandom } from './rng';

export function ensureNpcMaterialized(
  state: GameState,
  catalog: ContentCatalog,
  npcId: NpcId,
): NpcState {
  const existing = state.npcs[npcId];
  if (existing !== undefined) return existing;

  const definition = catalog.npcs.find(({ id }) => id === npcId);
  if (definition === undefined) throw new Error(`Unknown NPC "${npcId}".`);

  const base = createDefaultNpcState();
  let displayName: string | null = null;

  if (definition.namePoolId !== undefined) {
    const pool = NPC_NAME_POOLS[definition.namePoolId];
    if (pool === undefined || pool.length === 0) {
      throw new Error(`Unknown or empty NPC name pool "${definition.namePoolId}".`);
    }

    const usedNames = new Set(
      Object.values(state.npcs)
        .map((npc) => npc.displayName)
        .filter((name): name is string => typeof name === 'string' && name.length > 0),
    );
    const available = pool.filter((name) => !usedNames.has(name));
    const candidates = available.length > 0 ? available : pool;
    const random = nextRandom(state.rngState);
    state.rngState = random.nextState;
    displayName = candidates[Math.floor(random.value * candidates.length)];
  }

  const npc: NpcState = {
    ...base,
    raceId: definition.raceId,
    displayName,
    stats: { ...definition.initialStats },
  };
  state.npcs[npcId] = npc;
  return npc;
}

export function materializeEventCast(
  state: GameState,
  catalog: ContentCatalog,
  event: EventDefinition,
): GameState {
  const generatedCast = (event.cast ?? []).filter((npcId) =>
    catalog.npcs.find(({ id }) => id === npcId)?.namePoolId !== undefined,
  );
  if (generatedCast.length === 0) return state;

  const next: GameState = {
    ...state,
    npcs: { ...state.npcs },
  };
  for (const npcId of generatedCast) ensureNpcMaterialized(next, catalog, npcId);
  return next;
}

export function npcInterpolationParams(
  state: GameState | null,
  catalog: ContentCatalog,
  fallbackName: (nameKey: string) => string,
): Record<string, string> {
  return Object.fromEntries(catalog.npcs.map((definition) => [
    `npc_${definition.id.replace(/[^A-Za-z0-9_]/g, '_')}`,
    state?.npcs[definition.id]?.displayName ?? fallbackName(definition.nameKey),
  ]));
}
