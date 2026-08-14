# CH_WEST_BLUE_01

- **Scope:** Childhood — West Blue V1
- **Prefix:** `ch_west_blue_01`
- **CONTENT_SCHEMA_VERSION:** `6`
- **Persistent definitions proposed:** None
- **Root count:** 20 Normal one-shot Events
- **FR:** source/fallback; batch dictionary contains only new French keys

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `ch_west_blue_01_bellflower_harvest_bells` | `bellflower_harvest_storm` | 3–7 ans | Bellflower Village — agriculture côtière |
| `ch_west_blue_01_twinsnakes_double_tide` | `twinsnakes_tidal_trap` | 4–8 ans | Twinsnakes Island — isolement et double courant |
| `ch_west_blue_01_masala_lantern_parade` | `masala_parade_lantern` | 4–8 ans | Masala Port — port de commerce et spectacle |
| `ch_west_blue_01_lago_clinic_queue` | `lago_clinic_overflow` | 3–7 ans | Lago Town — ville civile avec service médical |
| `ch_west_blue_01_sankan_toy_ferry` | `sankan_river_current` | 5–8 ans | Sankan River Town — ville fluviale commerciale |
| `ch_west_blue_01_happo_knotted_crate` | `happo_dock_knot` | 5–8 ans | Happo Port — manutention et commerce |
| `ch_west_blue_01_aurora_shipyard_echoes` | `aurora_shipyard_safety` | 6–8 ans | Aurora City — chantier naval |
| `ch_west_blue_01_shishano_wrong_mark` | `shishano_cargo_misroute` | 5–8 ans | Shishano Port — cargaisons et voyages |
| `ch_west_blue_01_enoa_tide_notebook` | `enoa_west_blue_survey` | 10–14 ans | West Blue — questionnaire itinérant d’Enoa Academy |
| `ch_west_blue_01_80th_branch_open_drill` | `80th_branch_family_drill` | 11–14 ans | 80th Branch — exercice Marine via affiliation familiale |
| `ch_west_blue_01_blackfin_inked_manifest` | `blackfin_manifest_discrepancy` | 10–14 ans | Port marchand West Blue — cargaison liée à Blackfin Cove |
| `ch_west_blue_01_mauri_white_path` | `mauri_trail_marker_report` | 11–14 ans | Marché West Blue — guides revenus du Mt. Mauri |
| `ch_west_blue_01_czach_tax_tokens` | `czach_dual_token_issue` | 9–12 ans | Marché West Blue — délégation du Czach Kingdom |
| `ch_west_blue_01_jambalaya_spice_measure` | `jambalaya_scale_dispute` | 9–13 ans | Marché West Blue — convoi du Jambalaya Kingdom |
| `ch_west_blue_01_esperia_night_market` | `esperia_awning_dispute` | 9–14 ans | Lago Town — marché urbain après la pluie |
| `ch_west_blue_01_happo_banner_trial` | `happo_false_manifest_arc` | 11–14 ans | Happo Port — fête de quai et faux manifeste |
| `ch_west_blue_01_aurora_launching_cradle` | `aurora_launch_accident_arc` | 11–14 ans | Aurora City — mise à l’eau au chantier naval |
| `ch_west_blue_01_masala_backstage_knot` | `masala_stage_rigging_arc` | 10–14 ans | Masala Port — incident de machinerie scénique |
| `ch_west_blue_01_sankan_river_gate` | `sankan_barge_gate_arc` | 10–14 ans | Sankan River Town — porte de chenal et barge |
| `ch_west_blue_01_bellflower_storm_shelter` | `bellflower_improvised_shelter` | 9–14 ans | Bellflower Village — hangar agricole sous l’orage |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `ch_west_blue_01_happo_banner_trial`
**arcKey:** `happo_false_manifest_arc`
**Maximum reachable Immediate depth:** **5**
**Premise:** Une fête de quai dégénère en incident de manutention puis révèle un faux manifeste, forçant le joueur à arbitrer sécurité, preuve et responsabilité dans la même scène.

## SECONDARY_IMMEDIATE_ARCS

- ch_west_blue_01_aurora_launching_cradle — **arcKey:** aurora_launch_accident_arc — **depth 3** — Une mise à l’eau prématurée exige trois décisions successives autour du calage, des étincelles et de la reprise du chantier.
- ch_west_blue_01_masala_backstage_knot — **arcKey:** masala_stage_rigging_arc — **depth 3** — Un décor mal sécurisé mène de l’accident immédiat à l’incertitude sur la goupille manquante puis au choix de maintenir ou modifier le spectacle.
- ch_west_blue_01_sankan_river_gate — **arcKey:** sankan_barge_gate_arc — **depth 3** — Une barge poussée par le courant impose de gérer la dérive, la chaîne de porte puis le compromis entre marché et cargaison.

## LIFETIME_THREADS

