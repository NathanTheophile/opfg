# ACTIVE_REVOLUTIONARY_01

Batch V1 Active — trajectoire Révolutionnaire. Aucun patch/repo change. FR uniquement.

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `active_revolutionary_01_backroom_contact` | `backroom_contact_test` | 15+ | Civilian, on land, food/trade/general_goods — entry into Revolutionary |
| `active_revolutionary_01_harbor_passage` | `clandestine_harbor_passage` | 15+ | Revolutionary, port, on land |
| `active_revolutionary_01_ciphered_courier` | `ciphered_courier_tail` | 15+ | Revolutionary, urban/trade/general_goods |
| `active_revolutionary_01_decoy_itinerary` | `decoy_itinerary` | 15+ | Revolutionary, urban/port/trade |
| `active_revolutionary_01_bell_exfiltration` | `bell_exfiltration` | 15+ | Revolutionary, government/marine/urban |
| `active_revolutionary_01_clinic_shield` | `clinic_requisition_protection` | 15+ | Revolutionary, medical service |
| `active_revolutionary_01_signal_mast` | `limited_signal_sabotage` | 15+ | Revolutionary, government/military/marine |
| `active_revolutionary_01_underground_press` | `underground_press_evidence` | 15+ | Revolutionary, urban/general_goods/trade |
| `active_revolutionary_01_exposed_face` | `exposed_face_bounty` | 15+ | Revolutionary, Reputation >= 8 |
| `active_revolutionary_01_cell_vote` | `cell_visibility_vote` | 15+ | Revolutionary, on land |
| `active_revolutionary_01_sealed_order` | `contested_sealed_order` | 15+ | Revolutionary Operator+, prior cell vote |
| `active_revolutionary_01_registry_infiltration` | `registry_transfer_infiltration` | 15+ | Revolutionary Agent+, government/marine |
| `active_revolutionary_01_compromised_names` | `compromised_names_response` | 15+ | Revolutionary, Reputation >= 6 |
| `active_revolutionary_01_canal_pursuit` | `canal_tail_break` | 15+ | Revolutionary, urban/coastal/port |
| `active_revolutionary_01_promotion_agent` | `promotion_to_agent` | 15+ | Revolutionary Recruit, Reputation >= 18 |
| `active_revolutionary_01_promotion_operator` | `promotion_to_operator` | 15+ | Revolutionary Agent, Reputation >= 36 |
| `active_revolutionary_01_promotion_officer` | `promotion_to_officer` | 15+ | Revolutionary Operator, Reputation >= 58 |
| `active_revolutionary_01_promotion_regional_commander` | `promotion_to_regional_commander` | 15+ | Revolutionary Officer, Reputation >= 80 |
| `active_revolutionary_01_lantern_route_seed` | `lantern_route_seed` | 15+ | Revolutionary, on land — Lifetime seed |
| `active_revolutionary_01_closed_hearing` | `closed_hearing_witnesses` | 15+ | Revolutionary, government/royal/capital |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `active_revolutionary_01_bell_exfiltration`  
**arcKey:** `bell_exfiltration_before_third_bell`  
**Maximum reachable Immediate depth:** **5**  
**Premise:** une exfiltration de trois témoins avant la fermeture d’un quartier se transforme en chaîne continue de rue, patrouille, grille, trace de sang et remise finale, sans ellipse.

## SECONDARY_IMMEDIATE_ARCS

- `active_revolutionary_01_ciphered_courier` — **arcKey:** `ciphered_courier_tail_chain` — **depth 3** — un courrier chiffré révèle une filature, force un changement de remise et se conclut par une décision sur ce que le suiveur doit croire avoir vu.
- `active_revolutionary_01_underground_press` — **arcKey:** `underground_press_before_dawn` — **depth 3** — l’édition d’un tract factuel enchaîne désaccord éditorial, panne de presse et choix de distribution dans la même nuit.
- `active_revolutionary_01_registry_infiltration` — **arcKey:** `registry_transfer_infiltration` — **depth 3** — une infiltration administrative progresse du contrôle de couloir au bon registre puis à la sortie au moment où la porte s’ouvre.

