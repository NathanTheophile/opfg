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
OPFG Event Batch Integrator v3

Usage:
  node tools/integrate-event-batch.mjs [options] <batch-dir-or-zip> [more batches...]

Options:
  --repo <path>       OPFG repo root. Defaults to auto-detection from cwd.
  --phase <phase>     Force destination phase for every batch:
                      origins | childhood | active | system
  --dry-run           Validate and print the integration plan without writing.
  --skip-docs         Do not copy MANIFEST.md / PROPOSED_DEFINITIONS.md.
  --skip-index        Do not update EVENT_CONCEPT_INDEX.md.
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
  - EVENT_CONCEPT_INDEX.md is updated from each batch MANIFEST + root localization
  - only pass reviewed/accepted batches: integration records them as accepted in the index
`);
}

let repoArg = null;
let forcedPhase = null;
let dryRun = false;
let skipDocs = false;
let skipIndex = false;
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
  if (arg === '--skip-index') {
    skipIndex = true;
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
const conceptIndexPath = join(repoRoot, 'docs', 'content', 'events', 'EVENT_CONCEPT_INDEX.md');

if (!existsSync(targetFrPath)) fail(`Missing target localization file: ${targetFrPath}`);
if (!existsSync(eventsRoot)) fail(`Missing events root: ${eventsRoot}`);
if (!skipIndex && !existsSync(conceptIndexPath)) fail(`Missing Event Concept Index: ${conceptIndexPath}`);

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


function stripInlineMarkdown(value) {
  return String(value ?? '')
    .replaceAll('**', '')
    .replaceAll('`', '')
    .trim();
}

function escapeMarkdownCell(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replaceAll('|', '\\|')
    .trim();
}

