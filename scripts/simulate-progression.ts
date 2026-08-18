import { performance } from 'node:perf_hooks';
import type { SimulationObserver } from '../src/game/simulation/observation';
import { simulateObservedRun } from '../src/game/simulation/simulateObservedRun';
import { progressionSimulationPolicy } from '../src/game/simulation/simulationPolicy';
import {
  getMinMaxTelemetry,
  minmaxSimulationPolicy,
  resetMinMaxTelemetry,
} from '../src/game/simulation/minmaxSimulationPolicy';
import { average, inc, loadValidatedCatalog, parseSpecializedArgs, pct, quantile, topEntries, writeJson } from './simulation-specialized/shared';

const policyArgs = parseProgressionPolicyArgs(process.argv.slice(2));
const args = parseSpecializedArgs(policyArgs.remaining, 'reports/sim-progression.json');
const policy = policyArgs.policy === 'progression'
  ? progressionSimulationPolicy
  : minmaxSimulationPolicy;
resetMinMaxTelemetry();
const catalog = loadValidatedCatalog();
const startedAt = performance.now();

const finalBerries: number[] = [];
const finalReputation: number[] = [];
const finalBounty: number[] = [];
const totalIncome: number[] = [];
const totalSpend: number[] = [];
const firstIncomeAge: number[] = [];
const firstSpendAge: number[] = [];
const firstBountyAge: number[] = [];
const firstCareerChangeAge: number[] = [];
const firstFruitAge: number[] = [];
const firstTraitAge: number[] = [];
const firstCrewAge: number[] = [];
const maxCrewPerRun: number[] = [];
const traitsAtActive: number[] = [];
const traitsAtEnd: number[] = [];
const fruitAwakeningAtEnd: number[] = [];
const incomeByEvent: Record<string, number> = {};
const spendByEvent: Record<string, number> = {};
const reputationGainByEvent: Record<string, number> = {};
const reputationLossByEvent: Record<string, number> = {};
const bountyGainByEvent: Record<string, number> = {};
const affiliations: Record<string, number> = {};
const rankTransitions: Record<string, number> = {};
const titleTransitions: Record<string, number> = {};
const endings: Record<string, number> = {};
const terminationReasons: Record<string, number> = {};
const errors: Record<string, number> = {};
const repThresholdAge: Record<string, number[]> = { '10': [], '25': [], '50': [], '75': [] };

const fruitConsumptionById: Record<string, number> = {};
const fruitSourceEvents: Record<string, number> = {};
const awakeningGainByEvent: Record<string, number> = {};
const hakiAwakenSource: Record<string, number> = {};
const finalHakiLevels: Record<string, number> = {};
const traitGains: Record<string, number> = {};
const traitGainByEvent: Record<string, number> = {};
const crewRecruitByNpc: Record<string, number> = {};
const crewRecruitByEvent: Record<string, number> = {};
const crewDepartureByEvent: Record<string, number> = {};

let runsEverSpending = 0;
let runsEverEarning = 0;
let runsEverBounty = 0;
let runsChangingCareer = 0;
let runsWithFruit = 0;
let runsWithCrew = 0;
let runsWith2TraitsAtActive = 0;

