import type { ContentCatalog, Effect } from '../content/schema';
import type { ChoiceId, EventId, GameState, NpcState } from '../model/schema';
import { createDefaultNpcState } from '../model/npcState';
import { addStack, canAcquireShip, canRecruitNpc, cloneInventory, cloneShip, findShipDefinition, removeStack } from './ship';
import { canConsumeDevilFruit, createDefaultPowerState, playerHakiSourceTotal, synchronizePlayerHaki } from './powers';
import { movePlayerToLocation, recoverTravel } from './locations';
import { beginMaritimeEmergency, findHighestRelationshipFruitCrew, moveToSameIslandPort, recoverToLandInCurrentSea, recoverToOtherRegion, resolveMaritimeEmergencyLandfall } from './maritime';
import { modifyPlayerHealth } from './health';
import { ensureNpcMaterialized } from './npcNames';
import { buyItem, findItemDefinition, sellItem } from './economy';
import { tryAutoPlaceReward } from './inventory';

export interface EffectContext {
  sourceEventId: EventId;
  sourceChoiceId: ChoiceId;
  diceActorNpcId?: string;
}

export function applyEffects(state: GameState, catalog: ContentCatalog, effects: Effect[], context: EffectContext): GameState {
  const next: GameState = {
    ...state,
    player: {
      ...state.player,
      profile: { ...state.player.profile },
      career: { ...state.player.career },
      stats: { ...state.player.stats },
      traits: [...state.player.traits],
      inventory: cloneInventory(state.player.inventory),
      equipment: state.player.equipment.map((stack) => stack ? ({ ...stack, provenance: stack.provenance.map((batch) => ({ ...batch })) }) : null) as GameState['player']['equipment'],
      logPose: state.player.logPose ? { ...state.player.logPose, provenance: state.player.logPose.provenance.map((batch) => ({ ...batch })) } : null,
      powers: { ...state.player.powers, haki: { ...state.player.powers.haki } },
    },
    ship: cloneShip(state.ship),
    pendingShip: cloneShip(state.pendingShip),
    passengerNpcIds: [...state.passengerNpcIds],
    crewRoleLastUsedYear: { ...state.crewRoleLastUsedYear },
    flags: [...state.flags],
    berries: state.berries,
    npcs: Object.fromEntries(
      Object.entries(state.npcs).map(([npcId, npc]) => {
        const powers = npc.powers ?? createDefaultPowerState();
        return [npcId, { ...npc, stats: { ...npc.stats }, powers: { ...powers, haki: { ...powers.haki } } }];
      }),
    ),
    history: [...state.history],
    scheduledEvents: [...state.scheduledEvents],
    immediateEventQueue: [...state.immediateEventQueue],
  };

  for (const effect of effects) applyEffect(next, catalog, effect, context);
  synchronizePlayerHaki(next);
  return next;
}

