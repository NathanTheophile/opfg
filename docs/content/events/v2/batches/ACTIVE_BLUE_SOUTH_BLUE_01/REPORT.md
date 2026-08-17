# ACTIVE_BLUE_SOUTH_BLUE_01 — REPORT

## Result

Batch authored against `dev@dc3819121ae8e74aaa898afefedbc7cdb5666df8`, Content Schema 15.

- 30 Normal roots
- 15 Immediate mini-arc roots (**50%**)
- 18 Dice roots (**60%**)
- 5 bounded short Scheduled threads
- 1 regional multi-year Lifetime
- 18 land roots / 12 sea roots
- 10 exact-location roots / 20 Blue-wide-or-situational roots
- 0 new persistent definitions

## Regional identity

The pool does not define one South Blue monoculture. It distributes play across:

- merchant/medical ports and civil shipping;
- Southport shipyard/full ship market;
- Torino forest medicine;
- Karate Island martial practice;
- Samba entertainment and parade logistics;
- Taya agriculture and irrigation;
- royal/tax/customs friction;
- a Marine base;
- Redfin criminal trade;
- snow/ice survival and cold commerce;
- coastal navigation and small-island markers.

## Ship / recruitment opportunities

- `..._southport_secondhand_sloop`: existing `buyShip(sloop)` path, gated by `canAcquireShip` + 25,000 Berrys.
- `..._port_dinghy_lot`: existing `buyShip(dinghy)` path, gated by `canAcquireShip` + 5,000 Berrys.
- `..._mira_empty_berth`: reuses existing persistent `mira`; appears only if she is already `known`; recruitment uses `canRecruitNpc` and `setNpcStatus(..., crew)`.

## Restrictive eligibility / starvation

- `active_blue_south_blue_01_lantern_relay_seed`: age <= 300 months; at sea with ship
- `active_blue_south_blue_01_seventy_fourth_sealed_crate`: exact Marine base; career-special choice only
- `active_blue_south_blue_01_southport_secondhand_sloop`: ship purchase gated by leadership/capacity/25k Berrys
- `active_blue_south_blue_01_port_dinghy_lot`: ship purchase gated by market/capacity/5k Berrys
- `active_blue_south_blue_01_mira_empty_berth`: Mira must already be known; recruitment requires canRecruitNpc

These roots are additive special opportunities. They do not protect any monthly slot and therefore cannot starve South Blue: the batch still contains broad land/sea roots gated only by Active + South Blue + current travel context.

## Scheduled safety

All 5 short callbacks are portable by fiction (courier, letter, collector, report) and require only Active on return. They do not wait on a tiny Location or even require the player to remain in South Blue.

The Lifetime is intentionally regional. Each pending regional chapter uses `cancelIf: not currentSeaIs(south_blue)` with an explicit unrestricted terminal fallback, preventing a dead Scheduled node if the player leaves the Blue.

## Mechanical spread

Consequences cover Health, Ship Health, Berrys, Reputation, Stats, NPC relationship/crew status, ship acquisition, Item use (`timber`), and branch/History opportunity. Reputation is never decreased and no bounty Effect is authored.

## Validation performed

Deterministic structural checks in the isolated bundle:

- exact root / Immediate / Dice / thread counts;
- unique Event IDs;
- all queued Immediate and Scheduled targets resolve and match target kind;
- FR/EN key parity and complete localization-key coverage;
- all Scheduled fallbacks resolve;
- monotonic Reputation effects;
- no Bounty effects;
- negative Berry choices are availability-gated;
- 30-root land/sea and exact-location splits match the manifest.

Repository-level `npm run validate-content`, `npm test`, and `npm run build` were **not runnable here** because no writable repository checkout is exposed and raw network cloning is disabled. They remain required after sequential integration of the event files + localization fragments.
