# MANIFEST — CH_V2_RACE_HUMAN_01

## Repository baseline

- Repository authority: `NathanTheophile/opfg`
- Branch inspected: `dev`
- Exact HEAD used: `4029a2ef4a4e74656c3d559b845496eed862b02d`
- Content Schema: **14**
- Save version: **21**
- Current-HEAD recheck: the move from `1a634a47d20dc3877536af07be85387238f4882d` to this HEAD is the debug-panel commit `feat(debug): addad debug panel`; its commit diff contains no `src/game/content` or `docs/content` path. Content Schema and Save were re-read directly at the new HEAD and remain 14 / 21.
- Production mode: standalone package only.
- Repository mutation: **none**.
- No commit, branch, PR, Concept Index update, Migration Ledger update, runtime edit, schema edit, catalog edit or global localization edit.

Authorities reread from the verified HEAD include `AGENTS.md`, `docs/GAME_DESIGN.md`,
`docs/design/MAJOR_NARRATIVE_TRACKS.md`, `docs/design/WORLD_TIMELINE_AND_CANON.md`,
`docs/content/EVENT_AUTHORING_RULES.md`, `docs/content/CONTENT_BIBLE.md`,
`docs/content/TRAITS_CATALOG.md`, both Childhood V2 contracts, the current V2 Concept Index,
the V2 Migration Ledger, `src/game/content/schema.ts`, `src/game/content/catalogFactory.ts`,
and the relevant Event selection / scheduling / Effects / validation runtime.

The five integrated Wave 1 manifests were also reread:
`CH_V2_GENERIC_EARLY_01`, `CH_V2_GENERIC_LATE_01`, `CH_V2_PEERS_01`,
`CH_V2_IDENTITY_WORLD_01`, `CH_V2_COMBAT_RISK_01`.

## Batch identity

- Batch ID: `CH_V2_RACE_HUMAN_01`
- Reserved prefix: `ch_v2_race_human_01_`
- Domain: ordinary Childhood V2 — Human lived Race content.
- Coordination override: **exactly 10 Normal roots**, not the default 16 specialized roots.
- Root ownership: Human as implicit reference body; Human-scale “standard” measurements/interfaces;
  responsibility when personal fit is mistaken for a universal norm; ordinary Human physical limits
  answered through technique, leverage, tools and coordination.
- Major Narrative Track membership: **none**.
- New persistent definitions: **none**.

## Package inventory

- EventDefinition JSON files: **42**
  - Normal roots: **10**
  - Immediate descendants: **12**
  - Scheduled Lifetime descendants: **20**
- French localization keys: **356**
- Localization source/fallback included: `localization/fr.fragment.json`
- New NPCDefinitions: **0**
- New Items: **0**
- New Traits: **0**
- New Flags: **0**
- New Locations: **0**
- New Conditions: **0**
- New Effects: **0**
- New runtime systems: **0**
- Extra Scheduled callbacks outside the primary Lifetime: **0**

## Root registry

| Seed | Root ID | Age months | Root Dice choices | Root Dice approaches | Immediate depth | Lifetime |
|---|---|---:|---:|---|---:|---|
| SEED-01 — Le patron standard | `ch_v2_race_human_01_standard_pattern` | 84–143 | 0 | — | 0 | — |
| SEED-02 — Le banc étalon | `ch_v2_race_human_01_benchmark_bench` | 60–119 | 0 | — | 0 | — |
| SEED-03 — Trois mains de corde | `ch_v2_race_human_01_three_handspans` | 96–143 | 2 | Observation @11; Intelligence @11 | 2 | **primary seed** |
| SEED-04 — Le costume qui t’attend déjà | `ch_v2_race_human_01_ready_costume` | 84–143 | 0 | — | 0 | — |
| SEED-05 — La manivelle à hauteur humaine | `ch_v2_race_human_01_human_height_crank` | 108–179 | 2 | Agility @11; Observation @11 | **3** | — |
| SEED-06 — Les pas déjà peints | `ch_v2_race_human_01_painted_steps` | 72–131 | 0 | — | 1 | — |
| SEED-08 — Le harnais « taille enfant » | `ch_v2_race_human_01_child_size_harness` | 108–179 | 2 | Observation @11; Intelligence @11 | 2 | — |
| SEED-09 — Les outils qui tombent sous la main | `ch_v2_race_human_01_standard_toolbox` | 120–179 | 2 | Intelligence @11; Charisma @11 | 2 | — |
| SEED-11 — Trop lourd à bras nus | `ch_v2_race_human_01_too_heavy_by_hand` | 120–179 | 2 | Observation @11; Intelligence @11 | 0 | — |
| SEED-14 — La notice aux deux mains | `ch_v2_race_human_01_two_hand_instructions` | 96–155 | 2 | Observation @11; Intelligence @11 | 2 | — |

