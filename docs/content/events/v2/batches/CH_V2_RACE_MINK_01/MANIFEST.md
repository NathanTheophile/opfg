# MANIFEST — CH_V2_RACE_MINK_01

## Repository baseline

- Repository: `NathanTheophile/opfg`
- Branch reviewed: `dev`
- HEAD verified for authoring: `4029a2ef4a4e74656c3d559b845496eed862b02d`
- Git tree SHA observed: `b94c9f5da3a0123d8385320bfa5d3bf5c26cfb88`
- Content Schema: **14** (`CONTENT_SCHEMA_VERSION = 14`).
- Save generation: **21** (`CURRENT_SAVE_VERSION = 21`).
- Production mode: standalone package only. No repository mutation, commit, branch, PR, Concept Index edit or Migration Ledger edit.
- `dev` advanced during authoring from parent `1a634a47d20dc3877536af07be85387238f4882d` to the HEAD above via a debug-panel commit. Current `schema.ts`, `save.ts` and `catalogFactory.ts` were rechecked on the new HEAD; the content contract remains Schema 14 / Save 21.

## Authority / collision pass

Re-read/checked against the current V2 authority set and runtime contract: `AGENTS.md`, `docs/GAME_DESIGN.md`, `docs/design/MAJOR_NARRATIVE_TRACKS.md`, `docs/design/WORLD_TIMELINE_AND_CANON.md`, `docs/content/EVENT_AUTHORING_RULES.md`, `docs/content/CONTENT_BIBLE.md`, `docs/content/TRAITS_CATALOG.md`, Childhood V2 batch/seed-mining contracts, Concept Index V2, migration ledger, `schema.ts`, `catalogFactory.ts`, current Event runtime conventions, and the five accepted Wave 1 manifests (`GENERIC_EARLY`, `GENERIC_LATE`, `PEERS`, `IDENTITY_WORLD`, `COMBAT_RISK`).

Dedicated Phase B arbitration is authoritative over the seed pool. No Electro, Sulong, Zou requirement or RaceSystem assumption is authored.

## Package inventory

- **10** Normal roots exactly.
- **13** Immediate EventDefinitions.
- **19** Scheduled Lifetime EventDefinitions.
- **42** EventDefinitions total.
- French source localization: `localization/fr.fragment.json` (410 keys).
- New persistent definitions: **none**.
- Existing Traits granted or gated: **none**.
- Persistent NPC cast: **none required**.
- Items/Flags/Locations created: **none**.

## Root coverage audit

| Root | Age months | Dice root | Dice choices | Immediate depth | FR body words | Special |
|---|---:|---:|---:|---:|---:|---|
| `ch_v2_race_mink_01_drowned_instruction` | 72–131 | yes | 3 | 2 | 30 | Lifetime seed |
| `ch_v2_race_mink_01_listen_for_signal` | 84–155 | yes | 3 | 2 | 26 | — |
| `ch_v2_race_mink_01_one_touch_too_many` | 48–131 | no | 0 | 0 | 29 | — |
| `ch_v2_race_mink_01_scent_on_hands` | 96–167 | yes | 3 | 2 | 26 | — |
| `ch_v2_race_mink_01_scent_screen` | 108–179 | yes | 3 | 2 | 29 | — |
| `ch_v2_race_mink_01_soaked_fur` | 36–107 | no | 0 | 0 | 28 | — |
| `ch_v2_race_mink_01_sticky_fur` | 48–107 | no | 0 | 0 | 25 | — |
| `ch_v2_race_mink_01_through_the_wall` | 96–167 | no | 0 | 0 | 28 | — |
| `ch_v2_race_mink_01_too_many_tracks` | 72–143 | yes | 3 | 3 | 25 | — |
| `ch_v2_race_mink_01_trail_after_rain` | 84–143 | yes | 3 | 2 | 30 | — |

Every root requires `careerPhaseIs(childhood)` + `raceIs(mink)` + its age window. No root requires an exact Location, origin sea, affiliation, family state, Item, Trait, NPC relationship or prior History. Every root retains unconditional choices.

### Age / geography

The roots cover **36–179 ageMonths (3–14 years)** with overlapping windows. Geography is deliberately broad: no exact Location, world region, Zou, land-only tag or service is required. The situations use portable local contexts (room, covered passage, task area, shared workspace) so the Race premise rather than geography owns eligibility.

This Race batch is additive specialized content, not the generic safety net; `raceIs(mink)` is intentionally restrictive.

## Mink ownership audit

Authored territory:

- extra perception produces **more information and more ambiguity**, never automatic truth;
- sensory filtering and source verification;
- involuntary/private information;
- a deliberate countermeasure against scent perception;
- fur interacting with sticky matter and retained rainwater;
- bodily/social boundary around touch.

Explicitly absent:

