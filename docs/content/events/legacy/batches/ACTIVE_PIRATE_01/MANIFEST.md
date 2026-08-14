# ACTIVE_PIRATE_01 — MANIFEST

Batch ID: `ACTIVE_PIRATE_01`  
Prefix: `active_pirate_01`  
Schema target: `CONTENT_SCHEMA_VERSION = 6`  
Scope: Active / Pirate. 20 one-shot Normal roots, plus Immediate and Scheduled descendants.

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `active_pirate_01_registry_break` | `publicRegistryDefiance` | 15+ | Port, civil → choix explicite de devenir Pirate ou non |
| `active_pirate_01_false_tribute_collectors` | `falseTributeInYourName` | 15+ | Port; Pirate; réputation ≥ 3 |
| `active_pirate_01_rival_crosses_bow` | `rivalFlagProvocation` | 15+ | Mer; Pirate; navire |
| `active_pirate_01_refuge_with_price` | `refugeForBetrayal` | 15+ | Terre criminelle / pirate / marché noir |
| `active_pirate_01_spoils_under_lantern` | `pirateSpoilsCode` | 15+ | Pirate; Crew |
| `active_pirate_01_borrowed_flag` | `borrowedPirateFlag` | 15+ | Port; Pirate; Lifetime seed |
| `active_pirate_01_choose_the_target` | `pirateTargetSelection` | 15+ | Mer; Pirate; navire; Leader |
| `active_pirate_01_merchant_under_shadow` | `chosenPirateProtection` | 15+ | Port + trade; Pirate |
| `active_pirate_01_old_attack_returns` | `victimOfPastRaidReturns` | 15+ | Port; après tentative de raid marchand |
| `active_pirate_01_marine_patrol_question` | `marineDescriptionCheck` | 15+ | Terre + présence Marine; Pirate |
| `active_pirate_01_surrendered_rival` | `pirateSurrenderTerms` | 15+ | Mer; Pirate; navire |
| `active_pirate_01_revenge_vote` | `crewDemandsPirateRevenge` | 15+ | Pirate; Crew; après rivalité |
| `active_pirate_01_black_market_name` | `rentYourCriminalName` | 15+ | Marché noir; Pirate; réputation ≥ 5 |
| `active_pirate_01_storm_truce` | `pirateStormTruce` | 15+ | Mer; deux équipages pirates |
| `active_pirate_01_shuttered_quay` | `civiliansFearYourFlag` | 15+ | Port/coastal; Pirate |
| `active_pirate_01_boastful_rookie` | `absurdPirateStoryContest` | 15+ | Food/lodging; Pirate |
| `active_pirate_01_poster_revision` | `bountyRaisedAfterEscape` | 15+ | Port + présence Marine; bounty > 0; réputation ≥ 18 |
| `active_pirate_01_veteran_epithet` | `earnedVeteranEpithet` | 15+ | Food; Pirate; réputation ≥ 27 |
| `active_pirate_01_community_debt` | `communityBillsPirateProtection` | 15+ | Port; après protection marchande |
| `active_pirate_01_freedom_or_anchor` | `pirateFreedomResponsibility` | 15+ | Pirate; Crew; réputation ≥ 12 |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `active_pirate_01_false_tribute_collectors`  
**arcKey:** `falseTributeDockConfrontation`  
**Maximum reachable Immediate depth:** **5**  
**Premise:** Des racketteurs prélèvent une taxe en se réclamant du joueur ; la scène devient une confrontation continue sur l’usage de son nom, l’argent des victimes et l’arrivée de la Marine.

## SECONDARY_IMMEDIATE_ARCS

- active_pirate_01_rival_crosses_bow — **arcKey:** rivalFlagNerveGame — **depth 3** — Une provocation entre deux pavillons devient un défi continu de sang-froid en mer, sans moteur de combat.
- active_pirate_01_refuge_with_price — **arcKey:** refugeInspectionBargain — **depth 3** — Un refuge offert contre une dénonciation devient une inspection immédiate où le joueur doit décider qui il expose.
- active_pirate_01_spoils_under_lantern — **arcKey:** missingSpoilsCrewCode — **depth 3** — Une part manquante révèle une dette cachée et force l’équipage à définir son propre code de partage.

## LIFETIME_THREADS

