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
  const definition = catalog.npcs.find(({ id }) => id === npcId);
  if (definition === undefined) throw new Error(`Unknown NPC "${npcId}".`);

  if (existing !== undefined) {
    if (existing.displayName !== null || definition.namePoolId === undefined) return existing;
    const npc = { ...existing, displayName: generateNpcDisplayName(state, definition.namePoolId) };
    state.npcs[npcId] = npc;
    return npc;
  }

  const base = createDefaultNpcState();

  const npc: NpcState = {
    ...base,
    raceId: definition.familyRole !== undefined ? state.player.profile.raceId ?? definition.raceId : definition.raceId,
    displayName: definition.namePoolId === undefined ? null : generateNpcDisplayName(state, definition.namePoolId),
    stats: { ...definition.initialStats },
  };
  state.npcs[npcId] = npc;
  return npc;
}

function generateNpcDisplayName(state: GameState, namePoolId: string): string {
  const pool = NPC_NAME_POOLS[namePoolId];
  if (pool === undefined || pool.length === 0) {
    throw new Error(`Unknown or empty NPC name pool "${namePoolId}".`);
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
  return candidates[Math.floor(random.value * candidates.length)];
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
  return Object.fromEntries(catalog.npcs.flatMap((definition) => {
    const prefix = `npc_${definition.id.replace(/[^A-Za-z0-9_]/g, '_')}`;
    const sex = definition.sex;
    const entries: [string, string][] = [
      [prefix, state?.npcs[definition.id]?.displayName ?? fallbackName(definition.nameKey)],
      [`${prefix}_sex`, sex],
      [`${prefix}_subject`, fallbackName(`grammar.npc.${sex}.subject`)],
      [`${prefix}_subject_cap`, fallbackName(`grammar.npc.${sex}.subjectCap`)],
      [`${prefix}_direct_object`, fallbackName(`grammar.npc.${sex}.directObject`)],
      [`${prefix}_tonic`, fallbackName(`grammar.npc.${sex}.tonic`)],
      [`${prefix}_reflexive`, fallbackName(`grammar.npc.${sex}.reflexive`)],
    ];

    if (definition.familyRole !== undefined) {
      entries.push([
        `${prefix}_role`,
        fallbackName(`grammar.npc.familyRole.${definition.familyRole}`),
      ]);
    }

    return entries;
  }));
}
