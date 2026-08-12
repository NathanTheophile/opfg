# D2 Wave 3 — Changelog

## Runtime reset follow-up

The D2.1 physical reset is now followed by a platform refactor so the new V2 Event catalog can be authored against stable systems instead of rebuilding on legacy assumptions.

## Origins

- `playableV1` added to Race/Affiliation definitions.
- Race V1: Human, Fish-Man, Mink, Giant.
- Family affiliation V1: Civilian, Marine, Pirate, Revolutionary, Royal Family.
- Longarm/Buccaneer and Bandit/Prisoner/Slave/Celestial Dragon stay visible but unavailable.
- runtime Effects reject locked Origin values as an invariant.

## Major Narrative Tracks

- Content Schema 11.
- generic `family_legacy` / `personal_affiliation` track infrastructure.
- chapter progression derived from History.
- horizontal current-state variant selection.
- ordinary Normal pool excludes Major variants.
- overdue Major > Scheduled > newly-due Major > ordinary Normal.
- old D1.9 opening selection removed.
- old mandatory Lifetime Thread selection removed.

## Save

- Save 20.
- V19 is intentionally not migrated after the physical content reset.

## Items / economy

- real Item categories, stack limits and market metadata.
- Location-service-aware generic buying/selling.
- atomic buy/sell Effects.
- quantity/capacity/economy Conditions.
- 50% default generic resale rate.
- `timber` baseline = 500 Berrys.
- story documents and Devil Fruits remain non-market.

## New authority

- `docs/design/ECONOMY_AND_ITEMS.md`.
