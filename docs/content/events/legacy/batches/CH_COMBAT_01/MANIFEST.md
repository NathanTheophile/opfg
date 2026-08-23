# CH_COMBAT_01 — MANIFEST

- **Batch ID:** `CH_COMBAT_01`
- **Prefix:** `ch_combat_01`
- **Scope:** Childhood — confrontation, entraînement, courage physique, protection, poursuite et apprentissage du danger.
- **Content Schema authority:** `CONTENT_SCHEMA_VERSION = 6`.
- **Persistent definitions proposed:** None.

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `ch_combat_01_playfight_red_line` | `playfightRedLine` | 5–8 ans | générique — jeu de contact qui dépasse sa limite |
| `ch_combat_01_younger_in_the_ring` | `youngerInTheRing` | 7–8 ans | générique — défense d’un plus jeune encerclé |
| `ch_combat_01_loose_dog_charge` | `looseDogCharge` | 6–8 ans | générique — chien affolé en liberté |
| `ch_combat_01_sand_circle_grapple` | `sandCircleGrapple` | 6–8 ans | générique — lutte contrôlée au sol |
| `ch_combat_01_low_wall_balance` | `lowWallBalancePressure` | 5–8 ans | générique — équilibre sous bousculade |
| `ch_combat_01_mirror_step_drill` | `mirrorStepDrill` | 7–8 ans | générique — exercice de déplacements en miroir |
| `ch_combat_01_cloth_tail_chase` | `clothTailChase` | 4–7 ans | générique — course-poursuite de jeu avec collisions |
| `ch_combat_01_stolen_bundle_chase` | `stolenBundleChase` | 9–11 ans | service `trade` — poursuite d’un jeune voleur |
| `ch_combat_01_three_against_one` | `threeAgainstOne` | 10–12 ans | générique — intimidation de groupe / défense |
| `ch_combat_01_hill_sprint_rival` | `hillSprintRival` | 9–11 ans | générique — course en pente et rivalité sportive |
| `ch_combat_01_breakfall_lesson` | `breakfallLesson` | 9–11 ans | générique — apprentissage de chute contrôlée |
| `ch_combat_01_tide_pull_rescue` | `tidePullRescue` | 10–13 ans | tag `coastal` — sauvetage dans le ressac |
| `ch_combat_01_market_escape` | `marketEscapeTogether` | 10–13 ans | service `trade` — fuite en protégeant un camarade |
| `ch_combat_01_tool_flash` | `toolFlashDeescalation` | 12–14 ans | générique — outil brandi dans une dispute |
| `ch_combat_01_cart_raid` | `cartRaidDefense` | 12–14 ans | générique — petite attaque périphérique de bandits |
| `ch_combat_01_dockside_pirate_scramble` | `docksidePirateScramble` | 13–14 ans | tag `coastal` — intrusion de jeunes pirates |
| `ch_combat_01_throwing_line_drill` | `throwingLineDrill` | 10–13 ans | générique — exercice d’esquive avec projectiles souples |
| `ch_combat_01_doorway_hold` | `doorwayHoldEvacuation` | 11–14 ans | générique — tenir un seuil pour évacuer des plus jeunes |
| `ch_combat_01_too_many_to_fight` | `tooManyToFight` | 12–14 ans | générique — fuite rationnelle face à trois adultes armés |
| `ch_combat_01_rival_line_seed` | `rivalLineSeed` | 9–11 ans | générique — seed de rivalité physique longue |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `ch_combat_01_cart_raid`

**arcKey:** `cartRaidDefense`

**Maximum reachable Immediate depth:** **5**

**Premise:** Une petite attaque de jeunes bandits autour d’un chariot évolue en cinq beats continus : stabiliser le véhicule, gérer le sac arraché, exploiter le terrain, empêcher l’escalade à l’arrivée d’un adulte, puis choisir ce que signifie réellement « gagner ».

## SECONDARY_IMMEDIATE_ARCS

