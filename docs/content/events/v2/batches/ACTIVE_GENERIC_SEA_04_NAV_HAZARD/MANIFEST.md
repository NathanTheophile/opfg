# ACTIVE_GENERIC_SEA_04_NAV_HAZARD — Manifest

## Batch identity

- Batch ID: `ACTIVE_GENERIC_SEA_04_NAV_HAZARD`
- Prefix: `active_generic_sea_04_nav_hazard`
- Source repository: `NathanTheophile/opfg`
- Source branch: `dev`
- Source HEAD: `7d2d4805f07dc00990bedd51e3c673cb65fceafd`
- Content Schema: `15`
- Save version: `22`
- Profile: Active V1 / Ordinary Generic Sea
- Territory: weather, currents, visibility, navigation hazards, ship exposure, Paradise no-Log-Pose pressure
- Excluded territory: vessel encounters/social scenes, salvage/cargo opportunities, pirates/combat/sea creatures, exact-destination travel, route selection, career progression

## Production totals

- Normal roots: **20**
- Immediate Events: **18**
- Scheduled Events: **0**
- Lifetime Threads: **0**
- Roots opening a genuine Immediate mini-arc: **15 / 20 = 75%**
- Dice roots: **13 / 20 = 65%**
- Max Immediate depth after root: **2**
- Roots reaching depth 2: **3 / 20**
- Replay/evergreen roots: **0**
- New persistent definitions: **none**

## Root Events

- `active_generic_sea_04_nav_hazard_pressure_cliff`
- `active_generic_sea_04_nav_hazard_waterspout_fan`
- `active_generic_sea_04_nav_hazard_static_rigging`
- `active_generic_sea_04_nav_hazard_freezing_spray`
- `active_generic_sea_04_nav_hazard_rain_whiteout`
- `active_generic_sea_04_nav_hazard_sea_smoke`
- `active_generic_sea_04_nav_hazard_mirage_horizon`
- `active_generic_sea_04_nav_hazard_microburst_heel`
- `active_generic_sea_04_nav_hazard_following_sea_broach`
- `active_generic_sea_04_nav_hazard_internal_wave_step`
- `active_generic_sea_04_nav_hazard_whirlpool_birth`
- `active_generic_sea_04_nav_hazard_magnetic_squall`
- `active_generic_sea_04_nav_hazard_hail_canvas`
- `active_generic_sea_04_nav_hazard_sun_glare_troughs`
- `active_generic_sea_04_nav_hazard_pumice_carpet`
- `active_generic_sea_04_nav_hazard_ashfall_slurry`
- `active_generic_sea_04_nav_hazard_salt_crystal_haze`
- `active_generic_sea_04_nav_hazard_season_wall_paradise`
- `active_generic_sea_04_nav_hazard_crosswind_backfill`
- `active_generic_sea_04_nav_hazard_green_water_sweep`

## Immediate Events

- `active_generic_sea_04_nav_hazard_pressure_cliff_i01_pressure_rebound`
- `active_generic_sea_04_nav_hazard_waterspout_fan_i01_collapsed_spout`
- `active_generic_sea_04_nav_hazard_static_rigging_i01_deck_arc`
- `active_generic_sea_04_nav_hazard_freezing_spray_i01_ice_sheet`
- `active_generic_sea_04_nav_hazard_rain_whiteout_i01_false_calm`
- `active_generic_sea_04_nav_hazard_sea_smoke_i01_hidden_crest`
- `active_generic_sea_04_nav_hazard_mirage_horizon_i01_mirage_collapse`
- `active_generic_sea_04_nav_hazard_microburst_heel_i01_low_wind_return`
- `active_generic_sea_04_nav_hazard_following_sea_broach_i01_stern_slide`
- `active_generic_sea_04_nav_hazard_internal_wave_step_i01_second_step`
- `active_generic_sea_04_nav_hazard_whirlpool_birth_i01_moving_center`
- `active_generic_sea_04_nav_hazard_magnetic_squall_i01_polarity_flip`
- `active_generic_sea_04_nav_hazard_hail_canvas_i01_meltwater_weight`
- `active_generic_sea_04_nav_hazard_sun_glare_troughs_i01_glare_breaks`
- `active_generic_sea_04_nav_hazard_pumice_carpet_i01_pumice_rudder`
- `active_generic_sea_04_nav_hazard_pressure_cliff_i02_pressure_backwash`
- `active_generic_sea_04_nav_hazard_rain_whiteout_i02_reverse_squall`
- `active_generic_sea_04_nav_hazard_magnetic_squall_i02_needle_disagreement`

## L3 minority

The following roots can reach two consecutive Immediate Events after the root:

- `active_generic_sea_04_nav_hazard_pressure_cliff`
- `active_generic_sea_04_nav_hazard_rain_whiteout`
- `active_generic_sea_04_nav_hazard_magnetic_squall`

All other mini-arcs stop after one Immediate.

## Dice audit

Dice roots:

- `active_generic_sea_04_nav_hazard_pressure_cliff`
- `active_generic_sea_04_nav_hazard_waterspout_fan`
- `active_generic_sea_04_nav_hazard_static_rigging`
- `active_generic_sea_04_nav_hazard_freezing_spray`
- `active_generic_sea_04_nav_hazard_rain_whiteout`
- `active_generic_sea_04_nav_hazard_sea_smoke`
- `active_generic_sea_04_nav_hazard_mirage_horizon`
- `active_generic_sea_04_nav_hazard_microburst_heel`
- `active_generic_sea_04_nav_hazard_following_sea_broach`
- `active_generic_sea_04_nav_hazard_internal_wave_step`
- `active_generic_sea_04_nav_hazard_whirlpool_birth`
- `active_generic_sea_04_nav_hazard_magnetic_squall`
- `active_generic_sea_04_nav_hazard_season_wall_paradise`

Root Dice ratio: **65%**, inside the Active V1 55–65% target.

Crew-role Dice actors are optional approaches only:

- `navigator`
- `helmsman`
- `shipwright`

Every root still contains at least one unconditional player-resolvable Choice.

## Eligibility / starvation audit

All 20 roots require:

- `careerPhaseIs(active)`
- `isAtSea`
- `hasShip`

Additional restrictive root eligibility:

- `active_generic_sea_04_nav_hazard_season_wall_paradise` additionally requires `currentSeaIs(grand_line_paradise)`.

No root requires a CrewRole, Trait, career affiliation, exact Location, Reputation, Item, or minimum ship HP to exist in the pool. Crew-role and Log Pose Conditions only unlock/modify individual Choices.

Starvation risk for the batch itself is therefore low once the player is Active, at sea, and owns a ship. This batch intentionally does not support shipless institutional transport scenes because every authored hazard can damage the personal ship.

## Paradise / Log Pose treatment

`active_generic_sea_04_nav_hazard_magnetic_squall` is the only generic root that adds explicit **Paradise without an active Paradise Log Pose** pressure.

It does not reproduce `active_paradise_no_log_pose_hazard`:

- the premise is a magnetic squall whose field disrupts headings;
- the root remains usable outside Paradise;
- Paradise + no active Paradise Log Pose applies a `-2` conditional Dice modifier to three navigation-reading approaches;
- an active Paradise Log Pose unlocks a dedicated approach;
- no route selection, route ID, destination movement, or generic no-Log-Pose replay loop is authored.

`active_generic_sea_04_nav_hazard_season_wall_paradise` is Paradise-only because its premise is a Grand Line seasonal boundary, but it does not test Log Pose possession.

## Runtime vocabulary used

Conditions:

- `activeLogPoseIs`
- `all`
- `careerPhaseIs`
- `currentSeaIs`
- `hasCrewRole`
- `hasShip`
- `isAtSea`
- `not`

Effects:

- `modifyHealth`
- `modifyShipHealth`
- `modifyStat`
- `queueImmediateEvent`

All authored negative `modifyShipHealth` outcomes carry `shipDamageCause: "accident"`.

## Persistent definitions used

Existing definitions only:

- CrewRoles: `navigator`, `helmsman`, `shipwright`
- Sea: `grand_line_paradise`
- Log Pose type: `paradise`
- Player attributes: `navigation`, `observation`, `agility`, `strength`, `intelligence`, `morale`, `luck`

No new Item, Equipment, NPC, Companion, Trait, Flag, Location, Ship, career title/rank, or world definition is proposed.

## Navigation / movement

- No `moveToLocation`.
- No `recoverTravel` or recovery movement Effect.
- No exact destination.
- No Paradise route-start Event.
- No route ID state.
- No cross-region teleport.
- No Scheduled travel callback.

## Collision boundaries

This batch deliberately does not mine or port legacy `archives/ACTIVE_*` material.

Editorial separation from parallel SEA territories:

- `ACTIVE_GENERIC_SEA_01`: other vessels, signals, distress, maritime social encounters.
- `ACTIVE_GENERIC_SEA_02`: salvage, floating cargo, resources, opportunities.
- `ACTIVE_GENERIC_SEA_03_DANGER`: raiders, boarding, sea creatures, violent incidents.
- `ACTIVE_NAVIGATION_CORE`: structural navigation, route starts, existing generic Paradise no-Log-Pose hazard.

The 20 roots here are environment/navigation-first and avoid those cores.

## Localization

Player-facing FR/EN keys are supplied as namespaced snippets:

- `localization.fr.json`
- `localization.en.json`

They contain **393 keys each**. They are intentionally kept outside `src/game/content/events/**` because that tree is auto-discovered as EventDefinitions.

Use:

```bash
node tools/active-generic-sea-04-nav-hazard/apply-localization.mjs --check
node tools/active-generic-sea-04-nav-hazard/apply-localization.mjs
```

The first command checks collisions; the second merges the snippets into the shared locale files.

## Shared integration still required

After applying this isolated patch to current `dev`:

1. merge the FR/EN snippets into the shared locale files;
2. run the targeted test;
3. run the repository-wide content validator, test suite, and production build;
4. resolve only genuine integration conflicts with newer parallel Active batches.

No shared engine/schema/save/UI/navigation change is required by this batch.
