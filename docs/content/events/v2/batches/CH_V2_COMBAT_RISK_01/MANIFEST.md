# CH_V2_COMBAT_RISK_01 — MANIFEST

## Source snapshot

- Repository authority: `NathanTheophile/opfg`
- Branch inspected: `dev`
- HEAD used for authoring: `3aa3b197b027c4508bb628c03d1c1dfd34acc829`
- Content Schema: `14`
- Save generation observed: `21`
- Package is standalone and was generated outside the repository. No commit, merge, branch update, selector/runtime edit, shared localization edit, Concept Index edit, Migration Ledger edit, schema edit, catalog edit, or Family Saga edit was performed.

## Batch scope

- Batch ID: `CH_V2_COMBAT_RISK_01`
- Event prefix: `ch_v2_combat_risk_01_`
- Territory: ordinary Childhood physical danger, escape, rescue, accident, small-scale violence/crime, bodily training and fast risk decisions.
- Primary age territory: 6–14 years. Ages 1–5 are deliberately outside this batch brief and must be covered by other ordinary Childhood batches in the assembled pool.
- Family affiliation destiny, Race-dependent premises, Birthplace-dependent premises, Origin Cross, peer-status competition and career choice are excluded.
- Protected Family Major Sagas treated as unavailable territory: `family_civilian`, `family_marine`, `family_pirate`, `family_revolutionary`, `family_royal`.

## Authority files re-read

At the HEAD above: `AGENTS.md`, `docs/GAME_DESIGN.md`, `docs/design/MAJOR_NARRATIVE_TRACKS.md`, `docs/design/WORLD_TIMELINE_AND_CANON.md`, `docs/content/EVENT_AUTHORING_RULES.md`, `docs/content/CONTENT_BIBLE.md`, `docs/content/TRAITS_CATALOG.md`, `docs/content/events/v2/CHILDHOOD_V2_BATCH_CONTRACT.md`, `docs/content/events/v2/CHILDHOOD_V2_SEED_MINING_CONTRACT.md`, `docs/content/events/v2/EVENT_CONCEPT_INDEX_V2.md`, `docs/content/events/migration/V2_CONCEPT_MIGRATION_LEDGER.md`, `src/game/content/schema.ts`, `src/game/content/catalogFactory.ts`; targeted runtime verification also covered `src/game/engine/events.ts`, `src/game/engine/npcNames.ts`, `src/game/model/schema.ts`, `src/game/model/npcState.ts`, `src/game/validation/validateContent.ts`.

## Root coverage audit

- Root Normal Events: **20 / 20**.
- Every root is `kind: normal`, has explicit `careerPhaseIs(childhood)`, and has no `majorTrack` metadata.
- Restrictive root eligibility: **age only**. No root depends on Location, Race, affiliation, family structure, Item, Trait or prior History, so no special fallback root is required for its eligible age window.
- Choice-level Trait gates are optional leverage only; every root retains unconditional choices.

| Root | Age months | Root Dice choices | Immediate depth | Special |
|---|---:|---:|---:|---|
| `ch_v2_combat_risk_01_ditch_jump` | 72–119 | 2 | 2 | — |
| `ch_v2_combat_risk_01_younger_first_rescue` | 84–119 | 2 | 2 | Lifetime seed |
| `ch_v2_combat_risk_01_panicked_dog` | 72–131 | 2 | 3 | — |
| `ch_v2_combat_risk_01_after_the_fall` | 72–119 | 2 | 1 | — |
| `ch_v2_combat_risk_01_storm_shutter_hinge` | 96–155 | 2 | 2 | — |
| `ch_v2_combat_risk_01_storm_banner_bar` | 108–167 | 2 | 2 | — |
| `ch_v2_combat_risk_01_kitchen_grease_fire` | 120–179 | 2 | 3 | — |
| `ch_v2_combat_risk_01_tool_flash` | 132–179 | 2 | 2 | — |
| `ch_v2_combat_risk_01_cart_raid` | 144–179 | 2 | 2 | — |
| `ch_v2_combat_risk_01_doorway_evacuation` | 120–179 | 0 | 2 | — |
| `ch_v2_combat_risk_01_falling_frame` | 96–155 | 2 | 1 | — |
| `ch_v2_combat_risk_01_runaway_handcart` | 120–179 | 2 | 0 | — |
| `ch_v2_combat_risk_01_breakfall_lesson` | 108–167 | 2 | 0 | — |
| `ch_v2_combat_risk_01_playfight_red_line` | 72–119 | 0 | 0 | — |
| `ch_v2_combat_risk_01_too_many_to_fight` | 144–179 | 0 | 0 | — |
| `ch_v2_combat_risk_01_falling_crate_stack` | 84–143 | 0 | 0 | — |
| `ch_v2_combat_risk_01_storeroom_intrusion` | 132–179 | 0 | 0 | — |
| `ch_v2_combat_risk_01_ladder_slide` | 96–155 | 0 | 0 | — |
| `ch_v2_combat_risk_01_boiling_pot` | 84–143 | 0 | 0 | — |
| `ch_v2_combat_risk_01_frayed_swing_rope` | 72–131 | 0 | 0 | — |