- speed-as-victory, race competitions, automatic tracking, animal instinct/personality;
- Electro, Sulong, Zou requirement;
- Human-standard equipment critique in the fur roots;
- a Lifetime based on being socially summoned for superior hearing.

## Immediate mini-arc audit

- Mini-arc roots: **6 / 10 = 60% exactly**.
- Locked roots: `too_many_tracks`, `drowned_instruction`, `scent_on_hands`, `listen_for_signal`, `scent_screen`, `trail_after_rain`.
- Roots with depth 2+: **6 / 6 = 100%**.
- Depth-3 root: `ch_v2_race_mink_01_too_many_tracks`.

| Mini root | Max Immediate depth | Structural purpose |
|---|---:|---|
| `ch_v2_race_mink_01_too_many_tracks` | 3 | plausible scent → handoff → transfer contradiction → displaced-object resolution |
| `ch_v2_race_mink_01_drowned_instruction` | 2 | wrong target → explicit verification method |
| `ch_v2_race_mink_01_scent_on_hands` | 2 | incriminating scent → shared source → fact/conclusion separation |
| `ch_v2_race_mink_01_listen_for_signal` | 2 | two candidate sounds → source verification → report uncertainty |
| `ch_v2_race_mink_01_scent_screen` | 2 | deliberate masking → mask pattern → temporal order of evidence |
| `ch_v2_race_mink_01_trail_after_rain` | 2 | washed trail → conflicting clues → two different moments reconciled |

No Immediate is a continuation-only screen.

## Dice audit

- Dice roots: **6 / 10 = 60% exactly**.
- Every Dice root has **3 materially different Dice choices** plus a deterministic route.
- Single-Dice-choice exceptions: **none**.

| Root | Dice approaches |
|---|---|
| `too_many_tracks` | Observation 11 / Intelligence 11 / Charisma 11 |
| `drowned_instruction` | Observation 11 / Intelligence 11 / Charisma 8 |
| `scent_on_hands` | Observation 11 / Intelligence 11 / Charisma 11 |
| `listen_for_signal` | Observation 11 / Intelligence 11 / Charisma 11 |
| `scent_screen` | Observation 14 / Intelligence 11 / Charisma 11 |
| `trail_after_rain` | Observation 11 / Intelligence 11 / Charisma 11 |

Difficulty distribution across the 18 root Dice choices: Easy 8 = **1**, Standard 11 = **16**, Difficult 14 = **1**, Very difficult 17 = **0**.

Dice progression follows the V2 profile on the rolled Stat: critical failure `-1`, failure `0`, success `+2`, critical success `+2`. Failure prose still worsens certainty, social position or the investigation; it is never a compensated success.

No Trait modifier/override is used. Race is root eligibility, not a Dice bonus.

## Reward / malus audit

- Ordinary deterministic player-Stat changes remain inside **-1 / 0 / +1**.
- Dice rolled-Stat changes use only **-1 / 0 / +2 / +2**.
- No deterministic Stat malus below `-1`.
- No ordinary deterministic Stat reward above `+1`.
- No Health damage.
- No Trait grant, removal or Trait-gated choice.
- No Item/Berrys/reputation/Flag mutation.

Examples:

- positive deterministic: `too_many_tracks_i03_new_information / apologize_first` → Charisma +1;
- neutral deterministic: `sticky_fur / protect_patch` → narrative tradeoff, no Stat change;
- negative deterministic: `sticky_fur / pull_quickly` → Morale -1; `drowned_instruction / stop_and_sort` → Morale -1 for visible disruption/delay.

## Unique Lifetime — APPRENDRE À FILTRER

- Seed root: `ch_v2_race_mink_01_drowned_instruction`.
- `lifetimeThreadSeed: true`: **yes, and only on this root**.
- Durable anchor: an evolving **verification method** for handling overlapping sensory information. This is an evolving commitment/practice, not a power, job, racial obligation or new resource.
- Scheduled EventDefinitions: **19 distinct**.
- Longest complete lived path: **14 Scheduled chapters**.
- Shortest complete lived path: **14 Scheduled chapters**.
- Structural divergences: **4**.
- Early termination branches: **none**; every authored route remains a complete biographical thread.
- Nested unresolved structural splits: **none**.
- One-next policy: every resolved Scheduled choice schedules at most one next Lifetime chapter.
- `scheduledReach: unrestricted` on all Lifetime descendants so career travel cannot strand a portable biographical callback.

### Braided-linear map

```text
Seed / drowned_instruction
  -> LT01 first_filter
  -> LT02 more_voices
       ├─ LT03A quieter_corner -> LT04A cost_of_quiet ─┐
       └─ LT03B anchor_voice   -> LT04B too_focused  ──┘
                                                    -> LT05 verify_not_silence
                                                    -> LT06 information_to_ignore
       ├─ LT07A chosen_silence ─┐
       └─ LT07B spoken_boundary ─┘
                               -> LT08 layers
                               -> LT09 false_cue
       ├─ LT10A familiar_not_certain ─┐
       └─ LT10B source_before_signal ──┘
                                     -> LT11 senses_and_story
                                     -> LT12 pass_it_on
       ├─ LT13A shared_cue ────────┐
       └─ LT13B control_question ──┘
                                  -> LT14 clear_instruction
```