function applyEffect(state: GameState, catalog: ContentCatalog, effect: Effect, context: EffectContext): void {
  switch (effect.type) {
    case 'setFlag':
      if (!state.flags.includes(effect.flagId)) state.flags.push(effect.flagId);
      return;
    case 'clearFlag':
      state.flags = state.flags.filter((flagId) => flagId !== effect.flagId);
      return;
    case 'addItem': {
      if (!tryAutoPlaceReward(state, catalog, effect.itemId, effect.quantity)) state.pendingOverflow = { itemId: effect.itemId, quantity: effect.quantity, locationId: state.locationId, mandatory: effect.mandatory === true };
      return;
    }
    case 'removeItem': {
      let remaining = effect.quantity;
      const pocketQuantity = state.player.inventory.stacks.find(({ itemId }) => itemId === effect.itemId)?.quantity ?? 0;
      const fromPocket = Math.min(remaining, pocketQuantity);
      if (fromPocket > 0) { removeStack(state.player.inventory.stacks, effect.itemId, fromPocket); remaining -= fromPocket; }
      const cargoQuantity = state.ship?.cargo.find(({ itemId }) => itemId === effect.itemId)?.quantity ?? 0;
      const fromCargo = Math.min(remaining, cargoQuantity);
      if (fromCargo > 0 && state.ship) { removeStack(state.ship.cargo, effect.itemId, fromCargo); remaining -= fromCargo; }
      if (remaining > 0) throw new Error(`Not enough Item "${effect.itemId}" to remove ${effect.quantity}.`);
      return;
    }
    case 'buyItem':
      buyItem(state, catalog, effect.itemId, effect.quantity);
      return;
    case 'sellItem':
      sellItem(state, catalog, effect.itemId, effect.quantity);
      return;
    case 'addTrait':
      if (state.player.traits.includes(effect.traitId)) return;
      const definition = catalog.traits.find(({ id }) => id === effect.traitId);
      if (definition?.oppositeTraitId && state.player.traits.includes(definition.oppositeTraitId)) return;
      state.player.traits.push(effect.traitId);
      return;
    case 'removeTrait':
      state.player.traits = state.player.traits.filter((traitId) => traitId !== effect.traitId);
      return;
    case 'modifyStat': {
      const currentValue = state.player.stats[effect.statId];
      if (currentValue === null) throw new Error(`Cannot modify inactive stat "${effect.statId}".`);
      state.player.stats[effect.statId] = clamp(currentValue + effect.amount, 0, 50);
      return;
    }
    case 'modifyHealth':
      modifyPlayerHealth(state, catalog, effect.amount);
      return;
    case 'acquireShip': {
      if (!canAcquireShip(state, catalog, effect.shipId, effect.allowWithoutLeadership === true)) throw new Error(`Ship "${effect.shipId}" cannot be acquired with the current leadership, crew, passengers, or cargo.`);
      if (effect.name.trim().length === 0) throw new Error('Acquired ship requires a name.');
      const definition = findShipDefinition(catalog, effect.shipId);
      const health = effect.health ?? definition.maxHealth;
      if (!Number.isFinite(health) || health <= 0 || health > definition.maxHealth) throw new Error(`Invalid initial health for Ship "${effect.shipId}".`);
      const acquired = { shipId: effect.shipId, name: effect.name.trim(), health, cargo: [] };
      if (state.ship === null) state.ship = acquired;
      else state.pendingShip = acquired;
      return;
    }
    case 'modifyShipHealth': {
      if (state.ship === null) throw new Error('Cannot modify ship health without a ship.');
      const maximum = findShipDefinition(catalog, state.ship.shipId).maxHealth;
      state.ship.health = clamp(state.ship.health + effect.amount, 0, maximum);
      return;
    }
    case 'addCargoItem': {
      requireLeadership(state, effect.allowWithoutLeadership);
      if (state.ship === null) throw new Error('Cannot add cargo without a ship.');
      addStack(state.ship.cargo, effect.itemId, effect.quantity, findShipDefinition(catalog, state.ship.shipId).cargoSlots - state.passengerNpcIds.length, findItemDefinition(catalog, effect.itemId).stackLimit);
      return;
    }
    case 'removeCargoItem':
      requireLeadership(state, effect.allowWithoutLeadership);
      if (state.ship === null) throw new Error('Cannot remove cargo without a ship.');
      removeStack(state.ship.cargo, effect.itemId, effect.quantity);
      return;
    case 'resolveShipReplacement': {
      requireLeadership(state, effect.allowWithoutLeadership);
      if (state.ship === null || state.pendingShip === null) throw new Error('No pending ship replacement to resolve.');
      if (effect.disposition === 'destroy' && state.travelState !== 'on_land') throw new Error('A ship can only be destroyed on land during replacement.');
      if (effect.disposition === 'sell') {
        const location = catalog.locations.find(({ id }) => id === state.locationId);
        if (!location || location.shipMarket === 'none') throw new Error('Current Location does not allow ship sales.');
        const proceeds = effect.berries ?? 0;
        if (!Number.isInteger(proceeds) || proceeds < 0) throw new Error('Ship sale Berrys must be a non-negative integer.');
        state.berries += proceeds;
      }
      state.pendingShip.cargo = state.ship.cargo.map((stack) => ({ ...stack }));
      state.ship = state.pendingShip;
      state.pendingShip = null;
      return;
    }
    case 'modifyBerries': {
      if (!Number.isInteger(effect.amount) || state.berries + effect.amount < 0) throw new Error('Berrys cannot become negative.');
      state.berries += effect.amount;
      return;
    }
    case 'loseShip':
      requireLeadership(state, effect.allowWithoutLeadership);
      state.ship = state.pendingShip;
      state.pendingShip = null;
      movePlayerToLocation(state, effect.locationId, effect.travelState);
      return;
    case 'moveToLocation':
      movePlayerToLocation(state, effect.locationId, effect.travelState);
      return;
    case 'setBirthLocation': {
      const location = catalog.locations.find(({ id }) => id === effect.locationId);
      if (!location || !location.canBeBirthLocation || location.seaId !== state.player.profile.originSeaId) {
        throw new Error(`Birth Location "${effect.locationId}" is incompatible with the selected origin sea.`);
      }
      state.locationId = effect.locationId;
      state.travelState = 'on_land';
      return;
    }
    case 'recoverTravel':
      recoverTravel(state, catalog, effect.mode);
      return;
    case 'moveToSameIslandPort': moveToSameIslandPort(state, catalog); return;
    case 'recoverToLandInCurrentSea': recoverToLandInCurrentSea(state, catalog); return;
    case 'recoverToOtherRegion': recoverToOtherRegion(state, catalog); return;
    case 'beginMaritimeEmergency': beginMaritimeEmergency(state, catalog, effect.cause); return;
    case 'resolveMaritimeEmergencyLandfall': resolveMaritimeEmergencyLandfall(state, catalog); return;
    case 'setNpcStatus': {
      const npcId = resolveNpcTarget(state, effect, context);
      const npc = getNpcState(state, npcId);
      const changesCrew = npc.status === 'crew' || effect.status === 'crew';
      if (changesCrew && effect.status !== 'dead') requireLeadership(state, effect.allowWithoutLeadership);
      if (effect.status === 'crew' && npc.status !== 'crew' && !canRecruitNpc(state, catalog, npcId, effect.allowWithoutLeadership === true)) throw new Error(`Cannot recruit NPC "${npcId}" without leadership or free crew capacity.`);
      if (effect.status === 'crew') state.passengerNpcIds = state.passengerNpcIds.filter((id) => id !== npcId);
      state.npcs[npcId] = { ...npc, status: effect.status };
      if (state.companionNpcId === npcId && (effect.status === 'dead' || effect.status === 'departed')) state.companionNpcId = null;
      return;
    }
    case 'setNpcPassenger': {
      requireLeadership(state, effect.allowWithoutLeadership);
      const npc = getNpcState(state, effect.npcId);
      if (effect.passenger) {
        if (npc.status === 'crew' || npc.status === 'dead') throw new Error('Crew or dead NPCs cannot be passengers.');
        if (state.ship === null) throw new Error('Cannot add a passenger without a ship.');
        if (!state.passengerNpcIds.includes(effect.npcId)) {
          const cargoSlots = findShipDefinition(catalog, state.ship.shipId).cargoSlots;
          if (state.ship.cargo.length + state.passengerNpcIds.length >= cargoSlots) throw new Error('No free cargo slot for a passenger.');
          state.passengerNpcIds.push(effect.npcId);
        }
      } else state.passengerNpcIds = state.passengerNpcIds.filter((npcId) => npcId !== effect.npcId);
      return;
    }
    case 'setLeadership':
      state.isLeader = effect.isLeader;
      return;
    case 'modifyNpcRelationship': {
      const npc = getNpcState(state, effect.npcId);
      state.npcs[effect.npcId] = {
        ...npc,
        relationship: clamp(npc.relationship + effect.amount, -100, 100),
      };
      return;
    }
    case 'modifyNpcStat': {
      const npcId = resolveNpcTarget(state, effect, context);
      const npc = getNpcState(state, npcId);
      state.npcs[npcId] = {
        ...npc,
        stats: {
          ...npc.stats,
          [effect.statId]: clamp(npc.stats[effect.statId] + effect.amount, 0, 50),
        },
      };
      return;
    }
    case 'scheduleEvent':
      state.scheduledEvents.push({
        eventId: effect.eventId,
        dueAgeMonths: state.ageMonths + effect.delayMonths,
        sourceEventId: context.sourceEventId,
        sourceChoiceId: context.sourceChoiceId,
      });
      return;
    case 'queueImmediateEvent':
      state.immediateEventQueue.push(effect.eventId);
      return;
    case 'setCareerPhase':
      state.careerPhase = effect.phase;
      return;
    case 'setRace': {
      if (state.player.profile.raceId !== null) throw new Error('Race can only be set once.');
      const race = catalog.races.find(({ id }) => id === effect.raceId);
      if (!race) throw new Error(`Unknown Race "${effect.raceId}".`);
      if (!race.playableV1) throw new Error(`Race "${effect.raceId}" is locked for the current V1 content surface.`);
      state.player.profile.raceId = effect.raceId;
      state.player.stats.health = race.initialHealth;
      applyAttributeModifiers(state, race.attributeModifiers);
      return;
    }
    case 'setOriginSea':
      state.player.profile.originSeaId = effect.seaId;
      return;
    case 'setAffiliation': {
      const affiliation = catalog.affiliations.find(({ id }) => id === effect.affiliationId);
      if (!affiliation) throw new Error(`Unknown Affiliation "${effect.affiliationId}".`);
      if (!affiliation.playableV1) throw new Error(`Affiliation "${effect.affiliationId}" is locked for the current V1 content surface.`);
      state.player.profile.affiliationId = effect.affiliationId;
      return;
    }
    case 'setFamilyStructure': {
      if (state.player.profile.familyStructureId !== null) throw new Error('Family structure can only be set once.');
      const definition = catalog.familyStructures.find(({ id }) => id === effect.familyStructureId);
      if (!definition) throw new Error(`Unknown FamilyStructure "${effect.familyStructureId}".`);
      state.player.profile.familyStructureId = effect.familyStructureId;
      applyAttributeModifiers(state, definition.attributeModifiers);
      if (effect.familyStructureId !== 'orphan') {
        const parentCount = effect.familyStructureId === 'two_parents' ? 2 : 1;
        for (let index = 1; index <= parentCount; index += 1) {
          const parentId = `player_parent_${index}`;
          const parent = ensureNpcMaterialized(state, catalog, parentId);
          state.npcs[parentId] = {
            ...parent,
            raceId: state.player.profile.raceId,
          };
        }
      }
      return;
    }
    case 'setSocialClass': {
      if (state.player.profile.socialClassId !== null) throw new Error('Social class can only be set once.');
      const definition = catalog.socialClasses.find(({ id }) => id === effect.socialClassId);
      if (!definition) throw new Error(`Unknown SocialClass "${effect.socialClassId}".`);
      state.player.profile.socialClassId = effect.socialClassId;
      applyAttributeModifiers(state, definition.attributeModifiers);
      return;
    }
    case 'endCareer':
      state.careerStatus = 'ended';
      state.careerEndReason = effect.reason;
      state.endingId = null;
      state.currentEventId = null;
      state.maritimeEmergency = null;
      return;
    case 'setCareerAffiliation':
      if (!catalog.careerAffiliations.some(({ id }) => id === effect.affiliationId)) throw new Error(`Unknown Career affiliation "${effect.affiliationId}".`);
      state.player.career.affiliationId = effect.affiliationId;
      if (state.player.career.rankId !== null && catalog.careerRanks.find(({ id }) => id === state.player.career.rankId)?.affiliationId !== effect.affiliationId) state.player.career.rankId = null;
      return;
    case 'modifyReputation':
      if (!Number.isInteger(effect.amount)) throw new Error('Reputation modification must be an integer.');
      state.player.career.reputation = clamp(state.player.career.reputation + effect.amount, 0, 100);
      return;
    case 'setBounty':
      if (!Number.isInteger(effect.value) || effect.value < 0) throw new Error('Bounty must be a non-negative integer.');
      state.player.career.bounty = Math.max(0, effect.value);
      return;
    case 'modifyBounty':
      if (!Number.isInteger(effect.amount)) throw new Error('Bounty modification must be an integer.');
      state.player.career.bounty = Math.max(0, state.player.career.bounty + effect.amount);
      return;
    case 'setCareerRank': {
      const rank = effect.rankId === null ? undefined : catalog.careerRanks.find(({ id }) => id === effect.rankId);
      if (effect.rankId !== null && rank === undefined) throw new Error(`Unknown Career rank "${effect.rankId}".`);
      if (rank !== undefined && rank.affiliationId !== state.player.career.affiliationId) throw new Error(`Career rank "${effect.rankId}" is incompatible with affiliation "${state.player.career.affiliationId}".`);
      state.player.career.rankId = effect.rankId;
      return;
    }
    case 'setCareerTitle':
      if (!catalog.careerTitles.some(({ id }) => id === effect.titleId)) throw new Error(`Unknown Career title "${effect.titleId}".`);
      state.player.career.titleId = effect.titleId;
      return;
    case 'clearCareerTitle':
      state.player.career.titleId = null;
      return;
    case 'endCareerWithEnding':
      if (!catalog.endings.some(({ id }) => id === effect.endingId)) throw new Error(`Unknown Ending "${effect.endingId}".`);
      state.careerStatus = 'ended';
      state.careerEndReason = effect.reason ?? 'legacy';
      state.endingId = effect.endingId;
      state.currentEventId = null;
      state.maritimeEmergency = null;
      return;
    case 'consumeDevilFruit': {
      if (!canConsumeDevilFruit(state, catalog, effect.fruitId)) throw new Error(`Devil Fruit "${effect.fruitId}" cannot be consumed.`);
      const fruit = catalog.devilFruits.find(({ id }) => id === effect.fruitId)!;
      if (fruit.itemId === null) throw new Error(`Devil Fruit "${effect.fruitId}" is reference-only.`);
      removeStack(state.player.inventory.stacks, fruit.itemId, 1);
      state.player.powers.devilFruitId = fruit.id;
      state.player.powers.devilFruitAwakening = 0;
      return;
    }
    case 'increaseDevilFruitAwakening':
      if (state.player.powers.devilFruitId === null) throw new Error('Cannot increase Devil Fruit Awakening without a Devil Fruit.');
      if (!Number.isInteger(effect.amount) || effect.amount <= 0) throw new Error('Devil Fruit Awakening increase must be a positive integer.');
      state.player.powers.devilFruitAwakening = clamp(state.player.powers.devilFruitAwakening + effect.amount, 0, 10);
      return;
    case 'awakenHaki':
      if (state.player.powers.haki[effect.hakiType] !== 0) throw new Error(`${effect.hakiType} Haki is already awakened.`);
      if (effect.hakiType !== 'conqueror' && playerHakiSourceTotal(state, effect.hakiType) < 75) throw new Error(`${effect.hakiType} Haki requires a source total of 75.`);
      state.player.powers.haki[effect.hakiType] = 1;
      return;
    case 'raiseConquerorHakiTo':
      if (!Number.isInteger(effect.level) || effect.level < 1 || effect.level > 5 || effect.level < state.player.powers.haki.conqueror) throw new Error('Conqueror Haki level must increase monotonically within 1..5.');
      state.player.powers.haki.conqueror = effect.level;
      return;
    case 'setNpcDevilFruit': {
      const npc = getNpcState(state, effect.npcId);
      if (!catalog.devilFruits.some(({ id }) => id === effect.fruitId)) throw new Error(`Unknown Devil Fruit "${effect.fruitId}".`);
      if (npc.powers.devilFruitId !== null && npc.powers.devilFruitId !== effect.fruitId) throw new Error(`NPC "${effect.npcId}" already has a Devil Fruit.`);
      if (npc.powers.devilFruitId === effect.fruitId) return;
      npc.powers.devilFruitId = effect.fruitId; npc.powers.devilFruitAwakening = 0; state.npcs[effect.npcId] = npc;
      return;
    }
    case 'increaseNpcDevilFruitAwakening': {
      const npc = getNpcState(state, effect.npcId);
      if (npc.powers.devilFruitId === null || !Number.isInteger(effect.amount) || effect.amount <= 0) throw new Error('NPC Devil Fruit Awakening increase requires a Fruit and a positive integer.');
      npc.powers.devilFruitAwakening = clamp(npc.powers.devilFruitAwakening + effect.amount, 0, 10); state.npcs[effect.npcId] = npc;
      return;
    }
    case 'raiseNpcHakiTo': {
      const npc = getNpcState(state, effect.npcId); const current = npc.powers.haki[effect.hakiType];
      if (!Number.isInteger(effect.level) || effect.level < 1 || effect.level > 5 || effect.level < current) throw new Error('NPC Haki level must increase monotonically within 1..5.');
      npc.powers.haki[effect.hakiType] = effect.level; state.npcs[effect.npcId] = npc;
      return;
    }
  }
}

