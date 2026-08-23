#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(here, 'manifest.json'), 'utf8'));
const files = fs.readdirSync(path.join(here, 'events')).filter((name) => name.endsWith('.json')).sort();
const events = files.map((name) => JSON.parse(fs.readFileSync(path.join(here, 'events', name), 'utf8')));
const byId = new Map(events.map((event) => [event.id, event]));
const roots = events.filter((event) => event.kind === 'normal');
const immediate = events.filter((event) => event.kind === 'immediate');
const scheduled = events.filter((event) => event.kind === 'scheduled');
const diceRoots = roots.filter((event) => event.choices.some((choice) => choice.resolution?.type === 'dice'));
const errors = [];
const routeStartId = 'active_paradise_route_start_p1_classic';
const allowedRoles = new Set(['navigator','medic','shipwright','recruiter','first_mate','helmsman','cook','musician','scholar','foreman']);
const forbiddenTokens = ['crewRoleId','routeId','gunner','fighter','quartermaster','setFlag','clearFlag'];
const expectedScheduleEdges = new Set([
  'active_paradise_p1_classic_01_cactus_backward_marker->active_paradise_p1_classic_01_route_markers_l2_split_pennant@2',
  'active_paradise_p1_classic_01_route_markers_l2_split_pennant->active_paradise_p1_classic_01_route_markers_l3_scraped_arrow@2',
  'active_paradise_p1_classic_01_route_markers_l3_scraped_arrow->active_paradise_p1_classic_01_route_markers_l4_clean_board@2',
]);

function walkCondition(condition, predicate) {
  if (!condition) return false;
  if (predicate(condition)) return true;
  if (Array.isArray(condition.conditions) && condition.conditions.some((child) => walkCondition(child, predicate))) return true;
  return condition.condition ? walkCondition(condition.condition, predicate) : false;
}

function walkObject(value, visit) {
  if (!value || typeof value !== 'object') return;
  visit(value);
  for (const child of Object.values(value)) walkObject(child, visit);
}

function effectsOfChoice(choice) {
  if (choice.resolution?.type === 'deterministic') return [choice.resolution.outcome];
  if (choice.resolution?.type === 'dice') return Object.values(choice.resolution.outcomes ?? {});
  return [];
}