No later split occurs before the previous branch reconverges.

### Lifetime timing / age span

Seed eligibility: **72–131 months** (ages 6–10).

Earliest complete route schedule ages:

- LT01 96m (8y)
- LT02 126m (10.5y)
- LT03 156m (13y)
- LT04 186m (15.5y)
- LT05 204m (17y)
- LT06 220m
- LT07 236m
- LT08 252m (21y)
- LT09 268m
- LT10 284m
- LT11 300m (25y)
- LT12 316m
- LT13 332m
- LT14 348m (29y)

Latest normal seed route reaches LT14 at **407 months (~33.9 years)**, still below the current 420-month career horizon.

Maximum expected Lifetime Scheduled descendants before age 15 on the earliest route: **3** (LT01–LT03), within the `<=4` contract.

The thread crosses Childhood → Active and has substantial authored life in the twenties. It never grants hearing bonuses, creates a sensory gauge, or presents increased raw perception as its progression.

### Lifetime content progression

1. recognize overload before acting;
2. external quiet vs internal anchor;
3. discover each filtering method hides useful information;
4. reconverge on source/action verification;
5. intentionally ignore private information;
6. experience interlocutor adaptation;
7. rank overlapping signals by action consequence;
8. face a familiar cue deliberately imitated to exploit the method;
9. separate accurate perception from wrong interpretation;
10. transmit an adaptable method to someone younger;
11. end as an adult who verifies context, not as someone whose senses became stronger.

SEED-01 appears only as an ingredient in the branch where a secondary call can be missed while filtering; it is not authored as another Normal root.

## Collision audit — Wave 1 / Wave 2 ownership

### GENERIC_EARLY

No lost-object root is solved by generic search mechanics alone: `too_many_tracks` exists because Mink scent provides **too many plausible contacts** and can falsely implicate someone. Fur roots are material-specific and not generic bucket/puddle or clothing mishaps.

### GENERIC_LATE

`drowned_instruction` is not an apprenticeship/career root; the task itself is incidental. Its subject is sensory filtering. No commerce, wage, entrusted money, key custody or work identity is developed.

### PEERS

No race, contest, rivalry, prank group or peer-status engine. `too_many_tracks` uses multiple handlers but not friend/rival social standing; responsibility for inference is the engine.

### IDENTITY_WORLD

No institution/world revelation, canon figure, poster, political text, navigation knowledge or future-career discovery. Private information remains immediate/local rather than a wider-world exposition device.

### COMBAT_RISK

No rescue, chase, serious hazard or physical danger engine. Even rain and sticky material are inconvenience/constraint rather than bodily-risk set pieces.

### Wave 2 protected ownership

- Fish-Man keeps the primary “useful ability → recurring social obligation” theme. `listen_for_signal` is one bounded incident and never seeds the Lifetime.
- Human keeps standard-Human object/body norm. `sticky_fur` and `soaked_fur` concern matter retained by fur, not critique of Human-designed equipment.

## Definitions / canon / representation audit

- New systems: **none**.
- New NPCs: **none**.
- New Traits: **none**.
- New Items: **none**.
- New Flags: **none**.
- New Locations/tags/services: **none**.
- Electro/Sulong: **absent**.
- Zou requirement: **absent**.
- Animal-instinct/personality framing: **absent**.
- Touch-boundary root allows the player to refuse, request permission, step away **or allow this instance**; it does not impose a universal Mink reaction.

## Localization / prose audit

- Source locale: **FR only**.
- Root body target: around 25 words; authored root bodies range **25–30 words**.
- All referenced localization keys exist in `localization/fr.fragment.json`.
- Forbidden reductive wording scan: clean for Electro/Sulong/Zou/“instinct animal”/“prédateur”.
- Situations are written as immediate Situation → Reaction scenes.

## Machine audit summary

- Root count: PASS — 10.
- Dice roots: PASS — 6 exactly.
- Mini-arc roots: PASS — 6 exactly.
- Depth 2+: PASS — 6/6.
- Depth 3: PASS — `too_many_tracks`.
- Unique Lifetime seed: PASS — `drowned_instruction`.
- Lifetime definitions: PASS — 19 Scheduled distinct.
- Lifetime lived depth: PASS — 14.
- Lifetime divergences: PASS — 4.
- Lifetime pre-15 max: PASS — 3.
- Lifetime final max age: PASS — <420 months.
- Root Race/phase/age gates: PASS.
- Localization key completeness: PASS.
- Internal Event references: PASS.
- Trait/new-definition restrictions: PASS.
- Forbidden Mink-system wording: PASS.
