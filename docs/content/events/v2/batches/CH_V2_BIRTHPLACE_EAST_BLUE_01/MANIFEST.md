# MANIFEST — CH_V2_BIRTHPLACE_EAST_BLUE_01

## Repository baseline

- Repository source de vérité : `NathanTheophile/opfg`.
- Branche relue : `dev`.
- HEAD exact vérifié : `5e01e1791e9087437a21da0da2697f0f5cf52728`.
- Content Schema : **14**.
- Save version : **21**.
- Production : package standalone uniquement ; repository laissé en lecture seule.
- Aucun commit, branche, PR, Concept Index update ou Migration Ledger update.
- Autorités ciblées relues : `AGENTS.md`, `docs/GAME_DESIGN.md`, `docs/design/WORLD_TIMELINE_AND_CANON.md`, `docs/content/EVENT_AUTHORING_RULES.md`, `docs/content/CONTENT_BIBLE.md`, `docs/content/TRAITS_CATALOG.md`, `docs/content/events/v2/CHILDHOOD_V2_BATCH_CONTRACT.md`, `docs/content/locations/OPFG_LOCATION_TAGS.md`, `docs/content/locations/OPFG_WORLD_V1.md`, `docs/content/locations/OPFG_WORLD_V1.json`, `src/game/content/data/locationsV1.json`, `src/game/content/schema.ts`, `src/game/content/catalogFactory.ts`.
- Déduplication : root registries des cinq manifests Wave 1, quatre Race Wave 2 et cinq Origin Cross Wave 3.

Package :
- **16** Normal roots.
- **15** Immediate EventDefinitions.
- **0** Scheduled EventDefinition.
- **31** EventDefinitions au total.
- **308** clés FR source/fallback.
- **0** Lifetime Thread.
- **0** nouvelle définition persistante.

## Exact 8 Birth Locations discovered

| ID | Nom | Type | Parent runtime | Ship market | Services utiles | Tags | Autorité d'authoring utilisée |
|---|---|---|---|---|---|---|---|
| `foosha_village` | Foosha Village | `village` | `goa_kingdom` | `small_craft` | food, lodging, general_goods, trade, ship_repair, crew_recruitment | village, coastal, rural | Pêche, départ en mer, équipages de passage. |
| `orange_town` | Orange Town | `city` | `—` | `small_craft` | food, lodging, general_goods, weapons, medical, trade, ship_repair, crew_recruitment | city, coastal, urban | Commerce, criminalité ponctuelle, vie civile. |
| `syrup_village` | Syrup Village | `village` | `—` | `small_craft` | food, lodging, general_goods, medical, trade, ship_repair, crew_recruitment | village, coastal, rural | Voisinage, commerce léger, départ en mer. |
| `shells_town` | Shells Town | `city` | `—` | `small_craft` | food, lodging, general_goods, weapons, medical, trade, ship_repair, crew_recruitment, marine_services | city, coastal, urban, marine_presence | Forte présence Marine; `153rd_branch` est une sous-location runtime de Shells Town. |
| `shimotsuki_village` | Shimotsuki Village | `village` | `—` | `small_craft` | food, lodging, general_goods, weapons, crew_recruitment | village, rural | Entraînement, discipline martiale, vie rurale. |
| `cocoyasi_village` | Cocoyasi Village | `village` | `—` | `small_craft` | food, lodging, general_goods, medical, trade, ship_repair, crew_recruitment | village, coastal, rural | Village côtier agricole; navigation locale. |
| `loguetown` | Loguetown | `city` | `—` | `full` | food, lodging, general_goods, weapons, medical, trade, ship_repair, crew_recruitment, marine_services | city, coastal, port, trade, historic, marine_presence, urban | Grand hub commercial/Marine; seul Birth Location East Blue avec marché naval `full`. |
| `goa_capital` | Goa Capital | `city` | `goa_kingdom` | `small_craft` | food, lodging, general_goods, weapons, medical, trade, ship_repair, crew_recruitment | capital, city, coastal, royal, wealthy, urban | Centre urbain habité de Goa; partage `goa_kingdom`/Dawn Island avec Foosha. |

Les huit entrées ci-dessus sont exactement les Locations `east_blue` actuelles avec `canBeBirthLocation: true` dans `src/game/content/data/locationsV1.json`.