## LIFETIME_THREADS

### active_revolutionary_01_lantern_route_seed — lantern_route_network
**Ancre durable:** la « route des lanternes », protocole décentralisé de foyers et relais civils reconstruit uniquement via History + Scheduled ; aucun NPC, Item, Flag ou état de thread nouveau. Un contact récurrent reste un rôle narratif non persistant et peut disparaître/mourir selon la branche.  
**Longest reachable Scheduled depth:** 12  
**Total distinct reachable Scheduled EventDefinitions:** 28  
**Vrais points de divergence long-terme:** 3 — doctrine du réseau (3 branches × 2 chapitres), disparition du contact (4 branches × 2 chapitres, dont mort et démantèlement possible), forme finale du réseau (3 branches × 3 chapitres sans reconvergence).  
**Topologie:** `strongly_branching` — deux reconvergences seulement après conséquences multi-chapitres matériellement différentes, puis split terminal persistant ; fallback de rupture si le joueur quitte la Career Révolutionnaire.  
**Span visé:** environ 14–18 ans après le seed selon les délais et la branche ; seed Active 15+ ans, conclusion typique vers la fin de la vingtaine/début trentaine.

Branch points majeurs :
- `active_revolutionary_01_lantern_three_doors` : compartimenter / centraliser / confier aux responsables locaux → trois futurs Scheduled distincts sur deux chapitres chacun.
- `active_revolutionary_01_lantern_empty_signal` : chercher / brûler les relais / maintenir la ligne avec Dice Observation → quatre futurs Scheduled possibles ; une branche confirme la mort du contact, une autre permet le démantèlement complet de la cellule locale.
- `active_revolutionary_01_lantern_rebuilt_oath` : rester entièrement caché / rendre le secours visible / coordonner régionalement → trois branches de trois chapitres sans reconvergence.
- Changement de Career : tous les chapitres actifs portent `cancelIf: not careerAffiliationIs(revolutionary)` et `fallbackEventId: active_revolutionary_01_lantern_after_departure` ; le fallback clôt proprement la relation au réseau au lieu de laisser un chapitre impossible pending.
- Géographie : les chapitres physiques exigent `isOnLand` et restent pending en mer ; aucun contact n’est téléporté, le réseau utilise relais/lettres et n’impose aucun déplacement runtime.

## EVENT_FILES

### Roots (20)
- `active_revolutionary_01_backroom_contact`
- `active_revolutionary_01_harbor_passage`
- `active_revolutionary_01_ciphered_courier`
- `active_revolutionary_01_decoy_itinerary`
- `active_revolutionary_01_bell_exfiltration`
- `active_revolutionary_01_clinic_shield`
- `active_revolutionary_01_signal_mast`
- `active_revolutionary_01_underground_press`
- `active_revolutionary_01_exposed_face`
- `active_revolutionary_01_cell_vote`
- `active_revolutionary_01_sealed_order`
- `active_revolutionary_01_registry_infiltration`
- `active_revolutionary_01_compromised_names`
- `active_revolutionary_01_canal_pursuit`
- `active_revolutionary_01_promotion_agent`
- `active_revolutionary_01_promotion_operator`
- `active_revolutionary_01_promotion_officer`
- `active_revolutionary_01_promotion_regional_commander`
- `active_revolutionary_01_lantern_route_seed`
- `active_revolutionary_01_closed_hearing`

