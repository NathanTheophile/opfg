# MANIFEST — ACTIVE_RECRUITMENT_EXISTING_CAST_01

## Baseline

- Repository: `NathanTheophile/opfg`
- Branch read: `dev`
- Exact HEAD read before authoring: `63b93cead6bf7b845839c40371048005e3ca7a08`
- Content Schema read: `16`
- Save version observed: `23`
- Prerequisites audited: Crew management / First Mate gate present; Crew authority sync present; Active Crew content migration semantics present.
- Engine/schema/save/UI/navigation changes: none.

## Production totals

- Normal roots: **12**
- Immediate EventDefinitions: **4**
- Scheduled EventDefinitions: **0**
- Dice roots: **7 / 12 = 58.3%**
- Recruitment roots: **12 / 12**
- New persistent definitions: **0**
- CrewRole references: **0**

## Root inventory

- `active_recruitment_existing_cast_01_friend_civilian_last_ferry` — `childhood_friend`
- `active_recruitment_existing_cast_01_friend_pirate_split_flag` — `childhood_friend`
- `active_recruitment_existing_cast_01_friend_revolutionary_safehouse` — `childhood_friend`
- `active_recruitment_existing_cast_01_rival_civilian_shared_contract` — `childhood_rival`
- `active_recruitment_existing_cast_01_rival_pirate_boarding_score` — `childhood_rival`
- `active_recruitment_existing_cast_01_rival_revolutionary_false_manifest` — `childhood_rival`
- `active_recruitment_existing_cast_01_rohan_second_service` — `rohan`
- `active_recruitment_existing_cast_01_rohan_revolutionary_relief_kitchen` — `rohan`
- `active_recruitment_existing_cast_01_ari_quarantine_last_shift` — `ari`
- `active_recruitment_existing_cast_01_ari_false_name_patient` — `ari`
- `active_recruitment_existing_cast_01_owen_drydock_blame` — `owen`
- `active_recruitment_existing_cast_01_owen_revolutionary_hidden_keel` — `owen`

## Candidate / prior-anchor audit

| Candidate | Root territory | Required prior anchor | Why it is earned |
|---|---|---|---|
| `childhood_friend` | Civilian / Pirate / Revolutionary early Active | `ch_v2_peers_01_friend_rule_intro` | Calls back to the private childhood rule and existing relationship. |
| `childhood_rival` | Civilian / Pirate / Revolutionary early Active | `ch_v2_peers_01_rival_assistant_intro` | Calls back to childhood scorekeeping/competition and existing relationship. |
| `rohan` | East Blue follow-up | `active_blue_east_blue_01_baratie_short_cook` | Second encounter only after the player actually met him at Baratie and did not recruit him. |
| `ari` | East Blue follow-up | `active_blue_east_blue_01_clinic_triage` | Second encounter only after the player shared the clinic crisis and did not recruit her. |
| `owen` | East Blue follow-up | `active_blue_east_blue_01_crew_notice_board` | Second encounter only after the player saw the notice-board opportunity and did not recruit him. |

## Early Active coverage

All 12 roots use `180 <= ageMonths <= 215`. Friend/rival roots are split explicitly across `civilian`, `pirate`, and `revolutionary`; Marine is exempt by contract but remains supported by selected Rohan/Ari/Owen follow-ups. Friend/rival geography is the player's current origin Blue, so no personal ship is required. East Blue callbacks remain land/service grounded because their prior anchors are East Blue scenes.

## Dice roots

- `active_recruitment_existing_cast_01_friend_civilian_last_ferry`
- `active_recruitment_existing_cast_01_friend_pirate_split_flag`
- `active_recruitment_existing_cast_01_rival_civilian_shared_contract`
- `active_recruitment_existing_cast_01_rival_pirate_boarding_score`
- `active_recruitment_existing_cast_01_rival_revolutionary_false_manifest`
- `active_recruitment_existing_cast_01_rohan_second_service`
- `active_recruitment_existing_cast_01_owen_drydock_blame`

