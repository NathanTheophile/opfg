import type { ContentCatalog } from '../../../src/game/content/schema';
import { crewRoleHolderId } from '../../../src/game/engine/crew';
import { canUseCrewRolePower } from '../../../src/game/engine/crewPowers';
import { canBuyShip } from '../../../src/game/engine/economy';
import { activeParadiseRouteId } from '../../../src/game/engine/maritime';
import {
  REVERSE_MOUNTAIN_NAVIGATOR_OVERRIDE_FLAG,
  REVERSE_MOUNTAIN_ROOT_IDS,
  canStartNavigatorReverseMountainAttempt,
  findEligibleReverseMountainRoot,
} from '../../../src/game/engine/reverseMountain';
import type { GameState } from '../../../src/game/model/schema';
import type { SimulationObserver } from '../../../src/game/simulation/observation';
import { simulateObservedRun } from '../../../src/game/simulation/simulateObservedRun';
import type { SimulationPolicy } from '../../../src/game/simulation/simulationPolicy';
import { inc } from './stats';
import type { V2RunSample } from './types';

const LAND_FALLBACK = 'dead_end_on_land';
const SEA_FALLBACK = 'dead_end_at_sea';
const REVERSE_MOUNTAIN_LOCATION_ID = 'reverse_mountain';
const TWIN_CAPES_LOCATION_ID = 'twin_capes';
const THRILLER_BARK_LOCATION_ID = 'thriller_bark';
const SABAODY_LOCATION_ID = 'sabaody_archipelago';
const FISH_MAN_ISLAND_LOCATION_ID = 'fish_man_island';

type CrewPowerEntry = {
  beforeState: GameState;
  afterState: GameState;
  roleId: string;
  parameterId?: string;
};

type ExtendedSimulationObserver = SimulationObserver & {
  onCrewPowerUsed?(entry: CrewPowerEntry, catalog: ContentCatalog): void;
};

