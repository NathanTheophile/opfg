# OPFG — Active V1 Batch Contract

> **Status: authoritative specialized Active V1 production contract.**
>
> **Scope:** Active ordinary Event batches, career-content batches, Active Lifetime Threads, career narrative spines, travel/local-life content, and the first complete Active → Ending production corridor.
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

The V1 career horizon is **35 years old = 420 ageMonths**.

This horizon is a **normal V1 Ending**, not a hidden 40-year safety fallback. Authored accomplishment Endings and death may end a run earlier, but a surviving run that reaches 420 months must terminate cleanly through the horizon Ending.

The intended V1 life span is broad enough for strong/long runs to reach their thirties. Production should support runs ending roughly across **30–40 years old** rather than forcing every career into one exact age.

### 2.3 Active opener

The first normal Active experience must include a **mandatory, career-aware opener around age 15**.

The opener should be selected from a small contextual pool using the actual state where useful:

- starting career;
- current Location;
- Family/Origins History;
- existing NPC relationships;
- inherited assets/Traits;
- current ship/crew state.

Do not create a Cartesian opener matrix. The purpose is to make the handoff feel lived, not to reskin one scene for every origin combination.

A character reaching Active through the Civilian handoff receives an **initial career-selection scene**, normally framed as a social conversation such as several people talking in a tavern. That scene may offer exactly:

- remain `civilian`;
- become `pirate`;
- join the `marine`;
- join the `revolutionary` path.

This one age-15 choice is the **initial Active career selection**, not a mid-career affiliation-change system. `bounty_hunter` is never offered. Once the Active opener has resolved, V1 authored content does not change the player's career affiliation.

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

### 3.1 Career selection lock

The engine may retain generic career-change capability, but V1 authored content must not offer mid-career affiliation changes.

The **only** V1 exception is the initial age-15 Civilian handoff described in §2.3, which establishes the player's Active career before ordinary Active progression begins.

After that opener:

- no Civilian → Pirate/Marine/Revolutionary conversion Event;
- no Pirate/Marine/Revolutionary → another career conversion Event;
- no leaving then rejoining an organization;
- no Bounty Hunter route.

This is a V1 scope lock, not a permanent engine limitation.

### 3.2 Civilian

Civilian is a complete career identity, not a temporary waiting room and not a `professionId` system.

For V1:

- the player may simply remain `civilian` after the age-15 opener;
- commercial contacts, trading and an increasingly useful network may become more visible after roughly the first Active year;
- those developments are represented only through existing Events, History, NPC relationships, Reputation, Berrys, Items and Ships;
- no profession state, profession menu, profession rank, business-management subsystem, organization stats or second affiliation is added.

Future post-V1 Civilian content may represent medicine, exploration, craft, navigation, local leadership or other life paths without changing the career model.

### 3.3 Pirate

A player entering Active as Pirate is a Pirate immediately, but receives **no automatic guarantee** of:

- a ship;
- crew members.

The player is the implicit captain/leader for personal-crew purposes and does not consume a CrewRole.

Pirate progression is read through the combination of Reputation, bounty, crew, ship, titles/exploits and History. Pirate has no rigid rank ladder.

### 3.4 Marine and Revolutionary

Early Marine progression is intentionally structured around superiors, assignments and institutional transport. A Marine does not need a player-built personal crew to remain progressable during the first Active years.

A Revolutionary begins as a recognized member of the movement but should become **personally autonomous fairly quickly**. Institutional help and transport may exist, but Revolutionary V1 should still support obtaining a personal ship and building a recurring crew like Pirate/Civilian.

Authored institutional Marine/Revolutionary transport may use a real temporary `ShipState` when the scene requires a concrete vessel. This does not create a second ship system.

For Marines, later promotion/command milestones may assign subordinates. These subordinates are **real persistent NPC crew members**:

- they have normal NPC state and relationship;
- they have one fixed CrewRole;
- they consume normal ship crew capacity;
- they are assigned by authored Events, never silently by the rank system.

### 3.5 Reputation, bounty and promotion

Reputation remains one global `0..100` **notoriety/fame** value, not morality.

For V1 authoring:

