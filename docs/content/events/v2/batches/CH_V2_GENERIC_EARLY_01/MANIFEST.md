# MANIFEST — CH_V2_GENERIC_EARLY_01

## Repository baseline

- Repository: `NathanTheophile/opfg`
- Branch: `dev`
- HEAD used as source of truth: `3aa3b197b027c4508bb628c03d1c1dfd34acc829`
- Content schema observed: `CONTENT_SCHEMA_VERSION = 14`.
- Production mode: autonomous package only. No repository file was modified, committed, merged, or pushed.
- Shared files intentionally untouched: Concept Index V2, migration ledger, `catalogFactory.ts`, `schema.ts`, selector/engine, global localization dictionaries, Family Sagas, other batches.

## Batch identity

- Batch ID: `CH_V2_GENERIC_EARLY_01`
- Reserved prefix: `ch_v2_generic_early_01_`
- Territory: ordinary Childhood, ages ~1–8 / 12–96 ageMonths.
- Root count: **20 Normal roots exactly**.
- New persistent definitions: **none**.
- Persistent definitions reused: `neighborhood_merchant`; existing Trait IDs only as optional `availableIf` gates.
- Family Major membership: **none**.

## Root coverage audit

| Root | Age months | Dice at root | Dice choices | Immediate depth | Notes |
|---|---:|---:|---:|---:|---|
| `ch_v2_generic_early_01_tiny_delivery` | 60–96 | yes | 2 | 3 | Lifetime seed; merchant cast |
| `ch_v2_generic_early_01_borrowed_broom` | 36–72 | yes | 2 | 2 | broad eligibility |
| `ch_v2_generic_early_01_spilled_bucket` | 36–72 | no | 0 | 2 | broad eligibility |
| `ch_v2_generic_early_01_lost_button` | 24–60 | yes | 2 | 2 | broad eligibility |
| `ch_v2_generic_early_01_barking_dog` | 24–60 | yes | 2 | 1 | broad eligibility |
| `ch_v2_generic_early_01_high_branch` | 48–84 | yes | 2 | 2 | broad eligibility |
| `ch_v2_generic_early_01_runaway_scarf` | 24–60 | yes | 2 | 2 | broad eligibility |
| `ch_v2_generic_early_01_forbidden_bell` | 12–36 | no | 0 | 1 | broad eligibility |
| `ch_v2_generic_early_01_wrong_cup` | 12–36 | no | 0 | 0 | broad eligibility |
| `ch_v2_generic_early_01_flour_footprints` | 36–72 | yes | 2 | 2 | broad eligibility |
| `ch_v2_generic_early_01_rolling_berry` | 48–84 | yes | 2 | 0 | broad eligibility |
| `ch_v2_generic_early_01_slipping_knot` | 48–84 | yes | 2 | 1 | broad eligibility |
| `ch_v2_generic_early_01_den_den_ringing` | 24–60 | yes | 2 | 1 | broad eligibility |
| `ch_v2_generic_early_01_rattling_tin` | 12–36 | no | 0 | 0 | broad eligibility |
| `ch_v2_generic_early_01_spoon_gap` | 12–30 | no | 0 | 0 | broad eligibility |
| `ch_v2_generic_early_01_wobbling_blankets` | 12–36 | no | 0 | 0 | broad eligibility |
| `ch_v2_generic_early_01_shoe_mixup` | 60–96 | yes | 2 | 0 | broad eligibility |
| `ch_v2_generic_early_01_stubborn_lid` | 36–72 | yes | 2 | 0 | broad eligibility |
| `ch_v2_generic_early_01_puddle_bridge` | 24–60 | no | 0 | 1 | broad eligibility |
| `ch_v2_generic_early_01_unclaimed_hat` | 36–72 | no | 0 | 0 | broad eligibility |

### Eligibility safety

All 20 roots are gated only by `careerPhaseIs(childhood)` plus an age window. No root requires Race, Birth Location, inherited affiliation, social class, Item, Trait, or prior History. Trait-gated Choices are optional bonuses inside otherwise resolvable Events. This keeps the batch suitable as the ordinary early-Childhood safety net.

