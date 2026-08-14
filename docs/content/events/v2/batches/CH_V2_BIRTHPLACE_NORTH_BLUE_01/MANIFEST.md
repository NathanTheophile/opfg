# MANIFEST — CH_V2_BIRTHPLACE_NORTH_BLUE_01

## Repository baseline

- Repository: `NathanTheophile/opfg`
- Branch reviewed: `dev`
- **HEAD exact:** `5e01e1791e9087437a21da0da2697f0f5cf52728`
- HEAD subject: `feat(content): integrate Childhood V2 Origin Cross Wave 3`
- **Content Schema:** `14`
- **Save version:** `21`
- Package produced outside the repository; repository left read-only.
- No commit, branch, PR, Concept Index update or Migration Ledger update.
- Dedicated Wave 4 brief overrides the ordinary Childhood Lifetime quota for this package: **0 Lifetime Thread** by design.

## Exact 8 Birth Locations discovered

The current `src/game/content/data/locationsV1.json` was filtered by `seaId: north_blue` and `canBeBirthLocation: true`.

1. `lvneel_norlune_port` — Norlune Port
2. `whiteland_whiteport` — Whiteport
3. `deul_clocktown` — Clocktown
4. `kuen_village` — Kuen Village
5. `pepe_port` — Pepe Port
6. `gingapore_city` — Gingapore City
7. `rubeck_island` — Rubeck Island
8. `swallow_island` — Swallow Island

Explicit non-Birth checks from the same catalogue: `flevance`, `germa_empire`, `north_66th_branch`, `minion_island`, `deul_kingdom`, `gingapore_kingdom`, `pepe_kingdom` and `ironpine_mining_town` are all `canBeBirthLocation: false`.

## Root registry

Exactly **16 Normal roots**: 8 Early + 8 Late, exactly 2 per Birth Location.

| Location | Early root | Late root | age windows (months) | Dice? E/L | Immediate depth E/L | local metadata exploited |
|---|---|---|---:|---|---:|---|
| Norlune Port (`lvneel_norlune_port`) | `ch_v2_birthplace_north_blue_01_norlune_wet_mooring_numbers` | `ch_v2_birthplace_north_blue_01_norlune_cracked_old_bollard` | 48–95 / 120–179 | yes / no | 2 / 0 | port; parent `lvneel_kingdom`; tags `coastal`, `port`, `trade`, `historic`; `trade` + `ship_repair`; docking; `small_craft` |
| Whiteport (`whiteland_whiteport`) | `ch_v2_birthplace_north_blue_01_whiteport_snowed_launch_rails` | `ch_v2_birthplace_north_blue_01_whiteport_frozen_drydock_gate` | 48–95 / 120–179 | yes / yes | 3 / 2 | city; parent `whiteland_kingdom`; tags `port`, `trade`, `shipyard`, `snow`, `urban`; `ship_repair`; docking; `full` ship market |
| Clocktown (`deul_clocktown`) | `ch_v2_birthplace_north_blue_01_clocktown_two_carts_one_lane` | `ch_v2_birthplace_north_blue_01_clocktown_narrow_arcade_crossing` | 48–95 / 120–179 | no / yes | 1 / 0 | city; parent `deul_kingdom`; tags `city`, `coastal`, `trade`, `urban`; dense/commercial authoring note; docking |
| Kuen Village (`kuen_village`) | `ch_v2_birthplace_north_blue_01_kuen_soft_village_path` | `ch_v2_birthplace_north_blue_01_kuen_one_cart_supply_run` | 48–95 / 108–167 | yes / no | 0 / 2 | village; tags `village`, `rural`; `trade`; docking; `small_craft`; rural-Origin authoring note |
| Pepe Port (`pepe_port`) | `ch_v2_birthplace_north_blue_01_pepe_shared_gangplank` | `ch_v2_birthplace_north_blue_01_pepe_busy_repair_hoist` | 48–95 / 120–179 | no / yes | 1 / 2 | port; parent `pepe_kingdom`; tags `coastal`, `port`, `trade`; `ship_repair`; docking; simple/popular port authoring note |
| Gingapore City (`gingapore_city`) | `ch_v2_birthplace_north_blue_01_gingapore_overflowing_displays` | `ch_v2_birthplace_north_blue_01_gingapore_samples_block_clinic` | 60–107 / 120–179 | yes / no | 0 / 1 | city; parent `gingapore_kingdom`; tags `city`, `coastal`, `trade`, `urban`; `medical` + `trade`; prosperous/merchant authoring note |
| Rubeck Island (`rubeck_island`) | `ch_v2_birthplace_north_blue_01_rubeck_low_tide_repair` | `ch_v2_birthplace_north_blue_01_rubeck_reefline_to_repair` | 60–107 / 120–179 | yes / yes | 0 / 0 | island; tag `coastal`; `ship_repair` + `trade`; docking; small-island authoring note |
| Swallow Island (`swallow_island`) | `ch_v2_birthplace_north_blue_01_swallow_last_medical_crate` | `ch_v2_birthplace_north_blue_01_swallow_unfamiliar_approach` | 48–95 / 120–179 | no / yes | 2 / 0 | island; tags `coastal`, `isolated`; `medical` + `trade`; docking; small-island authoring note |

