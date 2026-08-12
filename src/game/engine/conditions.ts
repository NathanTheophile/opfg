import type { ChoiceDefinition } from '../content/schema';
import type { Condition } from '../content/schema';
import type { GameState } from '../model/schema';
import { availableCargoSlots, canAcquireShip, canRecruitNpc, countCurrentCrew, findShipDefinition } from './ship';
import { canBuyItem, canSellItem, inventoryFreeSlots, itemQuantity } from './economy';
import { canConsumeDevilFruit, playerHakiSourceTotal } from './powers';
import { isLocationWithin } from './locations';
import { countFallbackStreak, currentSeaPorts, currentShipDestructionCause, findBestSwimmingRescuer, findHighestRelationshipFruitCrew, sameIslandPorts } from './maritime';
import { effectivePlayerStat } from './stats';

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
      const stat = catalog ? effectivePlayerStat(state, catalog, condition.statId) : state.player.stats[condition.statId];
      return stat !== null && stat >= condition.value;
    }
    case 'hasFlag':
      return state.flags.includes(condition.flagId);
    case 'hasItem':
      return itemQuantity(state.player.inventory.stacks, condition.itemId) + itemQuantity(state.ship?.cargo ?? [], condition.itemId) > 0;
    case 'hasEquipped':
      return state.player.equipment.some((stack) => stack?.itemId === condition.itemId);
    case 'hasEquippedWeapon':
      return catalog !== undefined && state.player.equipment.some((stack) => {
        const weapon = catalog.items.find(({ id }) => id === stack?.itemId)?.weapon;
        return weapon !== undefined && (condition.damageType === undefined || weapon.damageType === condition.damageType) && (condition.rangeType === undefined || weapon.rangeType === condition.rangeType);
      });
    case 'itemQuantityAtLeast':
      return itemQuantity(state.player.inventory.stacks, condition.itemId) >= condition.quantity;
    case 'inventoryFreeSlotsAtLeast':
      return inventoryFreeSlots(state.player.inventory) >= condition.value;
    case 'canBuyItem':
      return catalog !== undefined && canBuyItem(state, catalog, condition.itemId, condition.quantity);
    case 'canSellItem':
      return catalog !== undefined && canSellItem(state, catalog, condition.itemId, condition.quantity);
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
    case 'locationHasTag':
      return catalog?.locations.find(({ id }) => id === state.locationId)?.tags.includes(condition.tagId) === true;
    case 'locationHasService':
      return catalog?.locations.find(({ id }) => id === state.locationId)?.services.includes(condition.serviceId) === true;
    case 'locationWithin':
      return catalog !== undefined && isLocationWithin(catalog, state.locationId, condition.locationId);
    case 'currentSeaIs':
      return catalog?.locations.find(({ id }) => id === state.locationId)?.seaId === condition.seaId;
    case 'sameIslandPortExists': return catalog !== undefined && sameIslandPorts(state, catalog).length > 0;
    case 'currentSeaHasPort': return catalog !== undefined && currentSeaPorts(state, catalog).length > 0;
    case 'fallbackStreakAtLeast': return catalog !== undefined && countFallbackStreak(state, catalog.events) >= condition.value;
    case 'shipDestructionCauseIs': return catalog !== undefined && currentShipDestructionCause(state, catalog) === condition.cause;
    case 'maritimeEmergencyActive': return state.maritimeEmergency !== null;
    case 'hasEligibleSwimmingRescuer': return findBestSwimmingRescuer(state) !== undefined;
    case 'hasCrewMemberWithDevilFruit': return findHighestRelationshipFruitCrew(state) !== undefined;
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
    case 'canSellShip': {
      const market = catalog?.locations.find(({ id }) => id === state.locationId)?.shipMarket;
      return state.ship !== null && state.pendingShip !== null && market !== undefined && market !== 'none';
    }
    case 'npcStatusIs':
      return state.npcs[condition.npcId]?.status === condition.status;
    case 'npcRelationshipAtLeast':
      return (state.npcs[condition.npcId]?.relationship ?? Number.NEGATIVE_INFINITY) >= condition.value;
    case 'npcRelationshipAtMost':
      return (state.npcs[condition.npcId]?.relationship ?? Number.POSITIVE_INFINITY) <= condition.value;
    case 'npcMonthsSinceInteractionAtLeast': {
      const age = state.npcs[condition.npcId]?.lastInteractionAgeMonths;
      return age !== null && age !== undefined && state.ageMonths - age >= condition.value;
    }
    case 'npcMonthsSinceInteractionAtMost': {
      const age = state.npcs[condition.npcId]?.lastInteractionAgeMonths;
      return age !== null && age !== undefined && state.ageMonths - age <= condition.value;
    }
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
    case 'racePlayableV1':
      return catalog?.races.find(({ id }) => id === condition.raceId)?.playableV1 === true;
    case 'originSeaIs':
      return state.player.profile.originSeaId !== null && state.player.profile.originSeaId === condition.seaId;
    case 'affiliationIs':
      return state.player.profile.affiliationId !== null && state.player.profile.affiliationId === condition.affiliationId;
    case 'affiliationPlayableV1':
      return catalog?.affiliations.find(({ id }) => id === condition.affiliationId)?.playableV1 === true;
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
    case 'npcDevilFruitAwakeningAtLeast': {
      const powers = state.npcs[condition.npcId]?.powers;
      return powers?.devilFruitId !== null && powers?.devilFruitId !== undefined && powers.devilFruitAwakening >= condition.value;
    }
    case 'npcHakiAtLeast': return (state.npcs[condition.npcId]?.powers.haki[condition.hakiType] ?? -1) >= condition.level;
    case 'npcHakiIsAwakened': return (state.npcs[condition.npcId]?.powers.haki[condition.hakiType] ?? 0) > 0;
    case 'careerAffiliationIs': return state.player.career.affiliationId === condition.affiliationId;
    case 'reputationAtLeast': return state.player.career.reputation >= condition.value;
    case 'reputationAtMost': return state.player.career.reputation <= condition.value;
    case 'bountyAtLeast': return state.player.career.bounty >= condition.value;
    case 'careerRankIs': return state.player.career.rankId === condition.rankId;
    case 'careerRankAtLeast': {
      if (state.player.career.rankId === null || catalog === undefined) return false;
      const current = catalog.careerRanks.find(({ id }) => id === state.player.career.rankId);
      const required = catalog.careerRanks.find(({ id }) => id === condition.rankId);
      return current !== undefined && required !== undefined
        && current.affiliationId === state.player.career.affiliationId
        && required.affiliationId === state.player.career.affiliationId
        && current.sortOrder >= required.sortOrder;
    }
    case 'careerTitleIs': return state.player.career.titleId === condition.titleId;
  }
}

export function getChoiceState(choice: ChoiceDefinition, state: GameState, catalog?: import('../content/schema').ContentCatalog): ChoiceState {
  const visible = choice.visibleIf === undefined || evaluateCondition(choice.visibleIf, state, catalog);
  return {
    visible,
    available: visible && (choice.availableIf === undefined || evaluateCondition(choice.availableIf, state, catalog)),
  };
}
