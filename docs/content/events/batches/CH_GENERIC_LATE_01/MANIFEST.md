# CH_GENERIC_LATE_01 — MANIFEST

## Batch

- **Batch ID:** `CH_GENERIC_LATE_01`
- **Prefix:** `ch_generic_late_01`
- **Scope:** 20 roots Childhood centrés sur 9–14 ans, réutilisables dans les quatre Blues : autonomie croissante, responsabilités, premiers services, conflits de pairs, risques concrets, apprentissage pratique, secrets, rivalités et conséquences différées.
- **Root policy:** exactement 20 Events `kind: "normal"`, one-shot V1.
- **RUN_GUARANTEE_SAFETY_SEED:** `true` pour `ch_generic_late_01_chain_of_favors`.
- **Safety coverage:** son `eligibility` ne contient que `careerPhaseIs(childhood)`, `ageAtLeastMonths(120)` et `ageAtMostMonths(179)` ; aucun profil Origins V1 valide ni aucune Location Childhood valide n’est exclu au checkpoint de 120 mois.

## ROOT_EVENTS

- `ch_generic_late_01_chain_of_favors`
- `ch_generic_late_01_kitchen_smoke`
- `ch_generic_late_01_harbor_signals`
- `ch_generic_late_01_puppet_case`
- `ch_generic_late_01_grass_fire`
- `ch_generic_late_01_water_cask`
- `ch_generic_late_01_storm_banner`
- `ch_generic_late_01_passage_dispute`
- `ch_generic_late_01_missing_token`
- `ch_generic_late_01_blurred_tally`
- `ch_generic_late_01_third_attempt`
- `ch_generic_late_01_scoreboard_dispute`
- `ch_generic_late_01_younger_lookouts`
- `ch_generic_late_01_borrowed_bucket`
- `ch_generic_late_01_shared_credit`
- `ch_generic_late_01_after_hours_repair`
- `ch_generic_late_01_quiet_counter`
- `ch_generic_late_01_last_light`
- `ch_generic_late_01_closing_bell`
- `ch_generic_late_01_humiliating_initiation`

## IMMEDIATE_EVENTS

- `ch_generic_late_01_kitchen_smoke_i1_blocked_door`
- `ch_generic_late_01_kitchen_smoke_i2_low_smoke`
- `ch_generic_late_01_kitchen_smoke_i3_oil_cloth`
- `ch_generic_late_01_kitchen_smoke_i4_bucket_line`
- `ch_generic_late_01_kitchen_smoke_i5_floor_embers`
- `ch_generic_late_01_harbor_signals_i1_signal_post`
- `ch_generic_late_01_harbor_signals_i2_crossed_orders`
- `ch_generic_late_01_harbor_signals_i3_angry_crews`
- `ch_generic_late_01_puppet_case_i1_crowd_cut`
- `ch_generic_late_01_puppet_case_i2_split_thieves`
- `ch_generic_late_01_puppet_case_i3_return_mask`
- `ch_generic_late_01_grass_fire_i1_scrape_line`
- `ch_generic_late_01_grass_fire_i2_wind_shift`
- `ch_generic_late_01_grass_fire_i3_owner_returns`

## SCHEDULED_EVENTS

