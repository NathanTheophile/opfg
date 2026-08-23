# ACTIVE_RECRUITMENT_NEW_CAST_01 — Self Audit / Validation

## Contract result

- Root target `12–16`: **PASS — 12 Normal roots**.
- Persistent NPC budget `3–5`: **PASS — 4 proposals**.
- Meaningful touchpoints: **PASS — 3 ordered root touchpoints per candidate**.
- Dice target `55–65%`: **PASS — 7/12 = 58.3%**.
- Immediate density: **6/12 = 50.0%**, all same-scene and one-step.
- FR + EN: **PASS in supplied fragments**.
- Recruitment roots: **4**.
- Scheduled structures: **0**.
- CrewRole references: **0**.
- Fixed candidate Stats: **0**.
- Static payload issues: **0**.

## Dice roots

- `active_recruitment_new_cast_01_auction_in_rain`
- `active_recruitment_new_cast_01_chalk_number_47`
- `active_recruitment_new_cast_01_face_under_paste`
- `active_recruitment_new_cast_01_name_without_body`
- `active_recruitment_new_cast_01_red_knot_crate`
- `active_recruitment_new_cast_01_three_debts_one_bell`
- `active_recruitment_new_cast_01_wrong_bell`


## Immediate-opening roots

- `active_recruitment_new_cast_01_chalk_number_47`
- `active_recruitment_new_cast_01_face_under_paste`
- `active_recruitment_new_cast_01_name_without_body`
- `active_recruitment_new_cast_01_red_knot_crate`
- `active_recruitment_new_cast_01_three_debts_one_bell`
- `active_recruitment_new_cast_01_wrong_bell`


All six Immediate targets exist in the same batch. No Immediate target queues another Immediate; cycles are impossible in the authored graph.

## Recruitment eligibility audit

- `active_recruitment_new_cast_01_after_last_lot` — third touchpoint; prior second touchpoint required; Relationship >= 5; candidate status safe; geography valid; root-level `canRecruitNpc(candidate)`.
- `active_recruitment_new_cast_01_blank_board` — third touchpoint; prior second touchpoint required; Relationship >= 5; candidate status safe; geography valid; root-level `canRecruitNpc(candidate)`.
- `active_recruitment_new_cast_01_brass_tag_unclaimed` — third touchpoint; prior second touchpoint required; Relationship >= 5; candidate status safe; geography valid; root-level `canRecruitNpc(candidate)`.
- `active_recruitment_new_cast_01_last_knot` — third touchpoint; prior second touchpoint required; Relationship >= 5; candidate status safe; geography valid; root-level `canRecruitNpc(candidate)`.


Successful recruitment uses `setNpcStatus(candidate, crew)` and a Relationship increase. There is no `hasShip`, target Role vacancy, CrewRole identity, candidate Stat threshold, or fixed mechanical specialty in the recruitment contract.

Keeping `canRecruitNpc` at root eligibility is deliberate: these four Normal roots are exactly the roots the Recruiter power can classify as recruitment Events, so a Recruiter roll cannot surface a candidate whose capacity/safety gate currently fails.

## Recruiter-pool eligibility audit

- Reachable `setNpcStatus -> crew` roots: **4 exactly**.
- Fake Recruiter-only clones: **0**.
- Recruiter marker/schema additions: **0**.
- Candidates can enter the Recruiter pool only after their first two authored encounters and sufficient Relationship.
- Shipless recruitment remains legal whenever current runtime `canRecruitNpc` returns true; this batch does not override it.

## Name-pool / seeded-name audit

| npcId | Sex | namePoolId | Result |
|---|---|---|---|
| `active_recruit_knot_runner` | male | `childhood_male` | PASS |
| `active_recruit_notice_carver` | female | `childhood_female` | PASS |
| `active_recruit_wake_keeper` | male | `childhood_male` | PASS |
| `active_recruit_lot_runner` | female | `childhood_female` | PASS |

Player-facing Event prose uses the current `{{npc_<technicalId>}}` convention. No seeded personal fallback name is hardcoded. The four new `npc.<id>.name` strings are generic fallback descriptors only.

## Seeded Stats / fixed-Stats audit

`PROPOSED_DEFINITIONS.json` contains no `initialStats`, no fixed numeric profile, no `canonicalPowerProfile`, and no pre-recruit numeric Stat assumptions. The current seeded NPC materialization remains authoritative.

## CrewRole audit

- `crewRoleId` on proposed NPCs: **0**.
- `hasCrewRole`: **0**.
- `actor.type = crewRole`: **0**.
- `gunner`, `fighter`, `quartermaster`: **0**.
- role recommendation prose: **0**.
- passive global Stat bonuses: **0**.

Narrative occupations are character texture only. Mechanical assignment remains Crew-management responsibility after recruitment.

## Starvation / dead-schedule audit

- Scheduled Events: **0**, therefore no dead Scheduled chain can be introduced.
- The 8 non-recruitment roots are optional ordinary Active content with broad reusable geography.
- The 4 recruitment roots are intentionally narrow and may stay ineligible forever on a run that did not build the relationship or lacks capacity. They are not mandatory system gates, so this does not block the monthly Active slot.

## Static validation executed

A local payload validator parsed all generated JSON and checked:

- filename ↔ Event ID consistency;
- Normal/Immediate counts;
- `careerPhaseIs(active)` on every root;
- root body target `20–45` words in FR/EN;
- Immediate body target `12–40` words in FR/EN;
- Choice target `2–10` words;
- Outcome target `5–25` words;
- localization coverage for every referenced Event/Choice/Outcome key;
- Immediate targets exist;
- no Scheduled Effect;
- current controlled Location tags/services only;
- root-level `canRecruitNpc` on all recruitment roots;
- no removed CrewRole IDs;
- sex/name-pool consistency;
- no fixed candidate Stats.

Result: **PASS — 0 issues**. Machine-readable output: `STATIC_VALIDATION.json`.

The integration script also passes:

```text
node --check apply-active-recruitment-new-cast-01.mjs
-> PASS
```

## Required repository commands

The three required repository commands were **not executable in this session** because GitHub is connected for repository reads, but the execution sandbox has no full writable checkout of `NathanTheophile/opfg` and no repository `node_modules` tree.

```text
npm run validate-content  -> NOT RUN — full checkout unavailable
npm test                  -> NOT RUN — full checkout unavailable
npm run build             -> NOT RUN — full checkout unavailable
```

This is the remaining acceptance gate. The supplied apply script can run them automatically with `--validate` once executed from the real checkout.
