# CH_FAMILY_SOCIAL_01
## Batch ID et scope
- **Batch ID:** `CH_FAMILY_SOCIAL_01`
- **Préfixe:** `ch_family_social_01`
- **Scope:** Childhood (~1–14 ans), famille, structure familiale, position sociale, héritage d’affiliation, obligations et accès.
- **Persistent definitions nouvelles:** aucune.
- **Roots:** exactement 20 `kind: normal`, one-shot V1.
## Root Event IDs
- `ch_family_social_01_shared_bowl`
- `ch_family_social_01_two_promises`
- `ch_family_social_01_late_lantern`
- `ch_family_social_01_borrowed_shoes`
- `ch_family_social_01_doorstep_guest`
- `ch_family_social_01_market_errand`
- `ch_family_social_01_family_badge`
- `ch_family_social_01_orphan_signature`
- `ch_family_social_01_tuition_offer`
- `ch_family_social_01_household_ledger`
- `ch_family_social_01_work_for_supper`
- `ch_family_social_01_family_reputation`
- `ch_family_social_01_formal_dinner`
- `ch_family_social_01_eviction_notice`
- `ch_family_social_01_friend_at_gate`
- `ch_family_social_01_parent_weak_day`
- `ch_family_social_01_inheritance_question`
- `ch_family_social_01_community_collection`
- `ch_family_social_01_family_name_price`
- `ch_family_social_01_leaving_table`

## Immediate Events
- `ch_family_social_01_doorstep_guest_i1`
- `ch_family_social_01_doorstep_guest_i2`
- `ch_family_social_01_doorstep_guest_i3`
- `ch_family_social_01_eviction_notice_i1`
- `ch_family_social_01_eviction_notice_i2`
- `ch_family_social_01_eviction_notice_i3`
- `ch_family_social_01_formal_dinner_i1`
- `ch_family_social_01_formal_dinner_i2`
- `ch_family_social_01_formal_dinner_i3`
- `ch_family_social_01_market_errand_i1`
- `ch_family_social_01_market_errand_i2`
- `ch_family_social_01_market_errand_i3`
- `ch_family_social_01_market_errand_i4`
- `ch_family_social_01_market_errand_i5`