- ch_combat_01_loose_dog_charge — **arcKey:** looseDogEscape — **depth 3** — Un chien affolé change de cible, se retrouve acculé, puis la scène se résout autour de l’espace, de la peur et des blessés plutôt que d’un affrontement contre l’animal.
- ch_combat_01_stolen_bundle_chase — **arcKey:** stolenBundlePursuit — **depth 3** — Une poursuite passe par lecture d’itinéraire, contact sur une manche puis récupération du paquet sans transformer l’interception en tabassage.
- ch_combat_01_tool_flash — **arcKey:** toolFlashDeescalation — **depth 3** — Un outil brandi frappe le mur, un adulte veut intervenir trop vite, puis le désarmement ouvre un choix entre vengeance, retrait et récit factuel.

## LIFETIME_THREADS

### ch_combat_01_rival_line_seed — rivalAcrossYears

**Ancre durable:** Rival anonyme de l’enfance + méthode de confrontation construite par History et le graphe Scheduled ; aucune `NpcDefinition`, aucun Flag, aucun Item ni état de thread nouveau.

**Longest reachable Scheduled depth:** **14**

**Total distinct reachable Scheduled EventDefinitions:** **27**

**Vrais points de divergence long-terme:** **3** — S03 sépare domination / maîtrise / protection sur trois chapitres avant reconvergence ; S08 sépare protection / évitement intelligent sur trois chapitres avant reconvergence ; S12 crée trois branches terminales respect / compétition / responsabilité sur deux chapitres chacune, sans reconvergence.

**Topologie:** `strongly_branching` — deux splits multi-chapitres avec reconvergence tardive après conséquences différentes, puis split terminal persistant.

**Span visé:** seed entre 9 et 11 ans ; trois rendez-vous physiques séparés se produisent encore pendant Childhood (S01, S04x, S07), puis la trame passe à des nouvelles, transmissions et choix de méthode compatibles avec la mobilité Active. Longest path ≈ 13–14 ans calendaires après le seed.

Rendez-vous physiques Scheduled : `s01_first_measure` → Immediate d2 ; `s04a/s04b/s04c` → Immediate d2 selon la première divergence ; `s07_second_measure` → Immediate d3. La thread est verticale : chaque chapitre ne programme que son successeur direct ou le premier node de sa branche.

## COMBAT_COVERAGE

| Root ID | Type de confrontation | Âge | Profondeur Immediate max | Stats/Dice principaux | Risques PV / Moral | Gains physiques possibles |
|---|---|---:|---:|---|---|---|
| `ch_combat_01_playfight_red_line` | bagarre de jeu / désescalade | 5–8 ans | 2 | — | PV -1 ; Moral ±1 | Observation +1 ; Force/Agilité via arc |
| `ch_combat_01_younger_in_the_ring` | défense d’un plus jeune | 7–8 ans | 2 | — | Moral +1 | Force/Agilité/Observation +1 |
| `ch_combat_01_loose_dog_charge` | menace animale / protection | 6–8 ans | 3 | Agilité d11 | PV -2/-3 ; Moral ±1 | Agilité +1/+2 ; Observation +1 |
| `ch_combat_01_sand_circle_grapple` | lutte contrôlée | 6–8 ans | 2 | Force d11 | PV -2 | Force +1/+2 ; Agilité/Observation +1 |
| `ch_combat_01_low_wall_balance` | équilibre sous contact | 5–8 ans | 2 | Agilité d11 | PV -2 ; Moral ±1 | Agilité +1/+2 ; Observation +1 |
| `ch_combat_01_mirror_step_drill` | entraînement de déplacement | 7–8 ans | 2 | Observation d11 | PV -1 | Observation +1/+2 ; Agilité +1 |
| `ch_combat_01_cloth_tail_chase` | course-poursuite de jeu | 4–7 ans | 2 | — | PV -1 ; Moral +1 | Agilité/Observation/Force +1 |
| `ch_combat_01_stolen_bundle_chase` | poursuite / interception | 9–11 ans | 3 | Agilité d14 | PV -1/-3 ; Moral -1 | Agilité +1/+2 ; Observation +1 |
| `ch_combat_01_three_against_one` | intimidation / défense active | 10–12 ans | 2 | Moral d11 | PV -2 ; Moral ±1/+2 | Agilité/Force/Observation +1 |
| `ch_combat_01_hill_sprint_rival` | course compétitive | 9–11 ans | 2 | Agilité d14 | PV -2 ; Moral ±1 | Agilité +1/+2 ; Observation +1 |
| `ch_combat_01_breakfall_lesson` | entraînement à la chute | 9–11 ans | 2 | Agilité d11 | PV -1/-2 | Agilité +1/+2 ; Observation/Force +1 |
| `ch_combat_01_tide_pull_rescue` | sauvetage côtier | 10–13 ans | 2 | Force d14 | PV -1/-4 ; Moral ±1 | Force +1/+2 ; Observation/Agilité +1 |
| `ch_combat_01_market_escape` | fuite sous poursuite / protection | 10–13 ans | 2 | Agilité d14 | PV -3 ; Moral ±1 | Agilité +1/+2 ; Observation/Force +1 |
| `ch_combat_01_tool_flash` | désescalade face à outil brandi | 12–14 ans | 3 | Observation d14 | PV -2/-4 ; Moral ±1 | Observation +1/+2 ; Force +1 |
| `ch_combat_01_cart_raid` | défense locale contre jeunes bandits | 12–14 ans | 5 | Force d14 | PV -1/-4 ; Moral ±1 | Force +1/+2 ; Observation +1 |
| `ch_combat_01_dockside_pirate_scramble` | intrusion / retraite de jeunes pirates | 13–14 ans | 2 | — | Moral +1 | Agilité/Force/Observation +1 |
| `ch_combat_01_throwing_line_drill` | entraînement esquive/lecture | 10–13 ans | 2 | — | Moral +1 | Agilité/Observation +1 |
| `ch_combat_01_doorway_hold` | défense d’un seuil / évacuation | 11–14 ans | 2 | — | Moral +1 | Force/Observation +1 |
| `ch_combat_01_too_many_to_fight` | évitement intelligent d’adultes dangereux | 12–14 ans | 2 | — | PV -4 ; Moral ±1 | Observation/Agilité +1 |
| `ch_combat_01_rival_line_seed` | rivalité physique contrôlée | 9–11 ans | 2 | Immediate Force d11 | PV -1 ; Moral ±1 | Force/Agilité/Observation +1/+2 |