function applyAttributeModifiers(state: GameState, modifiers: Partial<Record<import('../content/schema').StatId, number>>): void {
  for (const [statId, amount] of Object.entries(modifiers) as [import('../content/schema').StatId, number][]) {
    state.player.stats[statId] = clamp(state.player.stats[statId] + amount, 0, 50);
  }
}

function getNpcState(state: GameState, npcId: string): NpcState {
  return state.npcs[npcId] ?? createDefaultNpcState();
}

function resolveNpcTarget(state: GameState, target: { npcId?: string; npcSelector?: 'diceActor' | 'highestRelationshipCrewWithDevilFruit' }, context: EffectContext): string {
  if (target.npcId !== undefined) return target.npcId;
  if (target.npcSelector === 'diceActor' && context.diceActorNpcId !== undefined) return context.diceActorNpcId;
  if (target.npcSelector === 'highestRelationshipCrewWithDevilFruit') {
    const npcId = findHighestRelationshipFruitCrew(state);
    if (npcId !== undefined) return npcId;
  }
  throw new Error(`Dynamic NPC selector "${String(target.npcSelector)}" has no valid target.`);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function requireLeadership(state: GameState, allowWithoutLeadership?: boolean): void {
  if (!state.isLeader && allowWithoutLeadership !== true) throw new Error('This crew or ship management operation requires leadership.');
}
