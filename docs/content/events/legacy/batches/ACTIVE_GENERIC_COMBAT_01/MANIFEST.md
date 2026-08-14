# ACTIVE_GENERIC_COMBAT_01

Batch V1 Active — combat / aventure générique, progression physique Event-driven.

- `CONTENT_SCHEMA_VERSION`: `6`
- Phase: `active`, tous les roots exigent `ageAtLeastMonths >= 180`.
- Contrat temporel: 2 slots/mois Active; un root + toute sa chaîne Immediate = 1 slot total.
- Aucun nouveau système de combat, aucune nouvelle définition persistante.

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `active_generic_combat_01_common_room_chain_reaction` | `common_room_chain_reaction` | 15 ans+ (`>=180` mois) | land — service food |
| `active_generic_combat_01_alley_crossfire_ambush` | `alley_crossfire_ambush` | 15 ans+ (`>=180` mois) | land — tag urban |
| `active_generic_combat_01_forest_false_retreat` | `forest_false_retreat` | 15 ans+ (`>=180` mois) | land — tag forest|wilderness |
| `active_generic_combat_01_dockside_racket_line` | `dockside_racket_line` | 15 ans+ (`>=180` mois) | land — tag port |
| `active_generic_combat_01_roadside_shelter_raid` | `roadside_shelter_raid` | 15 ans+ (`>=180` mois) | land — tag rural|wilderness|criminal |
| `active_generic_combat_01_coastal_shop_pirate_raid` | `coastal_shop_pirate_raid` | 15 ans+ (`>=180` mois) | land — coastal+trade |
| `active_generic_combat_01_duel_with_boundaries` | `duel_with_boundaries` | 15 ans+ (`>=180` mois) | land — generic land |
| `active_generic_combat_01_protect_market_stall` | `protect_market_stall` | 15 ans+ (`>=180` mois) | land — service trade |
| `active_generic_combat_01_purse_snatcher_chase` | `purse_snatcher_chase` | 15 ans+ (`>=180` mois) | land — service trade |
| `active_generic_combat_01_backstreet_hunted` | `backstreet_hunted` | 15 ans+ (`>=180` mois) | land — tag urban |
| `active_generic_combat_01_doorway_local_gang` | `doorway_local_gang` | 15 ans+ (`>=180` mois) | land — tag urban|criminal |
| `active_generic_combat_01_escort_cart_breakpoint` | `escort_cart_breakpoint` | 15 ans+ (`>=180` mois) | land — service trade |
| `active_generic_combat_01_improvised_bodyguard` | `improvised_bodyguard` | 15 ans+ (`>=180` mois) | land — wealthy|trade |
| `active_generic_combat_01_burglary_caught_midway` | `burglary_caught_midway` | 15 ans+ (`>=180` mois) | land — service lodging|general_goods |
| `active_generic_combat_01_bridge_two_groups` | `bridge_two_groups` | 15 ans+ (`>=180` mois) | land — generic land |
| `active_generic_combat_01_surrender_after_clash` | `surrender_after_clash` | 15 ans+ (`>=180` mois) | land — generic land |
| `active_generic_combat_01_superior_opponent_pattern` | `superior_opponent_pattern` | 15 ans+ (`>=180` mois) | land — generic land |
| `active_generic_combat_01_mistaken_identity_scuffle` | `mistaken_identity_scuffle` | 15 ans+ (`>=180` mois) | land — urban|port |
| `active_generic_combat_01_wilderness_nest_guardian` | `wilderness_nest_guardian` | 15 ans+ (`>=180` mois) | land — tag wilderness |
| `active_generic_combat_01_cliffside_predator` | `cliffside_predator` | 15 ans+ (`>=180` mois) | land — tag mountain |
| `active_generic_combat_01_crew_sparring_rotation` | `crew_sparring_rotation` | 15 ans+ (`>=180` mois) | land — hasCrew |
| `active_generic_combat_01_partner_endurance_drill` | `partner_endurance_drill` | 15 ans+ (`>=180` mois) | land — generic land |
| `active_generic_combat_01_light_boarding_raid` | `light_boarding_raid` | 15 ans+ (`>=180` mois) | sea — sea+ship |
| `active_generic_combat_01_repel_grappling_party` | `repel_grappling_party` | 15 ans+ (`>=180` mois) | sea — sea+ship |
| `active_generic_combat_01_rain_deck_pursuit` | `rain_deck_pursuit` | 15 ans+ (`>=180` mois) | sea — sea+ship |
| `active_generic_combat_01_drifting_skiff_threat` | `drifting_skiff_threat` | 15 ans+ (`>=180` mois) | sea — sea+ship |
| `active_generic_combat_01_cargo_deck_scuffle` | `cargo_deck_scuffle` | 15 ans+ (`>=180` mois) | sea — sea+ship |
| `active_generic_combat_01_night_watch_intruders` | `night_watch_intruders` | 15 ans+ (`>=180` mois) | sea — sea+ship |
| `active_generic_combat_01_rolling_deck_training` | `rolling_deck_training` | 15 ans+ (`>=180` mois) | sea — sea+ship |
| `active_generic_combat_01_overboard_rescue_pressure` | `overboard_rescue_pressure` | 15 ans+ (`>=180` mois) | sea — sea+ship |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `active_generic_combat_01_common_room_chain_reaction`
**arcKey:** `commonRoomChainReaction`
**Maximum reachable Immediate depth:** **5**
**Premise:** Une bagarre de salle commune devient une cascade continue où l’objectif passe de tenir le centre à protéger les clients, respecter une reddition et décider ce que les témoins retiendront.

