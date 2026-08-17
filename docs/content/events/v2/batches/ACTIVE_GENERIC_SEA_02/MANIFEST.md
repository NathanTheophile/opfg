# ACTIVE_GENERIC_SEA_02 — MANIFEST

## Batch

- Batch ID: `ACTIVE_GENERIC_SEA_02`
- Production profile: Active V1 / Ordinary Generic Sea
- Source baseline read: `dev` at `7d2d4805f07dc00990bedd51e3c673cb65fceafd`
- Exclusive theme: salvage, floating cargo, temporary supplies, useful discoveries, deck/cargo pressure, greed versus safety.
- Explicit exclusions: navigation/route/weather ownership (`SEA_01`), sea combat/pirates/creatures (`SEA_03`), civilian/merchant traffic and diplomacy (`SEA_04`), strange/absurd sea material (`SEA_05`), Scheduled/Lifetime content, exact-destination movement.
- Runtime directory: `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_02/`
- Localization namespace: `event.active_generic_sea_02_*`

## Production metrics

- Normal roots: **20**
- Immediate Events: **18**
- Scheduled Events: **0**
- Lifetime seeds: **0**
- Roots opening a meaningful Immediate mini-arc: **15/20 = 75%**
- Dice roots: **12/20 = 60%**
- L3 roots (Root → I01 → I02): **3**
- New persistent definitions: **0**
- FR localization keys: **397**
- EN localization keys: **397**

## Root IDs

- `active_generic_sea_02_adrift_coin_lockbox`
- `active_generic_sea_02_anchor_chain_drag`
- `active_generic_sea_02_barrel_raft_choice`
- `active_generic_sea_02_brass_fittings_wreckage`
- `active_generic_sea_02_canvas_patch_or_spares`
- `active_generic_sea_02_cargo_net_below_flotsam`
- `active_generic_sea_02_drifting_fuelwood`
- `active_generic_sea_02_driftwood_lattice`
- `active_generic_sea_02_empty_barrels_ballast`
- `active_generic_sea_02_floating_provision_crates`
- `active_generic_sea_02_floating_workbench`
- `active_generic_sea_02_half_sunk_manifest_case`
- `active_generic_sea_02_leaking_lamp_oil`
- `active_generic_sea_02_rope_snarl_under_rudder`
- `active_generic_sea_02_salt_caked_medicine_crate`
- `active_generic_sea_02_sealed_shipwright_resin`
- `active_generic_sea_02_sealed_water_casks`
- `active_generic_sea_02_spare_spars_cluster`
- `active_generic_sea_02_sunken_tool_chest`
- `active_generic_sea_02_torn_sail_bundle`

## Immediate mini-arc roots

- `active_generic_sea_02_adrift_coin_lockbox`
- `active_generic_sea_02_anchor_chain_drag`
- `active_generic_sea_02_brass_fittings_wreckage`
- `active_generic_sea_02_cargo_net_below_flotsam`
- `active_generic_sea_02_driftwood_lattice`
- `active_generic_sea_02_floating_provision_crates`
- `active_generic_sea_02_floating_workbench`
- `active_generic_sea_02_half_sunk_manifest_case`
- `active_generic_sea_02_leaking_lamp_oil`
- `active_generic_sea_02_rope_snarl_under_rudder`
- `active_generic_sea_02_salt_caked_medicine_crate`
- `active_generic_sea_02_sealed_shipwright_resin`
- `active_generic_sea_02_sealed_water_casks`
- `active_generic_sea_02_spare_spars_cluster`
- `active_generic_sea_02_sunken_tool_chest`

## L3 minority

- `active_generic_sea_02_sunken_tool_chest`
- `active_generic_sea_02_half_sunk_manifest_case`
- `active_generic_sea_02_cargo_net_below_flotsam`

## Dice roots

- `active_generic_sea_02_adrift_coin_lockbox`
- `active_generic_sea_02_anchor_chain_drag`
- `active_generic_sea_02_brass_fittings_wreckage`
- `active_generic_sea_02_cargo_net_below_flotsam`
- `active_generic_sea_02_driftwood_lattice`
- `active_generic_sea_02_floating_provision_crates`
- `active_generic_sea_02_half_sunk_manifest_case`
- `active_generic_sea_02_leaking_lamp_oil`
- `active_generic_sea_02_rope_snarl_under_rudder`
- `active_generic_sea_02_sealed_water_casks`
- `active_generic_sea_02_spare_spars_cluster`
- `active_generic_sea_02_sunken_tool_chest`

## Immediate Event IDs