### Age coverage notes

- 72–119 months: early physical agency (`ditch_jump`, `panicked_dog`, `after_the_fall`, `playfight_red_line`).
- 84–143 months: first independent hazard-reading and object-risk scenes, including the Lifetime introduction.
- 96–167 months: structural/weather hazards and controlled training.
- 120–179 months: higher-agency accidents, escape and criminal threat.
- 132–179 months / 144–179 months: late-Childhood violence avoidance, intrusion and cart raid.
- The batch intentionally does not solve global age 1–5 ordinary-content coverage.

## Immediate mini-arc audit

- Mini-arc roots: **11 / 20 = 55%**.
- Roots with reachable depth 2+: **9 / 11 = 81.8%**.
- Roots with reachable depth 3: **2**.
- Maximum reachable Immediate depth: **3**.
- No Immediate is a Continue-only panel; each introduces a changed hazard, new information, a tactical choice, or the final resolution decision.

| Root | Max reachable Immediate depth |
|---|---:|
| `ch_v2_combat_risk_01_ditch_jump` | 2 |
| `ch_v2_combat_risk_01_younger_first_rescue` | 2 |
| `ch_v2_combat_risk_01_panicked_dog` | 3 |
| `ch_v2_combat_risk_01_after_the_fall` | 1 |
| `ch_v2_combat_risk_01_storm_shutter_hinge` | 2 |
| `ch_v2_combat_risk_01_storm_banner_bar` | 2 |
| `ch_v2_combat_risk_01_kitchen_grease_fire` | 3 |
| `ch_v2_combat_risk_01_tool_flash` | 2 |
| `ch_v2_combat_risk_01_cart_raid` | 2 |
| `ch_v2_combat_risk_01_doorway_evacuation` | 2 |
| `ch_v2_combat_risk_01_falling_frame` | 1 |

Depth-3 roots: `ch_v2_combat_risk_01_panicked_dog`, `ch_v2_combat_risk_01_kitchen_grease_fire`.

## Dice audit

- Dice roots: **12 / 20 = 60%** (inside the 55–65% target).
- Total root DiceCheck Choices: **24**.
- Every Dice root contains **2 materially different Dice approaches**; there are **no single-Dice-choice root exceptions**.
- Difficulty distribution across root Dice Choices: Easy 8 = **0**, Standard 11 = **16**, Difficult 14 = **8**, Very difficult 17 = **0**.
- Root Dice IDs:
  - `ch_v2_combat_risk_01_ditch_jump`
  - `ch_v2_combat_risk_01_younger_first_rescue`
  - `ch_v2_combat_risk_01_panicked_dog`
  - `ch_v2_combat_risk_01_after_the_fall`
  - `ch_v2_combat_risk_01_storm_shutter_hinge`
  - `ch_v2_combat_risk_01_storm_banner_bar`
  - `ch_v2_combat_risk_01_kitchen_grease_fire`
  - `ch_v2_combat_risk_01_tool_flash`
  - `ch_v2_combat_risk_01_cart_raid`
  - `ch_v2_combat_risk_01_falling_frame`
  - `ch_v2_combat_risk_01_runaway_handcart`
  - `ch_v2_combat_risk_01_breakfall_lesson`

### Dice outcome profile

Static package audit confirms for every root Dice Choice and its rolled Stat:

- `criticalFailure`: **-1** rolled Stat; severe scenes may also inflict **-1 Health**, never as the universal default.
- `failure`: **0** rolled-Stat progression.
- `success`: **+2** rolled Stat.
- `criticalSuccess`: **+2** rolled Stat.

Failure always changes the fiction adversely: worse position, lost time/cargo, a hazard continuing, an injured person still exposed, a damaged stall, loss of trust, or forced continuation into a harder Immediate state. No root Dice failure is a compensated `+0` success-in-disguise.

