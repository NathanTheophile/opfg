# ACTIVE_RIVAL_REVOLUTIONARY_01 — Manifest

Baseline inspected: `dev@4cb9cfbb8d96c04a7b2b8c87efba89432a8e3368`

## Scope

Wave 4 long-form `revolutionary` Rival thread only.

- 1 Normal seed root.
- 9 temporal layers.
- 11 total EventDefinitions because layers 3 and 5 each contain mutually exclusive branch variants.
- 10/11 EventDefinitions contain at least one DiceCheck; the Normal seed contains Dice.
- No Immediate Events.
- No changes to Career Saga authoring, Wave 3 Paradise/Recruitment, or Childhood.
- No new gameplay primitive, Rival state, quest state, organization stat, or second affiliation.

## Persistent NPC

**New NPC:** `active_rival_revolutionary_01_rival`

Reason for new definition:
- current persistent cast was audited on `dev`;
- `childhood_rival` is not guaranteed to have the Revolutionary career/history required by this thread;
- Wave 3 `active_recruit_*` NPCs are civilian recruitment candidates and reusing one would collapse recruitment identity into a career-owned ideological rival;
- no current persistent NPC is a strong cross-run Revolutionary-rival fit.

Definition:
- sex: female;
- `namePoolId: childhood_female` (current seeded/persisted display-name infrastructure);
- `affiliationId: revolutionary`;
- no `initialStats` override => seeded persistent Stats by current runtime convention;
- no intrinsic CrewRole.

Current catalog count observed: 14 persistent NPC definitions. Patch result: 15, below the ~25 target.

## Graph

| Layer | Event | Delay from prior | Structural role |
|---|---|---:|---|
| L1 | `active_rival_revolutionary_01_crossed_orders` | — | Normal seed; methods clash around civilian evacuation vs sabotage |
| L2 | `active_rival_revolutionary_01_same_table` | 12m | shared briefing; first structural split |
| L3A | `active_rival_revolutionary_01_shared_cipher` | 18m | cooperation / competitive-respect branch |
| L3B | `active_rival_revolutionary_01_broken_cipher` | 18m | distrust / hostility branch |
| L4 | `active_rival_revolutionary_01_two_objectives` | 18m | reconvergence; political judgment vs command |
| L5A | `active_rival_revolutionary_01_split_command` | 24m | autonomous cooperation / respectful competition |
| L5B | `active_rival_revolutionary_01_countermand` | 24m | command fracture / blame branch |
| L6 | `active_rival_revolutionary_01_burned_route` | 24m | reconvergence under lethal pressure |
| L7 | `active_rival_revolutionary_01_border_fire` | 24m | circumstantial alliance; friendship unlock at relationship >= 20 |
| L8 | `active_rival_revolutionary_01_last_operation` | 18m | final operational test; trust or instrumental betrayal |
| L9 | `active_rival_revolutionary_01_no_more_orders` | 18m | terminal relationship resolution |

Longest seed→terminal delay: **156 months / 13 years**.

Seed eligibility is `192..240 ageMonths`, so nominal completion is **348..396 ageMonths** (age 29–33). Scheduled blocking can delay a return, but `cancelIf ageAtLeastMonths(419)` prevents a dead schedule beyond the V1 horizon.

### Diagram

```text
L1 crossed_orders
  |
  | 12m
  v
L2 same_table
  |\
  | \ 18m
  |  +----------------------+
  v                         v
L3A shared_cipher       L3B broken_cipher
  \                         /
   \-------- 18m -----------/
              v
        L4 two_objectives
           |           \
       24m |            | 24m
           v            v
 L5A split_command   L5B countermand
           \            /
            \--- 24m ---/
                 v
          L6 burned_route
                 |
                24m
                 v
          L7 border_fire
                 |
                18m
                 v
        L8 last_operation
                 |
                18m
                 v
        L9 no_more_orders
              terminal
```

Every resolved non-terminal Outcome schedules **exactly one** next thread Event. No sibling future nodes are queued together.

## Relationship trajectory coverage

