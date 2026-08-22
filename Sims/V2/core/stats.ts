import type { V2RunSample } from './types';

export function pct(value: number, total: number): number {
  return total === 0 ? 0 : value / total * 100;
}

export function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function quantile(values: readonly number[], q: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * q)));
  return sorted[index];
}

export function stats(values: readonly number[]) {
  if (values.length === 0) {
    return { count: 0, min: 0, average: 0, p10: 0, p50: 0, p90: 0, p99: 0, max: 0 };
  }
  return {
    count: values.length,
    min: Math.min(...values),
    average: average(values),
    p10: quantile(values, 0.10),
    p50: quantile(values, 0.50),
    p90: quantile(values, 0.90),
    p99: quantile(values, 0.99),
    max: Math.max(...values),
  };
}

export function inc(target: Record<string, number>, key: string, amount = 1): void {
  target[key] = (target[key] ?? 0) + amount;
}

export function sumRecords(target: Record<string, number>, source: Readonly<Record<string, number>>): void {
  for (const [key, value] of Object.entries(source)) inc(target, key, value);
}

export function countBy<T>(values: readonly T[], key: (value: T) => string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const value of values) inc(result, key(value));
  return sortRecord(result);
}

export function sortRecord(record: Readonly<Record<string, number>>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(record).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  );
}

export function topEntries(record: Readonly<Record<string, number>>, limit: number) {
  return Object.entries(record)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value || a.key.localeCompare(b.key))
    .slice(0, limit);
}

export function mortality(samples: readonly V2RunSample[]) {
  const deaths = samples.filter(({ playerDeath }) => playerDeath).length;
  return { runs: samples.length, deaths, deathPct: pct(deaths, samples.length) };
}

export function cohortMortality(
  samples: readonly V2RunSample[],
  key: (sample: V2RunSample) => string,
) {
  const groups = new Map<string, V2RunSample[]>();
  for (const sample of samples) {
    const groupKey = key(sample);
    const bucket = groups.get(groupKey) ?? [];
    bucket.push(sample);
    groups.set(groupKey, bucket);
  }
  return [...groups.entries()]
    .map(([id, group]) => ({ id, ...mortality(group) }))
    .sort((a, b) => b.runs - a.runs || a.id.localeCompare(b.id));
}

export function ageLabel(months: number | null): string {
  if (months === null) return 'never';
  return `${Math.floor(months / 12)}y${months % 12}m`;
}

export function compactRunSample(sample: V2RunSample) {
  return {
    seed: sample.seed,
    terminationReason: sample.terminationReason,
    error: sample.error,
    playerDeath: sample.playerDeath,
    endingId: sample.endingId,
    finalAgeMonths: sample.finalAgeMonths,
    raceId: sample.raceId,
    finalCareer: sample.finalCareer,
    finalHealth: sample.finalHealth,
    totalDamage: sample.totalDamage,
    totalHealing: sample.totalHealing,
    medicHealing: sample.medicHealing,
    maxCrewSize: sample.maxCrewSize,
    crewRolesEver: sample.crewRolesEver,
    crewPowerUses: sample.crewPowerUses,
    everHadShip: sample.everHadShip,
    shipLosses: sample.shipLosses,
    reverseMountainAttempted: sample.reverseMountainAttempted,
    paradiseReached: sample.paradiseReached,
    sabaodyReached: sample.sabaodyReached,
    fishManIslandReached: sample.fishManIslandReached,
    newWorldReached: sample.newWorldReached,
    finalLocationId: sample.finalLocationId,
    finalSeaId: sample.finalSeaId,
    fallbackEvents: sample.fallbackEvents,
    maximumFallbackStreak: sample.maximumFallbackStreak,
    eventCount: sample.eventCount,
    diceChecks: sample.dice.length,
  };
}
