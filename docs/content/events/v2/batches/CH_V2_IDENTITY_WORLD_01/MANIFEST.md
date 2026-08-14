# MANIFEST — CH_V2_IDENTITY_WORLD_01

> **Package-only authoring deliverable.**  
> Repository authority: `NathanTheophile/opfg`, branch `dev`, HEAD `3aa3b197b027c4508bb628c03d1c1dfd34acc829`.  
> This package was authored against Content Schema **14** and the current V2 Childhood contract at that HEAD.
>
> No repository file was modified. No commit, merge, Concept Index update, Migration Ledger update, selector/runtime change, global localization edit, or Family Major Saga edit is included.

## 1. Batch identity

- **Batch ID:** `CH_V2_IDENTITY_WORLD_01`
- **Reserved Event prefix used:** `ch_v2_identity_world_01_`
- **Domain:** ordinary Childhood — Identity / wider world.
- **Primary age territory:** approximately 4–14.
- **Root target:** exactly 20 Normal roots.
- **Core rule:** major world elements appear through immediate friction: contradiction, error, rule, transaction, accusation, deadline, problematic object, authority, or visible consequence.
- **Canon policy:** no canon-character cameo. Generic/original local actors form the entire cast.
- **Family protection:** all five runtime Family Sagas are treated as protected territory: Civilian, Marine, Pirate, Revolutionary, Royal.

## 2. Package inventory

- `events/`: **59** EventDefinition JSON files.
  - **20** Normal roots.
  - **21** Immediate descendants.
  - **18** Scheduled Lifetime descendants.
- `localization/fr.fragment.json`: package-local French localization fragment.
- `MANIFEST.md`: this audit.
- `PROPOSED_DEFINITIONS.md`: **not created** — no new persistent definition is required.
- English localization: not authored in this package.

## 3. Root coverage audit

| # | Root ID | Age | Primary context | Dice at root | Immediate max depth |
|---:|---|---|---|---:|---:|
| 01 | `ch_v2_identity_world_01_foreign_quay_deadline` | 5–9 | port | oui | 3 |
| 02 | `ch_v2_identity_world_01_harbor_signal_mismatch` | 8–12 | port | oui | 2 |
| 03 | `ch_v2_identity_world_01_marine_drill_breaks` | 7–10 | marine_presence | oui | 2 |
| 04 | `ch_v2_identity_world_01_three_storm_versions` | 7–11 | food | trade | oui | 2 |
| 05 | `ch_v2_identity_world_01_wanted_poster_misprint` | 10–14 | marine_presence | government | trade service | oui | 2 |
| 06 | `ch_v2_identity_world_01_bounty_board_judgment` | 9–14 | marine_presence | government | trade service | non | — |
| 07 | `ch_v2_identity_world_01_conflicting_newspapers` | 8–13 | trade | general_goods service | oui | 2 |
| 08 | `ch_v2_identity_world_01_incomplete_map_sale` | 8–11 | trade | general_goods service | oui | — |
| 09 | `ch_v2_identity_world_01_grand_line_compass_scam` | 10–14 | trade | general_goods service | oui | 2 |
| 10 | `ch_v2_identity_world_01_pirate_song_unpaid_tab` | 9–14 | food service | oui | 1 |
| 11 | `ch_v2_identity_world_01_anonymous_revolutionary_leaflet` | 11–14 | marine_presence | non | 1 |
| 12 | `ch_v2_identity_world_01_missing_official_stamp` | 10–14 | government | trade service | oui | 2 |
| 13 | `ch_v2_identity_world_01_privileged_public_queue` | 8–14 | government | royal | capital | non | — |
| 14 | `ch_v2_identity_world_01_forbidden_crest_drawing` | 4–9 | royal | capital | non | — |
| 15 | `ch_v2_identity_world_01_departure_missing_role` | 10–14 | port | oui | — |
| 16 | `ch_v2_identity_world_01_departure_omen` | 7–11 | port | non | — |
| 17 | `ch_v2_identity_world_01_sea_king_relic_scam` | 6–10 | trade | general_goods service | oui | — |
| 18 | `ch_v2_identity_world_01_public_chart_warning_erased` | 10–14 | port | oui | 2 |
| 19 | `ch_v2_identity_world_01_seized_pirate_cargo_auction` | 10–14 | government | marine_presence | non | — |
| 20 | `ch_v2_identity_world_01_traveling_notebook` | 9–14 | isOnLand | non | — |

### Coverage notes

