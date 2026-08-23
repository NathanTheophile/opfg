import type { V2RunSample } from './types';
import { cohortMortality, countBy, mortality, pct, stats } from './stats';

export function buildCommonSummary(samples: readonly V2RunSample[]) {
  const errors = samples.filter(({ error }) => error !== undefined).length;
  const deadEnds = samples.filter(({ terminationReason }) => terminationReason === 'deadEnd').length;
  const safetyLimits = samples.filter(({ terminationReason }) => terminationReason === 'safetyLimit').length;
  const reachedAge35 = samples.filter(({ reachedAge35 }) => reachedAge35).length;
  const withCrew = samples.filter(({ maxCrewSize }) => maxCrewSize > 0).length;
  const withMedic = samples.filter(({ crewRolesEver }) => crewRolesEver.includes('medic')).length;
  const withNavigator = samples.filter(({ crewRolesEver }) => crewRolesEver.includes('navigator')).length;

  return {
    runs: samples.length,
    mortality: mortality(samples),
    reachedAge35,
    reachedAge35Pct: pct(reachedAge35, samples.length),
    errors,
    deadEnds,
    safetyLimits,
    terminationReasons: countBy(samples, ({ terminationReason }) => terminationReason),
    finalAgeMonths: stats(samples.map(({ finalAgeMonths }) => finalAgeMonths)),
    eventCount: stats(samples.map(({ eventCount }) => eventCount)),
    cohorts: {
      mortalityByRace: cohortMortality(samples, ({ raceId }) => raceId ?? 'unknown'),
      mortalityByCareer: cohortMortality(samples, ({ finalCareer }) => finalCareer),
      crew: {
        runsWithCrew: withCrew,
        runsWithCrewPct: pct(withCrew, samples.length),
        runsWithMedic: withMedic,
        runsWithMedicPct: pct(withMedic, samples.length),
        runsWithNavigator: withNavigator,
        runsWithNavigatorPct: pct(withNavigator, samples.length),
      },
    },
  };
}