- Reputation is **monotonic**: it accumulates and does not decrease;
- high Reputation means the player is widely known, whether admired or hated;
- Reputation thresholds may select Events and unlock/lock Choices;
- Pirate bounty is a separate value influenced by crimes/exploits and by authored narrative tiers/pivotal Events;
- an active Marine must not receive a bounty in V1.

Marine/Revolutionary promotions require both:

1. the authored criteria to be satisfied;
2. a dedicated promotion Event.

A resolved promotion is not refused through a second generic confirmation. Exceptional feats may justify rapid advancement; do not impose artificial minimum age or tenure when the fiction and criteria already support the promotion. Career progression should remain reasonably regular rather than forcing multi-year stagnation solely for pacing.

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

Major career chapters normally use this same short-scene shape.

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
- the thread must not duplicate the main career narrative spine.

The manifest must identify the seed, recurring anchor, expected age span, major divergences, and intended reconvergence/termination behavior.

---

## 8. Career narrative spine — V1 target

There is **no Personal Affiliation gameplay system in V1**. The player has one career affiliation/way (`civilian`, `pirate`, `marine`, `revolutionary`), period.

If legacy schema/authoring metadata still uses a label such as `personal_affiliation` for a Major Narrative Track type, that label is an internal compatibility detail only. It does **not** authorize a second affiliation, organization state, fleet/cell/company management layer, or organization statistics.

### 8.1 Start

The main career narrative begins after the mandatory Active opener and a small amount of ordinary Active life. Major career progression may become visible around the first year when appropriate, but exact milestones remain content-driven rather than a universal profession menu.

### 8.2 Structure

The full V1 production target is approximately **10–14 major chapters per career**.

Chapters are milestone-driven. Eligibility may react to:

- career affiliation/state;
- Reputation;
- rank where applicable;
- bounty where applicable;
- History and prior outcomes;
- crew/ship/NPC state;
- geography;
- assets;
- Traits/powers;
- broad age windows when useful.

A normal chapter is a structural root with roughly **1–3 Immediate continuations** when dramatic depth warrants it.

Do not add a generic quest state, organization state, persistent saga counter or second affiliation if current MajorTrack metadata + History can represent progression.

### 8.3 V1 career trajectories

V1 needs main-career narrative coverage for:

- Civilian — with commerce/networking as a recurring content theme, not a management subsystem;
- Pirate;
- Marine;
- Revolutionary.

Bounty Hunter has no V1 trajectory.

### 8.4 Vertical-slice allowance

The first end-to-end vertical slice may implement a thin reachable corridor through each career before the complete 10–14-chapter breadth exists. This does **not** lower the final production target.

---

## 9. Adult Family coexistence

Adult Family remains a distinct Major Narrative Track continuation and should be **regular but secondary** to the main career flow.

Its Active chapters use broad age windows + current family/History state, not a copy of the five fixed Childhood checkpoints.

Career narrative and Adult Family may both become due. Runtime selection must prevent either from starving the other through an overdue/fairness mechanism. No arbitrary permanent priority between the two is locked by this contract.

Family NPCs may become crew when the fiction and normal recruitment conditions support it. Childhood NPCs may also return as important Active characters without joining the crew.

Adult Family mass-authoring may remain deferred until the minimal Active corridor is stable, but the Active architecture must not block this coexistence.

---

## 10. Local life and departure

There is **no permanent “Take the sea” button** in ordinary Active play.

On land, departure is offered through a **non-root System Event** that consumes neither the monthly root nor biological time. It becomes eligible when either:

1. the player has spent **more than 6 biological months physically in the current Location**; or
2. the current Location has **no eligible local root Event left**.

The six-month timer counts biological months spent physically in the Location regardless of whether the resolved root was ordinary, Family, career or another valid local narrative root.

The System Event offers at least:

- take the sea;
- stay.

If the player chooses **stay**:

- while eligible local roots remain, the departure opportunity is deferred for **6 months**;
- when no eligible local root remains, the departure opportunity may immediately reappear in a loop until the player leaves or another authored option becomes available.

Normal self-directed sea departure requires a usable personal ship and leadership. A player without a personal ship may still use **authored transport opportunities** (merchant passage, institutional movement, escort, etc.) when the fiction supports them.

