# ACTIVE_PORT_TRADE_01 — MANIFEST

**Batch ID:** `ACTIVE_PORT_TRADE_01`  
**Préfixe:** `active_port_trade_01`  
**Phase:** `active`  
**Scope:** ports, marchés, contrats, services, Berrys, cargaisons textuelles et transactions authorées.  
**CONTENT_SCHEMA_VERSION vérifié:** `6`  
**Roots Normal:** `20`  
**Immediate:** `14`  
**Scheduled:** `29` (`25` Lifetime + `4` hors Lifetime)  
**Persistent definitions nouvelles:** `None`  
**Déplacement géographique authoré:** `None`

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `active_port_trade_01_dockside_bid_circle` | `docksideBidCircle` | 15+ (>=180 mois) | port + trade — enchères, propriété contestée |
| `active_port_trade_01_duplicate_invoice_charge` | `duplicateInvoiceCharge` | 15+ (>=180 mois) | trade + general_goods — double facturation / commission |
| `active_port_trade_01_black_market_middleman` | `blackMarketMiddleman` | 15+ (>=180 mois) | black_market — commission d'intermédiaire |
| `active_port_trade_01_repair_quote_split` | `repairQuoteSplit` | 15+ (>=180 mois) | ship_repair + hasShip + isLeader — devis de réparation |
| `active_port_trade_01_deferred_contract_network` | `deferredContractNetwork` | 15+ (>=180 mois) | trade — paiement différé / Lifetime économique |
| `active_port_trade_01_harbor_tax_receipt` | `harborTaxReceipt` | 15+ (>=180 mois) | port + trade — droit local / taxe |
| `active_port_trade_01_short_delivery_claim` | `shortDeliveryClaim` | 15+ (>=180 mois) | trade + general_goods — livraison contestée |
| `active_port_trade_01_perishable_shortage` | `perishableShortage` | 15+ (>=180 mois) | food + trade — pénurie et répartition |
| `active_port_trade_01_medical_supply_markup` | `medicalSupplyMarkup` | 15+ (>=180 mois) | medical + trade — fournitures et marge |
| `active_port_trade_01_weapon_lot_provenance` | `weaponLotProvenance` | 15+ (>=180 mois) | weapons + trade — provenance d'un lot |
| `active_port_trade_01_dockside_credit_note` | `docksideCreditNote` | 15+ (>=180 mois) | trade — crédit/paiement à échéance |
| `active_port_trade_01_broker_information_sale` | `brokerInformationSale` | 15+ (>=180 mois) | port + trade — information commerciale |
| `active_port_trade_01_commission_in_advance` | `commissionInAdvance` | 15+ (>=180 mois) | trade — acompte d'intermédiaire |
| `active_port_trade_01_ship_purchase_offer` | `shipPurchaseOffer` | 15+ (>=180 mois) | port + trade + isLeader — achat naval via canAcquireShip |
| `active_port_trade_01_loguetown_ship_appraisal` | `loguetownShipAppraisal` | 15+ (>=180 mois) | Loguetown + isLeader — vente Chaloupe/Sloop via canSellShip |
| `active_port_trade_01_customs_manifest_mismatch` | `customsManifestMismatch` | 15+ (>=180 mois) | marine_services + trade — contrôle administratif |
| `active_port_trade_01_night_market_counterfeit` | `nightMarketCounterfeit` | 15+ (>=180 mois) | black_market — contrefaçon et négociation |
| `active_port_trade_01_repair_parts_scarcity` | `repairPartsScarcity` | 15+ (>=180 mois) | ship_repair + hasShip + isLeader — pénurie de pièce |
| `active_port_trade_01_cargo_damage_liability` | `cargoDamageLiability` | 15+ (>=180 mois) | port + trade — responsabilité de cargaison |
| `active_port_trade_01_local_delivery_retainer` | `localDeliveryRetainer` | 15+ (>=180 mois) | trade + general_goods — retenue sur livraison locale |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `active_port_trade_01_dockside_bid_circle`  
**arcKey:** `docksideAuctionManifestArc`  
**Maximum reachable Immediate depth:** **5**  
**Premise:** Une enchère portuaire sur un lot revendiqué par deux créanciers devient une même scène continue de vérification des titres, chronologie des garanties, rivalité d'enchères, lecture de clause puis décision au coup de marteau.

## SECONDARY_IMMEDIATE_ARCS

