import type { SuiteDefinition } from '../core/types';
import { countBy, pct, stats, topEntries } from '../core/stats';

export const sanitySuite: SuiteDefinition = {
  id: 'sanity',
  title: 'Sanity / Runtime Integrity',
  objective: 'Verify that runs terminate cleanly without simulation errors, dead ends, safety-limit loops, impossible travel states, or runaway immediate/critical chains.',
  summarize(samples, top) {
    const errors = samples.filter(({ error }) => error !== undefined);
    const deadEnds = samples.filter(({ terminationReason }) => terminationReason === 'deadEnd');
    const safetyLimits = samples.filter(({ terminationReason }) => terminationReason === 'safetyLimit');
    const atSeaWithoutShip = samples.filter(({ everAtSeaWithoutShip }) => everAtSeaWithoutShip);
    const immediateGuard = samples.filter(({ immediateGuardTriggered }) => immediateGuardTriggered);
    const criticalLoops = samples.filter(({ possibleCriticalLoop }) => possibleCriticalLoop);
    const errorMessages: Record<string, number> = {};
    for (const sample of errors) errorMessages[sample.error ?? 'unknown'] = (errorMessages[sample.error ?? 'unknown'] ?? 0) + 1;

    return {
      verdictInputs: {
        errors: errors.length,
        deadEnds: deadEnds.length,
        safetyLimits: safetyLimits.length,
        atSeaWithoutShip: atSeaWithoutShip.length,
        immediateGuardTriggers: immediateGuard.length,
        possibleCriticalLoops: criticalLoops.length,
      },
      percentages: {
        cleanCareerEndedPct: pct(samples.filter(({ terminationReason }) => terminationReason === 'careerEnded').length, samples.length),
        errorPct: pct(errors.length, samples.length),
        deadEndPct: pct(deadEnds.length, samples.length),
        safetyLimitPct: pct(safetyLimits.length, samples.length),
      },
      terminations: countBy(samples, ({ terminationReason }) => terminationReason),
      eventCount: stats(samples.map(({ eventCount }) => eventCount)),
      maximumImmediateChainLength: stats(samples.map(({ maximumImmediateChainLength }) => maximumImmediateChainLength)),
      maximumFallbackStreak: stats(samples.map(({ maximumFallbackStreak }) => maximumFallbackStreak)),
      topErrors: topEntries(errorMessages, top),
      sampleProblemSeeds: samples
        .filter((sample) => sample.error || sample.terminationReason !== 'careerEnded' || sample.everAtSeaWithoutShip || sample.immediateGuardTriggered || sample.possibleCriticalLoop)
        .slice(0, top)
        .map((sample) => ({
          seed: sample.seed,
          terminationReason: sample.terminationReason,
          error: sample.error,
          finalAgeMonths: sample.finalAgeMonths,
          finalLocationId: sample.finalLocationId,
          everAtSeaWithoutShip: sample.everAtSeaWithoutShip,
          maximumImmediateChainLength: sample.maximumImmediateChainLength,
          possibleCriticalLoop: sample.possibleCriticalLoop,
        })),
    };
  },
  progress(samples) {
    return [
      { label: 'errors', value: samples.filter(({ error }) => error !== undefined).length },
      { label: 'deadEnds', value: samples.filter(({ terminationReason }) => terminationReason === 'deadEnd').length },
      { label: 'safety', value: samples.filter(({ terminationReason }) => terminationReason === 'safetyLimit').length },
    ];
  },
};
