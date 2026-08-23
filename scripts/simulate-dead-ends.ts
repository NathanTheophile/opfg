import { performance } from 'node:perf_hooks';
import type { Condition, ContentCatalog, EventDefinition } from '../src/game/content/schema';
import type { GameState } from '../src/game/model/schema';
import { evaluateCondition } from '../src/game/engine/conditions';
import { FALLBACK_EVENT_IDS, isNormalOccurrenceEligible } from '../src/game/engine/events';
import { createDepartureSystemEvent } from '../src/game/engine/navigation';
import { findDockableAccess } from '../src/game/engine/locations';
import { isParadiseRouteStartEventId, ordinaryDepartureHasDestination } from '../src/game/engine/maritime';
import { countCurrentCrew } from '../src/game/engine/ship';
import { simulateObservedRun } from '../src/game/simulation/simulateObservedRun';
import { minmaxSimulationPolicy } from '../src/game/simulation/minmaxSimulationPolicy';
import {
  inc,
  loadValidatedCatalog,
  parseSpecializedArgs,
  pct,
  quantile,
  topEntries,
  writeJson,
} from './simulation-specialized/shared';

type NormalEvent = Extract<EventDefinition, { kind: 'normal' }>;
type Counter = Record<string, number>;
type OccurrenceReason = 'alreadyPlayedOneShot' | 'maxOccurrencesReached' | 'replayCooldown';
type Category =
  | 'phase' | 'age' | 'travel' | 'location' | 'sea' | 'history'
  | 'career' | 'ship' | 'crew' | 'economy' | 'inventory'
  | 'trait' | 'npc' | 'powers' | 'other';

type FailedLeaf = {
  eventId: string;
  conditionType: string;
  conditionPath: string;
  summary: string;
  category: Category;
};

type NearMiss = {
  eventId: string;
  failedLeafCount: number;
  failedCategories: Category[];
  failedLeaves: FailedLeaf[];
};

type Diagnostic = {
  seed: number;
  ageMonths: number;
  ageYears: number;
  careerPhase: GameState['careerPhase'];
  careerAffiliationId: string;
  locationId: string;
  seaId: string | null;
  travelState: GameState['travelState'];
  isLeader: boolean;
  hasShip: boolean;
  shipId: string | null;
  berries: number;
  crewSize: number;
  historyLength: number;
  normalHistoryLength: number;
  previousRootEventId: string | null;
  previousRootKind: string | null;
  dockableAccess: { exists: boolean; locationId: string | null };
  departure: {
    normalAvailable: boolean;
    forcedExhaustionAvailable: boolean;
    hasOrdinaryDestination: boolean;
  };
  fallback: {
    expectedId: string;
    definitionExists: boolean;
    accessible: boolean;
  };
  pool: {
    normalEventsTotal: number;
    ordinaryNonMajorRoots: number;
    ordinaryNonFallbackRoots: number;
    ordinaryNonRouteStartRoots: number;
    occurrenceEligible: number;
    eligibilityEligible: number;
    fullyEligible: number;
    alreadyPlayedOneShot: number;
    maxOccurrencesReached: number;
    cooldownBlocked: number;
    eligibilityBlocked: number;
    diagnosticInvariantViolation: boolean;
  };
  occurrenceRejections: Record<OccurrenceReason, number>;
  failedConditionCategories: Counter;
  failedConditionTypes: Counter;
  topNearMisses: NearMiss[];
  consumedOneShotExamples: string[];
  primaryCause: string;
  underlyingStarvationCause: string;
  recentMeaningfulRoots: Array<{ eventId: string; kind: string; ageMonths: number }>;
};

const args = parseSpecializedArgs(process.argv.slice(2), 'reports/sim-dead-ends.json');
const catalog = loadValidatedCatalog();
const eventById = new Map(catalog.events.map((event) => [event.id, event] as const));
const fallbackIds = new Set<string>(FALLBACK_EVENT_IDS);
const startedAt = performance.now();

const diagnostics: Diagnostic[] = [];
const terminationReasons: Counter = {};
const errors: Counter = {};