for (let index = 0; index < args.runs; index += 1) {
  const seed = (args.seed + index) >>> 0;
  let income = 0;
  let spend = 0;
  let firstIncome: number | null = null;
  let firstSpend: number | null = null;
  let firstBounty: number | null = null;
  let firstCareerChange: number | null = null;
  let firstFruit: number | null = null;
  let firstTrait: number | null = null;
  let firstCrew: number | null = null;
  let maxCrew = 0;
  let activeTraitsCaptured = false;
  const reachedRep = new Set<number>();

  const observer: SimulationObserver = {
    onInitialState(state) {
      maxCrew = crewSize(state);
    },
    onEventResolved(entry) {
      const before = entry.beforeState;
      const after = entry.afterState;

      const berryDelta = after.berries - before.berries;
      if (berryDelta > 0) {
        income += berryDelta;
        inc(incomeByEvent, entry.event.id, berryDelta);
        if (firstIncome === null) firstIncome = after.ageMonths;
      } else if (berryDelta < 0) {
        spend += -berryDelta;
        inc(spendByEvent, entry.event.id, -berryDelta);
        if (firstSpend === null) firstSpend = after.ageMonths;
      }

      const repDelta = after.player.career.reputation - before.player.career.reputation;
      if (repDelta > 0) inc(reputationGainByEvent, entry.event.id, repDelta);
      else if (repDelta < 0) inc(reputationLossByEvent, entry.event.id, -repDelta);

      const bountyDelta = after.player.career.bounty - before.player.career.bounty;
      if (bountyDelta > 0) {
        inc(bountyGainByEvent, entry.event.id, bountyDelta);
        if (firstBounty === null && after.player.career.bounty > 0) firstBounty = after.ageMonths;
      }

      if (before.player.career.affiliationId !== after.player.career.affiliationId) {
        inc(affiliations, `${before.player.career.affiliationId}->${after.player.career.affiliationId}`);
        if (firstCareerChange === null) firstCareerChange = after.ageMonths;
      }

      if (before.player.career.rankId !== after.player.career.rankId) {
        inc(rankTransitions, `${before.player.career.rankId ?? 'null'}->${after.player.career.rankId ?? 'null'}`);
      }

      if (before.player.career.titleId !== after.player.career.titleId) {
        inc(titleTransitions, `${before.player.career.titleId ?? 'null'}->${after.player.career.titleId ?? 'null'}`);
      }

      for (const threshold of [10, 25, 50, 75]) {
        if (!reachedRep.has(threshold) && after.player.career.reputation >= threshold) {
          reachedRep.add(threshold);
          repThresholdAge[String(threshold)].push(after.ageMonths);
        }
      }

      // Powers
      if (before.player.powers.devilFruitId === null && after.player.powers.devilFruitId !== null) {
        firstFruit ??= after.ageMonths;
        inc(fruitConsumptionById, after.player.powers.devilFruitId);
        inc(fruitSourceEvents, entry.event.id);
      }
      const awakeningDelta = after.player.powers.devilFruitAwakening - before.player.powers.devilFruitAwakening;
      if (awakeningDelta > 0) inc(awakeningGainByEvent, entry.event.id, awakeningDelta);

      for (const hakiType of ['observation', 'armament', 'conqueror'] as const) {
        if (before.player.powers.haki[hakiType] === 0 && after.player.powers.haki[hakiType] > 0) {
          inc(hakiAwakenSource, `${hakiType}:${entry.event.id}`);
        }
      }

      // Traits
      const beforeTraits = new Set(before.player.traits);
      for (const trait of after.player.traits) {
        if (beforeTraits.has(trait)) continue;
        if (firstTrait === null) firstTrait = after.ageMonths;
        inc(traitGains, trait);
        inc(traitGainByEvent, `${entry.event.id}:${trait}`);
      }

      // Crew
      const beforeCrew = new Set(Object.entries(before.npcs).filter(([, npc]) => npc.status === 'crew').map(([id]) => id));
      const afterCrew = new Set(Object.entries(after.npcs).filter(([, npc]) => npc.status === 'crew').map(([id]) => id));
      for (const npcId of afterCrew) {
        if (beforeCrew.has(npcId)) continue;
        firstCrew ??= after.ageMonths;
        inc(crewRecruitByNpc, npcId);
        inc(crewRecruitByEvent, entry.event.id);
      }
      for (const npcId of beforeCrew) {
        if (afterCrew.has(npcId)) continue;
        inc(crewDepartureByEvent, `${entry.event.id}:${npcId}`);
      }
      maxCrew = Math.max(maxCrew, afterCrew.size);

      if (!activeTraitsCaptured && before.careerPhase !== 'active' && after.careerPhase === 'active') {
        traitsAtActive.push(after.player.traits.length);
        if (after.player.traits.length >= 2) runsWith2TraitsAtActive += 1;
        activeTraitsCaptured = true;
      }
    },
    onTermination({ error }) {
      if (error) inc(errors, error);
    },
  };

  const result = simulateObservedRun({ seed, catalog, maxResolvedEvents: args.maxEvents, observer, policy });
  finalBerries.push(result.finalState.berries);
  finalReputation.push(result.finalState.player.career.reputation);
  finalBounty.push(result.finalState.player.career.bounty);
  totalIncome.push(income);
  totalSpend.push(spend);
  maxCrewPerRun.push(maxCrew);
  traitsAtEnd.push(result.finalState.player.traits.length);
  fruitAwakeningAtEnd.push(result.finalState.player.powers.devilFruitAwakening);
  inc(terminationReasons, result.terminationReason);
  inc(endings, result.finalState.endingId ?? `reason:${result.finalState.careerEndReason ?? result.terminationReason}`);

  if (income > 0) runsEverEarning += 1;
  if (spend > 0) runsEverSpending += 1;
  if (result.finalState.player.career.bounty > 0 || firstBounty !== null) runsEverBounty += 1;
  if (firstCareerChange !== null) runsChangingCareer += 1;
  if (result.finalState.player.powers.devilFruitId !== null) runsWithFruit += 1;
  if (maxCrew > 0) runsWithCrew += 1;

  if (firstIncome !== null) firstIncomeAge.push(firstIncome);
  if (firstSpend !== null) firstSpendAge.push(firstSpend);
  if (firstBounty !== null) firstBountyAge.push(firstBounty);
  if (firstCareerChange !== null) firstCareerChangeAge.push(firstCareerChange);
  if (firstFruit !== null) firstFruitAge.push(firstFruit);
  if (firstTrait !== null) firstTraitAge.push(firstTrait);
  if (firstCrew !== null) firstCrewAge.push(firstCrew);

  for (const hakiType of ['observation', 'armament', 'conqueror'] as const) {
    inc(finalHakiLevels, `${hakiType}:${result.finalState.player.powers.haki[hakiType]}`);
  }
}

