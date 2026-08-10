# CH_GENERIC_EARLY_01 — MANIFEST

## Batch ID et scope

- **Batch ID:** `CH_GENERIC_EARLY_01`
- **Préfixe:** `ch_generic_early_01`
- **Scope:** 20 root Events Childhood centrés sur ~1–8 ans, conçus pour être très réutilisables dans East/West/North/South Blue.
- **Domaines couverts:** premières peurs et prises de risque, jeux d’enfants, curiosité, voisinage, petits accidents, petites responsabilités, animaux/nature, disputes/réconciliations, imitation des adultes et premières manifestations de tempérament.
- **Source locale:** français.
- **Repo:** aucune modification, aucun patch, aucun commit.

## ROOT EVENT IDS — exactement 20

- `ch_generic_early_01_night_scratching`
- `ch_generic_early_01_runaway_ball`
- `ch_generic_early_01_borrowed_broom`
- `ch_generic_early_01_rules_of_game`
- `ch_generic_early_01_three_breaths`
- `ch_generic_early_01_ditch_jump`
- `ch_generic_early_01_fallen_nest`
- `ch_generic_early_01_crowded_corner`
- `ch_generic_early_01_storm_shutters`
- `ch_generic_early_01_tidepool_glint`
- `ch_generic_early_01_high_branch`
- `ch_generic_early_01_broken_pane`
- `ch_generic_early_01_spilled_bucket`
- `ch_generic_early_01_small_delivery`
- `ch_generic_early_01_barking_dog`
- `ch_generic_early_01_paper_boat_race`
- `ch_generic_early_01_pretend_shop`
- `ch_generic_early_01_chalk_marks`
- `ch_generic_early_01_lost_button`
- `ch_generic_early_01_after_the_fall`

## IMMEDIATE EVENTS

- `ch_generic_early_01_borrowed_broom_i1_dust_cloud`
- `ch_generic_early_01_borrowed_broom_i2_wobbling_stack`
- `ch_generic_early_01_borrowed_broom_i3_adult_returns`
- `ch_generic_early_01_night_scratching_i1_behind_cupboard`
- `ch_generic_early_01_night_scratching_i2_moving_crate`
- `ch_generic_early_01_night_scratching_i3_trapped_cat`
- `ch_generic_early_01_night_scratching_i4_cat_loose`
- `ch_generic_early_01_night_scratching_i5_explain_mess`
- `ch_generic_early_01_rules_of_game_i1_cheating_accusation`
- `ch_generic_early_01_rules_of_game_i2_someone_leaves`
- `ch_generic_early_01_rules_of_game_i3_new_rule`
- `ch_generic_early_01_runaway_ball_i1_under_cart`
- `ch_generic_early_01_runaway_ball_i2_cart_moves`
- `ch_generic_early_01_runaway_ball_i3_return_game`

## SCHEDULED EVENTS

- `ch_generic_early_01_broken_pane_scheduled_repair_day`
- `ch_generic_early_01_chalk_marks_scheduled_marks_return`
- `ch_generic_early_01_paper_boat_race_scheduled_rematch`
- `ch_generic_early_01_small_delivery_scheduled_trusted_again`
- `ch_generic_early_01_three_breaths_s01_first_return`
- `ch_generic_early_01_three_breaths_s02_lend_breath`
- `ch_generic_early_01_three_breaths_s03_who_owns_method`
- `ch_generic_early_01_three_breaths_s04a_shared_words`
- `ch_generic_early_01_three_breaths_s04b_private_test`
- `ch_generic_early_01_three_breaths_s05a_too_many_voices`
- `ch_generic_early_01_three_breaths_s05b_almost_secret`
- `ch_generic_early_01_three_breaths_s06a_used_by_another`
- `ch_generic_early_01_three_breaths_s06b_secret_weight`
- `ch_generic_early_01_three_breaths_s07_changed_meaning`
- `ch_generic_early_01_three_breaths_s08_storm_inside`
- `ch_generic_early_01_three_breaths_s09a_fear_as_compass`
- `ch_generic_early_01_three_breaths_s09b_room_to_retreat`
- `ch_generic_early_01_three_breaths_s10a_too_far_forward`
- `ch_generic_early_01_three_breaths_s10b_return_by_choice`
- `ch_generic_early_01_three_breaths_s11_teach_or_keep`
- `ch_generic_early_01_three_breaths_s12_when_breaths_fail`
- `ch_generic_early_01_three_breaths_s13_what_remains`
- `ch_generic_early_01_three_breaths_s14a_borrowed_courage`
- `ch_generic_early_01_three_breaths_s14b_silent_habit`

