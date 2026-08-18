import type { ContentCatalog } from '../content/schema';
import { getChoiceState } from '../engine/conditions';
import { requiresCrewManagement } from '../engine/crew';
import { findCurrentEvent, hasStartedLifetimeThread, selectNextEvent } from '../engine/events';
import { resolveChoice } from '../engine/resolution';
import { createInitialGameState } from '../model/initialState';
import type { GameState } from '../model/schema';
import { derivePolicySeed, randomSimulationPolicy, type SimulationPolicy } from './simulationPolicy';
import { resolveRequiredSimulationCrewManagement } from './simulationCrewManagement';
import { applyMonthlyNavigationChoice, getMonthlyNavigationOptions, needsMonthlyNavigationDecision } from '../engine/navigation';
import type { DeadEndSnapshot, ResolvedSimulationEvent, SimulationRunResult, SimulationTerminationReason } from './types';
import { assertValidSimulationState } from './stateDiagnostics';
import type { SimulationObserver } from './observation';

export interface SimulateObservedRunOptions {
  seed: number;
  catalog: ContentCatalog;
  maxResolvedEvents?: number;
  policy?: SimulationPolicy;
  initialState?: GameState;
  observer?: SimulationObserver;
}

/**
 * Diagnostic-only twin of simulateRun with lightweight observer hooks.
 * It intentionally does not change the production simulator or gameplay engine.
 * Specialized simulations aggregate telemetry on the fly instead of serializing
 * every intermediate GameState.
 */
