import type { ContentCatalog } from '../content/schema';
import type { GameState, NpcId, NpcStatId, PlayerStats } from '../model/schema';

const clampD20Stat = (value: number) => Math.max(0, Math.min(50, value));

export function activePlayerStatModifier(state: GameState, catalog: ContentCatalog, statId: keyof PlayerStats): number {
  const equipmentModifier = state.player.equipment.reduce((sum, stack, index) => {
    const definition = catalog.items.find(({ id }) => id === stack?.itemId);
    return sum + (index === 1 && definition?.twoHanded ? 0 : definition?.modifiers?.[statId] ?? 0);
  }, 0);
  const companionDefinition = state.player.companion
    ? catalog.items.find(({ id }) => id === state.player.companion?.itemId)
    : undefined;
  const companionModifier = companionDefinition?.companion === true
    ? companionDefinition.modifiers?.[statId] ?? 0
    : 0;
  return equipmentModifier + companionModifier;
}

export function effectivePlayerStat(state: GameState, catalog: ContentCatalog, statId: keyof PlayerStats): number {
  const value = state.player.stats[statId] + activePlayerStatModifier(state, catalog, statId);
  return statId === 'health' ? Math.max(1, value) : clampD20Stat(value);
}

export function effectiveNpcStat(state: GameState, _catalog: ContentCatalog, npcId: NpcId, statId: NpcStatId): number {
  const npc = state.npcs[npcId];
  if (!npc) throw new Error(`Unknown NPC "${npcId}".`);
  return statId === 'health' ? Math.max(0, npc.stats[statId]) : clampD20Stat(npc.stats[statId]);
}
