import type { ChoiceDefinition } from '../content/schema';
import type { Condition } from '../content/schema';
import type { GameState } from '../model/schema';
import { availableCargoSlots, canAcquireShip, canRecruitNpc, countCurrentCrew, findShipDefinition } from './ship';
import { canConsumeDevilFruit, playerHakiSourceTotal } from './powers';

export interface ChoiceState {
  visible: boolean;
  available: boolean;
}

export function evaluateCondition(condition: Condition, state: GameState, catalog?: import('../content/schema').ContentCatalog): boolean {
  switch (condition.type) {
    case 'all':
      return condition.conditions.every((entry) => evaluateCondition(entry, state, catalog));
    case 'any':
      return condition.conditions.some((entry) => evaluateCondition(entry, state, catalog));
    case 'not':
      return !evaluateCondition(condition.condition, state, catalog);
    case 'hasTrait':
      return state.player.traits.includes(condition.traitId);
    case 'statAtLeast': {
      const stat = state.player.stats[condition.statId];
      return stat !== null && stat >= condition.value;
    }
    case 'hasFlag':
      return state.flags.includes(condition.flagId);
    case 'hasItem':
      return state.player.inventory.stacks.some(({ itemId }) => itemId === condition.itemId);
    case 'berriesAtLeast':
      return state.berries >= condition.value;
    case 'hasCrew':
      return countCurrentCrew(state) > 0;
    case 'crewSizeAtLeast':
      return countCurrentCrew(state) >= condition.value;
    case 'hasCrewRole':
      return catalog !== undefined && Object.entries(state.npcs).some(([npcId, npc]) => npc.status === 'crew' && catalog.npcs.find(({ id }) => id === npcId)?.crewRoleId === condition.roleId);
    case 'canRecruitNpc':
      return catalog !== undefined && canRecruitNpc(state, catalog, condition.npcId);
    case 'isLeader':
      return state.isLeader;
    case 'locationIs':
      return state.locationId === condition.locationId;
    case 'isAtSea':
      return state.travelState === 'at_sea';
    case 'isOnLand':
      return state.travelState === 'on_land';
    case 'careerPhaseIs':
      return state.careerPhase === condition.phase;
    case 'ageAtLeastMonths':
      return state.ageMonths >= condition.value;
    case 'ageAtMostMonths':
      return state.ageMonths <= condition.value;
    case 'hasShip':
      return state.ship !== null;
    case 'shipIs':
      return state.ship?.shipId === condition.shipId;
    case 'shipHealthAtLeast':
      return state.ship !== null && state.ship.health >= condition.value;
    case 'shipHealthAtMost':
      return state.ship !== null && state.ship.health <= condition.value;
    case 'shipCrewCapacityAtLeast':
      return state.ship !== null && catalog !== undefined && findShipDefinition(catalog, state.ship.shipId).crewCapacity >= condition.value;
    case 'shipCargoSpaceAtLeast':
      return state.ship !== null && catalog !== undefined && availableCargoSlots(state.ship, catalog, state.passengerNpcIds.length) >= condition.value;
    case 'canAcquireShip':
      return catalog !== undefined && canAcquireShip(state, catalog, condition.shipId);
    case 'canSellShip':
      return state.ship !== null && state.pendingShip !== null && catalog?.locations.find(({ id }) => id === state.locationId)?.allowsShipSale === true;
    case 'npcStatusIs':
      return state.npcs[condition.npcId]?.status === condition.status;
    case 'npcRelationshipAtLeast':
      return (state.npcs[condition.npcId]?.relationship ?? Number.NEGATIVE_INFINITY) >= condition.value;
    case 'npcStatAtLeast':
      return (state.npcs[condition.npcId]?.stats[condition.statId] ?? Number.NEGATIVE_INFINITY) >= condition.value;
    case 'hasChosen':
      return state.history.some(
        (entry) => entry.eventId === condition.eventId && entry.choiceId === condition.choiceId,
      );
    case 'hasPlayed':
      return state.history.some((entry) => entry.eventId === condition.eventId);
    case 'hasOutcome':
      return state.history.some(
        (entry) => entry.eventId === condition.eventId && entry.outcomeId === condition.outcomeId,
      );
    case 'raceIs':
      return state.player.profile.raceId !== null && state.player.profile.raceId === condition.raceId;
    case 'originSeaIs':
      return state.player.profile.originSeaId !== null && state.player.profile.originSeaId === condition.seaId;
    case 'affiliationIs':
      return state.player.profile.affiliationId !== null && state.player.profile.affiliationId === condition.affiliationId;
    case 'familyStructureIs':
      return state.player.profile.familyStructureId !== null && state.player.profile.familyStructureId === condition.familyStructureId;
    case 'socialClassIs':
      return state.player.profile.socialClassId !== null && state.player.profile.socialClassId === condition.socialClassId;
    case 'hasDevilFruit': return state.player.powers.devilFruitId !== null;
    case 'canConsumeDevilFruit': return catalog !== undefined && canConsumeDevilFruit(state, catalog, condition.fruitId);
    case 'devilFruitIs': return state.player.powers.devilFruitId === condition.fruitId;
    case 'devilFruitTypeIs': return catalog?.devilFruits.find(({ id }) => id === state.player.powers.devilFruitId)?.type === condition.fruitType;
    case 'devilFruitHasTag': return catalog?.devilFruits.find(({ id }) => id === state.player.powers.devilFruitId)?.tags.includes(condition.tagId) === true;
    case 'devilFruitAwakeningAtLeast': return state.player.powers.devilFruitId !== null && state.player.powers.devilFruitAwakening >= condition.value;
    case 'devilFruitIsAwakened': return state.player.powers.devilFruitId !== null && state.player.powers.devilFruitAwakening >= 10;
    case 'hakiAtLeast': return state.player.powers.haki[condition.hakiType] >= condition.level;
    case 'hakiIsAwakened': return state.player.powers.haki[condition.hakiType] > 0;
    case 'hakiSourceTotalAtLeast': return playerHakiSourceTotal(state, condition.hakiType) >= condition.value;
    case 'npcHasDevilFruit': return state.npcs[condition.npcId]?.powers.devilFruitId !== null && state.npcs[condition.npcId]?.powers.devilFruitId !== undefined;
    case 'npcDevilFruitIs': return state.npcs[condition.npcId]?.powers.devilFruitId === condition.fruitId;
    case 'npcDevilFruitTypeIs': return catalog?.devilFruits.find(({ id }) => id === state.npcs[condition.npcId]?.powers.devilFruitId)?.type === condition.fruitType;
    case 'npcDevilFruitHasTag': return catalog?.devilFruits.find(({ id }) => id === state.npcs[condition.npcId]?.powers.devilFruitId)?.tags.includes(condition.tagId) === true;
    case 'npcDevilFruitAwakeningAtLeast': return (state.npcs[condition.npcId]?.powers.devilFruitAwakening ?? -1) >= condition.value;
    case 'npcHakiAtLeast': return (state.npcs[condition.npcId]?.powers.haki[condition.hakiType] ?? -1) >= condition.level;
    case 'npcHakiIsAwakened': return (state.npcs[condition.npcId]?.powers.haki[condition.hakiType] ?? 0) > 0;
  }
}

export function getChoiceState(choice: ChoiceDefinition, state: GameState, catalog?: import('../content/schema').ContentCatalog): ChoiceState {
  const visible = choice.visibleIf === undefined || evaluateCondition(choice.visibleIf, state, catalog);
  return {
    visible,
    available: visible && (choice.availableIf === undefined || evaluateCondition(choice.availableIf, state, catalog)),
  };
}