- `ch_generic_late_01_borrowed_bucket_return`
- `ch_generic_late_01_shared_credit_echo`
- `ch_generic_late_01_after_hours_repair_return`
- `ch_generic_late_01_closing_bell_second_chance`
- `ch_generic_late_01_favor_s01`
- `ch_generic_late_01_favor_s02`
- `ch_generic_late_01_favor_s03`
- `ch_generic_late_01_favor_s04_exact`
- `ch_generic_late_01_favor_s05_exact`
- `ch_generic_late_01_favor_s04_forward`
- `ch_generic_late_01_favor_s05_forward`
- `ch_generic_late_01_favor_s06`
- `ch_generic_late_01_favor_s07`
- `ch_generic_late_01_favor_s08_public`
- `ch_generic_late_01_favor_s09_public`
- `ch_generic_late_01_favor_s08_hidden`
- `ch_generic_late_01_favor_s09_hidden`
- `ch_generic_late_01_favor_s10`
- `ch_generic_late_01_favor_s11`
- `ch_generic_late_01_favor_s12_broken`
- `ch_generic_late_01_favor_s12_tired`
- `ch_generic_late_01_favor_s12_steady`
- `ch_generic_late_01_favor_s12_ripple`
- `ch_generic_late_01_favor_s13`
- `ch_generic_late_01_favor_s14`

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal | Mécanique dominante | Traits/NPC/Items | Immediate | Scheduled |
|---|---|---|---|---|---|---|---|
| `ch_generic_late_01_chain_of_favors` | `favorChain` | 10–14 ans (120–179 mois) | générique, aucun prérequis géographique | Lifetime Thread / choix déterministes | — | — | `ch_generic_late_01_favor_s01` |
| `ch_generic_late_01_kitchen_smoke` | `kitchenSmoke` | 9–13 ans (108–167 mois) | service `food` | DiceCheck Intelligence + urgence multi-scène | — | `ch_generic_late_01_kitchen_smoke_i1_blocked_door → ch_generic_late_01_kitchen_smoke_i2_low_smoke → ch_generic_late_01_kitchen_smoke_i3_oil_cloth → ch_generic_late_01_kitchen_smoke_i4_bucket_line → ch_generic_late_01_kitchen_smoke_i5_floor_embers` | — |
| `ch_generic_late_01_harbor_signals` | `harborSignalMismatch` | 10–14 ans (120–179 mois) | tag `port` | DiceCheck Navigation + coordination maritime locale | — | `ch_generic_late_01_harbor_signals_i1_signal_post → ch_generic_late_01_harbor_signals_i2_crossed_orders → ch_generic_late_01_harbor_signals_i3_angry_crews` | — |
| `ch_generic_late_01_puppet_case` | `puppetCaseGuard` | 10–14 ans (120–179 mois) | tag `urban` ou `entertainment` | DiceCheck Observation + vol opportuniste | — | `ch_generic_late_01_puppet_case_i1_crowd_cut → ch_generic_late_01_puppet_case_i2_split_thieves → ch_generic_late_01_puppet_case_i3_return_mask` | — |
| `ch_generic_late_01_grass_fire` | `grassFirebreak` | 9–14 ans (108–179 mois) | tag `rural`, `forest` ou `wilderness` | DiceCheck Morale + gestion d’un départ de feu | — | `ch_generic_late_01_grass_fire_i1_scrape_line → ch_generic_late_01_grass_fire_i2_wind_shift → ch_generic_late_01_grass_fire_i3_owner_returns` | — |
| `ch_generic_late_01_water_cask` | `caskHandling` | 9–12 ans (108–155 mois) | service `food` ou `trade` | DiceCheck Force / petit service physique | — | — | — |
| `ch_generic_late_01_storm_banner` | `stormBanner` | 10–14 ans (120–179 mois) | tag `coastal`, `urban` ou `village` | DiceCheck Agilité / risque matériel | — | — | — |
| `ch_generic_late_01_passage_dispute` | `blockedPassage` | 11–14 ans (132–179 mois) | générique | DiceCheck Charisme / conflit de pairs | — | — | — |
| `ch_generic_late_01_missing_token` | `missingToken` | 10–13 ans (120–167 mois) | service `general_goods` ou `trade` | DiceCheck Chance / erreur sous contrainte | — | — | — |
| `ch_generic_late_01_blurred_tally` | `blurredTally` | 11–14 ans (132–179 mois) | service `trade` ou `general_goods` | DiceCheck Intelligence / reconstruction pratique | — | — | — |
| `ch_generic_late_01_third_attempt` | `resilientThirdAttempt` | 9–14 ans (108–179 mois) | générique | Trait / apprentissage par l’échec | acquiert `resilient` | — | — |
| `ch_generic_late_01_scoreboard_dispute` | `disputedScore` | 10–14 ans (120–179 mois) | générique | Trait / rivalité et arbitrage | acquiert `competitive` | — | — |
| `ch_generic_late_01_younger_lookouts` | `youngerLookouts` | 11–14 ans (132–179 mois) | générique | Trait / responsabilité envers plus jeunes | acquiert `protective` | — | — |
| `ch_generic_late_01_borrowed_bucket` | `entrustedToolLoan` | 10–14 ans (120–179 mois) | générique | responsabilité / confiance conditionnelle | utilise `trusting` | — | `ch_generic_late_01_borrowed_bucket_return` |
| `ch_generic_late_01_shared_credit` | `sharedCredit` | 10–14 ans (120–179 mois) | générique | crédit social local sans Career Reputation | — | — | `ch_generic_late_01_shared_credit_echo` |
| `ch_generic_late_01_after_hours_repair` | `secretRepair` | 11–14 ans (132–179 mois) | service `general_goods`, `ship_repair` ou `trade` | secret / responsabilité / conséquence différée | utilise `suspicious` | — | `ch_generic_late_01_after_hours_repair_return` |
| `ch_generic_late_01_quiet_counter` | `delegatedCounter` | 9–13 ans (108–167 mois) | service `food`, `general_goods` ou `trade` | limites d’une responsabilité confiée | — | — | — |
| `ch_generic_late_01_last_light` | `lastLightAutonomy` | 11–14 ans (132–179 mois) | générique | autonomie sociale / heure de retour | — | — | — |
| `ch_generic_late_01_closing_bell` | `closingBellDuty` | 9–13 ans (108–167 mois) | tag `urban`, `village` ou `rural` | responsabilité à heure fixe | — | — | `ch_generic_late_01_closing_bell_second_chance` |
| `ch_generic_late_01_humiliating_initiation` | `initiationBoundary` | 12–14 ans (144–179 mois) | générique | pression de pairs / limites personnelles | — | — | — |

