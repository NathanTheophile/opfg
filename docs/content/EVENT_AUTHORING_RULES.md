# OPFG — Event Authoring Rules

> **Status: validated specialized content authority**
>
> **Scope:** rules for producing, reviewing, validating, and batching authored Events for OPFG V1.
>
> **Editorial revision B:** dramatic density, mobile readability, meaningful stakes, recurring cast, age coherence, and Situation → Reaction writing are hard authoring requirements.
>
> This document complements `docs/GAME_DESIGN.md` and `docs/content/CONTENT_BIBLE.md`. `GAME_DESIGN.md` remains the master gameplay authority; this document is authoritative for Event-production rules.

---

## 1. Purpose

OPFG V1 is content-driven. Once the runtime vocabulary is frozen, variety must come primarily from authored Events, Conditions, Effects, History, persistent NPCs, Traits, Locations, careers, powers, Immediate continuations, and Scheduled consequences.

This document exists so that many Event batches can be produced in parallel without design drift, duplicated concepts, uncontrolled IDs, inflated progression, context-blind geography, excessive canon fan-service, or disconnected random-card content.

## 2. Batch contract

### 2.1 Standard batch size

A standard production batch targets approximately **20 root Events**, plus any Immediate continuations, Scheduled consequences, and supporting metadata. Immediate and Scheduled Events created by those roots do **not** count against the 20-root target.

### 2.2 Batch specialization

Every batch must have a clear content domain. Examples: `CHILDHOOD_GENERIC_01`, `CHILDHOOD_FAMILY_01`, `ACTIVE_SEA_GENERIC_01`, `ACTIVE_PORT_TRADE_01`, `ACTIVE_PIRATE_01`, `ACTIVE_ALABASTA_01`, `ACTIVE_HAKI_AWAKENING_01`.

A batch should not attempt to cover the whole game at once.

### 2.3 Event IDs

Every Event ID must use a batch-specific prefix plus a descriptive slug, e.g. `ch_generic_01_lost_dog`.

IDs must remain stable, unique, lowercase, ASCII-safe, deterministic, and descriptive enough to audit later. Do not reuse or silently rename accepted IDs.

### 2.4 Mandatory batch manifest

Every batch must include a manifest containing at least:

- batch ID and scope/theme;
- root Event IDs;
- Immediate Event IDs;
- Scheduled Event IDs;
- existing persistent definitions used;
- Locations/tags/services used;
- Traits, NPCs, Items, careers and powers used;
- new persistent definitions proposed;
- dependencies on other batches;
- timeline/canon constraints.

New persistent definitions must be isolated under `PROPOSED_DEFINITIONS`. They are not automatically accepted.

### 2.5 Mandatory long-form narrative structures

Every standard batch of approximately 20 root Events must contain **at least** the following three categories of long-form narrative structures:

1. **at least one Signature Immediate Arc**: a root Event with at least one reachable branch containing **five consecutive Immediate Events** after the root;
2. **at least three Secondary Immediate Arcs**: three **different root Events**, each with at least one reachable branch containing **three consecutive Immediate Events** after the root;
3. **at least one Lifetime Thread**: a root Normal Event marked `lifetimeThreadSeed: true` that opens a substantial, branching long-form narrative built from vertically scheduled chapters.

For every qualifying Lifetime Thread used to satisfy the batch requirement:

- the hard reachable-path floor is **10 successive Scheduled chapters after the seed**;
- the longest meaningful reachable path should normally fall in the **10–20 Scheduled** range;
- **12–16 Scheduled on the longest meaningful path is the preferred ordinary target** when the premise supports that length;
- the complete authored Lifetime graph must contain **at least 20 distinct reachable Scheduled EventDefinitions**, counting alternative branches;
- **20 distinct reachable Scheduled EventDefinitions remains the hard acceptance floor**;
- for new production batches, the **preferred ordinary authored-breadth target is 24–30 distinct reachable Scheduled EventDefinitions** when the premise supports it;
- reaching the breadth target should come primarily from **alternative multi-chapter branches**, not from extending a single run's longest path;
- the graph must contain **at least two meaningful long-term divergence points** where different player Choices and/or Dice outcomes lead to different future Scheduled Event IDs;
- for new production batches, **3+ meaningful long-term divergence points are preferred** when they arise naturally and create real alternate lived histories;
- at least one major divergence must be structurally persistent: its branches must remain meaningfully distinct across multiple future chapters, terminate differently, transform the thread differently, or reconverge only after materially different consequences.

**Depth and authored graph size are separate metrics.** A thread may have a longest reachable path of 14 Scheduled chapters while containing 22 or 26 distinct reachable Scheduled EventDefinitions across all branches.

The seed root itself and any Immediate Events do **not** count toward the 20-Scheduled authored-graph minimum.

Unreachable, disconnected, dead-code or impossible Scheduled Events do not count toward authored graph size.

Ten remains the runtime/content acceptance floor for reachable depth; **20 distinct reachable Scheduled nodes and meaningful branching are authoring-production requirements**, not new GameState or schema concepts.

Do not pad a thread with repetitive callbacks merely to reach graph-size or path-depth targets. Do not create shallow cosmetic forks only to satisfy branching metrics.

These supporting Immediate/Scheduled Events are **in addition** to the approximately 20 root Events and never count toward the root target.

The required Signature Immediate Arc and the three required Secondary Immediate Arcs must use **distinct root Events**.
A depth-5 chain does not also satisfy any of the required depth-3 slots.

Additional Signature or Secondary Immediate Arcs are allowed and encouraged when narratively justified.

The Lifetime Thread may originate from one of the qualifying Immediate-arc roots only when that produces a genuinely coherent story. Do not force structures together merely to reduce Event count.

The batch manifest must explicitly identify:

- qualifying Signature Immediate Arc root ID(s);
- maximum reachable consecutive Immediate depth for each Signature Arc;
- qualifying Secondary Immediate Arc root IDs (at least 3);
- maximum reachable consecutive Immediate depth for each Secondary Arc;
- Lifetime Thread seed root ID(s);
- recurring persistent NPC(s) or other durable narrative anchor(s), if any;
- **longest reachable Scheduled depth** for each qualifying Lifetime Thread;
- **total number of distinct reachable Scheduled EventDefinitions in the complete Lifetime graph**;
- **meaningful long-term divergence count**;
- major authored branch points and the Choices/Dice outcomes that create them;
- major branch persistence / reconvergence structure;
- major early-termination branches;
- approximate intended age/time span;
- whether the thread is primarily `branching` or `strongly_branching`;
- whether the thread is designed to cross Childhood → Active.

## 3. Event scene structure

### 3.0 Core scene contract — Situation → Reaction

An OPFG Event is not a summary card. It is a **specific situation already happening** that requires a reaction from the player.

The default information order is:

```text
QUI
→ fait QUOI
→ OÙ / dans quel contexte concret
→ quel est le PROBLÈME ou l'ENJEU immédiat
→ le joueur RÉAGIT
```

The scene must normally begin **at the moment of friction**, not with background exposition.

Bad:

> Une tension inhabituelle semble s'être installée dans le quartier après plusieurs incidents récents.

Good:

> Rémy cache un pain sous sa chemise. Le boulanger vient de fermer la porte et commence à fouiller les enfants.

The second version gives a person, an action, a place/situation, an immediate threat, and therefore a reason to choose.

**Situation → Reaction is the default rhythm for Root, Immediate and Scheduled Events.**

### 3.0 bis Instant-comprehension contract

Before seeing the Choices, a player scanning the Event for approximately **two seconds** should be able to answer:

1. **Who is involved?**
2. **What is happening right now?**
3. **Why does it matter / what can go wrong?**

`WHERE` must also be clear whenever geography materially affects the situation. It may be inferred from the HUD/current Location when repeating the exact place name would be redundant, but the physical scene must remain spatially understandable.