### active_pirate_01_borrowed_flag — borrowedFlagLegacy

**Ancre durable:** Le pavillon du joueur, prêté à un petit port comme protection puis réinterprété par des communautés, collecteurs et équipages rivaux ; état reconstruit uniquement par History et le graphe Scheduled, sans nouveau persistent ID.  
**Longest reachable Scheduled depth:** **15**  
**Total distinct reachable Scheduled EventDefinitions:** **28** (27 chapitres/branches + 1 fallback de sortie de Career)  
**Vrais points de divergence long-terme:** **3** splits structurants, plus deux terminaisons anticipées crédibles.  
**Topologie:** `strongly_branching`. Split 1 à `02_first_claim` : bouclier gratuit A1→A3 vs contribution encadrée B1→B3, reconvergence seulement après trois chapitres matériellement distincts. Split 2 à `07_sea_trial` : quatre Dice outcomes ouvrent quatre branches de deux chapitres (respect, rancune, compromis, humiliation) avant reconvergence. Split 3 à `11_final_definition` : héritage bouclier A vs péage B sur trois chapitres chacun avant l’épilogue commun. Toute branche pending se transforme via `fallbackEventId` si la Career cesse d’être Pirate.  
**Span visé:** ~166 mois calendaires sur le chemin le plus long (~13,8 ans), avec delays de 6–18 mois ; Active uniquement, aucune garantie spéciale de sélection du seed.

### Verticalité et divergence
- Le seed ne programme que `borrowed_flag_01_echo`.
- Chaque Outcome de chapitre programme au plus un futur chapitre direct de la Lifetime.
- Aucun chapitre futur n’est pré-queue depuis le seed.
- Terminaisons anticipées : `02_first_claim/disown_symbol`, `07_sea_trial/withdraw_claim`, `11_final_definition/cut_loose`.
- Sortie de Career : tous les 27 chapitres principaux portent `cancelIf: not careerAffiliationIs(pirate)` + fallback `active_pirate_01_borrowed_flag_departure` ; le thread ne reste donc pas pending pour toujours après une vraie sortie Pirate.

## EVENT_LISTS

### Normal roots (20)
- `active_pirate_01_registry_break`
- `active_pirate_01_false_tribute_collectors`
- `active_pirate_01_rival_crosses_bow`
- `active_pirate_01_refuge_with_price`
- `active_pirate_01_spoils_under_lantern`
- `active_pirate_01_borrowed_flag`
- `active_pirate_01_choose_the_target`
- `active_pirate_01_merchant_under_shadow`
- `active_pirate_01_old_attack_returns`
- `active_pirate_01_marine_patrol_question`
- `active_pirate_01_surrendered_rival`
- `active_pirate_01_revenge_vote`
- `active_pirate_01_black_market_name`
- `active_pirate_01_storm_truce`
- `active_pirate_01_shuttered_quay`
- `active_pirate_01_boastful_rookie`
- `active_pirate_01_poster_revision`
- `active_pirate_01_veteran_epithet`
- `active_pirate_01_community_debt`
- `active_pirate_01_freedom_or_anchor`

### Immediate (14)
- `active_pirate_01_false_tribute_i1`
- `active_pirate_01_false_tribute_i2`
- `active_pirate_01_false_tribute_i3`
- `active_pirate_01_false_tribute_i4`
- `active_pirate_01_false_tribute_i5`
- `active_pirate_01_rival_bow_i1`
- `active_pirate_01_rival_bow_i2`
- `active_pirate_01_rival_bow_i3`
- `active_pirate_01_refuge_i1`
- `active_pirate_01_refuge_i2`
- `active_pirate_01_refuge_i3`
- `active_pirate_01_spoils_i1`
- `active_pirate_01_spoils_i2`
- `active_pirate_01_spoils_i3`

