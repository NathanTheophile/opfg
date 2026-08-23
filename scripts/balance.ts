import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

type JsonRecord = Record<string, any>;

const args = parseArgs(process.argv.slice(2));
const reportDirectory = resolve('reports/balance');
mkdirSync(reportDirectory, { recursive: true });

const simulations = [
  ['general', 'scripts/simulate.ts'],
  ['ships', 'scripts/simulate-ships.ts'],
  ['fallbacks', 'scripts/simulate-fallbacks.ts'],
  ['health', 'scripts/simulate-health.ts'],
] as const;

const jitiCli = resolve('node_modules/jiti/lib/jiti-cli.mjs');
for (const [name, script] of simulations) {
  const jsonPath = resolve(reportDirectory, `${name}.json`);
  console.log(`\n=== Balance: ${name} ===`);
  const result = spawnSync(process.execPath, [jitiCli, resolve(script), '--runs', String(args.runs), '--seed', String(args.seed), '--max-events', String(args.maxEvents), '--json', jsonPath], {
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const general = readJson('general');
const ships = readJson('ships');
const fallbacks = readJson('fallbacks');
const health = readJson('health');
const seenEvents = general.events.filter((event: JsonRecord) => event.timesResolved > 0).length;
const simulationErrors = numberAt(general, 'summary.terminations.simulationError')
  + numberAt(fallbacks, 'summary.simulationErrors')
  + numberAt(health, 'terminationReasons.simulationError')
  + sumTopEntries(ships.errors);
const hardFailures = [
  failure('simulationError', simulationErrors),
  failure('firstSeaWithoutShip', numberAt(ships, 'summary.firstSeaWithoutShip')),
  failure('nonCriticalAtSeaWithoutShip', numberAt(ships, 'summary.runsResolvingNonCriticalAtSeaWithoutShip')),
].filter(Boolean) as string[];
const warnings = buildWarnings(general, fallbacks, health);

const summary = {
  generatedAt: new Date().toISOString(),
  config: args,
  hardFailures,
  warnings,
  terminationReasons: {
    general: general.summary.terminations,
    health: health.terminationReasons,
    fallbacks: fallbacks.terminationReasons,
  },
  finalAgeMonths: health.distributions.finalAgeMonths,
  mortality: {
    deaths: health.summary.deaths,
    deathPct: health.summary.deathPct,
    byRace: health.byRace.map(({ raceId, runs, deaths, deathPct }: JsonRecord) => ({ raceId, runs, deaths, deathPct })),
  },
  health: {
    anyDamage: countPct(health.summary, 'runsWithAnyDamage'),
    below75: countPct(health.summary, 'runsBelow75'),
    below50: countPct(health.summary, 'runsBelow50'),
    below25: countPct(health.summary, 'runsBelow25'),
    damagePerRun: health.distributions.damagePerRun,
    healingPerRun: health.distributions.healingPerRun,
  },
  ships: {
    firstSeaWithoutShip: ships.summary.firstSeaWithoutShip,
    nonCriticalAtSeaWithoutShip: ships.summary.runsResolvingNonCriticalAtSeaWithoutShip,
    everOwnedShip: countPct(ships.summary, 'runsEverOwningShip'),
    acquisitions: ships.summary.totalGameplayAcquisitions,
    runsWithReacquisition: ships.summary.runsWithReacquisition,
  },
  fallbacks: {
    perRun: fallbacks.summary.avgFallbacksPerRun,
    streak: {
      p50: fallbacks.summary.maxStreakP50,
      p90: fallbacks.summary.maxStreakP90,
      p99: fallbacks.summary.maxStreakP99,
      max: fallbacks.summary.maxStreakObserved,
    },
    repeatedStateEpisodes: fallbacks.summary.episodesWithRepeatedState,
  },
  contentCoverage: {
    seenEvents,
    totalEvents: general.events.length,
    pct: general.events.length === 0 ? 0 : seenEvents / general.events.length * 100,
  },
};

writeFileSync(resolve(reportDirectory, 'balance-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
writeFileSync(resolve(reportDirectory, 'balance-summary.md'), renderMarkdown(summary), 'utf8');

console.log('\n=== Balance summary ===');
console.log(`Reports: ${reportDirectory}`);
warnings.forEach((warning) => console.warn(`WARN ${warning}`));
hardFailures.forEach((failureMessage) => console.error(`FAIL ${failureMessage}`));
if (hardFailures.length > 0) process.exit(1);

function readJson(name: string): JsonRecord {
  return JSON.parse(readFileSync(resolve(reportDirectory, `${name}.json`), 'utf8')) as JsonRecord;
}

function parseArgs(values: string[]) {
  const result = { runs: 300, seed: 1, maxEvents: 1000 };
  for (let index = 0; index < values.length; index += 1) {
    const flag = values[index];
    const value = values[++index];
    if (!['--runs', '--seed', '--max-events'].includes(flag) || value === undefined) throw new Error(`Invalid balance argument "${flag}".`);
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < (flag === '--seed' ? 0 : 1) || (flag === '--seed' && parsed > 0xffffffff)) throw new Error(`Invalid value for ${flag}: "${value}".`);
    if (flag === '--runs') result.runs = parsed;
    else if (flag === '--seed') result.seed = parsed;
    else result.maxEvents = parsed;
  }
  return result;
}

function numberAt(value: JsonRecord, path: string): number {
  const result = path.split('.').reduce<any>((current, key) => current?.[key], value);
  return typeof result === 'number' ? result : 0;
}

function failure(label: string, count: number): string | null {
  return count > 0 ? `${label}: ${count}` : null;
}

function sumTopEntries(entries: unknown): number {
  return Array.isArray(entries) ? entries.reduce((sum, entry) => sum + (typeof entry?.value === 'number' ? entry.value : 0), 0) : 0;
}

function countPct(source: JsonRecord, key: string) {
  return { count: source[key], pct: source[`${key}Pct`] };
}

function buildWarnings(general: JsonRecord, fallbacks: JsonRecord, health: JsonRecord): string[] {
  const result: string[] = [];
  const safetyLimits = numberAt(general, 'summary.terminations.safetyLimit');
  if (safetyLimits > 0) result.push(`safetyLimit: ${safetyLimits}`);
  if (fallbacks.summary.maxStreakP99 >= 10 || fallbacks.summary.maxStreakObserved >= 20) result.push(`high fallback streaks: p99=${fallbacks.summary.maxStreakP99}, max=${fallbacks.summary.maxStreakObserved}`);
  if (health.summary.deathPct < 1 || health.summary.deathPct > 60) result.push(`global mortality outside heuristic range: ${health.summary.deathPct.toFixed(2)}%`);
  const raceDeaths = health.byRace.map((race: JsonRecord) => race.deathPct as number);
  const positiveRaceDeaths = raceDeaths.filter((value: number) => value > 0);
  const lowestPositive = positiveRaceDeaths.length > 0 ? Math.min(...positiveRaceDeaths) : 0;
  health.byRace.forEach((race: JsonRecord) => {
    if (race.deathPct === 0) result.push(`race mortality is 0%: ${race.raceId}`);
    else if (lowestPositive > 0 && race.deathPct >= lowestPositive * 3 && race.deathPct - lowestPositive >= 10) result.push(`race mortality is a high outlier: ${race.raceId}=${race.deathPct.toFixed(2)}%`);
  });
  if (health.summary.totalHealing === 0) result.push('healing is zero');
  return result;
}

function renderMarkdown(summary: JsonRecord): string {
  const age = summary.finalAgeMonths;
  const status = summary.hardFailures.length === 0 ? 'PASS' : 'FAIL';
  const rows = [
    ['Status', status], ['Runs / suite', summary.config.runs],
    ['Final age avg / p50 / p90 (months)', `${age.average.toFixed(1)} / ${age.p50} / ${age.p90}`],
    ['Deaths', `${summary.mortality.deaths} (${summary.mortality.deathPct.toFixed(2)}%)`],
    ['Any damage', formatCount(summary.health.anyDamage)], ['Below 75 / 50 / 25% HP', `${formatCount(summary.health.below75)} / ${formatCount(summary.health.below50)} / ${formatCount(summary.health.below25)}`],
    ['Damage / healing per run', `${summary.health.damagePerRun.average.toFixed(2)} / ${summary.health.healingPerRun.average.toFixed(2)}`],
    ['First sea without ship', summary.ships.firstSeaWithoutShip], ['Non-Critical at sea without ship', summary.ships.nonCriticalAtSeaWithoutShip],
    ['Ever owned ship', formatCount(summary.ships.everOwnedShip)], ['Acquisitions / runs with reacquisition', `${summary.ships.acquisitions} / ${summary.ships.runsWithReacquisition}`],
    ['Fallbacks / run', summary.fallbacks.perRun.toFixed(2)], ['Fallback streak p50 / p90 / p99 / max', Object.values(summary.fallbacks.streak).join(' / ')],
    ['Repeated-state episodes', summary.fallbacks.repeatedStateEpisodes], ['Content coverage', `${summary.contentCoverage.seenEvents}/${summary.contentCoverage.totalEvents} (${summary.contentCoverage.pct.toFixed(1)}%)`],
  ];
  return `# OPFG Balance Summary\n\n| KPI | Value |\n| --- | ---: |\n${rows.map(([key, value]) => `| ${key} | ${value} |`).join('\n')}\n\n## Hard failures\n\n${list(summary.hardFailures)}\n\n## Warnings\n\n${list(summary.warnings)}\n`;
}

function formatCount(value: JsonRecord): string { return `${value.count} (${value.pct.toFixed(2)}%)`; }
function list(values: string[]): string { return values.length > 0 ? values.map((value) => `- ${value}`).join('\n') : '- None'; }
