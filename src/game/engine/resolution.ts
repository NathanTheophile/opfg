import type { ContentCatalog, EventDefinition, Outcome } from '../content/schema';
import type { ChoiceId, EventId, GameState } from '../model/schema';
import { evaluateCondition, getChoiceState } from './conditions';
import { resolveDiceCheck } from './dice';
import type { DiceRollResult } from './dice';
import { applyEffects } from './effects';
import { selectNextEvent } from './events';

export function resolveChoice(
  state: GameState,
  catalog: ContentCatalog,
  eventId: EventId,
  choiceId: ChoiceId,
  input?: string,
): ChoiceResolutionResult {
  if (state.currentEventId !== eventId) throw new Error(`Event "${eventId}" is not the current event.`);

  const event = catalog.events.find(({ id }) => id === eventId);
  if (!event) throw new Error(`Unknown event "${eventId}".`);

  const choice = event.choices.find(({ id }) => id === choiceId);
  if (!choice) throw new Error(`Unknown choice "${choiceId}" in event "${eventId}".`);

  const choiceState = getChoiceState(choice, state);
  if (!choiceState.visible || !choiceState.available) {
    throw new Error(`Choice "${choiceId}" is not available.`);
  }
  const stateWithInput = choice.input === undefined ? state : applyChoiceInput(state, choice.input, input);
  const resolution: { state: GameState; outcome: Outcome; dice?: DiceRollResult } =
    choice.resolution.type === 'deterministic'
      ? { outcome: choice.resolution.outcome, state: stateWithInput }
      : (() => {
          const diceResult = resolveDiceCheck(choice.resolution, stateWithInput);
          return {
            outcome: diceResult.outcome,
            dice: diceResult.dice,
            state: { ...stateWithInput, rngState: diceResult.nextRngState },
          };
        })();

  return finalizeOutcome(resolution.state, catalog, event, choiceId, resolution.outcome, resolution.dice);
}

export interface ChoiceResolutionResult {
  state: GameState;
  outcome: Outcome;
  dice?: DiceRollResult;
}

function finalizeOutcome(
  state: GameState,
  catalog: ContentCatalog,
  event: EventDefinition,
  choiceId: ChoiceId,
  outcome: Outcome,
  dice?: DiceRollResult,
): ChoiceResolutionResult {
  const afterEffects = applyEffects(state, catalog, outcome.effects, {
    sourceEventId: event.id,
    sourceChoiceId: choiceId,
  });
  const afterSlot = consumePhaseSlot(afterEffects, state.careerPhase, event.kind !== 'critical');
  const resolvedState: GameState = {
    ...afterSlot,
    history: [
      ...afterSlot.history,
      { eventId: event.id, choiceId, outcomeId: outcome.id, ageMonths: afterSlot.ageMonths },
    ],
    scheduledEvents: consumeScheduledEntry(afterSlot, catalog, event, state.ageMonths),
  };

  return {
    state: selectNextEvent(resolvedState, catalog),
    outcome,
    dice,
  };
}

function applyChoiceInput(state: GameState, inputDefinition: { target: 'playerName'; minLength: number; maxLength: number }, input: string | undefined): GameState {
  const normalized = input?.trim() ?? '';
  if (normalized.length < inputDefinition.minLength || normalized.length > inputDefinition.maxLength) {
    throw new Error(`Input for "${inputDefinition.target}" must contain ${inputDefinition.minLength} to ${inputDefinition.maxLength} characters.`);
  }
  return {
    ...state,
    player: { ...state.player, profile: { ...state.player.profile, name: normalized } },
  };
}

function consumeScheduledEntry(
  state: GameState,
  catalog: ContentCatalog,
  event: EventDefinition,
  selectionAgeMonths: number,
): GameState['scheduledEvents'] {
  if (event.kind !== 'scheduled') return state.scheduledEvents;

  const entryIndex = state.scheduledEvents.findIndex(
    (entry) => {
      if (entry.dueAgeMonths > selectionAgeMonths) return false;
      const original = catalog.events.find((candidate): candidate is Extract<EventDefinition, { kind: 'scheduled' }> => candidate.id === entry.eventId && candidate.kind === 'scheduled');
      return entry.eventId === event.id || (original?.cancelIf !== undefined && evaluateCondition(original.cancelIf, state) && original.fallbackEventId === event.id);
    },
  );
  return entryIndex < 0
    ? state.scheduledEvents
    : state.scheduledEvents.filter((_, index) => index !== entryIndex);
}

function consumePhaseSlot(state: GameState, phaseBeforeResolution: GameState['careerPhase'], consumesSlot: boolean): GameState {
  if (!consumesSlot) return state;
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