### Scheduled (32)
- `active_pirate_01_first_wanted_notice`
- `active_pirate_01_merchant_word_returns`
- `active_pirate_01_merchant_resentment_returns`
- `active_pirate_01_broker_sells_name`
- `active_pirate_01_borrowed_flag_01_echo`
- `active_pirate_01_borrowed_flag_02_first_claim`
- `active_pirate_01_borrowed_flag_03a_watchfire`
- `active_pirate_01_borrowed_flag_04a_false_alarm`
- `active_pirate_01_borrowed_flag_05a_cost`
- `active_pirate_01_borrowed_flag_03b_collection`
- `active_pirate_01_borrowed_flag_04b_missing_cut`
- `active_pirate_01_borrowed_flag_05b_fear`
- `active_pirate_01_borrowed_flag_06_crossroads`
- `active_pirate_01_borrowed_flag_07_sea_trial`
- `active_pirate_01_borrowed_flag_08a_terms`
- `active_pirate_01_borrowed_flag_09a_joint_signal`
- `active_pirate_01_borrowed_flag_08b_mockery`
- `active_pirate_01_borrowed_flag_09b_ambush_warning`
- `active_pirate_01_borrowed_flag_08c_shared_harbor`
- `active_pirate_01_borrowed_flag_09c_divided_credit`
- `active_pirate_01_borrowed_flag_08d_broken_word`
- `active_pirate_01_borrowed_flag_09d_rebuild_name`
- `active_pirate_01_borrowed_flag_10_returning_generation`
- `active_pirate_01_borrowed_flag_11_final_definition`
- `active_pirate_01_borrowed_flag_12a_rescue_request`
- `active_pirate_01_borrowed_flag_13a_crew_boundary`
- `active_pirate_01_borrowed_flag_14a_open_harbor`
- `active_pirate_01_borrowed_flag_12b_collectors`
- `active_pirate_01_borrowed_flag_13b_rebellion`
- `active_pirate_01_borrowed_flag_14b_price_of_fear`
- `active_pirate_01_borrowed_flag_15_last_harbor`
- `active_pirate_01_borrowed_flag_departure`

## PERSISTENT_IDS_USED

- Careers: `civilian`, `pirate`.
- Career Title: `veteran` only. No Pirate rank is used.
- Traits queried/granted: `audacious`, `competitive`, `deceptive`, `generous`, `merciful`, `ruthless`, `forgiving`, `vengeful`, `protective`, `proud`. Oppositions are guarded before acquisition.
- Crew roles queried: `quartermaster`. Generic Crew queried via `hasCrew`; no new NPC ID.
- Haki queried: Conqueror level 1 in one locked Choice; no Haki granted or awakened.
- Items: None. Flags: None. NPC IDs: None. Devil Fruit IDs: None. Ship chassis IDs: None (only generic `hasShip` / ship HP are used).
- Location IDs: None directly. Geography uses existing tags/services/sea-land context only.
- New persistent definitions: None.

## CAREER_RANK_TITLE_BOUNTY_CONTEXT

- 19/20 roots require `careerAffiliationIs: pirate`; `registry_break` is the sole Civilian entry door and applies `setCareerAffiliation: pirate` only in outcomes that explicitly narrate becoming an outlaw.
- Pirate has no rigid rank. No `setCareerRank` is used.
- `veteran_epithet` can explicitly set existing title `veteran` at Reputation ≥ 27, while excluding already-`veteran`/`legend` states.
- Bounty is changed only by narrated legal consequences: first wanted notice after public defiance, later Marine escape, and an explicit market-black report. Bounty never substitutes for owned Berrys.
- Reputation changes measure notoriety quantity; protective and ruthless acts can both increase it when publicly memorable.

## SHIP_CREW_POWERS_CONTEXT

- Ship is required only where the scene is genuinely maritime; command-sensitive target selection requires `isLeader`.
- No ship acquisition, sale, module, upgrade, fleet, generic combat engine or cargo Item is invented.
- Crew is used for Pirate code/responsibility scenes. No `captain` CrewRole, no global Crew buff, no NPC invented.
- Haki appears only as a visible locked special escape option. Devil Fruits are neither distributed nor awakened.

## TIMELINE_CANON

- Every root explicitly requires Active and `ageAtLeastMonths: 180`; Active therefore begins at player age 15 / Luffy ~17.
- No major canon character, canon crew, protected exploit or canon outcome is used.
- All Pirate organizations/crew opponents are event-local narrative roles rather than new persistent catalogue definitions.
- Lifetime span is intentionally multi-year and remains peripheral to protected canon outcomes.

## DICE_STATS_TRAITS_LOCATIONS_COVERAGE

