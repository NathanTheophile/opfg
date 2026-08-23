# ACTIVE_HAKI_OBSERVATION_V1 — Integration Manifest

- Haki type: `observation`
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

- `active_haki_observation_l1_one_second_early`
- `active_haki_observation_l2_what_gestures_hide`
- `active_haki_observation_l3_world_without_eyes`
- `active_haki_observation_l4_silence_that_lies`
- `active_haki_observation_l5_before_world_moves`
