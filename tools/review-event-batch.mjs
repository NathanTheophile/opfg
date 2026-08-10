#!/usr/bin/env node

import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
let repoArg = null;
let jsonOutput = false;
let reportDir = null;
const inputs = [];

function usage() {
  console.log(`
OPFG Event Batch Fast Reviewer

Usage:
  node tools/review-event-batch.mjs [options] <batch-dir-or-zip> [more batches...]

Options:
  --repo <path>        OPFG repo root. Defaults to auto-detection from cwd.
  --json               Print machine-readable JSON instead of the concise report.
  --report-dir <path>  Also write one Markdown review report per batch.
  -h, --help           Show this help.

Purpose:
  Automates the mechanical 80% of batch review: schema vocabulary, refs,
  localization, Dice, Choice resolvability, Immediate/Lifetime graph metrics,
  orphans/cycles, effect-scale checks, manifest/index compatibility and exact
  conceptKey dedup. Human review remains required for narrative quality.
`);
}

function fail(message) {
  console.error(`\nERROR: ${message}\n`);
  process.exit(1);
}

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '-h' || arg === '--help') { usage(); process.exit(0); }
  if (arg === '--json') { jsonOutput = true; continue; }
  if (arg === '--repo') { repoArg = args[++i]; if (!repoArg) fail('--repo requires a path.'); continue; }
  if (arg === '--report-dir') { reportDir = args[++i]; if (!reportDir) fail('--report-dir requires a path.'); continue; }
  if (arg.startsWith('-')) fail(`Unknown option: ${arg}`);
  inputs.push(arg);
}
if (inputs.length === 0) { usage(); fail('Provide at least one batch directory or ZIP.'); }

