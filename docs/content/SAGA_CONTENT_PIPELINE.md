# Saga Content Pipeline V1

## Goal

Family Saga production must not require hand-authoring dozens of runtime JSON files, localization keys, route fixtures and patch scripts.

The pipeline adds a **production authoring format** above the existing runtime format. It does not add a gameplay primitive.

Runtime remains unchanged:

```text
EventDefinition JSON
Conditions
Effects
Immediate Events
MajorTrack DAG
History
```

## Commands

From the repository root:

```powershell
npm run saga:roundtrip -- family_marine
npm run saga:import -- family_marine
npm run saga:check -- family_marine
```

`roundtrip` is the bootstrap proof. It reads the current runtime Marine Saga, converts it to the authoring model in memory, recompiles it in memory, and requires structural equality.

`import` then writes:

```text
content-authoring/sagas/family_marine.authoring.json
content-authoring/.generated/family_marine.manifest.json
```

After the source exists, production becomes:

```text
edit authoring source
→ npm run saga:compile -- family_x
→ npm run saga:check -- family_x
→ npm test
→ npm run validate-content
→ npm run build
```

## Authoring source

Visible FR/EN copy lives directly beside its Event / Choice / Outcome instead of being manually synchronized across three files.

Example:

```json
{
  "id": "family_x_04_example",
  "kind": "normal",
  "title": {
    "fr": "La chaise vide",
    "en": "The Empty Chair"
  },
  "text": {
    "fr": "...",
    "en": "..."
  },
  "majorTrack": {
    "trackId": "family_x",
    "chapterId": "childhood_02",
    "nodeId": "family_x_04_example",
    "parentNodeIds": ["family_x_01_entry"],
    "selectionPriority": 20
  },
  "eligibility": {
    "type": "hasOutcome",
    "eventId": "family_x_01_entry_i02",
    "outcomeId": "specific_history"
  },
  "choices": []
}
```

The compiler creates the runtime localization keys automatically.

## Hard checks before runtime validation

The authoring validator checks the failure modes that cost production time on `family_marine`:

- duplicate Event IDs;
- Event IDs outside the Saga prefix;
- missing FR/EN copy;
- `null` Conditions;
- Immediate targets that do not exist;
- Immediate cycles;
- orphan Immediate Events;
- specialized descendants without eligibility gates;
- specialized Major roots without a mini-arc;
- route-local fallback coverage;
- optional routing-scenario coverage;
- final-layer leaf Outcomes without a persistent gameplay reward.

The normal runtime validator still runs afterward and remains authoritative for engine/schema references.

## Routing scenarios

Scenarios are declarative data in the authoring source, not handwritten Vitest fixtures:

```json
{
  "id": "giant_own_terms",
  "ageMonths": 156,
  "raceId": "giant",
  "familyStructureId": "single_parent",
  "history": [
    {
      "eventId": "family_x_01_entry",
      "choiceId": "measure",
      "outcomeId": "measure",
      "ageMonths": 12
    }
  ],
  "expectedEventId": "family_x_13_special"
}
```

`npm run saga:check` executes them against the real selector.

When a new Saga is ready for production, set:

```json
"rules": {
  "enforceScenarioCoverage": true
}
```

Then every descendant Major root must be exercised by at least one scenario.

## Generated manifest

The compiler owns only files and locale keys listed in:

```text
content-authoring/.generated/<sagaId>.manifest.json
```

On recompilation it removes/replaces only those generated assets. It does not wipe unrelated runtime content.

## Scope of V1

V1 automates the expensive high-volume part:

- EventDefinitions;
- Immediate chains;
- FR/EN localization;
- DAG/fallback validation;
- route scenarios;
- terminal reward validation;
- runtime synchronization.

Persistent catalog definitions and career handoff tables remain existing runtime systems. They are low-volume compared with Event authoring and can be moved behind generated hooks in a later tooling pass if that becomes a bottleneck.

## Parallel production

For the remaining Family Sagas:

```text
Conversation A -> Civilian authoring source
Conversation B -> Pirate authoring source
Conversation C -> Revolutionary authoring source
Conversation D -> Royal authoring source
```

Each conversation edits only one authoring source and does not create patchers or engine code.

The main integration conversation only:

1. reviews narrative quality;
2. runs `saga:compile`;
3. runs `saga:check`;
4. fixes actual content conflicts.
