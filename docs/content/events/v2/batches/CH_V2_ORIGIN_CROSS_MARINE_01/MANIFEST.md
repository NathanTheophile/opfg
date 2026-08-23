# MANIFEST — CH_V2_ORIGIN_CROSS_MARINE_01

## Repository baseline

- Repository: `NathanTheophile/opfg`
- Branch reviewed: `dev`
- Exact HEAD: `4ec9d642823fd05b8151ed0d892203725f577bde`
- Content Schema: **14**
- Save version: **21**
- Repository mutation: **none**. No commit, branch, PR, Concept Index update or Migration Ledger update.

## Package inventory

- Normal roots: **4 exactly**
- Immediate EventDefinitions: **3**
- Scheduled EventDefinitions: **0**
- Lifetime Threads: **0**
- New persistent definitions: **0**
- French source/fallback: `localization/fr.fragment.json`

## Origin Cross matrix

| Root | Cross | Age months | Dice root | Immediate depth | Why both axes are indispensable |
|---|---|---:|---:|---:|---|
| `ch_v2_origin_cross_marine_01_human_same_gate` | Human × Marine | 84–155 | yes | 0 | Human: the child is admitted without scrutiny while a visibly non-human child is singled out. Marine: only inherited Marine-family access puts the player inside this controlled family event with standing to challenge the gate. Removing either axis changes actor, leverage and immediate stake. |
| `ch_v2_origin_cross_marine_01_fishman_prisoner_taunt` | Fish-Man × Marine | 72–143 | no | 1 | Fish-Man: the detainee targets the player's race and frames it as incompatible with Marine belonging. Marine: the family connection is exactly what makes the taunt and ensuing accusation bite. Without either axis this is a different confrontation. |
| `ch_v2_origin_cross_marine_01_mink_mascot_ticket` | Mink × Marine | 96–167 | no | 0 | Mink: the fundraiser turns the child into an animalized mascot image. Marine: the image is being sold specifically as Marine-family branding, giving the player a concrete claim over its use. Removing either axis changes the act and stake. |
| `ch_v2_origin_cross_marine_01_giant_blind_spot_escape` | Giant × Marine | 108–167 | yes | 2 | Giant: the prisoner's escape attempt physically depends on the player's body creating an ordinary line-of-sight obstruction. Marine: a patrol visiting the Marine household is escorting the detainee. Without either axis the escape method, actors and response options collapse. |

Every root is `kind: normal`, has `narrativeFamily: origin_cross`, `careerPhaseIs(childhood)`, an explicit age window, its exact `raceIs(...)`, and `affiliationIs(marine)`. No root has `majorTrack`.

## Dice audit

Exactly **2 / 4** Dice roots:

- `human_same_gate`: Charisma 11 / Intelligence 11.
- `giant_blind_spot_escape`: Agility 11 / Charisma 11.

For every root Dice choice: critical failure = rolled Stat **-1** + clearly worse fiction; failure = **0 Stat progression** + real loss/aggravation; success = **+2**; critical success = **+2**. No racial Dice modifier, override or automatic success is used.

## Immediate / Scheduled audit

Exactly **2 / 4** roots open Immediate continuations:

- `fishman_prisoner_taunt` → depth **1**.
- `giant_blind_spot_escape` → reachable depth **2** through `..._i01_torn_satchel` → `..._i02_last_direction`.

Every Immediate changes the situation or reveals consequential information. Scheduled callbacks: **0**.

## Reward / malus audit

- Deterministic Stat changes stay within **-1 / 0 / +1**.
- Root Dice progression uses only **-1 / 0 / +2 / +2**.
- No Health, Berrys, Reputation, Item, NPC state, Flag, career or geography mutation.
- Negative deterministic examples exist where fiction supports them (`mink_mascot_ticket / leave_stand`, `giant...i01 / watch_runner`: Morale -1).
- No outcome exceeds the Childhood V2 effect scale.

## Trait audit

- Trait grants: **0**.
- Trait removals: **0**.
- Trait gates/modifiers/overrides: **0**.
- Therefore no unconditional deterministic Choice grants a Trait and no opposite-pair conflict can be created.

## Age / geography / cast

- Coverage: **84–155 Human**, **72–143 Fish-Man**, **96–167 Mink**, **108–167 Giant** ageMonths.
- All content is Childhood-only and remains below the 180-month Active boundary.
- No exact Location, sea, Location tag or service is required. Scenes use portable Marine-family/patrol contexts compatible with multiple Birth Locations.
- Persistent cast: **none**. All guards, detainees, staff, children and patrol members are throwaway prose actors.

## Family Saga collision audit

- No inheritance, Layer-5 reward, age-15 career handoff, Marine rank/recruitment, household progression or parent/child central conflict.
- No `majorTrack`, `specialPathId`, `milestoneId` or Family Saga item.
- **Marine × Giant special association protected:** the Giant root contains no institutional training, military-potential appraisal, recruitment, Giant Marine inheritance, special equipment or career promise. It is a one-scene escort mishap caused by line of sight.

## Wave 1 / Wave 2 collision audit

- Wave 1: no mislabeled crate, signal/semaphore, peer-status game, generic rescue set piece, work/apprenticeship arc, or wider-world exposition root.
- Human Wave 2: avoids standard-size interfaces, harnesses, tools, measurements and Human-default ergonomics; the Human axis here is unequal social scrutiny at a Marine-family gate.
- Fish-Man Wave 2: no swimming, underwater retrieval, aquatic obligation, Fish-Man Karate or invented physiology; the cross is a detainee's affiliation-targeted provocation.
- Mink Wave 2: no Electro/Sulong, tracking, scent/hearing solution, fur-material mishap or touch-boundary root; the cross is unauthorized mascot branding.
- Giant Wave 2: no architecture-fit, shadow/privacy-screen, lifting solution or generic crowd-scale problem; the body matters only as a momentary escort blind spot.

## Definition / runtime audit

- New NPCDefinition: **0**
- New ItemDefinition: **0**
- New Trait: **0**
- New Flag: **0**
- New Location: **0**
- New Condition: **0**
- New Effect: **0**
- New mechanic/system: **0**
- Lifetime Thread: **0**
- Used runtime vocabulary only: `all`, `careerPhaseIs`, `ageAtLeastMonths`, `ageAtMostMonths`, `raceIs`, `affiliationIs`, `modifyStat`, `queueImmediateEvent`.

## Self-validation

- JSON parsing: PASS
- Event IDs unique and prefix-safe: PASS
- Exactly four Normal roots / four Race × Marine combinations: PASS
- Exactly two Dice roots: PASS
- Exactly two Immediate roots: PASS
- At least one reachable Immediate depth 2+: PASS
- Scheduled callbacks: 0 / within budget: PASS
- Immediate targets exist: PASS
- Localization keys referenced by EventDefinitions exist in FR fragment: PASS
- Every Event has at least one unconditional Choice and is resolvable: PASS
- No invented persistent/runtime reference: PASS
