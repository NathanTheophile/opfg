# Architecture

The repository keeps four responsibilities separate: locale-neutral Content, pure Engine rules, JSON-compatible GameState, and React presentation. Engine APIs receive `ContentCatalog` explicitly; there is no content singleton or React dependency.

Powers V1 uses a JSON-compatible `PowerState` shared by Player and NPC. GameState/save v13 persists the owned Devil Fruit, its monotone Awakening (`0..10`) and three Haki levels (`0..5`). Fruit definitions and their physical Item references live in Content Schema v3. `src/game/engine/powers.ts` owns consumption eligibility and Player Haki threshold synchronization; React only presents the resulting state.

## Runtime state and time

Save v13 stores one clock, `ageMonths`, plus `slotInMonth: 0 | 1`. Origins ends at age 12. Childhood consumes eight annual slots followed by twelve half-year slots and enters Active at age 180. Outside Active the slot is always zero. In Active, slot zero becomes one without changing age; consuming slot one resets it and increments age by one month. Saves v7 à v10 sont migrées au chargement vers v13. La migration v9 initialise `agility` à 25 ; la migration v10 ajoute `familyStructureId` et `socialClassId` avec la valeur `null`.

The player owns a two-slot stack inventory and persistent Berrys. A nullable active `ship` is a named instance referencing an authored `ShipDefinition`; it owns current HP and cargo stacks. `pendingShip` exists only during deterministic Critical replacement. Ship type registries own maximum HP, NPC crew capacity, and cargo slots.

Crew membership remains the existing persistent NPC status `crew`; the player never consumes capacity. `isLeader` gates ordinary crew/ship management while explicit narrative Effects may bypass it. `passengerNpcIds` is the only passenger state and reserves one cargo slot per NPC without adding physical-presence simulation. Immutable crew roles live in `NpcDefinition` and are referenced through a small `crewRoles` registry.

History records the age after the resolved event consumed its slot. It is the authority for normal one-shot consumption. Critical events are recorded but consume neither time nor slots.

## Selection pipeline

Each selection restarts from the current state:

1. Critical: player, NPC by stable ID, then ship destruction, shipless-at-sea, or pending replacement. Exactly one is exposed to the UI.
2. Scheduled: due occurrence, cancellation/fallback, location reach, eligibility, then priority descending, due age ascending, ID ascending.
3. Normal: all eligible and unplayed definitions, uniformly selected with the seeded PRNG.

Scheduled selection never consumes RNG. A scheduled occurrence remains pending while ineligible or blocked by a location, and only the resolved occurrence is removed. Normal and scheduled events consume phase slots; critical events do not.

## Content Contract v3

`EventDefinition` is a discriminated union of `normal`, `immediate`, `scheduled`, and `critical`. Priority belongs only to scheduled definitions. Immediate definitions are explicit continuations queued by Effects; they never enter Normal selection and defer root-slot finalization until the chain is empty. Locations declare whether normal scheduled reach is blocked, whether ship sales are allowed, and whether docking is possible. Outcomes contain localization, identity, and effects only; phase rules own time advancement.

At an Active month boundary the engine may expose a monthly navigation decision before Event selection. This session prompt is derived from persisted GameState and is not an authored Event. The selection order is Critical, pending navigation when applicable, Immediate, Scheduled, then Normal; an already-started Immediate chain always completes before the next month prompt.

Each Event is stored as one JSON file under `src/game/content/events/**`, named after its `EventId`. `eventCatalog.ts` discovers these files recursively with an eager Vite glob, verifies filename/ID agreement, and sorts the resulting catalogue lexically by Event ID. Consequently, adding an Event requires no TypeScript import or manifest edit, while seeded selection receives a stable ordering on every machine and build.

`definitions.ts` retains the small shared registries and assembles them with this single auto-discovered Event catalogue. Temporary filler Events remain visibly isolated under `events/fixtures/`.

The validator checks structural combinations, references, localization, scheduled priorities/reach/fallback, critical triggers, dice contracts, and opposite traits. Persistent data contains only JSON values.

## Headless simulation and QA

`src/game/simulation/` is a headless driver over the public Engine APIs. It owns no gameplay rules. Automatic Choices use a deterministic PRNG stream separate from `GameState.rngState`, preserving gameplay rolls when simulation policy changes. Runs stop on career end, dead end, safety limit, or captured simulation error; batches aggregate progression, coverage, Dice, mortality, Traits, Items, pending Scheduled occurrences, and reproducible problem seeds.

Node CLIs read the same Event JSON filesystem and pass it through the same catalogue builder and registry factory as Vite. `validate-content` combines the authoritative validator with warning-only production diagnostics; `simulate` performs dynamic reachability sampling. See `SIMULATION.md`.