Every root uses exactly the required geographical/temporal gates:
`careerPhaseIs(childhood)` + `ageAtLeastMonths` + `ageAtMostMonths` + exact `locationIs(...)`.
Every root uses `narrativeFamily: "origin_birthplace"`.
No root has `majorTrack`, `lifetimeThreadSeed`, or `openingRole`.

## Birthplace indispensability audit

- `ch_v2_birthplace_north_blue_01_norlune_wet_mooring_numbers` — Le moteur est le marquage de bornes anciennes d’un **port explicitement `historic`** qui reste en activité commerciale. Sans ce croisement vieux quai + amarrage actuel, la scène disparaît.
- `ch_v2_birthplace_north_blue_01_norlune_cracked_old_bollard` — La friction oppose la réfection d’une vieille borne au maintien d’un poste de commerce dans le port historique de Lvneel. Ce n’est pas une réparation générique : l’objet est l’infrastructure d’amarrage héritée du quai.
- `ch_v2_birthplace_north_blue_01_whiteport_snowed_launch_rails` — La neige masque les rails de lancement d’un **shipyard**. Retirer `snow` ou `shipyard` supprime à la fois l’obstacle et l’infrastructure.
- `ch_v2_birthplace_north_blue_01_whiteport_frozen_drydock_gate` — Le gel bloque une porte de cale dans le principal contexte `shipyard`/`snow`/`ship_repair` du batch. La scène ne se transplante pas dans un simple port commerçant.
- `ch_v2_birthplace_north_blue_01_clocktown_two_carts_one_lane` — Le conflit naît de la densité `urban` + `trade` : deux chariots et leurs clients saturent une ruelle étroite. Le rural, l’île ou le port ouvert changeraient physiquement le problème.
- `ch_v2_birthplace_north_blue_01_clocktown_narrow_arcade_crossing` — L’arcade contrainte force des flux commerciaux et médicaux à se croiser dans la ville dense. Sans densité urbaine + services multiples, l’enjeu de circulation n’existe plus.
- `ch_v2_birthplace_north_blue_01_kuen_soft_village_path` — Le chariot se bloque sur un chemin entre maisons espacées : la faible densité `rural`/`village` est la cause de la scène, pas un décor interchangeable.
- `ch_v2_birthplace_north_blue_01_kuen_one_cart_supply_run` — La scène combine **village rural dispersé** et **docking** : un bateau décharge, mais la distribution intérieure dépend d’un seul chariot et de chemins séparés. Une ville-port change entièrement la logistique.
- `ch_v2_birthplace_north_blue_01_pepe_shared_gangplank` — Le port `small_craft` simple/populaire produit une ressource commune très concrète : une passerelle mobile disputée entre deux petits bateaux et un petit commerçant. Whiteport dispose d’un contexte de chantier beaucoup plus lourd.
- `ch_v2_birthplace_north_blue_01_pepe_busy_repair_hoist` — Le problème vient d’un **petit port avec `ship_repair` mais sans tag `shipyard`** : un treuil de réparation partagé devient le goulot d’étranglement. La scène n’est pas une cale industrielle de Whiteport.
- `ch_v2_birthplace_north_blue_01_gingapore_overflowing_displays` — L’espace public est grignoté par des tables d’échantillons parce que Gingapore est explicitement une ville urbaine prospère et marchande. Le conflit est l’exposition commerciale, pas une simple livraison.
- `ch_v2_birthplace_north_blue_01_gingapore_samples_block_clinic` — Le moteur est la coexistence `trade` + `medical` dans une ville marchande : les démonstrations commerciales obstruent directement l’accès au dispensaire.
- `ch_v2_birthplace_north_blue_01_rubeck_low_tide_repair` — Rubeck est une **petite île côtière** avec `ship_repair`, sans identité de ville/port/shipyard. La réparation se joue donc directement sur la côte à marée basse.
- `ch_v2_birthplace_north_blue_01_rubeck_reefline_to_repair` — La navigation contourne des roches découvertes pour rejoindre une zone de réparation sur une petite île côtière. Sans `island` + `coastal` + `ship_repair`, l’objectif et le trajet changent.
- `ch_v2_birthplace_north_blue_01_swallow_last_medical_crate` — L’isolement explicitement tagué rend le départ du bateau de commerce important, et `medical` donne une destination locale prioritaire à la caisse. Retirer l’un des deux axes banalise la scène.
- `ch_v2_birthplace_north_blue_01_swallow_unfamiliar_approach` — L’équipage visite un petit lieu `isolated` qu’il connaît mal ; la valeur du joueur vient de sa familiarité avec **ce débarcadère natal**. Dans une grande ville-port fréquentée, cette prémisse ne tient plus.

