#!/usr/bin/env python3
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[6]
EVENT_DIR = ROOT / 'src/game/content/events/v2/ordinary/ACTIVE_BLUE_EAST_BLUE_01'
DOC_DIR = ROOT / 'docs/content/events/v2/batches/ACTIVE_BLUE_EAST_BLUE_01'
PREFIX = 'active_blue_east_blue_01_'

files = sorted(EVENT_DIR.glob('*.json'))
events = [json.loads(path.read_text(encoding='utf-8')) for path in files]
by_id = {event['id']: event for event in events}
assert len(by_id) == len(events), 'duplicate Event ID'
assert all(event['id'].startswith(PREFIX) for event in events), 'ID outside batch namespace'

roots = [event for event in events if event['kind'] == 'normal']
immediates = [event for event in events if event['kind'] == 'immediate']
scheduled = [event for event in events if event['kind'] == 'scheduled']
assert (len(roots), len(immediates), len(scheduled)) == (30, 15, 17)
assert sum(event.get('lifetimeThreadSeed') is True for event in roots) == 1


def iter_choices(event):
    for choice in event['choices']:
        resolution = choice['resolution']
        outcomes = [resolution['outcome']] if resolution['type'] == 'deterministic' else list(resolution['outcomes'].values())
        yield choice, outcomes


def condition_types(condition):
    yield condition.get('type')
    if condition.get('type') in ('all', 'any'):
        for nested in condition.get('conditions', []):
            yield from condition_types(nested)
    elif condition.get('type') == 'not':
        yield from condition_types(condition['condition'])


def scheduled_successors(event_id):
    result = []
    for _, outcomes in iter_choices(by_id[event_id]):
        for outcome in outcomes:
            for effect in outcome.get('effects', []):
                if effect['type'] == 'scheduleEvent':
                    result.append((effect['eventId'], effect['delayMonths']))
                elif effect['type'] == 'queueImmediateEvent':
                    result.extend(scheduled_successors(effect['eventId']))
    return result


def temporal_paths(seed_id):
    def visit(event_id, elapsed, layers, path):
        successors = scheduled_successors(event_id)
        if not successors:
            return [(elapsed, layers, path)]
        found = []
        for next_id, delay in successors:
            found.extend(visit(next_id, elapsed + delay, layers + 1, path + [next_id]))
        return found
    return visit(seed_id, 0, 1, [seed_id])

# Root regional anchor / ratios.
land_roots = []
sea_roots = []
exact_roots = []
dice_roots = []
immediate_roots = []
for event in roots:
    eligibility = json.dumps(event.get('eligibility', {}), ensure_ascii=False)
    assert 'careerPhaseIs' in eligibility and 'currentSeaIs' in eligibility and 'east_blue' in eligibility, event['id']
    on_land = 'isOnLand' in eligibility
    at_sea = 'isAtSea' in eligibility
    assert on_land != at_sea, f'root lacks exactly one land/sea gate: {event["id"]}'
    (land_roots if on_land else sea_roots).append(event['id'])
    if 'locationIs' in eligibility or 'locationWithin' in eligibility:
        exact_roots.append(event['id'])
    if any(choice['resolution']['type'] == 'dice' for choice in event['choices']):
        dice_roots.append(event['id'])
    if any(
        effect['type'] == 'queueImmediateEvent'
        for _, outcomes in iter_choices(event)
        for outcome in outcomes
        for effect in outcome.get('effects', [])
    ):
        immediate_roots.append(event['id'])

assert len(dice_roots) == 18
assert len(immediate_roots) == 15
assert len(land_roots) == 22 and len(sea_roots) == 8
assert len(exact_roots) == 9

