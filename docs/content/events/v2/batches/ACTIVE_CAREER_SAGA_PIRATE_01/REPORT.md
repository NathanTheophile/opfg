# ACTIVE_CAREER_SAGA_PIRATE_01 — Handoff Report

## Baseline

- Repository: `NathanTheophile/opfg`
- Branch: `dev`
- Exact current HEAD audited: `7d2d4805f07dc00990bedd51e3c673cb65fceafd`
- Content Schema: **15**
- Batch: `ACTIVE_CAREER_SAGA_PIRATE_01`
- Saga / Track: `career_pirate`
- Runtime target: `src/game/content/events/v2/major-tracks/career_pirate`
- Repository writes: **none**
- Push / commit / PR: **none**

## Deliverables

- `career_pirate.authoring.json` — complete isolated authoring source.
- `ACTIVE_CAREER_SAGA_PIRATE_01_REPORT.md` — this handoff/planning report.

The source intentionally does **not** edit shared `catalogFactory.ts`, generated runtime Events, another Saga, engine, schema, save, UI, or navigation.

## Structure summary

- Temporal Layers: **10**
- Authored EventDefinitions: **70**
  - Major Normal roots: **35**
  - Immediate continuations: **35**
  - Scheduled: **0**
- Roots opening an Immediate mini-arc: **35/35 = 100%**
- Immediate depth: **1** after every root; no padded transition chains.
- Dice roots: **21/35 = 60%**
- Dice threshold distribution: **{11: 8, 14: 9, 17: 4}**
- New persistent definitions: **none**
- Career switches after opener: **none**
- Pirate ranks: **none**
- Generic Lifetime / Scheduled career thread: **none**

## Proposed chapters / due ages

All Layers are two biological years apart. The track starts at age 16, leaving the Active opener/first establishment outside this Major Track, and resolves at age 34 before the V1 420-month horizon.

| Layer | Chapter ID | Due ageMonths | Age | Roots | Immediates | Total definitions |
|---:|---|---:|---:|---:|---:|---:|
| 1 | `active_01_name_on_the_water` | 192 | 16 | 2 | 2 | 4 |
| 2 | `active_02_first_hunt` | 216 | 18 | 4 | 4 | 8 |
| 3 | `active_03_crew_and_keel` | 240 | 20 | 4 | 4 | 8 |
| 4 | `active_04_wanted_horizon` | 264 | 22 | 4 | 4 | 8 |
| 5 | `active_05_code_under_fire` | 288 | 24 | 4 | 4 | 8 |
| 6 | `active_06_great_line_choice` | 312 | 26 | 4 | 4 | 8 |
| 7 | `active_07_sea_knows_your_flag` | 336 | 28 | 4 | 4 | 8 |
| 8 | `active_08_price_of_command` | 360 | 30 | 3 | 3 | 6 |
| 9 | `active_09_legend_or_ruin` | 384 | 32 | 3 | 3 | 6 |
| 10 | `active_10_what_the_flag_means` | 408 | 34 | 3 | 3 | 6 |

## Root counts by layer

### Layer 1 — `active_01_name_on_the_water` (2 roots / 4 definitions)
- `career_pirate_01_inherited_wake` — priority 40
- `career_pirate_01_first_flag` — **fallback**

### Layer 2 — `active_02_first_hunt` (4 roots / 8 definitions)
- `career_pirate_02_red_sail_toll` — priority 30
- `career_pirate_02_harbor_debt` — priority 30
- `career_pirate_02_false_manifest` — priority 30
- `career_pirate_02_first_story_spreads` — **fallback**

### Layer 3 — `active_03_crew_and_keel` (4 roots / 8 definitions)
- `career_pirate_03_prize_at_anchor` — priority 40
- `career_pirate_03_crew_draws_line` — priority 30
- `career_pirate_03_salt_chart` — priority 20
- `career_pirate_03_small_flag_big_sea` — **fallback**

### Layer 4 — `active_04_wanted_horizon` (4 roots / 8 definitions)
- `career_pirate_04_navy_net` — priority 40
- `career_pirate_04_port_under_siege` — priority 30
- `career_pirate_04_double_crossed_buyer` — priority 20
- `career_pirate_04_poster_on_wall` — **fallback**