## Root registry

| Location | Early root | Late root | age windows | Dice? | Immediate depth | local metadata exploited |
|---|---|---|---|---|---|---|
| `foosha_village` | `ch_v2_birthplace_east_blue_01_foosha_tide_line` | `ch_v2_birthplace_east_blue_01_foosha_passing_crew_nets` | E 48–95 / L 108–155 | E oui / L non | E 2 / L 1 | village + coastal + rural; pêche et départ en mer (authoringNotes) ; équipages de passage + pêche + village côtier (authoringNotes) |
| `orange_town` | `ch_v2_birthplace_east_blue_01_orange_medicine_under_cart` | `ch_v2_birthplace_east_blue_01_orange_grinder_clinic` | E 60–107 / L 120–179 | E non / L oui | E 1 / L 0 | ville urbaine + médical + réparation navale + criminalité ponctuelle (authoringNotes) ; ville urbaine + services armes et médical, friction de voisinage commercial |
| `syrup_village` | `ch_v2_birthplace_east_blue_01_syrup_wrong_departure_bundle` | `ch_v2_birthplace_east_blue_01_syrup_repaired_departure` | E 60–107 / L 108–167 | E oui / L non | E 0 / L 2 | village côtier rural + voisinage + départ en mer + médical (authoringNotes/services) ; voisinage + départ en mer + ship_repair + small_craft |
| `shells_town` | `ch_v2_birthplace_east_blue_01_shells_clinic_passage` | `ch_v2_birthplace_east_blue_01_shells_crane_priority` | E 48–95 / L 120–179 | E non / L oui | E 0 / L 3 | marine_presence + medical + ship_repair, friction civilo-militaire en ville ; marine_presence + marine_services + ship_repair + quai urbain |
| `shimotsuki_village` | `ch_v2_birthplace_east_blue_01_shimotsuki_splintered_bokken` | `ch_v2_birthplace_east_blue_01_shimotsuki_training_boundary` | E 48–95 / L 108–167 | E non / L oui | E 1 / L 0 | discipline martiale + matériel d'entraînement + village rural (authoringNotes) ; discipline martiale + aire d'entraînement + ruralité, sans combat |
| `cocoyasi_village` | `ch_v2_birthplace_east_blue_01_cocoyasi_irrigation_mouth` | `ch_v2_birthplace_east_blue_01_cocoyasi_pitch_runoff` | E 60–107 / L 120–179 | E oui / L oui | E 2 / L 0 | village côtier agricole + marée + irrigation, agriculture explicitement supportée ; agricultural + coastal + ship_repair; conflit concret entre chantier côtier et irrigation |
| `loguetown` | `ch_v2_birthplace_east_blue_01_loguetown_galleon_walkway` | `ch_v2_birthplace_east_blue_01_loguetown_full_market_slip` | E 60–107 / L 132–179 | E non / L oui | E 0 / L 2 | port + trade + full shipMarket; coexistence galion/sloop/chaloupe propre au marché naval complet ; full shipMarket + grand hub portuaire; navire marchand et small_craft dans une même cale |
| `goa_capital` | `ch_v2_birthplace_east_blue_01_goa_foosha_delivery` | `ch_v2_birthplace_east_blue_01_goa_repair_priority` | E 60–107 / L 120–179 | E oui / L oui | E 1 / L 0 | capital + wealthy + urban + parent Goa Kingdom; échange concret avec Foosha, autre lieu du même ensemble ; capital wealthy + ship_repair + small_craft + relation géographique Foosha/Goa Kingdom |

Répartition : **8 Early + 8 Late**, exactement **2 roots par Birth Location**.

## Birthplace indispensability audit

