# Jam state

Implemented and verified:

- Content Contract v2 with Normal, Scheduled, and Critical event variants;
- one JSON file per Event, recursively auto-discovered and deterministically sorted by Event ID;
- save/GameState v7 with `ageMonths`, Active `slotInMonth`, nullable ship, and NPC `dead` status;
- seeded uniform normal selection and deterministic scheduled ordering;
- scheduled location reach, cancellation, and fallback;
- runtime enforcement of symmetric opposite traits;
- player death, NPC death, and ship destruction critical fixtures;
- Origins → 20-slot Childhood → Active fixture pipeline;
- French source/fallback localization and partial English support;
- exact JSON save round-trip and clean rejection of legacy saves.

The UI remains deliberately minimal. Rich narrative batches, standalone authoring tools, 3D scenes/dice, repeatable events, cooldowns, rarity, and broader progression systems remain out of scope.
