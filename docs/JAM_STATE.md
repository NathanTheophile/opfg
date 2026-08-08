# Jam State

## Current playable state

No implementation started yet.

The vertical slice contract is locked sufficiently to begin repository bootstrap and engine implementation.

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

---

## Current priority

1. Bootstrap repository.
2. Define Slice 0 model types and initial GameState.
3. Verify JSON round-trip.
4. Implement Condition / Effect / EventDefinition contracts.
5. Add minimal content validator.
6. Implement event resolution loop.
7. Reach first browser-playable Event → Choice → State → Next Event flow.
8. Add scheduled consequences, seeded dice, save/load and Mira test content.

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
