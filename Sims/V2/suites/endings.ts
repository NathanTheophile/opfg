import type { SuiteDefinition } from '../core/types';
import { cohortMortality, countBy, pct, stats } from '../core/stats';

export const endingsSuite: SuiteDefinition = {
  id: 'endings',
  title: 'Run Endings / Horizon',
  objective: 'Measure end-of-run integrity: age-35 reach, death vs legacy, ending distribution and final geography/career/race context.',
  summarize(samples) {
    const reached35 = samples.filter(({ reachedAge35 }) => reachedAge35);
    const survived35 = reached35.filter(({ playerDeath }) => !playerDeath);
    return {
      horizon: {
        reachedAge35: reached35.length,
        reachedAge35Pct: pct(reached35.length, samples.length),
        survivedTo35: survived35.length,
        survivedTo35Pct: pct(survived35.length, samples.length),
        finalAgeMonths: stats(samples.map(({ finalAgeMonths }) => finalAgeMonths)),
      },
      endings: countBy(samples, ({ endingId, careerEndReason, terminationReason }) => endingId ?? `reason:${careerEndReason ?? terminationReason}`),
      careerEndReasons: countBy(samples, ({ careerEndReason }) => careerEndReason ?? 'none'),
      mortalityByRace: cohortMortality(samples, ({ raceId }) => raceId ?? 'unknown'),
      mortalityByCareer: cohortMortality(samples, ({ finalCareer }) => finalCareer),
      finalContext: {
        finalCareer: countBy(samples, ({ finalCareer }) => finalCareer),
        finalSea: countBy(samples, ({ finalSeaId }) => finalSeaId),
        finalLocation: countBy(samples, ({ finalLocationId }) => finalLocationId),
        finalHealthSurvivors: stats(samples.filter(({ playerDeath }) => !playerDeath).map(({ finalHealth }) => finalHealth)),
        finalBerriesSurvivors: stats(samples.filter(({ playerDeath }) => !playerDeath).map(({ finalBerries }) => finalBerries)),
      },
      endingSeeds: samples.slice(0, 100).map(({ seed, endingId, careerEndReason, finalAgeMonths, raceId, finalCareer, finalLocationId, playerDeath }) => ({
        seed,
        endingId,
        careerEndReason,
        finalAgeMonths,
        raceId,
        finalCareer,
        finalLocationId,
        playerDeath,
      })),
    };
  },
  progress(samples) {
    return [
      { label: 'age35', value: samples.filter(({ reachedAge35 }) => reachedAge35).length },
      { label: 'deaths', value: samples.filter(({ playerDeath }) => playerDeath).length },
      { label: 'endings', value: new Set(samples.map(({ endingId }) => endingId).filter(Boolean)).size },
    ];
  },
};
