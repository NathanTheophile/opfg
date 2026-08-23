# SELF_AUDIT — ACTIVE_RECRUITMENT_OPPORTUNITIES_01

## Contract compliance

- [x] Current `dev` read before authoring.
- [x] Existing Cast batch confirmed integrated.
- [x] New Cast batch and its four accepted NPC definitions confirmed integrated.
- [x] 12 Normal roots, inside target 10–14.
- [x] 12/12 roots contain a reachable `setNpcStatus(candidate, crew)` Outcome.
- [x] 7/12 Dice roots = 58.3%.
- [x] 0 new persistent NPC definitions.
- [x] 0 CrewRole references.
- [x] No fixed Role, vacancy gate, role recommendation, or pre-recruit exact Stat requirement.
- [x] Every root root-eligibility contains `canRecruitNpc(candidate)`.
- [x] Every root excludes candidate `dead`, `departed`, `unavailable`, and already `crew`.
- [x] New Cast callbacks require the integrated third touchpoint plus a 3-month delay.
- [x] Existing Cast callbacks require their precise prior route plus a 1-month delay.
- [x] Friend/rival callbacks require one of their career-specific Existing Cast recruitment roots plus a 1-month delay.
- [x] Ages 15–18 receive explicit Civilian / Pirate / Revolutionary coverage.
- [x] Four New Cast routes remain usable later in Active.
- [x] No Scheduled/Lifetime structures.
- [x] No Immediate padding.
- [x] Seeded NPC names only use interpolation tokens.
- [x] FR/EN parity verified.

## Recruiter-pool safety

Recruiter sees exactly the same eligibility as ordinary selection. A candidate can surface only after their authored prior history exists, in a compatible geography/career context, after the callback delay, while recruitable under current crew capacity/state.

## Duplication audit

No root repeats the original recruitment pitch:
- each New Cast route is a delayed consequence after their previous refusal/non-recruitment;
- Rohan/Ari/Owen callbacks are route-specific;
- friend/rival callbacks are explicit second-departure/score closure beats after one earlier career-specific opportunity.

## Known integration boundary

No shared source file other than locale dictionaries needs modification. The package's apply script appends only missing FR/EN localization keys and aborts on conflicting existing values. It does not commit, push, or open a PR.
