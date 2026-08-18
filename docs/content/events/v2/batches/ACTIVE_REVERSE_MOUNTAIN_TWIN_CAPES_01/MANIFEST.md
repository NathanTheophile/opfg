# MANIFEST — ACTIVE_REVERSE_MOUNTAIN_TWIN_CAPES_01

## Scope

Mandatory Active ingress mini-arc from `reverse_mountain` to `twin_capes`.

## Event inventory

1. `active_reverse_mountain_01_entry` — Normal
2. `active_reverse_mountain_01_i01_first_current` — Immediate
3. `active_reverse_mountain_01_i02_red_wall` — Immediate
4. `active_reverse_mountain_01_i03_climb` — Immediate
5. `active_reverse_mountain_01_i04_crest` — Immediate
6. `active_reverse_mountain_01_i05_descent` — Immediate

**Count:** `1 Normal + 5 Immediate`

## DiceChecks

Exactly **3** DiceChecks:

- `active_reverse_mountain_01_i01_first_current` / `read_angle` — `navigation`, threshold `11`
- `active_reverse_mountain_01_i03_climb` / `spot_seam` — `observation`, threshold `14`
- `active_reverse_mountain_01_i05_descent` / `ride_drop` — `agility`, threshold `14`

## Immediate graph

All authored `queueImmediateEvent` graph edges:

```text
active_reverse_mountain_01_entry
-> active_reverse_mountain_01_i01_first_current
-> active_reverse_mountain_01_i02_red_wall
-> active_reverse_mountain_01_i03_climb
-> active_reverse_mountain_01_i04_crest
-> active_reverse_mountain_01_i05_descent
```

Every reachable outcome in each non-terminal Event queues the next locked node. No branch skips, forks, or terminates the chain early.

## Scheduled Events

`scheduleEvent = 0`

## Terminal geography proof

Every reachable outcome of `active_reverse_mountain_01_i05_descent` contains:

```json
{
  "type": "moveToLocation",
  "locationId": "twin_capes",
  "travelState": "on_land"
}
```

No Paradise route is selected by this batch after arrival.

## Shipless-safe

- no `hasShip` eligibility;
- no ship Condition;
- no ship mutation Effect;
- no `isLeader` gate;
- no CrewRole actor requirement.

The prose refers only to the vessel carrying the player; ownership is never required.

## Route / ingress state

- no `routeId`;
- no ingress flag;
- no new persistent state;
- no route-selection Effect.

## CrewRole

No CrewRole is mandatory. No `hasCrewRole` Condition and no `crewRole` Dice actor is used.

## Localization

Complete matching key coverage is supplied for:

- `src/game/localization/locales/en.json`;
- `src/game/localization/locales/fr.json`.

The delivery payload contains the exact 51 EN and 51 FR additions in `_delivery/en.locale-additions.json` and `_delivery/fr.locale-additions.json`. `_delivery/apply_localization.py` merges those flat keys into the two existing locale files without introducing a batch-local runtime locale file.

## Runtime registration

No runtime `manifest.json` is created in the Event batch directory.
No registry/index file is introduced.

## Validation status

Executed on the materialized files:

- JSON parse — **PASS**
- exact six Event IDs — **PASS**
- `1 Normal + 5 Immediate` — **PASS**
- exactly `3 DiceChecks` — **PASS**
- locked `queueImmediateEvent` graph — **PASS**
- `scheduleEvent = 0` — **PASS**
- every terminal outcome moves to `twin_capes / on_land` — **PASS**
- shipless-safe structural check — **PASS**
- no `routeId` / ingress flag — **PASS**
- no mandatory CrewRole — **PASS**
- FR/EN key parity and declared-key coverage — **PASS**

Unavailable without an executable checkout:

- `git diff --check` — **NOT EXECUTED**
- `npm test` — **NOT EXECUTED**
- `npm run validate-content` — **NOT EXECUTED**
- `npm run build` — **NOT EXECUTED**