- active_port_trade_01_duplicate_invoice_charge — **arcKey:** duplicateInvoiceSettlementArc — **depth 3** — Une double commission mène à la comparaison des cachets, au choix du remboursement puis à une procédure de facturation plus lisible.
- active_port_trade_01_black_market_middleman — **arcKey:** blackMarketMiddlemanArc — **depth 3** — Une commission clandestine devient un test de preuve, de confiance puis de termes réels sans ellipse.
- active_port_trade_01_repair_quote_split — **arcKey:** repairQuoteEscalationArc — **depth 3** — Un devis naval s'ouvre sur une seconde pièce, un choix de matériau puis une facture finale dans la même visite au chantier.

## LIFETIME_THREADS

### active_port_trade_01_deferred_contract_network — deferredContractNetwork
**Ancre durable:** Une pratique de contrats à paiement différé et le même cercle informel de courtiers/intermédiaires, reconstruits uniquement via History et la chaîne verticale des Scheduled Events ; aucun NPC, Item, Flag, Career ou système économique persistant nouveau.  
**Longest reachable Scheduled depth:** 14  
**Total distinct reachable Scheduled EventDefinitions:** 25  
**Vrais points de divergence long-terme:** 3  
**Topologie:** `strongly_branching` — split 1 prudent/souple maintenu sur 2 chapitres avant reconvergence ; split 2 expansion/consolidation maintenu sur 3 chapitres avant reconvergence ; split 3 terminal en trois trajectoires de 3 chapitres sans reconvergence.  
**Span visé:** environ 11–14+ ans après le seed selon les gaps et le temps passé hors lieux de trade ; le Scheduled reste pending tant qu'aucun contexte commercial compatible n'est retrouvé.  

**Divergences authored:**
- `active_port_trade_01_lt_s2` : `garantie` → `active_port_trade_01_lt_s3a` / `souplesse` → `active_port_trade_01_lt_s3b` ; branches distinctes pendant `active_port_trade_01_lt_s3a→active_port_trade_01_lt_s4a` et `active_port_trade_01_lt_s3b→active_port_trade_01_lt_s4b`, reconvergence à `active_port_trade_01_lt_s5`.
- `active_port_trade_01_lt_s6` : Dice `garantir` succès/critique → `active_port_trade_01_lt_s7a` ; échec/critique ou choix `limiter` → `active_port_trade_01_lt_s7b` ; branches distinctes 3 chapitres, reconvergence à `active_port_trade_01_lt_s10`.
- `active_port_trade_01_lt_s11` : `ouvert` → `active_port_trade_01_lt_s12a` / `prive` → `active_port_trade_01_lt_s12b` / `restreint` → `active_port_trade_01_lt_s12c` ; trois fins distinctes `active_port_trade_01_lt_s14a` / `active_port_trade_01_lt_s14b` / `active_port_trade_01_lt_s14c` sans reconvergence.

## EVENT_LISTS

### Roots Normal
- `active_port_trade_01_dockside_bid_circle`
- `active_port_trade_01_duplicate_invoice_charge`
- `active_port_trade_01_black_market_middleman`
- `active_port_trade_01_repair_quote_split`
- `active_port_trade_01_deferred_contract_network`
- `active_port_trade_01_harbor_tax_receipt`
- `active_port_trade_01_short_delivery_claim`
- `active_port_trade_01_perishable_shortage`
- `active_port_trade_01_medical_supply_markup`
- `active_port_trade_01_weapon_lot_provenance`
- `active_port_trade_01_dockside_credit_note`
- `active_port_trade_01_broker_information_sale`
- `active_port_trade_01_commission_in_advance`
- `active_port_trade_01_ship_purchase_offer`
- `active_port_trade_01_loguetown_ship_appraisal`
- `active_port_trade_01_customs_manifest_mismatch`
- `active_port_trade_01_night_market_counterfeit`
- `active_port_trade_01_repair_parts_scarcity`
- `active_port_trade_01_cargo_damage_liability`
- `active_port_trade_01_local_delivery_retainer`

