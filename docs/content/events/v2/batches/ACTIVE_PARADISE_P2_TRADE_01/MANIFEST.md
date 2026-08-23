# ACTIVE_PARADISE_P2_TRADE_01 — Manifest / Worker Report

## Baseline

- Repository: `NathanTheophile/opfg`
- Branch read: `dev`
- Exact commit HEAD observed before authoring: `c71b0e65f6cf3f75312f63d4aa8b120e172393eb`
- Tree: `0af79f6ab0a3468639f8c5675ee8a5b7bc9f6a66`
- Content Schema: **16**
- Save version: **23**
- Route authority verified in current navigation runtime: History Event `active_paradise_route_start_p2_trade`.
- Scope: content + FR/EN localization only. No engine/schema/save/UI/navigation changes.
- No commit / push / PR.

## Production summary

| Metric | Result |
|---|---:|
| Normal roots | **45** |
| Main-stop coverage | **5 × 9 stops/clusters** |
| Dice roots | **27 / 45 = 60.0%** |
| Immediate roots | **9** |
| Immediate EventDefinitions | **9** |
| Route-wide Scheduled structures | **1** |
| Scheduled descendants | **3** (L2/L3/L4) |
| Total EventDefinitions | **57** |
| Recruitment roots | **0** |
| New persistent definitions | **0** |
| Seeded persistent NPC references | **0** |

## Per-stop root coverage

| Stop / accepted cluster | Normal roots | Dice roots | Immediate roots |
|---|---:|---:|---:|
| `glassreef_island` | 5 | 3 | 1 |
| `shade_port` | 5 | 3 | 1 |
| `kyuuka_island` | 5 | 3 | 1 |
| `bourgeois_kingdom` | 5 | 3 | 1 |
| `goldfish_empire` | 5 | 3 | 1 |
| `karakuri_island` | 5 | 3 | 1 |
| `porco_kingdom` | 5 | 3 | 1 |
| `water_seven` + `shift_station` + `st_poplar` | 5 (2 + 2 + 1) | 3 | 1 |
| `sabaody_archipelago` | 5 | 3 | 1 |

All 45 roots require Active phase + `hasPlayed(active_paradise_route_start_p2_trade)` + `isOnLand` + exact local Location gate.

## Route-wide Scheduled graph

```text
L1 Normal @ Glassreef Island
active_paradise_p2_trade_01_split_cargo_mark
  +2 months -> active_paradise_p2_trade_01_trade_mark_s02_duplicate_invoice
  +2 months -> active_paradise_p2_trade_01_trade_mark_s03_split_manifest
  +2 months -> active_paradise_p2_trade_01_trade_mark_s04_final_registry
  -> terminal
```

The arc follows a split copper cargo mark across unrelated trade paperwork. It remains causal without introducing a quest flag or `routeId`.

- L2/L3/L4: `scheduledReach: unrestricted`, route History-gated, Paradise-only, landfall-only.
- L2/L3 cancel on Paradise exit or if Sabaody is reached before they resolve.
- L4 is terminal, may resolve at Sabaody, and cancels only on Paradise exit.
- Every node schedules only its immediate successor.
- No sibling future nodes are queued.

## Shared-stop History-gate audit

| Shared pressure in P2 | Local roots | Result |
|---|---:|---|
| `goldfish_empire` | 5 | PASS |
| `karakuri_island` | 5 | PASS |
| `porco_kingdom` | 5 | PASS |
| `water_seven` cluster | 5 | PASS |
| `sabaody_archipelago` | 5 | PASS |

The route-start History gate is also present on every non-shared P2 root as defensive route ownership.

## CrewRole reference audit

Current runtime roles referenced only as additive scene expertise:

- `shipwright` — Glassreef repair yard, Karakuri boiler, Water Seven salvage, Sabaody coating queue;
- `helmsman` — Glassreef shore-side salvage maneuver;
- `foreman` — Shade weighhouse / Karakuri workshop flow;
- `cook` — Kyuuka cold-chain / Porco cold-room logistics;
- `scholar` — Bourgeois invoices / Goldfish official weights;
- `first_mate` — Water Seven canal traffic coordination;
- `navigator` — Sabaody convoy schedule comparison.

No `gunner`, `fighter`, or `quartermaster`. No annual role power is encoded as a Choice. No passive-role or Companion global Stat bonus is duplicated.

## Recruitment audit

**0 recruitment roots.** No reachable `setNpcStatus(status: crew)` exists, so the Recruiter system cannot misclassify a trade scene as recruitment. No candidate Role gate or vacancy gate exists.

## Seeded-NPC audit

**PASS / N/A.** No persistent NPC or `cast` reference is introduced. All merchants, porters, clerks, artisans, guards, travelers and workers are event-local generic actors; no seeded personal fallback name is hardcoded.

## Canon / timeline notes

- P2 remains an OPFG-authored commercial Paradise route, matching current World V1’s ports/markets/royal/industrial/shipyard identity.
- Major canon outcomes are untouched; no major canon character is cast.
- Water Seven content stays in shipyard, freight, canal and Sea Train interstices.
- Sabaody is treated as convergence/transit pressure, legal trade mixed with fraud and criminal pressure, not a replacement canon climax.
- `bourgeois_kingdom`, `goldfish_empire`, and `porco_kingdom` avoid unsupported named rulers or invented canon outcomes; their scenes stay at the level of markets, offices, guilds and local administration.

## Starvation / dead-schedule audit

- Exactly five route-owned Normal roots exist at every required stop/cluster.
- Every Normal root has at least three Choices; role-gated choices are additive and never the sole action.
- All local roots are land-only and exact-location owned.
- All Immediate targets are present in-bundle and consume no additional Active month.
- Scheduled descendants are not tied to the seed Location; they resolve at eligible P2/Paradise landfalls.
- L2/L3 explicitly cancel at Sabaody or Paradise exit; L4 is terminal and cannot schedule beyond itself.
- No extra Scheduled structure exists.

## Localization

- FR keys: **545**
- EN keys: **545**
- Same keyset in both locales.
- Root Situation→Reaction bodies target 20–45 words; Immediate/Scheduled bodies target 12–40 words.

## Bundle files

- `src/game/content/events/v2/ordinary/ACTIVE_PARADISE_P2_TRADE_01/*.json` — runtime EventDefinitions.
- `localization/fr.patch.json`, `localization/en.patch.json` — namespaced locale additions.
- `manifest.json` — machine-readable inventory.
- `BUNDLE_AUDIT.json` — generated structural audit.
- `tools/install.mjs` — collision-safe no-commit installer for a current OPFG worktree.
- `tools/verify-package.mjs` — package-local structural verifier.
- `VALIDATION.txt` — exact validation record for this execution environment.

## Repository validation commands

Required after bundle installation:

```bash
npm run validate-content
npm test
npm run build
```

See `VALIDATION.txt` for exact execution status in this worker environment.
