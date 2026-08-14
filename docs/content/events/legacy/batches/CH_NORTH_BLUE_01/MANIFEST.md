# CH_NORTH_BLUE_01

- Scope: Childhood — North Blue
- Content schema: `6`
- Root Events: **20**
- Immediate Events: **14**
- Scheduled Events: **30**
- New persistent definitions: **None**

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `ch_north_blue_01_whiteport_first_frost` | `whiteportFirstFrost` | 3–6 ans | Whiteport — neige, port urbain |
| `ch_north_blue_01_norlune_rope_grooves` | `norluneRopeGrooves` | 5–8 ans | Norlune Port — port historique et commerce |
| `ch_north_blue_01_clocktown_counterweight` | `clocktownCounterweight` | 6–8 ans | Clocktown — ville dense et commerçante |
| `ch_north_blue_01_kuen_wheel_pin` | `kuenWheelPin` | 4–7 ans | Kuen Village — village rural |
| `ch_north_blue_01_pepe_tide_baskets` | `pepeTideBaskets` | 4–8 ans | Pepe Port — petit port de commerce |
| `ch_north_blue_01_gingapore_blade_sheaths` | `gingaporeBladeSheaths` | 5–8 ans | Gingapore City — commerce urbain, service weapons |
| `ch_north_blue_01_rubeck_driftwood_brace` | `rubeckDriftwoodBrace` | 4–7 ans | Rubeck Island — île côtière |
| `ch_north_blue_01_swallow_drying_shelves` | `swallowDryingShelves` | 6–8 ans | Swallow Island — isolement, côte, service médical |
| `ch_north_blue_01_whiteport_icefall` | `whiteportIcefall` | 10–14 ans | Whiteport — neige, port urbain |
| `ch_north_blue_01_deul_overposted_notice` | `deulOverpostedNotice` | 11–14 ans | Deul Kingdom via Clocktown — royaume, ville commerçante |
| `ch_north_blue_01_swallow_supply_skiff` | `swallowSupplySkiff` | 10–14 ans | Swallow Island — côte isolée, service médical |
| `ch_north_blue_01_pepe_mooring_post` | `pepeMooringPost` | 10–13 ans | Pepe Port — port et commerce |
| `ch_north_blue_01_gingapore_display_frame` | `gingaporeDisplayFrame` | 9–13 ans | Gingapore City — commerce urbain |
| `ch_north_blue_01_rubeck_beached_rowboat` | `rubeckBeachedRowboat` | 9–12 ans | Rubeck Island — côte et accostage |
| `ch_north_blue_01_kuen_loose_pathstones` | `kuenLoosePathstones` | 10–14 ans | Kuen Village — village rural |
| `ch_north_blue_01_whiteland_roof_load` | `whitelandRoofLoad` | 9–12 ans | Whiteland Kingdom via Whiteport — royaume enneigé |
| `ch_north_blue_01_pepe_quay_inspection` | `pepeQuayInspection` | 11–14 ans | Pepe Kingdom via Pepe Port — royaume et commerce côtier |
| `ch_north_blue_01_gingapore_royal_order` | `gingaporeRoyalOrder` | 9–12 ans | Gingapore Kingdom via Gingapore City — royaume marchand |
| `ch_north_blue_01_lvneel_old_explorer_tale` | `lvneelOldExplorerTale` | 10–12 ans | Lvneel Kingdom via Norlune Port — royaume historique |
| `ch_north_blue_01_clocktown_narrow_stair` | `clocktownNarrowStairCarry` | 12–14 ans | Clocktown — ville commerçante, service médical |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `ch_north_blue_01_whiteport_icefall`
**arcKey:** `whiteportIcefallCascade`
**Maximum reachable Immediate depth:** **5**
**Premise:** Une corniche de glace au-dessus d’une voie de Whiteport déclenche cinq bascules continues : première chute, sol devenu glissant, auvent surchargé, personne coincée derrière des caisses puis décision de réouverture.

## SECONDARY_IMMEDIATE_ARCS

