import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../content/definitions';
import { createInitialGameState } from '../model/initialState';
import { createDefaultNpcState } from '../model/npcState';
import type { CrewRoleId, GameState } from '../model/schema';
import { findCurrentEvent, isCrewRecruitmentEvent, selectNextEvent } from './events';
import { getChoiceState } from './conditions';
import { resolveChoice } from './resolution';
import { countCurrentCrew } from './ship';

const crewNpc = (crewRoleId: CrewRoleId) => ({ ...createDefaultNpcState(), status: 'crew' as const, crewRoleId });

function activeState(ageMonths: number): GameState {
  const state = createInitialGameState(424242);
  state.careerPhase = 'active';
  state.careerStatus = 'active';
  state.ageMonths = ageMonths;
  state.currentEventId = null;
  state.isLeader = false;
  state.player.career.affiliationId = 'bounty_hunter';
  return state;
}

function expectGuarantee(state: GameState) {
  const selected = selectNextEvent(state, contentCatalog);
  const event = findCurrentEvent(selected, contentCatalog);
  expect(event).toBeDefined();
  expect(isCrewRecruitmentEvent(event!)).toBe(true);
  return selected;
}

describe('early crew guarantee', () => {
  it('offers and resolves the first recruit during age 15', () => {
    const selected = expectGuarantee(activeState(180));
    const event = findCurrentEvent(selected, contentCatalog)!;
    const choice = event.choices.find((candidate) => {
      const outcomes = candidate.resolution.type === 'deterministic'
        ? [candidate.resolution.outcome]
        : Object.values(candidate.resolution.outcomes);

      const recruits = outcomes.some((outcome) =>
        outcome.effects.some((effect) => effect.type === 'setNpcStatus' && effect.status === 'crew')
      );
      if (!recruits) return false;

      const choiceState = getChoiceState(candidate, selected, contentCatalog);
      return choiceState.visible && choiceState.available;
    })
    expect(choice).toBeDefined();
    const result = resolveChoice(selected, contentCatalog, event.id, choice!.id);
    expect(countCurrentCrew(result.state)).toBe(1);
  });

  it('forces the second opportunity during age 16 while crew < 2', () => {
    const state = activeState(192);
    state.npcs.fixture_a = crewNpc('medic');
    expectGuarantee(state);
  });

  it('forces the third opportunity during age 17 while crew < 3', () => {
    const state = activeState(204);
    state.npcs.fixture_a = crewNpc('medic');
    state.npcs.fixture_b = crewNpc('navigator');
    expectGuarantee(state);
  });

  it('does not force the fallback once the age-17 target is met', () => {
    const state = activeState(204);
    state.npcs.fixture_a = crewNpc('medic');
    state.npcs.fixture_b = crewNpc('navigator');
    state.npcs.fixture_c = crewNpc('shipwright');
    const selected = selectNextEvent(state, contentCatalog);
    expect(selected.currentEventId?.startsWith('active_early_crew_guarantee_') ?? false).toBe(false);
  });
});
