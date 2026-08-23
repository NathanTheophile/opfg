#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(process.argv[2] ?? '.');
const contentRoot = path.join(repo, 'src', 'game', 'content');
if (!fs.existsSync(contentRoot)) throw new Error(`Not an OPFG checkout: ${repo}`);

const sourceEvents = path.join(here, 'events');
const targetEvents = path.join(repo, 'src', 'game', 'content', 'events', 'v2', 'ordinary', 'ACTIVE_PARADISE_P3_WILD_01');
if (fs.existsSync(targetEvents) && fs.readdirSync(targetEvents).length > 0) {
  throw new Error(`Target batch directory already exists and is non-empty: ${targetEvents}`);
}
fs.mkdirSync(targetEvents, { recursive: true });
const eventFiles = fs.readdirSync(sourceEvents).filter((name) => name.endsWith('.json')).sort();
for (const name of eventFiles) {
  const dst = path.join(targetEvents, name);
  if (fs.existsSync(dst)) throw new Error(`Refusing event collision: ${dst}`);
  fs.copyFileSync(path.join(sourceEvents, name), dst);
}

const merged = {};
for (const lang of ['fr', 'en']) {
  const localePath = path.join(repo, 'src', 'game', 'localization', 'locales', `${lang}.json`);
  const patchPath = path.join(here, 'localization', `${lang}.patch.json`);
  const locale = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  const patch = JSON.parse(fs.readFileSync(patchPath, 'utf8'));
  const collisions = Object.keys(patch).filter((key) => Object.hasOwn(locale, key));
  if (collisions.length) throw new Error(`Refusing ${lang} locale collisions: ${collisions.slice(0, 5).join(', ')}`);
  Object.assign(locale, patch);
  fs.writeFileSync(localePath, `${JSON.stringify(locale, null, 2)}\n`, 'utf8');
  merged[lang] = Object.keys(patch).length;
}

console.log(`[ACTIVE_PARADISE_P3_WILD_01] installed ${eventFiles.length} Event JSON files`);
console.log(`[ACTIVE_PARADISE_P3_WILD_01] merged FR=${merged.fr} EN=${merged.en} localization keys`);
console.log('[ACTIVE_PARADISE_P3_WILD_01] next: npm run validate-content && npm test && npm run build');