### Immediate
- `active_port_trade_01_dockside_bid_circle_i1_manifest`
- `active_port_trade_01_dockside_bid_circle_i2_recount`
- `active_port_trade_01_dockside_bid_circle_i3_rival_bid`
- `active_port_trade_01_dockside_bid_circle_i4_clause`
- `active_port_trade_01_dockside_bid_circle_i5_hammer`
- `active_port_trade_01_duplicate_invoice_charge_i1_stamps`
- `active_port_trade_01_duplicate_invoice_charge_i2_owner`
- `active_port_trade_01_duplicate_invoice_charge_i3_settlement`
- `active_port_trade_01_black_market_middleman_i1_token`
- `active_port_trade_01_black_market_middleman_i2_test`
- `active_port_trade_01_black_market_middleman_i3_terms`
- `active_port_trade_01_repair_quote_split_i1_open_hull`
- `active_port_trade_01_repair_quote_split_i2_material`
- `active_port_trade_01_repair_quote_split_i3_payment`

### Scheduled — Lifetime
- `active_port_trade_01_lt_s1`
- `active_port_trade_01_lt_s2`
- `active_port_trade_01_lt_s3a`
- `active_port_trade_01_lt_s4a`
- `active_port_trade_01_lt_s3b`
- `active_port_trade_01_lt_s4b`
- `active_port_trade_01_lt_s5`
- `active_port_trade_01_lt_s6`
- `active_port_trade_01_lt_s7a`
- `active_port_trade_01_lt_s8a`
- `active_port_trade_01_lt_s9a`
- `active_port_trade_01_lt_s7b`
- `active_port_trade_01_lt_s8b`
- `active_port_trade_01_lt_s9b`
- `active_port_trade_01_lt_s10`
- `active_port_trade_01_lt_s11`
- `active_port_trade_01_lt_s12a`
- `active_port_trade_01_lt_s13a`
- `active_port_trade_01_lt_s14a`
- `active_port_trade_01_lt_s12b`
- `active_port_trade_01_lt_s13b`
- `active_port_trade_01_lt_s14b`
- `active_port_trade_01_lt_s12c`
- `active_port_trade_01_lt_s13c`
- `active_port_trade_01_lt_s14c`

### Scheduled — hors Lifetime
- `active_port_trade_01_credit_note_matures`
- `active_port_trade_01_commission_return`
- `active_port_trade_01_ordered_parts_arrive`
- `active_port_trade_01_retainer_second_job`

## PERSISTENT_IDS_USED

- **Traits:** `deceptive`, `greedy`, `generous`.
- **Ships:** `dinghy`, `sloop`, `merchant_ship`.
- **Location ID spécifique:** `loguetown`.
- **Location tags:** `port`.
- **Location services:** `trade`, `general_goods`, `food`, `medical`, `weapons`, `ship_repair`, `black_market`, `marine_services`.
- **Stats D20 utilisées:** `observation`, `intelligence`, `charisma`, `luck`, `morale`.
- **Resources/state:** Berrys, Reputation, Ship HP, History.
- **NPCs:** None.
- **Items / Cargo Items:** None. Les cargaisons restent textuelles/History ; aucun Item de caisse ou de lot n'est créé.
- **Flags:** None.
- **Devil Fruits / Haki:** None.
- **Career ranks / titles / endings:** None.

## DEPENDENCIES

None. Le batch dépend uniquement du contrat runtime/schema V6 et des catalogues V1 existants.

## CAREER_RANK_TITLE_BOUNTY_CONTEXT

- Les 20 roots sont transversaux aux cinq Careers V1 et ne changent aucune Career.
- Aucun rank, title, bounty ou Ending n'est attribué/modifié.
- Reputation n'est modifiée que lorsque la scène raconte une notoriété publique mineure/notable ; aucune moralité implicite.

## SHIP_CREW_POWERS_CONTEXT

- Achat naval : `canAcquireShip` garde les Choices visibles/grisées et délègue au runtime la compatibilité `shipMarket`, leadership, crew/passagers/capacité et remplacement.
- Vente navale : uniquement `loguetown`, marché naval `full`, sur `dinghy`/`sloop`, avec `canSellShip` + `isLeader`; l'Effect `loseShip` laisse explicitement le joueur `on_land` à `loguetown`.
- Réparations : `ship_repair` + `hasShip` + `isLeader`, et chaque `modifyShipHealth > 0` correspond explicitement à des travaux payés.
- Crew : aucun recrutement/loyauté/role comme enjeu principal.
- Powers : aucun Fruit/Haki distribué, éveillé ou requis.

## TIMELINE_CANON

- Tous les roots exigent `careerPhaseIs(active)` + `ageAtLeastMonths(180)` ; aucun root n'est éligible avant 15 ans.
- Aucun personnage canon majeur, outcome canon, organisation canon sensible ou fenêtre temporelle précise n'est utilisé.
- Le batch reste dans les interstices économiques locaux et respecte l'ancrage Active voisin du début du voyage de Luffy.

