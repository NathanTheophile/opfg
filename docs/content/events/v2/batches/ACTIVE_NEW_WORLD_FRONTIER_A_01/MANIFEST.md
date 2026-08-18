# MANIFEST — ACTIVE_NEW_WORLD_FRONTIER_A_01

## Batch identity

- Batch: `ACTIVE_NEW_WORLD_FRONTIER_A_01`
- Territory: Active / New World / Frontier A
- Source branch: `dev`
- Authoring baseline HEAD: `1da630527f7800467b4c3196fc35c7cafb015ee0`
- Current Content Schema checked: `16`
- Runtime directory: `src/game/content/events/v2/ordinary/ACTIVE_NEW_WORLD_FRONTIER_A_01/`
- Localization support: namespaced FR/EN fragments in this batch support directory.
- No push / commit / PR performed.

## Scope

Ordinary local New World coverage for Raijin Island, Risky Red Island, Mystoria Island, and the Dressrosa cluster (`dressrosa`, `dressrosa_kingdom`, `green_bit`).

Excluded: New World destination-selection logic, route state, career changes, Bounty Hunter, new persistent NPC/Item/Ship/Trait definitions, gated New World locations, canon-arc resolution, major canon-character dependency.

## Counts

- Normal roots: **20**
- Raijin roots: **5**
- Risky Red roots: **5**
- Mystoria roots: **5**
- Dressrosa-cluster roots: **5**
- Dice roots: **12/20 = 60%**
- Immediate Events: **9**
- Roots opening Immediate mini-arcs: **9/20 = 45%**
- Scheduled Events: **0**
- Total runtime EventDefinitions: **29**

## Root Events

- `active_new_world_frontier_a_01_raijin_grounding_bells` — The Grounding Bells — raijin_island — Dice — Immediate
- `active_new_world_frontier_a_01_raijin_charged_floodway` — The Charged Floodway — raijin_island — Dice — Immediate
- `active_new_world_frontier_a_01_raijin_split_storm_mast` — The Split Storm Mast — raijin_island — Dice — Immediate
- `active_new_world_frontier_a_01_raijin_metal_packs` — Metal in the Packs — raijin_island — deterministic
- `active_new_world_frontier_a_01_raijin_mooring_chain_arc` — Arc Along the Mooring Chains — raijin_island — Dice
- `active_new_world_frontier_a_01_risky_red_cliff_rope` — The Cliff Rope — risky_red_island — Dice — Immediate
- `active_new_world_frontier_a_01_risky_red_scarlet_thicket` — The Scarlet Thicket — risky_red_island — Dice
- `active_new_world_frontier_a_01_risky_red_expedition_cache` — The Buried Expedition Cache — risky_red_island — Dice
- `active_new_world_frontier_a_01_risky_red_canyon_gust` — The Canyon Gust — risky_red_island — Dice — Immediate
- `active_new_world_frontier_a_01_risky_red_cracking_camp` — The Camp on Cracking Ground — risky_red_island — deterministic
- `active_new_world_frontier_a_01_mystoria_damaged_cargo_auction` — The Damaged Cargo Auction — mystoria_island — Dice — Immediate
- `active_new_world_frontier_a_01_mystoria_shifted_tide_board` — The Shifted Tide Board — mystoria_island — Dice — Immediate
- `active_new_world_frontier_a_01_mystoria_last_room` — The Last Room — mystoria_island — deterministic
- `active_new_world_frontier_a_01_mystoria_pier_work_call` — Hands Needed at the Landing — mystoria_island — deterministic
- `active_new_world_frontier_a_01_mystoria_painted_buoys` — The Repainted Buoys — mystoria_island — deterministic
- `active_new_world_frontier_a_01_dressrosa_runaway_flower_cart` — The Runaway Flower Cart — dressrosa_kingdom — Dice — Immediate
- `active_new_world_frontier_a_01_dressrosa_silk_crate_dispute` — The Silk Crate Dispute — dressrosa — deterministic
- `active_new_world_frontier_a_01_dressrosa_green_bit_lost_survey` — The Broken Survey Line — green_bit — Dice — Immediate
- `active_new_world_frontier_a_01_dressrosa_balcony_overbooked` — The Overbooked Balcony — dressrosa_kingdom — deterministic
- `active_new_world_frontier_a_01_dressrosa_quay_painting_blockade` — Paint Across the Quay — dressrosa — deterministic

## Immediate Events

- `active_new_world_frontier_a_01_raijin_grounding_bells_i01_live_frames`
- `active_new_world_frontier_a_01_raijin_charged_floodway_i01_rooftop_gap`
- `active_new_world_frontier_a_01_raijin_split_storm_mast_i01_falling_crossbar`
- `active_new_world_frontier_a_01_risky_red_cliff_rope_i01_split_anchor`
- `active_new_world_frontier_a_01_risky_red_canyon_gust_i01_rolling_pack`
- `active_new_world_frontier_a_01_mystoria_damaged_cargo_auction_i01_torn_lot`
- `active_new_world_frontier_a_01_mystoria_shifted_tide_board_i01_departing_skiff`
- `active_new_world_frontier_a_01_dressrosa_runaway_flower_cart_i01_scattered_baskets`
- `active_new_world_frontier_a_01_dressrosa_green_bit_lost_survey_i01_ravine_signal`

