# ACTIVE_CREW_SOCIAL_01

Batch ID: `ACTIVE_CREW_SOCIAL_01`  
Préfixe: `active_crew_social_01`  
Contrat runtime ciblé: `CONTENT_SCHEMA_VERSION = 6`  
Scope: Active — vie d’équipage / groupe, sans système de management.

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `active_crew_social_01_shared_risk_rule` | `sharedRiskCustom` | 15+ | crewSizeAtLeast(2), tout contexte |
| `active_crew_social_01_wreck_rescue_dissent` | `wreckRescueDissent` | 15+ | hasCrew + hasShip + at sea |
| `active_crew_social_01_hidden_wound` | `hiddenCrewInjury` | 15+ | hasCrew |
| `active_crew_social_01_navigator_helmsman_split` | `navigatorHelmsmanMethodSplit` | 15+ | at sea + ship + navigator + helmsman |
| `active_crew_social_01_hidden_common_stash` | `hiddenCommonStash` | 15+ | crewSizeAtLeast(2) |
| `active_crew_social_01_missed_watch_confession` | `missedWatchConfession` | 15+ | hasCrew |
| `active_crew_social_01_crew_without_medic` | `crewWithoutMedic` | 15+ | hasCrew + no medic |
| `active_crew_social_01_fear_after_near_miss` | `fearAfterNearMiss` | 15+ | hasCrew |
| `active_crew_social_01_one_good_bed` | `singleBedRecognition` | 15+ | hasCrew + on land + lodging |
| `active_crew_social_01_dangerous_shortcut_debate` | `dangerousShortcutDebate` | 15+ | hasCrew + ship + at sea |
| `active_crew_social_01_career_order_vs_crew` | `careerOrderVsCrewNeed` | 15+ | hasCrew, toutes Careers |
| `active_crew_social_01_mira_recruitment_offer` | `miraRecruitmentOffer` | 15+ | leader + crew_recruitment + canRecruitNpc(mira) |
| `active_crew_social_01_cook_rest_boundary` | `cookRestBoundary` | 15+ | hasCrewRole(cook) |
| `active_crew_social_01_musician_refuses_performance` | `musicianRefusesPerformance` | 15+ | hasCrewRole(musician) |
| `active_crew_social_01_scholar_unverified_secret` | `scholarUnverifiedSecret` | 15+ | hasCrewRole(scholar) |
| `active_crew_social_01_quartermaster_personal_debt` | `quartermasterPersonalDebt` | 15+ | hasCrewRole(quartermaster) |
| `active_crew_social_01_gunner_warning_dispute` | `gunnerWarningDispute` | 15+ | gunner + ship + at sea |
| `active_crew_social_01_fighter_shore_provocation` | `fighterShoreProvocation` | 15+ | fighter + on land + settlement |
| `active_crew_social_01_shipwright_overwork_boundary` | `shipwrightOverworkBoundary` | 15+ | hasCrewRole(shipwright) |
| `active_crew_social_01_night_shift_swap` | `nightShiftSwap` | 15+ | crewSizeAtLeast(2) |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `active_crew_social_01_wreck_rescue_dissent`  
**arcKey:** `wreckRescueDissentCascade`  
**Maximum reachable Immediate depth:** **5**  
**Premise:** Un sauvetage de naufragés divise le crew sur le risque acceptable, puis la scène continue à travers ligne, second rescapé, peur d’un membre, dernier effort et débrief immédiat.

## SECONDARY_IMMEDIATE_ARCS

- active_crew_social_01_hidden_wound — **arcKey:** hiddenWoundDutyArc — **depth 3** — Une blessure cachée devient une discussion continue sur honte, vérité des limites et redistribution immédiate des tâches.
- active_crew_social_01_navigator_helmsman_split — **arcKey:** helmMethodSplitArc — **depth 3** — Navigator et helmsman défendent deux lectures opposées du même risque jusqu’à ce que le crew sépare méthode, camps et responsabilité.
- active_crew_social_01_hidden_common_stash — **arcKey:** hiddenStashTrustArc — **depth 3** — Une petite réserve cachée révèle peur, second secret et frontière entre sécurité commune et vie privée.

## LIFETIME_THREADS

### active_crew_social_01_shared_risk_rule — sharedRiskCulture

**Ancre durable:** La culture informelle du crew sur la manière de décider quand le risque, la responsabilité et le coût sont partagés ; continuité reconstruite uniquement par History et la chaîne verticale des Scheduled Events, sans Flag, NPC de thread ni état persistant nouveau.  
**Longest reachable Scheduled depth:** 15  
**Total distinct reachable Scheduled EventDefinitions:** 29  
**Vrais points de divergence long-terme:** 3 — (1) voix égales / commandement assumé / expertise temporaire ; (2) protection du refus / discipline d’exécution / compromis de rôle ; (3) culture finale ouverte / resserrée / fondée sur expertise.  
**Topologie:** `strongly_branching` — les deux premiers splits maintiennent 2–3 chapitres distincts avant reconvergence ; le troisième reste terminalement séparé sur trois chapitres par branche.  
**Span visé:** environ 14–18 ans après un seed Active, avec gaps de 6 à 24 mois ; conclusion typique à la fin de la vingtaine ou au début de la trentaine selon l’âge du seed et la branche.

