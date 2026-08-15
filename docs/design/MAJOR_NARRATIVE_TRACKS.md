# OPFG — Major Narrative Tracks

> **Status: validated V2 narrative-design authority; D2 Childhood Family runtime implemented.**
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
| `childhood_05` | 168 months | adolescent inheritance / bridge toward Active |

The checkpoints make a chapter **due**. They do not require the Event to fire on the exact month if a higher-priority event occupies that slot. Layer 5 is due at 168 so a Scheduled Event may consume that checkpoint; at 174 the still-missing Family layer is overdue and therefore wins before another Scheduled, preserving Family completion before the 180-month Active boundary in normal Childhood flow.

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

## Implementation checkpoint — Wave 3

Content Schema 11 implements the generic Major Narrative Track contract without adding Saga state to GameState. Track progression is reconstructed from History; Major variants remain Normal Events but are excluded from the ordinary Normal pool.

Priority is:

1. Critical / system gates;
2. Immediate;
3. overdue Major chapter;
4. due Scheduled;
5. newly due Major chapter;
6. ordinary Normal.

A chapter selects specialized eligible variants first and uses its single fallback only when no specialized variant is currently eligible. The D1.9 opening selector and mandatory Lifetime Thread selection guarantee are removed from runtime orchestration.

<!-- D2.8_LAYERED_FAMILY_SAGA_GRAPH -->
## D2.8 — Layered pyramidal Family Saga graph

> **Authoritative amendment.** This section supersedes §§4–6 and any wording elsewhere that describes a Family chapter as an independent horizontal pool. It also clarifies §12: the 45–70 mature-root estimate refers to nodes distributed across a connected five-layer graph, not 45–70 interchangeable variants per chapter.

### 16.1 Five temporal layers, not five independent subjects

Childhood still guarantees exactly five Family Legacy roots, due at 12 / 48 / 84 / 120 / 168 months.

Each checkpoint is a **temporal layer** of one connected narrative graph:

```text
Layer 1y  -> Layer 4y -> Layer 8y -> Layer 12y -> Layer 14y inheritance
```

The player resolves exactly one Major Family node in each layer.

A Family Saga must preserve dramatic continuity across layers. A later node is selected from descendants of the node actually lived in the previous layer, then filtered by current GameState and History. The selector must never behave as five independent rerolls from the whole affiliation corpus.

Family Major nodes remain Normal Events. They are **not Scheduled Events** and must not be chained with `scheduleEvent`. Their due checkpoints are handled only by the Major Narrative selector.

### 16.2 Pyramids and crossings

A Family Saga contains several entry pyramids inside the same inherited-affiliation track.

Typical first-layer roots can represent high-yield starting situations such as:

- single-parent household;
- broad/default family situation;
- non-human lived context;
- another affiliation-specific starting premise.

A root may branch through its Choices/Outcomes. Later layers widen into several descendants.

Pyramids are intentionally allowed to **cross**. One later node may declare parents from several earlier pyramids when those histories now create the same concrete dramatic situation.

Crossing does not erase memory. The shared node may still use `hasChosen`, `hasOutcome`, NPC state, relationship, Traits or other Conditions to change available Choices, lines or outcomes.

### 16.3 Runtime node metadata

Every Family Major Event is one graph node:

```ts
majorTrack: {
  trackId: 'family_marine',
  chapterId: 'childhood_03',
  nodeId: 'marine_08_accusation',

  parentNodeIds: [
    'marine_04_single_parent_base',
    'marine_04_uniform_doubt'
  ],

  selectionPriority: 20,
  fallback: true,

  specialPathId: 'marine_giant',
  milestoneId: 'marine_giant_inheritance'
}
```

Rules:

- `nodeId` is unique inside the track.
- First-layer roots have no `parentNodeIds`.
- Every later node lists one or more node IDs from the **immediately previous temporal layer**.
- `parentNodeIds` are OR reachability: any listed parent makes the node structurally reachable.
- Choice/Outcome-specific descent remains authored with ordinary History Conditions such as `hasChosen` / `hasOutcome`.
- A node can list parents from several pyramids: that is an explicit crossing.
- A branch cannot jump over a temporal layer.

### 16.4 Route-local fallback

The old “exactly one universal fallback per chapter” rule is removed.

Layer 1 keeps one generic fallback root once content exists.

From layer 2 onward, fallback is **route-local**:

- every node in the previous layer must be covered by exactly one reachable fallback continuation in the next layer;
- one fallback node may cover several previous nodes, creating a deliberate convergence;
- specialized descendants are evaluated first;
- fallback is used only when no specialized reachable descendant is eligible.

This prevents a special branch from deadlocking while allowing its bespoke portion to end and rejoin another pyramid.

### 16.5 Specificity priority

Among reachable, eligible non-fallback nodes, the highest `selectionPriority` wins. Default is `0`. Ties remain seeded-uniform.

This is not a weight.

Use it only to make a deliberately more specific authored association outrank a broader eligible node. Example:

