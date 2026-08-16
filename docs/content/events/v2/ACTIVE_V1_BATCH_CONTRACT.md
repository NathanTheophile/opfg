# OPFG — Active V1 Batch Contract

> **Status: authoritative specialized Active V1 production contract.**
>
> **Scope:** Active ordinary Event batches, career-content batches, Active Lifetime Threads, Personal Affiliation authoring targets, travel/local-life content, and the first complete Active → Ending production corridor.
>
> This contract is the authoritative Active counterpart to `CHILDHOOD_V2_BATCH_CONTRACT.md`. It does not reopen Childhood and does not create new gameplay primitives by itself.

---

## 1. Authority and scope

For Active V1 production, this document overrides conflicting legacy batch quotas or Active assumptions in `EVENT_AUTHORING_RULES.md`, `GAME_DESIGN.md`, `CAREER_AND_ENDINGS.md`, `MAJOR_NARRATIVE_TRACKS.md`, and `OPFG_WORLD_V1.md` where those documents explicitly defer to the Active redesign or describe an older Active navigation/career surface.

All non-conflicting rules remain active, especially:

- Situation → Reaction writing;
- concrete WHO / WHAT / WHERE / immediate stake;
- Choice resolvability;
- meaningful downside when fiction promises risk;
- persistent NPC cast semantics;
- localization;
- current Conditions / Effects / History vocabulary;
- no duplicate persistent state when History or existing state already represents the fact;
- World V1 Location authority;
- canon/timeline policy;
- Item / Equipment / Ship / Crew / market authorities.

Childhood is frozen. An Active batch must not modify Childhood content or its cadence unless a separate explicit task reopens it.

---

## 2. Active phase contract

Active starts at **180 ageMonths / 15 years**.

### 2.1 Time cadence

- Active consumes **exactly one root Event per month**.
- Resolving the monthly root and all of its Immediate continuations advances biological age by exactly **+1 month**.
- Immediate Events do not consume another month.
- Critical/system interruptions do not create an extra monthly root unless their existing runtime contract explicitly consumes one.
- A healthy Active run should not silently skip empty months. Missing content is a starvation defect and must be surfaced by fallbacks/diagnostics.
- Event Outcomes do not choose arbitrary Active time duration.

### 2.2 Career horizon

The V1 safety horizon is **40 years old = 480 ageMonths**.

This horizon is a last-resort safety Ending when authored Endings have not resolved the run. It is not the normal target Ending age and must not replace career accomplishment.

A normal long run may spend roughly **15–25 years in Active**, depending on survival and Ending timing.

### 2.3 Active opener

The first normal Active experience must include a career-aware opener around age 15.

The opener should be selected from a small contextual pool using the actual state where useful:

- starting career;
- current Location;
- Family/Origins History;
- existing NPC relationships;
- inherited assets/Traits;
- current ship/crew state.

Do not create a Cartesian opener matrix. The purpose is to make the handoff feel lived, not to reskin one scene for every origin combination.

### 2.4 Royal Family parental affiliation — temporarily disabled

`royal_family` remains a valid inherited-affiliation/content ID, but it is **not selectable for new V1 Origins runs**.

Production lock:

- keep the complete Royal Childhood Saga, localization, rewards, NPC/content definitions, History hooks and authored assets in the repository;
- do not rename or delete `royal_family`;
- set/keep the V1 Origins surface so `royal_family` is locked (`playableV1: false` / not offered to a new player);
- existing saves or explicit test states that already contain `profile.affiliationId = royal_family` must remain loadable and supported;
- do not migrate an existing Royal profile to another parental affiliation;
- the current legacy Royal → Civilian Active handoff may remain for compatibility, but it is **not** the final approved Royal transition design;
- do not spend V1 Active production time authoring a temporary Royal opener merely to keep the Origins option enabled.

Royal Family may be re-enabled only after a dedicated Childhood → Active transition for that parental affiliation exists and has been validated.

---

## 3. V1 career surface

Playable Active careers for V1 are exactly:

- `civilian`;
- `pirate`;
- `marine`;
- `revolutionary`.

