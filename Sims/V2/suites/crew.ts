import type { SuiteDefinition, V2RunSample } from '../core/types';
import { mortality, pct, stats, sumRecords, topEntries } from '../core/stats';

export const crewSuite: SuiteDefinition = {
  id: 'crew',
  title: 'Crew Roles / Annual Powers',
  objective: 'Measure recruitment, role availability, annual-power usage and practical impact of Navigator, Medic, Shipwright, Recruiter and First Mate.',
  summarize(samples, top) {
    const roleRuns: Record<string, number> = {};
    const powerUses: Record<string, number> = {};
    const rolePresenceYears: Record<string, number> = {};
    const roleAvailableYears: Record<string, number> = {};
    const roleUsedYears: Record<string, number> = {};

    for (const sample of samples) {
      for (const roleId of sample.crewRolesEver) roleRuns[roleId] = (roleRuns[roleId] ?? 0) + 1;
      sumRecords(powerUses, sample.crewPowerUses);
      for (const [roleId, years] of Object.entries(sample.rolePresenceYears)) {
        rolePresenceYears[roleId] = (rolePresenceYears[roleId] ?? 0) + years.length;
      }
      for (const [roleId, years] of Object.entries(sample.roleAvailableYears)) {
        roleAvailableYears[roleId] = (roleAvailableYears[roleId] ?? 0) + years.length;
      }
      for (const [roleId, years] of Object.entries(sample.roleUsedYears)) {
        roleUsedYears[roleId] = (roleUsedYears[roleId] ?? 0) + years.length;
      }
    }

    const withMedic = samples.filter((sample) => sample.crewRolesEver.includes('medic'));
    const withoutMedic = samples.filter((sample) => !sample.crewRolesEver.includes('medic'));
    const usingMedic = samples.filter((sample) => (sample.crewPowerUses.medic ?? 0) > 0);
    const withNavigator = samples.filter((sample) => sample.crewRolesEver.includes('navigator'));
    const withoutNavigator = samples.filter((sample) => !sample.crewRolesEver.includes('navigator'));

    return {
      recruitment: {
        runsWithCrew: samples.filter(({ maxCrewSize }) => maxCrewSize > 0).length,
        runsWithCrewPct: pct(samples.filter(({ maxCrewSize }) => maxCrewSize > 0).length, samples.length),
        maxCrewSize: stats(samples.map(({ maxCrewSize }) => maxCrewSize)),
        recruitmentsPerRun: stats(samples.map(({ crewRecruitments }) => crewRecruitments)),
        departuresPerRun: stats(samples.map(({ crewDepartures }) => crewDepartures)),
        uniqueCrewNpcCountPerRun: stats(samples.map(({ crewIdsEver }) => crewIdsEver.length)),
      },
      roleCoverage: Object.entries(roleRuns)
        .map(([roleId, runs]) => ({ roleId, runs, runPct: pct(runs, samples.length) }))
        .sort((a, b) => b.runs - a.runs || a.roleId.localeCompare(b.roleId)),
      annualPowers: {
        totalUses: topEntries(powerUses, top),
        rolePresenceYears,
        roleAvailableYears,
        roleUsedYears,
        utilizationByRole: Object.keys({ ...roleAvailableYears, ...roleUsedYears })
          .sort()
          .map((roleId) => ({
            roleId,
            availableYears: roleAvailableYears[roleId] ?? 0,
            usedYears: roleUsedYears[roleId] ?? 0,
            utilizationPct: pct(roleUsedYears[roleId] ?? 0, roleAvailableYears[roleId] ?? 0),
          })),
      },
      medic: {
        withMedic: mortality(withMedic),
        withoutMedic: mortality(withoutMedic),
        usingMedicPower: mortality(usingMedic),
        effectiveHealing: samples.reduce((sum, sample) => sum + sample.medicHealing, 0),
        effectiveHealingPerMedicRun: withMedic.length === 0 ? 0 : withMedic.reduce((sum, sample) => sum + sample.medicHealing, 0) / withMedic.length,
      },
      navigator: {
        withNavigator: mortality(withNavigator),
        withoutNavigator: mortality(withoutNavigator),
        reverseMountainAttemptRateWithNavigatorPct: pct(withNavigator.filter(({ reverseMountainAttempted }) => reverseMountainAttempted).length, withNavigator.length),
        reverseMountainAttemptRateWithoutNavigatorPct: pct(withoutNavigator.filter(({ reverseMountainAttempted }) => reverseMountainAttempted).length, withoutNavigator.length),
        paradiseRateWithNavigatorPct: pct(withNavigator.filter(({ paradiseReached }) => paradiseReached).length, withNavigator.length),
        paradiseRateWithoutNavigatorPct: pct(withoutNavigator.filter(({ paradiseReached }) => paradiseReached).length, withoutNavigator.length),
      },
      topHighCrewSeeds: [...samples]
        .sort((a, b) => b.maxCrewSize - a.maxCrewSize || b.crewRecruitments - a.crewRecruitments)
        .slice(0, Math.min(top, 20))
        .map(crewSeed),
    };
  },
  progress(samples) {
    return [
      { label: 'crew', value: samples.filter(({ maxCrewSize }) => maxCrewSize > 0).length },
      { label: 'medic', value: samples.filter(({ crewRolesEver }) => crewRolesEver.includes('medic')).length },
      { label: 'nav', value: samples.filter(({ crewRolesEver }) => crewRolesEver.includes('navigator')).length },
    ];
  },
};

function crewSeed(sample: V2RunSample) {
  return {
    seed: sample.seed,
    maxCrewSize: sample.maxCrewSize,
    crewRecruitments: sample.crewRecruitments,
    crewRolesEver: sample.crewRolesEver,
    crewPowerUses: sample.crewPowerUses,
    playerDeath: sample.playerDeath,
  };
}