## Scheduled Events
- `ch_family_social_01_family_badge_echo`
- `ch_family_social_01_family_name_price_echo`
- `ch_family_social_01_late_lantern_return`
- `ch_family_social_01_ledger_a3_carry_burden`
- `ch_family_social_01_ledger_a4_household_asks_more`
- `ch_family_social_01_ledger_a5_boundary_test`
- `ch_family_social_01_ledger_b3_audit_old_entry`
- `ch_family_social_01_ledger_b4_contradiction_found`
- `ch_family_social_01_ledger_b5_rewrite_terms`
- `ch_family_social_01_ledger_c10_cost_of_loyalty`
- `ch_family_social_01_ledger_c11_seat_at_table`
- `ch_family_social_01_ledger_c9_stand_by_home`
- `ch_family_social_01_ledger_d10_quiet_distance`
- `ch_family_social_01_ledger_d11_name_without_debt`
- `ch_family_social_01_ledger_d9_break_with_claim`
- `ch_family_social_01_ledger_s12_late_letter`
- `ch_family_social_01_ledger_s13_last_account`
- `ch_family_social_01_ledger_s14_what_remains`
- `ch_family_social_01_ledger_s1_first_request`
- `ch_family_social_01_ledger_s2_terms_named`
- `ch_family_social_01_ledger_s6_news_from_home`
- `ch_family_social_01_ledger_s7_shared_cost`
- `ch_family_social_01_ledger_s8_public_reckoning`
- `ch_family_social_01_parent_weak_day_return`

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal | Mécanique dominante | Traits/NPC/Items utilisés | Immediate | Scheduled |
|---|---|---|---|---|---|---|---|
| `ch_family_social_01_shared_bowl` | `shared_bowl` | 1–3 ans | foyer / repas familial | Trait + choix social | Traits generous/greedy | — | — |
| `ch_family_social_01_two_promises` | `two_promises` | 3–7 ans | foyer à deux parents | relations parentales | NPC player_parent_1/player_parent_2 | — | — |
| `ch_family_social_01_late_lantern` | `late_lantern` | 3–7 ans | foyer monoparental | Stat + relation + callback | NPC player_parent_1 | — | ch_family_social_01_late_lantern_return |
| `ch_family_social_01_borrowed_shoes` | `borrowed_shoes` | 4–8 ans | vie sociale pauvre/modeste | Dice Agility | Social Class poor/modest | — | — |
| `ch_family_social_01_doorstep_guest` | `doorstep_guest` | 5–8 ans | foyer / quartier | Secondary Immediate depth 3 + Dice Observation | aucun persistent nouveau | ch_family_social_01_doorstep_guest_i1 → ch_family_social_01_doorstep_guest_i2 → ch_family_social_01_doorstep_guest_i3 | — |
| `ch_family_social_01_market_errand` | `market_errand` | 5–8 ans | service general_goods / marché local | Signature Immediate depth 5 + Dice Charisma | aucun persistent nouveau | ch_family_social_01_market_errand_i1 → ch_family_social_01_market_errand_i2 → ch_family_social_01_market_errand_i3 → ch_family_social_01_market_errand_i4 → ch_family_social_01_market_errand_i5 | — |
| `ch_family_social_01_family_badge` | `family_badge` | 6–8 ans | héritage d’affiliation familiale | Stat + callback | Affiliation Origins non-civilian | — | ch_family_social_01_family_badge_echo |
| `ch_family_social_01_orphan_signature` | `orphan_signature` | 6–8 ans | institution locale / orphelin | Narratif + Stat | Family Structure orphan | — | — |
| `ch_family_social_01_tuition_offer` | `tuition_offer` | 9–12 ans | atelier / accès social | Dice Intelligence | Social Class variable | — | — |
| `ch_family_social_01_household_ledger` | `household_ledger` | 10–14 ans | foyer / réseau de quartier | Lifetime Thread seed | History; aucune nouvelle définition | — | ch_family_social_01_ledger_s1_first_request |
| `ch_family_social_01_work_for_supper` | `work_for_supper` | 9–12 ans | service food / pauvreté ou orphelinat | Dice Strength | Social poor ou Family orphan | — | — |
| `ch_family_social_01_family_reputation` | `family_reputation` | 10–14 ans | quartier / réputation familiale | Dice Observation | Affiliation Origins non-civilian | — | — |
| `ch_family_social_01_formal_dinner` | `formal_dinner` | 11–14 ans | milieu aisé / table formelle | Secondary Immediate depth 3 + Dice Morale | Social Class wealthy | ch_family_social_01_formal_dinner_i1 → ch_family_social_01_formal_dinner_i2 → ch_family_social_01_formal_dinner_i3 | — |
| `ch_family_social_01_eviction_notice` | `eviction_notice` | 10–14 ans | foyer pauvre/modeste | Secondary Immediate depth 3 + Dice Intelligence | Social poor/modest | ch_family_social_01_eviction_notice_i1 → ch_family_social_01_eviction_notice_i2 → ch_family_social_01_eviction_notice_i3 | — |
| `ch_family_social_01_friend_at_gate` | `friend_at_gate` | 9½–13½ ans | seuil du foyer / écart de classe | Dice Luck | Social Class variable | — | — |
| `ch_family_social_01_parent_weak_day` | `parent_weak_day` | 10½–14½ ans | foyer avec parent | Stat + relation + callback | NPC player_parent_1 | — | ch_family_social_01_parent_weak_day_return |
| `ch_family_social_01_inheritance_question` | `inheritance_question` | 11½–14½ ans | foyer / transmission | Trait durable | Traits loyal/disloyal/proud | — | — |
| `ch_family_social_01_community_collection` | `community_collection` | 9–13 ans | quartier / entraide | Dice Charisma + Trait | Traits protective/resourceful | — | — |
| `ch_family_social_01_family_name_price` | `family_name_price` | 12–14½ ans | commerce / héritage d’affiliation | Stat + callback | Affiliation Origins non-civilian | — | ch_family_social_01_family_name_price_echo |
| `ch_family_social_01_leaving_table` | `leaving_table` | 13–14 ans | foyer / approche de l’âge adulte | Narratif + Stat | Family/Social Origins | — | — |