export function collectV2Run(
  seed: number,
  catalog: ContentCatalog,
  policy: SimulationPolicy,
  maxEvents: number,
): V2RunSample {
  const locations = new Map(catalog.locations.map((location) => [location.id, location]));
  const visitedLocations = new Set<string>();
  const visitedSeas = new Set<string>();
  const paradiseRoutes = new Set<string>();
  const crewIdsEver = new Set<string>();
  const crewRolesEver = new Set<string>();
  const traitsEver = new Set<string>();
  const careersSeen = new Set<GameState['player']['career']['affiliationId']>();
  const shipIdsSeen = new Set<string>();
  const rolePresenceYears = new Map<string, Set<number>>();
  const roleAvailableYears = new Map<string, Set<number>>();
  const roleUsedYears = new Map<string, Set<number>>();

  const crewPowerUses: Record<string, number> = {};
  const damageByEvent: Record<string, number> = {};
  const eventCounts: Record<string, number> = {};
  const damageByTravelState = { at_sea: 0, on_land: 0 };
  const healingByTravelState = { at_sea: 0, on_land: 0 };
  const dice: V2RunSample['dice'] = [];

  let raceId: string | null = null;
  let originSeaId: string | null = null;
  let initialHealth: number | null = null;
  let minimumHealth = Number.POSITIVE_INFINITY;
  let totalDamage = 0;
  let totalHealing = 0;
  let medicHealing = 0;
  let lethalEventId: string | null = null;
  let deathAgeMonths: number | null = null;

  let totalIncome = 0;
  let totalSpend = 0;
  let minimumBerries = Number.POSITIVE_INFINITY;
  let maximumBerries = Number.NEGATIVE_INFINITY;

  let everHadShip = false;
  let firstShipAgeMonths: number | null = null;
  let firstSloopAgeMonths: number | null = null;
  let firstSloopPurchaseOpportunityAgeMonths: number | null = null;
  let sloopPurchaseOpportunitiesBefore20 = 0;
  let shipAcquisitions = 0;
  let shipLosses = 0;
  let everAtSeaWithoutShip = false;

  let maxCrewSize = 0;
  let crewRecruitments = 0;
  const crewRecruitmentAges: number[] = [];
  let recruitmentEventsBefore20 = 0;
  let crewDepartures = 0;

  let reverseMountainAttempted = false;
  let reverseMountainReached = false;
  let reverseMountainPassed = false;
  let paradiseReached = false;
  let thrillerBarkReached = false;
  let sabaodyReached = false;
  let fishManIslandReached = false;
  let newWorldReached = false;
  let reverseMountainAttemptWithNavigator = false;
  let everBlueWithShip = false;
  let everBlueWithNonDinghy = false;
  let everBlueWithNavigatorAndShip = false;
  let everReverseMountainOrdinaryEligible = false;
  let everReverseMountainNavigatorEligible = false;

  let fallbackEvents = 0;
  let fallbackStreak = 0;
  let maximumFallbackStreak = 0;

  const addYear = (target: Map<string, Set<number>>, roleId: string, ageMonths: number) => {
    const years = target.get(roleId) ?? new Set<number>();
    years.add(Math.floor(ageMonths / 12));
    target.set(roleId, years);
  };

  const isWithin = (state: GameState, targetId: string): boolean => {
    let current = locations.get(state.locationId);
    const visited = new Set<string>();
    while (current) {
      if (current.id === targetId) return true;
      if (!current.parentLocationId || visited.has(current.id)) return false;
      visited.add(current.id);
      current = locations.get(current.parentLocationId);
    }
    return false;
  };

  const observeState = (state: GameState) => {
    visitedLocations.add(state.locationId);
    const location = locations.get(state.locationId);
    const seaId = location?.seaId ?? 'unknown';
    visitedSeas.add(seaId);

    if (state.player.profile.raceId !== null) {
      raceId ??= state.player.profile.raceId;
      originSeaId ??= state.player.profile.originSeaId;
      if (initialHealth === null) {
        initialHealth = catalog.races.find(({ id }) => id === state.player.profile.raceId)?.initialHealth
          ?? state.player.stats.health;
      }
    }
    minimumHealth = Math.min(minimumHealth, state.player.stats.health);
    minimumBerries = Math.min(minimumBerries, state.berries);
    maximumBerries = Math.max(maximumBerries, state.berries);
    careersSeen.add(state.player.career.affiliationId);
    state.player.traits.forEach((traitId) => traitsEver.add(traitId));

    if (state.ship !== null) {
      everHadShip = true;
      firstShipAgeMonths ??= state.ageMonths;
      if (state.ship.shipId === 'sloop') firstSloopAgeMonths ??= state.ageMonths;
      shipIdsSeen.add(state.ship.shipId);
    } else if (state.travelState === 'at_sea') {
      everAtSeaWithoutShip = true;
    }

    const isBlue = ['east_blue', 'west_blue', 'north_blue', 'south_blue'].includes(seaId);
    if (isBlue && state.ship !== null) {
      everBlueWithShip = true;
      if (state.ship.shipId !== 'dinghy') everBlueWithNonDinghy = true;
      if (crewRoleHolderId(state, 'navigator') !== undefined) everBlueWithNavigatorAndShip = true;
    }
    try {
      if (findEligibleReverseMountainRoot(state, catalog) !== undefined) {
        everReverseMountainOrdinaryEligible = true;
      }
      if (canStartNavigatorReverseMountainAttempt(state, catalog)) {
        everReverseMountainNavigatorEligible = true;
      }
    } catch {
      // Diagnostic probes must never invalidate the simulated run.
    }

    const crewEntries = Object.entries(state.npcs).filter(([, npc]) => npc.status === 'crew');
    maxCrewSize = Math.max(maxCrewSize, crewEntries.length);
    for (const [npcId, npc] of crewEntries) {
      crewIdsEver.add(npcId);
      if (npc.crewRoleId !== null) {
        crewRolesEver.add(npc.crewRoleId);
        addYear(rolePresenceYears, npc.crewRoleId, state.ageMonths);
      }
    }

    for (const role of catalog.crewRoles) {
      if (role.annualPower === undefined) continue;
      try {
        if (canUseCrewRolePower(state, catalog, role.id)) {
          addYear(roleAvailableYears, role.id, state.ageMonths);
        }
      } catch {
        // Diagnostics should not mutate or fail a run merely because a power probe is unavailable.
      }
    }

    try {
      const routeId = activeParadiseRouteId(state);
      if (routeId !== undefined) paradiseRoutes.add(routeId);
    } catch {
      // Route is intentionally absent outside Paradise.
    }

    if (state.locationId === REVERSE_MOUNTAIN_LOCATION_ID) reverseMountainReached = true;
    if (state.locationId === TWIN_CAPES_LOCATION_ID) reverseMountainPassed = true;
    if (seaId === 'grand_line_paradise') paradiseReached = true;
    if (isWithin(state, THRILLER_BARK_LOCATION_ID)) thrillerBarkReached = true;
    if (isWithin(state, SABAODY_LOCATION_ID)) sabaodyReached = true;
    if (isWithin(state, FISH_MAN_ISLAND_LOCATION_ID)) fishManIslandReached = true;
    if (seaId === 'new_world') newWorldReached = true;
  };

  const observeTransition = (before: GameState, after: GameState) => {
    observeState(before);
    observeState(after);

    const berryDelta = after.berries - before.berries;
    if (berryDelta > 0) totalIncome += berryDelta;
    else if (berryDelta < 0) totalSpend += -berryDelta;

    if (before.ship === null && after.ship !== null) {
      shipAcquisitions += 1;
      firstShipAgeMonths ??= after.ageMonths;
    } else if (before.ship !== null && after.ship === null) {
      shipLosses += 1;
    }

    const beforeCrew = new Set(Object.entries(before.npcs).filter(([, npc]) => npc.status === 'crew').map(([id]) => id));
    const afterCrew = new Set(Object.entries(after.npcs).filter(([, npc]) => npc.status === 'crew').map(([id]) => id));
    const recruitedIds = [...afterCrew].filter((id) => !beforeCrew.has(id));
    crewRecruitments += recruitedIds.length;
    for (const _npcId of recruitedIds) crewRecruitmentAges.push(after.ageMonths);
    crewDepartures += [...beforeCrew].filter((id) => !afterCrew.has(id)).length;
  };

  const observer = {
    onInitialState(state: GameState) {
      observeState(state);
    },
    onNavigationResolved(entry: { beforeState: GameState; afterState: GameState }) {
      observeTransition(entry.beforeState, entry.afterState);
    },
    onCrewPowerUsed(entry: CrewPowerEntry) {
      observeTransition(entry.beforeState, entry.afterState);
      inc(crewPowerUses, entry.roleId);
      addYear(roleUsedYears, entry.roleId, entry.beforeState.ageMonths);
      if (entry.roleId === 'medic') {
        const healed = Math.max(0, entry.afterState.player.stats.health - entry.beforeState.player.stats.health);
        medicHealing += healed;
        totalHealing += healed;
        healingByTravelState[entry.beforeState.travelState] += healed;
      }
    },
    onEventResolved(entry: Parameters<NonNullable<SimulationObserver['onEventResolved']>>[0]) {
      const before = entry.beforeState;
      const after = entry.afterState;
      observeTransition(before, after);
      inc(eventCounts, entry.event.id);
      if (entry.event.id.startsWith('active_recruitment_') && before.ageMonths < 240) {
        recruitmentEventsBefore20 += 1;
      }
      if (entry.event.id === 'system_market:arrival' && canBuyShip(before, catalog, 'sloop')) {
        firstSloopPurchaseOpportunityAgeMonths ??= before.ageMonths;
        if (before.ageMonths < 240) sloopPurchaseOpportunitiesBefore20 += 1;
      }

      if (REVERSE_MOUNTAIN_ROOT_IDS.has(entry.event.id)) {
        reverseMountainAttempted = true;
        if (before.flags.includes(REVERSE_MOUNTAIN_NAVIGATOR_OVERRIDE_FLAG)) {
          reverseMountainAttemptWithNavigator = true;
        }
      }

      const isFallback = entry.event.id === LAND_FALLBACK || entry.event.id === SEA_FALLBACK;
      if (isFallback) {
        fallbackEvents += 1;
        fallbackStreak += 1;
        maximumFallbackStreak = Math.max(maximumFallbackStreak, fallbackStreak);
      } else {
        fallbackStreak = 0;
      }

      const explicitHealthDelta = entry.outcome.effects.reduce(
        (sum, effect) => effect.type === 'modifyHealth' ? sum + effect.amount : sum,
        0,
      );
      const sameEstablishedRace = before.player.profile.raceId !== null
        && before.player.profile.raceId === after.player.profile.raceId;
      const healthDelta = sameEstablishedRace
        ? after.player.stats.health - before.player.stats.health
        : explicitHealthDelta;

      if (healthDelta < 0) {
        const damage = -healthDelta;
        totalDamage += damage;
        damageByTravelState[before.travelState] += damage;
        inc(damageByEvent, entry.event.id, damage);
        if (before.player.stats.health > 0 && after.player.stats.health <= 0) {
          lethalEventId ??= entry.event.id;
          deathAgeMonths ??= after.ageMonths;
        }
      } else if (healthDelta > 0) {
        totalHealing += healthDelta;
        healingByTravelState[before.travelState] += healthDelta;
      }

      if (entry.dice) {
        dice.push({
          eventId: entry.event.id,
          statId: entry.dice.statId,
          rawRoll: entry.dice.rawRoll,
          modifierTotal: entry.dice.modifierTotal,
          total: entry.dice.total,
          result: entry.dice.result,
          actor: entry.dice.actorNpcId === undefined ? 'player' : 'crew',
        });
      }
    },
    onTermination(entry: { state: GameState }) {
      observeState(entry.state);
    },
  } as ExtendedSimulationObserver;

  const result = simulateObservedRun({
    seed,
    catalog,
    maxResolvedEvents: maxEvents,
    observer,
    policy,
  });

  observeState(result.finalState);
  if (result.playerDeath) deathAgeMonths ??= result.finalState.ageMonths;

  const finalLocation = locations.get(result.finalState.locationId);
  return {
    seed,
    terminationReason: result.terminationReason,
    ...(result.error ? { error: result.error } : {}),
    playerDeath: result.playerDeath,
    careerEndReason: result.finalState.careerEndReason,
    endingId: result.finalState.endingId,
    finalAgeMonths: result.finalState.ageMonths,
    reachedAge35: result.finalState.ageMonths >= 420,
    eventCount: result.resolvedEvents.length,
    normalEvents: result.normalEvents,
    scheduledEvents: result.scheduledEvents,
    criticalEvents: result.criticalEvents,
    immediateEvents: result.immediateEvents,
    fallbackEvents,
    maximumFallbackStreak,
    maximumImmediateChainLength: result.maximumImmediateChainLength,
    immediateGuardTriggered: result.immediateGuardTriggered,
    possibleCriticalLoop: result.possibleCriticalLoop,
    lifetimeThreadStarted: result.lifetimeThreadStarted,

    raceId,
    originSeaId,
    initialHealth,
    finalHealth: result.finalState.player.stats.health,
    minimumHealth: Number.isFinite(minimumHealth) ? minimumHealth : result.finalState.player.stats.health,
    totalDamage,
    totalHealing,
    medicHealing,
    deathAgeMonths,
    lethalEventId,
    damageByTravelState,
    healingByTravelState,
    damageByEvent,

    finalCareer: result.finalState.player.career.affiliationId,
    careersSeen: [...careersSeen].sort(),
    finalBerries: result.finalState.berries,
    totalIncome,
    totalSpend,
    minimumBerries: Number.isFinite(minimumBerries) ? minimumBerries : result.finalState.berries,
    maximumBerries: Number.isFinite(maximumBerries) ? maximumBerries : result.finalState.berries,

    everHadShip,
    firstShipAgeMonths,
    firstSloopAgeMonths,
    firstSloopPurchaseOpportunityAgeMonths,
    sloopPurchaseOpportunitiesBefore20,
    shipAcquisitions,
    shipLosses,
    shipIdsSeen: [...shipIdsSeen].sort(),
    finalShipId: result.finalState.ship?.shipId ?? null,
    finalShipHealth: result.finalState.ship?.health ?? null,
    everAtSeaWithoutShip,

    maxCrewSize,
    crewIdsEver: [...crewIdsEver].sort(),
    crewRolesEver: [...crewRolesEver].sort(),
    crewRecruitments,
    crewRecruitmentAges: [...crewRecruitmentAges].sort((a, b) => a - b),
    recruitmentEventsBefore20,
    crewDepartures,
    crewPowerUses,
    crewPowerEffectiveHealing: medicHealing,
    rolePresenceYears: setMapToRecord(rolePresenceYears),
    roleAvailableYears: setMapToRecord(roleAvailableYears),
    roleUsedYears: setMapToRecord(roleUsedYears),

    visitedLocations: [...visitedLocations].sort(),
    visitedSeas: [...visitedSeas].sort(),
    finalLocationId: result.finalState.locationId,
    finalSeaId: finalLocation?.seaId ?? 'unknown',
    paradiseRouteIds: [...paradiseRoutes].sort(),
    reverseMountainAttempted,
    reverseMountainReached,
    reverseMountainPassed,
    paradiseReached,
    thrillerBarkReached,
    sabaodyReached,
    fishManIslandReached,
    newWorldReached,
    reverseMountainAttemptWithNavigator,
    everBlueWithShip,
    everBlueWithNonDinghy,
    everBlueWithNavigatorAndShip,
    everReverseMountainOrdinaryEligible,
    everReverseMountainNavigatorEligible,

    finalTraits: [...result.finalState.player.traits].sort(),
    traitsEver: [...traitsEver].sort(),
    devilFruitId: result.finalState.player.powers.devilFruitId,
    finalFruitAwakening: result.finalState.player.powers.devilFruitAwakening,
    finalHaki: { ...result.finalState.player.powers.haki },
    finalStats: { ...result.finalState.player.stats },

    eventIdsSeen: Object.keys(eventCounts).sort(),
    eventCounts,
    dice,
  };
}

function setMapToRecord(source: Map<string, Set<number>>): Record<string, number[]> {
  return Object.fromEntries(
    [...source.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, values]) => [key, [...values].sort((a, b) => a - b)]),
  );
}
