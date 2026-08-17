#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const batch = 'ACTIVE_GENERIC_LAND_04_CONFLICT';
const prefix = 'active_generic_land_04_conflict_';
const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const eventDir = path.join(root, 'src/game/content/events/v2/ordinary', batch);
const docDir = path.join(root, 'docs/content/events/v2/batches', batch);
const fail = (m) => { console.error(`[${batch}] ERROR: ${m}`); process.exitCode = 1; };
const files = fs.readdirSync(eventDir).filter(f => f.endsWith('.json')).sort();
const events = files.map(f => JSON.parse(fs.readFileSync(path.join(eventDir,f),'utf8')));
const byId = new Map(events.map(e=>[e.id,e]));
if (byId.size !== events.length) fail('duplicate Event IDs');
for (const e of events) if (!e.id.startsWith(prefix)) fail(`foreign ID ${e.id}`);
const roots=events.filter(e=>e.kind==='normal');
const immediates=events.filter(e=>e.kind==='immediate');
const scheduled=events.filter(e=>e.kind==='scheduled');
if (roots.length!==20) fail(`expected 20 roots, got ${roots.length}`);
if (scheduled.length!==0) fail(`expected 0 Scheduled, got ${scheduled.length}`);

function hasCond(c,type,pred=()=>true){
  if(!c) return false;
  if(c.type===type && pred(c)) return true;
  if(Array.isArray(c.conditions)) return c.conditions.some(x=>hasCond(x,type,pred));
  if(c.condition) return hasCond(c.condition,type,pred);
  return false;
}
function allEffects(obj,out=[]){
  if(!obj||typeof obj!=='object') return out;
  if(obj.type && ['queueImmediateEvent','scheduleEvent','modifyReputation','setBounty','modifyBounty','moveToLocation','setCareerAffiliation','setCareerRank','setCareerTitle'].includes(obj.type)) out.push(obj);
  for(const v of Object.values(obj)){ if(Array.isArray(v)) for(const x of v) allEffects(x,out); else if(v&&typeof v==='object') allEffects(v,out); }
  return out;
}
for(const r of roots){
  if(!hasCond(r.eligibility,'careerPhaseIs',c=>c.phase==='active')) fail(`${r.id}: missing careerPhaseIs(active)`);
  if(!hasCond(r.eligibility,'isOnLand')) fail(`${r.id}: missing isOnLand`);
  if(r.choices.length<3||r.choices.length>5) fail(`${r.id}: root choice count ${r.choices.length}`);
  if(!r.choices.some(c=>!c.availableIf)) fail(`${r.id}: no unconditional resolvable choice`);
}
for(const e of events){
  if(!e.choices?.some(c=>!c.availableIf)) fail(`${e.id}: no unconditional choice`);
  for(const c of e.choices||[]){
    const res=c.resolution;
    if(res?.type==='dice'){
      for(const k of ['criticalFailure','failure','success','criticalSuccess']) if(!res.outcomes?.[k]) fail(`${e.id}/${c.id}: missing ${k}`);
    }
  }
}
const effects=events.flatMap(e=>allEffects(e));
if(effects.some(e=>e.type==='scheduleEvent')) fail('scheduleEvent found');
if(effects.some(e=>['setBounty','modifyBounty'].includes(e.type))) fail('bounty effect found');
if(effects.some(e=>e.type==='modifyReputation'&&e.amount<0)) fail('negative Reputation found');
if(effects.some(e=>e.type==='moveToLocation')) fail('moveToLocation found');
if(effects.some(e=>['setCareerAffiliation','setCareerRank','setCareerTitle'].includes(e.type))) fail('career/rank/title change found');

const qTargets=effects.filter(e=>e.type==='queueImmediateEvent').map(e=>e.eventId);
for(const t of qTargets) if(!byId.has(t)||byId.get(t).kind!=='immediate') fail(`bad Immediate target ${t}`);
const incoming=new Set(qTargets);
for(const i of immediates) if(!incoming.has(i.id)) fail(`orphan Immediate ${i.id}`);