### ch_west_blue_01_enoa_tide_notebook — enoa_living_atlas
**Ancre durable:** Le programme de cartographie expérimentale d’Enoa Academy et les relevés successifs du joueur, reconstruits uniquement via History et Scheduled Events.
**Longest reachable Scheduled depth:** 14
**Total distinct reachable Scheduled EventDefinitions:** 26
**Vrais points de divergence long-terme:** 3
**Topologie:** strongly_branching
**Span visé:** Du seed à environ 14 années plus tard — typiquement d’un départ à 10–14 ans vers une conclusion à 24–28 ans; conçu pour traverser Childhood → Active.

- **Divergence 1 — S02:** choisir mesures répétées → `s03a_tide_tables` / savoir pratique → `s03b_harbor_stories`; branches distinctes sur 3 Scheduled avant reconvergence à S06.
- **Divergence 2 — S07:** publier l’anomalie / garder une note interne / demander réplication; trois branches distinctes sur 2 Scheduled avant reconvergence à S10.
- **Divergence 3 — S11:** fonds public / cartes de terrain / retrait des modèles ambigus; branches finales persistantes, deux allant jusqu’à 3 Scheduled et une se terminant plus tôt.
- **Verticalité:** le seed schedule uniquement S01; chaque Scheduled schedule uniquement son descendant direct choisi. Aucun pré-queue de thread.

## ROOT_EVENTS

- `ch_west_blue_01_bellflower_harvest_bells`
- `ch_west_blue_01_twinsnakes_double_tide`
- `ch_west_blue_01_masala_lantern_parade`
- `ch_west_blue_01_lago_clinic_queue`
- `ch_west_blue_01_sankan_toy_ferry`
- `ch_west_blue_01_happo_knotted_crate`
- `ch_west_blue_01_aurora_shipyard_echoes`
- `ch_west_blue_01_shishano_wrong_mark`
- `ch_west_blue_01_enoa_tide_notebook`
- `ch_west_blue_01_80th_branch_open_drill`
- `ch_west_blue_01_blackfin_inked_manifest`
- `ch_west_blue_01_mauri_white_path`
- `ch_west_blue_01_czach_tax_tokens`
- `ch_west_blue_01_jambalaya_spice_measure`
- `ch_west_blue_01_esperia_night_market`
- `ch_west_blue_01_happo_banner_trial`
- `ch_west_blue_01_aurora_launching_cradle`
- `ch_west_blue_01_masala_backstage_knot`
- `ch_west_blue_01_sankan_river_gate`
- `ch_west_blue_01_bellflower_storm_shelter`

## IMMEDIATE_EVENTS

- `ch_west_blue_01_happo_banner_i1_rolling_barrel`
- `ch_west_blue_01_happo_banner_i2_false_mark`
- `ch_west_blue_01_happo_banner_i3_accusation`
- `ch_west_blue_01_happo_banner_i4_two_manifests`
- `ch_west_blue_01_happo_banner_i5_dockside_choice`
- `ch_west_blue_01_aurora_launch_i1_split_wedge`
- `ch_west_blue_01_aurora_launch_i2_sparks`
- `ch_west_blue_01_aurora_launch_i3_release_call`
- `ch_west_blue_01_masala_backstage_i1_falling_mask`
- `ch_west_blue_01_masala_backstage_i2_missing_pin`
- `ch_west_blue_01_masala_backstage_i3_show_decision`
- `ch_west_blue_01_sankan_gate_i1_barge_pressure`
- `ch_west_blue_01_sankan_gate_i2_gate_chain`
- `ch_west_blue_01_sankan_gate_i3_market_or_cargo`

## SCHEDULED_EVENTS

- `ch_west_blue_01_bellflower_harvest_return`
- `ch_west_blue_01_blackfin_manifest_return`
- `ch_west_blue_01_mauri_marker_news`
- `ch_west_blue_01_czach_tokens_audit`
- `ch_west_blue_01_enoa_s01_first_reply`
- `ch_west_blue_01_enoa_s02_choose_method`
- `ch_west_blue_01_enoa_s03a_tide_tables`
- `ch_west_blue_01_enoa_s04a_error_margin`
- `ch_west_blue_01_enoa_s05a_repeat_measurement`
- `ch_west_blue_01_enoa_s03b_harbor_stories`
- `ch_west_blue_01_enoa_s04b_conflicting_rules`
- `ch_west_blue_01_enoa_s05b_practical_test`
- `ch_west_blue_01_enoa_s06_shared_draft`
- `ch_west_blue_01_enoa_s07_contested_current`
- `ch_west_blue_01_enoa_s08a_publish_anomaly`
- `ch_west_blue_01_enoa_s09a_merchant_pushback`
- `ch_west_blue_01_enoa_s08b_hold_annotation`
- `ch_west_blue_01_enoa_s09b_fisher_warning`
- `ch_west_blue_01_enoa_s08c_request_replication`
- `ch_west_blue_01_enoa_s09c_second_observation`
- `ch_west_blue_01_enoa_s10_revised_atlas`
- `ch_west_blue_01_enoa_s11_final_stewardship`
- `ch_west_blue_01_enoa_s12a_public_contributor`
- `ch_west_blue_01_enoa_s13a_open_corrections`
- `ch_west_blue_01_enoa_s14a_shared_legacy`
- `ch_west_blue_01_enoa_s12b_personal_routes`
- `ch_west_blue_01_enoa_s13b_field_copies`
- `ch_west_blue_01_enoa_s14b_practical_legacy`
- `ch_west_blue_01_enoa_s12c_withdraw_model`
- `ch_west_blue_01_enoa_s13c_last_note`

