import type { SuiteDefinition } from '../core/types';
import { pct, stats, sumRecords, topEntries } from '../core/stats';

export const narrativeSuite: SuiteDefinition = {
  id: 'narrative',
  title: 'Narrative Coverage / Pool Health',
  objective: 'Measure event coverage, Lifetime participation, Scheduled/Critical/Immediate load, fallback starvation and overrepresented narrative content.',
  summarize(samples, top) {
    const globalEventCounts: Record<string, number> = {};
    const uniqueEvents = new Set<string>();
    let totalFallbacks = 0;
    let lifetimeRuns = 0;

    for (const sample of samples) {
      sumRecords(globalEventCounts, sample.eventCounts);
      sample.eventIdsSeen.forEach((id) => uniqueEvents.add(id));
      totalFallbacks += sample.fallbackEvents;
      if (sample.lifetimeThreadStarted) lifetimeRuns += 1;
    }

    return {
      coverage: {
        uniqueEventsSeen: uniqueEvents.size,
        totalResolvedEvents: samples.reduce((sum, sample) => sum + sample.eventCount, 0),
        eventsPerRun: stats(samples.map(({ eventCount }) => eventCount)),
        topEvents: topEntries(globalEventCounts, top),
      },
      eventKindsPerRun: {
        normal: stats(samples.map(({ normalEvents }) => normalEvents)),
        scheduled: stats(samples.map(({ scheduledEvents }) => scheduledEvents)),
        critical: stats(samples.map(({ criticalEvents }) => criticalEvents)),
        immediate: stats(samples.map(({ immediateEvents }) => immediateEvents)),
      },
      lifetime: {
        runsStartingLifetimeThread: lifetimeRuns,
        runsStartingLifetimeThreadPct: pct(lifetimeRuns, samples.length),
      },
      fallbacks: {
        totalFallbacks,
        runsWithFallback: samples.filter(({ fallbackEvents }) => fallbackEvents > 0).length,
        runsWithFallbackPct: pct(samples.filter(({ fallbackEvents }) => fallbackEvents > 0).length, samples.length),
        fallbacksPerRun: stats(samples.map(({ fallbackEvents }) => fallbackEvents)),
        maximumConsecutiveFallbackStreak: stats(samples.map(({ maximumFallbackStreak }) => maximumFallbackStreak)),
        runsWith10PlusFallbacks: samples.filter(({ fallbackEvents }) => fallbackEvents >= 10).length,
      },
      starvationSeeds: [...samples]
        .filter(({ fallbackEvents }) => fallbackEvents > 0)
        .sort((a, b) => b.fallbackEvents - a.fallbackEvents || b.maximumFallbackStreak - a.maximumFallbackStreak)
        .slice(0, Math.min(top, 30))
        .map(({ seed, fallbackEvents, maximumFallbackStreak, finalAgeMonths, finalLocationId, playerDeath }) => ({
          seed,
          fallbackEvents,
          maximumFallbackStreak,
          finalAgeMonths,
          finalLocationId,
          playerDeath,
        })),
    };
  },
  progress(samples) {
    return [
      { label: 'fallbacks', value: samples.reduce((sum, sample) => sum + sample.fallbackEvents, 0) },
      { label: 'lifetime', value: samples.filter(({ lifetimeThreadStarted }) => lifetimeThreadStarted).length },
      { label: 'unique', value: new Set(samples.flatMap(({ eventIdsSeen }) => eventIdsSeen)).size },
    ];
  },
};
