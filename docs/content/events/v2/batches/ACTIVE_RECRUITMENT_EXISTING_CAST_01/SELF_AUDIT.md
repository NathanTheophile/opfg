# SELF_AUDIT — ACTIVE_RECRUITMENT_EXISTING_CAST_01

## Contract compliance

- [x] 12 Normal roots, inside the requested 12–16 range.
- [x] 7/12 Dice roots = 58.3%, inside the 55–65% target.
- [x] 4 same-scene Immediate continuations; no quota padding.
- [x] 0 Scheduled / Lifetime nodes, permitted by this dedicated batch.
- [x] 0 new persistent NPC definitions.
- [x] 0 CrewRole references, fixed-role assumptions, role recommendations or vacancy gates.
- [x] Every recruitment success uses `setNpcStatus -> crew`.
- [x] Every recruitment root is guarded by `canRecruitNpc(candidate)` and explicit present/not-crew status.
- [x] No `hasShip` requirement.
- [x] Early Active 180–215 coverage for Civilian / Pirate / Revolutionary.
- [x] Existing-cast roots require concrete prior History.
- [x] Seeded visible names are interpolated; no fallback personal names are hardcoded.
- [x] No NPC numeric Stats are read, displayed or balanced around.
- [x] FR + EN parity.

## Recruiter-pool safety

All 12 roots contain a reachable root Outcome that sets their candidate to `crew`; they therefore match the current runtime classifier. Eligibility is intentionally narrow enough that Recruiter does not surface a scene before its character relationship exists. Rohan/Ari/Owen callbacks require their earlier East Blue encounter; friend/rival variants require their Childhood introduction and are mutually partitioned by career.

## Known integration boundary

The package contains namespaced localization fragments rather than editing the multi-megabyte shared `fr.json` / `en.json` in this non-writable worker environment. A sequential integrator must merge those fragments and then run the standard repository commands.
