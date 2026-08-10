# CH_EAST_BLUE_01 — MANIFEST
**Batch ID:** `CH_EAST_BLUE_01`  
**Préfixe:** `ch_east_blue_01`  
**Phase:** Childhood  
**Scope:** 20 roots contextualisés East Blue, environ 8 roots 1–8 ans et 12 roots 9–14 ans.  
**Content schema:** `CONTENT_SCHEMA_VERSION = 6`.
## ROOT_REGISTRY
| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `ch_east_blue_01_foosha_tide_barrels` | `fooshaTideBarrels` | 5–8 ans | `foosha_village` |
| `ch_east_blue_01_orange_gull_tokens` | `orangeGullTokens` | 6–8 ans | `orange_town` |
| `ch_east_blue_01_syrup_fog_bell` | `syrupFogBell` | 4–7 ans | `syrup_village` |
| `ch_east_blue_01_shells_drill_whistles` | `shellsDrillWhistles` | 6–8 ans | `shells_town` |
| `ch_east_blue_01_shimotsuki_rain_steps` | `shimotsukiRainSteps` | 7–8 ans | `shimotsuki_village` |
| `ch_east_blue_01_cocoyasi_irrigation_shell` | `cocoyasiIrrigationShell` | 6–8 ans | `cocoyasi_village` |
| `ch_east_blue_01_goa_arcade_echo` | `goaArcadeEcho` | 5–8 ans | `goa_capital` |
| `ch_east_blue_01_dawn_crossed_paths` | `dawnCrossedPaths` | 7–8 ans | `locationWithin(dawn_island)` |
| `ch_east_blue_01_loguetown_storm_signals` | `loguetownStormSignals` | 10–11 ans | `loguetown` |
| `ch_east_blue_01_loguetown_quay_numbers` | `loguetownQuayNumbers` | 13–14 ans | `loguetown` |
| `ch_east_blue_01_orange_cistern_roof` | `orangeCisternRoof` | 11–13 ans | `orange_town` |
| `ch_east_blue_01_syrup_hedge_cart` | `syrupHedgeCart` | 9–11 ans | `syrup_village` |
| `ch_east_blue_01_shells_runaway_target_cart` | `shellsRunawayTargetCart` | 11–13 ans | `shells_town` |
| `ch_east_blue_01_shimotsuki_bamboo_rack` | `shimotsukiBambooRack` | 10–12 ans | `shimotsuki_village` |
| `ch_east_blue_01_cocoyasi_backflow` | `cocoyasiBackflow` | 10–12 ans | `cocoyasi_village` |
| `ch_east_blue_01_goa_lantern_canopy` | `goaLanternCanopy` | 12–14 ans | `goa_capital` |
| `ch_east_blue_01_foosha_gangplank` | `fooshaGangplank` | 9–11 ans | `foosha_village` |
| `ch_east_blue_01_forest_boar_crossing` | `forestBoarCrossing` | 11–14 ans | `locationWithin(dawn_island)` — forêt locale |
| `ch_east_blue_01_goa_rotated_milestone` | `goaRotatedMilestone` | 12–14 ans | `locationWithin(goa_kingdom)` |
| `ch_east_blue_01_syrup_storm_shutters` | `syrupStormShutters` | 12–14 ans | `syrup_village` |

## SIGNATURE_IMMEDIATE_ARCS
**Root ID:** `ch_east_blue_01_shells_runaway_target_cart`  
**arcKey:** `runawayTargetCart`  
**Maximum reachable Immediate depth:** **5**  
**Premise:** À Shells Town, un chariot de cibles d’exercice échappe à la Marine et traverse successivement rue, étals puis quai ; chaque étape exige une nouvelle décision avant l’arrêt final.

## SECONDARY_IMMEDIATE_ARCS
- ch_east_blue_01_shimotsuki_bamboo_rack — **arcKey:** bambooRackRecovery — **depth 3** — À Shimotsuki Village, un râtelier renversé transforme une rafale en récupération, réparation puis remise en ordre de la cour.
- ch_east_blue_01_cocoyasi_backflow — **arcKey:** cocoyasiSaltBackflow — **depth 3** — À Cocoyasi, la marée remonte dans les rigoles et oblige à gérer successivement goulet, jeunes arbres puis rinçage après le grain.
- ch_east_blue_01_goa_lantern_canopy — **arcKey:** capitalCanopyGust — **depth 3** — À Goa Capital, une toile de fête prise par une bourrasque cède par étapes : crochet, allée puis hampe décorative.

## LIFETIME_THREADS
### ch_east_blue_01_loguetown_storm_signals — loguetownSignalLegacy

`lifetimeThreadSeed: true`

