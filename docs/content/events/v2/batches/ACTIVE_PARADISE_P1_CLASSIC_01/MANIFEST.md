# ACTIVE_PARADISE_P1_CLASSIC_01 — Manifest / Worker Report

## Baseline

- Repository: `NathanTheophile/opfg`
- Branch: `dev`
- Observed HEAD: `63b93cead6bf7b845839c40371048005e3ca7a08`
- Observed Content Schema: `16`
- Route authority: History contains `active_paradise_route_start_p1_classic`.
- Scope: content + localization only. No engine/schema/save/UI/navigation changes.
- No push / commit / PR performed.

## Production summary

| Metric | Result |
|---|---:|
| Normal roots | **50** |
| Main-stop coverage | **5 × 10 stops** |
| Dice roots | **30 / 50 = 60%** |
| Dice ordinary failures with authored consequence | **30 / 30** |
| Immediate descendants | **6** |
| Route-wide Scheduled arcs | **1** |
| Scheduled temporal layers | **L1 root + L2 + L3 + L4** |
| Recruitment roots | **0** |
| New persistent definitions | **0** |
| Optional Skypiea roots | **0** (intentionally deferred; does not reduce main-stop floor) |

## Per-stop root coverage

| Stop | Roots | Dice roots |
|---|---:|---:|
| `cactus_island` | 5 | 3 |
| `whisky_peak` | 5 | 3 |
| `giant_island_little_garden` | 5 | 3 |
| `drum_island` | 5 | 3 |
| `alabasta_kingdom` | 5 | 3 |
| `jaya_island` | 5 | 3 |
| `long_ring_long_land` | 5 | 3 |
| `water_seven` | 5 | 3 |
| `thriller_bark` | 5 | 3 |
| `sabaody_archipelago` | 5 | 3 |

All 50 roots require both `careerPhaseIs(active)` and `hasPlayed(active_paradise_route_start_p1_classic)`, then exact `locationIs(...)` ownership.

## Route-wide Scheduled graph

```text
L1 Normal @ Cactus Island
active_paradise_p1_classic_01_cactus_backward_marker
  -- +2 months -->
L2 Scheduled
active_paradise_p1_classic_01_route_markers_l2_split_pennant
  -- +2 months -->
L3 Scheduled
active_paradise_p1_classic_01_route_markers_l3_scraped_arrow
  -- +2 months -->
L4 Scheduled terminal
active_paradise_p1_classic_01_route_markers_l4_clean_board
```

- Every L1 outcome schedules only L2.
- Every L2 outcome schedules only L3.
- Every L3 outcome schedules only L4.
- L4 schedules nothing.
- `scheduledReach: unrestricted` prevents tiny-location starvation.
- `cancelIf` cancels if the player leaves Paradise/Sky before resolution.
- Every Scheduled node remains gated by Active + route-start History.
- No route flag, quest state or persistent route ID exists.

## Shared-stop History-gate audit

| Shared stop in this route | Roots | Route-start History gate |
|---|---:|---|
| `long_ring_long_land` | 5 | PASS |
| `water_seven` | 5 | PASS |
| `sabaody_archipelago` | 5 | PASS |

The same gate is present on all seven non-shared main stops as defensive route ownership.

## CrewRole reference audit

Referenced current-runtime roles only:

- `medic` — Drum/Jaya expertise choices;
- `navigator` — Drum/Long Ring expertise choices;
- `helmsman` — Long Ring current-holder expertise;
- `shipwright` — Water Seven/Sabaody technical expertise;
- `first_mate` — Sabaody traffic coordination.

No `gunner`, `fighter`, `quartermaster` reference. No annual role power is encoded as an Event Choice. No passive/global role bonus is duplicated in content.

## Recruitment audit

**0 recruitment roots.** No reachable `setNpcStatus(status: crew)` exists in this batch. Therefore the Recruiter power receives no route-local candidate from this batch, and no candidate/Role coupling can occur.

## Seeded-NPC audit

No persistent NPC participates in this batch. All local actors are throwaway prose roles. Therefore:

- no new `NpcDefinition`;
- no fixed CrewRole identity;
- no seeded personal fallback name hardcoded in prose;
- no NPC interpolation requirement is introduced.

## Canon / timeline notes

- Everyday conflicts stay in canon interstices: docks, caravans, clinics, markets, wilderness, shipyards and local transport.
- No Straw Hat / major canon protagonist is cast.
- No major canon outcome is replaced or contradicted.
- Sabaody is treated as a dense convergence environment, not as a substitute canon climax.
- Little Garden, Drum, Alabasta, Jaya and Thriller Bark use local physical/social pressures without taking over their canon resolutions.

## Starvation / dead-schedule audit

- **Local pool floor:** exactly 5 one-shot route-owned roots at every main stop.
- **Departure rule support:** every stop has genuine local-life roots rather than arrival/departure reskins.
- **Scheduled arc:** no tiny `locationIs` gate on L2–L4; `unrestricted` reach plus Paradise/Sky cancellation avoids a due node waiting forever on one island.
- **No orphan target:** every `queueImmediateEvent` and `scheduleEvent` target is included in the package.
- **No extra Scheduled structures:** only the route-marker arc uses Scheduled descendants.
- **Choice resolvability:** each Event contains at least two unconditional Choices; role-gated Choices are additive only.

