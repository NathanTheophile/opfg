# MANIFEST — ACTIVE_BLUE_WEST_BLUE_01

## Baseline
- Repository: `NathanTheophile/opfg`
- Branch read: `dev`
- Exact HEAD: `dc3819121ae8e74aaa898afefedbc7cdb5666df8`
- Content Schema: **15**
- Scope: Regional Active — West Blue
- Engine/schema/save/UI/navigation changes: none

## Production totals
- Normal roots: **30**
- Immediate EventDefinitions: **15**
- Scheduled EventDefinitions: **17**
  - five short threads: 10 Scheduled definitions
  - regional Lifetime: 7 Scheduled definitions
- Immediate roots: **15/30 = 50%**
- Dice roots: **18/30 = 60%**
- Land / sea: **22 / 8**
- Exact-location / Blue-wide: **9 / 21**
- Lifetime seeds: **1**

## 30-root inventory
1. `active_blue_west_blue_01_happo_crate_spar`
2. `active_blue_west_blue_01_aurora_keel_offer`
3. `active_blue_west_blue_01_masala_stage_rig`
4. `active_blue_west_blue_01_bellflower_floodgate`
5. `active_blue_west_blue_01_branch_evidence_cart`
6. `active_blue_west_blue_01_mauri_rope_bridge`
7. `active_blue_west_blue_01_blackfin_quiet_auction`
8. `active_blue_west_blue_01_enoa_exam_materials`
9. `active_blue_west_blue_01_sankan_lockgate_dispute`
10. `active_blue_west_blue_01_western_customs_stamp`
11. `active_blue_west_blue_01_porter_union_scale`
12. `active_blue_west_blue_01_street_medicine_queue`
13. `active_blue_west_blue_01_recruitment_notice_mixup`
14. `active_blue_west_blue_01_gun_oil_shortage`
15. `active_blue_west_blue_01_royal_tax_cart`
16. `active_blue_west_blue_01_travelling_troupe_spill`
17. `active_blue_west_blue_01_orchard_wasp_cart`
18. `active_blue_west_blue_01_survey_marker_missing`
19. `active_blue_west_blue_01_dockyard_night_shift`
20. `active_blue_west_blue_01_counterfeit_passage_seal`
21. `active_blue_west_blue_01_marine_ration_ledger`
22. `active_blue_west_blue_01_pawned_compass_case`
23. `active_blue_west_blue_01_rain_squall_cargo`
24. `active_blue_west_blue_01_lantern_code_across_fog`
25. `active_blue_west_blue_01_drifting_duelists`
26. `active_blue_west_blue_01_reef_claim_flag`
27. `active_blue_west_blue_01_contraband_bilge_mark`
28. `active_blue_west_blue_01_pilot_boat_debt`
29. `active_blue_west_blue_01_whale_lane_bell`
30. `active_blue_west_blue_01_blue_post_network`

## Exact-location roots
- `active_blue_west_blue_01_happo_crate_spar` → `kano_happo_port`
- `active_blue_west_blue_01_aurora_keel_offer` → `ilisia_aurora_city`
- `active_blue_west_blue_01_masala_stage_rig` → `bollywood_masala_port`
- `active_blue_west_blue_01_bellflower_floodgate` → `bellflower_village`
- `active_blue_west_blue_01_branch_evidence_cart` → `80th_branch`
- `active_blue_west_blue_01_mauri_rope_bridge` → `mt_mauri`
- `active_blue_west_blue_01_blackfin_quiet_auction` → `blackfin_cove`
- `active_blue_west_blue_01_enoa_exam_materials` → `enoa_academy`
- `active_blue_west_blue_01_sankan_lockgate_dispute` → `sankan_river_town`

## Five short Scheduled threads
1. `sankan_lockgate_dispute` → +4m `..._s02_notice` → +4m `..._s03_verdict` (**8m**)
2. `counterfeit_passage_seal` → +6m `..._s02_letter` → +6m `..._s03_hearing` (**12m**)
3. `marine_ration_ledger` → +5m `..._s02_audit` → +5m `..._s03_close` (**10m**)
4. `reef_claim_flag` → +3m `..._s02_notice` → +3m `..._s03_ruling` (**6m**)
5. `pilot_boat_debt` → +9m `..._s02_claim` → +6m `..._s03_receipt` (**15m**)

All returns use `scheduledReach: unrestricted` and `careerPhaseIs(active)`, so letters/notices/claims can reach the player after leaving an exact seed Location or West Blue. Each resolution schedules at most one next temporal node.

## Regional Lifetime — Blue Post Network
Intended normal span: roughly **9.5 years / 114 months** after the seed.

```text
blue_post_network
  -> Immediate: i01_followup
      ├─ +12m lt02_routes ──┐
      └─ +12m lt02_ledgers ─┴─ +18m lt03_squall
                               ├─ +24m lt04_open ─┐
                               └─ +24m lt04_paid ─┴─ +24m lt05_reunion
                                                     └─ +36m lt06_legacy
```

The seed is West-Blue-specific and sea-gated. Once accepted, the continuity is carried by portable mailbags, captain relays and notices, so Scheduled descendants are intentionally unrestricted rather than becoming impossible after departure.

## Ship / recruitment
- `active_blue_west_blue_01_aurora_keel_offer`: actual runtime purchase choices for `dinghy` (5000) and `sloop` (25000), gated by `canAcquireShip` + Berrys.
- `active_blue_west_blue_01_recruitment_notice_mixup`: credible recruitment scene, but no persistent West Blue recruit ID is invented. See `PROPOSED_DEFINITIONS.md`.

## Current West Blue runtime Location IDs
- `kano_country`
- `kano_happo_port`
- `ilisia_kingdom`
- `ilisia_aurora_city`
- `bollywood_kingdom`
- `bollywood_masala_port`
- `esperia_kingdom`
- `esperia_lago_town`
- `sankan_river_town`
- `shishano_port`
- `twinsnakes_island`
- `bellflower_village`
- `80th_branch`
- `mt_mauri`
- `blackfin_cove`
- `sankan_kingdom`
- `shishano_kingdom`
- `enoa_academy`
- `czach_kingdom`
- `jambalaya_kingdom`

## PROPOSED_DEFINITIONS
No shared runtime definition required. Recruitment candidates remain throwaway until a shared NPC integration deliberately defines them.

## Validation
Run `python docs/content/events/v2/batches/ACTIVE_BLUE_WEST_BLUE_01/validate_batch.py`.

Repository-level commands still required after applying into a real checkout:
```bash
npm run validate-content
npm test
npm run build
git diff --check
```