Acquiring even a small personal vessel may immediately surface the non-root departure opportunity; buying a first dinghy does not require a ceremonial major Event.

---

## 11. Ordinary Blue travel

Normal travel in the four Blues is intentionally not direct destination selection.

For a Leader with a usable personal ship:

```text
on_land
→ non-root departure System Event
→ at_sea
→ one or more maritime monthly roots
→ after each maritime root, seeded arrival resolution may continue travel or land
→ on arrival, destination is seeded among valid destinations in the current Blue
```

Rules:

- the player chooses **whether to depart**, not the exact ordinary Blue destination;
- normal departure does not pre-lock a destination;
- a typical Blue crossing lasts **1–3 maritime roots/months**;
- arrival probability rises as the crossing continues and may also be modified by zone, ship, Navigator and authored circumstances;
- maritime content mixes danger, weather, encounters, opportunities, calmer beats, ship/crew pressure and navigation problems;
- the maritime pool should be riskier than ordinary land life;
- losing a ship at sea opens survival/rescue/wreck/capture-style content rather than automatic death.

Travel **without a personal ship** uses authored transport when fiction supports it. Such abstract/institutional transport is instant at the monthly-root level: it does not force the player through the personal-ship maritime root loop unless the Event explicitly turns the transport into a concrete playable ship situation.

---

## 12. Navigator annual power

A usable crew NPC with fixed CrewRole `navigator` unlocks the existing annual Navigator power through the existing crew-role power surface.

The power is usable **once per biological year** according to the existing annual crew-role power system and is unavailable if the Navigator is no longer a usable crew member.

### 12.1 Blues

When activated from one of the four Blues, Navigator allows direct choice of:

- any compatible runtime destination in the current Blue;
- **Reverse Mountain**.

The move resolves immediately at the gameplay level and consumes no monthly root.

### 12.2 Paradise

Navigator destination-jump is **disabled when activated from Paradise**.

Paradise uses its seeded authored route progression and Log Pose travel rules.

### 12.3 New World

When activated from the New World, Navigator allows direct choice of **any compatible maritime runtime Location in the world**, including valid destinations in Paradise and the Blues.

This is an explicit exception to ordinary navigation.

### 12.4 Reverse Mountain access

Reverse Mountain is not reachable through ordinary random Blue arrival.

V1 access paths are:

1. annual Navigator power while in a Blue;
2. rare explicitly authored narrative opportunities;
3. authored Marine institutional transport.

Do not add a generic high-Navigation-stat or Log Pose bypass.

Reverse Mountain is a **mandatory multi-Event mini-arc** before Twin Capes rather than an instant one-click transition.

---

## 13. Paradise and New World

Reverse Mountain → Twin Capes remains the common Paradise ingress.

At Twin Capes, one of the **seven authored Paradise routes is seeded definitively** for the run.

Paradise:

- ordinary progression follows that seeded route rather than offering free destination selection;
- Navigator direct-jump cannot be activated from Paradise;
- with a compatible Log Pose, crossings use the normal intended number of maritime roots;
- without a Log Pose, crossings require roughly **double the normal maritime roots** and inject additional dangerous roots into the eligible sea pool;
- route identity should remain derivable through authored route-start/History structure when practical rather than adding a new persistent `routeId` solely for convenience.

New World:

- ordinary navigation is **much freer** than Paradise and may be random/Event-driven or offer broader authored movement according to content;
- the Navigator annual power is the explicit global direct-destination exception;
- the New World should become a substantial part of strong/long V1 runs rather than merely an end-card destination.

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

Civilian V1 content should use commerce and recurring contacts as narrative themes while staying entirely inside the existing Event/History/NPC/Reputation/Berrys/Item/Ship primitives.

---

## 15. Crew and persistent NPC budget

Crew member = persistent NPC with status `crew`.

Companion = animal Item and never a crew NPC.

CrewRole is fixed for the NPC in V1. The player is the implicit captain/leader for a personal crew and does **not** occupy a CrewRole.

Active authoring should respect a total V1 persistent-NPC target of roughly **25 definitions**. Reuse established NPCs aggressively and keep throwaway characters in local prose.

Childhood and Family NPCs may become crew in Active when the fiction and normal conditions support it. Childhood NPCs may also recur without becoming crew.

