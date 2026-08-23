# Simulation and content diagnostics

The simulator drives the real Engine and the same JSON ContentCatalog as the game, without React:

```bash
npm run validate-content
npm run simulate
npm run simulate -- --runs 1000 --seed 42 --max-events 1000
npm run simulate -- --runs 1000 --json simulation-report.json
```

`validate-content` runs the authoritative Content Schema v2 validator first. Structural errors produce a non-zero exit code. It then reports non-blocking production warnings such as Scheduled Events never scheduled, definitions never granted, unmatched flag reads/writes, and unused NPCs.

Simulation uses the existing selection, resolution, Effects, Dice, scheduler, Critical, and time APIs. Gameplay uses the run seed; automatic Choice selection uses a separate PRNG state derived with `seed XOR 0x9e3779b9`. Batch run `n` uses `(baseSeed + n) mod 2^32`, so identical code, content, configuration, and policy produce identical reports.

A `deadEnd` means the career remains active but the Engine selects no Event. Pending Scheduled occurrences are split between future occurrences and occurrences already due at the final age. `safetyLimit` is a strong diagnostic indicating excessive resolution count or a potential loop; repeated identical Critical Events are additionally flagged as `possibleCriticalLoop`.

The optional JSON path is always explicit. Machine-readable reports contain configuration, summary, Event/Trait/Item/Dice metrics, pending Scheduled counts, static diagnostics, and problematic runs.