If a reviewer cannot answer these questions without rereading the text, the Event requires rewriting.

### 3.0 ter Text budget

For ordinary production:

- standard Root Event body: **20–45 words**, normally **1–2 sentences**;
- ordinary Immediate/Scheduled body: **12–40 words**, normally **1–2 sentences**;
- ordinary Outcome text: **5–25 words**, normally **one sentence**;
- Choice label: normally **2–10 words**, beginning with a concrete intention/action where possible.

A major reveal, Signature scene, emotional climax or canon-heavy setup may exceed these targets, but **60 words / 3 sentences before Choices is a practical exceptional ceiling**, not a new default.

These are authoring targets, not runtime schema limits. Exceeding them must buy real information, emotion or dramatic clarity.

Do not spend the text budget explaining mechanics already visible in effects/UI.

### 3.1 Standard number of Choices

A normal Event should generally contain **3–5 Choices**.

### 3.2 One-Choice Events

An Event may contain one Choice only when it is genuinely a transition or consequence scene with no meaningful decision to make. Do not use one-Choice Events to disguise missing interaction.

### 3.3 Five or six Choices

Events may regularly reach **5–6 Choices** when extra options are justified by meaningful special approaches such as Race, Trait, Haki, Devil Fruit, career, crew role, ship or resource requirements.

Five or six Choices are acceptable when they remain readable and mechanically distinct. Avoid routinely exceeding six.

### 3.4 Choice identity

Choices must represent different player intentions, not cosmetic paraphrases of the same action.

A Choice label should communicate the player's intention **without requiring the body text to be reread**.

Prefer:

- `Mentir pour Rémy`
- `Le dénoncer`
- `Créer une diversion`
- `Partir avant l'orage`

Avoid:

- `Intervenir`
- `Faire quelque chose`
- `Réagir prudemment`
- `Choisir une autre approche`
- `Réfléchir à la situation`

Use verbs and concrete intentions. Do not prefix Choices with filler such as `Décider de`, `Essayer de`, or `Choisir de` unless grammatically necessary.

### 3.4 bis Choice-set diversity

A scene-specific Choice list must not collapse into a reusable default quartet such as **act / call an adult / move people away / do nothing**.

For every ordinary Event:

- at least **two Choices must be scene-specific enough that they could not be pasted unchanged into an unrelated Event**;
- vary player intentions across direct action, bargaining, bluffing, curiosity, improvisation, self-interest, protection, obedience, provocation, retreat, observation, social alignment, concealment, sabotage, exchange, or another premise-specific intention;
- `call/get an adult`, `wait`, `leave`, and `do nothing` are fallback intentions, not default mandatory slots;
- age-appropriate limited agency is not an excuse for generic wording: a very young child can point, imitate, hide, offer an object, cling, make noise, trade one object for another, stare, refuse, or copy someone;
- across a batch, repeatedly using the same three or four intention families is a rewrite signal even when the nouns differ.

**Transplant test:** if changing only the nouns would let the same Choice list fit several unrelated Events, the Choices are too generic.

### 3.5 Locked Choices

For V1, special or blocked Choices should normally remain **visible but disabled** through `availableIf`, especially for Race, Trait, Haki, Devil Fruit, career, crew-role, ship/resource, or understandable contextual requirements.

Use hidden Choices only when secrecy itself is narratively important.

### 3.6 Choice resolvability invariant

An Event must never be reachable or resolvable in a state where **all of its Choices are unavailable**.

For every Normal, Immediate, Scheduled and Critical Event, authors must guarantee one of the following:

1. at least one Choice has no `availableIf` and therefore remains available whenever the Event is resolved; or
2. the set of authored `availableIf` conditions is exhaustive across every state allowed by the Event's own eligibility/trigger/reach conditions.

Conditionally locked special Choices are encouraged where useful, but they must not eliminate the last valid action.

A large Event pool does not mitigate this defect: once a Normal Event is selected, or an Immediate/Scheduled/Critical Event is reached, that Event itself must remain resolvable.

During review, explicitly inspect conditional Choice partitions such as Trait/opposite-Trait, Race, Item, History, career, NPC state, ship state and geography. If exhaustiveness cannot be established confidently, provide an unconditional fallback Choice.

## 4. DiceCheck rules

### 4.1 Batch-level target

Approximately **40–50% of root Events** in a representative batch should contain at least one DiceCheck. This is a target for variety, not a runtime quota.

### 4.2 When a Stat is relevant

If the resolution of a Choice materially depends on one of the player's D20 Stats, use a DiceCheck rather than resolving that Stat-relevant action deterministically.

Do not mention or invoke a Stat merely to justify adding a roll. The scene must first contain a genuine uncertain action.

### 4.3 Difficulty grid

| Difficulty | Success threshold |
|---|---:|
| Easy | 8 |
| Standard | 11 |
| Difficult | 14 |
| Very difficult | 17 |

### 4.4 Critical results

`criticalSuccess` and `criticalFailure` should generally produce more pronounced consequences than normal success/failure.

### 4.5 Trait/Dice interaction

Traits may affect a DiceCheck only when the specific DiceCheck explicitly authors that interaction. Do not create universal Trait bonuses.

## 5. Mechanical stakes and effect scale

### 5.0 Stakes are mandatory when the fiction promises risk

A dangerous, confrontational, competitive, criminal, social or otherwise uncertain scene must be capable of producing a **meaningful downside**.

The playtest failure pattern to avoid is:

```text
success → +1
failure → +0
criticalFailure → +0 or cosmetic text
```

If an action is risky enough to justify a DiceCheck, ordinary `failure` must normally cost or worsen **something the player can care about**.

Valid costs include, depending on context:

- Health;
- Berrys or another resource;
- Reputation or bounty consequence;
- NPC Relationship;
- loss of an opportunity;
- a worse Scheduled branch;
- a persistent NPC status change;
- ship damage / travel complication;
- Trait or other existing persistent state where genuinely justified;
- being forced into a more dangerous Immediate situation.

A failure may be mechanically neutral only when **the missed opportunity itself is clearly meaningful** and the player receives no compensating positive reward.

`criticalFailure` should be visibly worse than ordinary failure unless the scene has an exceptional authored reason.

### 5.0 bis No automatic positivity

OPFG is not a treadmill where every Event increases the character.

An ordinary conflict/challenge Root where **every reachable branch only gives positive Stats/resources/reputation** should normally be rejected or redesigned.

Good Events may contain:

- benefit versus cost;
- loyalty versus safety;
- money versus relationship;
- immediate victory versus future trouble;
- safe retreat versus lost opportunity;
- success with collateral cost;
- two valid choices that protect different things.

Pure reward, recovery, celebration and milestone Events are valid when the fiction explicitly makes them reward scenes. They must not become the baseline.

### 5.1 Player Stats

Typical Stat change:

- **±1 to ±2 normally**;
- **±3 exceptionally**.

V1 Events should not give ±4 or ±5 Stat changes in one Outcome.

Stat gain is not required merely because the Event was resolved successfully.

### 5.2 Multiple Stats

An Outcome may modify multiple Stats, but should generally affect **no more than two**.

Do not use several small positive Stat changes as a substitute for a meaningful narrative consequence.

### 5.3 Reputation

| Narrative scale | Reputation change |
|---|---:|
| Minor act | ±1 to ±2 |
| Notable act | ±3 to ±5 |
| Exceptional major event | ±6 to ±10 |

Reputation measures notoriety quantity, not morality.

### 5.4 NPC Relationship

| Narrative scale | Relationship change |
|---|---:|
| Ordinary meaningful interaction | ±3 to ±5 |
| Major personal event | ±8 to ±15 |

A Relationship change should identify a relationship the player has reason to remember. Avoid spending persistent relationship mechanics on characters who will never matter again.