- **Hostility:** `refuse_her_timing`, `cut_her_out`, `use_her_as_bait`, `keep_score`, `feed_false_window`, terminal `close_the_channel`.
- **Competitive respect:** `race_for_the_source`, `claim_the_better_result`, `challenge_for_lead`, terminal `keep_competing`.
- **Circumstantial alliance:** `work_in_parallel`, `trade_signals_only`, shared emergency choices in `burned_route`.
- **Friendship:** accumulated relationship from mutual trust/rescue unlocks `give_private_signal` at >=20 and terminal `call_it_friendship` at >=20.

Later nodes materially read:
- NPC Relationship thresholds (`>=4`, `<=0`, `>=20`, `>=10`, `<=-10`);
- History (`hasPlayed split_command`) for an old-trust callback;
- branch History inherently through the mutually exclusive Scheduled Event actually played.

No Rival enum/counter/state is introduced.

## Dice nodes

Dice present in:
- L1 `crossed_orders`;
- L2 `same_table`;
- L3A `shared_cipher`;
- L3B `broken_cipher`;
- L4 `two_objectives`;
- L5A `split_command`;
- L5B `countermand`;
- L6 `burned_route`;
- L7 `border_fire`;
- L8 `last_operation`.

L9 is deterministic relationship resolution.

Difficulty usage is primarily Standard 11 and Difficult 14. Failure changes Health, Relationship, branch route, lost opportunity, or mission state in prose. Critical failure is always materially worse where Dice is used.

## Travel / scheduling audit

- Seed is geography-agnostic and only requires Active + Revolutionary + age window.
- Scheduled nodes contain no `locationIs`, tiny-location, port, island, or sea lock.
- Scheduled prose uses movable Revolutionary relays, briefings, couriers, streets, convoys, and rendezvous rather than asserting the player's current runtime Location.
- Every Scheduled node uses `scheduledReach: normal`.
- Every Scheduled node uses priority 100.
- Every Scheduled node cancels if:
  - age reaches 419 months; or
  - the player is no longer Revolutionary (defensive compatibility guard; V1 authoring itself does not change career post-opener).
- No infinite rescheduling.
- No fallback Event is needed because eligibility is broad and `cancelIf` handles the only durable incompatibilities.

## Crew audit

- No CrewRole Condition.
- No crew actor.
- No recruitment Effect.
- Rival is not intrinsically assigned a CrewRole.
- Rival recruitment is deliberately omitted; friendship is represented by persistent Relationship instead.

## Reputation / bounty audit

- All `modifyReputation` values are non-negative.
- No negative Reputation appears anywhere.
- No `setBounty` or `modifyBounty` Effect appears.
- No Marine content is touched.

## Canon audit

- No canon character, named canon organization leader, canon battle outcome, or canon Location outcome is changed.
- The Revolutionary Army is used only as broad institutional context.
- Operations live in narrative interstices: seizures, arrests, printers, couriers, strike evacuation, safehouses and Government convoys.
- Player never replaces a canonical protagonist in a major canon event.
- Original/generic recurring rival remains the only new persistent actor.

## Writing audit

- Situation → Reaction structure used throughout.
- Rival anchor is the **cracked red wax seal**, recurring across years.
- Stakes are concrete: arrests, seized rations, exposed relays, trapped civilians, compromised ciphers, burned safehouses.
- No generic filler phrases such as “the situation gets worse” or “the problem remains unresolved”.
- FR + EN localization included.

## Static bundle validation

Performed on generated worker bundle:
- 11 unique Event IDs;
- all IDs use prefix `active_rival_revolutionary_01_`;
- all referenced next Event IDs exist;
- every non-terminal reachable Outcome schedules exactly one next thread Event;
- terminal Event schedules none;
- no negative Reputation;
- no bounty Effects;
- no CrewRole references;
- no new flag/state mechanics;
- 161 FR keys + 161 EN keys, exact key parity.

## Repository validation status

Not executed in this environment:
- `git diff --check`
- `npm test`
- `npm run validate-content`
- `npm run build`

Reason: the execution sandbox has no network access and cannot clone the repository; GitHub connector inspection was read-only. Run the supplied applicator against the current repo, then execute the four required commands locally.