All ten root body texts are 29–30 words.

## Root eligibility audit

Every root is:

- `kind: normal`;
- explicitly gated by `careerPhaseIs(childhood)`;
- explicitly gated by `raceIs(human)`;
- explicitly bounded by `ageAtLeastMonths` + `ageAtMostMonths`;
- outside `majorTrack`;
- free of Location, sea, affiliation, social class, family structure, Item, NPC relationship or prior-History requirements.

Therefore the only restrictive thematic gate beyond age/phase is the intended Race gate itself.
No root turns Human × another Origin axis into its premise.

### Age coverage

Authored Human territory begins at **60 months / age 5** and extends through **179 months / the end of Childhood**.
This specialized batch deliberately does not attempt to cover ages 1–4 by itself; Wave 1 ordinary content and the Family Major spine already protect general Childhood coverage.

| ageMonths checkpoint | Eligible Human roots |
|---:|---:|
| 60 | 1 |
| 72 | 2 |
| 84 | 4 |
| 96 | 6 |
| 108 | 8 |
| 120 | 9 |
| 132 | 8 |
| 144 | 5 |
| 156 | 4 |
| 168 | 4 |
| 179 | 4 |

## Dice audit

Coordination requirement: **exactly 6 / 10 Dice roots**.

Implemented Dice roots:

1. `three_handspans` — Observation @11 vs Intelligence @11.
2. `human_height_crank` — Agility @11 vs Observation @11.
3. `child_size_harness` — Observation @11 vs Intelligence @11.
4. `standard_toolbox` — Intelligence @11 vs Charisma @11.
5. `too_heavy_by_hand` — Observation @11 vs Intelligence @11.
6. `two_hand_instructions` — Observation @11 vs Intelligence @11.

The remaining four roots contain **no DiceCheck at root**.

Every Dice root offers two materially different uncertain approaches rather than “roll / do nothing”.

Root Dice outcome progression is uniform:

- `criticalFailure`: **-1** on the rolled Stat plus a concrete fictional setback;
- `failure`: **0** progression on the rolled Stat plus a real loss/aggravation in fiction;
- `success`: **+2** on the rolled Stat;
- `criticalSuccess`: **+2** on the rolled Stat.

No root uses a +3 criticalSuccess.
No Dice failure grants compensating positive Stat progression.

## Immediate mini-arc audit

Coordination requirement: **exactly 6 / 10 mini-arc roots**.

| Root | Max consecutive Immediate depth |
|---|---:|
| `three_handspans` | 2 |
| `human_height_crank` | **3** |
| `painted_steps` | 1 |
| `child_size_harness` | 2 |
| `standard_toolbox` | 2 |
| `two_hand_instructions` | 2 |

- Mini-arc roots: **6 / 10 = 60%**.
- Depth 2+ roots: **5 / 6**.
- Depth 3 roots: **1**.
- Required depth-3 root: `human_height_crank`.
- Immediate EventDefinitions: **12**.
- No other root queues an Immediate Event.
- No Immediate is a Continue-only panel; each changes information, access, configuration, actor agency, tactic or resolution.

### Depth-3 route

```text
human_height_crank
→ human_height_crank_i01_second_handle
→ human_height_crank_i02_low_pedal
→ human_height_crank_i03_final_alignment
```

The scene evolves from a Human-height control surface, to a second inaccessible handle, to a pedal dependency,
then to a final decision about what gets recorded as the validated setup.

## Reward / malus audit

Deterministic player-Stat effects in the package stay inside **-1 / 0 / +1**.

Representative costs:

- approving a Human-only garment pattern: Observation -1;
- keeping a Human-biased bench validation: Observation -1;
- taking the ready costume over the rehearsed performer: Charisma -1;
- retaining the old painted-step score: Observation -1;
- taking the “standard” toolbox role as permanent catch-all: Morale -1;
- following a Human-hand instruction without addressing the mismatch: Observation -1.

Representative ordinary positive outcomes use +1 only and arise from concrete observation,
technical adaptation, communication or preparation.

