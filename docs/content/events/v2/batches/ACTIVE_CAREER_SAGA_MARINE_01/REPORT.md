# ACTIVE_CAREER_SAGA_MARINE_01 — Handoff

## Baseline

- Repository authority: `NathanTheophile/opfg`, branch `dev`.
- Exact `dev` HEAD read before authoring: `7d2d4805f07dc00990bedd51e3c673cb65fceafd`.
- Pack baseline was older (`93581c6b2f45101030908e11752eaaaf72718946`); current `dev` won.
- Current Content Schema: `14`.
- `career_marine` was not registered in `majorNarrativeTracks` at this HEAD.
- No legacy `archives/ACTIVE_*` material was used.

## Authored files

- `content-authoring/sagas/career_marine.authoring.json`
- `ACTIVE_CAREER_SAGA_MARINE_01_REPORT.md`

No shared catalog, engine, schema, save, UI, navigation, or other Saga source was edited.

## Structure

| Chapitre | Due | Âge | Roots | Immediate | Total | Dice roots |
|---|---:|---:|---:|---:|---:|---:|
| `active_01` | 180m | 15 | 2 | 2 | 4 | 2 |
| `active_02` | 204m | 17 | 4 | 3 | 7 | 2 |
| `active_03` | 228m | 19 | 4 | 3 | 7 | 2 |
| `active_04` | 252m | 21 | 4 | 6 | 10 | 2 |
| `active_05` | 276m | 23 | 4 | 3 | 7 | 2 |
| `active_06` | 300m | 25 | 4 | 3 | 7 | 2 |
| `active_07` | 324m | 27 | 4 | 6 | 10 | 2 |
| `active_08` | 348m | 29 | 4 | 3 | 7 | 2 |
| `active_09` | 372m | 31 | 4 | 3 | 7 | 1 |
| `active_10` | 396m | 33 | 4 | 6 | 10 | 1 |

Totals:

- **38 Major roots**
- **38 Immediate Events**
- **0 Scheduled Events**
- **76 total authored EventDefinitions**
- **29 / 38 roots open an Immediate mini-arc = 76.3%**
- **9 roots reach Immediate depth 2** (all specialized routes in Layers 4, 7, 10)
- **18 / 38 Dice roots = 47.4%**
- Dice thresholds use only `11 / 14 / 17`.
- Resolution target: **33 years old** (`396` months), under the current 420-month V1 horizon.

## Narrative route model

The DAG does not store a doctrine flag or Saga state. Route identity is derived from the immediately previous Major root's History.

```text
Layer 1
  inherited Marine handoff ─┐
                            ├─ choice/result → DUTY
  new Active Marine fallback┼─ choice/result → SHIELD
                            └─ choice/result → INITIATIVE

Layers 2–10
             ┌──────── DUTY node ─────────┐
previous ────┼──────── SHIELD node ───────┼─ next layer
result       └──── INITIATIVE node ───────┘
                      │
                 risky Dice failure
                      ▼
               route-local FALLBACK
                      │
             new D / S / I decision
                      ▼
                 next layer
```

The three recurring doctrines are:

- **Duty / chain:** traceable orders, procedure, responsibility, institutional reliability.
- **Shield / protection:** civilians, witnesses, proportionality, rescue, human consequences.
- **Initiative / field:** tempo, interception, mobility, decisive action, accepting operational risk.

They are not morality scores and are not persistent state. Each chapter can change direction.

## Chapter roots

### active_01 — 180 mois / 15 ans
- `career_marine_01_inherited_colors` — specialized
- `career_marine_01_new_uniform` — fallback

### active_02 — 204 mois / 17 ans
- `career_marine_02_night_roster` — specialized
- `career_marine_02_refugee_quay` — specialized
- `career_marine_02_unmarked_cutter` — specialized
- `career_marine_02_relief_patrol` — fallback

### active_03 — 228 mois / 19 ans
- `career_marine_03_divided_orders` — specialized
- `career_marine_03_cell_six` — specialized
- `career_marine_03_false_pennant` — specialized
- `career_marine_03_incomplete_report` — fallback

