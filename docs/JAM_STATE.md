# Jam state

> **Status:** current implementation snapshot.
>
> This file reports what is implemented. It is not a gameplay authority. Design authority remains in `GAME_DESIGN.md` and its delegated specialized documents.

## Runtime baseline

- Save version: **23**.
- Content Schema version: **16**.
- Career phases: `origins` → `childhood` → `active`.
- Childhood uses **20 root slots** and reaches Active at age 15.
- Active uses one root Event per month.
- Event variants: Normal, Immediate, Scheduled and Critical.
- Normal selection is seeded and deterministic from the persisted RNG state.
- Immediate chains resolve inside the current root slot and do not advance time.
- Scheduled Events support due-age ordering, eligibility, cancellation, reach rules and fallbacks.
- Critical Events cover player death, NPC death, ship destruction, shipless-at-sea emergencies, pending ship replacement and other mandatory system gates.
- Active has diagnostic dead-end recovery Events; Origins and Childhood intentionally do not hide missing content behind a fallback.

## Major Narrative Tracks

- Generic Major Narrative Track infrastructure is implemented.
- Progression is reconstructed from History rather than a persistent Saga progress field.
- Family Major nodes are Normal Events excluded from the ordinary Normal pool.
- Layered Family DAG routing supports previous-node reachability, route-local fallbacks, specialization priority, Special Association paths and milestones.
- Selection priority preserves overdue Major chapters ahead of due Scheduled Events and newly-due Major chapters after due Scheduled Events.

All five playable Childhood Family Legacy Sagas are integrated:

- `family_civilian`;
- `family_marine`;
- `family_pirate`;
- `family_revolutionary`;
- `family_royal`.

Each Family Saga has five guaranteed Childhood layers due at 12, 48, 84, 120 and 156 months. Layer-5 career handoff is applied at the actual Childhood → Active transition rather than prematurely during remaining Childhood content.

Family Saga production sources live under `content-authoring/sagas/`; generated ownership manifests live under `content-authoring/.generated/`; compiled runtime Events live under `src/game/content/events/v2/major-tracks/`.

Adult Family runtime cadence is exposed for `family_civilian`, `family_marine`, `family_pirate` and `family_revolutionary` through five broad Active chapters due at 222, 270, 318, 366 and 414 months. Adult Family authoring remains future production work. `family_royal` remains load-compatible for existing states but has no Active Family chapters while Royal Origins stay locked.

## Content foundations

- World V1 contains **188 runtime Locations**, including exactly 8 Birth Locations per Blue.
- Runtime geography includes hierarchy, controlled tags/services, docking and ship-market metadata.
- Playable V2 Origins races are Human, Fish-Man, Mink and Giant; Longarm and Buccaneer remain visible but locked.
- Playable inherited affiliations are Civilian, Marine, Pirate, Revolutionary and Royal Family; Bandit, Prisoner, Slave and Celestial Dragon remain visible but locked.
- The validated Trait catalogue contains **28 Traits** with symmetric oppositions where defined.
- Devil Fruit content contains **20 playable** and **25 reference-only** Fruits.
- Six generic ship chassis, inventory/equipment, Log Pose, Berrys/market primitives, runtime crew-role assignment, crew-role powers, companions and persistent NPC state are implemented.
- NPCs support persisted runtime display names, seeded Stats, mutable runtime `crewRoleId`, immutable sex metadata, canonical father/mother family roles and localization grammar parameters.
- French remains the source/fallback locale with partial English support.

## Content production state

- The five Childhood Family Sagas are integrated and are no longer the production bottleneck.
- Ordinary Childhood V2 content outside Major Tracks is the current production focus: Race, Birthplace, Origin Cross, peers, development and generic adventures must populate the remaining Childhood slots.
- Legacy D1.x material is non-authoritative and retained only as a curated source of narrative seeds.
- Accepted V2 concepts and migration decisions remain separate from legacy archives.

## Tooling and validation

- Event JSON is recursively auto-discovered and deterministically catalogued.
- Runtime content validation is available through `npm run validate-content`.
- Automated tests run through `npm test`.
- Production build runs through `npm run build`.
- Simulation and balance scripts remain available under `scripts/`.
- Family Saga authoring/import/compile/check/roundtrip tooling is implemented in `scripts/saga-content.ts`.
- `package.json` currently exposes no `saga:*` aliases; invoke the Saga tool directly with `npx jiti scripts/saga-content.ts <command> <sagaId>`.

## UI state

A playable event UI, navigation/status surfaces, settings, audio, Tavern background and 3D Dice features exist. Landing-page work, final visual integration, responsive polish and remaining UI/UX fixes can continue independently from ordinary Childhood content production when file ownership is kept separate.
