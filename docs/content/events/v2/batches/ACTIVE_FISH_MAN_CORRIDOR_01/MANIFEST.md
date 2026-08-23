# ACTIVE_FISH_MAN_CORRIDOR_01 — Manifest / Worker Report

## Baseline

- Repository: `NathanTheophile/opfg`
- Branch: `dev`
- Audited post-gate HEAD: `1da630527f7800467b4c3196fc35c7cafb015ee0` (`feat(core): wave 5 foundations`)
- Content schema used for materialization: **14**
- Repository mutation from this worker: **none**
- Commit / push / PR: **none**

## Patch-ready production

- New EventDefinitions: **20**
  - Sabaody passage: **4** = 1 Normal + 3 Immediate
  - Fish-Man local roots: **15 Normal**
  - departure window: **1 Scheduled**
- Existing route-start Events edited by applicator: **3**
- Local Dice roots: **9 / 15 = 60.0%**
- Passage DiceChecks: **2** (I01 + I02)
- New persistent NPC / Item / Trait / Flag / route state / quest state: **0**
- FR keys: **143**
- EN keys: **143**

## Repository payload

Runtime Event JSON directory:

`src/game/content/events/v2/ordinary/ACTIVE_FISH_MAN_CORRIDOR_01/`

This package contains the full replacement definition for `active_sabaody_red_line_passage` plus the 19 genuinely new EventDefinitions. The applicator replaces the pre-existing passage file **in place** so the repository never contains a duplicate Event ID, then copies the remaining 19 files into the isolated batch directory.

Namespaced support:

- `docs/content/events/v2/batches/ACTIVE_FISH_MAN_CORRIDOR_01/localization.fr.json`
- `docs/content/events/v2/batches/ACTIVE_FISH_MAN_CORRIDOR_01/localization.en.json`
- `docs/content/events/v2/batches/ACTIVE_FISH_MAN_CORRIDOR_01/VALIDATION.json`
- `docs/content/events/v2/batches/ACTIVE_FISH_MAN_CORRIDOR_01/MANIFEST.md`

Worker-side applicator (not copied into runtime):

`ACTIVE_FISH_MAN_CORRIDOR_01.apply.mjs`

It locates existing Event JSON by exact ID, preserves each New World route-start Event wholesale, and only combines its current `eligibility` with the required History gate.

## Passage graph

```text
Sabaody / on_land
→ active_sabaody_red_line_passage                       [Normal]
  → active_fish_man_corridor_01_i01_descent_prep       [Immediate, Dice]
    → active_fish_man_corridor_01_i02_under_red_line    [Immediate, Dice]
      → active_fish_man_corridor_01_i03_arrival         [Immediate]
        → moveToLocation(fish_man_island, on_land)
        → scheduleEvent(active_fish_man_corridor_01_departure_window, +1 month)
→ at least one true local Normal root
→ active_fish_man_corridor_01_departure_window          [Scheduled]
→ History: hasPlayed(active_fish_man_corridor_01_departure_window)
→ existing seeded New World route-start selection
  ├─ active_new_world_route_start_raijin
  ├─ active_new_world_route_start_risky_red
  └─ active_new_world_route_start_mystoria
→ New World
```

Exact `queueImmediateEvent` edges:

1. `active_sabaody_red_line_passage` → `active_fish_man_corridor_01_i01_descent_prep` on every root outcome.
2. `active_fish_man_corridor_01_i01_descent_prep` → `active_fish_man_corridor_01_i02_under_red_line` on all four Dice outcomes.
3. `active_fish_man_corridor_01_i02_under_red_line` → `active_fish_man_corridor_01_i03_arrival` on all four Dice outcomes.
4. I03 is terminal for the passage and queues no Immediate Event.

The root preparation is carried through History into I01 Dice modifiers with `hasChosen(...)`. I01 resolution is carried into I02 Dice modifiers with `hasOutcome(...)`. No coating flag or route state exists.

## Local root registry

