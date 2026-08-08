# Jam State

## Current playable state

A complete functional Vertical Slice 0 career is browser-playable with the nine locked catalog events:

```text
Departure -> Mira Castaway -> Black Squall -> Wreck -> Reefs
-> Mira mini-arc and/or delayed favor
-> Year One End
```

The temporary demonstration content has been removed. The real Slice 0 exercises deterministic and seeded d20 choices, locked/hidden choices, persistent Mira status and relationship, the recruited Mira mini-arc, Mira’s scheduled return favor, and career endings through Year One End. One versioned localStorage slot preserves the complete post-resolution GameState; dice display results remain transient UI data.

---

## Locked technical decisions

- React + Vite + TypeScript.
- Vitest for high-value automated tests.
- Data-driven narrative content.
- One persistent `GameState` as career source of truth.
- GameState must be directly JSON-serializable.
- `Array` / `Record` for persistent collections; no persistent `Set` or `Map`.
- No duplicate derived state.
- No `usedEvents` in Slice 0; played events are derived from `history`.
- No generic `ArcState` in Slice 0.
- Seeded RNG; no gameplay use of `Math.random()`.
- Conditions/effects use TypeScript discriminated unions.
- Content contains no arbitrary callbacks.
- Save uses one `localStorage` slot.
- No backend for Slice 0.
- React does not own gameplay rules.
- `careerPhase` (`origins`, `childhood`, `active`) is distinct from run `careerStatus`; the current VS0 starts directly in `active`.
- `ageMonths` is absolute age; `month` is elapsed active-career time and remains zero outside the active phase.
- `travelState` (`at_sea` / `on_land`) is the broad geographic context; `locationId` remains the precise location.
- Location effects update `travelState` and `locationId` atomically.
- The player profile uses `health`, `morale`, `strength`, `observation`, `intelligence`, `navigation`, `charisma`, `luck`, and nullable `awakening`.
- `awakening: null` means the stat is inaccessible; a number means it is active. No Devil Fruit mechanics exist yet.
- Active stats use `0–50`; initial Slice 0 values are the neutral temporary fixture `25` and balancing remains undefined.
- Traits are persistent IDs with public definitions in the content catalog; `addTrait` and `removeTrait` are available effects.
- DiceCheck vNext uses one main stat, the `20–30` neutral zone, `±1` per four points, four Outcomes, absolute critical failure on raw 1, critical success at total 20+, and a per-check success threshold.
- Dice probabilities enumerate all 20 raw rolls, exclude secret Trait overrides, and are never persisted.
- The legacy Dice bands, stat multipliers, and influence labels have been removed.
- Scheduled consequences use `dueAgeMonths`, derived from absolute `ageMonths`, so they also work outside active career.
- `hasPlayed`, `hasChosen`, and `hasOutcome` derive distinct historical facts from `history`.
- `careerEndReason` is persisted as `death` or `legacy`; current VS0 endings provisionally use `legacy`.
- Trait definitions support validated symmetric `oppositeTraitId` references. Runtime opposite removal during `addTrait` is intentionally deferred to avoid coupling the engine to global content.
- NPC profiles persist eight `0–50` stats: health, morale, strength, observation, intelligence, luck, loyalty, and calm.
- NPC `relationship` remains a separate `-100..100` relation with the player. Loyalty describes general reliability/commitment and does not mirror relationship; calm describes control under pressure.
- The Event contract exposes `npcStatAtLeast` and `modifyNpcStat`; no NPC DiceCheck or autonomous behavior exists.
- Mira uses neutral development fixtures at 25 in both her content definition and initial state. This small duplication is intentional to keep Content and initial runtime state decoupled.
- Save schema version is 6; development saves from version 5 are intentionally rejected without migration.
- Player identity is a separate nullable `PlayerProfile` (`name`, `raceId`, `originSeaId`, `affiliationId`) filled by Origins Events. Race, sea, and affiliation definitions are data-driven registries; the current catalogs are deliberately minimal fixtures.
- The playable fixture pipeline now starts in Origins, progresses through four Childhood age bands using the Event engine and absolute-age scheduler, transitions at 180 months, then enters the unchanged adult Slice 0 with `month = 0`.
- History records both active-career `month` and absolute `ageMonths` after each Outcome.

---

## Current priority

1. Replace temporary Origins/Childhood registries and fixtures only when final Game Design is provided.
2. Playtest and tune the locked adult Slice 0 without changing its mechanics.

---

## Open questions

None blocking implementation.

Game-design ambiguities discovered during implementation must be returned to the Game Design conversation rather than decided inside Codex.

---

## Known bugs

None yet.

---

## Deferred

Do not implement yet:

- backend/cloud/accounts;
- multiple save slots;
- economy;
- factions;
- reputation system;
- XP/levels;
- quantitative inventory;
- generic crew roles/stats;
- generic recruitment;
- complex injuries/combat;
- multiple ships;
- ship modules/upgrades;
- map travel/distances;
- repeatable events/cooldowns;
- dynamic event weights;
- generic arc system;
- generic memory system;
- NPC-to-NPC relationships;
- quests;
- complex journal;
- inline conditional narrative text;
- procedural narrative generation;
- multiplayer;
- content editor.