### Layer 5 — `active_05_code_under_fire` (4 roots / 8 definitions)
- `career_pirate_05_captain_without_permission` — priority 40
- `career_pirate_05_island_tax` — priority 30
- `career_pirate_05_hunters_at_breakfast` — priority 20
- `career_pirate_05_black_market_lantern` — **fallback**

### Layer 6 — `active_06_great_line_choice` (4 roots / 8 definitions)
- `career_pirate_06_paradise_whisper` — priority 40
- `career_pirate_06_blue_kingpin` — priority 30
- `career_pirate_06_scarred_hull` — priority 20
- `career_pirate_06_captains_table` — **fallback**

### Layer 7 — `active_07_sea_knows_your_flag` (4 roots / 8 definitions)
- `career_pirate_07_government_convoy` — priority 40
- `career_pirate_07_crew_legend` — priority 30
- `career_pirate_07_old_home_message` — priority 20
- `career_pirate_07_name_reaches_ahead` — **fallback**

### Layer 8 — `active_08_price_of_command` (3 roots / 6 definitions)
- `career_pirate_08_new_world_gate` — priority 40
- `career_pirate_08_stranded_legend` — priority 30
- `career_pirate_08_captain_at_crossroads` — **fallback**

### Layer 9 — `active_09_legend_or_ruin` (3 roots / 6 definitions)
- `career_pirate_09_legendary_heist` — priority 40
- `career_pirate_09_crew_crown` — priority 30
- `career_pirate_09_world_sets_price` — **fallback**

### Layer 10 — `active_10_what_the_flag_means` (3 roots / 6 definitions)
- `career_pirate_10_storm_king` — priority 40
- `career_pirate_10_free_harbor` — priority 30
- `career_pirate_10_flag_beyond_you` — **fallback**


## Branch / reconvergence diagram

```text
L1  inherited wake ───────────────┐
    fresh pirate fallback ────────┘
                   │
                   ▼
L2  red-sail toll / harbor debt / false manifest
    + route-local fallback: first story spreads
                   │
                   ▼
L3  shipless prize / crew line / inherited salt chart
    + route-local fallback: small flag, big sea
                   │
                   ▼
L4  Navy net / port siege / double-crossed buyer
    + route-local fallback: poster on the wall
                   │
                   ▼
L5  command challenge / island tax / hunters
    + route-local fallback: black-market lantern
                   │
                   ▼
L6  Paradise / Blue kingpin / scarred hull
    + route-local fallback: captains' table
                   │
                   ▼
L7  Government convoy / crew legend / family callback
    + route-local fallback: name reaches ahead
                   │
                   ▼
L8  New World gate / shipless legend
    + route-local fallback: captain at crossroads
                   │
                   ▼
L9  legendary heist / crew crown
    + route-local fallback: world sets the price
                   │
                   ▼
L10 feared legend: Storm King
    protective/network legend: Free Harbor
    + route-local fallback: Flag Beyond You
```

Every layer after L1 reconnects through current state and History rather than preserving a binary branch forever. The fallback node of each layer lists every root from the immediately previous layer as parents, so the structural DAG cannot starve if all specialized gates fail.

## Route / scenario plan

The authoring source keeps `scenarios: []` and `rules.enforceScenarioCoverage: false` deliberately: the current generic Saga scenario runner is Childhood-oriented and does not model the required Active career state cleanly. Once the shared `career_pirate` registration and an Active-capable scenario harness exist, the following routing matrix should become executable coverage.

