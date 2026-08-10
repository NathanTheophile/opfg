import { performance } from 'node:perf_hooks';
import type { SimulationObserver } from '../src/game/simulation/observation';
import { simulateObservedRun } from '../src/game/simulation/simulateObservedRun';
import { average, inc, loadValidatedCatalog, parseSpecializedArgs, pct, quantile, topEntries, writeJson } from './simulation-specialized/shared';

const args = parseSpecializedArgs(process.argv.slice(2), 'reports/sim-health.json');
const catalog = loadValidatedCatalog();
const startedAt = performance.now();

const totalDamagePerRun: number[] = [];
const totalHealingPerRun: number[] = [];
const minHealthPerRun: number[] = [];
const maxHealthPerRun: number[] = [];
const finalHealth: number[] = [];
const activeStartHealth: number[] = [];
const firstDamageAges: number[] = [];
const damageByEvent: Record<string, number> = {};
const healingByEvent: Record<string, number> = {};
const damageOccurrencesByEvent: Record<string, number> = {};
const lowHealthSource: Record<string, number> = {};
const deathsBySource: Record<string, number> = {};
const byRace: Record<string, { runs: number; damage: number; healing: number; finalHealth: number; minHealth: number }> = {};
const errors: Record<string, number> = {};

let runsDamaged = 0;
let runsHealed = 0;
let reachedHealth20 = 0;
let reachedHealth10 = 0;
let reachedHealth5 = 0;
let reachedHealth0 = 0;
let playerDeaths = 0;

for (let index = 0; index < args.runs; index += 1) {
  const seed = (args.seed + index) >>> 0;
  let damage = 0;
  let healing = 0;
  let minHealth = Number.POSITIVE_INFINITY;
  let maxHealth = Number.NEGATIVE_INFINITY;
  let firstDamageAge: number | null = null;
  let activeHealthCaptured = false;
  let crossed20 = false;
  let crossed10 = false;
  let crossed5 = false;
  let crossed0 = false;
  let lastDamageSource: string | null = null;

  const observer: SimulationObserver = {
    onInitialState(state) {
      minHealth = Math.min(minHealth, state.player.stats.health);
      maxHealth = Math.max(maxHealth, state.player.stats.health);
    },
    onEventResolved(entry) {
      const before = entry.beforeState.player.stats.health;
      const after = entry.afterState.player.stats.health;
      const delta = after - before;
      minHealth = Math.min(minHealth, after);
      maxHealth = Math.max(maxHealth, after);

      if (delta < 0) {
        const amount = -delta;
        damage += amount;
        lastDamageSource = entry.event.id;
        if (firstDamageAge === null) firstDamageAge = entry.afterState.ageMonths;
        inc(damageByEvent, entry.event.id, amount);
        inc(damageOccurrencesByEvent, entry.event.id);
      } else if (delta > 0) {
        healing += delta;
        inc(healingByEvent, entry.event.id, delta);
      }

      if (!activeHealthCaptured && entry.beforeState.careerPhase !== 'active' && entry.afterState.careerPhase === 'active') {
        activeStartHealth.push(after);
        activeHealthCaptured = true;
      }

      if (after <= 20 && !crossed20) { crossed20 = true; inc(lowHealthSource, `${entry.event.id}:<=20`); }
      if (after <= 10 && !crossed10) { crossed10 = true; inc(lowHealthSource, `${entry.event.id}:<=10`); }
      if (after <= 5 && !crossed5) { crossed5 = true; inc(lowHealthSource, `${entry.event.id}:<=5`); }
      if (after <= 0 && !crossed0) { crossed0 = true; inc(lowHealthSource, `${entry.event.id}:<=0`); }
    },
    onTermination({ error }) {
      if (error) inc(errors, error);
    },
  };

  const result = simulateObservedRun({ seed, catalog, maxResolvedEvents: args.maxEvents, observer });
  if (damage > 0) runsDamaged += 1;
  if (healing > 0) runsHealed += 1;
  if (crossed20) reachedHealth20 += 1;
  if (crossed10) reachedHealth10 += 1;
  if (crossed5) reachedHealth5 += 1;
  if (crossed0) reachedHealth0 += 1;
  if (result.playerDeath) {
    playerDeaths += 1;
    inc(deathsBySource, lastDamageSource ?? 'unknown');
  }

  if (firstDamageAge !== null) firstDamageAges.push(firstDamageAge);
  totalDamagePerRun.push(damage);
  totalHealingPerRun.push(healing);
  minHealthPerRun.push(Number.isFinite(minHealth) ? minHealth : result.finalState.player.stats.health);
  maxHealthPerRun.push(Number.isFinite(maxHealth) ? maxHealth : result.finalState.player.stats.health);
  finalHealth.push(result.finalState.player.stats.health);

  const race = result.finalState.player.profile.raceId ?? 'unknown';
  byRace[race] ??= { runs: 0, damage: 0, healing: 0, finalHealth: 0, minHealth: 0 };
  byRace[race].runs += 1;
  byRace[race].damage += damage;
  byRace[race].healing += healing;
  byRace[race].finalHealth += result.finalState.player.stats.health;
  byRace[race].minHealth += minHealth;
}

