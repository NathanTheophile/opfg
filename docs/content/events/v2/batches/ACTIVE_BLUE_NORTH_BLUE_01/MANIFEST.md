# MANIFEST — ACTIVE_BLUE_NORTH_BLUE_01

## Repository baseline

- Repository: `NathanTheophile/opfg`
- Branch: `dev`
- Exact HEAD read before authoring: `dc3819121ae8e74aaa898afefedbc7cdb5666df8`.
- Content Schema observed: `15`.
- Save version observed: `22`.
- Profile: **Regional Blue / North Blue**.
- Worker isolation: only the new namespaced runtime directory and namespaced batch support are produced.
- Shared localization dictionaries, catalogs, schema, engine, save, UI, navigation, other batches, Concept Index and migration ledger are intentionally untouched.

## Batch identity

- Batch ID: `ACTIVE_BLUE_NORTH_BLUE_01`.
- Reserved runtime prefix: `active_blue_north_blue_01_`.
- Regional gate: every Normal root requires `careerPhaseIs(active)` + `currentSeaIs(north_blue)`.
- Canon-sensitive land exclusions: every land root additionally excludes `locationWithin(flevance)` and `locationWithin(germa_empire)`.
- Legacy `archives/ACTIVE_*`: not mined or used.
- Wave 1 collision pass: compared against the integrated Generic Sea territories (encounters/signals, salvage/cargo, violent danger, navigation hazards, strange material) and kept the North Blue sea roots materially tied to Ironpine, Deul, Whiteport, Blackglass or the region's kingdom/registry texture.

## Production totals

- Normal roots: **30**.
- Immediate Events: **15**.
- Scheduled Events: **18** = 10 short-thread callbacks + 8 Lifetime callbacks.
- Immediate mini-arc roots: **15/30 = 50%**.
- Dice roots: **18/30 = 60%**.
- Land / sea split: **24 land / 6 sea**.
- Exact-location locked / non-exact regional split: **9 / 21**.
- Short Scheduled threads: **exactly 5**.
- Regional Lifetime Threads: **exactly 1** (`ironpine_bell_seed`).
- New persistent runtime definitions: **none**.
- `PROPOSED_DEFINITIONS`: **none**; the isolated batch does not spend the persistent-NPC budget speculatively.
- Localization keys: **492 FR + 492 EN**.

## 30-root inventory

