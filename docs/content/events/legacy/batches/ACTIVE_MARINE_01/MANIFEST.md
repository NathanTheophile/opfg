# ACTIVE_MARINE_01 — MANIFEST

- **Batch ID:** `ACTIVE_MARINE_01`
- **Préfixe:** `active_marine_01`
- **Scope:** trajectoire Active Marine V1 — recrutement, terrain, secours, enquête, détention, ordre contestable, corruption, témoignage, commandement et promotions.
- **Content schema:** `6`
- **FR:** source et fallback.
- **Root Events:** 20 Normal one-shot.
- **Immediate Events:** 14.
- **Scheduled Events:** 30, dont 26 dans la Lifetime Thread et 4 conséquences hors Lifetime.
- **Nouvelles définitions persistantes utilisées:** aucune.

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
| --- | --- | --- | --- |
| `active_marine_01_enlistment_desk` | `voluntaryMarineEnlistment` | 15+ (180+ mois) | `civilian` + `marine_services` |
| `active_marine_01_field_drill_misfire` | `fieldDrillMisfire` | 15+ (180+ mois) | `marine_recruit` + `marine_services` |
| `active_marine_01_conflicting_distress_signals` | `conflictingDistressSignals` | 15+ (180+ mois) | Marine + `marine_services` |
| `active_marine_01_storm_quay_rescue` | `stormQuayRescue` | 15+ (180+ mois) | Marine + `coastal` |
| `active_marine_01_prisoner_transfer_refusal` | `prisonerTransferDispute` | 15½+ (186+ mois) | Marine `marine_petty_officer`+ + `marine_services` |
| `active_marine_01_sealed_manifest_discrepancy` | `sealedManifestDiscrepancy` | 16+ (192+ mois) | Marine `marine_petty_officer`+ + Reputation 15+ + `marine_services` |
| `active_marine_01_contested_evacuation_order` | `contestedEvacuationOrder` | 16+ (192+ mois) | Marine `marine_lieutenant`+ + `urban` |
| `active_marine_01_rooftop_pursuit` | `rooftopPursuitCollateral` | 15½+ (186+ mois) | Marine `marine_petty_officer`+ + `urban|city` |
| `active_marine_01_civilian_testimony` | `civilianTestimonyProtection` | 16½+ (198+ mois) | Marine `marine_lieutenant`+ + `marine_services` |
| `active_marine_01_missing_patrol_launch` | `missingPatrolLaunch` | 15½+ (186+ mois) | Marine + `isAtSea` |
| `active_marine_01_casualty_report` | `casualtyReportResponsibility` | 19+ (228+ mois) | Marine `marine_commander`+ + `marine_services` |
| `active_marine_01_promotion_petty_officer` | `promotionPettyOfficer` | 15½+ (186+ mois) | `marine_recruit` + Reputation 8+ + `marine_services` |
| `active_marine_01_promotion_lieutenant` | `promotionLieutenant` | 17+ (204+ mois) | `marine_petty_officer` + Reputation 18+ + `marine_services` |
| `active_marine_01_promotion_commander` | `promotionCommander` | 19+ (228+ mois) | `marine_lieutenant` + Reputation 30+ + `marine_services` |
| `active_marine_01_promotion_captain` | `promotionCaptain` | 21+ (252+ mois) | `marine_commander` + Reputation 42+ + `marine_services` |
| `active_marine_01_promotion_commodore` | `promotionCommodore` | 24+ (288+ mois) | `marine_captain` + Reputation 55+ + `marine_services` |
| `active_marine_01_promotion_rear_admiral` | `promotionRearAdmiral` | 27+ (324+ mois) | `marine_commodore` + Reputation 68+ + `marine_services` |
| `active_marine_01_promotion_vice_admiral` | `promotionViceAdmiral` | 30+ (360+ mois) | `marine_rear_admiral` + Reputation 80+ + `marine_services` |
| `active_marine_01_promotion_admiral` | `promotionAdmiral` | 35+ (420+ mois) | `marine_vice_admiral` + Reputation 90+ + `marine_services` |
| `active_marine_01_promotion_fleet_admiral` | `promotionFleetAdmiral` | 40+ (480+ mois) | `marine_admiral` + Reputation 97+ + `marine_services` |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `active_marine_01_conflicting_distress_signals`  
**arcKey:** `conflictingDistressSignalArc`  
**Maximum reachable Immediate depth:** **5**  
**Premise:** Deux signaux de détresse contradictoires révèlent qu'un ordre Marine a été falsifié depuis le poste; le secours immédiat se transforme en investigation interne sans ellipse.

