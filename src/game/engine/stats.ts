import type { ContentCatalog, StatId } from '../content/schema';
import type { GameState, NpcId, NpcStatId, PlayerStats } from '../model/schema';

const clampD20Stat = (value: number) => Math.max(0, Math.min(50, value));

export function activeCompanionStatModifier(state: GameState, catalog: ContentCatalog, statId: keyof PlayerStats): number {
  const companionDefinition = state.player.companion
    ? catalog.items.find(({ id }) => id === state.player.companion?.itemId)
    : undefined;
  return companionDefinition?.companion === true
    ? companionDefinition.modifiers?.[statId] ?? 0
    : 0;
}

export function activeCrewGlobalStatModifier(state: GameState, catalog: ContentCatalog, statId: keyof PlayerStats): number {
  if (statId === 'health') return 0;
  const activeRoleIds = new Set(
    Object.values(state.npcs)
      .filter(({ status, stats }) => status === 'crew' && stats.health > 0)
      .flatMap(({ crewRoleId }) => crewRoleId === null ? [] : [crewRoleId]),
  );

  return catalog.crewRoles.reduce((sum, role) => {
    if (!activeRoleIds.has(role.id) || role.passive?.type !== 'globalStats') return sum;
    if (!role.passive.statIds.includes(statId as StatId)) return sum;
    return sum + (role.passive.amount ?? 0);
  }, 0);
}

export function activePlayerStatModifier(state: GameState, catalog: ContentCatalog, statId: keyof PlayerStats): number {
  const equipmentModifier = state.player.equipment.reduce((sum, stack, index) => {
    const definition = catalog.items.find(({ id }) => id === stack?.itemId);
    return sum + (index === 1 && definition?.twoHanded ? 0 : definition?.modifiers?.[statId] ?? 0);
  }, 0);
  return equipmentModifier
    + activeCompanionStatModifier(state, catalog, statId)
    + activeCrewGlobalStatModifier(state, catalog, statId);
}

export function effectivePlayerStat(state: GameState, catalog: ContentCatalog, statId: keyof PlayerStats): number {
  const value = state.player.stats[statId] + activePlayerStatModifier(state, catalog, statId);
  return statId === 'health' ? Math.max(1, value) : clampD20Stat(value);
}

export function effectiveNpcStat(state: GameState, catalog: ContentCatalog, npcId: NpcId, statId: NpcStatId): number {
  const npc = state.npcs[npcId];
  if (!npc) throw new Error(`Unknown NPC "${npcId}".`);
  const globalModifier = npc.status === 'crew'
    ? activeCompanionStatModifier(state, catalog, statId) + activeCrewGlobalStatModifier(state, catalog, statId)
    : 0;
  const value = npc.stats[statId] + globalModifier;
  return statId === 'health' ? Math.max(0, value) : clampD20Stat(value);
}