### 5.5 Berrys

Berry values remain authored per Event. Batches must remain internally coherent, but V1 does not require a universal economic simulation.

### 5.6 Consequence readability

Outcome prose states **what happened in the fiction**. Mechanical chips/UI state what changed numerically.

Good:

> Rémy file par la fenêtre. Le boulanger te reconnaîtra.

Then UI/effects may show:

```text
Rémy +10 · Réputation locale -3
```

Do not restate every numeric effect inside the Outcome sentence.

## 6. Trait authoring

### 6.1 Trait acquisition frequency

Traits are persistent identity changes and must remain relatively rare. Grant a Trait only when the Event genuinely expresses a durable change in personality, behavior, worldview, or recurring capability.

### 6.2 Deterministic Trait acquisition

A Trait may be granted directly by a deterministic Choice. A DiceCheck is not required.

### 6.3 Opposed Traits

A player must **never be allowed to acquire a Trait while already possessing its defined opposite**.

The Event must make the incompatible acquisition unavailable or otherwise impossible. Do not author an Event that relies on silently replacing one opposite Trait with the other.

### 6.4 Traits in DiceChecks

Traits may modify or override a DiceCheck only when the specific situation explicitly justifies that Trait.

## 7. Items, Flags, and persistent information

### 7.1 New Items

A batch must not silently create a new persistent Item. Any new Item goes into `PROPOSED_DEFINITIONS` for review.

### 7.2 Flags

Flags are a last resort. Before creating a Flag, check whether the information is already representable through History, `hasPlayed`, `hasChosen`, `hasOutcome`, Traits, NPC state, Items, career state, ship state, or another existing persistent state.

### 7.3 One-use narrative memory

If a future Event only needs to know what happened in one prior Event, prefer `hasChosen` or `hasOutcome` over creating a dedicated Flag.

## 8. Persistent NPC and recurring-cast rules

Every persistent NPC who actually participates in a scene must be listed in that Event's `cast`. This metadata does not change NPC status or relationship; it records the interaction date automatically and supports recurrence Conditions. An NPC merely referenced or tested by a Condition need not be cast unless directly participating in the scene.

### 8.1 Recurring cast is preferred over anonymous emotional stakes

When a scene asks the player to care about a person, **reuse a person the player can remember whenever plausible**.

Prefer:

> Rémy hasn't eaten since yesterday. He watches your bread without asking.

over:

> A hungry child watches your ration.

The anonymous version is valid only when anonymity is the point or the character is genuinely disposable.

Childhood, Family, Social, Crew, Rival, Mentor and long-form content should actively build a **small recurring cast**, not a procession of interchangeable strangers.

### 8.2 When an NPC deserves persistence

Create or propose a persistent NPC only when that character can materially matter after the current scene, for example by returning later, carrying a relationship, joining the crew, becoming a passenger, dying persistently, becoming unavailable/departed, carrying a Scheduled consequence, or participating in a mini-arc.

A proposed persistent NPC should normally have **at least three meaningful authored touchpoints** across Root, Immediate and/or Scheduled Events, unless one exceptional appearance produces a genuinely permanent consequence.

### 8.3 Cast economy

Do not solve memorability by inventing dozens of names.

A strong batch normally prefers:

```text
1 recurring NPC used meaningfully 4 times
```

over:

```text
4 unrelated NPCs used once each
```

The existing normal ceiling of approximately **2–3 new persistent NPC proposals per batch** remains. Reuse accepted NPCs before proposing new ones.

For relationship-heavy batches, the manifest must identify the **recurring cast anchors** and list where they return.

### 8.4 Throwaway characters

Throwaway characters should remain anonymous, role-named, or locally named only when they are genuinely functional:

- guard;
- shopkeeper;
- passer-by;
- sailor in the background;
- one-scene opponent whose identity will never matter.

Do **not** give the emotional center of a scene to `un enfant`, `un marin`, `une femme`, `un homme`, `quelqu'un` when an established recurring character can carry the same role more effectively.

### 8.5 Callback recognition

When a recurring NPC or prior choice returns, the callback should be recognizable **immediately**.

Prefer:

> Rémy is waiting behind the same bakery. This time, the bread is for his little sister.

Avoid:

> Someone from your past appears again and reminds you of an earlier incident.

Use the person's name early. Recall the prior cause with one concrete detail rather than a paragraph of exposition.

### 8.6 Major canon NPCs

Major canon characters must remain rare. A major canon meeting requires plausible player age, valid timeline, plausible geography, valid character status, a real narrative/gameplay reason, and no contradiction with protected canon outcomes.

Do not use major canon characters as ambient fan-service.

Recognizable original recurring NPCs are the ordinary solution for emotional continuity; famous canon characters are not.

## 9. Immediate continuations and mini-arcs

### 9.1 Ordinary chain length

Outside the mandatory long-form Immediate arcs, a root Event should normally lead to **1–3 Immediate Events**.

### 9.2 Mandatory Signature Immediate Arc — depth 5

Every standard batch must contain at least **one root Event** with a reachable narrative path of **five consecutive Immediate Events after the root**.

Conceptually:

```text
Root A
→ Immediate 1
→ Immediate 2
→ Immediate 3
→ Immediate 4
→ Immediate 5
```

Five is the V1 production target for this signature structure. A branch may terminate earlier when a player choice genuinely ends the scene, but at least one complete reachable path must attain depth 5.

This exception exists to create regular substantial same-scene mini-arcs. Do not turn every Event into a five-scene chain.

### 9.3 Mandatory Secondary Immediate Arcs — 3 × depth 3

Every standard batch must also contain **at least three Secondary Immediate Arcs**, each rooted in a **different root Event** and each containing at least one reachable path of **three consecutive Immediate Events after the root**.

Conceptually:

```text
Root B
→ Immediate 1
→ Immediate 2
→ Immediate 3

Root C
→ Immediate 1
→ Immediate 2
→ Immediate 3

Root D
→ Immediate 1
→ Immediate 2
→ Immediate 3
```
The three Secondary Immediate Arcs must use three distinct root Events.

None of those roots may reuse the Signature Immediate Arc root.

The depth-5 Signature Immediate Arc does not count toward any of the three depth-3 Secondary Immediate Arc requirements.

Each Secondary Immediate Arc must satisfy the same interaction and narrative-quality rules as other Immediate chains: every Immediate must contain a meaningful player decision, uncertainty, discovery, or narrative/tactical change rather than functioning as a simple continue screen.

Branches may terminate earlier when a player choice genuinely ends the scene, but each Secondary Arc must contain at least one complete reachable path attaining depth 3.

The goal is to make substantial multi-scene situations frequent enough to shape ordinary runs while keeping most root Events concise and self-contained.

The first three qualifying Secondary Immediate Arcs establish the minimum batch requirement. Additional depth-3 or deeper Immediate arcs are allowed and encouraged when narratively justified.

### 9.4 Immediate meaning

Immediate means the same continuous scene. Use it for a continuing confrontation, search, revelation, conversation or short sequence without meaningful time passing.

### 9.5 Immediate must remain interactive

Every Immediate in any mandatory Immediate arc must still contain a meaningful player decision, uncertainty, discovery or tactical/narrative change. Do not satisfy the depth requirement with `continue` screens or cosmetically different non-decisions.

Branches inside the arcs are encouraged. Different choices may alter later Immediate eligibility, consequences, relationships, Traits or the ending of the scene.

### 9.6 Slot/time contract

The root Normal/Scheduled Event and its complete Immediate chain consume **one slot total**. Immediate Events do not advance biological time.

Critical retains priority and may interrupt a chain before it resumes.

### 9.7 Ellipses

As soon as the fiction contains a meaningful delay — days, months, years, recovery time, waiting, travel that cannot plausibly belong to the same continuous scene, or a consequence resurfacing later — use Scheduled rather than Immediate.

