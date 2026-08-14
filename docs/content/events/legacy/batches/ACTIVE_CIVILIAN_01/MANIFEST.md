# ACTIVE_CIVILIAN_01 — MANIFEST

Batch Active V1 consacré aux trajectoires professionnelles et communautaires `civilian`. Les 20 roots exigent explicitement `careerAffiliationIs: civilian`; aucune nouvelle définition persistante n’est introduite.

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `active_civilian_01_dockside_triage` | `docksideTriage` | 15+ | Civilian; terre; tag port + service medical |
| `active_civilian_01_guildless_arbitration` | `guildlessArbitration` | 15+ | Civilian; terre; trade/urban |
| `active_civilian_01_chart_commission` | `civilianChartCommission` | 15+ | Civilian; en mer; navire personnel |
| `active_civilian_01_workshop_failure` | `publicWorkshopFailure` | 15+ | Civilian; terre; ship_repair/general_goods/industrial |
| `active_civilian_01_shared_workbench` | `sharedWorkBenchLife` | 15+ | Civilian; terre; general_goods/ship_repair/trade |
| `active_civilian_01_merchant_credit_choice` | `merchantCreditPolicy` | 15+ | Civilian; terre; service trade; Berrys optionnels |
| `active_civilian_01_clinic_after_hours` | `clinicAfterHours` | 15+ | Civilian; terre; service medical |
| `active_civilian_01_survey_before_build` | `communitySiteSurvey` | 15+ | Civilian; terre; urban/industrial/research |
| `active_civilian_01_harbor_shift_foreman` | `harborShiftForeman` | 15+ | Civilian; terre; tag port |
| `active_civilian_01_rescue_coordinator` | `civilianRescueCoordinator` | 15+ | Civilian; terre; coastal |
| `active_civilian_01_local_guide_dangerous_guest` | `responsibleLocalGuide` | 15+ | Civilian; terre; touristic/wilderness/mountain/forest |
| `active_civilian_01_public_hearing` | `civilianPublicHearing` | 15+ | Civilian; terre; reputation>=10; government/royal/urban |
| `active_civilian_01_independent_expedition_offer` | `independentFieldExpedition` | 15+ | Civilian; terre; wilderness/isolated/research |
| `active_civilian_01_apprentice_request` | `civilianMentorship` | 15+ | Civilian; terre; reputation>=20; atelier/medical/research |
| `active_civilian_01_repair_or_replace` | `essentialRepairDecision` | 15+ | Civilian; terre; general_goods/ship_repair/industrial |
| `active_civilian_01_storm_refuge_budget` | `civilianStormRefugeBudget` | 15+ | Civilian; terre; urban/village/coastal; Berrys optionnels |
| `active_civilian_01_medical_supply_priority` | `clinicSupplyPriority` | 15+ | Civilian; terre; service medical; reputation>=15 |
| `active_civilian_01_civilian_title_review` | `civilianVeteranRecognition` | 15+ | Civilian; reputation>=35; pas déjà veteran/legend |
| `active_civilian_01_independent_archive` | `civilianTechnicalArchive` | 15+ | Civilian; terre; research/historic/industrial |
| `active_civilian_01_name_on_charter` | `civilianLegendRecognition` | 15+ | Civilian; reputation>=70; title veteran |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `active_civilian_01_dockside_triage`
**arcKey:** `docksideTriageCascade`
**Maximum reachable Immediate depth:** **5**
**Premise:** Un accident de palan transforme une salle de soins civile en scène continue de triage, saturation, pression financière, seconde vague de blessés et compte rendu public, sans ellipse.

## SECONDARY_IMMEDIATE_ARCS

- active_civilian_01_guildless_arbitration — **arcKey:** guildlessArbitrationArc — **depth 3** — Un conflit entre travailleurs indépendants évolue d’une médiation improvisée vers la vérification des usages, un premier test sous tension puis un accord écrit.
- active_civilian_01_chart_commission — **arcKey:** civilianChartCommissionArc — **depth 3** — Une mission civile de vérification nautique découvre successivement une balise déplacée, un haut-fond absent des cartes et un courant transversal avant la décision de diffusion.
- active_civilian_01_workshop_failure — **arcKey:** publicWorkshopFailureArc — **depth 3** — Une panne lors d’une remise en service publique révèle un ajustement forcé, une pression de calendrier puis le choix de ce qui sera inscrit au rapport.

## LIFETIME_THREADS

