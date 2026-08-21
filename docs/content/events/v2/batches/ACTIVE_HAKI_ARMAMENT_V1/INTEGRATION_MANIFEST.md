# ACTIVE_HAKI_ARMAMENT_V1 — Integration Manifest

- Haki type: `armament`
- Normal roots: 5
- Immediate Events: 40
- Total EventDefinitions: 45
- Thresholds: 75 / 80 / 85 / 90 / 95
- Structure per level: Root -> i01 -> ... -> i08 -> `raiseHakiTo`
- No Scheduled / Critical / System Haki Events
- No named Location dependency
- No source-stat (`strength`, `agility`, `observation`, `intelligence`) modification
- Returned generator payload audited before integration
- Unsafe negative Berrys and negative Reputation effects sanitized; see bundle `SANITIZATION_NOTES.md`

## Due root IDs

- `active_haki_armament_l1_the_unbreakable_thing`
- `active_haki_armament_l2_skin_against_steel`
- `active_haki_armament_l3_what_must_yield`
- `active_haki_armament_l4_harder_than_you`
- `active_haki_armament_l5_impossible_blow`
