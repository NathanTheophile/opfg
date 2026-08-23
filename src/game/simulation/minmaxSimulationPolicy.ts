import type {
  ChoiceDefinition,
  ContentCatalog,
  DiceResolution,
  Effect,
  EventDefinition,
  Outcome,
  StatId,
} from '../content/schema';
import { evaluateDiceRoll } from '../engine/dice';
import { applyEffects } from '../engine/effects';
import {
  canBuyItem,
  canBuyShip,
  canSellItem,
  canSellShip,
  itemBuyPrice,
  itemSellPrice,
  shipBuyPrice,
  shipSellPrice,
} from '../engine/economy';
import { canConsumeDevilFruit, playerHakiSourceTotal } from '../engine/powers';
import { canAcquireShip, canRecruitNpc, countCurrentCrew, findShipDefinition } from '../engine/ship';
import type { GameState } from '../model/schema';
import {
  progressionSimulationPolicy,
  randomSimulationPolicy,
  type SimulationChoice,
  type SimulationDecisionContext,
  type SimulationPolicy,
} from './simulationPolicy';

/**
 * FAST min-max strategy.
 *
 * Direct Choices are scored statically from their mechanical Effects.
 * Immediate arcs use a cached structural potential scan instead of projected
 * GameState recursion. Only the final selected candidate is projected through
 * applyEffects to verify that it is mechanically legal.
 *
 * This preserves goal-driven behavior while keeping the cost close to the
 * ordinary progression simulator instead of growing combinatorially.
 */
export const MAX_MINMAX_LOOKAHEAD_DEPTH = 3;
export const IMMEDIATE_LOOKAHEAD_DISCOUNT = 0.85;
const SCORE_EPSILON = 1e-6;
const INVALID_SCORE = Number.NEGATIVE_INFINITY;

export const MINMAX_WEIGHTS = {
  playerDeath: -1_000_000,
  playerHealth: 2_000,

  loseExistingShip: -150_000,
  acquireFirstShip: 80_000,
  shipQualityPoint: 2_000,
  shipHealth: 750,

  loseCrewMember: -100_000,
  recruitCrewMember: 70_000,

  consumeDevilFruit: 120_000,
  awakenHaki: 100_000,
  devilFruitAwakening: 25_000,
  hakiLevel: 30_000,

  careerRankStep: 35_000,
  careerTitleGain: 25_000,
  careerAffiliationGain: 10_000,
  endCareerEarly: -500_000,

  traitGain: 20_000,
  traitLoss: -20_000,

  statPoint: 2_000,
  reputationPoint: 300,
  bountyPer1000: 150,

  relationshipPoint: 50,
  npcStatPoint: 100,

  itemGain: 1_000,
  berriesPer100: 25,
  shipFundBerriesPer100: 150,
} as const;

export interface MinMaxScoreBreakdown {
  total: number;
  survival: number;
  ship: number;
  crew: number;
  powers: number;
  career: number;
  traits: number;
  stats: number;
  reputation: number;
  bounty: number;
  economy: number;
  relationships: number;
  items: number;
  lookahead: number;
}

interface ProgressionFlags {
  crew: boolean;
  trait: boolean;
  fruit: boolean;
  haki: boolean;
  ship: boolean;
}

interface StructuralPotential {
  score: number;
  flags: ProgressionFlags;
}

export interface MinMaxChoiceEvaluation {
  choice: ChoiceDefinition;
  score: number;
  breakdown: MinMaxScoreBreakdown;
  invalid: boolean;
  flags: ProgressionFlags;
}

export interface MinMaxTelemetry {
  choicesEvaluated: number;
  uniqueBestSelections: number;
  seededTieBreaks: number;
  invalidChoicesRejected: number;
  diceChoicesEvaluated: number;
  immediateLookaheadsEvaluated: number;
  maxLookaheadDepthObserved: number;
  staticLookaheadCacheMisses: number;
  projectedCandidatesValidated: number;

  recruitmentOpportunities: number;
  recruitmentOpportunitiesTaken: number;
  traitGainOpportunities: number;
  traitGainOpportunitiesTaken: number;
  fruitGainOpportunities: number;
  fruitGainOpportunitiesTaken: number;
  hakiGainOpportunities: number;
  hakiGainOpportunitiesTaken: number;
  shipPurchaseOpportunities: number;
  shipPurchaseOpportunitiesTaken: number;
}

let telemetry = createEmptyTelemetry();
let structuralPotentialCache = new WeakMap<ContentCatalog, Map<string, StructuralPotential>>();