### active_civilian_01_shared_workbench — sharedWorkBenchLife
**Ancre durable:** La pratique professionnelle/civique née d’un premier établi partagé puis reproduite en réseau de relais locaux ; continuité portée uniquement par History et la chaîne verticale des Scheduled Events, sans nouvel Item, Flag, NPC, organisation persistante ou état de thread.
**Longest reachable Scheduled depth:** 14
**Total distinct reachable Scheduled EventDefinitions:** 26
**Vrais points de divergence long-terme:** 3 — orientation de l’atelier en précision / urgence / transmission (3 chapitres distincts) ; gestion d’une pénurie en réserve saine / dette (2 chapitres distincts) ; héritage final en maison artisanale / service civique / école d’atelier (2 chapitres terminaux distincts).
**Topologie:** `strongly_branching` — deux reconvergences seulement après branches multi-chapitres matériellement différentes, puis split terminal persistant sans reconvergence.
**Span visé:** environ 18 ans et demi sur le chemin maximal à partir d’un seed Active à 15+ ans, avec délais de 12–24 mois ; 14 Scheduled vécus maximum pour 26 nodes authorés.

## EVENT_INVENTORY

**Roots (20):**
- `active_civilian_01_dockside_triage`
- `active_civilian_01_guildless_arbitration`
- `active_civilian_01_chart_commission`
- `active_civilian_01_workshop_failure`
- `active_civilian_01_shared_workbench`
- `active_civilian_01_merchant_credit_choice`
- `active_civilian_01_clinic_after_hours`
- `active_civilian_01_survey_before_build`
- `active_civilian_01_harbor_shift_foreman`
- `active_civilian_01_rescue_coordinator`
- `active_civilian_01_local_guide_dangerous_guest`
- `active_civilian_01_public_hearing`
- `active_civilian_01_independent_expedition_offer`
- `active_civilian_01_apprentice_request`
- `active_civilian_01_repair_or_replace`
- `active_civilian_01_storm_refuge_budget`
- `active_civilian_01_medical_supply_priority`
- `active_civilian_01_civilian_title_review`
- `active_civilian_01_independent_archive`
- `active_civilian_01_name_on_charter`

**Immediate (14):**
- `active_civilian_01_dockside_triage_i1`
- `active_civilian_01_dockside_triage_i2`
- `active_civilian_01_dockside_triage_i3`
- `active_civilian_01_dockside_triage_i4`
- `active_civilian_01_dockside_triage_i5`
- `active_civilian_01_guildless_arbitration_i1`
- `active_civilian_01_guildless_arbitration_i2`
- `active_civilian_01_guildless_arbitration_i3`
- `active_civilian_01_chart_commission_i1`
- `active_civilian_01_chart_commission_i2`
- `active_civilian_01_chart_commission_i3`
- `active_civilian_01_workshop_failure_i1`
- `active_civilian_01_workshop_failure_i2`
- `active_civilian_01_workshop_failure_i3`

**Scheduled (30):**
- `active_civilian_01_lt_first_backlog`
- `active_civilian_01_lt_choose_shape`
- `active_civilian_01_lt_precision_queue`
- `active_civilian_01_lt_material_standard`
- `active_civilian_01_lt_precision_name`
- `active_civilian_01_lt_emergency_call`
- `active_civilian_01_lt_night_shift`
- `active_civilian_01_lt_public_trust`
- `active_civilian_01_lt_first_students`
- `active_civilian_01_lt_classroom_mistake`
- `active_civilian_01_lt_shared_method`
- `active_civilian_01_lt_outgrown_room`
- `active_civilian_01_lt_competing_request`
- `active_civilian_01_lt_shortage_year`
- `active_civilian_01_lt_reserve_plan`
- `active_civilian_01_lt_stable_months`
- `active_civilian_01_lt_debt_pressure`
- `active_civilian_01_lt_hard_choices`
- `active_civilian_01_lt_public_offer`
- `active_civilian_01_lt_what_remains`
- `active_civilian_01_lt_craft_house`
- `active_civilian_01_lt_hands_know_name`
- `active_civilian_01_lt_civic_service`
- `active_civilian_01_lt_doors_stay_open`
- `active_civilian_01_lt_school_bench`
- `active_civilian_01_lt_others_take_tools`
- `active_civilian_01_merchant_credit_return`
- `active_civilian_01_independent_expedition_report`
- `active_civilian_01_apprentice_return`
- `active_civilian_01_storm_refuge_audit`

## PERSISTENT_IDS_USED

- Career: `civilian`.
- Career Titles: `veteran`, `legend` uniquement.
- Traits lus/utilisés: `protective`, `resourceful`, `cautious`, `honest`; seuls `protective` et `resourceful` peuvent être acquis, tous deux indépendants et non opposés.
- Crew Roles: `medic`, `navigator`, `shipwright`, `scholar`, `quartermaster`.
- Ship: aucun châssis référencé ; seulement les Conditions `hasShip` et l’Effect `modifyShipHealth` dans la mission de cartographie en mer.
- Items: None.
- Persistent NPCs: None.
- Flags: None.
- Devil Fruits / Haki: None.
- Locations explicites: None ; uniquement tags/services contrôlés et contexte terre/mer.