- `ch_v2_birthplace_east_blue_01_foosha_tide_line` — La friction vient explicitement de la pêche de Foosha : barque, paniers de poissons et ligne de mouillage sous tension. La pêche est nommée par les authoringNotes locales, pas par un port générique.
- `ch_v2_birthplace_east_blue_01_foosha_passing_crew_nets` — Le conflit oppose les filets des pêcheurs de Foosha aux bagages d'un équipage de passage, deux activités explicitement décrites ensemble dans les authoringNotes du village.
- `ch_v2_birthplace_east_blue_01_orange_medicine_under_cart` — La scène combine la criminalité ponctuelle autorisée d'Orange Town avec ses services `medical` et `ship_repair` dans une rue urbaine : le paquet volé est dissimulé sous un chariot de réparation.
- `ch_v2_birthplace_east_blue_01_orange_grinder_clinic` — La friction vient de deux services voisins réellement présents à Orange Town, `weapons` et `medical`, dans son tissu urbain : les étincelles du rémouleur menacent le linge de clinique.
- `ch_v2_birthplace_east_blue_01_syrup_wrong_departure_bundle` — La scène assemble les trois axes donnés à Syrup : voisinage rural, commerce léger et départ en mer, avec son service médical. Ce n'est pas une course générique : l'erreur porte sur le chargement d'une petite embarcation de livraison.
- `ch_v2_birthplace_east_blue_01_syrup_repaired_departure` — Le départ d'une voisine avec des colis du commerce local ne peut exister sous cette forme sans le couple `ship_repair` + départ en mer + voisinage explicitement assigné à Syrup.
- `ch_v2_birthplace_east_blue_01_shells_clinic_passage` — La 153e branche est une sous-location runtime de Shells Town. Sa présence Marine entre matériellement en conflit avec les services civils `medical`/`ship_repair`, ce qui ancre acteurs et passage à Shells.
- `ch_v2_birthplace_east_blue_01_shells_crane_priority` — Le palan oppose une équipe de la 153e branche à un réparateur civil : la forte présence Marine locale et `marine_services` changent qui réclame l'infrastructure et pourquoi la priorité est contestée.
- `ch_v2_birthplace_east_blue_01_shimotsuki_splintered_bokken` — Le problème naît d'un râtelier de sabres de bois et d'une inspection de matériel dans l'espace d'entraînement, directement issu de la discipline martiale autorisée à Shimotsuki.
- `ch_v2_birthplace_east_blue_01_shimotsuki_training_boundary` — L'enjeu combine aire d'entraînement et parcelle rurale : il faut redessiner une pratique martiale sans empiéter sur la vie rurale, plutôt que gagner un combat.
- `ch_v2_birthplace_east_blue_01_cocoyasi_irrigation_mouth` — La marée bouche le canal qui arrose des semis : la scène dépend simultanément du caractère côtier et de l'activité agricole explicitement documentée pour Cocoyasi.
- `ch_v2_birthplace_east_blue_01_cocoyasi_pitch_runoff` — Le `ship_repair` côtier menace directement un fossé d'irrigation agricole. Ce conflit entre réparation de coque et cultures est construit à partir des activités autorisées de Cocoyasi.
- `ch_v2_birthplace_east_blue_01_loguetown_galleon_walkway` — Le galion, les sloops et les chaloupes coexistent parce que Loguetown possède le seul marché naval `full` parmi les huit Birth Locations East Blue ; un marché `small_craft` ne supporte pas la même scène.
- `ch_v2_birthplace_east_blue_01_loguetown_full_market_slip` — Le conflit de cale oppose un navire marchand à plusieurs petites embarcations dans un même marché naval `full`, situation structurellement propre au grand hub portuaire de Loguetown.
- `ch_v2_birthplace_east_blue_01_goa_foosha_delivery` — Foosha et Goa Capital partagent le même ensemble runtime (`goa_kingdom` / Dawn Island). La friction exploite le contraste documenté entre paniers de pêche de Foosha et galerie urbaine aisée de la capitale.
- `ch_v2_birthplace_east_blue_01_goa_repair_priority` — Le dernier créneau oppose une barque de pêche venue de Foosha au sloop d'un client fortuné : le lien géographique Goa–Foosha et les tags `wealthy`/`capital` changent l'acteur favorisé et l'enjeu.

## Dice audit

Exactement **10 / 16 = 62.5 %** des Normal roots ont un DiceCheck au root.

