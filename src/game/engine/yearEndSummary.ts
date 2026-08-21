import type {
  ContentCatalog,
  Effect,
  Outcome,
} from '../content/schema';
import type {
  GameState,
  ItemId,
  NpcId,
  PlayerStats,
} from '../model/schema';

export type YearEndStatId = keyof PlayerStats;

export interface YearEndStatChange {
  statId: YearEndStatId;
  amount: number;
}

export type YearEndHighlight =
  | { type: 'crewRecruit'; npcId: NpcId }
  | { type: 'uniqueItem'; itemId: ItemId };

export interface YearEndSummary {
  fromAge: number;
  toAge: number;
  eventsResolved: number;
  statChanges: YearEndStatChange[];
  highlights: YearEndHighlight[];
}

type YearBoundaryState = Pick<
  GameState,
  'ageMonths' | 'careerPhase' | 'history'
>;

const STAT_ORDER: readonly YearEndStatId[] = [
  'health',
  'morale',
  'strength',
  'agility',
  'observation',
  'intelligence',
  'navigation',
  'charisma',
  'luck',
];

function resolvedOutcome(
  eventId: string,
  choiceId: string,
  outcomeId: string,
  catalog: ContentCatalog,
): Outcome | null {
  const event = catalog.events.find(({ id }) => id === eventId);
  const choice = event?.choices.find(({ id }) => id === choiceId);
  if (!choice) return null;

  if (choice.resolution.type === 'deterministic') {
    return choice.resolution.outcome.id === outcomeId
      ? choice.resolution.outcome
      : null;
  }

  return Object.values(choice.resolution.outcomes)
    .find(({ id }) => id === outcomeId) ?? null;
}

function addStatChange(
  totals: Partial<Record<YearEndStatId, number>>,
  effect: Effect,
) {
  if (effect.type === 'modifyStat') {
    totals[effect.statId] = (totals[effect.statId] ?? 0) + effect.amount;
  } else if (effect.type === 'modifyHealth') {
    totals.health = (totals.health ?? 0) + effect.amount;
  }
}

export function getActiveYearEndSummary(
  before: YearBoundaryState | null,
  after: YearBoundaryState | null,
  catalog: ContentCatalog,
): YearEndSummary | null {
  if (!before || !after || before.careerPhase !== 'active') return null;

  const fromAge = Math.floor(before.ageMonths / 12);
  const toAge = Math.floor(after.ageMonths / 12);
  if (toAge <= fromAge) return null;

  const fromAgeMonths = fromAge * 12;
  const toAgeMonths = toAge * 12;
  const entries = after.history.filter(
    ({ ageMonths }) => ageMonths >= fromAgeMonths && ageMonths < toAgeMonths,
  );

  const statTotals: Partial<Record<YearEndStatId, number>> = {};
  const recruitedNpcIds = new Set<NpcId>();
  const uniqueItemIds = new Set<ItemId>();
  const uniqueItems = new Set(
    catalog.items.filter(({ unique }) => unique).map(({ id }) => id),
  );

  for (const entry of entries) {
    const outcome = resolvedOutcome(
      entry.eventId,
      entry.choiceId,
      entry.outcomeId,
      catalog,
    );
    if (!outcome) continue;

    for (const effect of outcome.effects) {
      addStatChange(statTotals, effect);

      if (
        effect.type === 'setNpcStatus'
        && effect.status === 'crew'
        && 'npcId' in effect
        && effect.npcId !== undefined
      ) {
        recruitedNpcIds.add(effect.npcId);
      }

      if (
        (effect.type === 'addItem'
          || effect.type === 'buyItem'
          || effect.type === 'addCargoItem')
        && uniqueItems.has(effect.itemId)
      ) {
        uniqueItemIds.add(effect.itemId);
      }
    }
  }

  return {
    fromAge,
    toAge,
    eventsResolved: entries.length,
    statChanges: STAT_ORDER.flatMap((statId) => {
      const amount = statTotals[statId] ?? 0;
      return amount === 0 ? [] : [{ statId, amount }];
    }),
    highlights: [
      ...[...recruitedNpcIds].map((npcId) => ({
        type: 'crewRecruit' as const,
        npcId,
      })),
      ...[...uniqueItemIds].map((itemId) => ({
        type: 'uniqueItem' as const,
        itemId,
      })),
    ],
  };
}