## SIGNATURE_IMMEDIATE_ARCS

- **Root ID:** `ch_generic_late_01_kitchen_smoke`
- **arcKey:** `kitchenFireCascade`
- **Maximum reachable Immediate depth:** **5**
- **Premise:** un départ de feu de cuisine devient une urgence continue : sortie bloquée, personne coincée, tissu huilé, chaîne de seaux puis braises sous le plancher.

## SECONDARY_IMMEDIATE_ARCS

- `ch_generic_late_01_harbor_signals` — **arcKey:** `harborSignalCascade` — **depth 3** — erreur de signalisation au quai, correction du poteau puis désescalade entre deux équipages.
- `ch_generic_late_01_puppet_case` — **arcKey:** `puppetCaseTheft` — **depth 3** — garde d’une malle de spectacle, diversion dans la foule, récupération puis résolution publique du vol.
- `ch_generic_late_01_grass_fire` — **arcKey:** `grassFirebreak` — **depth 3** — départ de feu dans l’herbe, création d’un coupe-feu, changement de vent puis confrontation avec le propriétaire.

## LIFETIME_THREADS

### `ch_generic_late_01_chain_of_favors` — `favorChain`
- **lifetimeThreadSeed: true:** confirmé.
- **RUN_GUARANTEE_SAFETY_SEED:** `true`.
- **Ancre durable:** la règle narrative de la « chaîne des petits services » et la mémoire des choix via History ; aucun NPC, Item, Flag ou nouvel état persistant n’est créé.
- **Longest reachable Scheduled depth:** **14**.
- **Total distinct reachable Scheduled EventDefinitions:** **21**.
- **Vrais points de divergence long-terme:** **2**.
- **Topologie:** `strongly_branching`.
- **Span visé:** environ **18 ans** sur le chemin le plus long selon les délais cumulés ; seed possible entre 10 et 14 ans, conclusion potentielle approximativement entre 28 et 32 ans.
- **Childhood → Active:** **oui** ; pour un seed à 120 mois, les premiers chapitres restent en Childhood puis la ligne traverse naturellement Active.
- **Scheduled reach:** `unrestricted` pour les 21 chapitres, car la thread porte sur une pratique personnelle et des situations locales génériques, sans téléportation d’un NPC récurrent.
- **Verticalité:** le seed ne programme que `favor_s01`; chaque chapitre ne programme que la conséquence directement issue de son Outcome.
- **Divergence 1 — `favor_s03`:** `exact_accounts` → `favor_s04_exact` → `favor_s05_exact`; `forward_accounts` → `favor_s04_forward` → `favor_s05_forward`; `stop_counting` termine la thread. Les deux branches restent séparées pendant deux Scheduled successifs puis reconvergent à `favor_s06`.
- **Persistance divergence 1:** `favor_s06` expose des Choices différentes via `hasPlayed(favor_s05_exact)` / `hasPlayed(favor_s05_forward)`, donc la reconvergence conserve matériellement l’History de la branche.
- **Divergence 2 — `favor_s07`:** `tell_people` → `favor_s08_public` → `favor_s09_public`; `stay_anonymous` → `favor_s08_hidden` → `favor_s09_hidden`; `end_rule` termine la thread. Reconvergence seulement à `favor_s10` après deux chapitres aux enjeux différents.
- **Persistance divergence 2:** `favor_s10` expose des Choices spécifiques via `hasPlayed(favor_s09_public)` / `hasPlayed(favor_s09_hidden)`.
- **Fork auxiliaire D20 — `favor_s11`:** les quatre résultats de Morale programment quatre `favor_s12_*` différents ; ils reconvergent ensuite vers `favor_s13`. Ce fork enrichit le graphe mais n’est **pas** compté parmi les deux divergences long-terme qualifiantes.
- **Branches de fin anticipée majeures:** `favor_s03.stop_counting`, `favor_s07.end_rule`, et `favor_s12_broken.end_it`.
- **Évolution narrative:** d’un geste reçu enfant à une règle personnelle, puis à une philosophie de dette ou de circulation, ensuite à un choix public/anonyme, enfin à la question des limites personnelles et de la transmission.