`bounty_hunter` is **out of V1 scope**. Existing engine/schema/rank definitions may remain inert for future use, but V1 content must not make that career reachable.

### 3.1 No career changes in V1 content

The engine may retain generic career-change capability, but **V1 authored content must not offer affiliation changes**.

Therefore:

- no Civilian → Pirate/Marine/Revolutionary/Bounty Hunter conversion Event;
- no Pirate → Civilian/etc. conversion Event;
- no leaving then rejoining an organization;
- no Personal Affiliation restart/swap logic is required for V1.

This is a scope lock, not a permanent engine limitation.

### 3.2 Civilian

Civilian is a complete career identity, not a temporary waiting room and not a `professionId` system.

For V1:

- the Civilian Personal Affiliation production line is **commercial**;
- no profession state, profession menu, profession rank, or profession-specific persistent subsystem is added;
- the player remains `civilian` throughout the run;
- future post-V1 Civilian sagas may represent medicine, exploration, craft, navigation, local leadership, or other life paths without changing the career model.

### 3.3 Pirate

A player entering Active as Pirate is a Pirate immediately, but receives **no automatic guarantee** of:

- a ship;
- leadership;
- crew members.

Those states must come from actual inherited state or authored Active Events.

Pirate progression is read through the combination of Reputation, bounty, crew, ship, titles/exploits and History. Pirate has no rigid rank ladder.

### 3.4 Marine and Revolutionary

Marine and Revolutionary characters may receive authored institutional transport without owning a personal ship.

Marine rank progression may skip intermediate ranks when an exceptional authored milestone justifies it. Reaching the top of a rank ladder should be rare but realistically attainable in an excellent run.

For Marines, some promotion/command milestones may assign subordinates. These subordinates are **real persistent NPC crew members**:

- they have normal NPC state and relationship;
- they have one fixed CrewRole;
- they can die/depart/become unavailable;
- they consume normal ship crew capacity;
- they are assigned by authored Events, never silently by the rank system.

### 3.5 Reputation and bounty

Reputation remains one global `0..100` notoriety value, not morality.

High Reputation should open both opportunity and danger.

In V1 content, an active Marine must **not receive a bounty** because the V1 surface does not expose the career-change resolution that such a contradiction would require. The engine may continue to support bounty on arbitrary affiliations for future content.

---

## 4. Standard Active batch shape

A standard narrative Active batch targets approximately **20 Normal root Events**, plus Immediate/Scheduled support.

Small system/fallback/fix patches are not treated as standard narrative batches and do not need to fake narrative quotas.

Every standard batch must declare a narrow production territory, for example:

- career-specific ordinary life;
- local/port life;
- maritime travel;
- commerce;
- crew/recruitment;
- powers;
- a specific World V1 region;
- another clearly bounded Active domain.

A batch must not attempt to solve the whole Active game at once.

---

## 5. Immediate mini-arcs

Target **40–50% of roots** opening a genuine Immediate mini-arc.

For a 20-root batch, this normally means **8–10 mini-arc roots**.

Normal shape when the scene warrants depth:

```text
Root
→ 1–3 Immediate
→ resolution
```

Immediate nodes must add a new decision, changed situation, information, check, consequence, or resolution. Continue-only padding does not count.

Major Personal Affiliation chapters normally use this same short-scene shape.

---

## 6. Dice target

Target **55–65% of root Events** containing at least one DiceCheck in the root.

For a 20-root batch, this normally means **11–13 Dice roots**.

Use multiple materially different Dice approaches when the situation naturally supports them. Do not add rolls only to satisfy the percentage.

Existing Dice outcome/stakes rules remain authoritative:

- dangerous or uncertain action must have meaningful downside;
- failure must not routinely be a cosmetic `+0` result;
- critical failure should normally be visibly worse than failure;
- success does not automatically mean pure positive stat growth.

---

## 7. Lifetime Thread requirement

Every standard narrative Active batch contains **one primary qualifying Lifetime Thread**.

The thread must represent genuine long-form continuity: a recurring person, obligation, rivalry, commercial relationship, investigation, promise, institution, craft, debt, correspondence, or comparable subject that can return across years.

