# MANIFEST — CH_V2_BIRTHPLACE_WEST_BLUE_01
## Repository baseline
- Repository: `NathanTheophile/opfg`
- Branch: `dev`
- Exact HEAD verified: `5e01e1791e9087437a21da0da2697f0f5cf52728`
- Content Schema: **14**
- Save version: **21**
- Package authored outside the repository; no repository file modified.
## Exact 8 Birth Locations discovered
| Location ID | Name | type | parent | shipMarket | tags | services | current authoringNotes |
|---|---|---|---|---|---|---|---|
| `kano_happo_port` | Happo Port | `port` | `kano_country` | `small_craft` | coastal, port, trade | food, lodging, general_goods, weapons, medical, trade, ship_repair, crew_recruitment | Port OPFG du Pays de Kano, pensé comme hub commercial et martial de West Blue. |
| `ilisia_aurora_city` | Aurora City | `city` | `ilisia_kingdom` | `full` | capital, city, coastal, port, trade, shipyard, urban | food, lodging, general_goods, weapons, medical, trade, ship_repair, crew_recruitment | Grande ville portuaire OPFG ; marché naval complet de West Blue. |
| `bollywood_masala_port` | Masala Port | `port` | `bollywood_kingdom` | `small_craft` | coastal, port, trade, entertainment | food, lodging, general_goods, trade, ship_repair, crew_recruitment | Port OPFG vivant et culturel, conçu pour commerce, spectacles et équipages de passage. |
| `esperia_lago_town` | Lago Town | `city` | `esperia_kingdom` | `small_craft` | city, coastal, trade, urban | food, lodging, general_goods, medical, trade, ship_repair, crew_recruitment | Ville OPFG civile et relativement neutre, adaptée aux Events génériques. |
| `sankan_river_town` | Sankan River Town | `city` | `sankan_kingdom` | `small_craft` | city, trade, urban | food, lodging, general_goods, medical, trade, ship_repair, crew_recruitment | Ville fluviale OPFG servant de hub neutre et commercial. |
| `shishano_port` | Shishano Port | `port` | `shishano_kingdom` | `small_craft` | coastal, port, trade | food, lodging, general_goods, weapons, trade, ship_repair, crew_recruitment | Port OPFG plus rude, adapté aux cargaisons, mercenaires et voyages. |
| `twinsnakes_island` | Twinsnakes Island | `island` | `—` | `small_craft` | coastal, isolated | food, lodging, general_goods, trade, ship_repair, crew_recruitment | Petite île retained comme Birth Location complète ; source uncertain. |
| `bellflower_village` | Bellflower Village | `village` | `—` | `small_craft` | village, coastal, rural, agricultural | food, lodging, general_goods, medical, trade, crew_recruitment | Village côtier OPFG modeste pour compléter les Origins ruraux de West Blue. |