- ch_north_blue_01_clocktown_counterweight — **arcKey:** clocktownCounterweightArc — **depth 3** — Un palan commercial bloqué devient une suite continue de charge suspendue, nœud qui glisse puis conflit sur la corde de secours.
- ch_north_blue_01_deul_overposted_notice — **arcKey:** deulNoticeBoardArc — **depth 3** — Un avis royal posé sur des annonces locales déclenche panneau instable, transfert d’encre puis arbitrage avec le clerc arrivé sur place.
- ch_north_blue_01_swallow_supply_skiff — **arcKey:** swallowSupplySkiffArc — **depth 3** — Une chaloupe de fournitures médicales mal amarrée impose de stabiliser la coque, sauver une caisse puis arbitrer tri et sécurisation.

## LIFETIME_THREADS

### ch_north_blue_01_lvneel_old_explorer_tale — lvneelContestedMemory

**Ancre durable:** La manière dont le personnage comprend puis transmet une controverse historique de Lvneel ; continuité reconstruite uniquement par History et la chaîne Scheduled, sans nouvel Item, Flag, NPC ou état de thread.
**Longest reachable Scheduled depth:** **16**
**Total distinct reachable Scheduled EventDefinitions:** **26**
**Vrais points de divergence long-terme:** **3** — S02 sépare « préserver la mise en garde » / « mettre les contradictions au centre » sur quatre chapitres ; R02 sépare débat public / transmission en petits cercles sur trois chapitres ; R04 sépare transmission d’une conclusion / transmission d’une méthode sur deux terminaisons distinctes.
**Topologie:** strongly_branching — deux reconvergences seulement après branches multi-chapitres matériellement différentes, puis split terminal persistant sans reconvergence.
**Span visé:** environ 18–24 ans possibles après un seed à 10–12 ans ; conçu pour traverser Childhood → Active avec plusieurs gaps de 12–24 mois.

- Early termination majeure: aucune ; la troisième divergence termine la thread par deux héritages distincts.
- Verticalité: seed → S01 uniquement ; chaque chapitre ne programme que son successeur direct selon le choix courant. Aucun pré-queue du graphe.
- Cross Childhood → Active: oui.

## EVENT_FILES

### Roots
- `ch_north_blue_01_clocktown_counterweight`
- `ch_north_blue_01_clocktown_narrow_stair`
- `ch_north_blue_01_deul_overposted_notice`
- `ch_north_blue_01_gingapore_blade_sheaths`
- `ch_north_blue_01_gingapore_display_frame`
- `ch_north_blue_01_gingapore_royal_order`
- `ch_north_blue_01_kuen_loose_pathstones`
- `ch_north_blue_01_kuen_wheel_pin`
- `ch_north_blue_01_lvneel_old_explorer_tale`
- `ch_north_blue_01_norlune_rope_grooves`
- `ch_north_blue_01_pepe_mooring_post`
- `ch_north_blue_01_pepe_quay_inspection`
- `ch_north_blue_01_pepe_tide_baskets`
- `ch_north_blue_01_rubeck_beached_rowboat`
- `ch_north_blue_01_rubeck_driftwood_brace`
- `ch_north_blue_01_swallow_drying_shelves`
- `ch_north_blue_01_swallow_supply_skiff`
- `ch_north_blue_01_whiteland_roof_load`
- `ch_north_blue_01_whiteport_first_frost`
- `ch_north_blue_01_whiteport_icefall`

### Immediate
- `ch_north_blue_01_clocktown_counterweight_i1`
- `ch_north_blue_01_clocktown_counterweight_i2`
- `ch_north_blue_01_clocktown_counterweight_i3`
- `ch_north_blue_01_deul_overposted_notice_i1`
- `ch_north_blue_01_deul_overposted_notice_i2`
- `ch_north_blue_01_deul_overposted_notice_i3`
- `ch_north_blue_01_swallow_supply_skiff_i1`
- `ch_north_blue_01_swallow_supply_skiff_i2`
- `ch_north_blue_01_swallow_supply_skiff_i3`
- `ch_north_blue_01_whiteport_icefall_i1`
- `ch_north_blue_01_whiteport_icefall_i2`
- `ch_north_blue_01_whiteport_icefall_i3`
- `ch_north_blue_01_whiteport_icefall_i4`
- `ch_north_blue_01_whiteport_icefall_i5`