| Scenario | State / History | Expected root |
|---|---|---|
| L1 Family handoff | one of the exact accepted Family Pirate Layer-5 outcomes | `career_pirate_01_inherited_wake` |
| L1 fresh Pirate | career=pirate, no accepted Family Pirate handoff outcome | `career_pirate_01_first_flag` |
| L2 force/noise | aggressive/legacy-oriented L1 History | `career_pirate_02_red_sail_toll` |
| L2 own code | code/terms-oriented L1 History | `career_pirate_02_harbor_debt` |
| L2 quiet/deception | quiet/unread L1 History | `career_pirate_02_false_manifest` |
| L3 shipless | no ship + can acquire sloop | `career_pirate_03_prize_at_anchor` |
| L3 crew | has crew | `career_pirate_03_crew_draws_line` |
| L3 inherited chart | equipped family_pirate_salt_chart | `career_pirate_03_salt_chart` |
| L4 wanted | bounty >= 25,000 | `career_pirate_04_navy_net` |
| L4 crew notoriety | reputation >= 10 + crew | `career_pirate_04_port_under_siege` |
| L4 liquid capital | berries >= 5,000 | `career_pirate_04_double_crossed_buyer` |
| L5 command | ship + crew | `career_pirate_05_captain_without_permission` |
| L5 notoriety | reputation >= 15 | `career_pirate_05_island_tax` |
| L5 hunted | bounty >= 50,000 | `career_pirate_05_hunters_at_breakfast` |
| L6 Paradise | currentSea=grand_line_paradise | `career_pirate_06_paradise_whisper` |
| L6 Blue kingpin | currentSea in a Blue + reputation >= 20 | `career_pirate_06_blue_kingpin` |
| L6 damaged ship | has ship + ship health <= 15 | `career_pirate_06_scarred_hull` |
| L7 major bounty | bounty >= 100,000 + ship | `career_pirate_07_government_convoy` |
| L7 established crew | crew size >= 3 | `career_pirate_07_crew_legend` |
| L7 family callback | inherited-wake history + mother present | `career_pirate_07_old_home_message` |
| L8 New World | currentSea=new_world | `career_pirate_08_new_world_gate` |
| L8 shipless veteran | no ship + reputation >= 25 | `career_pirate_08_stranded_legend` |
| L9 high-profile heist | reputation >= 35 + bounty >= 200,000 | `career_pirate_09_legendary_heist` |
| L9 veteran crew | crew size >= 4 + ship | `career_pirate_09_crew_crown` |
| L10 feared legend | reputation >= 45 + aggressive/legend prior History | `career_pirate_10_storm_king` |
| L10 protective network | reputation >= 40 + sharing/protective prior History | `career_pirate_10_free_harbor` |
| Fallback spine | strip every specialized gate at each layer | `each route-local fallback in sequence` |

Coverage rule for integration: add at least one executable route scenario for every specialized Major root plus one full fallback spine. Ties should also receive deterministic seed coverage where two specialized roots can be simultaneously eligible.

## Exact Family Pirate handoff used by Layer 1

`career_pirate_01_inherited_wake` uses an `any` condition over the real accepted Family Pirate Layer-5 outcomes below. No new flag or Saga progress state is introduced.

| Family Pirate Event | Outcome |
|---|---|
| `family_pirate_13_flag_means_mine_i01_take_pirate` | `active_pirate_take_pirate` |
| `family_pirate_13_safe_harbor_key_i01_use_network` | `active_pirate_use_network` |
| `family_pirate_13_ledger_of_names_i01_pirate_with_ledger` | `active_pirate_pirate_with_ledger` |
| `family_pirate_13_mothers_salt_chart_i01_follow_sea` | `active_pirate_follow_sea` |
| `family_pirate_13_crew_has_limits_i01_captain_rules` | `active_pirate_captain_rules` |
| `family_pirate_13_return_the_share_i01_pirate_repay` | `active_pirate_pirate_repay` |
| `family_pirate_13_no_innocents_code_i01_pirate_code` | `active_pirate_pirate_code` |
| `family_pirate_13_own_depth_i01_pirate_terms` | `active_pirate_pirate_terms` |
| `family_pirate_13_fallback_pursuit_i01_pirate_network` | `active_pirate_pirate_network` |
| `family_pirate_13_fallback_household_i01_take_sea` | `active_pirate_take_sea` |
| `family_pirate_13_fallback_legacy_i01_pirate_history` | `active_pirate_pirate_history` |

`career_pirate_01_first_flag` is the L1 fallback for an already-established Active Pirate without one of those strong pre-Active Pirate History outcomes.

## Career route design

The track deliberately avoids a fake Pirate rank ladder. Progression is expressed by a changing combination of:

- `Reputation` and bounty;
- ship ownership/condition;
- crew presence/size;
- Berrys/assets;
- title history (`rookie`, `veteran`, `legend` only where the current catalogue allows it);
- geography (Blues, Paradise, New World);
- prior choices/outcomes;
- the Family Pirate inheritance when present.

Reconvergence is state-driven. A player can begin as inherited pirate, opportunist, code-driven captain, smuggler, violent raider, crew-centered leader, shipless legend, or high-bounty target without being forced into one morality axis. Late L10 identity resolves primarily into **Storm King**, **Free Harbor**, or the mixed fallback **Flag Beyond You**, with History retaining the route actually lived.

## Restrictive eligibility and starvation audit

