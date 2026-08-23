# ACTIVE_BOUNTY_HUNTER_01 — MANIFEST

Batch V1 Active spécialisé **Bounty Hunter**. Aucun repository modifié ; aucun patch ; aucune nouvelle définition persistante.

## SANITY_CHECK

- `CONTENT_SCHEMA_VERSION = 6` : conforme.
- Active : tous les roots ont `careerPhaseIs: active` et `ageAtLeastMonths: 180`.
- Cadence Active : ce batch suppose **2 slots/mois** ; un root Normal/Scheduled et toute sa chaîne Immediate consomment **un seul slot total**.
- `lifetimeThreadSeed: true` est utilisé uniquement sur `active_bounty_hunter_01_duplicate_warrants`, `kind: "normal"`.
- World V1 : **188 runtime Locations** ; ce batch n'ajoute aucune Location.
- FR : source/fallback ; `localization/fr.json` contient uniquement les clés nouvelles de ce batch.

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `active_bounty_hunter_01_notice_at_counter` | `careerEntryOfficialNotice` | 15+ (≥180 mois) | civilian + service `marine_services` ; entrée carrière |
| `active_bounty_hunter_01_first_paid_tip` | `careerEntryPaidTip` | 15+ (≥180 mois) | civilian + `trade` ou tag `criminal` ; entrée alternative |
| `active_bounty_hunter_01_wrong_face_rain` | `wrongFaceRain` | 15+ (≥180 mois) | bounty_hunter + tag `urban` ; cible mal identifiée |
| `active_bounty_hunter_01_information_price` | `informationHasPrice` | 15+ (≥180 mois) | bounty_hunter + service `trade`/`black_market` ; renseignement |
| `active_bounty_hunter_01_surrender_in_warehouse` | `protectedSurrender` | 15+ (≥180 mois) | bounty_hunter + port/industrial/trade ; reddition |
| `active_bounty_hunter_01_prisoner_transfer` | `prisonerTransferBribe` | 15+ (≥180 mois) | bounty_hunter + service `marine_services` ; escorte et corruption |
| `active_bounty_hunter_01_promotion_tracker` | `promotionTracker` | 15+ (≥180 mois) | bounty_hunter novice + Reputation ≥10 + `marine_services` |
| `active_bounty_hunter_01_rival_claim` | `rivalClaimDispute` | 15+ (≥180 mois) | bounty_hunter + `marine_services` ; rival professionnel |
| `active_bounty_hunter_01_target_too_dangerous` | `targetBeyondRisk` | 15+ (≥180 mois) | bounty_hunter + contexte criminel/dangereux/black market |
| `active_bounty_hunter_01_duplicate_warrants` | `phantomWarrantsSeed` | 15+ (≥180 mois) | bounty_hunter + `marine_services`/`trade` ; Lifetime seed |
| `active_bounty_hunter_01_contested_payment` | `contestedCapturePayment` | 15+ (≥180 mois) | bounty_hunter + reddition antérieure + `marine_services` |
| `active_bounty_hunter_01_promotion_confirmed` | `promotionConfirmed` | 15+ (≥180 mois) | bounty_hunter tracker + Reputation ≥25 + `marine_services` |
| `active_bounty_hunter_01_innocent_target` | `innocentTargetMismatch` | 15+ (≥180 mois) | bounty_hunter + city/village/trade ; innocence plausible |
| `active_bounty_hunter_01_dockside_stakeout` | `docksideStakeout` | 15+ (≥180 mois) | bounty_hunter + tag `port` ; filature |
| `active_bounty_hunter_01_old_capture_relative` | `oldCaptureRelative` | 15+ (≥180 mois) | bounty_hunter + capture précédente ; conséquence sociale |
| `active_bounty_hunter_01_corrupt_notice` | `corruptOverpaidNotice` | 15+ (≥180 mois) | bounty_hunter + government/`marine_services` ; prime instrumentalisée |
| `active_bounty_hunter_01_promotion_elite` | `promotionElite` | 15+ (≥180 mois) | bounty_hunter confirmed + Reputation ≥50 + `marine_services` |
| `active_bounty_hunter_01_wounded_fugitive_at_sea` | `woundedFugitiveAtSea` | 15+ (≥180 mois) | bounty_hunter + navire + `at_sea` ; capture/sauvetage |
| `active_bounty_hunter_01_rival_over_ledge` | `rivalRescueChoice` | 15+ (≥180 mois) | bounty_hunter + urban/mountain/industrial ; argent vs sécurité |
| `active_bounty_hunter_01_promotion_master` | `promotionMaster` | 15+ (≥180 mois) | bounty_hunter elite + Reputation ≥80 + `marine_services` |