## DEPENDENCIES

- `CONTENT_SCHEMA_VERSION = 6`.
- Dépend des définitions runtime existantes de Career, Titles, Traits, Crew Roles, tags/services et Stats.
- Aucune dépendance narrative cross-batch obligatoire.

## CAREER_RANK_TITLE_BOUNTY_CONTEXT

- Les 20 roots exigent `careerAffiliationIs: civilian`.
- Civilian n’utilise aucun rank ; aucun `setCareerRank`.
- Deux Events de reconnaissance authorés peuvent attribuer les Career Titles existants `veteran` puis `legend` sous Conditions de Reputation/History de titre.
- Bounty n’est ni lue ni modifiée.
- Reputation est modifiée explicitement seulement lorsque la scène raconte la notoriété produite.

## SHIP_CREW_POWERS_CONTEXT

- Un seul root (`active_civilian_01_chart_commission`) exige `hasShip` + `isAtSea`; aucun achat, remplacement ou acquisition de navire.
- Des Choices spéciales peuvent être grisées via `hasCrewRole` pour `medic`, `navigator`, `shipwright`, `scholar`, `quartermaster`.
- Aucun rôle `captain`, aucune mécanique autonome de Crew.
- Aucun Devil Fruit ou Haki distribué, éveillé ou requis.

## TIMELINE_CANON

- Tous les roots ont `careerPhaseIs: active` + `ageAtLeastMonths: 180`.
- Aucun personnage canon majeur, aucune organisation canon sensible et aucun outcome canon protégé.
- Le contenu utilise uniquement rôles locaux/originaux et interstices civils compatibles avec l’ancrage Active.

## DICE_STATS_TRAITS_LOCATIONS_COVERAGE

- Roots avec DiceCheck: 10 — `active_civilian_01_dockside_triage`, `active_civilian_01_guildless_arbitration`, `active_civilian_01_chart_commission`, `active_civilian_01_workshop_failure`, `active_civilian_01_clinic_after_hours`, `active_civilian_01_survey_before_build`, `active_civilian_01_harbor_shift_foreman`, `active_civilian_01_rescue_coordinator`, `active_civilian_01_local_guide_dangerous_guest`, `active_civilian_01_independent_expedition_offer`.
- Stats D20 utilisées par Dice: `intelligence`, `charisma`, `navigation`, `observation`. `health` n’est jamais utilisée comme `statId` D20.
- Tous les DiceChecks possèdent exactement `criticalFailure`, `failure`, `success`, `criticalSuccess`.
- Traits servent surtout de Choices visibles mais conditionnées ; aucun bonus global automatique.
- Contexte géographique via `locationHasTag`, `locationHasService`, `isOnLand`, `isAtSea`; aucun long tableau de `locationIs`.

## SCHEDULED_OUTSIDE_LIFETIME

4 roots peuvent créer une conséquence Scheduled hors Lifetime:
- `active_civilian_01_merchant_credit_choice` → `active_civilian_01_merchant_credit_return` (6 mois).
- `active_civilian_01_independent_expedition_offer` → `active_civilian_01_independent_expedition_report` (4 mois).
- `active_civilian_01_apprentice_request` → `active_civilian_01_apprentice_return` (12 mois).
- `active_civilian_01_storm_refuge_budget` → `active_civilian_01_storm_refuge_audit` (8 mois).

## TRAVEL_AND_MOVEMENT

None — ce batch ne contient aucun `moveToLocation`, aucun `recoverTravel`, aucun ingress/egress authoré, aucune transition parent/sous-location, aucune transition gated/special et aucun cross-route. Il ne contribue donc pas directement à la couverture de déplacement normal.

## DEDUP_NOTES

- Contrôle effectué contre `EVENT_CONCEPT_INDEX.md` fourni comme ledger accepté.
- La Lifetime de pratique d’établis partagés en réseau évite les Lifetime déjà acceptées centrées sur pratique de peur, chaîne de faveurs, registre d’obligations, carnet collectif, signaux portuaires, atlas vivant d’Enoa, héritage agricole de Taya et mémoire historique contestée de Lvneel.
- Les roots professionnels sont conçus comme responsabilités adultes : triage civil, médiation sans hiérarchie, mission de cartographie rémunérée, remise en service publique, politique de crédit, supervision de quai, mentorat, documentation technique, reconnaissance civique.
- Les incidents Childhood de petites courses, comptes flous, réparations secrètes, premiers soins locaux ou signaux de quai ne sont pas reskinnés : ici l’enjeu porte sur responsabilité professionnelle, réputation, argent, continuité de service ou héritage de carrière.
