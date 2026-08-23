# CH_SOUTH_BLUE_01 — MANIFEST

Batch Childhood V1 contextualisé South Blue. Aucun patch/repository change. Contrat runtime ciblé : `CONTENT_SCHEMA_VERSION = 6`.

Sanity-check des autorités :
- `lifetimeThreadSeed?: true` utilisé uniquement sur un Event `kind: "normal"`;
- contrat V4.1 : 1 Signature Immediate d5, 3 Secondary Immediate d3, 1 Lifetime;
- World V1 : 188 runtime Locations, dont 20 South Blue et 8 Birth Locations;
- FR est la locale source/fallback;
- ledger de déduplication lu jusqu’aux batches acceptés 01–06, incluant `CH_EAST_BLUE_01` et `CH_WEST_BLUE_01`.

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `ch_south_blue_01_baterilla_clean_linen` | `baterillaCleanLinen` | 4–7 ans | Baterilla Harbor — port + médical |
| `ch_south_blue_01_southport_grain_shavings` | `southportGrainShavings` | 5–7 ans | Southport — chantier naval |
| `ch_south_blue_01_torino_leaf_twins` | `torinoLeafTwins` | 4–7 ans | Canopy Village — forêt + médecine |
| `ch_south_blue_01_karate_sand_stance` | `karateSandStance` | 5–7 ans | Karate Island — culture martiale côtière |
| `ch_south_blue_01_briss_crate_chorus` | `brissCrateChorus` | 6–7 ans | Briss Port — manutention commerciale |
| `ch_south_blue_01_samba_crossed_rhythms` | `sambaCrossedRhythms` | 4–7 ans | Samba City — divertissement urbain |
| `ch_south_blue_01_centaurea_wind_vane` | `centaureaWindVane` | 5–7 ans | Centaurea Town — commerce côtier |
| `ch_south_blue_01_taya_shell_scarecrows` | `tayaShellScarecrows` | 5–7 ans | Taya Village — agriculture côtière |
| `ch_south_blue_01_baterilla_cool_crates` | `baterillaCoolCrates` | 9–12 ans | locationWithin(baterilla) → Baterilla Harbor — port + médical |
| `ch_south_blue_01_southport_caulking_line` | `southportCaulkingLine` | 10–14 ans | locationWithin(sorbet_kingdom) + shipyard → Southport |
| `ch_south_blue_01_torino_bark_harvest` | `torinoBarkHarvest` | 10–14 ans | locationWithin(torino_kingdom) → Canopy Village — médecine forestière |
| `ch_south_blue_01_karate_scored_board` | `karateScoredBoard` | 10–13 ans | Karate Island — épreuve martiale et intégrité |
| `ch_south_blue_01_briss_fever_landing` | `brissFeverLanding` | 11–14 ans | Briss Port — débarquement + service médical |
| `ch_south_blue_01_samba_double_booking` | `sambaDoubleBooking` | 10–14 ans | locationWithin(samba_kingdom) → Samba City — divertissement |
| `ch_south_blue_01_centaurea_blade_rack` | `centaureaBladeRack` | 11–14 ans | locationWithin(centaurea) → Centaurea Town — armes + commerce |
| `ch_south_blue_01_taya_saltwind_hedge` | `tayaSaltwindHedge` | 10–12 ans | Taya Village — agriculture + vent salé |
| `ch_south_blue_01_sorbet_paint_over_check` | `sorbetPaintOverCheck` | 12–14 ans | locationWithin(sorbet_kingdom) + shipyard → Southport |
| `ch_south_blue_01_briss_tide_marks` | `brissTideMarks` | 11–14 ans | locationWithin(briss_kingdom) + port → Briss Port |
| `ch_south_blue_01_samba_quiet_hour` | `sambaQuietHour` | 10–13 ans | locationWithin(samba_kingdom) → Samba City — divertissement + médical |
| `ch_south_blue_01_centaurea_miracle_tonic` | `centaureaMiracleTonic` | 12–14 ans | locationWithin(centaurea) → Centaurea Town — commerce + médical |