## SIGNATURE_IMMEDIATE_ARCS

### wrongFaceForgeryArc

**Root ID:** `active_bounty_hunter_01_wrong_face_rain`

**arcKey:** `wrongFaceForgeryArc`

**Maximum reachable Immediate depth:** **5**

**Premise:** Une interception sous la pluie révèle une cible mal identifiée ; la scène bascule immédiatement vers les faux avis, leurs vendeurs et la décision de corriger publiquement l'erreur.

Chaîne maximale :
`active_bounty_hunter_01_wrong_face_rain`
→ `active_bounty_hunter_01_wrong_face_rain_i1`
→ `active_bounty_hunter_01_wrong_face_rain_i2`
→ `active_bounty_hunter_01_wrong_face_rain_i3`
→ `active_bounty_hunter_01_wrong_face_rain_i4`
→ `active_bounty_hunter_01_wrong_face_rain_i5`.

## SECONDARY_IMMEDIATE_ARCS

- active_bounty_hunter_01_prisoner_transfer — **arcKey:** prisonerTransferCorruptionArc — **depth 3** — Une escorte courte devient une tentative de corruption puis une remise où la traçabilité du prisonnier doit être défendue.
- active_bounty_hunter_01_contested_payment — **arcKey:** contestedPaymentLedgerArc — **depth 3** — Un paiement amputé force à reconstruire la reddition, confronter deux registres puis obtenir une décision devant le supérieur local.
- active_bounty_hunter_01_dockside_stakeout — **arcKey:** docksideStakeoutArc — **depth 3** — Une filature portuaire se resserre sur une rencontre, un échange discret puis le moment où il faut casser la surveillance.

## LIFETIME_THREADS

### active_bounty_hunter_01_duplicate_warrants — phantomWarrantsCase

**Ancre durable:** Le motif récurrent de faux avis partageant un défaut d'impression, puis la faiblesse de copie/validation qui permet à la fraude de survivre. Aucun NPC, Item, Flag, `threadId`, `questState` ou organisation mondiale n'est créé ; toute continuité est reconstructible depuis History et les Event IDs.

**Longest reachable Scheduled depth:** **14**

**Total distinct reachable Scheduled EventDefinitions:** **27**

**Vrais points de divergence long-terme:** **3** — (1) dénonciation publique vs traque discrète, avec trois chapitres distincts avant reconvergence ; (2) résultat du croisement des registres, ouvrant trois branches de deux chapitres distincts avant reconvergence ; (3) protection du bouc émissaire vs utilisation comme appât vs vente du dossier, avec deux finales persistantes distinctes et une terminaison anticipée.

**Topologie:** `strongly_branching`, strictement verticale. Seed → S1 ; chaque chapitre ne programme que son/ses descendant(s) direct(s). Les splits 1 et 2 reconvergent uniquement après plusieurs conséquences matériellement différentes. Le split 3 ne reconverge pas : branches `protect` et `bait` ont chacune quatre chapitres jusqu'à une conclusion propre ; `sell` termine après deux chapitres. Tous les descendants Lifetime portent `cancelIf: not(careerAffiliationIs: bounty_hunter)` afin qu'un changement de Career annule proprement la prémisse.

**Span visé:** environ **15 ans** entre le seed et les finales longues (180 mois cumulés sur un chemin de profondeur 14) ; branche `sell` plus courte, environ 12,5 ans.

Principales branches :
- `S02 method` → public (`S03A→S05A`) ou quiet (`S03B→S05B`) → reconvergence `S06`.
- `S07 registry_test` → contaminated (`S08C→S09C`), ledger (`S08D→S09D`) ou fixer (`S08E→S09E`) → reconvergence `S10`.
- `S10 scapegoat` → protect (`S11P→S14P`), bait (`S11B→S14B`) ou sell (`S11S→S12S`, fin anticipée).

