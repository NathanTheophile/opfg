# ACTIVE_BLUE_SOUTH_BLUE_01 — MANIFEST

## Baseline

- Repository: `NathanTheophile/opfg`
- Branch read: `dev`
- HEAD read before authoring: `dc3819121ae8e74aaa898afefedbc7cdb5666df8`
- Content Schema: `15`
- Profile: Active V1 Regional Blue

## Scope

South Blue ordinary Active content only. Every Normal root uses `careerPhaseIs(active)` + `currentSeaIs(south_blue)`; exact-location roots add a current V1 Location gate. No engine/schema/save/UI/navigation/shared-catalog edits.

## Root inventory (30)

01. `active_blue_south_blue_01_crosscurrent_fishers` — sea, Dice, Immediate
02. `active_blue_south_blue_01_icewake_channel` — sea, Dice, Immediate
03. `active_blue_south_blue_01_medicine_flag_at_sea` — sea, Dice, Immediate, Short:medicine_flag
04. `active_blue_south_blue_01_drifting_crop_barges` — sea, Dice, Immediate
05. `active_blue_south_blue_01_brass_band_ferry` — sea, det, Immediate
06. `active_blue_south_blue_01_royal_courier_crossing` — sea, Dice
07. `active_blue_south_blue_01_smoke_over_lee` — sea, det
08. `active_blue_south_blue_01_winter_gale_cargo` — sea, Dice, Immediate
09. `active_blue_south_blue_01_redfin_shadow_boats` — sea, Dice
10. `active_blue_south_blue_01_southport_trial_hull` — sea, Dice, Immediate
11. `active_blue_south_blue_01_lantern_relay_seed` — sea, Dice, Immediate, Lifetime seed
12. `active_blue_south_blue_01_kutsukku_reef_poles` — sea, det
13. `active_blue_south_blue_01_sorbet_launch_slot` — land, Dice, Immediate, Short:sorbet_launch, exact:sorbet_southport
14. `active_blue_south_blue_01_torino_canopy_antidote` — land, Dice, Immediate, exact:torino_canopy
15. `active_blue_south_blue_01_karate_open_mat` — land, Dice, Immediate, exact:karate_island
16. `active_blue_south_blue_01_briss_crane_snap` — land, Dice, Immediate, exact:briss_port
17. `active_blue_south_blue_01_samba_parade_float` — land, Dice, Immediate, Short:samba_parade, exact:samba_city
18. `active_blue_south_blue_01_centaurea_customs_split` — land, Dice
19. `active_blue_south_blue_01_taya_irrigation_gate` — land, Dice, Immediate, exact:taya_village
20. `active_blue_south_blue_01_seventy_fourth_sealed_crate` — land, det, exact:south_74th_branch
21. `active_blue_south_blue_01_redfin_false_scale` — land, Dice, Immediate, Short:redfin_scale, exact:redfin_cove
22. `active_blue_south_blue_01_jewel_whiteout` — land, Dice, Short:jewel_whiteout, exact:jewel_ice_sheet
23. `active_blue_south_blue_01_harbor_night_ward` — land, det
24. `active_blue_south_blue_01_southport_secondhand_sloop` — land, det, exact:sorbet_southport
25. `active_blue_south_blue_01_port_dinghy_lot` — land, det
26. `active_blue_south_blue_01_mira_empty_berth` — land, det
27. `active_blue_south_blue_01_royal_tax_cart` — land, det
28. `active_blue_south_blue_01_market_bell_crop` — land, det
29. `active_blue_south_blue_01_forest_medicine_swap` — land, det
30. `active_blue_south_blue_01_cold_port_auction` — land, det

## Counts

- Normal roots: **30**
- Immediate definitions: **15**
- Scheduled definitions (short threads + Lifetime + Lifetime exit): **18**
- Immediate roots: **15/30 = 50%**
- Dice roots: **18/30 = 60%**
- Land / sea: **18 / 12**
- Exact-location / Blue-wide-or-situational: **10 / 20**

