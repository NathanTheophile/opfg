#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
  renameSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);

function fail(message) {
  console.error(`\nERROR: ${message}\n`);
  process.exit(1);
}

function usage() {
  console.log(`
OPFG Event Batch Integrator

Usage:
  node tools/integrate-event-batch.mjs [options] <batch-dir-or-zip> [more batches...]

Options:
  --repo <path>       OPFG repo root. Defaults to auto-detection from cwd.
  --phase <phase>     Force destination phase for every batch:
                      origins | childhood | active | system
  --dry-run           Validate and print the integration plan without writing.
  --skip-docs         Do not copy MANIFEST.md / PROPOSED_DEFINITIONS.md.
  -h, --help          Show this help.

Examples:
  node tools/integrate-event-batch.mjs C:\\Temp\\CH_GENERIC_EARLY_01_GPTSources.zip
  node tools/integrate-event-batch.mjs C:\\Temp\\CH_GENERIC_EARLY_01 C:\\Temp\\CH_GENERIC_LATE_01
  node tools/integrate-event-batch.mjs --dry-run C:\\Temp\\CH_GENERIC_EARLY_01.zip C:\\Temp\\CH_GENERIC_LATE_01.zip

Behavior:
  - Events are copied flat into src/game/content/events/<phase>/
  - localization/fr.json is merged into src/game/localization/locales/fr.json
  - identical existing localization keys are skipped
  - conflicting localization keys stop the whole integration before writes
  - duplicate/conflicting Event IDs stop the whole integration before writes
  - batch docs are copied to docs/content/events/batches/<BATCH_ID>/
`);
}

let repoArg = null;
let forcedPhase = null;
let dryRun = false;
let skipDocs = false;
const inputs = [];

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '-h' || arg === '--help') {
    usage();
    process.exit(0);
  }
  if (arg === '--dry-run') {
    dryRun = true;
    continue;
  }
  if (arg === '--skip-docs') {
    skipDocs = true;
    continue;
  }
  if (arg === '--repo') {
    repoArg = args[++i];
    if (!repoArg) fail('--repo requires a path.');
    continue;
  }
  if (arg === '--phase') {
    forcedPhase = args[++i];
    if (!forcedPhase) fail('--phase requires a value.');
    continue;
  }
  if (arg.startsWith('-')) fail(`Unknown option: ${arg}`);
  inputs.push(arg);
}

if (inputs.length === 0) {
  usage();
  fail('Provide at least one batch directory or ZIP.');
}

const allowedPhases = new Set(['origins', 'childhood', 'active', 'system']);
if (forcedPhase && !allowedPhases.has(forcedPhase)) {
  fail(`Invalid phase "${forcedPhase}". Expected origins, childhood, active, or system.`);
}

function parseJsonFile(path, label = path) {
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (error) {
    fail(`Cannot read ${label}: ${error.message}`);
  }
  try {
    return { raw, value: JSON.parse(raw) };
  } catch (error) {
    fail(`Invalid JSON in ${label}: ${error.message}`);
  }
}

function findRepoRoot(start) {
  let current = resolve(start);
  while (true) {
    const packagePath = join(current, 'package.json');
    if (existsSync(packagePath)) {
      try {
        const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
        if (pkg?.name === 'jam-op-fan-game') return current;
      } catch {
        // Keep walking.
      }
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

const repoRoot = repoArg ? resolve(repoArg) : findRepoRoot(process.cwd());
if (!repoRoot) {
  fail('Could not auto-detect the OPFG repo. Run from inside the repo or pass --repo <path>.');
}

const targetFrPath = join(repoRoot, 'src', 'game', 'localization', 'locales', 'fr.json');
const eventsRoot = join(repoRoot, 'src', 'game', 'content', 'events');
const batchDocsRoot = join(repoRoot, 'docs', 'content', 'events', 'batches');

if (!existsSync(targetFrPath)) fail(`Missing target localization file: ${targetFrPath}`);
if (!existsSync(eventsRoot)) fail(`Missing events root: ${eventsRoot}`);

const cleanupPaths = [];

function powershellQuote(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function extractZip(zipPath) {
  const temp = mkdtempSync(join(tmpdir(), 'opfg-batch-'));
  cleanupPaths.push(temp);

  let result;
  if (process.platform === 'win32') {
    const command =
      `Expand-Archive -LiteralPath ${powershellQuote(zipPath)} ` +
      `-DestinationPath ${powershellQuote(temp)} -Force`;
    result = spawnSync(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command', command],
      { encoding: 'utf8' },
    );
  } else {
    result = spawnSync('unzip', ['-q', zipPath, '-d', temp], { encoding: 'utf8' });
  }

  if (result.error || result.status !== 0) {
    rmSync(temp, { recursive: true, force: true });
    const detail = result.error?.message || result.stderr || `exit ${result.status}`;
    fail(
      `Could not extract ZIP "${zipPath}". ${detail}\n` +
      'Extract it manually and pass the extracted batch directory instead.',
    );
  }

  return temp;
}

function isBatchRoot(path) {
  return (
    existsSync(join(path, 'events')) &&
    existsSync(join(path, 'localization', 'fr.json'))
  );
}

function normalizeBatchRoot(inputPath) {
  let root = resolve(inputPath);

  if (!existsSync(root)) fail(`Input does not exist: ${root}`);

  if (statSync(root).isFile()) {
    if (extname(root).toLowerCase() !== '.zip') {
      fail(`Input file is not a ZIP: ${root}`);
    }
    root = extractZip(root);
  }

  if (!statSync(root).isDirectory()) fail(`Input is not a directory: ${root}`);
  if (isBatchRoot(root)) return root;

  const children = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, entry.name));

  const candidates = children.filter(isBatchRoot);
  if (candidates.length === 1) return candidates[0];

  fail(
    `Could not identify a single batch root inside "${root}". ` +
    'Expected events/ and localization/fr.json.',
  );
}

function inferPhase(batchId) {
  const id = batchId.toUpperCase();
  if (id.startsWith('CH_') || id.startsWith('CHILDHOOD_')) return 'childhood';
  if (id.startsWith('ACTIVE_')) return 'active';
  if (id.startsWith('ORIGIN_') || id.startsWith('ORIGINS_')) return 'origins';
  if (id.startsWith('SYSTEM_')) return 'system';
  return null;
}

function walkJsonFiles(root) {
  if (!existsSync(root)) return [];
  const result = [];
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) result.push(full);
    }
  }

  return result.sort();
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function semanticJson(value) {
  return JSON.stringify(canonicalize(value));
}