export function resetMinMaxTelemetry(): void {
  telemetry = createEmptyTelemetry();
  structuralPotentialCache = new WeakMap<ContentCatalog, Map<string, StructuralPotential>>();
}

export function getMinMaxTelemetry(): MinMaxTelemetry {
  return { ...telemetry };
}

export const minmaxSimulationPolicy: SimulationPolicy = {
  id: 'minmax',
  choose(choices, rngState, context) {
    if (choices.length === 0) throw new Error('No available Choice for the selected Event.');
    if (!context) return randomSimulationPolicy.choose(choices, rngState);

    // System behavior remains exactly aligned with Progression.
    if (context.event.kind === 'system') {
      const selection = progressionSimulationPolicy.choose(choices, rngState, context);
      recordSystemOpportunity(choices, selection, context);
      return selection;
    }

    return chooseMinMaxChoice(choices, rngState, context);
  },
  chooseNavigation: progressionSimulationPolicy.chooseNavigation,
  chooseCrewRole: progressionSimulationPolicy.chooseCrewRole,
};

function recordSystemOpportunity(
  choices: readonly ChoiceDefinition[],
  selection: SimulationChoice,
  context: SimulationDecisionContext,
): void {
  if (
    context.state.ship === null
    && context.event.id.startsWith('system_market:confirm:ship:buy:')
    && choices.some(({ id }) => id === 'market:accept')
  ) {
    telemetry.shipPurchaseOpportunities += 1;
    if (selection.choice.id === 'market:accept') telemetry.shipPurchaseOpportunitiesTaken += 1;
  }
}

export function chooseMinMaxChoice(
  choices: readonly ChoiceDefinition[],
  rngState: number,
  context: SimulationDecisionContext,
): SimulationChoice {
  if (choices.length === 0) throw new Error('No available Choice for the selected Event.');
  if (choices.length === 1) return { choice: choices[0], nextRngState: rngState };

  const evaluations = choices.map((choice) => evaluateMinMaxChoice(choice, context));
  telemetry.choicesEvaluated += evaluations.length;
  telemetry.invalidChoicesRejected += evaluations.filter(({ invalid }) => invalid).length;

  const remaining = evaluations.filter(({ invalid }) => !invalid);
  if (remaining.length === 0) return randomSimulationPolicy.choose(choices, rngState, context);

  // Validate only candidates that could actually win. This is the critical
  // performance difference versus the previous implementation, which cloned
  // and projected every branch (and every lookahead branch).
  let policyRngState = rngState;
  while (remaining.length > 0) {
    const bestScore = Math.max(...remaining.map(({ score }) => score));
    const best = remaining.filter(({ score }) => Math.abs(score - bestScore) <= SCORE_EPSILON);

    let candidate: MinMaxChoiceEvaluation;
    if (best.length === 1) {
      candidate = best[0];
    } else {
      const tie = randomSimulationPolicy.choose(best.map(({ choice }) => choice), policyRngState, context);
      policyRngState = tie.nextRngState;
      candidate = best.find(({ choice }) => choice.id === tie.choice.id)!;
    }

    telemetry.projectedCandidatesValidated += 1;
    if (isChoiceMechanicallyValid(candidate.choice, context)) {
      if (best.length === 1) telemetry.uniqueBestSelections += 1;
      else telemetry.seededTieBreaks += 1;
      recordOpportunities(evaluations, candidate);
      return { choice: candidate.choice, nextRngState: policyRngState };
    }

    candidate.invalid = true;
    candidate.score = INVALID_SCORE;
    telemetry.invalidChoicesRejected += 1;
    remaining.splice(remaining.indexOf(candidate), 1);
  }

  // Do not manufacture legality if all authored choices fail projection.
  return randomSimulationPolicy.choose(choices, policyRngState, context);
}

