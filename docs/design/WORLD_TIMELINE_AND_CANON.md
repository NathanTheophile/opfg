# OPFG — World Timeline & Canon Policy

> Status: **validated specialized design authority**.
> Scope: temporal anchor, canon compatibility, availability of canon characters/organizations/Locations.

## 1. Temporal anchor

The player is born **two years after Monkey D. Luffy** and remains two years younger throughout the run.

Therefore:

- player birth → Luffy age 2;
- player Active begins at age 15 → Luffy age 17;
- the beginning of the player's Active phase aligns approximately with the beginning of Luffy's voyage / main story;
- when Luffy is 19 after the official two-year timeskip, the player is approximately 17.

Childhood therefore occurs largely before the main manga journey, while Active progressively overlaps with major canon events.

## 2. Canon policy

OPFG follows canon closely in V1.

- Major known canon outcomes are immutable.
- The player mainly acts in narrative interstices and peripheral events.
- The player may participate around a canon arc, but does not replace the central role of canonical protagonists.
- Events must avoid branches whose consequences would necessarily invalidate a later major canon event.
- The setting is not a free alternate universe.

## 3. Canon encounters

Canon characters may appear before or during the main story when age, geography and situation make the encounter plausible.

- Encounters with major characters should be rare, conditional and meaningful.
- Generic/original NPCs should remain the majority of everyday encounters.
- Canon availability must respect death, imprisonment, travel, allegiance, disappearance and other period-specific states.

## 4. Temporal metadata

The [Content Bible](../content/CONTENT_BIBLE.md) must store approximate availability/status windows for canon-sensitive entities.

`ageMonths` is the project temporal reference.

Use windows precise enough for gameplay eligibility, but do **not** invent false day/month precision where canon does not support it.

Conceptual metadata:

```ts
timeline?: {
  availableFromAgeMonths?: number;
  unavailableFromAgeMonths?: number;
  states?: Array<{
    fromAgeMonths?: number;
    toAgeMonths?: number;
    status: string;
    notes?: string;
  }>;
}
```

Exact schema is an implementation decision; the authoring requirement is authoritative.

## 5. Locations over time

A Location that changes radically keeps the same stable `locationId` when it is fundamentally the same place. Time-dependent metadata/state describes its condition.

Examples of possible changes:

- political control;
- destruction/reconstruction;
- access restrictions;
- faction presence;
- major occupants;
- services available.

Do not create a new Location ID solely because the era changed.

## 6. Organizations over time

An organization or named faction state that does not yet exist canonically is unavailable to Event batches before its canon creation window.

The Content Bible must prevent time-inappropriate use of entities such as later-created organizations.

## 7. Canon chronology pass

Before mass production of strongly canon-sensitive Events, create a verified chronology mapping important world-state milestones to approximate player `ageMonths` windows.

The chronology should cover only milestones materially useful to authoring. It should not attempt to reconstruct every manga day.