## DICE_STATS_TRAITS_LOCATIONS_COVERAGE

**Roots avec DiceCheck (9/20):**
- `active_port_trade_01_dockside_bid_circle`
- `active_port_trade_01_duplicate_invoice_charge`
- `active_port_trade_01_repair_quote_split`
- `active_port_trade_01_harbor_tax_receipt`
- `active_port_trade_01_short_delivery_claim`
- `active_port_trade_01_weapon_lot_provenance`
- `active_port_trade_01_broker_information_sale`
- `active_port_trade_01_customs_manifest_mismatch`
- `active_port_trade_01_cargo_damage_liability`

**Seuils:** 11 et 14 ; quatre outcomes exacts pour chaque DiceCheck.  
**Effets Stats:** généralement ±1/±2, jamais plus de deux Stats par Outcome.  
**Traits:** `deceptive`, `greedy`, `generous` servent uniquement à des Choices explicites ; aucun bonus automatique ni acquisition de Trait.  
**Géographie/services:** les roots réutilisables préfèrent `locationHasService` / `locationHasTag`; `loguetown` n'est utilisé que lorsque l'Effect de vente doit fournir un `locationId` concret.  
**Marchés noirs:** exclusivement `locationHasService(black_market)`.  
**Contrôle Marine:** exclusivement `marine_services + trade`.  

## SCHEDULED_HORS_LIFETIME

- `active_port_trade_01_dockside_credit_note` → `active_port_trade_01_credit_note_matures` (+6 mois) : billet de crédit arrivé à échéance.
- `active_port_trade_01_commission_in_advance` → `active_port_trade_01_commission_return` (+3 mois) : intermédiaire qui revient avec un acheteur.
- `active_port_trade_01_repair_parts_scarcity` → `active_port_trade_01_ordered_parts_arrive` (+2 mois) : pièce de réparation commandée ; `cancelIf: not(hasShip)` si le navire a disparu.
- `active_port_trade_01_local_delivery_retainer` → `active_port_trade_01_retainer_second_job` (+4 mois) : retenue et seconde livraison.

## TRAVEL_AND_MOVEMENT

None. Aucun `moveToLocation`, `recoverTravel`, destination de route, ingress/egress, parent/sub-location transition, transition gated/special ou cross-route n'est authoré. La vente de navire à Loguetown ne déplace pas géographiquement le joueur ; elle réaffirme seulement le contexte `loguetown/on_land` exigé par `loseShip`.

## DEDUP_NOTES

- Comparé au ledger Childhood accepté : pas de reskin de `market_errand`, `blurred_tally`, `missing_token`, `household_ledger`, `family_name_price`, `blackfin_manifest_discrepancy`, `jambalaya_scale_dispute`, ni des incidents portuaires des batches Blue.
- Les scènes passent à des responsabilités adultes : vrais Berrys, commissions, acompte, dette/échéance, responsabilité contractuelle, marché naval, contrôle administratif, réparation payée et fraude commerciale.
- La Lifetime n'est ni une chaîne d'entraide (`favorChain`) ni un registre familial (`ledger_of_obligations`) : elle traite l'évolution sur plusieurs années d'une pratique de contrats différés avec splits sécurité/souplesse, expansion/consolidation et héritage économique final.
- Aucun ancien JSON retiré n'a été recyclé.

## FINAL_CHECK

- [x] exactement 20 roots `kind: normal`
- [x] 20/20 roots Active avec `careerPhaseIs(active)` et `ageAtLeastMonths(180)`
- [x] Signature Immediate depth 5
- [x] 3 Secondary Immediate roots distincts depth 3
- [x] 1 Lifetime seed Normal
- [x] Lifetime depth 14 / breadth 25 / 3 divergences / split persistant
- [x] verticalité stricte : un Outcome de seed/Scheduled ne schedule jamais plus d'un descendant direct
- [x] 9 roots DiceCheck, quatre outcomes exacts
- [x] Choice resolvability : chaque Event possède au moins une Choice inconditionnelle
- [x] aucun persistent ID nouveau, aucun Flag, aucun NPC/Item inventé
- [x] aucun `recoverTravel`, `dead_end_on_land`, `dead_end_at_sea`
- [x] aucun mouvement géographique
- [x] FR seulement dans `localization/fr.json`