export function evaluateMinMaxChoice(
  choice: ChoiceDefinition,
  context: SimulationDecisionContext,
): MinMaxChoiceEvaluation {
  if (choice.resolution.type === 'deterministic') {
    const invalid = !isOutcomeObviouslyValid(choice.resolution.outcome, context.state, context.catalog);
    if (invalid) return invalidEvaluation(choice);
    const evaluated = scoreOutcomeStatic(choice.resolution.outcome, context.state, context.catalog);
    return { choice, score: evaluated.breakdown.total, breakdown: evaluated.breakdown, invalid: false, flags: evaluated.flags };
  }

  telemetry.diceChoicesEvaluated += 1;
  const weighted = weightedDiceOutcomes(choice.resolution, context.state, context.catalog);
  if (weighted.some(({ outcome }) => !isOutcomeObviouslyValid(outcome, context.state, context.catalog))) {
    return invalidEvaluation(choice);
  }

  const breakdown = emptyBreakdown();
  const flags = emptyFlags();
  for (const entry of weighted) {
    const evaluated = scoreOutcomeStatic(entry.outcome, context.state, context.catalog);
    addBreakdown(breakdown, evaluated.breakdown, entry.weight);
    mergeFlags(flags, evaluated.flags);
  }
  breakdown.total = sumBreakdown(breakdown);
  return { choice, score: breakdown.total, breakdown, invalid: false, flags };
}

function invalidEvaluation(choice: ChoiceDefinition): MinMaxChoiceEvaluation {
  return {
    choice,
    score: INVALID_SCORE,
    breakdown: emptyBreakdown(INVALID_SCORE),
    invalid: true,
    flags: emptyFlags(),
  };
}

function weightedDiceOutcomes(
  resolution: DiceResolution,
  state: GameState,
  catalog: ContentCatalog,
): Array<{ outcome: Outcome; actorNpcId?: string; weight: number }> {
  const groups = new Map<string, { outcome: Outcome; actorNpcId?: string; count: number }>();
  for (let rawRoll = 1; rawRoll <= 20; rawRoll += 1) {
    const dice = evaluateDiceRoll(resolution, state, rawRoll, false, catalog);
    const outcome = resolution.outcomes[dice.result];
    const key = `${dice.result}:${dice.actorNpcId ?? ''}`;
    const existing = groups.get(key);
    if (existing) existing.count += 1;
    else groups.set(key, { outcome, ...(dice.actorNpcId ? { actorNpcId: dice.actorNpcId } : {}), count: 1 });
  }
  return [...groups.values()].map(({ outcome, actorNpcId, count }) => ({
    outcome,
    ...(actorNpcId ? { actorNpcId } : {}),
    weight: count / 20,
  }));
}