## ROOT_EVENT_IDS

- `ch_combat_01_breakfall_lesson`
- `ch_combat_01_cart_raid`
- `ch_combat_01_cloth_tail_chase`
- `ch_combat_01_dockside_pirate_scramble`
- `ch_combat_01_doorway_hold`
- `ch_combat_01_hill_sprint_rival`
- `ch_combat_01_loose_dog_charge`
- `ch_combat_01_low_wall_balance`
- `ch_combat_01_market_escape`
- `ch_combat_01_mirror_step_drill`
- `ch_combat_01_playfight_red_line`
- `ch_combat_01_rival_line_seed`
- `ch_combat_01_sand_circle_grapple`
- `ch_combat_01_stolen_bundle_chase`
- `ch_combat_01_three_against_one`
- `ch_combat_01_throwing_line_drill`
- `ch_combat_01_tide_pull_rescue`
- `ch_combat_01_too_many_to_fight`
- `ch_combat_01_tool_flash`
- `ch_combat_01_younger_in_the_ring`

## IMMEDIATE_EVENT_IDS

- `ch_combat_01_breakfall_lesson_i1`
- `ch_combat_01_breakfall_lesson_i2`
- `ch_combat_01_cart_raid_i1`
- `ch_combat_01_cart_raid_i2`
- `ch_combat_01_cart_raid_i3`
- `ch_combat_01_cart_raid_i4`
- `ch_combat_01_cart_raid_i5`
- `ch_combat_01_cloth_tail_chase_i1`
- `ch_combat_01_cloth_tail_chase_i2`
- `ch_combat_01_dockside_pirate_scramble_i1`
- `ch_combat_01_dockside_pirate_scramble_i2`
- `ch_combat_01_doorway_hold_i1`
- `ch_combat_01_doorway_hold_i2`
- `ch_combat_01_hill_sprint_rival_i1`
- `ch_combat_01_hill_sprint_rival_i2`
- `ch_combat_01_loose_dog_charge_i1`
- `ch_combat_01_loose_dog_charge_i2`
- `ch_combat_01_loose_dog_charge_i3`
- `ch_combat_01_low_wall_balance_i1`
- `ch_combat_01_low_wall_balance_i2`
- `ch_combat_01_market_escape_i1`
- `ch_combat_01_market_escape_i2`
- `ch_combat_01_mirror_step_drill_i1`
- `ch_combat_01_mirror_step_drill_i2`
- `ch_combat_01_playfight_red_line_i1`
- `ch_combat_01_playfight_red_line_i2`
- `ch_combat_01_rival_line_seed_i1`
- `ch_combat_01_rival_line_seed_i2`
- `ch_combat_01_rival_thread_s01_first_measure_i1`
- `ch_combat_01_rival_thread_s01_first_measure_i2`
- `ch_combat_01_rival_thread_s04a_domination_match_i1`
- `ch_combat_01_rival_thread_s04a_domination_match_i2`
- `ch_combat_01_rival_thread_s04b_mastery_drill_i1`
- `ch_combat_01_rival_thread_s04b_mastery_drill_i2`
- `ch_combat_01_rival_thread_s04c_protection_match_i1`
- `ch_combat_01_rival_thread_s04c_protection_match_i2`
- `ch_combat_01_rival_thread_s07_second_measure_i1`
- `ch_combat_01_rival_thread_s07_second_measure_i2`
- `ch_combat_01_rival_thread_s07_second_measure_i3`
- `ch_combat_01_sand_circle_grapple_i1`
- `ch_combat_01_sand_circle_grapple_i2`
- `ch_combat_01_stolen_bundle_chase_i1`
- `ch_combat_01_stolen_bundle_chase_i2`
- `ch_combat_01_stolen_bundle_chase_i3`
- `ch_combat_01_three_against_one_i1`
- `ch_combat_01_three_against_one_i2`
- `ch_combat_01_throwing_line_drill_i1`
- `ch_combat_01_throwing_line_drill_i2`
- `ch_combat_01_tide_pull_rescue_i1`
- `ch_combat_01_tide_pull_rescue_i2`
- `ch_combat_01_too_many_to_fight_i1`
- `ch_combat_01_too_many_to_fight_i2`
- `ch_combat_01_tool_flash_i1`
- `ch_combat_01_tool_flash_i2`
- `ch_combat_01_tool_flash_i3`
- `ch_combat_01_younger_in_the_ring_i1`
- `ch_combat_01_younger_in_the_ring_i2`

