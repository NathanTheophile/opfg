# MANIFEST — CH_V2_RACE_FISHMAN_01

## Repository baseline

- Repository: `NathanTheophile/opfg`
- Branch reread: `dev`
- **HEAD exact verified:** `1a634a47d20dc3877536af07be85387238f4882d`
- **Content Schema:** `14`
- **Save version:** `21`
- Production mode: standalone authoring package only.
- Repository mutation: **none**.
- Commit / branch / PR / Concept Index / Migration Ledger mutation: **none**.

The package was authored against the current `schema.ts`, `catalogFactory.ts`, `save.ts`, current validation/runtime vocabulary, and the current V2 Childhood authorities.

## Authorities reread

- `AGENTS.md`
- `docs/GAME_DESIGN.md`
- `docs/design/MAJOR_NARRATIVE_TRACKS.md`
- `docs/design/WORLD_TIMELINE_AND_CANON.md`
- `docs/content/EVENT_AUTHORING_RULES.md`
- `docs/content/CONTENT_BIBLE.md`
- `docs/content/TRAITS_CATALOG.md`
- `docs/content/events/v2/CHILDHOOD_V2_BATCH_CONTRACT.md`
- `docs/content/events/v2/CHILDHOOD_V2_SEED_MINING_CONTRACT.md`
- `docs/content/events/v2/EVENT_CONCEPT_INDEX_V2.md`
- `docs/content/events/migration/V2_CONCEPT_MIGRATION_LEDGER.md`
- `docs/LOCALIZATION.md`
- `docs/content/locations/OPFG_LOCATION_TAGS.md`
- `src/game/content/schema.ts`
- `src/game/content/catalogFactory.ts`
- `src/game/engine/save.ts`
- `src/game/validation/validateContent.ts`
- representative current ordinary V2 Event JSON for runtime-shape verification.

Wave 1 collision review included the manifests/runtime territory of:

- `CH_V2_GENERIC_EARLY_01`
- `CH_V2_GENERIC_LATE_01`
- `CH_V2_PEERS_01`
- `CH_V2_IDENTITY_WORLD_01`
- `CH_V2_COMBAT_RISK_01`

`family_pirate/SELF_AUDIT.md` was also reread specifically to protect the existing Fish-Man Special Association `pirate_fishman_underkeel`.

## Package inventory

- **10 Normal roots exactly**
- **17 Immediate EventDefinitions**
- **19 Scheduled EventDefinitions**
- **46 EventDefinitions total**
- **434 French localization keys**
- French source/fallback fragment: `localization/fr.fragment.json`
- New persistent definitions: **none**
- Non-Lifetime Scheduled callbacks: **0**

All Event IDs use the reserved prefix:

`ch_v2_race_fishman_01_`

## Batch ownership

The batch owns concrete lived Fish-Man situations where Race changes the action or social role:

- water as a materially different action space;
- aquatic ability creating responsibility, expectation, practical cost or social cost;
- Fish-Man strength requiring control rather than functioning as an automatic win;
- concrete accommodation, curiosity and hostility;
- the difference between a useful ability and public entitlement to that ability;
- Fish-Man identity without inventing one universal Fish-Man culture.

Deliberately excluded:

- generic aquatic rescue whose premise works unchanged for a Human;
- swimming competition / aquatic records;
- Pirate × Fish-Man family coercion;
- abstract discrimination lesson;
- Fish-Man Karate;
- respiration/swimming meters or racial resources;
- precise invented Fish-Man sub-morphology;
- new RaceSystem, job system, diver profession, reputation subsystem or economy simulation.

## Root registry

