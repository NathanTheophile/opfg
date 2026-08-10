# AGENTS.md

## Project

Jam OP Fan Game — web game jam, 72 hours.

Stack:
- React
- Vite
- TypeScript
- Vitest
- localStorage
- no backend unless explicitly approved

## Source of truth

Before modifying gameplay systems, read:

- `docs/GAME_DESIGN.md`
- `docs/ARCHITECTURE.md`
- `docs/LOCALIZATION.md`
- `docs/JAM_STATE.md`

`GAME_DESIGN.md` is the game-design authority. `ARCHITECTURE.md` defines the technical architecture, `LOCALIZATION.md` defines localization policy, and the TypeScript schemas are the executable content contract. `VERTICAL_SLICE_0.md` is historical context only.

Do not invent gameplay rules when the specification is ambiguous. Surface the ambiguity instead.

## Core rules

- Keep the game runnable throughout the jam.
- Prefer the smallest implementation that satisfies the current slice.
- Do not add abstractions for hypothetical future features.
- Do not add dependencies unless they solve an immediate problem.
- Keep Engine, Content, GameState and React UI separated.
- Narrative content must be data-driven.
- Store each Event in its own JSON file under `src/game/content/events/`; the catalogue is auto-discovered.
- Content data must not contain arbitrary callbacks/functions.
- Persistent GameState must remain directly JSON-serializable.
- Persistent GameState must not contain `Map`, `Set`, `Date`, class instances, functions or callbacks.
- Do not store information that can be reliably derived from the source state.
- Do not add duplicate sources of truth.
- Stable IDs must be used for gameplay/content references.
- All production player-facing copy, including accessibility text, tooltips, fallbacks and player errors, must use localization keys; never infer semantics or locale from translated text.

## GameState

Persistent GameState contains only actual career state.

Do not add derived caches such as:
- `usedEvents` when the information is already derivable from `history`;
- crew counts when crew state already exists;
- duplicated age/time values.

For Slice 0:
- flags and items are arrays;
- NPC state is stored in `Record<NpcId, NpcState>`;
- no generic `ArcState`.

## Architecture

Expected flow:

`Content -> Engine -> GameState -> React UI`

React must not implement gameplay rules.

The engine should be usable independently from React so it can be unit-tested and simulated.

## Scope discipline

Do not implement systems outside `docs/GAME_DESIGN.md` unless explicitly requested.

In particular, do not proactively add:
- backend/cloud;
- accounts;
- generic arc framework;
- generic quest framework;
- economy;
- factions;
- complex inventory;
- procedural narrative generation;
- repeatable event framework;
- complex state management libraries.

## Validation

Before considering a task complete, run:

```bash
npm test
npm run build
```

Run content validation as soon as the command exists.

A task is complete only when:
1. requested behavior works;
2. tests pass;
3. production build passes;
4. no unrelated architecture or mechanics were added;
5. the repository remains runnable.

## Changes

Keep changes scoped to the task.

Do not refactor unrelated files unless required to complete the requested behavior.

Prefer one coherent commit per verified increment.
