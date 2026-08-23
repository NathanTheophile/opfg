# ACTIVE_HAKI_ARMAMENT_01

**Batch ID:** `ACTIVE_HAKI_ARMAMENT_01`  
**Scope:** Active — Haki de l'Armement : éveil, usage situationnel et maîtrise narrative.  
**Format:** V4.1 BREADTH standard.  
**Roots Normal:** 20.

Les 20 roots restent résolvables sans Haki. Les Choices Haki sont visibles mais désactivées via `availableIf` tant que le pouvoir manque. Lorsqu'un Dice ordinaire est difficile (14), la voie Haki correspondante utilise typiquement 8 ou fournit une conséquence déterministe plus favorable. L'éveil `0 → 1` n'est proposé que dans des scènes significatives et exige `hakiSourceTotalAtLeast(armament, 75)`.

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `active_haki_armament_01_dockside_crushing_circle` | `dockside_crushing_circle` | 15+ | Terre + port |
| `active_haki_armament_01_blade_forearm` | `protect_against_blade` | 15+ | Active flexible |
| `active_haki_armament_01_collapsing_cart` | `hold_collapsing_load` | 15+ | Active flexible |
| `active_haki_armament_01_three_strikes_duel` | `three_strikes_duel` | 15+ | Active flexible |
| `active_haki_armament_01_black_knot_challenge` | `black_knot_challenge` | 15+ | Active flexible |
| `active_haki_armament_01_broken_table` | `tavern_brawl_control` | 15+ | Active flexible |
| `active_haki_armament_01_bandit_gate` | `bandit_gate_hold` | 15+ | Active flexible |
| `active_haki_armament_01_boar_charge` | `boar_charge` | 15+ | Active flexible |
| `active_haki_armament_01_chain_wrist` | `chain_wrist_escape` | 15+ | Active flexible |
| `active_haki_armament_01_body_as_shield` | `body_as_shield` | 15+ | Active flexible |
| `active_haki_armament_01_stone_wall_training` | `impact_training_wall` | 15+ | Active flexible |
| `active_haki_armament_01_rope_bridge_brawl` | `rope_bridge_brawl` | 15+ | Active flexible |
| `active_haki_armament_01_breakout_intercept` | `breakout_intercept` | 15+ | Active flexible |
| `active_haki_armament_01_market_extortion` | `market_extortion` | 15+ | Terre + trade |
| `active_haki_armament_01_heavy_hands_spar` | `heavy_hands_spar` | 15+ | Active flexible |
| `active_haki_armament_01_boarders_at_mast` | `boarders_at_mast` | 15+ | Mer + navire |
| `active_haki_armament_01_burning_beam` | `burning_beam_rescue` | 15+ | Active flexible |
| `active_haki_armament_01_take_the_hit` | `chosen_impact` | 15+ | Active flexible |
| `active_haki_armament_01_cracked_weapon` | `weapon_breaks_on_guard` | 15+ | Active flexible |
| `active_haki_armament_01_last_one_standing` | `endurance_without_cruelty` | 15+ | Active flexible |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `active_haki_armament_01_dockside_crushing_circle`  
**arcKey:** `active_haki_armament_01_dockside_crushing_circle_arc`  
**Maximum reachable Immediate depth:** **5**  
**Premise:** Une dispute de quai dégénère et plusieurs adversaires ferment l'espace autour de toi. Tu peux encore éviter que la scène devienne une défaite brutale, mais plus en restant immobile.

## SECONDARY_IMMEDIATE_ARCS

- `active_haki_armament_01_blade_forearm` — **arcKey:** `active_haki_armament_01_blade_forearm_arc` — **depth 3** — Une lame courte apparaît dans une altercation qui pouvait encore se calmer. Une personne derrière toi n'a pas vu le danger.
- `active_haki_armament_01_collapsing_cart` — **arcKey:** `active_haki_armament_01_collapsing_cart_arc` — **depth 3** — Un chargement lourd part de travers au-dessus de plusieurs personnes. Il reste un instant pour retenir, dévier ou faire évacuer.
- `active_haki_armament_01_three_strikes_duel` — **arcKey:** `active_haki_armament_01_three_strikes_duel_arc` — **depth 3** — Un duel improvisé commence sous des règles simples : pas de mise à mort, pas de poursuite après abandon, mais chacun veut savoir qui cèdera en premier.

## LIFETIME_THREADS

### active_haki_armament_01_black_knot_challenge — the_black_knot_fights

**Ancre durable:** le symbole du Nœud Noir et une suite d'adversaires liés à la même petite structure d'extorsion et de défis  
**Longest reachable Scheduled depth:** **14**  
**Total distinct reachable Scheduled EventDefinitions:** **26**  
**Vrais points de divergence long-terme:** **3**  
**Topologie:** `strongly_branching`  
**Span visé:** environ **10–12 ans** de carrière Active sur le chemin le plus long.

Trame Scheduled de combats : défis, embuscades, duels, protection de civils, poursuite, combat en infériorité numérique et confrontation finale. Les affrontements suivent une histoire commune et changent d'objectif selon les branches ; ils ne sont pas une simple succession de jets de Force.

La thread est verticale : chaque chapitre ne programme que son successeur direct. Les trois splits restent distincts pendant plusieurs chapitres avant reconvergence ou terminaison. Elle ne dépend d'aucun ArcState/questState/flag.

## HAKI_COVERAGE