| Root | Surface | Eligibility context | Dice | Immediate | Continuity |
|---|---|---|---:|---:|---|
| `active_blue_north_blue_01_blackglass_black_ledger` | `land` | `tag:criminal, service:black_market, age≤401` | `no` | `yes` | `short` |
| `active_blue_north_blue_01_blackglass_rigged_table` | `land` | `location:blackglass_cove` | `yes` | `yes` | `—` |
| `active_blue_north_blue_01_clocktown_false_permit` | `land` | `tag:city, service:trade, age≤407` | `yes` | `yes` | `short` |
| `active_blue_north_blue_01_clocktown_runaway_cart` | `land` | `tag:urban` | `yes` | `yes` | `—` |
| `active_blue_north_blue_01_deul_royal_rope` | `land` | `tag:royal` | `no` | `no` | `—` |
| `active_blue_north_blue_01_gingapore_price_war` | `land` | `tag:city, service:trade` | `no` | `no` | `—` |
| `active_blue_north_blue_01_gingapore_royal_inspection` | `land` | `tag:royal, service:trade` | `no` | `no` | `—` |
| `active_blue_north_blue_01_ironpine_bell_seed` | `land` | `location:ironpine_mining_town, age≤288` | `yes` | `yes` | `Lifetime` |
| `active_blue_north_blue_01_ironpine_pay_cart` | `land` | `tag:industrial, tag:poor` | `yes` | `no` | `—` |
| `active_blue_north_blue_01_kuen_grain_bridge` | `land` | `tag:rural` | `yes` | `no` | `—` |
| `active_blue_north_blue_01_lvneel_chart_dispute` | `land` | `location:lvneel_kingdom` | `no` | `no` | `—` |
| `active_blue_north_blue_01_minion_broken_pier` | `land` | `location:minion_island` | `yes` | `no` | `—` |
| `active_blue_north_blue_01_mira_navigator_offer` | `land` | `service:crew_recruitment, age≤215, mira=known` | `no` | `yes` | `—` |
| `active_blue_north_blue_01_north_66th_drill_alarm` | `land` | `location:north_66th_branch` | `no` | `no` | `—` |
| `active_blue_north_blue_01_pepe_kingdom_toll` | `land` | `location:pepe_port` | `no` | `no` | `—` |
| `active_blue_north_blue_01_pepe_missing_manifest` | `land` | `tag:port, age≤407` | `yes` | `yes` | `short` |
| `active_blue_north_blue_01_rubeck_beached_mailboat` | `land` | `location:rubeck_island` | `yes` | `yes` | `—` |
| `active_blue_north_blue_01_sea_blackglass_fugitives` | `sea` | `Blue-wide` | `yes` | `no` | `—` |
| `active_blue_north_blue_01_sea_court_courier` | `sea` | `Blue-wide` | `no` | `yes` | `—` |
| `active_blue_north_blue_01_sea_ore_mark` | `sea` | `age≤401` | `yes` | `yes` | `short` |
| `active_blue_north_blue_01_sea_registry_duel` | `sea` | `Blue-wide` | `no` | `no` | `—` |
| `active_blue_north_blue_01_sea_shipwright_tug` | `sea` | `Blue-wide` | `yes` | `yes` | `—` |
| `active_blue_north_blue_01_sea_whiteport_parts` | `sea` | `Blue-wide` | `yes` | `no` | `—` |
| `active_blue_north_blue_01_snow_trade_icehouse` | `land` | `tag:snow, service:trade` | `no` | `no` | `—` |
| `active_blue_north_blue_01_swallow_medicine_ferry` | `land` | `location:swallow_island` | `yes` | `yes` | `—` |
| `active_blue_north_blue_01_whitecliff_lost_surveyors` | `land` | `location:whitecliff_forest` | `yes` | `yes` | `—` |
| `active_blue_north_blue_01_whitecliff_trapline` | `land` | `tag:snow, tag:wilderness` | `yes` | `no` | `—` |
| `active_blue_north_blue_01_whiteland_snow_gate` | `land` | `tag:snow, tag:royal` | `yes` | `yes` | `—` |
| `active_blue_north_blue_01_whiteport_drydock_wager` | `land` | `tag:shipyard, age≤410` | `yes` | `yes` | `short` |
| `active_blue_north_blue_01_whiteport_used_sloop` | `land` | `tag:shipyard` | `no` | `no` | `—` |

## Immediate audit

- 15 / 30 roots open a genuine same-scene continuation: **50%**.
- Every mini-arc is `Root -> I01 -> resolution`; no continue-only node and no extra monthly slot.
- `mira_navigator_offer` uses its Immediate as the actual terms/recruitment decision; declining in the root does not force the continuation.

## Dice audit

- Dice roots: **18 / 30 = 60%**, inside the requested 55–65% band.
- Root checks use `strength`, `agility`, `observation`, `navigation`, `intelligence` and `charisma` according to the physical/social uncertainty.
- Thresholds are Standard `11` or Difficult `14`.
- Failures carry Health, Ship Health, lost position/opportunity or a worse scene; critical failures are visibly worse.
- Negative Ship Health outcomes carry `shipDamageCause: accident`.
- Reputation changes are positive-only; no Marine bounty risk exists because the batch changes no bounty at all.

## Five short Scheduled threads

All five are portable callbacks (`scheduledReach: unrestricted`) so leaving North Blue cannot strand a due node. They remain regional through the originating History and explicit North Blue callback text.

```text
1. whiteport_drydock_wager
   -> +3m  st_drydock_s02_return
   -> +6m  st_drydock_s03_launch
   total: 9 months

2. clocktown_false_permit
   -> +4m  st_permit_s02_registry
   -> +8m  st_permit_s03_verdict
   total: 12 months

3. pepe_missing_manifest
   -> +6m  st_manifest_s02_claim
   -> +6m  st_manifest_s03_settlement
   total: 12 months

4. blackglass_black_ledger
   -> +9m  st_ledger_s02_alias
   -> +9m  st_ledger_s03_burned_page
   total: 18 months

5. sea_ore_mark
   -> +12m st_ore_s02_invoice
   -> +6m  st_ore_s03_owner
   total: 18 months
```

Every lived Outcome schedules at most one next chapter. No seed pre-schedules L2 + L3 and no sibling future chapters are queued together. Start-age caps ensure a normally surviving V1 career can receive the final callback before the 420-month horizon.

## Regional Lifetime — Ironpine Deep-Shaft Bell

