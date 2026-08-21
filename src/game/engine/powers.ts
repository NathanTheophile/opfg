import type { ContentCatalog } from '../content/schema';
import type { GameState, HakiType, PowerState } from '../model/schema';
import { effectivePlayerStat } from './stats';

export const HAKI_TYPES = ['observation', 'armament', 'conqueror'] as const satisfies readonly HakiType[];

export function createDefaultPowerState(): PowerState {
  return { devilFruitId: null, devilFruitAwakening: 0, haki: { observation: 0, armament: 0, conqueror: 0 } };
}

export function hakiLevelAllowedByTotal(total: number): number {
  if (total < 75) return 0;
  return Math.min(5, 1 + Math.floor((total - 75) / 5));
}

export function playerHakiSourceTotal(
  state: GameState,
  type: Exclude<HakiType, 'conqueror'>,
  catalog?: ContentCatalog,
): number {
  const value = (statId: 'observation' | 'intelligence' | 'strength' | 'agility'): number =>
    catalog === undefined ? state.player.stats[statId] : effectivePlayerStat(state, catalog, statId);

  return type === 'observation'
    ? value('observation') + value('intelligence')
    : value('strength') + value('agility');
}

/**
 * @deprecated Observation/Armament levels are authored mastery progression.
 * Source totals gate due roots but never auto-promote an earned Haki level.
 */
export function synchronizePlayerHaki(_state: GameState): void {
  // Kept as a compatibility no-op for existing call sites.
}

export function canConsumeDevilFruit(state: GameState, catalog: ContentCatalog, fruitId: string): boolean {
  const fruit = catalog.devilFruits.find(({ id }) => id === fruitId);
  return fruit !== undefined && fruit.playableV1 && fruit.itemId !== null && state.player.powers.devilFruitId === null
    && state.player.inventory.stacks.some(({ itemId, quantity }) => itemId === fruit.itemId && quantity > 0);
}
