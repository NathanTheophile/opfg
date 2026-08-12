# D2 Wave 2 — Narrative Reset Authorities

This pack performs the **documentation/authority reset only**. It does not edit runtime TypeScript, schema versions, saves, Event JSON or localization dictionaries.

## What it installs

- `docs/design/MAJOR_NARRATIVE_TRACKS.md` — new V2 narrative architecture authority.
- `docs/design/audits/MAJOR_SAGA_RUNTIME_AUDIT.md` — read-only implementation audit/reference.
- `docs/content/events/legacy/D1_9_NARRATIVE_SEEDS.md` — 80 D1.9 roots preserved as non-authoritative seeds.
- `docs/content/events/legacy/LEGACY_CHILDHOOD_SEEDS.md` — 44 filtered pre-V2 Childhood seeds.
- `docs/content/events/legacy/EVENT_CONCEPT_INDEX_LEGACY.md` — frozen copy of the current pre-V2 index.
- `docs/content/events/v2/EVENT_CONCEPT_INDEX_V2.md` — clean, empty V2 ledger.
- `docs/content/events/migration/V2_CONCEPT_MIGRATION_LEDGER.md` — deliberate salvage/adaptation history.
- `docs/content/events/EVENT_CONCEPT_INDEX.md` becomes a small router so old tooling cannot silently append into the legacy ledger.
- amendments to `GAME_DESIGN.md`, `CONTENT_BIBLE.md`, `EVENT_AUTHORING_RULES.md`.

## Explicitly NOT done in Wave 2

- no runtime Event removal;
- no loader/glob modification;
- no Origins UI locking implementation;
- no Schema 11 implementation;
- no Save 20 implementation;
- no Major Saga selector implementation;
- no Marine prototype content.

Those belong to Wave 3 after these authorities are pushed.

## Apply

From the repository root, place this pack's files there and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\apply-d2-wave2.ps1 --check
powershell -ExecutionPolicy Bypass -File .\apply-d2-wave2.ps1
```

Then inspect `git diff` and commit/push the documentation reset.
