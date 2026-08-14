# CH_V2_BIRTHPLACE_SOUTH_BLUE_01 — MANIFEST

## Repository baseline

- Repository: `NathanTheophile/opfg`
- Branch read: `dev`
- Exact HEAD verified: `5e01e1791e9087437a21da0da2697f0f5cf52728`
- HEAD subject: `feat(content): integrate Childhood V2 Origin Cross Wave 3`
- Content Schema: **14**
- Save version: **21**
- Production mode: standalone package only; repository left read-only.
- Repository modifications / commit / branch / PR: **none**.

## Exact 8 Birth Locations discovered

- `baterilla_harbor` — Baterilla Harbor — `canBeBirthLocation: true` — port; coastal; trade; small_craft; medical; ship_repair; civilian stopover note
- `sorbet_southport` — Sorbet Southport — `canBeBirthLocation: true` — port; coastal; trade; small_craft; parent sorbet_kingdom; travel/commerce note
- `torino_tree_village` — Canopy Village — `canBeBirthLocation: true` — village; forest; medical; rural; no docking; inhabited/forested Torino sub-location
- `karate_island` — Karate Island — `canBeBirthLocation: true` — island; coastal; military; weapons; medical; martial training/discipline note
- `briss_port` — Briss Port — `canBeBirthLocation: true` — port; city; trade; shipyard; full ship market; ship_repair
- `samba_city` — Samba City — `canBeBirthLocation: true` — city; coastal; trade; urban; entertainment
- `centaurea_town` — Centaurea Town — `canBeBirthLocation: true` — city; coastal; trade; urban; ship_repair
- `taya_village` — Taya Village — `canBeBirthLocation: true` — village; coastal; rural; small_craft; fishing/departure note

## Root registry

| Location | Early root | Late root | age windows | Dice? | Immediate depth | local metadata exploited |
|---|---|---|---|---|---:|---|
| Baterilla Harbor (`baterilla_harbor`) | `ch_v2_birthplace_south_blue_01_baterilla_skiff_cradle_marks` | `ch_v2_birthplace_south_blue_01_baterilla_bandage_before_boarding` | 60–95 / 108–167 | Early yes / Late no | 1 / 0 | port; coastal; trade; small_craft; medical; ship_repair; civilian stopover note |
| Sorbet Southport (`sorbet_southport`) | `ch_v2_birthplace_south_blue_01_sorbet_shared_ramp` | `ch_v2_birthplace_south_blue_01_sorbet_two_direction_courier` | 48–95 / 120–179 | Early no / Late yes | 0 / 2 | port; coastal; trade; small_craft; parent sorbet_kingdom; travel/commerce note |
| Canopy Village (`torino_tree_village`) | `ch_v2_birthplace_south_blue_01_canopy_dropped_medicine_pouch` | `ch_v2_birthplace_south_blue_01_canopy_stretcher_fork` | 36–83 / 108–167 | Early yes / Late yes | 2 / 3 | village; forest; medical; rural; no docking; inhabited/forested Torino sub-location |
| Karate Island (`karate_island`) | `ch_v2_birthplace_south_blue_01_karate_cracked_training_staff` | `ch_v2_birthplace_south_blue_01_karate_drill_crossing` | 60–95 / 120–179 | Early no / Late yes | 1 / 2 | island; coastal; military; weapons; medical; martial training/discipline note |
| Briss Port (`briss_port`) | `ch_v2_birthplace_south_blue_01_briss_launch_wedges` | `ch_v2_birthplace_south_blue_01_briss_two_hulls_one_ramp` | 72–95 / 120–179 | Early yes / Late yes | 1 / 0 | port; city; trade; shipyard; full ship market; ship_repair |
| Samba City (`samba_city`) | `ch_v2_birthplace_south_blue_01_samba_crossed_cues` | `ch_v2_birthplace_south_blue_01_samba_square_marks` | 48–95 / 108–167 | Early yes / Late no | 1 / 0 | city; coastal; trade; urban; entertainment |
| Centaurea Town (`centaurea_town`) | `ch_v2_birthplace_south_blue_01_centaurea_tarred_doorsteps` | `ch_v2_birthplace_south_blue_01_centaurea_spar_through_market` | 48–95 / 120–179 | Early no / Late yes | 0 / 1 | city; coastal; trade; urban; ship_repair |
| Taya Village (`taya_village`) | `ch_v2_birthplace_south_blue_01_taya_net_rows` | `ch_v2_birthplace_south_blue_01_taya_dawn_net_patch` | 60–95 / 108–167 | Early yes / Late no | 0 / 0 | village; coastal; rural; small_craft; fishing/departure note |

## Birthplace indispensability audit

