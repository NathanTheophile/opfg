# ACTIVE_GENERIC_LAND_04_CONFLICT — MANIFEST / HANDOFF

## Baseline read before authoring

- Repository: `NathanTheophile/opfg`
- Branch: `dev`
- Exact HEAD read: `5d02a23157837caa356c60e327a05ff5be3bd111`
- Content Schema: `15`
- Wave profile: Ordinary Generic Land / Conflict
- Source pack baseline `dc3819121ae8e74aaa898afefedbc7cdb5666df8` was treated as informational only.

## Scope

Generic Active land conflict: robbery, extortion, brawls, corrupt/hostile authority, gang pressure, coercion, pursuit, protection and tactical/de-escalation alternatives. No polite-social, ordinary-commerce, clue-first mystery or surreal/comedy premise is used as a root identity.

## Structural counts

- Normal roots: **20**
- Immediate EventDefinitions: **18**
- Scheduled EventDefinitions: **0**
- `scheduleEvent` Effects: **0**
- Lifetime Threads: **0**
- Roots opening a meaningful Immediate mini-arc: **15/20 = 75%**
- Root → I1 → I2 mini-arcs: **3** (`hand_in_pocket`, `warehouse_shield`, `wrong_face`)
- Dice roots: **13/20 = 65%**
- Every Dice root contains at least **2 materially distinct Dice approaches**.

## Root Event IDs

- `active_generic_land_04_conflict_hand_in_pocket`
- `active_generic_land_04_conflict_dock_toll`
- `active_generic_land_04_conflict_broken_stall`
- `active_generic_land_04_conflict_planted_evidence`
- `active_generic_land_04_conflict_alley_knife`
- `active_generic_land_04_conflict_spilled_brawl`
- `active_generic_land_04_conflict_snatch_and_run`
- `active_generic_land_04_conflict_warehouse_shield`
- `active_generic_land_04_conflict_wrong_colors`
- `active_generic_land_04_conflict_dust_duel`
- `active_generic_land_04_conflict_rough_arrest`
- `active_generic_land_04_conflict_rooftop_stones`
- `active_generic_land_04_conflict_cart_seizure`
- `active_generic_land_04_conflict_street_chains`
- `active_generic_land_04_conflict_dock_blades`
- `active_generic_land_04_conflict_burning_awning`
- `active_generic_land_04_conflict_crackdown_riot`
- `active_generic_land_04_conflict_wrong_face`
- `active_generic_land_04_conflict_street_toll_asset`
- `active_generic_land_04_conflict_saw_too_much`

## Immediate Event IDs

- `active_generic_land_04_conflict_hand_in_pocket_i01_cornered`
- `active_generic_land_04_conflict_hand_in_pocket_i02_purse`
- `active_generic_land_04_conflict_dock_toll_i01_chain`
- `active_generic_land_04_conflict_broken_stall_i01_collectors`
- `active_generic_land_04_conflict_planted_evidence_i01_search`
- `active_generic_land_04_conflict_alley_knife_i01_second_man`
- `active_generic_land_04_conflict_spilled_brawl_i01_bench`
- `active_generic_land_04_conflict_snatch_and_run_i01_cart`
- `active_generic_land_04_conflict_warehouse_shield_i01_crate`
- `active_generic_land_04_conflict_warehouse_shield_i02_two_lines`
- `active_generic_land_04_conflict_wrong_colors_i01_mark`
- `active_generic_land_04_conflict_rough_arrest_i01_witnesses`
- `active_generic_land_04_conflict_rooftop_stones_i01_stair`
- `active_generic_land_04_conflict_cart_seizure_i01_wheel`
- `active_generic_land_04_conflict_street_chains_i01_crossfire`
- `active_generic_land_04_conflict_wrong_face_i01_wall`
- `active_generic_land_04_conflict_wrong_face_i02_release`
- `active_generic_land_04_conflict_saw_too_much_i01_pursuit`

## Dice roots

- `active_generic_land_04_conflict_hand_in_pocket`
- `active_generic_land_04_conflict_dock_toll`
- `active_generic_land_04_conflict_broken_stall`
- `active_generic_land_04_conflict_planted_evidence`
- `active_generic_land_04_conflict_alley_knife`
- `active_generic_land_04_conflict_spilled_brawl`
- `active_generic_land_04_conflict_snatch_and_run`
- `active_generic_land_04_conflict_warehouse_shield`
- `active_generic_land_04_conflict_wrong_colors`
- `active_generic_land_04_conflict_rough_arrest`
- `active_generic_land_04_conflict_street_chains`
- `active_generic_land_04_conflict_wrong_face`

- `active_generic_land_04_conflict_saw_too_much`

## Immediate mini-arc roots

