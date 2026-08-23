# ACTIVE_RECRUITMENT_NEW_CAST_01 — Manifest

## Scope

- Repository authority checked: `NathanTheophile/opfg`, branch `dev`.
- Observed HEAD during authoring: `63b93cead6bf7b845839c40371048005e3ca7a08`.
- Observed Content Schema: **16**.
- Worker target: small memorable **new Active recruitment cast** under the dynamic CrewRole runtime.
- Root count: **12 Normal roots**.
- Immediate count: **6 Immediate Events**.
- Scheduled count: **0**.
- Persistent NPC proposals: **4**.
- Push / commit / PR: **none**.

## Root inventory

| Root ID | EN title | Dice | Opens Immediate | Recruitment |
|---|---|---:|---:|---:|
| `active_recruitment_new_cast_01_after_last_lot` | After the Last Lot | no | no | yes |
| `active_recruitment_new_cast_01_auction_in_rain` | The Auction in the Rain | yes | no | no |
| `active_recruitment_new_cast_01_blank_board` | The Blank Board | no | no | yes |
| `active_recruitment_new_cast_01_brass_tag_unclaimed` | The Unclaimed Tag | no | no | yes |
| `active_recruitment_new_cast_01_chalk_number_47` | Number 47 | yes | yes | no |
| `active_recruitment_new_cast_01_face_under_paste` | The Face Under the Paste | yes | yes | no |
| `active_recruitment_new_cast_01_last_knot` | The Last Knot | no | no | yes |
| `active_recruitment_new_cast_01_mirror_stamp` | The Mirror Stamp | no | no | no |
| `active_recruitment_new_cast_01_name_without_body` | A Name Without a Body | yes | yes | no |
| `active_recruitment_new_cast_01_red_knot_crate` | The Red Knot | yes | yes | no |
| `active_recruitment_new_cast_01_three_debts_one_bell` | Three Debts, One Bell | yes | yes | no |
| `active_recruitment_new_cast_01_wrong_bell` | The Wrong Dead Man’s Bell | yes | yes | no |

## Batch metrics

- Dice roots: **7/12 = 58.3%** (target 55–65%).
- Immediate-opening roots: **6/12 = 50.0%**.
- Recruitment roots: **4**.
- Scheduled structures: **0**.
- CrewRole references: **0**.
- Removed CrewRole references (`gunner`, `fighter`, `quartermaster`): **0**.
- New fixed NPC Stat profiles: **0**.
- New authored NPC role recommendations: **0**.

## Proposed persistent definitions

Definitions are isolated in `PROPOSED_DEFINITIONS.json` for review before integration.

| npcId | Sex | namePoolId | Character anchor | Mechanical role |
|---|---|---|---|---|
| `active_recruit_knot_runner` | male | `childhood_male` | red knotted cord / quay favors and debts | none; assigned later by Crew management |
| `active_recruit_notice_carver` | female | `childhood_female` | carved notice boards / mirror-stamp | none; assigned later by Crew management |
| `active_recruit_wake_keeper` | male | `childhood_male` | brass name tags / wake bell | none; assigned later by Crew management |
| `active_recruit_lot_runner` | female | `childhood_female` | numbered chalk lots | none; assigned later by Crew management |

All four definitions omit `crewRoleId` and authored fixed Stats. The current seeded NPC materialization remains responsible for persistent numeric Stats.

## Touchpoint map

### `active_recruit_knot_runner`

- Encounter texture: quay messenger juggling favors, manifests and customs friction.
- Recurring anchor: red knotted cord / quay favors and debts.
- Root touchpoints: `active_recruitment_new_cast_01_red_knot_crate`, `active_recruitment_new_cast_01_three_debts_one_bell`, `active_recruitment_new_cast_01_last_knot`.
- Recruitment occurs only on the third touchpoint and only after prior History + Relationship qualify the candidate.
- If not recruited, the character remains narratively reusable in future followups through the same anchor; no CrewRole identity is baked into the character.

### `active_recruit_notice_carver`

- Encounter texture: itinerant notice carver protecting names and faces from public erasure.
- Recurring anchor: carved notice boards / mirror-stamp.
- Root touchpoints: `active_recruitment_new_cast_01_face_under_paste`, `active_recruitment_new_cast_01_mirror_stamp`, `active_recruitment_new_cast_01_blank_board`.
- Recruitment occurs only on the third touchpoint and only after prior History + Relationship qualify the candidate.
- If not recruited, the character remains narratively reusable in future followups through the same anchor; no CrewRole identity is baked into the character.