## Immediate roots

- `active_recruitment_existing_cast_01_friend_pirate_split_flag` → `active_recruitment_existing_cast_01_friend_pirate_split_flag_i01_watch_boat`
- `active_recruitment_existing_cast_01_rival_revolutionary_false_manifest` → `active_recruitment_existing_cast_01_rival_revolutionary_false_manifest_i01_last_stamp`
- `active_recruitment_existing_cast_01_rohan_second_service` → `active_recruitment_existing_cast_01_rohan_second_service_i01_kitchen_door`
- `active_recruitment_existing_cast_01_owen_revolutionary_hidden_keel` → `active_recruitment_existing_cast_01_owen_revolutionary_hidden_keel_i01_patrol_hammer`

No Scheduled/Lifetime structure is added.

## Recruitment outcome audit

Every Normal root contains at least one reachable authored Outcome with `setNpcStatus(candidate, crew)`, so runtime `isCrewRecruitmentEvent` classifies all 12 for the Recruiter pool. Every root eligibility includes `canRecruitNpc(candidate)` plus explicit exclusion of `dead`, `departed`, `unavailable`, and already-`crew` states. There is no target-role vacancy gate and no role assignment/recommendation.

Rohan/Ari/Owen roots cannot compete with their original first-contact recruitment event before that event has been played, because each new root requires `hasPlayed` on that specific prior root and `canRecruitNpc`. Friend/rival roots are career-partitioned, so only one root per candidate can be eligible for the current career.

## Seeded-name interpolation audit

- All five candidates are existing persistent technical NPC IDs.
- Player-facing FR/EN copy references seeded identities only through current `{{npc_<technicalId>}}` interpolation tokens.
- No fallback personal name is hardcoded.
- No NPC numeric Stat is shown or assumed.

## Geography / starvation / dead-schedule audit

- Friend/rival: on-land, same current Blue as origin, across all four Blues.
- Rohan: East Blue + `food` service.
- Ari: East Blue + `medical` service.
- Owen: East Blue + `ship_repair` service.
- No root requires `hasShip`; shipless Crew capacity is delegated entirely to `canRecruitNpc`.
- These are deliberately restrictive character callbacks and are not intended as starvation coverage for the global Active pool.
- No Scheduled nodes exist, so there is no dead-schedule risk.

## Persistent definitions used

NPCs only: `childhood_friend`, `childhood_rival`, `rohan`, `ari`, `owen`.

## PROPOSED_DEFINITIONS

_None._

## FR / EN

- Namespaced localization fragment parity: verified locally.
- Root/Immediate copy uses Situation → Reaction and seeded NPC interpolation.

## Repository-level command status

This worker environment has no writable repository checkout. GitHub writes would necessarily create commits, forbidden by the batch contract. Therefore the three repository commands were **not fabricated as run**:

```bash
npm run validate-content   # NOT RUN — no local checkout
npm test                   # NOT RUN — no local checkout
npm run build              # NOT RUN — no local checkout
```

Local deterministic batch validation is recorded in `VALIDATION.json`. Shared locale integration must occur before repository-level validation.

## Exact file inventory

- `src/game/content/events/v2/ordinary/ACTIVE_RECRUITMENT_EXISTING_CAST_01/` — 16 EventDefinition JSON files
- `docs/content/events/v2/batches/ACTIVE_RECRUITMENT_EXISTING_CAST_01/MANIFEST.md`
- `docs/content/events/v2/batches/ACTIVE_RECRUITMENT_EXISTING_CAST_01/SELF_AUDIT.md`
- `docs/content/events/v2/batches/ACTIVE_RECRUITMENT_EXISTING_CAST_01/VALIDATION.json`
- `docs/content/events/v2/batches/ACTIVE_RECRUITMENT_EXISTING_CAST_01/localization.fr.json`
- `docs/content/events/v2/batches/ACTIVE_RECRUITMENT_EXISTING_CAST_01/localization.en.json`
