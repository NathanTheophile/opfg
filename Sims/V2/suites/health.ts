import type { SuiteDefinition, V2RunSample } from '../core/types';
import { cohortMortality, mortality, pct, stats, sumRecords, topEntries } from '../core/stats';

export const healthSuite: SuiteDefinition = {
  id: 'health',
  title: 'Health / Mortality',
  objective: 'Measure mortality, attrition, healing, lethal sources, race gaps, sea/land damage, and the impact of Medic ownership and annual Medic use.',
  summarize(samples, top) {
    const withMedic = samples.filter((sample) => sample.crewRolesEver.includes('medic'));
    const withoutMedic = samples.filter((sample) => !sample.crewRolesEver.includes('medic'));
    const usingMedic = samples.filter((sample) => (sample.crewPowerUses.medic ?? 0) > 0);
    const withNavigator = samples.filter((sample) => sample.crewRolesEver.includes('navigator'));
    const damageByEvent: Record<string, number> = {};
    const lethalEvents: Record<string, number> = {};
    const damageAtSea = samples.reduce((sum, sample) => sum + sample.damageByTravelState.at_sea, 0);
    const damageOnLand = samples.reduce((sum, sample) => sum + sample.damageByTravelState.on_land, 0);
    const healingAtSea = samples.reduce((sum, sample) => sum + sample.healingByTravelState.at_sea, 0);
    const healingOnLand = samples.reduce((sum, sample) => sum + sample.healingByTravelState.on_land, 0);

    for (const sample of samples) {
      sumRecords(damageByEvent, sample.damageByEvent);
      if (sample.lethalEventId) lethalEvents[sample.lethalEventId] = (lethalEvents[sample.lethalEventId] ?? 0) + 1;
    }

    return {
      mortality: mortality(samples),
      mortalityByRace: cohortMortality(samples, ({ raceId }) => raceId ?? 'unknown'),
      mortalityByCareer: cohortMortality(samples, ({ finalCareer }) => finalCareer),
      medicImpact: {
        withMedic: mortality(withMedic),
        withoutMedic: mortality(withoutMedic),
        usingMedicPower: mortality(usingMedic),
        runsWithMedic: withMedic.length,
        runsWithMedicPct: pct(withMedic.length, samples.length),
        runsUsingMedicPower: usingMedic.length,
        runsUsingMedicPowerPct: pct(usingMedic.length, samples.length),
        medicPowerUses: samples.reduce((sum, sample) => sum + (sample.crewPowerUses.medic ?? 0), 0),
        effectiveMedicHealing: samples.reduce((sum, sample) => sum + sample.medicHealing, 0),
        effectiveMedicHealingPerRunWithMedic: withMedic.length === 0 ? 0 : withMedic.reduce((sum, sample) => sum + sample.medicHealing, 0) / withMedic.length,
      },
      navigatorContext: {
        runsWithNavigator: withNavigator.length,
        runsWithNavigatorPct: pct(withNavigator.length, samples.length),
        mortalityWithNavigator: mortality(withNavigator),
      },
      healthDistributions: {
        initialHealth: stats(samples.flatMap(({ initialHealth }) => initialHealth === null ? [] : [initialHealth])),
        finalHealth: stats(samples.map(({ finalHealth }) => finalHealth)),
        minimumHealth: stats(samples.map(({ minimumHealth }) => minimumHealth)),
        damagePerRun: stats(samples.map(({ totalDamage }) => totalDamage)),
        healingPerRun: stats(samples.map(({ totalHealing }) => totalHealing)),
        medicHealingPerRun: stats(samples.map(({ medicHealing }) => medicHealing)),
        deathAgeMonths: stats(samples.flatMap(({ deathAgeMonths }) => deathAgeMonths === null ? [] : [deathAgeMonths])),
      },
      travelContext: {
        atSea: { totalDamage: damageAtSea, totalHealing: healingAtSea },
        onLand: { totalDamage: damageOnLand, totalHealing: healingOnLand },
      },
      topDamageEvents: topEntries(damageByEvent, top),
      topLethalEvents: topEntries(lethalEvents, top),
      lowestHealthSurvivors: samples
        .filter((sample) => !sample.playerDeath)
        .sort((a, b) => a.finalHealth - b.finalHealth)
        .slice(0, Math.min(top, 20))
        .map(healthSeed),
    };
  },
  progress(samples) {
    const deaths = samples.filter(({ playerDeath }) => playerDeath).length;
    const medics = samples.filter(({ crewRolesEver }) => crewRolesEver.includes('medic')).length;
    const medicUsed = samples.filter(({ crewPowerUses }) => (crewPowerUses.medic ?? 0) > 0).length;
    return [
      { label: 'deaths', value: `${deaths} (${pct(deaths, samples.length).toFixed(1)}%)` },
      { label: 'medic', value: medics },
      { label: 'medicUsed', value: medicUsed },
    ];
  },
};

function healthSeed(sample: V2RunSample) {
  return {
    seed: sample.seed,
    raceId: sample.raceId,
    finalHealth: sample.finalHealth,
    minimumHealth: sample.minimumHealth,
    totalDamage: sample.totalDamage,
    totalHealing: sample.totalHealing,
    medicHealing: sample.medicHealing,
  };
}