## 10. Scheduled consequences

### 10.1 Root-level target frequency

Approximately **15–25% of root Events** in suitable batches should create a meaningful Scheduled consequence. This percentage concerns roots that initiate future causality; the many descendant chapters of a Lifetime Thread do not count as additional roots.

### 10.2 Delays

Prefer narratively legible delays: months, years, or meaningful age thresholds. Avoid arbitrary delays used only to randomize timing.

For Lifetime Threads, spacing must feel biographical rather than like a quest log firing every slot.

The authored storyline should normally span **many years**, target roughly **10+ years of possible life**, and include multiple gaps measured in years rather than only adjacent months.

Chapter count, calendar span, longest-path depth, and complete authored-graph size are separate concerns.

For a qualifying Lifetime Thread:

- hard reachable-path floor: **10 Scheduled chapters**;
- normal longest meaningful path: **10–20**;
- preferred ordinary longest path when justified: **12–16**;
- complete authored graph: **20+ distinct reachable Scheduled EventDefinitions** hard floor; **24–30 preferred for new production batches** when branching naturally supports it.

Do not artificially compress a story to exactly 10 chapters merely because 10 satisfies the runtime floor.

Do not pad a finished story with filler callbacks merely to reach 20 total nodes, 15 nodes on one path, or any other numerical target.

### 10.3 Context on return

A Scheduled Event may depend strongly on the state that exists when it becomes due. Use the existing system properly:

- temporarily impossible → remain pending;
- permanently invalidated → `cancelIf`;
- alternate consequence needed → fallback where appropriate.

### 10.4 Recall the cause

Scheduled consequences should generally make the originating decision recognizable. The player should be able to understand that the later event happened because of something they did earlier.

### 10.5 Mandatory Lifetime Thread per batch

Every standard batch must contain at least **one Lifetime Thread seed root**.

The seed must:

- be `kind: "normal"`;
- declare `lifetimeThreadSeed: true`;
- initiate a coherent long-form narrative rather than merely scheduling an unrelated reminder;
- have at least one reachable authored path containing **10 or more successive Scheduled chapters** after the seed;
- lead to a complete authored graph containing **at least 20 distinct reachable Scheduled EventDefinitions**;
- contain **at least two meaningful long-term divergence points** in the authored graph;
- be recorded explicitly in the batch manifest.

### Path depth target

**Depth 10 is a floor, not the normal production target.**

A substantial Lifetime Thread should generally contain a longest meaningful reachable path of approximately **10–20 Scheduled chapters**.

For ordinary production, authors should normally aim around **12–16 Scheduled chapters on the longest meaningful path** when the premise supports that amount of development.

Exact depth 10 is fully valid when the story reaches a natural conclusion there, but batches should not systematically stop every Lifetime Thread at exactly 10 merely because that is the minimum reachable depth.

Threads approaching or exceeding 20 chapters on one path are valid when their narrative evolution genuinely supports that scale.

### Complete graph size target

The **complete authored Lifetime graph** must contain **at least 20 distinct reachable Scheduled EventDefinitions**, counting all alternative branches reachable from the seed.

This graph-size minimum counts Scheduled EventDefinitions, not:

- the seed root;
- Immediate Events;
- repeated visits to the same Event ID;
- unreachable or disconnected EventDefinitions.

The hard acceptance floor remains **20 total reachable Scheduled EventDefinitions**. For new production batches, the preferred ordinary target is **24–30 total reachable Scheduled EventDefinitions** when the premise supports it. More is allowed when justified, but avoid uncontrolled combinatorial growth. A thread at 20–23 nodes remains valid when extra branches would be filler rather than meaningful alternatives.

A thread with a longest path of 14 and 24–30 total reachable Scheduled nodes is therefore especially desirable: one run may experience roughly 14 chapters while another run experiences a materially different 14-chapter route through the same larger authored graph. **Once the longest meaningful path is already in the preferred 12–16 range, increase breadth before depth.**

A Lifetime Thread should preferably be anchored by a persistent relationship, recurring person, rival, mentor, family member, organization contact, long-term obligation, mystery, evolving personal commitment or comparable durable narrative subject.

When a persistent NPC is used, it counts against the normal persistent-NPC proposal budget.

### 10.5 bis Breadth-first production preference

For new production batches, once a Lifetime Thread already has a coherent longest meaningful path in the preferred **12–16 Scheduled** range, additional authored volume should preferentially increase **breadth rather than depth**.

Preferred pattern:

- preserve the existing lived path length;
- add alternate Scheduled branches at meaningful Choices or Dice outcomes;
- let those alternatives remain distinct for multiple chapters, terminate differently, transform the thread differently, or reconverge only after materially different consequences;
- target roughly **24–30 distinct reachable Scheduled EventDefinitions** across the complete graph when natural;
- prefer **3+ meaningful long-term divergence points** when the premise supports them.

Do **not** extend a 14-chapter lived path to 18 merely to increase graph size if the same replayability can be created through alternate 2–4 chapter branches. Conversely, do not invent branch-only filler: every extra Scheduled node must represent a materially different lived consequence.

A useful heuristic is: **when below the preferred breadth target, widen an existing or new meaningful split before adding another chapter to the common trunk.**

### 10.6 Vertical and branching scheduling

A Lifetime Thread must be authored **vertically**.

A chapter normally schedules only the next consequence or consequences that result from the chapter that has just been resolved.

Do **not** enqueue an entire future Lifetime Thread from the seed root.

Basic vertical structure:

```text
Seed root
  ↓
Scheduled 1
  ↓
Scheduled 2
  ↓
...
```

However, **a purely linear S1 → S2 → S3 → ... chain does not satisfy the normal authoring expectation for a qualifying Lifetime Thread**.

### Mandatory long-term divergence

A qualifying Lifetime Thread must contain **at least two meaningful long-term divergence points** in its complete authored graph. For new production batches, **3+ meaningful long-term divergences are preferred** when they can be authored without cosmetic branching.

A divergence point counts when different Choices and/or Dice outcomes schedule **different future Scheduled Event IDs** whose consequences are materially different.

Example:

```text
Scheduled 3
├─ Choice A
│   └─ Outcome A → Scheduled 4A
│
├─ Choice B
│   └─ Outcome B → Scheduled 4B
│
└─ Choice C
    └─ Outcome C → thread ends
```

Dice outcomes may also produce genuine divergence:

```text
Scheduled 6
└─ risky Choice
    ├─ criticalFailure → Scheduled 7D
    ├─ failure         → Scheduled 7B
    ├─ success         → Scheduled 7A
    └─ criticalSuccess → Scheduled 7C
```

A branch does **not** count as meaningful merely because one alternate node immediately rejoins the same next chapter with no lasting difference.

At least one of the qualifying divergence points must produce branches that do one or more of the following:

- remain distinct across **at least two successive Scheduled chapters after the split**;
- terminate at materially different moments or endings;
- transform the recurring relationship, objective or premise differently;
- create persistent state/history differences that materially alter later chapters;
- reconverge only after the branches have produced materially different consequences.

Branches may later reconverge when that convergence is narratively credible.

Example:

```text
                   → S4A → S5A → S6A ─┐
S1 → S2 → S3 ────→                     ├→ S7 → S8...
                   → S4B → S5B ────────┘
```

A later second divergence can then create another durable difference:

```text
S8 → S9
      ├→ S10A → S11A → S12A → ...
      └→ S10B → S11B → ...
```

### Branching quality

Different player intentions should regularly produce different long-term futures when the fiction supports that distinction.

Do not make every Choice cosmetic and then schedule the same next chapter.

Do not create artificial forks solely to increase node count.

Avoid uncontrolled combinatorial explosion. A small number of strong, persistent divergences with credible reconvergence is preferable to dozens of shallow branches.