| Seed | Root ID | Age months | Geography/context | Root Dice choices | Immediate depth | Notes |
|---|---|---:|---|---:|---:|---|
| SEED-01 | `ch_v2_race_fishman_01_rinse_bucket_removed` | 48–83 | universal | 0 | 0 | hostility shown by action |
| SEED-02 | `ch_v2_race_fishman_01_stencil_set_aside` | 36–71 | universal | 0 | 0 | positive accommodation; no precise morphology |
| SEED-03 | `ch_v2_race_fishman_01_same_people_different_habits` | 96–167 | universal | 0 | 0 | same Race ≠ universal culture |
| SEED-05 | `ch_v2_race_fishman_01_price_from_below` | 108–167 | `coastal`/`port` + `trade`/`general_goods` | 3 | 2 | aquatic access → value of service |
| SEED-06 | `ch_v2_race_fishman_01_net_under_pilings` | 96–167 | `coastal`/`port` | 3 | **3** | mandatory depth-3 mini-arc |
| SEED-07 | `ch_v2_race_fishman_01_under_hull_before_departure` | 120–179 | `coastal`/`port` | 2 | 2 | aquatic access → responsibility of judgment |
| SEED-09 | `ch_v2_race_fishman_01_not_first_to_rescue` | 108–167 | `coastal`/`port` | 2 | 2 | Fish-Man risk inversion is the rescue engine |
| SEED-11 | `ch_v2_race_fishman_01_strength_in_measure` | 84–155 | universal | 2 | 0 | expected power + dosage; not Giant morphology |
| SEED-13 | `ch_v2_race_fishman_01_show_us` | 72–131 | `coastal`/`port` | 0 | 1 | curiosity becoming entitlement |
| SEED-14 | `ch_v2_race_fishman_01_called_again` | 108–143 | `coastal`/`port` | 2 | 2 | **sole Lifetime seed** |

Every Normal root:

- is `kind: "normal"`;
- is explicitly gated by `careerPhaseIs(childhood)`;
- is explicitly gated by `raceIs(fishman)`;
- has an explicit minimum and maximum `ageMonths` window;
- has no `majorTrack`;
- has at least one unconditional universally resolvable Choice;
- does not require another Origins axis as its premise.

Four roots remain geography-unrestricted inside Childhood: SEED-01, 02, 03 and 11. Water-dependent roots use current Location tags rather than Birth Location or Origin Sea, so they remain Race content rather than Origin Cross.

## Dice audit

### Exact root quota

Dice roots: **6 / 10 = 60%**, exactly the coordination lock.

Only:

1. `ch_v2_race_fishman_01_price_from_below`
2. `ch_v2_race_fishman_01_net_under_pilings`
3. `ch_v2_race_fishman_01_under_hull_before_departure`
4. `ch_v2_race_fishman_01_not_first_to_rescue`
5. `ch_v2_race_fishman_01_strength_in_measure`
6. `ch_v2_race_fishman_01_called_again`

SEED-01, 02, 03 and 13 contain no DiceCheck at the root.

### Dice approaches

| Root | Approach 1 | Approach 2 | Approach 3 |
|---|---|---|---|
| SEED-05 | Agility 11 — pass under the traverse | Observation 11 — read the loaded knot | Strength 14 — free the line with control |
| SEED-06 | Agility 14 — move between pilings | Observation 11 — find the loaded loop | Strength 14 — hold controlled tension |
| SEED-07 | Observation 11 — inspect the mark | Agility 14 — hold a safe position under moving hull | — |
| SEED-09 | Strength 14 — support the drowning child | Charisma 11 — redirect shore response | — |
| SEED-11 | Strength 14 — measured pushes | Intelligence 11 — wedge before lifting | — |
| SEED-14 | Agility 11 — go under immediately | Charisma 11 — make the quay coordinate first | — |

Root Dice Choice count: **14**.

Difficulty distribution:

- threshold 11: **8**
- threshold 14: **6**
- threshold 8: 0
- threshold 17: 0

No Event repeats the same `statId` across two Dice Choices, matching the current validator.

### Dice consequence profile

Every root Dice Choice follows:

- `criticalFailure`: rolled Stat **-1** plus a clearly worse concrete consequence;
- `failure`: **0 rolled-Stat progression**, with a real loss/worse position;
- `success`: rolled Stat **+2**;
- `criticalSuccess`: rolled Stat **+2**.

No +3 critical success is used; the brief permits it exceptionally but does not require it.

Examples of real failure cost:

- SEED-05: damaged hooks and merchant Relationship loss;
- SEED-06: torn net and a worse Immediate state;
- SEED-07: incomplete or misleading inspection before departure pressure;
- SEED-09: the drowning child remains badly positioned; critical failure also costs 1 Health;
- SEED-11: damaged crate / forced unloading rather than compensated success;
- SEED-14: hull/piling impact, lost time and a worse social position before the boundary discussion.

## Immediate mini-arc audit

Mini-arc roots: **6 / 10 = 60%**, exactly:

- SEED-05
- SEED-06
- SEED-07
- SEED-09
- SEED-13
- SEED-14

| Root | Maximum consecutive Immediate depth |
|---|---:|
| SEED-05 — Le prix du fond | 2 |
| SEED-06 — Le filet sous les pilotis | **3** |
| SEED-07 — Sous la coque avant le départ | 2 |
| SEED-09 — Celui qu’on ne sauve pas en premier | 2 |
| SEED-13 — « Montre-nous » | 1 |
| SEED-14 — La corvée qui devient toujours la tienne | 2 |