| # | Location | Event ID | Dice |
|---:|---|---|:---:|
| 1 | `fish_man_island` | `active_fish_man_corridor_01_local_bubble_hull_triage` | yes |
| 2 | `fish_man_island` | `active_fish_man_corridor_01_local_port_manifest_tangle` | no |
| 3 | `fish_man_island` | `active_fish_man_corridor_01_local_pressure_sickness_clinic` | yes |
| 4 | `fish_man_island` | `active_fish_man_corridor_01_local_cross_current_guides` | no |
| 5 | `ryugu_kingdom` | `active_fish_man_corridor_01_local_ryugu_waterworks` | yes |
| 6 | `ryugu_kingdom` | `active_fish_man_corridor_01_local_ryugu_supply_hearing` | no |
| 7 | `ryugu_kingdom` | `active_fish_man_corridor_01_local_ryugu_guard_corridor` | yes |
| 8 | `ryugu_kingdom` | `active_fish_man_corridor_01_local_ryugu_guest_customs` | no |
| 9 | `gyoncorde_plaza` | `active_fish_man_corridor_01_local_gyoncorde_stall_dispute` | yes |
| 10 | `gyoncorde_plaza` | `active_fish_man_corridor_01_local_gyoncorde_cargo_circle` | yes |
| 11 | `gyoncorde_plaza` | `active_fish_man_corridor_01_local_gyoncorde_public_notice` | no |
| 12 | `gyoncorde_plaza` | `active_fish_man_corridor_01_local_gyoncorde_stranded_crew` | yes |
| 13 | `coral_hill` | `active_fish_man_corridor_01_local_coral_hill_snared_diver` | yes |
| 14 | `coral_hill` | `active_fish_man_corridor_01_local_coral_hill_reef_harvest` | no |
| 15 | `coral_hill` | `active_fish_man_corridor_01_local_coral_hill_current_survey` | yes |

Distribution: **4 / 4 / 4 / 3**. Every root uses Active + `isOnLand` + exact `locationIs(...)`. `bubble_hull_triage` additionally requires `hasShip` because its Dice failure may damage the ship; the other roots remain ship-independent.

## Departure window proof

`active_fish_man_corridor_01_departure_window` is `kind: scheduled`, priority `200`, scheduled by I03 with `delayMonths: 1`.

Its eligibility is exactly the required structure plus Active phase:

```json
{
  "type": "all",
  "conditions": [
    {
      "type": "careerPhaseIs",
      "phase": "active"
    },
    {
      "type": "isOnLand"
    },
    {
      "type": "locationWithin",
      "locationId": "fish_man_island"
    },
    {
      "type": "any",
      "conditions": [
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_bubble_hull_triage"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_port_manifest_tangle"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_pressure_sickness_clinic"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_cross_current_guides"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_ryugu_waterworks"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_ryugu_supply_hearing"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_ryugu_guard_corridor"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_ryugu_guest_customs"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_gyoncorde_stall_dispute"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_gyoncorde_cargo_circle"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_gyoncorde_public_notice"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_gyoncorde_stranded_crew"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_coral_hill_snared_diver"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_coral_hill_reef_harvest"
        },
        {
          "type": "hasPlayed",
          "eventId": "active_fish_man_corridor_01_local_coral_hill_current_survey"
        }
      ]
    }
  ]
}
```

The complete non-abbreviated JSON is in `active_fish_man_corridor_01_departure_window.json`. Because the due Scheduled Event stays ineligible until History contains at least one local root, arrival cannot directly unlock the New World handoff.

## Existing New World route-start edits

The applicator finds each existing Event by exact ID and performs only this eligibility transform:

```text
existing eligibility
AND hasPlayed(active_fish_man_corridor_01_departure_window)
```

Applied to exactly:

- `active_new_world_route_start_raijin`
- `active_new_world_route_start_risky_red`
- `active_new_world_route_start_mystoria`

All existing choices, effects, destination movement, titles/text keys, and relative seeded selection behavior remain untouched. No destination is selected by any of the 20 new Events.

## REQUIRED_INTEGRATION_MICROFIX

Runtime files are outside this content worker's exclusive file territory, so this bundle **does not silently edit engine/navigation code**. The Wave 5 integrator must apply both minimal hierarchy-aware fixes before freeze.

### A. New World route-start selector — `src/game/engine/events.ts`

