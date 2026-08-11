# Architecture

The repository keeps four responsibilities separate: locale-neutral Content, pure Engine rules, JSON-compatible GameState, and React presentation. Engine APIs receive `ContentCatalog` explicitly; there is no content singleton or React dependency.

Powers V1 uses a JSON-compatible `PowerState` shared by Player and NPC. GameState/save v18 persists the owned Devil Fruit, its monotone Awakening (`0..10`), three Haki levels (`0..5`), the grouped `player.career` state, optional `endingId`, and NPC interaction timestamps. Fruit and Career definitions live in Content Schema v8. `src/game/engine/powers.ts` owns consumption eligibility and Player Haki threshold synchronization; React only presents the resulting state.

Content Schema v8 exposes the complete generic Career Rank ladders, Reputation clamped to `0..100`, persistent same-race Origins parents, the authoritative 188-Location World V1 runtime catalogue, controlled Location tags/services, `shipMarket`, Event cast metadata, and the 45-Fruit authoring registry. Only the 20 `playableV1` Fruits own consumable Items; reference-only Fruits remain usable for semantic NPC/event references.

## Runtime state and time

Save v18 stores one clock, `ageMonths`, plus the legacy-compatible `slotInMonth: 0 | 1`. Origins ends at age 12. Childhood consumes eight annual slots followed by twelve half-year slots and enters Active at age 180. Outside Active the slot is always zero. Active now consumes one root slot per month: once the root and its Immediate chain finish, age advances by one month and the runtime returns to slot zero. The value 1 remains accepted for old Saves and is normalized by the next consumed root. Saves v7 à v17 sont migrées séquentiellement au chargement vers v18 ; la migration v18 initialise la dernière interaction NPC à `null`.

The player owns a two-slot stack inventory and persistent Berrys. A nullable active `ship` is a named instance referencing an authored `ShipDefinition`; it owns current HP and cargo stacks. `pendingShip` exists only during deterministic Critical replacement. Ship type registries own maximum HP, NPC crew capacity, and cargo slots.

Crew membership remains the existing persistent NPC status `crew`; the player never consumes capacity. `isLeader` gates ordinary crew/ship management while explicit narrative Effects may bypass it. `passengerNpcIds` is the only passenger state and reserves one cargo slot per NPC without adding physical-presence simulation. Immutable crew roles live in `NpcDefinition` and are referenced through a small `crewRoles` registry.

History records the age of each resolved Event. It is the authority for normal one-shot consumption and replay cooldowns; no derived replay state is persisted. Critical Events are recorded but consume neither time nor slots.

## Selection pipeline

Each selection restarts from the current state:

1. Critical: player, NPC by stable ID, then ship destruction, shipless-at-sea, or pending replacement. Exactly one is exposed to the UI.
2. Scheduled: due occurrence, cancellation/fallback, location reach, eligibility, then priority descending, due age ascending, ID ascending.
3. Normal: all eligible one-shot definitions not yet played plus replayable definitions whose History-based cooldown and occurrence cap permit them, uniformly selected with the seeded PRNG.

Scheduled selection never consumes RNG. A scheduled occurrence remains pending while ineligible or blocked by a location, and only the resolved occurrence is removed. Normal and scheduled events consume phase slots; critical events do not.

## Content Contract v3

`EventDefinition` is a discriminated union of `normal`, `immediate`, `scheduled`, and `critical`. Every variant may declare `cast?: NpcId[]` as scene-participation metadata; resolving the Event updates `lastInteractionAgeMonths` only for cast NPCs already present in GameState, without changing status or relationship. Priority belongs only to scheduled definitions. Immediate definitions are explicit continuations queued by Effects; they never enter Normal selection and defer root-slot finalization until the chain is empty. Locations declare whether normal scheduled reach is blocked, whether ship sales are allowed, and whether docking is possible. Outcomes contain localization, identity, and effects only; phase rules own time advancement.

NPC Conditions support relationship lower bounds through the existing predicate, an upper bound through `npcRelationshipAtMost`, and interaction recency through `npcMonthsSinceInteractionAtLeast` / `npcMonthsSinceInteractionAtMost`. A never-interacted NPC fails both recency predicates.

At an Active month boundary the engine may expose a monthly navigation decision before Event selection. This session prompt is derived from persisted GameState and is not an authored Event. In the four Blues, a Leader with a ship can select a dockable destination on another island; selecting it changes the current Location and enters `at_sea` for that month's root Event, with docking available from the next monthly navigation prompt. Paradise destination options follow the authored forward route graph; other regions remain Event-driven. The selection order is Critical, pending navigation when applicable, Immediate, Scheduled, then Normal; an already-started Immediate chain always completes before the next month prompt.

Locations may form an acyclic parent hierarchy. Conditions can query the current sea or ancestor containment, and land departure resolves dock access through the current Location or its ancestors. If the Active Normal pool is empty, two excluded repeatable system Events recover land/sea travel; they add no persistent route state and are counted by simulation diagnostics.

Each Event is stored as one JSON file under `src/game/content/events/**`, named after its `EventId`. `eventCatalog.ts` discovers these files recursively with an eager Vite glob, verifies filename/ID agreement, and sorts the resulting catalogue lexically by Event ID. Consequently, adding an Event requires no TypeScript import or manifest edit, while seeded selection receives a stable ordering on every machine and build.

`definitions.ts` retains the small shared registries and assembles them with this single auto-discovered Event catalogue. Temporary filler Events remain visibly isolated under `events/fixtures/`.

The validator checks structural combinations, references, localization, scheduled priorities/reach/fallback, critical triggers, dice contracts, and opposite traits. Persistent data contains only JSON values.

## Headless simulation and QA

`src/game/simulation/` is a headless driver over the public Engine APIs. It owns no gameplay rules. Automatic Choices use a deterministic PRNG stream separate from `GameState.rngState`, preserving gameplay rolls when simulation policy changes. Runs stop on career end, dead end, safety limit, or captured simulation error; batches aggregate progression, coverage, Dice, mortality, Traits, Items, pending Scheduled occurrences, and reproducible problem seeds.

Node CLIs read the same Event JSON filesystem and pass it through the same catalogue builder and registry factory as Vite. `validate-content` combines the authoritative validator with warning-only production diagnostics; `simulate` performs dynamic reachability sampling. See `SIMULATION.md`.