### Immediate (14)
- `active_revolutionary_01_bell_exfiltration_i1`
- `active_revolutionary_01_bell_exfiltration_i2`
- `active_revolutionary_01_bell_exfiltration_i3`
- `active_revolutionary_01_bell_exfiltration_i4`
- `active_revolutionary_01_bell_exfiltration_i5`
- `active_revolutionary_01_ciphered_courier_i1`
- `active_revolutionary_01_ciphered_courier_i2`
- `active_revolutionary_01_ciphered_courier_i3`
- `active_revolutionary_01_registry_infiltration_i1`
- `active_revolutionary_01_registry_infiltration_i2`
- `active_revolutionary_01_registry_infiltration_i3`
- `active_revolutionary_01_underground_press_i1`
- `active_revolutionary_01_underground_press_i2`
- `active_revolutionary_01_underground_press_i3`

### Scheduled (33)
- `active_revolutionary_01_exposed_face_echo`
- `active_revolutionary_01_harbor_passage_return`
- `active_revolutionary_01_lantern_after_departure`
- `active_revolutionary_01_lantern_blind_links`
- `active_revolutionary_01_lantern_burned_route`
- `active_revolutionary_01_lantern_centered_pressure`
- `active_revolutionary_01_lantern_civilian_terms`
- `active_revolutionary_01_lantern_compartment_test`
- `active_revolutionary_01_lantern_cross_sea_letters`
- `active_revolutionary_01_lantern_empty_chair`
- `active_revolutionary_01_lantern_empty_signal`
- `active_revolutionary_01_lantern_first_house`
- `active_revolutionary_01_lantern_hidden_legacy`
- `active_revolutionary_01_lantern_local_command`
- `active_revolutionary_01_lantern_local_stewards`
- `active_revolutionary_01_lantern_moving_line`
- `active_revolutionary_01_lantern_open_tables`
- `active_revolutionary_01_lantern_public_cost`
- `active_revolutionary_01_lantern_quiet_search`
- `active_revolutionary_01_lantern_quiet_year`
- `active_revolutionary_01_lantern_rebuilt_oath`
- `active_revolutionary_01_lantern_regional_legacy`
- `active_revolutionary_01_lantern_rescued_runner`
- `active_revolutionary_01_lantern_return_without_name`
- `active_revolutionary_01_lantern_scarce_passage`
- `active_revolutionary_01_lantern_second_winter`
- `active_revolutionary_01_lantern_shared_routes`
- `active_revolutionary_01_lantern_small_lights`
- `active_revolutionary_01_lantern_taken_runner`
- `active_revolutionary_01_lantern_three_doors`
- `active_revolutionary_01_lantern_visible_legacy`
- `active_revolutionary_01_sealed_order_review`
- `active_revolutionary_01_signal_mast_audit`

## PERSISTENT_IDS_USED

- Careers: `civilian`, `revolutionary`.
- Revolutionary ranks: `revolutionary_recruit`, `revolutionary_agent`, `revolutionary_operator`, `revolutionary_officer`, `revolutionary_regional_commander`.
- Traits queried only: `deceptive`, `protective`, `audacious`, `cautious`, `suspicious`, `honest`. No Trait granted/removed.
- Race queried: `fishman`.
- Existing state/resources: Reputation, Bounty, Berrys, Ship presence/leadership, History, D20 Stats, Health.
- NPCs: None. Items: None. Flags: None. Career Titles: None. Endings: None. Devil Fruits/Haki: None. New persistent definitions: None.

## DEPENDENCIES

- Runtime content schema v6 and existing Active career/History/Scheduled/Immediate systems.
- No dependency on another new Active batch.
- Internal History dependency: `sealed_order` requires prior `cell_vote`; all long-form branches depend only on events in this batch.
- `signal_mast_audit`, `harbor_passage_return`, `exposed_face_echo`, `sealed_order_review` are root-originated Scheduled consequences outside the Lifetime graph.

## CAREER_RANK_TITLE_BOUNTY_CONTEXT