For Active V1 this contract deliberately does **not** impose the old legacy breadth/depth graph quotas. The exact number of Scheduled nodes and branch topology is premise-dependent.

Hard qualitative rules:

- the thread must contain real future returns rather than one callback;
- Scheduled is used only when time genuinely needs to pass;
- each returning chapter must make prior causality recognizable;
- do not recursively inflate the graph solely to hit a node count;
- the thread must not become a second Personal Affiliation Saga.

The manifest must identify the seed, recurring anchor, expected age span, major divergences, and intended reconvergence/termination behavior.

---

## 8. Personal Affiliation Saga — V1 target

Personal Affiliation is the main Active career spine.

### 8.1 Start

It begins **after a few ordinary Active roots**, not automatically on the first Active root. The exact first-chapter trigger is authored from current state/History rather than a universal profession menu.

### 8.2 Structure

The full V1 production target is approximately **10–14 major chapters per career**.

Chapters are **milestone-driven**, not a fixed age ladder. Eligibility may react to:

- career state;
- Reputation;
- rank where applicable;
- bounty where applicable;
- History and prior saga outcomes;
- crew/ship/NPC state;
- geography;
- assets;
- Traits/powers;
- broad age windows when useful.

A normal chapter is a structural root with roughly **1–3 Immediate continuations** when dramatic depth warrants it.

Do not add a generic quest state or persistent saga counter if current MajorTrack metadata + History can represent progression.

### 8.3 V1 career sagas

V1 needs Personal Affiliation coverage for:

- Civilian — commercial trajectory;
- Pirate;
- Marine;
- Revolutionary.

Bounty Hunter has no V1 Personal Affiliation Saga.

Because V1 content exposes no career changes, a Personal Affiliation Saga never needs to transfer to another career during a V1 run.

### 8.4 Vertical-slice allowance

The first end-to-end vertical slice may implement a thin reachable corridor through each career before the complete 10–14-chapter breadth exists. This does **not** lower the final production target.

---

## 9. Adult Family coexistence

Adult Family remains a distinct Major Narrative Track continuation.

Its Active chapters use **broad age windows + current family/History state**, not a copy of the five fixed Childhood checkpoints.

Personal Affiliation and Adult Family may both become due. Runtime selection must prevent either track from starving the other through an overdue/fairness mechanism. No arbitrary permanent priority between the two is locked by this contract.

Adult Family authoring may remain deferred until the minimal Active corridor is stable, but the Active architecture must not block this coexistence.

---

## 10. Local life and departure

Arrival does not force departure.

A standard departure from a Location should not become available until the player has resolved at least **two genuine local root Events** after arriving.

Use History to derive this whenever practical. Do not add a generic per-location visit counter unless implementation proves History insufficient.

Internal movement inside a Location hierarchy does not reset the local-life requirement by itself.

---

## 11. Ordinary Blue travel

Normal travel in the four Blues is intentionally not direct destination selection.

For a Leader with a usable ship:

```text
on_land
→ player chooses to take the sea
→ at_sea
→ one or more maritime roots
→ after each maritime root, seeded arrival resolution may continue travel or land
→ on arrival, destination is seeded among valid destinations in the current Blue
```

Rules:

- the player normally chooses **whether to depart**, not the exact destination;
- normal departure does not pre-lock a destination;
- a crossing contains **one or more maritime roots**;
- after each maritime root, the runtime may resolve arrival or continue the crossing;
- maritime content mixes danger, weather, encounters, opportunities, calmer beats, ship/crew pressure and navigation problems;
- the maritime pool should be riskier than ordinary land life;
- danger/context should vary materially by sea/region;
- travel without a personal ship still uses authored transport when fiction supports it.

---

## 12. Navigator annual power

A crew NPC with fixed CrewRole `navigator` unlocks the existing annual Navigator power through a dedicated UI button.

The power is usable **once per biological year** according to the existing annual crew-role power system.

### 12.1 Blues

When the player is in one of the four Blues, Navigator allows the player to choose directly:

