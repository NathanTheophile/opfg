import type { ContentCatalog } from '../content/schema';
import type { GameState } from '../model/schema';

export function getPlayerMaxHealth(state: GameState, catalog: ContentCatalog): number {
  const raceId = state.player.profile.raceId;
  if (raceId === null) throw new Error('Cannot determine Player maximum Health before Race is set.');

  const race = catalog.races.find(({ id }) => id === raceId);
  if (!race) throw new Error(`Unknown Player Race "${raceId}".`);
  const equipmentModifier = state.player.equipment.reduce((total, stack, index) => {
    const definition = catalog.items.find(({ id }) => id === stack?.itemId);
    return total + (index === 1 && definition?.twoHanded ? 0 : definition?.modifiers?.health ?? 0);
  }, 0);
  return Math.max(1, race.initialHealth + equipmentModifier);
}

export function modifyPlayerHealth(state: GameState, catalog: ContentCatalog, amount: number): void {
  const maximum = getPlayerMaxHealth(state, catalog);
  state.player.stats.health = Math.min(maximum, Math.max(0, state.player.stats.health + amount));
}
