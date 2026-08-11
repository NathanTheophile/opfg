import type { ContentCatalog, EventDefinition } from '../content/schema';
type ScheduledDefinition = Extract<EventDefinition, { kind: 'scheduled' }>;
import type { GameState, ScheduledEvent } from '../model/schema';
import { evaluateCondition } from './conditions';
import { nextRandom } from './rng';
import { needsMonthlyNavigationDecision } from './navigation';
import { finalizePendingSlot } from './time';
import { findDockableAccess } from './locations';
import { countFallbackStreak } from './maritime';

export const FALLBACK_EVENT_IDS = ['dead_end_on_land', 'dead_end_at_sea'] as const;
const SHIP_MARKET_PURCHASE_EVENT_ID = 'active_port_trade_01_ship_purchase_offer';

export function selectNextEvent(state: GameState, catalog: ContentCatalog): GameState {
  if (state.careerStatus !== 'active') return { ...state, currentEventId: null };

  const critical = findCriticalEvent(state, catalog.events);
  if (critical) return { ...state, currentEventId: critical.id };

  if (needsMonthlyNavigationDecision(state)) return { ...state, currentEventId: null };

  if (state.immediateEventQueue.length > 0) {
    const immediateId = state.immediateEventQueue[0];
    const immediate = catalog.events.find((event) => event.id === immediateId && event.kind === 'immediate');
    if (!immediate) throw new Error(`Pending Immediate Event "${immediateId}" is missing or is not immediate.`);
    if (!isEligible(immediate, state, catalog)) {
      const skipped = { ...state, immediateEventQueue: state.immediateEventQueue.slice(1) };
      return selectNextEvent(skipped.immediateEventQueue.length === 0 ? finalizePendingSlot(skipped) : skipped, catalog);
    }
    return { ...state, currentEventId: immediate.id };
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
    ) return { ...state, currentEventId: purchase.id };
  }

  const scheduled = selectScheduledEvent(state, catalog);
  if (scheduled.event) return { ...state, scheduledEvents: scheduled.entries, currentEventId: scheduled.event.id };

  const played = new Set(state.history.map(({ eventId }) => eventId));
  const candidates = catalog.events.filter((event) =>
    event.kind === 'normal'
      && event.id !== SHIP_MARKET_PURCHASE_EVENT_ID
      && !FALLBACK_EVENT_IDS.includes(event.id as typeof FALLBACK_EVENT_IDS[number])
      && !played.has(event.id)
      && isEligible(event, state, catalog),
  );
  if (candidates.length === 0) {
    if (state.careerPhase !== 'active') return { ...state, scheduledEvents: scheduled.entries, currentEventId: null };
    const fallbackId = state.travelState === 'at_sea' ? 'dead_end_at_sea' : 'dead_end_on_land';
    const fallback = catalog.events.find((event) => event.id === fallbackId && event.kind === 'normal');
    const accessible = state.travelState === 'at_sea' || findDockableAccess(catalog, state.locationId) !== undefined;
    return { ...state, scheduledEvents: scheduled.entries, currentEventId: fallback && accessible ? fallback.id : null };
  }
  const normalPool = shouldGuaranteeLifetimeThread(state, catalog)
    ? candidates.filter((event) => event.kind === 'normal' && event.lifetimeThreadSeed === true)
    : candidates;
  return selectUniformNormal(state, scheduled.entries, normalPool.length > 0 ? normalPool : candidates);
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

function selectUniformNormal(state: GameState, scheduledEvents: ScheduledEvent[], candidates: EventDefinition[]): GameState {
  if (candidates.length === 1) return { ...state, scheduledEvents, currentEventId: candidates[0].id };
  const random = nextRandom(state.rngState);
  return {
    ...state,
    scheduledEvents,
    rngState: random.nextState,
    currentEventId: candidates[Math.floor(random.value * candidates.length)].id,
  };
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
  return critical.find(({ trigger }) => trigger.type === 'fallbackStreakAtLeast' && countFallbackStreak(state, events) >= trigger.value);
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
