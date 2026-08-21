import type { ContentCatalog, EventDefinition } from '../content/schema';
import type { GameState, SeaId } from '../model/schema';
import { evaluateCondition } from './conditions';

export const REVERSE_MOUNTAIN_ENTRY_EVENT_ID = 'active_reverse_mountain_01_entry';
export const REVERSE_MOUNTAIN_NAVIGATOR_OFFER_EVENT_ID = 'system_reverse_mountain_navigator_offer';
export const REVERSE_MOUNTAIN_FIRST_NAVIGATOR_ASSIGNMENT_FLAG = 'reverse_mountain_first_navigator_assignment_seen';
export const REVERSE_MOUNTAIN_ATTEMPT_FLAG = 'reverse_mountain_attempt_active';
export const REVERSE_MOUNTAIN_NAVIGATOR_OVERRIDE_FLAG = 'reverse_mountain_navigator_override';

export const REVERSE_MOUNTAIN_ROOT_BY_SEA = {
  east_blue: 'active_reverse_mountain_approach_east_blue',
  west_blue: 'active_reverse_mountain_approach_west_blue',
  north_blue: 'active_reverse_mountain_approach_north_blue',
  south_blue: 'active_reverse_mountain_approach_south_blue',
} as const;

export const REVERSE_MOUNTAIN_ROOT_IDS = new Set<string>(Object.values(REVERSE_MOUNTAIN_ROOT_BY_SEA));

const REVERSE_MOUNTAIN_RISK_FLAGS = [
  'reverse_mountain_risk_01',
  'reverse_mountain_risk_02',
  'reverse_mountain_risk_03',
  'reverse_mountain_risk_04',
  'reverse_mountain_risk_05',
  'reverse_mountain_risk_06',
] as const;

const REVERSE_MOUNTAIN_CRITICAL_STAGES = [
  { id: 'critical_reverse_mountain_01_undertow', threshold: 2, resolvedFlag: 'reverse_mountain_critical_01_resolved', prerequisites: [] },
  { id: 'critical_reverse_mountain_02_breaking_point', threshold: 4, resolvedFlag: 'reverse_mountain_critical_02_resolved', prerequisites: ['reverse_mountain_critical_01_resolved'] },
  { id: 'critical_reverse_mountain_03_last_chance', threshold: 6, resolvedFlag: 'reverse_mountain_critical_03_resolved', prerequisites: ['reverse_mountain_critical_01_resolved', 'reverse_mountain_critical_02_resolved'] },
] as const;

const REVERSE_MOUNTAIN_TEMPORARY_FLAGS = new Set<string>([
  REVERSE_MOUNTAIN_ATTEMPT_FLAG,
  REVERSE_MOUNTAIN_NAVIGATOR_OVERRIDE_FLAG,
  ...REVERSE_MOUNTAIN_RISK_FLAGS,
  ...REVERSE_MOUNTAIN_CRITICAL_STAGES.map(({ resolvedFlag }) => resolvedFlag),
]);

type NormalEvent = Extract<EventDefinition, { kind: 'normal' }>;

export const isReverseMountainRootId = (eventId: string): boolean => REVERSE_MOUNTAIN_ROOT_IDS.has(eventId);
export const isReverseMountainImmediateEventId = (eventId: string): boolean =>
  Object.values(REVERSE_MOUNTAIN_ROOT_BY_SEA).some((rootId) => eventId.startsWith(`${rootId}_i`));
export const hasReverseMountainAttemptActive = (state: GameState): boolean => state.flags.includes(REVERSE_MOUNTAIN_ATTEMPT_FLAG);
export const hasReverseMountainNavigatorOverride = (state: GameState): boolean => state.flags.includes(REVERSE_MOUNTAIN_NAVIGATOR_OVERRIDE_FLAG);

export function reverseMountainRootIdForCurrentSea(state: GameState, catalog: ContentCatalog): string | undefined {
  const seaId = catalog.locations.find(({ id }) => id === state.locationId)?.seaId as SeaId | undefined;
  return seaId === undefined ? undefined : REVERSE_MOUNTAIN_ROOT_BY_SEA[seaId as keyof typeof REVERSE_MOUNTAIN_ROOT_BY_SEA];
}

export function hasCrossedReverseMountain(state: GameState): boolean {
  return state.history.some(({ eventId }) => eventId === REVERSE_MOUNTAIN_ENTRY_EVENT_ID);
}

function isOccurrenceEligible(event: NormalEvent, state: GameState): boolean {
  const occurrences = state.history.filter(({ eventId }) => eventId === event.id);
  if (event.replay === undefined) return occurrences.length === 0;
  if (event.replay.maxOccurrences !== undefined && occurrences.length >= event.replay.maxOccurrences) return false;
  const last = occurrences.at(-1);
  return last === undefined || state.ageMonths - last.ageMonths >= event.replay.cooldownMonths;
}

export function findEligibleReverseMountainRoot(state: GameState, catalog: ContentCatalog): NormalEvent | undefined {
  const rootId = reverseMountainRootIdForCurrentSea(state, catalog);
  if (rootId === undefined) return undefined;
  const root = catalog.events.find((event): event is NormalEvent => event.kind === 'normal' && event.id === rootId);
  if (!root || !isOccurrenceEligible(root, state)) return undefined;
  return root.eligibility === undefined || evaluateCondition(root.eligibility, state, catalog) ? root : undefined;
}