## PERSISTENT_IDS_USED

- **Stats:** `morale`, `strength`, `agility`, `observation`, `intelligence`, `navigation`, `charisma`.
- **Traits:** `audacious`, `cautious`, `sociable`, `resourceful` (oppositions respectées pour `audacious/cautious` et `sociable/solitary`).
- **Sea:** `west_blue`.
- **Affiliation familiale:** `marine` (un root conditionnel).
- **Locations directes:** `bellflower_village`, `twinsnakes_island`, `bollywood_masala_port`, `esperia_lago_town`, `sankan_river_town`, `kano_happo_port`, `ilisia_aurora_city`, `shishano_port`.
- **Locations contextuelles:** `enoa_academy`, `80th_branch`, `blackfin_cove`, `mt_mauri`, `czach_kingdom`, `jambalaya_kingdom`.
- **Services/Tags utilisés par Conditions:** `trade` service; aucun tag ad hoc.
- **Items/NPCs/Flags/Ships/Fruits/Careers/Haki:** aucun nouvel ID et aucun Effect d’acquisition.

## DEPENDENCIES

- Aucune dépendance inter-batch.
- Nécessite le World V1 final, le catalogue V1 de Traits et le schema contenu V6.

## TIMELINE_CANON

- Tous les roots sont Childhood et bornés avant 15 ans.
- Aucun rang, titre, bounty, Career active, Haki, Devil Fruit, navire personnel, Grand Line ou New World.
- Aucun personnage canon nommé.
- `80th_branch`, `enoa_academy`, `blackfin_cove`, `mt_mauri`, `czach_kingdom` et `jambalaya_kingdom` sont utilisés uniquement dans les rôles autorisés par leurs notes World V1.
- La Lifetime utilise `scheduledReach: unrestricted` pour permettre une correspondance/trace documentaire même après un départ de West Blue; elle ne téléporte jamais le joueur.

## COVERAGE

- **Roots avec DiceCheck:** 10/20 (`agility` ×2, `navigation` ×2, `strength` ×1, `observation` ×2, `intelligence` ×1, `morale` ×1, `charisma` ×1).
- **Dice thresholds:** 8, 11, 14 uniquement; chaque DiceResolution fournit exactement les quatre résultats.
- **Stat effects:** amplitude ordinaire ±1/±2; aucun DiceCheck sur `health`.
- **Traits:** acquisitions rares et conditionnées contre les opposés lorsqu’ils existent.
- **Locations:** 14 contextes West Blue distincts couverts, aucune Location ne monopolise le batch.
- **Scheduled hors Lifetime:** 4 roots (`bellflower_harvest_bells`, `blackfin_inked_manifest`, `mauri_white_path`, `czach_tax_tokens`).

## DEDUP_NOTES

- Revue de dédup effectuée contre les batches acceptés `CH_GENERIC_EARLY_01`, `CH_GENERIC_LATE_01`, `CH_FAMILY_SOCIAL_01` et `CH_IDENTITY_WORLD_01`. `80th_branch_open_drill` reste distinct de `uniform_drill` par son exercice d’évacuation vécu via l’affiliation familiale Marine; `blackfin_inked_manifest` porte sur une altération volontaire de manifeste et non sur un simple compte brouillé; la Lifetime d’Enoa est une trajectoire méthodologique d’atlas participatif distincte du carnet de voyage de `traveling_notebook`.
- Les quatre arcs Immediate reposent sur des problèmes différents: fraude de manifeste, sécurité de chantier, machinerie scénique, hydraulique fluviale.
- La Lifetime `enoa_living_atlas` porte sur l’évolution méthodologique d’un atlas participatif; elle n’est pas une relation de mentor, une quête d’objet, une rivalité ou une suite de rappels linéaires.
- Les contextes West Blue modifient matériellement les scènes: agriculture de Bellflower, isolement tidal de Twinsnakes, spectacle de Masala, médecine de Lago, courant fluvial de Sankan, logistique de Happo/Shishano, shipyard d’Aurora, recherche d’Enoa, base Marine 80th, criminalité autorisée de Blackfin, montagne isolée du Mauri et échanges royaux Czach/Jambalaya.