## SECONDARY_IMMEDIATE_ARCS

- active_marine_01_field_drill_misfire — **arcKey:** fieldDrillMisfireArc — **depth 3** — Un tir prématuré disloque une ligne d'exercice; il faut protéger les recrues, établir les responsabilités puis décider comment reprendre.
- active_marine_01_prisoner_transfer_refusal — **arcKey:** prisonerTransferDisputeArc — **depth 3** — Un prisonnier refuse un transfert dont les documents semblent altérés; la scène force à arbitrer procédure, sécurité et pression hiérarchique.
- active_marine_01_contested_evacuation_order — **arcKey:** contestedEvacuationOrderArc — **depth 3** — Un ordre de tenir des archives entre en conflit direct avec l'évacuation de civils pendant un incendie qui progresse.

## LIFETIME_THREADS

### `active_marine_01_sealed_manifest_discrepancy` — `sealedManifestAccountability`

- **Ancre durable:** une affaire de manifestes de saisie contradictoires qui devient, par History et Scheduled verticaux, un dossier institutionnel de responsabilité et de réforme sans nouveau NPC, Item, Flag ou état de quête.
- **Longest reachable Scheduled depth:** 14
- **Total distinct reachable Scheduled EventDefinitions:** 26
- **Vrais points de divergence long-terme:** 3
- **Topologie:** strongly_branching
- **Span visé:** environ 19,5 années calendaires au plus long après le seed; seed éligible dès 16 ans, conclusion potentielle vers le milieu de la trentaine.
- **Divergence 1:** S2 — préserver la chaîne de preuves / correction discrète / confrontation du commandement; trois branches distinctes persistent chacune sur S3–S5 avant reconvergence à S6.
- **Divergence 2:** S6 — Dice `charisma`; réussite ouvre la branche audience plus ouverte S7P–S8P, échec ou retrait ouvre la commission interne S7Q–S8Q; reconvergence seulement à S9 après conséquences distinctes.
- **Divergence 3:** S10 — dossier ouvert / réforme interne / protection du réseau; trois branches S11–S12 distinctes avant l'audit final S13.
- **Persistance / reconvergence:** chaque split compte plusieurs Scheduled distincts; aucune bifurcation cosmétique ne reconverge immédiatement.
- **Early termination:** chaque Scheduled de la thread porte `cancelIf: not(careerAffiliationIs marine)`; quitter la Marine met fin proprement à la chaîne pending plutôt que de faire revenir des ordres Marine.
- **Verticalité:** le seed ne programme que S1; chaque chapitre ne programme que son successeur direct choisi par son Outcome.
- **Cross Childhood → Active:** non; seed Active ordinaire, sans garantie spéciale de sélection.

## ROOT_EVENTS

- `active_marine_01_enlistment_desk`
- `active_marine_01_field_drill_misfire`
- `active_marine_01_conflicting_distress_signals`
- `active_marine_01_storm_quay_rescue`
- `active_marine_01_prisoner_transfer_refusal`
- `active_marine_01_sealed_manifest_discrepancy`
- `active_marine_01_contested_evacuation_order`
- `active_marine_01_rooftop_pursuit`
- `active_marine_01_civilian_testimony`
- `active_marine_01_missing_patrol_launch`
- `active_marine_01_casualty_report`
- `active_marine_01_promotion_petty_officer`
- `active_marine_01_promotion_lieutenant`
- `active_marine_01_promotion_commander`
- `active_marine_01_promotion_captain`
- `active_marine_01_promotion_commodore`
- `active_marine_01_promotion_rear_admiral`
- `active_marine_01_promotion_vice_admiral`
- `active_marine_01_promotion_admiral`
- `active_marine_01_promotion_fleet_admiral`

## IMMEDIATE_EVENTS