### Conditioned interactions

Optional conditioned deterministic approaches use only existing Traits and real fictional leverage:

- `cautious`: tests the ditch bank before committing.
- `patient`: lets `childhood_younger` find a foothold by instruction rather than force.
- `resourceful`: uses available objects in the panicked-dog, storm-shutter, kitchen-fire, cart-raid and falling-frame scenes.

No conditioned Choice exists merely to inflate a reward.

## Reward / malus audit

- Ordinary positive deterministic examples: +1 Observation for marking a safe route; +1 Intelligence for using an environmental tool; +1 Morale for choosing a controlled safe resolution.
- Neutral deterministic examples: abandoning stolen cargo to keep distance from a blade; giving a fleeing bandit a clear exit; stopping a swing by removing its seat.
- Negative deterministic examples: -1 Morale for escalating a playfight, grabbing a hot pot directly, chasing an armed bandit, or switching evacuation routes at the worst moment.
- Player-Stat deterministic malus below -1: **none**.
- Ordinary deterministic player-Stat reward above +1: **none**.
- Health is used selectively on a small subset of severe Dice critical failures and is not the default risk currency.
- Relationship changes in the Lifetime reach +8/+10 only at the multi-decade terminal equalization beat, which is a major personal event rather than ordinary Stat progression.

## Trait audit

- Trait grants: **0**.
- Unconditional deterministic Trait grants: **0**.
- No Trait is removed or replaced.
- Existing Traits are queried only for optional conditioned approaches listed above.

## Lifetime audit — “Le plus jeune n'a pas toujours besoin d'être sauvé”

- Primary qualifying Lifetime count: **exactly 1**.
- Seed root: `ch_v2_combat_risk_01_younger_first_rescue` (`lifetimeThreadSeed: true`).
- Durable anchor: existing persistent NPC `childhood_younger`.
- `childhood_younger` is introduced in the seed as an unrelated younger neighborhood child who states their generated name. The package never defines or implies a sibling relationship and never creates Family Saga state.
- Seed opens a depth-2 Immediate introduction; the **seed itself** schedules S01 vertically after 12 months.
- Distinct reachable Scheduled EventDefinitions: **20**.
- Longest reachable Scheduled depth after the seed: **14**.
- Meaningful structural divergences: **4**.
- Early termination branches: none by authored Choice. The thread cancels naturally if `childhood_younger` is dead before a due chapter (`cancelIf`), avoiding impossible correspondence.
- Normal-path maximum Scheduled descendants before age 15: **4** (earliest seed route).
- Intended seed window: 84–119 months (7y0m–9y11m).
- Ordinary unblocked final chapter window: approximately age **32.0–34.9** (384–419 months), inside the observed 420-month V1 horizon.
- S01–S03 are the only returning physical training meetings and necessarily resolve before age 15 under the authored delays. S04 is already a note and may straddle the Childhood/Active boundary. S05 onward uses letters, messengers, traveler news or other distance-safe communication; the NPC never teleports to the player's current Location.
- Every Scheduled chapter uses priority 100 and normal scheduled reach. No unrestricted delivery bypasses Locations that block Scheduled Events.

### Braided-linear map

```text
Seed
  -> S01 show_me
      ├─ coached/trusted -> S02A -> S03A ┐
      └─ held_back       -> S02B -> S03B ┘
                                      -> S04 note_before_departure
                                      -> S05 risky_errand
                                          ├─ supports judgment -> S06A ┐
                                          └─ forbids again     -> S06B ┘
                                                                -> S07 first_distance
                                                                -> S08 rescue_choice
                                                                    ├─ back judgment  -> S09A -> S10A ┐
                                                                    └─ urge withdraw  -> S09B -> S10B ┘
                                                                                                   -> S11 words_after
                                                                                                   -> S12 warning_returns
                                                                                                       ├─ concrete advice -> S13A ┐
                                                                                                       └─ own judgment    -> S13B ┘
                                                                                                                               -> S14 equal_terms
```

Structural split IDs: `ch_v2_combat_risk_01_younger_lt_s01_show_me`, `ch_v2_combat_risk_01_younger_lt_s05_risky_errand`, `ch_v2_combat_risk_01_younger_lt_s08_rescue_choice`, `ch_v2_combat_risk_01_younger_lt_s12_warning_returns`.

