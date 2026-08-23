# ACTIVE_PARADISE_P3_WILD_01 — Manifest

Baseline inspected: `dev` @ `7ffaead34e2b13038f915d5483c594a11e9cadc6`, Content Schema 16, Save 23.

## Scope
- Route authority: History `active_paradise_route_start_p3_wild`.
- All 45 local roots are explicitly `isOnLand`; they cannot leak into at-sea monthly slots.
- 45 Normal roots, exactly 5 per main stop / accepted cluster.
- 27 Dice roots = 60.0%.
- 9 roots open a short Immediate mini-arc (9 Immediate definitions).
- Exactly one bounded route-wide Scheduled structure, 4 temporal layers including its Normal seed.
- No engine/schema/save/UI/navigation changes.
- No new persistent definition.
- No recruitment root.
- No seeded NPC reference.

## Per-stop coverage
| Stop | Normal roots | Dice roots | Immediate roots |
|---|---:|---:|---:|
| `tempest_key` | 5 | 3 | 1 |
| `kenzan_island` | 5 | 3 | 1 |
| `mt_kintoki` | 5 | 3 | 1 |
| `mossback_island` | 5 | 3 | 1 |
| `nanimonai_island` | 5 | 3 | 1 |
| `stormneedle_island` | 5 | 3 | 1 |
| `kuraigana_island` + `shikkeahr_kingdom` | 5 (1 + 4) | 3 | 1 |
| `banaro_island` | 5 | 3 | 1 |
| `sabaody_archipelago` | 5 | 3 | 1 |

## Route-wide Scheduled graph
`active_paradise_p3_wild_01_tempest_key_three_notches` (L1, Tempest Key Normal seed)
→ `active_paradise_p3_wild_01_storm_marks_s02` (L2, +1 month)
→ `active_paradise_p3_wild_01_storm_marks_s03` (L3, +1 month)
→ `active_paradise_p3_wild_01_storm_marks_s04` (L4, +1 month, terminal)

L2/L3 are route-History gated, Paradise-wide, land-only, `scheduledReach: unrestricted`, and cancel if Sabaody is reached before their due date or if Paradise is left. L4 is terminal, may resolve on Sabaody, and cancels if Paradise has already been left. Every node schedules only its immediate successor. No flags/route state are added.

## Shared-stop History gate audit
- `kuraigana_island` / `shikkeahr_kingdom`: PASS (1 island root + 4 kingdom-cluster roots) — all route-owned roots include `hasPlayed(active_paradise_route_start_p3_wild)`.
- `banaro_island`: PASS.
- `sabaody_archipelago`: PASS.

## CrewRole audit
Referenced current roles: `cook`, `first_mate`, `foreman`, `helmsman`, `medic`, `musician`, `navigator`, `recruiter`, `scholar`, `shipwright`.
No `gunner`, `fighter`, or `quartermaster`. No annual role power is encoded as a Choice. Role-gated Choices only represent current-holder scene expertise.

## Recruitment / NPC audit
- Recruitment roots: 0.
- `canRecruitNpc`: 0.
- `setNpcStatus -> crew`: 0.
- New persistent NPCs: 0.
- Seeded-NPC interpolation exposure: 0; no seeded persistent NPC appears in player-facing prose.

## Canon / timeline notes
No named canon character is used. Kuraigana avoids Mihawk/Perona/Humandrill outcomes; Banaro avoids the Ace/Blackbeard confrontation; Sabaody stays a convergence/logistics hub rather than replacing a canon climax.

## Starvation / dead-schedule audit
- Exactly five route-gated Normal roots exist at every P3 main stop/cluster.
- Scheduled L2/L3 are not tied to a tiny Location; once due, they remain eligible at any Paradise landfall after P3 route selection.
- L2/L3 cancel cleanly on early Sabaody convergence; L4 may resolve on Sabaody and otherwise cancels after Paradise, so no route thread can leak into another sea.
- No sibling Scheduled nodes are queued and no Scheduled node queues more than one successor.

## Validation
Static bundle audit: **PASS**. See `AUDIT.json`.

Official repository commands were not executable here because the environment has no local OPFG worktree:
```text
npm run validate-content — NOT RUN
npm test                 — NOT RUN
npm run build            — NOT RUN
```
Install with `node apply_bundle.mjs <path-to-opfg-checkout>` (or `python apply_bundle.py ...`), then run the three commands.

