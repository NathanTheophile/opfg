import type { Condition, Effect, EventDefinition, NpcStats, Outcome, Resolution } from './contract';
import { choiceKey, eventKeys, outcomeKey } from '../../localization/keys';

export const createNpcStats = (): NpcStats => ({
  health: 25, morale: 25, strength: 25, observation: 25,
  intelligence: 25, luck: 25, loyalty: 25, calm: 25,
});

export const createOutcome = (eventId = 'event', choiceId = 'choice', id = 'outcome'): Outcome => ({
  id,
  textKey: outcomeKey(eventId, choiceId, id),
  effects: [],
});

export const createDeterministicResolution = (eventId = 'event', choiceId = 'choice'): Resolution => ({
  type: 'deterministic',
  outcome: createOutcome(eventId, choiceId, 'outcome'),
});

export const createDiceResolution = (eventId = 'event', choiceId = 'choice'): Resolution => ({
  type: 'dice',
  statId: 'luck',
  successThreshold: 12,
  modifiers: [],
  traitOverrides: [],
  outcomes: {
    criticalFailure: createOutcome(eventId, choiceId, 'critical_failure'),
    failure: createOutcome(eventId, choiceId, 'failure'),
    success: createOutcome(eventId, choiceId, 'success'),
    criticalSuccess: createOutcome(eventId, choiceId, 'critical_success'),
  },
});

export const createEvent = (id: string): EventDefinition => ({
  id,
  ...eventKeys(id),
  kind: 'normal',
  choices: [],
});

export const createChoice = (eventId: string, id: string) => ({
  id,
  textKey: choiceKey(eventId, id),
  resolution: createDeterministicResolution(eventId, id),
});

export const createCondition = (type: Condition['type']): Condition => {
  switch (type) {
    case 'all': return { type, conditions: [] };
    case 'any': return { type, conditions: [] };
    case 'not': return { type, condition: { type: 'hasFlag', flagId: '' } };
    case 'hasTrait': return { type, traitId: '' };
    case 'statAtLeast': return { type, statId: 'luck', value: 20 };
    case 'hasFlag': return { type, flagId: '' };
    case 'hasItem': return { type, itemId: '' };
    case 'berriesAtLeast': return { type, value: 0 };
    case 'hasCrew': return { type };
    case 'crewSizeAtLeast': return { type, value: 1 };
    case 'hasCrewRole': return { type, roleId: '' };
    case 'canRecruitNpc': return { type, npcId: '' };
    case 'isLeader': return { type };
    case 'locationIs': return { type, locationId: '' };
    case 'isAtSea': return { type };
    case 'isOnLand': return { type };
    case 'careerPhaseIs': return { type, phase: 'childhood' };
    case 'ageAtLeastMonths': return { type, value: 0 };
    case 'ageAtMostMonths': return { type, value: 0 };
    case 'hasShip': return { type };
    case 'shipIs': return { type, shipId: '' };
    case 'shipHealthAtLeast': return { type, value: 0 };
    case 'shipHealthAtMost': return { type, value: 100 };
    case 'shipCrewCapacityAtLeast': return { type, value: 0 };
    case 'shipCargoSpaceAtLeast': return { type, value: 0 };
    case 'canAcquireShip': return { type, shipId: '' };
    case 'canSellShip': return { type };
    case 'npcStatusIs': return { type, npcId: '', status: 'known' };
    case 'npcRelationshipAtLeast': return { type, npcId: '', value: 0 };
    case 'npcStatAtLeast': return { type, npcId: '', statId: 'loyalty', value: 0 };
    case 'hasChosen': return { type, eventId: '', choiceId: '' };
    case 'hasPlayed': return { type, eventId: '' };
    case 'hasOutcome': return { type, eventId: '', outcomeId: '' };
    case 'raceIs': return { type, raceId: '' };
    case 'originSeaIs': return { type, seaId: '' };
    case 'affiliationIs': return { type, affiliationId: '' };
    case 'familyStructureIs': return { type, familyStructureId: '' };
    case 'socialClassIs': return { type, socialClassId: '' };
    case 'hasDevilFruit': case 'devilFruitIsAwakened': return { type };
    case 'canConsumeDevilFruit': case 'devilFruitIs': return { type, fruitId: '' };
    case 'devilFruitTypeIs': return { type, fruitType: 'paramecia' };
    case 'devilFruitHasTag': return { type, tagId: 'mobility' };
    case 'devilFruitAwakeningAtLeast': return { type, value: 1 };
    case 'hakiAtLeast': return { type, hakiType: 'observation', level: 1 };
    case 'hakiIsAwakened': return { type, hakiType: 'observation' };
    case 'hakiSourceTotalAtLeast': return { type, hakiType: 'observation', value: 75 };
    case 'npcHasDevilFruit': return { type, npcId: '' };
    case 'npcDevilFruitIs': return { type, npcId: '', fruitId: '' };
    case 'npcDevilFruitTypeIs': return { type, npcId: '', fruitType: 'paramecia' };
    case 'npcDevilFruitHasTag': return { type, npcId: '', tagId: 'mobility' };
    case 'npcDevilFruitAwakeningAtLeast': return { type, npcId: '', value: 1 };
    case 'npcHakiAtLeast': return { type, npcId: '', hakiType: 'observation', level: 1 };
    case 'npcHakiIsAwakened': return { type, npcId: '', hakiType: 'observation' };
    case 'careerAffiliationIs': return { type, affiliationId: 'civilian' };
    case 'reputationAtLeast': case 'reputationAtMost': case 'bountyAtLeast': return { type, value: 0 };
    case 'marineRankIs': case 'marineRankAtLeast': return { type, rankId: '' };
    case 'careerTitleIs': return { type, titleId: '' };
  }
};

