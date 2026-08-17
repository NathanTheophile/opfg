import fs from 'node:fs';
import path from 'node:path';
const batch='ACTIVE_GENERIC_SEA_03_DANGER';
const dir=path.join('src','game','content','events','v2','ordinary',batch);
const files=fs.readdirSync(dir).filter(x=>x.endsWith('.json'));
const events=files.map(f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')));
const ids=new Set(events.map(e=>e.id));
const roots=events.filter(e=>e.kind==='normal');
const immediates=events.filter(e=>e.kind==='immediate');
const effects=e=>e.choices.flatMap(c=>c.resolution.type==='dice'?Object.values(c.resolution.outcomes).flatMap(o=>o.effects):c.resolution.outcome.effects);
const queued=e=>[...new Set(effects(e).filter(x=>x.type==='queueImmediateEvent').map(x=>x.eventId))];
const diceRoots=roots.filter(e=>e.choices.some(c=>c.resolution.type==='dice'));
const arcRoots=roots.filter(e=>queued(e).length>0);
for (const e of events) {
  if (!files.includes(`${e.id}.json`)) throw new Error(`filename/id mismatch: ${e.id}`);
  if (!e.choices.some(c=>c.availableIf===undefined)) throw new Error(`no unconditional choice: ${e.id}`);
  for (const target of queued(e)) if (!ids.has(target)) throw new Error(`missing Immediate target ${target}`);
  for (const c of e.choices) if (c.resolution.type==='dice' && Object.keys(c.resolution.outcomes).sort().join(',')!=='criticalFailure,criticalSuccess,failure,success') throw new Error(`bad Dice outcomes ${e.id}/${c.id}`);
}
if (roots.length!==20) throw new Error(`roots=${roots.length}`);
if (arcRoots.length!==15) throw new Error(`arcRoots=${arcRoots.length}`);
if (diceRoots.length!==12) throw new Error(`diceRoots=${diceRoots.length}`);
if (events.some(e=>e.kind==='scheduled')) throw new Error('Scheduled event found');
console.log(`[${batch}] ${roots.length} roots / ${immediates.length} Immediate / ${diceRoots.length} Dice roots / ${arcRoots.length} mini-arc roots / 0 Scheduled`);
