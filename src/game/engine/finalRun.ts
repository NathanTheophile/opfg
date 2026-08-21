import type {
  ContentCatalog,
  Outcome,
} from '../content/schema';
import type {
  CareerAffiliationId,
  CareerRankId,
  GameState,
  HistoryEntry,
  ItemStack,
  NpcId,
  PlayerAttributeId,
} from '../model/schema';

const SCORE_WEIGHTS = {
  reputation: 20,
  career: 25,
  power: 20,
  relationships: 15,
  assets: 10,
  legacy: 10,
} as const;

const PLAYER_ATTRIBUTES: PlayerAttributeId[] = [
  'morale',
  'strength',
  'agility',
  'observation',
  'intelligence',
  'navigation',
  'charisma',
  'luck',
];

export type FinalScoreAxisId = keyof typeof SCORE_WEIGHTS;
export type FinalScoreTier =
  | 'ordinary'
  | 'notable'
  | 'remarkable'
  | 'legendary'
  | 'mythic';

export interface FinalScoreAxis {
  id: FinalScoreAxisId;
  points: number;
  maxPoints: number;
}

export interface FinalRunMoment {
  eventId: string;
  ageMonths: number;
  titleKey: string;
  outcomeTextKey: string | null;
}

export interface FinalRunStats {
  ageMonths: number;
  historyEntries: number;
  reputation: number;
  bounty: number;
  maxBounty: number;
  berries: number;
  crewSize: number;
  knownNpcCount: number;
  traitCount: number;
  majorTrackRoots: number;
  shipId: string | null;
  highestRankId: CareerRankId | null;
}

export interface FinalRunFacts {
  strongestAttributeId: PlayerAttributeId;
  strongestAttributeValue: number;
  closestNpcId: NpcId | null;
  closestNpcRelationship: number | null;
  careerAffiliationId: CareerAffiliationId;
  devilFruitId: string | null;
  totalHakiLevels: number;
}

export interface FinalRunReport {
  score: number;
  tier: FinalScoreTier;
  axes: FinalScoreAxis[];
  endingId: string | null;
  endingNameKey: string | null;
  endingDescriptionKey: string | null;
  moments: FinalRunMoment[];
  stats: FinalRunStats;
  facts: FinalRunFacts;
}

export function buildFinalRunReport(
  state: GameState,
  catalog: ContentCatalog,
): FinalRunReport {
  const maxBounty = deriveMaxBounty(state, catalog);
  const highestRankId = deriveHighestRank(state, catalog);
  const axes = calculateScoreAxes(state, catalog, maxBounty);
  const score = Math.min(
    100,
    axes.reduce((total, axis) => total + axis.points, 0),
  );
  const ending = state.endingId === null
    ? null
    : catalog.endings.find(({ id }) => id === state.endingId) ?? null;
  const crew = Object.entries(state.npcs)
    .filter(([, npc]) => npc.status === 'crew');
  const knownNpcs = Object.entries(state.npcs)
    .filter(([, npc]) => npc.status !== 'unavailable');
  const closestNpc = knownNpcs
    .filter(([, npc]) => npc.status !== 'dead')
    .sort(
      (a, b) =>
        b[1].relationship - a[1].relationship
        || a[0].localeCompare(b[0]),
    )[0] ?? null;
  const strongestAttributeId = PLAYER_ATTRIBUTES
    .slice()
    .sort(
      (a, b) =>
        state.player.stats[b] - state.player.stats[a]
        || a.localeCompare(b),
    )[0];

  return {
    score,
    tier: scoreTier(score),
    axes,
    endingId: state.endingId,
    endingNameKey: ending?.nameKey ?? null,
    endingDescriptionKey: ending?.descriptionKey ?? null,
    moments: selectLifeMoments(state.history, catalog),
    stats: {
      ageMonths: state.ageMonths,
      historyEntries: state.history.length,
      reputation: state.player.career.reputation,
      bounty: state.player.career.bounty,
      maxBounty,
      berries: state.berries,
      crewSize: crew.length,
      knownNpcCount: knownNpcs.length,
      traitCount: state.player.traits.length,
      majorTrackRoots: state.history.filter(({ eventId }) => {
        const event = catalog.events.find((candidate) => candidate.id === eventId);
        return event?.kind === 'normal' && event.majorTrack !== undefined;
      }).length,
      shipId: state.ship?.shipId ?? null,
      highestRankId,
    },
    facts: {
      strongestAttributeId,
      strongestAttributeValue: state.player.stats[strongestAttributeId],
      closestNpcId: closestNpc?.[0] ?? null,
      closestNpcRelationship: closestNpc?.[1].relationship ?? null,
      careerAffiliationId: state.player.career.affiliationId,
      devilFruitId: state.player.powers.devilFruitId,
      totalHakiLevels: Object.values(state.player.powers.haki)
        .reduce((total, level) => total + level, 0),
    },
  };
}

