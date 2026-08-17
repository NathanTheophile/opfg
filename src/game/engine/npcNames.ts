import { NPC_NAME_POOLS } from '../content/npcNamePools';
import type { ContentCatalog, EventDefinition, NpcDefinition, StatId } from '../content/schema';
import type { GameState, NpcId, NpcState, NpcStatId, NpcStats, RaceId } from '../model/schema';
import { createDefaultNpcState } from '../model/npcState';
import { nextRandom } from './rng';

const NPC_STAT_IDS: NpcStatId[] = ['health', 'morale', 'strength', 'agility', 'observation', 'intelligence', 'navigation', 'charisma', 'luck'];
const NPC_D20_STAT_IDS: StatId[] = ['morale', 'strength', 'agility', 'observation', 'intelligence', 'navigation', 'charisma', 'luck'];
const NPC_RANDOM_MIN = 10;
const NPC_RANDOM_MAX = 40;

export function ensureNpcMaterialized(
  state: GameState,
  catalog: ContentCatalog,
  npcId: NpcId,
): NpcState {
  const existing = state.npcs[npcId];
  const definition = catalog.npcs.find(({ id }) => id === npcId);
  if (definition === undefined) throw new Error(`Unknown NPC "${npcId}".`);

  const resolvedRaceId = existing?.raceId ?? resolveNpcRaceId(state, definition);
  let npc: NpcState = existing ?? {
    ...createDefaultNpcState(),
    raceId: resolvedRaceId,
  };

  if (!npc.statsGenerated) {
    npc = {
      ...npc,
      raceId: resolvedRaceId,
      stats: definition.initialStats === undefined
        ? generateNpcStats(state, catalog, resolvedRaceId)
        : { ...definition.initialStats },
      statsGenerated: true,
    };
  }

  if (npc.displayName === null && definition.namePoolId !== undefined) {
    npc = { ...npc, displayName: generateNpcDisplayName(state, definition.namePoolId) };
  }

  state.npcs[npcId] = npc;
  return npc;
}

function resolveNpcRaceId(state: GameState, definition: NpcDefinition): RaceId | null {
  return definition.familyRole !== undefined
    ? state.player.profile.raceId ?? definition.raceId
    : definition.raceId;
}

function generateNpcStats(state: GameState, catalog: ContentCatalog, raceId: RaceId | null): NpcStats {
  const stats = {} as NpcStats;
  for (const statId of NPC_STAT_IDS) stats[statId] = nextNpcStat(state);

  const race = raceId === null ? undefined : catalog.races.find(({ id }) => id === raceId);
  if (race) {
    for (const [statId, amount] of Object.entries(race.attributeModifiers) as [StatId, number][]) {
      stats[statId] = clamp(stats[statId] + amount, NPC_RANDOM_MIN, NPC_RANDOM_MAX);
    }
  }

  const ordered = [...NPC_D20_STAT_IDS].sort((left, right) => stats[left] - stats[right] || left.localeCompare(right));
  stats[ordered[0]] = NPC_RANDOM_MIN;
  stats[ordered[ordered.length - 1]] = NPC_RANDOM_MAX;
  return stats;
}

function nextNpcStat(state: GameState): number {
  const random = nextRandom(state.rngState);
  state.rngState = random.nextState;
  return NPC_RANDOM_MIN + Math.floor(random.value * (NPC_RANDOM_MAX - NPC_RANDOM_MIN + 1));
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
  const cast = event.cast ?? [];
  if (cast.length === 0) return state;

  const next: GameState = {
    ...state,
    npcs: { ...state.npcs },
  };
  for (const npcId of cast) ensureNpcMaterialized(next, catalog, npcId);
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

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