- Earliest authored age: **48 months (4 years)**.
- Latest root eligibility: **179 months**, still Childhood.
- Complex institution/politics/navigation concepts are concentrated from roughly 8–10 onward.
- Restricted contexts are intentional and thematic: ports, trade/general-goods services, Government/Royal/Marine/Revolutionary presence.
- `traveling_notebook` is portable across land Locations and does not require a specific Blue/Birth Location.
- This batch does **not** claim to guarantee ordinary-content coverage alone in every Location/age slot. Early service-poor / non-port states rely on the assembled ordinary Childhood pool from the other V2 batches; no selector fallback or runtime guarantee is added here.
- No root uses `raceIs`, `originSeaIs`, exact `locationIs`, `affiliationIs`, parent presence, or a Family Major Track condition. RACE / PLACE / ORIGIN_CROSS / Family territory remains reserved.

## 4. Immediate mini-arc audit

- Mini-arc roots: **11 / 20 = 55%**.
- Required minimum: 10 / 20.
- Roots with reachable depth **2+**: **9 / 11 = 81.8%**.
- Required floor: 40%.
- At least one depth-3 route: **yes**.
- Total Immediate EventDefinitions: **21**.

| Mini-arc root | Maximum reachable consecutive Immediate depth |
|---|---:|
| `ch_v2_identity_world_01_foreign_quay_deadline` | 3 |
| `ch_v2_identity_world_01_harbor_signal_mismatch` | 2 |
| `ch_v2_identity_world_01_marine_drill_breaks` | 2 |
| `ch_v2_identity_world_01_three_storm_versions` | 2 |
| `ch_v2_identity_world_01_wanted_poster_misprint` | 2 |
| `ch_v2_identity_world_01_conflicting_newspapers` | 2 |
| `ch_v2_identity_world_01_grand_line_compass_scam` | 2 |
| `ch_v2_identity_world_01_pirate_song_unpaid_tab` | 1 |
| `ch_v2_identity_world_01_anonymous_revolutionary_leaflet` | 1 |
| `ch_v2_identity_world_01_missing_official_stamp` | 2 |
| `ch_v2_identity_world_01_public_chart_warning_erased` | 2 |

### Depth-3 route

`ch_v2_identity_world_01_foreign_quay_deadline`  
→ `ch_v2_identity_world_01_foreign_quay_deadline_i01`  
→ `ch_v2_identity_world_01_foreign_quay_deadline_i02`  
→ `ch_v2_identity_world_01_foreign_quay_deadline_i03`

Each Immediate changes the situation: unmatched crate → ownership/registry conflict → departure-bell resolution. No Continue-only node is used.

### Depth-1 justification

- `ch_v2_identity_world_01_pirate_song_unpaid_tab`: the song/tab contradiction needs one follow-up settlement beat; extending it would become repetitive debt negotiation.
- `ch_v2_identity_world_01_anonymous_revolutionary_leaflet`: the tract scene gets one immediate pressure escalation when uniforms enter view; further same-scene nodes would overinflate a small political incident.

## 5. Dice-root audit

- Dice roots: **13 / 20 = 65%**.
- Required band: **11–13 roots**.
- Root Dice Choices: **26 total**.
- Every Dice root contains **2 materially different Dice Choices**.
- Roots with only one Dice Choice: **none**.

| Dice root | Dice Choice count | Approaches |
|---|---:|---|
| `ch_v2_identity_world_01_foreign_quay_deadline` | 2 | `read_cargo_marks` → observation 11<br>`bridge_the_accents` → charisma 11 |
| `ch_v2_identity_world_01_harbor_signal_mismatch` | 2 | `decode_pattern` → intelligence 11<br>`read_boat_intent` → navigation 11 |
| `ch_v2_identity_world_01_marine_drill_breaks` | 2 | `spot_opening` → observation 11<br>`call_the_conflict` → charisma 11 |
| `ch_v2_identity_world_01_three_storm_versions` | 2 | `inspect_proofs` → observation 11<br>`cross_question` → charisma 11 |
| `ch_v2_identity_world_01_wanted_poster_misprint` | 2 | `compare_description` → observation 11<br>`slow_the_crowd` → charisma 11 |
| `ch_v2_identity_world_01_conflicting_newspapers` | 2 | `compare_editions` → intelligence 11<br>`question_carriers` → charisma 11 |
| `ch_v2_identity_world_01_incomplete_map_sale` | 2 | `trace_claimed_route` → navigation 11<br>`inspect_print` → observation 11 |
| `ch_v2_identity_world_01_grand_line_compass_scam` | 2 | `test_compass` → intelligence 11<br>`compare_log_pose` → navigation 14 |
| `ch_v2_identity_world_01_pirate_song_unpaid_tab` | 2 | `read_the_tally` → observation 11<br>`negotiate_payment` → charisma 11 |
| `ch_v2_identity_world_01_missing_official_stamp` | 2 | `find_procedure_exception` → intelligence 11<br>`make_clerk_reconsider` → charisma 11 |
| `ch_v2_identity_world_01_departure_missing_role` | 2 | `trace_chalk_marks` → observation 11<br>`question_stevedores` → charisma 11 |
| `ch_v2_identity_world_01_sea_king_relic_scam` | 2 | `inspect_carving` → observation 11<br>`test_story` → intelligence 11 |
| `ch_v2_identity_world_01_public_chart_warning_erased` | 2 | `check_warning_against_chart` → navigation 14<br>`win_temporary_notice` → charisma 11 |

