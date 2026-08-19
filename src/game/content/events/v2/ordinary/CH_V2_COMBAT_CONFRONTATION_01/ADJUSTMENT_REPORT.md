# ADJUSTMENT REPORT — CH_V2_COMBAT_CONFRONTATION_01

Corrective pass applied after the external **ADJUST** review. This is not a redo: root IDs, age windows, overall root set, Dice distribution and Lifetime topology are preserved.

## Outcome authoring

- **306/306 FR outcomes are unique**; previous exact-template reuse is eliminated.
- **306/306 EN outcomes are also unique** and action-specific.
- Outcomes now name the concrete object/person at stake: rope, bottle, belt, cap, token, parcel, meal, stall, cup, witnesses, friend, etc.
- Abstract stock phrases called out by review were removed from FR outcomes.

## Dice materiality

- **24/24 failures** now have a non-queue consequence in addition to their continuation: Health -1, Morale -1, or friend Relationship -1 according to the scene.
- Rolled-Stat progression remains **0 on failure**.
- CriticalSuccess remains +2 rolled Stat by default; only the friend seed receives an extra relationship beat on CS.
- Shared Immediate copy was rewritten where necessary so it no longer assumes a successful first roll.

## Strength mapping fixes

- `water_cup_bully/carry_between`: Strength → Morale.
- `water_cup_bully_i03/twist_rim`: Strength → Agility.
- Ambiguous retained Strength actions were rewritten to show actual resisted bodily force.
- Physical positive budget becomes **64.7%** instead of 65.4%, intentionally favoring semantic correctness over quota padding.

## Structural changes kept minimal

Only two deterministic branches stop before their former shared Immediate because continuing was fictionally false:

- `cornered_tag/accept_tag` — accepting the tag genuinely changes role and ends that beat;
- `hand_over_token/drop_token` — abandoning the token genuinely exits the encirclement.

The batch still contains **20 roots / 38 Immediate / 20 Scheduled / 78 EventDefinitions** and preserves **20/20 mini-arc roots, 16 depth-2+, 2 depth-3**.

## Lifetime polish

The Lifetime skeleton is unchanged: `childhood_friend`, 20 Scheduled definitions, depth 14, 3 divergences. Copy now reads more like a friendship growing through repeated memories and letters, with less didactic combat terminology.