function scoreOutcomeStatic(
  outcome: Outcome,
  state: GameState,
  catalog: ContentCatalog,
): { breakdown: MinMaxScoreBreakdown; flags: ProgressionFlags } {
  const breakdown = emptyBreakdown();
  const flags = emptyFlags();
  let berryDelta = 0;

  for (const effect of outcome.effects) {
    switch (effect.type) {
      case 'modifyBerries':
        berryDelta += effect.amount;
        break;
      case 'buyShip': {
        const definition = catalog.ships.find(({ id }) => id === effect.shipId);
        if (definition) {
          if (state.ship === null) {
            breakdown.ship += MINMAX_WEIGHTS.acquireFirstShip + shipDefinitionQuality(definition) * MINMAX_WEIGHTS.shipQualityPoint;
            flags.ship = true;
          }
          berryDelta -= shipBuyPrice(catalog, effect.shipId, effect.negotiation);
        }
        break;
      }
      case 'sellShip':
        if (state.ship) {
          breakdown.ship += MINMAX_WEIGHTS.loseExistingShip;
          berryDelta += shipSellPrice(state, catalog, state.ship.shipId, effect.negotiation);
        }
        break;
      case 'acquireShip': {
        const definition = catalog.ships.find(({ id }) => id === effect.shipId);
        if (definition) {
          if (state.ship === null) {
            breakdown.ship += MINMAX_WEIGHTS.acquireFirstShip + shipDefinitionQuality(definition) * MINMAX_WEIGHTS.shipQualityPoint;
            flags.ship = true;
          } else {
            const active = findShipDefinition(catalog, state.ship.shipId);
            breakdown.ship += Math.max(0, shipDefinitionQuality(definition) - shipDefinitionQuality(active)) * MINMAX_WEIGHTS.shipQualityPoint;
          }
        }
        break;
      }
      case 'loseShip':
        if (state.ship !== null) breakdown.ship += MINMAX_WEIGHTS.loseExistingShip;
        break;
      case 'modifyShipHealth':
        breakdown.ship += effect.amount * MINMAX_WEIGHTS.shipHealth;
        break;
      case 'resolveShipReplacement':
        berryDelta += effect.disposition === 'sell' ? effect.berries ?? 0 : 0;
        break;
      case 'setNpcStatus': {
        const npcId = effect.npcId;
        if (npcId !== undefined) {
          const beforeStatus = state.npcs[npcId]?.status;
          if (effect.status === 'crew' && beforeStatus !== 'crew') {
            breakdown.crew += MINMAX_WEIGHTS.recruitCrewMember;
            flags.crew = true;
          } else if (beforeStatus === 'crew' && effect.status !== 'crew') {
            breakdown.crew += MINMAX_WEIGHTS.loseCrewMember;
          }
        }
        break;
      }
      case 'addTrait':
        if (!state.player.traits.includes(effect.traitId)) {
          breakdown.traits += MINMAX_WEIGHTS.traitGain;
          flags.trait = true;
        }
        break;
      case 'removeTrait':
        if (state.player.traits.includes(effect.traitId)) breakdown.traits += MINMAX_WEIGHTS.traitLoss;
        break;
      case 'modifyStat':
        breakdown.stats += effect.amount * MINMAX_WEIGHTS.statPoint;
        break;
      case 'modifyHealth':
        if (state.player.stats.health + effect.amount <= 0) breakdown.survival += MINMAX_WEIGHTS.playerDeath;
        breakdown.survival += effect.amount * MINMAX_WEIGHTS.playerHealth;
        break;
      case 'modifyReputation':
        breakdown.reputation += effect.amount * MINMAX_WEIGHTS.reputationPoint;
        break;
      case 'setBounty':
        breakdown.bounty += ((effect.value - state.player.career.bounty) / 1000) * MINMAX_WEIGHTS.bountyPer1000;
        break;
      case 'modifyBounty':
        breakdown.bounty += (effect.amount / 1000) * MINMAX_WEIGHTS.bountyPer1000;
        break;
      case 'setCareerAffiliation':
        if (effect.affiliationId !== state.player.career.affiliationId) breakdown.career += MINMAX_WEIGHTS.careerAffiliationGain;
        break;
      case 'setCareerRank': {
        const beforeOrder = state.player.career.rankId === null
          ? 0
          : catalog.careerRanks.find(({ id }) => id === state.player.career.rankId)?.sortOrder ?? 0;
        const afterOrder = effect.rankId === null
          ? 0
          : catalog.careerRanks.find(({ id }) => id === effect.rankId)?.sortOrder ?? beforeOrder;
        breakdown.career += (afterOrder - beforeOrder) * MINMAX_WEIGHTS.careerRankStep;
        break;
      }
      case 'setCareerTitle':
        if (effect.titleId !== state.player.career.titleId) breakdown.career += MINMAX_WEIGHTS.careerTitleGain;
        break;
      case 'clearCareerTitle':
        if (state.player.career.titleId !== null) breakdown.career -= MINMAX_WEIGHTS.careerTitleGain;
        break;
      case 'endCareer':
      case 'endCareerWithEnding':
        breakdown.career += MINMAX_WEIGHTS.endCareerEarly;
        break;
      case 'consumeDevilFruit':
        if (state.player.powers.devilFruitId === null) {
          breakdown.powers += MINMAX_WEIGHTS.consumeDevilFruit;
          flags.fruit = true;
        }
        break;
      case 'increaseDevilFruitAwakening':
        breakdown.powers += effect.amount * MINMAX_WEIGHTS.devilFruitAwakening;
        break;
      case 'awakenHaki':
        if (state.player.powers.haki[effect.hakiType] === 0) {
          breakdown.powers += MINMAX_WEIGHTS.awakenHaki + MINMAX_WEIGHTS.hakiLevel;
          flags.haki = true;
        }
        break;
      case 'raiseConquerorHakiTo': {
        const delta = Math.max(0, effect.level - state.player.powers.haki.conqueror);
        breakdown.powers += delta * MINMAX_WEIGHTS.hakiLevel;
        if (delta > 0) flags.haki = true;
        break;
      }
      case 'modifyNpcRelationship':
        breakdown.relationships += effect.amount * MINMAX_WEIGHTS.relationshipPoint;
        break;
      case 'modifyNpcStat': {
        const npcId = effect.npcId;
        if (npcId !== undefined && state.npcs[npcId]?.status === 'crew') {
          breakdown.relationships += effect.amount * MINMAX_WEIGHTS.npcStatPoint;
        }
        break;
      }
      case 'addItem':
        breakdown.items += effect.quantity * MINMAX_WEIGHTS.itemGain;
        break;
      case 'removeItem':
        breakdown.items -= effect.quantity * MINMAX_WEIGHTS.itemGain;
        break;
      case 'buyItem':
        breakdown.items += effect.quantity * MINMAX_WEIGHTS.itemGain;
        berryDelta -= itemBuyPrice(catalog, effect.itemId, effect.quantity, effect.negotiation);
        break;
      case 'sellItem':
        breakdown.items -= effect.quantity * MINMAX_WEIGHTS.itemGain;
        berryDelta += itemSellPrice(catalog, effect.itemId, effect.quantity, state, effect.negotiation);
        break;
      case 'addCargoItem':
        breakdown.items += effect.quantity * MINMAX_WEIGHTS.itemGain;
        break;
      case 'removeCargoItem':
        breakdown.items -= effect.quantity * MINMAX_WEIGHTS.itemGain;
        break;
      case 'setRace': {
        const race = catalog.races.find(({ id }) => id === effect.raceId);
        if (race) {
          breakdown.survival += (race.initialHealth - state.player.stats.health) * MINMAX_WEIGHTS.playerHealth;
          breakdown.stats += modifierTotal(race.attributeModifiers) * MINMAX_WEIGHTS.statPoint;
        }
        break;
      }
      case 'setFamilyStructure': {
        const definition = catalog.familyStructures.find(({ id }) => id === effect.familyStructureId);
        if (definition) breakdown.stats += modifierTotal(definition.attributeModifiers) * MINMAX_WEIGHTS.statPoint;
        break;
      }
      case 'setSocialClass': {
        const definition = catalog.socialClasses.find(({ id }) => id === effect.socialClassId);
        if (definition) breakdown.stats += modifierTotal(definition.attributeModifiers) * MINMAX_WEIGHTS.statPoint;
        break;
      }
      case 'setNpcDevilFruit':
        if (state.npcs[effect.npcId]?.status === 'crew' && state.npcs[effect.npcId]?.powers.devilFruitId === null) {
          breakdown.powers += MINMAX_WEIGHTS.consumeDevilFruit * 0.35;
        }
        break;
      case 'increaseNpcDevilFruitAwakening':
        if (state.npcs[effect.npcId]?.status === 'crew') breakdown.powers += effect.amount * MINMAX_WEIGHTS.devilFruitAwakening * 0.35;
        break;
      case 'raiseNpcHakiTo':
        if (state.npcs[effect.npcId]?.status === 'crew') breakdown.powers += effect.level * MINMAX_WEIGHTS.hakiLevel * 0.35;
        break;
      case 'queueImmediateEvent': {
        telemetry.immediateLookaheadsEvaluated += 1;
        const potential = structuralImmediatePotential(effect.eventId, catalog, 1, new Set<string>());
        breakdown.lookahead += potential.score * IMMEDIATE_LOOKAHEAD_DISCOUNT;
        mergeFlags(flags, potential.flags);
        break;
      }
      default:
        break;
    }
  }

  if (berryDelta !== 0) breakdown.economy += scoreBerryDelta(state, berryDelta, catalog);
  breakdown.total = sumBreakdown(breakdown);
  return { breakdown, flags };
}

