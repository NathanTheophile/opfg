# ACTIVE_PARADISE_P6_STRANGE_01 — Manifest

## Scope

Route-owned Active content for Paradise `P6_STRANGE`, gated by History `active_paradise_route_start_p6_strange`.

- Normal roots: **45**
- Dice roots: **27 / 45 = 60.0%**
- Immediate roots: **9** opening **9** Immediate definitions
- Route-wide Scheduled structures: **1**, bounded L1 seed → L2 → L3 → L4
- New persistent definitions: **0**
- Recruitment roots: **0**
- Languages: **FR + EN**

## Per-stop coverage

| Stop | Roots | Dice roots |
|---|---:|---:|
| `ukkari_onsen_island` | 5 | 3 |
| `moonmelon_island` | 5 | 3 |
| `long_ring_long_land` | 5 | 3 |
| `one_man_resort` | 5 | 3 |
| `upside_down_atoll` | 5 | 3 |
| `karakuri_island` | 5 | 3 |
| `clockwork_cay` | 5 | 3 |
| `laughing_fog_island` | 5 | 3 |
| `sabaody_archipelago` | 5 | 3 |

Every P6-owned Normal root includes the route-start History gate, including shared stops `long_ring_long_land`, `karakuri_island`, and `sabaody_archipelago`.

## Route-wide Scheduled graph

```text
Ukkari Normal seed: ..._ukkari_oddity_passport
    └─ +4 months → ..._route_oddity_passport_l2
                     └─ +5 months → ..._route_oddity_passport_l3
                                      └─ +5 months → ..._route_oddity_passport_l4
                                                       └─ TERMINATES
```

Each lived node schedules only its immediate successor. Scheduled nodes are route-History-gated and may resolve at any Paradise land stop rather than being tied to one tiny Location; while at sea they remain ineligible until landfall or cancellation. L2/L3/L4 cancel after leaving Paradise or once the Sabaody convergence root has already been lived. Any layer may still resolve at Sabaody before that convergence root is consumed; L4 terminates without scheduling another node.

## CrewRole audit

Only current runtime roles are referenced: `cook`, `musician`, `navigator`, `helmsman`, `scholar`, `shipwright`, `foreman`, `first_mate`. They appear only as optional scene-expertise Choices. No `gunner`, `fighter`, or `quartermaster`; no annual role power is encoded as an Event Choice; no passive global Stat bonus is authored.

## Recruitment audit

No recruitment root and no `setNpcStatus -> crew` outcome in this batch. This deliberately avoids spending persistent cast budget for throwaway local characters.

## Seeded-NPC audit

No persistent seeded NPC is used. All local people are Event-local prose roles, so no seeded personal fallback name is hardcoded.

## Canon / timeline

The route stays in original/generic local life. Long Ring Long Land, Karakuri Island, and Sabaody are treated as places rather than vehicles for replacing canon outcomes. Sabaody is a convergence stop; no canon climax or major canon character encounter is authored.

## Starvation / dead-schedule audit

- 5 route-owned Normal roots exist at every main stop.
- All local roots require Active + route History + exact stop + land state; none requires a ship or Crew, so shipless survival does not starve local coverage.
- Optional CrewRole Choices never remove the unconditional fallback Choice.
- Scheduled arc is not location-pinned and therefore cannot wait months for a departed tiny Location.
- L2/L3/L4 cancel when the run has left Paradise or already resolved the Sabaody convergence root. L4 can still resolve at Sabaody before that convergence root is consumed, and always terminates.

## Runtime Event inventory

### Normal roots

**`ukkari_onsen_island`**

- `active_paradise_p6_strange_01_ukkari_mineral_mask_contest`
- `active_paradise_p6_strange_01_ukkari_oddity_passport`
- `active_paradise_p6_strange_01_ukkari_quiet_pool_etiquette`
- `active_paradise_p6_strange_01_ukkari_runaway_bath_barrel`
- `active_paradise_p6_strange_01_ukkari_steam_tax_mixup`

**`moonmelon_island`**

- `active_paradise_p6_strange_01_moonmelon_fermentation_kitchen`
- `active_paradise_p6_strange_01_moonmelon_midnight_harvest`
- `active_paradise_p6_strange_01_moonmelon_moonmelon_auction`
- `active_paradise_p6_strange_01_moonmelon_scarecrow_shift`
- `active_paradise_p6_strange_01_moonmelon_seed_spitting_derby`

**`long_ring_long_land`**