- `active_marine_01_conflicting_distress_signals_i1`
- `active_marine_01_conflicting_distress_signals_i2`
- `active_marine_01_conflicting_distress_signals_i3`
- `active_marine_01_conflicting_distress_signals_i4`
- `active_marine_01_conflicting_distress_signals_i5`
- `active_marine_01_contested_evacuation_order_i1`
- `active_marine_01_contested_evacuation_order_i2`
- `active_marine_01_contested_evacuation_order_i3`
- `active_marine_01_field_drill_misfire_i1`
- `active_marine_01_field_drill_misfire_i2`
- `active_marine_01_field_drill_misfire_i3`
- `active_marine_01_prisoner_transfer_refusal_i1`
- `active_marine_01_prisoner_transfer_refusal_i2`
- `active_marine_01_prisoner_transfer_refusal_i3`

## SCHEDULED_EVENTS

- `active_marine_01_casualty_report_board`
- `active_marine_01_civilian_testimony_echo`
- `active_marine_01_missing_patrol_launch_return`
- `active_marine_01_sealed_manifest_s10_three_paths`
- `active_marine_01_sealed_manifest_s11a_open_record`
- `active_marine_01_sealed_manifest_s11b_internal_reform`
- `active_marine_01_sealed_manifest_s11c_protect_network`
- `active_marine_01_sealed_manifest_s12a_repercussions`
- `active_marine_01_sealed_manifest_s12b_new_procedure`
- `active_marine_01_sealed_manifest_s12c_quiet_reassignments`
- `active_marine_01_sealed_manifest_s13_final_audit`
- `active_marine_01_sealed_manifest_s14_last_signature`
- `active_marine_01_sealed_manifest_s1_summons`
- `active_marine_01_sealed_manifest_s2_three_copies`
- `active_marine_01_sealed_manifest_s3a_preserve_chain`
- `active_marine_01_sealed_manifest_s3b_quiet_correction`
- `active_marine_01_sealed_manifest_s3c_confront_command`
- `active_marine_01_sealed_manifest_s4a_witness_rooms`
- `active_marine_01_sealed_manifest_s4b_missing_clerk`
- `active_marine_01_sealed_manifest_s4c_closed_door`
- `active_marine_01_sealed_manifest_s5a_unopened_crate`
- `active_marine_01_sealed_manifest_s5b_second_manifest`
- `active_marine_01_sealed_manifest_s5c_transfer_order`
- `active_marine_01_sealed_manifest_s6_joint_review`
- `active_marine_01_sealed_manifest_s7p_public_hearing`
- `active_marine_01_sealed_manifest_s7q_internal_board`
- `active_marine_01_sealed_manifest_s8p_civilian_names`
- `active_marine_01_sealed_manifest_s8q_missing_minutes`
- `active_marine_01_sealed_manifest_s9_command_decision`
- `active_marine_01_storm_quay_rescue_return`

## PERSISTENT_IDS_USED

- **Career affiliations:** `civilian`, `marine`.
- **Marine ranks:** `marine_recruit`, `marine_petty_officer`, `marine_lieutenant`, `marine_commander`, `marine_captain`, `marine_commodore`, `marine_rear_admiral`, `marine_vice_admiral`, `marine_admiral`, `marine_fleet_admiral`.
- **Traits queried:** `ambitious`, `deceptive`, `disciplined`, `honest`, `protective`, `ruthless`, `suspicious`.
- **Location services:** `marine_services`.
- **Location tags:** `city`, `coastal`, `urban`.
- **Items:** None.
- **NPCs:** None.
- **Flags:** None.
- **Career Titles:** None.
- **Endings:** None.
- **Ships:** None.
- **Crew roles:** None.
- **Devil Fruits / Haki:** None.

## CAREER_RANK_TITLE_BOUNTY_CONTEXT

- Le recrutement est une porte d'entrée depuis `civilian`; seul un Outcome qui raconte la signature applique `setCareerAffiliation: marine` puis `setCareerRank: marine_recruit`.
- Les neuf promotions sont des Events dédiés, avec âge, Reputation, grade courant et `marine_services`; aucune Reputation ne promeut automatiquement.
- Aucun saut silencieux, rétrogradation, Career Title ou Ending n'est authoré.
- Aucune bounty n'est modifiée.
- Les grades élevés sont fortement retardés par âge + Reputation + progression préalable: Contre-amiral à 27+ ans au plus tôt, Vice-amiral à 30+, Amiral à 35+, Amiral en chef à 40+.
- Aucune promotion n'accorde automatiquement Haki, Fruit, Reputation ou autre pouvoir.

