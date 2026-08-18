import type {
  ChoiceDefinition,
  ContentCatalog,
  DiceResolution,
  EventDefinition,
  Outcome,
  StatId,
} from '../content/schema';
import { getChoiceState, evaluateCondition } from '../engine/conditions';
import { evaluateDiceRoll } from '../engine/dice';
import { applyEffects } from '../engine/effects';
import { countCurrentCrew, findShipDefinition } from '../engine/ship';
import type { GameState, NpcState, ShipState } from '../model/schema';
import {
  progressionSimulationPolicy,
  randomSimulationPolicy,
  type SimulationChoice,
  type SimulationDecisionContext,
  type SimulationPolicy,
} from './simulationPolicy';

export const MAX_MINMAX_LOOKAHEAD_DEPTH = 4;
export const IMMEDIATE_LOOKAHEAD_DISCOUNT = 0.9;
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

export function resetMinMaxTelemetry(): void {
  telemetry = createEmptyTelemetry();
}

export function getMinMaxTelemetry(): MinMaxTelemetry {
  return { ...telemetry };
}

export const minmaxSimulationPolicy: SimulationPolicy = {
  id: 'minmax',
  choose(choices, rngState, context) {
    if (choices.length === 0) throw new Error('No available Choice for the selected Event.');
    if (!context) return randomSimulationPolicy.choose(choices, rngState);

    // System behavior stays exactly aligned with Progression: valid cheapest ship,
    // no negotiation cheese, deterministic departure, deterministic market exit.
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

  const valid = evaluations.filter(({ invalid }) => !invalid);
  if (valid.length === 0) {
    // Do not invent a legal route. Let the actual runtime expose the authored bug.
    return randomSimulationPolicy.choose(choices, rngState, context);
  }

  const bestScore = Math.max(...valid.map(({ score }) => score));
  const best = valid.filter(({ score }) => Math.abs(score - bestScore) <= SCORE_EPSILON);
  const selection = best.length === 1
    ? { choice: best[0].choice, nextRngState: rngState }
    : randomSimulationPolicy.choose(best.map(({ choice }) => choice), rngState, context);

  if (best.length === 1) telemetry.uniqueBestSelections += 1;
  else telemetry.seededTieBreaks += 1;

  const selectedEvaluation = evaluations.find(({ choice }) => choice.id === selection.choice.id)!;
  recordOpportunities(evaluations, selectedEvaluation);
  return selection;
}

export function evaluateMinMaxChoice(
  choice: ChoiceDefinition,
  context: SimulationDecisionContext,
): MinMaxChoiceEvaluation {
  try {
    if (choice.resolution.type === 'deterministic') {
      const evaluated = evaluateOutcome(
        context.state,
        context.catalog,
        context.event,
        choice,
        choice.resolution.outcome,
        undefined,
        0,
        new Set([context.event.id]),
      );
      return { choice, score: evaluated.breakdown.total, breakdown: evaluated.breakdown, invalid: false, flags: evaluated.flags };
    }

    telemetry.diceChoicesEvaluated += 1;
    const evaluated = evaluateDiceChoice(choice, choice.resolution, context);
    return { choice, score: evaluated.breakdown.total, breakdown: evaluated.breakdown, invalid: false, flags: evaluated.flags };
  } catch {
    return {
      choice,
      score: INVALID_SCORE,
      breakdown: emptyBreakdown(INVALID_SCORE),
      invalid: true,
      flags: emptyFlags(),
    };
  }
}

function evaluateDiceChoice(
  choice: ChoiceDefinition,
  resolution: DiceResolution,
  context: SimulationDecisionContext,
): { breakdown: MinMaxScoreBreakdown; flags: ProgressionFlags } {
  const aggregate = emptyBreakdown();
  const flags = emptyFlags();

  for (let rawRoll = 1; rawRoll <= 20; rawRoll += 1) {
    const dice = evaluateDiceRoll(resolution, context.state, rawRoll, false, context.catalog);
    const outcome = resolution.outcomes[dice.result];
    const evaluated = evaluateOutcome(
      context.state,
      context.catalog,
      context.event,
      choice,
      outcome,
      dice.actorNpcId,
      0,
      new Set([context.event.id]),
    );
    addBreakdown(aggregate, evaluated.breakdown, 1 / 20);
    mergeFlags(flags, evaluated.flags);
  }

  aggregate.total = sumBreakdown(aggregate);
  return { breakdown: aggregate, flags };
}

function evaluateOutcome(
  state: GameState,
  catalog: ContentCatalog,
  event: EventDefinition,
  choice: ChoiceDefinition,
  outcome: Outcome,
  diceActorNpcId: string | undefined,
  lookaheadDepth: number,
  visitedEventIds: Set<string>,
): { breakdown: MinMaxScoreBreakdown; flags: ProgressionFlags } {
  // Shield the real simulation state even if an engine helper has a shallow-clone field.
  const projectionInput = structuredClone(state) as GameState;
  const projected = applyEffects(
    projectionInput,
    catalog,
    outcome.effects,
    {
      sourceEventId: event.id,
      sourceChoiceId: choice.id,
      ...(diceActorNpcId ? { diceActorNpcId } : {}),
    },
  );

  // Immediate conditions often depend on the parent decision being in History.
  projected.history = [
    ...projected.history,
    {
      eventId: event.id,
      choiceId: choice.id,
      outcomeId: outcome.id,
      ageMonths: projected.ageMonths,
    },
  ];

  const breakdown = scoreStateDelta(state, projected, catalog);
  const flags = progressionFlags(state, projected);

  const materializedUnknownNpc = Object.entries(projected.npcs).some(([npcId, npc]) =>
    state.npcs[npcId]?.statsGenerated !== true && npc.statsGenerated === true,
  );

  // A projected Effect may lazily materialize an NPC by consuming gameplay RNG.
  // The direct mechanical result (for example recruitment) is still scoreable,
  // but we stop deeper lookahead so that generated future NPC stats can never
  // influence a decision made before that NPC is actually encountered.
  if (!materializedUnknownNpc && lookaheadDepth < MAX_MINMAX_LOOKAHEAD_DEPTH) {
    const immediateIds = outcome.effects.flatMap((effect) => effect.type === 'queueImmediateEvent' ? [effect.eventId] : []);
    for (const immediateId of immediateIds) {
      if (visitedEventIds.has(immediateId)) continue;
      const immediateEvent = catalog.events.find((candidate) => candidate.id === immediateId && candidate.kind === 'immediate');
      if (!immediateEvent) continue;
      if (immediateEvent.eligibility && !evaluateCondition(immediateEvent.eligibility, projected, catalog)) continue;

      const nextVisited = new Set(visitedEventIds);
      nextVisited.add(immediateId);
      const continuation = bestImmediateContinuation(
        projected,
        catalog,
        immediateEvent,
        lookaheadDepth + 1,
        nextVisited,
      );
      const discounted = continuation.score * IMMEDIATE_LOOKAHEAD_DISCOUNT;
      breakdown.lookahead += discounted;
      mergeFlags(flags, continuation.flags);
    }
  }

  breakdown.total = sumBreakdown(breakdown);
  return { breakdown, flags };
}

function bestImmediateContinuation(
  state: GameState,
  catalog: ContentCatalog,
  event: EventDefinition,
  depth: number,
  visitedEventIds: Set<string>,
): { score: number; flags: ProgressionFlags } {
  telemetry.immediateLookaheadsEvaluated += 1;
  telemetry.maxLookaheadDepthObserved = Math.max(telemetry.maxLookaheadDepthObserved, depth);
  if (depth > MAX_MINMAX_LOOKAHEAD_DEPTH) return { score: 0, flags: emptyFlags() };

  const choices = event.choices.filter((choice) => {
    const choiceState = getChoiceState(choice, state, catalog);
    return choiceState.visible && choiceState.available;
  });
  if (choices.length === 0) return { score: 0, flags: emptyFlags() };

  const candidates = choices.flatMap((choice) => {
    try {
      if (choice.resolution.type === 'deterministic') {
        const evaluated = evaluateOutcome(
          state,
          catalog,
          event,
          choice,
          choice.resolution.outcome,
          undefined,
          depth,
          visitedEventIds,
        );
        return [{ score: evaluated.breakdown.total, flags: evaluated.flags }];
      }

      const evaluated = evaluateDiceImmediate(choice, choice.resolution, state, catalog, event, depth, visitedEventIds);
      return [evaluated];
    } catch {
      return [];
    }
  });

  if (candidates.length === 0) return { score: 0, flags: emptyFlags() };
  const bestScore = Math.max(...candidates.map(({ score }) => score));
  const best = candidates.filter(({ score }) => Math.abs(score - bestScore) <= SCORE_EPSILON);
  const flags = emptyFlags();
  for (const candidate of best) mergeFlags(flags, candidate.flags);
  return { score: bestScore, flags };
}

function evaluateDiceImmediate(
  choice: ChoiceDefinition,
  resolution: DiceResolution,
  state: GameState,
  catalog: ContentCatalog,
  event: EventDefinition,
  depth: number,
  visitedEventIds: Set<string>,
): { score: number; flags: ProgressionFlags } {
  let score = 0;
  const flags = emptyFlags();
  for (let rawRoll = 1; rawRoll <= 20; rawRoll += 1) {
    const dice = evaluateDiceRoll(resolution, state, rawRoll, false, catalog);
    const evaluated = evaluateOutcome(
      state,
      catalog,
      event,
      choice,
      resolution.outcomes[dice.result],
      dice.actorNpcId,
      depth,
      visitedEventIds,
    );
    score += evaluated.breakdown.total / 20;
    mergeFlags(flags, evaluated.flags);
  }
  return { score, flags };
}

export function scoreStateDelta(
  before: GameState,
  after: GameState,
  catalog: ContentCatalog,
): MinMaxScoreBreakdown {
  const score = emptyBreakdown();

  if (after.player.stats.health <= 0 || (after.careerStatus === 'ended' && after.careerEndReason === 'death')) {
    score.survival += MINMAX_WEIGHTS.playerDeath;
  }
  score.survival += (after.player.stats.health - before.player.stats.health) * MINMAX_WEIGHTS.playerHealth;

  score.ship += scoreShipDelta(before, after, catalog);
  score.crew += scoreCrewDelta(before, after);
  score.powers += scorePowerDelta(before, after);
  score.career += scoreCareerDelta(before, after, catalog);
  score.traits += scoreTraitDelta(before, after);
  score.stats += scoreStatDelta(before, after);
  score.reputation += (after.player.career.reputation - before.player.career.reputation) * MINMAX_WEIGHTS.reputationPoint;
  score.bounty += ((after.player.career.bounty - before.player.career.bounty) / 1000) * MINMAX_WEIGHTS.bountyPer1000;
  score.economy += scoreEconomyDelta(before, after, catalog);
  score.relationships += scoreNpcDelta(before, after);
  score.items += scoreItemDelta(before, after);

  score.total = sumBreakdown(score);
  return score;
}

function scoreShipDelta(before: GameState, after: GameState, catalog: ContentCatalog): number {
  let score = 0;
  if (before.ship === null && after.ship !== null) {
    score += MINMAX_WEIGHTS.acquireFirstShip;
    score += shipQuality(after.ship, catalog) * MINMAX_WEIGHTS.shipQualityPoint;
  } else if (before.ship !== null && after.ship === null) {
    score += MINMAX_WEIGHTS.loseExistingShip;
  } else if (before.ship !== null && after.ship !== null) {
    score += (shipQuality(after.ship, catalog) - shipQuality(before.ship, catalog)) * MINMAX_WEIGHTS.shipQualityPoint;
    score += (after.ship.health - before.ship.health) * MINMAX_WEIGHTS.shipHealth;
  }

  // A pending replacement is valuable only by its quality delta; it is not yet owned.
  if (after.pendingShip !== null && before.pendingShip?.shipId !== after.pendingShip.shipId) {
    const activeQuality = after.ship ? shipQuality(after.ship, catalog) : 0;
    const pendingQuality = shipQuality(after.pendingShip, catalog);
    score += Math.max(0, pendingQuality - activeQuality) * MINMAX_WEIGHTS.shipQualityPoint;
  }
  return score;
}

function shipQuality(ship: ShipState, catalog: ContentCatalog): number {
  const definition = findShipDefinition(catalog, ship.shipId);
  return definition.maxHealth + definition.crewCapacity * 4 + definition.cargoSlots * 3;
}

function scoreCrewDelta(before: GameState, after: GameState): number {
  const beforeCrew = new Set(Object.entries(before.npcs).filter(([, npc]) => npc.status === 'crew').map(([id]) => id));
  const afterCrew = new Set(Object.entries(after.npcs).filter(([, npc]) => npc.status === 'crew').map(([id]) => id));
  let score = 0;
  for (const id of afterCrew) if (!beforeCrew.has(id)) score += MINMAX_WEIGHTS.recruitCrewMember;
  for (const id of beforeCrew) if (!afterCrew.has(id)) score += MINMAX_WEIGHTS.loseCrewMember;
  return score;
}

function scorePowerDelta(before: GameState, after: GameState): number {
  let score = 0;
  if (before.player.powers.devilFruitId === null && after.player.powers.devilFruitId !== null) {
    score += MINMAX_WEIGHTS.consumeDevilFruit;
  }
  score += Math.max(0, after.player.powers.devilFruitAwakening - before.player.powers.devilFruitAwakening)
    * MINMAX_WEIGHTS.devilFruitAwakening;

  for (const type of ['observation', 'armament', 'conqueror'] as const) {
    const beforeLevel = before.player.powers.haki[type];
    const afterLevel = after.player.powers.haki[type];
    if (beforeLevel === 0 && afterLevel > 0) score += MINMAX_WEIGHTS.awakenHaki;
    score += Math.max(0, afterLevel - beforeLevel) * MINMAX_WEIGHTS.hakiLevel;
  }
  return score;
}

function scoreCareerDelta(before: GameState, after: GameState, catalog: ContentCatalog): number {
  let score = 0;
  if (before.careerStatus === 'active' && after.careerStatus === 'ended') {
    score += MINMAX_WEIGHTS.endCareerEarly;
  }
  if (before.player.career.affiliationId !== after.player.career.affiliationId) {
    score += MINMAX_WEIGHTS.careerAffiliationGain;
  }

  const beforeRank = before.player.career.rankId === null
    ? 0
    : catalog.careerRanks.find(({ id }) => id === before.player.career.rankId)?.sortOrder ?? 0;
  const afterRank = after.player.career.rankId === null
    ? 0
    : catalog.careerRanks.find(({ id }) => id === after.player.career.rankId)?.sortOrder ?? 0;
  score += (afterRank - beforeRank) * MINMAX_WEIGHTS.careerRankStep;

  if (before.player.career.titleId === null && after.player.career.titleId !== null) {
    score += MINMAX_WEIGHTS.careerTitleGain;
  } else if (before.player.career.titleId !== null && after.player.career.titleId === null) {
    score -= MINMAX_WEIGHTS.careerTitleGain;
  } else if (before.player.career.titleId !== after.player.career.titleId) {
    score += MINMAX_WEIGHTS.careerTitleGain;
  }
  return score;
}

function scoreTraitDelta(before: GameState, after: GameState): number {
  const beforeTraits = new Set(before.player.traits);
  const afterTraits = new Set(after.player.traits);
  let score = 0;
  for (const trait of afterTraits) if (!beforeTraits.has(trait)) score += MINMAX_WEIGHTS.traitGain;
  for (const trait of beforeTraits) if (!afterTraits.has(trait)) score += MINMAX_WEIGHTS.traitLoss;
  return score;
}

function scoreStatDelta(before: GameState, after: GameState): number {
  const ids: StatId[] = ['morale', 'strength', 'agility', 'observation', 'intelligence', 'navigation', 'charisma', 'luck'];
  return ids.reduce((sum, id) => sum + (after.player.stats[id] - before.player.stats[id]) * MINMAX_WEIGHTS.statPoint, 0);
}

function scoreEconomyDelta(before: GameState, after: GameState, catalog: ContentCatalog): number {
  const berryDelta = after.berries - before.berries;
  let score = berryDelta / 100 * MINMAX_WEIGHTS.berriesPer100;
  if (before.ship !== null) return score;

  const target = cheapestCompatibleShipPrice(before, catalog);
  if (target === null) return score;
  const beforeProgress = Math.min(before.berries, target);
  const afterProgress = Math.min(after.berries, target);
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

function scoreNpcDelta(before: GameState, after: GameState): number {
  let score = 0;
  const ids = new Set([...Object.keys(before.npcs), ...Object.keys(after.npcs)]);
  for (const id of ids) {
    const left = before.npcs[id];
    const right = after.npcs[id];
    if (!left || !right) continue;
    score += (right.relationship - left.relationship) * MINMAX_WEIGHTS.relationshipPoint;

    // NPC stat growth is only treated as progression for current/future crewmates;
    // buffing a rival should not look like player progression.
    if (left.status === 'crew' || right.status === 'crew') {
      score += npcStatTotalDelta(left, right) * MINMAX_WEIGHTS.npcStatPoint;
    }
  }
  return score;
}

function npcStatTotalDelta(before: NpcState, after: NpcState): number {
  const ids = ['health', 'morale', 'strength', 'agility', 'observation', 'intelligence', 'navigation', 'charisma', 'luck'] as const;
  return ids.reduce((sum, id) => sum + after.stats[id] - before.stats[id], 0);
}

function scoreItemDelta(before: GameState, after: GameState): number {
  const beforeItems = itemQuantities(before);
  const afterItems = itemQuantities(after);
  const ids = new Set([...beforeItems.keys(), ...afterItems.keys()]);
  let score = 0;
  for (const id of ids) score += ((afterItems.get(id) ?? 0) - (beforeItems.get(id) ?? 0)) * MINMAX_WEIGHTS.itemGain;
  return score;
}

function itemQuantities(state: GameState): Map<string, number> {
  const result = new Map<string, number>();
  for (const stack of [...state.player.inventory.stacks, ...(state.ship?.cargo ?? [])]) {
    result.set(stack.itemId, (result.get(stack.itemId) ?? 0) + stack.quantity);
  }
  return result;
}

function progressionFlags(before: GameState, after: GameState): ProgressionFlags {
  const beforeCrew = countCurrentCrew(before);
  const afterCrew = countCurrentCrew(after);
  const beforeTraits = new Set(before.player.traits);
  return {
    crew: afterCrew > beforeCrew,
    trait: after.player.traits.some((trait) => !beforeTraits.has(trait)),
    fruit: before.player.powers.devilFruitId === null && after.player.powers.devilFruitId !== null,
    haki: (['observation', 'armament', 'conqueror'] as const)
      .some((type) => after.player.powers.haki[type] > before.player.powers.haki[type]),
    ship: before.ship === null && after.ship !== null,
  };
}

function recordOpportunities(
  evaluations: MinMaxChoiceEvaluation[],
  selected: MinMaxChoiceEvaluation,
): void {
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
