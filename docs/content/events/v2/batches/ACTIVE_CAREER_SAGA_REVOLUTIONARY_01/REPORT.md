# ACTIVE_CAREER_SAGA_REVOLUTIONARY_01 — Handoff Report

## Baseline

- Repository: `NathanTheophile/opfg`
- Branch: `dev`
- Current HEAD read before authoring: `7d2d4805f07dc00990bedd51e3c673cb65fceafd`
- Content Schema observed on current `dev`: `15`
- Pack baseline (`93581c6b2f45101030908e11752eaaaf72718946`) was older; current `dev` was treated as source of truth.
- No push, commit or PR was created.

## Scope

Owned source:

- `content-authoring/sagas/career_revolutionary.authoring.json`

Batch-local handoff:

- `ACTIVE_CAREER_SAGA_REVOLUTIONARY_01_REPORT.md`

No shared catalogue, engine, schema, save, UI, navigation, other Saga source, generated runtime file or archive content was edited.

## Authored structure

- `sagaId`: `career_revolutionary`
- `trackId`: `career_revolutionary`
- `runtimeDirectory`: `src/game/content/events/v2/major-tracks/career_revolutionary`
- Track type requested from integrator: `personal_affiliation`
- Temporal layers: 10
- Major roots: 38
- Immediate Events: 38
- Scheduled Events: 0
- Total authored EventDefinitions: 76
- Root mini-arc rate: 38 / 38 = 100%
- Maximum authored Immediate depth: 1
- Dice roots: 22 / 38 = 57.89%
- Dice approaches on every Dice root: 2
- New Lifetime Thread: none
- New persistent definitions: none
- New flags: none
- Post-opener career switches: none
- Bounty Hunter content: none
- Negative Active Reputation effects: none
- Teleport / movement Effects: none

## Proposed chapter IDs and due ages

| Layer | Chapter ID | Due ageMonths | Biological age | Roots | Immediate | Dice roots |
|---:|---|---:|---:|---:|---:|---:|
| 1 | `active_01_recognition` | 180 | 15 | 2 | 2 | 1 |
| 2 | `active_02_first_cell` | 204 | 17 | 4 | 4 | 2 |
| 3 | `active_03_counterpressure` | 228 | 19 | 4 | 4 | 2 |
| 4 | `active_04_autonomy` | 252 | 21 | 4 | 4 | 2 |
| 5 | `active_05_network_war` | 276 | 23 | 4 | 4 | 2 |
| 6 | `active_06_command` | 300 | 25 | 4 | 4 | 3 |
| 7 | `active_07_fracture` | 324 | 27 | 4 | 4 | 2 |
| 8 | `active_08_regional_front` | 348 | 29 | 4 | 4 | 3 |
| 9 | `active_09_legacy` | 372 | 31 | 4 | 4 | 2 |
| 10 | `active_10_resolution` | 396 | 33 | 4 | 4 | 3 |
| **Total** | — | — | — | **38** | **38** | **22** |

The two-year spacing keeps the career-long track inside the current V1 career horizon and resolves it at age 33.

## Layer 1 entries

### Specialized inherited entry

`career_revolutionary_01_inherited_contact`

Requires:

- current career = `revolutionary`; and
- at least one real Family Revolutionary Layer-5 handoff outcome:

```text
family_revolutionary_37_i01 / active_revolutionary_record
family_revolutionary_38_i01 / active_revolutionary_route
family_revolutionary_39_i01 / active_revolutionary_cipher
family_revolutionary_40_i02 / active_revolutionary_readiness
family_revolutionary_41_i01 / active_revolutionary_memorial
family_revolutionary_42_i01 / active_revolutionary_orphan_record
family_revolutionary_43_i01 / active_revolutionary_orphan_escape
family_revolutionary_44_i02 / active_revolutionary_nonhuman_route
family_revolutionary_45_i02 / active_revolutionary_signal
family_revolutionary_46_i02 / active_revolutionary_fishman_route
family_revolutionary_47_i02 / active_revolutionary_giant_route
```