for (let index = 0; index < args.runs; index += 1) {
  const seed = (args.seed + index) >>> 0;
  const result = simulateObservedRun({
    seed,
    catalog,
    maxResolvedEvents: args.maxEvents,
    policy: minmaxSimulationPolicy,
  });

  inc(terminationReasons, result.terminationReason);
  if (result.error) inc(errors, result.error);
  if (result.terminationReason !== 'deadEnd') continue;

  diagnostics.push(diagnoseDeadEnd(seed, result.finalState, result.resolvedEvents, catalog));
}

const primaryCauses: Counter = {};
const underlyingCauses: Counter = {};
const locations: Counter = {};
const seas: Counter = {};
const ageBands: Counter = {};
const exactYears: Counter = {};
const previousEvents: Counter = {};
const occurrenceRejections: Counter = {};
const failedConditionCategories: Counter = {};
const failedConditionTypes: Counter = {};
const nearMissEvents: Counter = {};
const ageYears: number[] = [];

let deadEndsOnLand = 0;
let deadEndsAtSea = 0;
let deadEndsWithShip = 0;
let deadEndsWithoutShip = 0;
let deadEndsWithDockableAccess = 0;
let deadEndsWithoutDockableAccess = 0;
let forcedDepartureAvailable = 0;
let forcedDepartureUnavailable = 0;
let expectedFallbackPresent = 0;
let expectedFallbackMissing = 0;

for (const diagnostic of diagnostics) {
  ageYears.push(diagnostic.ageYears);
  inc(primaryCauses, diagnostic.primaryCause);
  inc(underlyingCauses, diagnostic.underlyingStarvationCause);
  inc(locations, diagnostic.locationId);
  inc(seas, diagnostic.seaId ?? 'unknown');
  inc(ageBands, ageBand(diagnostic.ageMonths));
  inc(exactYears, String(Math.floor(diagnostic.ageMonths / 12)));
  if (diagnostic.previousRootEventId) inc(previousEvents, diagnostic.previousRootEventId);

  diagnostic.travelState === 'on_land' ? deadEndsOnLand++ : deadEndsAtSea++;
  diagnostic.hasShip ? deadEndsWithShip++ : deadEndsWithoutShip++;
  diagnostic.dockableAccess.exists ? deadEndsWithDockableAccess++ : deadEndsWithoutDockableAccess++;
  diagnostic.departure.forcedExhaustionAvailable ? forcedDepartureAvailable++ : forcedDepartureUnavailable++;
  diagnostic.fallback.definitionExists ? expectedFallbackPresent++ : expectedFallbackMissing++;

  for (const [key, value] of Object.entries(diagnostic.occurrenceRejections)) inc(occurrenceRejections, key, value);
  for (const [key, value] of Object.entries(diagnostic.failedConditionCategories)) inc(failedConditionCategories, key, value);
  for (const [key, value] of Object.entries(diagnostic.failedConditionTypes)) inc(failedConditionTypes, key, value);
  for (const miss of diagnostic.topNearMisses) inc(nearMissEvents, miss.eventId);
}

const genericLandAudit = auditGenericLand(catalog);
const report = {
  config: { ...args, policy: minmaxSimulationPolicy.id },
  elapsedMs: performance.now() - startedAt,
  summary: {
    runs: args.runs,
    careerEnded: terminationReasons.careerEnded ?? 0,
    deadEnds: diagnostics.length,
    simulationErrors: terminationReasons.simulationError ?? 0,
    safetyLimits: terminationReasons.safetyLimit ?? 0,
    deadEndRate: pct(diagnostics.length, args.runs),
    deadEndsOnLand,
    deadEndsAtSea,
    deadEndsWithShip,
    deadEndsWithoutShip,
    deadEndsWithDockableAccess,
    deadEndsWithoutDockableAccess,
    forcedDepartureAvailableAtDeadEnd: forcedDepartureAvailable,
    forcedDepartureUnavailableAtDeadEnd: forcedDepartureUnavailable,
    expectedFallbackPresent,
    expectedFallbackMissing,
    p10DeadEndAgeYears: quantile(ageYears, 0.1),
    medianDeadEndAgeYears: quantile(ageYears, 0.5),
    p90DeadEndAgeYears: quantile(ageYears, 0.9),
  },
  terminationReasons,
  errors: topEntries(errors, 25),
  starvationCauses: {
    primary: topEntries(primaryCauses, 20),
    underlying: topEntries(underlyingCauses, 20),
  },
  ageBands,
  exactYears,
  locations: topEntries(locations, 50),
  seas: topEntries(seas, 20),
  previousEvents: topEntries(previousEvents, 30),
  occurrenceRejections: topEntries(occurrenceRejections, 20),
  eligibilityRejections: diagnostics.reduce((sum, d) => sum + d.pool.eligibilityBlocked, 0),
  failedConditionCategories: topEntries(failedConditionCategories, 30),
  failedConditionTypes: topEntries(failedConditionTypes, 50),
  nearMissEvents: topEntries(nearMissEvents, 30),
  genericLandAudit,
  representativeDeadEnds: representativeCases(diagnostics),
  deadEnds: diagnostics,
};