## Dice audit

- **10 / 16 Dice roots exactly = 62.5%.**
- Early: **5 / 8** Dice roots.
- Late: **5 / 8** Dice roots.
- Every Dice root provides **2 materially different Dice approaches** plus one unconditional deterministic route.
- `criticalFailure`: tested Stat `-1` and clearly worse fiction.
- `failure`: `0` Stat progression and a real missed/worse result.
- `success`: tested Stat `+2`.
- `criticalSuccess`: tested Stat `+2`.
- No failure receives an automatic compensating positive reward.

| Root | Dice approaches |
|---|---|
| `ch_v2_birthplace_north_blue_01_norlune_wet_mooring_numbers` | `read_before_moving` → observation @8; `guide_to_free_bollard` → charisma @11 |
| `ch_v2_birthplace_north_blue_01_whiteport_snowed_launch_rails` | `brush_for_marks` → observation @8; `run_between_markers` → agility @11 |
| `ch_v2_birthplace_north_blue_01_whiteport_frozen_drydock_gate` | `read_the_ice` → intelligence @11; `work_the_lever` → strength @14 |
| `ch_v2_birthplace_north_blue_01_clocktown_narrow_arcade_crossing` | `find_turning_gap` → observation @11; `coordinate_three_drivers` → charisma @11 |
| `ch_v2_birthplace_north_blue_01_kuen_soft_village_path` | `find_firm_ground` → observation @8; `make_a_small_ramp` → intelligence @11 |
| `ch_v2_birthplace_north_blue_01_pepe_busy_repair_hoist` | `rig_temporary_line` → intelligence @11; `negotiate_hoist_turn` → charisma @11 |
| `ch_v2_birthplace_north_blue_01_gingapore_overflowing_displays` | `spot_unused_recess` → observation @8; `ask_one_shop_to_pull_back` → charisma @11 |
| `ch_v2_birthplace_north_blue_01_rubeck_low_tide_repair` | `spot_stable_wedge` → observation @8; `move_spare_wedge` → agility @11 |
| `ch_v2_birthplace_north_blue_01_rubeck_reefline_to_repair` | `read_water_between_rocks` → navigation @11; `watch_exposed_edges` → observation @11 |
| `ch_v2_birthplace_north_blue_01_swallow_unfamiliar_approach` | `time_the_approach` → navigation @11; `coordinate_shore_rope` → charisma @11 |