Active note : ce seed reste un **Normal one-shot ordinaire** ; aucune garantie spéciale de sélection Lifetime n'est supposée en Active.

## ROOT_EVENTS

- `active_bounty_hunter_01_notice_at_counter`
- `active_bounty_hunter_01_first_paid_tip`
- `active_bounty_hunter_01_wrong_face_rain`
- `active_bounty_hunter_01_information_price`
- `active_bounty_hunter_01_surrender_in_warehouse`
- `active_bounty_hunter_01_prisoner_transfer`
- `active_bounty_hunter_01_promotion_tracker`
- `active_bounty_hunter_01_rival_claim`
- `active_bounty_hunter_01_target_too_dangerous`
- `active_bounty_hunter_01_duplicate_warrants`
- `active_bounty_hunter_01_contested_payment`
- `active_bounty_hunter_01_promotion_confirmed`
- `active_bounty_hunter_01_innocent_target`
- `active_bounty_hunter_01_dockside_stakeout`
- `active_bounty_hunter_01_old_capture_relative`
- `active_bounty_hunter_01_corrupt_notice`
- `active_bounty_hunter_01_promotion_elite`
- `active_bounty_hunter_01_wounded_fugitive_at_sea`
- `active_bounty_hunter_01_rival_over_ledge`
- `active_bounty_hunter_01_promotion_master`

## IMMEDIATE_EVENTS

- `active_bounty_hunter_01_wrong_face_rain_i1`
- `active_bounty_hunter_01_wrong_face_rain_i2`
- `active_bounty_hunter_01_wrong_face_rain_i3`
- `active_bounty_hunter_01_wrong_face_rain_i4`
- `active_bounty_hunter_01_wrong_face_rain_i5`
- `active_bounty_hunter_01_prisoner_transfer_i1`
- `active_bounty_hunter_01_prisoner_transfer_i2`
- `active_bounty_hunter_01_prisoner_transfer_i3`
- `active_bounty_hunter_01_contested_payment_i1`
- `active_bounty_hunter_01_contested_payment_i2`
- `active_bounty_hunter_01_contested_payment_i3`
- `active_bounty_hunter_01_dockside_stakeout_i1`
- `active_bounty_hunter_01_dockside_stakeout_i2`
- `active_bounty_hunter_01_dockside_stakeout_i3`

## SCHEDULED_EVENTS

- `active_bounty_hunter_01_wrong_face_rain_aftermath`
- `active_bounty_hunter_01_rival_claim_return`
- `active_bounty_hunter_01_corrupt_notice_backlash`
- `active_bounty_hunter_01_rival_over_ledge_debt`
- `active_bounty_hunter_01_phantom_warrants_s01_second_mark`
- `active_bounty_hunter_01_phantom_warrants_s02_method`
- `active_bounty_hunter_01_phantom_warrants_s03_public_challenge`
- `active_bounty_hunter_01_phantom_warrants_s04_public_reaction`
- `active_bounty_hunter_01_phantom_warrants_s05_public_cost`
- `active_bounty_hunter_01_phantom_warrants_s03_quiet_trace`
- `active_bounty_hunter_01_phantom_warrants_s04_quiet_archive`
- `active_bounty_hunter_01_phantom_warrants_s05_quiet_cost`
- `active_bounty_hunter_01_phantom_warrants_s06_same_seal`
- `active_bounty_hunter_01_phantom_warrants_s07_registry_test`
- `active_bounty_hunter_01_phantom_warrants_s08_contaminated_trail`
- `active_bounty_hunter_01_phantom_warrants_s09_rebuild_trail`
- `active_bounty_hunter_01_phantom_warrants_s08_ledger_match`
- `active_bounty_hunter_01_phantom_warrants_s09_ledger_source`
- `active_bounty_hunter_01_phantom_warrants_s08_fixer_named`
- `active_bounty_hunter_01_phantom_warrants_s09_fixer_pressure`
- `active_bounty_hunter_01_phantom_warrants_s10_scapegoat`
- `active_bounty_hunter_01_phantom_warrants_s11_protect_witness`
- `active_bounty_hunter_01_phantom_warrants_s12_protect_counteroffer`
- `active_bounty_hunter_01_phantom_warrants_s13_protect_hearing`
- `active_bounty_hunter_01_phantom_warrants_s14_protect_end`
- `active_bounty_hunter_01_phantom_warrants_s11_bait_setup`
- `active_bounty_hunter_01_phantom_warrants_s12_bait_sprung`
- `active_bounty_hunter_01_phantom_warrants_s13_bait_aftermath`
- `active_bounty_hunter_01_phantom_warrants_s14_bait_end`
- `active_bounty_hunter_01_phantom_warrants_s11_sell_copy`
- `active_bounty_hunter_01_phantom_warrants_s12_sell_end`