Specialized nodes are intentionally restrictive, but none is required for structural progression:

- L3: shipless prize, crew, equipped inherited chart.
- L4: bounty `>= 25,000`, reputation `>= 10 + crew`, or Berrys `>= 5,000`.
- L5: ship+crew, reputation `>= 15`, bounty `>= 50,000`.
- L6: Paradise, Blue+reputation, or critically damaged ship.
- L7: bounty `>= 100,000 + ship`, crew size `>= 3`, or inherited-family callback with mother present.
- L8: New World or shipless veteran.
- L9: high reputation+bounty or large crew+ship.
- L10: high reputation plus relevant prior identity History.

Every Layer has exactly **one route-local fallback**. From L2 onward that fallback lists **all previous-layer roots** in `parentNodeIds`. Therefore there is no structural starvation path inside the authoring DAG even when all specialized Conditions fail.

## Dice audit

All 21 Dice roots intentionally contain **one real uncertain execution** plus deterministic alternatives based on explicit payment, concession, retreat, restraint, or identity tradeoff. A second Dice option was not added when it would exist only to satisfy a mechanical pattern.

| Root | Dice | Alternatives déterministes |
|---|---|---|
| `career_pirate_01_first_flag` | Faire parler de toi [charisma 11] | Choisir tes règles / Rester imprévisible |
| `career_pirate_02_red_sail_toll` | Briser leur ligne [strength 14] | Payer en les marquant / Retourner les autres |
| `career_pirate_02_harbor_debt` | Chasser la bande [agility 11] | Vendre ta protection / Armer le quartier |
| `career_pirate_02_false_manifest` | Repérer le faussaire [observation 14] | Acheter une sortie / Revendiquer la cargaison |
| `career_pirate_03_prize_at_anchor` | Prendre le pont [agility 14] | Racheter la créance / Vendre l’emplacement |
| `career_pirate_03_crew_draws_line` | Imposer ta part [charisma 11] | Partager à parts égales / Leur laisser le surplus |
| `career_pirate_04_navy_net` | Passer entre les patrouilles [agility 14] | Acheter un passage / Sortir à visage découvert |
| `career_pirate_04_port_under_siege` | Ouvrir le puits [strength 14] | Racheter les vivres / Couper leurs réserves |
| `career_pirate_04_double_crossed_buyer` | Lire le piège [observation 11] | Acheter son silence / Quitter la vente |
| `career_pirate_05_captain_without_permission` | Maintenir le cap [navigation 14] | Changer de cap / Demander leur cap |
| `career_pirate_05_hunters_at_breakfast` | Retourner la salle [agility 14] | Finir ton repas / Leur vendre une cible |
| `career_pirate_06_paradise_whisper` | Remonter jusqu’à l’acheteur [intelligence 14] | Vendre un faux cap / Annoncer ton vrai cap |
| `career_pirate_06_blue_kingpin` | Retourner la négociation [charisma 14] | Payer une fois / Briser son modèle |
| `career_pirate_06_scarred_hull` | Réparer avec l’équipage [intelligence 11] | Payer la vraie réparation / Réduire les risques |
| `career_pirate_07_government_convoy` | Déclencher le piège d’abord [observation 17] | Suivre sans attaquer / Frapper le navire de tête |
| `career_pirate_07_crew_legend` | Présenter chaque membre [charisma 11] | Rester le symbole / Faire parler du pavillon |
| `career_pirate_07_name_reaches_ahead` | Calmer la rue [charisma 11] | Utiliser la peur / Récompenser les portes ouvertes |
| `career_pirate_08_new_world_gate` | Franchir leur ligne [navigation 17] | Proposer un duel / Ignorer le trophée |
| `career_pirate_09_legendary_heist` | Choisir la fenêtre [intelligence 17] | Payer le convoyeur / Annoncer le vol |
| `career_pirate_09_crew_crown` | Porter le titre en public [charisma 11] | Partager le mérite / Refuser l’étiquette |
| `career_pirate_10_storm_king` | Forcer l’entrée [navigation 17] | Prendre la rançon / Refuser l’achat |

For every Dice resolution:

- `failure` has a real downside beyond missed positive Stat progression;
- `criticalFailure` is worse than ordinary failure;
- no root creates the forbidden `success -> +1 / failure -> +0 cosmetic` pattern;
- Reputation effects are never negative in Pirate Active content.