Total : **20 root Events `kind: "normal"`**.
Répartition âge : **8 roots 1–8 ans** (ici 4–7) + **12 roots 9–14 ans**.

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `ch_south_blue_01_briss_fever_landing`  
**arcKey:** `brissFeverLandingChain`  
**Maximum reachable Immediate depth:** **5**  
**Premise:** Un marin pris de fièvre au débarquement transforme un quai médicalement équipé en scène continue de gestion d’espace, rumeur, témoignages, biens personnels et compte rendu, sans ellipse ni changement biologique de temps.

Chaîne qualifiante :
`ch_south_blue_01_briss_fever_landing`
→ `ch_south_blue_01_briss_fever_landing_i1`
→ `ch_south_blue_01_briss_fever_landing_i2`
→ `ch_south_blue_01_briss_fever_landing_i3`
→ `ch_south_blue_01_briss_fever_landing_i4`
→ `ch_south_blue_01_briss_fever_landing_i5`

## SECONDARY_IMMEDIATE_ARCS

- ch_south_blue_01_baterilla_cool_crates — **arcKey:** baterillaCoolCratesChain — **depth 3** — Une manutention urgente de remèdes à Baterilla devient une scène continue de toile glissante, flacon douteux puis identification d’un paquet demandé en urgence.
- ch_south_blue_01_samba_double_booking — **arcKey:** sambaDoubleBookingArc — **depth 3** — Deux troupes revendiquent la même place de Samba City ; le conflit évolue en collision musicale, prise de camps par le public puis décision sur le final.
- ch_south_blue_01_centaurea_blade_rack — **arcKey:** centaureaBladeRackArc — **depth 3** — Une lame réellement coupante se retrouve parmi des armes d’entraînement ; la scène enchaîne prévention du geste, recherche de provenance et sécurisation immédiate du râtelier vidé.

## LIFETIME_THREADS

### ch_south_blue_01_taya_saltwind_hedge — tayaSaltwindLegacy

**Ancre durable:** La pratique agricole née à Taya Village pour protéger les cultures du vent et du sel ; continuité portée uniquement par History et la chaîne verticale des Scheduled Events, sans Item, Flag, NPC ou état de thread nouveau.  
**Longest reachable Scheduled depth:** **14**  
**Total distinct reachable Scheduled EventDefinitions:** **28**  
**Vrais points de divergence long-terme:** **3** — choix de protection (haie / écrans / sillons), modèle de diffusion (partage / parcelles d’essai / défi saisonnier), puis forme de l’héritage (enseignement / activité commerciale / pratique sans propriétaire).  
**Topologie:** `strongly_branching` — trois splits significatifs ; les deux premiers maintiennent 2–3 chapitres Scheduled distincts avant reconvergence, le troisième reste distinct pendant deux chapitres puis reconverge vers une conclusion qui relit History.  
**Span visé:** seed vers 10–12 ans ; conclusion environ 16 ans plus tard selon le chemin, typiquement vers 26–29 ans. Conçu pour traverser Childhood → Active.

Verticalité :
- seed → `s01_first_season` uniquement ;
- chaque Scheduled ne programme que son/ses descendant(s) direct(s) ;
- aucune pré-queue globale de la thread ;
- aucune boucle ;
- aucun node déconnecté ou unreachable.

Divergence 1 :
- `s02_choose_protection` → branche haie (2 chapitres) / écrans (2) / sillons (2) → `s05_second_saltwind`.

Divergence 2 :
- `s06_who_learns` → partage (3 chapitres) / essais locaux (3) / défi saisonnier (3) → `s10_news_beyond_taya`.

Divergence 3 :
- `s11_what_remains` → enseignement (2 chapitres) / commerce (2) / diffusion sans propriétaire (2) → `s14_green_line`.
- Le final propose des lectures spécifiques selon `hasPlayed` sur la branche finale, plus un fallback inconditionnel.

## EVENT_LISTS