### Scheduled hors Lifetime

- `active_bounty_hunter_01_wrong_face_rain_aftermath` — délai 2 mois ; retour public de l'histoire de la mauvaise identification.
- `active_bounty_hunter_01_rival_claim_return` — délai 4 mois ; le rival revient avec une piste.
- `active_bounty_hunter_01_corrupt_notice_backlash` — délai 3 mois ; rumeur professionnelle après l'avis instrumentalisé.
- `active_bounty_hunter_01_rival_over_ledge_debt` — délai 6 mois ; dette informelle du rival.

## PERSISTENT_IDS_USED

### Career

- Career affiliations : `civilian`, `bounty_hunter`.
- Bounty Hunter ranks : `bounty_hunter_novice`, `bounty_hunter_tracker`, `bounty_hunter_confirmed`, `bounty_hunter_elite`, `bounty_hunter_master`.
- Career titles : aucun ID utilisé. L'entrée Bounty Hunter efface explicitement un éventuel titre Civil via `clearCareerTitle` avant d'attribuer le rank novice.
- Ending IDs : None.
- Player bounty : aucun `setBounty` / `modifyBounty`. Les paiements de cibles utilisent uniquement `modifyBerries`.

### Traits

- Acquisition possible : `cautious`, `merciful`, `honest`.
- Oppositions explicitement protégées via `availableIf` : `audacious`, `ruthless`, `deceptive`.
- Aucun bonus universel de Trait.

### Items / Flags / NPCs

- Items : None.
- Flags : None.
- Persistent NPC IDs : None.
- Les cibles, préposés, rivaux et témoins restent Event-local text ; aucun état NPC persistant n'est inventé.

### Geography metadata

Services : `marine_services`, `trade`, `black_market`.

Tags : `urban`, `criminal`, `port`, `industrial`, `dangerous`, `city`, `village`, `government`, `mountain`.

Aucun `locationIs` ni Location ID spécifique : le batch reste réutilisable via contexte de tags/services.

## CAREER_RANK_TITLE_BOUNTY_CONTEXT

- Deux roots d'entrée sont réservés à `careerAffiliationIs: civilian`.
- Une entrée réussie attribue explicitement `bounty_hunter` + `bounty_hunter_novice`.
- Les 18 autres roots exigent `careerAffiliationIs: bounty_hunter`.
- Promotions authorées :
  - Novice → Traqueur : Reputation ≥10.
  - Traqueur → Chasseur confirmé : Reputation ≥25.
  - Chasseur confirmé → Chasseur d'élite : Reputation ≥50.
  - Chasseur d'élite → Maître chasseur : Reputation ≥80.
- Chaque promotion exige le rank précédent exact, évitant tout downgrade d'un rank supérieur.
- Reputation ne change que par Effects explicitement narrés ; elle représente la notoriété, pas la moralité.
- La bounty du joueur n'est jamais utilisée comme paiement ni modifiée dans ce batch.
- Aucun Career Title nouveau ou existant n'est attribué.

## SHIP_CREW_POWERS_CONTEXT

- `active_bounty_hunter_01_wounded_fugitive_at_sea` exige `hasShip` + `isAtSea`.
- Ce root peut infliger `modifyShipHealth: -3` sur échec critique ; aucun châssis, upgrade, module ou acquisition de navire n'est créé.
- Le rôle Crew `navigator` peut fournir un modificateur conditionnel explicite `+2` à un DiceCheck de Navigation dans ce seul Event.
- `active_bounty_hunter_01_dockside_stakeout` expose une Choice spéciale visible/disabled pour un Devil Fruit déjà possédé avec tag `mobility`.
- `active_bounty_hunter_01_rival_over_ledge` expose une Choice spéciale visible/disabled pour Haki de l'Observation niveau ≥1.
- Aucun Fruit, Haki, Awakening, Crew member ou Ship n'est distribué.

