import type { ContentCatalog, EventDefinition, MajorNarrativeTrackDefinition } from '../content/schema';
type ScheduledDefinition = Extract<EventDefinition, { kind: 'scheduled' }>;
type NormalDefinition = Extract<EventDefinition, { kind: 'normal' }>;
import type { GameState, ScheduledEvent } from '../model/schema';
import { evaluateCondition, getChoiceState } from './conditions';
import { nextRandom } from './rng';
import { materializeEventCast } from './npcNames';
import { createDepartureSystemEvent, materializeNavigationEvent } from './navigation';
import { finalizePendingSlot } from './time';
import { findDockableAccess, isLocationWithin } from './locations';
import { canRecruitNpc, countCurrentCrew } from './ship';
import { activeParadiseRouteId, countFallbackStreak, isParadiseRouteStartEventId } from './maritime';
import {
  createArrivalMarketEvent,
  createShiplessMarketRecoveryEvent,
  materializeMarketEvent,
} from './marketEvents';
import { requiresCrewManagement } from './crew';
import {
  findEligibleReverseMountainRoot,
  findReverseMountainCriticalEvent,
  hasReverseMountainNavigatorOverride,
  materializeReverseMountainSystemEvent,
  REVERSE_MOUNTAIN_ROOT_IDS,
} from './reverseMountain';

export const FALLBACK_EVENT_IDS = ['dead_end_on_land', 'dead_end_at_sea'] as const;

export const NEW_WORLD_ROUTE_START_EVENT_IDS = [
  'active_new_world_route_start_raijin',
  'active_new_world_route_start_risky_red',
  'active_new_world_route_start_mystoria',
] as const;

const NEW_WORLD_ROUTE_START_EVENT_ID_SET = new Set<string>(NEW_WORLD_ROUTE_START_EVENT_IDS);
const SABAODY_RED_LINE_PASSAGE_EVENT_ID = 'active_sabaody_red_line_passage';
const FISH_MAN_ISLAND_LOCATION_ID = 'fish_man_island';

export const EARLY_WINDFALL_ROOT_IDS = {
  civilian: [
    'active_early_windfall_civilian_market_hundred_hands',
    'active_early_windfall_civilian_impossible_contract',
  ],
  pirate: [
    'active_early_windfall_pirate_changing_hands',
    'active_early_windfall_pirate_three_chests_night',
  ],
  marine: [
    'active_early_windfall_marine_impossible_seizure',
    'active_early_windfall_marine_false_uniform_convoy',
  ],
  revolutionary: [
    'active_early_windfall_revolutionary_invisible_fund',
    'active_early_windfall_revolutionary_tyrant_auction',
  ],
} as const;

const EARLY_WINDFALL_ROOT_ID_SET = new Set<string>(Object.values(EARLY_WINDFALL_ROOT_IDS).flat());


const EARLY_CREW_FALLBACK_NPC_BY_EVENT_ID = new Map<string, string>([
  ['active_early_crew_guarantee_01_notice_carver', 'active_recruit_notice_carver'],
  ['active_early_crew_guarantee_02_lot_runner', 'active_recruit_lot_runner'],
  ['active_early_crew_guarantee_03_wake_keeper', 'active_recruit_wake_keeper'],
  ['active_early_crew_guarantee_04_knot_runner', 'active_recruit_knot_runner'],
]);
const EARLY_CREW_FALLBACK_EVENT_IDS = new Set(EARLY_CREW_FALLBACK_NPC_BY_EVENT_ID.keys());
export const HAKI_DUE_ROOT_IDS = {
  observation: [
    'active_haki_observation_l1_one_second_early',
    'active_haki_observation_l2_what_gestures_hide',
    'active_haki_observation_l3_world_without_eyes',
    'active_haki_observation_l4_silence_that_lies',
    'active_haki_observation_l5_before_world_moves',
  ],
  armament: [
    'active_haki_armament_l1_the_unbreakable_thing',
    'active_haki_armament_l2_skin_against_steel',
    'active_haki_armament_l3_what_must_yield',
    'active_haki_armament_l4_harder_than_you',
    'active_haki_armament_l5_impossible_blow',
  ],
} as const;

const HAKI_DUE_ROOT_ID_SET = new Set<string>([
  ...HAKI_DUE_ROOT_IDS.observation,
  ...HAKI_DUE_ROOT_IDS.armament,
]);