printSummary(report.summary, underlyingCauses, occurrenceRejections, failedConditionCategories, failedConditionTypes, locations, genericLandAudit);
writeJson(args.jsonPath, report);

function diagnoseDeadEnd(
  seed: number,
  state: GameState,
  resolvedEvents: Array<{ eventId: string; kind: EventDefinition['kind']; ageMonths: number }>,
  content: ContentCatalog,
): Diagnostic {
  const normals = content.events.filter((event): event is NormalEvent => event.kind === 'normal');
  const nonMajor = normals.filter((event) => event.majorTrack === undefined);
  const nonFallback = nonMajor.filter((event) => !fallbackIds.has(event.id));
  const ordinary = nonFallback.filter((event) => !isParadiseRouteStartEventId(event.id));

  const occurrence: Record<OccurrenceReason, number> = {
    alreadyPlayedOneShot: 0,
    maxOccurrencesReached: 0,
    replayCooldown: 0,
  };

  const occurrenceEligible: NormalEvent[] = [];
  const fullyEligible: NormalEvent[] = [];
  const failedLeaves = new Map<string, FailedLeaf[]>();
  const failedCategories: Counter = {};
  const failedTypes: Counter = {};
  const consumedOneShotExamples: string[] = [];

  for (const event of ordinary) {
    const occurrenceFailure = classifyOccurrenceFailure(event, state);
    if (occurrenceFailure) {
      occurrence[occurrenceFailure] += 1;
      if (occurrenceFailure === 'alreadyPlayedOneShot' && consumedOneShotExamples.length < 30) {
        consumedOneShotExamples.push(event.id);
      }
      continue;
    }

    occurrenceEligible.push(event);
    if (event.eligibility === undefined || evaluateCondition(event.eligibility, state, content)) {
      fullyEligible.push(event);
      continue;
    }

    const leaves = traceFailure(event.id, event.eligibility, state, content);
    failedLeaves.set(event.id, leaves);
    for (const leaf of leaves) {
      inc(failedCategories, leaf.category);
      inc(failedTypes, leaf.conditionType);
    }
  }

  const nearMisses: NearMiss[] = occurrenceEligible
    .filter((event) => !fullyEligible.includes(event))
    .map((event) => {
      const leaves = failedLeaves.get(event.id) ?? [];
      return {
        eventId: event.id,
        failedLeafCount: leaves.length,
        failedCategories: [...new Set(leaves.map((leaf) => leaf.category))].sort(),
        failedLeaves: leaves,
      };
    })
    .sort((a, b) => a.failedLeafCount - b.failedLeafCount || a.eventId.localeCompare(b.eventId))
    .slice(0, 15);

  const dock = findDockableAccess(content, state.locationId);
  const forcedDeparture = createDepartureSystemEvent(state, content, true);
  const expectedFallbackId = state.travelState === 'at_sea' ? 'dead_end_at_sea' : 'dead_end_on_land';
  const fallback = content.events.find((event) => event.id === expectedFallbackId && event.kind === 'normal');
  const recentMeaningful = resolvedEvents
    .filter(({ kind }) => kind === 'normal' || kind === 'scheduled')
    .slice(-10)
    .map(({ eventId, kind, ageMonths }) => ({ eventId, kind, ageMonths }));
  const previous = recentMeaningful.at(-1);

  const pool = {
    normalEventsTotal: normals.length,
    ordinaryNonMajorRoots: nonMajor.length,
    ordinaryNonFallbackRoots: nonFallback.length,
    ordinaryNonRouteStartRoots: ordinary.length,
    occurrenceEligible: occurrenceEligible.length,
    eligibilityEligible: fullyEligible.length,
    fullyEligible: fullyEligible.length,
    alreadyPlayedOneShot: occurrence.alreadyPlayedOneShot,
    maxOccurrencesReached: occurrence.maxOccurrencesReached,
    cooldownBlocked: occurrence.replayCooldown,
    eligibilityBlocked: occurrenceEligible.length - fullyEligible.length,
    diagnosticInvariantViolation: fullyEligible.length !== 0,
  };

  const underlying = classifyUnderlying(pool, failedCategories, state);
  const primary = fallback === undefined && pool.fullyEligible === 0
    ? 'FALLBACK_DEFINITION_MISSING'
    : underlying;

  return {
    seed,
    ageMonths: state.ageMonths,
    ageYears: state.ageMonths / 12,
    careerPhase: state.careerPhase,
    careerAffiliationId: state.player.career.affiliationId,
    locationId: state.locationId,
    seaId: content.locations.find(({ id }) => id === state.locationId)?.seaId ?? null,
    travelState: state.travelState,
    isLeader: state.isLeader,
    hasShip: state.ship !== null,
    shipId: state.ship?.shipId ?? null,
    berries: state.berries,
    crewSize: countCurrentCrew(state),
    historyLength: state.history.length,
    normalHistoryLength: state.history.filter(({ eventId }) => eventById.get(eventId)?.kind === 'normal').length,
    previousRootEventId: previous?.eventId ?? null,
    previousRootKind: previous?.kind ?? null,
    dockableAccess: { exists: dock !== undefined, locationId: dock?.id ?? null },
    departure: {
      normalAvailable: createDepartureSystemEvent(state, content, false) !== null,
      forcedExhaustionAvailable: forcedDeparture !== null,
      hasOrdinaryDestination: ordinaryDepartureHasDestination(state, content),
    },
    fallback: {
      expectedId: expectedFallbackId,
      definitionExists: fallback !== undefined,
      accessible: state.travelState === 'at_sea' || dock !== undefined,
    },
    pool,
    occurrenceRejections: occurrence,
    failedConditionCategories: failedCategories,
    failedConditionTypes: failedTypes,
    topNearMisses: nearMisses,
    consumedOneShotExamples,
    primaryCause: primary,
    underlyingStarvationCause: underlying,
    recentMeaningfulRoots: recentMeaningful,
  };
}

