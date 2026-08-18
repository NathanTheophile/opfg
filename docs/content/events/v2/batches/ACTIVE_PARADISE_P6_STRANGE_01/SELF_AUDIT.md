# ACTIVE_PARADISE_P6_STRANGE_01 — Self Audit

## Editorial

- Situation → Reaction applied to every root.
- Five materially different local-life premises per stop.
- Strange/light route tone preserved; hazards are mixed with tourism, games, agriculture, hospitality, engineering, folklore, markets, and travel comedy.
- Root Dice ratio: 27/45 = 60.0%.
- Physical failed Dice attempts use Health loss; non-physical failures carry a concrete authored setback/missed opportunity with no compensating progression, while critical failure adds `-1` to the relevant Stat. Critical failure is always worse than ordinary failure.

## Shared-stop gate

`long_ring_long_land`, `karakuri_island`, and `sabaody_archipelago`: all 15 roots require `hasPlayed(active_paradise_route_start_p6_strange)`.

## Runtime vocabulary

- No engine/schema/save/UI/navigation changes.
- No route flag or persistent route ID.
- Route Scheduled nodes require `isOnLand`, so shop/local prose cannot resolve at sea.
- No new persistent definition.
- No recruitment mechanics.
- No role recommendation or intrinsic NPC role.

## Local static checks

```json
{
  "json_event_count": 57,
  "unique_ids": true,
  "normal_roots_exact_45": true,
  "coverage_5_each": true,
  "dice_exact_27": true,
  "dice_percent": 60.0,
  "immediate_roots_exact_9": true,
  "immediate_defs_exact_9": true,
  "scheduled_defs_exact_3": true,
  "route_arc_schedule_edges": [
    [
      "active_paradise_p6_strange_01_ukkari_oddity_passport",
      "active_paradise_p6_strange_01_route_oddity_passport_l2",
      4
    ],
    [
      "active_paradise_p6_strange_01_ukkari_oddity_passport",
      "active_paradise_p6_strange_01_route_oddity_passport_l2",
      4
    ],
    [
      "active_paradise_p6_strange_01_ukkari_oddity_passport",
      "active_paradise_p6_strange_01_route_oddity_passport_l2",
      4
    ],
    [
      "active_paradise_p6_strange_01_route_oddity_passport_l2",
      "active_paradise_p6_strange_01_route_oddity_passport_l3",
      5
    ],
    [
      "active_paradise_p6_strange_01_route_oddity_passport_l2",
      "active_paradise_p6_strange_01_route_oddity_passport_l3",
      5
    ],
    [
      "active_paradise_p6_strange_01_route_oddity_passport_l2",
      "active_paradise_p6_strange_01_route_oddity_passport_l3",
      5
    ],
    [
      "active_paradise_p6_strange_01_route_oddity_passport_l3",
      "active_paradise_p6_strange_01_route_oddity_passport_l4",
      5
    ],
    [
      "active_paradise_p6_strange_01_route_oddity_passport_l3",
      "active_paradise_p6_strange_01_route_oddity_passport_l4",
      5
    ],
    [
      "active_paradise_p6_strange_01_route_oddity_passport_l3",
      "active_paradise_p6_strange_01_route_oddity_passport_l4",
      5
    ]
  ],
  "all_references_resolve": true,
  "all_normal_route_gated": true,
  "shared_stop_route_gated": true,
  "all_choices_resolvable": true,
  "roles_valid": true,
  "legacy_roles_absent": true,
  "recruitment_roots": [],
  "localization_complete": true,
  "persistent_seeded_names_absent": true,
  "role_refs": [
    [
      "active_paradise_p6_strange_01_moonmelon_fermentation_kitchen",
      "cook"
    ],
    [
      "active_paradise_p6_strange_01_oneman_lonely_karaoke_night",
      "musician"
    ],
    [
      "active_paradise_p6_strange_01_upsidedown_rope_boat_parking",
      "navigator"
    ],
    [
      "active_paradise_p6_strange_01_upsidedown_rope_boat_parking",
      "helmsman"
    ],
    [
      "active_paradise_p6_strange_01_karakuri_automatic_teapot_argument",
      "scholar"
    ],
    [
      "active_paradise_p6_strange_01_karakuri_dockyard_spare_part_swap",
      "shipwright"
    ],
    [
      "active_paradise_p6_strange_01_clockwork_midday_chime_rehearsal",
      "musician"
    ],
    [
      "active_paradise_p6_strange_01_clockwork_midday_chime_rehearsal",
      "foreman"
    ],
    [
      "active_paradise_p6_strange_01_laughfog_mist_picnic_rescue",
      "navigator"
    ],
    [
      "active_paradise_p6_strange_01_sabaody_convergence_noticeboard",
      "first_mate"
    ]
  ]
}
```