- Entry Event changes `civilian → revolutionary`, explicitly sets `revolutionary_recruit` and clears any prior civilian Career Title.
- Four dedicated promotion roots narrate rank changes at Reputation 18 / 36 / 58 / 80; no silent promotion.
- No invented rank/title. Pirate/Civilian custom titles are not used.
- Bounty changes occur only in explicitly exposed/public outcomes; Bounty and Reputation are authored independently.
- Most roots require `careerAffiliationIs: revolutionary`; the only entry root requires `civilian`.

## SHIP_CREW_POWERS_CONTEXT

- Ship: only `hasShip` + `isLeader` gate one visible diversion Choice; no acquisition, loss, upgrade, fleet, passenger state or travel state change.
- Crew: no CrewRole query/effect.
- Devil Fruits/Haki: None; no acquisition/awakening/reward.

## TIMELINE_CANON

- Every root requires `careerPhaseIs(active)` and `ageAtLeastMonths(180)`.
- No major canon character, organization outcome, or canon-event rewrite.
- Content uses peripheral local cells, officials, civilians, couriers and small-scale operations. Baltigo is never targeted or entered.
- Lifetime is organization-local/decentralized and remains compatible with travel across the world because physical chapters wait for an on-land slot.

## DICE_STATS_TRAITS_LOCATIONS_COVERAGE

- Root Dice coverage: 10 / 20 roots.
- Root Dice Stats: Navigation, Intelligence, Observation, Charisma, Agility. No `health` DiceCheck.
- Thresholds used: 11 / 14 / 17. Every Dice resolution has exactly criticalFailure / failure / success / criticalSuccess.
- Stat changes remain within ±1/±2; Health damage is separate. Reputation follows minor/notable/exceptional scales.
- Location filters use controlled tags/services (`port`, `urban`, `government`, `military`, `marine_presence`, `coastal`, `royal`, `capital`, `trade`, `food`, `general_goods`, `medical`). No invented Location ID/tag/service.
- Special Trait/Race/Ship Choices remain visible but disabled through `availableIf`; every Event retains at least one unconditional Choice.

## TRAVEL_AND_MOVEMENT

None. No `moveToLocation` Effect is authored. The clandestine transport/exfiltration scenes are intra-Location handoffs resolved inside the same Event/Immediate chain and never leave `ship == null && travelState == at_sea`. Ingress/egress, parent/sub-location transitions, gated/special transitions, cross-route transitions, and contribution to ordinary movement coverage: None.

## DEDUP_NOTES

- Compared against the provided accepted Childhood concept ledger. The batch deliberately avoids replaying Childhood chores, favors, ledgers, notebooks, exploration exercises or generic authority drills as adult reskins.
- Avoided the already accepted West Blue false-manifest premise/signature arc; `decoy_itinerary` uses social timing and conflicting routes, not cargo-manifest falsification.
- `underground_press` is an adult operational/editorial scene, not a repeat of the Childhood `revolutionary_whisper` tract discovery.
- Lifetime `lantern_route_network` is an operational Revolutionary safe-route network with career invalidation, contact disappearance/death and cell dismantlement; it is materially distinct from Childhood favor chains, community ledgers, notebooks, atlases and local craft/agriculture legacies.
- No `recoverTravel`, `dead_end_on_land`, `dead_end_at_sea`, weight, cooldown, repeatable, ArcState/threadId/questState or new persistent definition.

## VALIDATION_NOTES

- Sanity authority check: CONTENT_SCHEMA_VERSION 6; Active starts at 180 months; Active uses 2 slots/month; Immediate chains consume no additional slot; Lifetime seed is Normal-only; World V1 count 188; FR source/fallback. No contradiction detected.
- Exactly 20 Normal roots; 1 Signature d5; 3 Secondary d3 on distinct roots; Lifetime depth 12 / breadth 28 / 3 meaningful divergences; strict vertical scheduling.
- Four roots create non-Lifetime Scheduled consequences (`harbor_passage`, `signal_mast`, `exposed_face`, `sealed_order`).
- All Events have at least one unconditional Choice. No forbidden Effect/system is used.