Approximate French root body word counts range from **30** to **35** words. All roots use 3–5 Choices and retain at least one unconditional Choice.

### Safety-net slot coverage

At the annual Generic Early target slots, eligible root counts are:

| ageMonths | Eligible roots |
|---:|---:|
| 12 | 5 |
| 24 | 10 |
| 36 | 14 |
| 48 | 13 |
| 60 | 15 |
| 72 | 10 |
| 84 | 5 |
| 96 | 2 |

No target slot in 12–96 has zero eligible roots. The upper edge deliberately narrows because this batch hands breadth to later-Childhood batches after age 8.

## Immediate mini-arc audit

- Mini-arc roots: **12 / 20 = 60%**.
- Required minimum: 10 / 20.
- Roots with reachable depth 2+: **7 / 12 = 58.3%**.
- Required floor: 40% of counted mini-arcs.
- Maximum reachable Immediate depth: **3** (`ch_v2_generic_early_01_tiny_delivery`).
- Immediate descendants total: **20**.

| Root | Max reachable consecutive Immediate depth |
|---|---:|
| `ch_v2_generic_early_01_tiny_delivery` | 3 |
| `ch_v2_generic_early_01_borrowed_broom` | 2 |
| `ch_v2_generic_early_01_spilled_bucket` | 2 |
| `ch_v2_generic_early_01_lost_button` | 2 |
| `ch_v2_generic_early_01_barking_dog` | 1 |
| `ch_v2_generic_early_01_high_branch` | 2 |
| `ch_v2_generic_early_01_runaway_scarf` | 2 |
| `ch_v2_generic_early_01_forbidden_bell` | 1 |
| `ch_v2_generic_early_01_flour_footprints` | 2 |
| `ch_v2_generic_early_01_slipping_knot` | 1 |
| `ch_v2_generic_early_01_den_den_ringing` | 1 |
| `ch_v2_generic_early_01_puddle_bridge` | 1 |

Every counted Immediate changes the current situation, introduces a new decision, adds information, or resolves the same scene. No continuation-only panel is used.

## Dice audit

- Dice roots: **12 / 20 = 60%**, inside the mandatory 55–65% band.
- Every Dice root contains **2 different Dice Choices** at the root.
- There are no one-Dice-choice root exceptions to justify.
- Root Dice Choices use `agility`, `observation`, `intelligence`, `morale`, `luck`, `charisma`, and `strength` across distinct tactics.
- Thresholds use the current difficulty grid. Root Dice distribution: **Easy 8 = 11 Choices**, **Standard 11 = 13 Choices**, **Difficult 14 = 0**, **Very difficult 17 = 0**. Early-childhood uncertainty is intentionally concentrated on Easy/Standard checks.

| Dice root | Root Dice approaches |
|---|---|
| `ch_v2_generic_early_01_tiny_delivery` | `intelligence` @ 11, `observation` @ 11 |
| `ch_v2_generic_early_01_borrowed_broom` | `agility` @ 11, `observation` @ 8 |
| `ch_v2_generic_early_01_lost_button` | `observation` @ 8, `luck` @ 11 |
| `ch_v2_generic_early_01_barking_dog` | `morale` @ 8, `observation` @ 8 |
| `ch_v2_generic_early_01_high_branch` | `agility` @ 11, `intelligence` @ 11 |
| `ch_v2_generic_early_01_runaway_scarf` | `agility` @ 8, `observation` @ 11 |
| `ch_v2_generic_early_01_flour_footprints` | `agility` @ 11, `observation` @ 8 |
| `ch_v2_generic_early_01_rolling_berry` | `agility` @ 11, `observation` @ 8 |
| `ch_v2_generic_early_01_slipping_knot` | `agility` @ 11, `intelligence` @ 8 |
| `ch_v2_generic_early_01_den_den_ringing` | `charisma` @ 11, `observation` @ 8 |
| `ch_v2_generic_early_01_shoe_mixup` | `observation` @ 8, `intelligence` @ 11 |
| `ch_v2_generic_early_01_stubborn_lid` | `strength` @ 11, `intelligence` @ 8 |