- Seed: `active_blue_north_blue_01_ironpine_bell_seed`.
- Seed gate: Ironpine, Active, North Blue, `ageMonths <= 288`.
- Durable anchor: Ironpine's deep-shaft warning bell, rescue conduit and the safety practice created after the first collapse.
- No persistent NPC or new system is required; branch memory is carried by History and Scheduled causality.
- Distinct Scheduled definitions: **8**.
- Longest lived path after seed: **6 Scheduled returns**.
- Intended span: **126 months / 10.5 years** from seed; with the seed cap, normal completion occurs by age 34.5 at latest.
- Structural divergence points: **2**, each reconverging before another split.

```text
ironpine_bell_seed
  -> +18m lt_s01_bell_letter
       ├─ reinforce -> +18m lt_s02_safe_tunnel
       └─ reopen    -> +18m lt_s02_fast_reopen
                         \ /
                         +24m lt_s03_first_winter
                              ├─ watch crews -> +24m lt_s04_watch_crews
                              └─ output      -> +24m lt_s04_output_pressure
                                                \ /
                                                +18m lt_s05_public_bell
                                                     -> +24m lt_s06_last_report
```

All Lifetime callbacks are portable correspondence/news. A player may leave North Blue without creating a dead Scheduled node.

## Ship / recruitment opportunities

- `whiteport_used_sloop`: a real authored ship opportunity; `Buy the sloop` is visible but gated by existing `canAcquireShip(sloop)` and resolves through `buyShip` at the existing market price.
- `mira_navigator_offer`: age-15-to-17 North Blue port recruitment opportunity using existing persistent NPC `mira`, character-first recruitment, `canRecruitNpc`, relationship and `setNpcStatus(crew)`.
- No extra recruit definition is silently added. Broader North Blue recruit variety should come from a dedicated shared-cast integration pass, not this isolated batch.

## Canon / timeline notes

- No major canon character appears.
- Germa is excluded from every land root; no Germa military/research scene is authored because this batch lacks a sufficiently safe exact availability window.
- Flevance is excluded from every land root for the same reason; its canonical condition is not guessed.
- Minion Island receives only a generic pier failure with no named canon actor or canon outcome.
- Rubeck and Swallow use only current V1 location/service texture.

## Restrictive eligibility / starvation risk

- Exact-location roots: **9**. They add identity but do not carry the regional pool alone.
- Non-exact roots: **21**, satisfying the majority broad-regional requirement.
- Six sea roots require `isAtSea + hasShip`; institutional/passenger sea states depend on other integrated Active pools.
- `mira_navigator_offer` is intentionally narrow: `180 <= ageMonths <= 215`, Mira known, North Blue land, crew-recruitment service; its recruitment Choice still uses `canRecruitNpc`.
- The five short-thread seeds and the Lifetime seed have age caps solely to avoid starting a callback graph too close to the V1 horizon.
- `north_66th_drill_alarm` is highly local and may be rare because the Marine base is non-dockable; it is flavor coverage, not starvation-critical coverage.
- No fallback Event is added. This batch supplements integrated Generic Sea/Career/system pools and does not replace their starvation safety.

## Mechanical / scope audit

- No negative Reputation.
- No bounty Effect.
- No career affiliation/rank/title change.
- No Reverse Mountain reference or movement.
- No `moveToLocation`, route state, second navigation system, ArcState/QuestState, profession/business/fleet/cell state, powerLevel, or Conqueror acquisition.
- No new Item, Ship chassis, Trait, Flag, NPC or CrewRole definition.
- Risk consequences vary across Health, Ship Health, Reputation, NPC relationship, Berrys, occasional Stats, opportunity and History/Scheduled outcomes.

## Localization

- `docs/content/events/v2/batches/ACTIVE_BLUE_NORTH_BLUE_01/localization.fr.json`
- `docs/content/events/v2/batches/ACTIVE_BLUE_NORTH_BLUE_01/localization.en.json`

Every localization key referenced by the 63 EventDefinitions exists in both fragments. Shared integration must merge these namespaced fragments into the runtime FR/EN dictionaries, or use the repository's future batch-locale loader.

## Validation performed in worker package