## EXISTING_PERSISTENT_IDS_USED

- **Traits acquis:** `resilient`, `competitive`, `protective`.
- **Traits utilisés comme Conditions:** `trusting`, `suspicious`.
- **Player Stats modifiées / testées:** `morale`, `strength`, `agility`, `observation`, `intelligence`, `navigation`, `charisma`, `luck`; `health` n’est jamais utilisé comme Dice stat.
- **NPCs:** aucun.
- **Items:** aucun.
- **Ships:** aucun.
- **Devil Fruits / Haki:** aucun.
- **Career affiliation / rank / title / bounty / Reputation:** aucun effet.
- **Flags:** aucun.

## LOCATION_CONTEXT_COVERAGE

- **Tags utilisés:** `port`, `coastal`, `urban`, `entertainment`, `village`, `rural`, `forest`, `wilderness`.
- **Services utilisés:** `food`, `trade`, `general_goods`, `ship_repair`.
- Les conditions en `any` évitent qu’un tag moins répandu (`entertainment`, `forest`) bloque un Blue : chaque root contextuel possède au moins une Location runtime éligible dans chacun des quatre Blues.
- Aucune Location exacte n’est requise par un root.

## PROPOSED_DEFINITIONS

None

## DEPENDENCIES

- Aucune dépendance à un autre batch.
- Dépend uniquement du contrat Content Schema v6 et des IDs déjà présents dans les autorités runtime fournies.

## TIMELINE_AND_CANON

- Tous les roots ciblent exclusivement `childhood` et des âges compris entre 108 et 179 mois.
- Aucun canon NPC, événement canon majeur ou état politique temporel n’est utilisé.
- Aucun voyage Grand Line/New World, acquisition de navire personnel, Haki ou Devil Fruit n’est authoré.
- La Lifetime Thread peut continuer en Active sans supposer une carrière, un lieu ou une organisation particulière.

## COVERAGE_SUMMARY

- **Root Events:** 20 Normal.
- **DiceCheck roots:** **9/20**.
- **Roots créant du Scheduled:** **5/20** au total : 1 Lifetime seed + 4 roots à conséquence Scheduled ordinaire.
- **Scheduled hors Lifetime descendants:** 4.
- **Immediate Events:** 14.
- **Mini-arcs Immediate qualifiants:** **4** : 1 Signature depth 5 + 3 Secondary depth 3.
- **Lifetime Threads:** 1.
- **Lifetime longest reachable depth:** 14.
- **Lifetime total reachable Scheduled nodes:** 21.
- **Lifetime long-term divergence points:** 2 qualifiants + 1 fork D20 auxiliaire.
- **Root Dice Stats:** `intelligence`, `navigation`, `observation`, `morale`, `strength`, `agility`, `charisma`, `luck` — les huit attributs D20 sont représentés.
- **Traits acquis:** `resilient`, `competitive`, `protective`.
- **Traits conditionnels:** `trusting`, `suspicious`.
- **Locations exactes:** 0 ; contexte contrôlé uniquement par tags/services lorsque nécessaire.

## DEDUP_NOTES

