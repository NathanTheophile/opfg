# OPFG — Major Narrative Tracks

> **Status: validated V2 narrative-design authority; runtime implementation pending.**
>
> This document defines the narrative spine introduced by the D2 Content Reset. It supersedes D1.8/D1.9 opening orchestration and the former mandatory Childhood Lifetime Thread guarantee. It does not itself claim that Schema 11 / Save 20 are already implemented.

## 1. Purpose

OPFG is not a deck of unrelated life cards. A run must contain durable narrative lines that react to the player's history while leaving enough room for ordinary Events, relationships, geography, Race, Traits, mini-arcs and accidents.

Two **Major Narrative Tracks** form the long-term spine of a complete career:

1. **Family Legacy Saga** — inherited from Origins and intended to remain relevant from Childhood to the end of the career.
2. **Personal Affiliation Saga** — begins from age 15 and represents what the player chooses to become, including career identity, major successes, failures and long-term affiliation consequences.

Only the generic infrastructure and the **Childhood portion of Family Legacy** are in the current D2 implementation scope. Adult Family continuation and Personal Affiliation authoring remain future work, but the architecture must not block them.

## 2. V1 playable Origins surface

### Family affiliation

Playable for the D2 V1 content surface:

- `civilian`
- `marine`
- `pirate`
- `revolutionary`
- `royal_family`

Visible in Origins but locked for now:

- `bandit`
- `prisoner`
- `slave`
- `celestial_dragon`

Locked options remain definitions and remain visible so their future existence is legible. They are not valid starting choices until a complete enough narrative treatment exists.

### Race

Playable for the D2 V1 content surface:

- `human`
- `fishman`
- `mink`
- `giant`

Visible but locked for now:

- `longarm`
- `buccaneer`

This lock is a production-scope decision, not a lore statement and not a deletion of the definitions.

## 3. Family Legacy Saga contract

Every playable inherited family affiliation owns exactly one Family Legacy Saga:

- `family_civilian`
- `family_marine`
- `family_pirate`
- `family_revolutionary`
- `family_royal`

A run may not randomly receive another family's saga. The inherited affiliation determines the Family Legacy Saga.

### Childhood guarantee

Every complete Childhood resolves **exactly five Family Legacy root chapters** before age 15.

| Chapter | Due age | Narrative role |
| --- | ---: | --- |
| `childhood_01` | 12 months | earliest lived family anchor |
| `childhood_02` | 48 months | first development / consequence |
| `childhood_03` | 84 months | middle-childhood family identity |
| `childhood_04` | 120 months | pre-adolescent pressure / divergence |
| `childhood_05` | 156 months | adolescent inheritance / bridge toward Active |

The checkpoints make a chapter **due**. They do not require the Event to fire on the exact month if a higher-priority event occupies that slot.

Five Family roots out of the 20 Childhood root slots reserve 25% of Childhood for the major family spine and leave 75% for the rest of life.

## 4. Horizontal chapter pools

A chapter is **not one Event** and is not a fixed `scheduleEvent(A → B → C)` chain.

Each chapter is a pool of mutually exclusive Event variants selected from the **current GameState at the moment the chapter is resolved**.

Variants may materially depend on:

- Race;
- initial family structure;
- current status/presence of `player_parent_1` / `player_parent_2`;
- relationship with parents;
- social class;
- Birth Location / local institution when genuinely relevant;
- Traits;
- prior Choices / Outcomes / played chapters;
- consequences from secondary mini-arcs;
- later, current personal career affiliation.

A variant exists only when that axis or combination creates a substantially different scene. Do **not** produce the Cartesian product of all Origins variables.

### Example principle

`Marine + two parents` and `Marine + orphan` must be allowed to begin and develop differently while still belonging recognizably to the same Marine Family Legacy Saga.

A Fish-Man-specific Marine variant is justified when Fish-Man embodiment or social treatment changes the actual situation, not merely because a `raceIs(fishman)` Condition can be attached.

## 5. Fallback invariant

Every Family Legacy chapter must contain **exactly one universal fallback variant** for its track/chapter.

Selection contract:

1. evaluate specialized variants against the current state;
2. if one or more specialized variants are eligible, select seeded-uniformly among them;
3. use the fallback only when no specialized variant is eligible.

The fallback exists for safety. It must not compete with specialized variants and dilute Origin reactivity.

## 6. Progression and memory

Major Track progression is derived from `History` plus Event metadata.

For a Family track:

```text
History
→ played Event IDs
→ EventDefinition.majorTrack metadata
→ completed chapter IDs
→ first incomplete chapter
```

Do not add `ArcState`, `questState`, `familySagaProgress`, `currentSagaChapter` or another persistent chapter counter solely for Major Tracks.

Past decisions continue to branch later chapters through existing history Conditions such as `hasPlayed`, `hasChosen` and `hasOutcome`.

