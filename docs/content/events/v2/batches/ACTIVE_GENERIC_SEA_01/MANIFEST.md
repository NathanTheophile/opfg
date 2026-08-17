# MANIFEST — ACTIVE_GENERIC_SEA_01

## Repository baseline

- Repository: `NathanTheophile/opfg`
- Branch: `dev`
- HEAD used as source of truth: `7d2d4805f07dc00990bedd51e3c673cb65fceafd`
- Content schema observed on current `dev`: `CONTENT_SCHEMA_VERSION = 15`.
- Save version observed on current `dev`: `CURRENT_SAVE_VERSION = 22`.
- Batch profile: **Ordinary Generic Sea**.
- Worker isolation: new namespaced runtime directory + namespaced FR/EN localization fragments + this manifest only.
- Shared files intentionally untouched in this package: global localization dictionaries, Content Catalog definitions, Concept Index V2, migration ledger, schema/engine/save/UI/navigation files.

## Batch identity

- Batch ID: `ACTIVE_GENERIC_SEA_01`
- Reserved prefix: `active_generic_sea_01_`
- Territory: Active ordinary maritime encounters — passing vessels, distress, discoveries, signals, crew-to-crew social tension, help/exploit/avoid/information dilemmas.
- Explicit exclusions: storms as main premise, reefs, sea monsters, Paradise route progression, exact-destination travel, Reverse Mountain, navigation-system implementation, career change, Bounty Hunter, Scheduled/Lifetime content.
- Root count: **20 Normal roots exactly**.
- Immediate count: **18**.
- Scheduled count: **0**.
- New persistent definitions: **none**.

## Root coverage audit

All roots use the same broad eligibility:

```text
careerPhaseIs(active)
AND isAtSea
AND hasShip
```

The `hasShip` gate is deliberate: every scene is written around the player's current vessel and several outcomes can damage that vessel. No root assumes an exact destination or performs a `moveToLocation` Effect.

Career coverage: Civilian / Pirate / Marine / Revolutionary equally eligible. No root changes career affiliation, rank, title, bounty, or personal leadership.

| Root | Dice | Root Dice approaches | Immediate depth | Core premise |
|---|---:|---:|---:|---|
| `active_generic_sea_01_distress_lantern` | yes | 2 | 1 | disabled merchant rudder / help vs payment vs leave |
| `active_generic_sea_01_baited_distress` | yes | 2 | 2 | false castaways / anti-boarding trap |
| `active_generic_sea_01_sealed_crate` | yes | 1 | 1 | anonymous salvage / claimant confrontation |
| `active_generic_sea_01_barrel_survivor` | yes | 2 | 1 | abandoned sailor / rescue and responsibility |
| `active_generic_sea_01_deck_challenge` | yes | 2 | 1 | inter-crew wager / pride and money |
| `active_generic_sea_01_inspection_signal` | yes | 2 | 1 | government inspection / compliance vs bluff |
| `active_generic_sea_01_empty_deck` | yes | 2 | 2 | apparently abandoned vessel / locked crew |
| `active_generic_sea_01_medicine_flag` | no | 0 | 1 | sick ship / aid vs payment vs refusal |
| `active_generic_sea_01_signal_barter` | no | 0 | 0 | port-rumor barter by flags |
| `active_generic_sea_01_fresh_wreckage` | yes | 2 | 1 | fresh debris / trapped survivors |
| `active_generic_sea_01_contested_flotsam` | yes | 2 | 1 | shared salvage / division dispute |
| `active_generic_sea_01_galley_fire` | yes | 2 | 2 | passing ship fire / powder danger |
| `active_generic_sea_01_tow_request` | no | 0 | 1 | disabled cargo boat / boundary over cargo |
| `active_generic_sea_01_song_across_water` | no | 0 | 0 | friendly song challenge |
| `active_generic_sea_01_crossing_wake` | no | 0 | 1 | right-of-way arrogance / apology |
| `active_generic_sea_01_coded_flags` | no | 0 | 0 | unknown local signal code |
| `active_generic_sea_01_overboard_deserter` | yes | 2 | 1 | jumping sailor / withheld wages dilemma |
| `active_generic_sea_01_powder_barrels` | yes | 2 | 1 | floating sabotage charges / warn trailing ship |
| `active_generic_sea_01_drifting_mailbag` | no | 0 | 0 | sealed mail / honesty vs profit |
| `active_generic_sea_01_flag_insult` | no | 0 | 0 | mocking flag / social response |


