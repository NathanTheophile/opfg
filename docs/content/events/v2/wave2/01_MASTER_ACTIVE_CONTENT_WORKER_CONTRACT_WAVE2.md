# ACTIVE CONTENT — MASTER WORKER CONTRACT — WAVE 2

Repository source of truth: `NathanTheophile/opfg`, branch `dev`.

Baseline observed when this Wave 2 pack was generated:
- HEAD: `dc3819121ae8e74aaa898afefedbc7cdb5666df8`
- Content Schema: `15`

**Current `dev` always wins. Fetch/read it before doing anything.**
Do not assume this baseline is still current when the worker starts.

## Mission

Author new Active V1 content for the exact territory named by the batch prompt.

Wave 1 is already integrated on `dev`:
- `ACTIVE_GENERIC_SEA_01`
- `ACTIVE_GENERIC_SEA_02`
- `ACTIVE_GENERIC_SEA_03_DANGER`
- `ACTIVE_GENERIC_SEA_04_NAV_HAZARD`
- `ACTIVE_GENERIC_SEA_05_STRANGE`
- Career Sagas: Civilian / Pirate / Marine / Revolutionary

Do not rewrite or mine those batches. Inspect them only for collision, schema or integration checks.

Legacy `archives/ACTIVE_*` material is non-authoritative prototype content.
Do not mine, port, modernize, paraphrase or restore it.

## Authorities

Read before authoring:

1. `AGENTS.md`
2. `docs/GAME_DESIGN.md`
3. `docs/content/CONTENT_BIBLE.md`
4. `docs/content/EVENT_AUTHORING_RULES.md`
5. `docs/content/events/v2/ACTIVE_V1_BATCH_CONTRACT.md`
6. relevant specialized design docs
7. current TypeScript schema/runtime
8. current World V1 / location data relevant to the batch

## Engine freeze

Active V1 engine is frozen.

Do not modify engine/schema/save/UI/navigation architecture merely to make content easier.

Do not add:
- `ArcState` / `QuestState`;
- a second affiliation;
- profession/business/fleet/cell management;
- a second inventory/crew/market system;
- persistent Paradise `routeId`;
- another navigation system;
- `powerLevel`;
- Bounty Hunter V1;
- post-opener career changes;
- player Conqueror's Haki.

If the current schema genuinely cannot express a required beat, stop authoring that beat and report the exact blocker instead of reopening architecture.

Reuse only existing:
Conditions, Effects, History, Scheduled, Immediate, NPC, CrewRole, Ship, Item, Reputation, bounty, ranks/titles and Major Narrative Tracks.

## Writing

Hard requirements:
- Situation → Reaction.
- WHO / WHAT / immediate stake understandable in ~2 seconds.
- Root normally 20–45 words.
- Immediate/Scheduled normally 12–40 words.
- Outcome normally 5–25 words.
- Choice label normally 2–10 words and states a concrete intention.
- 3–5 Choices normally.
- Risky failure must matter.
- Critical failure normally worse than failure.
- Avoid automatic Stat vending.
- Avoid generic “someone asks for help” repetition.
- FR + EN through current localization conventions.

## Active cadence

- Exactly 1 root Event per Active month.
- Immediate = same scene, no extra month.
- Scheduled = future consequence consuming a later root slot.
- Outcome does not choose arbitrary Active time duration.

## Short Scheduled

Only when the batch profile authorizes it:

`L1 seed -> L2 -> optional L3`

Hard rules:
- maximum 3 temporal layers total including seed;
- complete within 3–24 biological months;
- each node schedules only its next node;
- never pre-schedule L2 + L3 together;
- no tiny-location lock without a valid fallback/cancel path.

## Reputation / careers

- V1 careers: Civilian / Pirate / Marine / Revolutionary.
- Bounty Hunter is out.
- No mid-career affiliation change.
- Active Reputation is notoriety and is monotonic in V1 content: do not decrease it.
- Active Marine must not receive a bounty.
- Promotions/rank/title changes remain authored Events, never silent system rewards.

## NPC / Crew

- Companion = animal Item, never NPC.
- Reuse current persistent NPCs where fiction supports it.
- One fixed CrewRole per recruitable NPC.
- Recruitment-focused Event must respect role vacancy/capacity requirements.
- Before first personal ship: max 2 crew NPCs.
- Civilian/Pirate/Revolutionary ages 15–18 need credible access to recruitment over the total content surface.
- Marine is exempt from early personal-crew dependence.

Do not silently create shared persistent NPC definitions from an isolated batch.
If a genuinely necessary definition is missing, isolate it under `PROPOSED_DEFINITIONS` and report the integration need.

## Travel

- Ordinary Blue travel is sea-first and destination-random through the existing navigation/runtime contract.
- Reverse Mountain is never an ordinary Blue destination.
- Paradise route identity comes from History / route-start Events.
- No Navigator direct jump through Paradise.
- Generic content must not teleport the player across the world.
- Do not create a second route/navigation state.

## Isolation

Own only the new namespaced directory/source named by the prompt plus strictly necessary namespaced:
- localization fragments;
- manifest/report;
- validation metadata;
- targeted tests when useful.

Do not edit another worker's batch.
Avoid shared catalog/definition files; shared integration is sequential and later.

## Validation

At minimum when the environment permits:

```bash
npm run validate-content
npm test
npm run build
```

If repository-level commands cannot run, perform deterministic structural checks and state exactly what still requires integration validation.

## Handoff

Report:
- exact HEAD read before authoring;
- exact files;
- root / Immediate / Scheduled counts;
- mini-arc percentage;
- Dice-root percentage;
- new persistent definitions or proposals;
- restrictive eligibility;
- starvation/collision risks;
- validation performed;
- shared integration still required.

**NO PUSH / COMMIT / PR unless explicitly requested.**
