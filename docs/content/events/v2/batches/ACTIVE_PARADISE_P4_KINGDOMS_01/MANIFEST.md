# ACTIVE_PARADISE_P4_KINGDOMS_01 — Manifest

## Baseline / scope

- Repository authority checked: `NathanTheophile/opfg` / `dev`.
- Observed `dev` commit before authoring: `63b93cead6bf7b845839c40371048005e3ca7a08` (tree `7ffaead34e2b13038f915d5483c594a11e9cadc6`).
- Observed Content Schema: **16**.
- Content-only delivery: no engine/schema/save/UI/navigation edits.
- No commit, push, or PR.

## Runtime payload

- Normal roots: **45**.
- Dice roots: **27 / 45 = 60.0%**.
- Immediate roots: **6**; Immediate EventDefinitions: **6**.
- Route-wide Scheduled structures: **1**.
- Scheduled EventDefinitions after seed: **3** (four temporal layers including seed).
- Total EventDefinitions: **54**.
- New persistent definitions: **0**.
- Recruitment roots: **0**.
- Seeded persistent NPCs used: **0**.

## Per-stop root coverage

| Stop / accepted cluster | Roots | Dice roots | Route gate |
|---|---:|---:|---|
| `goldfish_empire` | 5 | 3 | route History-gated |
| `yano_country` | 5 | 3 | route History-gated |
| `tehna_gehna_kingdom` | 5 | 3 | route History-gated |
| `rommel_kingdom` | 5 | 3 | route History-gated |
| `eigisu_kingdom` | 5 | 3 | route History-gated |
| `ottankaina_kingdom` | 5 | 3 | route History-gated |
| `porco_kingdom` | 5 | 3 | route History-gated |
| `momoiro_island` | 5 | 3 | route History-gated |
| `sabaody_archipelago` | 5 | 3 | route History-gated |

Momoiro roots use `locationWithin(momoiro_island)`, so the accepted local cluster `kamabakka_kingdom` is covered without creating duplicate route state.

## Immediate roots

- `active_paradise_p4_kingdoms_01_goldfish_petition_tokens`
- `active_paradise_p4_kingdoms_01_rommel_duel_square`
- `active_paradise_p4_kingdoms_01_ottankaina_grain_bid`
- `active_paradise_p4_kingdoms_01_porco_royal_mosaic`
- `active_paradise_p4_kingdoms_01_momoiro_tailor_challenge`
- `active_paradise_p4_kingdoms_01_sabaody_grove_checkpoint`

All six are one-step same-scene continuations; they consume no additional Active month.

## Route-wide Scheduled graph

```text
active_paradise_p4_kingdoms_01_goldfish_seven_seals
  +2 months -> active_paradise_p4_kingdoms_01_route_seals_s02_counterseal
  +2 months -> active_paradise_p4_kingdoms_01_route_seals_s03_rejected_papers
  +2 months -> active_paradise_p4_kingdoms_01_route_seals_s04_open_registry
  -> terminal
```

Rules implemented:

- seed requires `hasPlayed(active_paradise_route_start_p4_kingdoms)`;
- every Scheduled node independently requires the same History identity;
- every reachable outcome in a layer schedules **only the next layer**;
- `scheduledReach: unrestricted`;
- pending remainder cancels on `locationIs(sabaody_archipelago)` or when no longer in `grand_line_paradise`;
- seed additionally requires `ageAtMostMonths(414)` so the six-month chain cannot begin beyond the V1 horizon;
- no route flag, quest state, `routeId`, or alternate navigation state.

## Shared-stop History-gate audit

- `goldfish_empire`: **5/5** route-owned roots explicitly gate on `active_paradise_route_start_p4_kingdoms`.
- `porco_kingdom`: **5/5** gate.
- `sabaody_archipelago`: **5/5** gate.
- Total shared-stop audit: **15/15 PASS**.

## CrewRole reference audit

