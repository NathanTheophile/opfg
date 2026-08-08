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
- Initial Slice 0 stat values are temporary development fixtures and balancing remains undefined.
- Traits are persistent IDs with public definitions in the content catalog; `addTrait` and `removeTrait` are available effects.
- The current DiceCheck remains the legacy Slice 0 implementation until T10.
- Save schema version is 3; development saves from version 2 are intentionally rejected without migration.

---

## Current priority

1. Playtest and tune the locked Slice 0 content without changing its mechanics.
2. Begin final narrative writing and presentation work after validation.

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