Depth 2+ roots: **5 / 6 = 83.3%**.

Depth 3 exists exactly where preferred: **SEED-06**.

Every Immediate changes at least one of: information, physical configuration, social pressure, available tradeoff or final resolution. There are no Continue-only panels.

SEED-09 is deliberately capped at depth 2. Its sequence remains:

`wrong rescue priority → stabilize the actually drowning child → shore understands the inversion`

It does not expand into a general Combat Saga.

## Lifetime audit — SEED-14

### Identity

- Seed root: `ch_v2_race_fishman_01_called_again`
- `lifetimeThreadSeed: true`: **yes**
- Primary qualifying Lifetime count in batch: **exactly 1**
- Theme: **a useful capability becomes a social role, and the player progressively defines the limits of that role**
- Persistent protagonist: **none**
- `neighborhood_merchant` is **not** the Lifetime anchor.
- Durable anchor: personal History + recurring social expectation + correspondence/news + reputation carried narratively.
- No persistent flag, thread state, role, job, Item, profession or new NPC is introduced.

The seed has a meaningful immediate-termination option: refusing the automatic role at the opening incident schedules no Lifetime descendant. Other choices can establish the qualifying path.

### Metrics

- Distinct reachable Scheduled EventDefinitions: **19**
- Longest complete reachable lived path: **13 Scheduled chapters after the seed**
- Meaningful structural divergences: **3**
- Branch persistence: **2 Scheduled chapters per structural split before reconvergence**
- Nested structural split while a prior split remains unresolved: **0**
- Normal next-Lifetime scheduling: **one next Scheduled chapter per resolved lived branch**
- Maximum normal-path Lifetime Scheduled descendants before age 15: **3**
- Earliest seed age: 108 months
- Latest seed age: 143 months
- Earliest unblocked terminal age: 384 months / age 32
- Latest equivalent terminal age from latest seed: 419 months / age 34 years 11 months
- Childhood → Active: intentional
- Twenties continuation: intentional

### Full braided-linear topology

```text
SEED-14 called_again
  -> Immediate 1
  -> Immediate 2
      ├─ establish a limit / chosen help
      │    -> S01 second_call
      │    -> S02 assumed_again
      │        ├─ help remains a choice
      │        │    -> S03A help_by_choice
      │        │    -> S04A terms_remembered
      │        │
      │        └─ refuse the automatic assumption
      │             -> S03B refusal_heard
      │             -> S04B asked_properly
      │
      │        [reconverge]
      │    -> S05 news_from_home
      │    -> S06 new_shore_same_question
      │        ├─ define a concrete return for this help
      │        │    -> S07A name_a_return
      │        │    -> S08A terms_travel
      │        │
      │        ├─ require preparation / tools first
      │        │    -> S07B tools_first
      │        │    -> S08B prepared_request
      │        │
      │        └─ refuse the role here -> early termination
      │
      │        [reconverge]
      │    -> S09 reputation_precedes_you
      │    -> S10 called_before_asked
      │        ├─ volunteer on your own initiative
      │        │    -> S11A voluntary_help
      │        │    -> S12A share_the_method
      │        │
      │        ├─ stop the automatic assignment
      │        │    -> S11B refuse_automatic_role
      │        │    -> S12B permission_returns
      │        │
      │        └─ walk away from the role -> early termination
      │
      │        [reconverge]
      │    -> S13 your_terms
      │
      └─ cut the habit at the seed -> early termination
```

### Lifetime chapter IDs and timing

Earliest complete-route due ages from a 108-month seed:

| Depth | Event | Delay from prior | Earliest ageMonths |
|---:|---|---:|---:|
| 1 | `ch_v2_race_fishman_01_lt_s01_second_call` | +18 | 126 |
| 2 | `ch_v2_race_fishman_01_lt_s02_assumed_again` | +18 | 144 |
| 3 | `..._lt_s03a_help_by_choice` or `..._lt_s03b_refusal_heard` | +24 | 168 |
| 4 | `..._lt_s04a_terms_remembered` or `..._lt_s04b_asked_properly` | +24 | 192 |
| 5 | `ch_v2_race_fishman_01_lt_s05_news_from_home` | +24 | 216 |
| 6 | `ch_v2_race_fishman_01_lt_s06_new_shore_same_question` | +18 | 234 |
| 7 | `..._lt_s07a_name_a_return` or `..._lt_s07b_tools_first` | +24 | 258 |
| 8 | `..._lt_s08a_terms_travel` or `..._lt_s08b_prepared_request` | +18 | 276 |
| 9 | `ch_v2_race_fishman_01_lt_s09_reputation_precedes_you` | +24 | 300 |
| 10 | `ch_v2_race_fishman_01_lt_s10_called_before_asked` | +18 | 318 |
| 11 | `..._lt_s11a_voluntary_help` or `..._lt_s11b_refuse_automatic_role` | +24 | 342 |
| 12 | `..._lt_s12a_share_the_method` or `..._lt_s12b_permission_returns` | +18 | 360 |
| 13 | `ch_v2_race_fishman_01_lt_s13_your_terms` | +24 | 384 |

Only depths 1–3 can resolve before 180 months on the earliest full route.

### Geography / no-teleport audit

- S01–S02 resolve while even the latest seed remains in Childhood, so the original local situation can still plausibly recur.
- From S03 onward, branch continuity mostly uses billets, letters, traveler news and remembered stories with `scheduledReach: "unrestricted"` where the recurring cause is remote.
- S06 and S10 are the two deliberately physical adult repetitions. They require current `coastal` or `port` geography and remain pending until compatible.
- No local persistent NPC is cast in any Lifetime Scheduled Event.
- No anonymous local actor is treated as the same person across distant Locations.

### Thematic evolution

The thread changes meaning over time:

1. capability noticed;
2. help assumed;
3. first explicit boundary;
4. boundary remembered or refusal normalized;
5. old story travels;
6. same expectation appears elsewhere;
7. compensation **or** safety/preparation becomes one possible term;
8. those terms distort into reputation;
9. adult player chooses voluntary availability or rejects automatic assignment;
10. final correction rejects the idea that one personal history defines how every Fish-Man should behave.

Compensation is represented narratively as recognition for a specific help. There is no Berrys flow, wage ladder, pricing table, diver profession or simulated labor economy.

## Cast / Conditions / Traits

### Persistent cast

Only existing persistent NPC used:

- `neighborhood_merchant` — SEED-05 only, as a punctual relationship-bearing merchant.

No new persistent NPC is proposed.

No `childhood_friend`, `childhood_rival` or `childhood_younger` familiarity is assumed.

SEED-09 deliberately uses an anonymous child rather than borrowing the existing COMBAT_RISK `childhood_younger` continuity.

### Existing Conditions used

- `careerPhaseIs`
- `ageAtLeastMonths`
- `ageAtMostMonths`
- `raceIs`
- `locationHasTag`
- `locationHasService`
- `hasTrait`
- `npcRelationshipAtLeast`
- `hasPlayed`
- `all`
- `any`

No new Condition is invented.

### Traits

Trait acquisition: **0**.

Existing Trait gates used only as real leverage:

- `proud` — public refusal / explicit permission boundary;
- `curious` — studying how the festival artist adapts;
- `cautious` — one route to explicit permission/safety terms.

No unconditional deterministic Choice grants a Trait.
No Dice Choice grants a Trait.
No Trait is removed.

## Reward / malus audit

- Root Dice critical failure: rolled Stat -1.
- Root Dice failure: rolled Stat 0.
- Root Dice success: rolled Stat +2.
- Root Dice critical success: rolled Stat +2.
- Ordinary deterministic Stat effects remain within **-1 / 0 / +1**.
- Deterministic Stat effect below -1: **none**.
- Ordinary deterministic Stat reward above +1: **none**.
- Health change: one selective `-1 Health` on SEED-09 Strength critical failure.
- Berrys changes: **none**.
- Reputation changes: **none**.
- Bounty changes: **none**.
- Items/equipment changes: **none**.
- Career changes: **none**.
- Flags: **none**.
- Trait grants/removals: **none**.
- `neighborhood_merchant` Relationship changes appear only where that NPC is actually cast in SEED-05 and its Immediate continuations.

The batch therefore does not turn Fish-Man advantage into an automatic reward engine.

## Text / localization audit