const raceSummary = Object.fromEntries(Object.entries(byRace).map(([race, value]) => [race, {
  runs: value.runs,
  avgDamage: value.damage / value.runs,
  avgHealing: value.healing / value.runs,
  avgFinalHealth: value.finalHealth / value.runs,
  avgMinimumHealth: value.minHealth / value.runs,
}]));

const report = {
  config: args,
  elapsedMs: performance.now() - startedAt,
  summary: {
    runs: args.runs,
    runsDamaged,
    runsDamagedPct: pct(runsDamaged, args.runs),
    runsHealed,
    runsHealedPct: pct(runsHealed, args.runs),
    playerDeaths,
    reachedHealth20,
    reachedHealth10,
    reachedHealth5,
    reachedHealth0,
    avgDamagePerRun: average(totalDamagePerRun),
    avgHealingPerRun: average(totalHealingPerRun),
    avgMinimumHealth: average(minHealthPerRun),
    avgMaximumHealth: average(maxHealthPerRun),
    avgFinalHealth: average(finalHealth),
    avgActiveStartHealth: average(activeStartHealth),
    firstDamageAgeMonths: stats(firstDamageAges),
    minimumHealthDistribution: {
      p10: quantile(minHealthPerRun, 0.10),
      p50: quantile(minHealthPerRun, 0.50),
      p90: quantile(minHealthPerRun, 0.90),
      min: Math.min(...minHealthPerRun),
    },
  },
  byRace: raceSummary,
  topDamageEventsByTotalHp: topEntries(damageByEvent, 30),
  topDamageEventsByOccurrences: topEntries(damageOccurrencesByEvent, 30),
  topHealingEventsByTotalHp: topEntries(healingByEvent, 30),
  firstLowHealthSources: topEntries(lowHealthSource, 30),
  deathSources: topEntries(deathsBySource, 30),
  errors: topEntries(errors),
};

console.log('OPFG Specialized Simulation — PLAYER HEALTH');
console.log(`Runs: ${args.runs}`);
console.log(`Damaged runs: ${runsDamaged} (${pct(runsDamaged, args.runs).toFixed(1)}%)`);
console.log(`Average damage/run: ${average(totalDamagePerRun).toFixed(2)}`);
console.log(`Average healing/run: ${average(totalHealingPerRun).toFixed(2)}`);
console.log(`Average minimum HP: ${average(minHealthPerRun).toFixed(2)}`);
console.log(`HP <=10: ${reachedHealth10} | HP <=5: ${reachedHealth5} | HP <=0: ${reachedHealth0} | deaths: ${playerDeaths}`);
writeJson(args.jsonPath, report);

function stats(values: number[]) {
  return {
    count: values.length,
    average: average(values),
    p10: quantile(values, 0.10),
    p50: quantile(values, 0.50),
    p90: quantile(values, 0.90),
  };
}
