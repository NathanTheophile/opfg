# ACTIVE_PARADISE_P5_OUTCASTS_01 — MANIFEST

## Baseline

- Repository: `NathanTheophile/opfg`
- Branch: `dev`
- HEAD observed before reconstruction: `c71b0e65f6cf3f75312f63d4aa8b120e172393eb`
- Content Schema observed: **16**
- Route authority: History contains `active_paradise_route_start_p5_outcasts`
- No commit / push / PR performed.

## Payload

- **48 Normal roots**
- **29 Dice roots / 60.4%**
- **19 deterministic-only Normal roots**
- **8 roots queueing one same-scene Immediate descendant**
- **8 Immediate descendants**
- **4 Scheduled descendants**
- **60 EventDefinitions total**
- **650 FR localization keys**
- **650 EN localization keys**

## Main-stop coverage

| Stop | Normal roots |
|---|---:|
| `driftwood_atoll` | 5 |
| `harahettania` | 5 |
| `hachimakinamazu_village` | 5 |
| `ragpicker_cay` | 5 |
| `foolshout_island` | 5 |
| `freewake_island` | 5 |
| `blackbell_islet` | 5 |
| `kuraigana_island` / `shikkeahr_kingdom` cluster | 5 |
| `sabaody_archipelago` | 5 |
| `baltigo` (optional) | 3 |

Main route total: **45**. Baltigo adds **3**, for **48**.

## Immediate parents

1. `driftwood_rope_tangle`
2. `hara_ration_cart`
3. `hachi_catfish_drum`
4. `ragpicker_scrap_crane`
5. `foolshout_cliff_rescue`
6. `freewake_flagless_duel`
7. `blackbell_wrecker_lantern`
8. `sabaody_bubble_cart`

Every resolution branch of those roots queues the same scene-local Immediate descendant.

## Route-wide Scheduled thread — Grey Ledger

```text
active_paradise_p5_outcasts_01_driftwood_grey_ledger
  +2 months
active_paradise_p5_outcasts_01_grey_ledger_s02_marked_casks
  +3 months
active_paradise_p5_outcasts_01_grey_ledger_s03_missing_column
  +3 months
active_paradise_p5_outcasts_01_grey_ledger_s04_blackbell_debt
  +2 months
active_paradise_p5_outcasts_01_grey_ledger_s05_close
  terminal
```

- Exactly one Normal seed starts a Scheduled thread.
- Seed is capped at `ageAtMostMonths = 408`.
- Total authored delay: **10 months**, so a latest-start thread resolves by age month 418, before the V1 420-month horizon.
- Scheduled nodes are `priority: 100`, `scheduledReach: unrestricted`.
- Eligibility remains Active + P5 route History + Paradise.
- `cancelIf` terminates the thread when the player leaves `grand_line_paradise`.
- No fallback event is required because the nodes are region-wide and unrestricted.

## Shared-location audit

- All Kuraigana/Shikkeahr roots are gated by P5 route History and `locationWithin: kuraigana_island`.
- All Sabaody roots are gated by P5 route History and exact `locationIs: sabaody_archipelago`.
- Sabaody content is local-scale and does not claim exclusive ownership of the convergence location.

## Baltigo gate

All three Baltigo roots require:

- P5 route History;
- `locationIs: baltigo`;
- `careerAffiliationIs: revolutionary`;
- `reputationAtLeast: 15`.

They are deterministic and add no new persistent state.

## Crew / recruitment audit

- New NPC definitions: **0**
- Recruitment roots: **0**
- `setNpcStatus: crew`: **0**
- `CrewRole` conditions/effects/actors: **0**
- Crew-capacity branches required by this batch: **0**

## Persistent-state audit

- New flags: **0**
- `routeId`: **0**
- Duplicate route state: **0**
- New persistent definitions: **0**

## Canon audit

- No named major canon figure is instantiated.
- Kuraigana uses Humandrills and Shikkeahr ruins only; no Mihawk/Perona/Zoro plot takeover.
- Sabaody uses coating queues, bubbles, a minor auction backdoor and under-root shelters without recreating or hijacking the Straw Hat/Celestial Dragon incident.
- Harahettania remains local social/economic material without Brook.
- Baltigo remains generic Revolutionary infrastructure without named canon leadership.

## Repository validation

See `VALIDATION.md`. Required npm commands are **NOT RUN** in this reconstruction environment.
