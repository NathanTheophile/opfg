import { writeFileSync } from 'node:fs';
import { loadNodeContentCatalog } from '../src/game/content/nodeContentCatalog';
import { buildFinalRunReport } from '../src/game/engine/finalRun';
import { simulateBatch } from '../src/game/simulation/simulateBatch';
import { progressionSimulationPolicy } from '../src/game/simulation/simulationPolicy';
import { validateContent } from '../src/game/validation/validateContent';

const catalog = loadNodeContentCatalog();
const errors = validateContent(catalog);
if (errors.length) {
  errors.forEach(({ path, message }) => console.error(`ERROR ${path}: ${message}`));
  throw new Error(`Content invalid: ${errors.length} error(s).`);
}

const batch = simulateBatch({
  runs: 300,
  baseSeed: 1,
  maxResolvedEvents: 1000,
  catalog,
  policy: progressionSimulationPolicy,
});

const families: Record<string, number> = {};
const roots: Record<string, number> = {};
const byCareer: Record<string, Record<string, number>> = {};
let genericHorizon = 0;

for (const result of batch.runResults) {
  const state = result.finalState;
  if (state.careerStatus !== 'ended') continue;
  const report = buildFinalRunReport(state, catalog);
  const ending = report.endingId ?? 'null';
  families[ending] = (families[ending] ?? 0) + 1;
  if (ending === 'v1_career_horizon') genericHorizon += 1;
  const career = state.player.career.affiliationId;
  byCareer[career] ??= {};
  byCareer[career][ending] = (byCareer[career][ending] ?? 0) + 1;
  for (const entry of result.resolvedEvents) {
    if (!entry.eventId.startsWith('active_ending_') || entry.kind !== 'normal') continue;
    roots[entry.eventId] = (roots[entry.eventId] ?? 0) + 1;
  }
}

const report = {
  runs: 300,
  terminations: batch.summary.terminations,
  playerDeaths: batch.summary.playerDeaths,
  safetyLimits: batch.summary.terminations.safetyLimit,
  genericHorizon,
  endingFamilies: families,
  endingRoots: roots,
  endingsByCareer: byCareer,
};

console.log(JSON.stringify(report, null, 2));
writeFileSync('endings-v1-300.json', `${JSON.stringify(report, null, 2)}\n`, 'utf8');
