# OPFG — Event Concept Index

> Central deduplication ledger for accepted Event batches.
>
> **Status: regeneration baseline after Lifetime Thread authoring-contract revision.**
>
> The previously generated Childhood Waves 1–2 are intentionally withdrawn from the accepted ledger and must be regenerated under the current authority. Their old concepts do not block reuse or revision.

## Accepted root concepts

| Batch | Root Event ID | conceptKey | Age band | Domain | Primary context | One-line premise |
|---|---|---|---|---|---|---|

_No production batch is currently accepted after the Lifetime Thread reset._

## Accepted Signature Immediate Arcs — depth 5

| Batch | Root Event ID | arcKey | Reachable Immediate depth | One-line arc premise |
|---|---|---|---:|---|

_None accepted yet._

## Accepted Secondary Immediate Arcs — depth 3

| Batch | Root Event ID | arcKey | Reachable Immediate depth | One-line arc premise |
|---|---|---|---:|---|

_None accepted yet._

## Accepted Lifetime Threads

| Batch | Seed Root Event ID | threadKey | Recurring NPC / anchor | Reachable Scheduled depth | Intended span | One-line thread premise |
|---|---|---|---|---:|---|---|

_None accepted yet._

## Regeneration scope

The following batch IDs are scheduled for regeneration under the new authority:

- `CH_GENERIC_EARLY_01`
- `CH_GENERIC_LATE_01`
- `CH_FAMILY_SOCIAL_01`
- `CH_IDENTITY_WORLD_01`

Do not copy old generated JSON forward merely to preserve volume. Reuse a premise only when the regenerated Event still passes anti-reskin review and the batch as a whole satisfies the new Signature Immediate Arc + Lifetime Thread contract.

## Maintenance rule

After each reviewed/accepted batch:

1. append only accepted **root** concepts to `Accepted root concepts`;
2. append every accepted qualifying depth-5 Signature Immediate Arc at root level;
3. append every accepted qualifying depth-3 Secondary Immediate Arc at root level;
4. append every accepted Lifetime Thread at seed/thread level;
5. update batch summaries/dedup notes as needed.

Do not add rejected drafts, discarded alternatives, Immediate descendants or Scheduled descendants as independent root concepts.
