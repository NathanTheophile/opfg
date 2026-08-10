import { performance } from 'node:perf_hooks';
import type { ScheduledEvent } from '../src/game/model/schema';
import type { SimulationObserver } from '../src/game/simulation/observation';
import { simulateObservedRun } from '../src/game/simulation/simulateObservedRun';
import { average, inc, loadValidatedCatalog, parseSpecializedArgs, pct, quantile, topEntries, writeJson } from './simulation-specialized/shared';

const args = parseSpecializedArgs(process.argv.slice(2), 'reports/sim-narrative.json');
const catalog = loadValidatedCatalog();
const startedAt = performance.now();

const lifetimeSeedsPerRun: number[] = [];
const scheduledTreesPerRun: number[] = [];
const maxQueuePerRun: number[] = [];
const maxDuePerRun: number[] = [];
const maxTreesPendingPerRun: number[] = [];
const maxLifetimeTreesPendingPerRun: number[] = [];
const scheduledWaitMonths: number[] = [];
const waitsByEvent: Record<string, { count: number; total: number; max: number }> = {};
const lifetimeSeedCounts: Record<string, number> = {};
const treeRootCounts: Record<string, number> = {};
const errors: Record<string, number> = {};
const concurrencySamples: unknown[] = [];

let runsWithMultipleLifetimes = 0;
let runsWith3PlusLifetimes = 0;
let runsWithScheduledWaitOver12 = 0;
let totalScheduledResolutions = 0;

for (let index = 0; index < args.runs; index += 1) {
  const seed = (args.seed + index) >>> 0;
  const eventRoot = new Map<string, string>();
  const lifetimeRoots = new Set<string>();
  const startedTrees = new Set<string>();
  let lifetimeSeedCount = 0;
  let maxQueue = 0;
  let maxDue = 0;
  let maxTreesPending = 0;
  let maxLifetimeTreesPending = 0;
  let hadLongWait = false;

  const updateQueueMetrics = (scheduled: ScheduledEvent[], ageMonths: number) => {
    maxQueue = Math.max(maxQueue, scheduled.length);
    const due = scheduled.filter((entry) => entry.dueAgeMonths <= ageMonths);
    maxDue = Math.max(maxDue, due.length);

    const roots = new Set<string>();
    const lifeRoots = new Set<string>();
    for (const entry of scheduled) {
      const root = eventRoot.get(entry.eventId) ?? entry.sourceEventId;
      roots.add(root);
      if (lifetimeRoots.has(root)) lifeRoots.add(root);
    }
    maxTreesPending = Math.max(maxTreesPending, roots.size);
    maxLifetimeTreesPending = Math.max(maxLifetimeTreesPending, lifeRoots.size);

    if ((roots.size >= 5 || lifeRoots.size >= 2) && concurrencySamples.length < 30) {
      concurrencySamples.push({ seed, ageMonths, pending: scheduled.length, trees: roots.size, lifetimeTrees: lifeRoots.size });
    }
  };

  const observer: SimulationObserver = {
    onInitialState(state) {
      updateQueueMetrics(state.scheduledEvents, state.ageMonths);
    },
    onNavigationResolved(entry) {
      updateQueueMetrics(entry.afterState.scheduledEvents, entry.afterState.ageMonths);
    },
    onEventResolved(entry) {
      const event = entry.event;
      if (event.kind === 'normal' && event.lifetimeThreadSeed) {
        lifetimeSeedCount += 1;
        lifetimeRoots.add(event.id);
        inc(lifetimeSeedCounts, event.id);
      }

      let currentRoot = eventRoot.get(event.id);
      if (!currentRoot) {
        currentRoot = event.id;
        eventRoot.set(event.id, currentRoot);
      }

      if (event.kind === 'scheduled') {
        totalScheduledResolutions += 1;
        const pending = entry.beforeState.scheduledEvents
          .filter((candidate) => candidate.eventId === event.id && candidate.dueAgeMonths <= entry.beforeState.ageMonths)
          .sort((a, b) => a.dueAgeMonths - b.dueAgeMonths)[0];

        if (pending) {
          const wait = Math.max(0, entry.beforeState.ageMonths - pending.dueAgeMonths);
          scheduledWaitMonths.push(wait);
          if (wait > 12) hadLongWait = true;
          waitsByEvent[event.id] ??= { count: 0, total: 0, max: 0 };
          waitsByEvent[event.id].count += 1;
          waitsByEvent[event.id].total += wait;
          waitsByEvent[event.id].max = Math.max(waitsByEvent[event.id].max, wait);
        }
      }

      const beforeKeys = multiset(entry.beforeState.scheduledEvents);
      for (const scheduled of entry.afterState.scheduledEvents) {
        const key = scheduledKey(scheduled);
        const available = beforeKeys.get(key) ?? 0;
        if (available > 0) {
          beforeKeys.set(key, available - 1);
          continue;
        }

        const inheritedRoot = currentRoot ?? event.id;
        eventRoot.set(scheduled.eventId, inheritedRoot);
        startedTrees.add(inheritedRoot);
        inc(treeRootCounts, inheritedRoot);
      }

      updateQueueMetrics(entry.afterState.scheduledEvents, entry.afterState.ageMonths);
    },
    onTermination({ error }) {
      if (error) inc(errors, error);
    },
  };

  simulateObservedRun({ seed, catalog, maxResolvedEvents: args.maxEvents, observer });

  lifetimeSeedsPerRun.push(lifetimeSeedCount);
  scheduledTreesPerRun.push(startedTrees.size);
  maxQueuePerRun.push(maxQueue);
  maxDuePerRun.push(maxDue);
  maxTreesPendingPerRun.push(maxTreesPending);
  maxLifetimeTreesPendingPerRun.push(maxLifetimeTreesPending);
  if (lifetimeSeedCount >= 2) runsWithMultipleLifetimes += 1;
  if (lifetimeSeedCount >= 3) runsWith3PlusLifetimes += 1;
  if (hadLongWait) runsWithScheduledWaitOver12 += 1;
}