function sectionByHeading(text, predicate) {
  const matches = [...text.matchAll(/^##\s+(.+)$/gm)];
  for (let i = 0; i < matches.length; i += 1) {
    const heading = matches[i][1].trim();
    if (!predicate(heading)) continue;
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    return { heading, start, end, content: text.slice(start, end) };
  }
  return null;
}

function parseMarkdownTable(sectionContent) {
  const lines = sectionContent.split(/\r?\n/);
  const tableLines = lines.filter((line) => line.trim().startsWith('|'));
  if (tableLines.length < 2) return null;

  const split = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
  const headers = split(tableLines[0]);
  const rows = tableLines.slice(2).map(split).filter((row) => row.some((cell) => cell.length > 0));
  return { headers, rows };
}

function headerIndex(headers, aliases) {
  const normalized = headers.map((header) => stripInlineMarkdown(header).toLowerCase());
  for (const alias of aliases) {
    const index = normalized.indexOf(alias.toLowerCase());
    if (index >= 0) return index;
  }
  return -1;
}

function inferBatchIdFromManifest(manifestText, fallback) {
  const match = manifestText?.match(/\*\*Batch ID:\*\*\s*`([^`]+)`/i);
  return match?.[1] || fallback;
}

function inferContentDomain(batchId, phase) {
  const id = batchId.toUpperCase();
  if (id.startsWith('CH_GENERIC_')) return 'generic';
  if (id.startsWith('CH_FAMILY_SOCIAL_')) return 'family_social';
  if (id.startsWith('CH_IDENTITY_WORLD_')) return 'identity_world';
  if (id.startsWith('CH_EAST_BLUE_')) return 'east_blue';
  if (id.startsWith('CH_WEST_BLUE_')) return 'west_blue';
  if (id.startsWith('CH_NORTH_BLUE_')) return 'north_blue';
  if (id.startsWith('CH_SOUTH_BLUE_')) return 'south_blue';

  const withoutSerial = batchId.toLowerCase().replace(/_\d+$/, '');
  const withoutPhase = withoutSerial.replace(/^(ch|childhood|active|origin|origins|system)_/, '');
  return withoutPhase || phase;
}

function rootRegistryFromManifest(manifestText) {
  const section = sectionByHeading(manifestText, (heading) => {
    const normalized = heading.toUpperCase().replaceAll('_', ' ');
    return normalized === 'ROOT REGISTRY' || normalized === 'ROOT REGISTER';
  });
  if (!section) return null;

  const table = parseMarkdownTable(section.content);
  if (!table) return null;

  const rootIndex = headerIndex(table.headers, ['Root ID', 'Root']);
  const conceptIndex = headerIndex(table.headers, ['conceptKey']);
  const ageIndex = headerIndex(table.headers, ['Âge', "Tranche d’âge", "Tranche d'âge", 'Age']);
  const contextIndex = headerIndex(table.headers, ['Contexte principal', 'Primary context']);
  if ([rootIndex, conceptIndex, ageIndex, contextIndex].some((index) => index < 0)) return null;

  return table.rows.map((row) => ({
    rootId: stripInlineMarkdown(row[rootIndex]),
    conceptKey: stripInlineMarkdown(row[conceptIndex]),
    ageBand: stripInlineMarkdown(row[ageIndex]),
    primaryContext: stripInlineMarkdown(row[contextIndex]),
  }));
}

function parseSignatureArcs(manifestText) {
  const section = sectionByHeading(manifestText, (heading) => heading.toUpperCase() === 'SIGNATURE_IMMEDIATE_ARCS');
  if (!section) return [];

  const rootMatches = [...section.content.matchAll(/\*\*Root ID:\*\*\s*`([^`]+)`/gi)];
  return rootMatches.map((match, index) => {
    const blockStart = match.index;
    const blockEnd = index + 1 < rootMatches.length ? rootMatches[index + 1].index : section.content.length;
    const block = section.content.slice(blockStart, blockEnd);
    const arcKey = block.match(/\*\*arcKey:\*\*\s*`([^`]+)`/i)?.[1];
    const depth = block.match(/\*\*(?:Maximum reachable Immediate depth|Profondeur Immediate maximale atteignable):\*\*\s*\*\*(\d+)\*\*/i)?.[1];
    const premise = block.match(/\*\*(?:Premise|Prémisse):\*\*\s*(.+)/i)?.[1]?.trim();
    return { rootId: match[1], arcKey, depth: depth ? Number(depth) : null, premise };
  });
}

function parseSecondaryArcs(manifestText) {
  const section = sectionByHeading(manifestText, (heading) => heading.toUpperCase() === 'SECONDARY_IMMEDIATE_ARCS');
  if (!section) return [];

  const result = [];
  for (const rawLine of section.content.split(/\r?\n/)) {
    if (!rawLine.trim().startsWith('-')) continue;
    const line = stripInlineMarkdown(rawLine);
    const root = line.match(/^-\s*(?:Root ID:\s*)?([^\s]+)\s+—/i)?.[1];
    const arcKey = line.match(/arcKey:\s*([^\s]+)\s+—/i)?.[1];
    const depth = line.match(/depth:?\s*(\d+)/i)?.[1];
    const premise = line.match(/depth:?\s*\d+\s+—\s*(.+)$/i)?.[1]?.trim();
    if (root && arcKey && depth) result.push({ rootId: root, arcKey, depth: Number(depth), premise });
  }
  return result;
}

function lifetimeBlocks(manifestText) {
  const section = sectionByHeading(manifestText, (heading) => heading.toUpperCase() === 'LIFETIME_THREADS');
  if (!section) return [];

  // V4/V4.1 manifests in the wild use all of these forms:
  //   ### `seed_id` — `threadKey`
  //   ### seed_id — `threadKey`
  //   ### seed_id — threadKey
  // Be permissive about inline backticks, but strict about ID-shaped tokens.
  const subheads = [...section.content.matchAll(
    /^###\s+`?([A-Za-z0-9_.:-]+)`?\s+(?:—|-)\s+`?([A-Za-z0-9_.:-]+)`?.*$/gm,
  )];
  if (subheads.length > 0) {
    return subheads.map((match, index) => ({
      seedRootId: match[1],
      threadKey: match[2],
      content: section.content.slice(
        match.index + match[0].length,
        index + 1 < subheads.length ? subheads[index + 1].index : section.content.length,
      ),
    }));
  }

  // Legacy/single-thread fallback. Values may or may not be wrapped in backticks.
  const seedRootId = section.content.match(/\*\*Seed root ID:\*\*\s*`?([A-Za-z0-9_.:-]+)`?/i)?.[1];
  const threadKey = section.content.match(/\*\*threadKey:\*\*\s*`?([A-Za-z0-9_.:-]+)`?/i)?.[1];
  return seedRootId && threadKey ? [{ seedRootId, threadKey, content: section.content }] : [];
}

function lifetimeField(block, labels) {
  for (const rawLine of block.split(/\r?\n/)) {
    // V4/V4.1 manifests may emit either "- **Label:** value" or "**Label:** value".
    const line = stripInlineMarkdown(rawLine).replace(/^\s*[-*]\s*/, '').trim();
    if (!line) continue;
    for (const label of labels) {
      const prefix = `${label}:`;
      if (line.toLowerCase().startsWith(prefix.toLowerCase())) return line.slice(prefix.length).trim();
    }
  }
  return null;
}

function parseLifetimeThreads(manifestText) {
  return lifetimeBlocks(manifestText).map((block) => {
    const anchor = lifetimeField(block.content, ['Ancre durable', 'Ancre / NPC récurrent', 'Recurring NPC / anchor']) || '—';
    const depthText = lifetimeField(block.content, ['Longest reachable Scheduled depth']) || '';
    const totalText = lifetimeField(block.content, ['Total distinct reachable Scheduled EventDefinitions', 'Total reachable Scheduled nodes']) || '';
    const divergencesText = lifetimeField(block.content, ['Vrais points de divergence long-terme', 'Meaningful long-term divergence count']) || '';
    const topology = lifetimeField(block.content, ['Topologie', 'Topology']) || 'branching';
    const span = lifetimeField(block.content, ['Span temporel visé', 'Span visé', 'Intended span']) || '—';
    return {
      seedRootId: block.seedRootId,
      threadKey: block.threadKey,
      anchor,
      depth: Number(depthText.match(/\d+/)?.[0] || 0),
      totalNodes: Number(totalText.match(/\d+/)?.[0] || 0),
      divergences: Number(divergencesText.match(/\d+/)?.[0] || 0),
      topology: topology.replace(/[.;]$/, ''),
      span,
    };
  });
}

function indexTableSection(text, headingPrefix) {
  return sectionByHeading(text, (heading) => heading.startsWith(headingPrefix));
}

function appendIndexRows(text, headingPrefix, rows, keyColumnIndex, conflicts) {
  if (rows.length === 0) return { text, added: 0, skipped: 0 };
  const section = indexTableSection(text, headingPrefix);
  if (!section) {
    conflicts.push(`EVENT_CONCEPT_INDEX.md missing section "${headingPrefix}".`);
    return { text, added: 0, skipped: 0 };
  }

  const lines = section.content.split(/\r?\n/);
  const firstTable = lines.findIndex((line) => line.trim().startsWith('|'));
  if (firstTable < 0 || firstTable + 1 >= lines.length) {
    conflicts.push(`EVENT_CONCEPT_INDEX.md section "${headingPrefix}" has no markdown table.`);
    return { text, added: 0, skipped: 0 };
  }

  let lastTable = firstTable + 1;
  while (lastTable + 1 < lines.length && lines[lastTable + 1].trim().startsWith('|')) lastTable += 1;

  const existingRows = lines.slice(firstTable + 2, lastTable + 1)
    .filter((line) => line.trim().startsWith('|'))
    .map((line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => stripInlineMarkdown(cell)));

  let added = 0;
  let skipped = 0;
  const newLines = [];

  for (const row of rows) {
    const clean = row.map((cell) => escapeMarkdownCell(cell));
    const key = stripInlineMarkdown(clean[keyColumnIndex]);
    const existing = existingRows.find((candidate) => stripInlineMarkdown(candidate[keyColumnIndex]) === key);
    if (existing) {
      const same = existing.length === clean.length && existing.every((cell, index) => stripInlineMarkdown(cell) === stripInlineMarkdown(clean[index]));
      if (same) skipped += 1;
      else conflicts.push(`EVENT_CONCEPT_INDEX.md already contains "${key}" with different metadata in section "${headingPrefix}".`);
      continue;
    }
    existingRows.push(clean);
    newLines.push(`| ${clean.join(' | ')} |`);
    added += 1;
  }

  if (newLines.length > 0) {
    lines.splice(lastTable + 1, 0, ...newLines);
    const noneIndex = lines.findIndex((line) => /_None accepted yet\._|_Aucun.*accept|_No production batch is currently accepted/i.test(line.trim()));
    if (noneIndex >= 0) lines.splice(noneIndex, 1);
  }

  const newSectionContent = lines.join('\n');
  return {
    text: text.slice(0, section.start) + newSectionContent + text.slice(section.end),
    added,
    skipped,
  };
}

function removeFromRegenerationScope(text, batchIds) {
  const section = sectionByHeading(text, (heading) => heading.toUpperCase() === 'REGENERATION SCOPE');
  if (!section) return text;
  const lines = section.content.split(/\r?\n/);
  const wanted = new Set(batchIds);
  const filtered = lines.filter((line) => {
    const match = line.match(/^\s*-\s*`([^`]+)`\s*$/);
    return !(match && wanted.has(match[1]));
  });
  const remainingBatchBullets = filtered.filter((line) => /^\s*-\s*`[^`]+`\s*$/.test(line));
  if (remainingBatchBullets.length === 0 && !filtered.some((line) => /_No batches currently scheduled for regeneration\._/.test(line))) {
    const insertAt = filtered.findIndex((line) => line.trim().startsWith('Do not copy'));
    filtered.splice(insertAt >= 0 ? insertAt : filtered.length, 0, '_No batches currently scheduled for regeneration._', '');
  }
  return text.slice(0, section.start) + filtered.join('\n') + text.slice(section.end);
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
  const manifestPath = join(root, 'MANIFEST.md');
  const manifestText = existsSync(manifestPath) ? readFileSync(manifestPath, 'utf8') : null;
  const batchId = inferBatchIdFromManifest(manifestText, basename(root));
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
    manifestPath,
    manifestText,
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


let plannedIndexText = null;
let indexRowsAdded = 0;
let indexRowsSkipped = 0;

if (!skipIndex) {
  plannedIndexText = readFileSync(conceptIndexPath, 'utf8');

  const rootRows = [];
  const signatureRows = [];
  const secondaryRows = [];
  const lifetimeRows = [];

  for (const batch of batches) {
    if (!batch.manifestText) {
      conflicts.push(`${batch.batchId}: MANIFEST.md is required for automatic EVENT_CONCEPT_INDEX.md update. Use --skip-index to bypass.`);
      continue;
    }

    const rootRegistry = rootRegistryFromManifest(batch.manifestText);
    if (!rootRegistry || rootRegistry.length === 0) {
      conflicts.push(`${batch.batchId}: could not parse ROOT_REGISTRY / ROOT REGISTER from MANIFEST.md.`);
      continue;
    }

    const batchEvents = new Map();
    for (const eventPath of batch.eventFiles) {
      const event = parseJsonFile(eventPath).value;
      if (event?.id) batchEvents.set(event.id, event);
    }

    const domain = inferContentDomain(batch.batchId, batch.phase);
    for (const root of rootRegistry) {
      const event = batchEvents.get(root.rootId);
      if (!event) {
        conflicts.push(`${batch.batchId}: root "${root.rootId}" from MANIFEST is missing from events/.`);
        continue;
      }
      const premise = batch.localization[event.textKey] || batch.localization[`event.${root.rootId}.text`] || event.textKey;
      rootRows.push([
        batch.batchId,
        `\`${root.rootId}\``,
        `\`${root.conceptKey}\``,
        root.ageBand,
        domain,
        root.primaryContext,
        premise,
      ]);
    }

    for (const arc of parseSignatureArcs(batch.manifestText)) {
      if (!arc.arcKey || !arc.depth || !arc.premise) {
        conflicts.push(`${batch.batchId}: incomplete Signature Immediate Arc metadata for root "${arc.rootId}".`);
        continue;
      }
      signatureRows.push([batch.batchId, `\`${arc.rootId}\``, `\`${arc.arcKey}\``, String(arc.depth), arc.premise]);
    }

    for (const arc of parseSecondaryArcs(batch.manifestText)) {
      secondaryRows.push([batch.batchId, `\`${arc.rootId}\``, `\`${arc.arcKey}\``, String(arc.depth), arc.premise || '—']);
    }

    const lifetimeSeeds = [...batchEvents.values()]
      .filter((event) => event?.kind === 'normal' && event?.lifetimeThreadSeed === true)
      .map((event) => event.id)
      .sort();
    const parsedLifetimeThreads = parseLifetimeThreads(batch.manifestText);
    const parsedLifetimeBySeed = new Map();

    for (const thread of parsedLifetimeThreads) {
      if (parsedLifetimeBySeed.has(thread.seedRootId)) {
        conflicts.push(`${batch.batchId}: duplicate Lifetime Thread metadata for seed "${thread.seedRootId}".`);
        continue;
      }
      parsedLifetimeBySeed.set(thread.seedRootId, thread);
    }

    // Never silently accept a batch whose JSON contains Lifetime seeds but whose
    // MANIFEST parser failed to surface them into EVENT_CONCEPT_INDEX.md.
    for (const seedId of lifetimeSeeds) {
      if (!parsedLifetimeBySeed.has(seedId)) {
        conflicts.push(
          `${batch.batchId}: Event "${seedId}" has lifetimeThreadSeed=true but MANIFEST Lifetime metadata was not parsed. ` +
          'Index update would be incomplete; fix the MANIFEST/parser or use --skip-index intentionally.',
        );
      }
    }

    for (const thread of parsedLifetimeThreads) {
      const rootEvent = batchEvents.get(thread.seedRootId);
      if (!rootEvent) {
        conflicts.push(`${batch.batchId}: Lifetime Thread seed "${thread.seedRootId}" from MANIFEST is missing from events/.`);
        continue;
      }
      if (rootEvent.kind !== 'normal' || rootEvent.lifetimeThreadSeed !== true) {
        conflicts.push(`${batch.batchId}: MANIFEST Lifetime seed "${thread.seedRootId}" is not a Normal Event with lifetimeThreadSeed=true.`);
        continue;
      }
      if (!thread.depth || !thread.totalNodes || !thread.divergences) {
        conflicts.push(`${batch.batchId}: incomplete Lifetime Thread metrics for seed "${thread.seedRootId}".`);
        continue;
      }
      const premise = batch.localization[rootEvent.textKey] || batch.localization[`event.${thread.seedRootId}.text`] || rootEvent.textKey;
      lifetimeRows.push([
        batch.batchId,
        `\`${thread.seedRootId}\``,
        `\`${thread.threadKey}\``,
        thread.anchor,
        String(thread.depth),
        String(thread.totalNodes),
        String(thread.divergences),
        `\`${thread.topology}\``,
        thread.span,
        premise,
      ]);
    }
  }

  for (const [heading, rows, keyColumn] of [
    ['Accepted root concepts', rootRows, 1],
    ['Accepted Signature Immediate Arcs', signatureRows, 1],
    ['Accepted Secondary Immediate Arcs', secondaryRows, 1],
    ['Accepted Lifetime Threads', lifetimeRows, 1],
  ]) {
    const result = appendIndexRows(plannedIndexText, heading, rows, keyColumn, conflicts);
    plannedIndexText = result.text;
    indexRowsAdded += result.added;
    indexRowsSkipped += result.skipped;
  }

  plannedIndexText = removeFromRegenerationScope(plannedIndexText, batches.map((batch) => batch.batchId));
  if (indexRowsAdded > 0) {
    plannedIndexText = plannedIndexText.replace(
      '> **Status: regeneration baseline after Lifetime Thread authoring-contract revision.**',
      '> **Status: active accepted-content ledger under the current Lifetime Thread authoring contract.**',
    );
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
console.log(`Concept Index rows to add:   ${indexRowsAdded}`);
console.log(`Concept Index rows skipped:  ${indexRowsSkipped}`);
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

  if (!skipIndex && plannedIndexText !== null) {
    atomicWrite(conceptIndexPath, plannedIndexText.endsWith('\n') ? plannedIndexText : `${plannedIndexText}\n`);
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