- `active_generic_land_04_conflict_hand_in_pocket`
- `active_generic_land_04_conflict_dock_toll`
- `active_generic_land_04_conflict_broken_stall`
- `active_generic_land_04_conflict_planted_evidence`
- `active_generic_land_04_conflict_alley_knife`
- `active_generic_land_04_conflict_spilled_brawl`
- `active_generic_land_04_conflict_snatch_and_run`
- `active_generic_land_04_conflict_warehouse_shield`
- `active_generic_land_04_conflict_wrong_colors`
- `active_generic_land_04_conflict_rough_arrest`
- `active_generic_land_04_conflict_rooftop_stones`
- `active_generic_land_04_conflict_cart_seizure`
- `active_generic_land_04_conflict_street_chains`
- `active_generic_land_04_conflict_wrong_face`
- `active_generic_land_04_conflict_saw_too_much`

## Restrictive eligibility

All roots require `careerPhaseIs(active)` + `isOnLand`. Seven roots add premise-essential contextual eligibility:

- `active_generic_land_04_conflict_hand_in_pocket` → `berriesAtLeast(500)` (theft loss must be executable)
- `active_generic_land_04_conflict_dock_toll` → `locationHasTag(port)`
- `active_generic_land_04_conflict_broken_stall` → `locationHasService(trade)`
- `active_generic_land_04_conflict_warehouse_shield` → `locationHasTag(trade|industrial|port)`
- `active_generic_land_04_conflict_dock_blades` → `locationHasTag(port)`
- `active_generic_land_04_conflict_crackdown_riot` → `locationHasTag(urban)`
- `active_generic_land_04_conflict_saw_too_much` → `childhood_friend` status `known|crew`

The other **13/20 roots** require only `careerPhaseIs(active)` + `isOnLand`; no root uses an exact Location. No root uses `locationIs`.

## Persistent definitions / catalog usage

### Existing definitions used

- Careers: `civilian`, `pirate`, `marine`, `revolutionary` through broad compatibility; a few optional Marine-only Choices use `careerAffiliationIs(marine)`.
- Traits in optional Choices only: `protective`, `deceptive`, `proud`.
- Existing Item: `timber` in one optional asset-sacrifice Choice.
- Existing persistent NPC: `childhood_friend` in one gated callback root (`known` or `crew` only).
- Existing Conditions: `hasEquippedWeapon`, `berriesAtLeast`, Location tag/service Conditions.

### New persistent definitions

**None.**

### PROPOSED_DEFINITIONS

**None.** Throwaway guards, thugs, merchants, debtors, travelers and bystanders remain Event-local prose.

## Consequence audit

The batch deliberately varies consequences through:

- Health injury in physical escalation and critical failures;
- Berrys paid, stolen/profited or sacrificed in coercive/resource branches;
- monotonic positive Reputation when public notoriety is earned;
- one existing Item/asset loss (`timber`);
- meaningful `childhood_friend` Relationship changes in a gated callback conflict;
- History/Outcome opportunity differences through one-shot branch resolution;
- occasional negative player Stat on a critical failure;

There is **no negative Reputation**, **no bounty effect at all** (therefore no Marine bounty risk), no career/rank/title effect, no navigation effect, no exact-destination movement and no generic career switch.

## Localization

FR/EN copy is supplied as namespaced flat fragments:

- `LOCALIZATION.fr.fragment.json`
- `LOCALIZATION.en.fragment.json`

The worker territory does not directly edit the shared global locale files. The worker apply script copies only namespaced territory. A separate explicit sequential-integration helper can collision-check and merge these fragments into shared locale files later.

## Collision / starvation review

- Territory is intentionally conflict-first; ordinary bargaining, social embarrassment, investigations and weirdness are excluded as root identities.
- Seven context/resource-gated roots are supplements only; 13 broadly eligible land roots reduce starvation risk.
- No exact named Location is required.
- No Scheduled chain can steal later monthly slots.
- No new persistent cast competes with recruitment/career batches.

Potential integration collision risk is limited to concept similarity with other Wave-2 Generic Land batches. Review by root premise is still required at sequential integration because those sibling batches may land after this authored HEAD.

## Validation

Local deterministic validator checks:

- 20 Normal roots / 18 Immediate / 0 Scheduled;
- `careerPhaseIs(active)` + `isOnLand` on every root;
- 15 mini-arc roots and exactly three I2 extensions;
- 13 Dice roots, each with >=2 Dice Choices;
- all Dice result quartets;
- Immediate reachability / no cycles / no orphan Immediate;
- zero `scheduleEvent`;
- zero bounty effects;
- zero negative Reputation;
- zero movement/career/rank/title effects;
- FR/EN key completeness;
- unconditional resolvability per Event.

Repository-level `npm run validate-content`, `npm test`, and `npm run build` still require execution **after applying this payload to a real checkout**, because this worker environment has repository read access through the GitHub connector but no writable uncommitted checkout of `dev`.

## Shared integration still required

1. Merge FR/EN fragments into `src/game/localization/locales/fr.json` and `en.json` during sequential integration (the bundle includes a separate explicit collision-checked helper).
2. Run repository content validation/tests/build.
3. Sequentially deduplicate against any Wave-2 sibling batch integrated after `5d02a23157837caa356c60e327a05ff5be3bd111`.

No push / commit / PR is performed by this handoff.