## SHIP_CREW_POWERS_CONTEXT

None. Aucun Ship, CrewRole, NPC crew, Devil Fruit, Haki, Awakening, module, upgrade, crafting ou flotte n'est distribué ou modifié.

## TIMELINE_CANON

- Tous les roots sont `careerPhaseIs: active` et `ageAtLeastMonths >= 180`.
- Le batch utilise uniquement des Marines, civils et officiers locaux/originaux non persistants; aucun personnage canon majeur.
- Aucun outcome canon majeur n'est remplacé ou altéré.
- Les hauts grades sont des jalons tardifs V1 et ne confèrent aucun rôle canon précis ni décision historique protégée.
- La Lifetime reste une affaire institutionnelle périphérique et géographiquement réutilisable.

## DICE_STATS_TRAITS_LOCATIONS_COVERAGE

- **Roots avec DiceCheck:** 9/20 (45%).
- **Seuils employés:** uniquement 8 / 11 / 14 / 17.
- **Stats D20 couvertes:** `strength`, `agility`, `observation`, `intelligence`, `navigation`, `charisma`; `health` n'est jamais un `statId`.
- **Effets de Stats:** ±1/±2 ordinaires; aucun ±4/±5; jamais plus de deux Stats D20 modifiées dans un Outcome.
- **Traits:** uniquement en Conditions/modificateurs contextuels; aucun Trait accordé; aucune opposition violée.
- **Reputation:** modifications explicitement liées à des actes narrés; aucune lecture morale implicite.
- **Géographie:** `marine_services`, `coastal`, `urban`, `city`, `isAtSea`; pas de longue liste `locationIs`.
- **Résolvabilité V4.1:** chaque Event possède au moins une Choice sans `availableIf`.

## SCHEDULED_OUTSIDE_LIFETIME

Quatre roots créent une conséquence lisible hors Lifetime:
- `active_marine_01_storm_quay_rescue` → `active_marine_01_storm_quay_rescue_return`;
- `active_marine_01_civilian_testimony` → `active_marine_01_civilian_testimony_echo`;
- `active_marine_01_missing_patrol_launch` → `active_marine_01_missing_patrol_launch_return`;
- `active_marine_01_casualty_report` → `active_marine_01_casualty_report_board`.

Avec le seed Lifetime, cela donne 5/20 roots initiant un Scheduled (25%).

## TRAVEL_GEOGRAPHY

None. Le batch n'utilise aucun `moveToLocation`, ne crée aucun ingress/egress, aucune transition parent/sous-location, aucune transition gated/special, aucun cross-route et ne contribue pas à la couverture de déplacement normal. Aucun `recoverTravel`, `dead_end_on_land` ou `dead_end_at_sea` n'est authoré.

## DEPENDENCIES

- `CONTENT_SCHEMA_VERSION = 6`.
- Catalogue V1 existant des Careers/ranks, Traits et metadata de Locations.
- Aucune dépendance obligatoire à un autre batch Event.
- Aucun nouvel ID persistant requis.

## DEDUP_NOTES

- Contrôle effectué contre le ledger `EVENT_CONCEPT_INDEX` disponible avant authoring.
- Le snapshot accepté ne contient pas encore de batch Active; aucun root accepté n'emploie ces conceptKeys.
- Les prémisses sont des responsabilités adultes et institutionnelles Marine: transfert de prisonnier, responsabilité de commandement, témoignage protégé, fraude de saisie, signal falsifié, secours sous ordre contradictoire et progression de grade.
- Aucun root Childhood n'est repris avec un simple changement d'âge.
- Distinction conservée avec Generic Sea (navigation ordinaire), Port/Trade (transaction comme enjeu principal), Crew Social et Pirate.

## VALIDATION_SUMMARY

- Normal: 20
- Immediate: 14
- Scheduled: 30
- Signature Immediate max depth: 5
- Secondary Immediate roots depth 3: 3
- Lifetime depth: 14
- Lifetime reachable Scheduled nodes: 26
- Lifetime meaningful structural divergences: 3
- Root Dice: 9/20
- Roots initiating Scheduled: 5/20
- Forbidden authored recovery/fallback Events: 0
- New persistent definitions: 0
