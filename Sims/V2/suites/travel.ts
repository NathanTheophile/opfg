import type { SuiteDefinition } from '../core/types';
import { countBy, mortality, pct, stats } from '../core/stats';

export const travelSuite: SuiteDefinition = {
  id: 'travel',
  title: 'World Travel Funnel',
  objective: 'Measure geographic progression from the Blues through Reverse Mountain, Paradise, Sabaody, Fish-Man Island and the New World, including Navigator impact and route regressions.',
  summarize(samples) {
    const attempted = samples.filter(({ reverseMountainAttempted }) => reverseMountainAttempted);
    const reached = samples.filter(({ reverseMountainReached }) => reverseMountainReached);
    const passed = samples.filter(({ reverseMountainPassed }) => reverseMountainPassed);
    const paradise = samples.filter(({ paradiseReached }) => paradiseReached);
    const thrillerBark = samples.filter(({ thrillerBarkReached }) => thrillerBarkReached);
    const sabaody = samples.filter(({ sabaodyReached }) => sabaodyReached);
    const fishMan = samples.filter(({ fishManIslandReached }) => fishManIslandReached);
    const newWorld = samples.filter(({ newWorldReached }) => newWorldReached);
    const attemptWithNavigator = samples.filter(({ reverseMountainAttemptWithNavigator }) => reverseMountainAttemptWithNavigator);
    const attemptedWithoutNavigator = attempted.filter(({ reverseMountainAttemptWithNavigator }) => !reverseMountainAttemptWithNavigator);
    const navigatorRuns = samples.filter(({ crewRolesEver }) => crewRolesEver.includes('navigator'));
    const sabaodyAfterThriller = samples.filter((sample) => sample.thrillerBarkReached && sample.sabaodyReached);

    return {
      worldFunnel: {
        totalRuns: samples.length,
        stayedInBlues: samples.filter((sample) => !sample.paradiseReached && !sample.reverseMountainReached).length,
        reverseMountainAttempted: attempted.length,
        reverseMountainReached: reached.length,
        reverseMountainPassed: passed.length,
        paradiseReached: paradise.length,
        thrillerBarkReached: thrillerBark.length,
        sabaodyReached: sabaody.length,
        fishManIslandReached: fishMan.length,
        newWorldReached: newWorld.length,
      },
      conversions: {
        attemptedToReachedPct: pct(reached.filter(({ reverseMountainAttempted }) => reverseMountainAttempted).length, attempted.length),
        reachedToPassedPct: pct(passed.length, reached.length),
        passedToParadisePct: pct(paradise.length, passed.length),
        paradiseToSabaodyPct: pct(sabaody.length, paradise.length),
        sabaodyToFishManIslandPct: pct(fishMan.length, sabaody.length),
        fishManIslandToNewWorldPct: pct(newWorld.length, fishMan.length),
      },
      navigator: {
        runsEverWithNavigator: navigatorRuns.length,
        runsEverWithNavigatorPct: pct(navigatorRuns.length, samples.length),
        reverseMountainAttemptsWithNavigator: attemptWithNavigator.length,
        reverseMountainAttemptsWithoutNavigator: attemptedWithoutNavigator.length,
        passRateWithNavigatorPct: pct(attemptWithNavigator.filter(({ reverseMountainPassed }) => reverseMountainPassed).length, attemptWithNavigator.length),
        passRateWithoutNavigatorPct: pct(attemptedWithoutNavigator.filter(({ reverseMountainPassed }) => reverseMountainPassed).length, attemptedWithoutNavigator.length),
        navigatorPowerUses: samples.reduce((sum, sample) => sum + (sample.crewPowerUses.navigator ?? 0), 0),
      },
      thrillerBarkToSabaody: {
        thrillerBarkRuns: thrillerBark.length,
        sabaodyAfterThrillerBarkRuns: sabaodyAfterThriller.length,
        conversionPct: pct(sabaodyAfterThriller.length, thrillerBark.length),
        conclusive: thrillerBark.length > 0,
      },
      finalGeography: {
        finalSea: countBy(samples, ({ finalSeaId }) => finalSeaId),
        finalLocation: countBy(samples, ({ finalLocationId }) => finalLocationId),
        visitedLocationCount: stats(samples.map(({ visitedLocations }) => visitedLocations.length)),
      },
      paradiseRoutes: countRoutes(samples),
      mortalityByMilestone: {
        reverseMountainAttempted: mortality(attempted),
        reverseMountainPassed: mortality(passed),
        paradise: mortality(paradise),
        sabaody: mortality(sabaody),
        fishManIsland: mortality(fishMan),
        newWorld: mortality(newWorld),
      },
    };
  },
  progress(samples) {
    return [
      { label: 'Paradise', value: samples.filter(({ paradiseReached }) => paradiseReached).length },
      { label: 'Sabaody', value: samples.filter(({ sabaodyReached }) => sabaodyReached).length },
      { label: 'NW', value: samples.filter(({ newWorldReached }) => newWorldReached).length },
    ];
  },
};

function countRoutes(samples: Parameters<typeof travelSuite.summarize>[0]) {
  const result: Record<string, number> = {};
  for (const sample of samples) {
    for (const routeId of sample.paradiseRouteIds) result[routeId] = (result[routeId] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(result).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}