### Roots — 20
- `ch_south_blue_01_baterilla_clean_linen`
- `ch_south_blue_01_southport_grain_shavings`
- `ch_south_blue_01_torino_leaf_twins`
- `ch_south_blue_01_karate_sand_stance`
- `ch_south_blue_01_briss_crate_chorus`
- `ch_south_blue_01_samba_crossed_rhythms`
- `ch_south_blue_01_centaurea_wind_vane`
- `ch_south_blue_01_taya_shell_scarecrows`
- `ch_south_blue_01_baterilla_cool_crates`
- `ch_south_blue_01_southport_caulking_line`
- `ch_south_blue_01_torino_bark_harvest`
- `ch_south_blue_01_karate_scored_board`
- `ch_south_blue_01_briss_fever_landing`
- `ch_south_blue_01_samba_double_booking`
- `ch_south_blue_01_centaurea_blade_rack`
- `ch_south_blue_01_taya_saltwind_hedge`
- `ch_south_blue_01_sorbet_paint_over_check`
- `ch_south_blue_01_briss_tide_marks`
- `ch_south_blue_01_samba_quiet_hour`
- `ch_south_blue_01_centaurea_miracle_tonic`

### Immediate — 14
- `ch_south_blue_01_baterilla_cool_crates_i1`
- `ch_south_blue_01_baterilla_cool_crates_i2`
- `ch_south_blue_01_baterilla_cool_crates_i3`
- `ch_south_blue_01_briss_fever_landing_i1`
- `ch_south_blue_01_briss_fever_landing_i2`
- `ch_south_blue_01_briss_fever_landing_i3`
- `ch_south_blue_01_briss_fever_landing_i4`
- `ch_south_blue_01_briss_fever_landing_i5`
- `ch_south_blue_01_samba_double_booking_i1`
- `ch_south_blue_01_samba_double_booking_i2`
- `ch_south_blue_01_samba_double_booking_i3`
- `ch_south_blue_01_centaurea_blade_rack_i1`
- `ch_south_blue_01_centaurea_blade_rack_i2`
- `ch_south_blue_01_centaurea_blade_rack_i3`

### Scheduled hors Lifetime — 4
- `ch_south_blue_01_southport_grain_followup`
- `ch_south_blue_01_torino_leaf_followup`
- `ch_south_blue_01_sorbet_inspection_followup`
- `ch_south_blue_01_centaurea_tonic_followup`

### Scheduled Lifetime — 28
- `ch_south_blue_01_taya_thread_s01_first_season`
- `ch_south_blue_01_taya_thread_s02_choose_protection`
- `ch_south_blue_01_taya_thread_s03_living_hedge`
- `ch_south_blue_01_taya_thread_s04_hedge_roots`
- `ch_south_blue_01_taya_thread_s03_reed_screens`
- `ch_south_blue_01_taya_thread_s04_screen_repairs`
- `ch_south_blue_01_taya_thread_s03_drainage_furrows`
- `ch_south_blue_01_taya_thread_s04_furrow_salt`
- `ch_south_blue_01_taya_thread_s05_second_saltwind`
- `ch_south_blue_01_taya_thread_s06_who_learns`
- `ch_south_blue_01_taya_thread_s07_share_neighbors`
- `ch_south_blue_01_taya_thread_s08_share_mistakes`
- `ch_south_blue_01_taya_thread_s09_share_spread`
- `ch_south_blue_01_taya_thread_s07_trial_plots`
- `ch_south_blue_01_taya_thread_s08_trial_failures`
- `ch_south_blue_01_taya_thread_s09_trial_method`
- `ch_south_blue_01_taya_thread_s07_seasonal_contest`
- `ch_south_blue_01_taya_thread_s08_contest_pressure`
- `ch_south_blue_01_taya_thread_s09_contest_lessons`
- `ch_south_blue_01_taya_thread_s10_news_beyond_taya`
- `ch_south_blue_01_taya_thread_s11_what_remains`
- `ch_south_blue_01_taya_thread_s12_teach_principle`
- `ch_south_blue_01_taya_thread_s13_teach_hands`
- `ch_south_blue_01_taya_thread_s12_trade_method`
- `ch_south_blue_01_taya_thread_s13_trade_limits`
- `ch_south_blue_01_taya_thread_s12_leave_ownerless`
- `ch_south_blue_01_taya_thread_s13_names_fade`
- `ch_south_blue_01_taya_thread_s14_green_line`

## PERSISTENT_IDS_USED