No invented state or flag is used.

### Fallback Active entry

`career_revolutionary_01_new_cell`

Requires only current career = `revolutionary` and is the single Layer-1 fallback.

It supports a character who becomes an established Active Revolutionary without the strong pre-Active Family History above.

## Branch / reconvergence model

The persistent doctrine memory is ordinary History through the root Choice IDs:

- `network` — clandestine network, intelligence, compartmentalization;
- `people` — population protection, local legitimacy, organizing;
- `strike` — direct action, sabotage, hard operational pressure.

Structural shape:

```text
L1 inherited contact ─┐
                      ├──> L2 network
L1 new-cell fallback ─┤    L2 people
                      ├──> L2 strike
                      └──> L2 route fallback
                              │
                              ▼
                    any L2 node is a parent of
                    every structurally reachable L3 node

History.hasChosen(previous root, doctrine)
selects the specialized descendant:

network ───────────────> next-layer network node
people  ───────────────> next-layer people node
strike  ───────────────> next-layer strike node

All previous-layer roots
        │
        └───────────────> exactly one next-layer fallback
                           if no specialized descendant is eligible

The same pattern repeats through L10.
```

This gives divergence and later route switching without binary-tree growth. A player may move from one doctrine to another through a later root Choice; the following layer reflects the most recent lived doctrine while the complete earlier History remains available.

## Narrative route plan

### `network`

Progresses from safehouses and cipher leaks into embedded sources, broken communication chains, liaison compromise, exposed clandestine methods, synchronized port networks, younger-cell doctrine, then a decentralized intelligence lattice.

Primary pressures:

- secrecy vs local trust;
- information value vs exposure;
- autonomy vs institutional coordination;
- whether a durable movement should depend on central command.

### `people`

Progresses from seized food and collective defense into punishment depots, worker resistance, liberated-district survival, evacuation scarcity, council legitimacy, regional corridors, free-town self-rule, then a mutual-defense compact.

Primary pressures:

- protecting civilians vs preserving operational freedom;
- legitimacy vs speed;
- local self-rule vs Revolutionary hierarchy;
- whether liberation survives after the cell leaves.

### `strike`

Progresses from convoy sabotage into premature explosives, redirected military transport, prisoner/map convoys, bridge demolition, hardliner bombing, signal fortresses, ceasefire pressure, then the fate of a captured command archive.

Primary pressures:

- tactical success vs collateral risk;
- escalation vs restraint;
- enemy attention / bounty;
- using force without becoming structurally dependent on force.

### Route fallback

Every layer after L1 has one route-local fallback covering every previous-layer root exactly once. These are concrete Revolutionary command/field situations, not generic filler, and preserve structural safety if a specialized History predicate cannot be satisfied.

## Career progression

Promotions are explicit authored Choices, never automatic:

| Promotion | Earliest layer | Gate |
|---|---:|---|
| `revolutionary_recruit` → `revolutionary_agent` | L2 | current rank Recruit + Reputation >= 10 |
| `revolutionary_agent` → `revolutionary_operator` | L4 | current rank Agent + Reputation >= 30 |
| `revolutionary_operator` → `revolutionary_officer` | L6 | current rank Operator + Reputation >= 50 |
| `revolutionary_officer` → `revolutionary_regional_commander` | L8 | current rank Officer + Reputation >= 70 |

Catch-up promotion Choices exist at later promotion layers so a delayed reputation curve does not permanently brick progression. L10 also allows the final Regional Commander promotion when the player reaches the Officer + 70 gate late.

The Saga never calls `setCareerAffiliation`, so it cannot switch the player out of Revolutionary after entry.

## Institutional support vs personal growth

The authored Revolution provides information, contacts and occasional bounded operational funding. It does not:

- grant a personal ship;
- create a fleet;
- create a cell-management subsystem;
- create a second inventory;
- replace the crew system;
- add a generic faction-resource state.

No geographic lock is authored, so the track can coexist with normal player travel and personal ship/crew growth.

## Persistent definitions

New definitions: **0**.

Existing persistent gameplay vocabulary used:

- career affiliation `revolutionary`;
- Revolutionary rank ladder;
- Reputation;
- Bounty;
- Berrys;
- player Stats / Health;
- History.

No new NPC is proposed. Revolutionary coordinators, couriers, workers, officers and local actors remain Event-local prose because no approved persistent Revolutionary NPC currently exists in the shared catalogue and this batch does not own shared definitions.

## Exact shared MajorTrack definition requested from integrator

```ts
{
  id: 'career_revolutionary',
  type: 'personal_affiliation',
  eligibility: {
    type: 'careerAffiliationIs',
    affiliationId: 'revolutionary',
  },
  chapters: [
    { id: 'active_01_recognition', phase: 'active', dueAgeMonths: 180 },
    { id: 'active_02_first_cell', phase: 'active', dueAgeMonths: 204 },
    { id: 'active_03_counterpressure', phase: 'active', dueAgeMonths: 228 },
    { id: 'active_04_autonomy', phase: 'active', dueAgeMonths: 252 },
    { id: 'active_05_network_war', phase: 'active', dueAgeMonths: 276 },
    { id: 'active_06_command', phase: 'active', dueAgeMonths: 300 },
    { id: 'active_07_fracture', phase: 'active', dueAgeMonths: 324 },
    { id: 'active_08_regional_front', phase: 'active', dueAgeMonths: 348 },
    { id: 'active_09_legacy', phase: 'active', dueAgeMonths: 372 },
    { id: 'active_10_resolution', phase: 'active', dueAgeMonths: 396 },
  ],
}
```

This shared definition was **not** edited by this batch.

## Routing scenario plan

The current Saga scenario helper on `dev` constructs scenario states with `careerPhase = 'childhood'`. Therefore executable source scenarios for this `phase: 'active'` Personal Affiliation track would be false negatives until the shared tooling is made Active-aware. `rules.enforceScenarioCoverage` is intentionally `false` in this source; the scenarios below are the integration plan, not hidden runtime state.

### Entry

1. `inherited_family_record`
   - career: Revolutionary / Recruit
   - History contains `family_revolutionary_37_i01 -> active_revolutionary_record`
   - expected L1: `career_revolutionary_01_inherited_contact`

2. `new_active_revolutionary`
   - career: Revolutionary / Recruit
   - no qualifying Family Revolutionary Layer-5 outcome
   - expected L1: `career_revolutionary_01_new_cell`

### Doctrine routing

3. `inherited_to_network`
   - L1 inherited root played with Choice `network`
   - expected L2: `career_revolutionary_02_burned_safehouse`

4. `new_to_people`
   - L1 fallback played with Choice `people`
   - expected L2: `career_revolutionary_02_seized_rations`

5. `new_to_strike`
   - L1 fallback played with Choice `strike`
   - expected L2: `career_revolutionary_02_munitions_convoy`

6. `network_to_strike_cross`
   - an eligible network node in the previous layer was lived
   - its latest doctrine Choice was `strike`
   - expected next layer: strike specialized node

7. `people_to_network_cross`
   - a people node in the previous layer was lived
   - its latest doctrine Choice was `network`
   - expected next layer: network specialized node

### Promotions

8. `agent_gate`
   - Recruit, Reputation 10
   - L2 Immediate should expose `accept_agent`

9. `operator_gate`
   - Agent, Reputation 30
   - L4 Immediate should expose `accept_operator`

10. `officer_gate`
    - Operator, Reputation 50
    - L6 Immediate should expose `accept_officer`

11. `regional_commander_gate`
    - Officer, Reputation 70
    - L8 Immediate should expose `accept_regional_commander`