function structuralImmediatePotential(
  eventId: string,
  catalog: ContentCatalog,
  depth: number,
  visiting: Set<string>,
): StructuralPotential {
  if (depth > MAX_MINMAX_LOOKAHEAD_DEPTH || visiting.has(eventId)) return { score: 0, flags: emptyFlags() };

  let cache = structuralPotentialCache.get(catalog);
  if (!cache) {
    cache = new Map<string, StructuralPotential>();
    structuralPotentialCache.set(catalog, cache);
  }
  const key = `${eventId}|${MAX_MINMAX_LOOKAHEAD_DEPTH - depth}`;
  const cached = cache.get(key);
  if (cached) return clonePotential(cached);

  telemetry.staticLookaheadCacheMisses += 1;
  telemetry.maxLookaheadDepthObserved = Math.max(telemetry.maxLookaheadDepthObserved, depth);

  const event = catalog.events.find((candidate) => candidate.id === eventId && candidate.kind === 'immediate');
  if (!event) {
    const none = { score: 0, flags: emptyFlags() };
    cache.set(key, none);
    return clonePotential(none);
  }

  const nextVisiting = new Set(visiting);
  nextVisiting.add(eventId);
  const candidates = event.choices.map((choice) => structuralChoicePotential(choice, catalog, depth, nextVisiting));
  const bestScore = Math.max(0, ...candidates.map(({ score }) => score));
  const best = candidates.filter(({ score }) => Math.abs(score - bestScore) <= SCORE_EPSILON);
  const flags = emptyFlags();
  for (const candidate of best) mergeFlags(flags, candidate.flags);
  const result = { score: bestScore, flags };
  cache.set(key, result);
  return clonePotential(result);
}

