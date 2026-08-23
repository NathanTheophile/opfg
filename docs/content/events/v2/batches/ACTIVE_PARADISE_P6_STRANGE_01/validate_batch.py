from pathlib import Path
import json,re,sys
DD=Path(__file__).resolve().parent
ROOT=DD.parents[5]
ED=ROOT/'src/game/content/events/v2/ordinary/ACTIVE_PARADISE_P6_STRANGE_01'
fr=json.loads((DD/'localization.fr.json').read_text(encoding='utf-8'))
en=json.loads((DD/'localization.en.json').read_text(encoding='utf-8'))
events=[json.loads(p.read_text()) for p in sorted(ED.glob('*.json'))]
ids={e['id'] for e in events}
errors=[]; warnings=[]
route='active_paradise_route_start_p6_strange'
stops=['ukkari_onsen_island','moonmelon_island','long_ring_long_land','one_man_resort','upside_down_atoll','karakuri_island','clockwork_cay','laughing_fog_island','sabaody_archipelago']
valid_roles={'navigator','medic','shipwright','recruiter','first_mate','helmsman','cook','musician','scholar','foreman'}
legacy={'gunner','fighter','quartermaster'}

def walk(x):
    if isinstance(x,dict):
        yield x
        for v in x.values(): yield from walk(v)
    elif isinstance(x,list):
        for v in x: yield from walk(v)

def words(s):
    return len(re.findall(r"\b[\wÀ-ÿ’'-]+\b",s,flags=re.UNICODE))

def loc(e):
    if e['kind']!='normal': return None
    for c in e.get('eligibility',{}).get('conditions',[]):
        if c.get('type')=='locationIs': return c.get('locationId')

def gated(e):
    return any(c.get('type')=='hasPlayed' and c.get('eventId')==route for c in e.get('eligibility',{}).get('conditions',[]))

normal=[e for e in events if e['kind']=='normal']; immediate=[e for e in events if e['kind']=='immediate']; sched=[e for e in events if e['kind']=='scheduled']
if len(events)!=57: errors.append(f'event count {len(events)} != 57')
if len({e['id'] for e in events})!=len(events): errors.append('duplicate IDs')
if len(normal)!=45: errors.append(f'normal {len(normal)} !=45')
if len(immediate)!=9: errors.append(f'immediate {len(immediate)} !=9')
if len(sched)!=3: errors.append(f'scheduled {len(sched)} !=3')
for st in stops:
    n=sum(loc(e)==st for e in normal)
    if n!=5: errors.append(f'{st}: roots {n} !=5')
for e in normal:
    if not gated(e): errors.append(f'normal not route gated: {e["id"]}')
    if len(e['choices'])<3 or len(e['choices'])>5: errors.append(f'normal choice count {e["id"]}: {len(e["choices"])}')
# dice roots
D=[e for e in normal if any(c['resolution']['type']=='dice' for c in e['choices'])]
if len(D)!=27: errors.append(f'dice roots {len(D)} !=27')
# keys + text budgets in both locales
for e in events:
    for L,name in ((fr,'fr'),(en,'en')):
        for k in (e['titleKey'],e['textKey']):
            if k not in L: errors.append(f'missing {name} key {k}')
        if e['textKey'] in L:
            n=words(L[e['textKey']]); lo,hi=((20,45) if e['kind']=='normal' else (12,40))
            if not lo<=n<=hi: errors.append(f'{name} body budget {e["id"]} {n} not {lo}-{hi}')
    # choices/outcomes
    if not any('availableIf' not in c for c in e['choices']): errors.append(f'no unconditional fallback choice: {e["id"]}')
    for c in e['choices']:
        for L,name in ((fr,'fr'),(en,'en')):
            if c['textKey'] not in L: errors.append(f'missing {name} choice {c["textKey"]}')
            else:
                n=words(L[c['textKey']])
                if not 2<=n<=10: errors.append(f'{name} choice budget {e["id"]}/{c["id"]}: {n}')
        res=c['resolution']
        outs=[res['outcome']] if res['type']=='deterministic' else list(res['outcomes'].values())
        for o in outs:
            for L,name in ((fr,'fr'),(en,'en')):
                if o['textKey'] not in L: errors.append(f'missing {name} outcome {o["textKey"]}')
                else:
                    n=words(L[o['textKey']])
                    if not 5<=n<=25: errors.append(f'{name} outcome budget {e["id"]}/{o["id"]}: {n}')
# refs, role refs, spending guards, no recruitment
role_refs=[]; recruit=[]; schedule=[]; imm=[]
for e in events:
    for d in walk(e):
        if d.get('type')=='hasCrewRole': role_refs.append((e['id'],d['roleId']))
        if d.get('type')=='crewRole': role_refs.append((e['id'],d['roleId']))
        if d.get('type')=='setNpcStatus' and d.get('status')=='crew': recruit.append(e['id'])
        if d.get('type')=='scheduleEvent': schedule.append((e['id'],d['eventId'],d['delayMonths']))
        if d.get('type')=='queueImmediateEvent': imm.append((e['id'],d['eventId']))
