import type { EventDefinition } from '../content/schema';
import type { ChoiceId, EventId, GameState } from '../model/schema';
import { getChoiceState } from './conditions';
import { applyEffects } from './effects';
import { selectNextEvent } from './events';

export function resolveChoice(
  state: GameState,
  events: readonly EventDefinition[],
  eventId: EventId,
  choiceId: ChoiceId,
): GameState {
  if (state.currentEventId !== eventId) throw new Error(`Event "${eventId}" is not the current event.`);

  const event = events.find(({ id }) => id === eventId);
  if (!event) throw new Error(`Unknown event "${eventId}".`);

  const choice = event.choices.find(({ id }) => id === choiceId);
  if (!choice) throw new Error(`Unknown choice "${choiceId}" in event "${eventId}".`);

  const choiceState = getChoiceState(choice, state);
  if (!choiceState.visible || !choiceState.available) {
    throw new Error(`Choice "${choiceId}" is not available.`);
  }
  if (choice.resolution.type === 'dice') {
    throw new Error('DiceResolution is not implemented yet.');
  }

  const { outcome } = choice.resolution;
  const afterEffects = applyEffects(state, outcome.effects, {
    sourceEventId: eventId,
    sourceChoiceId: choiceId,
  });
  const resolvedMonth = afterEffects.month + outcome.advanceMonths;
  const resolvedState: GameState = {
    ...afterEffects,
    month: resolvedMonth,
    history: [
      ...afterEffects.history,
      { eventId, choiceId, outcomeId: outcome.id, month: resolvedMonth },
    ],
  };

  return selectNextEvent(resolvedState, events);
}