## Short Scheduled threads (exactly 5)

- **medicine_flag**: `active_blue_south_blue_01_medicine_flag_at_sea` +6m → `active_blue_south_blue_01_medicine_flag_return_s02` +6m → `active_blue_south_blue_01_medicine_flag_return_s03`. Safety: courier callbacks; portable outside South Blue.
- **sorbet_launch**: `active_blue_south_blue_01_sorbet_launch_slot` +6m → `active_blue_south_blue_01_sorbet_launch_return_s02` +6m → `active_blue_south_blue_01_sorbet_launch_return_s03`. Safety: shipyard report travels by courier.
- **samba_parade**: `active_blue_south_blue_01_samba_parade_float` +4m → `active_blue_south_blue_01_samba_parade_return_s02` +8m → `active_blue_south_blue_01_samba_parade_return_s03`. Safety: festival organizer/courier callback.
- **redfin_scale**: `active_blue_south_blue_01_redfin_false_scale` +5m → `active_blue_south_blue_01_redfin_scale_return_s02` +7m → `active_blue_south_blue_01_redfin_scale_return_s03`. Safety: collectors can plausibly follow the player.
- **jewel_whiteout**: `active_blue_south_blue_01_jewel_whiteout` +8m → `active_blue_south_blue_01_jewel_whiteout_return_s02` +8m → `active_blue_south_blue_01_jewel_whiteout_return_s03`. Safety: guide dispatches travel beyond the ice.

Each normal short thread is L1 seed → L2 → L3, schedules only the next return, and completes in 12–16 biological months. Returns are written as courier/letter/follower callbacks and therefore have a justified broader return contract instead of a tiny-location lock.

## Regional Lifetime

`active_blue_south_blue_01_lantern_relay_seed`

```text
seed
  +12m -> S1 first winter
            ├─ public roster  +18m -> S2A
            └─ pilot roster   +18m -> S2B
                                  \ / +18m
                                   S3 broken chain
                                      +24m
                                   S4 who pays
                                   ├─ open/public +18m -> S5A final
                                   └─ paid/private +18m -> S5B final
```

- Full lived span: about **90 months / 7.5 years** from seed to terminal callback.
- Seed is limited to `ageMonths <= 300` so a full path can finish before the V1 horizon when selected in time.
- Every regional Scheduled node cancels to `active_blue_south_blue_01_lantern_lifetime_outside_south_blue` if the player has left South Blue when it becomes due. The fallback is unrestricted, narratively closes the relay, and schedules nothing further.
- Durable anchor: small coastal bell/light relay used by local pilots and merchant traffic; no new system or persistent definition.

## Existing persistent definitions used

- NPC: `mira` (one optional recruitment opportunity; only when already `known`).
- Item: `timber` (one conditioned scene-use only).
- Ships: `dinghy`, `sloop` through existing ship-market primitives.
- Crew role queried indirectly through `mira`'s existing `navigator` definition.

## World V1 surface used

Exact Locations: `sorbet_southport`, `torino_canopy`, `karate_island`, `briss_port`, `samba_city`, `taya_village`, `south_74th_branch`, `redfin_cove`, `jewel_ice_sheet`.

Blue-wide situational gates reuse current tags/services including: `port`, `trade`, `urban`, `royal`, `agricultural`, `forest`, `snow`, `medical`, `crew_recruitment`.

## Persistent definitions

`PROPOSED_DEFINITIONS`: **none**.

## Canon / timeline

- No major canon character is introduced.
- No major canon outcome/history is invented or changed.
- Named places and regional texture come from current World V1 metadata; uncertain catalogue entries are treated only as runtime geography, not as a license to invent canon history.
- Original institutions are deliberately small/local (dock practice, clinic routes, bell relay), not global organizations.

## Shared integration

Worker-owned localization fragments are `localization.fr.json` and `localization.en.json`. They still need the normal sequential merge into shared runtime locale dictionaries before repository-level content validation can pass.