```text
non-human Marine path       priority 10
Giant-specific continuation priority 20
```

A Giant can therefore receive the bespoke continuation instead of being diluted into the broader non-human pool.

### 16.6 Special association paths

Some combinations deserve a short bespoke sub-pyramid because One Piece world logic makes the intersection unusually meaningful.

These are **Special Association Paths**, not mandatory Cartesian coverage.

Example:

```text
Marine family
  + Giant
  + a specific earlier response
      -> Giant-only continuation(s)
      -> bespoke payoff
      -> milestone: marine_giant_inheritance
```

A Special Association Path:

- may begin from a Choice/Outcome inside a broader root;
- may own several personal nodes across later layers;
- may cross back into generic/family nodes;
- may terminate before Layer 15 by joining another route;
- may end on a unique Layer-15 inheritance node;
- must never be created merely because a combination is technically testable.

`specialPathId` is structural/authoring metadata. `milestoneId` marks a notable terminal node. Runtime can derive completed milestones from History; a future global Achievement system may map those milestone IDs to account-level achievements without adding Saga progress state to GameState.

### 16.7 Selection algorithm

For the first incomplete Family layer:

```text
track from inherited affiliation
-> previous layer node from History (none for Layer 1)
-> structurally reachable nodes
-> evaluate current eligibility / History
-> reachable eligible non-fallback nodes
-> keep highest selectionPriority
-> seeded-uniform tie break
-> if none: route-local fallback
```

Progress remains History-derived. Do not add `currentSagaNode`, `familySagaProgress`, `ArcState` or a quest counter.

### 16.8 Authoring breadth

The graph is expected to widen.

A mature Family Saga may still reach roughly **45–70 root nodes across all five layers** if those nodes represent materially different situations and crossings. This is not a quota.

The player starts only five Family Major roots in Childhood, but each lived root may unfold through an Immediate mini-arc before that root slot is finalized.

A graph fails review when:

- layers feel like unrelated subjects;
- descendants ignore prior lived nodes;
- every Origins combination receives its own copy;
- special combinations are decorative reskins;
- crossings erase callbacks/history;
- a previous-layer node has no safe continuation;
- a broad eligible node can randomly steal a deliberately authored high-specificity route.

<!-- D2.9_FAMILY_PRODUCTION_LOCK -->
## D2.9 — Family Saga production consequences, terminal rewards and Active handoff

Family Major Events may shape the character more strongly than ordinary Childhood filler. Typical meaningful Outcome packages may include `+2/-2`, `+2/-1`, `+2/-2/+1`, or `+2/+1/-1` across relevant player Stats when each change is justified by the Choice. Avoid purely positive multi-Stat packages. `±3` on one Stat remains exceptional.

NPC Relationship consequences may accompany those Stat packages when the Family relationship is directly at stake.

Every reachable Outcome of every Childhood Layer-5 Family node must grant at least one persistent gameplay reward: Item, Equipment, Trait, Companion/state unlock, Reputation, or another supported persistent asset. A `milestoneId` / future Achievement never counts as that gameplay reward.

Inherited Family affiliation remains historical origin and is never rewritten by Layer 5. A Layer-5 Outcome may determine the personal affiliation with which the character enters Active. For `family_marine`, an accepted Marine inheritance may start Active as `marine`; a rejected/deferred inheritance may start Active as `civilian`. Conflict with a Marine parent does not automatically imply rejection of the Marine institution, and affection for the parent does not automatically imply enlistment.

When Active begins directly in a ranked career, the entry state includes that career's first rank. Marine entry therefore begins at `marine_recruit`.

The runtime implementation of this handoff must occur at the Childhood → Active boundary rather than making unrelated remaining Childhood content treat the character as already professionally enlisted.

<!-- D2.10_FAMILY_MAJOR_MINIARC_LOCK -->
## D2.10 — Family Major node = mini-arc, not single-card beat

This amendment clarifies the narrative unit represented by a Family Major node.

### 17.1 Structural node vs lived story

A `majorTrack.nodeId` identifies the **structural root of one Family mini-arc** inside the layered DAG. It does **not** imply that the whole layer beat should resolve in one Event panel.

The normal production shape is:

```text
Major node / Layer beat
-> 1 Normal root carrying `majorTrack`
-> 1..N Immediate continuations
-> mini-arc resolution
-> later temporal layer
```

Only the Normal root carries `majorTrack` metadata and participates in `parentNodeIds`, route-local fallback coverage, `selectionPriority`, `specialPathId`, and `milestoneId`.

Immediate descendants are part of the same lived node. They do not receive another Major node ID and do not consume another Childhood root slot.

### 17.2 Expected depth

For production Family content:

- a meaningful specialized node normally resolves across **2–4 visible Event panels total**: one Normal root plus roughly 1–3 Immediate continuations;
- high-value crossings, fractures, Special Associations, and Layer-5 inheritance nodes should normally receive enough beats to feel like a short scene sequence rather than a single decision card;
- a route-local fallback may be shorter, including a single Normal root when deliberately appropriate, but must still be a concrete situation rather than filler;
- depth is driven by dramatic need, not a fixed panel quota.

