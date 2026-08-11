import type { ContentCatalog, EventDefinition } from '../content/schema';
type ScheduledDefinition = Extract<EventDefinition, { kind: 'scheduled' }>;
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
    state = { ...state, shipMarketArrivalPending: false };
    const location = catalog.locations.find(({ id }) => id === state.locationId);
    const purchase = catalog.events.find((event) => event.id === SHIP_MARKET_PURCHASE_EVENT_ID && event.kind === 'normal');
    if (
      state.careerPhase === 'active'
      && state.ship === null
      && state.travelState === 'on_land'
      && location !== undefined
      && location.shipMarket !== 'none'
      && purchase !== undefined
      && isEligible(purchase, state, catalog)
    ) return selectEvent(state, catalog, purchase);
  }

  const scheduled = selectScheduledEvent(state, catalog);
  if (scheduled.event) return selectEvent({ ...state, scheduledEvents: scheduled.entries }, catalog, scheduled.event);

  const candidates = catalog.events.filter((event) =>
    event.kind === 'normal'
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
  const openingCandidates =
    selectEarlyChildhoodOpeningCandidates(
      state,
      catalog,
      candidates,
    );

  const selectionCandidates =
    openingCandidates.length > 0
      ? openingCandidates
      : candidates;

  const normalPool = shouldGuaranteeLifetimeThread(state, catalog)
    ? selectionCandidates.filter((event) =>
        event.kind === 'normal' &&
        event.lifetimeThreadSeed === true,
      )
    : selectionCandidates;

  return selectUniformNormal(
    state,
    catalog,
    scheduled.entries,
    normalPool.length > 0
      ? normalPool
      : selectionCandidates,
  );
}

const EARLY_CHILDHOOD_MIN_MONTHS = 12;
const EARLY_CHILDHOOD_MAX_MONTHS = 71;

function metadataEventHistory(
  state: GameState,
  catalog: ContentCatalog,
): EventDefinition[] {
  const byId = new Map(
    catalog.events.map(
      (event) => [
        event.id,
        event,
      ] as const,
    ),
  );

  return state.history
    .map(({ eventId }) =>
      byId.get(eventId),
    )
    .filter(
      (
        event,
      ): event is EventDefinition =>
        event !== undefined &&
        event.narrativeFamily !== undefined,
    );
}

function selectEarlyChildhoodOpeningCandidates(
  state: GameState,
  catalog: ContentCatalog,
  candidates: EventDefinition[],
): EventDefinition[] {
  if (
    state.careerPhase !== 'childhood' ||
    state.ageMonths <
      EARLY_CHILDHOOD_MIN_MONTHS ||
    state.ageMonths >
      EARLY_CHILDHOOD_MAX_MONTHS
  ) {
    return [];
  }

  const opening =
    candidates.filter(
      (event) =>
        event.kind === 'normal' &&
        event.openingRole !== undefined,
    );

  if (opening.length === 0) {
    return [];
  }

  const history =
    metadataEventHistory(
      state,
      catalog,
    );

  const playedRoles =
    new Set(
      history.map(
        ({ openingRole }) =>
          openingRole,
      ),
    );

  const friendIntroduced =
    playedRoles.has(
      'friend_intro',
    );

  const rivalIntroduced =
    playedRoles.has(
      'rival_intro',
    );

  const originEchoCount =
    history.filter(
      ({ openingRole }) =>
        openingRole ===
        'origin_echo',
    ).length;

  let pool =
    opening.filter((event) => {
      if (
        event.openingRole ===
          'friend_intro' &&
        friendIntroduced
      ) {
        return false;
      }

      if (
        event.openingRole ===
          'rival_intro' &&
        rivalIntroduced
      ) {
        return false;
      }

      if (
        event.openingRole ===
          'friend_callback' &&
        !friendIntroduced
      ) {
        return false;
      }

      return true;
    });

  const originEchoes =
    pool.filter(
      ({ openingRole }) =>
        openingRole ===
        'origin_echo',
    );

  // The first lived Childhood scene must still visibly come from Origins.
  if (
    state.ageMonths < 24 &&
    originEchoes.length > 0
  ) {
    return originEchoes;
  }

  // By the age-three checkpoint, the run must have actually met
  // the persistent friend rather than merely seeing a generated name.
  if (
    state.ageMonths >= 36 &&
    !friendIntroduced
  ) {
    const introductions =
      pool.filter(
        ({ openingRole }) =>
          openingRole ===
          'friend_intro',
      );

    if (
      introductions.length > 0
    ) {
      return introductions;
    }
  }

  // D1.9 target: at least two directly Origins-caused scenes by age four.
  if (
    state.ageMonths >= 48 &&
    originEchoCount < 2 &&
    originEchoes.length > 0
  ) {
    return originEchoes;
  }

  const recentFamilies =
    history
      .map(
        ({ narrativeFamily }) =>
          narrativeFamily,
      )
      .filter(
        (
          family,
        ): family is NonNullable<
          EventDefinition[
            'narrativeFamily'
          ]
        > =>
          family !== undefined,
      );

  const lastTwo =
    recentFamilies.slice(-2);

  if (
    lastTwo.length === 2 &&
    lastTwo.every(
      (family) =>
        family === 'child_peer',
    )
  ) {
    const nonPeer =
      pool.filter(
        ({ narrativeFamily }) =>
          narrativeFamily !==
          'child_peer',
      );

    if (nonPeer.length > 0) {
      pool = nonPeer;
    }
  }

  const lastFamily =
    recentFamilies.at(-1);

  if (lastFamily) {
    const alternatives =
      pool.filter(
        ({ narrativeFamily }) =>
          narrativeFamily !==
          lastFamily,
      );

    if (
      alternatives.length > 0
    ) {
      pool = alternatives;
    }
  }

  return pool;
}

function selectEvent(state: GameState, catalog: ContentCatalog, event: EventDefinition): GameState {
  return materializeEventCast({ ...state, currentEventId: event.id }, catalog, event);
}

export function hasStartedLifetimeThread(state: GameState, catalog: ContentCatalog): boolean {
  const lifetimeSeedIds = new Set(catalog.events
    .filter((event) => event.kind === 'normal' && event.lifetimeThreadSeed === true)
    .map(({ id }) => id));
  return state.history.some(({ eventId }) => lifetimeSeedIds.has(eventId));
}

function shouldGuaranteeLifetimeThread(state: GameState, catalog: ContentCatalog): boolean {
  return state.careerPhase === 'childhood' && state.ageMonths >= 120 && !hasStartedLifetimeThread(state, catalog);
}

function selectUniformNormal(state: GameState, catalog: ContentCatalog, scheduledEvents: ScheduledEvent[], candidates: EventDefinition[]): GameState {
  if (candidates.length === 1) return selectEvent({ ...state, scheduledEvents }, catalog, candidates[0]);
  const random = nextRandom(state.rngState);
  const selected = candidates[Math.floor(random.value * candidates.length)];
  return selectEvent({
    ...state,
    scheduledEvents,
    rngState: random.nextState,
  }, catalog, selected);
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

export function isNormalOccurrenceEligible(event: Extract<EventDefinition, { kind: 'normal' }>, state: GameState): boolean {
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