- Source d'éveil : `strength + agility >= 75`.
- Éveil via `awakenHaki(armament)` seulement.
- Roots avec opportunité explicite d'éveil : `active_haki_armament_01_dockside_crushing_circle`, `active_haki_armament_01_black_knot_challenge`, `active_haki_armament_01_boar_charge`, `active_haki_armament_01_stone_wall_training`, `active_haki_armament_01_take_the_hit`.
- Haki déjà éveillé : Choices `hakiAtLeast(armament, 1)` sur tous les roots et tout au long des structures longues.
- Aucun Effect n'incrémente directement les niveaux 2–5 : la synchronisation runtime existante 80/85/90/95 reste autoritaire.
- Aucun changement de seuil ni de balance globale.

## ROOT_EVENT_IDS

- `active_haki_armament_01_dockside_crushing_circle`
- `active_haki_armament_01_blade_forearm`
- `active_haki_armament_01_collapsing_cart`
- `active_haki_armament_01_three_strikes_duel`
- `active_haki_armament_01_black_knot_challenge`
- `active_haki_armament_01_broken_table`
- `active_haki_armament_01_bandit_gate`
- `active_haki_armament_01_boar_charge`
- `active_haki_armament_01_chain_wrist`
- `active_haki_armament_01_body_as_shield`
- `active_haki_armament_01_stone_wall_training`
- `active_haki_armament_01_rope_bridge_brawl`
- `active_haki_armament_01_breakout_intercept`
- `active_haki_armament_01_market_extortion`
- `active_haki_armament_01_heavy_hands_spar`
- `active_haki_armament_01_boarders_at_mast`
- `active_haki_armament_01_burning_beam`
- `active_haki_armament_01_take_the_hit`
- `active_haki_armament_01_cracked_weapon`
- `active_haki_armament_01_last_one_standing`

## IMMEDIATE_EVENT_IDS

- `active_haki_armament_01_dockside_crushing_circle_i1`
- `active_haki_armament_01_dockside_crushing_circle_i2`
- `active_haki_armament_01_dockside_crushing_circle_i3`
- `active_haki_armament_01_dockside_crushing_circle_i4`
- `active_haki_armament_01_dockside_crushing_circle_i5`
- `active_haki_armament_01_blade_forearm_i1`
- `active_haki_armament_01_blade_forearm_i2`
- `active_haki_armament_01_blade_forearm_i3`
- `active_haki_armament_01_collapsing_cart_i1`
- `active_haki_armament_01_collapsing_cart_i2`
- `active_haki_armament_01_collapsing_cart_i3`
- `active_haki_armament_01_three_strikes_duel_i1`
- `active_haki_armament_01_three_strikes_duel_i2`
- `active_haki_armament_01_three_strikes_duel_i3`

## SCHEDULED_EVENT_IDS

- `active_haki_armament_01_boar_tracks_return`
- `active_haki_armament_01_intercept_aftermath`
- `active_haki_armament_01_life_01_knot_returns`
- `active_haki_armament_01_life_02_first_measure`
- `active_haki_armament_01_life_03a_bruiser_gate`
- `active_haki_armament_01_life_03b_protectors_test`
- `active_haki_armament_01_life_04a_stone_yard`
- `active_haki_armament_01_life_04b_warehouse_rescue`
- `active_haki_armament_01_life_05_mark_crate`
- `active_haki_armament_01_life_06_road_ambush`
- `active_haki_armament_01_life_07a_chase_enforcer`
- `active_haki_armament_01_life_07b_hold_crossroads`
- `active_haki_armament_01_life_08a_bridge_duel`
- `active_haki_armament_01_life_08b_three_attackers`
- `active_haki_armament_01_life_09a_wounded_rival`
- `active_haki_armament_01_life_09b_civilians_behind`
- `active_haki_armament_01_life_10_master_knots`
- `active_haki_armament_01_life_11a_accept_duel`
- `active_haki_armament_01_life_11b_break_ring`
- `active_haki_armament_01_life_11c_guard_exit`
- `active_haki_armament_01_life_12a_contact_control`
- `active_haki_armament_01_life_12b_split_group`
- `active_haki_armament_01_life_12c_hold_line`
- `active_haki_armament_01_life_13a_final_exchange`
- `active_haki_armament_01_life_13b_choice_of_force`
- `active_haki_armament_01_life_13c_empty_stage`
- `active_haki_armament_01_life_14a_knot_broken`
- `active_haki_armament_01_life_14b_knot_changed`
- `active_haki_armament_01_sparring_apology`

## COVERAGE

- Root DiceCheck : **10/20**.
- Roots initiant du Scheduled : **4/20**.
- Signature Immediate : **1 × d5**.
- Secondary Immediate : **3 × d3**.
- Lifetime : **26 Scheduled**, longest path **14**, **3** divergences.
- D20 utilisés : `strength`, `agility`, `morale`, `observation`, `charisma`.
- Traits acquis : None.
- Nouveaux NPC/Items/Flags/Locations/Ships/Fruits : None.
- Conqueror : hors scope.

## PERSISTENT_IDS_USED

- Haki : `armament`.
- Stats : `strength`, `agility`, `morale` et Stats contextuelles listées ci-dessus.
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

La Lifetime Armement suit explicitement la contrainte demandée : une trame narrative de rencontres et d'affrontements variés. L'Armement facilite les contacts critiques, mais chaque chapitre reste résolvable sans Haki.