function queues(e){return allEffects(e).filter(x=>x.type==='queueImmediateEvent').map(x=>x.eventId)}
const arcRoots=roots.filter(r=>queues(r).length>0);
if(arcRoots.length!==15) fail(`expected 15 mini-arc roots, got ${arcRoots.length}`);
function depthFrom(id,seen=new Set()){
  if(seen.has(id)){fail(`Immediate cycle at ${id}`); return 99;}
  const n=byId.get(id); if(!n) return 0;
  const next=queues(n); if(!next.length) return 0;
  const s=new Set(seen); s.add(id);
  return 1+Math.max(...next.map(t=>depthFrom(t,s)));
}
const depths=arcRoots.map(r=>({id:r.id,depth:depthFrom(r.id)}));
const l3=depths.filter(x=>x.depth===2);
if(l3.length!==3) fail(`expected exactly 3 Root->I1->I2 arcs, got ${l3.length}`);
if(depths.some(x=>x.depth>2)) fail('Immediate depth exceeds I2');
const diceRoots=roots.filter(r=>r.choices.some(c=>c.resolution?.type==='dice'));
if(diceRoots.length!==13) fail(`expected 13 Dice roots, got ${diceRoots.length}`);
for(const r of diceRoots){
  const n=r.choices.filter(c=>c.resolution?.type==='dice').length;
  if(n<2) fail(`${r.id}: Dice root has only ${n} Dice choice`);
}

const fr=JSON.parse(fs.readFileSync(path.join(docDir,'LOCALIZATION.fr.fragment.json'),'utf8'));
const en=JSON.parse(fs.readFileSync(path.join(docDir,'LOCALIZATION.en.fragment.json'),'utf8'));
const keys=new Set();
function gatherKeys(o){if(!o||typeof o!=='object')return;for(const [k,v] of Object.entries(o)){if(k.endsWith('Key')&&typeof v==='string')keys.add(v);if(v&&typeof v==='object')gatherKeys(v)}}
for(const e of events)gatherKeys(e);
for(const k of keys){if(!(k in fr))fail(`missing FR ${k}`);if(!(k in en))fail(`missing EN ${k}`)}
for(const k of Object.keys(fr)) if(!(k in en)) fail(`FR-only localization ${k}`);
for(const k of Object.keys(en)) if(!(k in fr)) fail(`EN-only localization ${k}`);
for(const k of Object.keys(fr)) if(!keys.has(k)) fail(`orphan FR localization ${k}`);
for(const k of Object.keys(en)) if(!keys.has(k)) fail(`orphan EN localization ${k}`);

// Editorial budgets: warnings, not schema failures.
const words=s=>s.trim().split(/\s+/).filter(Boolean).length;
let warnings=0;
for(const r of roots){const n=words(en[r.textKey]||'');if(n<20||n>45){console.warn(`[${batch}] WARN root text ${r.id}: ${n} EN words`);warnings++;}}
for(const i of immediates){const n=words(en[i.textKey]||'');if(n<12||n>40){console.warn(`[${batch}] WARN Immediate text ${i.id}: ${n} EN words`);warnings++;}}

if(!process.exitCode){
 console.log(`[${batch}] OK`);
 console.log(`  EventDefinitions: ${events.length}`);
 console.log(`  Normal roots: ${roots.length}`);
 console.log(`  Immediate: ${immediates.length}`);
 console.log(`  Scheduled: ${scheduled.length}`);
 console.log(`  Mini-arc roots: ${arcRoots.length}/20 (${(arcRoots.length/20*100).toFixed(0)}%)`);
 console.log(`  Root->I1->I2 arcs: ${l3.length}`);
 console.log(`  Dice roots: ${diceRoots.length}/20 (${(diceRoots.length/20*100).toFixed(0)}%)`);
 console.log(`  Localization keys: ${keys.size} FR + ${keys.size} EN`);
 console.log(`  Editorial warnings: ${warnings}`);
}
