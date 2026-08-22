import type { ContentCatalog } from '../content/schema';
import type { GameState } from '../model/schema';
import { modifyPlayerHealth } from './health';
import { deriveFamilyActiveCareerHandoff } from '../content/familySagaConfig';
import { annualCrewIncome, currentCrewIds } from './crew';

const CHILDHOOD_INCOME: Record<string, number> = { poor: 500, modest: 750, wealthy: 1500 };
export const ANNUAL_PLAYER_HEALTH_REGEN = 0;

export function consumePhaseSlot(state: GameState, phaseBeforeResolution: GameState['careerPhase'], catalog: ContentCatalog): GameState {
  if (phaseBeforeResolution === 'origins') {
    return state.careerPhase === 'childhood' ? { ...advanceAge(state, 12, catalog), slotInMonth: 0 } : state;
  }
  if (phaseBeforeResolution === 'childhood') {
    const ageMonths = Math.min(180, state.ageMonths + (state.ageMonths < 108 ? 12 : 6));
    const careerPhase = ageMonths >= 180 ? 'active' : 'childhood';
    const advanced = advanceAge(state, ageMonths, catalog);
    const careerHandoff = careerPhase === 'active' ? deriveFamilyActiveCareerHandoff(advanced.history) : null;
    const withCareerHandoff = careerHandoff === null ? advanced : {
      ...advanced,
      player: {
        ...advanced.player,
        career: {
          ...advanced.player.career,
          affiliationId: careerHandoff.affiliationId,
          rankId: careerHandoff.rankId,
        },
      },
    };
    return {
      ...withCareerHandoff,
      careerPhase,
      slotInMonth: 0,
    };
  }
  return { ...advanceAge(state, state.ageMonths + 1, catalog), slotInMonth: 0 };
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
  const startYear = Math.floor(state.ageMonths / 12);
  const income = Array.from({ length: birthdays }, (_, index) => startYear + index + 1)
    .filter((age) => age >= 5 && age <= 14)
    .reduce((sum) => sum + (CHILDHOOD_INCOME[state.player.profile.socialClassId ?? ''] ?? 0), 0);
  const crewIncome = birthdays * annualCrewIncome(state, catalog);
  const activeBirthday = birthdays > 0 && state.careerPhase === 'active';
  const annualCrewPanel = activeBirthday && currentCrewIds(state).length > 0;

  const advanced = {
    ...state,
    player: { ...state.player, stats: { ...state.player.stats } },
    ageMonths,
    crewReassignmentPending:
      state.careerPhase === 'active'
        ? state.crewReassignmentPending || annualCrewPanel
        : false,
    crewRoleLastUsedYear: activeBirthday ? {} : state.crewRoleLastUsedYear,
    npcs: Object.fromEntries(Object.entries(state.npcs).map(([id, npc]) => [id, npc.status !== 'crew' || birthdays === 0 ? npc : {
      ...npc,
      stats: Object.fromEntries(Object.entries(npc.stats).map(([statId, value]) => [statId, Math.min(50, value + birthdays)])) as unknown as typeof npc.stats,
    }])),
    berries: state.berries + income + crewIncome,
  };
  if (birthdays > 0 && advanced.player.profile.raceId !== null && advanced.player.stats.health > 0) {
    modifyPlayerHealth(advanced, catalog, birthdays * ANNUAL_PLAYER_HEALTH_REGEN);
  }
  return advanced;
}