# Every event remains resolvable, references are valid, no sibling future chapters.
immediate_refs = set()
scheduled_refs = set()
for event in events:
    assert event['choices'], event['id']
    assert any('availableIf' not in choice for choice in event['choices']), f'no unconditional fallback choice: {event["id"]}'
    if event['kind'] == 'scheduled':
        assert event['priority'] in (50, 100, 200, 300)
        assert event.get('scheduledReach') == 'unrestricted'
        assert event.get('eligibility') == {'type': 'careerPhaseIs', 'phase': 'active'}
    for choice, outcomes in iter_choices(event):
        negative_berry_costs = []
        for outcome in outcomes:
            schedules = [effect for effect in outcome.get('effects', []) if effect['type'] == 'scheduleEvent']
            assert len(schedules) <= 1, f'sibling scheduled chapters: {event["id"]}/{outcome["id"]}'
            negative_ship = False
            for effect in outcome.get('effects', []):
                if effect['type'] == 'queueImmediateEvent':
                    assert effect['eventId'] in by_id and by_id[effect['eventId']]['kind'] == 'immediate'
                    immediate_refs.add(effect['eventId'])
                elif effect['type'] == 'scheduleEvent':
                    assert effect['eventId'] in by_id and by_id[effect['eventId']]['kind'] == 'scheduled'
                    assert effect['delayMonths'] > 0
                    scheduled_refs.add(effect['eventId'])
                elif effect['type'] == 'modifyReputation':
                    assert effect['amount'] >= 0, f'negative Active Reputation: {event["id"]}'
                elif effect['type'] == 'modifyShipHealth' and effect['amount'] < 0:
                    negative_ship = True
                elif effect['type'] == 'modifyBerries' and effect['amount'] < 0:
                    negative_berry_costs.append(-effect['amount'])
            if negative_ship:
                assert outcome.get('shipDamageCause') in ('enemy', 'accident'), f'missing shipDamageCause: {event["id"]}/{outcome["id"]}'
        if negative_berry_costs:
            assert choice['resolution']['type'] == 'deterministic', f'unguarded Dice Berry loss: {event["id"]}/{choice["id"]}'
            gate = choice.get('availableIf', {})
            assert gate.get('type') == 'berriesAtLeast' and gate.get('value', 0) >= max(negative_berry_costs), f'unsafe Berry cost: {event["id"]}/{choice["id"]}'

assert immediate_refs == {event['id'] for event in immediates}
assert scheduled_refs == {event['id'] for event in scheduled}

# Frozen-engine / career safety.
forbidden_effects = {
    'setCareerAffiliation', 'setCareerPhase', 'setBounty', 'modifyBounty', 'setCareerRank',
    'setCareerTitle', 'clearCareerTitle', 'setLeadership', 'moveToLocation', 'recoverToOtherRegion',
    'moveToSameIslandPort', 'recoverToLandInCurrentSea', 'setFlag', 'clearFlag',
}
for event in events:
    for _, outcomes in iter_choices(event):
        for outcome in outcomes:
            for effect in outcome.get('effects', []):
                assert effect['type'] not in forbidden_effects, f'forbidden effect {effect["type"]}: {event["id"]}'

# Recruitment: cast + capacity + fixed-role vacancy + dead-state protection.
recruitment = {
    f'{PREFIX}baratie_short_cook': ('rohan', 'cook'),
    f'{PREFIX}crew_notice_board': ('owen', 'shipwright'),
    f'{PREFIX}clinic_triage_i01_last_bandage': ('ari', 'medic'),
}
for event_id, (npc_id, role_id) in recruitment.items():
    event = by_id[event_id]
    assert npc_id in event.get('cast', []), f'missing recruit cast: {event_id}'
    recruiting_choices = []
    for choice, outcomes in iter_choices(event):
        if any(effect.get('type') == 'setNpcStatus' and effect.get('npcId') == npc_id and effect.get('status') == 'crew' for outcome in outcomes for effect in outcome.get('effects', [])):
            recruiting_choices.append(choice)
    assert len(recruiting_choices) == 1, event_id
    serialized = json.dumps(recruiting_choices[0].get('availableIf', {}))
    assert 'canRecruitNpc' in serialized and npc_id in serialized
    assert 'hasCrewRole' in serialized and role_id in serialized
    assert 'npcStatusIs' in serialized and 'dead' in serialized