- Each split stays distinct for 1–2 Scheduled chapters, then reconverges.
- No unresolved structural split contains another Scheduled split.
- Every lived Scheduled Choice schedules at most one next Lifetime chapter.
- No chapter queues sibling branches simultaneously.
- No full future graph is scheduled from the seed.

### Lifetime thematic progression

`protection -> learning -> autonomy -> disagreement about risk -> more equal relationship`.

The thread repeatedly asks whether protection means acting for someone, teaching them to judge danger, trusting a retreat, accepting the cost of action, or eventually asking their judgment in return.

## Scheduled consequences outside Lifetime

- Non-Lifetime Scheduled EventDefinitions: **0**.
- This deliberately protects Childhood root slots; same-scene consequences use Immediate continuations.

## Persistent definitions / cast

Existing persistent definitions used:

- NPC: `childhood_younger` only as the Lifetime anchor.
- Trait conditions only: `cautious`, `patient`, `resourceful`.

New persistent definitions proposed: **none**.
No `PROPOSED_DEFINITIONS.md` is included because none is necessary.
No new Items, Flags, NPCs, Traits, Locations, powers or systems are assumed.

## Collision / dedup audit

Coordination locks were applied over the seed pool:

- retained in COMBAT_RISK territory: `ditch_jump`, `after_the_fall`, dangerous `storm_shutters`, dangerous `storm_banner`, loose/panicked dog;
- deliberately not produced: `high_branch`, `puppet_case`, paper-boat competition, contained barking-dog fear;
- no physical rival-status competition or recurring rivalry thread (reserved for PEERS);
- no Race-dependent bodily solution (reserved for RACE);
- no Blue/Birth Location required premise (reserved for PLACE);
- no two-Origin intersection (reserved for ORIGIN_CROSS);
- no inherited affiliation destiny, parental progression or age-15 career choice (protected Family Saga territory);
- `cart_raid` stays small-scale local crime and does not assign pirate/bandit identity to the player or family;
- `tool_flash` is an imminent weapon-risk scene between older apprentices, not a peer-status rivalry;
- `breakfall_lesson` is technique/safety training without competitive ranking.

## Localization

- `localization/fr.fragment.json`: complete French fragment for every key in this package.
- `localization/en.fragment.json`: complete English fragment for every key in this package.
- No global localization dictionary was modified.
- **FR grammar pass (2026-08-14):** removed slash-gender forms and inclusive middle-dot inflections; `childhood_younger` copy now uses neutral rewrites and the locale-local `npc_childhood_younger_sex` selector only where a French agreement cannot be avoided naturally.
- FR grammar validation: 0 `il/elle`, 0 `Il/elle`, 0 `le/la`, 0 `Le/la`, 0 `lui/elle`, and 0 middle-dot inclusive inflections.
- Ordinary named interpolation placeholder sets remain identical between FR and EN for every localization key; locale-local `select:` grammar is allowed to exist only in FR.
- English fragment preserved at 568 keys with no value changes during this grammar pass.

## Static validation performed on the standalone package

The generation audit verifies:

- exact event-kind counts: 20 Normal / 22 Immediate / 20 Scheduled;
- unique IDs and required prefix;
- all `queueImmediateEvent` and `scheduleEvent` targets exist and have the correct Event kind;
- exactly one `lifetimeThreadSeed`;
- no Major Track metadata;
- root Childhood phase gating;
- 12 root Dice Events and 24 root Dice Choices;
- exact V2 rolled-Stat Dice delta profile (-1 / 0 / +2 / +2);
- deterministic player Stat deltas constrained to -1 / 0 / +1;
- no Trait grants and no new persistent-definition effects;
- 11 mini-arc roots, 9 depth-2+, two depth-3, no Immediate cycles;
- 20 reachable Lifetime Scheduled definitions, depth 14, four structural splits, no Scheduled cycles;
- maximum four pre-15 Lifetime Scheduled descendants on the earliest normal route;
- latest ordinary unblocked Lifetime completion <= 420 months;
- FR/EN localization-key completeness.

Editorial approximate word-count audit outliers (using whitespace tokenization only): roots `{}`, Immediate `{}`, Scheduled `{}`. These are diagnostic only; punctuation/interpolation makes this count approximate.

## Integration note

This package intentionally does **not** edit or append `EVENT_CONCEPT_INDEX_V2.md` or `V2_CONCEPT_MIGRATION_LEDGER.md`. Concept acceptance/migration bookkeeping remains a separate central integration step.