- `ch_v2_birthplace_east_blue_01_foosha_tide_line` — agility @8 / observation @8.
- `ch_v2_birthplace_east_blue_01_orange_grinder_clinic` — charisma @11 / intelligence @11.
- `ch_v2_birthplace_east_blue_01_syrup_wrong_departure_bundle` — observation @8 / charisma @8.
- `ch_v2_birthplace_east_blue_01_shells_crane_priority` — intelligence @11 / charisma @11.
- `ch_v2_birthplace_east_blue_01_shimotsuki_training_boundary` — intelligence @11 / charisma @11.
- `ch_v2_birthplace_east_blue_01_cocoyasi_irrigation_mouth` — strength @8 / intelligence @8.
- `ch_v2_birthplace_east_blue_01_cocoyasi_pitch_runoff` — intelligence @11 / agility @11.
- `ch_v2_birthplace_east_blue_01_loguetown_full_market_slip` — intelligence @11 / charisma @11.
- `ch_v2_birthplace_east_blue_01_goa_foosha_delivery` — charisma @11 / observation @11.
- `ch_v2_birthplace_east_blue_01_goa_repair_priority` — intelligence @11 / charisma @11.

Chaque Dice root propose deux approches risquées distinctes. Profil appliqué sur la Stat testée : `criticalFailure -1`, `failure 0`, `success +2`, `criticalSuccess +2`. Les failures conservent une perte concrète dans la fiction sans compensation positive automatique.

Difficultés utilisées : Early principalement Easy `8`; Late principalement Standard `11`. Aucun seuil hors grille V1.

## Immediate audit

Exactement **9 / 16 = 56.25 %** des roots ouvrent un mini-arc Immediate.

- `ch_v2_birthplace_east_blue_01_foosha_tide_line` — profondeur maximale **2**.
- `ch_v2_birthplace_east_blue_01_foosha_passing_crew_nets` — profondeur maximale **1**.
- `ch_v2_birthplace_east_blue_01_orange_medicine_under_cart` — profondeur maximale **1**.
- `ch_v2_birthplace_east_blue_01_syrup_repaired_departure` — profondeur maximale **2**.
- `ch_v2_birthplace_east_blue_01_shells_crane_priority` — profondeur maximale **3**.
- `ch_v2_birthplace_east_blue_01_shimotsuki_splintered_bokken` — profondeur maximale **1**.
- `ch_v2_birthplace_east_blue_01_cocoyasi_irrigation_mouth` — profondeur maximale **2**.
- `ch_v2_birthplace_east_blue_01_loguetown_full_market_slip` — profondeur maximale **2**.
- `ch_v2_birthplace_east_blue_01_goa_foosha_delivery` — profondeur maximale **1**.

- Roots profondeur 2+ : **5**.
- Root profondeur 3 : `ch_v2_birthplace_east_blue_01_shells_crane_priority`.
- Immediate EventDefinitions : **15**.
- Targets Immediate manquants : **0**.
- Cycles Immediate : **0**.
- Immediate orphelins : **0**.
- Aucun écran `Continuer` : chaque node change l'état concret de la scène, ajoute une information, une tactique ou une décision de résolution.

## Scheduled audit

- Scheduled EventDefinitions : **0**.
- Effects `scheduleEvent` : **0**.
- Aucun callback n'était nécessaire : tous les conflits sont des situations continues qui doivent se résoudre dans la même scène.

## Reward / malus audit

- Dice : `-1 / 0 / +2 / +2` sur la Stat testée.
- Choices déterministes : changements de Stat limités à **-1 / 0 / +1**.
- Aucun malus déterministe sous `-1`.
- Aucun reward déterministe ordinaire au-dessus de `+1`.
- Les failures à `0` progression ratent une opportunité, maintiennent/aggravent un problème ou imposent un coût fictionnel.
- Aucun Health, Berrys, Reputation, Bounty, Item, carrière, NPC state ou déplacement n'est muté.
- Seuls les Effects existants `modifyStat` et `queueImmediateEvent` sont utilisés.

## Trait audit

- Trait grants : **0**.
- Trait removals : **0**.
- Trait-gated Choices : **0**.
- Aucun nouveau Trait.
- Aucun risque de paire opposée ou de distribution excessive de Traits.

## Geography / canon audit