- `ch_v2_birthplace_south_blue_01_baterilla_skiff_cradle_marks` — Le problème naît de la répartition de petites embarcations entre des cales de réparation d’un port civil doté de ship_repair; retirer ce flux de réparation supprime la scène.
- `ch_v2_birthplace_south_blue_01_baterilla_bandage_before_boarding` — La friction combine le service médical du quai et la fonction d’escale de petites embarcations : soin en cours contre départ du passage.
- `ch_v2_birthplace_south_blue_01_sorbet_shared_ramp` — La passerelle sert à l’interface physique entre la route du parent Sorbet Kingdom et un départ maritime; un port autonome sans cet axe intérieur↔mer perd la situation.
- `ch_v2_birthplace_south_blue_01_sorbet_two_direction_courier` — Les deux remises opposées existent parce que Southport est le point de bascule route intérieure de Sorbet ↔ mer; aucune politique royale n’est utilisée.
- `ch_v2_birthplace_south_blue_01_canopy_dropped_medicine_pouch` — Le traitement tombe entre plateformes et racines dans l’intérieur habité de l’arbre; sans structure forestière intérieure + medical, le problème disparaît.
- `ch_v2_birthplace_south_blue_01_canopy_stretcher_fork` — La géométrie d’un embranchement du tronc bloque une civière médicale et impose des prises spécifiques; ce n’est pas une scène de soin transplantable dans une rue.
- `ch_v2_birthplace_south_blue_01_karate_cracked_training_staff` — La friction vient du rangement institutionnel d’armes d’entraînement avant un exercice collectif, pas d’une bagarre ni d’un simple test physique.
- `ch_v2_birthplace_south_blue_01_karate_drill_crossing` — Une règle de cadence martiale entre en conflit avec le passage d’une civière; la discipline locale change acteurs, règle et enjeu.
- `ch_v2_birthplace_south_blue_01_briss_launch_wedges` — La scène dépend d’un vrai chantier naval et de l’infrastructure de mise à l’eau d’une coque neuve, absente des ports small_craft ordinaires.
- `ch_v2_birthplace_south_blue_01_briss_two_hulls_one_ramp` — Deux inspections de coques sont plausibles parce que Briss possède à la fois shipyard et full ship market; cette concurrence n’existe pas telle quelle ailleurs.
- `ch_v2_birthplace_south_blue_01_samba_crossed_cues` — Deux troupes de rue et leur foule bloquent un carrefour marchand parce que entertainment + urban + trade sont simultanément structurants à Samba.
- `ch_v2_birthplace_south_blue_01_samba_square_marks` — La négociation porte sur le même espace public entre zone de spectacle et étals; sans entertainment urbain, le conflit d’usage change de nature.
- `ch_v2_birthplace_south_blue_01_centaurea_tarred_doorsteps` — Le matériau du chantier naval traverse directement une rue commerçante dense; ship_repair + urban produit la friction entre réparation maritime et façades.
- `ch_v2_birthplace_south_blue_01_centaurea_spar_through_market` — Un composant naval surdimensionné doit traverser des rues urbaines commerçantes depuis l’atelier jusqu’au quai; la ville et ship_repair sont tous deux nécessaires.
- `ch_v2_birthplace_south_blue_01_taya_net_rows` — Les filets de pêche séchant sur la plage entrent en conflit avec l’atterrissage d’une petite embarcation; la note locale pêche + rural/coastal cause la scène.
- `ch_v2_birthplace_south_blue_01_taya_dawn_net_patch` — La décision porte sur deux filets de pêche dont l’un repart à l’aube; le cycle de travail d’un village de pêcheurs est le moteur, pas un artisanat générique.

## Dice audit

- Root Dice: **10 / 16 exactly (62.5%)**.
- Early Dice roots: **5 / 8**. Late Dice roots: **5 / 8**.
- Every Dice root has exactly two materially different Dice Choices.
- Root Dice progression on the rolled Stat is consistently **-1 / 0 / +2 / +2** for criticalFailure / failure / success / criticalSuccess.
- Failure prose always records a missed timing, blocked route, unresolved conflict or worsened local situation; no failure receives compensating positive Stat progression.

- `ch_v2_birthplace_south_blue_01_baterilla_skiff_cradle_marks` — observation @11 / intelligence @11
- `ch_v2_birthplace_south_blue_01_sorbet_two_direction_courier` — agility @11 / charisma @11
- `ch_v2_birthplace_south_blue_01_canopy_dropped_medicine_pouch` — agility @11 / observation @11
- `ch_v2_birthplace_south_blue_01_canopy_stretcher_fork` — intelligence @14 / agility @14
- `ch_v2_birthplace_south_blue_01_karate_drill_crossing` — observation @11 / charisma @11
- `ch_v2_birthplace_south_blue_01_briss_launch_wedges` — observation @11 / intelligence @11
- `ch_v2_birthplace_south_blue_01_briss_two_hulls_one_ramp` — intelligence @14 / charisma @11
- `ch_v2_birthplace_south_blue_01_samba_crossed_cues` — charisma @11 / agility @11
- `ch_v2_birthplace_south_blue_01_centaurea_spar_through_market` — intelligence @11 / agility @11
- `ch_v2_birthplace_south_blue_01_taya_net_rows` — agility @11 / observation @11

## Immediate audit

- Mini-arc roots: **9 / 16 exactly (56.25%)**.
- Roots with reachable Immediate depth 2+: **4 / 9**.
- Required depth-3 route: **yes**, `ch_v2_birthplace_south_blue_01_canopy_stretcher_fork`.
- Total Immediate EventDefinitions: **14**.
- No Immediate cycle and no orphan Immediate target.

