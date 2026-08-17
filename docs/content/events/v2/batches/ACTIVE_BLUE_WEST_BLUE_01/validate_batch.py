#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[6]
EVENT_DIR = ROOT / "src/game/content/events/v2/ordinary/ACTIVE_BLUE_WEST_BLUE_01"
DOC_DIR = ROOT / "docs/content/events/v2/batches/ACTIVE_BLUE_WEST_BLUE_01"
PREFIX = "active_blue_west_blue_01_"
WORLD = json.loads((ROOT / "src/game/content/data/locationsV1.json").read_text(encoding="utf-8"))
VALID_LOCS = {loc["id"] for loc in WORLD["blueLocations"] if loc.get("seaId") == "west_blue"}
IMMEDIATE_ROOTS = set(['active_blue_west_blue_01_bellflower_floodgate', 'active_blue_west_blue_01_blackfin_quiet_auction', 'active_blue_west_blue_01_blue_post_network', 'active_blue_west_blue_01_branch_evidence_cart', 'active_blue_west_blue_01_contraband_bilge_mark', 'active_blue_west_blue_01_gun_oil_shortage', 'active_blue_west_blue_01_happo_crate_spar', 'active_blue_west_blue_01_lantern_code_across_fog', 'active_blue_west_blue_01_masala_stage_rig', 'active_blue_west_blue_01_mauri_rope_bridge', 'active_blue_west_blue_01_rain_squall_cargo', 'active_blue_west_blue_01_sankan_lockgate_dispute', 'active_blue_west_blue_01_street_medicine_queue', 'active_blue_west_blue_01_survey_marker_missing', 'active_blue_west_blue_01_travelling_troupe_spill'])
DICE_ROOTS = set(['active_blue_west_blue_01_bellflower_floodgate', 'active_blue_west_blue_01_blackfin_quiet_auction', 'active_blue_west_blue_01_blue_post_network', 'active_blue_west_blue_01_branch_evidence_cart', 'active_blue_west_blue_01_contraband_bilge_mark', 'active_blue_west_blue_01_dockyard_night_shift', 'active_blue_west_blue_01_gun_oil_shortage', 'active_blue_west_blue_01_happo_crate_spar', 'active_blue_west_blue_01_lantern_code_across_fog', 'active_blue_west_blue_01_masala_stage_rig', 'active_blue_west_blue_01_mauri_rope_bridge', 'active_blue_west_blue_01_orchard_wasp_cart', 'active_blue_west_blue_01_porter_union_scale', 'active_blue_west_blue_01_rain_squall_cargo', 'active_blue_west_blue_01_sankan_lockgate_dispute', 'active_blue_west_blue_01_survey_marker_missing', 'active_blue_west_blue_01_travelling_troupe_spill', 'active_blue_west_blue_01_whale_lane_bell'])
SHORT_ROOTS = {'active_blue_west_blue_01_sankan_lockgate_dispute': ('active_blue_west_blue_01_sankan_lockgate_dispute_s02_notice', 4, 'active_blue_west_blue_01_sankan_lockgate_dispute_s03_verdict', 4), 'active_blue_west_blue_01_counterfeit_passage_seal': ('active_blue_west_blue_01_counterfeit_passage_seal_s02_letter', 6, 'active_blue_west_blue_01_counterfeit_passage_seal_s03_hearing', 6), 'active_blue_west_blue_01_marine_ration_ledger': ('active_blue_west_blue_01_marine_ration_ledger_s02_audit', 5, 'active_blue_west_blue_01_marine_ration_ledger_s03_close', 5), 'active_blue_west_blue_01_reef_claim_flag': ('active_blue_west_blue_01_reef_claim_flag_s02_notice', 3, 'active_blue_west_blue_01_reef_claim_flag_s03_ruling', 3), 'active_blue_west_blue_01_pilot_boat_debt': ('active_blue_west_blue_01_pilot_boat_debt_s02_claim', 9, 'active_blue_west_blue_01_pilot_boat_debt_s03_receipt', 6)}
LIFETIME = "active_blue_west_blue_01_blue_post_network"

events = [json.loads(p.read_text(encoding="utf-8")) for p in sorted(EVENT_DIR.glob("*.json"))]
by_id = {e["id"]: e for e in events}
assert len(by_id) == len(events), "duplicate Event ID"
assert all(e["id"].startswith(PREFIX) for e in events), "namespace leak"
assert all((EVENT_DIR / (e["id"]+".json")).exists() for e in events), "filename mismatch"

roots = [e for e in events if e["kind"] == "normal"]
imms = [e for e in events if e["kind"] == "immediate"]
sched = [e for e in events if e["kind"] == "scheduled"]
assert (len(roots),len(imms),len(sched)) == (30,15,17), (len(roots),len(imms),len(sched))
assert sum(e.get("lifetimeThreadSeed") is True for e in roots) == 1