- All 63 Event JSON files parse; filename = Event ID; all IDs use the batch prefix.
- 30 Normal / 15 Immediate / 18 Scheduled.
- 15/30 Immediate roots; 18/30 Dice roots.
- 5 short threads verified at 9/12/12/18/18 months, with one-next-node scheduling only.
- Lifetime graph verified acyclic: 8 Scheduled definitions, 6 returns on every complete path, 126-month maximum lived span.
- All queued Immediate targets exist and are Immediate.
- All Scheduled targets exist and are Scheduled.
- Every root contains `careerPhaseIs(active)` + `currentSeaIs(north_blue)`.
- Every land root excludes Flevance and Germa.
- All 492 referenced FR/EN keys exist; no orphan keys in the fragments.
- Root bodies are 20–45 words; Immediate/Scheduled bodies 12–40; Choice labels 2–10; Outcomes 5–25 in both languages.
- No forbidden movement/career/bounty effect and no negative Reputation.
- Every negative Ship Health outcome has a valid `shipDamageCause`.

Repository-level commands could not be executed because this environment has read access to GitHub but no network-enabled repository checkout. After extraction/merge, still run:

```bash
npm run validate-content
npm test
npm run build
```

## Exact file inventory

### Runtime EventDefinitions

- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_blackglass_black_ledger.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_blackglass_black_ledger_i01_missing_page.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_blackglass_rigged_table.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_blackglass_rigged_table_i01_locked_door.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_clocktown_false_permit.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_clocktown_false_permit_i01_second_stamp.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_clocktown_runaway_cart.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_clocktown_runaway_cart_i01_broken_axle.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_deul_royal_rope.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_gingapore_price_war.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_gingapore_royal_inspection.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_ironpine_bell_seed.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_ironpine_bell_seed_i01_rescue_gallery.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_ironpine_pay_cart.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_kuen_grain_bridge.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_lt_s01_bell_letter.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_lt_s02_fast_reopen.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_lt_s02_safe_tunnel.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_lt_s03_first_winter.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_lt_s04_output_pressure.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_lt_s04_watch_crews.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_lt_s05_public_bell.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_lt_s06_last_report.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_lvneel_chart_dispute.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_minion_broken_pier.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_mira_navigator_offer.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_mira_navigator_offer_i01_terms.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_north_66th_drill_alarm.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_pepe_kingdom_toll.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_pepe_missing_manifest.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_pepe_missing_manifest_i01_wet_rope.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_rubeck_beached_mailboat.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_rubeck_beached_mailboat_i01_open_letter.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_sea_blackglass_fugitives.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_sea_court_courier.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_sea_court_courier_i01_trailing_sail.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_sea_ore_mark.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_sea_ore_mark_i01_tug_claim.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_sea_registry_duel.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_sea_shipwright_tug.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_sea_shipwright_tug_i01_split_hawser.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_sea_whiteport_parts.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_snow_trade_icehouse.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_st_drydock_s02_return.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_st_drydock_s03_launch.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_st_ledger_s02_alias.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_st_ledger_s03_burned_page.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_st_manifest_s02_claim.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_st_manifest_s03_settlement.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_st_ore_s02_invoice.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_st_ore_s03_owner.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_st_permit_s02_registry.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_st_permit_s03_verdict.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_swallow_medicine_ferry.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_swallow_medicine_ferry_i01_missing_vial.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_whitecliff_lost_surveyors.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_whitecliff_lost_surveyors_i01_wrong_camp.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_whitecliff_trapline.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_whiteland_snow_gate.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_whiteland_snow_gate_i01_last_cart.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_whiteport_drydock_wager.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_whiteport_drydock_wager_i01_frozen_switch.json`
- `src/game/content/events/v2/ordinary/ACTIVE_BLUE_NORTH_BLUE_01/active_blue_north_blue_01_whiteport_used_sloop.json`

### Namespaced support

- `docs/content/events/v2/batches/ACTIVE_BLUE_NORTH_BLUE_01/MANIFEST.md`
- `docs/content/events/v2/batches/ACTIVE_BLUE_NORTH_BLUE_01/localization.fr.json`
- `docs/content/events/v2/batches/ACTIVE_BLUE_NORTH_BLUE_01/localization.en.json`
- `docs/content/events/v2/batches/ACTIVE_BLUE_NORTH_BLUE_01/VALIDATION.json`

## Shared integration still required

1. Copy/extract the runtime directory into the repository at the exact namespaced path.
2. Merge the FR/EN localization fragments into the global runtime dictionaries using the repository's integration path.
3. Run `npm run validate-content`, `npm test`, and `npm run build` on current `dev`.
4. Only after accepted integration should the V2 concept/migration ledgers be updated by the sequential integration pass.