## ROOT REGISTER

| Root | conceptKey | Tranche d’âge | Contexte principal | Mécanique dominante | Traits/NPC/Items | Immediate | Scheduled |
|---|---|---|---|---|---|---|---|
| `ch_generic_early_01_night_scratching` | `night_scratching` | 3–7 ans | aucune contrainte; intérieur/foyer adaptable | Dice Observation; peur + enquête | — | Signature depth 5 | — |
| `ch_generic_early_01_runaway_ball` | `runaway_ball` | 4–7 ans | aucune contrainte; rue/voisinage | Dice Agilité; poursuite + sécurité | — | Secondary depth 3 | — |
| `ch_generic_early_01_borrowed_broom` | `borrowed_broom` | 4–8 ans | aucune contrainte; foyer/atelier adaptable | imitation adulte; résolution en Immediate | — | Secondary depth 3 | — |
| `ch_generic_early_01_rules_of_game` | `rules_of_game` | 5–8 ans | aucune contrainte; jeu de voisinage | Dice Charisme; dispute/réconciliation | — | Secondary depth 3 | — |
| `ch_generic_early_01_three_breaths` | `three_breaths` | 6–8 ans | aucune contrainte | Lifetime Thread; pratique personnelle face à la peur | — | — | 20-node Lifetime graph |
| `ch_generic_early_01_ditch_jump` | `ditch_jump` | 4–7 ans | aucune contrainte; extérieur adaptable | Dice Force; première prise de risque | — | — | — |
| `ch_generic_early_01_fallen_nest` | `fallen_nest` | 3–6 ans | aucune contrainte; nature de proximité | narratif; prudence autour d’animaux | — | — | — |
| `ch_generic_early_01_crowded_corner` | `crowded_corner` | 4–7 ans | `locationHasService(trade)` | Dice Moral; perte de repère dans une foule | — | — | — |
| `ch_generic_early_01_storm_shutters` | `storm_shutters` | 5–8 ans | aucune contrainte; météo locale | Dice Moral; petite responsabilité | — | — | — |
| `ch_generic_early_01_tidepool_glint` | `tidepool_glint` | 4–8 ans | `locationHasTag(coastal)` | Dice Observation; curiosité littorale | — | — | — |
| `ch_generic_early_01_high_branch` | `high_branch` | 5–8 ans | aucune contrainte; arbre/cour adaptable | Dice Agilité; récupération en hauteur | — | — | — |
| `ch_generic_early_01_broken_pane` | `broken_pane` | 5–8 ans | aucune contrainte; voisinage | responsabilité + Trait | `resourceful` | — | `ch_generic_early_01_broken_pane_scheduled_repair_day` |
| `ch_generic_early_01_spilled_bucket` | `spilled_bucket` | 4–7 ans | aucune contrainte; passage partagé | déterministe; assumer/nettoyer | — | — | — |
| `ch_generic_early_01_small_delivery` | `small_delivery` | 6–8 ans | aucune contrainte; trajet très proche | Dice Intelligence; petite responsabilité | — | — | `ch_generic_early_01_small_delivery_scheduled_trusted_again` |
| `ch_generic_early_01_barking_dog` | `barking_dog` | 3–6 ans | aucune contrainte; rue/chemin | narratif; peur animale | — | — | — |
| `ch_generic_early_01_paper_boat_race` | `paper_boat_race` | 5–8 ans | aucune contrainte; rigole/canal/eau de pluie | Dice Navigation + Trait | `competitive` | — | `ch_generic_early_01_paper_boat_race_scheduled_rematch` |
| `ch_generic_early_01_pretend_shop` | `pretend_shop` | 4–7 ans | aucune contrainte | narratif; imitation des adultes | — | — | — |
| `ch_generic_early_01_chalk_marks` | `chalk_marks` | 5–8 ans | aucune contrainte; rue/chemin | curiosité + callback Scheduled | — | — | `ch_generic_early_01_chalk_marks_scheduled_marks_return` |
| `ch_generic_early_01_lost_button` | `lost_button` | 3–6 ans | aucune contrainte; voisinage | petite enquête narrative | — | — | — |
| `ch_generic_early_01_after_the_fall` | `after_the_fall` | 3–7 ans | aucune contrainte; jeu/voisinage | secours + Trait | `protective` | — | — |