def outcomes(choice):
    r=choice["resolution"]
    return [r["outcome"]] if r["type"]=="deterministic" else list(r["outcomes"].values())

immediate_roots=set()
dice_roots=set()
loc_roots=set()
sea_roots=set()
for e in roots:
    conds=e["eligibility"]["conditions"]
    types=[c["type"] for c in conds]
    if "isAtSea" in types: sea_roots.add(e["id"])
    for c in conds:
        if c["type"]=="locationIs":
            assert c["locationId"] in VALID_LOCS, c
            loc_roots.add(e["id"])
    for ch in e["choices"]:
        if ch["resolution"]["type"]=="dice":
            dice_roots.add(e["id"])
        for out in outcomes(ch):
            for fx in out.get("effects",[]):
                if fx["type"]=="queueImmediateEvent":
                    assert fx["eventId"] in by_id and by_id[fx["eventId"]]["kind"]=="immediate"
                    immediate_roots.add(e["id"])
                if fx["type"]=="scheduleEvent":
                    assert fx["eventId"] in by_id and by_id[fx["eventId"]]["kind"]=="scheduled"
                assert not (fx["type"]=="modifyReputation" and fx["amount"]<0)
                assert fx["type"] not in {"setCareerAffiliation","setCareerPhase","modifyBounty","moveToLocation"}

assert len(immediate_roots)==15, len(immediate_roots)
assert len(dice_roots)==18, len(dice_roots)
assert len(sea_roots)==8, len(sea_roots)
assert len(loc_roots)==8, len(loc_roots)

for e in sched:
    assert e.get("priority") in {50,100,200,300}
    assert e.get("scheduledReach") in {"normal","unrestricted"}
    assert e["eligibility"]["type"]=="careerPhaseIs"
    assert e["eligibility"]["phase"]=="active"
    for ch in e["choices"]:
        scheduled_edges=0
        for out in outcomes(ch):
            local=0
            for fx in out.get("effects",[]):
                if fx["type"]=="scheduleEvent":
                    assert fx["eventId"] in by_id and by_id[fx["eventId"]]["kind"]=="scheduled"
                    local += 1
                assert not (fx["type"]=="modifyReputation" and fx["amount"]<0)
                assert fx["type"] not in {"setCareerAffiliation","setCareerPhase","modifyBounty","moveToLocation"}
            assert local <= 1, (e["id"],ch["id"])

# Five short chains: root -> s02 -> optional s03
for root_id,(s02,d1,s03,d2) in SHORT_ROOTS.items():
    root=by_id[root_id]
    found=[]
    for ch in root["choices"]:
        for out in outcomes(ch):
            for fx in out.get("effects",[]):
                if fx["type"]=="scheduleEvent":
                    found.append((fx["eventId"],fx["delayMonths"]))
    assert (s02,d1) in found, (root_id,found)
    e2=by_id[s02]
    e2edges=[]
    for ch in e2["choices"]:
        for out in outcomes(ch):
            for fx in out.get("effects",[]):
                if fx["type"]=="scheduleEvent":
                    e2edges.append((fx["eventId"],fx["delayMonths"]))
    assert (s03,d2) in e2edges
    assert d1+d2 <= 24

# Lifetime max path: I1 -> 12 -> 18 -> 24 -> 24 -> 36 = 114m
assert by_id[LIFETIME].get("lifetimeThreadSeed") is True
assert "active_blue_west_blue_01_blue_post_network_i01_followup" in by_id
assert len([e for e in sched if "_blue_post_network_lt" in e["id"]]) == 7

# localization parity and all referenced keys present
fr=json.loads((DOC_DIR/"localization.fr.json").read_text(encoding="utf-8"))
en=json.loads((DOC_DIR/"localization.en.json").read_text(encoding="utf-8"))
assert set(fr)==set(en)
keys=set()
for e in events:
    keys.add(e["titleKey"]); keys.add(e["textKey"])
    for ch in e["choices"]:
        keys.add(ch["textKey"])
        for out in outcomes(ch): keys.add(out["textKey"])
missing=keys-set(fr)
assert not missing, sorted(missing)[:10]

print("ACTIVE_BLUE_WEST_BLUE_01 structural validation PASS")
print(f"events={len(events)} roots={len(roots)} immediate={len(imms)} scheduled={len(sched)}")
print(f"immediate_roots={len(immediate_roots)} dice_roots={len(dice_roots)} sea={len(sea_roots)} land={len(roots)-len(sea_roots)} exact={len(loc_roots)} wide={len(roots)-len(loc_roots)}")
print(f"localization_keys={len(fr)}")
