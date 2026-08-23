import { describe, expect, it } from 'vitest';
import type { ChoiceDefinition, ContentCatalog, EventDefinition } from '../content/schema';
import { createInitialGameState } from '../model/initialState';
import { createDefaultNpcState } from '../model/npcState';
import type { GameState } from '../model/schema';
import {
  chooseMinMaxChoice,
  evaluateMinMaxChoice,
  minmaxSimulationPolicy,
  resetMinMaxTelemetry,
} from './minmaxSimulationPolicy';
import type { SimulationDecisionContext } from './simulationPolicy';

const catalog = {
  schemaVersion: 16,
  races: [],
  seas: [],
  affiliations: [],
  careerAffiliations: [],
  careerRanks: [
    { id: 'marine_recruit', affiliationId: 'marine', sortOrder: 1 },
    { id: 'marine_lieutenant', affiliationId: 'marine', sortOrder: 3 },
  ],
  careerTitles: [],
  endings: [],
  familyStructures: [],
  socialClasses: [],
  locations: [
    { id: 'test_port', shipMarket: 'small_craft', marketItemIds: [], services: [], tags: [] },
  ],
  traits: [
    { id: 'resilient' },
  ],
  economy: {},
  items: [],
  devilFruits: [],
  ships: [
    { id: 'dinghy', maxHealth: 18, crewCapacity: 1, cargoSlots: 1, priceBerries: 5_000 },
    { id: 'sloop', maxHealth: 30, crewCapacity: 3, cargoSlots: 2, priceBerries: 25_000 },
  ],
  crewRoles: [{ id: 'navigator' }, { id: 'medic' }, { id: 'shipwright' }],
  npcs: [],
  majorNarrativeTracks: [],
  events: [],
} as unknown as ContentCatalog;

function state(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialGameState(1);
  return {
    ...base,
    careerPhase: 'active',
    ageMonths: 180,
    locationId: 'test_port',
    travelState: 'on_land',
    isLeader: true,
    berries: 4_500,
    player: {
      ...base.player,
      stats: {
        health: 20,
        morale: 25,
        strength: 25,
        agility: 25,
        observation: 25,
        intelligence: 25,
        navigation: 25,
        charisma: 25,
        luck: 25,
      },
      career: {
        affiliationId: 'civilian',
        reputation: 0,
        bounty: 0,
        rankId: null,
        titleId: null,
      },
      traits: [],
      powers: {
        devilFruitId: null,
        devilFruitAwakening: 0,
        haki: { observation: 0, armament: 0, conqueror: 0 },
      },
    },
    ...overrides,
  };
}

const outcomeKey = 'test.outcome' as any;
const choiceKey = 'test.choice' as any;

function deterministic(id: string, effects: any[]): ChoiceDefinition {
  return {
    id,
    textKey: choiceKey,
    resolution: {
      type: 'deterministic',
      outcome: { id: `${id}_outcome`, textKey: outcomeKey, effects },
    },
  };
}

function event(id: string, choices: ChoiceDefinition[], kind: EventDefinition['kind'] = 'normal'): EventDefinition {
  return {
    id,
    kind,
    titleKey: 'test.title' as any,
    textKey: 'test.body' as any,
    choices,
    ...(kind === 'scheduled' ? { priority: 100 as const } : {}),
    ...(kind === 'critical' ? { trigger: { type: 'fallbackStreakAtLeast' as const, value: 999 } } : {}),
  } as EventDefinition;
}

function context(currentState: GameState, currentEvent: EventDefinition, currentCatalog = catalog): SimulationDecisionContext {
  return { state: currentState, event: currentEvent, catalog: currentCatalog };
}