- any runtime destination in the current Blue;
- **Reverse Mountain**.

The move resolves immediately at the gameplay level. Fiction may present this as exceptional route mastery rather than literal teleportation.

### 12.2 Paradise

Navigator destination-jump is **disabled in Paradise**.

Paradise continues to use its authored route progression. The initial route after Twin Capes remains seeded rather than chosen from a seven-route menu.

### 12.3 New World

In the New World, Navigator allows direct choice of **any runtime island in the world** for that annual use.

This is an explicit exception to ordinary New World random/Event-driven progression.

### 12.4 Reverse Mountain access

Reverse Mountain is not reachable through ordinary non-Marine Blue navigation.

V1 access paths are:

1. the annual Navigator power while in a Blue;
2. authored **Marine institutional transport**.

Do not add a generic high-Navigation-stat bypass, Log Pose bypass, or rare ordinary Event bypass in V1.

---

## 13. Paradise and New World

Reverse Mountain → Twin Capes remains the common Paradise ingress.

Paradise:

- route family is selected seededly through authored route-start logic;
- normal progression follows that route family;
- Navigator annual destination-jump is disabled;
- route membership remains derivable/authoring structure rather than a required persistent `routeId`.

New World:

- ordinary progression remains random/Event-driven;
- the player does not normally choose every destination;
- the Navigator annual power is the explicit direct-choice exception;
- the New World should become a **substantial part of the majority of strong/long V1 runs**, not merely an end-card destination.

---

## 14. Markets and commerce

At every compatible arrival, the existing market opportunity should be made available as an **optional system interaction before the monthly root**.

Rules:

- the player may open or ignore it;
- opening the market does **not** consume the monthly root;
- generic item/ship trading continues to use the existing market/economy primitives;
- do not create a second shop/economy system;
- authored exceptional deals remain Events when the fiction requires them.

Cargo/trade is important for commercial Civilian runs but remains optional for other careers.

The Civilian V1 Personal Affiliation Saga should use commerce as its career spine rather than adding a profession subsystem.

---

## 15. Crew and persistent NPC budget

Crew member = persistent NPC with status `crew`.

Companion = animal Item and never a crew NPC.

CrewRole is fixed for the NPC in V1.

Active authoring should respect a total V1 persistent-NPC target of roughly **25 definitions**. Reuse established NPCs aggressively and keep throwaway characters in local prose.

Childhood NPCs may become crew in Active when the fiction supports it.

Marine-assigned subordinates are not an anonymous second crew system: they use the same persistent NPC/crew model.

### 15.1 Early Active recruitment pressure

The first three Active years are a deliberate crew-building window for:

- `civilian`;
- `pirate`;
- `revolutionary`.

The window is exactly:

```text
180 <= ageMonths < 216
```

During those 36 monthly roots, ordinary/career content must be **strongly punctuated by Events that can lead to recruiting a persistent crewmate**. Recruitment is an important early-production lane for these three careers so they can build the people needed for independent travel and ship life quickly.

This is a content-density rule, not a guarantee that every offer succeeds or that every root is a recruitment Event. The player must still be able to refuse, fail, alienate, postpone or lose a candidate when the authored situation supports it.

Each recruitable persistent NPC keeps one fixed `CrewRole` in V1. Recruitment-focused Event eligibility must respect role occupancy:

```text
target role R
→ Event eligible only if NOT hasCrewRole(R)
→ normal leader recruitment may also gate on canRecruitNpc(candidate)
→ authored non-leader recruitment uses setNpcStatus(... allowWithoutLeadership: true), whose runtime check still enforces free crew capacity
```

Therefore:

- if the target CrewRole is already occupied by a current crew NPC, do **not** propose another recruitment-focused Event for that same role;
- do not merely surface the Event with a permanently locked recruitment Choice when its main purpose is to offer that occupied role;
- if the role later becomes vacant because its crew NPC dies, departs or is no longer `crew`, future recruitment content for that role may become eligible again;
- distribute early opportunities across several useful CrewRoles instead of repeatedly pushing the same role;
- use the existing `hasCrewRole` + `not` Conditions for role vacancy rather than adding duplicate crew-vacancy state;
- use the existing `canRecruitNpc` Condition for normal leader recruitment;
- when a story legitimately recruits before the player has formal leadership, **do not** also gate that Choice on `canRecruitNpc`; instead use `setNpcStatus` with the existing `allowWithoutLeadership: true` escape hatch, which still checks crew capacity at effect application; the Event must explain that relationship and must not silently grant leadership as a side effect.

