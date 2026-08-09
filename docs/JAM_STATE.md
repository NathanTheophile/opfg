# Jam state

Implemented and verified:

- Content Contract v2 with Normal, Scheduled, and Critical event variants;
- one JSON file per Event, recursively auto-discovered and deterministically sorted by Event ID;
- save/GameState v11 with v7-v10 migration, unbounded player health, D20-only attribute IDs, complete Origins profile, leadership, passengers, `ageMonths`, Active `slotInMonth`, stack inventory, Berrys, persistent nullable ship instances, pending replacement, and NPC `dead` status;
- seeded uniform normal selection and deterministic scheduled ordering;
- scheduled location reach, cancellation, and fallback;
- runtime enforcement of symmetric opposite traits;
- player death, NPC death, ship destruction, shipless-at-sea, and ship replacement critical fixtures;
- authored ShipDefinitions, HP, crew/cargo capacity invariants, cargo stacks, and location-gated ship sales;
- Crew System V1 using persistent NPC statuses, player-free crew capacity, immutable authored roles, cargo-slot passengers, and leadership-gated management;
- Origins → 20-slot Childhood → Active fixture pipeline;
- French source/fallback localization and partial English support;
- exact JSON save round-trip and clean rejection of legacy saves.
- reproducible headless run simulation, batch coverage metrics, static content diagnostics, and Node CLI validation.

The UI remains deliberately minimal. Rich narrative batches, standalone authoring tools, 3D scenes/dice, repeatable events, cooldowns, rarity, and broader progression systems remain out of scope.