The hard reachable-depth minimum still concerns one coherent path: at least one path must reach Scheduled depth 10. Other branches may end earlier when the player's decision genuinely ends or transforms the story.

The complete authored graph-size minimum concerns all reachable Scheduled nodes across all branches: **20 distinct reachable Scheduled EventDefinitions minimum**. For new production, **24–30 is the preferred ordinary breadth target** when it can be reached through meaningful alternate branches.

### 10.7 Agency, death and thread termination

The runtime guarantee concerns **starting** a Lifetime Thread, not forcing it to continue forever.

A thread may end, transform or fork because the player:

- rejects the relationship;
- betrays or abandons the recurring character;
- causes or witnesses a death;
- joins an incompatible organization;
- moves into a genuinely incompatible state;
- reaches a narratively final resolution.

Use `hasChosen`, `hasOutcome`, NPC state, Traits, Items, career state, geography, `cancelIf` and fallback before inventing a dedicated Flag.

A recurring NPC must not be magically teleported across the world. Physical reunions must respect geography; letters, rumors, organization channels or other remote consequences may use broader Scheduled reach when narratively justified.

Early termination is not a failure of authoring when it is the direct consequence of meaningful player agency.

A Lifetime Thread with a longest path of 15 chapters may legitimately contain branches that end at chapter 4, 7 or 11 because the player rejected, betrayed, solved, abandoned or fundamentally transformed the underlying relationship/problem.

Do not keep a dead narrative branch alive merely to preserve chapter count.

### 10.8 Childhood run guarantee

The complete Childhood corpus must guarantee that every run reaching Active has initiated at least one Lifetime Thread.

Runtime selection contract:

- before `ageMonths = 120`, seeds behave as ordinary Normal Events;
- at the first Childhood **Normal-selection opportunity** with `ageMonths >= 120`, if History contains no played Event marked `lifetimeThreadSeed: true`, select seed-uniformly among currently eligible Lifetime Thread seeds instead of the ordinary Normal pool;
- Critical, Immediate and due Scheduled Events keep their existing priority;
- after one seed has been played, no further special preference exists;
- if the checkpoint has no eligible seed, the game must not crash, but validation/simulation must surface a narrative-guarantee failure.

At least one broadly eligible Lifetime Thread seed in the assembled Childhood corpus must therefore cover the guarantee checkpoint for every valid Origins profile/location. Contextual seeds are still encouraged in addition to that safety coverage.

No persistent `threadId`, `arcState`, quest state or chapter counter is allowed solely to implement this guarantee. Started-state is reconstructed from History plus Event metadata.

### 10.9 Lifetime Thread quality bar

Raw chapter count, raw graph size and raw branch count are not sufficient by themselves.

A Lifetime Thread must visibly evolve, and its later state should reflect what the player actually did earlier.

Across its surviving branches, change several of the following over time:

- relationship;
- character age/status/responsibility;
- worldview or knowledge;
- location or organization context;
- stakes;
- player identity/career;
- recurring character goals;
- consequences of earlier Choices;
- the meaning of the original conflict, promise, mystery or relationship.

A thread should not merely contain 20+ authored nodes. Those nodes should create **different possible life trajectories**.

Player Choices made inside the thread should regularly affect later chapters. When materially different Choices all schedule the exact same next chapter, authors should ask whether a genuine branch would better preserve agency.

A qualifying Lifetime Thread must therefore satisfy all three dimensions:

1. **lived depth** — at least 10 reachable Scheduled chapters on one path, normally 10–20 and often 12–16;
2. **authored breadth** — at least 20 distinct reachable Scheduled EventDefinitions across the whole thread graph; **24–30 preferred for new production** when meaningful branching supports it;
3. **meaningful topology** — at least two genuine long-term divergence points, with at least one persistent split as defined in §10.6.

Do not write ten near-identical “the same person visits again” scenes.

Do not turn a 20-node graph into twenty cosmetic variants of the same callback.

Do not inflate a natural 11-chapter story into 18 chapters with filler.

Do not reduce a story that clearly has material for 15 chapters to exactly 10 merely to satisfy the minimum.

Do not create extra branches that exist only to satisfy the 20-node authored-graph minimum.

## 11. Locations, tags, and services

### 11.1 Generic geography

For reusable Events, prefer semantic context over enumerating Location IDs.

Examples: `locationHasTag('forest')`, `locationHasTag('port')`, `locationHasTag('criminal')`, `locationHasService('trade')`, `locationHasService('medical')`, `locationHasService('black_market')`.

### 11.2 Trade and services

Commerce-related Events must use the relevant Location service. Generic trade uses `trade`, medical treatment uses `medical`, weapon purchase uses `weapons`, ship repair uses `ship_repair`, and illegal trade uses `black_market`.

### 11.3 `locationIs`

Use `locationIs` when the exact identity of the place matters. Do not enumerate every forest, port or market manually when a tag/service already represents the requirement.

### 11.4 Strongly contextual batches

A location-specific batch may naturally use many `locationIs` Conditions, e.g. `ACTIVE_ALABASTA_01`.

### 11.5 Childhood geography and Birth Location reachability

Childhood has no free navigation loop and does not use the Active dead-end travel fallback. A standalone Childhood root must therefore be reachable from the player's actual Childhood location, which normally remains the Birth Location selected during Origins unless an explicitly authored causal sequence has moved the player.

For Childhood authoring and review:

- do not gate a standalone root with `locationIs` on a non-Birth Location and assume the player can simply travel there;
- when using `locationWithin(parentLocationId)`, verify that at least one valid Birth Location can satisfy the condition and that the scene text remains true for every Birth Location descendant that may make the Event eligible;
- do not broaden eligibility to a parent/region while keeping narration that requires a more specific sub-location, unless that specific place is only flavor and does not contradict the eligible states;
- tag/service-gated Childhood roots must be checked against the real tags/services of the 32 Birth Locations, not against the wider 188-Location World V1 catalogue;
- do not rely on Active navigation, future movement, or dead-end fallback to make a Childhood root reachable.

Batch review must include a Birth Location coverage pass for geography-sensitive Childhood roots. An Event that is structurally valid but unreachable from every valid Birth Location is a content coverage defect.

## 12. Travel and world progression

### 12.1 Routine navigation versus authored movement

Routine V1 navigation in the four Blues is handled by the monthly navigation flow: a Leader with a ship may choose an accessible destination and the current `locationId` changes accordingly. Paradise ordinary progression follows the available forward route graph.

Authored Events should therefore use `moveToLocation` for **exceptional, forced or narratively meaningful movement** — diversion, escape, rescue, capture, transport, special passage — not to imitate routine navigation.

Event narration must use the **current** Location/Sea. Do not keep writing the player's Birth Location as their physical location after they have travelled, and do not treat `originSeaId` as the current sea.

### 12.2 Grand Line entry

Entering Grand Line should be a significant transition or mini-arc, not a trivial one-click move. It may depend on navigation, crew, ship, career, preparation, risk-taking, or prior Events.

### 12.3 Progression structure

World progression should be **semi-structured**: important passage points may exist, routes and detours can vary, careers may reach regions differently, and the player should not be forced through one exact canon itinerary.

### 12.4 Long-distance teleportation

Generic Events must not move the player across distant regions without strong narrative justification.

## 13. Career Event rules

### 13.1 Careers coexist with the world

Career Events must mix with generic and contextual content. Do not create isolated career tracks disconnected from travel, crew, relationships, geography, powers, or consequences.

### 13.2 Promotions

Promotion always occurs through a dedicated narrated Event. Meeting a Reputation threshold only makes the relevant Event plausible/eligible. It never promotes automatically.

### 13.3 Pirate bounty cadence

For Pirates, bounty/progression Events become plausible roughly every **9 Reputation points** when narratively justified. This is an authoring cadence, not an automatic engine threshold.