for _,r in role_refs:
    if r not in valid_roles: errors.append(f'invalid role {r}')
    if r in legacy: errors.append(f'legacy role {r}')
if recruit: errors.append(f'recruitment effects found: {recruit}')
for a,b,*_ in schedule+imm:
    if b not in ids: errors.append(f'unresolved ref {a}->{b}')
# Negative berry costs must be guarded on that choice.
for e in events:
    for c in e['choices']:
        res=c['resolution']
        outs=[res['outcome']] if res['type']=='deterministic' else list(res['outcomes'].values())
        min_cost=0
        for o in outs:
            for ef in o.get('effects',[]):
                if ef.get('type')=='modifyBerries' and ef.get('amount',0)<min_cost: min_cost=ef['amount']
        if min_cost<0:
            av=c.get('availableIf')
            if not (av and av.get('type')=='berriesAtLeast' and av.get('value',0)>=-min_cost):
                errors.append(f'unguarded berry cost {e["id"]}/{c["id"]}: {min_cost}')
# exactly one route scheduled chain seed->l2->l3->l4, count unique semantic edges.
sem_edges=sorted(set(schedule))
expected={
('active_paradise_p6_strange_01_ukkari_oddity_passport','active_paradise_p6_strange_01_route_oddity_passport_l2',4),
('active_paradise_p6_strange_01_route_oddity_passport_l2','active_paradise_p6_strange_01_route_oddity_passport_l3',5),
('active_paradise_p6_strange_01_route_oddity_passport_l3','active_paradise_p6_strange_01_route_oddity_passport_l4',5),
}
if set(sem_edges)!=expected: errors.append(f'scheduled semantic edges differ: {sem_edges}')
for e in sched:
    if not gated(e): errors.append(f'scheduled not route gated: {e["id"]}')
    # Must be Paradise-wide, no locationIs
    if any(d.get('type')=='locationIs' for d in walk(e.get('eligibility'))): errors.append(f'scheduled location pinned: {e["id"]}')
    if not any(d.get('type')=='isOnLand' for d in walk(e.get('eligibility'))): errors.append(f'scheduled may resolve at sea: {e["id"]}')
    cancel=e.get('cancelIf')
    if not cancel: errors.append(f'scheduled missing cancelIf: {e["id"]}')
    else:
        ds=list(walk(cancel))
        if not any(d.get('type')=='hasPlayed' and d.get('eventId')=='active_paradise_p6_strange_01_sabaody_convergence_noticeboard' for d in ds): errors.append(f'scheduled lacks Sabaody termination cancel: {e["id"]}')
        if not any(d.get('type')=='currentSeaIs' and d.get('seaId')=='grand_line_paradise' for d in ds): errors.append(f'scheduled lacks Paradise exit cancel: {e["id"]}')
# prose names forbidden, exact word matches
copy=json.dumps({'fr':fr,'en':en},ensure_ascii=False).lower()
for n in ['mira','rohan','ari','owen']:
    if re.search(r'(?<![a-z])'+n+r'(?![a-z])',copy): errors.append(f'forbidden seeded fallback name in prose: {n}')
# no route flags or quest state payloads
for e in events:
    for d in walk(e):
        if d.get('type') in {'setFlag','clearFlag'}: errors.append(f'flag use {e["id"]}')
# basic effect/condition type allowlist from current schema 16 subset actually used
allowed_used={'all','any','not','careerPhaseIs','hasPlayed','locationIs','isOnLand','currentSeaIs','hasCrewRole','hasTrait','berriesAtLeast','deterministic','dice','modifyBerries','modifyHealth','modifyReputation','modifyStat','scheduleEvent','queueImmediateEvent'}
used={d.get('type') for e in events for d in walk(e) if isinstance(d,dict) and isinstance(d.get('type'),str)}
unknown=used-allowed_used
if unknown: errors.append(f'unexpected type values: {sorted(unknown)}')
# Root gate shared stop count
shared=[e for e in normal if loc(e) in {'long_ring_long_land','karakuri_island','sabaody_archipelago'}]
if len(shared)!=15 or not all(gated(e) for e in shared): errors.append('shared stop gate audit failed')

result={
 'status':'PASS' if not errors else 'FAIL',
 'eventDefinitions':len(events),'normalRoots':len(normal),'diceRoots':len(D),'dicePercent':round(100*len(D)/len(normal),1),
 'immediateDefinitions':len(immediate),'scheduledDefinitions':len(sched),
 'perStopRoots':{st:sum(loc(e)==st for e in normal) for st in stops},
 'roleRefs':role_refs,'recruitmentRoots':recruit,'semanticScheduledEdges':sem_edges,
 'errors':errors,'warnings':warnings,
}
print(json.dumps(result,ensure_ascii=False,indent=2))
(DD/'STATIC_VALIDATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
if errors: sys.exit(1)