## Immediate mini-arc audit

- Mini-arc roots: **15 / 20 = 75%**.
- Target: ~75%.
- Most mini-arcs are Root → 1 Immediate.
- Depth-2 Immediate chains (Root → I1 → I2): **3** — `baited_distress`, `empty_deck`, `galley_fire`.
- No continuation-only panel is used.

## Dice audit

- Dice roots: **12 / 20 = 60%**.
- Target: 55–65%.
- Dice root IDs:
  - `active_generic_sea_01_distress_lantern`
  - `active_generic_sea_01_baited_distress`
  - `active_generic_sea_01_sealed_crate`
  - `active_generic_sea_01_barrel_survivor`
  - `active_generic_sea_01_deck_challenge`
  - `active_generic_sea_01_inspection_signal`
  - `active_generic_sea_01_empty_deck`
  - `active_generic_sea_01_fresh_wreckage`
  - `active_generic_sea_01_contested_flotsam`
  - `active_generic_sea_01_galley_fire`
  - `active_generic_sea_01_overboard_deserter`
  - `active_generic_sea_01_powder_barrels`

- Root checks use Navigation, Observation, Agility, Strength and Charisma, plus optional crew-role actors where the fiction supports them.
- Optional crew-role approaches never replace the unconditional/player-resolvable path.
- CrewRole uses in this package: `navigator`, `medic`, `shipwright`, `gunner`.
- Typical thresholds: Standard 11 and Difficult 14.
- Dangerous failures cost Health, Ship Health, Berrys, Morale, or position/opportunity; critical failures are visibly worse.

### One-Dice-approach note

Several roots have two Dice approaches; others deliberately have one player Dice approach plus deterministic alternatives because the uncertainty is concentrated on one physical act (for example hooking the sealed crate) rather than manufacturing a second roll purely for quota.

## Persistent / progression audit

- New NPC definitions: **none**.
- New Items/Equipment/Ships/Traits/Flags: **none**.
- Existing Trait gates used only as optional visible solutions: `resourceful`, `suspicious`, `merciful`, `deceptive`, `curious`, `sociable`, `proud`, `greedy`, `competitive`, `cautious`, `honest`.
- Reputation changes are monotonic positive only, matching Active V1.
- Bounty changes: **none**.
- Career/rank/title changes: **none**.
- No recruitment-focused root is authored; crew role occupancy therefore never gates root eligibility.
- No Devil Fruit or Haki acquisition is authored.

## Continuity / Scheduled audit

- Declared profile: **Generic Sea**.
- Scheduled seeds: **none**.
- Scheduled returns: **none**.
- Lifetime threads: **none**.
- Confirmation: the package contains **zero `scheduleEvent` Effects and zero `scheduled` EventDefinitions**.

## Travel / navigation safety

- No Event selects, stores, or names an exact destination for the player.
- No `moveToLocation`, `recoverTravel`, route-start, Log Pose activation, departure System Event, or arrival-system behavior is implemented here.
- The package assumes the existing personal-ship maritime loop has already placed the player `at_sea`.
- Generic Sea remains content, not navigation architecture.

## Starvation / fallback risk

This package contributes 20 one-shot personal-ship sea roots. Alone, it is not intended to cover every maritime month of a 20-year career; Active V1 expects additional Generic Sea, regional Blue, Paradise-route, career, Family and other maritime content. Within its territory, every root is broadly eligible and has at least one unconditional Choice. No new fallback is added.