**Ancre durable:** le code de signaux météo/manœuvre né sur les quais de Loguetown ; aucun nouvel Item, Flag, NPC ou thread-state n’est créé, la continuité se reconstruit par History et par le graphe Scheduled.  
**Longest reachable Scheduled depth:** **15**  
**Total distinct reachable Scheduled EventDefinitions:** **24**  
**Vrais points de divergence long-terme:** **3**  
**Topologie:** `strongly_branching`  
**Span visé:** environ 14 ans de calendrier depuis le seed ; démarre vers 10–11 ans et traverse explicitement Childhood → Active, avec terminaison possible vers le milieu de la vingtaine.

**Points de divergence :**
1. `ch_east_blue_01_signal_rule_choice` : vitesse (`ch_east_blue_01_signal_fast_flag` → `ch_east_blue_01_signal_false_alarm` → `ch_east_blue_01_signal_speed_earned`) vs confirmation (`ch_east_blue_01_signal_double_check` → `ch_east_blue_01_signal_late_warning` → `ch_east_blue_01_signal_trust_earned`), puis reconvergence crédible sur `ch_east_blue_01_signal_spreads` après trois chapitres distincts.
2. `ch_east_blue_01_signal_fog_test` : standard public (`ch_east_blue_01_signal_open_copy` → `ch_east_blue_01_signal_common_errors`) vs dialectes locaux (`ch_east_blue_01_signal_port_dialects` → `ch_east_blue_01_signal_translation`), puis reconvergence sur `ch_east_blue_01_signal_return_question` après deux chapitres distincts.
3. `ch_east_blue_01_signal_return_question` : devoir public (`ch_east_blue_01_signal_public_duty` → `ch_east_blue_01_signal_rescue_chain` → `ch_east_blue_01_signal_older_crews` → `ch_east_blue_01_signal_public_legacy`) vs savoir local (`ch_east_blue_01_signal_local_craft` → `ch_east_blue_01_signal_homecoming` → `ch_east_blue_01_signal_storm_night` → `ch_east_blue_01_signal_small_light`), sans reconvergence ; deux fins de thread matériellement différentes.

**Verticalité :** le seed programme uniquement S1 ; chaque Scheduled programme uniquement son ou ses successeurs directs issus de l’Outcome courant. Aucun chapitre futur n’est pré-queue.  
**Branches de fin anticipée majeures :** aucune branche cosmétique ou fin artificielle n’est comptée ; les deux branches finales vont jusqu’à des terminaisons distinctes.

## ROOT_EVENTS
- `ch_east_blue_01_foosha_tide_barrels`
- `ch_east_blue_01_orange_gull_tokens`
- `ch_east_blue_01_syrup_fog_bell`
- `ch_east_blue_01_shells_drill_whistles`
- `ch_east_blue_01_shimotsuki_rain_steps`
- `ch_east_blue_01_cocoyasi_irrigation_shell`
- `ch_east_blue_01_goa_arcade_echo`
- `ch_east_blue_01_dawn_crossed_paths`
- `ch_east_blue_01_loguetown_storm_signals`
- `ch_east_blue_01_loguetown_quay_numbers`
- `ch_east_blue_01_orange_cistern_roof`
- `ch_east_blue_01_syrup_hedge_cart`
- `ch_east_blue_01_shells_runaway_target_cart`
- `ch_east_blue_01_shimotsuki_bamboo_rack`
- `ch_east_blue_01_cocoyasi_backflow`
- `ch_east_blue_01_goa_lantern_canopy`
- `ch_east_blue_01_foosha_gangplank`
- `ch_east_blue_01_forest_boar_crossing`
- `ch_east_blue_01_goa_rotated_milestone`
- `ch_east_blue_01_syrup_storm_shutters`

## IMMEDIATE_EVENTS
- `ch_east_blue_01_cocoyasi_backflow_i1`
- `ch_east_blue_01_cocoyasi_backflow_i2`
- `ch_east_blue_01_cocoyasi_backflow_i3`
- `ch_east_blue_01_goa_canopy_i1`
- `ch_east_blue_01_goa_canopy_i2`
- `ch_east_blue_01_goa_canopy_i3`
- `ch_east_blue_01_shells_cart_i1`
- `ch_east_blue_01_shells_cart_i2`
- `ch_east_blue_01_shells_cart_i3`
- `ch_east_blue_01_shells_cart_i4`
- `ch_east_blue_01_shells_cart_i5`
- `ch_east_blue_01_shimotsuki_rack_i1`
- `ch_east_blue_01_shimotsuki_rack_i2`
- `ch_east_blue_01_shimotsuki_rack_i3`

