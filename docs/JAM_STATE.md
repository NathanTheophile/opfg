# Jam State

## Current playable state

A deterministic browser-playable loop is available with temporary normal and scheduled events:

```text
Departure
-> Open Sea
-> A Delayed Warning (scheduled for month 2)
-> The Reefs
-> temporary career end
```

The runtime evaluates Slice 0 Conditions, exposes visible/available choice state, resolves deterministic and seeded d20 choices, applies Effects immutably, advances time and records history. Due eligible scheduled events take priority over normal eligibility/priority selection; ineligible entries remain queued until they become valid and resolved entries are consumed. One versioned localStorage slot automatically saves the complete post-resolution GameState, including RNG, current event and scheduled consequences. Dice display results remain transient UI data.

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

1. Replace temporary events with the Slice 0 test content and Mira mini-arc.
2. Complete the first playable career through month 12.

---

## Open questions

None blocking implementation.

Game-design ambiguities discovered during implementation must be returned to the Game Design conversation rather than decided inside Codex.

---

## Known bugs

None yet.

---

## Current runtime limits

- Current narrative content is temporary test content only.

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