## Exact content inventory

### Normal root IDs
- `active_paradise_p3_wild_01_banaro_island_black_field`
- `active_paradise_p3_wild_01_banaro_island_contested_spring`
- `active_paradise_p3_wild_01_banaro_island_hollow_crust`
- `active_paradise_p3_wild_01_banaro_island_scrub_convoy`
- `active_paradise_p3_wild_01_banaro_island_storm_bridge`
- `active_paradise_p3_wild_01_kenzan_island_cliff_cable`
- `active_paradise_p3_wild_01_kenzan_island_knife_grass`
- `active_paradise_p3_wild_01_kenzan_island_razor_pass`
- `active_paradise_p3_wild_01_kenzan_island_rockfall_echo`
- `active_paradise_p3_wild_01_kenzan_island_spring_stones`
- `active_paradise_p3_wild_01_kuraigana_island_collapsed_forge`
- `active_paradise_p3_wild_01_kuraigana_island_courtyard_well`
- `active_paradise_p3_wild_01_kuraigana_island_faded_inscription`
- `active_paradise_p3_wild_01_kuraigana_island_forest_silence`
- `active_paradise_p3_wild_01_kuraigana_island_ruined_hall`
- `active_paradise_p3_wild_01_mossback_island_bog_sink`
- `active_paradise_p3_wild_01_mossback_island_canopy_water`
- `active_paradise_p3_wild_01_mossback_island_root_shelter`
- `active_paradise_p3_wild_01_mossback_island_spore_patch`
- `active_paradise_p3_wild_01_mossback_island_vanishing_marks`
- `active_paradise_p3_wild_01_mt_kintoki_echo_bell`
- `active_paradise_p3_wild_01_mt_kintoki_rolling_crates`
- `active_paradise_p3_wild_01_mt_kintoki_snow_cornice`
- `active_paradise_p3_wild_01_mt_kintoki_steam_crossing`
- `active_paradise_p3_wild_01_mt_kintoki_thin_air_meal`
- `active_paradise_p3_wild_01_nanimonai_island_dry_gully`
- `active_paradise_p3_wild_01_nanimonai_island_false_calls`
- `active_paradise_p3_wild_01_nanimonai_island_fresh_footprints`
- `active_paradise_p3_wild_01_nanimonai_island_survey_stakes`
- `active_paradise_p3_wild_01_nanimonai_island_washed_supplies`
- `active_paradise_p3_wild_01_sabaody_archipelago_bubble_lift`
- `active_paradise_p3_wild_01_sabaody_archipelago_coating_leak`
- `active_paradise_p3_wild_01_sabaody_archipelago_mangrove_jam`
- `active_paradise_p3_wild_01_sabaody_archipelago_red_line_queue`
- `active_paradise_p3_wild_01_sabaody_archipelago_tourist_scam`
- `active_paradise_p3_wild_01_stormneedle_island_anchor_scrape`
- `active_paradise_p3_wild_01_stormneedle_island_ground_path`
- `active_paradise_p3_wild_01_stormneedle_island_metal_wreck`
- `active_paradise_p3_wild_01_stormneedle_island_needle_spray`
- `active_paradise_p3_wild_01_stormneedle_island_static_clock`
- `active_paradise_p3_wild_01_tempest_key_broken_beacon`
- `active_paradise_p3_wild_01_tempest_key_cutoff_shelf`
- `active_paradise_p3_wild_01_tempest_key_seabird_pressure`
- `active_paradise_p3_wild_01_tempest_key_storm_trough`
- `active_paradise_p3_wild_01_tempest_key_three_notches`

