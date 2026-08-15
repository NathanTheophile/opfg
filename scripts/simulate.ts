import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadNodeContentCatalog } from '../src/game/content/nodeContentCatalog';
import { diagnoseContent } from '../src/game/simulation/diagnostics';
import { simulateBatch } from '../src/game/simulation/simulateBatch';
import { validateContent } from '../src/game/validation/validateContent';

const args = parseArguments(process.argv.slice(2));
const catalog = loadNodeContentCatalog();
const contentErrors = validateContent(catalog);
if (contentErrors.length > 0) {
  contentErrors.forEach(({ path, message }) => console.error(`ERROR ${path}: ${message}`));
  throw new Error(`Simulation aborted: ContentCatalog has ${contentErrors.length} structural error(s).`);
}
const startedAt = performance.now();
const batch = simulateBatch({ runs: args.runs, baseSeed: args.seed, maxResolvedEvents: args.maxEvents, catalog });
const elapsedMs = performance.now() - startedAt;
const warnings = diagnoseContent(catalog);
const neverSeen = batch.events.filter(({ timesResolved }) => timesResolved === 0);
const rare = batch.events.filter(({ timesResolved, runPercentage }) => timesResolved > 0 && runPercentage < 1);
const deadEnds = batch.runResults.filter(({ terminationReason }) => terminationReason === 'deadEnd');
const errors = batch.runResults.filter(({ terminationReason }) => terminationReason === 'simulationError');

console.log('OPFG Simulation\n');
row('Runs', batch.summary.runs);
row('Base seed', batch.config.baseSeed);
row('Max Events/run', batch.config.maxResolvedEvents);
row('Elapsed', `${elapsedMs.toFixed(1)} ms`);
console.log('');
row('Reached Childhood', countRate(batch.summary.reachedChildhood, args.runs));
row('Reached Active', countRate(batch.summary.reachedActive, args.runs));
row('Lifetime Thread started', countRate(batch.summary.lifetimeThreadStarted, args.runs));
row('Active without Lifetime Thread', countRate(batch.summary.reachedActiveWithoutLifetimeThread, args.runs));
row('Career ended', batch.summary.terminations.careerEnded);
row('Dead ends', batch.summary.terminations.deadEnd);
row('Safety limits', batch.summary.terminations.safetyLimit);
row('Errors', batch.summary.terminations.simulationError);
row('Possible Critical loops', batch.summary.possibleCriticalLoops);
console.log('');
row('Average final age', formatAge(batch.summary.averageFinalAgeMonths));
row('Average Events/run', batch.summary.averageResolvedEvents.toFixed(2));
row('Normal resolved', batch.summary.normalResolved);
row('Scheduled resolved', batch.summary.scheduledResolved);
row('Critical resolved', batch.summary.criticalResolved);
row('Immediate resolved', batch.summary.immediateResolved);
row('Average Immediate/slot', batch.summary.averageImmediatePerSlot.toFixed(3));
row('Max Immediate chain', batch.summary.maximumImmediateChainLength);
row('Immediate guards', batch.summary.immediateGuardsTriggered);
row('Events at sea / land', `${batch.summary.eventsAtSea} / ${batch.summary.eventsOnLand}`);
row('Fallbacks land / sea', `${batch.summary.fallbackEvents.land} / ${batch.summary.fallbackEvents.sea}`);
console.log('');
row('Player deaths', batch.summary.playerDeaths);
row('NPC deaths', batch.summary.npcDeaths);
row('Ship losses', batch.summary.shipLosses);
console.log('\nDice');
row('  Rolls', batch.dice.total);
for (const result of ['criticalFailure', 'failure', 'success', 'criticalSuccess'] as const) {
  row(`  ${result}`, `${batch.dice[result]} (${percentage(batch.dice[result], batch.dice.total)})`);
}
console.log('\nContent coverage');
row('  Seen Events', `${catalog.events.length - neverSeen.length} / ${catalog.events.length}`);
row('  Coverage', percentage(catalog.events.length - neverSeen.length, catalog.events.length));
row('  Never seen', neverSeen.length);
row('  Rare (<1%)', rare.length);
console.log('\nScheduled');
row('  Resolved', batch.summary.scheduledResolved);
row('  Pending', batch.summary.pendingScheduled);
row('  Due but pending', batch.summary.dueScheduledPending);

console.log('\nActive final state');
row('  Runs', batch.activeFinalState.runs);
row('  Berrys min/p50/p90/max/avg', formatDistribution(batch.activeFinalState.berries));
row('  Trait count p50/p90/avg', formatCompactDistribution(batch.activeFinalState.traitCount));
row('  Ordinary Items stacks/count avg', `${batch.activeFinalState.ordinaryItemStacks.average.toFixed(2)} / ${batch.activeFinalState.ordinaryItemCount.average.toFixed(2)}`);
row('  Equipment owned/equipped avg', `${batch.activeFinalState.equipmentOwned.average.toFixed(2)} / ${batch.activeFinalState.equipmentEquipped.average.toFixed(2)}`);
row('  Companion owned avg', batch.activeFinalState.companionItemsOwned.average.toFixed(2));
row('  Active Companion slot', `${batch.activeFinalState.activeCompanionSlotOccupancy.occupied} (${percentage(batch.activeFinalState.activeCompanionSlotOccupancy.occupied, batch.activeFinalState.runs)})`);
printTopCounts('Top Equipment owned', batch.activeFinalState.equipmentItemIdsOwned, args.verbose ? Infinity : 8);
printTopCounts('Top Companions owned', batch.activeFinalState.companionItemIdsOwned, args.verbose ? Infinity : 8);

