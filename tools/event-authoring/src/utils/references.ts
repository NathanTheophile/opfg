import type { Condition, Effect, EventDefinition, Resolution } from '../gameSchema/current/contract';
import type { AuthoringProject } from '../authoring/types';

const renameConditionEvent = (condition: Condition, from: string, to: string): Condition => {
  switch (condition.type) {
    case 'all':
    case 'any':
      return { ...condition, conditions: condition.conditions.map((child) => renameConditionEvent(child, from, to)) };
    case 'not':
      return { ...condition, condition: renameConditionEvent(condition.condition, from, to) };
    case 'hasChosen':
    case 'hasPlayed':
    case 'hasOutcome':
      return condition.eventId === from ? { ...condition, eventId: to } : condition;
    default:
      return condition;
  }
};

const renameEffectEvent = (effect: Effect, from: string, to: string): Effect =>
  effect.type === 'scheduleEvent' && effect.eventId === from ? { ...effect, eventId: to } : effect;

const renameResolutionEvent = (resolution: Resolution, from: string, to: string): Resolution => {
  const renameOutcome = <T extends { effects: Effect[] }>(outcome: T): T => ({
    ...outcome,
    effects: outcome.effects.map((effect) => renameEffectEvent(effect, from, to)),
  });

  if (resolution.type === 'deterministic') {
    return { ...resolution, outcome: renameOutcome(resolution.outcome) };
  }

  return {
    ...resolution,
    modifiers: resolution.modifiers?.map((modifier) => ({
      ...modifier,
      condition: renameConditionEvent(modifier.condition, from, to),
    })),
    outcomes: {
      criticalFailure: renameOutcome(resolution.outcomes.criticalFailure),
      failure: renameOutcome(resolution.outcomes.failure),
      success: renameOutcome(resolution.outcomes.success),
      criticalSuccess: renameOutcome(resolution.outcomes.criticalSuccess),
    },
  };
};

const renameEventData = (event: EventDefinition, from: string, to: string): EventDefinition => {
  const base = {
    ...event,
    id: event.id === from ? to : event.id,
    eligibility: event.eligibility ? renameConditionEvent(event.eligibility, from, to) : undefined,
    choices: event.choices.map((choice) => ({
      ...choice,
      visibleIf: choice.visibleIf ? renameConditionEvent(choice.visibleIf, from, to) : undefined,
      availableIf: choice.availableIf ? renameConditionEvent(choice.availableIf, from, to) : undefined,
      resolution: renameResolutionEvent(choice.resolution, from, to),
    })),
  };
  if (event.kind === 'scheduled') return {
    ...base,
    kind: 'scheduled',
    priority: event.priority,
    scheduledReach: event.scheduledReach,
    cancelIf: event.cancelIf ? renameConditionEvent(event.cancelIf, from, to) : undefined,
    fallbackEventId: event.fallbackEventId === from ? to : event.fallbackEventId,
  };
  if (event.kind === 'critical') return { ...base, kind: 'critical', trigger: event.trigger };
  return { ...base, kind: 'normal' };
};

export const renameEventId = (project: AuthoringProject, from: string, to: string): AuthoringProject => ({
  ...project,
  events: project.events.map((event) => renameEventData(event, from, to)),
  nodes: project.nodes.map((node) => node.eventId === from ? { ...node, eventId: to } : node),
  edges: project.edges.map((edge) => ({
    ...edge,
    sourceEventId: edge.sourceEventId === from ? to : edge.sourceEventId,
    targetEventId: edge.targetEventId === from ? to : edge.targetEventId,
  })),
});