### Dice root IDs
- `active_paradise_p3_wild_01_banaro_island_black_field`
- `active_paradise_p3_wild_01_banaro_island_hollow_crust`
- `active_paradise_p3_wild_01_banaro_island_scrub_convoy`
- `active_paradise_p3_wild_01_kenzan_island_cliff_cable`
- `active_paradise_p3_wild_01_kenzan_island_knife_grass`
- `active_paradise_p3_wild_01_kenzan_island_razor_pass`
- `active_paradise_p3_wild_01_kuraigana_island_collapsed_forge`
- `active_paradise_p3_wild_01_kuraigana_island_forest_silence`
- `active_paradise_p3_wild_01_kuraigana_island_ruined_hall`
- `active_paradise_p3_wild_01_mossback_island_bog_sink`
- `active_paradise_p3_wild_01_mossback_island_root_shelter`
- `active_paradise_p3_wild_01_mossback_island_vanishing_marks`
- `active_paradise_p3_wild_01_mt_kintoki_echo_bell`
- `active_paradise_p3_wild_01_mt_kintoki_rolling_crates`
- `active_paradise_p3_wild_01_mt_kintoki_snow_cornice`
- `active_paradise_p3_wild_01_nanimonai_island_false_calls`
- `active_paradise_p3_wild_01_nanimonai_island_fresh_footprints`
- `active_paradise_p3_wild_01_nanimonai_island_washed_supplies`
- `active_paradise_p3_wild_01_sabaody_archipelago_bubble_lift`
- `active_paradise_p3_wild_01_sabaody_archipelago_mangrove_jam`
- `active_paradise_p3_wild_01_sabaody_archipelago_red_line_queue`
- `active_paradise_p3_wild_01_stormneedle_island_metal_wreck`
- `active_paradise_p3_wild_01_stormneedle_island_needle_spray`
- `active_paradise_p3_wild_01_stormneedle_island_static_clock`
- `active_paradise_p3_wild_01_tempest_key_broken_beacon`
- `active_paradise_p3_wild_01_tempest_key_storm_trough`
- `active_paradise_p3_wild_01_tempest_key_three_notches`

Difficulty distribution: 18 Standard (`11`), 9 Difficult (`14`).

### Immediate root IDs
- `active_paradise_p3_wild_01_banaro_island_storm_bridge`
- `active_paradise_p3_wild_01_kenzan_island_rockfall_echo`
- `active_paradise_p3_wild_01_kuraigana_island_faded_inscription`
- `active_paradise_p3_wild_01_mossback_island_canopy_water`
- `active_paradise_p3_wild_01_mt_kintoki_steam_crossing`
- `active_paradise_p3_wild_01_nanimonai_island_dry_gully`
- `active_paradise_p3_wild_01_sabaody_archipelago_tourist_scam`
- `active_paradise_p3_wild_01_stormneedle_island_anchor_scrape`
- `active_paradise_p3_wild_01_tempest_key_seabird_pressure`

### Immediate EventDefinition IDs
- `active_paradise_p3_wild_01_banaro_island_storm_bridge_bridge_second`
- `active_paradise_p3_wild_01_kenzan_island_rockfall_echo_rockfall_second`
- `active_paradise_p3_wild_01_kuraigana_island_faded_inscription_inscription_second`
- `active_paradise_p3_wild_01_mossback_island_canopy_water_canopy_second`
- `active_paradise_p3_wild_01_mt_kintoki_steam_crossing_steam_second`
- `active_paradise_p3_wild_01_nanimonai_island_dry_gully_dry_gully_second`
- `active_paradise_p3_wild_01_sabaody_archipelago_tourist_scam_scam_second`
- `active_paradise_p3_wild_01_stormneedle_island_anchor_scrape_anchor_second`
- `active_paradise_p3_wild_01_tempest_key_seabird_pressure_gust_second`

### Scheduled EventDefinition IDs
- `active_paradise_p3_wild_01_storm_marks_s02`
- `active_paradise_p3_wild_01_storm_marks_s03`
- `active_paradise_p3_wild_01_storm_marks_s04`

## Persistent definitions used / proposed
- Locations used: `tempest_key`, `kenzan_island`, `mt_kintoki`, `mossback_island`, `nanimonai_island`, `stormneedle_island`, `kuraigana_island`, `shikkeahr_kingdom`, `banaro_island`, `sabaody_archipelago`.
- Existing CrewRoles referenced: `cook`, `first_mate`, `foreman`, `helmsman`, `medic`, `musician`, `navigator`, `recruiter`, `scholar`, `shipwright`.
- Existing route-History authority used: `active_paradise_route_start_p3_wild`.
- Persistent NPCs used: none.
- Items / Equipment / Companion definitions used: none.
- Traits used: none.
- Career-specific definitions used: none; content is generic Active route content.
- Proposed persistent definitions: **none**.

## Localization
- FR keys: **607**.
- EN keys: **607**.
- All runtime `*Key` references in the bundle are present in both locale patches (static audit PASS).
- Choice/Outcome keys match current `keys.ts` canonical helpers (`choice.<id>.text`, `outcome.<outcomeId>.text`).