# Short Scheduled path windows and V1 horizon safety.
short_threads = {
    f'{PREFIX}fish_market_fake_weights': (8, 412),
    f'{PREFIX}contraband_under_keel': (12, 408),
    f'{PREFIX}coastal_toll_skiff': (6, 414),
    f'{PREFIX}merchant_convoy_gap': (15, 405),
    f'{PREFIX}dockyard_wage_book': (10, 410),
}
short_stats = {}
for seed_id, (expected_months, max_seed_age) in short_threads.items():
    paths = temporal_paths(seed_id)
    longest = max(paths, key=lambda entry: entry[0])
    max_layers = max(entry[1] for entry in paths)
    assert longest[0] == expected_months and 3 <= longest[0] <= 24
    assert max_layers <= 3
    cap = next(condition['value'] for condition in by_id[seed_id]['eligibility']['conditions'] if condition['type'] == 'ageAtMostMonths')
    assert cap == max_seed_age and cap + longest[0] <= 420
    short_stats[seed_id] = {'maxMonths': longest[0], 'maxTemporalLayers': max_layers}

lifetime_seed = f'{PREFIX}coastwatch_bell'
lifetime_paths = temporal_paths(lifetime_seed)
lifetime_longest = max(lifetime_paths, key=lambda entry: entry[0])
assert lifetime_longest[0] == 114
assert lifetime_longest[1] == 6
lifetime_cap = next(condition['value'] for condition in by_id[lifetime_seed]['eligibility']['conditions'] if condition['type'] == 'ageAtMostMonths')
assert lifetime_cap == 306 and lifetime_cap + lifetime_longest[0] <= 420

# FR/EN key parity + current text budgets.
all_keys = []
for event in events:
    all_keys.extend([event['titleKey'], event['textKey']])
    for choice, outcomes in iter_choices(event):
        all_keys.append(choice['textKey'])
        all_keys.extend(outcome['textKey'] for outcome in outcomes)

for lang in ('fr', 'en'):
    locale = json.loads((DOC_DIR / f'localization.{lang}.json').read_text(encoding='utf-8'))
    assert set(all_keys).issubset(locale), f'missing {lang} localization keys'
    def word_count(text):
        return len(re.findall(r"\b[\w’'-]+\b", text, re.UNICODE))
    for event in events:
        low, high = (20, 45) if event['kind'] == 'normal' else (12, 40)
        count = word_count(locale[event['textKey']])
        assert low <= count <= high, f'{lang} body budget {count}: {event["id"]}'
        for choice, outcomes in iter_choices(event):
            count = word_count(locale[choice['textKey']])
            assert 2 <= count <= 10, f'{lang} choice budget {count}: {event["id"]}/{choice["id"]}'
            for outcome in outcomes:
                count = word_count(locale[outcome['textKey']])
                assert 5 <= count <= 25, f'{lang} outcome budget {count}: {event["id"]}/{outcome["id"]}'

print(json.dumps({
    'status': 'PASS',
    'eventDefinitions': len(events),
    'normalRoots': len(roots),
    'immediateEvents': len(immediates),
    'scheduledEvents': len(scheduled),
    'diceRoots': len(dice_roots),
    'immediateRoots': len(immediate_roots),
    'landRoots': len(land_roots),
    'seaRoots': len(sea_roots),
    'exactLocationRoots': len(exact_roots),
    'blueWideRoots': len(roots) - len(exact_roots),
    'shortThreads': short_stats,
    'lifetime': {'seed': lifetime_seed, 'maxMonths': lifetime_longest[0], 'temporalLayers': lifetime_longest[1]},
    'localeKeysPerLanguage': len(json.loads((DOC_DIR / 'localization.fr.json').read_text(encoding='utf-8'))),
}, ensure_ascii=False, indent=2))