### Dice stats / difficulty distribution

Used at root:
- `observation`
- `charisma`
- `intelligence`
- `navigation`

Thresholds:
- **11** for standard uncertainty.
- **14** only where specialized navigation knowledge is materially harder:
  - real Log Pose comparison;
  - evaluating the erased chart warning.

No Strength/Agility roll was added merely to diversify stats; this batch's dramatic engine is information, institutions, reputation, navigation knowledge, communication, and social pressure.

### Dice consequence profile

Every root Dice Choice uses the current Childhood V2 progression profile:

- `criticalFailure` → **-1** to the rolled Stat plus a concrete setback in fiction;
- `failure` → **0 Stat progression**, with loss/worsening such as lost time, public credibility, a sale continuing, a crowd hardening, an unresolved cargo problem, or an official refusing the attempted solution;
- `success` → **+2** to the rolled Stat;
- `criticalSuccess` → **+2** to the rolled Stat.

No root Dice criticalSuccess uses +3.

Representative failure stakes:
- wrong cargo continues toward the wrong chariot;
- a harbor misunderstanding persists into the next maneuver;
- a Marine deadline is not heard in time;
- the crowd keeps an accusation alive;
- a merchant acts on the wrong newspaper interpretation;
- the map seller retains the advantage;
- a fake Grand Line instrument remains plausible to buyers;
- a missing stamp still blocks responsibility;
- one cargo crate remains unclassified before the bell;
- a forged relic story remains commercially credible;
- an unverified chart warning is still erased.

## 6. Conditioned Choice / Trait audit

Conditioned root Choices:

| Root | Choice | Existing Condition |
|---|---|---|
| `ch_v2_identity_world_01_bounty_board_judgment` | `look_for_missing_context` | `hasTrait` → `suspicious` |
| `ch_v2_identity_world_01_incomplete_map_sale` | `ask_print_date` | `hasTrait` → `suspicious` |
| `ch_v2_identity_world_01_anonymous_revolutionary_leaflet` | `hide_source_question` | `hasTrait` → `cautious` |
| `ch_v2_identity_world_01_forbidden_crest_drawing` | `copy_permitted_marks` | `hasTrait` → `curious` |
| `ch_v2_identity_world_01_departure_omen` | `follow_omen` | `hasTrait` → `superstitious` |
| `ch_v2_identity_world_01_sea_king_relic_scam` | `treat_as_omen` | `hasTrait` → `superstitious` |
| `ch_v2_identity_world_01_seized_pirate_cargo_auction` | `state_witness_openly` | `hasTrait` → `honest` |

Rules:
- every Event containing a conditioned Choice also has multiple unconditional Choices, so resolvability does not depend on the Condition;
- conditioned Choices use existing Traits only;
- **no Trait is acquired anywhere in this batch**;
- therefore there is no deterministic-universal Trait acquisition and no opposite-Trait acquisition conflict.

## 7. Reward / malus audit

### Deterministic baseline

Deterministic player-Stat changes stay within the ordinary V2 gradient:
- normal positive deterministic payoff: **+1**;
- authored deterministic malus: **-1**;
- no deterministic +2/+3 vending;
- many resolutions are intentionally Stat-neutral when the narrative consequence already carries the stake.

Examples of deterministic malus:
- escalating a sailor-story accusation and losing the witness;
- amplifying a bounty-number rumor;
- imitating a privileged queue jump;
- publicly redrawing a forbidden crown;
- mocking a crew's omen;
- allowing a disputed seized lot to continue toward sale.

### Persistent rewards