### Dice consequence profile

All root Dice resolutions follow the V2 progression profile:

- `criticalFailure`: -1 on the rolled Stat;
- `failure`: 0 Stat progression;
- `success`: +2 on the rolled Stat;
- `criticalSuccess`: +2 on the rolled Stat in this batch.

Failure is never authored as “nothing happens”: failure prose loses time, position, certainty, cleanliness, trust, or creates a worse immediate state. The Lifetime seed additionally changes `neighborhood_merchant` relationship according to the result.

## Reward / malus audit

- Deterministic Stat effects stay within **-1 / 0 / +1**.
- No Stat malus below -1 exists anywhere in the package.
- No ordinary deterministic Stat reward above +1 exists.
- Dice success/critical success never exceeds +2 in this package.
- Trait grants: **none**.
- Therefore no unconditional deterministic Choice can grant a Trait.
- Existing Traits are only used as meaningful optional `availableIf` solutions: `resourceful`, `patient`, `cautious`, `honest`, `curious`.

Concrete deterministic calibration examples:

- positive +1: `borrowed_broom_i02_adult_returns / admit` grants Observation +1 after showing what was attempted;
- neutral 0: `wrong_cup / point_first` resolves through fiction only;
- negative -1: `spilled_bucket / walk_away` costs Morale -1 after abandoning a problem the child caused.

## Primary Lifetime audit — “La confiance du marchand”

- Seed root: `ch_v2_generic_early_01_tiny_delivery`.
- `lifetimeThreadSeed: true`: yes, on this root only.
- Durable anchor: the personal trust of `neighborhood_merchant` after the child’s first small delivery.
- Scope guard: the thread is explicitly **not** an apprenticeship, trade progression, merchant career, or Family Saga. Errands disappear as the main subject once the relationship is established.
- Distinct Scheduled EventDefinitions: **20**.
- Longest complete lived route after seed: **14 Scheduled chapters**.
- Structural divergences: **3**.
- Nested unresolved Scheduled divergence: **none**.
- Normal next-chapter policy: one next Lifetime Scheduled Event per resolved Choice; termination Choices schedule none.
- Maximum Scheduled descendants before age 15 on the earliest normal seed route: **4**.
- Childhood → Active continuation: intentional.
- Later-life continuity: intentional, with multi-year gaps and no dependency on a fixed career.

### Lifetime topology

```text
Seed / tiny_delivery
  -> LT01 first_return
  -> LT02 key_for_minute
      ├─ keep/return key -> LT03A word_kept -> LT04A trusted_corner ─┐
      └─ open once       -> LT03B bent_word -> LT04B awkward_retry ─┘
                                                                  -> LT05 note_catches_up
                                                                  -> LT06 distant_request
      ├─ trust mark  -> LT07A trust_the_mark -> LT08A favor_arrives ─┐
      └─ verify mark -> LT07B verify_the_mark -> LT08B proof_arrives ─┘
                                                                  -> LT09 weathered_letter
                                                                  -> LT10 address_choice
      ├─ keep writing -> LT11A keep_writing -> LT12A familiar_hand ─┐
      └─ fewer words  -> LT11B fewer_words  -> LT12B spare_postcard ─┘
                                                                  -> LT13 shutter_closed
                                                                  -> LT14 ledger_line
```

Each split persists for two branch-specific Scheduled chapters, then reconverges before another structural split is allowed. No branch opens another Scheduled split before reconvergence.

### Lifetime timing / slot protection

Earliest seed eligibility is 60 ageMonths. Delays on the earliest full route are:

- LT01 +12 → 72;
- LT02 +18 → 90;
- LT03 +24 → 114;
- LT04 +24 → 138;
- LT05 +48 → 186.

Thus at most four Lifetime Scheduled descendants can resolve before 180 months / age 15 even on the earliest start. Later chapters use gaps of 18–48 months and are deliberately biographical rather than quest-log paced.

### Lifetime geography audit