## SCHEDULED_EVENTS
- `ch_east_blue_01_foosha_gangplank_return`
- `ch_east_blue_01_goa_milestone_return`
- `ch_east_blue_01_orange_token_return`
- `ch_east_blue_01_signal_common_errors`
- `ch_east_blue_01_signal_double_check`
- `ch_east_blue_01_signal_false_alarm`
- `ch_east_blue_01_signal_fast_flag`
- `ch_east_blue_01_signal_first_squall`
- `ch_east_blue_01_signal_fog_test`
- `ch_east_blue_01_signal_homecoming`
- `ch_east_blue_01_signal_late_warning`
- `ch_east_blue_01_signal_local_craft`
- `ch_east_blue_01_signal_older_crews`
- `ch_east_blue_01_signal_open_copy`
- `ch_east_blue_01_signal_port_dialects`
- `ch_east_blue_01_signal_public_duty`
- `ch_east_blue_01_signal_public_legacy`
- `ch_east_blue_01_signal_rescue_chain`
- `ch_east_blue_01_signal_return_question`
- `ch_east_blue_01_signal_rule_choice`
- `ch_east_blue_01_signal_salt_lines`
- `ch_east_blue_01_signal_small_light`
- `ch_east_blue_01_signal_speed_earned`
- `ch_east_blue_01_signal_spreads`
- `ch_east_blue_01_signal_storm_night`
- `ch_east_blue_01_signal_translation`
- `ch_east_blue_01_signal_trust_earned`
- `ch_east_blue_01_syrup_shutters_return`

## ROOT_DETAILS
| Root | Mécanique dominante | Traits / IDs persistants | Immediate | Scheduled |
|---|---|---|---|---|
| `ch_east_blue_01_foosha_tide_barrels` | Dice Navigation / lecture de marée | — | — | — |
| `ch_east_blue_01_orange_gull_tokens` | Dice Agilité / marché côtier | — | — | `ch_east_blue_01_orange_token_return` |
| `ch_east_blue_01_syrup_fog_bell` | orientation collective / brouillard | — | — | — |
| `ch_east_blue_01_shells_drill_whistles` | discipline urbaine sous présence Marine | `disciplined` (gated vs `rebellious`) | — | — |
| `ch_east_blue_01_shimotsuki_rain_steps` | Dice Force / cour d’entraînement | — | — | — |
| `ch_east_blue_01_cocoyasi_irrigation_shell` | solution pratique / rigole côtière | `resourceful` | — | — |
| `ch_east_blue_01_goa_arcade_echo` | orientation urbaine / arcades | — | — | — |
| `ch_east_blue_01_dawn_crossed_paths` | Dice Observation / chemins insulaires | — | — | — |
| `ch_east_blue_01_loguetown_storm_signals` | Lifetime / signalisation portuaire | — | — | `ch_east_blue_01_signal_salt_lines` |
| `ch_east_blue_01_loguetown_quay_numbers` | tri portuaire / Intelligence | — | — | — |
| `ch_east_blue_01_orange_cistern_roof` | Dice Agilité / infrastructure urbaine | — | — | — |
| `ch_east_blue_01_syrup_hedge_cart` | logistique rurale / détour | — | — | — |
| `ch_east_blue_01_shells_runaway_target_cart` | Dice Charisme + Signature Immediate d5 | — | `ch_east_blue_01_shells_cart_i1` | — |
| `ch_east_blue_01_shimotsuki_bamboo_rack` | Dice Force + Secondary Immediate d3 | — | `ch_east_blue_01_shimotsuki_rack_i1` | — |
| `ch_east_blue_01_cocoyasi_backflow` | Dice Navigation + Secondary Immediate d3 | — | `ch_east_blue_01_cocoyasi_backflow_i1` | — |
| `ch_east_blue_01_goa_lantern_canopy` | Dice Intelligence + Secondary Immediate d3 | — | `ch_east_blue_01_goa_canopy_i1` | — |
| `ch_east_blue_01_foosha_gangplank` | protection d’un plus jeune / quai | `protective` | — | `ch_east_blue_01_foosha_gangplank_return` |
| `ch_east_blue_01_forest_boar_crossing` | Dice Observation / faune forestière | — | — | — |
| `ch_east_blue_01_goa_rotated_milestone` | signalisation routière / Navigation | — | — | `ch_east_blue_01_goa_milestone_return` |
| `ch_east_blue_01_syrup_storm_shutters` | priorisation de ressources locales | — | — | `ch_east_blue_01_syrup_shutters_return` |