const report = {
  config: { ...args, policy: policy.id },
  elapsedMs: performance.now() - startedAt,
  summary: {
    runs: args.runs,
    economyCareer: {
      runsEverEarning,
      runsEverEarningPct: pct(runsEverEarning, args.runs),
      runsEverSpending,
      runsEverSpendingPct: pct(runsEverSpending, args.runs),
      runsEverBounty,
      runsChangingCareer,
      avgIncomePerRun: average(totalIncome),
      avgSpendPerRun: average(totalSpend),
      avgFinalBerries: average(finalBerries),
      avgFinalReputation: average(finalReputation),
      avgFinalBounty: average(finalBounty),
      finalBerriesP10P50P90: q(finalBerries),
      finalReputationP10P50P90: q(finalReputation),
      finalBountyP10P50P90: q(finalBounty),
      firstIncomeAge: q(firstIncomeAge),
      firstSpendAge: q(firstSpendAge),
      firstBountyAge: q(firstBountyAge),
      firstCareerChangeAge: q(firstCareerChangeAge),
      reputationThresholdAges: Object.fromEntries(Object.entries(repThresholdAge).map(([key, values]) => [key, q(values)])),
    },
    powers: {
      runsWithFruit,
      runsWithFruitPct: pct(runsWithFruit, args.runs),
      firstFruitAge: q(firstFruitAge),
      finalFruitAwakening: q(fruitAwakeningAtEnd),
    },
    traits: {
      firstTraitAge: q(firstTraitAge),
      avgTraitsAtActive: average(traitsAtActive),
      avgTraitsAtEnd: average(traitsAtEnd),
      runsWith2TraitsAtActive,
      runsWith2TraitsAtActivePct: pct(runsWith2TraitsAtActive, Math.max(1, traitsAtActive.length)),
    },
    crew: {
      runsWithCrew,
      runsWithCrewPct: pct(runsWithCrew, args.runs),
      firstCrewAge: q(firstCrewAge),
      avgMaxCrewSize: average(maxCrewPerRun),
      maxCrewSizeObserved: Math.max(...maxCrewPerRun),
    },
  },
  careerTransitions: topEntries(affiliations),
  rankTransitions: topEntries(rankTransitions, 40),
  titleTransitions: topEntries(titleTransitions, 40),
  endings: topEntries(endings, 40),
  terminationReasons,
  topIncomeEvents: topEntries(incomeByEvent, 30),
  topSpendEvents: topEntries(spendByEvent, 30),
  topReputationGainEvents: topEntries(reputationGainByEvent, 30),
  topReputationLossEvents: topEntries(reputationLossByEvent, 30),
  topBountyGainEvents: topEntries(bountyGainByEvent, 30),
  fruitConsumptionById: topEntries(fruitConsumptionById, 30),
  fruitSourceEvents: topEntries(fruitSourceEvents, 30),
  awakeningGainByEvent: topEntries(awakeningGainByEvent, 30),
  hakiAwakenSources: topEntries(hakiAwakenSource, 40),
  finalHakiLevels,
  topTraitGains: topEntries(traitGains, 40),
  topTraitGainSources: topEntries(traitGainByEvent, 40),
  crewRecruitByNpc: topEntries(crewRecruitByNpc, 30),
  crewRecruitByEvent: topEntries(crewRecruitByEvent, 30),
  crewDepartureByEvent: topEntries(crewDepartureByEvent, 30),
  errors: topEntries(errors),
  ...(policy.id === 'minmax' ? { minmax: getMinMaxTelemetry() } : {}),
};