printIds('Never seen Events', neverSeen.map(({ eventId }) => eventId), args.verbose ? Infinity : 12);
printIds('Rare Events', rare.map(({ eventId }) => eventId), args.verbose ? Infinity : 12);
if (Object.keys(batch.pendingScheduledById).length > 0) {
  console.log('\nPending Scheduled by EventId');
  Object.entries(batch.pendingScheduledById).slice(0, args.verbose ? Infinity : 12).forEach(([id, value]) => console.log(`  ${id}: due=${value.due}, notDue=${value.notDue}`));
}
if (deadEnds.length > 0) {
  console.log('\nDead-end seeds');
  deadEnds.slice(0, args.verbose ? 20 : 5).forEach(({ seed, finalState }) => console.log(`  ${seed} -> ${finalState.careerPhase} age=${finalState.ageMonths} slot=${finalState.slotInMonth} location=${finalState.locationId}`));
}
if (errors.length > 0) {
  console.log('\nSimulation errors');
  errors.slice(0, args.verbose ? 20 : 5).forEach(({ seed, error }) => console.log(`  ${seed}: ${error}`));
}
if (warnings.length > 0 && args.verbose) {
  console.log('\nStatic content warnings');
  warnings.forEach(({ message }) => console.log(`  ${message}`));
}

if (args.jsonPath) {
  const { runResults: _, problematicRuns: __, ...report } = batch;
  const outputPath = resolve(args.jsonPath);
  writeFileSync(outputPath, `${JSON.stringify({ ...report, staticDiagnostics: warnings }, null, 2)}\n`, 'utf8');
  console.log(`\nJSON report: ${outputPath}`);
}

function parseArguments(values: string[]): { runs: number; seed: number; maxEvents: number; verbose: boolean; jsonPath?: string } {
  const result: { runs: number; seed: number; maxEvents: number; verbose: boolean; jsonPath?: string } = { runs: 100, seed: 1, maxEvents: 1000, verbose: false };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--verbose') result.verbose = true;
    else if (value === '--runs') result.runs = positiveInteger(values[++index], '--runs');
    else if (value === '--seed') result.seed = uint32(values[++index], '--seed');
    else if (value === '--max-events') result.maxEvents = positiveInteger(values[++index], '--max-events');
    else if (value === '--json') result.jsonPath = requiredValue(values[++index], '--json');
    else throw new Error(`Unknown argument "${value}".`);
  }
  return result;
}

function positiveInteger(value: string | undefined, label: string): number {
  const parsed = Number(requiredValue(value, label));
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${label} must be a positive integer.`);
  return parsed;
}

function uint32(value: string | undefined, label: string): number {
  const parsed = Number(requiredValue(value, label));
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 0xffffffff) throw new Error(`${label} must be an integer from 0 to 4294967295.`);
  return parsed;
}

function requiredValue(value: string | undefined, label: string): string {
  if (!value || value.startsWith('--')) throw new Error(`${label} requires a value.`);
  return value;
}

function row(label: string, value: string | number): void { console.log(`${label.padEnd(35)}${value}`); }
function percentage(value: number, total: number): string { return total === 0 ? '0.0%' : `${(value / total * 100).toFixed(1)}%`; }
function countRate(value: number, total: number): string { return `${value} (${percentage(value, total)})`; }
function formatAge(months: number): string { return `${Math.floor(months / 12)}y ${Math.round(months % 12)}m`; }
function formatDistribution(value: { min: number; p50: number; p90: number; max: number; average: number }): string {
  return `${value.min} / ${value.p50} / ${value.p90} / ${value.max} / ${value.average.toFixed(2)}`;
}
function formatCompactDistribution(value: { p50: number; p90: number; average: number }): string {
  return `${value.p50} / ${value.p90} / ${value.average.toFixed(2)}`;
}
function printIds(title: string, ids: string[], limit: number): void {
  if (ids.length === 0) return;
  console.log(`\n${title}`);
  ids.slice(0, limit).forEach((id) => console.log(`  ${id}`));
  if (ids.length > limit) console.log(`  ... ${ids.length - limit} more`);
}
function printTopCounts(title: string, values: Record<string, number>, limit: number): void {
  const entries = Object.entries(values).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  if (entries.length === 0) return;
  console.log(`\n${title}`);
  entries.slice(0, limit).forEach(([id, count]) => console.log(`  ${id}: ${count}`));
  if (entries.length > limit) console.log(`  ... ${entries.length - limit} more`);
}