### Locations / géographie
- Sea : `south_blue`.
- Birth Locations utilisées : `baterilla_harbor`, `sorbet_southport`, `torino_tree_village`, `karate_island`, `briss_port`, `samba_city`, `centaurea_town`, `taya_village`.
- Parents runtime utilisés via `locationWithin` : `baterilla`, `sorbet_kingdom`, `torino_kingdom`, `briss_kingdom`, `samba_kingdom`, `centaurea`.
- Tags utilisés : `shipyard`, `port`, `forest`, `city`.
- Aucun déplacement Childhood vers une non-Birth Location.

### Traits existants
- `cautious` (opposé `audacious`) ;
- `honest` (opposé `deceptive`) ;
- `deceptive` (opposé `honest`) ;
- `protective` (indépendant).

Chaque acquisition d’un Trait opposé est conditionnée par l’absence du Trait cible et de son opposé. Chaque Event concerné conserve au moins une Choice inconditionnelle.

### Stats D20 utilisées
`morale`, `strength`, `agility`, `observation`, `intelligence`, `charisma`.

Aucun DiceCheck n’utilise `health`.

### Non utilisés
Aucun nouvel Item, Flag, NPC, Ship, Fruit, Career, rank/title/bounty, Haki, ArcState, `threadId`, `questState` ou compteur de chapitre.

## DEPENDENCIES

- Dépendances runtime : schema v6, catalogues World V1 / Traits V1 / localisation FR existants.
- Dépendance inter-batch : **None**.
- Aucun Event de ce batch n’exige un persistent ID défini par un autre batch Childhood.

## TIMELINE_CANON

- Roots exclusivement Childhood, âges 4–14 ans ; aucune Career active.
- Aucun personnage canon nommé, aucune organisation canon sensible et aucun résultat canon majeur modifié.
- Aucun Haki, Devil Fruit, navire personnel, Grand Line ou New World.
- Les Scheduled Lifetime peuvent dépasser 15 ans mais restent centrés sur une pratique agricole locale et sa diffusion ; aucune chronologie manga précise n’est inventée.
- Les quatre Scheduled hors Lifetime restent des retours causaux reconnaissables liés à leur root.

## DICE_STATS_TRAITS_LOCATIONS_COVERAGE

- Roots avec DiceCheck : **9 / 20**.
- Seuils utilisés : 11 et 14.
- Chaque DiceCheck possède exactement `criticalFailure`, `failure`, `success`, `criticalSuccess`.
- Effets de Stats : typiquement ±1, +2 seulement sur criticalSuccess ; jamais ±4/±5 ; max 2 Stats modifiées par Outcome (ici généralement 1).
- Roots pouvant acquérir un Trait : `torino_leaf_twins`, `karate_scored_board`, `samba_quiet_hour`.
- Contextes runtime distincts couverts directement ou via parent : **14** (`baterilla_harbor`, `baterilla`, `sorbet_southport`, `sorbet_kingdom`, `torino_tree_village`, `torino_kingdom`, `karate_island`, `briss_port`, `briss_kingdom`, `samba_city`, `samba_kingdom`, `centaurea_town`, `centaurea`, `taya_village`).
- Répartition effective par Birth Location : Baterilla 2 roots ; Southport 3 ; Torino 2 ; Karate 2 ; Briss 3 ; Samba 3 ; Centaurea 3 ; Taya 2. Aucune Location ne monopolise le batch.

## GEOGRAPHIC_CHILDHOOD_AUDIT