function structuralChoicePotential(
  choice: ChoiceDefinition,
  catalog: ContentCatalog,
  depth: number,
  visiting: Set<string>,
): StructuralPotential {
  if (choice.resolution.type === 'deterministic') {
    return structuralOutcomePotential(choice.resolution.outcome, catalog, depth, visiting);
  }

  const outcomes = Object.values(choice.resolution.outcomes).map((outcome) => structuralOutcomePotential(outcome, catalog, depth, visiting));
  if (outcomes.length === 0) return { score: 0, flags: emptyFlags() };
  const flags = emptyFlags();
  for (const outcome of outcomes) mergeFlags(flags, outcome.flags);
  return {
    score: outcomes.reduce((sum, outcome) => sum + outcome.score, 0) / outcomes.length,
    flags,
  };
}

function structuralOutcomePotential(
  outcome: Outcome,
  catalog: ContentCatalog,
  depth: number,
  visiting: Set<string>,
): StructuralPotential {
  let score = 0;
  const flags = emptyFlags();

  for (const effect of outcome.effects) {
    switch (effect.type) {
      case 'setNpcStatus':
        if (effect.status === 'crew') { score += MINMAX_WEIGHTS.recruitCrewMember; flags.crew = true; }
        else if (effect.status === 'dead' || effect.status === 'departed') score += MINMAX_WEIGHTS.loseCrewMember * 0.5;
        break;
      case 'buyShip':
      case 'acquireShip': {
        const definition = catalog.ships.find(({ id }) => id === effect.shipId);
        score += MINMAX_WEIGHTS.acquireFirstShip + (definition ? shipDefinitionQuality(definition) * MINMAX_WEIGHTS.shipQualityPoint : 0);
        flags.ship = true;
        break;
      }
      case 'loseShip': score += MINMAX_WEIGHTS.loseExistingShip; break;
      case 'modifyShipHealth': score += effect.amount * MINMAX_WEIGHTS.shipHealth; break;
      case 'addTrait': score += MINMAX_WEIGHTS.traitGain; flags.trait = true; break;
      case 'removeTrait': score += MINMAX_WEIGHTS.traitLoss; break;
      case 'consumeDevilFruit': score += MINMAX_WEIGHTS.consumeDevilFruit; flags.fruit = true; break;
      case 'increaseDevilFruitAwakening': score += effect.amount * MINMAX_WEIGHTS.devilFruitAwakening; break;
      case 'awakenHaki': score += MINMAX_WEIGHTS.awakenHaki + MINMAX_WEIGHTS.hakiLevel; flags.haki = true; break;
      case 'raiseConquerorHakiTo': score += effect.level * MINMAX_WEIGHTS.hakiLevel; flags.haki = true; break;
      case 'setCareerRank': score += MINMAX_WEIGHTS.careerRankStep; break;
      case 'setCareerTitle': score += MINMAX_WEIGHTS.careerTitleGain; break;
      case 'setCareerAffiliation': score += MINMAX_WEIGHTS.careerAffiliationGain; break;
      case 'endCareer':
      case 'endCareerWithEnding': score += MINMAX_WEIGHTS.endCareerEarly; break;
      case 'modifyStat': score += effect.amount * MINMAX_WEIGHTS.statPoint; break;
      case 'modifyHealth': score += effect.amount * MINMAX_WEIGHTS.playerHealth; break;
      case 'modifyReputation': score += effect.amount * MINMAX_WEIGHTS.reputationPoint; break;
      case 'modifyBounty': score += effect.amount / 1000 * MINMAX_WEIGHTS.bountyPer1000; break;
      case 'modifyBerries': score += effect.amount / 100 * MINMAX_WEIGHTS.berriesPer100; break;
      case 'modifyNpcRelationship': score += effect.amount * MINMAX_WEIGHTS.relationshipPoint; break;
      case 'addItem': score += effect.quantity * MINMAX_WEIGHTS.itemGain; break;
      case 'removeItem': score -= effect.quantity * MINMAX_WEIGHTS.itemGain; break;
      case 'queueImmediateEvent': {
        const nested = structuralImmediatePotential(effect.eventId, catalog, depth + 1, visiting);
        score += nested.score * IMMEDIATE_LOOKAHEAD_DISCOUNT;
        mergeFlags(flags, nested.flags);
        break;
      }
      default: break;
    }
  }

  return { score, flags };
}