- New Item: none.
- New NPC: none.
- New Flag: none.
- New Trait: none.
- New Location/system: none.
- Existing persistent NPC state modified: none.
- Bounty/Reputation/Career changed: none.

This keeps Identity/World Childhood focused on worldview, knowledge, public systems and choices rather than handing out adult career state.

## 8. Lifetime Thread audit — Traveling Notebook Horizons

### Qualification

- Primary qualifying Lifetime roots in batch: **exactly 1**.
- Seed root: `ch_v2_identity_world_01_traveling_notebook`
- `lifetimeThreadSeed: true`: yes.
- Durable anchor: a notebook/copying practice circulating between travelers.
- Persistent Item definition: **none**. The notebook is a narrative prop; continuity is represented by History plus vertical Scheduled causality.
- Persistent recurring NPC: **none**.

### Meaning over age

The thread deliberately changes function:

1. **Child:** the wider world is told to the player through answers and stories.
2. **Adolescent:** answers are compared, corrected and shown to have missing context.
3. **Active/later:** the player's own lived travel becomes evidence that can confirm, date, contradict or complicate earlier pages.
4. **Mature continuation:** the player stops treating the notebook as a lore collection and uses it as a method for comparing source, context, date and lived consequence.
5. **Handoff:** the notebook is transmitted to another reader without a final universal answer.

### Graph metrics

- Distinct reachable Scheduled EventDefinitions: **18**.
- Longest complete lived route after seed: **13 Scheduled chapters**.
- Complete structural lived routes: **8** (three sequential binary structural decisions).
- Meaningful structural divergences: **3**.
- Unresolved nested structural splits: **0**.
- Normal next-Scheduled count per resolved chapter: **1**.
- Early termination branches: **none**; all three divergences deliberately reconverge before another structural split.
- Longest delay span seed → final Scheduled: **258 months (~21.5 years)**.
- Earliest seed age: 108 months (9 years).
- Earliest possible final chapter: ~366 months (~30.5 years).
- A seed near the end of Childhood can carry the thread into the mid-thirties.

### Pre-15 slot protection

Earliest possible seed at 108 months:
- S01 due at 126 months;
- S02 due at 144 months;
- S03A/B due at 162 months;
- S04A/B due at 180 months.

Therefore the maximum expected Lifetime descendants **before age 15 is 3**, below the hard maximum of 4.

If another higher-priority root delays a due Scheduled chapter, the actual pre-15 count can only decrease.

### Braided-linear topology

```text
Seed
 ↓ 18m
S01
 ↓ 18m
S02 — SPLIT A
 ├─ S03A → S04A ┐
 └─ S03B → S04B ┘
                 ↓
                S05
                 ↓
                S06 — SPLIT B
                 ├─ S07A → S08A ┐
                 └─ S07B → S08B ┘
                                 ↓
                                S09
                                 ↓
                                S10 — SPLIT C
                                 ├─ S11A ┐
                                 └─ S11B ┘
                                         ↓
                                        S12
                                         ↓
                                        S13
                                         ↓
                                        END
```

Reconvergences:
- Split A reconverges at `S05`.
- Split B begins only after that reconvergence and reconverges at `S09`.
- Split C begins only after the second reconvergence and reconverges at `S12`.
- No branch creates a new structural Scheduled split while its parent split is unresolved.

### Structural divergences

1. `ch_v2_identity_world_01_traveling_notebook_s02_what_counts_as_answer`
   - measurable/verifiable answers → `S03A`;
   - lived accounts/consequences → `S03B`.
2. `ch_v2_identity_world_01_traveling_notebook_s06_first_lived_contradiction`
   - compare route/practice against lived travel → `S07A`;
   - compare people/generalizations against lived encounters → `S07B`.
3. `ch_v2_identity_world_01_traveling_notebook_s10_asked_to_write_back`
   - write a verifiable fact as witness → `S11A`;
   - write a contextual lived account → `S11B`.

### Geography / reach

All Lifetime Scheduled chapters:
- have `priority: 100`;
- use `scheduledReach: "unrestricted"`;
- require `isOnLand`;
- do not require the same Location as the seed;
- do not move any NPC or player.

Fictional delivery explicitly uses copies, merchants, messengers, other readers or circulation between travelers. A recurring physical NPC is never teleported. If the player is at sea when a chapter becomes due, `isOnLand` prevents that physical delivery scene until land is reached.

No `cancelIf`, `fallbackEventId`, selector modification or runtime Lifetime guarantee is added.

## 9. Situation → Reaction / text-budget audit

