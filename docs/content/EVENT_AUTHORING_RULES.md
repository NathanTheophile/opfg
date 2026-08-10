# OPFG — Event Authoring Rules

> **Status: validated specialized content authority**
>
> **Scope:** rules for producing, reviewing, validating, and batching authored Events for OPFG V1.
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
3. **at least one Lifetime Thread**: a root Normal Event marked `lifetimeThreadSeed: true` with at least one reachable authored continuation path containing **10 or more successive Scheduled chapters**.

These supporting Immediate/Scheduled Events are **in addition** to the approximately 20 root Events and never count toward the root target.

The required Signature Immediate Arc and the three required Secondary Immediate Arcs must use **distinct root Events**. 
A depth-5 chain does not also satisfy any of the required depth-3 slots.

Additional Signature or Secondary Immediate Arcs are allowed and encouraged when narratively justified.

The Lifetime Thread may originate from one of those two Immediate-arc roots only when that produces a genuinely coherent story. Do not force structures together merely to reduce Event count.

The batch manifest must explicitly identify:

- qualifying Signature Immediate Arc root ID(s);
- maximum reachable consecutive Immediate depth for each Signature Arc;
- qualifying Secondary Immediate Arc root IDs (at least 3);
- maximum reachable consecutive Immediate depth for each Secondary Arc;
- Lifetime Thread seed root ID(s);
- recurring persistent NPC(s), if any;
- minimum reachable Scheduled continuation depth;
- approximate intended age/time span;
- known early-termination or major branch points;
- whether the thread is designed to cross Childhood → Active.

## 3. Event scene structure

### 3.1 Standard number of Choices

A normal Event should generally contain **3–5 Choices**.

### 3.2 One-Choice Events

An Event may contain one Choice only when it is genuinely a transition or consequence scene with no meaningful decision to make. Do not use one-Choice Events to disguise missing interaction.

### 3.3 Five or six Choices

Events may regularly reach **5–6 Choices** when extra options are justified by meaningful special approaches such as Race, Trait, Haki, Devil Fruit, career, crew role, ship or resource requirements.

Five or six Choices are acceptable when they remain readable and mechanically distinct. Avoid routinely exceeding six.

### 3.4 Choice identity

Choices must represent different player intentions, not cosmetic paraphrases of the same action.

### 3.5 Locked Choices

For V1, special or blocked Choices should normally remain **visible but disabled** through `availableIf`, especially for Race, Trait, Haki, Devil Fruit, career, crew-role, ship/resource, or understandable contextual requirements.

Use hidden Choices only when secrecy itself is narratively important.

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

## 5. Mechanical effect scale

### 5.1 Player Stats

Typical Stat change:

- **±1 to ±2 normally**;
- **±3 exceptionally**.

V1 Events should not give ±4 or ±5 Stat changes in one Outcome.

### 5.2 Multiple Stats

An Outcome may modify multiple Stats, but should generally affect **no more than two**.

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

### 5.5 Berrys

Berry values remain authored per Event. Batches must remain internally coherent, but V1 does not require a universal economic simulation.

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

## 8. Persistent NPC rules

### 8.1 When an NPC deserves persistence

Create or propose a persistent NPC only when that character can materially matter after the current scene, for example by returning later, carrying a relationship, joining the crew, becoming a passenger, dying persistently, becoming unavailable/departed, carrying a Scheduled consequence, or participating in a mini-arc.

### 8.2 Throwaway characters

Throwaway characters should usually remain anonymous, role-named, or named only in localized scene text.

### 8.3 New NPC proposals per batch

A normal batch should propose no more than **2–3 new persistent NPCs**. They remain proposals until reviewed and added to the authoritative catalog.

### 8.4 Major canon NPCs

Major canon characters must remain rare. A major canon meeting requires plausible player age, valid timeline, plausible geography, valid character status, a real narrative/gameplay reason, and no contradiction with protected canon outcomes.

Do not use major canon characters as ambient fan-service.

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

For Lifetime Threads, spacing must feel biographical rather than like a quest log firing every slot. The authored surviving path should normally span **many years**, target roughly **10+ years of possible life**, and include multiple gaps measured in years rather than only adjacent months.

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
- be recorded explicitly in the batch manifest.

