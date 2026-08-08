# Architecture

## Goal

Ship a stable, editable narrative game within a 72-hour jam.

Optimize for:

**player value / development time**

The architecture only needs to support the current game cleanly. It is not intended to become a generic narrative framework.

---

## Core flow

```text
Content
   ↓
Engine
   ↓
GameState
   ↓
React UI
```

### Content

Contains declarative game data:

- events;
- choices;
- conditions;
- outcomes;
- effects;
- dice checks;
- traits;
- items;
- NPC definitions.

Content may reference gameplay entities through stable IDs.

Content must not contain arbitrary JavaScript callbacks or gameplay functions.

Events marked `scheduledOnly: true` are excluded from the normal event pool. They can only be selected from a due `GameState.scheduledEvents` entry; due but currently ineligible entries remain queued.

### Engine

Owns gameplay rules.

Typical responsibilities:

- evaluate conditions;
- determine eligible choices/events;
- select the next event;
- resolve deterministic outcomes;
- resolve seeded dice checks;
- apply effects;
- advance time;
- process scheduled events;
- save/load normalization.

The engine must not depend on React.

### GameState

Single source of truth for the current career.

Persistent state must be plain JSON-compatible data:

- objects;
- arrays;
- strings;
- numbers;
- booleans;
- `null` where needed.

Do not persist:

- `Map`;
- `Set`;
- `Date`;
- class instances;
- functions;
- callbacks.

Do not store values already derivable from authoritative state.

For Slice 0:
- event consumption is derived from `history`;
- no `usedEvents`;
- no generic `ArcState`.

Career time and geography use distinct authoritative fields:

- `careerPhase` identifies origins, childhood, or active career; `careerStatus` independently says whether the run has ended;
- `ageMonths` is absolute biological age and advances whenever an outcome advances time;
- `month` is elapsed time since the active career began and advances only during the active phase;
- `travelState` identifies sea or land while `locationId` identifies the precise location;
- `moveToLocation` updates `travelState` and `locationId` together.

The persistent player profile contains eight normally active numeric stats: `health`, `morale`, `strength`, `observation`, `intelligence`, `navigation`, `charisma`, and `luck`. `awakening` is `null` while inaccessible and numeric only when active. Slice 0 initializes these values with temporary development fixtures; balancing is not defined yet.

Player Traits remain persistent `TraitId[]` values. Their public names and descriptions live in the content catalog, while `addTrait` and `removeTrait` update the profile idempotently. The existing DiceCheck remains the temporary Slice 0 implementation until T10.

### React UI

Displays GameState and engine results.

React may:
- render events;
- render visible/locked choices;
- display dice results;
- trigger engine actions;
- display save/new/restart controls.

React must not duplicate gameplay rules.

---

## Event resolution pipeline

Normal event flow:

```text
Eligible
→ Priority
→ Seeded selection
→ Choice
→ Resolution
→ Effects
→ Time advance
→ GameState
→ Save
→ Next event
```

Scheduled events use absolute age: `dueAgeMonths` is computed from `ageMonths + delayMonths`. Entries due at the current age are considered before normal events, subject to eligibility, and are consumed only when the selected occurrence is actually resolved.

Historical Conditions derive exclusively from `history`: `hasPlayed` checks an Event, `hasChosen` checks an Event/Choice pair, and `hasOutcome` checks an Event/Outcome pair.

`careerEndReason` is `null` during an active career and records `death` or `legacy` when `endCareer` ends it. `setCareerPhase` changes only the phase and has no implicit time, location, Event, or profile effects.

Trait definitions may declare a symmetric `oppositeTraitId`. Content validation enforces valid, non-self, symmetric references. Runtime enforcement during `addTrait` remains deferred until the engine can receive definitions without coupling gameplay state to global content.

RNG is applied only after invalid candidates have been filtered.

---

## Data conventions

Use discriminated unions for declarative gameplay data such as:

- `Condition`;
- `Effect`;
- `Resolution`;
- `DiceModifier`.

Prefer classes only where runtime encapsulation or dependencies provide real value, for example an engine/session/service.

Persistent content/state remains plain data.

---

## Saves

Initial persistence:

- one local slot;
- `localStorage`;
- versioned GameState;
- automatic save after resolved outcomes;
- normalize/restore function when loading.

A save must preserve seeded RNG state and scheduled consequences.
Save schema version 4 persists age-based scheduled events and `careerEndReason`. Development saves from version 3 are rejected without migration.

---

## Testing priorities

High-value tests only:

1. GameState JSON round-trip.
2. Condition evaluation.
3. Effect application.
4. Event eligibility/selection.
5. Choice visibility/availability.
6. Seeded RNG/dice resolution.
7. Scheduled event behavior.
8. Save/load.
9. Content reference validation.
10. Automated career simulations once the engine loop exists.

UI is primarily validated through fast manual browser playtests during the jam.

---

## Scope rule

A new abstraction is justified only if it:

- removes significant repeated content work;
- prevents recurring bugs;
- is required by a locked mechanic;
- makes current game-design iteration substantially safer.

Otherwise, defer it.