Verticalité: seed → `culture_first_test`, puis chaque Scheduled ne programme que son/ses successeur(s) direct(s). Aucun pré-queue de thread complète.

## ROOT_EVENTS

- `active_crew_social_01_shared_risk_rule`
- `active_crew_social_01_wreck_rescue_dissent`
- `active_crew_social_01_hidden_wound`
- `active_crew_social_01_navigator_helmsman_split`
- `active_crew_social_01_hidden_common_stash`
- `active_crew_social_01_missed_watch_confession`
- `active_crew_social_01_crew_without_medic`
- `active_crew_social_01_fear_after_near_miss`
- `active_crew_social_01_one_good_bed`
- `active_crew_social_01_dangerous_shortcut_debate`
- `active_crew_social_01_career_order_vs_crew`
- `active_crew_social_01_mira_recruitment_offer`
- `active_crew_social_01_cook_rest_boundary`
- `active_crew_social_01_musician_refuses_performance`
- `active_crew_social_01_scholar_unverified_secret`
- `active_crew_social_01_quartermaster_personal_debt`
- `active_crew_social_01_gunner_warning_dispute`
- `active_crew_social_01_fighter_shore_provocation`
- `active_crew_social_01_shipwright_overwork_boundary`
- `active_crew_social_01_night_shift_swap`

## IMMEDIATE_EVENTS

- `active_crew_social_01_i_rescue_dissent_line`
- `active_crew_social_01_i_rescue_dissent_second_voice`
- `active_crew_social_01_i_rescue_dissent_frozen_hands`
- `active_crew_social_01_i_rescue_dissent_last_pull`
- `active_crew_social_01_i_rescue_dissent_debrief`
- `active_crew_social_01_i_hidden_wound_confront`
- `active_crew_social_01_i_hidden_wound_tasks`
- `active_crew_social_01_i_hidden_wound_group`
- `active_crew_social_01_i_helm_split_current`
- `active_crew_social_01_i_helm_split_sides`
- `active_crew_social_01_i_helm_split_call`
- `active_crew_social_01_i_stash_confront`
- `active_crew_social_01_i_stash_second_secret`
- `active_crew_social_01_i_stash_boundary`

## SCHEDULED_EVENTS

- `active_crew_social_01_s_stash_echo`
- `active_crew_social_01_s_missed_watch_second_chance`
- `active_crew_social_01_s_mira_first_course`
- `active_crew_social_01_s_gunner_warning_echo`
- `active_crew_social_01_s_culture_first_test`
- `active_crew_social_01_s_culture_voice_or_order`
- `active_crew_social_01_s_culture_open_floor_1`
- `active_crew_social_01_s_culture_open_floor_2`
- `active_crew_social_01_s_culture_command_1`
- `active_crew_social_01_s_culture_command_2`
- `active_crew_social_01_s_culture_expertise_1`
- `active_crew_social_01_s_culture_expertise_2`
- `active_crew_social_01_s_culture_outsider_mirror`
- `active_crew_social_01_s_culture_dissent_split`
- `active_crew_social_01_s_culture_dissent_protect_1`
- `active_crew_social_01_s_culture_dissent_protect_2`
- `active_crew_social_01_s_culture_dissent_protect_3`
- `active_crew_social_01_s_culture_discipline_1`
- `active_crew_social_01_s_culture_discipline_2`
- `active_crew_social_01_s_culture_compromise_1`
- `active_crew_social_01_s_culture_compromise_2`
- `active_crew_social_01_s_culture_credit_test`
- `active_crew_social_01_s_culture_fear_clause`
- `active_crew_social_01_s_culture_final_split`
- `active_crew_social_01_s_culture_open_final_1`
- `active_crew_social_01_s_culture_open_final_2`
- `active_crew_social_01_s_culture_open_final_end`
- `active_crew_social_01_s_culture_tight_final_1`
- `active_crew_social_01_s_culture_tight_final_2`
- `active_crew_social_01_s_culture_tight_final_end`
- `active_crew_social_01_s_culture_expert_final_1`
- `active_crew_social_01_s_culture_expert_final_2`
- `active_crew_social_01_s_culture_expert_final_end`

## PERSISTENT_IDS_USED

- NPC: `mira` uniquement.
- Crew roles: `navigator`, `medic`, `cook`, `shipwright`, `helmsman`, `gunner`, `musician`, `scholar`, `fighter`, `quartermaster`.
- Traits utilisés/acquis ou testés: `disciplined`, `rebellious`, `protective`, `loyal`, `disloyal`, `sociable`, `suspicious`, `resourceful`, `impulsive`.
- Careers testées: `civilian`, `pirate` ; les autres Careers restent éligibles via le tronc commun Active. Aucun changement de Career/rank/title.
- Locations persistantes nommées: None. Géographie seulement via `isAtSea`, `isOnLand`, `locationHasTag`, `locationHasService`.
- Items / Flags / Ships acquis / Fruits / Haki / Endings: None.

