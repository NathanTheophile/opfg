# ACTIVE_HAKI_OBSERVATION_01

**Batch ID:** `ACTIVE_HAKI_OBSERVATION_01`  
**Scope:** Active — Haki de l'Observation : éveil, usage situationnel et maîtrise narrative.  
**Format:** V4.1 BREADTH standard.  
**Roots Normal:** 20.

Les 20 roots restent résolvables sans Haki. Les Choices Haki sont visibles mais désactivées via `availableIf` tant que le pouvoir manque. Lorsqu'un Dice ordinaire est difficile (14), la voie Haki correspondante utilise typiquement 8 ou fournit une conséquence déterministe plus favorable. L'éveil `0 → 1` n'est proposé que dans des scènes significatives et exige `hakiSourceTotalAtLeast(observation, 75)`.

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `active_haki_observation_01_crowd_before_scream` | `panic_before_sound` | 15+ | Active flexible |
| `active_haki_observation_01_laughter_with_edge` | `hostility_inside_laughter` | 15+ | Active flexible |
| `active_haki_observation_01_rigging_before_snap` | `rigging_before_snap` | 15+ | Mer + navire |
| `active_haki_observation_01_forest_without_birds` | `silence_before_ambush` | 15+ | Terre + forêt |
| `active_haki_observation_01_bell_between_dreams` | `bell_between_dreams` | 15+ | Active flexible |
| `active_haki_observation_01_wrong_footstep` | `footstep_out_of_pattern` | 15+ | Active flexible |
| `active_haki_observation_01_three_open_doors` | `three_open_doors` | 15+ | Active flexible |
| `active_haki_observation_01_watch_that_never_blinks` | `watcher_without_motion` | 15+ | Active flexible |
| `active_haki_observation_01_storm_under_skin` | `storm_before_weather` | 15+ | Active flexible |
| `active_haki_observation_01_market_child` | `lost_child_presence` | 15+ | Terre + trade |
| `active_haki_observation_01_coin_under_boot` | `hidden_object_intent` | 15+ | Active flexible |
| `active_haki_observation_01_lie_before_words` | `lie_before_words` | 15+ | Active flexible |
| `active_haki_observation_01_harbor_collision` | `harbor_collision_prediction` | 15+ | Terre + port |
| `active_haki_observation_01_blindfold_spar` | `blindfold_spar` | 15+ | Active flexible |
| `active_haki_observation_01_wave_before_impact` | `wave_before_impact` | 15+ | Mer + navire |
| `active_haki_observation_01_empty_room_presence` | `presence_in_empty_room` | 15+ | Active flexible |
| `active_haki_observation_01_glint_without_source` | `distant_attack_glint` | 15+ | Active flexible |
| `active_haki_observation_01_crossroads_premonition` | `crossroads_premonition` | 15+ | Active flexible |
| `active_haki_observation_01_quiet_after_victory` | `danger_after_victory` | 15+ | Active flexible |
| `active_haki_observation_01_last_warning` | `observation_threshold_moment` | 15+ | Active flexible |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `active_haki_observation_01_crowd_before_scream`  
**arcKey:** `active_haki_observation_01_crowd_before_scream_arc`  
**Maximum reachable Immediate depth:** **5**  
**Premise:** Dans une foule ordinaire, ton attention se fixe sur un mouvement qui n'a encore alarmé personne. Une seconde plus tard, tout peut basculer.

## SECONDARY_IMMEDIATE_ARCS

- `active_haki_observation_01_laughter_with_edge` — **arcKey:** `active_haki_observation_01_laughter_with_edge_arc` — **depth 3** — Une conversation légère se poursuit, mais une personne rit sans que son corps se détende. Quelque chose dans la scène ne colle pas.
- `active_haki_observation_01_rigging_before_snap` — **arcKey:** `active_haki_observation_01_rigging_before_snap_arc` — **depth 3** — À bord, un cordage travaille sous tension. Rien n'a encore rompu, mais ton regard revient sans cesse vers le même point.
- `active_haki_observation_01_forest_without_birds` — **arcKey:** `active_haki_observation_01_forest_without_birds_arc` — **depth 3** — Le chemin continue, mais les oiseaux se sont tus. Devant, rien ne bouge. C'est justement le problème.