| Event | Role | Semantics |
|---|---|---|
| `active_paradise_p4_kingdoms_01_goldfish_palace_scales` | `scholar` | current runtime holder only |
| `active_paradise_p4_kingdoms_01_yano_floodgate_argument` | `foreman` | current runtime holder only |
| `active_paradise_p4_kingdoms_01_tehna_guest_stores` | `cook` | current runtime holder only |
| `active_paradise_p4_kingdoms_01_rommel_weapon_registry` | `first_mate` | current runtime holder only |
| `active_paradise_p4_kingdoms_01_eigisu_street_choir` | `musician` | current runtime holder only |
| `active_paradise_p4_kingdoms_01_ottankaina_weighhouse_fire` | `foreman` | current runtime holder only |
| `active_paradise_p4_kingdoms_01_porco_broken_crane` | `shipwright` | current runtime holder only |
| `active_paradise_p4_kingdoms_01_momoiro_clinic_queue` | `medic` | current runtime holder only |
| `active_paradise_p4_kingdoms_01_sabaody_coating_queue` | `shipwright` | current runtime holder only |
| `active_paradise_p4_kingdoms_01_sabaody_departure_window` | `navigator` | current runtime holder only |

- Valid current IDs only.
- No `gunner`, `fighter`, or `quartermaster`.
- Role-gated Choices test the player's **current** assignment with `hasCrewRole`.
- Role Dice use `actor.type = crewRole` only where that current holder's expertise resolves the scene.
- No annual role power encoded as an Event Choice.
- No passive-role substitute Stat bonuses.

## Recruitment audit

**0 recruitment roots.** No reachable `setNpcStatus(status: crew)` effect exists in the batch, so Recruiter classification will not falsely ingest a local political scene.

## Seeded-NPC interpolation audit

**N/A / PASS.** No persistent seeded NPC is introduced or directly named. All scene actors are event-local social roles (clerk, merchant, guard, courier, etc.).

## Canon / timeline notes

- P4 remains an OPFG-authored Paradise route about kingdoms, trade, diplomacy, bureaucracy, local disputes, and reputation.
- Everyday actors are original/generic.
- No major canon character is inserted and no canon outcome is rewritten.
- Sabaody is treated as route convergence/local life, not a replacement canon climax.

## Starvation / dead-schedule audit

- Every main stop has exactly five route-owned Normal roots.
- All roots have at least two universally available Choices; resource/role Choices never become the sole action.
- Route arc cannot dead-schedule after Sabaody or Paradise exit because pending nodes explicitly cancel.
- Scheduled nodes use route-wide eligibility rather than requiring residence at one old stop for months.
- The bounded route arc terminates after S4 and creates no further schedule.

## Localization

- EN keys: **554**.
- FR keys: **554**.
- Key parity / referenced-key coverage: **PASS**.
- Runtime payload uses normal localization keys; `localization/*.patch.json` contains additions for safe merge.

## Editorial budget audit

- Root bodies outside the ordinary 20–45 word target: **0** (`BUNDLE_AUDIT.json` lists them).
- Immediate/Scheduled bodies outside the 12–40 target: **0**.
- These counts use a whitespace-style automated approximation; manual copy review remains authoritative.

## Installation

From an OPFG worktree at the verified target `dev` revision:

```bash
node /path/to/ACTIVE_PARADISE_P4_KINGDOMS_01/tools/install.mjs
npm run validate-content
npm test
npm run build
```

The installer preflights destination-folder and localization-key collisions before writing. It does not create a Git commit.

## Exact command results in this environment

- `npm run validate-content` — **NOT RUN**: no OPFG worktree is mounted locally; GitHub connector access does not provide a mutable no-commit worktree.
- `npm test` — **NOT RUN** for the same reason.
- `npm run build` — **NOT RUN** for the same reason.
- bundle structural audit — **PASS** (see `BUNDLE_AUDIT.json`).

Do not report the batch as repository-integrated until the three repository commands above are executed after installation.