## DEPENDENCIES

- Catalogue runtime v6 avec les CrewRoles V1.
- `mira` doit rester le NPC persistant existant de rôle `navigator` pour le root de recrutement.
- Aucune dépendance à un autre batch Active.

## CAREER_RANK_TITLE_BOUNTY_CONTEXT

- Aucun changement de Career, rank, title ou bounty.
- `active_crew_social_01_career_order_vs_crew` est multi-Career ; options spécifiques `civilian` et `pirate` restent visibles mais conditionnées.
- Reputation n’est modifiée que lorsqu’une scène rend réellement le groupe visible publiquement (sauvetage raconté, coup de semonce/rumeur, provocation publique, réussite publique de Lifetime), avec amplitudes mineures `+1/+2`.

## SHIP_CREW_POWERS_CONTEXT

- Crew uniquement via NPC `status === crew`, `hasCrew`, `crewSizeAtLeast` et CrewRoles existants.
- Aucun rôle ne confère de bonus global ; les modificateurs de Dice liés à un rôle sont explicitement authorés dans la scène concernée.
- `mira` est recrutée uniquement via `canRecruitNpc(mira)` + `isLeader` + service `crew_recruitment`.
- Navire testé uniquement lorsque la scène maritime l’exige ; aucune acquisition, upgrade, flotte ou module.
- Aucun Fruit ou Haki distribué, éveillé ou modifié.

## TIMELINE_CANON

- Tous les roots exigent `careerPhaseIs(active)` et `ageAtLeastMonths(180)`.
- Aucun NPC canon majeur ni outcome canon protégé.
- Le contenu est périphérique/générique et compatible avec le démarrage Active contemporain du début du voyage de Luffy.

## DICE_STATS_TRAITS_LOCATIONS_COVERAGE

- Roots avec DiceCheck: **9** (`active_crew_social_01_wreck_rescue_dissent`, `active_crew_social_01_hidden_wound`, `active_crew_social_01_navigator_helmsman_split`, `active_crew_social_01_hidden_common_stash`, `active_crew_social_01_crew_without_medic`, `active_crew_social_01_dangerous_shortcut_debate`, `active_crew_social_01_career_order_vs_crew`, `active_crew_social_01_fighter_shore_provocation`, `active_crew_social_01_night_shift_swap`).
- Stats D20 utilisées: `navigation`, `observation`, `charisma`, `intelligence` ; `health` n’est jamais un `statId` D20.
- Seuils: 11 et 14 uniquement ; chaque DiceCheck possède exactement les quatre outcomes requis.
- Traits acquis: `disciplined`, `protective`, `loyal` ; `disciplined` est bloqué si `rebellious`, `loyal` est bloqué si `disloyal`.
- Tags/services utilisés: `urban`, `port`, `village`, `lodging`, `crew_recruitment`.

## SCHEDULED_HORS_LIFETIME

- `active_crew_social_01_hidden_common_stash` → `active_crew_social_01_s_stash_echo` (4 mois).
- `active_crew_social_01_missed_watch_confession` → `active_crew_social_01_s_missed_watch_second_chance` (3 mois).
- `active_crew_social_01_mira_recruitment_offer` → `active_crew_social_01_s_mira_first_course` (2 mois ; pending hors crew, annulé uniquement si Mira est `dead`).
- `active_crew_social_01_gunner_warning_dispute` → `active_crew_social_01_s_gunner_warning_echo` (5 mois ; pending jusqu’à un contexte de settlement à terre).

## TRAVEL_MOVEMENT

None. Le batch ne contient aucun `moveToLocation`, aucun `recoverTravel` et ne contribue pas directement à la couverture de déplacement normal. Ingress/egress, transitions parent/sous-location, gated/special et cross-route: None.

## DEDUP_NOTES

- Anti-reskin effectué contre le ledger Childhood accepté (`CH_GENERIC_EARLY_01`, `CH_GENERIC_LATE_01`, `CH_FAMILY_SOCIAL_01`, `CH_IDENTITY_WORLD_01`, quatre Blues).
- Le thème de responsabilité ne reprend pas `sharedCredit`, `borrowedBucket`, `chainOfFavors` ou `ledgerOfObligations`: ici la causalité est adulte, structurée par un crew réel, des rôles, des risques communs et des conséquences Active.
- La Lifetime `sharedRiskCulture` ne duplique ni une pratique personnelle, ni une chaîne de faveurs, ni un registre d’obligations, ni un carnet/atlas, ni un héritage local : elle suit la culture décisionnelle d’un crew et ses transformations sur plusieurs années.
- `singleBedRecognition` traite une récompense indivisible et la jalousie de groupe, pas l’attribution publique d’un crédit de travail comme `sharedCredit` Childhood.
- `hiddenCommonStash` traite peur/autonomie/sécurité commune et non la réparation secrète d’un objet ou un emprunt d’outil.

## PROPOSED_DEFINITIONS

None.
