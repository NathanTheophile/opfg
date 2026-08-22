import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { ChoiceDefinition, ContentCatalog, EventDefinition } from '../../src/game/content/schema';
import { loadNodeContentCatalog } from '../../src/game/content/nodeContentCatalog';
import { getChoiceState } from '../../src/game/engine/conditions';
import {
  hasEligibleCrewRecruitmentEvent,
  isCrewRecruitmentEvent,
} from '../../src/game/engine/events';
import type { GameState } from '../../src/game/model/schema';
import type { SimulationObserver } from '../../src/game/simulation/observation';
import { simulateObservedRun } from '../../src/game/simulation/simulateObservedRun';
import {
  progressionSimulationPolicy,
  type SimulationDecisionContext,
  type SimulationPolicy,
} from '../../src/game/simulation/simulationPolicy';
import { validateContent } from '../../src/game/validation/validateContent';
import { ProgressReporter, formatDuration } from './core/progress';
import { pct, stats } from './core/stats';

type TargetYear = 15 | 16 | 17;
type YearRecord = Record<TargetYear, number>;

const TARGET_YEARS: readonly TargetYear[] = [15, 16, 17];
const AGE_16_MONTHS = 16 * 12;
const AGE_17_MONTHS = 17 * 12;
const AGE_18_MONTHS = 18 * 12;

interface Args {
  runs: number;
  seed: number;
  maxEvents: number;
  jsonPath: string;
  progress: boolean;
  progressEveryMs: number;
  includeRuns: boolean;
}

interface RunRecruitmentDiagnostic {
  seed: number;
  terminationReason: string;
  error?: string;
  playerDeath: boolean;
  finalAgeMonths: number;

  chainScenes: YearRecord;
  directRecruitEventsPlayed: YearRecord;
  eligibleRecruitmentWindows: YearRecord;
  eligibleButDifferentEventSelected: YearRecord;
  directRecruitChoiceOpportunities: YearRecord;
  directRecruitChoicesSelected: YearRecord;
  selectedDirectRecruitChoiceNoRecruit: YearRecord;
  actualRecruitments: YearRecord;

  crewAt16: number | null;
  crewAt17: number | null;
  crewAt18: number | null;
  firstRecruitAgeMonths: number | null;
  secondRecruitAgeMonths: number | null;
  thirdRecruitAgeMonths: number | null;
  recruitmentAgesMonths: number[];
  recruitedNpcIds: string[];

  recruitmentEventCounts: Record<string, number>;
  directRecruitEventCounts: Record<string, number>;
  actualRecruitEventCounts: Record<string, number>;
}