### 15.1 Capacity before and after the first ship

Before owning a ship, the party may contain **three people total including the player**: therefore at most **2 crew NPCs**.

Those NPCs are genuine persistent crew members. The absence of a ship prevents normal self-directed sea departure; it does not prevent the first two recruitments.

Once a ship is owned, the only crew-size limit is the vessel's existing `crewCapacity`. Do not add a second global crew cap.

A player who invests heavily in crew building may reasonably reach roughly **4–5 people total around age 18**, provided the owned ship supports that capacity.

### 15.2 Early Active recruitment pressure

The first three Active years are a deliberate crew-building window for:

- `civilian`;
- `pirate`;
- `revolutionary`.

The window is exactly:

```text
180 <= ageMonths < 216
```

During those 36 monthly roots, ordinary/career content must be strongly punctuated by **2–4 Event recruitment mini-arcs** that can lead to recruiting a persistent crewmate.

Candidate pool:

- mix new Active NPCs with eligible established Childhood/Family NPCs;
- an established Childhood candidate requires a **strict authored minimum relationship threshold** before their recruitment route is eligible;
- a failed recruitment arc may permanently close that candidate when authored History/outcome conditions encode the failure.

Early recruitment should prioritize:

- `navigator`;
- `medic`;
- `cook`;
- `shipwright`;
- `fighter`.

`gunner`, `musician`, `scholar`, `helmsman` and `quartermaster` should appear mainly after age 18 unless a specific story strongly justifies an earlier candidate.

Each recruitable persistent NPC keeps exactly one fixed CrewRole in V1. Recruitment-focused Event eligibility must respect role occupancy:

```text
target role R
→ Event eligible only if NOT hasCrewRole(R)
→ normal leader recruitment may also gate on canRecruitNpc(candidate)
→ authored non-leader recruitment uses setNpcStatus(... allowWithoutLeadership: true)
```

Therefore:

- if the target CrewRole is already occupied by a current crew NPC, the **entire recruitment-focused Event is ineligible**;
- do not surface the Event with a permanently locked recruit Choice when recruitment is its main purpose;
- if a role becomes vacant because its crew NPC dies or otherwise ceases to be crew, future recruitment content for that role may become eligible again;
- use existing `hasCrewRole` + `not` Conditions rather than duplicate vacancy state;
- no systematic post-recruitment personal mini-thread is required;
- no crew-to-crew relationship subsystem is added;
- no voluntary crew dismissal, betrayal or departure system is authored in V1;
- avoid temporary crew capture/separation states in V1;
- a crew-role power is unavailable when its holder is not a usable current crew member;
- crew death is permanent and immediately frees the role.

Marine is intentionally excluded from this early recruitment-density requirement. Early Marine progression must remain viable through superiors, assignments and institutional transport without a player-built crew.

Revolutionary institutional support is allowed, but it must not replace the intended progression toward an autonomous personal crew and ship.

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

Normal Endings become reachable from career accomplishment/state, death, or the V1 career horizon.

The **35-year / 420 ageMonths horizon is a normal terminating Ending** for a surviving run that has not already ended. It replaces the older 40-year safety-net assumption.