## SCHEDULED_EVENT_IDS

- `ch_combat_01_breakfall_lesson_return`
- `ch_combat_01_playfight_red_line_echo`
- `ch_combat_01_rival_thread_s01_first_measure`
- `ch_combat_01_rival_thread_s02_compare_notes`
- `ch_combat_01_rival_thread_s03_choose_method`
- `ch_combat_01_rival_thread_s04a_domination_match`
- `ch_combat_01_rival_thread_s04b_mastery_drill`
- `ch_combat_01_rival_thread_s04c_protection_match`
- `ch_combat_01_rival_thread_s05a_pressure_habit`
- `ch_combat_01_rival_thread_s05b_slow_practice`
- `ch_combat_01_rival_thread_s05c_guarding_space`
- `ch_combat_01_rival_thread_s06a_cost_of_winning`
- `ch_combat_01_rival_thread_s06b_read_before_move`
- `ch_combat_01_rival_thread_s06c_shared_rule`
- `ch_combat_01_rival_thread_s07_second_measure`
- `ch_combat_01_rival_thread_s08_message_from_afar`
- `ch_combat_01_rival_thread_s09e_intelligent_avoidance`
- `ch_combat_01_rival_thread_s09p_protective_example`
- `ch_combat_01_rival_thread_s10e_refuse_bad_fight`
- `ch_combat_01_rival_thread_s10p_teach_someone`
- `ch_combat_01_rival_thread_s11e_choose_ground`
- `ch_combat_01_rival_thread_s11p_responsibility_cost`
- `ch_combat_01_rival_thread_s12_what_rivalry_became`
- `ch_combat_01_rival_thread_s13c_keep_the_score`
- `ch_combat_01_rival_thread_s13d_take_responsibility`
- `ch_combat_01_rival_thread_s13r_respect_without_score`
- `ch_combat_01_rival_thread_s14c_competition_legacy`
- `ch_combat_01_rival_thread_s14d_protection_legacy`
- `ch_combat_01_rival_thread_s14r_respect_legacy`
- `ch_combat_01_tide_pull_rescue_return`
- `ch_combat_01_too_many_to_fight_return`

