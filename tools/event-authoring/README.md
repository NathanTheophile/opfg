# OPFG Event Authoring Tool v0.4.0

Standalone React/Vite authoring tool for **Jam OP Fan Game (OPFG)** narrative content, integrated at `tools/event-authoring/`. v0.4 preserves the compact graph, Inspector, Condition/Effect/Resolution editors, localization workflow, notes, status and local autosave.

The application remains independently installable and runnable, while its runtime contract and full-catalog validation import the game sources directly to prevent silent divergence.

## Content contract

`src/gameSchema/current/contract.ts` is now a thin authoring adapter over the canonical OPFG v2 contract in `src/game/content/schema.ts` and model IDs in `src/game/model/schema.ts`:

- `CONTENT_SCHEMA_VERSION = 2`;
- Event union: `normal`, `scheduled`, `critical`;
- Normal: no priority, weight, repeat/cooldown or scheduled-only fields;
- Scheduled: `priority: 50 | 100 | 200 | 300`, optional `scheduledReach`, `cancelIf`, `fallbackEventId`;
- Critical: `playerHealthDepleted`, `npcHealthDepleted`, `shipDestroyed` triggers;
- time conditions: `ageAtLeastMonths` / `ageAtMostMonths` using `value`;
- no `monthAtLeast`;
- Outcomes contain only `id`, `textKey`, `effects` — no `advanceMonths`;
- Dice uses `statId`, `successThreshold`, optional conditional `modifiers`, optional `traitOverrides`, and exactly four Outcomes;
- text input targets `playerName` with `minLength`, `maxLength`, optional `placeholderKey`;
- Traits use `oppositeTraitId`;
- NPC statuses: `known`, `crew`, `departed`, `unavailable`, `dead`;
- Locations expose `blocksScheduledEvents`.

The full current Condition and Effect unions are defined once in `contract.ts` and consumed by the editors/default factories/validator.

## Authoring-only metadata

Runtime `EventDefinition` does not know its file path. Each authoring node therefore stores:

```ts
contentFolder:
  | 'origins'
  | 'childhood'
  | 'active'
  | 'scheduled'
  | 'critical'
  | 'fixtures/childhood'
```

This controls filtering and ZIP paths and is **never written into an Event JSON**. Scheduled/Critical folders are normalized automatically.

`registries.flags` is also authoring-only autocomplete/reference metadata. Flags remain valid gameplay IDs in Conditions/Effects but are not a `ContentCatalog` registry, so the Tool never exports a `flags` field into runtime content.

## Import

### Event JSON

Use **Import Files/ZIP** and select one or many `<EventId>.json` files. Multi-select is batch-first: one bad file does not abort the others.

The report lists:

- Imported;
- Warnings;
- Rejected, with the individual filename and reason.

Filename must match `EventId`, as required by OPFG `eventCatalog.ts`.

### Folder

Use **Import Folder** in a browser supporting directory selection. Paths below `events/**` are used to reconstruct `contentFolder`, including `fixtures/childhood`.

### ContentCatalog v2

A standalone v2 `ContentCatalog` can still be imported for migration/convenience. The Tool derives authoring flag IDs from Event references and lays nodes out automatically. Physical folders for Normal Events are inferred from phase eligibility when possible.

### Authoring project

`opfg-authoring-project-v0.4.json` restores the full graph/workspace. v0.3 projects are migrated to v0.4 when safe.

Ambiguous legacy concepts are not silently reinterpreted:

- `monthAtLeast` is removed and the Event is marked `needsReview`;
- non-zero `Outcome.advanceMonths` is dropped with a warning;
- old Normal priority is dropped with a warning;
- `scheduledOnly` becomes `kind: 'scheduled'` because that mapping is direct;
- unsupported legacy NPC statuses are normalized to `known` and marked for review;
- missing Location `blocksScheduledEvents` defaults to `false` with a migration warning.

Migration warnings are retained in project metadata/notes.

## OPFG bundle ZIP

The supported bundle format is:

```text
opfg-events-bundle.zip
├─ manifest.json
├─ events/
│  ├─ origins/
│  ├─ childhood/
│  ├─ active/
│  ├─ scheduled/
│  ├─ critical/
│  └─ fixtures/childhood/
└─ locales/
   ├─ fr.json
   └─ en.json
```

`manifest.json` is deliberately small: format/version, Content Schema version, bundle name, Event count and locale list.

ZIP import supports uncompressed entries and standard DEFLATE entries in browsers exposing `DecompressionStream('deflate-raw')`. ZIPs exported by this Tool use the portable STORE method and require no third-party ZIP dependency.

## Export

- **Export Event** → exactly `<EventId>.json`, containing only runtime `EventDefinition` data.
- **Export All** → `opfg-events.zip` with one Event per `events/<contentFolder>/<EventId>.json`.
- **Locales** → `opfg-locales.zip` containing flat `locales/<locale>.json` dictionaries.
- **Bundle** → `opfg-events-bundle.zip` with manifest, Events and locale dictionaries.
- **Project** → complete authoring workspace JSON, including graph/notes/status/localization/authoring metadata.

Runtime exports are blocked on validation errors or Events still marked `needsReview`.

## Localization

Gameplay JSON remains locale-neutral. The Tool stores and edits flat locale dictionaries matching OPFG:

```text
src/game/localization/locales/fr.json
src/game/localization/locales/en.json
```

French is the source/fallback locale. Event, Choice, Outcome, Dice modifier and optional placeholder keys are generated/normalized from stable IDs. Secondary translations track source revisions; missing/outdated translations are filterable. Placeholder sets must match the French source.

Bundles include `locales/<locale>.json`.

## Validation

Validation is split visibly into two layers:

1. **Runtime catalog validation** — delegated directly to OPFG's canonical `src/game/validation/validateContent.ts`: event variants, Conditions, Effects, Dice, Scheduled/Critical rules, references, NPCs, Locations, opposite Traits, duplicates and Content Schema version. The local adapter only supplies permissive reference placeholders while inspecting an isolated Event before it joins a project.
2. **Authoring validation** — physical content folder, authoring-only flag registry, localization completeness/revisions/placeholders, migration review state.

The standalone validator is intentionally isolated. After moving this Tool into the OPFG repository, the preferred integration is to share/import the actual runtime schema and validator rather than continue maintaining a duplicate.

## Batch workflow

```text
ChatGPT / LLM batch ZIP
        ↓
Import Files/ZIP or Import Folder
        ↓
per-file report + graph/Inspector corrections
        ↓
runtime + authoring + localization validation
        ↓
Export All / Bundle
        ↓
copy events/** and locales/** into OPFG
        ↓
eventCatalog auto-discovery + official Content Validator
```

No OpenAI/cloud API is included in v0.4.

## Development

```bash
cd tools/event-authoring
npm install
npm run dev
npm test
npm run build
```

A focused non-UI contract/import/export check is also available:

```bash
npm run core:check
```

It type-checks the non-React authoring core and runs the focused Vitest suite for Content Schema v2, validation, serialization and bundle round-trip.

## Shared and authoring-only boundaries

Shared directly from the game repository:

- Content Schema v2 and its version constant;
- model ID/NPC types required by the contract;
- the complete runtime ContentCatalog validator.

Tool-only modules remain separate: `src/authoring/**`, migrations, graph UI, `src/io/**`, ZIP support, authoring/localization validation, editor defaults and option lists, and the authoring-only flag registry. Runtime Event JSON never receives these fields.