## PERSISTENT_IDS_USED
- **Locations:** `foosha_village`, `orange_town`, `syrup_village`, `shells_town`, `shimotsuki_village`, `cocoyasi_village`, `loguetown`, `goa_capital`, `dawn_island`, `goa_kingdom`.
- **Traits acquis/testés:** `disciplined`, `rebellious` (opposition seulement), `resourceful`, `protective`.
- **Stats utilisées:** `morale`, `strength`, `agility`, `observation`, `intelligence`, `navigation`, `charisma`.
- **NPCs:** aucun.
- **Items:** aucun.
- **Flags:** aucun.
- **Ships / Fruits / Haki / Career / Rank / Title / Bounty:** aucun.

## DEPENDENCIES
- Aucune dépendance à un autre batch.
- Requiert uniquement le contrat runtime V6 et les Locations/Traits déjà présents dans les autorités fournies.
- La Lifetime East Blue n’est pas un safety seed universel ; la garantie globale peut être satisfaite par le batch générique prévu à cet effet.

## TIMELINE_AND_CANON
- Aucun personnage canon nommé, aucun résultat d’arc manga rejoué, aucune intervention sur un événement canon protégé.
- Toutes les roots restent en East Blue et en Childhood ; aucun navire personnel, Career active, rang, titre, prime, Haki ou Fruit n’est accordé.
- Les contextes temporellement plus sensibles (`arlong_park`, `baratie`, `16th_branch`, `153rd_branch`, `oykot_kingdom`, `gosa_town`) ne sont pas utilisés comme prémisse obligatoire du batch.
- Loguetown est utilisée comme grand port/marine/trade sans référence à l’exécution de Roger ni à l’arrivée ultérieure des héros canoniques.

## COVERAGE
- **Roots Normal:** 20 exactement.
- **Âges:** 8 roots dans la cible 1–8 ans ; 12 roots dans la cible 9–14 ans.
- **DiceCheck roots:** 10/20.
- **Stats D20 couvertes:** Navigation, Agilité, Force, Observation, Charisme, Intelligence.
- **Roots initiant du Scheduled:** 5/20 au total ; 4 hors Lifetime (`orangeGullTokens`, `fooshaGangplank`, `goaRotatedMilestone`, `syrupStormShutters`) + 1 Lifetime.
- **Immediate qualifiants:** 1 Signature d5 + 3 Secondary d3, sur quatre roots distincts.
- **Lifetime:** profondeur max 15 ; 24 nodes Scheduled distincts ; 3 divergences long-terme ; split terminal persistant.
- **Traits acquis:** `disciplined`, `resourceful`, `protective`; acquisition `disciplined` indisponible si `rebellious` ou déjà `disciplined`.
- **Locations/contextes distincts:** 11 IDs runtime East Blue via `locationIs`/`locationWithin`, dont les 8 Birth Locations East Blue et les contextes `dawn_island`, `goa_kingdom`.
- **Répartition géographique:** aucune Location ne dépasse 3 roots ; les scènes changent de problème selon port, ville Marine, village rural, capitale, jardins côtiers, forêt ou route du royaume.
- **Choice resolvability V4.1:** chaque Event du batch possède au moins une Choice sans `availableIf`.

## PROPOSED_DEFINITIONS
None.

## DEDUP_NOTES
- Revue de dédup effectuée contre les batches acceptés `CH_GENERIC_EARLY_01`, `CH_GENERIC_LATE_01`, `CH_FAMILY_SOCIAL_01` et `CH_IDENTITY_WORLD_01`. Les échos thématiques restent matériellement distincts : `syrup_storm_shutters` traite une pénurie de planches et une priorisation collective plutôt que le simple incident `storm_shutters`; `shells_drill_whistles` traite la lecture d’une cadence de circulation plutôt que l’identité/autorité de `uniform_drill`; la Lifetime de Loguetown suit sur des années l’évolution d’un langage de sécurité, distincte de l’incident ponctuel `harbor_signals` et de l’observation `signal_flags`.
- Les 20 roots ne sont pas des reskins d’un même incident : elles couvrent lecture de marée, jetons emportés par des goélands, cloche dans le brouillard, cadence Marine urbaine, cour martiale sous pluie, irrigation côtière, orientation dans une capitale, chemins insulaires, signalisation météo portuaire, tri de quai, récupération d’eau urbaine, logistique de haies, chariot d’exercice, râtelier de bambou, reflux salé, toile de fête prise par le vent, passerelle de pêche, faune forestière, borne routière et préparation d’un grain.
- Les quatre arcs Immediate portent quatre formes de crise différentes : objet roulant en pente, matériel d’entraînement renversé, hydraulique côtière, structure textile urbaine.
- La Lifetime n’est ni une chaîne de faveurs, ni une rivalité, ni une relation NPC persistante : elle suit l’évolution d’un langage de sécurité portuaire, avec trois débats structurants et deux philosophies terminales distinctes.