## PERSISTENT_IDS_USED

- **Traits:** `competitive`, `protective`, `resilient`, `resourceful`.
- **Stats:** `strength`, `agility`, `observation`, `morale`; `health` uniquement via `modifyHealth`, jamais comme `statId` de DiceCheck.
- **Location metadata:** tags `coastal`; service `trade`.
- **NPC / Items / Flags / Ships / Fruits / Haki / Career IDs:** aucun.

## DEPENDENCIES

- `GAME_DESIGN.md`, `CONTENT_BIBLE.md`, `TRAITS_CATALOG.md`, `EVENT_AUTHORING_RULES.md`, `EVENT_CONCEPT_INDEX.md`, `WORLD_TIMELINE_AND_CANON.md`, World V1, schema content v6 et localisation FR.
- Aucune dépendance à un autre batch pour rendre les 20 roots éligibles ou résolvables.
- Les Scheduled de Lifetime s’appuient uniquement sur leur programmation verticale et History implicite de la branche atteinte.

## TIMELINE_CANON

- Roots limités à Childhood, 4–14 ans ; aucune Career Active, prime, grade, Haki, Fruit, navire personnel ou protagoniste canon.
- Les armes/outils improvisés restent purement textuels et ne deviennent jamais des Items persistants.
- La Lifetime peut traverser Childhood → Active, mais ses chapitres postérieurs utilisent messages, récits rapportés et transmission de méthode afin de ne pas téléporter le rival à travers le monde.

## DICE_STATS_TRAITS_LOCATIONS

- **Roots avec DiceCheck:** 12/20 (cible 10–12).
- **Seuils utilisés:** 11 et 14 uniquement.
- **Dice outcomes:** exactement `criticalFailure`, `failure`, `success`, `criticalSuccess` sur chaque DiceCheck.
- **Progression physique:** plus de 10 roots peuvent augmenter `strength`, `agility` ou `observation`; les gains sont en majorité +1, +2 réservé aux réussites critiques ou caps narratifs.
- **Santé:** 12+ roots ont un risque crédible de `modifyHealth` négatif dans leur scène ; dégâts ordinaires -1 à -3, avec -4 réservé aux situations clairement dangereuses (ressac, outil brandi, bandits/adultes armés).
- **Moral:** 10+ roots peuvent modifier `morale` positivement ou négativement.
- **Birth coverage géographique:** `coastal` est présent sur 28/32 Birth Locations ; le service `trade` sur 30/32. Les 15 autres roots ne dépendent d’aucune géographie spécifique, ce qui maintient une couverture large dans les quatre Blues.

## DEDUP_NOTES

- `looseDogCharge` n’est pas un reskin de `barking_dog` : ici le chien est libre, le contact et la poursuite commencent réellement, le joueur doit gérer changement de cible, espace de fuite et animal acculé sur un arc d3.
- `stolenBundleChase` se distingue de `puppetCaseGuard` : la prémisse centrale est une poursuite physique et une interception sans punition, pas la garde d’un bien lors d’un spectacle ni une diversion de foule.
- `playfightRedLine` se distingue de `rules_of_game` : la scène commence après le franchissement corporel d’une limite et traite retenue, sortie du contact et réparation, pas une dispute abstraite de règles.
- `rivalAcrossYears` ne duplique aucune Lifetime acceptée : elle suit une rivalité corporelle anonyme qui évolue vers domination, maîtrise, protection ou évitement, avec trois mini-arcs physiques séparés puis transmission à distance ; aucune thread existante n’utilise cette progression relationnelle/combat.
- Aucun root ne reprend les incidents de manutention, signaux météo, atlas, registre familial, chaîne de faveurs, carnet collectif ou autres anchors déjà indexés.

## D1 RENOVATION — 2026-08-11

The former anonymous `rivalAcrossYears` rival is now the persistent role NPC `childhood_rival`, with a seeded display name per run. `childhood_younger` and `childhood_friend` anchor selected protection/escape scenes. Thread topology, IDs, delays and branch structure are preserved.