- `ch_v2_birthplace_south_blue_01_baterilla_skiff_cradle_marks` → max depth **1**
- `ch_v2_birthplace_south_blue_01_sorbet_two_direction_courier` → max depth **2**
- `ch_v2_birthplace_south_blue_01_canopy_dropped_medicine_pouch` → max depth **2**
- `ch_v2_birthplace_south_blue_01_canopy_stretcher_fork` → max depth **3**
- `ch_v2_birthplace_south_blue_01_karate_cracked_training_staff` → max depth **1**
- `ch_v2_birthplace_south_blue_01_karate_drill_crossing` → max depth **2**
- `ch_v2_birthplace_south_blue_01_briss_launch_wedges` → max depth **1**
- `ch_v2_birthplace_south_blue_01_samba_crossed_cues` → max depth **1**
- `ch_v2_birthplace_south_blue_01_centaurea_spar_through_market` → max depth **1**

## Scheduled audit

- Scheduled EventDefinitions: **0**.
- Non-mini-arc callbacks: **0**.
- No future root slot is consumed by this batch.

## Reward / malus audit

- Deterministic player-Stat effects stay inside **-1 / 0 / +1**.
- Dice rolled-Stat effects stay inside **-1 / 0 / +2 / +2**.
- No deterministic reward above +1 and no Stat malus below -1.
- Neutral outcomes remain fictional tradeoffs or missed opportunities rather than automatic consolation rewards.
- No Health, Berrys, Reputation, Bounty, Item, NPC state, career or movement mutation.

## Trait audit

- Trait grants: **0**.
- Trait removals: **0**.
- Trait-gated Choices: **0**.
- No new TraitDefinition and therefore no opposite-pair acquisition risk.

## Geography / canon audit

- Every Normal root requires `careerPhaseIs(childhood)`, explicit min/max age, and exact `locationIs(...)`.
- Exactly two roots are authored per discovered South Blue Birth Location: one Early and one Late.
- No root requires Race, inherited affiliation, Family Structure or Social Class.
- Baterilla contains no canon-character reference or canon-event shortcut.
- Sorbet contains no canon-character reference and no political rewrite; only its documented port ↔ parent-kingdom travel interface is used.
- Karate Island uses martial discipline, training equipment and a medical crossing rather than generic combat checks.
- Canopy Village uses the inhabited-tree interior, forest geometry and medical function; no generic herb-gathering reskin is present.
- Custom OPFG locations use only current type / parent / tags / services / docking / shipMarket / authoring-note implications; no invented dynasty, festival, religion, historical disaster or secret organization.
- No canon character appears. All local actors are prose-only throwaway roles.

## Wave 1 / 2 / 3 collision audit

- Wave 1 root registries scanned: Generic Early, Generic Late, Peers, Identity / World, Combat / Risk. Avoided direct/noun-swap collisions including generic delivery, mislabeled crate, harbor-signal, puppet-case, after-hours-repair, queue, runaway-object and generic accident structures.
- Wave 2 root registries scanned: Human, Fish-Man, Mink, Giant. Avoided Human-standard interface territory, Fish-Man under-hull/net-under-piling/aquatic-rescue territory, Mink sensory-tracking territory and Giant body-scale geometry territory.
- Wave 3 root registries scanned: Civilian, Marine, Pirate, Revolutionary and Royal Origin Cross. No root requires Race × affiliation and no scene reuses their checkpoint/access, false-flag, covert-workshop or court-protocol engines.
- Representative current V2 runtime Event JSON was checked for schema shape; no foreign batch runtime was opened beyond what collision verification required.

## Persistent-definition audit

- New `NpcDefinition`: **0**. New `ItemDefinition`: **0**. New `TraitDefinition`: **0**. New Location: **0**. New Flag ID: **0**.
- Persistent NPC references: **0**. Items / equipment: **0**. Traits: **0**.
- Conditions used: existing `all`, `careerPhaseIs`, `ageAtLeastMonths`, `ageAtMostMonths`, `locationIs`.
- Effects used: existing `modifyStat`, `queueImmediateEvent` only.
- `majorTrack`: **0**. `lifetimeThreadSeed`: **0**. `openingRole`: **0**.
- Filenames equal Event IDs; IDs are unique and use the reserved prefix.

## Final self-audit

- Normal roots: **16 exactly**.
- Birth Locations: **8 exactly**, **2 roots each**.
- Early / Late: **8 / 8**.
- Root Dice: **10 exactly**.
- Mini-arc roots: **9 exactly**.
- Immediate depth 2+: **4 roots**; depth 3: **1 root**.
- Lifetime Threads: **0**. Scheduled: **0**.
- Event IDs / filenames / Immediate targets / localization keys: **validated locally**.
- Immediate graph cycles / orphans: **none**.
- Root FR body budget: **all 20–45 words**.
- Every Event has at least one unconditional resolvable Choice; this batch uses no `availableIf`.
- No repository file was modified.
