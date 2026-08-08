import type { EventDefinition, Outcome } from '../content/schema';
import type { ChoiceId, EventId, GameState } from '../model/schema';
import { getChoiceState } from './conditions';
import { resolveDiceCheck } from './dice';
import type { DiceRollResult } from './dice';
import { applyEffects } from './effects';
import { selectNextEvent } from './events';

export function resolveChoice(
  state: GameState,
  events: readonly EventDefinition[],
  eventId: EventId,
  choiceId: ChoiceId,
): ChoiceResolutionResult {
  if (state.currentEventId !== eventId) throw new Error(`Event "${eventId}" is not the current event.`);

  const event = events.find(({ id }) => id === eventId);
  if (!event) throw new Error(`Unknown event "${eventId}".`);

  const choice = event.choices.find(({ id }) => id === choiceId);
  if (!choice) throw new Error(`Unknown choice "${choiceId}" in event "${eventId}".`);

  const choiceState = getChoiceState(choice, state);
  if (!choiceState.visible || !choiceState.available) {
    throw new Error(`Choice "${choiceId}" is not available.`);
  }
  const resolution: { state: GameState; outcome: Outcome; dice?: DiceRollResult } =
    choice.resolution.type === 'deterministic'
      ? { outcome: choice.resolution.outcome, state }
      : (() => {
          const diceResult = resolveDiceCheck(choice.resolution, state);
          return {
            outcome: diceResult.outcome,
            dice: diceResult.dice,
            state: { ...state, rngState: diceResult.nextRngState },
          };
        })();

  return finalizeOutcome(resolution.state, events, eventId, choiceId, resolution.outcome, resolution.dice);
}

export interface ChoiceResolutionResult {
  state: GameState;
  outcome: Outcome;
  dice?: DiceRollResult;
}

function finalizeOutcome(
  state: GameState,
  events: readonly EventDefinition[],
  eventId: EventId,
  choiceId: ChoiceId,
  outcome: Outcome,
  dice?: DiceRollResult,
): ChoiceResolutionResult {
  const afterEffects = applyEffects(state, outcome.effects, {
    sourceEventId: eventId,
    sourceChoiceId: choiceId,
  });
  const resolvedMonth = afterEffects.month + (afterEffects.careerPhase === 'active' ? outcome.advanceMonths : 0);
  const resolvedState: GameState = {
    ...afterEffects,
    ageMonths: afterEffects.ageMonths + outcome.advanceMonths,
    month: resolvedMonth,
    history: [
      ...afterEffects.history,
      { eventId, choiceId, outcomeId: outcome.id, month: resolvedMonth },
    ],
    scheduledEvents: consumeScheduledEntry(afterEffects, events, eventId, state.ageMonths),
  };

  return {
    state: selectNextEvent(resolvedState, events),
    outcome,
    dice,
  };
}

function consumeScheduledEntry(
  state: GameState,
  events: readonly EventDefinition[],
  eventId: EventId,
  selectionAgeMonths: number,
): GameState['scheduledEvents'] {
  if (events.find(({ id }) => id === eventId)?.scheduledOnly !== true) return state.scheduledEvents;

  const entryIndex = state.scheduledEvents.findIndex(
    (entry) => entry.eventId === eventId && entry.dueAgeMonths <= selectionAgeMonths,
  );
  return entryIndex < 0
    ? state.scheduledEvents
    : state.scheduledEvents.filter((_, index) => index !== entryIndex);
}
