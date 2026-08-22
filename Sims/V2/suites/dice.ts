import type { SuiteDefinition } from '../core/types';
import { countBy, pct, stats, topEntries } from '../core/stats';

export const diceSuite: SuiteDefinition = {
  id: 'dice',
  title: 'Dice Distribution',
  objective: 'Measure d20 raw-roll distribution, outcome distribution, stat usage, modifier totals and player-vs-crew dice participation under real run conditions.',
  summarize(samples, top) {
    const checks = samples.flatMap(({ dice }) => dice);
    const rawRolls: Record<string, number> = {};
    const resultCounts: Record<string, number> = {};
    const statCounts: Record<string, number> = {};
    const eventCounts: Record<string, number> = {};
    for (const check of checks) {
      rawRolls[String(check.rawRoll)] = (rawRolls[String(check.rawRoll)] ?? 0) + 1;
      resultCounts[check.result] = (resultCounts[check.result] ?? 0) + 1;
      statCounts[check.statId] = (statCounts[check.statId] ?? 0) + 1;
      eventCounts[check.eventId] = (eventCounts[check.eventId] ?? 0) + 1;
    }

    return {
      totalChecks: checks.length,
      checksPerRun: stats(samples.map(({ dice }) => dice.length)),
      outcomes: Object.entries(resultCounts)
        .map(([result, count]) => ({ result, count, pct: pct(count, checks.length) }))
        .sort((a, b) => b.count - a.count || a.result.localeCompare(b.result)),
      rawRollDistribution: Object.fromEntries(
        Array.from({ length: 20 }, (_, index) => String(index + 1)).map((roll) => [roll, rawRolls[roll] ?? 0]),
      ),
      rawRoll: stats(checks.map(({ rawRoll }) => rawRoll)),
      modifierTotal: stats(checks.map(({ modifierTotal }) => modifierTotal)),
      finalTotal: stats(checks.map(({ total }) => total)),
      statUsage: Object.fromEntries(Object.entries(statCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
      actor: countBy(checks, ({ actor }) => actor),
      crewCheckPct: pct(checks.filter(({ actor }) => actor === 'crew').length, checks.length),
      topDiceEvents: topEntries(eventCounts, top),
    };
  },
  progress(samples) {
    const checks = samples.reduce((sum, sample) => sum + sample.dice.length, 0);
    const critFails = samples.reduce((sum, sample) => sum + sample.dice.filter(({ result }) => result === 'criticalFailure').length, 0);
    return [
      { label: 'checks', value: checks },
      { label: 'critFail', value: critFails },
    ];
  },
};
