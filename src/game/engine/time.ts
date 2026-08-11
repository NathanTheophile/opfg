import type { ContentCatalog } from '../content/schema';
import type { GameState } from '../model/schema';
import { modifyPlayerHealth } from './health';

const BERRIES_PER_BIRTHDAY = 50;

export function consumePhaseSlot(state: GameState, phaseBeforeResolution: GameState['careerPhase'], catalog: ContentCatalog): GameState {
  if (phaseBeforeResolution === 'origins') {
    return state.careerPhase === 'childhood' ? { ...advanceAge(state, 12, catalog), slotInMonth: 0 } : state;
  }
  if (phaseBeforeResolution === 'childhood') {
    const ageMonths = Math.min(180, state.ageMonths + (state.ageMonths < 108 ? 12 : 6));
    const careerPhase = ageMonths >= 180 ? 'active' : 'childhood';
    return {
      ...advanceAge(state, ageMonths, catalog),
      careerPhase,
      slotInMonth: 0,
      shipMarketArrivalPending: careerPhase === 'active' ? true : state.shipMarketArrivalPending,
    };
  }
  return state.slotInMonth === 0
    ? { ...state, slotInMonth: 1 }
    : { ...advanceAge(state, state.ageMonths + 1, catalog), slotInMonth: 0 };
}

export function finalizePendingSlot(state: GameState, catalog: ContentCatalog): GameState {
  if (state.pendingSlotPhase === null) return state;
  return {
    ...consumePhaseSlot(state, state.pendingSlotPhase, catalog),
    pendingSlotPhase: null,
    immediateEventsResolvedInChain: 0,
  };
}
function advanceAge(state: GameState, ageMonths: number, catalog: ContentCatalog): GameState {
  const birthdays = Math.floor(ageMonths / 12) - Math.floor(state.ageMonths / 12);
  const advanced = {
    ...state,
    player: { ...state.player, stats: { ...state.player.stats } },
    ageMonths,
    berries: state.berries + birthdays * BERRIES_PER_BIRTHDAY,
  };
  if (birthdays > 0 && advanced.player.profile.raceId !== null && advanced.player.stats.health > 0) {
    modifyPlayerHealth(advanced, catalog, birthdays);
  }
  return advanced;
}
