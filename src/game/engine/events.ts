import type { EventDefinition } from '../content/schema';
import type { GameState } from '../model/schema';
import { evaluateCondition } from './conditions';
import { nextRandom } from './rng';

export function selectNextEvent(state: GameState, events: readonly EventDefinition[]): GameState {
  if (state.careerStatus !== 'active') return { ...state, currentEventId: null };

  const playedEventIds = new Set(state.history.map(({ eventId }) => eventId));
  const scheduledCandidates = state.scheduledEvents.flatMap((scheduledEvent) => {
    if (scheduledEvent.dueAgeMonths > state.ageMonths || playedEventIds.has(scheduledEvent.eventId)) return [];
    const event = events.find(({ id }) => id === scheduledEvent.eventId);
    if (!event || (event.eligibility !== undefined && !evaluateCondition(event.eligibility, state))) return [];
    return [event];
  });

  if (scheduledCandidates.length > 0) return selectByPriority(state, scheduledCandidates);

  const candidates = events.filter(
    (event) =>
      event.scheduledOnly !== true &&
      !playedEventIds.has(event.id) &&
      (event.eligibility === undefined || evaluateCondition(event.eligibility, state)),
  );

  if (candidates.length === 0) return { ...state, currentEventId: null };

  return selectByPriority(state, candidates);
}

function selectByPriority(state: GameState, candidates: readonly EventDefinition[]): GameState {
  const maximumPriority = Math.max(...candidates.map(({ priority }) => priority));
  const prioritized = candidates.filter(({ priority }) => priority === maximumPriority);
  if (prioritized.length === 1) return { ...state, currentEventId: prioritized[0].id };

  const random = nextRandom(state.rngState);
  const selected = prioritized[Math.floor(random.value * prioritized.length)];
  return { ...state, rngState: random.nextState, currentEventId: selected.id };
}

export function findCurrentEvent(
  state: GameState,
  events: readonly EventDefinition[],
): EventDefinition | undefined {
  return events.find(({ id }) => id === state.currentEventId);
}