## SECONDARY_IMMEDIATE_ARCS

- active_generic_combat_01_alley_crossfire_ambush — **arcKey:** `alleyCrossfireAmbush` — **depth 3** — Une embuscade urbaine oblige à lire les sorties, briser une tenaille puis gérer l’arrivée d’un civil dans la ligne.
- active_generic_combat_01_forest_false_retreat — **arcKey:** `forestFalseRetreat` — **depth 3** — Une fausse retraite mène à une corde-piège, un complice caché puis au choix d’une sortie sans prolonger la chasse.
- active_generic_combat_01_dockside_racket_line — **arcKey:** `docksideRacketLine` — **depth 3** — Un racket de quai devient conflit autour d’une corde d’amarrage, du bord de l’eau puis des témoins qui peuvent briser l’emprise du groupe.

## LIFETIME_THREADS

### active_generic_combat_01_duel_with_boundaries — rivalAcrossYears
**Ancre durable:** Rival itinérant au foulard fendu, sans `NpcDefinition`; la continuité est portée par History, les Event IDs et la chaîne Scheduled verticale.
**Longest reachable Scheduled depth:** **14**
**Total distinct reachable Scheduled EventDefinitions:** **27**
**Vrais points de divergence long-terme:** **3** — S2 (respect vs domination), S6 (protection vs traque vs négociation), S10 (trêve vs rivalité cadrée vs rupture/escalade).
**Topologie:** `strongly_branching` — deux reconvergences après branches de trois chapitres, puis troisième split de deux chapitres avant une conclusion qui relit la trajectoire via History.
**Span visé:** environ 15–18 ans sur le chemin le plus long selon les délais; seed possible dès 15 ans et conclusion potentielle au début de la trentaine.
- Confrontations majeures séparées dans le temps: S2, A4/B4, P8/H8/N8, S10, S14. Chacune déclenche une chaîne Immediate d2–d3.
- Verticalité: le seed programme uniquement S1; chaque Scheduled programme seulement son/ses futur(s) direct(s). Aucun pré-queue du graphe complet.
- Portabilité géographique: les chapitres physiques nécessitant réellement un décor terrestre utilisent `isOnLand` et restent pending pendant un passage en mer; les messages/rumeurs restent portables.
- Split persistant: S2 garde deux branches distinctes pendant trois Scheduled avant S6; S6 garde trois branches distinctes pendant trois Scheduled avant S10; S10 garde trois branches distinctes pendant deux Scheduled avant S13.