Marine is intentionally **excluded** from this early recruitment-density requirement. A Marine should be able to progress through approximately the first three Active years while relying on superiors, institutional transport and assigned structure rather than being forced to assemble a personal crew immediately. Organic Marine recruitment may still occur when authored, and later command/promotion Events may assign real crew NPCs through the normal model.

For Revolutionary, institutional transport remains valid but must not replace the intended early opportunity to build a personal recurring crew/cell cast.

---

## 16. Powers

### 16.1 Devil Fruits

Across complete-run production/simulation, Devil Fruit acquisition should remain **rare but visible**, roughly in the **5–15%** range rather than becoming routine.

Player acquisition should normally be a memorable Event or mini-arc, not a casual generic loot drop.

### 16.2 Haki

Haki should become common enough to matter on combat-oriented trajectories while remaining optional for non-combat lives.

**Conqueror's Haki is out of V1 player scope.** Existing runtime primitives may remain for future use, but V1 content must not awaken it for the player.

---

## 17. Endings and final score

Normal Endings become reachable from **career accomplishment/state**, not from one universal minimum age.

Retirement may be voluntary only when an authored Event presents that Ending opportunity.

The 40-year horizon is a safety net, not a normal retirement rule.

### 17.1 Ending inventory

The previous planning target of roughly five base Endings per career / four variants each is **not a locked V1 production count**. Final inventory will be decided after full-run playtests.

The first complete corridor must nevertheless have at least one reachable Ending path for each of the four V1 careers plus universal death/safety handling.

### 17.2 Score is required from the first terminable slice

The first end-to-end Active → Ending slice must use the real six-axis `/100` model:

| Axis | Weight |
| --- | ---: |
| Reputation | 20 |
| Career accomplishment | 25 |
| Power | 20 |
| Relationships / Crew | 15 |
| Fortune / Assets | 10 |
| Legacy / Ending | 10 |
| **Total** | **100** |

Death receives the same complete final-screen richness as other Endings and may score up to `100/100`.

Do not add a persistent `powerLevel` or duplicate lifetime caches solely for scoring when final state + History can derive the axis.

---

## 18. First Active vertical-slice gate

The first production gate covers exactly the four V1 careers:

- Civilian;
- Pirate;
- Marine;
- Revolutionary.

Each must be able to demonstrate:

```text
age 15 Active handoff
→ contextual opener
→ ordinary local/career life
→ visible career progression
→ travel or authored transport where relevant
→ persistent consequences
→ reachable Ending
→ full six-axis score/final screen
```

The gate must also prove:

- zero normal starvation/dead-end terminations;
- land and sea fallbacks exist and are diagnostic safety, not normal content;
- Blue maritime travel can sustain 1+ sea roots and arrive;
- Reverse Mountain access obeys Navigator/Marine rules;
- Paradise ingress and seeded route start work;
- at least one path can progress substantially into the New World;
- fallback use is measured;
- no Bounty Hunter or career-change Event becomes reachable;
- `royal_family` is unavailable to new Origins selection while existing Royal states remain compatible;
- Civilian/Pirate/Revolutionary runs receive recurring recruitment opportunities during `180 <= ageMonths < 216`;
- recruitment-focused Events never target a CrewRole already occupied by current crew;
- early Marine progression remains viable without requiring a player-owned crew.

---

## 19. Batch manifest additions

Every standard Active batch manifest must report at least:

### Scope

- batch ID;
- career/world/domain territory;
- root Event IDs;
- Immediate IDs;
- Scheduled IDs;
- existing persistent definitions used;
- proposed persistent definitions;
- canon/timeline constraints;
- dependencies on other Active batches.

### Coverage