## TRAVEL_MOVEMENT

None.

- `moveToLocation` : None.
- Ingress connus : None.
- Egress connus : None.
- Transitions parent/sous-location : None.
- Transitions gated/special : None.
- Cross-route rares : None.
- Contribution à la couverture de déplacement normal : None.
- Le root maritime reste dans le contexte `at_sea` et résout la remise à une vedette Marine présente dans la scène ; il ne laisse aucun prisonnier Event-local à transporter entre deux slots.

## TIMELINE_CANON

- Tous les roots sont Active (`ageMonths >= 180`).
- Le batch utilise uniquement personnages originaux/locaux et fonctions génériques.
- Aucun personnage canon majeur, organisation canon sensible ou outcome canon majeur n'est touché.
- Aucune fenêtre canon précise non supportée n'est inventée.
- La Lifetime est professionnelle et périphérique ; elle ne crée ni guilde mondiale ni conspiration centrale.

## DICE_STATS_TRAITS_LOCATIONS_COVERAGE

- Roots avec DiceCheck : **10/20**.
- Dice Stats racines : `observation`, `agility`, `charisma`, `intelligence`, `navigation`, `strength`.
- Seuils utilisés : 11 et 14.
- `health` n'est jamais utilisé comme Stat D20 ; les blessures utilisent `modifyHealth`.
- Autres Stats modifiées narrativement : `morale`.
- `luck` : non utilisée dans ce batch.
- Traits acquis : `cautious`, `merciful`, `honest`, chacun bloqué si l'opposé correspondant est déjà présent.
- Géographie : uniquement tags/services contrôlés ; aucun déplacement runtime.
- Résolvabilité : chaque Event atteint possède au moins une Choice sans `availableIf`.

## DEPENDENCIES

- `active_bounty_hunter_01_contested_payment` dépend du choix `accept_surrender` dans `active_bounty_hunter_01_surrender_in_warehouse`.
- `active_bounty_hunter_01_old_capture_relative` dépend de `hasPlayed(active_bounty_hunter_01_surrender_in_warehouse)`.
- Les promotions peuvent aussi devenir pertinentes grâce à Reputation acquise dans d'autres batches ; aucune dépendance dure à un autre batch n'est requise.
- Les IDs de Career, ranks, Traits, CrewRole, tags/services, Devil Fruit tags et Haki sont tous issus des autorités V1 existantes.

## DEDUP_NOTES

- Le ledger Childhood contient `ch_identity_world_01_bounty_board`, centré sur la manière dont un enfant interprète les montants d'un panneau. `careerEntryOfficialNotice` est une entrée professionnelle adulte qui modifie explicitement Career/rank et traite conditions de preuve/remise : ce n'est pas un reskin.
- `ch_family_social_01_household_ledger` suit les obligations communautaires d'un foyer. `phantomWarrantsCase` suit pendant des années une fraude documentaire professionnelle sur validation/copie de primes : ancre, décisions et conséquences sont distinctes.
- Les avis locaux/royaux déjà présents dans le ledger (`eviction_notice`, `deulOverpostedNotice`) ne couvrent ni identification de cible, filature, reddition, transport de prisonnier, rivalité professionnelle, paiement de capture, corruption de prime ou promotions Bounty Hunter.
- Aucun Lifetime Hunter/rival/capture/faux avis accepté n'apparaît dans le ledger fourni.
- Aucun ancien JSON retiré n'a été recyclé.

## FINAL_VALIDATION

- 20 roots Normal exactement.
- 18/20 roots exigent Bounty Hunter ; 2 roots sont des entrées Civilian authorées.
- Signature Immediate : profondeur 5.
- Secondary Immediate : 3 roots distincts, profondeur 3 chacun.
- Lifetime : 27 Scheduled distincts, profondeur max 14, 3 divergences long-terme, split final persistant.
- Scheduled hors Lifetime : 4 roots/concepts causaux.
- 10 roots avec DiceCheck, quatre outcomes exacts.
- Aucun `recoverTravel`, `dead_end_on_land`, `dead_end_at_sea`, `monthAtLeast`, `weight`, cooldown, `ArcState`, `threadId` ou `questState`.
- Aucune nouvelle définition persistante.
- Aucun `moveToLocation`.
