import type { SuiteDefinition } from '../core/types';
import { countBy, pct, stats } from '../core/stats';

const STAT_IDS = ['health', 'morale', 'strength', 'agility', 'observation', 'intelligence', 'navigation', 'charisma', 'luck'] as const;

export const progressionSuite: SuiteDefinition = {
  id: 'progression',
  title: 'Character Progression',
  objective: 'Measure age-35 reach, player stats, traits, Haki, Devil Fruits, careers, ranks/titles proxies and progression breadth under a selected policy.',
  summarize(samples) {
    const survivors35 = samples.filter(({ reachedAge35, playerDeath }) => reachedAge35 && !playerDeath);
    const fruitRuns = samples.filter(({ devilFruitId }) => devilFruitId !== null);
    const observationAwakened = samples.filter(({ finalHaki }) => finalHaki.observation > 0);
    const armamentAwakened = samples.filter(({ finalHaki }) => finalHaki.armament > 0);
    const conquerorAwakened = samples.filter(({ finalHaki }) => finalHaki.conqueror > 0);

    return {
      horizon: {
        reachedAge35: samples.filter(({ reachedAge35 }) => reachedAge35).length,
        reachedAge35Pct: pct(samples.filter(({ reachedAge35 }) => reachedAge35).length, samples.length),
        survivedTo35: survivors35.length,
        survivedTo35Pct: pct(survivors35.length, samples.length),
      },
      finalStats: Object.fromEntries(
        STAT_IDS.map((statId) => [statId, stats(samples.map((sample) => sample.finalStats[statId]))]),
      ),
      finalStatsAt35Survivors: Object.fromEntries(
        STAT_IDS.map((statId) => [statId, stats(survivors35.map((sample) => sample.finalStats[statId]))]),
      ),
      traits: {
        finalTraitCount: stats(samples.map(({ finalTraits }) => finalTraits.length)),
        everTraitCount: stats(samples.map(({ traitsEver }) => traitsEver.length)),
        finalTraitFrequency: countStringArray(samples.map(({ finalTraits }) => finalTraits)),
        everTraitFrequency: countStringArray(samples.map(({ traitsEver }) => traitsEver)),
      },
      haki: {
        observationAwakened: observationAwakened.length,
        observationAwakenedPct: pct(observationAwakened.length, samples.length),
        armamentAwakened: armamentAwakened.length,
        armamentAwakenedPct: pct(armamentAwakened.length, samples.length),
        conquerorAwakened: conquerorAwakened.length,
        conquerorAwakenedPct: pct(conquerorAwakened.length, samples.length),
        observationLevel: stats(samples.map(({ finalHaki }) => finalHaki.observation)),
        armamentLevel: stats(samples.map(({ finalHaki }) => finalHaki.armament)),
        conquerorLevel: stats(samples.map(({ finalHaki }) => finalHaki.conqueror)),
      },
      devilFruit: {
        runsWithFruit: fruitRuns.length,
        runsWithFruitPct: pct(fruitRuns.length, samples.length),
        fruitIds: countBy(fruitRuns, ({ devilFruitId }) => devilFruitId ?? 'none'),
        awakening: stats(fruitRuns.map(({ finalFruitAwakening }) => finalFruitAwakening)),
      },
      careers: {
        finalCareer: countBy(samples, ({ finalCareer }) => finalCareer),
        careersSeenCount: stats(samples.map(({ careersSeen }) => careersSeen.length)),
      },
    };
  },
  progress(samples) {
    return [
      { label: 'age35', value: samples.filter(({ reachedAge35 }) => reachedAge35).length },
      { label: 'fruit', value: samples.filter(({ devilFruitId }) => devilFruitId !== null).length },
      { label: 'haki', value: samples.filter(({ finalHaki }) => finalHaki.observation > 0 || finalHaki.armament > 0 || finalHaki.conqueror > 0).length },
    ];
  },
};

function countStringArray(groups: readonly string[][]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const group of groups) for (const id of group) result[id] = (result[id] ?? 0) + 1;
  return Object.fromEntries(Object.entries(result).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}
