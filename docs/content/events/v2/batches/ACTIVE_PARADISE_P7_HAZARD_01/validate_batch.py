from pathlib import Path
import json,re,sys
batch='ACTIVE_PARADISE_P7_HAZARD_01'; prefix='active_paradise_p7_hazard_01'; route='active_paradise_route_start_p7_hazard'
here=Path(__file__).resolve().parent
bundle=here.parents[5]
runtime=bundle/'src/game/content/events/v2/ordinary'/batch
events=[json.loads(p.read_text(encoding='utf-8')) for p in sorted(runtime.glob('*.json'))]
by={e['id']:e for e in events}
assert len(by)==len(events)
for p,e in zip(sorted(runtime.glob('*.json')),events): assert p.stem==e['id']
roots=[e for e in events if e['kind']=='normal']; sched=[e for e in events if e['kind']=='scheduled']; imm=[e for e in events if e['kind']=='immediate']
assert len(roots)==46, len(roots)
dice=[e for e in roots if any(c['resolution']['type']=='dice' for c in e['choices'])]
assert len(dice)==28, len(dice)
assert 55 <= 100*len(dice)/len(roots) <= 65
stops=['emberfall_island','stormglass_island','needle_reach','ashcurrent_island','sulfur_key','wreckers_shoal','banaro_island','thunderhead_island','sabaody_archipelago']

def walk(c):
    if isinstance(c,dict):
        yield c
        for v in c.values(): yield from walk(v)
    elif isinstance(c,list):
        for v in c: yield from walk(v)

def has_condition(e,t,**kv): return any(n.get('type')==t and all(n.get(k)==v for k,v in kv.items()) for n in walk(e.get('eligibility',{})))
for s in stops:
    counted=[e for e in roots if e['id']!='active_paradise_p7_hazard_01_blackglass_front_seed' and has_condition(e,'locationIs',locationId=s)]
    assert len(counted)>=5,(s,len(counted))
for e in roots:
    assert has_condition(e,'hasPlayed',eventId=route), e['id']
    assert any(c.get('availableIf') is None for c in e['choices']), e['id']
allowed={'navigator','medic','shipwright','recruiter','first_mate','helmsman','cook','musician','scholar','foreman'}
removed={'gunner','fighter','quartermaster'}
for e in events:
    for n in walk(e):
        if 'roleId' in n:
            assert n['roleId'] in allowed,(e['id'],n['roleId'])
            assert n['roleId'] not in removed
        if n.get('type')=='setNpcStatus' and n.get('status')=='crew': raise AssertionError(f'recruitment in {e["id"]}')
        if n.get('type')=='modifyShipHealth' and n.get('amount',0)<0:
            # parent Outcome check below
            pass
    for c in e['choices']:
        r=c['resolution']; outs=[r['outcome']] if r['type']=='deterministic' else r['outcomes'].values()
        for o in outs:
            if any(x.get('type')=='modifyShipHealth' and x.get('amount',0)<0 for x in o['effects']):
                assert o.get('shipDamageCause')=='accident',(e['id'],c['id'],o['id'])
# exactly one schedule chain: seed + four scheduled descendants
schedule_sources=[]
for e in events:
    for c in e['choices']:
        r=c['resolution']; outs=[r['outcome']] if r['type']=='deterministic' else r['outcomes'].values()
        for o in outs:
            for ef in o['effects']:
                if ef.get('type')=='scheduleEvent': schedule_sources.append((e['id'],ef['eventId'],ef['delayMonths']))
allowed_chain={
 ('active_paradise_p7_hazard_01_blackglass_front_seed','active_paradise_p7_hazard_01_blackglass_front_s02',3),
 ('active_paradise_p7_hazard_01_blackglass_front_s02','active_paradise_p7_hazard_01_blackglass_front_s03',3),
 ('active_paradise_p7_hazard_01_blackglass_front_s03','active_paradise_p7_hazard_01_blackglass_front_s04',3),
 ('active_paradise_p7_hazard_01_blackglass_front_s04','active_paradise_p7_hazard_01_blackglass_front_s05',3),
}
assert set(schedule_sources)==allowed_chain,set(schedule_sources)
assert len(sched)==4
for e in sched:
    assert e.get('scheduledReach')=='unrestricted'
    assert has_condition(e,'hasPlayed',eventId=route)
# locale key parity and references
fr=json.loads((here/'localization.fr.json').read_text(encoding='utf-8')); en=json.loads((here/'localization.en.json').read_text(encoding='utf-8'))
assert set(fr)==set(en)
refs=set()
for e in events:
    for n in walk(e):
        for k,v in n.items():
            if k.endswith('Key') and isinstance(v,str): refs.add(v)
missing=refs-set(fr)
assert not missing,sorted(missing)[:10]
# forbidden seeded NPC interpolation / hardcoded known persistent names
joined='\n'.join(fr.values())+'\n'+'\n'.join(en.values())
for bad in ['Mira','Rohan','Ari','Owen','{{npc_']:
    assert bad not in joined,bad
print(json.dumps({'events':len(events),'normalRoots':len(roots),'diceRoots':len(dice),'dicePct':round(100*len(dice)/len(roots),1),'immediate':len(imm),'scheduled':len(sched),'localeKeys':len(fr),'status':'PASS'},indent=2))