## FR / EN audit

- Every generated `titleKey` / `textKey` is present in both locale patch files.
- Root bodies were authored to the current short Situation → Reaction style.
- `verify-package.mjs` checks FR/EN key parity, current text budgets, route gates, Choice resolvability, Dice failure stakes, CrewRole references, internal targets and exact Scheduled topology locally.

## Files

- `events/*.json` — runtime EventDefinition files.
- `localization/fr.patch.json` — flat FR locale additions.
- `localization/en.patch.json` — flat EN locale additions.
- `manifest.json` — machine-readable coverage/audit data.
- `apply-active-paradise-p1-classic-01.mjs` — collision-safe integration helper, run from repo root.
- `verify-package.mjs` — package-local structural verifier.

## Integration

From repository root, with this directory available locally:

```bash
node /path/to/ACTIVE_PARADISE_P1_CLASSIC_01/apply-active-paradise-p1-classic-01.mjs
npm run validate-content
npm test
npm run build
```

## Validation status in this worker environment

Package-local structural validation is run and recorded in `VALIDATION.txt`.

The repository itself is available here through the GitHub connector, not as a writable local checkout. Therefore the three repository commands below **cannot truthfully be executed in this environment** and are left explicitly pending after application:

```text
npm run validate-content  NOT RUN — no local repository checkout
npm test                  NOT RUN — no local repository checkout
npm run build             NOT RUN — no local repository checkout
```

## Root IDs

- `active_paradise_p1_classic_01_cactus_runaway_skiff`
- `active_paradise_p1_classic_01_cactus_cistern_queue`
- `active_paradise_p1_classic_01_cactus_backward_marker`
- `active_paradise_p1_classic_01_cactus_signal_fire`
- `active_paradise_p1_classic_01_cactus_thorn_market`
- `active_paradise_p1_classic_01_whisky_swapped_berths`
- `active_paradise_p1_classic_01_whisky_cart_brawl`
- `active_paradise_p1_classic_01_whisky_rooftop_chit`
- `active_paradise_p1_classic_01_whisky_poster_copyist`
- `active_paradise_p1_classic_01_whisky_hidden_satchel`
- `active_paradise_p1_classic_01_little_garden_beast_trail`
- `active_paradise_p1_classic_01_little_garden_hot_pool`
- `active_paradise_p1_classic_01_little_garden_fallen_canopy`
- `active_paradise_p1_classic_01_little_garden_food_swarm`
- `active_paradise_p1_classic_01_little_garden_ravine_crossing`
- `active_paradise_p1_classic_01_drum_medicine_sled`
- `active_paradise_p1_classic_01_drum_cracking_bridge`
- `active_paradise_p1_classic_01_drum_clinic_triage`
- `active_paradise_p1_classic_01_drum_whiteout_markers`
- `active_paradise_p1_classic_01_drum_market_awning`
- `active_paradise_p1_classic_01_alabasta_caravan_shade`
- `active_paradise_p1_classic_01_alabasta_sluice_jam`
- `active_paradise_p1_classic_01_alabasta_sunk_axle`
- `active_paradise_p1_classic_01_alabasta_cistern_ration`
- `active_paradise_p1_classic_01_alabasta_cargo_seal`
- `active_paradise_p1_classic_01_jaya_rigging_wager`
- `active_paradise_p1_classic_01_jaya_salvage_diver`
- `active_paradise_p1_classic_01_jaya_false_sky_charts`
- `active_paradise_p1_classic_01_jaya_falling_debris`
- `active_paradise_p1_classic_01_jaya_salvage_auction`
- `active_paradise_p1_classic_01_long_ring_stranded_ferry`
- `active_paradise_p1_classic_01_long_ring_tangled_herd`
- `active_paradise_p1_classic_01_long_ring_stilt_race`
- `active_paradise_p1_classic_01_long_ring_tide_camp`
- `active_paradise_p1_classic_01_long_ring_anchor_circle`
- `active_paradise_p1_classic_01_water_seven_runaway_punt`
- `active_paradise_p1_classic_01_water_seven_scaffold_rivets`
- `active_paradise_p1_classic_01_water_seven_tide_warning`
- `active_paradise_p1_classic_01_water_seven_load_priority`
- `active_paradise_p1_classic_01_water_seven_timber_lot`
- `active_paradise_p1_classic_01_thriller_false_lanterns`
- `active_paradise_p1_classic_01_thriller_chained_gate`
- `active_paradise_p1_classic_01_thriller_slipping_chain`
- `active_paradise_p1_classic_01_thriller_dining_hall`
- `active_paradise_p1_classic_01_thriller_pounding_chest`
- `active_paradise_p1_classic_01_sabaody_bubble_lift`
- `active_paradise_p1_classic_01_sabaody_coating_leak`
- `active_paradise_p1_classic_01_sabaody_root_channels`
- `active_paradise_p1_classic_01_sabaody_fake_broker`
- `active_paradise_p1_classic_01_sabaody_grove_toll`