## IDs persistants existants utilisés

- **Traits acquis:** `resourceful`, `competitive`, `protective`.
- **NPC persistants:** aucun.
- **Items persistants:** aucun.
- **Locations exactes:** aucune (`locationIs` absent).
- **Location tags:** `coastal`.
- **Location services:** `trade`.
- **Ships / Devil Fruits / Haki / Career / rank / title / bounty:** aucun.
- **Flags:** aucun.

## PROPOSED_DEFINITIONS

`None`

## Dépendances

- Contrat `CONTENT_SCHEMA_VERSION = 6`.
- Catalogue V1 actuel des 28 Traits.
- World V1 / tags / services actuels.
- **Important:** le seed Lifetime de ce batch est limité à 6–8 ans pour respecter le scope `GENERIC_EARLY`. Il ne couvre donc pas à lui seul le checkpoint runtime `ageMonths >= 120`; la garantie de corpus doit être assurée par au moins un seed compatible dans un batch Childhood 10+ ans.

## Timeline / canon sensibles

- Tous les roots imposent `careerPhaseIs(childhood)` et `ageAtMostMonths <= 107`.
- Aucun personnage canon majeur, aucune organisation canon sensible, aucun résultat canon modifié.
- Aucun voyage Grand Line/New World, aucune acquisition de navire personnel, Haki ou Devil Fruit.
- La Lifetime Thread peut continuer après l’entrée en Active, mais reste indépendante de la carrière, de la géographie et d’un NPC récurrent.

## Résumé de couverture

- **DiceCheck roots:** 10.
- **Roots créant du Scheduled:** 5 au total, dont 4 hors Lifetime Thread.
- **Immediate Events:** 14.
- **Scheduled Events:** 24 au total, dont 20 dans la Lifetime Thread et 4 hors Lifetime.
- **Mini-arcs Immediate qualifiants:** 4 au total — 1 Signature + 3 Secondary.
- **Stats utilisées par les DiceCheck roots:** `observation`, `agility`, `charisma`, `strength`, `morale`, `intelligence`, `navigation`.
- **Traits acquis:** `resourceful`, `competitive`, `protective`.
- **Géographie:** majorité sans contrainte; seulement `locationHasService(trade)` et `locationHasTag(coastal)`.

## SIGNATURE_IMMEDIATE_ARCS

- **Root ID:** `ch_generic_early_01_night_scratching`
- **arcKey:** `night_scratching_mystery`
- **Profondeur Immediate maximale atteignable:** **5**
- **Prémisse:** un grattement nocturne devient une enquête continue qui révèle un jeune chat coincé, puis un petit chaos à gérer avant le matin.

## SECONDARY_IMMEDIATE_ARCS

- **Root ID:** `ch_generic_early_01_runaway_ball` — **arcKey:** `runaway_ball_recovery` — **depth:** 3 — une balle s’échappe sous une charrette; la scène enchaîne poursuite, récupération et retour au groupe.
- **Root ID:** `ch_generic_early_01_borrowed_broom` — **arcKey:** `borrowed_broom_mess` — **depth:** 3 — imitation d’un adulte, nuage de poussière, pile instable, puis explication du désordre.
- **Root ID:** `ch_generic_early_01_rules_of_game` — **arcKey:** `rules_dispute_repair` — **depth:** 3 — dispute sur les règles, accusation de triche, menace de départ et reconstruction du jeu.

## LIFETIME_THREADS

