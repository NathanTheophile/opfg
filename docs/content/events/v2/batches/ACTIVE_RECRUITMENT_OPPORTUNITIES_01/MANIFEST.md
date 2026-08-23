# MANIFEST — ACTIVE_RECRUITMENT_OPPORTUNITIES_01

## Baseline

- Repository: `NathanTheophile/opfg`
- Branch read: `dev`
- Exact HEAD read before authoring: `c71b0e65f6cf3f75312f63d4aa8b120e172393eb`
- HEAD message: `feat(content): active recruitment 01`
- Content Schema observed on current Wave 3 authority: **16**
- Save version observed: **23**
- Prerequisites confirmed from current `dev`:
  - Existing Cast recruitment batch integrated;
  - New Cast batch files integrated;
  - accepted New Cast NPC definitions present in `catalogFactory.ts`.

## Final casting reused

Existing recurring candidates:
- `childhood_friend`
- `childhood_rival`
- `rohan`
- `ari`
- `owen`

Accepted New Cast candidates:
- `active_recruit_knot_runner`
- `active_recruit_notice_carver`
- `active_recruit_wake_keeper`
- `active_recruit_lot_runner`

New persistent NPC definitions: **ZERO**.

## Production totals

- Normal roots: **12**
- Recruitment roots: **12 / 12**
- Dice roots: **7 / 12 = 58.3%**
- Immediate EventDefinitions: **0**
- Scheduled EventDefinitions: **0**
- Lifetime structures: **0**
- New persistent definitions: **0**
- CrewRole references: **0**
- Removed CrewRole references: **0**

## Root inventory

| Root ID | Candidate | Age | Career | Geography / context | Required History | Resolution profile |
|---|---|---|---|---|---|---|
| `active_recruitment_opportunities_01_knot_runner_customs_line` | `active_recruit_knot_runner` | `180+` | `civilian / pirate / revolutionary` | `land + port` | `active_recruitment_new_cast_01_last_knot` | `Dice` |
| `active_recruitment_opportunities_01_notice_carver_burning_board` | `active_recruit_notice_carver` | `180+` | `civilian / pirate / revolutionary` | `land + city|village` | `active_recruitment_new_cast_01_blank_board` | `Dice` |
| `active_recruitment_opportunities_01_wake_keeper_storm_tags` | `active_recruit_wake_keeper` | `180+` | `civilian / pirate / revolutionary` | `land + coastal|port` | `active_recruitment_new_cast_01_brass_tag_unclaimed` | `Deterministic` |
| `active_recruitment_opportunities_01_lot_runner_locked_market` | `active_recruit_lot_runner` | `180+` | `civilian / pirate / revolutionary` | `land + trade service` | `active_recruitment_new_cast_01_after_last_lot` | `Dice` |
| `active_recruitment_opportunities_01_rohan_supplier_walkout` | `rohan` | `180–227` | `civilian / pirate` | `East Blue + food service` | `active_recruitment_existing_cast_01_rohan_second_service` | `Dice` |
| `active_recruitment_opportunities_01_rohan_relief_kitchen_sweep` | `rohan` | `180–227` | `revolutionary` | `East Blue + food service` | `active_recruitment_existing_cast_01_rohan_revolutionary_relief_kitchen` | `Deterministic` |
| `active_recruitment_opportunities_01_ari_quarantine_transfer` | `ari` | `180–227` | `civilian / pirate` | `East Blue + medical service` | `active_recruitment_existing_cast_01_ari_quarantine_last_shift` | `Dice` |
| `active_recruitment_opportunities_01_ari_ledger_warrant` | `ari` | `180–227` | `revolutionary` | `East Blue + medical service` | `active_recruitment_existing_cast_01_ari_false_name_patient` | `Deterministic` |
| `active_recruitment_opportunities_01_owen_crane_claim` | `owen` | `180–227` | `civilian / pirate` | `East Blue + ship_repair service` | `active_recruitment_existing_cast_01_owen_drydock_blame` | `Dice` |
| `active_recruitment_opportunities_01_owen_hidden_slipway_sweep` | `owen` | `180–227` | `revolutionary` | `East Blue + ship_repair service` | `active_recruitment_existing_cast_01_owen_revolutionary_hidden_keel` | `Deterministic` |
| `active_recruitment_opportunities_01_friend_second_departure` | `childhood_friend` | `180–227` | `civilian / pirate / revolutionary` | `land + current Blue == origin Blue` | `any prior Existing Cast friend recruitment root` | `Dice` |
| `active_recruitment_opportunities_01_rival_last_scorecard` | `childhood_rival` | `180–227` | `civilian / pirate / revolutionary` | `land + current Blue == origin Blue` | `any prior Existing Cast rival recruitment root` | `Deterministic` |

## Ordinary eligibility

Every root requires:
- `careerPhaseIs(active)`;
- `ageAtLeastMonths(180)`;
- explicit career/geography context;
- a concrete prior recruitment/history anchor;
- candidate interaction delay (`npcMonthsSinceInteractionAtLeast`) of 1 or 3 months;
- candidate not `dead`, `departed`, `unavailable`, or already `crew`;
- `canRecruitNpc(candidate)`.

The four New Cast callbacks have no upper age bound and remain useful later in Active.
The eight Existing Cast/friend/rival callbacks use `ageAtMostMonths(227)` to directly reinforce ages 15–18.