function classifyOccurrenceFailure(event: NormalEvent, state: GameState): OccurrenceReason | null {
  if (isNormalOccurrenceEligible(event, state)) return null;
  const occurrences = state.history.filter(({ eventId }) => eventId === event.id);
  if (event.replay === undefined) return 'alreadyPlayedOneShot';
  if (event.replay.maxOccurrences !== undefined && occurrences.length >= event.replay.maxOccurrences) {
    return 'maxOccurrencesReached';
  }
  return 'replayCooldown';
}

function traceFailure(
  eventId: string,
  condition: Condition,
  state: GameState,
  content: ContentCatalog,
  path = 'eligibility',
): FailedLeaf[] {
  if (evaluateCondition(condition, state, content)) return [];

  if (condition.type === 'all') {
    return condition.conditions.flatMap((child, index) =>
      evaluateCondition(child, state, content)
        ? []
        : traceFailure(eventId, child, state, content, `${path}.all[${index}]`));
  }

  if (condition.type === 'any') {
    return condition.conditions.flatMap((child, index) =>
      traceFailure(eventId, child, state, content, `${path}.any[${index}]`));
  }

  if (condition.type === 'not') {
    return [{
      eventId,
      conditionType: 'not',
      conditionPath: `${path}.not`,
      summary: `not(${JSON.stringify(condition.condition)}) failed because inner condition is true`,
      category: categoryFor(condition.condition.type),
    }];
  }

  return [{
    eventId,
    conditionType: condition.type,
    conditionPath: path,
    summary: summarize(condition, state, content),
    category: categoryFor(condition.type),
  }];
}