12. `late_command_gate`
    - Officer, Reputation 70 at L10
    - terminal Immediate should expose `accept_command_if_ready`

### Terminal routes

13. reach L10 through `network` → `career_revolutionary_10_decentralized_lattice`
14. reach L10 through `people` → `career_revolutionary_10_mutual_defense`
15. reach L10 through `strike` → `career_revolutionary_10_command_archive`
16. fallback safety → `career_revolutionary_10_regional_assembly`

## Static validation performed on the delivered source

Passed:

- JSON parses successfully.
- 76 unique prefixed Event IDs.
- 38 Major Normal roots / 38 Immediate / 0 Scheduled.
- 10 chapters with root counts `2, 4, 4, 4, 4, 4, 4, 4, 4, 4`.
- exactly one L1 fallback.
- every previous-layer node has exactly one next-layer fallback coverage.
- all later specialized roots have explicit eligibility.
- every Major root queues exactly one existing Immediate.
- no orphan Immediate.
- no Immediate cycle.
- FR + EN copy present on all Events, Choices and Outcomes.
- Root body budget: 20–45 words.
- Immediate body budget: 12–40 words.
- Choice-label budget: 2–10 words.
- Outcome budget: 5–25 words.
- all panels retain at least one unconditional Choice.
- 22 / 38 roots contain Dice = 57.89%.
- every Dice root exposes 2 Dice approaches.
- no negative `modifyReputation`.
- no `setCareerAffiliation`.
- no `scheduleEvent`.
- no movement Effect.
- no new Flag Effect.
- every reachable Layer-10 leaf contains at least one configured persistent reward Effect.
- promotion rank IDs and rank/Reputation gates use the existing Revolutionary ladder.

## Official repository validation status

Not executed in this environment:

```text
npx jiti scripts/saga-content.ts compile career_revolutionary
npx jiti scripts/saga-content.ts check career_revolutionary
npm run validate-content
npm test
npm run build
```

Reason: the available repository access in this worker is read-only connector access rather than a mutable authenticated checkout, and the batch explicitly forbids creating a Git commit/push/PR as a transport workaround.

There are also two expected integration constraints:

1. `career_revolutionary` is not yet registered in the shared `majorNarrativeTracks` catalogue; that registration belongs to the later shared integration worker.
2. current Saga routing scenarios hardcode `careerPhase = 'childhood'`, so Active scenario execution needs the shared helper to accept `active` before `enforceScenarioCoverage` can be enabled for this source.

The authoring source itself was therefore validated structurally/staticly against the current `dev` vocabulary, but the official compiler/check/global npm pipeline remains an integration-time validation step.

## Starvation / eligibility risks

- **Major-track starvation after registration:** low structurally. Every layer has route-local fallback coverage.
- **L1 inherited specialization:** intentionally restrictive; the career-only fallback covers all other Revolutionary entrants.
- **Geography starvation:** none introduced; no Location lock.
- **Crew/ship starvation:** none introduced; no root requires a personal ship or crew.
- **Promotion starvation:** promotions can be delayed by low Reputation, but catch-up opportunities exist and promotion is not required to keep the narrative DAG progressing.
- **Scenario coverage:** intentionally deferred because of the current Active-incompatible scenario helper.

## Shared integration still required

1. Place this source at:
   `content-authoring/sagas/career_revolutionary.authoring.json`
2. Add the shared MajorTrack definition above to the central catalogue.
3. Make the Saga routing helper capable of `careerPhase: 'active'` scenarios, then encode/enable the scenario set.
4. Run:
   - `npx jiti scripts/saga-content.ts compile career_revolutionary`
   - `npx jiti scripts/saga-content.ts check career_revolutionary`
   - `npm run validate-content`
   - `npm test`
   - `npm run build`
5. Treat compiler-generated runtime/localization assets as generated output; do not hand-author them as source of truth.
