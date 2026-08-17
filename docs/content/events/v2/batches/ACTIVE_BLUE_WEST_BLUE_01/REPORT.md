# REPORT — ACTIVE_BLUE_WEST_BLUE_01_FIX_01

## Result
Complete isolated batch authored from `dev` HEAD `dc3819121ae8e74aaa898afefedbc7cdb5666df8` with Content Schema `15`.

## World V1 discrepancy
The earlier interrupted worker observed a mismatch where West Blue header/metadata advertised five V3 additions not present in the inspected runtime array.
On the fresh current `dev` used by this fix, those five IDs are now present in the actual `blueLocations` runtime array:
`sankan_kingdom`, `shishano_kingdom`, `enoa_academy`, `czach_kingdom`, `jambalaya_kingdom`.

Therefore the old mismatch is **historical upstream debt, resolved on this HEAD**. No World V1 file was modified by this batch.

## Coverage
- 30 Normal roots
- 15 Immediate roots (50%)
- 18 Dice roots (60%)
- exactly 5 short Scheduled threads, all <= 15 months
- exactly 1 regional Lifetime, 7 Scheduled definitions, 114-month longest normal path
- 22 land / 8 sea
- 21 Blue-wide / 9 exact-location
- no negative Reputation
- no bounty effect
- no career-affiliation/phase change
- no movement/navigation Effect
- no persistent NPC ID invented

## Starvation risk
21 roots are not exact-location locked. Service/tag gates are used only where the premise materially needs them. The regional pool therefore remains broad even if the player visits only a subset of West Blue Locations.

## Restrictive eligibility
Exact roots: Happo Port, Aurora City, Masala Port, Bellflower Village, 80th Branch, Mt. Mauri, Blackfin Cove, Enoa Academy, Sankan River Town.
Ship purchase additionally depends on current `canAcquireShip` and Berrys.
Short-thread seed age caps preserve the 420-month V1 horizon.
Lifetime seed cap: 306 months, leaving 114 months for the normal full path.

## Validation limits
This environment has no writable full checkout and GitHub file writes would create commits, forbidden by the task. Structural validation is executed on the complete generated bundle. Repository-level TypeScript/content/test/build validation must run after local application.
