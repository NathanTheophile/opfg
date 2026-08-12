#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function fail(message) {
  console.error(`\n[Family Marine L4 priority hotfix] ERROR: ${message}\n`);
  process.exit(1);
}

const rel = 'src/game/content/events/v2/major-tracks/family_marine/family_marine_10_keep_this_quiet.json';
const file = path.join(root, rel);

if (!fs.existsSync(path.join(root, 'package.json'))) fail('Run from OPFG repository root.');
if (!fs.existsSync(file)) fail(`Missing ${rel}. Apply the Layer-4 batch first.`);

const event = JSON.parse(fs.readFileSync(file, 'utf8'));

if (event.id !== 'family_marine_10_keep_this_quiet') {
  fail(`Unexpected Event ID in ${rel}: ${event.id}`);
}

if (!event.majorTrack || event.majorTrack.chapterId !== 'childhood_04') {
  fail(`${rel} does not look like the generated Layer-4 Major root.`);
}

/*
C4A is the direct, exact callback to:
  family_marine_07_bad_order_i03_father_answer -> questions_justice

X4 is the broader cross-pyramid ideological node and has priority 25.

The original batch accidentally made C4A priority 20 while both nodes matched
questions_justice, so X4 deterministically stole the more specific continuation.

Fix:
- C4A priority 30: exact History continuation outranks broad crossing.
- C4A eligibility narrows to questions_justice.
  asks_man_not_marine remains available to X4, preserving C3A -> X4 as a real route.
*/
event.majorTrack.selectionPriority = 30;

const expectedOld = {
  type: 'all',
  conditions: [
    { type: 'originParentPresent', role: 'father' },
    {
      type: 'any',
      conditions: [
        {
          type: 'hasOutcome',
          eventId: 'family_marine_07_bad_order_i03_father_answer',
          outcomeId: 'questions_justice',
        },
        {
          type: 'hasOutcome',
          eventId: 'family_marine_07_bad_order_i03_father_answer',
          outcomeId: 'asks_man_not_marine',
        },
      ],
    },
  ],
};

const expectedNew = {
  type: 'all',
  conditions: [
    { type: 'originParentPresent', role: 'father' },
    {
      type: 'hasOutcome',
      eventId: 'family_marine_07_bad_order_i03_father_answer',
      outcomeId: 'questions_justice',
    },
  ],
};

const currentEligibility = JSON.stringify(event.eligibility);
if (currentEligibility === JSON.stringify(expectedNew) && event.majorTrack.selectionPriority === 30) {
  console.log('SKIP  C4A priority/eligibility already fixed');
  process.exit(0);
}

if (currentEligibility !== JSON.stringify(expectedOld)) {
  fail('C4A eligibility differs from the generated Layer-4 version; refusing to overwrite.');
}

event.eligibility = expectedNew;
fs.writeFileSync(file, JSON.stringify(event, null, 2) + '\n', 'utf8');

console.log('PATCH family_marine_10_keep_this_quiet');
console.log('  selectionPriority: 20 -> 30');
console.log('  eligibility: questions_justice only');
console.log('  asks_man_not_marine remains routed to broad X4');
console.log('\nNo test expectation or engine behavior changed.');
