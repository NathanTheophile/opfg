import type { SuiteDefinition } from '../core/types';
import { countBy, pct, stats } from '../core/stats';

export const economyShipsSuite: SuiteDefinition = {
  id: 'economy-ships',
  title: 'Economy / Ships',
  objective: 'Measure earning/spending, ship acquisition, losses, reacquisition, ship distribution and sea-state safety without mixing these questions into narrative or health diagnostics.',
  summarize(samples) {
    const withShip = samples.filter(({ everHadShip }) => everHadShip);
    const withLoss = samples.filter(({ shipLosses }) => shipLosses > 0);
    const reacquired = samples.filter(({ shipAcquisitions }) => shipAcquisitions >= 2);
    const atSeaWithoutShip = samples.filter(({ everAtSeaWithoutShip }) => everAtSeaWithoutShip);
    const shipIdsEver: Record<string, number> = {};
    for (const sample of samples) {
      for (const shipId of sample.shipIdsSeen) shipIdsEver[shipId] = (shipIdsEver[shipId] ?? 0) + 1;
    }

    return {
      economy: {
        finalBerries: stats(samples.map(({ finalBerries }) => finalBerries)),
        incomePerRun: stats(samples.map(({ totalIncome }) => totalIncome)),
        spendPerRun: stats(samples.map(({ totalSpend }) => totalSpend)),
        minimumBerries: stats(samples.map(({ minimumBerries }) => minimumBerries)),
        maximumBerries: stats(samples.map(({ maximumBerries }) => maximumBerries)),
        runsEverEarning: samples.filter(({ totalIncome }) => totalIncome > 0).length,
        runsEverSpending: samples.filter(({ totalSpend }) => totalSpend > 0).length,
      },
      ships: {
        runsEverWithShip: withShip.length,
        runsEverWithShipPct: pct(withShip.length, samples.length),
        firstShipAgeMonths: stats(withShip.flatMap(({ firstShipAgeMonths }) => firstShipAgeMonths === null ? [] : [firstShipAgeMonths])),
        acquisitionsPerRun: stats(samples.map(({ shipAcquisitions }) => shipAcquisitions)),
        lossesPerRun: stats(samples.map(({ shipLosses }) => shipLosses)),
        runsWithShipLoss: withLoss.length,
        runsWithShipLossPct: pct(withLoss.length, samples.length),
        runsReacquiringShip: reacquired.length,
        runsReacquiringShipPct: pct(reacquired.length, samples.length),
        finalShipIds: countBy(samples, ({ finalShipId }) => finalShipId ?? 'none'),
        shipIdsEver,
        finalShipHealth: stats(samples.flatMap(({ finalShipHealth }) => finalShipHealth === null ? [] : [finalShipHealth])),
        shipwrightPowerUses: samples.reduce((sum, sample) => sum + (sample.crewPowerUses.shipwright ?? 0), 0),
      },
      safety: {
        runsEverAtSeaWithoutShip: atSeaWithoutShip.length,
        runsEverAtSeaWithoutShipPct: pct(atSeaWithoutShip.length, samples.length),
        sampleSeeds: atSeaWithoutShip.slice(0, 20).map(({ seed, finalLocationId, playerDeath }) => ({ seed, finalLocationId, playerDeath })),
      },
    };
  },
  progress(samples) {
    return [
      { label: 'ships', value: samples.filter(({ everHadShip }) => everHadShip).length },
      { label: 'losses', value: samples.reduce((sum, sample) => sum + sample.shipLosses, 0) },
      { label: 'reacq', value: samples.filter(({ shipAcquisitions }) => shipAcquisitions >= 2).length },
    ];
  },
};