export function canStartNavigatorReverseMountainAttempt(state: GameState, catalog: ContentCatalog): boolean {
  if (state.careerPhase !== 'active' || state.ship === null || hasCrossedReverseMountain(state) || hasReverseMountainAttemptActive(state)) return false;
  const rootId = reverseMountainRootIdForCurrentSea(state, catalog);
  if (rootId === undefined) return false;
  const withOverride = hasReverseMountainNavigatorOverride(state)
    ? state
    : { ...state, flags: [...state.flags, REVERSE_MOUNTAIN_NAVIGATOR_OVERRIDE_FLAG] };
  return findEligibleReverseMountainRoot(withOverride, catalog) !== undefined;
}

export function startNavigatorReverseMountainAttempt(state: GameState, catalog: ContentCatalog): void {
  if (!canStartNavigatorReverseMountainAttempt(state, catalog)) {
    throw new Error('Reverse Mountain Navigator attempt is unavailable.');
  }
  if (!hasReverseMountainNavigatorOverride(state)) state.flags = [...state.flags, REVERSE_MOUNTAIN_NAVIGATOR_OVERRIDE_FLAG];
  const root = findEligibleReverseMountainRoot(state, catalog);
  if (!root) throw new Error('Reverse Mountain root is missing or ineligible after Navigator override.');
  state.currentEventId = root.id;
}

/** Called exactly when a crew role is newly assigned, not while merely checking availability. */
export function processFirstNavigatorAssignment(state: GameState, catalog: ContentCatalog): boolean {
  if (state.flags.includes(REVERSE_MOUNTAIN_FIRST_NAVIGATOR_ASSIGNMENT_FLAG)) return false;
  state.flags = [...state.flags, REVERSE_MOUNTAIN_FIRST_NAVIGATOR_ASSIGNMENT_FLAG];
  if (!canStartNavigatorReverseMountainAttempt(state, catalog)) return false;
  state.currentEventId = REVERSE_MOUNTAIN_NAVIGATOR_OFFER_EVENT_ID;
  return true;
}

export function materializeReverseMountainSystemEvent(eventId: string): EventDefinition | undefined {
  if (eventId !== REVERSE_MOUNTAIN_NAVIGATOR_OFFER_EVENT_ID) return undefined;
  return {
    id: REVERSE_MOUNTAIN_NAVIGATOR_OFFER_EVENT_ID,
    kind: 'system',
    titleKey: 'event.system_reverse_mountain_navigator_offer.title',
    textKey: 'event.system_reverse_mountain_navigator_offer.text',
    choices: [
      {
        id: 'try_reverse_mountain',
        textKey: 'event.system_reverse_mountain_navigator_offer.choice.try_reverse_mountain.text',
        resolution: {
          type: 'deterministic',
          outcome: {
            id: 'resolved',
            textKey: 'event.system_reverse_mountain_navigator_offer.choice.try_reverse_mountain.outcome.resolved.text',
            effects: [{ type: 'setFlag', flagId: REVERSE_MOUNTAIN_NAVIGATOR_OVERRIDE_FLAG }],
          },
        },
      },
      {
        id: 'not_now',
        textKey: 'event.system_reverse_mountain_navigator_offer.choice.not_now.text',
        resolution: {
          type: 'deterministic',
          outcome: {
            id: 'resolved',
            textKey: 'event.system_reverse_mountain_navigator_offer.choice.not_now.outcome.resolved.text',
            effects: [],
          },
        },
      },
    ],
  };
}

export function reverseMountainRiskCount(state: GameState): number {
  return REVERSE_MOUNTAIN_RISK_FLAGS.filter((flagId) => state.flags.includes(flagId)).length;
}

export function findReverseMountainCriticalEvent(state: GameState, events: readonly EventDefinition[]): EventDefinition | undefined {
  if (!hasReverseMountainAttemptActive(state) || state.ship === null || state.ship.health <= 0 || state.player.stats.health <= 0) return undefined;
  const risk = reverseMountainRiskCount(state);
  for (const stage of REVERSE_MOUNTAIN_CRITICAL_STAGES) {
    if (state.flags.includes(stage.resolvedFlag)) continue;
    if (risk < stage.threshold || stage.prerequisites.some((flagId) => !state.flags.includes(flagId))) return undefined;
    return events.find((event) =>
      event.kind === 'critical'
      && event.id === stage.id
      && event.trigger.type === 'reverseMountainRiskAtLeast'
      && event.trigger.value === stage.threshold,
    );
  }
  return undefined;
}

export function clearReverseMountainTemporaryFlags(state: GameState): GameState {
  if (!state.flags.some((flagId) => REVERSE_MOUNTAIN_TEMPORARY_FLAGS.has(flagId))) return state;
  return { ...state, flags: state.flags.filter((flagId) => !REVERSE_MOUNTAIN_TEMPORARY_FLAGS.has(flagId)) };
}

export function clearReverseMountainImmediateQueue(state: GameState): GameState {
  const immediateEventQueue = state.immediateEventQueue.filter((eventId) => !isReverseMountainImmediateEventId(eventId));
  if (immediateEventQueue.length === state.immediateEventQueue.length) return state;
  return {
    ...state,
    immediateEventQueue,
    immediateEventsResolvedInChain: immediateEventQueue.length === 0 ? 0 : state.immediateEventsResolvedInChain,
  };
}