function summarize(condition: Condition, state: GameState, content: ContentCatalog): string {
  const raw = JSON.stringify(condition);
  switch (condition.type) {
    case 'careerPhaseIs': return `${raw} actual=${state.careerPhase}`;
    case 'isOnLand':
    case 'isAtSea': return `${raw} actual=${state.travelState}`;
    case 'locationIs':
    case 'locationWithin': return `${raw} actual=${state.locationId}`;
    case 'currentSeaIs': return `${raw} actual=${content.locations.find(({ id }) => id === state.locationId)?.seaId ?? 'unknown'}`;
    case 'berriesAtLeast': return `${raw} actual=${state.berries}`;
    case 'hasShip': return `${raw} actual=${state.ship !== null}`;
    case 'isLeader': return `${raw} actual=${state.isLeader}`;
    case 'careerAffiliationIs': return `${raw} actual=${state.player.career.affiliationId}`;
    case 'reputationAtLeast':
    case 'reputationAtMost': return `${raw} actual=${state.player.career.reputation}`;
    case 'bountyAtLeast': return `${raw} actual=${state.player.career.bounty}`;
    case 'careerRankIs':
    case 'careerRankAtLeast': return `${raw} actual=${state.player.career.rankId ?? 'null'}`;
    case 'careerTitleIs': return `${raw} actual=${state.player.career.titleId ?? 'null'}`;
    case 'ageAtLeastMonths':
    case 'ageAtMostMonths': return `${raw} actual=${state.ageMonths}`;
    case 'hasPlayed': return `${raw} actual=${state.history.some(({ eventId }) => eventId === condition.eventId)}`;
    case 'hasChosen': return `${raw} actual=${state.history.some(({ eventId, choiceId }) => eventId === condition.eventId && choiceId === condition.choiceId)}`;
    case 'hasOutcome': return `${raw} actual=${state.history.some(({ eventId, outcomeId }) => eventId === condition.eventId && outcomeId === condition.outcomeId)}`;
    case 'hasCrew': return `${raw} actual=${countCurrentCrew(state) > 0}`;
    case 'crewSizeAtLeast': return `${raw} actual=${countCurrentCrew(state)}`;
    case 'hasTrait': return `${raw} actual=${state.player.traits.includes(condition.traitId)}`;
    case 'hasFlag': return `${raw} actual=${state.flags.includes(condition.flagId)}`;
    case 'hasDevilFruit': return `${raw} actual=${state.player.powers.devilFruitId !== null}`;
    case 'devilFruitIs': return `${raw} actual=${state.player.powers.devilFruitId ?? 'null'}`;
    case 'hakiAtLeast': return `${raw} actual=${state.player.powers.haki[condition.hakiType]}`;
    case 'hakiIsAwakened': return `${raw} actual=${state.player.powers.haki[condition.hakiType] > 0}`;
    default: return raw;
  }
}