function isOutcomeObviouslyValid(outcome: Outcome, state: GameState, catalog: ContentCatalog): boolean {
  let berries = state.berries;
  let shadowState = state;

  for (const effect of outcome.effects) {
    switch (effect.type) {
      case 'modifyBerries':
        berries += effect.amount;
        if (berries < 0) return false;
        shadowState = berries === state.berries ? state : { ...state, berries };
        break;
      case 'buyShip':
        if (!canBuyShip(shadowState, catalog, effect.shipId, effect.negotiation)) return false;
        berries -= shipBuyPrice(catalog, effect.shipId, effect.negotiation);
        shadowState = { ...shadowState, berries };
        break;
      case 'sellShip':
        if (!canSellShip(shadowState, catalog)) return false;
        break;
      case 'buyItem':
        if (!canBuyItem(shadowState, catalog, effect.itemId, effect.quantity, effect.negotiation)) return false;
        berries -= itemBuyPrice(catalog, effect.itemId, effect.quantity, effect.negotiation);
        shadowState = { ...shadowState, berries };
        break;
      case 'sellItem':
        if (!canSellItem(shadowState, catalog, effect.itemId, effect.quantity)) return false;
        break;
      case 'acquireShip':
        if (!canAcquireShip(shadowState, catalog, effect.shipId, effect.allowWithoutLeadership === true)) return false;
        break;
      case 'modifyShipHealth':
      case 'addCargoItem':
      case 'removeCargoItem':
        if (shadowState.ship === null) return false;
        break;
      case 'setNpcStatus':
        if (effect.status === 'crew' && effect.npcId !== undefined && shadowState.npcs[effect.npcId]?.status !== 'crew'
          && !canRecruitNpc(shadowState, catalog, effect.npcId, effect.allowWithoutLeadership === true)) return false;
        break;
      case 'consumeDevilFruit':
        if (!canConsumeDevilFruit(shadowState, catalog, effect.fruitId)) return false;
        break;
      case 'awakenHaki':
        if (shadowState.player.powers.haki[effect.hakiType] !== 0) return false;
        if (effect.hakiType !== 'conqueror' && playerHakiSourceTotal(shadowState, effect.hakiType) < 75) return false;
        break;
      default:
        break;
    }
  }
  return true;
}

function isChoiceMechanicallyValid(choice: ChoiceDefinition, context: SimulationDecisionContext): boolean {
  if (choice.resolution.type === 'deterministic') {
    return canApplyOutcome(choice, choice.resolution.outcome, undefined, context);
  }
  return weightedDiceOutcomes(choice.resolution, context.state, context.catalog)
    .every(({ outcome, actorNpcId }) => canApplyOutcome(choice, outcome, actorNpcId, context));
}

function canApplyOutcome(
  choice: ChoiceDefinition,
  outcome: Outcome,
  diceActorNpcId: string | undefined,
  context: SimulationDecisionContext,
): boolean {
  try {
    // applyEffects already creates its own isolated next state. Avoiding the
    // previous structuredClone here removes a second full clone of growing
    // history/NPC/inventory data for every projection.
    applyEffects(context.state, context.catalog, outcome.effects, {
      sourceEventId: context.event.id,
      sourceChoiceId: choice.id,
      ...(diceActorNpcId ? { diceActorNpcId } : {}),
    });
    return true;
  } catch {
    return false;
  }
}

function scoreBerryDelta(state: GameState, delta: number, catalog: ContentCatalog): number {
  let score = delta / 100 * MINMAX_WEIGHTS.berriesPer100;
  if (state.ship !== null) return score;
  const target = cheapestCompatibleShipPrice(state, catalog);
  if (target === null) return score;
  const beforeProgress = Math.min(state.berries, target);
  const afterProgress = Math.min(Math.max(0, state.berries + delta), target);
  score += (afterProgress - beforeProgress) / 100 * MINMAX_WEIGHTS.shipFundBerriesPer100;
  return score;
}

function cheapestCompatibleShipPrice(state: GameState, catalog: ContentCatalog): number | null {
  const crew = countCurrentCrew(state);
  const passengerSlots = state.passengerNpcIds.length;
  const compatible = catalog.ships
    .filter(({ crewCapacity, cargoSlots }) => crewCapacity >= crew && cargoSlots >= passengerSlots)
    .sort((a, b) => a.priceBerries - b.priceBerries || a.id.localeCompare(b.id));
  return compatible[0]?.priceBerries ?? null;
}

