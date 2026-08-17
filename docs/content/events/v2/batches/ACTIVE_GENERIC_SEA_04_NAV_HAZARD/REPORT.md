# ACTIVE_GENERIC_SEA_04_NAV_HAZARD — Worker report

## Source baseline

- Repository: `NathanTheophile/opfg`
- Branch: `dev`
- Exact HEAD read before authoring: `7d2d4805f07dc00990bedd51e3c673cb65fceafd`
- Content Schema: `15`
- Save version: `22`

## Delivered

- 20 Normal roots
- 18 Immediate continuations
- 0 Scheduled Events
- 0 Lifetime Threads
- 75% Immediate mini-arc roots
- 65% Dice roots
- 3 roots with a second Immediate layer
- FR + EN localization snippets
- namespaced localization merge/check helper
- targeted Vitest
- batch-local validation helper
- manifest + this report

## Editorial self-audit

- Every root is a concrete at-sea environmental/navigation problem with immediate physical stakes.
- No root uses a passing vessel, distress signal, salvage reward, cargo opportunity, pirate, raider, sea creature, or combat as its core.
- Weather coverage is not twenty storm reskins: pressure discontinuity, waterspout geometry, electrostatic rigging, freezing spray, rain whiteout, sea smoke, optical refraction, microburst, following-sea broach, internal wave, moving whirlpool, magnetic disturbance, hail, sun glare, pumice raft, ash slurry, salt aerosol, Paradise seasonal wall, wind reversal, and green-water sweep.
- Risky Dice failure always costs ship HP; critical failure also costs player Health.
- Critical failure is materially worse than ordinary failure.
- Deterministic safe/slow approaches trade morale, stats, or minor ship wear where appropriate rather than paying automatic rewards.
- Crew-role approaches are optional and never the only resolution.
- No new persistent definitions or flags.
- No travel destination or route selection.

## Static validation performed in worker environment

Batch-local generator/static audit: **PASS**

Checked:

- 38 unique Event IDs / filenames;
- 20 Normal + 18 Immediate only;
- 13/20 root Dice;
- 15/20 roots opening Immediate;
- exactly three root paths at Immediate depth 2; max depth 2;
- no queue cycles or dangling targets;
- no external Immediate target;
- no Scheduled/Lifetime/replay/majorTrack content;
- every root has Active + at-sea + hasShip eligibility;
- every Event has an unconditional available Choice;
- exact four Dice outcome bands;
- all negative ship-damage outcomes marked `accident`;
- no positive ship repair effect;
- no travel/recovery/career/persistent-definition effects;
- all referenced localization keys present in both snippets;
- FR/EN body, Choice and Outcome copy within the ordinary production text budgets.

Batch-local validator command after extraction:

```bash
node tools/active-generic-sea-04-nav-hazard/validate-batch.mjs
```

## Repository-wide validation status

The required commands are:

```bash
npm run validate-content
npm test
npm run build
```

They were **not executable inside this isolated artifact workspace**, because this environment does not expose a complete writable checkout with the repository dependencies. They are therefore **NOT reported as passing**.

A targeted Vitest is included at:

```text
tests/activeGenericSea04NavHazard.test.ts
```

Run the global validation pipeline after applying the patch/localization to the real current `dev`.

## Shared integration

No engine/schema/save/UI/navigation work is needed.

Shared writes intentionally deferred to integration:

- `src/game/localization/locales/fr.json`
- `src/game/localization/locales/en.json`

The supplied merge script refuses localization-key collisions before writing.