Automated package audit confirms:
- all Normal root body texts: **20–45 words**;
- all Immediate/Scheduled body texts: **12–40 words**;
- all Choice labels: **2–10 words**;
- all Outcome texts: **5–25 words**;
- roots use 3–4 Choices;
- Immediate/Scheduled Events use 3 Choices.

Choice sets are premise-specific: cargo marks, flag sequences, registry correction, article editions, Log Pose proof, auction rules, heraldry, chart annotations, etc. There is no repeated universal `help / wait / get adult / leave` skeleton.

## 10. Existing runtime vocabulary used

### Conditions

- `careerPhaseIs`
- `ageAtLeastMonths`
- `ageAtMostMonths`
- `locationHasTag`
- `locationHasService`
- `isOnLand`
- `hasTrait`
- boolean composition via `all` / `any`

### Effects

- `modifyStat`
- `queueImmediateEvent`
- `scheduleEvent`

### Existing Traits queried

- `suspicious`
- `cautious`
- `curious`
- `superstitious`
- `honest`

No Trait is added or removed.

### Location tags/services

Tags:
- `port`
- `coastal` only in conceptual review; final root eligibility uses `port` where docking is materially required
- `marine_presence`
- `government`
- `royal`
- `capital`

Services:
- `food`
- `trade`
- `general_goods`

No exact Location ID or Blue is referenced.

## 11. Canon / timeline audit

- Childhood remains before / around the beginning of Luffy's voyage according to the project timeline.
- No named canon character appears.
- No canon outcome is changed.
- Marines, pirates, bounties, newspapers, revolutionary ideas, Government paperwork, royalty/class rules, Log Pose concepts and maritime occupations appear as generic world institutions/objects.
- The real Log Pose in the scam scene is shown by a passing navigator; the player neither acquires it nor receives a new Item.
- Revolutionary material is gated by `marine_presence`: the scene is about clandestine political speech under visible authority, not about a Revolutionary family origin.

## 12. Collision / dedup audit

Reserved territory preserved:
- **RACE:** no Race-dependent premise or `raceIs`.
- **PLACE:** no exact Birth Location / Blue premise or `locationIs`.
- **ORIGIN_CROSS:** no root requires two Origins axes.
- **PEERS:** no friend/rival status is the dramatic engine.
- **COMBAT_RISK:** physical danger is never the primary engine.
- **Family Saga:** no parent-affiliation institution progression, inherited destiny or age-15 family handoff.

Internal dedup:
- harbor signals are authored once in `ch_v2_identity_world_01_harbor_signal_mismatch`; no second signal-flags root exists.
- bounty social judgment (`ch_v2_identity_world_01_bounty_board_judgment`) is distinct from official poster misidentification (`ch_v2_identity_world_01_wanted_poster_misprint`).
- incomplete commercial map (`ch_v2_identity_world_01_incomplete_map_sale`), fake Grand Line compass (`ch_v2_identity_world_01_grand_line_compass_scam`), and erased official chart warning (`ch_v2_identity_world_01_public_chart_warning_erased`) use different dramatic engines.
- contradictory sailor testimony (`ch_v2_identity_world_01_three_storm_versions`) is person-to-person truth testing; conflicting newspapers (`ch_v2_identity_world_01_conflicting_newspapers`) is printed information causing immediate market behavior.
- Traveling Notebook is the only Lifetime and is not duplicated by a newspaper callback chain.

## 13. Validation summary

Package-level validation performed after generation:

- exact Normal roots: **20 / 20**;
- Dice roots: **13 / 20**;
- Immediate mini-arc roots: **11 / 20**;
- mini-arcs depth 2+: **9 / 11**;
- max Immediate depth: **3**;
- primary Lifetime seeds: **1**;
- Lifetime Scheduled distinct: **18**;
- longest Lifetime lived route: **13**;
- Lifetime structural divergences: **3**;
- max expected pre-15 Lifetime descendants from earliest seed: **3**;
- all referenced Immediate/Scheduled Event IDs exist inside the package;
- all Event localization keys resolve inside `fr.fragment.json`;
- all authored Conditions/Effects use existing Schema 14 vocabulary;
- no proposed persistent definition;
- no shared repository file changed.

## 14. Handoff state

This package is ready for central review/integration only.

It intentionally does **not**:
- update `EVENT_CONCEPT_INDEX_V2.md`;
- update `V2_CONCEPT_MIGRATION_LEDGER.md`;
- modify `catalogFactory.ts` or `schema.ts`;
- alter selectors/engine;
- alter global localization dictionaries;
- alter any Family Major Saga;
- commit or merge anything.