/**
 * CAREER_AND_ENDINGS locks the six weights but currently leaves each axis'
 * normalization open. Keep the V1 normalization isolated here so calibration
 * can change without touching UI, persistence or GameState.
 */
function calculateScoreAxes(
  state: GameState,
  catalog: ContentCatalog,
  maxBounty: number,
): FinalScoreAxis[] {
  const reputation = state.player.career.reputation / 100;
  const career = careerAccomplishment01(state, catalog, maxBounty);
  const attributePower = PLAYER_ATTRIBUTES
    .reduce((sum, id) => sum + state.player.stats[id], 0)
    / (PLAYER_ATTRIBUTES.length * 50);
  const hakiPower = Object.values(state.player.powers.haki)
    .reduce((sum, level) => sum + level, 0) / 15;
  const fruitPower = state.player.powers.devilFruitId === null
    ? 0
    : 0.35 + 0.65 * (state.player.powers.devilFruitAwakening / 10);
  const power = clamp01(
    attributePower * 0.7
    + Math.max(hakiPower, fruitPower) * 0.3,
  );

  const crew = Object.values(state.npcs)
    .filter(({ status }) => status === 'crew');
  const crewBreadth = clamp01(
    crew.length / Math.max(1, catalog.crewRoles.length),
  );
  const positiveRelationships = Object.values(state.npcs)
    .filter(
      ({ status, relationship }) =>
        status !== 'unavailable'
        && status !== 'dead'
        && relationship > 0,
    )
    .map(({ relationship }) => relationship / 100);
  const relationshipStrength = positiveRelationships.length === 0
    ? 0
    : positiveRelationships.reduce((sum, value) => sum + value, 0)
      / positiveRelationships.length;
  const relationships = clamp01(
    crewBreadth * 0.6 + relationshipStrength * 0.4,
  );

  const shipValue = state.ship
    ? catalog.ships.find(({ id }) => id === state.ship!.shipId)
        ?.priceBerries ?? 0
    : 0;
  const marketValue = ownedAssetStacks(state, catalog)
    .reduce((total, stack) => {
      const item = catalog.items.find(({ id }) => id === stack.itemId);
      return total + (item?.market?.basePriceBerries ?? 0) * stack.quantity;
    }, 0);
  const assetAnchor = Math.max(
    1,
    ...catalog.ships.map(({ priceBerries }) => priceBerries),
  );
  const assets = clamp01(
    1 - Math.exp(-(state.berries + shipValue + marketValue) / assetAnchor),
  );

  // Current EndingDefinition has no quality/variant score. Until that content
  // contract exists, an authored Ending grants the legacy axis baseline while
  // major-track completion contributes the remaining half.
  const majorRoots = state.history.filter(({ eventId }) => {
    const event = catalog.events.find((candidate) => candidate.id === eventId);
    return event?.kind === 'normal' && event.majorTrack !== undefined;
  }).length;
  const legacy = clamp01(
    (state.endingId === null ? 0 : 0.5)
    + Math.min(5, majorRoots) / 10,
  );

  const raw: Record<FinalScoreAxisId, number> = {
    reputation,
    career,
    power,
    relationships,
    assets,
    legacy,
  };

  return (Object.keys(SCORE_WEIGHTS) as FinalScoreAxisId[])
    .map((id) => ({
      id,
      maxPoints: SCORE_WEIGHTS[id],
      points: Math.round(clamp01(raw[id]) * SCORE_WEIGHTS[id]),
    }));
}

function ownedAssetStacks(
  state: GameState,
  catalog: ContentCatalog,
): ItemStack[] {
  const equipment = state.player.equipment.flatMap((stack, index) => {
    if (stack === null) return [];

    const definition = catalog.items.find(({ id }) => id === stack.itemId);
    const isMirroredTwoHandedSlot =
      definition?.twoHanded === true
      && index === 1
      && state.player.equipment[0]?.itemId === stack.itemId;

    return isMirroredTwoHandedSlot ? [] : [stack];
  });

  return [
    ...state.player.inventory.stacks,
    ...(state.ship?.cargo ?? []),
    ...equipment,
    ...(state.player.logPose ? [state.player.logPose] : []),
    ...(state.player.companion ? [state.player.companion] : []),
  ];
}