export const createEffect = (type: Effect['type']): Effect => {
  switch (type) {
    case 'setFlag': return { type, flagId: '' };
    case 'clearFlag': return { type, flagId: '' };
    case 'addItem': return { type, itemId: '', quantity: 1 };
    case 'removeItem': return { type, itemId: '', quantity: 1 };
    case 'addTrait': return { type, traitId: '' };
    case 'removeTrait': return { type, traitId: '' };
    case 'modifyStat': return { type, statId: 'luck', amount: 0 };
    case 'modifyHealth': return { type, amount: 0 };
    case 'acquireShip': return { type, shipId: '', name: '' };
    case 'modifyShipHealth': return { type, amount: 0 };
    case 'addCargoItem': return { type, itemId: '', quantity: 1 };
    case 'removeCargoItem': return { type, itemId: '', quantity: 1 };
    case 'resolveShipReplacement': return { type, disposition: 'abandon' };
    case 'modifyBerries': return { type, amount: 0 };
    case 'loseShip': return { type, locationId: '', travelState: 'on_land' };
    case 'moveToLocation': return { type, locationId: '', travelState: 'on_land' };
    case 'setBirthLocation': return { type, locationId: '' };
    case 'setNpcStatus': return { type, npcId: '', status: 'known' };
    case 'setNpcPassenger': return { type, npcId: '', passenger: true };
    case 'setLeadership': return { type, isLeader: true };
    case 'modifyNpcRelationship': return { type, npcId: '', amount: 0 };
    case 'modifyNpcStat': return { type, npcId: '', statId: 'loyalty', amount: 0 };
    case 'scheduleEvent': return { type, eventId: '', delayMonths: 0 };
    case 'queueImmediateEvent': return { type, eventId: '' };
    case 'setCareerPhase': return { type, phase: 'active' };
    case 'setRace': return { type, raceId: '' };
    case 'setOriginSea': return { type, seaId: '' };
    case 'setAffiliation': return { type, affiliationId: '' };
    case 'setFamilyStructure': return { type, familyStructureId: '' };
    case 'setSocialClass': return { type, socialClassId: '' };
    case 'endCareer': return { type, reason: 'death' };
    case 'consumeDevilFruit': return { type, fruitId: '' };
    case 'increaseDevilFruitAwakening': return { type, amount: 1 };
    case 'awakenHaki': return { type, hakiType: 'observation' };
    case 'raiseConquerorHakiTo': return { type, level: 1 };
    case 'setNpcDevilFruit': return { type, npcId: '', fruitId: '' };
    case 'increaseNpcDevilFruitAwakening': return { type, npcId: '', amount: 1 };
    case 'raiseNpcHakiTo': return { type, npcId: '', hakiType: 'observation', level: 1 };
    case 'setCareerAffiliation': return { type, affiliationId: 'civilian' };
    case 'modifyReputation': case 'modifyBounty': return { type, amount: 0 };
    case 'setBounty': return { type, value: 0 };
    case 'setMarineRank': return { type, rankId: null };
    case 'setCareerTitle': return { type, titleId: '' };
    case 'clearCareerTitle': return { type };
    case 'endCareerWithEnding': return { type, endingId: '' };
  }
};
