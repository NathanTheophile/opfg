import type { ContentCatalog } from '../content/schema';
import type { GameState, HakiType, PowerState } from '../model/schema';

export const HAKI_TYPES = ['observation', 'armament', 'conqueror'] as const satisfies readonly HakiType[];

export function createDefaultPowerState(): PowerState {
  return { devilFruitId: null, devilFruitAwakening: 0, haki: { observation: 0, armament: 0, conqueror: 0 } };
}

export function hakiLevelAllowedByTotal(total: number): number {
  if (total < 75) return 0;
  return Math.min(5, 1 + Math.floor((total - 75) / 5));
}

export function playerHakiSourceTotal(state: GameState, type: Exclude<HakiType, 'conqueror'>): number {
  return type === 'observation'
    ? state.player.stats.observation + state.player.stats.intelligence
    : state.player.stats.strength + state.player.stats.agility;
}

export function synchronizePlayerHaki(state: GameState): void {
  for (const type of ['observation', 'armament'] as const) {
    const current = state.player.powers.haki[type];
    if (current > 0) state.player.powers.haki[type] = Math.max(current, hakiLevelAllowedByTotal(playerHakiSourceTotal(state, type)));
  }
}

export function canConsumeDevilFruit(state: GameState, catalog: ContentCatalog, fruitId: string): boolean {
  const fruit = catalog.devilFruits.find(({ id }) => id === fruitId);
  return fruit !== undefined && fruit.playableV1 && fruit.itemId !== null && state.player.powers.devilFruitId === null
    && state.player.inventory.stacks.some(({ itemId, quantity }) => itemId === fruit.itemId && quantity > 0);
}