- French is the sole authored source/fallback locale in this package.
- `localization/fr.fragment.json` contains every localization key referenced by all 46 EventDefinitions.
- Root body word-count range: **23–28 words**.
- Immediate/Scheduled body maximum: **30 words**.
- Choice labels: maximum **7 words**.
- Outcome text: maximum **25 words**.
- All roots use direct Situation → Reaction framing with concrete actor/object/problem before the Choices.
- Hostility in SEED-01 is shown through the vendor physically removing and wiping the shared bucket.
- No Event contains a didactic explanation of racism.
- SEED-02 makes no claim about a specific Fish-Man sub-race or anatomy.
- SEED-03 explicitly prevents “same Race” from becoming “same culture”.

## Collision / dedup audit

### Generic Early

Protected examples include small delivery, simple lost objects and early merchant continuity.

- This batch does not create a generic delivery root.
- SEED-05 uses the merchant because the Fish-Man-only access changes the value/social meaning of the task.
- SEED-14 intentionally does **not** use the merchant as its Lifetime protagonist.

### Generic Late

Protected concepts include entrusted work, bargaining, `chain_of_favors` and merchant-task continuity.

- SEED-14 is not reciprocal favor chaining.
- Its persistent engine is asymmetric expectation created by Fish-Man capability.
- Compensation appears as one possible boundary inside the Lifetime, never as job progression.

### Peers

Protected concepts include rivalry, competition, friend/rival status and paper-boat competition.

- SEED-13 is not a swimming contest.
- The conflict is spectators treating a racial capability as available entertainment.

### Identity / World

Protected concepts include wider-world institutions, rumors, cultural/political discovery and abstract world framing.

- SEED-01 remains one concrete act at a counter.
- SEED-03 is one concrete mistaken assumption contradicted by a Fish-Man traveler; it does not define a universal culture or political theory.

### Combat / Risk

Protected concepts include generic rescue and bodily danger.

- SEED-09 exists only because rescue priority is materially inverted for a Fish-Man who remains functional in the water while the other child is drowning.
- Remove `raceIs(fishman)` and the scene no longer has the same problem.
- It is capped at depth 2 and has no recurring rescue Lifetime.

### Family Pirate Fish-Man special association

Protected: `pirate_fishman_underkeel`.

- No Pirate affiliation condition.
- No family/crew coercion.
- No ownership of the player's body/capability by an organization.
- No diver bell / Pirate inheritance content.

### Giant collision protection

SEED-11 does not use oversized hands, body-scale mismatch or Giant morphology.

Its engine is:

`people expect Fish-Man power → brute force risks damaging the task → player controls or redirects that expectation`.

That is intentionally distinct from a Giant-specific “body too large for the object” premise.

### Water-object repetition

The selected roots do not produce three autonomous “object falls into water” variants.

- SEED-05: one commercial lot caught below a structure; value/recognition is the second half of the mini-arc.
- SEED-06: working net physically tangled around pilings.
- SEED-07: inspection under a hull, not recovery.
- SEED-09: asymmetric rescue.
- SEED-13: spectacle/boundary.
- SEED-14: recurring expectation around an aquatic task, then long-term social role.

## Static package validation

Static authoring audit performed against the current Schema 14 / validator vocabulary:

- Event IDs: **46 unique / 46**
- Root IDs: **10 unique / 10**
- Immediate references: all targets exist and are `kind: "immediate"`
- Scheduled references: all targets exist and are `kind: "scheduled"`
- Orphan Immediate EventDefinitions: **0**
- Orphan Lifetime Scheduled EventDefinitions: **0**
- Immediate cycles: **0**
- Choice-resolvability failures: **0**
- Roots missing Childhood gate: **0**
- Roots missing `raceIs(fishman)`: **0**
- Roots missing explicit age minimum/maximum: **0**
- Roots with `majorTrack`: **0**
- Repeated Dice `statId` inside one Event: **0**
- Unknown/new persistent definitions used: **0**
- Missing package-local FR localization references: **0**
- Lifetime Scheduled graph reachable from S01: **19 / 19**
- Lifetime longest Scheduled path: **13**
- Lifetime structural splits: **3**
- Nested unresolved structural split: **0**

No repository integration, compile, selector simulation or save migration was run, because the deliverable is explicitly standalone and repository mutation was forbidden.

## Integration boundary

This package intentionally does **not**:

- modify `EVENT_CONCEPT_INDEX_V2.md`;
- modify `V2_CONCEPT_MIGRATION_LEDGER.md`;
- register a new global catalogue entry;
- edit `schema.ts`, `catalogFactory.ts`, selector/runtime or localization dictionaries;
- create a branch, commit or PR.

Integration/review may later decide whether accepted root concepts are appended to the V2 concept ledger and which seed adaptations are marked in the migration ledger.