function findRepoRoot(start) {
  let current = resolve(start);
  while (true) {
    const pkg = join(current, 'package.json');
    if (existsSync(pkg)) {
      try { if (JSON.parse(readFileSync(pkg, 'utf8'))?.name === 'jam-op-fan-game') return current; } catch {}
    }
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}
const repoRoot = repoArg ? resolve(repoArg) : findRepoRoot(process.cwd());
const cleanup = [];

function powershellQuote(value) { return `'${value.replaceAll("'", "''")}'`; }
function extractZip(zipPath) {
  const temp = mkdtempSync(join(tmpdir(), 'opfg-review-'));
  cleanup.push(temp);
  let result;
  if (process.platform === 'win32') {
    const cmd = `Expand-Archive -LiteralPath ${powershellQuote(zipPath)} -DestinationPath ${powershellQuote(temp)} -Force`;
    result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', cmd], { encoding: 'utf8' });
  } else {
    result = spawnSync('unzip', ['-q', zipPath, '-d', temp], { encoding: 'utf8' });
  }
  if (result.error || result.status !== 0) fail(`Could not extract ${zipPath}: ${result.stderr || result.error?.message}`);
  return temp;
}

function visibleEntries(dir) {
  return readdirSync(dir, { withFileTypes: true }).filter((entry) => !entry.name.startsWith('.') && entry.name !== '__MACOSX');
}
function resolveBatchRoot(input) {
  const p = resolve(input);
  if (!existsSync(p)) fail(`Batch input not found: ${p}`);
  let root = p;
  if (statSync(p).isFile()) {
    if (extname(p).toLowerCase() !== '.zip') fail(`Only ZIP files or directories are supported: ${p}`);
    root = extractZip(p);
  }
  for (let depth = 0; depth < 3; depth += 1) {
    if (existsSync(join(root, 'events')) && existsSync(join(root, 'localization', 'fr.json'))) return root;
    const entries = visibleEntries(root);
    if (entries.length === 1 && entries[0].isDirectory()) root = join(root, entries[0].name);
    else break;
  }
  fail(`${input}: expected a batch root containing events/ and localization/fr.json.`);
}

function parseJson(path, errors, label = path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch (error) { errors.push(`Invalid JSON ${label}: ${error.message}`); return null; }
}
function walk(value, fn, path = '') {
  fn(value, path);
  if (Array.isArray(value)) value.forEach((item, i) => walk(item, fn, `${path}/${i}`));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => walk(v, fn, `${path}/${k}`));
}
function sectionByHeading(text, heading) {
  const matches = [...text.matchAll(/^##\s+(.+)$/gm)];
  const idx = matches.findIndex((m) => m[1].trim().toUpperCase().replaceAll(' ', '_') === heading.toUpperCase().replaceAll(' ', '_'));
  if (idx < 0) return null;
  const start = matches[idx].index + matches[idx][0].length;
  const end = idx + 1 < matches.length ? matches[idx + 1].index : text.length;
  return text.slice(start, end);
}
function stripMd(s) { return String(s ?? '').replaceAll('**', '').replaceAll('`', '').trim(); }

function schemaVocabulary() {
  const defaults = {
    conditions: new Set(['all','any','not','hasTrait','statAtLeast','hasFlag','hasItem','berriesAtLeast','hasCrew','crewSizeAtLeast','hasCrewRole','canRecruitNpc','isLeader','locationIs','locationHasTag','locationHasService','locationWithin','currentSeaIs','isAtSea','isOnLand','careerPhaseIs','ageAtLeastMonths','ageAtMostMonths','hasShip','shipIs','shipHealthAtLeast','shipHealthAtMost','shipCrewCapacityAtLeast','shipCargoSpaceAtLeast','canAcquireShip','canSellShip','npcStatusIs','npcRelationshipAtLeast','npcStatAtLeast','hasChosen','hasPlayed','hasOutcome','raceIs','originSeaIs','affiliationIs','familyStructureIs','socialClassIs','hasDevilFruit','canConsumeDevilFruit','devilFruitIs','devilFruitTypeIs','devilFruitHasTag','devilFruitAwakeningAtLeast','devilFruitIsAwakened','hakiAtLeast','hakiIsAwakened','hakiSourceTotalAtLeast','npcHasDevilFruit','npcDevilFruitIs','npcDevilFruitTypeIs','npcDevilFruitHasTag','npcDevilFruitAwakeningAtLeast','npcHakiAtLeast','npcHakiIsAwakened','careerAffiliationIs','reputationAtLeast','reputationAtMost','bountyAtLeast','careerRankIs','careerRankAtLeast','careerTitleIs']),
    effects: new Set(['setFlag','clearFlag','addItem','removeItem','addTrait','removeTrait','modifyStat','modifyHealth','acquireShip','loseShip','modifyShipHealth','addCargoItem','removeCargoItem','resolveShipReplacement','modifyBerries','moveToLocation','setBirthLocation','recoverTravel','setNpcStatus','setNpcPassenger','setLeadership','modifyNpcRelationship','modifyNpcStat','scheduleEvent','queueImmediateEvent','setCareerPhase','setRace','setOriginSea','setAffiliation','setFamilyStructure','setSocialClass','endCareer','consumeDevilFruit','increaseDevilFruitAwakening','awakenHaki','raiseConquerorHakiTo','setNpcDevilFruit','increaseNpcDevilFruitAwakening','raiseNpcHakiTo','setCareerAffiliation','modifyReputation','setBounty','modifyBounty','setCareerRank','setCareerTitle','clearCareerTitle','endCareerWithEnding']),
  };
  if (!repoRoot) return defaults;
  const schemaPath = join(repoRoot, 'src', 'game', 'content', 'schema.ts');
  if (!existsSync(schemaPath)) return defaults;
  const text = readFileSync(schemaPath, 'utf8');
  const cStart = text.indexOf('export type Condition =');
  const eStart = text.indexOf('export type Effect =');
  const eEnd = text.indexOf('export interface Outcome');
  if (cStart >= 0 && eStart > cStart) {
    const found = [...text.slice(cStart, eStart).matchAll(/type:\s*'([^']+)'/g)].map((m) => m[1]);
    if (found.length) defaults.conditions = new Set(found);
  }
  if (eStart >= 0 && eEnd > eStart) {
    const found = [...text.slice(eStart, eEnd).matchAll(/type:\s*'([^']+)'/g)].map((m) => m[1]);
    if (found.length) defaults.effects = new Set(found);
  }
  return defaults;
}
const vocab = schemaVocabulary();

function repoEventIds() {
  const ids = new Set();
  if (!repoRoot) return ids;
  const root = join(repoRoot, 'src', 'game', 'content', 'events');
  if (!existsSync(root)) return ids;
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) visit(p);
      else if (entry.isFile() && extname(entry.name).toLowerCase() === '.json') {
        try { const e = JSON.parse(readFileSync(p, 'utf8')); if (e?.id) ids.add(e.id); } catch {}
      }
    }
  };
  visit(root); return ids;
}
const existingEventIds = repoEventIds();