export function simulateObservedRun(options: SimulateObservedRunOptions): SimulationRunResult {
  const seed = options.seed >>> 0;
  const maximum = options.maxResolvedEvents ?? 1000;
  const policy = options.policy ?? randomSimulationPolicy;
  const observer = options.observer;
  let policyRngState = derivePolicySeed(seed);
  let state = selectNextEvent(options.initialState ?? createInitialGameState(seed), options.catalog);
  observer?.onInitialState?.(state, options.catalog);

  const resolvedEvents: ResolvedSimulationEvent[] = [];
  let childhoodReached = state.careerPhase === 'childhood';
  let activeReached = state.careerPhase === 'active';
  let maxAgeMonths = state.ageMonths;
  let possibleCriticalLoop = false;
  let previousCriticalId: string | null = null;
  let consecutiveSameCritical = 0;
  let terminationReason: SimulationTerminationReason = 'deadEnd';
  let error: string | undefined;
  let shipLosses = 0;
  let currentImmediateChainLength = 0;
  let maximumImmediateChainLength = 0;
  let immediateGuardTriggered = false;

  while (true) {
    if (state.careerStatus === 'ended') {
      terminationReason = 'careerEnded';
      break;
    }

    if (state.currentEventId === null && requiresCrewManagement(state)) {
      try {
        const management = resolveRequiredSimulationCrewManagement(
          state,
          options.catalog,
          policy,
          policyRngState,
        );
        policyRngState = management.nextRngState;
        state = selectNextEvent(management.state, options.catalog);
        continue;
      } catch (caught) {
        terminationReason = 'simulationError';
        error = caught instanceof Error ? caught.message : String(caught);
        break;
      }
    }

    if (state.currentEventId === null && needsMonthlyNavigationDecision(state)) {
      try {
        const beforeState = state;
        const navigationOptions = getMonthlyNavigationOptions(state, options.catalog);
        const selection = (policy.chooseNavigation ?? randomSimulationPolicy.chooseNavigation!)(navigationOptions, policyRngState);
        policyRngState = selection.nextRngState;
        const navigatedState = applyMonthlyNavigationChoice(state, options.catalog, selection.choice);
        observer?.onNavigationResolved?.({
          beforeState,
          afterState: navigatedState,
          choice: selection.choice,
        }, options.catalog);
        state = selectNextEvent(navigatedState, options.catalog);
        continue;
      } catch (caught) {
        terminationReason = 'simulationError';
        error = caught instanceof Error ? caught.message : String(caught);
        break;
      }
    }

    if (state.currentEventId === null) {
      terminationReason = 'deadEnd';
      break;
    }

    if (resolvedEvents.length >= maximum) {
      terminationReason = 'safetyLimit';
      break;
    }

    try {
      assertValidSimulationState(state, options.catalog);
      const event = findCurrentEvent(state, options.catalog);
      if (!event) throw new Error(`Selected Event "${state.currentEventId}" is absent from the ContentCatalog.`);

      const availableChoices = event.choices.filter((choice) => {
        const choiceState = getChoiceState(choice, state, options.catalog);
        return choiceState.visible && choiceState.available;
      });
      if (availableChoices.length === 0) throw new Error(`Event "${event.id}" has no available Choice at Location "${state.locationId}".`);

      const selection = policy.choose(availableChoices, policyRngState, { event, state, catalog: options.catalog });
      policyRngState = selection.nextRngState;
      const beforeState = state;
      const result = resolveChoice(
        state,
        options.catalog,
        event.id,
        selection.choice.id,
        selection.choice.input ? 'SimPlayer' : undefined,
      );

      if (state.ship !== null && result.state.ship === null) shipLosses += 1;

      observer?.onEventResolved?.({
        beforeState,
        afterState: result.state,
        event,
        choice: selection.choice,
        outcome: result.outcome,
        ...(result.dice ? { diceResult: result.dice.result } : {}),
        ...(result.dice ? { dice: result.dice } : {}),
      }, options.catalog);

      resolvedEvents.push({
        eventId: event.id,
        choiceId: selection.choice.id,
        outcomeId: result.outcome.id,
        kind: event.kind,
        ageMonths: result.state.ageMonths,
        travelState: result.state.travelState,
        ...(result.dice ? { diceResult: result.dice.result } : {}),
      });

      if (event.kind === 'critical') {
        consecutiveSameCritical = previousCriticalId === event.id ? consecutiveSameCritical + 1 : 1;
        previousCriticalId = event.id;
        if (consecutiveSameCritical >= 3) possibleCriticalLoop = true;
      } else if (event.kind !== 'immediate') {
        previousCriticalId = null;
        consecutiveSameCritical = 0;
      }

      if (event.kind === 'immediate') {
        currentImmediateChainLength += 1;
        maximumImmediateChainLength = Math.max(maximumImmediateChainLength, currentImmediateChainLength);
      } else if (event.kind !== 'critical') {
        currentImmediateChainLength = 0;
      }

      state = result.state;
      childhoodReached ||= state.careerPhase === 'childhood';
      activeReached ||= state.careerPhase === 'active';
      maxAgeMonths = Math.max(maxAgeMonths, state.ageMonths);
    } catch (caught) {
      terminationReason = 'simulationError';
      error = caught instanceof Error ? caught.message : String(caught);
      immediateGuardTriggered = error.includes('Immediate Event chain exceeded runtime guard');
      break;
    }
  }

  observer?.onTermination?.({
    state,
    reason: terminationReason,
    ...(error ? { error } : {}),
  }, options.catalog);

  const diceChecks = { total: 0, criticalFailure: 0, failure: 0, success: 0, criticalSuccess: 0 };
  for (const entry of resolvedEvents) {
    if (!entry.diceResult) continue;
    diceChecks.total += 1;
    diceChecks[entry.diceResult] += 1;
  }

  const due = state.scheduledEvents.filter(({ dueAgeMonths }) => dueAgeMonths <= state.ageMonths);
  const notDue = state.scheduledEvents.filter(({ dueAgeMonths }) => dueAgeMonths > state.ageMonths);
  const lifetimeThreadStarted = hasStartedLifetimeThread(state, options.catalog);

  return {
    seed,
    terminationReason,
    finalState: state,
    resolvedEvents,
    normalEvents: resolvedEvents.filter(({ kind }) => kind === 'normal').length,
    scheduledEvents: resolvedEvents.filter(({ kind }) => kind === 'scheduled').length,
    criticalEvents: resolvedEvents.filter(({ kind }) => kind === 'critical').length,
    immediateEvents: resolvedEvents.filter(({ kind }) => kind === 'immediate').length,
    fallbackEvents: {
      land: resolvedEvents.filter(({ eventId }) => eventId === 'dead_end_on_land').length,
      sea: resolvedEvents.filter(({ eventId }) => eventId === 'dead_end_at_sea').length,
      total: resolvedEvents.filter(({ eventId }) => eventId === 'dead_end_on_land' || eventId === 'dead_end_at_sea').length,
    },
    maximumImmediateChainLength,
    immediateGuardTriggered,
    diceChecks,
    traits: [...state.player.traits],
    items: state.player.inventory.stacks.map(({ itemId }) => itemId),
    playerDeath: state.careerStatus === 'ended' && state.careerEndReason === 'death',
    npcDeaths: Object.entries(state.npcs).flatMap(([npcId, npc]) => npc.status === 'dead' ? [npcId] : []),
    shipLosses,
    maxAgeMonths,
    childhoodReached,
    activeReached,
    lifetimeThreadStarted,
    pendingScheduled: { due, notDue },
    possibleCriticalLoop,
    ...(terminationReason === 'deadEnd' ? { deadEnd: createDeadEndSnapshot(seed, state) } : {}),
    ...(error ? { error } : {}),
  };
}

function createDeadEndSnapshot(seed: number, state: GameState): DeadEndSnapshot {
  return {
    seed,
    careerPhase: state.careerPhase,
    ageMonths: state.ageMonths,
    slotInMonth: state.slotInMonth,
    locationId: state.locationId,
    travelState: state.travelState,
    isLeader: state.isLeader,
    passengerNpcIds: [...state.passengerNpcIds],
    traits: [...state.player.traits],
    flags: [...state.flags],
    items: state.player.inventory.stacks.map(({ itemId }) => itemId),
    npcStatuses: Object.fromEntries(Object.entries(state.npcs).map(([id, npc]) => [id, npc.status])),
    scheduledEvents: state.scheduledEvents.map((entry) => ({ ...entry })),
    recentHistory: state.history.slice(-10).map((entry) => ({ ...entry })),
  };
}