All eight were read from current `src/game/content/data/locationsV1.json` with `seaId: west_blue` and `canBeBirthLocation: true`.
## Root registry
| Location | Early root | Late root | age windows | Dice? | Immediate depth | local metadata exploited |
|---|---|---|---|---|---:|---|
| `kano_happo_port` | `ch_v2_birthplace_west_blue_01_happo_staff_under_gangway` | `ch_v2_birthplace_west_blue_01_happo_shared_training_lane` | E 48–95; L 120–167 | E: yes; L: yes | 2 / 0 | E: port + trade + weapons + authoringNotes martial/commercial; L: martial authoringNotes + port/trade/weapons competition for quay space |
| `ilisia_aurora_city` | `ch_v2_birthplace_west_blue_01_aurora_launch_cradle` | `ch_v2_birthplace_west_blue_01_aurora_repair_seam_dispute` | E 36–83; L 132–179 | E: no; L: yes | 1 / 2 | E: shipyard + full maritime city infrastructure; L: shipyard + full ship market + trade/repair dispute |
| `bollywood_masala_port` | `ch_v2_birthplace_west_blue_01_masala_crowd_on_gangway` | `ch_v2_birthplace_west_blue_01_masala_double_booking` | E 60–95; L 108–155 | E: yes; L: no | 3 / 0 | E: entertainment + port + transient crews/public boarding space; L: entertainment port + visiting troupes + delayed maritime departure |
| `esperia_lago_town` | `ch_v2_birthplace_west_blue_01_lago_clinic_linen_on_seawall` | `ch_v2_birthplace_west_blue_01_lago_civic_landing_bottleneck` | E 36–83; L 120–179 | E: no; L: yes | 0 / 1 | E: civil coastal urban frontage + medical service; no port operations; L: coastal civilian city + allowsDocking without port tag + medical urban passage |
| `sankan_river_town` | `ch_v2_birthplace_west_blue_01_sankan_boat_against_steps` | `ch_v2_birthplace_west_blue_01_sankan_narrow_bend` | E 60–95; L 108–167 | E: yes; L: yes | 2 / 0 | E: explicit river town + docking/current mechanics + urban trade hub; L: river navigation + narrow fluvial passage, not seaport cargo |
| `shishano_port` | `ch_v2_birthplace_west_blue_01_shishano_mercenary_table` | `ch_v2_birthplace_west_blue_01_shishano_escort_board` | E 72–107; L 132–179 | E: yes; L: no | 0 / 2 | E: rough port + lodging + weapons + authoringNotes mercenaries/travel; L: rough port + crew recruitment/travel + mercenary authoringNote |
| `twinsnakes_island` | `ch_v2_birthplace_west_blue_01_twinsnakes_last_boat_coat` | `ch_v2_birthplace_west_blue_01_twinsnakes_empty_skiff` | E 60–95; L 120–179 | E: no; L: yes | 1 / 0 | E: isolated island + lodging + current single departure stakes; L: isolated coastal island + small-craft docking; unknown skiff has outsized local salience |
| `bellflower_village` | `ch_v2_birthplace_west_blue_01_bellflower_seedling_shortcut` | `ch_v2_birthplace_west_blue_01_bellflower_boundary_stakes` | E 48–95; L 108–167 | E: yes; L: no | 0 / 2 | E: rural + agricultural + coastal field/road interaction; L: agricultural/rural parcel boundaries + harvest-cart disturbance |

Counts: **16 Normal roots**, **8 Early + 8 Late**, **2 roots per exact Birth Location**. Every root uses `careerPhaseIs(childhood)` + `ageAtLeastMonths` + `ageAtMostMonths` + exact `locationIs(...)`.
## Birthplace indispensability audit
- `ch_v2_birthplace_west_blue_01_happo_staff_under_gangway` — The scene needs Happo’s martial/commercial port identity: weapon-training props physically conflict with a boarding gangway.
- `ch_v2_birthplace_west_blue_01_happo_shared_training_lane` — The dispute exists because Happo combines martial testing with commercial quay traffic; removing either use changes the conflict.
- `ch_v2_birthplace_west_blue_01_aurora_launch_cradle` — A wheeled launch cradle blocking pedestrian access is shipyard infrastructure, not a generic city obstruction.
- `ch_v2_birthplace_west_blue_01_aurora_repair_seam_dispute` — The testimony matters because Aurora combines a shipyard, ship repair and West Blue’s full ship market.
- `ch_v2_birthplace_west_blue_01_masala_crowd_on_gangway` — Entertainment crowds and live boarding compete for the same quay; Masala’s entertainment-port combination creates the moving boundary problem.
- `ch_v2_birthplace_west_blue_01_masala_double_booking` — The second troupe only remains because its maritime departure is delayed, turning Masala’s entertainment + transient-crew context into the booking collision.
- `ch_v2_birthplace_west_blue_01_lago_clinic_linen_on_seawall` — The scene uses a civilian urban seafront plus a local medical service; it is not harbor work, rural laundry or a shipyard task.
- `ch_v2_birthplace_west_blue_01_lago_civic_landing_bottleneck` — Lago’s dockable coastal city frontage without a port/shipyard framing makes a small-craft landing collide directly with civilian clinic circulation.
- `ch_v2_birthplace_west_blue_01_sankan_boat_against_steps` — The boat’s pivot, landing steps and current are explicitly fluvial; the same physical problem does not transplant to a normal seaport.
- `ch_v2_birthplace_west_blue_01_sankan_narrow_bend` — Right-of-way is determined by upriver/downriver current through a narrow river passage, which is Sankan’s defining authoring note.
- `ch_v2_birthplace_west_blue_01_shishano_mercenary_table` — Shishano’s authoring note explicitly supports mercenaries and voyages; the child’s access problem comes from armed escorts negotiating at port lodging.
- `ch_v2_birthplace_west_blue_01_shishano_escort_board` — The escort roster is grounded in Shishano’s mercenary/travel + crew-recruitment context, not generic employment or a Marine institution.
- `ch_v2_birthplace_west_blue_01_twinsnakes_last_boat_coat` — On the isolated island, a currently unique docked departure makes a forgotten lodging item a sharper choice than in a busy port hub.
- `ch_v2_birthplace_west_blue_01_twinsnakes_empty_skiff` — An unrecognized empty small craft has special salience on an isolated coastal island rather than inside a dense commercial harbor.
- `ch_v2_birthplace_west_blue_01_bellflower_seedling_shortcut` — The path problem is literally formed by planted rows between a rural village and its coastal road; agriculture creates the action space.
- `ch_v2_birthplace_west_blue_01_bellflower_boundary_stakes` — The evidence is agricultural: furrows, parcel stakes and a harvest cart physically explain a land-boundary dispute.