## Dice roots

- `active_new_world_frontier_a_01_raijin_grounding_bells` — 2 Dice choices
- `active_new_world_frontier_a_01_raijin_charged_floodway` — 2 Dice choices
- `active_new_world_frontier_a_01_raijin_split_storm_mast` — 2 Dice choices
- `active_new_world_frontier_a_01_raijin_mooring_chain_arc` — 2 Dice choices
- `active_new_world_frontier_a_01_risky_red_cliff_rope` — 2 Dice choices
- `active_new_world_frontier_a_01_risky_red_scarlet_thicket` — 2 Dice choices
- `active_new_world_frontier_a_01_risky_red_expedition_cache` — 2 Dice choices
- `active_new_world_frontier_a_01_risky_red_canyon_gust` — 2 Dice choices
- `active_new_world_frontier_a_01_mystoria_damaged_cargo_auction` — 2 Dice choices
- `active_new_world_frontier_a_01_mystoria_shifted_tide_board` — 2 Dice choices
- `active_new_world_frontier_a_01_dressrosa_runaway_flower_cart` — 2 Dice choices
- `active_new_world_frontier_a_01_dressrosa_green_bit_lost_survey` — 2 Dice choices

## Travel audit

- Every Normal root requires `careerPhaseIs(active)`.
- Every Normal root requires `isOnLand`.
- Every root is scoped by `locationIs` to one owned destination/sub-location; no root can remain eligible after departure merely because `locationId` persists at sea.
- No `moveToLocation`, `recoverTravel`, route-state, New World destination-selection, or travel-system effect is authored.
- No Scheduled content exists, so there is no delayed tiny-location deadlock surface.

## Location / identity audit

### Raijin Island

Uses only the validated `coastal`, `dangerous`, `wilderness` identity and the brief's extreme-weather/electric-hazard framing. Scenes emphasize grounding, discharge timing, exposed terrain, storm infrastructure, crew preparation and mooring pressure rather than passive HP tax. No market/service assumption is introduced.

### Risky Red Island

Uses only harsh wilderness/expedition pressure: cliff anchors, unstable thickets, salvage cache risk, canyon gusts and cracking camp ground. No settlement/service assumption is introduced.

### Mystoria Island

Treats the uncertain-source island as a flexible coastal landing/trade/lodging context using only its current services: `food`, `lodging`, `general_goods`, `trade`, `crew_recruitment`. No hard canon history, politics, named institution or unique lore claim is invented.

### Dressrosa cluster

Ordinary local-life only: port trade, flower-street hazard, tourist balcony crowding, independent crews and Green Bit survey trouble. No Straw Hat/Doflamingo/Riku/Tontatta story resolution, no major canon character, and no canonical decisive outcome is touched.

## Crew / ship references

Existing CrewRole references only, always as optional `availableIf` advantages:

- `navigator` — Raijin storm timing, Mystoria tide/buoy reading, Green Bit bearing.
- `shipwright` — Raijin storm-mast/mooring isolation.
- `foreman` — Mystoria cargo staging, Dressrosa quay flow.

Ship reference:

- one optional `hasShip` choice in `..._raijin_mooring_chain_arc` lets the player prioritize their own mooring.
- no ship acquisition, replacement, damage, Crew mutation, recruitment or role assignment occurs.

## Reputation / bounty audit

- Reputation effects are **non-negative only** (`+1`), used for publicly visible local help or competent intervention.
- No Reputation decrease exists.
- No `setBounty` / `modifyBounty` effect exists, so active Marine cannot receive bounty from this batch.
- No career/rank/title effect exists.

## Persistent definitions

`PROPOSED_DEFINITIONS`: **none**.

All local traders, porters, surveyors, travelers and crew members are Event-local fiction. No new persistent NPC, Item, Trait, Flag, organization, profession, quest or route state is introduced.

## Localization

Batch-owned fragments:

- `localization.fr.json`
- `localization.en.json`

They contain exactly the keys referenced by this batch. Global locale merge remains integration work; `apply_to_repo.py` performs collision-checked merge.

## Runtime foundation observation

The Wave 5 worker contract says `gunner`, `fighter`, and `quartermaster` must not be removed. Current `dev` `catalogFactory.ts` at the audited HEAD does not expose those three roles in `crewRoles`; it exposes `navigator`, `medic`, `shipwright`, `recruiter`, `first_mate`, `helmsman`, `cook`, `musician`, `scholar`, and `foreman`. This batch does **not** change that out-of-scope runtime foundation and does not depend on the missing roles; it uses only roles confirmed in current `dev`.