### 13.4 Civilian career

Civilian is a full trajectory, not filler. Civilian content can support merchant, explorer, doctor, navigator, local notable, scholar, craftsman, community figure, and other non-organizational lives through Events and titles.

## 14. Devil Fruits and Haki

### 14.1 Devil Fruit acquisition

Obtaining a Devil Fruit must be rare and memorable. It may be a major Event, mini-arc, dangerous discovery, valuable object, theft, reward, or high-stakes opportunity.

Do not hand out Fruits as routine random loot.

### 14.2 Fruit usage Events

Most Fruit content should be reusable through type/tag Conditions. Use exact Fruit IDs only when the Fruit's specific behavior matters materially.

### 14.3 Haki awakening

Haki `0 → 1` must occur through a meaningful Event and respect the existing Conditions. Do not grant initial Haki casually through routine training text.

### 14.4 Haki after awakening

Do not flood the game with Events whose only purpose is to increment Observation/Armament Haki tiers. The existing threshold synchronization handles later progression. Events should focus on awakening, important demonstrations, narrative mastery moments, and Conqueror progression where explicitly authored.

## 15. Canon authoring

### 15.1 Contextual canon target

Across the game, target approximately **25–35% strongly contextual/canon-adjacent content**. The majority should remain reusable/original world content.

### 15.2 Major manga events as background

A major canon event may serve as context or background if the player remains peripheral to the protected central outcome, timeline and geography are respected, the player does not replace the canon protagonists, and the result of the arc is not rewritten.

### 15.3 Major canon character meetings

A major canon character should appear only when there is a real narrative/gameplay reason. Do not insert famous characters merely to increase recognizability.

## 16. Narrative quality rules

### 16.1 Pure narrative Events

Pure narrative Events are allowed. They do not need to grant a numeric or persistent reward if they materially build personality, relationships, atmosphere, life history, setup, payoff, meaningful choice, or a memorable scene.

Pure narrative does **not** mean vague atmosphere. It still needs a concrete scene, person, revelation, decision, joke, conflict or emotional beat.

### 16.2 Meaningful Event requirement

An Event does not always need to mutate GameState, but it must create at least one meaningful contribution: information, relationship, decision, characterization, setup, payoff, atmosphere with narrative value, or a memorable life moment.

The author should be able to finish this sentence:

> **This Event matters because…**

If the answer is only `it gives +1 Stat`, the Event is not yet strong enough.

### 16.3 Anti-reskin rule

Do not duplicate an Event structure and merely change the decoration. A reskin is acceptable only when Conditions, Choices, consequences, context, or future implications materially change the experience.

### 16.4 Dramatic density

The target is **maximum dramatic information per word**, not literary compression for its own sake.

Every sentence should preferably do at least one of the following:

- identify a person;
- show an action;
- reveal a concrete object/fact;
- establish immediate danger/opportunity;
- change the player's understanding;
- create a reason to choose.

Delete sentences that merely announce that a situation exists.

Bad:

> Une situation tendue se développe dans le port et plusieurs personnes semblent inquiètes.

Good:

> Mara has your stolen compass in one hand. Two dock guards are walking straight toward her.

The second version is shorter **and contains more usable information**.

### 16.5 Concrete-language rule

Prefer **specific nouns + active verbs**.

Prefer:

- `Rémy vole`
- `Mara bloque la porte`
- `la corde casse`
- `le Marine reconnaît ton pavillon`
- `trois caisses prennent feu`

Avoid defaulting to abstract/administrative phrasing such as:

- `une situation se présente`;
- `une tension apparaît`;
- `certaines personnes`;
- `plusieurs habitants semblent`;
- `un problème survient`;
- `la situation se complique`;
- `les choses prennent une tournure`;
- `une opportunité se présente`;
- `il semble que`;
- `il paraît que`;
- `quelque chose attire ton attention`.

These phrases are not globally forbidden when uncertainty itself matters, but they are a **rewrite signal**.

### 16.6 No redundant explanation

Do not explain an emotion already shown by an action.

Weak:

> Rémy est très inquiet et a peur que le boulanger le découvre.

Stronger:

> Rémy serre le pain contre sa poitrine quand le boulanger verrouille la porte.

Do not summarize the moral meaning of a choice before the player makes it.

Do not explain numeric consequences that the UI already displays.

### 16.7 Outcome density

An Outcome should answer:

> **What happened because I chose that?**

Prefer one concrete sentence.

Good:

> Rémy s'échappe par la fenêtre. Le boulanger mémorise ton visage.

Weak:

> Ton intervention a des conséquences mitigées sur les personnes impliquées.

For delayed consequences, the current Outcome may intentionally leave uncertainty, but something observable should still change now.

### 16.8 Age-coherence / agency contract

Review every Childhood Event against the **youngest age that can actually reach it**, not the age the author vaguely imagines.

Ordinary agency expectations:

| Age | Plausible default agency |
|---|---|
| 1–3 | observe, attach, share/refuse, imitate, cry/call, hide or hand over a small object, choose whom to trust |
| 4–7 | lie, hide, run, fetch an adult, distract, sneak locally, warn someone, small physical intervention |
| 8–11 | broader local independence, climbing, simple rescue/theft, defending a peer, following someone, taking manageable physical risks |
| 12–14 | substantial adolescent autonomy, dangerous errands, serious confrontation, preparation for sea/career where context supports it |
| 15+ | full Active agency subject to Stats, Race, career, equipment and situation |

A six-year-old should not casually overpower an adult, command a crew, survive implausible travel alone, or physically interpose against an armed criminal as if they were an adult protagonist.

Race, Traits, extraordinary context or explicit adult assistance may justify exceptions, but the Event must make the justification visible.

### 16.9 Phone-scan test

Human review must include a mobile-speed pass.

For each ordinary Event, ask:

1. Can the situation be understood on first scan?
2. Can the meaningful difference between Choices be understood without rereading?
3. Is there a person/object/problem the player can picture?
4. Would removing one sentence lose real information?

If question 1 or 2 is `no`, rewrite.

If question 4 is `no`, delete the sentence.

### 16.10 Tone

Target an adventurous One Piece-like tonal range: light, strange, funny, warm, tense, occasionally tragic, and occasionally epic. Do not write every Event as maximal drama or prophecy.

Direct writing does **not** mean every scene is grim. Comedy also benefits from concrete setup and fast payoff.

### 16.11 French voice

For French source localization, **prefer singular informal address (`tu`, `te`, `toi`, `ton`, `ta`, `tes`)** in narrative text and Choices that address the player directly.

Text that does not address the player directly remains naturally free. Dialogue spoken by characters to the player should also follow the character, relationship, situation, and social register: a character may therefore use either `tu` or `vous` when appropriate.

Do not mechanically normalize pronouns or possessives solely to match the player's address form when their grammatical referent is different.

## 17. Batch variety rules

A batch should not collapse onto one repeated mechanical solution. During review, check distribution across different D20 Stats, deterministic vs Dice Choices, generic vs contextual Events, pure narrative vs mechanical Events, relationships, Traits, resources, careers, locations/services, Immediate chains, and Scheduled consequences.

Avoid batches where nearly every challenge is Strength, every success gives Reputation, every Event creates a new NPC, every Event grants a Trait, every Event is a DiceCheck, every Event is a merchant encounter, or every Event ends with no future consequence.

## 18. Batch validation and acceptance

### 18.1 Acceptance criteria

A batch is accepted only after:

1. schema/content validation;
2. reachability/simulation check;
3. quick human review;
4. verification that at least one Signature Immediate Arc has a reachable depth-5 path;
5. verification that at least three Secondary Immediate Arcs use distinct roots, all distinct from the required Signature root, and each has a reachable depth-3 path;
6. verification that at least one Lifetime Thread has a reachable Scheduled depth of at least 10;
7. verification that every qualifying Lifetime Thread used to satisfy the batch requirement is vertically scheduled rather than pre-queuing its full future chain;
8. verification that every qualifying Lifetime Thread has **at least 20 distinct reachable Scheduled EventDefinitions** in its complete authored graph;
9. verification that every qualifying Lifetime Thread contains **at least two meaningful long-term divergence points**;
10. verification that at least one qualifying divergence is persistent rather than cosmetic: multi-chapter separation, materially different termination/transformation, persistent-state divergence, or delayed credible reconvergence;
11. review of Lifetime Thread authored depth: exact depth 10 is valid but should not become the systematic production default; substantial threads should generally have a longest meaningful path in the 10–20 range, with 12–16 preferred when justified;
12. review that graph-size and branching requirements were not satisfied through filler, unreachable nodes or shallow cosmetic forks;
13. review that new-production Lifetime Threads preferentially widen toward **24–30 reachable Scheduled nodes** and **3+ meaningful divergences** without increasing lived depth solely to hit breadth;
14. verification that every reachable Event remains Choice-resolvable: at least one unconditional Choice or an exhaustive set of `availableIf` branches in every reachable Event state;
15. **instant-comprehension review**: ordinary scenes identify who/what/stakes on first scan;
16. **text-budget review**: ordinary Root/Immediate/Scheduled/Outcome copy follows §3.0 ter or the exception is narratively justified;
17. **concrete-language review**: vague administrative/abstract phrasing identified in §16.5 is rewritten when it carries no intentional uncertainty;
18. **stakes review**: risky Dice failures and dangerous Choices have credible negative or opportunity-cost consequences; batches dominated by `failure → +0` or positive-only branches are rejected;
19. **age-coherence review** for every Childhood Event using its youngest reachable age;
20. **recurring-cast review**: relationship-heavy scenes reuse meaningful named NPCs where possible, and proposed persistent NPCs have planned return touchpoints;
21. **callback review**: returning NPC/thread chapters identify the recurring person/cause quickly enough that the player can recognize why the scene matters.

Compilation alone is not sufficient.

### 18.2 Warnings

Warnings such as unused Traits/Items do not automatically block a batch. Every **new** warning introduced by the batch must be identified and explained; accidental warnings should be fixed.

### 18.3 Validation cadence

After each batch, run content validation and a small simulation/reachability pass. After a group of batches, run a larger simulation and inspect coverage, dead ends, unreachable Events, overrepresented Events, progression distribution, warnings, maximum Immediate-chain depth, Lifetime Thread starts, and runs reaching Active without a Lifetime Thread.

Once the assembled Childhood corpus contains Lifetime Thread seeds, **zero runs reaching Active without a started Lifetime Thread** is the acceptance target.

### 18.4 Concept deduplication

Before final acceptance, compare the batch against a central index of existing Event concepts. The index should detect duplicated premises, mini-arcs, rewards, Scheduled payoffs, and near-identical contextual reskins.

Parallel GPT conversations must not rely on their own memory for deduplication.

The central concept index must also track accepted Signature Immediate Arcs, Secondary Immediate Arcs and Lifetime Threads at the **root/thread-concept level**. Do not add every Immediate or Scheduled descendant as an independent root concept.

## 19. Multi-GPT production protocol

Every Event-generation conversation should receive:

1. the authoritative `GAME_DESIGN.md`;
2. relevant specialized authority docs;
3. `CONTENT_BIBLE.md`;
4. this `EVENT_AUTHORING_RULES.md`;
5. the current Event schema/contract;
6. allowed IDs for the batch;
7. the batch ID/prefix;
8. the existing Event concept index relevant to its domain;
9. explicit allowed Locations/tags/services;
10. explicit allowed NPCs/Items/Traits/Fruits/Ships/Career concepts;
11. any required timeline window;
12. an explicit statement that new persistent definitions must go in `PROPOSED_DEFINITIONS`;
13. the mandatory minimum of at least one Signature Immediate Arc (reachable depth 5);
14. the mandatory minimum of at least three Secondary Immediate Arcs (three additional distinct roots, each reachable depth 3);
15. the mandatory minimum of at least one Lifetime Thread with `lifetimeThreadSeed: true`;
16. Lifetime lived-depth requirements: hard reachable floor 10, normal longest-path range roughly 10–20, 12–16 preferred when justified;
17. Lifetime authored-breadth requirement: **at least 20 distinct reachable Scheduled EventDefinitions** in the complete thread graph; for new production, **24–30 is the preferred ordinary target** when meaningful branches justify it;
18. Lifetime topology requirement: **at least two meaningful long-term divergence points**, with at least one structurally persistent split rather than an immediate cosmetic reconvergence; for new production, **3+ meaningful divergences are preferred** when natural;
19. an explicit reminder that different Choices/Dice outcomes may and should schedule different future chapters when their long-term consequences differ;
20. vertical scheduling and multi-year narrative evolution requirements;
21. the current accepted Lifetime Thread / Immediate Arc concept index so parallel batches do not create near-identical long-form stories;
22. the **Situation → Reaction** contract and QUI / QUOI / OÙ / ENJEU scan test;
23. ordinary prose targets: Root **20–45 words / 1–2 sentences**, Immediate/Scheduled **12–40 words**, Outcome **5–25 words**, Choice **2–10 words**;
24. the concrete-language / anti-vagueness rules from §16;
25. the age-coherence table for Childhood;
26. the requirement that risky failures have real downside/opportunity cost rather than defaulting to `+0`;
27. the recurring-cast rule: reuse a small number of named persistent NPCs instead of replacing emotional continuity with anonymous strangers.

A batch prompt must define scope narrowly enough that another GPT conversation can work on a different batch without collision.

## 20. Core prohibition

Event production must not silently expand gameplay architecture.

If an author believes an Event requires a new Condition, Effect, persistent State, stat, Trait, role, service, tag, career, or system, the Event must first attempt to express the idea using the existing runtime vocabulary.

If impossible, report the requirement separately. Do not invent the mechanic inside the Event JSON.

## 21. V1 authoring principle

The primary OPFG content loop is:

```text
Event
→ meaningful Choice
→ consequence
→ persistent State / History
→ later eligibility
→ Immediate or Scheduled continuation
→ a life that remembers what happened
```

The goal is not to create a large deck of disconnected random cards.

The goal is to create a coherent, replayable life history where origin, personality, geography, career, relationships, powers, and prior decisions meaningfully alter what happens later.

**The player must care before the system asks them to remember.** Recurring people, concrete stakes and readable consequences take priority over abstract variety. One memorable named relationship returning several times is more valuable than several disconnected anonymous situations.

For V1 production, this principle is measurable: every standard batch contributes **at least one depth-5 Signature Immediate Arc, at least three distinct depth-3 Secondary Immediate Arcs, and at least one multi-year Lifetime Thread with 10+ reachable Scheduled depth, 20+ distinct reachable Scheduled nodes in its complete authored graph, and meaningful long-term branching**, while every completed Childhood run is guaranteed to have initiated at least one Lifetime Thread. For new batches, **24–30 reachable Scheduled nodes and 3+ meaningful divergences are the preferred ordinary breadth target**, without increasing the preferred lived depth of 12–16 merely to inflate graph size.

# 22. World travel authoring contract

## 22.1 No persistent route state

Do not add `routeId`, `paradiseRouteId`, or equivalent persistent GameState for V1.

Routes are reconstructed from current Location, History, authored Conditions, and the World V1 route graph.

## 22.2 Paradise route progression

No persistent route ID is required.

At Paradise ingress, the navigation flow may expose eligible forward destinations from the authored route graph. Once the player moves to a route Location, the current Location plus the route graph determines the ordinary forward options.

Routine route movement should therefore use the navigation system rather than creating generic departure Events solely to change `locationId`.