interface DueMajorSelection {
  candidates: NormalDefinition[];
  overdue: boolean;
}

function isCrewRecruitmentChoice(choice: NormalDefinition['choices'][number]): boolean {
  const outcomes = choice.resolution.type === 'deterministic'
    ? [choice.resolution.outcome]
    : Object.values(choice.resolution.outcomes);

  return outcomes.some((outcome) =>
    outcome.effects.some((effect) => effect.type === 'setNpcStatus' && effect.status === 'crew')
  );
}

export function isCrewRecruitmentEvent(event: EventDefinition): event is NormalDefinition {
  if (event.kind !== 'normal' || event.majorTrack !== undefined || event.lifetimeThreadSeed === true) return false;
  return event.choices.some((choice) => isCrewRecruitmentChoice(choice));
}

function hasAvailableCrewRecruitmentChoice(
  event: NormalDefinition,
  state: GameState,
  catalog: ContentCatalog,
): boolean {
  return event.choices.some((choice) => {
    if (!isCrewRecruitmentChoice(choice)) return false;
    const choiceState = getChoiceState(choice, state, catalog);
    return choiceState.visible && choiceState.available;
  });
}

function eligibleCrewRecruitmentEvents(state: GameState, catalog: ContentCatalog): NormalDefinition[] {
  return catalog.events
    .filter((event): event is NormalDefinition => isCrewRecruitmentEvent(event))
    .filter((event) => isNormalOccurrenceEligible(event, state) && isEligible(event, state, catalog))
    .filter((event) => hasAvailableCrewRecruitmentChoice(event, state, catalog))
    .filter((event) => {
      const fallbackNpcId = EARLY_CREW_FALLBACK_NPC_BY_EVENT_ID.get(event.id);
      if (fallbackNpcId === undefined) return true;

      const target = earlyCrewTarget(state);
      return target !== undefined
        && countCurrentCrew(state) < target
        && canRecruitNpc(state, catalog, fallbackNpcId, true);
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function hasEligibleCrewRecruitmentEvent(state: GameState, catalog: ContentCatalog): boolean {
  return eligibleCrewRecruitmentEvents(state, catalog).length > 0;
}

function earlyCrewTarget(state: GameState): number | undefined {
  if (state.careerPhase !== 'active') return undefined;
  const ageYears = Math.floor(state.ageMonths / 12);
  if (ageYears === 15) return 1;
  if (ageYears === 16) return 2;
  if (ageYears === 17) return 3;
  return undefined;
}

function eligibleEarlyCrewGuaranteeEvents(state: GameState, catalog: ContentCatalog): NormalDefinition[] {
  const target = earlyCrewTarget(state);
  if (target === undefined || countCurrentCrew(state) >= target) return [];

  const eligible = eligibleCrewRecruitmentEvents(state, catalog);
  const authored = eligible.filter(({ id }) => !EARLY_CREW_FALLBACK_EVENT_IDS.has(id));
  if (authored.length > 0) return authored;

  return eligible.filter(({ id }) => EARLY_CREW_FALLBACK_EVENT_IDS.has(id));
}

function eligibleDueHakiRootEvents(state: GameState, catalog: ContentCatalog): NormalDefinition[] {
  return catalog.events
    .filter((event): event is NormalDefinition =>
      event.kind === 'normal'
      && HAKI_DUE_ROOT_ID_SET.has(event.id)
      && isNormalOccurrenceEligible(event, state)
      && isEligible(event, state, catalog),
    )
    .sort((left, right) => left.id.localeCompare(right.id));
}

function eligibleEarlyWindfallRootEvents(state: GameState, catalog: ContentCatalog): NormalDefinition[] {
  return catalog.events
    .filter((event): event is NormalDefinition =>
      event.kind === 'normal'
      && EARLY_WINDFALL_ROOT_ID_SET.has(event.id)
      && isNormalOccurrenceEligible(event, state)
      && isEligible(event, state, catalog),
    )
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function selectNextEvent(state: GameState, catalog: ContentCatalog): GameState {
  if (state.careerStatus !== 'active') return { ...state, currentEventId: null };

  const critical = findCriticalEvent(state, catalog.events);
  if (critical) return selectEvent(state, catalog, critical);

  if (state.immediateEventQueue.length > 0) {
    const immediateId = state.immediateEventQueue[0];
    const immediate = catalog.events.find((event) => event.id === immediateId && event.kind === 'immediate');
    if (!immediate) throw new Error(`Pending Immediate Event "${immediateId}" is missing or is not immediate.`);
    if (!isEligible(immediate, state, catalog)) {
      const skipped = { ...state, immediateEventQueue: state.immediateEventQueue.slice(1) };
      return selectNextEvent(skipped.immediateEventQueue.length === 0 ? finalizePendingSlot(skipped, catalog) : skipped, catalog);
    }
    return selectEvent(state, catalog, immediate);
  }

  if (requiresCrewManagement(state)) return { ...state, currentEventId: null };


  if (hasReverseMountainNavigatorOverride(state)) {
    const reverseMountainOverride = findEligibleReverseMountainRoot(state, catalog);
    if (reverseMountainOverride) return selectEvent(state, catalog, reverseMountainOverride);
  }

  if (state.locationId === 'twin_capes' && state.travelState === 'on_land' && activeParadiseRouteId(state) === undefined) {
    const routeStarts = catalog.events.filter((event): event is NormalDefinition =>
      event.kind === 'normal'
        && isParadiseRouteStartEventId(event.id)
        && isNormalOccurrenceEligible(event, state)
        && isEligible(event, state, catalog),
    ).sort((left, right) => left.id.localeCompare(right.id));
    if (routeStarts.length > 0) return selectUniformNormal(state, catalog, state.scheduledEvents, routeStarts);
  }

  if (state.locationId === 'reverse_mountain') {
    const reverseMountainEntry = catalog.events.find((event): event is NormalDefinition =>
      event.id === 'active_reverse_mountain_01_entry' && event.kind === 'normal',
    );
    if (reverseMountainEntry && isNormalOccurrenceEligible(reverseMountainEntry, state) && isEligible(reverseMountainEntry, state, catalog)) {
      return selectEvent(state, catalog, reverseMountainEntry);
    }
  }

  if (state.shipMarketArrivalPending) {
    const marketEvent = createArrivalMarketEvent(state, catalog);
    if (marketEvent) return selectEvent(state, catalog, marketEvent);

    // A legacy save may still carry the flag while at sea. Preserve it until
    // the player actually docks; only a landed non-market Location consumes it.
    if (state.travelState === 'on_land') {
      state = { ...state, shipMarketArrivalPending: false };
    }
  }

  const sabaodyPassage = state.locationId === 'sabaody_archipelago'
    ? catalog.events.find((event): event is NormalDefinition =>
        event.id === SABAODY_RED_LINE_PASSAGE_EVENT_ID
          && event.kind === 'normal'
          && isNormalOccurrenceEligible(event, state)
          && isEligible(event, state, catalog))
    : undefined;
  if (sabaodyPassage) return selectEvent(state, catalog, sabaodyPassage);

  if (isLocationWithin(catalog, state.locationId, FISH_MAN_ISLAND_LOCATION_ID)) {
    const newWorldRouteStarts = catalog.events.filter((event): event is NormalDefinition =>
      event.kind === 'normal'
        && NEW_WORLD_ROUTE_START_EVENT_ID_SET.has(event.id)
        && isNormalOccurrenceEligible(event, state)
        && isEligible(event, state, catalog),
    ).sort((left, right) => left.id.localeCompare(right.id));
    if (newWorldRouteStarts.length > 0) {
      return selectUniformNormal(state, catalog, state.scheduledEvents, newWorldRouteStarts);
    }
  }

  const reverseMountainRoot = findEligibleReverseMountainRoot(state, catalog);
  if (reverseMountainRoot) return selectEvent(state, catalog, reverseMountainRoot);

  const earlyWindfallRoots = eligibleEarlyWindfallRootEvents(state, catalog);
  if (earlyWindfallRoots.length > 0) {
    return selectUniformNormal(state, catalog, state.scheduledEvents, earlyWindfallRoots);
  }

  const departure = createDepartureSystemEvent(state, catalog);
  if (departure) return selectEvent(state, catalog, departure);

  const major = findDueMajorNarrativeCandidates(state, catalog);
  if (major?.overdue) return selectUniformNormal(state, catalog, state.scheduledEvents, major.candidates);

  const scheduled = selectScheduledEvent(state, catalog);
  if (scheduled.event) return selectEvent({ ...state, scheduledEvents: scheduled.entries }, catalog, scheduled.event);

  if (major) return selectUniformNormal(state, catalog, scheduled.entries, major.candidates);

  const dueHakiRoots = eligibleDueHakiRootEvents(state, catalog);
  if (dueHakiRoots.length > 0) {
    return selectUniformNormal(state, catalog, scheduled.entries, dueHakiRoots);
  }

  if (state.pendingCrewRecruitment) {
    const recruitmentCandidates = eligibleCrewRecruitmentEvents(state, catalog);
    if (recruitmentCandidates.length > 0) {
      return selectUniformNormal({ ...state, pendingCrewRecruitment: false }, catalog, scheduled.entries, recruitmentCandidates);
    }

    // The state may have changed between activation and the next ordinary-root opportunity.
    // Refund Recruiter rather than silently consuming the annual charge.
    const crewRoleLastUsedYear = { ...state.crewRoleLastUsedYear };
    if (crewRoleLastUsedYear.recruiter === Math.floor(state.ageMonths / 12)) delete crewRoleLastUsedYear.recruiter;
    state = { ...state, pendingCrewRecruitment: false, crewRoleLastUsedYear };
  }

  const earlyCrewRecruitment = eligibleEarlyCrewGuaranteeEvents(state, catalog);
  if (earlyCrewRecruitment.length > 0) {
    return selectUniformNormal(state, catalog, state.scheduledEvents, earlyCrewRecruitment);
  }

  const candidates = catalog.events.filter((event): event is NormalDefinition =>
    event.kind === 'normal'
      && event.majorTrack === undefined
      && !FALLBACK_EVENT_IDS.includes(event.id as typeof FALLBACK_EVENT_IDS[number])
      && !isParadiseRouteStartEventId(event.id)
      && !REVERSE_MOUNTAIN_ROOT_IDS.has(event.id)
      && !EARLY_CREW_FALLBACK_EVENT_IDS.has(event.id)
      && isNormalOccurrenceEligible(event, state)
      && isEligible(event, state, catalog),
  );
  if (candidates.length === 0) {
    if (state.careerPhase !== 'active') return { ...state, scheduledEvents: scheduled.entries, currentEventId: null };
    if (state.travelState === 'on_land') {
      const exhaustedDeparture = createDepartureSystemEvent(state, catalog, true);
      if (exhaustedDeparture) return selectEvent({ ...state, scheduledEvents: scheduled.entries }, catalog, exhaustedDeparture);

      const shiplessMarketRecovery = createShiplessMarketRecoveryEvent(state, catalog);
      if (shiplessMarketRecovery) {
        return selectEvent(
          { ...state, scheduledEvents: scheduled.entries },
          catalog,
          shiplessMarketRecovery,
        );
      }
    }
    const fallbackId = state.travelState === 'at_sea' ? 'dead_end_at_sea' : 'dead_end_on_land';
    const fallback = catalog.events.find((event) => event.id === fallbackId && event.kind === 'normal');
    const accessible = state.travelState === 'at_sea' || state.ship === null || findDockableAccess(catalog, state.locationId) !== undefined;
    return fallback && accessible
      ? selectEvent({ ...state, scheduledEvents: scheduled.entries }, catalog, fallback)
      : { ...state, scheduledEvents: scheduled.entries, currentEventId: null };
  }

  return selectUniformNormal(state, catalog, scheduled.entries, candidates);
}

export function isArrivalMarketHubAvailable(state: GameState, catalog: ContentCatalog): boolean {
  const location = catalog.locations.find(({ id }) => id === state.locationId);
  return state.careerPhase === 'active' && state.travelState === 'on_land' && location?.hasMarketHub === true;
}

function findDueMajorNarrativeCandidates(state: GameState, catalog: ContentCatalog): DueMajorSelection | undefined {
  const eligibleTracks = catalog.majorNarrativeTracks
    .filter((track) => evaluateCondition(track.eligibility, state, catalog))
    .map((track) => ({ track, chapter: firstIncompleteChapter(state, catalog, track) }))
    .filter((entry): entry is { track: MajorNarrativeTrackDefinition; chapter: MajorNarrativeTrackDefinition['chapters'][number] } => entry.chapter !== undefined)
    .filter(({ chapter }) => chapter.phase === state.careerPhase && state.ageMonths >= chapter.dueAgeMonths)
    .sort((a, b) => a.chapter.dueAgeMonths - b.chapter.dueAgeMonths || a.track.id.localeCompare(b.track.id));

  if (eligibleTracks.length === 0) return undefined;
  const selected = eligibleTracks[0];
  const chapterIndex = selected.track.chapters.findIndex(({ id }) => id === selected.chapter.id);
  const previousNodeId = chapterIndex > 0
    ? playedMajorNodeId(state, catalog, selected.track.id, selected.track.chapters[chapterIndex - 1].id)
    : undefined;

  const reachable = catalog.events.filter((event): event is NormalDefinition => {
    if (
      event.kind !== 'normal'
      || event.majorTrack?.trackId !== selected.track.id
      || event.majorTrack.chapterId !== selected.chapter.id
      || !isNormalOccurrenceEligible(event, state)
      || !isEligible(event, state, catalog)
    ) return false;

    const parents = event.majorTrack.parentNodeIds ?? [];
    return chapterIndex === 0
      ? parents.length === 0
      : previousNodeId !== undefined && parents.includes(previousNodeId);
  });

  const specialized = reachable.filter((event) => event.majorTrack?.fallback !== true);
  const basePool = specialized.length > 0
    ? specialized
    : reachable.filter((event) => event.majorTrack?.fallback === true);
  if (basePool.length === 0) return undefined;

  const highestPriority = Math.max(...basePool.map((event) => event.majorTrack?.selectionPriority ?? 0));
  const candidates = basePool.filter((event) => (event.majorTrack?.selectionPriority ?? 0) === highestPriority);
  return { candidates, overdue: state.ageMonths > selected.chapter.dueAgeMonths };
}

function playedMajorNodeId(
  state: GameState,
  catalog: ContentCatalog,
  trackId: string,
  chapterId: string,
): string | undefined {
  const eventById = new Map(catalog.events.map((event) => [event.id, event] as const));
  for (let index = state.history.length - 1; index >= 0; index -= 1) {
    const event = eventById.get(state.history[index].eventId);
    const ref = event?.kind === 'normal' ? event.majorTrack : undefined;
    if (ref?.trackId === trackId && ref.chapterId === chapterId) return ref.nodeId;
  }
  return undefined;
}

function firstIncompleteChapter(state: GameState, catalog: ContentCatalog, track: MajorNarrativeTrackDefinition): MajorNarrativeTrackDefinition['chapters'][number] | undefined {
  const eventById = new Map(catalog.events.map((event) => [event.id, event] as const));
  const playedChapters = new Set<string>();
  for (const { eventId } of state.history) {
    const event = eventById.get(eventId);
    const ref = event?.kind === 'normal' ? event.majorTrack : undefined;
    if (ref?.trackId === track.id) playedChapters.add(ref.chapterId);
  }
  return track.chapters.find(({ id }) => !playedChapters.has(id));
}

export function completedMajorNarrativeMilestones(state: GameState, catalog: ContentCatalog): string[] {
  const eventById = new Map(catalog.events.map((event) => [event.id, event] as const));
  return [...new Set(state.history.flatMap(({ eventId }) => {
    const event = eventById.get(eventId);
    const milestoneId = event?.kind === 'normal' ? event.majorTrack?.milestoneId : undefined;
    return milestoneId ? [milestoneId] : [];
  }))];
}

function selectEvent(state: GameState, catalog: ContentCatalog, event: EventDefinition): GameState {
  return materializeEventCast({ ...state, currentEventId: event.id }, catalog, event);
}

function selectUniformNormal(state: GameState, catalog: ContentCatalog, scheduledEvents: ScheduledEvent[], candidates: NormalDefinition[]): GameState {
  if (candidates.length === 1) return selectEvent({ ...state, scheduledEvents }, catalog, candidates[0]);
  const random = nextRandom(state.rngState);
  const selected = candidates[Math.floor(random.value * candidates.length)];
  return selectEvent({
    ...state,
    scheduledEvents,
    rngState: random.nextState,
  }, catalog, selected);
}

/** @deprecated Lifetime Threads remain optional secondary content; they are no longer a Childhood guarantee. */
export function hasStartedLifetimeThread(state: GameState, catalog: ContentCatalog): boolean {
  const seedIds = new Set(catalog.events.filter((event) => event.kind === 'normal' && event.lifetimeThreadSeed === true).map(({ id }) => id));
  return state.history.some(({ eventId }) => seedIds.has(eventId));
}

export function findCriticalEvent(state: GameState, events: readonly EventDefinition[]): EventDefinition | undefined {
  const critical = events.filter((event) => event.kind === 'critical');
  if (state.player.stats.health <= 0) return critical.find(({ trigger }) => trigger.type === 'playerHealthDepleted');
  const deadNpcId = Object.entries(state.npcs)
    .filter(([, npc]) => npc.status !== 'dead' && npc.stats.health <= 0)
    .map(([npcId]) => npcId).sort()[0];
  if (deadNpcId) return critical.find(({ trigger }) => trigger.type === 'npcHealthDepleted' && trigger.npcId === deadNpcId);
  if (state.ship !== null && state.ship.health <= 0) return critical.find(({ trigger }) => trigger.type === 'shipDestroyed');
  if (state.ship === null && state.travelState === 'at_sea' && state.maritimeEmergency === null) return critical.find(({ trigger }) => trigger.type === 'shipMissingAtSea');
  if (state.pendingShip !== null) return critical.find(({ trigger }) => trigger.type === 'shipReplacementPending');
  const fallback = critical.find(({ trigger }) => trigger.type === 'fallbackStreakAtLeast' && countFallbackStreak(state, events) >= trigger.value);
  if (fallback) return fallback;
  const reverseMountainCritical = findReverseMountainCriticalEvent(state, events);
  if (reverseMountainCritical) return reverseMountainCritical;
  return critical.find(({ trigger }) => trigger.type === 'careerAgeAtLeast' && state.careerPhase === 'active' && state.ageMonths >= trigger.value);
}

export function isNormalOccurrenceEligible(event: NormalDefinition, state: GameState): boolean {
  const occurrences = state.history.filter(({ eventId }) => eventId === event.id);
  if (event.replay === undefined) return occurrences.length === 0;
  if (event.replay.maxOccurrences !== undefined && occurrences.length >= event.replay.maxOccurrences) return false;
  const last = occurrences.at(-1);
  return last === undefined || state.ageMonths - last.ageMonths >= event.replay.cooldownMonths;
}

function selectScheduledEvent(state: GameState, catalog: ContentCatalog): { event?: EventDefinition; entries: ScheduledEvent[] } {
  let entries = [...state.scheduledEvents];
  const candidates: { event: EventDefinition & { kind: 'scheduled' }; entry: ScheduledEvent }[] = [];
  for (const entry of state.scheduledEvents) {
    if (entry.dueAgeMonths > state.ageMonths) continue;
    const original = catalog.events.find((event): event is ScheduledDefinition => event.id === entry.eventId && event.kind === 'scheduled');
    if (!original) continue;
    let event = original;
    if (original.cancelIf && evaluateCondition(original.cancelIf, state, catalog)) {
      if (!original.fallbackEventId) {
        entries = removeOccurrence(entries, entry);
        continue;
      }
      const fallback = catalog.events.find((candidate): candidate is ScheduledDefinition => candidate.id === original.fallbackEventId && candidate.kind === 'scheduled');
      if (!fallback) continue;
      event = fallback;
    }
    const location = catalog.locations.find(({ id }) => id === state.locationId);
    if (location?.blocksScheduledEvents && (event.scheduledReach ?? 'normal') === 'normal') continue;
    if (!isEligible(event, state, catalog)) continue;
    candidates.push({ event, entry });
  }
  candidates.sort((a, b) => b.event.priority - a.event.priority || a.entry.dueAgeMonths - b.entry.dueAgeMonths || a.event.id.localeCompare(b.event.id));
  return { event: candidates[0]?.event, entries };
}

function removeOccurrence(entries: ScheduledEvent[], target: ScheduledEvent): ScheduledEvent[] {
  const index = entries.indexOf(target);
  return index < 0 ? entries : entries.filter((_, candidate) => candidate !== index);
}

function isEligible(event: EventDefinition, state: GameState, catalog: ContentCatalog): boolean {
  return event.eligibility === undefined || evaluateCondition(event.eligibility, state, catalog);
}

export function findCurrentEvent(state: GameState, catalog: ContentCatalog): EventDefinition | undefined {
  if (state.currentEventId === null) return undefined;
  return catalog.events.find(({ id }) => id === state.currentEventId)
    ?? materializeMarketEvent(state, catalog, state.currentEventId)
    ?? materializeNavigationEvent(state, catalog, state.currentEventId)
    ?? materializeReverseMountainSystemEvent(state.currentEventId);
}
