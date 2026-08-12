# OPFG — Content Bible Rules

> Status: **validated specialized content authority**.
> Goal: constrain mass Event generation so batches remain coherent, reusable and safe.

## 1. General batch rule

Every generated Event batch must explicitly declare the Content Bible IDs it is allowed to use.

A batch must not silently create new persistent definitions. New Trait/NPC/Item/Location/Ship/etc. proposals belong in a separate `PROPOSED_DEFINITIONS` section for human review.

## 2. Traits

- Binary only; no Trait levels.
- Symmetric oppositions are enforced when defined.
- Moral/personality Traits are valid; morality is not a score axis.
- A Trait should support at least five materially different Event uses.
- Traits must not duplicate numeric Stats or temporary states.
- Current validated launch set contains **28 Traits**: 10 opposite pairs + 8 independent Traits. See [Traits Catalog](TRAITS_CATALOG.md).

## 3. Locations

The authoritative V1 runtime catalogue is the 188-entry World V1 in `docs/content/locations/OPFG_WORLD_V1.json`, integrated through `src/game/content/data/locationsV1.json`: 20 Locations and exactly eight Birth Locations per Blue, plus 108 runtime Locations outside the Blues. Egghead and the other explicit reference-only entries are not runtime Locations.

### Granularity

Favor places where meaningful activities can happen:

- city;
- town/village;
- port;
- useful island zone;
- forest;
- desert;
- oasis;
- comparable reusable area.

Small islands may be Locations themselves. Do not model every building/room as a runtime Location.

Important sub-locations use `parentLocationId`.

### Origins coverage

- V1 Birth Locations are restricted to East/West/North/South Blue.
- Target at least **8 Birth Locations per Blue**.
- Add custom OPFG Locations only to fill meaningful gameplay/canon-coverage gaps.

### Controlled tags

Use the controlled vocabulary in [OPFG Location Tags](locations/OPFG_LOCATION_TAGS.md). Prefer a few strong tags rather than encyclopedic tagging.

### Services metadata

Locations should support authoring-oriented services metadata:

```text
food
lodging
general_goods
weapons
medical
trade
ship_repair
crew_recruitment
marine_services
black_market
```

This is Content Bible metadata first; V1 does not require a large dedicated runtime service system.

Events must respect Location activity context. Weapon purchases belong in suitable settlements/markets, not arbitrary forests unless specifically justified.

### Ship market

Replace the old boolean `allowsShipSale` concept with:

```ts
shipMarket: 'none' | 'small_craft' | 'full'
```

Rules:

- actual port city/village → at least `small_craft`;
- major port/shipyard → `full`;
- inland/wilderness/non-maritime context → `none`;
- every Blue should eventually contain at least one `full` ship market, custom if canon coverage is insufficient.

`allowsDocking` remains distinct from `shipMarket`.

### Scheduled blocking

Keep `blocksScheduledEvents` conservative; current special cases may include Impel Down, Mirror World, Moon and Space pending later review.

## 4. Devil Fruits

### V1 playable roster

The integrated authoring registry is `src/game/content/data/devilFruitsV1.json`: 20 entries marked `playableV1` receive runtime Items, while 25 reference-only entries remain available for canon NPC/Event references without becoming consumables.

- **20 playable canon Fruits** for launch.
- Additional canon Fruits may appear in lore, NPC references or Event text and do not count toward the 20 playable roster.
- Playable target distribution: **12 Paramecia / 5 Zoan / 3 Logia**.
- Ancient/Mythical Zoans excluded from V1 playable roster.
- Extremely powerful options excluded from V1 playable roster.
- Logia are allowed only when considered reasonable for V1 balance/content.
- Childhood acquisition is possible but extremely rare.

### Soft-canon ownership policy

Use selective soft-canon handling:

- iconic Fruits structurally essential to major canon characters should not be reassigned to the player;
- less canon-critical Fruits may be made playable when doing so does not create unacceptable contradictions;
- the Content Bible records known canon ownership and relevant temporal ownership windows.

V1 does not require a global runtime Fruit uniqueness registry. Authored content must prevent duplicate ownership of a playable Fruit within a run.

No automatic Fruit respawn after owner death; reappearance remains Event-driven. A global uniqueness/respawn system may be added later.

## 5. NPCs

- Target around 25 persistent NPC definitions for V1, plus canon characters as needed.
- Canon and original/generic NPCs are both allowed.
- Generic NPCs are important to avoid constant canon fan-service.
- Throwaway characters should remain Event-local text rather than persistent `NpcDefinition`s.
- CrewRole is fixed in V1.

