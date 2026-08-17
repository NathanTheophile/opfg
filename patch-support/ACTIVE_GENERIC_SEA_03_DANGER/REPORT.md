# ACTIVE_GENERIC_SEA_03_DANGER — HANDOFF REPORT

Baseline: `7d2d4805f07dc00990bedd51e3c673cb65fceafd` / Content Schema 15 / Save 22.

Produced: 20 Normal roots + 18 Immediate, 0 Scheduled, 0 Lifetime. Immediate density 75%; root Dice density 60%; 3 L3 visible mini-arcs. No persistent definitions added.

Territory is limited to violent maritime danger. SEA_01 social/encounter/signals and SEA_02 salvage/resource/opportunity premises were treated as exclusions.

Static pack checks: PASS.
Text-budget warnings: 0 (see `static-validation.json`; these are approximate tokenizer checks, not runtime errors).

Repository validation could not be run without a local repository clone. Run after overlay + localization merge:

```bash
node patch-support/ACTIVE_GENERIC_SEA_03_DANGER/apply-localization.mjs
node patch-support/ACTIVE_GENERIC_SEA_03_DANGER/verify-batch.mjs
npm run validate-content
npm test
npm run build
```

No push / commit / PR performed.