function wordCount(text) {
  return (String(text).match(/[\p{L}\p{N}]+(?:['’_-][\p{L}\p{N}]+)*/gu) ?? []).length;
}

function assertRange(label, text, min, max) {
  const count = wordCount(text);
  if (count < min || count > max) errors.push(`${label}: ${count} words (expected ${min}-${max})`);
}

if (roots.length !== 50) errors.push(`root count ${roots.length}`);
if (diceRoots.length !== 30) errors.push(`dice root count ${diceRoots.length}`);
if (immediate.length !== 6) errors.push(`immediate count ${immediate.length}`);
if (scheduled.length !== 3) errors.push(`scheduled descendant count ${scheduled.length}`);

for (const [stop, ids] of Object.entries(manifest.perStop)) {
  if (ids.length !== 5) errors.push(`${stop}: ${ids.length} roots`);
}

for (const event of roots) {
  if (!walkCondition(event.eligibility, (condition) => condition.type === 'careerPhaseIs' && condition.phase === 'active')) {
    errors.push(`${event.id}: missing Active phase gate`);
  }
  if (!walkCondition(event.eligibility, (condition) => condition.type === 'hasPlayed' && condition.eventId === routeStartId)) {
    errors.push(`${event.id}: missing route History gate`);
  }
  if (!walkCondition(event.eligibility, (condition) => condition.type === 'locationIs')) {
    errors.push(`${event.id}: missing exact location gate`);
  }
  if (event.choices.length < 3 || event.choices.length > 5) errors.push(`${event.id}: ${event.choices.length} choices`);
  const unconditional = event.choices.filter((choice) => !choice.availableIf).length;
  if (unconditional < 2) errors.push(`${event.id}: only ${unconditional} unconditional choices`);
}

for (const event of scheduled) {
  if (!walkCondition(event.eligibility, (condition) => condition.type === 'careerPhaseIs' && condition.phase === 'active')) {
    errors.push(`${event.id}: scheduled node missing Active phase gate`);
  }
  if (!walkCondition(event.eligibility, (condition) => condition.type === 'hasPlayed' && condition.eventId === routeStartId)) {
    errors.push(`${event.id}: scheduled node missing route History gate`);
  }
  if (event.scheduledReach !== 'unrestricted') errors.push(`${event.id}: scheduledReach must be unrestricted`);
  if (event.priority !== 100) errors.push(`${event.id}: scheduled priority must be 100`);
  if (!event.cancelIf) errors.push(`${event.id}: missing cancelIf`);
}

const raw = JSON.stringify(events);
for (const token of forbiddenTokens) if (raw.includes(`\"${token}\"`) || raw.includes(`\"${token}:`)) errors.push(`forbidden token ${token}`);

const scheduleEdges = new Set();
let recruitmentEffects = 0;
let diceChoices = 0;
for (const event of events) {
  for (const choice of event.choices ?? []) {
    if (choice.resolution?.type !== 'dice') continue;
    diceChoices += 1;
    const outcomes = choice.resolution.outcomes;
    if (!(outcomes.failure.effects ?? []).length) errors.push(`${event.id}/${choice.id}: Dice failure has no mechanical consequence`);
    if (!(outcomes.criticalFailure.effects ?? []).length) errors.push(`${event.id}/${choice.id}: Dice criticalFailure has no mechanical consequence`);
    if (JSON.stringify(outcomes.failure.effects ?? []) === JSON.stringify(outcomes.criticalFailure.effects ?? [])) {
      errors.push(`${event.id}/${choice.id}: Dice criticalFailure is not mechanically worse/different from failure`);
    }
  }
}
const crewRoles = new Set();
walkObject(events, (node) => {
  if (node.type === 'hasCrewRole') {
    if (!allowedRoles.has(node.roleId)) errors.push(`invalid CrewRole ${node.roleId}`);
    crewRoles.add(node.roleId);
  }
  if (node.type === 'setNpcStatus' && node.status === 'crew') recruitmentEffects += 1;
  if (node.type === 'scheduleEvent') {
    if (!byId.has(node.eventId)) errors.push(`missing Scheduled target ${node.eventId}`);
  }
  if (node.type === 'queueImmediateEvent' && !byId.has(node.eventId)) errors.push(`missing Immediate target ${node.eventId}`);
});
if (recruitmentEffects !== 0) errors.push(`unexpected recruitment effects: ${recruitmentEffects}`);

for (const event of events) {
  for (const choice of event.choices ?? []) {
    for (const outcome of effectsOfChoice(choice)) {
      for (const effect of outcome.effects ?? []) {
        if (effect.type === 'scheduleEvent') scheduleEdges.add(`${event.id}->${effect.eventId}@${effect.delayMonths}`);
      }
    }
  }
}
for (const edge of scheduleEdges) if (!expectedScheduleEdges.has(edge)) errors.push(`unexpected Scheduled edge ${edge}`);
for (const edge of expectedScheduleEdges) if (!scheduleEdges.has(edge)) errors.push(`missing Scheduled edge ${edge}`);

const chainTargets = new Map([
  ['active_paradise_p1_classic_01_cactus_backward_marker', 'active_paradise_p1_classic_01_route_markers_l2_split_pennant'],
  ['active_paradise_p1_classic_01_route_markers_l2_split_pennant', 'active_paradise_p1_classic_01_route_markers_l3_scraped_arrow'],
  ['active_paradise_p1_classic_01_route_markers_l3_scraped_arrow', 'active_paradise_p1_classic_01_route_markers_l4_clean_board'],
]);
for (const [eventId, targetId] of chainTargets) {
  const event = byId.get(eventId);
  for (const choice of event?.choices ?? []) {
    for (const outcome of effectsOfChoice(choice)) {
      const next = (outcome.effects ?? []).filter((effect) => effect.type === 'scheduleEvent');
      if (next.length !== 1 || next[0].eventId !== targetId || next[0].delayMonths !== 2) {
        errors.push(`${eventId}/${choice.id}/${outcome.id}: must schedule only ${targetId} at +2 months`);
      }
    }
  }
}
const terminal = byId.get('active_paradise_p1_classic_01_route_markers_l4_clean_board');
for (const choice of terminal?.choices ?? []) {
  for (const outcome of effectsOfChoice(choice)) {
    if ((outcome.effects ?? []).some((effect) => effect.type === 'scheduleEvent')) errors.push(`${terminal.id}/${choice.id}/${outcome.id}: L4 must be terminal`);
  }
}

const locales = Object.fromEntries(['fr','en'].map((lang) => [lang, JSON.parse(fs.readFileSync(path.join(here, 'localization', `${lang}.patch.json`), 'utf8'))]));
const frKeys = Object.keys(locales.fr).sort();
const enKeys = Object.keys(locales.en).sort();
if (JSON.stringify(frKeys) !== JSON.stringify(enKeys)) errors.push('FR/EN localization key parity mismatch');

for (const [lang, locale] of Object.entries(locales)) {
  walkObject(events, (node) => {
    for (const keyName of ['titleKey','textKey','displayLabelKey']) {
      const key = node[keyName];
      if (typeof key === 'string' && !Object.hasOwn(locale, key)) errors.push(`${lang}: missing localization ${key}`);
    }
  });

  for (const event of events) {
    const body = locale[event.textKey];
    const [bodyMin, bodyMax] = event.kind === 'normal' ? [20,45] : [12,40];
    assertRange(`${lang}:${event.id}:body`, body, bodyMin, bodyMax);
    for (const choice of event.choices ?? []) {
      assertRange(`${lang}:${event.id}:${choice.id}:choice`, locale[choice.textKey], 2, 10);
      for (const outcome of effectsOfChoice(choice)) {
        assertRange(`${lang}:${event.id}:${choice.id}:${outcome.id}:outcome`, locale[outcome.textKey], 5, 25);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  packageValidation: 'PASS',
  files: files.length,
  roots: roots.length,
  diceRoots: diceRoots.length,
  dicePercent: diceRoots.length / roots.length * 100,
  immediate: immediate.length,
  scheduledDescendants: scheduled.length,
  scheduledGraph: 'PASS (L1 -> L2 -> L3 -> L4; 2 months each; L4 terminal)',
  textBudget: 'PASS (FR/EN)',
  localeParity: `PASS (${frKeys.length} keys each)`,
  perStop: Object.fromEntries(Object.entries(manifest.perStop).map(([stop, ids]) => [stop, ids.length])),
  routeGate: 'PASS',
  recruitmentRoots: 0,
  crewRoles: [...crewRoles].sort(),
  forbiddenRuntimeTokens: 'PASS',
  diceStakes: `PASS (${diceChoices} Dice choices; every failure has a consequence)`,
}, null, 2));