- `active_generic_sea_02_adrift_coin_lockbox_i01`
- `active_generic_sea_02_anchor_chain_drag_i01`
- `active_generic_sea_02_brass_fittings_wreckage_i01`
- `active_generic_sea_02_cargo_net_below_flotsam_i01`
- `active_generic_sea_02_cargo_net_below_flotsam_i02`
- `active_generic_sea_02_driftwood_lattice_i01`
- `active_generic_sea_02_floating_provision_crates_i01`
- `active_generic_sea_02_floating_workbench_i01`
- `active_generic_sea_02_half_sunk_manifest_case_i01`
- `active_generic_sea_02_half_sunk_manifest_case_i02`
- `active_generic_sea_02_leaking_lamp_oil_i01`
- `active_generic_sea_02_rope_snarl_under_rudder_i01`
- `active_generic_sea_02_salt_caked_medicine_crate_i01`
- `active_generic_sea_02_sealed_shipwright_resin_i01`
- `active_generic_sea_02_sealed_water_casks_i01`
- `active_generic_sea_02_spare_spars_cluster_i01`
- `active_generic_sea_02_sunken_tool_chest_i01`
- `active_generic_sea_02_sunken_tool_chest_i02`

## Eligibility / starvation audit

Every root requires:

- `careerPhaseIs(active)`;
- `isAtSea`.

The following **13 roots** additionally require `hasShip` because their fiction or persistent consequences directly manipulate the current ship:

- `active_generic_sea_02_anchor_chain_drag`
- `active_generic_sea_02_barrel_raft_choice`
- `active_generic_sea_02_canvas_patch_or_spares`
- `active_generic_sea_02_cargo_net_below_flotsam`
- `active_generic_sea_02_drifting_fuelwood`
- `active_generic_sea_02_driftwood_lattice`
- `active_generic_sea_02_empty_barrels_ballast`
- `active_generic_sea_02_floating_workbench`
- `active_generic_sea_02_leaking_lamp_oil`
- `active_generic_sea_02_rope_snarl_under_rudder`
- `active_generic_sea_02_sealed_shipwright_resin`
- `active_generic_sea_02_spare_spars_cluster`
- `active_generic_sea_02_torn_sail_bundle`

The remaining **7 roots** remain usable at sea without a personal ship. No root is restricted to a precise sea, island, career, Race, Trait, exact destination or age window beyond Active itself.

This batch is not intended to guarantee the entire at-sea pool alone. Its `hasShip` share is deliberate because the territory is ship supplies/cargo pressure; the six non-ship roots reduce starvation pressure for institutional/passenger sea states.

## Existing persistent definitions used

No new persistent definitions are created.

Existing systems/definitions referenced:

- player Stats: `health`, `morale`, `strength`, `agility`, `observation`, `intelligence`, `navigation`;
- Berrys;
- current ShipState / ship health;
- crew roles in optional `availableIf` approaches: `shipwright`, `medic`, `cook`;
- History through normal one-shot Event consumption.

No Item, NPC, Location, Trait, Flag, Devil Fruit, Haki, career rank/title or Ship chassis definition is added.

## Conditions / effects

Conditions:
- `all`;
- `careerPhaseIs(active)`;
- `isAtSea`;
- `hasShip`;
- optional `hasCrewRole`.

Effects:
- `queueImmediateEvent`;
- `modifyShipHealth`;
- `modifyHealth`;
- `modifyStat`;
- `modifyBerries`.

No `moveToLocation`, no generic navigation, no Scheduled effect, no career change, no schema/state extension.

## Editorial/mechanical notes

- Resource finds are inanimate; no merchant/civilian encounter is used as the premise.
- Risk comes from lifting, diving, unstable wreckage, contamination, entanglement and overloading working space, not storm/reef/monster reskins.
- Dangerous Dice attempts have real failure/critical-failure costs or a clearly lost opportunity; critical failure is normally worse.
- Crew-role options are optional leverage and never the only available resolution.
- Temporary supplies that lack an existing Item definition remain scene-local instead of inventing persistent inventory entries.
- No exact-destination or route identity is authored.

## Shared integration still required

The batch owns namespaced FR/EN keys, but production localization currently lives in the shared files:

- `src/game/localization/locales/en.json`
- `src/game/localization/locales/fr.json`

The delivery bundle therefore contains namespaced locale fragments plus an idempotent apply script that appends only missing `event.active_generic_sea_02_*` keys. No shared catalog/schema/runtime file is otherwise required.

## Validation state at handoff

Executed against the isolated delivery:

- JSON parse / unique Event IDs: PASS
- root / Immediate / Scheduled counts: PASS
- `active + at-sea` root eligibility: PASS
- Immediate target existence / acyclic reach: PASS
- mini-arc ratio 75%: PASS
- Dice-root ratio 60%: PASS
- no Scheduled / Lifetime: PASS
- choice resolvability: PASS
- FR/EN key completeness: PASS
- FR/EN authoring text budgets: PASS
- forbidden movement/navigation effects: PASS
- new persistent-definition audit: PASS

Not executable in this sandbox because a complete repository checkout could not be obtained:

- `npm run validate-content`: **NOT RUN**
- `npm test`: **NOT RUN**
- `npm run build`: **NOT RUN**

Those three repository-wide commands remain mandatory after applying this isolated bundle to current `dev`.