- Dice roots: 9/20 (`active_pirate_01_registry_break`, `active_pirate_01_false_tribute_collectors`, `active_pirate_01_rival_crosses_bow`, `active_pirate_01_refuge_with_price`, `active_pirate_01_choose_the_target`, `active_pirate_01_marine_patrol_question`, `active_pirate_01_storm_truce`, `active_pirate_01_boastful_rookie`, `active_pirate_01_poster_revision`).
- Root Dice Stats: Agility, Charisma, Navigation, Observation; Lifetime adds Charisma. Thresholds use 11/14.
- Other deterministic stat changes use Morale, Intelligence, Strength, Observation, Charisma within ±1/±2 norms; Health is never a D20 stat.
- Trait acquisition is rare and guarded: `merciful` vs `ruthless`, `forgiving` vs `vengeful`. Other Traits mostly expose locked special approaches.
- Geography coverage: `isAtSea`, `isOnLand`, tags `port`, `coastal`, `criminal`, `pirate_presence`, `marine_presence`; services `trade`, `black_market`, `food`, `lodging`. Location context materially changes premises.

## SCHEDULED_OUTSIDE_LIFETIME

- `active_pirate_01_registry_break` → `active_pirate_01_first_wanted_notice` (2–3 mois): le premier avis de recherche après la rupture publique avec la légalité.
- `active_pirate_01_merchant_under_shadow` → `active_pirate_01_merchant_word_returns` ou `active_pirate_01_merchant_resentment_returns` (8 mois): réputation commerciale différente selon protection honnête ou racket.
- `active_pirate_01_black_market_name` → `active_pirate_01_broker_sells_name` (6–8 mois): le nom loué au marché noir réapparaît dans un rapport et peut explicitement augmenter la bounty.

## TRAVEL_MOVEMENT_COVERAGE

None. Le batch ne contient aucun `moveToLocation`. Il utilise les contextes port/terre/mer/Ship pour la vie Pirate locale et maritime sans contribuer à la couverture de déplacement normal. Ingress/egress, transitions parent/sous-location, gated/special et cross-route : None.

## DEPENDENCIES

- Runtime schema/content contract v6 and existing Career/Reputation/Bounty/Title/Ship/Crew/Haki primitives only.
- No dependency on another Active batch. Some roots depend only on History created inside this batch (`choose_the_target`, `merchant_under_shadow`, `rival_crosses_bow`).
- No new catalogue definition required.

## DEDUP_NOTES

- Compared against the supplied accepted `EVENT_CONCEPT_INDEX.md`, whose current accepted ledger is Childhood. No root conceptKey duplicates an accepted key.
- Adult Pirate stakes are not Childhood reskins: career entry, misuse of criminal notoriety, surrender terms, bounty escalation, refuge-for-betrayal, pirate protection, fear of a flag and long-term responsibility exist only after Active systems become meaningful.
- Scope separation: ordinary weather/navigation is not the core of `storm_truce` or `rival_crosses_bow`; transactions are secondary to Pirate identity in `merchant_under_shadow`/`black_market_name`; Crew scenes focus Pirate loot code/revenge rather than generic Crew management.
- Lifetime `borrowedFlagLegacy` is specifically about a Pirate flag becoming a distributed promise/racket across communities; it is distinct from generic maritime rivalry, generic economic networks and Childhood favor/debt threads.
- No withdrawn JSON or old batch content was reused.

## FINAL_SELF_CHECK

- 20 Normal roots exactly; 19 Pirate-gated + 1 Civilian entry.
- Signature d5: yes. Secondary d3 ×3 on distinct roots: yes.
- Lifetime: depth 15; 28 reachable Scheduled definitions including career-exit fallback; 3 major meaningful divergences; persistent multi-chapter splits; strict vertical scheduling.
- Dice roots: 9; every Dice resolution has exactly four outcomes.
- Every Event has at least one unconditional Choice; locked special options cannot deadlock resolution.
- `recoverTravel`, `dead_end_on_land`, `dead_end_at_sea`, `weight`, cooldown, repeatable, ArcState/threadId/questState: absent.
- No new persistent IDs silently invented; `PROPOSED_DEFINITIONS.md` = None.
- FR-only batch localization; no EN/ES/PT keys.
- No player movement; no gated/special travel.