Replace the exact-location Fish-Man guard around the existing New World route-start selection:

```ts
if (state.locationId === FISH_MAN_ISLAND_LOCATION_ID) {
  // existing NEW_WORLD_ROUTE_START_EVENT_IDS selection, unchanged
}
```

with the existing hierarchy helper:

```ts
if (isLocationWithin(catalog, state.locationId, FISH_MAN_ISLAND_LOCATION_ID)) {
  // existing NEW_WORLD_ROUTE_START_EVENT_IDS selection, unchanged
}
```

Use the repository's existing `isLocationWithin` import/implementation. Do not duplicate ancestry logic and do not change the seeded candidate choice.

### B. Ordinary departure bypass — current `ordinaryDepartureHasDestination(...)` implementation

Where Fish-Man ordinary departure is blocked only for the exact root Location, broaden **that same block** to the full hierarchy with the existing helper:

```ts
if (isLocationWithin(catalog, state.locationId, FISH_MAN_ISLAND_LOCATION_ID)) {
  return false;
}
```

Keep the rest of `ordinaryDepartureHasDestination(...)` unchanged. This prevents `ryugu_kingdom`, `gyoncorde_plaza`, or `coral_hill` from becoming a generic alternative exit. Do not alter ordinary seeded New World navigation after the player has actually entered the New World.

Status: **REQUIRED / NOT APPLIED BY THIS CONTENT WORKER**.

## Canon audit

- No Hody conflict or canonical decisive outcome is authored or resolved.
- No Straw Hat is cast, referenced as mandatory quest authority, or replaced by the player.
- Local stories use workers, medics, guards, residents, travelers, merchants, and independent crews.
- No new persistent named NPC is introduced.
- Fish-Man Race appears only where it materially changes local lived experience (`cross_current_guides` and a Gyoncorde social Dice modifier), not as a batch-wide reskin.

## Consequence audit

- Active Reputation changes are positive only.
- No Bounty effect exists, therefore Marines cannot gain bounty from this batch.
- No Career mutation exists.
- No flag, route state, quest state, Conqueror Haki effect, intrinsic CrewRole, or new persistent definition exists.
- All Dice failures have concrete negative consequences; no failure is a `+0` branch.
- Ship damage occurs only in `bubble_hull_triage`, whose Event eligibility requires `hasShip`.
- Passage Dice consequences are ship-independent, so legally supported shipless/institutional transit does not deadlock.

## FR / EN

Both fragments contain exactly **143 keys**, with identical key sets. They cover all 20 Event titles and bodies, every Choice, every deterministic outcome, every Dice outcome, and every conditional Dice modifier label.

## Local validation executed

Custom package validation executed against the generated JSON:

- JSON parse: **PASS**
- Event IDs unique inside bundle: **PASS**
- new EventDefinitions = 20: **PASS**
- passage 4 / local roots 15 / Scheduled 1: **PASS**
- location distribution 4/4/4/3: **PASS**
- land gate on all 15 local roots: **PASS**
- Dice local roots 9/15 = 60%: **PASS**
- four complete outcome tiers on every Dice resolution: **PASS**
- every Dice failure / critical failure has effects: **PASS**
- exact passage Immediate edges: **PASS**
- I03 move + 1-month departure scheduling on every outcome: **PASS**
- departure-window `locationWithin` + `isOnLand` + 15-root History OR: **PASS**
- FR/EN key parity and reference coverage: **PASS**
- forbidden persistent-state effects: **PASS**
- direct New World destination hard-code in the 20 new Events: **NONE**

## Repository validation status

No writable full repository checkout is available in this worker environment, so these commands were **NOT EXECUTED** and are not claimed green:

```text
git diff --check          NOT EXECUTED
npm test                  NOT EXECUTED
npm run validate-content  NOT EXECUTED
npm run build             NOT EXECUTED
```

After applying in a writable checkout:

```bash
node /path/to/ACTIVE_FISH_MAN_CORRIDOR_01_PATCH_READY/ACTIVE_FISH_MAN_CORRIDOR_01.apply.mjs /path/to/opfg
git diff --check
npm test
npm run validate-content
npm run build
```
