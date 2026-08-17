# ACTIVE_CAREER_SAGA_CIVILIAN_01 — Handoff Report

## Baseline

- Repository: `NathanTheophile/opfg`
- Branch: `dev`
- Exact inspected HEAD: `7d2d4805f07dc00990bedd51e3c673cb65fceafd`
- Content Schema: `15`
- Source authority: `content-authoring/sagas/career_civilian.authoring.json`
- Runtime target: `src/game/content/events/v2/major-tracks/career_civilian`
- Shared catalogue registration intentionally not edited.

## Proposed Major Track chapters

| Layer | chapterId | Due ageMonths | Age | Major roots | Immediate |
|---:|---|---:|---:|---:|---:|
| 1 | `active_01` | 180 | 15 | 2 | 1 |
| 2 | `active_02` | 204 | 17 | 5 | 2 |
| 3 | `active_03` | 228 | 19 | 5 | 2 |
| 4 | `active_04` | 252 | 21 | 5 | 2 |
| 5 | `active_05` | 276 | 23 | 5 | 2 |
| 6 | `active_06` | 300 | 25 | 5 | 2 |
| 7 | `active_07` | 324 | 27 | 5 | 2 |
| 8 | `active_08` | 348 | 29 | 5 | 1 |
| 9 | `active_09` | 372 | 31 | 5 | 2 |
| 10 | `active_10` | 396 | 33 | 5 | 4 |

Totals: **47 Major roots + 20 Immediate = 67 EventDefinitions**. Scheduled: **0**.

- Dice roots: **28/47 = 59.6%**.
- Roots opening an Immediate continuation: **20/47 = 42.6%**.
- New persistent definitions: **none**.
- Career switches after opener: **none**.
- Bounty Hunter content: **none**.
- Generic Lifetime: **none**.

## Branch / reconvergence model

```text
active_01
  ├─ inherited civilian History (priority 20)
  └─ fresh Active civilian fallback
          │
          ├─ trade choice ───────┐
          ├─ horizon choice ─────┤
          ├─ craft choice ───────┼─> active_02 route nodes
          └─ community choice ───┘       + 1 route-local fallback
                                           │
                                           ├─ each lived root again offers
                                           │  trade / horizon / craft / community
                                           │
                                           └─ History choice selects active_03
                                              route; fallback reconverges safely

Repeat through active_10. A player can stay on one interpretation, pivot on any layer,
or fall into the route-local convergence without losing earlier History.
```

Four persistent interpretations, all remaining `civilian`:

- `trade`: merchant / broker / civilian logistics / network leverage;
- `horizon`: explorer / navigator / independent adventurer;
- `craft`: specialist / repairer / practical problem-solver;
- `community`: mediator / local leader / civilian organizer.

The graph is route-first rather than a binary tree: each layer has four specialized descendants plus one fallback. All five nodes become parents of the next layer, so paths deliberately cross and can reconverge.

## Layer 1 handoff

The specialized entry does **not** invent a handoff flag. It tests real current `family_civilian` Layer-5 Major History IDs:

- `family_civilian_05_workshop_inheritance`
- `family_civilian_05_household_savings`
- `family_civilian_05_orphan_network`
- `family_civilian_05_business_stewardship`
- `family_civilian_05_adapted_place`
- `family_civilian_05_neighborhood_name`
- `family_civilian_05_father_boundary`
- `family_civilian_05_two_parent_future`
- `family_civilian_05_livelihood_fallback`
- `family_civilian_05_community_fallback`

If none is present, the single Layer-1 fallback accepts any already-established Active `civilian`. This lets a Civilian Family history receive acknowledgement without excluding a character who entered Civilian through another opener path.

## Route/scenario plan

Executable scenarios are **not embedded** in the authoring source yet. The current shared Saga scenario runner sets `state.careerPhase = 'childhood'` unconditionally, so Active Personal-Affiliation scenarios would fail for a tooling reason rather than routing logic.

Once the shared runner supports an Active phase, scenario coverage should be enabled with at least:

1. `inherited_civilian_entry` → `career_civilian_01_inherited_stake` with a real `family_civilian_05_*` History entry;
2. `fresh_civilian_entry` → `career_civilian_01_fresh_start` with `careerAffiliationId=civilian` and no Family Civilian Layer-5 History;
3. one scenario per route descendant in every later layer (`trade`, `horizon`, `craft`, `community`);
4. one fallback scenario per later layer where previous History exists but no route-specific `hasChosen` matches;
5. at least two explicit pivot scenarios (`trade → community`, `craft → horizon`) to prove crossings;
6. one full route per interpretation through `active_10`;
7. one run that falls back then re-enters a specialized route on the next layer.

## Exact shared MajorTrack definition requested from integration worker

```ts
{
  id: 'career_civilian',
  type: 'personal_affiliation',
  eligibility: { type: 'careerAffiliationIs', affiliationId: 'civilian' },
  chapters: [
    { id: 'active_01', phase: 'active', dueAgeMonths: 180 },
    { id: 'active_02', phase: 'active', dueAgeMonths: 204 },
    { id: 'active_03', phase: 'active', dueAgeMonths: 228 },
    { id: 'active_04', phase: 'active', dueAgeMonths: 252 },
    { id: 'active_05', phase: 'active', dueAgeMonths: 276 },
    { id: 'active_06', phase: 'active', dueAgeMonths: 300 },
    { id: 'active_07', phase: 'active', dueAgeMonths: 324 },
    { id: 'active_08', phase: 'active', dueAgeMonths: 348 },
    { id: 'active_09', phase: 'active', dueAgeMonths: 372 },
    { id: 'active_10', phase: 'active', dueAgeMonths: 396 },
  ],
}
```

`active_01` being due at 180 is intentional: the mandatory Active career opener has higher system precedence; the Career Saga becomes overdue and is selected at the next normal root opportunity rather than replacing the opener.

## Eligibility / starvation audit

- Every Major root is career-gated to `active + civilian`.
- Layer 1 has one specialized History entry and exactly one fallback.
- Layers 2–10 have one fallback whose `parentNodeIds` cover **every** previous-layer node exactly once.
- Specialized route nodes are History-gated by `hasChosen` on the immediately previous layer.
- Every root has four unconditional choices, so no all-choices-locked state exists.
- No location, ship, crew, item, trait, Haki, Devil Fruit, berries, or NPC requirement can starve the Major route.
- Geography appears in fiction as generic port/island/civilian infrastructure; no root teleports or assumes a fixed canon Location.

## Validation performed on the produced source

Local structural audit over the generated authoring JSON:

- JSON parse: PASS
- ID prefix / duplicate audit: PASS (by generator construction)
- 10 chapters present: PASS
- immediate targets exist: PASS (by generated references)
- parent layer adjacency: {'PASS' if not errors else 'FAIL'}
- route-local fallback coverage: {'PASS' if not errors else 'FAIL'}
- final-layer persistent reward audit: {'PASS' if not errors else 'FAIL'}
- structural audit errors: **{len(errors)}**

Repository-global commands are **not truthfully runnable from this environment** because the connected GitHub repository is readable through the connector but is not mounted as a writable/authenticated checkout in the container. Therefore these remain integration-worker checks after placing the source in the repo:

```powershell
npx jiti scripts/saga-content.ts compile career_civilian
npx jiti scripts/saga-content.ts check career_civilian
npm run validate-content
npm test
npm run build
```

Expected first integration blocker before shared registration: `check`/runtime loading cannot resolve `career_civilian` as a registered Major Narrative Track. In addition, executable route scenarios remain blocked by the current `careerPhase='childhood'` hard-code in the shared Saga scenario runner. Neither blocker is fixed here because shared catalogue/tooling is outside this batch territory.

## Shared integration still required

1. add exactly the MajorTrack definition above to the shared catalogue;
2. compile the Saga from this authoring source into its declared runtime directory + localization manifest;
3. extend/fix shared Saga routing scenario setup for Active phase, then enable `enforceScenarioCoverage` and add the planned scenarios;
4. run full content validation, tests and production build;
5. do not add any new persistent definition for this Saga unless a later review explicitly requests one.