Retirement may also be presented earlier when an authored Event supports that Ending opportunity.

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
→ contextual opener / initial career lock
→ ordinary local/career life
→ visible career progression
→ travel or authored transport where relevant
→ persistent consequences
→ reachable Ending (including the 420-month horizon)
→ full six-axis score/final screen
```

The gate must also prove:

- zero normal starvation/dead-end terminations;
- every healthy Active month produces one monthly root;
- land/sea fallbacks remain diagnostic safety, not normal content;
- no permanent monthly destination-selection UI blocks Event selection;
- land departure is a non-root System Event after >6 months in place or local-root exhaustion;
- choosing stay defers the offer 6 months while roots remain and may loop immediately when exhausted;
- normal Blue self-travel requires a ship, sustains 1–3 typical maritime roots and arrives without exact destination selection;
- Reverse Mountain ordinary access is excluded; Navigator/rare authored/Marine routes obey §12;
- Reverse Mountain multi-Event passage and Twin Capes seeded Paradise route work;
- Log Pose vs no-Log-Pose Paradise crossing pressure is observable;
- at least one path can progress substantially into the New World;
- `royal_family` is unavailable to new Origins selection while existing Royal states remain compatible;
- Civilian/Pirate/Revolutionary runs receive recurring recruitment mini-arcs during `180 <= ageMonths < 216`;
- no shipless state can exceed **2 crew NPCs**;
- recruitment-focused Events never target a CrewRole already occupied by current crew;
- early Marine progression remains viable without requiring a player-owned crew;
- no Bounty Hunter or post-opener career-change Event becomes reachable.

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
- for batches touching ages 15–18: recruitment mini-arc roots by career, targeted CrewRole, relationship gate when reusing a Childhood NPC, failure-closure behavior, and vacancy gate;
- for travel batches: departure System Event trigger/cooldown behavior, typical sea-root counts, arrival logic and special-route exclusions;
- Power interactions;
- possible Ending interactions;
- starvation/fallback concerns;
- confirmation that no career-change or Bounty Hunter route is authored.

---

## 20. Acceptance checklist

A standard Active V1 batch fails review if any of the following is true:

1. it exposes Bounty Hunter or a post-opener affiliation-change route;
2. it adds a Civilian profession, Personal Affiliation, organization/fleet/cell/business-management subsystem;
3. its root Dice percentage is outside **55–65%** without an explicit approved exception;
4. fewer than roughly **40%** or more than roughly **50%** of roots open meaningful Immediate mini-arcs without a justified domain-specific reason;
5. it lacks its one primary Lifetime Thread;
6. its Lifetime is only a cosmetic callback or duplicates the main career spine;
7. risky failures are routinely consequence-free;
8. it adds new persistent state where History/current state already suffices;
9. it assumes direct player destination choice for ordinary Blue travel;
10. it exposes a permanent monthly “take the sea / choose destination” UI for ordinary travel;
11. it lets ordinary random Blue travel reach Reverse Mountain;
12. it makes Navigator destination-jump activatable from Paradise;
13. it creates a second crew, Companion-NPC model, market, profession, route, quest or career system;
14. it silently promotes/ranks/assigns Marine crew without an authored Event;
15. it awakens player Conqueror's Haki in V1;
16. it consumes the monthly root merely because a System Event such as market/departure was opened;
17. it makes the normal departure System Event available before >6 months in the Location while eligible local roots remain, except an explicit immediate post-ship-acquisition hook;
18. choosing stay cannot produce the required 6-month deferral / exhausted-location loop behavior;
19. it treats 420 ageMonths as non-terminating or reintroduces a required 480-month safety horizon;
20. it makes `royal_family` selectable in new V1 Origins before the dedicated Royal Childhood → Active transition exists;
21. a recruitment-focused Event for Civilian/Pirate/Revolutionary ages 15–18 can be selected while its target CrewRole is already occupied;
22. a shipless party can contain more than **2 crew NPCs**;
23. an early Marine corridor requires the player to own/build a personal crew in order to keep progressing;
24. a Paradise crossing without Log Pose is no more demanding than the equivalent valid Log Pose crossing without an explicit exception;
25. it cannot participate in a complete Active → Ending + score corridor.

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
- `horizonEnding`;
- `finalCareer`;
- `locationsVisited`;
- `careerProgress`;
- `recruitmentOffers` by career during `180 <= ageMonths < 216`;
- `crewCountAt216` and `crewRolesOccupiedAt216`;
- shipless crew-cap violations;
- duplicate-role recruitment offers suppressed / observed;
- land departure offers / stay deferrals / exhausted-location repeat offers;
- maritime roots per crossing and Blue arrival distribution;
- Paradise crossing root counts with vs without Log Pose;
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
- any player-facing Personal Affiliation / organization / fleet / cell / company-management state;
- `QuestState` / `ArcState` / duplicate Major Track progress state;
- a second inventory;
- a second crew or Companion-NPC model;
- a separate commerce engine;
- persistent Paradise `routeId` solely for authoring convenience;
- permanent monthly navigation/destination UI;
- universal direct-destination navigation;
- player Conqueror's Haki in V1;
- a persistent `powerLevel`;
- mass Adult Family authoring before the minimal Active corridor is stable;
- finalizing the total Ending inventory before full-run playtests.