console.log('OPFG Specialized Simulation — PROGRESSION / ECONOMY / POWERS / CREW');
console.log(`Policy: ${policy.id}`);
console.log(`Runs: ${args.runs}`);
console.log(`Avg income/run: ${average(totalIncome).toFixed(1)} B | Avg spend/run: ${average(totalSpend).toFixed(1)} B`);
console.log(`Avg final Reputation: ${average(finalReputation).toFixed(2)} | Avg final Bounty: ${average(finalBounty).toFixed(1)}`);
console.log(`Fruit runs: ${runsWithFruit} (${pct(runsWithFruit, args.runs).toFixed(1)}%)`);
console.log(`Avg Traits at Active/end: ${average(traitsAtActive).toFixed(2)} / ${average(traitsAtEnd).toFixed(2)}`);
console.log(`Crew runs: ${runsWithCrew} (${pct(runsWithCrew, args.runs).toFixed(1)}%) | Avg max crew: ${average(maxCrewPerRun).toFixed(2)}`);
writeJson(args.jsonPath, report);

function crewSize(state: { npcs: Record<string, { status: string }> }): number {
  return Object.values(state.npcs).filter(({ status }) => status === 'crew').length;
}

function q(values: number[]) {
  return {
    count: values.length,
    average: average(values),
    p10: quantile(values, 0.10),
    p50: quantile(values, 0.50),
    p90: quantile(values, 0.90),
  };
}


type ProgressionReportPolicyId = 'minmax' | 'progression';

function parseProgressionPolicyArgs(values: string[]): { policy: ProgressionReportPolicyId; remaining: string[] } {
  let policy: ProgressionReportPolicyId = 'minmax';
  const remaining: string[] = [];

  for (let index = 0; index < values.length; index += 1) {
    if (values[index] !== '--policy') {
      remaining.push(values[index]);
      continue;
    }

    const value = values[++index];
    if (value !== 'minmax' && value !== 'progression') {
      throw new Error('--policy for simulate-progression must be "minmax" or "progression".');
    }
    policy = value;
  }

  return { policy, remaining };
}
