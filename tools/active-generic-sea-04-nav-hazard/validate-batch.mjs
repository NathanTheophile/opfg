#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const PREFIX = 'active_generic_sea_04_nav_hazard_';
const eventDir = resolve('src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_04_NAV_HAZARD');
const supportDir = resolve('docs/content/events/v2/batches/ACTIVE_GENERIC_SEA_04_NAV_HAZARD');
const filenames = (await readdir(eventDir)).filter((name) => name.endsWith('.json')).sort();
const events = await Promise.all(filenames.map(async (name) => JSON.parse(await readFile(resolve(eventDir, name), 'utf8'))));
const byId = new Map(events.map((event) => [event.id, event]));
const roots = events.filter(({ kind }) => kind === 'normal');
const immediates = events.filter(({ kind }) => kind === 'immediate');
const errors = [];

const effects = (event) => event.choices.flatMap(({ resolution }) => {
  const outcomes = resolution.type === 'deterministic'
    ? [resolution.outcome]
    : Object.values(resolution.outcomes);
  return outcomes.flatMap((outcome) => outcome.effects);
});
const queueTargets = (event) => effects(event)
  .filter(({ type }) => type === 'queueImmediateEvent')
  .map(({ eventId }) => eventId);

const hasCondition = (condition, type, fields = {}) => {
  if (!condition) return false;
  if (condition.type === type && Object.entries(fields).every(([key, value]) => condition[key] === value)) return true;
  if (condition.type === 'all' || condition.type === 'any') return condition.conditions.some((child) => hasCondition(child, type, fields));
  if (condition.type === 'not') return hasCondition(condition.condition, type, fields);
  return false;
};

const maxDepth = (eventId, seen = new Set()) => {
  if (seen.has(eventId)) throw new Error(`Immediate cycle at ${eventId}`);
  const event = byId.get(eventId);
  if (!event) throw new Error(`Missing queue target ${eventId}`);
  const next = queueTargets(event);
  if (next.length === 0) return 0;
  const nextSeen = new Set(seen);
  nextSeen.add(eventId);
  return 1 + Math.max(...next.map((target) => maxDepth(target, nextSeen)));
};

if (events.length !== 38 || roots.length !== 20 || immediates.length !== 18) errors.push(`counts ${events.length}/${roots.length}/${immediates.length}`);
if (events.some(({ kind }) => !['normal', 'immediate'].includes(kind))) errors.push('non Normal/Immediate kind found');
if (events.some(({ id }) => !id.startsWith(PREFIX))) errors.push('out-of-prefix Event ID found');

for (const event of events) {
  if (`${event.id}.json` !== filenames.find((name) => name === `${event.id}.json`)) errors.push(`filename mismatch: ${event.id}`);
  for (const target of queueTargets(event)) {
    if (!byId.has(target)) errors.push(`${event.id}: missing ${target}`);
    if (!target.startsWith(PREFIX)) errors.push(`${event.id}: external queue ${target}`);
  }

  for (const choice of event.choices) {
    const resolution = choice.resolution;
    const outcomes = resolution.type === 'deterministic' ? [resolution.outcome] : Object.values(resolution.outcomes);
    if (resolution.type === 'dice') {
      const keys = Object.keys(resolution.outcomes).sort().join(',');
      if (keys !== 'criticalFailure,criticalSuccess,failure,success') errors.push(`${event.id}/${choice.id}: bad Dice outcomes`);
    }
    for (const outcome of outcomes) {
      if (outcome.effects.some((effect) => effect.type === 'modifyShipHealth' && effect.amount < 0) && outcome.shipDamageCause !== 'accident') {
        errors.push(`${event.id}/${choice.id}/${outcome.id}: missing accident damage cause`);
      }
    }
  }
}

for (const root of roots) {
  if (!hasCondition(root.eligibility, 'careerPhaseIs', { phase: 'active' })) errors.push(`${root.id}: no active gate`);
  if (!hasCondition(root.eligibility, 'isAtSea')) errors.push(`${root.id}: no at-sea gate`);
  if (!hasCondition(root.eligibility, 'hasShip')) errors.push(`${root.id}: no ship gate`);
  if (!root.choices.some((choice) => choice.availableIf === undefined)) errors.push(`${root.id}: no unconditional choice`);
}

const diceRoots = roots.filter((event) => event.choices.some(({ resolution }) => resolution.type === 'dice'));
const arcRoots = roots.filter((event) => queueTargets(event).length > 0);
const depths = roots.map(({ id }) => maxDepth(id));
if (diceRoots.length !== 13) errors.push(`Dice roots ${diceRoots.length}/20`);
if (arcRoots.length !== 15) errors.push(`Immediate roots ${arcRoots.length}/20`);
if (depths.filter((depth) => depth === 2).length !== 3 || Math.max(...depths) !== 2) errors.push(`Immediate depths ${depths.join(',')}`);
if (events.some((event) => effects(event).some(({ type }) => type === 'scheduleEvent'))) errors.push('Scheduled effect found');

const usedKeys = new Set();
for (const event of events) {
  usedKeys.add(event.titleKey);
  usedKeys.add(event.textKey);
  for (const choice of event.choices) {
    usedKeys.add(choice.textKey);
    const resolution = choice.resolution;
    if (resolution.type === 'deterministic') usedKeys.add(resolution.outcome.textKey);
    else {
      Object.values(resolution.outcomes).forEach((outcome) => usedKeys.add(outcome.textKey));
      (resolution.modifiers ?? []).forEach(({ displayLabelKey }) => usedKeys.add(displayLabelKey));
    }
  }
}
for (const lang of ['fr', 'en']) {
  const locale = JSON.parse(await readFile(resolve(supportDir, `localization.${lang}.json`), 'utf8'));
  const missing = [...usedKeys].filter((key) => !(key in locale));
  if (missing.length) errors.push(`[${lang}] missing ${missing.length} keys`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`OK ${events.length} Events | 20 roots | 18 Immediate | 15 mini-arcs | 13 Dice roots | 0 Scheduled`);
