# FAMILY_MARINE_L5_INHERITANCE_V1 — Batch Manifest

## Scope

Final Childhood layer of `family_marine`.

- Layer: `childhood_05`
- Due: 156 months / age 13
- Major roots: 10
- Immediate continuations: 28
- Total EventDefinitions: 38
- New persistent Item definitions: 5
- New runtime primitive: 0
- Schema bump: 0
- Save bump: 0

## Terminal roots

- `family_marine_13_insignia_in_palm`
- `family_marine_13_your_future_is_yours`
- `family_marine_13_chest_he_left`
- `family_marine_13_wear_it_better`
- `family_marine_13_duty_not_obedience`
- `family_marine_13_our_name_is_not_theirs`
- `family_marine_13_what_remains_of_him`
- `family_marine_13_decide_for_yourself`
- `family_marine_13_your_name_on_roll`
- `family_marine_13_on_your_terms`

## Guaranteed gameplay reward rule

Every reachable final Outcome of every terminal mini-arc grants at least one persistent gameplay reward.

Rewards used:
- `family_marine_insignia`
- `family_marine_service_journal`
- `family_marine_field_compass`
- `family_marine_sealed_report`
- `giant_marine_training_bracer`
- Reputation on selected public/official outcomes

`milestoneId` never counts toward this guarantee.

## New Items

- `family_marine_insignia`
  - Item, unique, no market
- `family_marine_service_journal`
  - Item, unique, no market
- `family_marine_field_compass`
  - Item, unique, no market
  - intentionally **not** a Log Pose and grants no global Navigation bonus
- `family_marine_sealed_report`
  - Item, unique, no market
- `giant_marine_training_bracer`
  - Equipment, unique, no market
  - modifier: Strength +1 while equipped

All story Item rewards use mandatory `addItem` so normal pocket/cargo/overflow rules guarantee that the reward is resolved rather than silently dropped.

## Active handoff

No Layer-5 Event calls `setCareerAffiliation`.

The final Immediate outcome is written to History at age 156. The existing Childhood clock continues normally through remaining Childhood slots.

At the actual Childhood -> Active transition (180 months), `time.ts` asks `deriveFamilyActiveCareerHandoff(history)`.

Marine inheritance:
- affiliation `marine`
- rank `marine_recruit`

Non-Marine / deferred inheritance:
- affiliation `civilian`
- rank `null`

This preserves Family origin in `player.profile.affiliationId`.

The handoff is History-derived and adds no GameState Saga field.

## Giant × Marine

`family_marine_13_on_your_terms`
- requires `conditions_recognized`
- priority 40
- `specialPathId: marine_giant`
- `milestoneId: family_marine_giant_own_terms`

The milestone recognizes reaching the authored own-terms inheritance endpoint. It is additional recognition and not a gameplay reward.

Final acceptance:
- `giant_marine_training_bracer`
- Reputation +3
- Active starts Marine recruit

Final refusal:
- `family_marine_field_compass`
- Reputation +2
- Active starts Civilian

## Route-local fallback coverage

- A4 / B4A / G4A / F4A -> H5D `L'insigne dans la paume`
- B4B / O4 / F4B -> H5A `Le coffre qu'il a laissé`
- C4A / C4B / G4B / X4 / F4C -> H5F `Ton avenir t'appartient`

## Career semantics

Family conflict does not automatically mean anti-Marine.
Examples:
- H5X allows the family to break with Marine treatment while the player may still explicitly join Marine.
- H5R can start Marine as a reformist/protective interpretation.
- H5F and H5S can still explicitly choose Marine after rejecting inherited inevitability.
