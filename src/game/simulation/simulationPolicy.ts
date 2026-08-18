import type { ChoiceDefinition, ContentCatalog, EventDefinition } from '../content/schema';
import { canBuyShip, shipBuyPrice } from '../engine/economy';
import {
  DEPARTURE_SYSTEM_EVENT_ID,
  type MonthlyNavigationChoice,
  type MonthlyNavigationOption,
} from '../engine/navigation';
import { nextRandom } from '../engine/rng';
import { canAcquireShip } from '../engine/ship';
import type { CrewRoleId, GameState, NpcId, ShipId } from '../model/schema';

export interface SimulationChoice {
  choice: ChoiceDefinition;
  nextRngState: number;
}

export interface SimulationDecisionContext {
  event: EventDefinition;
  state: GameState;
  catalog: ContentCatalog;
}

export interface SimulationCrewRoleContext {
  state: GameState;
  catalog: ContentCatalog;
  npcId: NpcId;
  reason: 'recruitment' | 'annual_reassignment';
}

export interface SimulationCrewRoleChoice {
  roleId: CrewRoleId;
  nextRngState: number;
}

export interface SimulationPolicy {
  readonly id: string;
  choose(
    choices: readonly ChoiceDefinition[],
    rngState: number,
    context?: SimulationDecisionContext,
  ): SimulationChoice;
  chooseNavigation?(
    options: readonly MonthlyNavigationOption[],
    rngState: number,
  ): { choice: MonthlyNavigationChoice; nextRngState: number };
  chooseCrewRole?(
    roleIds: readonly CrewRoleId[],
    rngState: number,
    context?: SimulationCrewRoleContext,
  ): SimulationCrewRoleChoice;
}

function chooseRandomChoice(
  choices: readonly ChoiceDefinition[],
  rngState: number,
): SimulationChoice {
  if (choices.length === 0) throw new Error('No available Choice for the selected Event.');
  if (choices.length === 1) return { choice: choices[0], nextRngState: rngState };

  const random = nextRandom(rngState);
  return {
    choice: choices[Math.floor(random.value * choices.length)],
    nextRngState: random.nextState,
  };
}

function chooseRandomCrewRole(
  roleIds: readonly CrewRoleId[],
  rngState: number,
): SimulationCrewRoleChoice {
  if (roleIds.length === 0) throw new Error('No available Crew Role for simulation assignment.');
  if (roleIds.length === 1) return { roleId: roleIds[0], nextRngState: rngState };

  const random = nextRandom(rngState);
  return {
    roleId: roleIds[Math.floor(random.value * roleIds.length)],
    nextRngState: random.nextState,
  };
}

function choiceById(
  choices: readonly ChoiceDefinition[],
  choiceId: string,
  rngState: number,
): SimulationChoice | undefined {
  const choice = choices.find(({ id }) => id === choiceId);
  return choice ? { choice, nextRngState: rngState } : undefined;
}

function firstChoiceById(
  choices: readonly ChoiceDefinition[],
  choiceIds: readonly string[],
  rngState: number,
): SimulationChoice | undefined {
  for (const choiceId of choiceIds) {
    const selected = choiceById(choices, choiceId, rngState);
    if (selected) return selected;
  }
  return undefined;
}

function canNormallyBuyShip(
  state: GameState,
  catalog: ContentCatalog,
  shipId: ShipId,
): boolean {
  return state.ship === null
    && canAcquireShip(state, catalog, shipId)
    && canBuyShip(state, catalog, shipId)
    && state.berries >= shipBuyPrice(catalog, shipId);
}

function cheapestNormallyPurchasableShip(
  state: GameState,
  catalog: ContentCatalog,
): ShipId | undefined {
  if (state.ship !== null) return undefined;

  return [...catalog.ships]
    .sort((left, right) => left.priceBerries - right.priceBerries || left.id.localeCompare(right.id))
    .find(({ id }) => canNormallyBuyShip(state, catalog, id))
    ?.id;
}

function chooseProgressionMarketAction(
  choices: readonly ChoiceDefinition[],
  rngState: number,
  context: SimulationDecisionContext,
): SimulationChoice | undefined {
  const { event, state, catalog } = context;
  if (!event.id.startsWith('system_market:')) return undefined;

  const targetShipId = cheapestNormallyPurchasableShip(state, catalog);

  if (event.id === 'system_market:arrival') {
    if (targetShipId) {
      const port = choiceById(choices, 'market:port', rngState);
      if (port) return port;
    }
    return choiceById(choices, 'market:explore', rngState)
      ?? firstChoiceById(choices, ['market:merchant', 'market:port'], rngState);
  }

  if (event.id === 'system_market:port') {
    if (targetShipId) {
      const ship = choiceById(choices, `market:ship:buy:${targetShipId}`, rngState);
      if (ship) return ship;
    }
    return choiceById(choices, 'market:explore', rngState)
      ?? choiceById(choices, 'market:merchant', rngState);
  }

  const shipConfirmPrefix = 'system_market:confirm:ship:buy:';
  if (event.id.startsWith(shipConfirmPrefix)) {
    const shipId = event.id.slice(shipConfirmPrefix.length) as ShipId;
    if (canNormallyBuyShip(state, catalog, shipId)) {
      const accept = choiceById(choices, 'market:accept', rngState);
      if (accept) return accept;
    }

    return firstChoiceById(
      choices,
      ['market:port', 'market:explore', 'market:merchant'],
      rngState,
    );
  }

  // If a progression run somehow entered another market submenu, leave it
  // deterministically instead of spending months/RNG wandering through menus.
  if (targetShipId) {
    const port = choiceById(choices, 'market:port', rngState);
    if (port) return port;
  }

  return firstChoiceById(
    choices,
    [
      'market:explore',
      'market:merchant',
      'market:buy:list',
      'market:sell:list',
      'market:port',
    ],
    rngState,
  );
}

export const randomSimulationPolicy: SimulationPolicy = {
  id: 'random',
  choose(choices, rngState) {
    return chooseRandomChoice(choices, rngState);
  },
  chooseNavigation(options, rngState) {
    const available = options.filter(({ available }) => available);
    if (available.length === 0) throw new Error('No available monthly navigation choice.');
    if (available.length === 1) return { choice: available[0].id, nextRngState: rngState };

    const random = nextRandom(rngState);
    return {
      choice: available[Math.floor(random.value * available.length)].id,
      nextRngState: random.nextState,
    };
  },
  chooseCrewRole(roleIds, rngState) {
    return chooseRandomCrewRole(roleIds, rngState);
  },
};

export const progressionSimulationPolicy: SimulationPolicy = {
  id: 'progression',
  choose(choices, rngState, context) {
    if (choices.length === 0) throw new Error('No available Choice for the selected Event.');
    if (!context) return chooseRandomChoice(choices, rngState);

    if (context.event.id === DEPARTURE_SYSTEM_EVENT_ID) {
      const depart = choiceById(choices, 'navigation:depart', rngState);
      if (depart) return depart;
    }

    const market = chooseProgressionMarketAction(choices, rngState, context);
    if (market) return market;

    // Narrative content deliberately stays seeded-random.
    return chooseRandomChoice(choices, rngState);
  },
  chooseNavigation: randomSimulationPolicy.chooseNavigation,
  chooseCrewRole: randomSimulationPolicy.chooseCrewRole,
};

export function derivePolicySeed(gameplaySeed: number): number {
  return (gameplaySeed ^ 0x9e3779b9) >>> 0;
}
