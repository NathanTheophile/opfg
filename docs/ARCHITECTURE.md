# Architecture

The repository keeps four responsibilities separate: locale-neutral Content, pure Engine rules, JSON-compatible GameState, and React presentation. Engine APIs receive `ContentCatalog` explicitly; there is no content singleton or React dependency.

## Runtime state and time

Save v7 stores one clock, `ageMonths`, plus `slotInMonth: 0 | 1`. Origins ends at age 12. Childhood consumes eight annual slots followed by twelve half-year slots and enters Active at age 180. Outside Active the slot is always zero. In Active, slot zero becomes one without changing age; consuming slot one resets it and increments age by one month.

History records the age after the resolved event consumed its slot. It is the authority for normal one-shot consumption. Critical events are recorded but consume neither time nor slots.

## Selection pipeline

Each selection restarts from the current state:

1. Critical: player, NPC by stable ID, then ship. Exactly one is exposed to the UI.
2. Scheduled: due occurrence, cancellation/fallback, location reach, eligibility, then priority descending, due age ascending, ID ascending.
3. Normal: all eligible and unplayed definitions, uniformly selected with the seeded PRNG.

Scheduled selection never consumes RNG. A scheduled occurrence remains pending while ineligible or blocked by a location, and only the resolved occurrence is removed. Normal and scheduled events consume phase slots; critical events do not.

## Content Contract v2

`EventDefinition` is a discriminated union of `normal`, `scheduled`, and `critical`. Priority belongs only to scheduled definitions. Locations declare whether normal scheduled reach is blocked. Outcomes contain localization, identity, and effects only; phase rules own time advancement.

The validator checks structural combinations, references, localization, scheduled priorities/reach/fallback, critical triggers, dice contracts, and opposite traits. Persistent data contains only JSON values.