const waitRanking = Object.entries(waitsByEvent)
  .map(([eventId, value]) => ({ eventId, count: value.count, averageWaitMonths: value.total / value.count, maxWaitMonths: value.max }))
  .sort((a, b) => b.averageWaitMonths - a.averageWaitMonths || b.count - a.count)
  .slice(0, 30);

const report = {
  config: args,
  elapsedMs: performance.now() - startedAt,
  summary: {
    runs: args.runs,
    avgLifetimeSeedsStartedPerRun: average(lifetimeSeedsPerRun),
    runsWithMultipleLifetimes,
    runsWithMultipleLifetimesPct: pct(runsWithMultipleLifetimes, args.runs),
    runsWith3PlusLifetimes,
    avgScheduledTreesStartedPerRun: average(scheduledTreesPerRun),
    avgMaxPendingQueue: average(maxQueuePerRun),
    maxPendingQueueObserved: Math.max(...maxQueuePerRun),
    avgMaxDuePending: average(maxDuePerRun),
    maxDuePendingObserved: Math.max(...maxDuePerRun),
    avgMaxConcurrentScheduledTrees: average(maxTreesPendingPerRun),
    maxConcurrentScheduledTreesObserved: Math.max(...maxTreesPendingPerRun),
    avgMaxConcurrentLifetimeTrees: average(maxLifetimeTreesPendingPerRun),
    maxConcurrentLifetimeTreesObserved: Math.max(...maxLifetimeTreesPendingPerRun),
    totalScheduledResolutions,
    scheduledWaitAverageMonths: average(scheduledWaitMonths),
    scheduledWaitP50: quantile(scheduledWaitMonths, 0.50),
    scheduledWaitP90: quantile(scheduledWaitMonths, 0.90),
    scheduledWaitP99: quantile(scheduledWaitMonths, 0.99),
    scheduledWaitMax: scheduledWaitMonths.length ? Math.max(...scheduledWaitMonths) : 0,
    runsWithScheduledWaitOver12,
  },
  lifetimeSeedDistribution: histogram(lifetimeSeedsPerRun),
  topLifetimeSeeds: topEntries(lifetimeSeedCounts, 30),
  topScheduledTreeRoots: topEntries(treeRootCounts, 30),
  scheduledEventsWithLongestAverageWait: waitRanking,
  errors: topEntries(errors),
  concurrencySamples,
};

console.log('OPFG Specialized Simulation — NARRATIVE / SCHEDULER CONCURRENCY');
console.log(`Runs: ${args.runs}`);
console.log(`Avg Lifetime seeds started/run: ${average(lifetimeSeedsPerRun).toFixed(2)}`);
console.log(`Runs with >=2 Lifetimes: ${runsWithMultipleLifetimes} (${pct(runsWithMultipleLifetimes, args.runs).toFixed(1)}%)`);
console.log(`Avg max concurrent Scheduled trees: ${average(maxTreesPendingPerRun).toFixed(2)}`);
console.log(`Max concurrent Lifetime trees observed: ${Math.max(...maxLifetimeTreesPendingPerRun)}`);
console.log(`Scheduled wait avg/p90/max: ${average(scheduledWaitMonths).toFixed(2)} / ${quantile(scheduledWaitMonths, 0.90)} / ${scheduledWaitMonths.length ? Math.max(...scheduledWaitMonths) : 0} months`);
writeJson(args.jsonPath, report);

function scheduledKey(entry: ScheduledEvent): string {
  return `${entry.eventId}|${entry.dueAgeMonths}|${entry.sourceEventId}|${entry.sourceChoiceId}`;
}

function multiset(entries: ScheduledEvent[]): Map<string, number> {
  const result = new Map<string, number>();
  for (const entry of entries) result.set(scheduledKey(entry), (result.get(scheduledKey(entry)) ?? 0) + 1);
  return result;
}

function histogram(values: number[]): Record<string, number> {
  const result: Record<string, number> = {};
  values.forEach((value) => inc(result, String(value)));
  return result;
}