## IDs persistants existants utilisés
- **NPCs:** `player_parent_1`, `player_parent_2`.
- **Traits acquis/utilisés:** `generous`, `greedy`, `loyal`, `disloyal`, `proud`, `protective`, `resourceful`.
- **FamilyStructure:** `two_parents`, `single_parent`, `orphan`.
- **SocialClass:** `poor`, `modest`, `wealthy`.
- **Family affiliations testées:** tous les IDs runtime via logique générique, avec roots dédiés aux affiliations non-`civilian`; aucune affiliation de carrière Active.
- **Services:** `general_goods`, `food`.
- **Items/Ships/Fruits/Career ranks/titles/bounty:** aucun.

## PROPOSED_DEFINITIONS

`None`

## Dépendances

Aucune dépendance sur un autre batch. Les callbacks et la Lifetime Thread sont entièrement contenus dans ce ZIP.

## Timeline / canon sensibles
- Tous les roots imposent `careerPhaseIs: childhood` et restent sous `ageMonths < 180`.
- Aucun personnage canon majeur, aucun changement de résultat canon, aucun voyage Grand Line/New World.
- Aucun Haki, Devil Fruit, navire personnel, carrière Active, rank/title/bounty.
- La Lifetime Thread peut continuer en Active mais reste centrée sur lettres, nouvelles et obligations sociales; elle ne téléporte aucun parent/NPC.

## Résumé de couverture
- **DiceCheck roots:** 10/20.
- **Roots créant directement du Scheduled:** 5/20 (dont 1 Lifetime seed + 4 callbacks hors Lifetime).
- **Mini-arcs Immediate qualifiants:** 4 (1 Signature depth 5 + 3 Secondary depth 3).
- **Stats de DiceCheck:** `agility`, `charisma`, `intelligence`, `luck`, `morale`, `observation`, `strength`.
- **Traits acquis:** `ambitious`, `generous`, `greedy`, `loyal`, `protective`, `proud`, `resourceful`.
- **Structures familiales couvertes:** `two_parents`, `single_parent`, `orphan`.
- **Classes sociales couvertes:** `poor`, `modest`, `wealthy`.
- **Locations couvertes:** aucune Location ID hard-codée; contextes de foyer/quartier réutilisables dans les quatre Blues.
- **Tags couverts:** aucun tag requis.
- **Services couverts:** `general_goods`, `food`.
- **Répartition âge:** 8 roots early (1–8 ans), 12 roots late (9–14 ans).
- **Orientation de contenu approximative:** 12 roots principalement Stats, 3 roots Traits, 5 roots narratifs/non-stat dominants.

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `ch_family_social_01_market_errand`

**arcKey:** `market_ledger_dispute`

**Maximum reachable Immediate depth:** **5**

**Premise:** Une simple course familiale révèle un faux ajout dans le carnet du marché, puis une chaîne de décisions sur dette, entraide et responsabilité se déroule sans ellipse.

## SECONDARY_IMMEDIATE_ARCS

- ch_family_social_01_doorstep_guest — **arcKey:** `threshold_dispute` — **depth 3** — Un inconnu demande refuge; la scène devient un conflit de versions et de limites du foyer.
- ch_family_social_01_formal_dinner — **arcKey:** `formal_table_status` — **depth 3** — Un dîner aisé transforme une remarque de classe en test continu de place, dignité et prise de parole.
- ch_family_social_01_eviction_notice — **arcKey:** `door_notice_collective` — **depth 3** — Un avis de paiement déclenche une négociation continue sur comptes, biens essentiels et entraide de quartier.

