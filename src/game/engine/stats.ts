import type { ContentCatalog } from '../content/schema';
import type { GameState, NpcId, NpcStatId, PlayerStats } from '../model/schema';

const clamp = (value: number) => Math.max(0, Math.min(50, value));

export function effectivePlayerStat(state: GameState, catalog: ContentCatalog, statId: keyof PlayerStats): number {
  const modifier = state.player.equipment.reduce((sum, stack, index) => {
    const definition = catalog.items.find(({ id }) => id === stack?.itemId);
    return sum + (index === 1 && definition?.twoHanded ? 0 : definition?.modifiers?.[statId] ?? 0);
  }, 0);
  return clamp(state.player.stats[statId] + modifier);
}

export function effectiveNpcStat(state: GameState, catalog: ContentCatalog, npcId: NpcId, statId: NpcStatId): number {
  const npc = state.npcs[npcId];
  if (!npc) throw new Error(`Unknown NPC "${npcId}".`);
  const companion = state.companionNpcId ? catalog.npcs.find(({ id }) => id === state.companionNpcId) : undefined;
  const modifier = npc.status === 'crew' ? (companion?.companionModifiers?.[statId] ?? 0) : 0;
  return clamp(npc.stats[statId] + modifier);
}