## Recruiter eligibility

Recruiter eligibility is intentionally identical to ordinary root eligibility.

There is:
- no Recruiter-only marker;
- no clone Event;
- no Role vacancy gate;
- no `hasShip` gate authored into recruitment content;
- no numeric NPC Stat prerequisite.

Every root contains a directly reachable root Outcome with:
`setNpcStatus(candidate, crew)`.

Therefore the current runtime recruitment classifier can use the same Normal Event for ordinary selection and Recruiter selection.

## Route distinction / anti-duplication

The batch does not replay first-meeting dialogue.

- New Cast roots require that candidate's already-integrated third touchpoint recruitment root to have been played and then wait at least 3 months.
- Rohan/Ari/Owen receive separate callbacks for materially different prior Existing Cast routes.
- Friend/rival callbacks require one of their already-integrated career-specific recruitment roots, then wait at least 1 month.
- `canRecruitNpc` plus status guards prevent any callback after successful recruitment.

## Early Active coverage

Coverage for ages 15–18 (`180..227` months):
- Civilian: Rohan supplier, Ari transfer, Owen crane, friend, rival, plus all four New Cast callback families when their history exists.
- Pirate: same broad civilian/pirate routes plus friend/rival and New Cast callbacks.
- Revolutionary: Rohan relief, Ari warrant, Owen hidden slipway, friend, rival, plus New Cast callbacks.
- Marine: intentionally not targeted; exempt by worker brief.

## Dice roots

- `active_recruitment_opportunities_01_knot_runner_customs_line`
- `active_recruitment_opportunities_01_notice_carver_burning_board`
- `active_recruitment_opportunities_01_lot_runner_locked_market`
- `active_recruitment_opportunities_01_rohan_supplier_walkout`
- `active_recruitment_opportunities_01_ari_quarantine_transfer`
- `active_recruitment_opportunities_01_owen_crane_claim`
- `active_recruitment_opportunities_01_friend_second_departure`

Ratio: **58.3%**, inside the requested 55–65% band.

## Immediate / Scheduled

- Immediate roots: **none**.
- Scheduled structures: **none**.
- Lifetime structures: **none**.

This batch deliberately keeps followups as one concrete recruitment scene each rather than extending another narrative graph.

## Crew contract audit

- Recruitment success uses only `setNpcStatus -> crew` plus ordinary relationship/reputation/cost consequences.
- No fixed Role assignment.
- No Role vacancy gating.
- No Role recommendation.
- No pre-recruit exact NPC Stat requirement.
- No references to removed Role IDs.
- Crew capacity is delegated to current `canRecruitNpc`.

## Seeded-name interpolation audit

All player-facing seeded identities use current NPC interpolation tokens:
- `{{npc_childhood_friend}}`
- `{{npc_childhood_rival}}`
- `{{npc_rohan}}`
- `{{npc_ari}}`
- `{{npc_owen}}`
- `{{npc_active_recruit_knot_runner}}`
- `{{npc_active_recruit_notice_carver}}`
- `{{npc_active_recruit_wake_keeper}}`
- `{{npc_active_recruit_lot_runner}}`

No seeded personal fallback name is hardcoded.

## FR / EN

- Localization fragment FR keys: **117**
- Localization fragment EN keys: **117**
- Key parity: **PASS**
- Root copy static word-budget check: **PASS** (20–45 words in both languages)

## Validation status

Local package validation:
- 12 unique Normal roots: PASS
- 12/12 directly recruitable roots: PASS
- 7/12 Dice roots: PASS
- `canRecruitNpc` on every root: PASS
- dead/departed/unavailable/crew guards on every root: PASS
- FR/EN key parity: PASS
- no CrewRole references: PASS
- no persistent definition proposal: PASS

Repository-level commands were **not run** because this environment has no network-capable writable checkout of the private/current repository and GitHub writes would create commits, forbidden by this worker contract:

```bash
npm run validate-content   # NOT RUN
npm test                   # NOT RUN
npm run build              # NOT RUN
```

The package includes a local overlay plus a locale-merge script so these commands can be run directly in the user's checkout without any commit/push/PR.

## Exact file inventory

- `src/game/content/events/v2/ordinary/ACTIVE_RECRUITMENT_OPPORTUNITIES_01/` — 12 EventDefinition JSON files
- `docs/content/events/v2/batches/ACTIVE_RECRUITMENT_OPPORTUNITIES_01/MANIFEST.md`
- `docs/content/events/v2/batches/ACTIVE_RECRUITMENT_OPPORTUNITIES_01/SELF_AUDIT.md`
- `docs/content/events/v2/batches/ACTIVE_RECRUITMENT_OPPORTUNITIES_01/VALIDATION.json`
- `docs/content/events/v2/batches/ACTIVE_RECRUITMENT_OPPORTUNITIES_01/PROPOSED_DEFINITIONS.json`
- `docs/content/events/v2/batches/ACTIVE_RECRUITMENT_OPPORTUNITIES_01/localization.fr.json`
- `docs/content/events/v2/batches/ACTIVE_RECRUITMENT_OPPORTUNITIES_01/localization.en.json`
- `scripts/apply-active-recruitment-opportunities-01.mjs`
- `APPLY_ACTIVE_RECRUITMENT_OPPORTUNITIES_01.md`