## Editorial / mechanical audit

Custom static audit result: **PASS — 0 anomalies detected**.

Checked locally against the authoring source:

- unique IDs and `career_pirate_` prefix;
- FR/EN present throughout;
- root body 20–45 words;
- Immediate body 12–40 words;
- outcomes 5–25 words;
- choice labels 2–10 words;
- chapter IDs and parent-layer references;
- exactly one fallback per layer;
- full route-local fallback coverage;
- specialized roots gated by eligibility;
- every specialized root has a mini-arc;
- every queued Immediate exists;
- no orphan/cyclic Immediate nodes;
- every Event has at least one unconditional resolvable Choice;
- Dice outcome key completeness;
- Dice failure/critical-failure consequence severity;
- terminal persistent reward requirement;
- no actual `setCareerAffiliation`, `setCareerRank`, `scheduleEvent`, `raiseConquerorHakiTo`, `endCareerWithEnding`, or Bounty Hunter usage;
- no negative `modifyReputation` effect;
- no unknown Career Title IDs;
- no new persistent definition.

## Exact shared MajorTrack registration requested from integrator

The later shared integration worker should add exactly this `MajorNarrativeTrackDefinition` to the shared catalogue:

```ts
{
  id: 'career_pirate',
  type: 'personal_affiliation',
  eligibility: { type: 'careerAffiliationIs', affiliationId: 'pirate' },
  chapters: [
    { id: 'active_01_name_on_the_water', phase: 'active', dueAgeMonths: 192 },
    { id: 'active_02_first_hunt', phase: 'active', dueAgeMonths: 216 },
    { id: 'active_03_crew_and_keel', phase: 'active', dueAgeMonths: 240 },
    { id: 'active_04_wanted_horizon', phase: 'active', dueAgeMonths: 264 },
    { id: 'active_05_code_under_fire', phase: 'active', dueAgeMonths: 288 },
    { id: 'active_06_great_line_choice', phase: 'active', dueAgeMonths: 312 },
    { id: 'active_07_sea_knows_your_flag', phase: 'active', dueAgeMonths: 336 },
    { id: 'active_08_price_of_command', phase: 'active', dueAgeMonths: 360 },
    { id: 'active_09_legend_or_ruin', phase: 'active', dueAgeMonths: 384 },
    { id: 'active_10_what_the_flag_means', phase: 'active', dueAgeMonths: 408 },
  ],
}
```

No other shared gameplay definition is requested by this batch.

## Validation status

### Completed

- Current `dev` read through the authenticated GitHub connector.
- Exact HEAD rechecked: `7d2d4805f07dc00990bedd51e3c673cb65fceafd`.
- Current Content Schema rechecked: **15**.
- Current `scripts/saga-content.ts` / `scripts/saga-content/lib.ts` contract inspected.
- Current Family Pirate authoring/handoff IDs inspected.
- Current `catalogFactory.ts` inspected: `career_pirate` is **not yet** in the shared Major Track catalogue.
- Custom source-level structural/editorial/mechanical audit: **PASS, 0 issues**.

### Not executable in this worker environment

The repository is private and no authenticated writable local checkout is mounted. `git clone/fetch` from the container cannot authenticate, while GitHub connector write operations would create commits and violate the explicit **NO COMMIT** constraint.

Therefore these official commands were **not** run and are **not claimed green**:

```text
npx jiti scripts/saga-content.ts compile career_pirate
npx jiti scripts/saga-content.ts check career_pirate
npm run validate-content
npm test
npm run build
```

After the authoring file is placed in the repository, `compile/check` may additionally fail until the shared `career_pirate` track registration above is integrated. That missing shared registration is expected and intentionally out of this worker's exclusive territory.

The source also leaves Saga routing scenarios disabled because the current scenario runner is Childhood-oriented; the exact Active scenario plan is supplied above for the later integration/harness pass.

## Final handoff

- Authoring source complete: **yes**
- 10 chapters proposed: **yes**
- 60–90 total EventDefinitions target: **70**
- L1 two contextual entries: **yes**
- Long-form divergent/reconvergent DAG: **yes**
- Career resolution target 25–35: **age 34**
- No post-opener career switch: **yes**
- No Bounty Hunter: **yes**
- No engine/schema/save/UI/navigation edits: **yes**
- No shared catalogue edit: **yes**
- No push / commit / PR: **yes**