### active_04 — 252 mois / 21 ans
- `career_marine_04_sealed_ledger` — specialized
- `career_marine_04_counted_rations` — specialized
- `career_marine_04_warehouse_four` — specialized
- `career_marine_04_missing_signature` — fallback

### active_05 — 276 mois / 23 ans
- `career_marine_05_harbor_curfew` — specialized
- `career_marine_05_mole_gate` — specialized
- `career_marine_05_lighthouse_signal` — specialized
- `career_marine_05_blockade_night` — fallback

### active_06 — 300 mois / 25 ans
- `career_marine_06_three_ships` — specialized
- `career_marine_06_hospital_signal` — specialized
- `career_marine_06_convoy_breach` — specialized
- `career_marine_06_priority_chart` — fallback

### active_07 — 324 mois / 27 ans
- `career_marine_07_base_forty_two` — specialized
- `career_marine_07_discipline_court` — specialized
- `career_marine_07_cannon_square` — specialized
- `career_marine_07_three_bases` — fallback

### active_08 — 348 mois / 29 ans
- `career_marine_08_closed_door_order` — specialized
- `career_marine_08_escorted_witness` — specialized
- `career_marine_08_black_seal` — specialized
- `career_marine_08_unnamed_file` — fallback

### active_09 — 372 mois / 31 ans
- `career_marine_09_reinforcement_map` — specialized
- `career_marine_09_arsenal_quarter` — specialized
- `career_marine_09_ghost_squadron` — specialized
- `career_marine_09_white_table` — fallback

### active_10 — 396 mois / 33 ans
- `career_marine_10_ordered_justice` — specialized
- `career_marine_10_human_scale` — specialized
- `career_marine_10_moving_justice` — specialized
- `career_marine_10_white_coat` — fallback


## Layer-1 contextual handoff

The specialized entry root uses only real current Family Marine History Outcomes that derive `marine + marine_recruit`:

- `family_marine_13_insignia_in_palm_i02_meaning` → outcome `active_marine`
- `family_marine_13_your_future_is_yours_i02_keep` → outcome `active_marine`
- `family_marine_13_chest_he_left_i03_answer` → outcome `active_marine`
- `family_marine_13_wear_it_better_i03_answer` → outcome `active_marine`
- `family_marine_13_duty_not_obedience_i03_answer` → outcome `active_marine_reform`
- `family_marine_13_our_name_is_not_theirs_i03_answer` → outcome `active_marine_despite_break`
- `family_marine_13_what_remains_of_him_i03_answer` → outcome `active_marine_memory`
- `family_marine_13_decide_for_yourself_i02_opportunity` → outcome `active_marine`
- `family_marine_13_your_name_on_roll_i03_signature` → outcome `active_marine_registered`
- `family_marine_13_on_your_terms_i04_resolution` → outcome `active_marine_own_terms`

The second entry root is the universal Active-Marine fallback. No invented flag is used.

## Promotions

Promotions are authored inside the mini-arcs and never automatic:

| Layer | Offered target |
|---|---|
| 2 | `marine_petty_officer` |
| 3 | `marine_lieutenant` |
| 4 | `marine_commander` |
| 5 | `marine_captain` |
| 6 | `marine_commodore` |
| 7 | `marine_rear_admiral` |
| 8 | `marine_vice_admiral` |
| 9 | `marine_admiral` |
| 10 | `marine_fleet_admiral` |

Layers 2–9 gate the promotion Choice with `not(careerRankAtLeast(target))`, so the Saga never downgrades an already-advanced Marine and may legitimately skip intermediary ranks.

Fleet Admiral is deliberately rare: the Choice requires `marine_admiral` or higher, `reputation >= 65`, and not already being Fleet Admiral.

## Consequence vocabulary

Used:

- `modifyReputation`
- `modifyStat`
- `modifyHealth` on failed physical Dice risks
- `modifyBerries` once as an explicit operational cost
- `setCareerRank`
- `queueImmediateEvent`