- **Seed root ID:** `ch_generic_early_01_three_breaths`
- **threadKey:** `three_breaths_life_practice`
- **`lifetimeThreadSeed: true`:** confirmé.
- **Ancre / NPC récurrent:** pratique personnelle « nommer la peur → trois respirations → choisir »; aucun NPC ou Item persistant.
- **Longest reachable Scheduled depth:** **14**.
- **Total distinct reachable Scheduled EventDefinitions:** **20**.
- **Vrais points de divergence long-terme:** **3**.
  1. `ch_generic_early_01_three_breaths_s03_who_owns_method`: partager → `ch_generic_early_01_three_breaths_s04a_shared_words`; garder privé → `ch_generic_early_01_three_breaths_s04b_private_test`; abandonner → fin anticipée. Les deux branches survivantes restent séparées pendant **3 Scheduled successifs** avant reconvergence.
  2. `ch_generic_early_01_three_breaths_s08_storm_inside`: Dice Moral/choix → avancer → `ch_generic_early_01_three_breaths_s09a_fear_as_compass`; recul choisi → `ch_generic_early_01_three_breaths_s09b_room_to_retreat`; rejet/critical failure → fin possible. Les branches survivantes restent séparées pendant **2 Scheduled successifs** avant reconvergence.
  3. `ch_generic_early_01_three_breaths_s13_what_remains`: transmettre → `ch_generic_early_01_three_breaths_s14a_borrowed_courage`; rendre privé → `ch_generic_early_01_three_breaths_s14b_silent_habit`; laisser derrière → fin.
- **Persistance / reconvergence:** split 1 persistant sur trois chapitres par branche avant `s07`; split 2 persistant sur deux chapitres avant `s11`; après reconvergence, des Choices conditionnelles `hasPlayed` rappellent la trajectoire vécue.
- **Branches de fin anticipée majeures:** au seed, à S3, à S7, à S8 et à S13.
- **Topologie:** `strongly_branching`.
- **Span temporel visé:** environ 14–18+ ans selon l’âge exact du seed et la branche, avec gaps de 12–24 mois.
- **Childhood → Active:** oui.
- **Verticalité:** le seed ne programme que S1; chaque Scheduled ne programme que la ou les conséquences directement issues du chapitre courant.

## DEDUP_NOTES

- `EVENT_CONCEPT_INDEX.md` est vide après le reset Lifetime Thread: aucun root, Signature Arc, Secondary Arc ou Lifetime Thread n’y est actuellement accepté.
- Les 20 prémisses sont distinctes entre elles: peur nocturne/enquête; balle sous charrette; imitation d’outil; conflit de règles; pratique durable face à la peur; saut d’obstacle; nid tombé; perte de repère dans une foule; aide pendant tempête; découverte littorale; récupération en hauteur; casse/réparation; nettoyage d’un accident; petite livraison; peur d’un chien; course de bateaux; boutique imaginaire; marques à la craie; recherche d’un petit objet; secours après une chute.
- Les quatre mini-arcs Immediate reposent sur quatre dynamiques différentes: enquête, mobilité/sécurité, cascade domestique, négociation sociale.
- La Lifetime Thread n’est ni une série de callbacks identiques ni un NPC téléporté: son sujet est une pratique personnelle qui change de sens, se partage ou se privatise, puis se transforme sur plusieurs années.
- Aucun axe réservé à `CH_FAMILY_SOCIAL_01`, `CH_IDENTITY_WORLD_01`, aux batches Blue ou à `CH_GENERIC_LATE_01` n’est utilisé comme prémisse centrale.

## Validation locale effectuée

- **58 Event JSON** parsés avec succès: 20 Normal + 14 Immediate + 24 Scheduled.
- Exactement 20 roots `kind: normal`.
- `lifetimeThreadSeed` présent sur un seul Event et uniquement sur `kind: normal`.
- Signature Immediate: depth 5 vérifiée par traversée de graphe.
- Secondary Immediate: 3 roots distincts depth 3 vérifiés.
- Lifetime: 20 Scheduled distincts réellement atteignables; profondeur max 14; 3 divergences; verticalité seed→S1 vérifiée.
- 10 DiceCheck roots; tous les DiceChecks possèdent `criticalFailure`, `failure`, `success`, `criticalSuccess`.
- Toutes les références `queueImmediateEvent` / `scheduleEvent` pointent vers un Event existant du bon kind.
- Toutes les localization keys référencées existent dans `localization/fr.json`; aucune clé générée ne préexistait dans le `fr.json` source.
- Vocabulaire Condition/Effect comparé au `schema.ts`: aucun type hors contrat.
- Aucun Flag, Item, NPC, Location exacte, Ship, Fruit, Haki ou Career ID nouveau.
- Les scripts du repository n’ont **pas** été exécutés; validation locale structurelle uniquement.