`neighborhood_merchant` is physically cast only in the seed and early Childhood chapters where the player is still local. From LT05 onward, the thread uses notes, travelers, intermediaries and second-hand news. Those remote chapters use `scheduledReach: unrestricted` and do **not** cast the merchant as physically present. The merchant never teleports to the player’s current Location.

### Early termination branches

- Seed: declining future personal trust ends the thread before LT01.
- LT06: refusing all intermediaries ends the thread.
- LT10: asking to end the letters ends the thread.

## Condition-rich audit

Conditioned Choices never create root eligibility starvation. Existing state provides a materially different method:

- `resourceful`: brace the oversized broom; retrieve the button with improvised wax/string; solve the floorboard spoon; rig local objects.
- `patient`: wait for changing light during the button search.
- `cautious`: time the dog’s leash / stabilize the last puddle support.
- `honest`: announce the flour mistake immediately; safely keep a found hat.
- `curious`: study the Den Den Mushi instead of treating it as a generic phone prompt.

No Race/Birth Location-specific conditioned Choice is used, preserving those concepts for their dedicated batches.

## Recurring NPC / relationship audit

- `neighborhood_merchant` is the only persistent NPC cast in the batch.
- The root `ch_v2_generic_early_01_tiny_delivery` serves as the relationship’s concrete introduction for this batch; the player is not assumed to have prior emotional familiarity.
- No `childhood_friend` or `childhood_rival` familiarity is assumed.
- Throwaway adults, neighbors, owners and passers-by remain prose-only.

## Collision / dedup audit

Coordination exclusions obeyed:

- no `ditch_jump` root;
- no `storm_shutters` root;
- no `broken_pane` root;
- no `paper_boat_race` root;
- no `after_the_fall` root;
- no `chain_of_favors` root;
- no `puppet_case` root;
- no `quiet_counter` root;
- no `closing_bell` root;
- no `missing_token` root.

Protected territories avoided:

- Family affiliation / inheritance / parent-career destiny: absent;
- peer status / friend-rival relationship as dramatic engine: absent;
- serious bodily danger or combat: absent;
- world institutions / wider-world discovery as dramatic engine: absent;
- Race-required premise: absent;
- Birth Location-required premise: absent;
- Origin Cross premise: absent.

The Den Den Mushi scene uses a normal household/world prop as a small communication mishap; it does not explain institutions, reveal the wider world, or depend on canon characters.

## Choice / prose quality audit

- Every root is Situation → Reaction: actor/object, immediate action, and concrete stake appear before Choices.
- Every root has at least two scene-specific Choices that fail the transplant test.
- No universal `help / wait / get an adult / leave` quartet is reused as a template.
- Ages 1–3 use pointing, pushing, grasping, listening, handing over, refusing, or simple imitation.
- Ages 4–8 may run, hide a mistake, search, improvise locally, remember landmarks, or handle small responsibilities.
- No root requires implausible young-child authority, long-distance travel, combat competence, or adult social analysis.

## Localization

- `localization/fr.fragment.json` contains every localization key referenced by this package.
- English fragment is not included in this package; the deliverable contract made it optional (`en.fragment.json si réalisé`). Global EN integration therefore requires a later translation/merge pass before full repository localization validation.
- Global localization dictionaries were not modified.

## Files / integration notes

- Event JSON files: **60** total = 20 roots + 20 Immediate + 20 Scheduled Lifetime chapters.
- All Event IDs use `ch_v2_generic_early_01_`.
- All `queueImmediateEvent` and `scheduleEvent` targets resolve to an EventDefinition inside this package.
- No Event uses `majorTrack`.
- No new Item/NPC/Trait/Flag/system definition is required; `PROPOSED_DEFINITIONS.md` is intentionally absent.
- Package-level structural validation was run locally against generated JSON: counts, internal references, root phase/age gates, localization-key coverage, Choice resolvability floor, Stat effect limits, Trait-grant prohibition, Lifetime node count, and quota totals.
- Full `npm test` / `validate-content` / build cannot be executed without integrating the package into a checkout; the repository itself was left untouched as required.
