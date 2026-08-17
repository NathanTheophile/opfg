# REPORT — ACTIVE_GENERIC_LAND_05_STRANGE

## Result

The isolated `GENERIC LAND — STRANGE` batch is authored against `dev` at `dc3819121ae8e74aaa898afefedbc7cdb5666df8`, Content Schema 15.

Delivered:

- 20 Normal roots;
- 18 Immediate continuations;
- 15/20 mini-arc roots (75%);
- 12/20 Dice roots (60%);
- 0 Scheduled EventDefinitions;
- 0 `scheduleEvent` Effects;
- 0 Lifetime Threads;
- FR/EN namespaced localization fragments;
- manifest + deterministic structural audit.

## Editorial / mechanical profile

The 20 roots cover separate strange-land identities rather than noun-swapped variants:

- oversized ceremonial props;
- eccentric municipal machinery;
- moving architecture;
- absurd civic rules;
- backward competitions;
- unstable food spectacles;
- mechanical infrastructure behaving like choreography;
- animal-led judging and transport;
- pressure-driven performance devices;
- local decorative customs becoming concrete hazards.

Risky Dice failures always carry a real downside. Critical failures are mechanically worse than ordinary failures. Reputation never decreases; no Marine-specific bounty path exists because the batch never authors bounty at all.

Effects spread across Health, Berrys, positive Reputation, one recurring-NPC relationship, existing Item loss, one-shot missed opportunities/History, and restrained Stat deltas. No new persistent definition exists solely to support a gag.

## Eligibility / starvation

14 roots are broadly eligible on any Active land state. Six have additional premise gates:

- 2 × `food` service;
- 2 × `urban` tag;
- 1 × `historic` tag;
- 1 × existing `childhood_friend` status (`known` or `crew`).

This leaves a broad unconditional land core while allowing a few materially contextual scenes. No root requires a specific Location ID, Sea, career, Race, ship or persistent world route.

Starvation risk from this batch alone is low for early on-land Active months because 14 roots share only `active + land`, but this is a one-shot ordinary batch and is expected to coexist with the rest of Active content. It is not intended to sustain a whole career by itself.

## Collision review

Current `dev` contains the Wave 1 Generic Sea batches and Career Sagas but no `ACTIVE_GENERIC_LAND_05_STRANGE` directory. The closest superficial overlaps were rejected at framing level:

- no floating-door / invisible-customs / horizon-tax reuse from Sea Strange;
- no storm, reef, navigation hazard or sea-monster transplant;
- food scenes are malfunctioning spectacles rather than commerce;
- dangerous scenes are not generic fights;
- `fake_door_day` stays an immediate evacuation friction rather than an investigation.

Parallel Wave 2 Land Social/Commerce/Mystery/Conflict batches are not yet visible on this `dev` baseline, so final sequential integration should still run concept-level collision review after all workers land.

## Structural validation performed

Deterministic local validation over all 38 JSON EventDefinitions and both locale fragments checked:

- unique Event / Choice / Outcome IDs;
- every Immediate target exists and is an Immediate Event;
- no Immediate cycle;
- exact Normal / Immediate / Scheduled counts;
- 15/20 mini-arc roots and depth distribution 5×0 / 12×1 / 3×2;
- 12/20 Dice roots, exactly 2 root Dice approaches each;
- all Normal roots include `careerPhaseIs(active)` + `isOnLand`;
- every Event has at least one unconditional Choice;
- no `scheduleEvent`, `moveToLocation`, bounty, career/rank/title mutation or negative Reputation;
- every Dice `failure` and `criticalFailure` includes a real negative consequence;
- every referenced FR/EN key exists and no extra batch-local key exists;
- Root / Immediate / Choice / Outcome copy respects the production word budgets in both FR and EN.

See `AUDIT.json` for the machine-readable result.

## Repository-level validation not run

The execution environment does not contain a Git checkout of `NathanTheophile/opfg`, and outbound CLI Git access cannot resolve GitHub. Using GitHub's contents API would create commits, which is explicitly forbidden by this task.

Therefore these commands could not be run without violating scope:

```bash
npm run validate-content
npm test
npm run build
```

They remain required after copying this isolated patch into a real checkout.

## Shared integration still required

1. Copy the isolated runtime directory into the repository checkout.
2. Merge the two namespaced localization fragments into the shared runtime locale dictionaries using the project's sequential integration workflow.
3. Run `npm run validate-content`, `npm test`, and `npm run build` on the integrated tree.
4. Run cross-worker concept collision review against the four other Wave 2 Generic Land batches before final acceptance.

No commit, push or PR was created.