function indexConceptKeys() {
  const keys = new Set();
  if (!repoRoot) return keys;
  const p = join(repoRoot, 'docs', 'content', 'events', 'EVENT_CONCEPT_INDEX.md');
  if (!existsSync(p)) return keys;
  const text = readFileSync(p, 'utf8');
  for (const m of text.matchAll(/\|\s*`[^`]+`\s*\|\s*`([^`]+)`\s*\|/g)) keys.add(m[1]);
  return keys;
}
const acceptedConceptKeys = indexConceptKeys();

function collectOutcomeObjects(event) {
  const out = [];
  for (const choice of event.choices || []) {
    const r = choice.resolution;
    if (!r) continue;
    if (r.type === 'deterministic' && r.outcome) out.push({ choice, outcome: r.outcome, result: null });
    if (r.type === 'dice' && r.outcomes) Object.entries(r.outcomes).forEach(([result, outcome]) => out.push({ choice, outcome, result }));
  }
  return out;
}
function targetsInOutcome(outcome, type) {
  return (outcome?.effects || []).filter((e) => e?.type === type).map((e) => e.eventId);
}
function allOutgoing(event, type) {
  const out = [];
  for (const { outcome } of collectOutcomeObjects(event)) out.push(...targetsInOutcome(outcome, type));
  return out;
}
function conditionComplement(a, b) {
  if (!a || !b) return false;
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  return (a.type === 'not' && same(a.condition, b)) || (b.type === 'not' && same(b.condition, a));
}
function choicesProvablyResolvable(event) {
  const choices = event.choices || [];
  if (choices.some((c) => !c.availableIf)) return true;
  if (choices.length === 2 && conditionComplement(choices[0].availableIf, choices[1].availableIf)) return true;
  return false;
}

function graphDepth(startId, events, edgeType, allowedKind, visiting = new Set(), memo = new Map()) {
  if (memo.has(startId)) return memo.get(startId);
  if (visiting.has(startId)) return Infinity;
  visiting.add(startId);
  const e = events.get(startId);
  if (!e) { visiting.delete(startId); return 0; }
  const targets = [...new Set(allOutgoing(e, edgeType))].filter((id) => events.get(id)?.kind === allowedKind);
  let best = 0;
  for (const t of targets) {
    const child = graphDepth(t, events, edgeType, allowedKind, visiting, memo);
    if (child === Infinity) { visiting.delete(startId); return Infinity; }
    best = Math.max(best, 1 + child);
  }
  visiting.delete(startId); memo.set(startId, best); return best;
}
function reachableScheduled(seedId, events) {
  const seen = new Set();
  const stack = [...new Set(allOutgoing(events.get(seedId), 'scheduleEvent'))];
  while (stack.length) {
    const id = stack.pop();
    if (seen.has(id)) continue;
    const e = events.get(id);
    if (!e || e.kind !== 'scheduled') continue;
    seen.add(id);
    for (const next of allOutgoing(e, 'scheduleEvent')) stack.push(next);
  }
  return seen;
}
function structuralDivergences(seedId, events, reach) {
  const nodes = [seedId, ...reach];
  let count = 0;
  const detail = [];
  for (const id of nodes) {
    const e = events.get(id); if (!e) continue;
    const perOutcome = collectOutcomeObjects(e).map(({ choice, outcome, result }) => ({
      source: `${choice.id}${result ? `/${result}` : ''}`,
      targets: [...new Set(targetsInOutcome(outcome, 'scheduleEvent').filter((t) => reach.has(t)))],
    })).filter((x) => x.targets.length);
    const distinct = new Set(perOutcome.flatMap((x) => x.targets));
    if (distinct.size >= 2) { count += 1; detail.push({ id, targets: [...distinct] }); }
  }
  return { count, detail };
}
function hasCycle(events, edgeType, allowedKinds) {
  const color = new Map();
  const visit = (id) => {
    if (color.get(id) === 1) return true;
    if (color.get(id) === 2) return false;
    color.set(id, 1);
    const e = events.get(id);
    for (const t of e ? allOutgoing(e, edgeType) : []) {
      if (!events.has(t) || !allowedKinds.has(events.get(t).kind)) continue;
      if (visit(t)) return true;
    }
    color.set(id, 2); return false;
  };
  return [...events.keys()].some(visit);
}

function parseRootRegistry(manifest) {
  const section = sectionByHeading(manifest, 'ROOT_REGISTRY') || sectionByHeading(manifest, 'ROOT REGISTER');
  if (!section) return [];
  const lines = section.split(/\r?\n/).filter((l) => l.trim().startsWith('|'));
  if (lines.length < 3) return [];
  const split = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(stripMd);
  const headers = split(lines[0]).map((x) => x.toLowerCase());
  const ri = headers.findIndex((x) => ['root id','root'].includes(x));
  const ci = headers.findIndex((x) => x.toLowerCase() === 'conceptkey');
  if (ri < 0 || ci < 0) return [];
  return lines.slice(2).map(split).filter((r) => r[ri]).map((r) => ({ rootId: r[ri], conceptKey: r[ci] }));
}

function analyze(input) {
  const errors = [], warnings = [], notes = [];
  const root = resolveBatchRoot(input);
  const batchId = basename(root);
  const eventDir = join(root, 'events');
  const loc = parseJson(join(root, 'localization', 'fr.json'), errors, `${batchId}/localization/fr.json`) || {};
  const manifestPath = join(root, 'MANIFEST.md');
  const manifest = existsSync(manifestPath) ? readFileSync(manifestPath, 'utf8') : '';
  if (!manifest) errors.push('Missing MANIFEST.md.');
  const proposedPath = join(root, 'PROPOSED_DEFINITIONS.md');
  const proposed = existsSync(proposedPath) ? readFileSync(proposedPath, 'utf8').trim() : '';
  const proposedBody = proposed.replace(/^#\s+PROPOSED_DEFINITIONS\s*/i, '').trim();
  if (proposedBody && !/^(none|aucune?|n\/a|—|-)?\.?$/i.test(proposedBody)) warnings.push('PROPOSED_DEFINITIONS.md contains proposals: human approval required before integration.');

  const files = readdirSync(eventDir).filter((f) => extname(f).toLowerCase() === '.json').sort();
  const events = new Map();
  for (const file of files) {
    const e = parseJson(join(eventDir, file), errors, `${batchId}/events/${file}`);
    if (!e?.id) continue;
    if (events.has(e.id)) errors.push(`Duplicate Event ID: ${e.id}`);
    events.set(e.id, e);
    if (basename(file, '.json') !== e.id) errors.push(`Filename/Event ID mismatch: ${file} != ${e.id}.json`);
  }
  const kinds = { normal: 0, immediate: 0, scheduled: 0, critical: 0, unknown: 0 };
  for (const e of events.values()) kinds[e.kind] = (kinds[e.kind] ?? 0) + 1;
  if (kinds.unknown) errors.push(`${kinds.unknown} Event(s) have unknown kind.`);

  const allIds = new Set([...existingEventIds, ...events.keys()]);
  const incoming = new Map([...events.keys()].map((id) => [id, 0]));
  let positiveShipHealth = 0;
  let rootDice = 0;
  let rootScheduled = 0;
  const diceThresholds = new Set([8, 11, 14, 17]);

  for (const e of events.values()) {
    if (!Array.isArray(e.choices) || e.choices.length === 0) errors.push(`${e.id}: no Choices.`);
    else if (!choicesProvablyResolvable(e)) errors.push(`${e.id}: V4.1 Choice resolvability not provable (all Choices use availableIf without a recognized exhaustive complement).`);

    // Localization and vocabulary.
    walk(e, (value, path) => {
      if (typeof value === 'string' && /Key$/.test(path.split('/').at(-1) || '') && !Object.prototype.hasOwnProperty.call(loc, value)) {
        errors.push(`${e.id}: missing FR localization key ${value}`);
      }
      if (value && typeof value === 'object' && !Array.isArray(value) && typeof value.type === 'string') {
        if (path.includes('/eligibility') || path.includes('/availableIf') || path.includes('/visibleIf') || path.includes('/condition') || path.includes('/cancelIf')) {
          if (!vocab.conditions.has(value.type) && !['deterministic','dice','text'].includes(value.type)) warnings.push(`${e.id}: unknown Condition-like type "${value.type}" at ${path || '/'}.`);
        }
        if (path.includes('/effects/') && !vocab.effects.has(value.type)) errors.push(`${e.id}: unknown Effect type "${value.type}" at ${path}.`);
      }
    });

    let hasDice = false, hasSchedule = false;
    for (const choice of e.choices || []) {
      const r = choice.resolution;
      if (!r) { errors.push(`${e.id}/${choice.id}: missing resolution.`); continue; }
      if (r.type === 'dice') {
        hasDice = true;
        if (r.statId === 'health') errors.push(`${e.id}/${choice.id}: DiceCheck uses health.`);
        if (!diceThresholds.has(r.successThreshold)) errors.push(`${e.id}/${choice.id}: Dice threshold ${r.successThreshold} is outside 8/11/14/17.`);
        const keys = Object.keys(r.outcomes || {}).sort().join(',');
        if (keys !== ['criticalFailure','criticalSuccess','failure','success'].sort().join(',')) errors.push(`${e.id}/${choice.id}: Dice outcomes must be exactly criticalFailure/failure/success/criticalSuccess.`);
      } else if (r.type !== 'deterministic') errors.push(`${e.id}/${choice.id}: unknown Resolution type ${r.type}.`);
    }
    for (const { choice, outcome, result } of collectOutcomeObjects(e)) {
      const modifiedStats = new Set();
      let lifetimeSchedulesInOutcome = 0;
      for (const effect of outcome.effects || []) {
        if (effect.type === 'modifyStat') {
          modifiedStats.add(effect.statId);
          if (Math.abs(effect.amount) > 3) errors.push(`${e.id}/${choice.id}/${result || outcome.id}: modifyStat ${effect.statId} ${effect.amount} exceeds ±3.`);
        }
        if (effect.type === 'modifyShipHealth' && effect.amount > 0) positiveShipHealth += 1;
        if (effect.type === 'queueImmediateEvent' || effect.type === 'scheduleEvent') {
          if (!allIds.has(effect.eventId)) errors.push(`${e.id}: ${effect.type} target missing from batch/repo: ${effect.eventId}`);
          if (events.has(effect.eventId)) incoming.set(effect.eventId, (incoming.get(effect.eventId) || 0) + 1);
          if (effect.type === 'queueImmediateEvent' && events.get(effect.eventId)?.kind !== 'immediate') errors.push(`${e.id}: queueImmediateEvent target is not Immediate: ${effect.eventId}`);
          if (effect.type === 'scheduleEvent') {
            hasSchedule = true;
            if (events.get(effect.eventId)?.kind && events.get(effect.eventId)?.kind !== 'scheduled') errors.push(`${e.id}: scheduleEvent target is not Scheduled: ${effect.eventId}`);
            if (events.get(effect.eventId)?.kind === 'scheduled') lifetimeSchedulesInOutcome += 1;
          }
        }
      }
      if (modifiedStats.size > 2) warnings.push(`${e.id}/${choice.id}/${result || outcome.id}: modifies ${modifiedStats.size} player Stats (usual max 2).`);
      if (e.lifetimeThreadSeed === true || e.kind === 'scheduled') {
        if (lifetimeSchedulesInOutcome > 1) warnings.push(`${e.id}/${choice.id}/${result || outcome.id}: schedules ${lifetimeSchedulesInOutcome} Scheduled Events in one Outcome; inspect Lifetime verticality/pre-queue risk.`);
      }
    }
    if (e.fallbackEventId) {
      if (!allIds.has(e.fallbackEventId)) errors.push(`${e.id}: fallbackEventId missing from batch/repo: ${e.fallbackEventId}`);
      if (events.has(e.fallbackEventId)) incoming.set(e.fallbackEventId, (incoming.get(e.fallbackEventId) || 0) + 1);
    }
    if (e.kind === 'normal') { if (hasDice) rootDice += 1; if (hasSchedule) rootScheduled += 1; }
  }

  if (positiveShipHealth) warnings.push(`${positiveShipHealth} positive modifyShipHealth effect(s): verify each represents an explicit repair, not merely avoided damage/reduced strain.`);

  const orphanImmediate = [], orphanScheduled = [];
  for (const [id, e] of events) {
    if ((incoming.get(id) || 0) === 0 && e.kind === 'immediate') orphanImmediate.push(id);
    if ((incoming.get(id) || 0) === 0 && e.kind === 'scheduled') orphanScheduled.push(id);
  }
  if (orphanImmediate.length) errors.push(`Orphan Immediate Events: ${orphanImmediate.join(', ')}`);
  if (orphanScheduled.length) errors.push(`Orphan Scheduled Events: ${orphanScheduled.join(', ')}`);
  if (hasCycle(events, 'queueImmediateEvent', new Set(['immediate']))) errors.push('Immediate graph contains a cycle.');
  if (hasCycle(events, 'scheduleEvent', new Set(['scheduled']))) errors.push('Scheduled graph contains a cycle.');

  const immediateDepths = [...events.values()].filter((e) => e.kind === 'normal').map((e) => ({ id: e.id, depth: graphDepth(e.id, events, 'queueImmediateEvent', 'immediate') })).sort((a,b) => b.depth-a.depth);
  const signatureCandidates = immediateDepths.filter((x) => x.depth >= 5);
  const depth3Candidates = immediateDepths.filter((x) => x.depth >= 3);
  if (kinds.normal >= 15) {
    if (signatureCandidates.length < 1) errors.push('No Signature Immediate Arc reaches depth 5.');
    const signatureId = signatureCandidates[0]?.id;
    if (depth3Candidates.filter((x) => x.id !== signatureId).length < 3) errors.push('Fewer than 3 Secondary Immediate roots reach depth 3 outside the Signature root.');
  }

  const lifetime = [];
  for (const seed of [...events.values()].filter((e) => e.kind === 'normal' && e.lifetimeThreadSeed === true)) {
    const reach = reachableScheduled(seed.id, events);
    const depth = graphDepth(seed.id, events, 'scheduleEvent', 'scheduled');
    const div = structuralDivergences(seed.id, events, reach);
    lifetime.push({ seedId: seed.id, depth, totalScheduledNodes: reach.size, structuralDivergences: div.count, divergenceNodes: div.detail.map((d) => d.id) });
    if (depth < 10) errors.push(`${seed.id}: Lifetime longest Scheduled depth ${depth} < 10.`);
    if (reach.size < 20) errors.push(`${seed.id}: Lifetime reachable Scheduled nodes ${reach.size} < 20.`);
    else if (reach.size < 24) warnings.push(`${seed.id}: Lifetime breadth ${reach.size} passes hard floor but is below preferred 24–30.`);
    if (div.count < 2) errors.push(`${seed.id}: fewer than 2 structural Scheduled divergence candidates.`);
    else if (div.count < 3) warnings.push(`${seed.id}: ${div.count} structural divergences pass floor but are below preferred 3+.`);
  }
  if (kinds.normal >= 15 && lifetime.length === 0) errors.push('No lifetimeThreadSeed root found in a standard-sized batch.');

  // Manifest/index compatibility and exact concept dedup.
  const registry = parseRootRegistry(manifest);
  if (!registry.length) errors.push('MANIFEST ROOT_REGISTRY could not be parsed.');
  else {
    if (registry.length !== kinds.normal) warnings.push(`MANIFEST ROOT_REGISTRY has ${registry.length} rows but batch has ${kinds.normal} Normal roots.`);
    for (const row of registry) {
      if (!events.has(row.rootId)) errors.push(`MANIFEST root missing from events/: ${row.rootId}`);
      if (row.conceptKey && acceptedConceptKeys.has(row.conceptKey)) warnings.push(`Exact conceptKey already present in EVENT_CONCEPT_INDEX.md: ${row.conceptKey}`);
    }
  }
  for (const heading of ['SIGNATURE_IMMEDIATE_ARCS','SECONDARY_IMMEDIATE_ARCS','LIFETIME_THREADS']) {
    if (!sectionByHeading(manifest, heading)) errors.push(`MANIFEST missing ## ${heading}.`);
  }
  const lifetimeSection = sectionByHeading(manifest, 'LIFETIME_THREADS') || '';
  for (const lt of lifetime) {
    if (!lifetimeSection.includes(lt.seedId)) errors.push(`MANIFEST LIFETIME_THREADS does not mention seed ${lt.seedId}.`);
    for (const label of ['Longest reachable Scheduled depth','Total distinct reachable Scheduled EventDefinitions']) {
      if (!lifetimeSection.includes(label)) warnings.push(`MANIFEST Lifetime metrics missing expected label: ${label}`);
    }
  }

  const rootDicePct = kinds.normal ? (100 * rootDice / kinds.normal) : 0;
  const rootScheduledPct = kinds.normal ? (100 * rootScheduled / kinds.normal) : 0;
  if (kinds.normal >= 15 && (rootDicePct < 35 || rootDicePct > 55)) warnings.push(`Root Dice coverage ${rootDice}/${kinds.normal} = ${rootDicePct.toFixed(1)}% (target ~40–50%).`);
  if (kinds.normal >= 15 && (rootScheduledPct < 10 || rootScheduledPct > 30)) warnings.push(`Roots initiating Scheduled ${rootScheduled}/${kinds.normal} = ${rootScheduledPct.toFixed(1)}% (target ~15–25%).`);

  notes.push('Human review still required: narrative quality, meaningful/persistent divergence, anti-reskin, Scheduled causal wording, geography/canon plausibility, and whether positive rewards match fiction.');
  const result = {
    batchId, input: resolve(input), eventCount: events.size, kinds,
    roots: { dice: rootDice, dicePercent: rootDicePct, scheduled: rootScheduled, scheduledPercent: rootScheduledPct },
    immediate: { maxDepth: immediateDepths[0]?.depth || 0, signatureCandidates, depth3Candidates },
    lifetime, positiveShipHealthEffects: positiveShipHealth,
    errors: [...new Set(errors)], warnings: [...new Set(warnings)], notes,
    verdict: errors.length ? 'BLOCK' : (warnings.length ? 'MECHANICALLY_OK_WITH_WARNINGS' : 'MECHANICALLY_OK'),
  };
  return result;
}

function markdownReport(r) {
  const lines = [];
  lines.push(`# ${r.batchId} — Fast Review`, '');
  lines.push(`**Verdict mécanique:** ${r.verdict}`, '');
  lines.push(`- Events: ${r.eventCount} — Normal ${r.kinds.normal}, Immediate ${r.kinds.immediate}, Scheduled ${r.kinds.scheduled}, Critical ${r.kinds.critical}`);
  lines.push(`- Root Dice: ${r.roots.dice}/${r.kinds.normal} (${r.roots.dicePercent.toFixed(1)}%)`);
  lines.push(`- Roots Scheduled: ${r.roots.scheduled}/${r.kinds.normal} (${r.roots.scheduledPercent.toFixed(1)}%)`);
  lines.push(`- Max Immediate depth: ${r.immediate.maxDepth}`);
  for (const lt of r.lifetime) lines.push(`- Lifetime ${lt.seedId}: depth ${lt.depth}, ${lt.totalScheduledNodes} Scheduled nodes, ${lt.structuralDivergences} structural divergence candidates`);
  lines.push('', `## Errors (${r.errors.length})`);
  lines.push(...(r.errors.length ? r.errors.map((x) => `- ${x}`) : ['- None']));
  lines.push('', `## Warnings (${r.warnings.length})`);
  lines.push(...(r.warnings.length ? r.warnings.map((x) => `- ${x}`) : ['- None']));
  lines.push('', '## Human review remaining');
  lines.push(...r.notes.map((x) => `- ${x}`));
  return lines.join('\n') + '\n';
}

try {
  const results = inputs.map(analyze);
  if (reportDir) {
    const out = resolve(reportDir); mkdirSync(out, { recursive: true });
    for (const r of results) writeFileSync(join(out, `${r.batchId}_FAST_REVIEW.md`), markdownReport(r), 'utf8');
  }
  if (jsonOutput) console.log(JSON.stringify({ repoRoot, results }, null, 2));
  else {
    console.log('\nOPFG Event Batch Fast Reviewer\n==============================');
    if (repoRoot) console.log(`Repo: ${repoRoot}`);
    else console.log('Repo: not detected — repo-aware dedup/external-ref checks limited.');
    for (const r of results) {
      console.log(`\n${r.batchId}`);
      console.log('-'.repeat(r.batchId.length));
      console.log(`Events: ${r.eventCount} | N ${r.kinds.normal} / I ${r.kinds.immediate} / S ${r.kinds.scheduled} / C ${r.kinds.critical}`);
      console.log(`Roots Dice: ${r.roots.dice}/${r.kinds.normal} (${r.roots.dicePercent.toFixed(1)}%) | Roots Scheduled: ${r.roots.scheduled}/${r.kinds.normal} (${r.roots.scheduledPercent.toFixed(1)}%)`);
      console.log(`Immediate max depth: ${r.immediate.maxDepth}`);
      for (const lt of r.lifetime) console.log(`Lifetime: ${lt.seedId} | depth ${lt.depth} | nodes ${lt.totalScheduledNodes} | structural splits ${lt.structuralDivergences}`);
      console.log(`Errors: ${r.errors.length} | Warnings: ${r.warnings.length} | ${r.verdict}`);
      r.errors.forEach((x) => console.log(`  ERROR: ${x}`));
      r.warnings.forEach((x) => console.log(`  WARN:  ${x}`));
    }
    console.log('\nHuman pass after this tool: read only the 4 Immediate arc roots/chains, the Lifetime branch points + a few reconvergences/endings, and any warnings. That should reduce a normal batch review to a few minutes instead of redoing the mechanical graph audit manually.\n');
  }
  process.exit(results.some((r) => r.errors.length) ? 2 : 0);
} finally {
  for (const p of cleanup) rmSync(p, { recursive: true, force: true });
}