### Scheduled
- `ch_north_blue_01_gingapore_royal_order_followup`
- `ch_north_blue_01_kuen_wheel_pin_followup`
- `ch_north_blue_01_lvneel_memory_a01`
- `ch_north_blue_01_lvneel_memory_a02`
- `ch_north_blue_01_lvneel_memory_a03`
- `ch_north_blue_01_lvneel_memory_a04`
- `ch_north_blue_01_lvneel_memory_b01`
- `ch_north_blue_01_lvneel_memory_b02`
- `ch_north_blue_01_lvneel_memory_b03`
- `ch_north_blue_01_lvneel_memory_b04`
- `ch_north_blue_01_lvneel_memory_c01`
- `ch_north_blue_01_lvneel_memory_c02`
- `ch_north_blue_01_lvneel_memory_c03`
- `ch_north_blue_01_lvneel_memory_d01`
- `ch_north_blue_01_lvneel_memory_d02`
- `ch_north_blue_01_lvneel_memory_d03`
- `ch_north_blue_01_lvneel_memory_e01`
- `ch_north_blue_01_lvneel_memory_e02`
- `ch_north_blue_01_lvneel_memory_e03`
- `ch_north_blue_01_lvneel_memory_f01`
- `ch_north_blue_01_lvneel_memory_f02`
- `ch_north_blue_01_lvneel_memory_f03`
- `ch_north_blue_01_lvneel_memory_r01`
- `ch_north_blue_01_lvneel_memory_r02`
- `ch_north_blue_01_lvneel_memory_r03`
- `ch_north_blue_01_lvneel_memory_r04`
- `ch_north_blue_01_lvneel_memory_s01`
- `ch_north_blue_01_lvneel_memory_s02`
- `ch_north_blue_01_swallow_drying_shelves_followup`
- `ch_north_blue_01_whiteland_roof_load_followup`

## PERSISTENT_IDS_USED

### Locations
- `deul_clocktown`
- `deul_kingdom`
- `gingapore_city`
- `gingapore_kingdom`
- `kuen_village`
- `lvneel_kingdom`
- `lvneel_norlune_port`
- `pepe_kingdom`
- `pepe_port`
- `rubeck_island`
- `swallow_island`
- `whiteland_kingdom`
- `whiteland_whiteport`

### Traits
- `resourceful`
- `proud`
- `curious`

### Other persistent registries
- NPCs: none
- Items: none
- Flags: none
- Ships: none
- Devil Fruits: none
- Haki: none
- Active career/rank/title/bounty: none

## DEPENDENCIES

- Runtime contract: `CONTENT_SCHEMA_VERSION = 6`.
- World V1 / `locationsV1.json`: North Blue 20 Locations, 8 Birth Locations.
- Trait catalogue V1: existing `resourceful`, `proud`, `curious` only.
- No dependency on another Event batch for reachability.

## TIMELINE_CANON

- All roots are Childhood-only and capped below `ageMonths = 180`.
- No Haki, Devil Fruit, personal ship, bounty, rank, title or Active career effects.
- No Flevance, Germa Empire, Minion Island, Marine base, Blackglass Cove, Whitecliff Forest or Ironpine Mining Town root is used; those non-Birth/non-ancestor Locations therefore require no Childhood travel exception.
- The Lvneel Lifetime uses a deliberately non-specific old exploration controversy and does not alter a protected canon outcome or require a current canon NPC.

## COVERAGE

- Roots with DiceCheck: **9/20**.
- Dice Stats: `agility`, `observation`, `strength`, `intelligence`, `navigation`, `charisma`.
- Other Stat growth across deterministic outcomes also covers `morale`.
- `luck` is intentionally not forced into a roll where chance would be artificial.
- Trait-acquisition roots: 3 (`resourceful`, `proud`, `curious`), all independent Traits; no opposite-pair conflict.
- Direct/ancestor Location coverage: **13** distinct North Blue runtime Location IDs.
- Age mix: **8** early roots (1–8 target band) + **12** late roots (9–14 target band).
- Root-triggered Scheduled consequences outside Lifetime: **4** roots.

## GEOGRAPHY_AUDIT