## Dice audit
- Dice roots: **10 / 16 = 62.5% exactly**.
- Early Dice roots: **5**; Late Dice roots: **5**.
- Every Dice root has **2 materially different root Dice Choices** plus an unconditional deterministic Choice.
- Thresholds use only 8/11/14.
- Every root Dice uses the V2 Stat profile: criticalFailure `-1`, failure `0`, success `+2`, criticalSuccess `+2` on the rolled Stat.
- Failure prose always loses position, time, evidence, access or social standing; no failure grants compensating positive progression.
| Dice root | Approaches |
|---|---|
| `ch_v2_birthplace_west_blue_01_happo_staff_under_gangway` | agility @11 / charisma @11 |
| `ch_v2_birthplace_west_blue_01_happo_shared_training_lane` | observation @11 / charisma @11 |
| `ch_v2_birthplace_west_blue_01_aurora_repair_seam_dispute` | observation @11 / intelligence @14 |
| `ch_v2_birthplace_west_blue_01_masala_crowd_on_gangway` | agility @11 / charisma @11 |
| `ch_v2_birthplace_west_blue_01_lago_civic_landing_bottleneck` | navigation @11 / charisma @11 |
| `ch_v2_birthplace_west_blue_01_sankan_boat_against_steps` | agility @11 / navigation @11 |
| `ch_v2_birthplace_west_blue_01_sankan_narrow_bend` | navigation @11 / observation @11 |
| `ch_v2_birthplace_west_blue_01_shishano_mercenary_table` | agility @8 / charisma @11 |
| `ch_v2_birthplace_west_blue_01_twinsnakes_empty_skiff` | observation @11 / agility @11 |
| `ch_v2_birthplace_west_blue_01_bellflower_seedling_shortcut` | observation @8 / agility @11 |

## Immediate audit
- Mini-arc roots: **9 / 16 = 56.25% exactly**.
- Depth 2+ roots: **6** (requirement >=4).
- Depth 3 roots: **1** (`...masala_crowd_on_gangway`).
- Immediate EventDefinitions: **16**.
- Every Immediate changes physical layout, evidence, stakeholder position, or resolution choice; no “Continue” panels.
- No Immediate cycles; no orphan Immediate nodes; all queue targets exist.
| Root | Max reachable Immediate depth |
|---|---:|
| `ch_v2_birthplace_west_blue_01_happo_staff_under_gangway` | 2 |
| `ch_v2_birthplace_west_blue_01_aurora_launch_cradle` | 1 |
| `ch_v2_birthplace_west_blue_01_aurora_repair_seam_dispute` | 2 |
| `ch_v2_birthplace_west_blue_01_masala_crowd_on_gangway` | 3 |
| `ch_v2_birthplace_west_blue_01_lago_civic_landing_bottleneck` | 1 |
| `ch_v2_birthplace_west_blue_01_sankan_boat_against_steps` | 2 |
| `ch_v2_birthplace_west_blue_01_shishano_escort_board` | 2 |
| `ch_v2_birthplace_west_blue_01_twinsnakes_last_boat_coat` | 1 |
| `ch_v2_birthplace_west_blue_01_bellflower_boundary_stakes` | 2 |