Explicitly absent:

- bounty changes
- post-opener career changes
- new Flags
- personal ship requirements/effects
- personal crew requirements/effects
- leadership requirements
- new Items/NPCs/Traits/Locations/Ships
- Scheduled chains
- new persistent Saga state

Early and mid-career transport is institutional in fiction; no personal ship or crew is required to progress.

## Scenario plan

The authoring source contains **36 descendant routing scenarios**:

- 3 route scenarios per Layer 2–10 (`duty`, `shield`, `initiative`);
- 1 fallback scenario per Layer 2–10;
- fallback scenarios are caused by a failed risky Dice approach in the previous layer;
- all 36 descendant Major root IDs are covered by `expectedEventId`.

Layer 1 itself is not part of descendant coverage. Its specialized eligibility was audited directly against the ten real Family Marine handoff Outcomes above.

## Starvation / eligibility audit

- Every Layer 2–10 root lists parents only from the immediately previous Layer.
- Every previous-layer parent is covered by exactly one route-local fallback in the next Layer.
- Every non-fallback descendant has a History eligibility gate.
- Every specialized root has at least one Immediate continuation.
- Dice failure intentionally stops specialized route propagation, allowing the next route-local fallback to resolve.
- No geography, ship, crew, rank, Reputation, Race, Item, or NPC Condition can starve the structural DAG.
- The only global availability dependency is the shared `career_marine` Major Track registration.

## Exact shared MajorTrack definition requested from integrator

```ts
{
  id: 'career_marine',
  type: 'personal_affiliation',
  eligibility: { type: 'careerAffiliationIs', affiliationId: 'marine' },
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

This is the only required shared catalogue definition for the authored DAG itself. Generated runtime Events/localization should continue to come from the Saga compiler, never by hand-editing generated Event files as source of truth.

## Validation performed on the authored source

Source-level audit against the current Saga authoring contract:

- JSON parse: **PASS**
- 76 unique Event IDs, all under `career_marine_`: **PASS**
- FR/EN present for Event / Choice / Outcome copy: **PASS**
- Immediate targets exist and are Immediate: **PASS**
- Immediate cycles: **0**
- orphan Immediate Events: **0**
- first-layer fallback count: **1**
- route-local fallback coverage: **PASS**
- specialized descendant eligibility gates: **PASS**
- specialized mini-arc requirement: **PASS**
- routing scenario ID coverage: **36 / 36 descendant roots**
- terminal Layer-10 persistent reward leaves: **PASS**
- forbidden bounty / career-switch / ship / crew / Scheduled Effects: **0**
- choice resolvability: every Event has at least two unconditional Choices
- editorial budgets:
  - Root FR: 26–36 words
  - Root EN: 23–34 words
  - Immediate FR: 21–33 words
  - Immediate EN: 21–32 words
  - Outcome FR: 6–20 words
  - Outcome EN: 6–18 words
  - Choice FR/EN: 2–6 / 2–6 words

## Validation not executable in this worker environment

The execution sandbox had the uploaded authorities and GitHub connector read access, but no local repository checkout and no outbound Git network; cloning `dev` failed on DNS. Therefore these repository commands could not be run truthfully against the new source:

```text
npx jiti scripts/saga-content.ts compile career_marine
npx jiti scripts/saga-content.ts check career_marine
npm run validate-content
npm test
npm run build
```

Two shared integration/tooling facts matter when those commands are run in the real workspace:

1. `career_marine` is not yet registered in the shared `majorNarrativeTracks` catalogue at the audited HEAD, so the full Major selector cannot resolve this track until the integrator adds the definition above.
2. The current `scripts/saga-content/lib.ts` scenario runner sets `state.careerPhase = 'childhood'` unconditionally. Active routing scenarios therefore need shared Saga-tooling support for `active` phase before the 36 scenarios can execute against the real selector. This worker did not modify that shared tool because the batch owns authoring source only.

The authoring JSON itself requires no engine/schema/save/UI/navigation primitive beyond the current Schema 14 vocabulary.
