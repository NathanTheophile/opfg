import type { ContentCatalog, EventDefinition, Outcome } from '../content/schema';
import type { ChoiceId, EventId, GameState } from '../model/schema';
import { evaluateCondition, getChoiceState } from './conditions';
import { resolveDiceCheck } from './dice';
import type { DiceRollResult } from './dice';
import { applyEffects } from './effects';
import { nextRandom } from './rng';
import { findCriticalEvent, selectNextEvent } from './events';
import { consumePhaseSlot, finalizePendingSlot } from './time';

const MAX_IMMEDIATE_EVENTS_PER_CHAIN = 1000;

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

  const choiceState = getChoiceState(choice, state, catalog);
  if (!choiceState.visible || !choiceState.available) {
    throw new Error(`Choice "${choiceId}" is not available.`);
  }
  const stateWithInput = choice.input === undefined ? state : applyChoiceInput(state, choice.input, input);
  const resolution: { state: GameState; outcome: Outcome; dice?: DiceRollResult } =
    choice.resolution.type === 'deterministic'
      ? { outcome: choice.resolution.outcome, state: stateWithInput }
      : (() => {
          const diceResult = resolveDiceCheck(choice.resolution, stateWithInput, catalog);
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
  const afterSystemResolution =
    event.id === 'origin_sea'
      ? assignRandomBirthLocation(afterEffects, catalog)
      : afterEffects;
  let resolvedState: GameState = {
    ...afterSystemResolution,
    history: [
      ...afterSystemResolution.history,
      { eventId: event.id, choiceId, outcomeId: outcome.id, ageMonths: afterSystemResolution.ageMonths },
    ],
    scheduledEvents: consumeScheduledEntry(afterSystemResolution, catalog, event, state.ageMonths),
  };

  if (event.kind === 'immediate') {
    if (resolvedState.immediateEventQueue[0] !== event.id) throw new Error(`Immediate Event "${event.id}" is not at the head of the pending queue.`);
    const immediateEventsResolvedInChain = resolvedState.immediateEventsResolvedInChain + 1;
    if (immediateEventsResolvedInChain > MAX_IMMEDIATE_EVENTS_PER_CHAIN) throw new Error(`Immediate Event chain exceeded runtime guard (${MAX_IMMEDIATE_EVENTS_PER_CHAIN}).`);
    resolvedState = { ...resolvedState, immediateEventQueue: resolvedState.immediateEventQueue.slice(1), immediateEventsResolvedInChain };
  } else if (event.kind === 'normal' || event.kind === 'scheduled') {
    resolvedState = resolvedState.immediateEventQueue.length > 0
      ? { ...resolvedState, pendingSlotPhase: state.careerPhase, immediateEventsResolvedInChain: 0 }
      : consumePhaseSlot(resolvedState, state.careerPhase);
  }

  if (resolvedState.pendingSlotPhase !== null && resolvedState.immediateEventQueue.length === 0 && findCriticalEvent(resolvedState, catalog.events) === undefined) {
    resolvedState = finalizePendingSlot(resolvedState);
  }

  return {
    state: selectNextEvent(resolvedState, catalog),
    outcome,
    dice,
  };
}

function assignRandomBirthLocation(state: GameState, catalog: ContentCatalog): GameState {
  const seaId = state.player.profile.originSeaId;
  if (seaId === null) {
    throw new Error('Cannot assign a Birth Location before originSeaId is set.');
  }

  const candidates = catalog.locations
    .filter((location) => location.canBeBirthLocation && location.seaId === seaId)
    .map((location) => location.id)
    .sort();

  if (candidates.length !== 8) {
    throw new Error(`Expected exactly 8 Birth Locations for "${seaId}", found ${candidates.length}.`);
  }

  const random = nextRandom(state.rngState);
  const locationId = candidates[Math.floor(random.value * candidates.length)];

  return {
    ...state,
    rngState: random.nextState,
    locationId,
    travelState: 'on_land',
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
      return entry.eventId === event.id || (original?.cancelIf !== undefined && evaluateCondition(original.cancelIf, state, catalog) && original.fallbackEventId === event.id);
    },
  );
  return entryIndex < 0
    ? state.scheduledEvents
    : state.scheduledEvents.filter((_, index) => index !== entryIndex);
}