There are:

- no Item rewards;
- no Berrys rewards;
- no Health manipulation;
- no Reputation/Bounty manipulation;
- no NPC Relationship effects;
- no equipment grants;
- no permanent system Flags.

## Trait / Condition audit

Trait grants: **0**.

Existing Traits are used only as meaningful optional `availableIf` leverage:

- `resourceful`: adjustable pattern, physical gauge, adapted handles, leverage/tooling, movable assembly support;
- `cautious`: multi-position bench test, early machine stop, suspension of harness use before validation;
- `generous`: surrender useful costume attachments to preserve the rehearsed performer’s place;
- `honest`: admit that painted Human footsteps materially helped the player's score.

Every Event retains at least one unconditional resolvable Choice.
No unavailable Choice is required to complete an Event.
No new Trait ID is referenced.

## Human ownership / other-body agency audit

The ten roots remain Human-specific through one of two engines:

1. **default-body infrastructure** — Human pattern, bench test, handspan, costume, control height,
   painted steps, harness, toolbox, illustrated hand placement;
2. **ordinary Human physical limit answered by method** — the heavy block root.

Where another body exposes a bad Human standard, that person acts and has an immediate stake.
Most comparison actors are deliberately left Race-unspecified so the scene does not require an implausible
specific Race presence in every Birth Location. The mixed-toolbox root is the exception: Daro (Giant) and
Sumi (Mink) are explicit because the authorized seed specifically concerns role assignment around conspicuous
physical differences, and both characters actively contest those assignments.

- garment customer demands correction before more cloth is cut;
- bench tester asks for equal comfort;
- rope helper refuses to have her correct rope trimmed merely to match the Human shortcut;
- rehearsed performer refuses replacement by whoever fits the spare costume;
- painted-step participant stops the biased test;
- harness participant refuses exclusion and identifies the painful strap point;
- Daro and Sumi challenge the roles assigned to them and continue making decisions inside the mini-arc;
- assembly apprentice rejects the misleading diagram and participates in its correction.

No Event uses Mink fur, Fish-Man aquatic superiority, Giant doorway access, peer rivalry/status competition,
or generic apprenticeship as its central engine.

## Primary Lifetime Thread — “La mesure commune”

- Seed root: `ch_v2_race_human_01_three_handspans`.
- `lifetimeThreadSeed: true`: **exactly one root**.
- Durable anchor: the player's evolving personal practice of distinguishing
  “this works on my Human body” from “this method can actually be reproduced by different users”.
- No persistent NPC anchor.
- No persistent Item.
- No Flag or custom progression state.
- No crafting/career system.
- No Major Saga semantics.
- Distinct reachable Scheduled EventDefinitions: **20**.
- Longest complete lived route: **14 Scheduled chapters**.
- Complete route variants: **8**.
- Structural divergences: **3**.
- Nested unresolved structural splits: **0**.
- Normal next-Lifetime-event count per resolved Choice: **1**.
- Maximum Lifetime Scheduled descendants before age 15: **3**.
- Earliest seed age: 96 months.
- Latest seed age: 143 months.
- Earliest terminal age: 366 months / 30.5 years.
- Latest theoretical terminal age from the authored seed window: 413 months / ~34.4 years.
- Childhood → Active continuation: intentional.
- Content in the player's twenties: intentional and guaranteed on every complete route.

### Braided-linear topology

```text
Seed / three_handspans
  → LT01 old_sample_returns
  → LT02 first_standard_choice
      ├─ fixed gauge
      │   → LT03A fixed_gauge
      │   → LT04A gauge_shared
      │
      └─ handspan shortcut
          → LT03B handspan_rule
          → LT04B length_error_returns
                    ↓
                 LT05 method_catches_up
                    ↓
                 LT06 adjustable_question
      ├─ one central mark
      │   → LT07A single_mark
      │   → LT08A edge_case_returns
      │
      └─ range of marks
          → LT07B range_marks
          → LT08B range_spreads
                    ↓
                 LT09 revised_method
                    ↓
                 LT10 old_diagram
      ├─ keep Human example
      │   → LT11A keep_human_reference
      │   → LT12A reference_retested
      │
      └─ remove reference body
          → LT11B remove_reference_body
          → LT12B method_relearned
                    ↓
                 LT13 common_measure
                    ↓
                 LT14 measure_without_you
                    ↓
                  END
```