## LIFETIME_THREADS

### active_haki_observation_01_bell_between_dreams — the_bell_before_the_sound

**Ancre durable:** la cloche sans source, un rivage pâle récurrent et la discipline consistant à distinguer perception du présent et prophétie imaginaire  
**Longest reachable Scheduled depth:** **14**  
**Total distinct reachable Scheduled EventDefinitions:** **26**  
**Vrais points de divergence long-terme:** **3**  
**Topologie:** `strongly_branching`  
**Span visé:** environ **10–12 ans** de carrière Active sur le chemin le plus long.

Trame à dimension spirituelle : rêves récurrents, exercices de perception, visions ambiguës et quête intérieure. Le fil refuse explicitement de transformer l'Observation en prophétie automatique : les visions servent à apprendre à écouter les présences, les intentions et le présent.

La thread est verticale : chaque chapitre ne programme que son successeur direct. Les trois splits restent distincts pendant plusieurs chapitres avant reconvergence ou terminaison. Elle ne dépend d'aucun ArcState/questState/flag.

## HAKI_COVERAGE

- Source d'éveil : `observation + intelligence >= 75`.
- Éveil via `awakenHaki(observation)` seulement.
- Roots avec opportunité explicite d'éveil : `active_haki_observation_01_crowd_before_scream`, `active_haki_observation_01_bell_between_dreams`, `active_haki_observation_01_watch_that_never_blinks`, `active_haki_observation_01_blindfold_spar`, `active_haki_observation_01_empty_room_presence`, `active_haki_observation_01_last_warning`.
- Haki déjà éveillé : Choices `hakiAtLeast(observation, 1)` sur tous les roots et tout au long des structures longues.
- Aucun Effect n'incrémente directement les niveaux 2–5 : la synchronisation runtime existante 80/85/90/95 reste autoritaire.
- Aucun changement de seuil ni de balance globale.

## ROOT_EVENT_IDS

- `active_haki_observation_01_crowd_before_scream`
- `active_haki_observation_01_laughter_with_edge`
- `active_haki_observation_01_rigging_before_snap`
- `active_haki_observation_01_forest_without_birds`
- `active_haki_observation_01_bell_between_dreams`
- `active_haki_observation_01_wrong_footstep`
- `active_haki_observation_01_three_open_doors`
- `active_haki_observation_01_watch_that_never_blinks`
- `active_haki_observation_01_storm_under_skin`
- `active_haki_observation_01_market_child`
- `active_haki_observation_01_coin_under_boot`
- `active_haki_observation_01_lie_before_words`
- `active_haki_observation_01_harbor_collision`
- `active_haki_observation_01_blindfold_spar`
- `active_haki_observation_01_wave_before_impact`
- `active_haki_observation_01_empty_room_presence`
- `active_haki_observation_01_glint_without_source`
- `active_haki_observation_01_crossroads_premonition`
- `active_haki_observation_01_quiet_after_victory`
- `active_haki_observation_01_last_warning`

## IMMEDIATE_EVENT_IDS

- `active_haki_observation_01_crowd_before_scream_i1`
- `active_haki_observation_01_crowd_before_scream_i2`
- `active_haki_observation_01_crowd_before_scream_i3`
- `active_haki_observation_01_crowd_before_scream_i4`
- `active_haki_observation_01_crowd_before_scream_i5`
- `active_haki_observation_01_laughter_with_edge_i1`
- `active_haki_observation_01_laughter_with_edge_i2`
- `active_haki_observation_01_laughter_with_edge_i3`
- `active_haki_observation_01_rigging_before_snap_i1`
- `active_haki_observation_01_rigging_before_snap_i2`
- `active_haki_observation_01_rigging_before_snap_i3`
- `active_haki_observation_01_forest_without_birds_i1`
- `active_haki_observation_01_forest_without_birds_i2`
- `active_haki_observation_01_forest_without_birds_i3`

