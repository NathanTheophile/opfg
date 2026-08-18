# ACTIVE_RIVAL_MARINE_01 — Manifest

Baseline inspected: `dev@4cb9cfbb8d96c04a7b2b8c87efba89432a8e3368`  
Content Schema: **16**

## Scope

Wave 4 long-form `marine` Rival thread only.

- 1 Normal seed root.
- 9 temporal layers.
- 11 total EventDefinitions because L3 and L5 each contain mutually exclusive branch variants.
- 10/11 EventDefinitions contain at least one DiceCheck.
- 10 Scheduled Events, 0 Immediate Events.
- No modification to `career_marine` authoring/runtime.
- No modification to Wave 3 Paradise/Recruitment or Childhood.
- No new Rival state, counter, quest state, flag, career system, promotion rule or second affiliation.

## Persistent NPC

**New NPC:** `active_rival_marine_01_peer_officer`

```ts
{
  id: 'active_rival_marine_01_peer_officer',
  nameKey: npcNameKey('active_rival_marine_01_peer_officer'),
  sex: 'female',
  namePoolId: 'childhood_female',
  raceId: null,
  originSeaId: null,
  affiliationId: 'marine'
}
```

Rationale:
- current `dev` catalog contains 14 persistent NPC definitions;
- `childhood_rival`, Rohan/Ari/Owen and all four Wave 3 `active_recruit_*` NPCs are civilian;
- Mira is transversal/neutral and is not repurposed;
- the casting addendum explicitly authorizes exactly one new persistent Marine peer officer.

No `initialStats`: runtime generates seeded per-run NPC Stats.  
No `crewRoleId`: CrewRole remains runtime `NpcState` only.

Patch result: 15 persistent NPC definitions before any parallel Wave 4 Rival additions.

## Graph

| Layer | Event | Delay | Structural role |
|---|---|---:|---|
| L1 | `active_rival_marine_01_two_signatures` | — | Normal seed; evidence procedure vs civilian protection |
| L2 | `active_rival_marine_01_after_action_board` | 12m | professional confrontation over the shared record |
| L3A | `active_rival_marine_01_shared_watch` | 18m | cooperation / competitive-respect branch |
| L3B | `active_rival_marine_01_formal_distance` | 18m | formal distance / hostility branch |
| L4 | `active_rival_marine_01_broken_convoy` | 18m | reconvergence through a shared convoy crisis |
| L5A | `active_rival_marine_01_shared_credit` | 24m | merit / recognition branch |
| L5B | `active_rival_marine_01_contested_responsibility` | 24m | blame / responsibility branch |
| L6 | `active_rival_marine_01_cut_off_together` | 24m | circumstantial alliance while cut off from support |
| L7 | `active_rival_marine_01_old_report_reopened` | 24m | old History + current Relationship become official evidence |
| L8 | `active_rival_marine_01_last_order` | 18m | decisive operation: letter of orders vs judgment |
| L9 | `active_rival_marine_01_same_uniform_different_line` | 18m | terminal relationship resolution |

Longest seed → terminal delay: **156 months / 13 years**.

Seed eligibility: `192..240 ageMonths`, so nominal completion is **348..396 ageMonths** (age 29–33).  
All Scheduled nodes cancel at `ageAtLeastMonths(419)` or if the player is no longer Marine.

```text
L1 two_signatures
  |
  | 12m
  v
L2 after_action_board
  |\
  | \ 18m
  |  +--------------------------+
  v                             v
L3A shared_watch          L3B formal_distance
  \                             /
   \---------- 18m ------------/
                v
         L4 broken_convoy
            |             \
        24m |              | 24m
            v              v
   L5A shared_credit   L5B contested_responsibility
            \              /
             \---- 24m ----/
                  v
        L6 cut_off_together
                  |
                 24m
                  v
        L7 old_report_reopened
                  |
                 18m
                  v
             L8 last_order
                  |
                 18m
                  v
      L9 same_uniform_different_line
               terminal
```

Every resolved non-terminal Outcome schedules **exactly one immediate successor** in the Rival graph. No sibling future nodes are queued together.

