import type { ContentCatalog } from '../content/schema';
import { getChoiceState } from '../engine/conditions';
import { findCurrentEvent, selectNextEvent } from '../engine/events';
import { resolveChoice } from '../engine/resolution';
import { createInitialGameState } from '../model/initialState';
import type { GameState } from '../model/schema';
import { derivePolicySeed, randomSimulationPolicy, type SimulationPolicy } from './simulationPolicy';
import type { DeadEndSnapshot, ResolvedSimulationEvent, SimulationRunResult, SimulationTerminationReason } from './types';

export interface SimulateRunOptions {
  seed: number;
  catalog: ContentCatalog;
  maxResolvedEvents?: number;
  policy?: SimulationPolicy;
  initialState?: GameState;
}

export function simulateRun(options: SimulateRunOptions): SimulationRunResult {
  const seed = options.seed >>> 0;
  const maximum = options.maxResolvedEvents ?? 1000;
  const policy = options.policy ?? randomSimulationPolicy;
  let policyRngState = derivePolicySeed(seed);
  let state = selectNextEvent(options.initialState ?? createInitialGameState(seed), options.catalog);
  const resolvedEvents: ResolvedSimulationEvent[] = [];
  let childhoodReached = state.careerPhase === 'childhood';
  let activeReached = state.careerPhase === 'active';
  let maxAgeMonths = state.ageMonths;
  let possibleCriticalLoop = false;
  let previousCriticalId: string | null = null;
  let consecutiveSameCritical = 0;
  let terminationReason: SimulationTerminationReason = 'deadEnd';
  let error: string | undefined;

  while (true) {
    if (state.careerStatus === 'ended') {
      terminationReason = 'careerEnded';
      break;
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
      const event = findCurrentEvent(state, options.catalog);
      if (!event) throw new Error(`Selected Event "${state.currentEventId}" is absent from the ContentCatalog.`);
      const availableChoices = event.choices.filter((choice) => {
        const choiceState = getChoiceState(choice, state);
        return choiceState.visible && choiceState.available;
      });
      const selection = policy.choose(availableChoices, policyRngState);
      policyRngState = selection.nextRngState;
      const result = resolveChoice(
        state,
        options.catalog,
        event.id,
        selection.choice.id,
        selection.choice.input ? 'SimPlayer' : undefined,
      );
      resolvedEvents.push({
        eventId: event.id,
        choiceId: selection.choice.id,
        outcomeId: result.outcome.id,
        kind: event.kind,
        ageMonths: result.state.ageMonths,
        ...(result.dice ? { diceResult: result.dice.result } : {}),
      });

      if (event.kind === 'critical') {
        consecutiveSameCritical = previousCriticalId === event.id ? consecutiveSameCritical + 1 : 1;
        previousCriticalId = event.id;
        if (consecutiveSameCritical >= 3) possibleCriticalLoop = true;
      } else {
        previousCriticalId = null;
        consecutiveSameCritical = 0;
      }

      state = result.state;
      childhoodReached ||= state.careerPhase === 'childhood';
      activeReached ||= state.careerPhase === 'active';
      maxAgeMonths = Math.max(maxAgeMonths, state.ageMonths);
    } catch (caught) {
      terminationReason = 'simulationError';
      error = caught instanceof Error ? caught.message : String(caught);
      break;
    }
  }

  const diceChecks = { total: 0, criticalFailure: 0, failure: 0, success: 0, criticalSuccess: 0 };
  for (const entry of resolvedEvents) {
    if (!entry.diceResult) continue;
    diceChecks.total += 1;
    diceChecks[entry.diceResult] += 1;
  }
  const due = state.scheduledEvents.filter(({ dueAgeMonths }) => dueAgeMonths <= state.ageMonths);
  const notDue = state.scheduledEvents.filter(({ dueAgeMonths }) => dueAgeMonths > state.ageMonths);

  return {
    seed,
    terminationReason,
    finalState: state,
    resolvedEvents,
    normalEvents: resolvedEvents.filter(({ kind }) => kind === 'normal').length,
    scheduledEvents: resolvedEvents.filter(({ kind }) => kind === 'scheduled').length,
    criticalEvents: resolvedEvents.filter(({ kind }) => kind === 'critical').length,
    diceChecks,
    traits: [...state.player.traits],
    items: [...state.items],
    playerDeath: state.careerStatus === 'ended' && state.careerEndReason === 'death',
    npcDeaths: Object.entries(state.npcs).flatMap(([npcId, npc]) => npc.status === 'dead' ? [npcId] : []),
    shipLosses: state.ship === null ? 1 : 0,
    maxAgeMonths,
    childhoodReached,
    activeReached,
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
    traits: [...state.player.traits],
    flags: [...state.flags],
    items: [...state.items],
    npcStatuses: Object.fromEntries(Object.entries(state.npcs).map(([id, npc]) => [id, npc.status])),
    scheduledEvents: state.scheduledEvents.map((entry) => ({ ...entry })),
    recentHistory: state.history.slice(-10).map((entry) => ({ ...entry })),
  };
}
