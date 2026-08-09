import type { GameState } from '../model/schema';

export function consumePhaseSlot(state: GameState, phaseBeforeResolution: GameState['careerPhase']): GameState {
  if (phaseBeforeResolution === 'origins') {
    return state.careerPhase === 'childhood' ? { ...state, ageMonths: 12, slotInMonth: 0 } : state;
  }
  if (phaseBeforeResolution === 'childhood') {
    const ageMonths = Math.min(180, state.ageMonths + (state.ageMonths < 108 ? 12 : 6));
    return { ...state, ageMonths, careerPhase: ageMonths >= 180 ? 'active' : 'childhood', slotInMonth: 0 };
  }
  return state.slotInMonth === 0
    ? { ...state, slotInMonth: 1 }
    : { ...state, slotInMonth: 0, ageMonths: state.ageMonths + 1 };
}

export function finalizePendingSlot(state: GameState): GameState {
  if (state.pendingSlotPhase === null) return state;
  return {
    ...consumePhaseSlot(state, state.pendingSlotPhase),
    pendingSlotPhase: null,
    immediateEventsResolvedInChain: 0,
  };
}