| Root ID | Condition géographique | Birth Location initiale qui le rend atteignable | Exception volontaire |
|---|---|---|---|
| `ch_south_blue_01_baterilla_clean_linen` | `locationIs(baterilla_harbor)` | `baterilla_harbor` | Non |
| `ch_south_blue_01_southport_grain_shavings` | `locationIs(sorbet_southport)` | `sorbet_southport` | Non |
| `ch_south_blue_01_torino_leaf_twins` | `locationIs(torino_tree_village)` | `torino_tree_village` | Non |
| `ch_south_blue_01_karate_sand_stance` | `locationIs(karate_island)` | `karate_island` | Non |
| `ch_south_blue_01_briss_crate_chorus` | `locationIs(briss_port)` | `briss_port` | Non |
| `ch_south_blue_01_samba_crossed_rhythms` | `locationIs(samba_city)` | `samba_city` | Non |
| `ch_south_blue_01_centaurea_wind_vane` | `locationIs(centaurea_town)` | `centaurea_town` | Non |
| `ch_south_blue_01_taya_shell_scarecrows` | `locationIs(taya_village)` | `taya_village` | Non |
| `ch_south_blue_01_baterilla_cool_crates` | `locationWithin(baterilla) + port` | `baterilla_harbor` | Non |
| `ch_south_blue_01_southport_caulking_line` | `locationWithin(sorbet_kingdom) + shipyard` | `sorbet_southport` | Non |
| `ch_south_blue_01_torino_bark_harvest` | `locationWithin(torino_kingdom) + forest` | `torino_tree_village` | Non |
| `ch_south_blue_01_karate_scored_board` | `locationIs(karate_island)` | `karate_island` | Non |
| `ch_south_blue_01_briss_fever_landing` | `locationIs(briss_port)` | `briss_port` | Non |
| `ch_south_blue_01_samba_double_booking` | `locationWithin(samba_kingdom) + city` | `samba_city` | Non |
| `ch_south_blue_01_centaurea_blade_rack` | `locationWithin(centaurea) + city` | `centaurea_town` | Non |
| `ch_south_blue_01_taya_saltwind_hedge` | `locationIs(taya_village)` | `taya_village` | Non |
| `ch_south_blue_01_sorbet_paint_over_check` | `locationWithin(sorbet_kingdom) + shipyard` | `sorbet_southport` | Non |
| `ch_south_blue_01_briss_tide_marks` | `locationWithin(briss_kingdom) + port` | `briss_port` | Non |
| `ch_south_blue_01_samba_quiet_hour` | `locationWithin(samba_kingdom) + city` | `samba_city` | Non |
| `ch_south_blue_01_centaurea_miracle_tonic` | `locationWithin(centaurea) + city` | `centaurea_town` | Non |

**Exceptions volontaires : None.**

Les non-Birth Locations South Blue `south_74th_branch`, `jewel_ice_sheet`, `torino_canopy`, `redfin_cove`, `ice_country`, `kutsukku_island` ne sont jamais utilisées comme position exacte d’un root Childhood. Elles ne sont pas forcées artificiellement dans le batch.

## SCHEDULED_CAUSALITY

Roots créant un Scheduled significatif hors descendants Lifetime : **4**.
- `ch_south_blue_01_southport_grain_shavings` → `ch_south_blue_01_southport_grain_followup` après 18 mois.
- `ch_south_blue_01_torino_leaf_twins` → `ch_south_blue_01_torino_leaf_followup` après 18 mois.
- `ch_south_blue_01_sorbet_paint_over_check` → `ch_south_blue_01_sorbet_inspection_followup` après 12 mois.
- `ch_south_blue_01_centaurea_miracle_tonic` → `ch_south_blue_01_centaurea_tonic_followup` après 6 mois.

## DEDUP_NOTES

- Ledger accepté 01–06 relu avant authoring ; `CH_EAST_BLUE_01` et `CH_WEST_BLUE_01` présents.
- Aucun root ne reprend les storms/shutters, lantern/parade, cargo misroute, clinic overflow, launching-cradle accident, harbor-signal legacy, living atlas, chain of favors, household ledger ou three-breaths practice des batches acceptés.
- Les scènes de chantier South Blue sont diagnostiques/organisationnelles (grain du bois, marque de calfatage, contrôle sous peinture) et non des reskins des accidents de mise à l’eau/rigging déjà acceptés.
- Le contenu médical de Baterilla/Briss traite hygiène de matériel, préservation de remèdes et gestion d’un débarquement fiévreux ; il ne reprend pas la prémisse de clinique débordée.
- `tayaSaltwindLegacy` est une évolution agronomique communautaire autour de la protection contre le sel. Elle se distingue de `enoa_living_atlas` (cartographie), `loguetownSignalLegacy` (sécurité maritime), `ledger_of_obligations` (dettes), `favorChain` (entraide) et `three_breaths_life_practice` (rituel personnel).
- La proximité thématique avec des Events agricoles ponctuels acceptés est limitée au domaine rural : la Lifetime ne repose ni sur une tempête unique ni sur une réparation de drainage, mais sur trois familles de solutions, leur diffusion et leur héritage sur plusieurs décennies.