const recruitmentFocusedPolicy: SimulationPolicy = {
  id: 'recruitment',
  choose(choices, rngState, context) {
    if (context) {
      const scored = choices
        .map((choice) => ({ choice, score: recruitmentChoiceScore(choice, context) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score || a.choice.id.localeCompare(b.choice.id));
      if (scored.length > 0) return { choice: scored[0].choice, nextRngState: rngState };
    }
    return progressionSimulationPolicy.choose(choices, rngState, context);
  },
  chooseNavigation: progressionSimulationPolicy.chooseNavigation,
  chooseCrewRole: progressionSimulationPolicy.chooseCrewRole,
  chooseCrewPower: progressionSimulationPolicy.chooseCrewPower,
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const catalog = loadNodeContentCatalog();
  const validationErrors = validateContent(catalog);
  if (validationErrors.length > 0) {
    validationErrors.slice(0, 20).forEach(({ path, message }) => console.error(`ERROR ${path}: ${message}`));
    throw new Error(`Recruitment diagnostic aborted: ${validationErrors.length} structural content error(s).`);
  }
  if (typeof recruitmentFocusedPolicy.chooseCrewPower !== 'function') {
    throw new Error('Recruitment diagnostic requires the Crew-power progression patch.');
  }

  const reporter = new ProgressReporter({
    suite: 'recruitment-diagnostic',
    policy: recruitmentFocusedPolicy.id,
    total: args.runs,
    enabled: args.progress,
    intervalMs: args.progressEveryMs,
  });
  reporter.header(args.seed, args.maxEvents, args.jsonPath);
  console.log('Objective: determine whether a recruitment-focused player can reliably build 1 crew during age 15, 2 by age 17, and 3 by age 18, and identify exactly where recruitment cadence fails.\n');

  const startedAt = new Date();
  const samples: RunRecruitmentDiagnostic[] = [];

  for (let index = 0; index < args.runs; index += 1) {
    const seed = (args.seed + index) >>> 0;
    samples.push(runDiagnostic(seed, catalog, args.maxEvents));
    reporter.tick(samples.length, progressMetrics(samples));
  }
  reporter.finish(samples.length, progressMetrics(samples));

  const completedAt = new Date();
  const report = {
    telemetryVersion: '2.1-recruitment-diagnostic',
    suite: {
      id: 'recruitment-diagnostic',
      title: 'Early Crew Recruitment Diagnostic',
      objective: 'Separate recruitment content availability, eligibility, selection, choice conversion, and actual crew acquisition at ages 15, 16, and 17.',
    },
    config: {
      runs: args.runs,
      seed: args.seed,
      maxEvents: args.maxEvents,
      policy: recruitmentFocusedPolicy.id,
      progress: args.progress,
      progressEveryMs: args.progressEveryMs,
      jsonPath: args.jsonPath,
    },
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    elapsedMs: reporter.elapsedMs(),
    summary: summarize(samples),
    ...(args.includeRuns ? { runs: samples } : {}),
  };

  mkdirSync(dirname(resolve(args.jsonPath)), { recursive: true });
  writeFileSync(resolve(args.jsonPath), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log('');
  console.log(`Completed ${args.runs} recruitment-focused runs in ${formatDuration(report.elapsedMs)}.`);
  console.log(`Report: ${resolve(args.jsonPath)}`);
}

function runDiagnostic(seed: number, catalog: ContentCatalog, maxEvents: number): RunRecruitmentDiagnostic {
  const chainScenes = emptyYears();
  const directRecruitEventsPlayed = emptyYears();
  const eligibleRecruitmentWindows = emptyYears();
  const eligibleButDifferentEventSelected = emptyYears();
  const directRecruitChoiceOpportunities = emptyYears();
  const directRecruitChoicesSelected = emptyYears();
  const selectedDirectRecruitChoiceNoRecruit = emptyYears();
  const actualRecruitments = emptyYears();

  const recruitmentEventCounts: Record<string, number> = {};
  const directRecruitEventCounts: Record<string, number> = {};
  const actualRecruitEventCounts: Record<string, number> = {};
  const recruitmentAgesMonths: number[] = [];
  const recruitedNpcIds = new Set<string>();
  const observedWindowKeys = new Set<string>();

  let crewAt16: number | null = null;
  let crewAt17: number | null = null;
  let crewAt18: number | null = null;

  const observeBoundary = (state: GameState) => {
    const crew = currentCrewIds(state);
    if (crewAt16 === null && state.ageMonths >= AGE_16_MONTHS) crewAt16 = crew.length;
    if (crewAt17 === null && state.ageMonths >= AGE_17_MONTHS) crewAt17 = crew.length;
    if (crewAt18 === null && state.ageMonths >= AGE_18_MONTHS) crewAt18 = crew.length;
  };

  const observer: SimulationObserver = {
    onInitialState(state) {
      observeBoundary(state);
    },
    onNavigationResolved({ beforeState, afterState }) {
      observeBoundary(beforeState);
      observeBoundary(afterState);
    },
    onCrewPowerUsed({ beforeState, afterState }) {
      observeBoundary(beforeState);
      observeBoundary(afterState);
    },
    onEventResolved(entry) {
      const { beforeState, afterState, event, choice } = entry;
      observeBoundary(beforeState);
      observeBoundary(afterState);

      const year = targetYear(beforeState.ageMonths);
      if (year !== null) {
        const windowKey = `${beforeState.ageMonths}:${beforeState.slotInMonth}`;
        if (!observedWindowKeys.has(windowKey)) {
          observedWindowKeys.add(windowKey);
          if (hasEligibleCrewRecruitmentEvent(beforeState, catalog)) {
            eligibleRecruitmentWindows[year] += 1;
            if (!isCrewRecruitmentEvent(event)) eligibleButDifferentEventSelected[year] += 1;
          }
        }

        if (isRecruitmentChainScene(event)) {
          chainScenes[year] += 1;
          inc(recruitmentEventCounts, event.id);
        }

        if (isCrewRecruitmentEvent(event)) {
          directRecruitEventsPlayed[year] += 1;
          inc(directRecruitEventCounts, event.id);

          const availableDirectChoices = event.choices.filter((candidate) => {
            const state = getChoiceState(candidate, beforeState, catalog);
            return state.visible && state.available && choiceCanRecruit(candidate);
          });
          directRecruitChoiceOpportunities[year] += availableDirectChoices.length;

          if (availableDirectChoices.some((candidate) => candidate.id === choice.id)) {
            directRecruitChoicesSelected[year] += 1;
          }
        }
      }

      const beforeCrew = new Set(currentCrewIds(beforeState));
      const afterCrew = currentCrewIds(afterState);
      const newlyRecruited = afterCrew.filter((npcId) => !beforeCrew.has(npcId));
      if (newlyRecruited.length > 0) {
        const recruitYear = targetYear(beforeState.ageMonths);
        for (const npcId of newlyRecruited) {
          recruitedNpcIds.add(npcId);
          recruitmentAgesMonths.push(afterState.ageMonths);
        }
        if (recruitYear !== null) actualRecruitments[recruitYear] += newlyRecruited.length;
        inc(actualRecruitEventCounts, event.id, newlyRecruited.length);
      } else if (year !== null && isCrewRecruitmentEvent(event) && choiceCanRecruit(choice)) {
        selectedDirectRecruitChoiceNoRecruit[year] += 1;
      }
    },
    onTermination({ state }) {
      observeBoundary(state);
    },
  };

  const result = simulateObservedRun({
    seed,
    catalog,
    maxResolvedEvents: maxEvents,
    policy: recruitmentFocusedPolicy,
    observer,
  });

  recruitmentAgesMonths.sort((a, b) => a - b);

  return {
    seed,
    terminationReason: result.terminationReason,
    ...(result.error ? { error: result.error } : {}),
    playerDeath: result.playerDeath,
    finalAgeMonths: result.finalState.ageMonths,
    chainScenes,
    directRecruitEventsPlayed,
    eligibleRecruitmentWindows,
    eligibleButDifferentEventSelected,
    directRecruitChoiceOpportunities,
    directRecruitChoicesSelected,
    selectedDirectRecruitChoiceNoRecruit,
    actualRecruitments,
    crewAt16,
    crewAt17,
    crewAt18,
    firstRecruitAgeMonths: recruitmentAgesMonths[0] ?? null,
    secondRecruitAgeMonths: recruitmentAgesMonths[1] ?? null,
    thirdRecruitAgeMonths: recruitmentAgesMonths[2] ?? null,
    recruitmentAgesMonths,
    recruitedNpcIds: [...recruitedNpcIds].sort(),
    recruitmentEventCounts,
    directRecruitEventCounts,
    actualRecruitEventCounts,
  };
}

function summarize(samples: readonly RunRecruitmentDiagnostic[]) {
  const reached16 = samples.filter((sample) => sample.crewAt16 !== null);
  const reached17 = samples.filter((sample) => sample.crewAt17 !== null);
  const reached18 = samples.filter((sample) => sample.crewAt18 !== null);

  const oneBy16 = reached16.filter((sample) => (sample.crewAt16 ?? 0) >= 1);
  const twoBy17 = reached17.filter((sample) => (sample.crewAt17 ?? 0) >= 2);
  const threeBy18 = reached18.filter((sample) => (sample.crewAt18 ?? 0) >= 3);
  const fullCadence = reached18.filter((sample) =>
    (sample.crewAt16 ?? 0) >= 1
    && (sample.crewAt17 ?? 0) >= 2
    && (sample.crewAt18 ?? 0) >= 3,
  );

  const years = Object.fromEntries(TARGET_YEARS.map((year) => {
    const yearSamples = samples.filter((sample) => sample.finalAgeMonths >= year * 12);
    const withRecruit = yearSamples.filter((sample) => sample.actualRecruitments[year] > 0);
    const withDirectEvent = yearSamples.filter((sample) => sample.directRecruitEventsPlayed[year] > 0);
    const withEligibleWindow = yearSamples.filter((sample) => sample.eligibleRecruitmentWindows[year] > 0);
    const withChainScene = yearSamples.filter((sample) => sample.chainScenes[year] > 0);

    return [String(year), {
      runsReachingYear: yearSamples.length,
      runsWithAnyRecruitmentChainScene: withChainScene.length,
      runsWithAnyRecruitmentChainScenePct: pct(withChainScene.length, yearSamples.length),
      runsWithEligibleDirectRecruitmentWindow: withEligibleWindow.length,
      runsWithEligibleDirectRecruitmentWindowPct: pct(withEligibleWindow.length, yearSamples.length),
      runsWhereDirectRecruitEventActuallyPlayed: withDirectEvent.length,
      runsWhereDirectRecruitEventActuallyPlayedPct: pct(withDirectEvent.length, yearSamples.length),
      runsActuallyRecruiting: withRecruit.length,
      runsActuallyRecruitingPct: pct(withRecruit.length, yearSamples.length),

      chainScenesPerRun: stats(yearSamples.map((sample) => sample.chainScenes[year])),
      eligibleRecruitmentWindowsPerRun: stats(yearSamples.map((sample) => sample.eligibleRecruitmentWindows[year])),
      eligibleButDifferentEventSelectedPerRun: stats(yearSamples.map((sample) => sample.eligibleButDifferentEventSelected[year])),
      directRecruitEventsPlayedPerRun: stats(yearSamples.map((sample) => sample.directRecruitEventsPlayed[year])),
      directRecruitChoicesAvailablePerRun: stats(yearSamples.map((sample) => sample.directRecruitChoiceOpportunities[year])),
      actualRecruitmentsPerRun: stats(yearSamples.map((sample) => sample.actualRecruitments[year])),

      failureClassification: classifyFailures(yearSamples, year),
    }];
  }));

  return {
    targetCadence: {
      definition: {
        age15: 'Have at least 1 active crewmate before the 16th birthday.',
        age16: 'Have at least 2 active crewmates before the 17th birthday.',
        age17: 'Have at least 3 active crewmates before the 18th birthday.',
      },
      oneCrewBy16: targetResult(oneBy16.length, reached16.length, samples.length),
      twoCrewBy17: targetResult(twoBy17.length, reached17.length, samples.length),
      threeCrewBy18: targetResult(threeBy18.length, reached18.length, samples.length),
      fullCadence: targetResult(fullCadence.length, reached18.length, samples.length),
    },
    recruitmentAges: {
      firstRecruitAgeMonths: stats(samples.flatMap((sample) => sample.firstRecruitAgeMonths === null ? [] : [sample.firstRecruitAgeMonths])),
      secondRecruitAgeMonths: stats(samples.flatMap((sample) => sample.secondRecruitAgeMonths === null ? [] : [sample.secondRecruitAgeMonths])),
      thirdRecruitAgeMonths: stats(samples.flatMap((sample) => sample.thirdRecruitAgeMonths === null ? [] : [sample.thirdRecruitAgeMonths])),
    },
    years,
    eventDiagnostics: {
      recruitmentChainScenes: mergeCounts(samples.map((sample) => sample.recruitmentEventCounts)),
      directRecruitEventsPlayed: mergeCounts(samples.map((sample) => sample.directRecruitEventCounts)),
      eventsActuallyRecruiting: mergeCounts(samples.map((sample) => sample.actualRecruitEventCounts)),
    },
    runtime: {
      deaths: samples.filter((sample) => sample.playerDeath).length,
      errors: samples.filter((sample) => sample.error !== undefined).length,
      terminationReasons: countBy(samples, (sample) => sample.terminationReason),
    },
    failingCadenceSeeds: samples
      .filter((sample) => sample.crewAt18 !== null && !(
        (sample.crewAt16 ?? 0) >= 1
        && (sample.crewAt17 ?? 0) >= 2
        && (sample.crewAt18 ?? 0) >= 3
      ))
      .slice(0, 30)
      .map((sample) => ({
        seed: sample.seed,
        crewAt16: sample.crewAt16,
        crewAt17: sample.crewAt17,
        crewAt18: sample.crewAt18,
        actualRecruitments: sample.actualRecruitments,
        eligibleRecruitmentWindows: sample.eligibleRecruitmentWindows,
        directRecruitEventsPlayed: sample.directRecruitEventsPlayed,
      })),
  };
}

function classifyFailures(samples: readonly RunRecruitmentDiagnostic[], year: TargetYear) {
  const result: Record<string, number> = {
    recruited: 0,
    no_recruitment_chain_scene: 0,
    chain_scenes_but_no_direct_event_eligible: 0,
    direct_event_eligible_but_not_selected: 0,
    direct_event_played_but_no_available_recruit_choice: 0,
    recruit_choice_selected_but_no_recruit: 0,
    other_no_recruit: 0,
  };

  for (const sample of samples) {
    if (sample.actualRecruitments[year] > 0) {
      result.recruited += 1;
    } else if (sample.chainScenes[year] === 0) {
      result.no_recruitment_chain_scene += 1;
    } else if (sample.eligibleRecruitmentWindows[year] === 0 && sample.directRecruitEventsPlayed[year] === 0) {
      result.chain_scenes_but_no_direct_event_eligible += 1;
    } else if (sample.eligibleRecruitmentWindows[year] > 0 && sample.directRecruitEventsPlayed[year] === 0) {
      result.direct_event_eligible_but_not_selected += 1;
    } else if (sample.directRecruitEventsPlayed[year] > 0 && sample.directRecruitChoiceOpportunities[year] === 0) {
      result.direct_event_played_but_no_available_recruit_choice += 1;
    } else if (sample.directRecruitChoicesSelected[year] > 0 || sample.selectedDirectRecruitChoiceNoRecruit[year] > 0) {
      result.recruit_choice_selected_but_no_recruit += 1;
    } else {
      result.other_no_recruit += 1;
    }
  }
  return result;
}

function recruitmentChoiceScore(choice: ChoiceDefinition, context: SimulationDecisionContext): number {
  const scan = scanChoice(choice);
  if (scan.directRecruitEffects > 0) return 10_000 + scan.directRecruitEffects * 1_000 + scan.positiveRelationship;
  if (!isRecruitmentChainScene(context.event)) return 0;
  if (scan.recruitmentImmediateQueues > 0) return 1_000 + scan.recruitmentImmediateQueues * 100 + scan.positiveRelationship;
  if (scan.positiveRelationship > 0) return 100 + scan.positiveRelationship;
  return 0;
}

function choiceCanRecruit(choice: ChoiceDefinition): boolean {
  return scanChoice(choice).directRecruitEffects > 0;
}

function scanChoice(choice: ChoiceDefinition) {
  let directRecruitEffects = 0;
  let recruitmentImmediateQueues = 0;
  let positiveRelationship = 0;

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value === null || typeof value !== 'object') return;
    const object = value as Record<string, unknown>;
    if (object.type === 'setNpcStatus' && object.status === 'crew') directRecruitEffects += 1;
    if (
      object.type === 'queueImmediateEvent'
      && typeof object.eventId === 'string'
      && isRecruitmentId(object.eventId)
    ) recruitmentImmediateQueues += 1;
    if (
      object.type === 'modifyNpcRelationship'
      && typeof object.amount === 'number'
      && object.amount > 0
    ) positiveRelationship += object.amount;
    Object.values(object).forEach(visit);
  };

  visit(choice.resolution);
  return { directRecruitEffects, recruitmentImmediateQueues, positiveRelationship };
}

function isRecruitmentChainScene(event: EventDefinition): boolean {
  return isRecruitmentId(event.id);
}

function isRecruitmentId(id: string): boolean {
  return id.includes('recruit');
}

function currentCrewIds(state: GameState): string[] {
  return Object.entries(state.npcs)
    .filter(([, npc]) => npc.status === 'crew')
    .map(([npcId]) => npcId);
}

function targetYear(ageMonths: number): TargetYear | null {
  const year = Math.floor(ageMonths / 12);
  return year === 15 || year === 16 || year === 17 ? year : null;
}

function emptyYears(): YearRecord {
  return { 15: 0, 16: 0, 17: 0 };
}

function inc(record: Record<string, number>, key: string, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

function mergeCounts(records: readonly Record<string, number>[]) {
  const merged: Record<string, number> = {};
  records.forEach((record) => Object.entries(record).forEach(([key, value]) => inc(merged, key, value)));
  return Object.fromEntries(Object.entries(merged).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

function countBy<T>(values: readonly T[], key: (value: T) => string) {
  const result: Record<string, number> = {};
  values.forEach((value) => inc(result, key(value)));
  return result;
}

function targetResult(achieved: number, reached: number, total: number) {
  return {
    achieved,
    reachedRelevantAge: reached,
    totalRuns: total,
    pctOfRunsReachingRelevantAge: pct(achieved, reached),
    pctOfAllRuns: pct(achieved, total),
  };
}

function progressMetrics(samples: readonly RunRecruitmentDiagnostic[]) {
  const reached18 = samples.filter((sample) => sample.crewAt18 !== null);
  const full = reached18.filter((sample) =>
    (sample.crewAt16 ?? 0) >= 1
    && (sample.crewAt17 ?? 0) >= 2
    && (sample.crewAt18 ?? 0) >= 3,
  ).length;
  return [
    { label: '1by16', value: samples.filter((sample) => (sample.crewAt16 ?? 0) >= 1).length },
    { label: '2by17', value: samples.filter((sample) => (sample.crewAt17 ?? 0) >= 2).length },
    { label: '3by18', value: samples.filter((sample) => (sample.crewAt18 ?? 0) >= 3).length },
    { label: 'full', value: full },
  ];
}

function parseArgs(values: readonly string[]): Args {
  const result: Args = {
    runs: 100,
    seed: 9901,
    maxEvents: 1000,
    jsonPath: resolve('Sims', 'V2', 'reports', 'recruitment-diagnostic-100.json'),
    progress: true,
    progressEveryMs: 1000,
    includeRuns: false,
  };

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--runs') result.runs = positiveInteger(values[++index], '--runs');
    else if (value === '--seed') result.seed = uint32(values[++index], '--seed');
    else if (value === '--max-events') result.maxEvents = positiveInteger(values[++index], '--max-events');
    else if (value === '--json') result.jsonPath = required(values[++index], '--json');
    else if (value === '--progress') result.progress = true;
    else if (value === '--no-progress') result.progress = false;
    else if (value === '--progress-every') result.progressEveryMs = positiveNumber(values[++index], '--progress-every') * 1000;
    else if (value === '--include-runs') result.includeRuns = true;
    else if (value === '--help' || value === '-h') {
      console.log([
        'OPFG Sims V2 — Early Crew Recruitment Diagnostic',
        '',
        'Usage:',
        '  npx jiti Sims/V2/recruitment-diagnostic.ts --runs 100 --seed 9901 --json Sims/V2/reports/recruitment-diagnostic-100.json',
        '',
        'Options:',
        '  --runs N',
        '  --seed N',
        '  --max-events N',
        '  --json PATH',
        '  --progress / --no-progress',
        '  --progress-every SECONDS',
        '  --include-runs',
      ].join('\n'));
      process.exit(0);
    } else {
      throw new Error(`Unknown argument "${value}". Use --help.`);
    }
  }
  return result;
}

function required(value: string | undefined, label: string): string {
  if (!value || value.startsWith('--')) throw new Error(`${label} requires a value.`);
  return value;
}

function positiveInteger(value: string | undefined, label: string): number {
  const parsed = Number(required(value, label));
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${label} must be a positive integer.`);
  return parsed;
}

function positiveNumber(value: string | undefined, label: string): number {
  const parsed = Number(required(value, label));
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${label} must be a positive number.`);
  return parsed;
}

function uint32(value: string | undefined, label: string): number {
  const parsed = Number(required(value, label));
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 0xffffffff) {
    throw new Error(`${label} must be an integer from 0 to 4294967295.`);
  }
  return parsed;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