## COMBAT_COVERAGE

| Root ID | Famille | Contexte | Profondeur Immediate max | Dice / Stats principaux | Fuite / désescalade / protection | Pertes PV / Moral possibles | Gains physiques possibles |
|---|---|---|---:|---|---|---|---|
| `active_generic_combat_01_common_room_chain_reaction` | bagarre de salle commune | land | 5 | strength; focus `strength` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation`, `strength` |
| `active_generic_combat_01_alley_crossfire_ambush` | embuscade urbaine croisée | land | 3 | observation; focus `observation` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation` |
| `active_generic_combat_01_forest_false_retreat` | embuscade en forêt / fausse retraite | land | 3 | agility; focus `agility` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `agility`, `observation` |
| `active_generic_combat_01_dockside_racket_line` | racket / rixe de quai | land | 3 | charisma; focus `observation` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation` |
| `active_generic_combat_01_roadside_shelter_raid` | attaque de bandits sur refuge de route | land | 2 | morale; focus `strength` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation`, `strength` |
| `active_generic_combat_01_coastal_shop_pirate_raid` | attaque de petits pirates | land | 2 | déterministe; focus `agility` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `agility`, `observation` |
| `active_generic_combat_01_duel_with_boundaries` | duel provoqué / rivalité | land | 2 | déterministe; focus `observation` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation` |
| `active_generic_combat_01_protect_market_stall` | protéger quelqu’un pendant une agression | land | 2 | agility; focus `agility` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `agility`, `observation` |
| `active_generic_combat_01_purse_snatcher_chase` | poursuite d’un voleur | land | 2 | agility; focus `agility` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `agility`, `observation` |
| `active_generic_combat_01_backstreet_hunted` | être poursuivi | land | 2 | observation; focus `observation` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `agility`, `observation` |
| `active_generic_combat_01_doorway_local_gang` | gang local / défense de refuge | land | 2 | déterministe; focus `strength` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation`, `strength` |
| `active_generic_combat_01_escort_cart_breakpoint` | escorte qui tourne mal | land | 2 | strength; focus `strength` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation`, `strength` |
| `active_generic_combat_01_improvised_bodyguard` | garde du corps improvisée | land | 2 | déterministe; focus `observation` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation` |
| `active_generic_combat_01_burglary_caught_midway` | cambriolage surpris en cours | land | 2 | intelligence; focus `observation` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation` |
| `active_generic_combat_01_bridge_two_groups` | conflit entre deux groupes | land | 2 | déterministe; focus `morale` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation` |
| `active_generic_combat_01_surrender_after_clash` | adversaire qui se rend | land | 2 | déterministe; focus `morale` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation` |
| `active_generic_combat_01_superior_opponent_pattern` | adversaire techniquement supérieur | land | 2 | observation; focus `observation` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation` |
| `active_generic_combat_01_mistaken_identity_scuffle` | affrontement par malentendu | land | 2 | déterministe; focus `charisma` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation` |
| `active_generic_combat_01_wilderness_nest_guardian` | animal dangereux / protection de nid | land | 2 | strength; focus `strength` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation`, `strength` |
| `active_generic_combat_01_cliffside_predator` | prédateur en montagne | land | 2 | déterministe; focus `agility` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `agility`, `observation` |
| `active_generic_combat_01_crew_sparring_rotation` | entraînement avec Crew | land | 2 | déterministe; focus `agility` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `agility`, `observation` |
| `active_generic_combat_01_partner_endurance_drill` | sparring générique / endurance | land | 2 | déterministe; focus `strength` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation`, `strength` |
| `active_generic_combat_01_light_boarding_raid` | abordage léger | sea | 2 | agility; focus `agility` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `agility`, `observation` |
| `active_generic_combat_01_repel_grappling_party` | repousser un abordage | sea | 2 | déterministe; focus `strength` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation`, `strength` |
| `active_generic_combat_01_rain_deck_pursuit` | poursuite sur pont sous pluie | sea | 2 | navigation; focus `navigation` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `agility`, `observation` |
| `active_generic_combat_01_drifting_skiff_threat` | menace depuis une barque dérivante | sea | 2 | déterministe; focus `observation` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation` |
| `active_generic_combat_01_cargo_deck_scuffle` | rixe de pont autour de caisses | sea | 2 | déterministe; focus `strength` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation`, `strength` |
| `active_generic_combat_01_night_watch_intruders` | intrusion nocturne sur navire | sea | 2 | déterministe; focus `observation` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation` |
| `active_generic_combat_01_rolling_deck_training` | entraînement physique en mer | sea | 2 | déterministe; focus `agility` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `agility`, `observation` |
| `active_generic_combat_01_overboard_rescue_pressure` | protection / sauvetage en mer sous pression | sea | 2 | strength; focus `strength` | oui — chaque scène offre rupture, protection ou contrôle | PV oui; Moral oui | `observation`, `strength` |

## ROOTS

- `active_generic_combat_01_common_room_chain_reaction`
- `active_generic_combat_01_alley_crossfire_ambush`
- `active_generic_combat_01_forest_false_retreat`
- `active_generic_combat_01_dockside_racket_line`
- `active_generic_combat_01_roadside_shelter_raid`
- `active_generic_combat_01_coastal_shop_pirate_raid`
- `active_generic_combat_01_duel_with_boundaries`
- `active_generic_combat_01_protect_market_stall`
- `active_generic_combat_01_purse_snatcher_chase`
- `active_generic_combat_01_backstreet_hunted`
- `active_generic_combat_01_doorway_local_gang`
- `active_generic_combat_01_escort_cart_breakpoint`
- `active_generic_combat_01_improvised_bodyguard`
- `active_generic_combat_01_burglary_caught_midway`
- `active_generic_combat_01_bridge_two_groups`
- `active_generic_combat_01_surrender_after_clash`
- `active_generic_combat_01_superior_opponent_pattern`
- `active_generic_combat_01_mistaken_identity_scuffle`
- `active_generic_combat_01_wilderness_nest_guardian`
- `active_generic_combat_01_cliffside_predator`
- `active_generic_combat_01_crew_sparring_rotation`
- `active_generic_combat_01_partner_endurance_drill`
- `active_generic_combat_01_light_boarding_raid`
- `active_generic_combat_01_repel_grappling_party`
- `active_generic_combat_01_rain_deck_pursuit`
- `active_generic_combat_01_drifting_skiff_threat`
- `active_generic_combat_01_cargo_deck_scuffle`
- `active_generic_combat_01_night_watch_intruders`
- `active_generic_combat_01_rolling_deck_training`
- `active_generic_combat_01_overboard_rescue_pressure`

## IMMEDIATE_EVENTS

- `active_generic_combat_01_alley_crossfire_ambush_i1`
- `active_generic_combat_01_alley_crossfire_ambush_i2`
- `active_generic_combat_01_alley_crossfire_ambush_i3`
- `active_generic_combat_01_backstreet_hunted_i1`
- `active_generic_combat_01_backstreet_hunted_i2`
- `active_generic_combat_01_bridge_two_groups_i1`
- `active_generic_combat_01_bridge_two_groups_i2`
- `active_generic_combat_01_burglary_caught_midway_i1`
- `active_generic_combat_01_burglary_caught_midway_i2`
- `active_generic_combat_01_cargo_deck_scuffle_i1`
- `active_generic_combat_01_cargo_deck_scuffle_i2`
- `active_generic_combat_01_cliffside_predator_i1`
- `active_generic_combat_01_cliffside_predator_i2`
- `active_generic_combat_01_coastal_shop_pirate_raid_i1`
- `active_generic_combat_01_coastal_shop_pirate_raid_i2`
- `active_generic_combat_01_common_room_chain_reaction_i1`
- `active_generic_combat_01_common_room_chain_reaction_i2`
- `active_generic_combat_01_common_room_chain_reaction_i3`
- `active_generic_combat_01_common_room_chain_reaction_i4`
- `active_generic_combat_01_common_room_chain_reaction_i5`
- `active_generic_combat_01_crew_sparring_rotation_i1`
- `active_generic_combat_01_crew_sparring_rotation_i2`
- `active_generic_combat_01_dockside_racket_line_i1`
- `active_generic_combat_01_dockside_racket_line_i2`
- `active_generic_combat_01_dockside_racket_line_i3`
- `active_generic_combat_01_doorway_local_gang_i1`
- `active_generic_combat_01_doorway_local_gang_i2`
- `active_generic_combat_01_drifting_skiff_threat_i1`
- `active_generic_combat_01_drifting_skiff_threat_i2`
- `active_generic_combat_01_duel_with_boundaries_i1`
- `active_generic_combat_01_duel_with_boundaries_i2`
- `active_generic_combat_01_escort_cart_breakpoint_i1`
- `active_generic_combat_01_escort_cart_breakpoint_i2`
- `active_generic_combat_01_forest_false_retreat_i1`
- `active_generic_combat_01_forest_false_retreat_i2`
- `active_generic_combat_01_forest_false_retreat_i3`
- `active_generic_combat_01_improvised_bodyguard_i1`
- `active_generic_combat_01_improvised_bodyguard_i2`
- `active_generic_combat_01_light_boarding_raid_i1`
- `active_generic_combat_01_light_boarding_raid_i2`
- `active_generic_combat_01_mistaken_identity_scuffle_i1`
- `active_generic_combat_01_mistaken_identity_scuffle_i2`
- `active_generic_combat_01_night_watch_intruders_i1`
- `active_generic_combat_01_night_watch_intruders_i2`
- `active_generic_combat_01_overboard_rescue_pressure_i1`
- `active_generic_combat_01_overboard_rescue_pressure_i2`
- `active_generic_combat_01_partner_endurance_drill_i1`
- `active_generic_combat_01_partner_endurance_drill_i2`
- `active_generic_combat_01_protect_market_stall_i1`
- `active_generic_combat_01_protect_market_stall_i2`
- `active_generic_combat_01_purse_snatcher_chase_i1`
- `active_generic_combat_01_purse_snatcher_chase_i2`
- `active_generic_combat_01_rain_deck_pursuit_i1`
- `active_generic_combat_01_rain_deck_pursuit_i2`
- `active_generic_combat_01_repel_grappling_party_i1`
- `active_generic_combat_01_repel_grappling_party_i2`
- `active_generic_combat_01_rival_a4_bridge_pressure_i1`
- `active_generic_combat_01_rival_a4_bridge_pressure_i2`
- `active_generic_combat_01_rival_b4_doorstep_challenge_i1`
- `active_generic_combat_01_rival_b4_doorstep_challenge_i2`
- `active_generic_combat_01_rival_h8_warehouse_chase_i1`
- `active_generic_combat_01_rival_h8_warehouse_chase_i2`
- `active_generic_combat_01_rival_n8_truce_broken_i1`
- `active_generic_combat_01_rival_n8_truce_broken_i2`
- `active_generic_combat_01_rival_p8_roofline_extraction_i1`
- `active_generic_combat_01_rival_p8_roofline_extraction_i2`
- `active_generic_combat_01_rival_s10_borrowed_opening_i1`
- `active_generic_combat_01_rival_s10_borrowed_opening_i2`
- `active_generic_combat_01_rival_s10_borrowed_opening_i3`
- `active_generic_combat_01_rival_s14_final_terms_i1`
- `active_generic_combat_01_rival_s14_final_terms_i2`
- `active_generic_combat_01_rival_s2_crossing_i1`
- `active_generic_combat_01_rival_s2_crossing_i2`
- `active_generic_combat_01_roadside_shelter_raid_i1`
- `active_generic_combat_01_roadside_shelter_raid_i2`
- `active_generic_combat_01_rolling_deck_training_i1`
- `active_generic_combat_01_rolling_deck_training_i2`
- `active_generic_combat_01_superior_opponent_pattern_i1`
- `active_generic_combat_01_superior_opponent_pattern_i2`
- `active_generic_combat_01_surrender_after_clash_i1`
- `active_generic_combat_01_surrender_after_clash_i2`
- `active_generic_combat_01_wilderness_nest_guardian_i1`
- `active_generic_combat_01_wilderness_nest_guardian_i2`

## SCHEDULED_EVENTS

- `active_generic_combat_01_rival_a3_unspoken_rule`
- `active_generic_combat_01_rival_a4_bridge_pressure`
- `active_generic_combat_01_rival_a5_debt_without_words`
- `active_generic_combat_01_rival_b3_hard_story`
- `active_generic_combat_01_rival_b4_doorstep_challenge`
- `active_generic_combat_01_rival_b5_scarred_reputation`
- `active_generic_combat_01_rival_e11_hard_break`
- `active_generic_combat_01_rival_e12_hunt_or_end`
- `active_generic_combat_01_rival_h7_false_trail`
- `active_generic_combat_01_rival_h8_warehouse_chase`
- `active_generic_combat_01_rival_h9_no_clean_win`
- `active_generic_combat_01_rival_n7_neutral_terms`
- `active_generic_combat_01_rival_n8_truce_broken`
- `active_generic_combat_01_rival_n9_terms_hold`
- `active_generic_combat_01_rival_p7_witness_route`
- `active_generic_combat_01_rival_p8_roofline_extraction`
- `active_generic_combat_01_rival_p9_debt_named`
- `active_generic_combat_01_rival_r11_last_challenge`
- `active_generic_combat_01_rival_r12_agreed_ground`
- `active_generic_combat_01_rival_s10_borrowed_opening`
- `active_generic_combat_01_rival_s13_last_message`
- `active_generic_combat_01_rival_s14_final_terms`
- `active_generic_combat_01_rival_s1_echo`
- `active_generic_combat_01_rival_s2_crossing`
- `active_generic_combat_01_rival_s6_same_target`
- `active_generic_combat_01_rival_t11_shared_rule`
- `active_generic_combat_01_rival_t12_parting_respect`
- `active_generic_combat_01_scheduled_boarding_rumor_callback`
- `active_generic_combat_01_scheduled_burglary_rumor_callback`
- `active_generic_combat_01_scheduled_gang_story_callback`
- `active_generic_combat_01_scheduled_protected_vendor_callback`
- `active_generic_combat_01_scheduled_rescue_debt_callback`
- `active_generic_combat_01_scheduled_spared_opponent_callback`
- `active_generic_combat_01_scheduled_tavern_witness_story`

## PERSISTENT_IDS_USED

- Careers: `civilian`, `pirate`, `marine`, `revolutionary`, `bounty_hunter` (Choices contextuelles seulement).
- Crew roles: `fighter`, `navigator` (Choices contextuelles); `hasCrew` pour le sparring Crew.
- Haki: `observation` déjà éveillé uniquement comme Choice conditionnelle.
- Devil Fruit tags: `mobility`, `enhanced_strength` déjà acquis uniquement comme Choices conditionnelles.
- Location tags/services: `urban`, `forest`, `wilderness`, `port`, `rural`, `criminal`, `coastal`, `wealthy`, `mountain`, `marine_presence`; services `food`, `trade`, `lodging`, `general_goods`.
- Stats: `strength`, `agility`, `observation`, `morale`, `charisma`, `intelligence`, `navigation`.
- Persistent NPC/Item/Flag/Ship ID mutation: None.

## DEPENDENCIES

- Runtime content schema V6 (`Condition`, `Effect`, Normal/Immediate/Scheduled).
- World V1 tags/services and Active travel context (`isOnLand`, `isAtSea`, `hasShip`).
- No dependency on another content batch; callbacks depend only on their own originating branch.

## CAREER_RANK_TITLE_BOUNTY_CONTEXT

- Career-aware Choices exist for all five Careers, but no career change, promotion, rank, title or bounty mutation is authored.
- Reputation changes are limited to explicitly public/notable minor acts (`±1` where used).

## SHIP_CREW_POWERS_CONTEXT

- 8 sea roots require `isAtSea` + `hasShip`; no leadership assumption, ship damage, ship acquisition, cargo mutation or naval combat subsystem.
- Crew sparring uses `hasCrew`; optional `fighter` / `navigator` roles unlock visible disabled Choices.
- Existing Haki/Fruit state can unlock a Choice; no Fruit distribution, Haki awakening or power progression Effect.

## TIMELINE_CANON

- Tous les roots: Active `>=180` mois; aucun upper-bound canon inventé.
- Contenu original/périphérique; aucun personnage canon majeur, aucune organisation canon nécessaire, aucun outcome canon modifié.
- La Lifetime utilise un rival original porté par le texte et History, sans `NpcDefinition` persistante.

## DICE_STATS_TRAITS_LOCATIONS_COVERAGE

- Roots avec DiceCheck: **15/30**.
- Roots avec gain possible `strength`/`agility`/`observation`: **30/30**.
- Roots avec risque crédible de `modifyHealth` négatif dans leur scène: **30/30**.
- Roots avec variation possible de Moral dans leur scène: **30/30**.
- Dice principaux: `strength`, `agility`, `observation`, `morale`, `charisma`, `intelligence`, `navigation`; aucun Dice `health`.
- Traits: aucun Trait ajouté/retiré; le batch n’a pas besoin de Trait pour satisfaire sa progression physique.
- Répartition géographique: **22 roots land / 8 roots sea**; géographie par tags/services sémantiques, sans énumération de Locations.

## SCHEDULED_OUTSIDE_LIFETIME

- **7 roots** initient un callback Scheduled hors Lifetime: `active_generic_combat_01_burglary_caught_midway`, `active_generic_combat_01_common_room_chain_reaction`, `active_generic_combat_01_doorway_local_gang`, `active_generic_combat_01_light_boarding_raid`, `active_generic_combat_01_overboard_rescue_pressure`, `active_generic_combat_01_protect_market_stall`, `active_generic_combat_01_surrender_after_clash`.
- Callbacks: version qui circule, dette de protection, histoire du refuge, reddition racontée, rumeur du cambriolage, méthode d’abordage reconnue, dette de sauvetage.

## TRAVEL_COVERAGE

- Ingress connus: None — ce batch ne déplace jamais le joueur.
- Egress connus: None — ce batch ne déplace jamais le joueur.
- Transitions parent/sous-location: None.
- Transitions gated/special: None.
- Cross-route rares: None.
- Contribution à la couverture de déplacement normal / fallback: None. Aucun `moveToLocation`, aucun `recoverTravel`, aucun fallback système.

## DEDUP_NOTES

- Le ledger fourni est le corpus Childhood accepté. Les concepts ont été comparés aux roots et structures long-form existantes.
- Le root Childhood `ch_identity_world_01_bandit_toll` (péage sur route) n’est pas reskinné: l’attaque adulte `roadside_shelter_raid` est un raid immédiat sur un refuge et se concentre sur évacuation/otage plutôt que paiement/règle sociale.
- Pas de reprise des Lifetimes Childhood de peur/respiration, chaîne de services, registre familial, carnet de voyage, signaux météo, atlas, agriculture ou controverse historique.
- La Lifetime `rivalAcrossYears` est centrée sur une relation de confrontation adulte qui évolue par règles de duel, protection de tiers, traque, négociation, trêve, rupture et fin choisie.

## VALIDATION_SUMMARY

- Roots Normal: **30**.
- Signature d5: **1**; Secondary d3: **3** sur roots distincts.
- Roots avec Immediate depth >=2: **30/30**.
- Lifetime: **27 Scheduled distincts**, longest depth **14**, divergences **3**, split persistant vérifié.
- Scheduled callbacks hors Lifetime: **7**.
- Tous les Events ont au moins une Choice sans `availableIf`.
- Quatre outcomes exacts sur chaque DiceCheck.
- Aucun `modifyStat health`, aucun `recoverTravel`, aucun `dead_end_on_land`, aucun `dead_end_at_sea`, aucune mécanique de combat inventée.