## LIFETIME_THREADS

### ch_family_social_01_household_ledger — ledger_of_obligations

- `lifetimeThreadSeed: true` confirmé sur le seed Normal.
**Ancre durable:** le registre communautaire des services rendus/reçus et, plus largement, la relation du personnage à ce que son foyer et son quartier estiment lui être dû ou lui devoir. Aucun nouveau NPC persistant.

**Longest reachable Scheduled depth:** 14

**Total distinct reachable Scheduled EventDefinitions:** 20

**Vrais points de divergence long-terme:** 2

**Topologie:** strongly_branching

**Span visé:** environ 15–17 ans possibles après le seed selon le chemin et les délais; conçu pour traverser Childhood → Active.

**Principaux points de branche:**
1. `ledger_s2_terms_named`: `carry_duty` → branche A (`A3→A4→A5`) ; `audit_history` → branche B (`B3→B4→B5`) ; `leave_ledger` termine tôt. Les branches restent distinctes sur trois Scheduled avant reconvergence à S6.
2. `ledger_s8_public_reckoning`: défense publique du lien → branche C (`C9→C10→C11`) ; rupture de la prétention familiale → branche D (`D9→D10→D11`) ; le DiceCheck `speak_without_notes` envoie ses succès vers C et ses échecs vers D. Les branches restent distinctes sur trois Scheduled avant reconvergence à S12.
**Persistance / reconvergence:** les splits A/B et C/D restent chacun séparés pendant trois chapitres; S12 lit l’historique (`hasPlayed`) pour proposer des lectures conditionnelles liées à la branche C ou D, avec un fallback toujours disponible.

**Fins anticipées majeures:** `leave_ledger` à S2; plusieurs sorties de branche à A3/A4/A5, B3/B4/B5, C9/C10, D9/D10. Elles représentent refus, rupture, limite ou retrait réels, jamais un nœud inaccessible.

**Verticalité:** chaque chapitre programme seulement le prochain chapitre issu de son résultat; le seed ne pré-queue que S1.

## DEDUP_NOTES
Le `EVENT_CONCEPT_INDEX` courant ne contient aucun batch accepté après reset. Les 20 roots restent néanmoins distincts entre eux par prémisse et par structure : partage alimentaire, conflit entre deux parents, absence d’un parent seul, vêtement emprunté, seuil domestique, course/comptes de marché, héritage d’affiliation, formulaire d’orphelin, accès à l’apprentissage, registre d’obligations, travail contre repas, réputation familiale, dîner de classe, menace de logement, amitié interclasse, fatigue parentale, transmission symbolique, collecte collective, privilège lié au nom et attentes avant l’âge adulte. Les quatre arcs long-form n’emploient pas le même squelette narratif et la Lifetime Thread traite l’évolution biographique d’une obligation sociale plutôt qu’un simple callback répétitif.

## Validation locale effectuée
- 20 roots Normal exactement; préfixes et IDs uniques.
- Signature depth 5 et trois Secondary depth 3 vérifiés par parcours de graphe.
- Lifetime: 20 Scheduled atteignables, longest path 14, graphe acyclique, vertical.
- 2 divergences persistantes authorées, chacune avec trois chapitres séparés avant reconvergence; fins anticipées présentes.
- 10 roots avec DiceCheck; chaque DiceCheck possède les quatre outcomes.
- Chaque Event a au moins une Choice sans `availableIf`; invariant de résolvabilité satisfait.
- Toutes les références `queueImmediateEvent` / `scheduleEvent` pointent vers un Event du batch.
- Toutes les localization keys référencées existent dans le `localization/fr.json` du batch.
- Aucune Condition/Effect hors contrat V6 utilisée; aucune nouvelle définition persistante silencieuse.
- Acquisition de Traits opposés protégée par `availableIf`; aucun remplacement silencieux.
- Aucun script du repository n’a été exécuté; validation effectuée localement sur les JSON générés selon le contrat fourni.