Initial family structure and current parent state are different facts. `familyStructureIs(two_parents)` means the player started life with two parents; a later chapter must inspect NPC state when it matters whether those parents are still alive/present/available.

## 7. Event semantics

A Major Track chapter variant remains a **Normal Event** so it can reuse the existing Event contract:

- Conditions;
- Choices;
- Dice;
- Effects;
- cast;
- localization;
- History;
- Immediate continuations;
- Scheduled consequences;
- normal root-slot consumption.

Major Track variants are excluded from the ordinary Normal random pool. Only the Major Track selector may inject them.

Completing one variant completes the **whole chapter** for that run; another variant of the same chapter must never appear later.

## 8. Priority with Critical / Immediate / Scheduled

Target selection order once D2 runtime is implemented:

1. Critical handling and existing mandatory system gates;
2. Immediate continuation already in progress;
3. other existing system injections that must resolve before a root;
4. **Major Track chapter that is overdue**;
5. due Scheduled Event;
6. **Major Track chapter that has just become due**;
7. ordinary Normal pool.

This deliberately allows a due Scheduled consequence to occupy the exact checkpoint slot. At the next root opportunity, the missed Major chapter is `overdue` and cannot be starved by a chain of newer Scheduled callbacks.

A Major chapter that queues Immediate Events still consumes only its one root slot after the Immediate chain completes.

## 9. Relationship to Lifetime Threads

The former rule “every Childhood must initiate at least one `lifetimeThreadSeed`” is superseded.

The guaranteed narrative spine is now the Family Legacy Saga.

Legacy Lifetime Threads may inspire V2 secondary stories, and a future optional long-form secondary-thread contract may still use Scheduled Events, but `lifetimeThreadSeed` is no longer a mandatory Childhood continuity mechanism and must not compete with the Family guarantee.

## 10. Origin Cross mini-arcs

Origin Cross stories have a different job from Major Sagas.

They make a precise combination of the character feel recognized, without carrying the whole career. The current playable surface contains 20 Affiliation × Race pairs (5 × 4), which is a useful eventual coverage matrix, not a requirement to write one giant saga per combination.

Typical shape:

```text
specific Root or eligible ordinary Event
→ 1–3 Immediate continuations when the same scene deserves depth
→ optional Scheduled callback later
→ conclusion
```

Mini-arcs may also use family structure, social class or Birth Location when the combination has high dramatic yield.

They do not replace the five guaranteed Family chapters.

## 11. Ordinary Childhood remains essential

The other 15 Childhood roots remain available for, among other things:

- Race lived experience;
- Birthplace / local world;
- Origin Cross mini-arcs;
- friend/rival introductions and callbacks;
- Traits and development;
- generic adventures and accidents;
- optional secondary Scheduled consequences.

The Family Saga must structure Childhood without monopolizing it.

## 12. Authoring breadth target

The runtime contract fixes **five lived chapters**, not a fixed authored Event count.

For production planning, a mature Childhood Family Saga will likely require roughly **45–70 root variants across its five chapter pools**, plus only the Immediate/Scheduled support that genuinely improves the story.

This is a production target, not a schema invariant. Horizontal quality matters more than hitting a node quota.

A saga fails review if different Origins repeatedly receive the same scene with cosmetic text swaps.

## 13. Future Active continuation

At age 15, the Family Legacy Saga does **not end**. It is intended to continue reacting to the player's adult choices.

The future Personal Affiliation Saga begins around the same transition and represents the player's chosen path. From that point, both major tracks may coexist:

```text
Family Legacy Saga      = where you come from
Personal Affiliation    = what you choose to become
```

Family chapters in Active may react strongly when current career affiliation differs from inherited family affiliation. The exact adult chapter cadence, career-change semantics and coexistence rules are intentionally deferred until the Active redesign.

Childhood authoring must nevertheless leave meaningful states and decisions that can be paid off later.

## 14. V2 content reset and archives

D1.8, D1.9 and earlier narrative EventDefinitions are **not automatically accepted V2 runtime content**.

Their concepts are preserved in non-authoritative archives and may be deliberately mined during V2 authoring. Reuse means rewriting an idea into the current V2 contract; it does not mean copying the old EventDefinition, ID, age gate, choices, outcomes or graph.

The V2 Concept Index contains only content actually accepted under the V2 architecture.

Legacy archives must not be fed wholesale to production GPT conversations. A production batch receives only the V2 authorities, V2 Concept Index, its saga blueprint and a deliberately selected small set of relevant seeds.

## 15. Schema / save implementation direction

The read-only runtime audit recommends:

- Content Schema 10 → 11 for Major Track definitions/metadata;
- no Saga-specific GameState field;
- a Save bump is **not technically required by Major Tracks alone**;
- the broader physical Content Reset should intentionally move to a new save generation (recommended Save 20 / new run) because legacy current/Immediate/Scheduled/history Event IDs may no longer exist.

These are implementation requirements for the D2 runtime pass, not claims about the currently shipped schema/save version.