A Lifetime Thread should preferably be anchored by a persistent relationship, recurring person, rival, mentor, family member, organization contact, long-term obligation, mystery or comparable durable narrative subject. When a persistent NPC is used, it counts against the normal persistent-NPC proposal budget.

### 10.6 Vertical scheduling, not ten events queued at once

A Lifetime Thread must be authored **vertically**.

Preferred structure:

```text
Seed root
  ↓
Scheduled 1
  ↓
Scheduled 2
  ↓
Scheduled 3
  ↓
...
  ↓
Scheduled 10+
```

A Scheduled chapter normally schedules the next relevant chapter **only after that chapter is resolved**.

Do **not** have the seed root enqueue ten future Scheduled Events at once. That would flood the scheduler, reduce player agency and make later branches difficult to author.

Branching is valid and encouraged:

```text
Scheduled 3
├─ Choice A → Scheduled 4A → ...
└─ Choice B → Scheduled 4B → ...
```

The minimum depth requirement means that at least one coherent reachable continuation path contains 10+ Scheduled chapters. It does not require every branch to survive that long.

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

Ten callbacks are not enough by themselves. A Lifetime Thread must visibly evolve.

Across its surviving path, change several of the following over time:

- relationship;
- character age/status/responsibility;
- worldview or knowledge;
- location or organization context;
- stakes;
- player identity/career;
- recurring character goals;
- consequences of earlier Choices.

Do not write ten near-identical “the same person visits again” scenes.

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

## 12. Travel and world progression

### 12.1 Movement must be narrated

Moving to another Location should normally be the result of an authored travel Choice/Event. Do not use `moveToLocation` as an unexplained teleport.

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

### 16.2 Meaningful Event requirement

An Event does not always need to mutate GameState, but it must create at least one meaningful contribution: information, relationship, decision, characterization, setup, payoff, atmosphere with narrative value, or a memorable life moment.

### 16.3 Anti-reskin rule

Do not duplicate an Event structure and merely change the decoration. A reskin is acceptable only when Conditions, Choices, consequences, context, or future implications materially change the experience.

### 16.4 Text density

Event writing should be **short but embodied**. The player should feel that a scene is happening, not that they are reading an abstract card description. Avoid both dry mechanical summaries and excessively long prose.

### 16.5 Tone

Target an adventurous One Piece-like tonal range: light, strange, funny, warm, tense, occasionally tragic, and occasionally epic. Do not write every Event as maximal drama or prophecy.

### 16.6 French voice

For French source localization, **prefer singular informal address (`tu`, `te`, `toi`, `ton`, `ta`, `tes`)** in narrative text and Choices that address the player directly.

Text that does not address the player directly remains naturally free. Dialogue spoken by characters to the player should also follow the character, relationship, situation, and social register: a character may therefore use either `tu` or `vous` when appropriate.

Do not mechanically normalize pronouns or possessives solely to match the player's address form when their grammatical referent is different (for example, a shared relationship involving the player and another character).

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
7. verification that every qualifying Lifetime Thread used to satisfy the batch requirement is vertically scheduled rather than pre-queuing its full future chain.

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
15. the mandatory minimum of at least one Lifetime Thread, including `lifetimeThreadSeed: true`, 10+ Scheduled depth, vertical scheduling and intended multi-year span;
16. the current accepted Lifetime Thread / Immediate Arc concept index so parallel batches do not create near-identical long-form stories.

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

For V1 production, this principle is measurable: every standard batch contributes **at least one depth-5 Signature Immediate Arc, at least three distinct depth-3 Secondary Immediate Arcs, and at least one multi-year Lifetime Thread**, while every completed Childhood run is guaranteed to have initiated at least one Lifetime Thread.

# 22. World travel authoring contract

## 22.1 No persistent route state

Do not add `routeId`, `paradiseRouteId`, or equivalent persistent GameState for V1.

Routes are reconstructed from current Location, History, authored Conditions, and the World V1 route graph.

## 22.2 Paradise route selection is random

After Reverse Mountain / Twin Capes, the initial Paradise route is selected randomly through the seeded Event-selection system.

The player does **not** choose a route from a menu.

Preferred content pattern:

- one route-start Normal Event per eligible route;
- all valid route-start Events are simultaneously eligible;
- seeded uniform Event selection chooses one;
- moving to that route's first Location makes the others ineligible.

Do not add weights unless the design is explicitly revised.

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