function categoryFor(type: Condition['type']): Category {
  if (type === 'careerPhaseIs') return 'phase';
  if (type === 'ageAtLeastMonths' || type === 'ageAtMostMonths') return 'age';
  if (type === 'isOnLand' || type === 'isAtSea') return 'travel';
  if (type === 'locationIs' || type === 'locationWithin' || type === 'locationHasTag' || type === 'locationHasService') return 'location';
  if (type === 'currentSeaIs' || type === 'sameIslandPortExists' || type === 'currentSeaHasPort') return 'sea';
  if (type === 'hasPlayed' || type === 'hasChosen' || type === 'hasOutcome') return 'history';
  if (type === 'careerAffiliationIs' || type === 'reputationAtLeast' || type === 'reputationAtMost' || type === 'bountyAtLeast' || type === 'careerRankIs' || type === 'careerRankAtLeast' || type === 'careerTitleIs') return 'career';
  if (type === 'hasShip' || type === 'shipIs' || type === 'shipHealthAtLeast' || type === 'shipHealthAtMost' || type === 'shipCrewCapacityAtLeast' || type === 'shipCargoSpaceAtLeast' || type === 'canAcquireShip' || type === 'canSellShip' || type === 'isLeader') return 'ship';
  if (type === 'hasCrew' || type === 'crewSizeAtLeast' || type === 'hasCrewRole' || type === 'canRecruitNpc') return 'crew';
  if (type === 'berriesAtLeast' || type === 'canBuyItem' || type === 'canSellItem') return 'economy';
  if (type === 'hasItem' || type === 'itemQuantityAtLeast' || type === 'inventoryFreeSlotsAtLeast' || type === 'hasEquipped' || type === 'hasEquippedWeapon' || type === 'activeLogPoseIs' || type === 'hasActiveCompanion' || type === 'activeCompanionIs') return 'inventory';
  if (type === 'hasTrait') return 'trait';
  if (type.startsWith('npc') || type === 'singleParentSexIs' || type === 'originParentPresent') return 'npc';
  if (type.includes('DevilFruit') || type.includes('Haki') || type === 'hasDevilFruit' || type === 'canConsumeDevilFruit' || type === 'devilFruitIs' || type === 'devilFruitTypeIs' || type === 'devilFruitHasTag' || type === 'devilFruitAwakeningAtLeast' || type === 'devilFruitIsAwakened' || type === 'hakiAtLeast' || type === 'hakiIsAwakened' || type === 'hakiSourceTotalAtLeast') return 'powers';
  return 'other';
}

function classifyUnderlying(pool: Diagnostic['pool'], categories: Counter, state: GameState): string {
  if (state.travelState === 'on_land' && state.ship === null && pool.fullyEligible === 0) {
    const consumed = pool.alreadyPlayedOneShot + pool.maxOccurrencesReached + pool.cooldownBlocked;
    if (consumed / Math.max(1, pool.ordinaryNonRouteStartRoots) < 0.5) return 'SHIPLESS_MOBILITY_STARVATION';
  }

  const consumed = pool.alreadyPlayedOneShot + pool.maxOccurrencesReached + pool.cooldownBlocked;
  if (consumed / Math.max(1, pool.ordinaryNonRouteStartRoots) >= 0.5) return 'OCCURRENCE_EXHAUSTION';

  const top = Object.entries(categories).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
  if (top === 'phase' || top === 'age' || top === 'travel' || top === 'location' || top === 'sea' || top === 'history') return 'CONTEXT_GATING';
  if (top === 'career') return 'CAREER_GATING';
  if (top === 'ship' || top === 'crew' || top === 'economy' || top === 'inventory') return 'RESOURCE_GATING';
  return 'MIXED';
}

function auditGenericLand(content: ContentCatalog) {
  const roots = content.events.filter((event): event is NormalEvent =>
    event.kind === 'normal' && event.id.startsWith('active_generic_land_'));
  const missingActiveGate: string[] = [];
  const missingLandGate: string[] = [];
  const missingBoth: string[] = [];

  for (const event of roots) {
    const active = containsCondition(event.eligibility, (c) => c.type === 'careerPhaseIs' && c.phase === 'active');
    const land = containsCondition(event.eligibility, (c) => c.type === 'isOnLand');
    if (!active) missingActiveGate.push(event.id);
    if (!land) missingLandGate.push(event.id);
    if (!active && !land) missingBoth.push(event.id);
  }

  return {
    roots: roots.length,
    missingActiveGate: missingActiveGate.length,
    missingLandGate: missingLandGate.length,
    missingBoth: missingBoth.length,
    eventIds: { missingActiveGate, missingLandGate, missingBoth },
  };
}

function containsCondition(condition: Condition | undefined, predicate: (condition: Condition) => boolean): boolean {
  if (!condition) return false;
  if (predicate(condition)) return true;
  if (condition.type === 'all' || condition.type === 'any') return condition.conditions.some((child) => containsCondition(child, predicate));
  if (condition.type === 'not') return containsCondition(condition.condition, predicate);
  return false;
}

