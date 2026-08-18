#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const bundle=path.resolve(here,'..');
const repo=path.resolve(process.cwd());
const batch='ACTIVE_PARADISE_P4_KINGDOMS_01';
const srcEvents=path.join(bundle,'src/game/content/events/v2/ordinary',batch);
const dstEvents=path.join(repo,'src/game/content/events/v2/ordinary',batch);
const locales=['en','fr'];
if(!fs.existsSync(path.join(repo,'package.json'))) throw new Error('Run from OPFG repository root.');
if(fs.existsSync(dstEvents) && fs.readdirSync(dstEvents).length) throw new Error(`Refusing to overwrite non-empty ${dstEvents}`);
const patches={}; const localeObjects={}; const localeRaw={};
for(const lang of locales){
  const p=JSON.parse(fs.readFileSync(path.join(bundle,'localization',`${lang}.patch.json`),'utf8'));
  const lp=path.join(repo,'src/game/localization/locales',`${lang}.json`);
  const raw=fs.readFileSync(lp,'utf8'); const obj=JSON.parse(raw);
  const collisions=Object.keys(p).filter(k=>Object.prototype.hasOwnProperty.call(obj,k));
  if(collisions.length) throw new Error(`${lang} localization collisions: ${collisions.slice(0,8).join(', ')}`);
  patches[lang]=p;localeObjects[lang]=obj;localeRaw[lang]=raw;
}
fs.mkdirSync(dstEvents,{recursive:true});
for(const name of fs.readdirSync(srcEvents)) fs.copyFileSync(path.join(srcEvents,name),path.join(dstEvents,name));
for(const lang of locales){
  const lp=path.join(repo,'src/game/localization/locales',`${lang}.json`);
  const merged={...localeObjects[lang],...patches[lang]};
  fs.writeFileSync(lp,JSON.stringify(merged,null,2)+'\n','utf8');
}
console.log(`[${batch}] installed ${fs.readdirSync(srcEvents).length} Event JSON files + ${Object.keys(patches.en).length} EN/${Object.keys(patches.fr).length} FR keys.`);
console.log('Next: npm run validate-content && npm test && npm run build');