function shipDefinitionQuality(definition: ContentCatalog['ships'][number]): number {
  return definition.maxHealth + definition.crewCapacity * 4 + definition.cargoSlots * 3;
}

function modifierTotal(modifiers: Partial<Record<StatId, number>>): number {
  return Object.values(modifiers).reduce((sum, value) => sum + (value ?? 0), 0);
}

function recordOpportunities(evaluations: MinMaxChoiceEvaluation[], selected: MinMaxChoiceEvaluation): void {
  const valid = evaluations.filter(({ invalid }) => !invalid);
  const any = (key: keyof ProgressionFlags) => valid.some(({ flags }) => flags[key]);

  if (any('crew')) {
    telemetry.recruitmentOpportunities += 1;
    if (selected.flags.crew) telemetry.recruitmentOpportunitiesTaken += 1;
  }
  if (any('trait')) {
    telemetry.traitGainOpportunities += 1;
    if (selected.flags.trait) telemetry.traitGainOpportunitiesTaken += 1;
  }
  if (any('fruit')) {
    telemetry.fruitGainOpportunities += 1;
    if (selected.flags.fruit) telemetry.fruitGainOpportunitiesTaken += 1;
  }
  if (any('haki')) {
    telemetry.hakiGainOpportunities += 1;
    if (selected.flags.haki) telemetry.hakiGainOpportunitiesTaken += 1;
  }
  if (any('ship')) {
    telemetry.shipPurchaseOpportunities += 1;
    if (selected.flags.ship) telemetry.shipPurchaseOpportunitiesTaken += 1;
  }
}

function clonePotential(value: StructuralPotential): StructuralPotential {
  return { score: value.score, flags: { ...value.flags } };
}

function emptyBreakdown(total = 0): MinMaxScoreBreakdown {
  return {
    total,
    survival: 0,
    ship: 0,
    crew: 0,
    powers: 0,
    career: 0,
    traits: 0,
    stats: 0,
    reputation: 0,
    bounty: 0,
    economy: 0,
    relationships: 0,
    items: 0,
    lookahead: 0,
  };
}

function sumBreakdown(score: MinMaxScoreBreakdown): number {
  return score.survival
    + score.ship
    + score.crew
    + score.powers
    + score.career
    + score.traits
    + score.stats
    + score.reputation
    + score.bounty
    + score.economy
    + score.relationships
    + score.items
    + score.lookahead;
}

function addBreakdown(target: MinMaxScoreBreakdown, source: MinMaxScoreBreakdown, multiplier: number): void {
  target.survival += source.survival * multiplier;
  target.ship += source.ship * multiplier;
  target.crew += source.crew * multiplier;
  target.powers += source.powers * multiplier;
  target.career += source.career * multiplier;
  target.traits += source.traits * multiplier;
  target.stats += source.stats * multiplier;
  target.reputation += source.reputation * multiplier;
  target.bounty += source.bounty * multiplier;
  target.economy += source.economy * multiplier;
  target.relationships += source.relationships * multiplier;
  target.items += source.items * multiplier;
  target.lookahead += source.lookahead * multiplier;
  target.total = sumBreakdown(target);
}

function emptyFlags(): ProgressionFlags {
  return { crew: false, trait: false, fruit: false, haki: false, ship: false };
}

function mergeFlags(target: ProgressionFlags, source: ProgressionFlags): void {
  target.crew ||= source.crew;
  target.trait ||= source.trait;
  target.fruit ||= source.fruit;
  target.haki ||= source.haki;
  target.ship ||= source.ship;
}

function createEmptyTelemetry(): MinMaxTelemetry {
  return {
    choicesEvaluated: 0,
    uniqueBestSelections: 0,
    seededTieBreaks: 0,
    invalidChoicesRejected: 0,
    diceChoicesEvaluated: 0,
    immediateLookaheadsEvaluated: 0,
    maxLookaheadDepthObserved: 0,
    staticLookaheadCacheMisses: 0,
    projectedCandidatesValidated: 0,
    recruitmentOpportunities: 0,
    recruitmentOpportunitiesTaken: 0,
    traitGainOpportunities: 0,
    traitGainOpportunitiesTaken: 0,
    fruitGainOpportunities: 0,
    fruitGainOpportunitiesTaken: 0,
    hakiGainOpportunities: 0,
    hakiGainOpportunitiesTaken: 0,
    shipPurchaseOpportunities: 0,
    shipPurchaseOpportunitiesTaken: 0,
  };
}