- `active_paradise_p6_strange_01_longring_long_step_race`
- `active_paradise_p6_strange_01_longring_nomad_rope_bridge`
- `active_paradise_p6_strange_01_longring_picnic_distance_problem`
- `active_paradise_p6_strange_01_longring_stretched_animal_roundup`
- `active_paradise_p6_strange_01_longring_windwheel_tent_exchange`

**`one_man_resort`**

- `active_paradise_p6_strange_01_oneman_lonely_karaoke_night`
- `active_paradise_p6_strange_01_oneman_private_beach_rules`
- `active_paradise_p6_strange_01_oneman_single_guest_overbooking`
- `active_paradise_p6_strange_01_oneman_souvenir_monopoly`
- `active_paradise_p6_strange_01_oneman_staff_of_one_crisis`

**`upside_down_atoll`**

- `active_paradise_p6_strange_01_upsidedown_backwards_welcome_sign`
- `active_paradise_p6_strange_01_upsidedown_hanging_market_crates`
- `active_paradise_p6_strange_01_upsidedown_inverted_tide_marker`
- `active_paradise_p6_strange_01_upsidedown_low_tide_ceiling_camp`
- `active_paradise_p6_strange_01_upsidedown_rope_boat_parking`

**`karakuri_island`**

- `active_paradise_p6_strange_01_karakuri_automatic_teapot_argument`
- `active_paradise_p6_strange_01_karakuri_dockyard_spare_part_swap`
- `active_paradise_p6_strange_01_karakuri_frozen_gear_delivery`
- `active_paradise_p6_strange_01_karakuri_prototype_snowplow`
- `active_paradise_p6_strange_01_karakuri_workshop_safety_demo`

**`clockwork_cay`**

- `active_paradise_p6_strange_01_clockwork_gear_market_bargain`
- `active_paradise_p6_strange_01_clockwork_midday_chime_rehearsal`
- `active_paradise_p6_strange_01_clockwork_missing_minute`
- `active_paradise_p6_strange_01_clockwork_moving_street_crossing`
- `active_paradise_p6_strange_01_clockwork_windup_ferry_queue`

**`laughing_fog_island`**

- `active_paradise_p6_strange_01_laughfog_borrowed_laughter`
- `active_paradise_p6_strange_01_laughfog_fog_bell_hide_and_seek`
- `active_paradise_p6_strange_01_laughfog_ghost_boat_rumor`
- `active_paradise_p6_strange_01_laughfog_mist_picnic_rescue`
- `active_paradise_p6_strange_01_laughfog_superstition_toll`

**`sabaody_archipelago`**

- `active_paradise_p6_strange_01_sabaody_bubble_photo_stand`
- `active_paradise_p6_strange_01_sabaody_coating_queue_dispute`
- `active_paradise_p6_strange_01_sabaody_convergence_noticeboard`
- `active_paradise_p6_strange_01_sabaody_grove_address_scam`
- `active_paradise_p6_strange_01_sabaody_runaway_bubble_luggage`

### Immediate definitions

- `active_paradise_p6_strange_01_clockwork_moving_street_crossing_i01`
- `active_paradise_p6_strange_01_karakuri_frozen_gear_delivery_i01`
- `active_paradise_p6_strange_01_laughfog_fog_bell_hide_and_seek_i01`
- `active_paradise_p6_strange_01_longring_nomad_rope_bridge_i01`
- `active_paradise_p6_strange_01_moonmelon_seed_spitting_derby_i01`
- `active_paradise_p6_strange_01_oneman_staff_of_one_crisis_i01`
- `active_paradise_p6_strange_01_sabaody_runaway_bubble_luggage_i01`
- `active_paradise_p6_strange_01_ukkari_runaway_bath_barrel_i01`
- `active_paradise_p6_strange_01_upsidedown_hanging_market_crates_i01`

### Scheduled definitions

- `active_paradise_p6_strange_01_route_oddity_passport_l2`
- `active_paradise_p6_strange_01_route_oddity_passport_l3`
- `active_paradise_p6_strange_01_route_oddity_passport_l4`

### Persistent definitions used / proposed

- New/proposed persistent definitions: **none**.
- Persistent NPC definitions used: **none**.
- Persistent Item/Ship/Flag definitions introduced: **none**.

### Validation commands

```bash
python docs/content/events/v2/batches/ACTIVE_PARADISE_P6_STRANGE_01/validate_batch.py
npm run validate-content
npm test
npm run build
```