describe('minmaxSimulationPolicy', () => {
  it('prefers +2 Stat over +1 Stat', () => {
    const choices = [
      deterministic('one', [{ type: 'modifyStat', statId: 'strength', amount: 1 }]),
      deterministic('two', [{ type: 'modifyStat', statId: 'strength', amount: 2 }]),
    ];
    const currentEvent = event('stat_test', choices);
    expect(chooseMinMaxChoice(choices, 123, context(state(), currentEvent)).choice.id).toBe('two');
  });

  it('prefers a new Trait over a small Reputation gain', () => {
    const choices = [
      deterministic('trait', [{ type: 'addTrait', traitId: 'resilient' }]),
      deterministic('rep', [{ type: 'modifyReputation', amount: 5 }]),
    ];
    const currentEvent = event('trait_test', choices);
    expect(chooseMinMaxChoice(choices, 123, context(state(), currentEvent)).choice.id).toBe('trait');
  });

  it('actively prefers recruitment over ordinary cash', () => {
    const recruit = {
      ...createDefaultNpcState(),
      status: 'known' as const,
      statsGenerated: true,
    };
    const currentState = state({ npcs: { recruit } });
    const choices = [
      deterministic('recruit', [{ type: 'setNpcStatus', npcId: 'recruit', status: 'crew' }]),
      deterministic('cash', [{ type: 'modifyBerries', amount: 5_000 }]),
    ];
    const currentEvent = event('recruit_test', choices);
    expect(chooseMinMaxChoice(choices, 123, context(currentState, currentEvent)).choice.id).toBe('recruit');
  });

  it('protects the first-ship savings target instead of spending it for tiny Reputation', () => {
    const currentState = state({ berries: 4_500 });
    const choices = [
      deterministic('save', [{ type: 'modifyBerries', amount: 1_000 }]),
      deterministic('spend', [
        { type: 'modifyBerries', amount: -2_000 },
        { type: 'modifyReputation', amount: 1 },
      ]),
    ];
    const currentEvent = event('ship_fund_test', choices);
    expect(chooseMinMaxChoice(choices, 123, context(currentState, currentEvent)).choice.id).toBe('save');
  });

  it('chooses the higher expected-value Dice approach without consuming gameplay RNG', () => {
    const currentState = state();
    const beforeRng = currentState.rngState;
    const outcomes = {
      criticalFailure: { id: 'cf', textKey: outcomeKey, effects: [{ type: 'modifyStat', statId: 'strength', amount: -2 }] },
      failure: { id: 'f', textKey: outcomeKey, effects: [{ type: 'modifyStat', statId: 'strength', amount: -1 }] },
      success: { id: 's', textKey: outcomeKey, effects: [{ type: 'modifyStat', statId: 'strength', amount: 4 }] },
      criticalSuccess: { id: 'cs', textKey: outcomeKey, effects: [{ type: 'modifyStat', statId: 'strength', amount: 5 }] },
    } as any;
    const easy: ChoiceDefinition = {
      id: 'easy',
      textKey: choiceKey,
      resolution: { type: 'dice', statId: 'strength', successThreshold: 8, outcomes },
    };
    const hard: ChoiceDefinition = {
      id: 'hard',
      textKey: choiceKey,
      resolution: { type: 'dice', statId: 'strength', successThreshold: 18, outcomes },
    };
    const currentEvent = event('dice_test', [easy, hard]);
    expect(chooseMinMaxChoice([easy, hard], 123, context(currentState, currentEvent)).choice.id).toBe('easy');
    expect(currentState.rngState).toBe(beforeRng);
  });

  it('looks through an Immediate continuation to find recruitment', () => {
    const recruit = {
      ...createDefaultNpcState(),
      status: 'known' as const,
      statsGenerated: true,
    };
    const currentState = state({ npcs: { recruit } });
    const immediateChoice = deterministic('take_aboard', [{ type: 'setNpcStatus', npcId: 'recruit', status: 'crew' }]);
    const immediateEvent = event('recruit_immediate', [immediateChoice], 'immediate');
    const currentCatalog = { ...catalog, events: [immediateEvent] } as ContentCatalog;
    const choices = [
      deterministic('open_route', [{ type: 'queueImmediateEvent', eventId: 'recruit_immediate' }]),
      deterministic('small_rep', [{ type: 'modifyReputation', amount: 2 }]),
    ];
    const currentEvent = event('lookahead_test', choices);
    expect(chooseMinMaxChoice(choices, 123, context(currentState, currentEvent, currentCatalog)).choice.id).toBe('open_route');
  });

  it('rejects a mechanically invalid projected Choice when another legal Choice exists', () => {
    const choices = [
      deterministic('invalid_spend', [{ type: 'modifyBerries', amount: -99_999 }]),
      deterministic('safe', [{ type: 'modifyReputation', amount: 1 }]),
    ];
    const currentEvent = event('invalid_test', choices);
    expect(evaluateMinMaxChoice(choices[0], context(state(), currentEvent)).invalid).toBe(true);
    expect(chooseMinMaxChoice(choices, 123, context(state(), currentEvent)).choice.id).toBe('safe');
  });

  it('keeps Progression system behavior for a normal-price Dinghy purchase', () => {
    resetMinMaxTelemetry();
    const currentState = state({ berries: 5_000 });
    const accept = deterministic('market:accept', [{ type: 'buyShip', shipId: 'dinghy' }]);
    const back = deterministic('market:port', []);
    const currentEvent = event('system_market:confirm:ship:buy:dinghy', [accept, back], 'system');
    expect(minmaxSimulationPolicy.choose([accept, back], 123, context(currentState, currentEvent)).choice.id).toBe('market:accept');
  });

  it('avoids an elective early career ending when progression remains available', () => {
    const choices = [
      deterministic('retire_now', [{ type: 'endCareer', reason: 'legacy' }]),
      deterministic('keep_growing', [{ type: 'modifyReputation', amount: 1 }]),
    ];
    const currentEvent = event('early_end_test', choices);
    expect(chooseMinMaxChoice(choices, 123, context(state(), currentEvent)).choice.id).toBe('keep_growing');
  });

  it('does not consume policy RNG when there is a unique best Choice', () => {
    const choices = [
      deterministic('best', [{ type: 'modifyStat', statId: 'strength', amount: 2 }]),
      deterministic('worse', [{ type: 'modifyStat', statId: 'strength', amount: 1 }]),
    ];
    const currentEvent = event('rng_test', choices);
    expect(chooseMinMaxChoice(choices, 0x12345678, context(state(), currentEvent)).nextRngState).toBe(0x12345678);
  });
});