## Immediate audit

- **9 / 16 mini-arc roots exactly = 56.25%.**
- Depth 2+: **6 / 9**.
- Depth 3: **1 root**.
- Immediate EventDefinitions: **16**.
- No Immediate is a Continue-only panel; each adds information, a new obstruction, a tactical/social decision, or resolution.

| Mini-arc root | Maximum reachable Immediate depth |
|---|---:|
| `ch_v2_birthplace_north_blue_01_norlune_wet_mooring_numbers` | 2 |
| `ch_v2_birthplace_north_blue_01_whiteport_snowed_launch_rails` | 3 |
| `ch_v2_birthplace_north_blue_01_whiteport_frozen_drydock_gate` | 2 |
| `ch_v2_birthplace_north_blue_01_clocktown_two_carts_one_lane` | 1 |
| `ch_v2_birthplace_north_blue_01_kuen_one_cart_supply_run` | 2 |
| `ch_v2_birthplace_north_blue_01_pepe_shared_gangplank` | 1 |
| `ch_v2_birthplace_north_blue_01_pepe_busy_repair_hoist` | 2 |
| `ch_v2_birthplace_north_blue_01_gingapore_samples_block_clinic` | 1 |
| `ch_v2_birthplace_north_blue_01_swallow_last_medical_crate` | 2 |

## Scheduled audit

- Scheduled EventDefinitions: **0**.
- Scheduled callbacks outside mini-arcs: **0**.
- No chain and no future Childhood root slot is consumed by this batch.

## Reward / malus audit

- Ordinary deterministic player-Stat effects are limited to **-1 / 0 / +1**.
- No ordinary deterministic Choice grants `+2`.
- Root Dice progression is strictly **-1 / 0 / +2 / +2** on the rolled Stat.
- Dice failures carry fictional loss, delay, blockage, worsened position or missed opportunity without positive compensation.
- No player Health damage, Berrys, Reputation, Bounty, career state, Item, ship ownership or NPC persistent state mutation is authored.
- Negative deterministic examples exist where the player knowingly worsens access/safety (`Clocktown / faire passer le plus proche`, `Gingapore / laisser finir la vente`, `Swallow / laisser la caisse avec les marchandises`).

## Trait audit

- Trait grants: **0**.
- Trait removals: **0**.
- Trait-gated Choices: **0**.
- No new Trait is proposed.
- Therefore no opposite-Trait conflict or invalid deterministic Trait acquisition can occur.

## Geography / canon audit

- All eight roots pairs are tied to the current North Blue Birth catalogue rather than `originSeaIs`.
- `Flevance` is not referenced by any Event; its temporal sensitivity is untouched.
- `Germa Empire` is not referenced; no science/military flavor leaks into unrelated Birth Locations.
- `north_66th_branch` and Marine-base material are not used.
- No major canon character appears.
- Throwaway workers, sailors, traders, patients and residents are prose-only.
- No invented dynasty, war, festival, religion, secret organization, historical catastrophe or North-Blue-wide custom is introduced.
- Custom OPFG places use only their current tags/services/type/parent/docking/ship-market/authoring notes plus ordinary concrete friction.

## Wave 1 / 2 / 3 collision audit

