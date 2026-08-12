import type { ContentCatalog, EventDefinition, MajorNarrativeTrackDefinition } from '../content/schema';
type ScheduledDefinition = Extract<EventDefinition, { kind: 'scheduled' }>;
type NormalDefinition = Extract<EventDefinition, { kind: 'normal' }>;
import type { GameState, ScheduledEvent } from '../model/schema';
import { evaluateCondition } from './conditions';
import { nextRandom } from './rng';
import { materializeEventCast } from './npcNames';
import { needsMonthlyNavigationDecision } from './navigation';
import { finalizePendingSlot } from './time';
import { findDockableAccess } from './locations';
import { countFallbackStreak } from './maritime';

export const FALLBACK_EVENT_IDS = ['dead_end_on_land', 'dead_end_at_sea'] as const;
const SHIP_MARKET_PURCHASE_EVENT_ID = 'active_port_trade_01_ship_purchase_offer';

interface DueMajorSelection {
  candidates: NormalDefinition[];
  overdue: boolean;
}

export function selectNextEvent(state: GameState, catalog: ContentCatalog): GameState {
  if (state.careerStatus !== 'active') return { ...state, currentEventId: null };

  const critical = findCriticalEvent(state, catalog.events);
  if (critical) return selectEvent(state, catalog, critical);

  if (needsMonthlyNavigationDecision(state)) return { ...state, currentEventId: null };

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

  if (state.shipMarketArrivalPending) {
    if (isArrivalMarketHubAvailable(state, catalog)) return { ...state, currentEventId: null };
    state = { ...state, shipMarketArrivalPending: false };
  }

  const major = findDueMajorNarrativeCandidates(state, catalog);
  if (major?.overdue) return selectUniformNormal(state, catalog, state.scheduledEvents, major.candidates);

  const scheduled = selectScheduledEvent(state, catalog);
  if (scheduled.event) return selectEvent({ ...state, scheduledEvents: scheduled.entries }, catalog, scheduled.event);

  if (major) return selectUniformNormal(state, catalog, scheduled.entries, major.candidates);

  const candidates = catalog.events.filter((event): event is NormalDefinition =>
    event.kind === 'normal'
      && event.majorTrack === undefined
      && event.id !== SHIP_MARKET_PURCHASE_EVENT_ID
      && !FALLBACK_EVENT_IDS.includes(event.id as typeof FALLBACK_EVENT_IDS[number])
      && isNormalOccurrenceEligible(event, state)
      && isEligible(event, state, catalog),
  );
  if (candidates.length === 0) {
    if (state.careerPhase !== 'active') return { ...state, scheduledEvents: scheduled.entries, currentEventId: null };
    const fallbackId = state.travelState === 'at_sea' ? 'dead_end_at_sea' : 'dead_end_on_land';
    const fallback = catalog.events.find((event) => event.id === fallbackId && event.kind === 'normal');
    const accessible = state.travelState === 'at_sea' || findDockableAccess(catalog, state.locationId) !== undefined;
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
  const variants = catalog.events.filter((event): event is NormalDefinition =>
    event.kind === 'normal'
      && event.majorTrack?.trackId === selected.track.id
      && event.majorTrack.chapterId === selected.chapter.id
      && isNormalOccurrenceEligible(event, state)
      && isEligible(event, state, catalog),
  );
  const specialized = variants.filter((event) => event.majorTrack?.fallback !== true);
  const fallbacks = variants.filter((event) => event.majorTrack?.fallback === true);
  const candidates = specialized.length > 0 ? specialized : fallbacks;
  if (candidates.length === 0) return undefined;
  return { candidates, overdue: state.ageMonths > selected.chapter.dueAgeMonths };
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
  return catalog.events.find(({ id }) => id === state.currentEventId);
}