Every structural split remains distinct for exactly two Scheduled chapters, then reconverges before the next split.
No branch opens a structural split while another split remains unresolved.

### Lifetime timing / Childhood slot protection

Earliest seed timing:

```text
Seed age 96
LT01 +18 → 114
LT02 +24 → 138
LT03 +30 → 168
LT04 +18 → 186
```

Therefore only LT01–LT03 can resolve before 180 months on the earliest route: **3 pre-15 descendants maximum**.
All later transitions use 18-month spacing, continuing the practice through Active and into the twenties/thirties.

## Scheduled geography audit

No local recurring character is used in the Lifetime.

- LT01–LT03 can still resolve in the stable Childhood context with normal Scheduled reach.
- From LT04 onward, continuity is expressed through copied gauges, cords, diagrams, letters, notes,
  travelers, transmitted procedures and methods encountered in the player's current context.
- Those portable/distance-safe chapters use `scheduledReach: unrestricted`.
- No prose claims that a local artisan, instructor or childhood acquaintance physically follows the player.
- `neighborhood_merchant` is not used anywhere in the package.

There are **no Scheduled Events outside the Lifetime**.

## Wave 1 collision audit

### Generic Early

Avoided as central premises:

- small delivery / merchant trust;
- borrowed broom;
- lost button;
- high branch;
- household Den Den Mushi;
- small-object retrieval and ordinary improvised chores.

The Human batch may use small tools, but only where their Human-default interface is the causal problem.
The Wave 1 `neighborhood_merchant` Lifetime is not reused.

### Generic Late

Avoided:

- generic apprenticeship trial;
- entrusted money/keys/stock;
- ordinary repair-after-fault;
- tally/accounting;
- market/queue/counter duties;
- generic responsibility-through-work.

Workshops in this package are staging spaces only.
Removing the Human-standard mismatch would remove the root premise rather than leave a Generic craft Event behind.

### Peers

Avoided:

- friend/rival introductions;
- competition;
- humiliation/initiation;
- popularity/status;
- social ranking;
- peer-secret repair;
- game-rule disputes as the dramatic engine.

Other children may contest a Human-biased standard, but winning against them is never the objective.

### Identity / World

Avoided:

- posters, institutions, political ideology, news, maps, foreign-sailor discovery,
  official stamps and wider-world exposition.
- The package never teaches an abstract theory of Human majority/default status.
  Every Race point is expressed through an object, measurement, interface or concrete action.

### Combat / Risk

Avoided:

- accidents, rescues, fire, runaway objects, bodily danger or physical threat as the main engine.
- `too_heavy_by_hand` is controlled practice, not an emergency.
- `child_size_harness` uses a low-risk weight test before the exercise; no accident is required to prove the bad fit.

## Localization / prose audit

- Source narrative/fallback language: **French**.
- All player-facing strings used by this standalone package exist in `localization/fr.fragment.json`.
- Root bodies: **29–30 words**.
- Immediate/Scheduled bodies: within the ordinary **12–40 word** target.
- Choice labels: **≤10 words**.
- Outcome texts: **≤25 words**.
- No player-facing hardcoded text exists inside EventDefinition JSON; JSON references localization keys only.

## Static package validation

The standalone package was statically audited after generation:

- unique Event IDs: PASS;
- prefix compliance: PASS;
- JSON parse: PASS;
- localization references complete: PASS;
- Event kind counts: PASS (`10 / 12 / 20`);
- exactly six root Dice IDs: PASS;
- Dice progression profile: PASS;
- exactly six Immediate-root IDs: PASS;
- Immediate depth computation: PASS;
- all `queueImmediateEvent` targets exist and are Immediate: PASS;
- all `scheduleEvent` targets exist and are Scheduled: PASS;
- no Scheduled sibling branches queued simultaneously from one Outcome: PASS;
- Lifetime reachability: PASS (20/20 Scheduled reachable);
- longest Scheduled route: PASS (14);
- structural divergence count: PASS (3);
- maximum pre-15 Lifetime descendants: PASS (3);
- all root eligibility gates: PASS;
- every Event has an unconditional Choice: PASS;
- referenced Trait IDs belong to the current 28-Trait catalog: PASS;
- Trait grants: PASS (0);
- deterministic Stat deltas remain in -1..+1: PASS;
- root text budget: PASS.

`npm test` / `npm run build` were not run against an integrated repository because this deliverable is intentionally standalone and the task forbids repository integration. No source repository was modified for validation.
