# Event content

Each JSON file under this directory contains exactly one `EventDefinition`. Files are discovered recursively by `eventCatalog.ts`; adding an Event does not require editing an import manifest.

Immediate continuations use `kind: "immediate"`, live under `immediate/`, and are only reached through `queueImmediateEvent` Effects. They never participate in Normal selection.

Rules:

- use `<EventId>.json`, with the filename matching the JSON `id` exactly;
- store localization keys only—never display text;
- keep data declarative and JSON-compatible, with no functions or callbacks;
- place normal Events in `origins/`, `childhood/`, or `active/` according to their phase;
- place Scheduled and Critical Events in their corresponding folders;
- keep temporary Childhood filler content under `fixtures/childhood/`.

The loader rejects missing or mismatched IDs and sorts all Events lexically by ID. The Content Schema v2 validator remains responsible for complete structural, referential, and localization validation.