| Root | Condition | Runtime target | Reachable Birth Location(s) |
|---|---|---|---|
| `ch_north_blue_01_whiteport_first_frost` | `locationIs` | `whiteland_whiteport` | `whiteland_whiteport` |
| `ch_north_blue_01_norlune_rope_grooves` | `locationIs` | `lvneel_norlune_port` | `lvneel_norlune_port` |
| `ch_north_blue_01_clocktown_counterweight` | `locationIs` | `deul_clocktown` | `deul_clocktown` |
| `ch_north_blue_01_kuen_wheel_pin` | `locationIs` | `kuen_village` | `kuen_village` |
| `ch_north_blue_01_pepe_tide_baskets` | `locationIs` | `pepe_port` | `pepe_port` |
| `ch_north_blue_01_gingapore_blade_sheaths` | `locationIs` | `gingapore_city` | `gingapore_city` |
| `ch_north_blue_01_rubeck_driftwood_brace` | `locationIs` | `rubeck_island` | `rubeck_island` |
| `ch_north_blue_01_swallow_drying_shelves` | `locationIs` | `swallow_island` | `swallow_island` |
| `ch_north_blue_01_whiteport_icefall` | `locationIs` | `whiteland_whiteport` | `whiteland_whiteport` |
| `ch_north_blue_01_deul_overposted_notice` | `locationWithin` | `deul_kingdom` | `deul_clocktown` |
| `ch_north_blue_01_swallow_supply_skiff` | `locationIs` | `swallow_island` | `swallow_island` |
| `ch_north_blue_01_pepe_mooring_post` | `locationIs` | `pepe_port` | `pepe_port` |
| `ch_north_blue_01_gingapore_display_frame` | `locationIs` | `gingapore_city` | `gingapore_city` |
| `ch_north_blue_01_rubeck_beached_rowboat` | `locationIs` | `rubeck_island` | `rubeck_island` |
| `ch_north_blue_01_kuen_loose_pathstones` | `locationIs` | `kuen_village` | `kuen_village` |
| `ch_north_blue_01_whiteland_roof_load` | `locationWithin` | `whiteland_kingdom` | `whiteland_whiteport` |
| `ch_north_blue_01_pepe_quay_inspection` | `locationWithin` | `pepe_kingdom` | `pepe_port` |
| `ch_north_blue_01_gingapore_royal_order` | `locationWithin` | `gingapore_kingdom` | `gingapore_city` |
| `ch_north_blue_01_lvneel_old_explorer_tale` | `locationWithin` | `lvneel_kingdom` | `lvneel_norlune_port` |
| `ch_north_blue_01_clocktown_narrow_stair` | `locationIs` | `deul_clocktown` | `deul_clocktown` |

- Exceptions volontaires: **None**. Tous les `locationIs` ciblent une Birth Location North Blue. Tous les `locationWithin` ciblent un parent runtime contenant au moins une Birth Location North Blue dans l’état initial.

## DEDUP_NOTES

- Anti-reskin vérifié contre les batches acceptés 01–06 du ledger.
- La Signature Whiteport repose sur une cascade de glace urbaine ; elle n’est ni une mise à l’eau/chantier naval de West Blue, ni un chariot en fuite d’East Blue, ni une chaîne incendie générique.
- Les Secondary arcs évitent les structures déjà indexées : pas de signalisation portuaire, pas de faux manifeste, pas de barge poussée par courant, pas de rack renversé, pas de toile/lanterne de fête.
- La Lifetime Lvneel traite la mémoire historique contestée et la transmission d’une conclusion/méthode. Elle ne reproduit ni `three_breaths_life_practice`, ni `favorChain`, ni `ledger_of_obligations`, ni le carnet de voyage, ni le code de signaux de Loguetown, ni l’atlas d’Enoa.
- Aucun ancien JSON retiré n’a été réutilisé.

## VALIDATION_SUMMARY

- Normal roots: 20 — PASS
- Signature Immediate depth 5: PASS
- Three Secondary Immediate depth 3 on distinct roots: PASS
- Lifetime reachable Scheduled nodes: 26 — PASS
- Lifetime longest Scheduled depth: 16 — PASS
- Lifetime meaningful divergence points: 3 — PASS
- Persistent split / distinct terminal topology: PASS
- Strict vertical scheduling: PASS
- Choice resolvability: PASS (every Event has at least one unconditional Choice)
- Root DiceCheck target: 9/20 — PASS
- Dice outcome keys exactly four: PASS
- Unknown persistent IDs / definitions: none
- Geography Birth-reachability: PASS
- FR localization completeness: PASS
- JSON parse/reference integrity: PASS