### `active_recruit_wake_keeper`

- Encounter texture: wandering keeper of sea-loss wakes who refuses premature declarations of death.
- Recurring anchor: brass name tags / wake bell.
- Root touchpoints: `active_recruitment_new_cast_01_name_without_body`, `active_recruitment_new_cast_01_wrong_bell`, `active_recruitment_new_cast_01_brass_tag_unclaimed`.
- Recruitment occurs only on the third touchpoint and only after prior History + Relationship qualify the candidate.
- If not recruited, the character remains narratively reusable in future followups through the same anchor; no CrewRole identity is baked into the character.

### `active_recruit_lot_runner`

- Encounter texture: itinerant market caller who turns disorder into public auctions and games.
- Recurring anchor: numbered chalk lots.
- Root touchpoints: `active_recruitment_new_cast_01_chalk_number_47`, `active_recruitment_new_cast_01_auction_in_rain`, `active_recruitment_new_cast_01_after_last_lot`.
- Recruitment occurs only on the third touchpoint and only after prior History + Relationship qualify the candidate.
- If not recruited, the character remains narratively reusable in future followups through the same anchor; no CrewRole identity is baked into the character.


## Recruitment roots

- `active_recruitment_new_cast_01_after_last_lot`
- `active_recruitment_new_cast_01_blank_board`
- `active_recruitment_new_cast_01_brass_tag_unclaimed`
- `active_recruitment_new_cast_01_last_knot`

Each recruitment root requires:

1. `careerPhaseIs(active)`;
2. valid land/geography context for that character;
3. the prior second touchpoint in History;
4. candidate Relationship `>= 5`;
5. candidate not `dead`, `departed`, `unavailable`, or already `crew`;
6. current runtime `canRecruitNpc(candidate)`.

The successful recruitment Outcome uses only `setNpcStatus -> crew` plus a Relationship change. Ship presence, CrewRole vacancy, mechanical specialty and fixed numeric Stats are not authored prerequisites.

## Recruiter-pool audit

The runtime classifies a Normal Event as a recruitment Event when a reachable Outcome contains `setNpcStatus` with `status: crew`.

Only the four third-touchpoint roots satisfy that classification. Because `canRecruitNpc(candidate)`, prior History, Relationship, status and geography are in the **root eligibility**, Recruiter cannot surface a candidate before their story is established or when current crew capacity/safety rejects recruitment.

No fake Recruiter-only clones or marker fields are introduced.

## Name-pool / interpolation audit

- Male proposals use `childhood_male`.
- Female proposals use `childhood_female`.
- Player-facing Event prose uses `{{{{npc_<technicalId>}}}}` placeholders for candidate names.
- No seeded candidate personal name is hardcoded in Event prose.
- `npc.<id>.name` locale entries are generic fallback labels only; seeded display names remain runtime materialized and persisted.

## Geography / recurrence

- Knot runner: land + `port`.
- Notice carver: land + `city | village`.
- Wake keeper: land + `coastal | port`.
- Lot runner: land + `trade` service.

The batch is deliberately not tied to one Blue, one career, or one ship state. This keeps the cast reusable while preserving concrete scene texture.

## FR / EN

All Event title/body/Choice/Outcome keys used by this batch are supplied in both language fragments:

- `localization.fr.json`
- `localization.en.json`

NPC fallback name keys for the four proposed definitions are also supplied in both fragments.

## Integration ownership

Runtime Event JSON is isolated under:

`src/game/content/events/v2/ordinary/ACTIVE_RECRUITMENT_NEW_CAST_01/`

Review/support files are isolated under:

`docs/content/events/v2/batches/ACTIVE_RECRUITMENT_NEW_CAST_01/`

The only shared-file integration required is:

1. append the four accepted NPC definitions to `src/game/content/catalogFactory.ts`;
2. merge the FR/EN locale fragments into current locale dictionaries.

`apply-active-recruitment-new-cast-01.mjs` performs those narrow integration edits and aborts on an unexpected HEAD/anchor or conflicting localization key.
