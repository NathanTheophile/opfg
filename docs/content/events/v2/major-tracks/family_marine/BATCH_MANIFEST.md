# FAMILY_MARINE_L12_MINIARCS_V1 — Batch Manifest

## Scope

First production slice of the V2 `family_marine` Childhood Saga.

- Major roots: 13
- Layer 1 roots: 3
- Layer 2 roots: 10
- Immediate continuations: 25
- Scheduled Events: 0
- Total EventDefinitions: 38

## Major root IDs

- `family_marine_01_before_dawn`
- `family_marine_01_family_pennant`
- `family_marine_01_no_box_on_form`
- `family_marine_04_empty_chair`
- `family_marine_04_you_come_to_base`
- `family_marine_04_dinner_interrupted`
- `family_marine_04_made_to_fit`
- `family_marine_04_off_drill_square`
- `family_marine_04_quartermaster_measure`
- `family_marine_04_behind_office_door`
- `family_marine_04_fallback_home`
- `family_marine_04_fallback_service`
- `family_marine_04_fallback_adaptation`

## Existing persistent definitions used

NPCs:
- `player_parent_1`
- `player_parent_2`

No new persistent NPC is introduced.

Traits:
- none granted in this slice.

Items:
- none introduced or granted in this slice.

Locations:
- no exact Location ID required.
- scenes assume the inherited Marine household has plausible access to Marine family/service context; the Saga is not restricted to `marine_presence` Birth Locations because inherited affiliation itself provides the family connection.

## Special Association

`marine_giant` begins at:

- `family_marine_01_no_box_on_form`
- exact Giant response: `giant_invite`
- Layer 2: `family_marine_04_quartermaster_measure`

The Layer-2 special mini-arc can leave:
- `giant_claims_choice`
- `father_answers`
- `giant_sets_boundary`

for later Layer-3 authoring.

## Crossings

- C1 cooperative + `single_parent` can cross into A2B.
- A/B/C observant histories can cross into X2.
- Giant-specific route outranks the broad C2 continuation through `selectionPriority`.

## Route-local Layer-2 fallback coverage

- A1 -> `family_marine_04_fallback_home`
- B1 -> `family_marine_04_fallback_service`
- C1 -> `family_marine_04_fallback_adaptation`

## Mini-arc depth

- Layer-1 roots: 3 visible panels each.
- Ordinary specialized Layer-2 roots: 3 visible panels.
- `G2` and `X2`: 4 visible panels.
- Layer-2 fallbacks: 2 visible panels.

## Dice

Dice-bearing Major roots in this 13-root slice:

- `family_marine_04_empty_chair`
- `family_marine_04_you_come_to_base`
- `family_marine_04_dinner_interrupted`
- `family_marine_04_off_drill_square`
- `family_marine_04_quartermaster_measure`
- `family_marine_04_behind_office_door`
- `family_marine_04_fallback_service`

Further DiceChecks also appear inside some Immediate continuations.

## Mechanical policy

Strong Family consequences are intentionally placed mainly on the resolution Immediate rather than the opening root.

Typical complete mini-arc signatures use:
- `+2/-2`
- `+2/-1`
- occasional third `+1`
- parent Relationship `±5` where the relationship is actually at stake.

## Dependencies

Requires current D2.8–D2.10 layered Family Saga contract and Schema 14.

## PROPOSED_DEFINITIONS

None in Layers 1–2.

Layer-5 reward proposals remain blueprint-only and are not added by this batch.

## Timeline / canon

No named canon character is used.
No canon-sensitive event is claimed.
The Marine context is family/institutional pressure, not the player's Active career.