- Chaque Normal root possède exactement un `locationIs(<Birth Location>)`, plus `careerPhaseIs(childhood)`, `ageAtLeastMonths` et `ageAtMostMonths`.
- Aucun root n'utilise `originSeaIs` comme substitut à l'exact Location.
- Tous les roots utilisent `narrativeFamily: "origin_birthplace"`.
- Aucun root ne requiert Race, affiliation familiale, structure familiale ou classe sociale.
- Tous les acteurs sont prose-only et locaux.
- Aucun personnage canon nommé, cameo gratuit ou réécriture d'arc canon.
- Foosha : aucune rencontre avec Luffy.
- Shimotsuki : aucune rencontre avec Zoro.
- Cocoyasi : aucune participation à l'arc Arlong et aucun personnage majeur.
- Loguetown : aucun Roger/Luffy ; le batch exploite uniquement le hub portuaire, Marine et son marché naval `full`.
- Goa Capital : aucune intrigue dynastique, héritage ou protocole Royal Family ; seules géographie urbaine, richesse et relation avec Foosha sont exploitées.
- La Childhood reste dans la fenêtre pré-voyage principal définie par `WORLD_TIMELINE_AND_CANON`.

## Wave 1 / 2 / 3 collision audit

Wave 1 :
- évite les petits objets/pertes/chore génériques comme moteur ;
- évite les apprentissages génériques, prix/caisses/stock, courrier ou argent confié de Generic Late ;
- évite friend/rival/peer-status et les introductions persistantes de Peers ;
- évite les signaux de port, drill Marine, posters/journaux/cartes et exposition institutionnelle d'Identity / World ;
- évite combat, rescue, chase, feu, chute, breakfall et autres dangers physiques génériques de Combat / Risk.

Wave 2 Race :
- aucune ergonomie Human-standard, morphologie, sens Mink, accès aquatique Fish-Man ou problème d'échelle Giant ;
- aucun `raceIs`, aucune capacité raciale, aucun Trait racial implicite.

Wave 3 Origin Cross :
- aucun `affiliationIs`, aucun conflit familial d'affiliation et aucune reprise des gates/checkpoints, escortes Marine, partages pirates, clandestinité révolutionnaire ou protocole royal déjà utilisés ;
- les scènes sont causées par le lieu précis et ses metadata, pas par une combinaison d'Origins.

Ports et commerces ont été différenciés :
- Foosha = pêche + équipages de passage ;
- Orange = friction urbaine de services / criminalité ponctuelle ;
- Syrup = voisinage + commerce léger + départ ;
- Shells = infrastructure civile face à la 153e branche ;
- Shimotsuki = discipline martiale ancrée dans le rural ;
- Cocoyasi = agriculture côtière / irrigation ;
- Loguetown = marché naval `full` multi-châssis ;
- Goa Capital = richesse urbaine + relation intra-Goa avec Foosha.

## Persistent-definition audit

- New `NpcDefinition` : **0**.
- New `ItemDefinition` : **0**.
- New `TraitDefinition` : **0**.
- New Location : **0**.
- New Flag système : **0**.
- New Condition : **0**.
- New Effect : **0**.
- New mécanique : **0**.
- Persistent NPC cast : **0**.
- `childhood_friend`, `childhood_rival`, `childhood_younger`, `neighborhood_merchant` : **non référencés**.
- Tous les Events restent directement compatibles avec les primitives Schema 14 utilisées par les batches V2 actuels.

## Machine / self-audit

- IDs Event uniques / préfixe conforme : PASS.
- Filenames prévus == Event IDs : PASS.
- 16 Normal roots exactement : PASS.
- 8 Birth Locations exactement, 2 roots chacune : PASS.
- 8 Early + 8 Late : PASS.
- 10 Dice roots exactement : PASS.
- 9 mini-arc roots exactement : PASS.
- 5 depth-2+ / 1 depth-3 : PASS.
- 0 Lifetime / 0 Scheduled : PASS.
- Immediate targets existants / sans cycle / sans orphelin : PASS.
- Localisation FR complète et sans clé inutilisée : PASS.
- Root bodies 20–45 mots : PASS.
- Immediate bodies 12–40 mots : PASS.
- Choice labels 2–10 mots : PASS.
- Outcome bodies 5–25 mots : PASS.
- Tous les Events ont au moins une Choice inconditionnelle : PASS.
- Aucun nouvel ID persistant : PASS.
- Aucun token de personnage canon surveillé dans le texte : PASS.