## Localization

Namespaced localization fragments are delivered as:

- `docs/content/events/v2/batches/ACTIVE_GENERIC_SEA_01/localization.fr.json`
- `docs/content/events/v2/batches/ACTIVE_GENERIC_SEA_01/localization.en.json`

They contain every localization key referenced by the package Events. Shared integration must merge these namespaced fragments into the runtime localization dictionaries (or the project’s later batch-locale loader) before global `validate-content` can pass.

## Validation performed in worker package

Because this execution environment has GitHub read access but no network-enabled repository checkout, the worker could not run the repository commands directly. Instead the package received local structural checks:

- every Event JSON parses and every filename matches its Event ID;
- every ID uses `active_generic_sea_01_`;
- exactly 20 Normal roots;
- exactly 18 Immediate Events;
- zero Scheduled Events;
- zero `scheduleEvent` Effects;
- all queued Immediate IDs exist, target `kind: immediate`, and every Immediate is reachable from at least one root;
- Immediate graph is acyclic; maximum reachable depth is 2;
- 15/20 roots open an Immediate mini-arc;
- 12/20 roots contain a root DiceCheck;
- all 436 referenced localization keys exist in both FR and EN fragments;
- every Root/Immediate body, Choice label and Outcome stays inside the current authoring text budgets;
- every root includes `careerPhaseIs(active)`, `isAtSea`, and `hasShip`;
- every negative Ship Health outcome carries a validator-compatible `shipDamageCause` (`enemy` or `accident`);
- every negative Berry payment is protected by `berriesAtLeast`;
- no Event contains navigation movement, career/rank/title/bounty/leadership changes, or negative Reputation.

Repository-level validation still required after applying/merging the package:

```bash
npm run validate-content
npm test
npm run build
```

## Exact file inventory

Runtime EventDefinitions:

- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_baited_distress.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_baited_distress_i01_hooks.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_baited_distress_i02_standoff.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_barrel_survivor.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_barrel_survivor_i01_abandoned_hand.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_coded_flags.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_contested_flotsam.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_contested_flotsam_i01_open_strongbox.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_crossing_wake.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_crossing_wake_i01_apology_launch.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_deck_challenge.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_deck_challenge_i01_second_wager.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_distress_lantern.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_distress_lantern_i01_broken_rudder.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_drifting_mailbag.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_empty_deck.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_empty_deck_i01_knocking_below.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_empty_deck_i02_locked_sailors.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_flag_insult.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_fresh_wreckage.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_fresh_wreckage_i01_overturned_boat.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_galley_fire.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_galley_fire_i01_powder_door.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_galley_fire_i02_after_fire.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_inspection_signal.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_inspection_signal_i01_search_request.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_medicine_flag.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_medicine_flag_i01_recovered_patient.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_overboard_deserter.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_overboard_deserter_i01_wage_dispute.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_powder_barrels.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_powder_barrels_i01_sabotage_warning.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_sealed_crate.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_sealed_crate_i01_claimant.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_signal_barter.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_song_across_water.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_tow_request.json`
- `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/active_generic_sea_01_tow_request_i01_unmarked_sacks.json`

Namespaced support:

- `docs/content/events/v2/batches/ACTIVE_GENERIC_SEA_01/MANIFEST.md`
- `docs/content/events/v2/batches/ACTIVE_GENERIC_SEA_01/localization.fr.json`
- `docs/content/events/v2/batches/ACTIVE_GENERIC_SEA_01/localization.en.json`
- `docs/content/events/v2/batches/ACTIVE_GENERIC_SEA_01/VALIDATION.json`

## Shared integration still required

1. Copy the runtime directory into `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_SEA_01/`.
2. Merge the two localization fragments into the runtime FR/EN dictionaries using the repository’s chosen integration path.
3. Optionally append accepted concepts to `EVENT_CONCEPT_INDEX_V2.md` only after human review/acceptance.
4. Run the full repository validation pipeline.

No push / commit / PR is part of this package.