function representativeCases(values: Diagnostic[]): Diagnostic[] {
  if (values.length === 0) return [];
  const sorted = [...values].sort((a, b) => a.ageMonths - b.ageMonths || a.seed - b.seed);
  const candidates: Diagnostic[] = [
    sorted[0],
    sorted[Math.floor((sorted.length - 1) * 0.5)],
    sorted.at(-1)!,
    values.find((value) => !value.hasShip) ?? sorted[0],
    values.find((value) => value.hasShip) ?? sorted[0],
    [...values].sort((a, b) => b.pool.alreadyPlayedOneShot - a.pool.alreadyPlayedOneShot || a.seed - b.seed)[0],
    [...values].sort((a, b) => b.pool.eligibilityBlocked - a.pool.eligibilityBlocked || a.seed - b.seed)[0],
  ];

  const topLocations = topEntries(values.reduce<Counter>((acc, value) => {
    inc(acc, value.locationId);
    return acc;
  }, {}), 3).map(({ key }) => key);

  for (const location of topLocations) {
    const value = values.find((entry) => entry.locationId === location);
    if (value) candidates.push(value);
  }

  const seen = new Set<number>();
  return candidates.filter((value) => !seen.has(value.seed) && seen.add(value.seed)).slice(0, 10);
}

function ageBand(months: number): string {
  const years = Math.floor(months / 12);
  if (years < 20) return '15-19';
  if (years < 25) return '20-24';
  if (years < 30) return '25-29';
  if (years < 35) return '30-34';
  return '35+';
}

function printSummary(
  summary: Record<string, number>,
  underlying: Counter,
  occurrence: Counter,
  categories: Counter,
  conditionTypes: Counter,
  locations: Counter,
  audit: ReturnType<typeof auditGenericLand>,
): void {
  console.log('\n=== DEAD END DIAGNOSTIC ===');
  console.log(`Runs: ${summary.runs}`);
  console.log(`Dead ends: ${summary.deadEnds} (${summary.deadEndRate.toFixed(1)}%)`);
  console.log(`Career ended: ${summary.careerEnded}`);
  console.log(`Simulation errors: ${summary.simulationErrors}`);
  console.log(`Age P10 / median / P90: ${summary.p10DeadEndAgeYears.toFixed(1)} / ${summary.medianDeadEndAgeYears.toFixed(1)} / ${summary.p90DeadEndAgeYears.toFixed(1)}`);
  console.log(`Land / sea: ${summary.deadEndsOnLand} / ${summary.deadEndsAtSea}`);
  console.log(`With ship / shipless: ${summary.deadEndsWithShip} / ${summary.deadEndsWithoutShip}`);
  console.log(`Forced departure available / unavailable: ${summary.forcedDepartureAvailableAtDeadEnd} / ${summary.forcedDepartureUnavailableAtDeadEnd}`);
  console.log(`Fallback present / missing: ${summary.expectedFallbackPresent} / ${summary.expectedFallbackMissing}`);

  console.log('\nUnderlying starvation:');
  topEntries(underlying, 10).forEach(({ key, value }) => console.log(`${key}: ${value}`));
  console.log('\nOccurrence rejection:');
  topEntries(occurrence, 10).forEach(({ key, value }) => console.log(`${key}: ${value}`));
  console.log('\nFailed condition categories:');
  topEntries(categories, 10).forEach(({ key, value }) => console.log(`${key}: ${value}`));
  console.log('\nFailed leaf condition types:');
  topEntries(conditionTypes, 10).forEach(({ key, value }) => console.log(`${key}: ${value}`));
  console.log('\nTop terminal locations:');
  topEntries(locations, 10).forEach(({ key, value }) => console.log(`${key}: ${value}`));
  console.log(`\nGeneric Land audit: roots=${audit.roots}, missingActive=${audit.missingActiveGate}, missingLand=${audit.missingLandGate}, missingBoth=${audit.missingBoth}`);
}
