# OPFG — D2.1 Runtime Content Reset

This package performs the **physical content reset** of `src/game/content/events`.

## Scope

Included in D2.1:

- archives legacy runtime JSON Events out of `src/game/content/events`;
- keeps only:
  - `origin_*` Events;
  - `critical` system Events;
- recreates a clean runtime event tree with:
  - `src/game/content/events/origins/`
  - `src/game/content/events/system/critical/`
  - `src/game/content/events/v2/`
- writes a manifest to `docs/content/events/legacy/RUNTIME_RESET_MANIFEST.md`;
- writes small README guardrails into the runtime event folders.

## Not included

- Major Narrative Track runtime implementation;
- Schema 11;
- validator/diagnostic changes;
- Origins locking runtime support.

Those belong to the next patch.

## Important consequence

This is a **structural reset patch**. After application, many runtime/content tests are expected to fail until the next waves reintroduce the new V2 content/runtime path.

That is normal.

## Apply

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\apply-d21-content-reset.ps1 -Check
powershell -ExecutionPolicy Bypass -File .\apply-d21-content-reset.ps1
```

## Output

- active runtime path cleaned;
- legacy JSON archive moved under `docs/content/events/legacy/runtime-reset-archive/`;
- empty `src/game/content/events/v2/` created and ready for new V2 content.