### Origins family

Family structure uses two canonical persistent family identities:

- `father` — male;
- `mother` — female.

Runtime IDs may remain stable internally, but authored/player-facing content uses father/mother semantics rather than anonymous parent numbering.

Family structure resolves structural parent presence as follows:

- `two_parents` → father + mother;
- `single_parent` → exactly one parent, determined by the parental affiliation's locked `singleParentSex`;
- `orphan` → neither canonical parent by default.

The single-parent sex belongs to the complete Family Saga for that affiliation and is never rerolled per Event/chapter. It may remain `null` only while that affiliation has no production Family Saga; lock it before that Saga's Events are accepted.

V1 canonical parents inherit the player's Race when materialized; no hybrid parent system yet. Their inherited family affiliation is the player's parental affiliation, not a fixed generic NPC affiliation.

Once a parent has been materialized, current NPC status matters: `dead`, `departed`, and `unavailable` count as absent for later Family Saga variant selection.

Siblings are not generated systematically and appear only through authored content.

Do not enforce controlled culture/race name pools in V1. Sex-specific pools are allowed and must agree with the NPC's explicit sex; family naming otherwise remains free rather than prescriptively constrained.

Do not multiply Family Saga variants across every combination of family structure, Race, class, birthplace and history. A separate variant is justified only when an axis materially changes who acts, what happens, or the immediate stakes. Pure pronoun/agreement differences belong to localization.

## 6. Crew Roles

V1 roster:

- `navigator`
- `medic`
- `cook`
- `shipwright`
- `helmsman`
- `gunner`
- `musician`
- `scholar`
- `fighter`
- `quartermaster`

No `captain` CrewRole. Captain/command is structural/narrative leadership.

Crew roles provide no automatic global bonuses; Events explicitly query them.

## 7. Ships

V1 contains **six generic chassis only**:

1. `dinghy` — Chaloupe
2. `sloop` — Sloop
3. `caravel` — Caravelle
4. `brig` — Brick
5. `merchant_ship` — Navire marchand
6. `galleon` — Galion

Progression is trade-off based across HP / crew capacity / cargo, not strict vertical replacement.

### Named canon ships

Named canon ships may be referenced in lore and Event text but are **not obtainable** by the player in V1 and are not generic spawnable chassis.

### Markets

- `small_craft` → Chaloupe + Sloop.
- `full` → access to all generic V1 chassis, subject to authored price/context.

## 8. Event mix

Target:

- majority generic/reusable Events;
- roughly 25–35% strongly contextualized/local Events.

Generic does not mean context-blind: use Location/Career/Traits/etc. when appropriate.

## 9. Flags

Use Flags only when History, Traits, NPC state, Items or another existing persistent system cannot cleanly represent the information.

## 10. Mechanical rewards

Events may be purely narrative. Not every Event must alter a Stat or grant an asset.

## 11. Choice visibility — V1 marketing rule

For V1, condition-blocked Choices remain visible but disabled/greyed whenever possible, including Race/Trait/Haki/Devil Fruit-special options.

The deliberate goal is to expose the breadth of possible gameplay paths to players.

Use `availableIf` for disabled Choices. Do not rely on hiding special possibilities as the default V1 authoring pattern.

## 12. Career milestones

Promotions, bounty changes, rank/title changes and equivalent milestones are always narrated through Events. No silent automatic promotion.

## 13. Canon

Follow [World Timeline & Canon](../design/WORLD_TIMELINE_AND_CANON.md).

- Major canon outcomes are protected.
- Freedom belongs mainly in narrative interstices.
- Major canon-character encounters are rare and meaningful.
- Temporal metadata must prevent use of characters, organizations and Location states before/after their valid windows.

## 14. Origin Echo content

Origins are persistent content inputs.

A player's Race, family structure, inherited affiliation, social class and Birth Location must continue to create authored situations after character creation. Content should make these choices *felt* in fiction rather than merely testable by Conditions.

### Origin Echo families

Early-Childhood Origin Echo content is organized into:

- `origin_family` — household, parents, inherited affiliation, social class, domestic/work environment;
- `origin_race` — lived consequences of Race;
- `origin_birthplace` — Birth Location metadata, institutions, trades, climate and local habits;
- `origin_cross` — scenes whose premise materially requires at least two Origins axes at once.

An `origin_cross` Event must not be a generic scene with two decorative Conditions. Removing either axis should materially weaken or change the premise.

### World building through friction

World building belongs inside the situation, not in an added lore paragraph.