function careerAccomplishment01(
  state: GameState,
  catalog: ContentCatalog,
  maxBounty: number,
): number {
  const career = state.player.career;
  const ladder = catalog.careerRanks
    .filter(({ affiliationId }) => affiliationId === career.affiliationId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const rankIndex = career.rankId === null
    ? -1
    : ladder.findIndex(({ id }) => id === career.rankId);
  const rankProgress = rankIndex < 0 || ladder.length === 0
    ? 0
    : (rankIndex + 1) / ladder.length;
  const titleProgress = career.titleId === 'legend'
    ? 1
    : career.titleId === 'veteran'
      ? 0.66
      : career.titleId === 'rookie'
        ? 0.33
        : 0;
  const bountyProgress = maxBounty <= 0
    ? 0
    : clamp01(Math.log10(maxBounty + 1) / 8);

  return clamp01(Math.max(rankProgress, titleProgress, bountyProgress));
}

function deriveMaxBounty(
  state: GameState,
  catalog: ContentCatalog,
): number {
  let bounty = 0;
  let maximum = state.player.career.bounty;

  for (const entry of state.history) {
    const outcome = outcomeForEntry(entry, catalog);
    if (!outcome) continue;

    for (const effect of outcome.effects) {
      if (effect.type === 'setBounty') {
        bounty = Math.max(0, effect.value);
      }
      if (effect.type === 'modifyBounty') {
        bounty = Math.max(0, bounty + effect.amount);
      }
      maximum = Math.max(maximum, bounty);
    }
  }

  return maximum;
}

function deriveHighestRank(
  state: GameState,
  catalog: ContentCatalog,
): CareerRankId | null {
  const reachedRankIds: CareerRankId[] = [];

  if (state.player.career.rankId !== null) {
    reachedRankIds.push(state.player.career.rankId);
  }

  for (const entry of state.history) {
    const outcome = outcomeForEntry(entry, catalog);
    if (!outcome) continue;

    for (const effect of outcome.effects) {
      if (effect.type === 'setCareerRank' && effect.rankId !== null) {
        reachedRankIds.push(effect.rankId);
      }
    }
  }

  let bestRankId: CareerRankId | null = null;
  let bestSortOrder = Number.NEGATIVE_INFINITY;

  for (const rankId of reachedRankIds) {
    const rank = catalog.careerRanks.find(({ id }) => id === rankId);
    if (rank && rank.sortOrder > bestSortOrder) {
      bestRankId = rank.id;
      bestSortOrder = rank.sortOrder;
    }
  }

  return bestRankId;
}

function selectLifeMoments(
  history: HistoryEntry[],
  catalog: ContentCatalog,
): FinalRunMoment[] {
  if (history.length === 0) return [];

  const targetCount = Math.min(8, history.length);
  const selected = new Set<number>();
  selected.add(0);
  selected.add(history.length - 1);

  history.forEach((entry, index) => {
    const event = catalog.events.find(
      (candidate) => candidate.id === entry.eventId,
    );
    if (event?.kind === 'normal' && event.majorTrack !== undefined) {
      selected.add(index);
    }
  });

  for (
    let slot = 1;
    selected.size < targetCount && slot < targetCount - 1;
    slot += 1
  ) {
    selected.add(
      Math.round((slot * (history.length - 1)) / (targetCount - 1)),
    );
  }

  for (
    let index = 0;
    selected.size < targetCount && index < history.length;
    index += 1
  ) {
    selected.add(index);
  }

  return [...selected]
    .sort((a, b) => a - b)
    .slice(0, targetCount)
    .map((index) => {
      const entry = history[index];
      const event = catalog.events.find(
        (candidate) => candidate.id === entry.eventId,
      );
      const outcome = event ? outcomeForEntry(entry, catalog) : null;

      return {
        eventId: entry.eventId,
        ageMonths: entry.ageMonths,
        titleKey: event?.titleKey ?? `event.${entry.eventId}.title`,
        outcomeTextKey: outcome?.textKey ?? null,
      };
    });
}

function outcomeForEntry(
  entry: HistoryEntry,
  catalog: ContentCatalog,
): Outcome | null {
  const event = catalog.events.find(
    (candidate) => candidate.id === entry.eventId,
  );
  if (!event) return null;

  const choice = event.choices.find(({ id }) => id === entry.choiceId);
  if (!choice) return null;

  if (choice.resolution.type === 'deterministic') {
    return choice.resolution.outcome.id === entry.outcomeId
      ? choice.resolution.outcome
      : null;
  }

  return Object.values(choice.resolution.outcomes)
    .find(({ id }) => id === entry.outcomeId) ?? null;
}

function scoreTier(score: number): FinalScoreTier {
  if (score >= 90) return 'mythic';
  if (score >= 75) return 'legendary';
  if (score >= 50) return 'remarkable';
  if (score >= 25) return 'notable';
  return 'ordinary';
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
