# One Piece: Destinies (OPFG)

Web narrative life-sim built for the Jam OP Fan Game project.

## Requirements

- Node.js
- npm

## Install

```bash
npm ci
```

## Development

```bash
npm run dev
```

## Tests

Fast developer loop:

```bash
npm test
```

The default suite intentionally excludes expensive whole-catalog, simulation and Saga-authoring checks.

Content/integration checks:

```bash
npm run test:content
npm run test:simulation
```

Slow authoring synchronization check:

```bash
npm run test:authoring
```

Full automated test pass:

```bash
npm run test:full
```

Release verification:

```bash
npm run verify:release
```

## Content validation

```bash
npm run validate-content
```

## Build

```bash
npm run build
```

## Simulation

General simulation:

```bash
npm run simulate
```

Lightweight progression-oriented QA:

```bash
npm run simulate:progression -- --runs 10
```

Additional policies are available through `simulate:fuzz` and `simulate:minmax`.

## Project structure

- `src/` — runtime game, engine, content integration and React UI.
- `tests/` — automated tests.
- `scripts/` — maintained QA, validation, simulation and content-pipeline commands.
- `tools/` — standalone development/authoring tools.
- `docs/` — design, architecture and content authorities.
- `content-authoring/` — high-volume authoring sources and generated ownership manifests.
- `public/` — runtime-served static assets.
- `prompts/` — maintained authoring/production prompts.

Generated diagnostics belong in ignored local directories such as `reports/` and `simreports/`; routine simulation output should not be committed.

## Source of truth

Before modifying gameplay systems, read:

1. `docs/GAME_DESIGN.md`
2. `docs/ARCHITECTURE.md`
3. `docs/LOCALIZATION.md`
4. `docs/JAM_STATE.md`

Specialized design/content authorities under `docs/design/` and `docs/content/` apply to their respective domains. TypeScript schemas remain the executable content contract.

## Repository hygiene

Do not commit temporary integration folders, generated implementation ZIPs, already-applied one-off patches/applicators, routine reports, caches or build output.

Keep reusable diagnostics in `scripts/`; prefer extending canonical simulators with flags over accumulating one-off scripts.