L’`EVENT_CONCEPT_INDEX.md` autoritaire courant est le baseline de régénération : aucun batch de production n’y est actuellement accepté. Les anciennes Waves retirées ne bloquent donc pas ces concepts, mais aucun ancien JSON n’a été copié et les prémisses ci-dessous ont été écrites pour éviter les reskins évidents des anciennes cartes connues (`market_rounds`, `rooftop_rivalry`, `jammed_winch`, `tidepool_rescue`, `sealed_note`, `one_day_apprentice`, `drifting_skiff`, `trail_markers`, `ration_argument`, `horizon_promise`).
- `ch_generic_late_01_chain_of_favors` — Thread biographique sur la circulation des petits services, distincte d’une simple promesse d’avenir : elle produit une philosophie évolutive, deux splits persistants et 21 chapitres Scheduled.
- `ch_generic_late_01_kitchen_smoke` — Urgence d’incendie de cuisine en cinq bascules continues ; ni dépannage mécanique isolé, ni livraison sous tempête.
- `ch_generic_late_01_harbor_signals` — Erreur de signalisation portuaire et coordination de deux embarcations ; pas une leçon de nœud, pas une barque dérivante.
- `ch_generic_late_01_puppet_case` — Vol opportuniste pendant un spectacle avec garde d’une malle ; distinct d’une recherche d’enfant perdu ou d’un rush de vente.
- `ch_generic_late_01_grass_fire` — Départ de feu d’herbe et création d’un coupe-feu ; distinct d’un simple abri sous tempête ou d’une mission de transport.
- `ch_generic_late_01_water_cask` — Déplacement physique d’un tonnelet confié ; aucune livraison d’argent, vente ou apprentissage de métier.
- `ch_generic_late_01_storm_banner` — Sécurisation d’une bannière emportée par une rafale ; risque vertical bref sans rivalité de toit ni course.
- `ch_generic_late_01_passage_dispute` — Blocage volontaire d’un passage par des pairs ; conflit de pouvoir social, pas accusation injuste par une autorité.
- `ch_generic_late_01_missing_token` — Jeton perdu dans des débris sous contrainte de temps ; usage de Chance sans pari ni défi de ruisseau.
- `ch_generic_late_01_blurred_tally` — Reconstruction d’un compte rendu illisible à partir du stock ; pas d’obligation économique familiale ni de cartographie de caisses.
- `ch_generic_late_01_third_attempt` — Persévérance après échecs répétés et acquisition `resilient`; aucune panne d’objet ou compétition.
- `ch_generic_late_01_scoreboard_dispute` — Point de jeu contesté et formation `competitive`; rivalité arbitrale sans course physique ni sauvetage.
- `ch_generic_late_01_younger_lookouts` — Refus d’utiliser des enfants plus jeunes comme guetteurs ; protection face à la pression de pairs, sans recherche d’un enfant perdu.
- `ch_generic_late_01_borrowed_bucket` — Prêt de matériel sous responsabilité avec retour différé ; l’enjeu est la délégation de confiance, pas la propriété d’un objet rare.
- `ch_generic_late_01_shared_credit` — Crédit social attribué à tort à une seule personne ; construit une mémoire locale sans utiliser Career Reputation.
- `ch_generic_late_01_after_hours_repair` — Réparation clandestine d’une faute déjà commise ; secret sur responsabilité et réparation, pas lettre scellée ni intrusion.
- `ch_generic_late_01_quiet_counter` — Dix minutes de responsabilité limitée derrière un comptoir ; teste les frontières de l’autorité sans devenir journée d’apprentissage.
- `ch_generic_late_01_last_light` — Choix d’autonomie face à une heure de retour et aux amis ; ni famille/class social, ni ambition de carrière.
- `ch_generic_late_01_closing_bell` — Tâche ponctuelle à heure fixe oubliée puis seconde chance ; responsabilité temporelle distincte d’une veille nocturne statique.
- `ch_generic_late_01_humiliating_initiation` — Rite d’intégration humiliant à refuser/négocier ; pression de groupe et limites personnelles sans grande définition idéologique de soi.

## LOCAL_VALIDATION

- Validation locale effectuée sur les JSON générés, sans modifier ni exécuter le repository.
- Vérifications : types Condition/Effect connus du `schema.ts`, 4 Outcomes sur chaque DiceCheck, références Immediate/Scheduled existantes, préfixes/IDs uniques, localisation française complète, profondeur des graphes, reachability, âge Childhood, contraintes du safety seed et couverture géographique des quatre Blues.
- Aucun script du repository n’a été prétendu/exécuté dans cette génération ; l’intégration finale devra encore passer le validateur runtime du projet après import.

