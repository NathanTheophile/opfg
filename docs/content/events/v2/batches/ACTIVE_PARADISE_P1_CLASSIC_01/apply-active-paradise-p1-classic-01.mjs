#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = process.cwd();
const srcEvents = path.join(here, 'events');
const destEvents = path.join(repo, 'src/game/content/events/v2/ordinary/ACTIVE_PARADISE_P1_CLASSIC_01');
const localeDir = path.join(repo, 'src/game/localization/locales');
const schemaPath = path.join(repo,'src/game/content/schema.ts');
const catalogPath = path.join(repo,'src/game/content/catalogFactory.ts');
const required = [schemaPath, catalogPath, path.join(localeDir,'fr.json'), path.join(localeDir,'en.json')];
for (const p of required) if (!fs.existsSync(p)) throw new Error(`Run from OPFG repository root; missing ${p}`);
const schema = fs.readFileSync(schemaPath, 'utf8');
for (const token of ["CONTENT_SCHEMA_VERSION = 16", "scheduledReach", "cancelIf"]) {
  if (!schema.includes(token)) throw new Error(`Current schema no longer matches expected Wave 3 contract token: ${token}`);
}
const catalogFactory = fs.readFileSync(catalogPath, 'utf8');
for (const roleId of ['navigator','medic','shipwright','recruiter','first_mate','helmsman','cook','musician','scholar','foreman']) {
  if (!catalogFactory.includes(roleId)) throw new Error(`Current CrewRole catalogue is missing expected role: ${roleId}`);
}
for (const removedRoleId of ['gunner','fighter','quartermaster']) {
  if (catalogFactory.includes(`'${removedRoleId}'`) || catalogFactory.includes(`"${removedRoleId}"`)) throw new Error(`Removed CrewRole is present in current catalogue: ${removedRoleId}`);
}
const eventNames = fs.readdirSync(srcEvents).filter(x=>x.endsWith('.json'));
if (fs.existsSync(destEvents) && fs.readdirSync(destEvents).length) throw new Error(`Destination already exists and is non-empty: ${destEvents}`);

// Full preflight before touching the repository.
const localeWrites = [];
for (const lang of ['fr','en']) {
  const target = path.join(localeDir,`${lang}.json`);
  const patch = JSON.parse(fs.readFileSync(path.join(here,'localization',`${lang}.patch.json`),'utf8'));
  const data = JSON.parse(fs.readFileSync(target,'utf8'));
  const collisions = Object.keys(patch).filter(k=>Object.hasOwn(data,k));
  if (collisions.length) throw new Error(`${lang}: localization collisions: ${collisions.slice(0,10).join(', ')}`);
  localeWrites.push({ target, data: { ...data, ...patch } });
}
for (const name of eventNames) {
  const dest = path.join(destEvents,name);
  if (fs.existsSync(dest)) throw new Error(`Refusing to overwrite ${dest}`);
}

fs.mkdirSync(destEvents, { recursive: true });
for (const name of eventNames) fs.copyFileSync(path.join(srcEvents,name), path.join(destEvents,name));
for (const { target, data } of localeWrites) fs.writeFileSync(target, JSON.stringify(data,null,2)+'\n','utf8');
console.log(`[ACTIVE_PARADISE_P1_CLASSIC_01] copied ${fs.readdirSync(srcEvents).filter(x=>x.endsWith('.json')).length} Event JSON files and merged FR/EN locale patches.`);
console.log('Run: npm run validate-content && npm test && npm run build');