- root count;
- career coverage;
- age windows;
- land/sea/location coverage;
- restrictive eligibility and its fallback coverage;
- overlap/dedup risk with accepted V2 concepts.

### Immediate

- mini-arc root IDs;
- percentage of roots opening mini-arcs;
- maximum reachable Immediate depth for each.

### Dice

- Dice root IDs;
- root Dice percentage;
- Dice approach count per root;
- any one-Dice-approach justification;
- difficulty distribution.

### Lifetime

- primary Lifetime seed;
- recurring anchor/cast;
- future Scheduled return IDs;
- intended age span;
- major divergences;
- expected reconvergence/termination logic.

### Progression and safety

- Reputation/rank/bounty/title changes used;
- ship/crew/economy interactions;
- for batches touching ages 15–18: recruitment-offer roots by career, targeted CrewRole, and the vacancy gate used;
- Power interactions;
- possible Ending interactions;
- starvation/fallback concerns;
- confirmation that no career-change or Bounty Hunter route is authored.

---

## 20. Acceptance checklist

A standard Active V1 batch fails review if any of the following is true:

1. it exposes Bounty Hunter or an affiliation-change route;
2. it adds a Civilian profession subsystem;
3. its root Dice percentage is outside **55–65%** without an explicit approved exception;
4. fewer than roughly **40%** or more than roughly **50%** of roots open meaningful Immediate mini-arcs without a justified domain-specific reason;
5. it lacks its one primary Lifetime Thread;
6. its Lifetime is only a cosmetic callback or duplicates Personal Affiliation;
7. risky failures are routinely consequence-free;
8. it adds new persistent state where History/current state already suffices;
9. it assumes direct player destination choice for ordinary Blue travel;
10. it lets ordinary non-Marine travel reach Reverse Mountain without the Navigator annual power;
11. it makes Navigator destination-jump available in Paradise;
12. it creates a second crew, companion, market, profession, route, quest, or career system;
13. it silently promotes/ranks/assigns Marine crew without an authored Event;
14. it awakens player Conqueror's Haki in V1;
15. it consumes the monthly root merely because the optional arrival market was opened;
16. it makes standard departure available before two genuine local roots after arrival;
17. it treats the 40-year safety horizon as the normal Ending;
18. it cannot participate in a complete Active → Ending + score corridor;
19. it makes `royal_family` selectable in new V1 Origins before the dedicated Royal Childhood → Active transition exists;
20. a recruitment-focused Event for Civilian/Pirate/Revolutionary ages 15–18 can be selected while its target CrewRole is already occupied;
21. an early Marine corridor requires the player to own/build a personal crew in order to keep progressing.

---

## 21. Validation and simulation

Before integration, run the normal repository checks:

```bash
npm test
npm run validate-content
npm run build
```

The Active simulation gate must eventually record at least:

- `reachedActive`;
- `reachedEnding`;
- `deadEnd`;
- `fallbackCount`;
- `safetyLimit`;
- `finalCareer`;
- `locationsVisited`;
- `careerProgress`;
- `recruitmentOffers` by career during `180 <= ageMonths < 216`;
- `crewRolesOccupiedAt216`;
- duplicate-role recruitment offers suppressed / observed;
- final score and score-axis breakdown.

Production sequence:

1. 100-run smoke;
2. 400-run serious validation;
3. larger targeted stress only when a specific low-frequency problem needs it.

The complete gate is:

```text
Origins → Childhood → Active → Ending + full score
```

---

## 22. Explicit non-goals

This contract does not authorize:

- reopening frozen Childhood;
- Bounty Hunter V1 content;
- career-change content;
- Civilian profession state;
- `QuestState` / `ArcState` / duplicate Major Track progress state;
- a second inventory;
- a second crew or Companion-NPC model;
- a separate commerce engine;
- persistent Paradise `routeId` solely for authoring convenience;
- universal direct-destination navigation;
- player Conqueror's Haki in V1;
- a persistent `powerLevel`;
- mass Adult Family authoring before the minimal Active corridor is stable;
- finalizing the total Ending inventory before full-run playtests.
