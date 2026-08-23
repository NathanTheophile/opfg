#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const CHECK = process.argv.includes('--check');
const batchDir = resolve('docs/content/events/v2/batches/ACTIVE_GENERIC_SEA_04_NAV_HAZARD');

for (const lang of ['fr', 'en']) {
  const localePath = resolve(`src/game/localization/locales/${lang}.json`);
  const snippetPath = resolve(batchDir, `localization.${lang}.json`);
  const [localeRaw, snippetRaw] = await Promise.all([
    readFile(localePath, 'utf8'),
    readFile(snippetPath, 'utf8'),
  ]);

  const locale = JSON.parse(localeRaw);
  const snippet = JSON.parse(snippetRaw);
  const collisions = Object.keys(snippet).filter((key) => Object.prototype.hasOwnProperty.call(locale, key));

  if (collisions.length > 0) {
    throw new Error(`[${lang}] localization collision(s): ${collisions.slice(0, 10).join(', ')}`);
  }

  if (CHECK) {
    console.log(`[${lang}] ${Object.keys(snippet).length} keys ready; no collisions.`);
    continue;
  }

  const merged = { ...locale, ...snippet };
  await writeFile(localePath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  console.log(`[${lang}] merged ${Object.keys(snippet).length} keys.`);
}