Wave 1 root registries scanned: `CH_V2_GENERIC_EARLY_01`, `CH_V2_GENERIC_LATE_01`, `CH_V2_PEERS_01`, `CH_V2_IDENTITY_WORLD_01`, `CH_V2_COMBAT_RISK_01`.

- Avoided Generic Early anchors such as lost button, runaway scarf, spilled bucket, barking dog, broom, generic knot and generic small delivery.
- Avoided Generic Late anchors such as mislabeled crate, price shift, tally, entrusted keys/money, sealed letter, generic repair fault, queue tickets and generic market custody.
- Avoided PEERS friend/rival/competition engines.
- Avoided IDENTITY/WORLD harbor-signal lesson, foreign-quay deadline, maps/posters/news and institution-exposition engines.
- Avoided COMBAT/RISK runaway handcart, falling objects, storm shutters, fire and rescue/chase as the primary engine.

Wave 2 root registries scanned: Human, Fish-Man, Mink and Giant Race batches.

- No Human-standard interface/tool-fit premise.
- No Fish-Man aquatic ability/strength expectation.
- No Mink senses/fur/body-boundary premise.
- No Giant size/reach/space/authority premise.

Wave 3 root registries scanned: Civilian, Marine, Pirate, Revolutionary and Royal Origin Cross batches.

- No Race × affiliation requirement or Family-Saga proxy.
- No checkpoint discrimination, detainee/prisoner, mascot, false flag, clandestine print, shelter cover, heraldry/court or taxation engine.
- Roots require no Race, affiliation, family structure or social class.

The remaining similarities are low-level world props (boats, carts, commerce) whose **dramatic cause is the exact Birth Location metadata**, not the prop itself.

## Persistent-definition audit

- New `NpcDefinition`: **0**.
- New `ItemDefinition`: **0**.
- New `TraitDefinition`: **0**.
- New Location: **0**.
- New Flag: **0**.
- New Condition / Effect / mechanic: **0**.
- Persistent NPC cast: **0**.
- Runtime primitives used: `all`, `careerPhaseIs`, `ageAtLeastMonths`, `ageAtMostMonths`, `locationIs`, deterministic/Dice resolution, `modifyStat`, `queueImmediateEvent`.
- `childhood_friend`, `childhood_rival`, `childhood_younger`, `neighborhood_merchant` and parents are not referenced.

## Localization / package audit

- French source/fallback only: `localization/fr.fragment.json`.
- All player-facing title/body/Choice/Outcome keys referenced by package Events are present.
- Root body budget: **23–32 words**.
- Event filenames equal Event IDs.
- Total EventDefinitions: **32** = 16 Normal + 16 Immediate + 0 Scheduled.


## Final self-audit

- 16 Normal roots exactly: **PASS**
- 8 Birth Locations exactly, 2 roots each: **PASS**
- 8 Early + 8 Late: **PASS**
- 10 Dice roots exactly: **PASS**
- 9 mini-arc roots exactly: **PASS**
- Immediate depth 2+ floor (6 roots): **PASS**
- Immediate depth 3 floor (1 root): **PASS**
- Lifetime Threads 0: **PASS**
- Scheduled EventDefinitions 0: **PASS**
- Event IDs unique / prefix-compliant / filenames == IDs: **PASS**
- Immediate targets exist and are Immediate: **PASS**
- Immediate cycles: **PASS — none**
- Orphan Immediate EventDefinitions: **PASS — none**
- Localization key completeness: **PASS**
- Root FR body 20–45 words: **PASS**
- Choice labels <=10 words; Outcomes <=25 words; Immediate body <=40 words: **PASS**
- Effects limited to current `modifyStat` / `queueImmediateEvent`: **PASS**
- No new persistent ID: **PASS**
- Exact `locationIs` + childhood phase + min/max age on every root: **PASS**
- `narrativeFamily: origin_birthplace` on every root: **PASS**
- Every Event has unconditional resolvable Choices: **PASS**
- No obvious Wave 1 / 2 / 3 root collision after registry scan: **PASS**