The five guaranteed Childhood Family roots therefore mean **five guaranteed Family mini-arcs**, not merely five isolated cards.

### 17.3 Internal branching

Immediate descendants may branch, reconverge, contain DiceChecks, and queue further Immediate Events.

Example:

```text
Normal root
├─ Choice A
│  -> Immediate A1
│     ├─ Dice success -> Immediate A2
│     └─ Dice failure -> Immediate A3
├─ Choice B
│  -> Immediate B1
└─ Choice C
   -> Immediate C1
```

The mini-arc should end when the immediate dramatic situation has genuinely resolved.

Do not use `scheduleEvent` merely to create the next beat of the same scene. Use Immediate Events for zero-time scene continuation.

### 17.4 History carries the fine-grained route

The next temporal layer is structurally reachable through the previous Major root's `nodeId`, but its specialized descendants may additionally inspect **any History produced inside that node's mini-arc**.

Later eligibility may therefore use:

- `hasPlayed` on an Immediate descendant;
- `hasChosen` on a root or Immediate Event;
- `hasOutcome` on a root or Immediate Event;
- NPC state / Relationship changed during the chain;
- Traits, Items, Flags, or other persistent consequences when genuinely needed.

This is how two players who lived the same structural Major node can leave it on different narrative trajectories.

### 17.5 Consequence placement

Do not dump the entire Family consequence package onto the opening root by default.

Spread consequence where the fiction earns it:

- root Choice may establish intent;
- an Immediate confrontation may carry the DiceCheck;
- a later Immediate outcome may apply the strongest Stat / Relationship consequence;
- the final beat should leave a clear History signature for future layers.

A Family mini-arc as a whole should usually feel materially formative even if one or more individual panels are mechanically neutral.

### 17.6 Scheduled callbacks remain distinct

A Family mini-arc may still author a Scheduled consequence when the fiction requires a real delay after the scene.

That Scheduled Event is a **later callback**, not an internal beat required to make the current Major node feel complete. It must not be used as a substitute for Immediate scene development.

### 17.7 Breadth accounting

The existing estimate of roughly **45–70 Major root nodes** for a mature Family Saga counts structural mini-arc roots.

It does not count their Immediate descendants.

A complete mature Saga may therefore contain well over 100 EventDefinitions while a single run still starts exactly five Childhood Family Major roots and sees only the Immediate branches belonging to those five lived mini-arcs.

<!-- D2.11_FAMILY_SAGA_LESSONS -->
## D2.11 — Production lessons from Marine, Pirate and Royal

The first three integrated Family Sagas establish **multiple valid production shapes**, not a quality hierarchy.

- **Marine** demonstrates a deep multi-Immediate treatment and the high-yield `Marine × Giant` institutional-pressure association.
- **Pirate** demonstrates a broad, highly reactive Family DAG and the `Pirate × Fish-Man` coercion/consent association around aquatic capability.
- **Royal** demonstrates that a compact `1 Major root -> 1 shared Immediate resolution` pattern can carry a full-quality DAG when each scene is concrete. Its strongest long paths are **Royal × Orphan** and **Royal × Poor / Fallen House**; Fish-Man specialization is deliberately shorter and rejoins shared court/public nodes.

Event count, Immediate depth and authored volume are **not quality scores**. A node needs only the panels required for its dramatic situation. Quality is judged by continuity across the five ages, meaningful History callbacks, distinct lived Origins, concrete scenes, and a consequential inheritance resolution.

### Special Association discovery

Do not ask "which Race gets this Saga's special path?" Ask:

> Which Origins crossing most changes the lived family experience of this affiliation?

The answer may be Race, Family Structure, Social Class, current parent presence/state, Birth Location, a prior Family Outcome, or a compact combination. Special Associations are sparse authored pressure points, never a Cartesian matrix.

Validated examples now intentionally span different axes:

```text
Marine × Giant
Pirate × Fish-Man
Royal × Orphan
Royal × Poor / Fallen House
```

### Layer-5 handoff matrix

| Family track | Inherited identity after Childhood | Active entry at 180 months |
| --- | --- | --- |
| `family_civilian` | `civilian` | Civilian |
| `family_marine` | `marine` | Outcome-specific Marine + `marine_recruit` or Civilian |
| `family_pirate` | `pirate` | Outcome-specific Pirate or Civilian |
| `family_revolutionary` | `revolutionary` | Outcome-specific Revolutionary + `revolutionary_recruit` or Civilian |
| `family_royal` | `royal_family` | Civilian |

The inherited profile affiliation is never rewritten by this handoff.

### Inheritance diversity

The Layer-5 persistent consequence must follow the resolved story. Items, Equipment, Berrys, Reputation, durable NPC/access/network state, Traits and other supported assets are tools, not default templates.

A complete Saga that gives the same mechanical reward family to every terminal leaf is a production defect unless a future explicit authority documents an exceptional reason.
