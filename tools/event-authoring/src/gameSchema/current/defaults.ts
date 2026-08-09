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
    case 'locationIs': return { type, locationId: '' };
    case 'isAtSea': return { type };
    case 'isOnLand': return { type };
    case 'careerPhaseIs': return { type, phase: 'childhood' };
    case 'ageAtLeastMonths': return { type, value: 0 };
    case 'ageAtMostMonths': return { type, value: 0 };
    case 'shipConditionAtLeast': return { type, value: 0 };
    case 'shipConditionAtMost': return { type, value: 100 };
    case 'npcStatusIs': return { type, npcId: '', status: 'known' };
    case 'npcRelationshipAtLeast': return { type, npcId: '', value: 0 };
    case 'npcStatAtLeast': return { type, npcId: '', statId: 'loyalty', value: 0 };
    case 'hasChosen': return { type, eventId: '', choiceId: '' };
    case 'hasPlayed': return { type, eventId: '' };
    case 'hasOutcome': return { type, eventId: '', outcomeId: '' };
    case 'raceIs': return { type, raceId: '' };
    case 'originSeaIs': return { type, seaId: '' };
    case 'affiliationIs': return { type, affiliationId: '' };
  }
};

export const createEffect = (type: Effect['type']): Effect => {
  switch (type) {
    case 'setFlag': return { type, flagId: '' };
    case 'clearFlag': return { type, flagId: '' };
    case 'addItem': return { type, itemId: '' };
    case 'removeItem': return { type, itemId: '' };
    case 'addTrait': return { type, traitId: '' };
    case 'removeTrait': return { type, traitId: '' };
    case 'modifyStat': return { type, statId: 'luck', amount: 0 };
    case 'modifyShipCondition': return { type, amount: 0 };
    case 'loseShip': return { type, locationId: '', travelState: 'on_land' };
    case 'moveToLocation': return { type, locationId: '', travelState: 'on_land' };
    case 'setNpcStatus': return { type, npcId: '', status: 'known' };
    case 'modifyNpcRelationship': return { type, npcId: '', amount: 0 };
    case 'modifyNpcStat': return { type, npcId: '', statId: 'loyalty', amount: 0 };
    case 'scheduleEvent': return { type, eventId: '', delayMonths: 0 };
    case 'setCareerPhase': return { type, phase: 'active' };
    case 'setRace': return { type, raceId: '' };
    case 'setOriginSea': return { type, seaId: '' };
    case 'setAffiliation': return { type, affiliationId: '' };
    case 'endCareer': return { type, reason: 'death' };
  }
};

