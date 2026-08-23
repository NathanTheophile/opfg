# OPFG — Active Haki V1 Specialized Contract

Status: user-approved specialized V1 override.

This contract supersedes the old automatic Observation/Armament post-awakening tier synchronization rule.

## Progression

Observation source total:

`effective Observation + effective Intelligence`

Armament source total:

`effective Strength + effective Agility`

Thresholds:

- Level I: >= 75
- Level II: >= 80
- Level III: >= 85
- Level IV: >= 90
- Level V: >= 95

Source total only gates the next mastery mini-arc. It does not automatically raise Haki.

Each level is:

`1 due Normal root -> 8 Immediate Events -> raise Haki exactly one level`

If several thresholds are already satisfied, the roots become due sequentially with no artificial cooldown.

Earned Haki levels are permanent even if effective source Stats later fall.

If Observation and Armament are simultaneously due, their next eligible roots are selected seeded-uniformly.

Due Haki roots take priority over the ordinary random Normal pool. Existing Critical, route/system, Scheduled and Major Narrative handling remains authoritative before that ordinary-pool point.

## Spatial rule

Each level authors either `isOnLand` or `isAtSea`.

Sea roots that assume a vessel additionally require `hasShip`.

No Haki progression Event depends on a named Location/sea.

## Content structure

Per Haki:

- 5 Normal roots
- 40 Immediate Events
- 45 EventDefinitions

Total V1 addition:

- 10 Normal roots
- 80 Immediate Events
- 90 EventDefinitions

No Scheduled, Lifetime, Critical or System Haki Events.

## Progression safety

These Haki batches never modify:

- Strength
- Agility
- Observation
- Intelligence

They may use secondary Stats, Health, Reputation and safe resources.

Observation/Armament levels are awarded through the monotonic `raiseHakiTo` Effect.

Conqueror Haki is out of scope for this batch.