function filesSameText(a, b) {
  return readFileSync(a, 'utf8') === readFileSync(b, 'utf8');
}

function atomicWrite(path, text) {
  mkdirSync(dirname(path), { recursive: true });
  const tempPath = `${path}.opfg-integrator-tmp`;
  writeFileSync(tempPath, text, 'utf8');
  renameSync(tempPath, path);
}

const targetFr = parseJsonFile(targetFrPath, targetFrPath).value;
if (!targetFr || Array.isArray(targetFr) || typeof targetFr !== 'object') {
  fail(`Target localization must be a flat JSON object: ${targetFrPath}`);
}

const existingEventsById = new Map();
for (const filePath of walkJsonFiles(eventsRoot)) {
  const { value } = parseJsonFile(filePath);
  if (!value || typeof value.id !== 'string') continue;

  if (existingEventsById.has(value.id)) {
    fail(
      `Repository already contains duplicate Event ID "${value.id}":\n` +
      `  ${existingEventsById.get(value.id).path}\n  ${filePath}`,
    );
  }
  existingEventsById.set(value.id, {
    path: filePath,
    semantic: semanticJson(value),
  });
}

const batches = inputs.map((input) => {
  const root = normalizeBatchRoot(input);
  const batchId = basename(root);
  const phase = forcedPhase || inferPhase(batchId);
  if (!phase) {
    fail(
      `Cannot infer phase for batch "${batchId}". ` +
      'Use --phase origins|childhood|active|system.',
    );
  }

  const eventsDir = join(root, 'events');
  const localizationPath = join(root, 'localization', 'fr.json');
  const eventFiles = readdirSync(eventsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
    .map((entry) => join(eventsDir, entry.name))
    .sort();

  if (eventFiles.length === 0) fail(`Batch ${batchId} contains no Event JSON files.`);

  const localization = parseJsonFile(localizationPath, `${batchId}/localization/fr.json`).value;
  if (!localization || Array.isArray(localization) || typeof localization !== 'object') {
    fail(`${batchId}/localization/fr.json must be a flat JSON object.`);
  }

  return {
    batchId,
    root,
    phase,
    eventFiles,
    localization,
    manifestPath: join(root, 'MANIFEST.md'),
    proposalsPath: join(root, 'PROPOSED_DEFINITIONS.md'),
  };
});

const conflicts = [];
const incomingEventsById = new Map();
const plannedEventCopies = [];
let identicalEventsSkipped = 0;

for (const batch of batches) {
  const destinationDir = join(eventsRoot, batch.phase);

  for (const sourcePath of batch.eventFiles) {
    const fileName = basename(sourcePath);
    const { value } = parseJsonFile(sourcePath, `${batch.batchId}/events/${fileName}`);

    if (!value || typeof value.id !== 'string' || value.id.length === 0) {
      conflicts.push(`${batch.batchId}/${fileName}: missing string Event id.`);
      continue;
    }

    if (fileName !== `${value.id}.json`) {
      conflicts.push(
        `${batch.batchId}/${fileName}: filename must match Event id "${value.id}.json".`,
      );
      continue;
    }

    const semantic = semanticJson(value);

    const incomingExisting = incomingEventsById.get(value.id);
    if (incomingExisting) {
      if (incomingExisting.semantic !== semantic) {
        conflicts.push(
          `Incoming Event ID conflict "${value.id}":\n` +
          `  ${incomingExisting.sourcePath}\n  ${sourcePath}`,
        );
      } else {
        identicalEventsSkipped += 1;
      }
      continue;
    }

    incomingEventsById.set(value.id, { semantic, sourcePath });

    const repoExisting = existingEventsById.get(value.id);
    if (repoExisting) {
      if (repoExisting.semantic === semantic) {
        identicalEventsSkipped += 1;
        continue;
      }
      conflicts.push(
        `Event ID "${value.id}" already exists with different content:\n` +
        `  repo: ${repoExisting.path}\n  batch: ${sourcePath}`,
      );
      continue;
    }

    const destinationPath = join(destinationDir, fileName);
    if (existsSync(destinationPath)) {
      const existing = parseJsonFile(destinationPath).value;
      if (semanticJson(existing) === semantic) {
        identicalEventsSkipped += 1;
        continue;
      }
      conflicts.push(
        `Destination Event file already exists with different content:\n` +
        `  ${destinationPath}`,
      );
      continue;
    }

    plannedEventCopies.push({
      batchId: batch.batchId,
      sourcePath,
      destinationPath,
      eventId: value.id,
    });
  }
}

const mergedFr = { ...targetFr };
const incomingLocalizationSeen = new Map();
let localizationAdded = 0;
let localizationIdenticalSkipped = 0;

for (const batch of batches) {
  for (const [key, value] of Object.entries(batch.localization)) {
    const incomingExisting = incomingLocalizationSeen.get(key);
    if (incomingExisting) {
      if (incomingExisting.value !== value) {
        conflicts.push(
          `Incoming localization conflict for "${key}":\n` +
          `  ${incomingExisting.batchId}: ${JSON.stringify(incomingExisting.value)}\n` +
          `  ${batch.batchId}: ${JSON.stringify(value)}`,
        );
      } else {
        localizationIdenticalSkipped += 1;
      }
      continue;
    }

    incomingLocalizationSeen.set(key, { value, batchId: batch.batchId });

    if (Object.prototype.hasOwnProperty.call(mergedFr, key)) {
      if (mergedFr[key] === value) {
        localizationIdenticalSkipped += 1;
      } else {
        conflicts.push(
          `Localization key "${key}" already exists with different text:\n` +
          `  repo:  ${JSON.stringify(mergedFr[key])}\n` +
          `  batch: ${JSON.stringify(value)} (${batch.batchId})`,
        );
      }
      continue;
    }

    mergedFr[key] = value;
    localizationAdded += 1;
  }
}

const plannedDocs = [];
let identicalDocsSkipped = 0;

if (!skipDocs) {
  for (const batch of batches) {
    const docs = [
      ['MANIFEST.md', batch.manifestPath],
      ['PROPOSED_DEFINITIONS.md', batch.proposalsPath],
    ];

    for (const [name, sourcePath] of docs) {
      if (!existsSync(sourcePath)) continue;
      const destinationPath = join(batchDocsRoot, batch.batchId, name);

      if (existsSync(destinationPath)) {
        if (filesSameText(sourcePath, destinationPath)) {
          identicalDocsSkipped += 1;
          continue;
        }
        conflicts.push(
          `Batch doc already exists with different content:\n  ${destinationPath}`,
        );
        continue;
      }

      plannedDocs.push({ sourcePath, destinationPath });
    }
  }
}

if (conflicts.length > 0) {
  console.error('\nINTEGRATION BLOCKED — conflicts found:\n');
  conflicts.forEach((conflict, index) => {
    console.error(`${index + 1}. ${conflict}\n`);
  });
  cleanupPaths.forEach((path) => rmSync(path, { recursive: true, force: true }));
  process.exit(2);
}

console.log('\nOPFG Event Batch Integrator');
console.log('===========================');
console.log(`Repo: ${repoRoot}`);
console.log(`Mode: ${dryRun ? 'DRY RUN' : 'WRITE'}\n`);

for (const batch of batches) {
  console.log(`- ${batch.batchId} -> ${batch.phase}`);
}

console.log('\nPlan');
console.log(`Events to copy:              ${plannedEventCopies.length}`);
console.log(`Identical Events skipped:    ${identicalEventsSkipped}`);
console.log(`Localization keys to add:    ${localizationAdded}`);
console.log(`Identical loc keys skipped:  ${localizationIdenticalSkipped}`);
console.log(`Batch docs to copy:          ${plannedDocs.length}`);
console.log(`Identical docs skipped:      ${identicalDocsSkipped}`);
console.log('Conflicts:                   0');

if (!dryRun) {
  for (const item of plannedEventCopies) {
    mkdirSync(dirname(item.destinationPath), { recursive: true });
    cpSync(item.sourcePath, item.destinationPath);
  }

  for (const item of plannedDocs) {
    mkdirSync(dirname(item.destinationPath), { recursive: true });
    cpSync(item.sourcePath, item.destinationPath);
  }

  if (localizationAdded > 0) {
    atomicWrite(targetFrPath, `${JSON.stringify(mergedFr, null, 2)}\n`);
  }

  console.log('\nINTEGRATION COMPLETE');
} else {
  console.log('\nDRY RUN OK — no files written.');
}

console.log('\nRecommended next commands:');
console.log('  npm run validate-content');
console.log('  npm test');
console.log('  npm run build');
console.log('  npm run simulate');

cleanupPaths.forEach((path) => rmSync(path, { recursive: true, force: true }));
