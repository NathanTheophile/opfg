# Jam state

Implemented and verified:

- Content authoring foundation implemented on Save v15 / Content Schema v5: generic Marine/Revolutionary/Bounty Hunter ranks, Reputation `0..100`, exact V1 Traits/Crew Roles/Ships, 188 runtime World V1 Locations with hierarchy and controlled tags/services/ship markets, 20 playable plus 25 reference-only Devil Fruits, and persistent same-race Origins parents. Career history/maxBounty, Ending variants and final score remain intentionally out of scope;
- Powers V1: shared Player/NPC PowerState, central Devil Fruit catalog and controlled tags, protected Item consumption, monotone Awakening, Event-awakened Haki with automatic post-awakening Player tiers, declarative Conditions/Effects, UI/localization, validator and Tool authoring support;
- Content Contract v3 and save/GameState v13 (Powers migration defaults from v12);

- Content Contract v3 with Normal, Immediate, Scheduled, and Critical event variants;
- one JSON file per Event, recursively auto-discovered and deterministically sorted by Event ID;
- save/GameState v13 with v7-v11 migration, persisted Immediate queue/deferred slot/monthly navigation decision, unbounded player health, D20-only attribute IDs, complete Origins profile, leadership, passengers, `ageMonths`, Active `slotInMonth`, stack inventory, Berrys, persistent nullable ship instances, pending replacement, and NPC `dead` status;
- seeded uniform normal selection and deterministic scheduled ordering;
- scheduled location reach, cancellation, and fallback;
- Immediate continuation chains with Critical preemption, eligibility pruning, cycle validation and runtime guard;
- one persisted, zero-slot land/sea navigation choice per eligible Active month, with current/ancestor Location docking control and Active-only diagnostic dead-end recovery Events;
- runtime enforcement of symmetric opposite traits;
- player death, NPC death, ship destruction, shipless-at-sea, and ship replacement critical fixtures;
- authored ShipDefinitions, HP, crew/cargo capacity invariants, cargo stacks, and location-gated ship sales;
- Crew System V1 using persistent NPC statuses, player-free crew capacity, immutable authored roles, cargo-slot passengers, and leadership-gated management;
- Origins → 20-slot Childhood → Active fixture pipeline;
- French source/fallback localization and partial English support;
- exact JSON save round-trip and clean rejection of legacy saves.
- reproducible headless run simulation, batch coverage metrics, static content diagnostics, and Node CLI validation.

The UI remains deliberately minimal. Rich narrative batches, standalone authoring tools, 3D scenes/dice, repeatable events, cooldowns, rarity, and broader progression systems remain out of scope.