Good early-childhood props and institutions include, where contextually valid:

- Marine uniforms, barracks routines and drill equipment;
- wanted posters, contraband, pirate guests and hidden loot;
- ration bowls, locked doors, debt ledgers and workshop tools;
- castle servants, guards, heraldry and court routines;
- docks, cargo, shipyards, market bells and fishing gear;
- local weather, medicines, crops, industry and transport;
- social rules made visible through what another person does to the child.

The Event must still begin with a concrete situation and stay within the normal text budget.

### Race content balance

Race-specific content may include racism, prejudice and exclusion, including situations inspired by the social tensions of the setting. It must also include non-hostile experiences such as curiosity, practical adaptation, admiration, belonging, humor or positive contact.

For any substantial Race batch:

- hostility/discrimination must not be the only lens;
- avoid modern explanatory/social-science vocabulary inside Event prose;
- show prejudice through concrete behavior, restrictions, words and choices;
- do not use Race as shorthand for personality;
- do not reveal canon secrets merely to make a Race Event feel important.

### Childhood persistent NPC introduction

A generated display name is not an introduction.

Before ordinary Childhood content assumes familiarity with `childhood_friend` or `childhood_rival`, the run must contain a dedicated introduction scene.

A good introduction gives the player at least one memorable anchor:

- an object;
- a small conflict;
- a shared activity;
- a favor;
- a mistake;
- a challenge;
- a secret;
- a distinctive action.

Callbacks should reuse that anchor whenever practical.

### D1.9 persistent definitions

D1.9 Opening Breadth batches should reuse the current persistent cast unless a genuinely necessary new role is proposed:

- `player_parent_1`
- `player_parent_2`
- `childhood_friend`
- `childhood_rival`
- `childhood_younger`
- `neighborhood_merchant`

Throwaway adults/children remain local prose.

Do not proliferate persistent NPC definitions merely to increase breadth.

## 15. D2 V2 narrative-content architecture

<!-- D2_WAVE2_NARRATIVE_RESET:CONTENT_BIBLE_V2 -->
The D2 Content Reset separates **accepted V2 runtime concepts** from **legacy creative archives**.

### Major Family content

- Childhood guarantees exactly five Family Legacy chapters for the inherited playable affiliation.
- A chapter is a horizontal variant pool, not a fixed Scheduled chain.
- Race, family structure, current parent state, social class, History and location may select different variants when they materially change the scene.
- Do not create Cartesian coverage. Create a specialized variant only when the fiction is substantially different.
- Every chapter requires one safety fallback, but the fallback must not compete with eligible specialized variants.
- Five Family roots reserve 25% of Childhood; the rest of Childhood must remain broad.

### Current playable narrative surface

Family affiliations: `civilian`, `marine`, `pirate`, `revolutionary`, `royal_family`.

Visible but locked: `bandit`, `prisoner`, `slave`, `celestial_dragon`.

Races: `human`, `fishman`, `mink`, `giant`.

Visible but locked: `longarm`, `buccaneer`.

### Origin Cross mini-arcs

Origin Cross content recognizes unusually specific combinations. It is secondary biography, not the career-long spine. Typical shape: one concrete root, 1–3 Immediate continuations when justified, and optionally a later Scheduled callback. The 5 × 4 playable Affiliation/Race surface gives 20 useful eventual pairings, but no batch should create filler simply to tick a matrix cell.

### Archive policy

- `docs/content/events/v2/EVENT_CONCEPT_INDEX_V2.md` is the accepted V2 ledger.
- `docs/content/events/legacy/` is non-authoritative reference material.
- D1.9 seeds preserve premise/friction/world detail only; they are not accepted V2 EventDefinitions.
- Production GPT conversations must not receive the complete legacy index/archive by default. Curate only the small seed subset relevant to the batch.
- Deliberate reuse is recorded in `docs/content/events/migration/V2_CONCEPT_MIGRATION_LEDGER.md`.

See `docs/design/MAJOR_NARRATIVE_TRACKS.md` for the orchestration contract.

## 15. D2 V2 economy handoff

The specialized authority for Item persistence, stack limits, Berrys and generic market pricing is [Economy & Items](../design/ECONOMY_AND_ITEMS.md).

For V2 production:

- do not invent item prices independently in batches when a generic market definition exists;
- use atomic `buyItem` / `sellItem` for ordinary generic transactions;
- unique story objects and Devil Fruits remain non-market unless explicitly designed otherwise;
- Childhood social class is household context, not an automatic personal wallet.
