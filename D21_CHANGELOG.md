# D2.1 CHANGELOG

## Goal

Execute the physical runtime content reset planned in Wave 3.

## What this patch does

1. Archives every runtime Event JSON that is **not**:
   - an `origin_*` Event; or
   - a `critical` Event.
2. Removes those legacy files from `src/game/content/events`.
3. Rebuilds a minimal runtime event tree for the refactor transition.
4. Creates an empty `src/game/content/events/v2/` staging directory.
5. Writes an archive manifest in docs.

## Why now

Wave 2 already locked the narrative authorities. The runtime path still contained all legacy narrative JSONs, so the codebase was still materially running on the pre-reset catalog. D2.1 makes the reset visible and concrete.

## Follow-up required

- D2.2 Origins locking.
- D2.3 Schema 11 + Major Narrative Track selector.
- D2.4 validator/tests.
- D2.5 first Family Saga prototype.