Rare cross-route moves, forced diversions, exceptional passages and canon-sensitive travel remain Event-driven when narratively justified.


## 22.3 Locations are not board-game tiles

Arrival does not automatically trigger departure.

A Location should support local life before travel resumes.

A standard departure Event should not become eligible until at least **one genuine local root Event** has occurred after arrival.

This is an authoring rule for V1. Do not add new persistent visit-state solely to enforce it unless a later implementation audit proves it unavoidable.

## 22.4 Staying is valid

The player may remain at the same Location through multiple slots and Events.

Large hubs and major islands should deliberately support multiple local Event families.

## 22.5 Parent Location and sub-location are distinct

`parentLocationId` represents runtime hierarchy.

Examples:

```text
Alabasta Kingdom
└─ Rainbase
└─ Nanohana
└─ Alubarna
```

Moving between members of the same runtime hierarchy is local movement, not a Paradise route change.

If a Location has no runtime parent, it is displayed and authored as a standalone Location even if the wider Bible knows a reference-only geographic parent.

## 22.6 Location display contract

Core should expose enough information for UI to display:

```text
Root Location - Current Sub-location
```

Examples:

```text
Alabasta Kingdom - Rainbase
Wano Country - Flower Capital
```

If no runtime parent exists, show only the current Location:

```text
Water Seven
Gosa Town
```

For nested chains, use the top runtime ancestor plus the current Location. Do not force every intermediate node into HUD text.

## 22.7 Current-region Conditions

Event authoring requires:

- `currentSeaIs(seaId)` — checks the current Location's `seaId`, never the player's origin sea;
- `locationWithin(locationId)` — true when current Location is the target or any descendant.

These complement `locationIs`, `locationHasTag`, and `locationHasService`.

## 22.8 Cross-route movement is possible but rare

Paradise routes are soft structures, not walls.

Ordinary travel follows the current route family. Cross-route travel may happen through a deliberate Event, but must remain rare enough that the random initial route materially changes the run.

Do not make every Paradise Location generically reachable from every other one.

## 22.9 Backtracking is not free

Returning to an earlier Grand Line Location requires an authored reason such as:

- Eternal Pose / navigation aid;
- specialized navigator opportunity;
- following another ship;
- transport by an organization;
- capture or rescue;
- storm/current detour;
- Event-specific opportunity.

Do not implement free fast travel.

## 22.10 Special destinations are never generic random results

Locations classified as special/gated must require dedicated authored access.

Typical examples include Baltigo, Enies Lobby, Impel Down, Marineford/New Marineford, Mary Geoise, Amazon Lily, Zou, Totto Land, Wano, Hachinosu, and other World V1 entries explicitly marked gated/special.

## 22.11 Sabaody is the majority Paradise convergence

Most Paradise runs eventually reach Sabaody before the normal under-Red-Line transition.

This is a strong world rule, not an absolute lock.

Exceptional authored trajectories may reach the transition differently when strongly justified.

Arrival at Sabaody does not force immediate departure.

## 22.12 New World movement is random

New World deliberately maximizes uncertainty.

Do not create a default destination-choice menu.

Normal progression should be authored so that several travel Events/destinations can be eligible and the seeded runtime randomly determines where the wind/current carries the run.

The result must remain reproducible from the run seed.

Special/gated destinations are excluded from generic random travel.

## 22.13 Travel without a personal ship

The player may geographically move without owning a ship through authored situations such as:

- Marine transport;
- merchant passage;
- another pirate crew;
- Revolutionary transport;
- capture;
- rescue;
- escort.

Do not add a persistent external-transport subsystem for V1.

Because `ship == null && at_sea` is a critical invalid state, transport without a personal ship should normally resolve land-to-land inside the current Event/Immediate chain rather than leave the player at sea between slots.

## 22.14 Leaving a sub-location for sea

Monthly navigation must treat a sub-location as part of its runtime hierarchy.

When the player attempts to go to sea from a sub-location, core may resolve a dockable ancestor as the effective access point.

A Location with no runtime parent uses only its own docking data.

This abstraction represents local travel to the coast/port; it does not require a separate map-navigation system.

## 22.15 Dead-end fallback Events

A normally accessible Active run must never terminate because the normal content pool is empty.

After Critical / Immediate / Scheduled handling, if there is no eligible unplayed Normal Event, use a reserved fallback layer.

Required behaviors:

- **on land:** `dead_end_on_land` resumes sea travel;
- **at sea:** `dead_end_at_sea` continues navigation toward a valid non-gated continuation.

Fallback Events:

- are not part of the ordinary random Normal pool;
- are repeatable safety content;
- only trigger after the normal pool is empty;
- must not consume/disable themselves through the normal one-shot History rule;
- should still be visible in History/diagnostics as fallback occurrences.

Fallback navigation must respect World V1 geography. In Paradise it should prefer valid forward route adjacency; outside fixed Paradise routing it may use seeded random valid same-region travel targets. It must never randomly enter gated/special Locations.

Fallbacks are emergency recovery, not normal route content.

## 22.16 Childhood and Origins never use travel fallback

Dead-end travel fallback is **Active-only**.

If Origins or Childhood reaches zero eligible Events, that remains a true content error and must be reported by validation/simulation.

A child should not escape a missing Childhood pool by "taking to sea."

## 22.17 Every runtime Location requires ingress and egress coverage

Batch manifests must state:

- known ingress Locations;
- known egress Locations;
- local parent/sub-location transitions;
- special/gated transitions;
- rare cross-route transitions;
- whether the batch contributes normal travel recovery.

QA should be able to report runtime Locations with:

- no known ingress;
- no known ordinary egress;
- excessive fallback activation.

## 22.18 Geography validation

A non-null `parentLocationId` must:

- reference an existing runtime Location;
- not point to itself;
- not participate in a parent cycle.

Travel Events must preserve coherent current sea, hierarchy, docking, and access rules.

The World V1 authority may retain reference-only geographic relationships in notes, but runtime hierarchy uses runtime IDs only.

---

## Editorial Revision B — acceptance summary

For all new batches and all rewrites of existing Events, the following failures are now **authoring blockers**:

- the player cannot identify the concrete situation on first scan;
- ordinary Root copy is padded beyond the dramatic information it carries;
- anonymous characters carry emotional stakes that an established recurring NPC could carry better;
- a risky failure is effectively `nothing happens` / `+0` without meaningful lost opportunity;
- every branch of an ordinary challenge is positive;
- Childhood agency is implausible for the youngest reachable age;
- an Outcome does not clearly state what happened;
- a callback returns as vague exposition instead of a recognizable person/cause;
- Event prose uses abstract filler where a concrete noun and active verb would be clearer.

The production question is no longer only:

> Is this Event valid and varied?

It is also:

> **Would a player on a phone understand why this matters in two seconds and care enough to choose?**

## Childhood Opening Spine

The first Childhood years are identity-establishing content, not generic filler.

- While an eligible `ch_opening_*` Normal Event exists, it is selected before the ordinary Childhood pool.
- The opening spine should establish, in order: **household/milieu → Birth Location → first persistent friend → callback with that friend → first rival**.
- These Events still consume the normal Childhood yearly slot. The opening spine does **not** increase Event frequency.
- Origins choices must become visible fiction immediately. Family structure, affiliation, social class, Race and Birth Location should change what the player sees before generic Childhood begins.
- World building belongs inside the concrete problem: uniforms, wanted posters, ration bowls, cargo, workshops, guards, Den Den Mushi, weather, markets, ships, local trades, etc. Do not add explanatory lore paragraphs.
- A persistent Childhood NPC must receive an introduction scene before ordinary callback content assumes familiarity. A generated display name alone is not an introduction.
- A callback should refer to a concrete object/action from the introduction whenever possible. The player should understand *why this person is back* without exposition.
