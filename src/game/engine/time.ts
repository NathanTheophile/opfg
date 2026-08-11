import type { GameState } from '../model/schema';

const BERRIES_PER_BIRTHDAY = 50;

export function consumePhaseSlot(state: GameState, phaseBeforeResolution: GameState['careerPhase']): GameState {
  if (phaseBeforeResolution === 'origins') {
    return state.careerPhase === 'childhood' ? { ...advanceAge(state, 12), slotInMonth: 0 } : state;
  }
  if (phaseBeforeResolution === 'childhood') {
    const ageMonths = Math.min(180, state.ageMonths + (state.ageMonths < 108 ? 12 : 6));
    const careerPhase = ageMonths >= 180 ? 'active' : 'childhood';
    return {
      ...advanceAge(state, ageMonths),
      careerPhase,
      slotInMonth: 0,
      shipMarketArrivalPending: careerPhase === 'active' ? true : state.shipMarketArrivalPending,
    };
  }
  return state.slotInMonth === 0
    ? { ...state, slotInMonth: 1 }
    : { ...advanceAge(state, state.ageMonths + 1), slotInMonth: 0 };
}

export function finalizePendingSlot(state: GameState): GameState {
  if (state.pendingSlotPhase === null) return state;
  return {
    ...consumePhaseSlot(state, state.pendingSlotPhase),
    pendingSlotPhase: null,
    immediateEventsResolvedInChain: 0,
  };
}
function advanceAge(state: GameState, ageMonths: number): GameState {
  const birthdays = Math.floor(ageMonths / 12) - Math.floor(state.ageMonths / 12);
  return {
    ...state,
    ageMonths,
    berries: state.berries + birthdays * BERRIES_PER_BIRTHDAY,
  };
}