## SCHEDULED_EVENT_IDS

- `active_haki_observation_01_after_victory_echo`
- `active_haki_observation_01_life_01_first_echo`
- `active_haki_observation_01_life_02_second_sleep`
- `active_haki_observation_01_life_03a_faces_without_eyes`
- `active_haki_observation_01_life_03b_count_breaths`
- `active_haki_observation_01_life_04a_door_before_knock`
- `active_haki_observation_01_life_04b_map_of_noise`
- `active_haki_observation_01_life_05_bell_daylight`
- `active_haki_observation_01_life_06_three_heartbeats`
- `active_haki_observation_01_life_07a_stranger_red`
- `active_haki_observation_01_life_07b_alley_echo`
- `active_haki_observation_01_life_08a_warning_arrives`
- `active_haki_observation_01_life_08b_echo_runs`
- `active_haki_observation_01_life_09a_hands_before_fall`
- `active_haki_observation_01_life_09b_nothing_there`
- `active_haki_observation_01_life_10_shore_stars`
- `active_haki_observation_01_life_11a_walk_surf`
- `active_haki_observation_01_life_11b_wake_still`
- `active_haki_observation_01_life_11c_count_waves`
- `active_haki_observation_01_life_12a_many_presences`
- `active_haki_observation_01_life_12b_room_awake`
- `active_haki_observation_01_life_12c_rule_without_prophecy`
- `active_haki_observation_01_life_13a_choose_signal`
- `active_haki_observation_01_life_13b_verify_presence`
- `active_haki_observation_01_life_13c_present_only`
- `active_haki_observation_01_life_14a_open_eyes`
- `active_haki_observation_01_life_14b_quiet_mind`
- `active_haki_observation_01_truth_after_lie`
- `active_haki_observation_01_watcher_returns`

## COVERAGE

- Root DiceCheck : **10/20**.
- Roots initiant du Scheduled : **4/20**.
- Signature Immediate : **1 × d5**.
- Secondary Immediate : **3 × d3**.
- Lifetime : **26 Scheduled**, longest path **14**, **3** divergences.
- D20 utilisés : `observation`, `agility`, `intelligence`, `charisma`, `navigation`.
- Traits acquis : None.
- Nouveaux NPC/Items/Flags/Locations/Ships/Fruits : None.
- Conqueror : hors scope.

## PERSISTENT_IDS_USED

- Haki : `observation`.
- Stats : `observation`, `intelligence`, `morale` et Stats contextuelles listées ci-dessus.
- Aucun nouvel ID persistant.

## DEPENDENCIES

Runtime actuel `CONTENT_SCHEMA_VERSION = 6` avec :
- `hakiSourceTotalAtLeast`
- `hakiIsAwakened`
- `hakiAtLeast`
- `awakenHaki`
- `scheduleEvent`
- `queueImmediateEvent`
- `modifyStat`
- `modifyHealth`

## TRAVEL_COVERAGE

None. Le batch ne déplace jamais le joueur et n'utilise pas `recoverTravel`.

## TIMELINE_CANON

Contenu original/périphérique. Aucun grand personnage canon requis, aucune issue canon majeure modifiée. La phase Active commence à 15 ans ; les scènes restent géographiquement génériques ou limitées par tags/état mer-terre lorsqu'indiqué.

## DEDUP_NOTES

Le ledger courant ne contient pas de batch Haki dédié accepté. Les prémisses utilisent le Haki comme différence mécanique et narrative réelle plutôt qu'un reskin : perception/intention/présence pour Observation, résistance/contact/discipline de l'impact pour Armement. Les mini-arcs et la Lifetime sont propres à ce batch.

## DESIGN_NOTE

La seconde mention « Armement » dans la demande utilisateur est interprétée ici comme « Observation », afin de respecter l'autre contrainte explicite : Armement = trame Scheduled de combats ; Observation = visions et quête spirituelle.