## Scheduled audit
- Scheduled EventDefinitions: **0**.
- `scheduleEvent` Effects: **0**.
- No callback was justified strongly enough to consume a future Childhood slot; all continuations are same-scene Immediate.

## Reward / malus audit
- Deterministic Stat effects use only `-1 / 0 / +1`.
- Dice root effects use only `-1 / 0 / +2 / +2` on the tested Stat.
- No Health, Berrys, Reputation, Bounty, Item, NPC-state, career, ship or geography mutation.
- Negative deterministic outcomes exist where the player worsens cooperation, damages trust, or chooses a clearly poor local response; the package is not mechanically sanitized.
- Purely neutral deterministic outcomes remain meaningful through lost time, unresolved disagreement or opportunity cost.

## Trait audit
- Trait grants: **0**.
- Trait removals: **0**.
- Trait gates/modifiers/overrides: **0**.
- No new TraitDefinition; opposite-pair risk is therefore zero.

## Geography / canon audit
- Every root uses exact `locationIs(<West Blue Birth Location>)`; no root substitutes `originSeaIs`.
- Custom locations use only current `type`, parent, tags, services, docking/shipMarket and `authoringNotes`; no dynasty, festival, religion, historical war, named local hero, secret society or invented cultural tradition.
- No canon character appears. No canon event is rewritten.
- `Twinsnakes Island` is treated only as `coastal + isolated`; its name is not used to invent snakes, twin geography or local mythology.
- Lago Town is treated as a civilian coastal city; no unsupported government/royal institution is added.

## Wave 1 / 2 / 3 collision audit
- Wave 1 root registries scanned: `GENERIC_EARLY`, `GENERIC_LATE`, `PEERS`, `IDENTITY_WORLD`, `COMBAT_RISK`. Avoided direct duplicates including small delivery, spilled bucket, rolling object, harbor-signal mismatch, foreign-quay deadline, mislabeled crate, puppet-case custody, market-price shift, falling crate, runaway handcart, storm hardware and generic repair/apprenticeship loops.
- Wave 2 root registries scanned: Human, Fish-Man, Mink, Giant. No root depends on body standardization, aquatic privilege/obligation, fur/scent/hearing, Giant scale/access or another Race-owned engine.
- Wave 3 root registries scanned: Civilian, Marine, Pirate, Revolutionary, Royal Origin Cross. No root requires Race or inherited affiliation and none reuses checkpoint discrimination, pirate marks/shares, Revolutionary concealment, Marine-family access or royal protocol.
- Port repetition was specifically controlled: Happo = martial/commercial space; Aurora = shipyard/full market; Masala = entertainment/public flow; Shishano = mercenary/travel pressure. Cargo/crate handling is not the batch’s common engine.

## Persistent-definition audit
- New `NpcDefinition`: **0**.
- New `ItemDefinition`: **0**.
- New `TraitDefinition`: **0**.
- New Location: **0**.
- New system Flag: **0**.
- New Condition / Effect / mechanic: **0**.
- Persistent NPC cast used: **none**; all local actors are prose-only.
- Runtime vocabulary used: `all`, `careerPhaseIs`, `ageAtLeastMonths`, `ageAtMostMonths`, `locationIs`, `modifyStat`, `queueImmediateEvent`, deterministic resolution and Dice resolution.

## Self-audit result
- EventDefinition JSON: **32 total** = 16 Normal + 16 Immediate.
- Localization keys: **316**, all referenced keys present.
- IDs unique: PASS. Filenames == IDs: PASS. Immediate references: PASS. Cycles: none. Orphans: none.
- Exact location distribution: PASS (8 locations × 2 roots). Early/Late: PASS (8/8). Dice: PASS (10). Mini-arcs: PASS (9). Lifetime: PASS (0). Scheduled: PASS (0).
- Root FR body words: **33–38**, inside the 20–45 target.