## Relationship trajectories

- **Durable hostility:** separate reports, territorial competition, taking full command, pinning blame, exact-order path; terminal `close_the_channel`.
- **Respectful rivalry:** clean competition, claiming a decision without erasing the Rival, contesting the record on facts; terminal `keep_competing`.
- **Circumstantial alliance:** `trade_signals_only`, joint planning, mutual retreat cover.
- **Professional partnership:** accumulated working trust unlocks `request_joint_assignments`.
- **Friendship:** high Relationship plus a successful L8 trust/coordination Outcome unlocks `call_it_friendship`.

Later nodes materially read existing state:
- L7 Dice modifiers read `hasChosen` in L5A/L5B and current NPC Relationship;
- L7 locked options read earlier History + current Relationship;
- L9 terminal options partition current Relationship and friendship additionally reads L8 `hasOutcome`;
- L3/L5 route identity persists structurally because only the selected branch Event exists in History.

No Rival enum/state/counter is introduced.

## Dice audit

Dice appears in L1 through L8 except the terminal L9. Used Stats:
- Agility;
- Charisma;
- Intelligence;
- Observation;
- Strength.

Thresholds: 12–15.

Failure/critical failure produces concrete mission cost through Health loss, worsened NPC Relationship, or the less-cooperative branch. Critical success may add +1 to the directly used Stat. No Dice failure reduces Active Reputation.

## Travel / Scheduled audit

- The seed is geography-agnostic.
- Scheduled nodes contain no `locationIs`, port, island, small-base or sea lock.
- Fiction is portable across assignments, escorts, investigations, convoys, reports and operational messages.
- Every Scheduled node uses `scheduledReach: normal` and priority `100`.
- Special Locations with `blocksScheduledEvents` intentionally delay the Rival return rather than forcing an implausible appearance.
- Every Scheduled node uses `cancelIf` for the 419-month horizon and non-Marine defensive guard.
- No fallback Event is needed.
- No loop or self-reschedule exists.

## Crew audit

- No CrewRole Condition or Effect.
- No recruitment Effect.
- No crew actor.
- The Rival is never intrinsically assigned a CrewRole.

## Career / Reputation / bounty audit

- No `setCareerAffiliation`.
- No `setCareerRank`, promotion hook or title mutation.
- No Career Saga hook.
- All `modifyReputation` values are non-negative.
- No `setBounty` or `modifyBounty`.
- The Rival may be described only as a peer/officer; the player is never silently promoted.

## Canon audit

- Original/generic Rival only; no canon character required.
- No canon battle, named canon outcome or Location state is changed.
- Scenes stay in narrative interstices of Marine work: seizures, escorts, commissions, convoys, investigations and evacuations.

## Writing audit

- Situation → Reaction structure throughout.
- Recurring identity motif: **two signatures / competing reports / the written order**.
- Core tension stays Marine-specific: duty vs judgment, procedure vs protection, credit/blame, interpretation of orders and professional recognition.
- FR source uses direct `tu`.
- FR + EN fallback localization included.
- Runtime NPC display name remains seeded/persisted through `childhood_female`.

## Static bundle validation

Performed on the generated worker bundle:
- 11 unique Event IDs;
- all Event IDs use prefix `active_rival_marine_01_`;
- 1 Normal + 10 Scheduled;
- every referenced successor exists;
- every non-terminal Outcome schedules exactly one successor;
- terminal Event schedules none;
- all Scheduled nodes have priority 100, `scheduledReach: normal`, and `cancelIf`;
- no negative Reputation;
- no bounty / career-affiliation / rank / title Effects;
- no CrewRole references;
- no new Flag/state mechanics;
- FR/EN localization key parity.

## Repository validation status

Not executed in this environment:
- `git diff --check`
- `npm test`
- `npm run validate-content`
- `npm run build`

Reason: the repository is available through the GitHub connector for inspection, but no writable full checkout is mounted in the execution sandbox.

Apply the supplied worker bundle in a local OPFG checkout, then run the four required commands.
