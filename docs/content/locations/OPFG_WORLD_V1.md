# OPFG — World V1

> **Status: final curated content authority, ready for runtime integration.**

## Scope

- **188 runtime Locations**.
- **80 Blues**: exactly 20 per Blue.
- **32 Birth Locations**: exactly 8 per Blue.
- **108 outside Blues**: Paradise, New World, Sky, Underwater, Red Line and Calm Belt.
- Origins remain exclusive to East/West/North/South Blue.
- Egghead remains reference-only for V1.

## Location hierarchy

`parentLocationId` is optional.

- If a runtime parent exists, a Location is treated as a sub-location.
- If no runtime parent exists, the Location is standalone even if the broader Bible knows a non-runtime parent.
- A non-null parent must reference another runtime Location.
- Parent chains must be acyclic.
- `locationWithin(X)` is true when the current Location is X or any descendant of X.

### Display contract

Use the root runtime ancestor and the current Location:

```text
Alabasta Kingdom - Rainbase
Wano Country - Flower Capital
Drum Island - Drum Rockies
```

If the current Location has no runtime parent:

```text
Water Seven
Gosa Town
```

The HUD implementation itself is UI work; core should only expose a small reusable display helper.

## Current geography Conditions

The final authoring contract requires:

- `currentSeaIs(seaId)` — checks the current Location's `seaId`; it is distinct from `originSeaIs`.
- `locationWithin(locationId)` — current Location equals the target or is a descendant of it.
- existing `locationIs`, `locationHasTag`, `locationHasService` remain unchanged.

## Paradise

Reverse Mountain / Twin Capes form the common ingress. The initial Paradise route is selected **randomly through seeded eligible route-start Events**. The player does not choose a route from a menu.

The seven route families are authoring structures, not persistent GameState:

### P1_CLASSIC — 10 main stops

`cactus_island` → `whisky_peak` → `giant_island_little_garden` → `drum_island` → `alabasta_kingdom` → `jaya_island` → `long_ring_long_land` → `water_seven` → `thriller_bark` → `sabaody_archipelago`

Optional gated branch: `skypiea`.

Route qui peut rappeler le parcours connu, conservée comme UNE route parmi sept, jamais la route par défaut.

### P2_TRADE — 9 main stops

`glassreef_island` → `shade_port` → `kyuuka_island` → `bourgeois_kingdom` → `goldfish_empire` → `karakuri_island` → `porco_kingdom` → `water_seven` → `sabaody_archipelago`

Local cluster `water_seven`: `shift_station`, `st_poplar`.

Route commerciale longue: ports, marchés, royaumes, industrie et chantiers. Sa densité est désormais comparable à P1 sans recopier son itinéraire.

### P3_WILD — 9 main stops

`tempest_key` → `kenzan_island` → `mt_kintoki` → `mossback_island` → `nanimonai_island` → `stormneedle_island` → `kuraigana_island` → `banaro_island` → `sabaody_archipelago`

Local cluster `kuraigana_island`: `shikkeahr_kingdom`.

Route longue centrée navigation, survie, reliefs, météo et îles peu urbanisées.

### P4_KINGDOMS — 9 main stops

`goldfish_empire` → `yano_country` → `tehna_gehna_kingdom` → `rommel_kingdom` → `eigisu_kingdom` → `ottankaina_kingdom` → `porco_kingdom` → `momoiro_island` → `sabaody_archipelago`

Local cluster `momoiro_island`: `kamabakka_kingdom`.

Route longue de royaumes et territoires politiques: diplomatie, réputation, tensions locales et commerce.

### P5_OUTCASTS — 9 main stops

`driftwood_atoll` → `harahettania` → `hachimakinamazu_village` → `ragpicker_cay` → `foolshout_island` → `freewake_island` → `blackbell_islet` → `kuraigana_island` → `sabaody_archipelago`

Optional gated branch: `baltigo`.

Local cluster `kuraigana_island`: `shikkeahr_kingdom`.

Route longue de communautés marginales, récupérateurs, contrebande, équipages sans pavillon et réseaux clandestins. Baltigo reste un embranchement révolutionnaire fortement conditionné.

### P6_STRANGE — 9 main stops

`ukkari_onsen_island` → `moonmelon_island` → `long_ring_long_land` → `one_man_resort` → `upside_down_atoll` → `karakuri_island` → `clockwork_cay` → `laughing_fog_island` → `sabaody_archipelago`

Route longue volontairement bizarre et légère, conçue pour soutenir des batches très One Piece-like sans dépendre d'arcs manga.

### P7_HAZARD — 9 main stops

`emberfall_island` → `stormglass_island` → `needle_reach` → `ashcurrent_island` → `sulfur_key` → `wreckers_shoal` → `banaro_island` → `thunderhead_island` → `sabaody_archipelago`

Route longue de risques environnementaux et maritimes. La progression doit tester préparation, navire, navigation, crew et prise de risque plutôt que simplement infliger des dégâts.

Ordinary travel should follow the route family. Cross-route movement is possible but rare and must be justified by an Event.

Sabaody is the **majority convergence** before the normal passage beneath the Red Line. Exceptional routes may bypass it only through strongly authored circumstances.

## New World

New World does not use seven fixed routes.

- Destination progression is deliberately **random and Event-driven**.
- The player does not normally receive a destination-selection menu.
- Multiple eligible travel Events/destinations let the seeded RNG decide where the run is carried next.
- Special/gated destinations are excluded from generic travel pools.
- Backtracking remains rare and Event-driven.

## Staying and departing

- Arrival does not force immediate departure.
- A standard departure should not become eligible before at least **one genuine local root Event** has occurred after arrival.
- This minimum is an authoring rule; do not add persistent route/location-visit state unless implementation proves it strictly necessary.
- Internal movement between parent/sub-locations is not a route change.
- Taking the sea from a sub-location may resolve through a dockable runtime ancestor.

## Travel without a personal ship

Events may transport the player without owning a ship: Marine transport, merchant passage, capture, rescue, Revolutionary transport, another crew, etc.

Do not add a generic external-transport GameState for V1. If the player owns no ship, authored transport should normally resolve land-to-land within the Event/Immediate chain rather than leaving `ship == null && travelState == at_sea` between slots.

## Dead-end safety

When Active has no eligible normal continuation:

- on land → a reserved fallback Event allows the run to resume sea travel;
- at sea → a reserved fallback Event continues navigation toward a valid non-gated continuation;
- fallbacks are excluded from the ordinary random Normal pool;
- fallbacks are repeatable safety Events;
- fallback activations must be counted by diagnostics/simulator.

Origins/Childhood do **not** use this fallback. Zero eligible content there remains a real content error.

## Parent corrections made for runtime V1

- `orange_town`: runtime parent set to `null` (reference/Bible parent `organ_archipelago` is not promoted to runtime).
- `syrup_village`: runtime parent set to `null` (reference/Bible parent `gecko_archipelago` is not promoted to runtime).
- `cocoyasi_village`: runtime parent set to `null` (reference/Bible parent `conomi_archipelago` is not promoted to runtime).
- `loguetown`: runtime parent set to `null` (reference/Bible parent `pole_star_archipelago` is not promoted to runtime).
- `arlong_park`: runtime parent set to `null` (reference/Bible parent `conomi_archipelago` is not promoted to runtime).
- `16th_branch`: runtime parent set to `null` (reference/Bible parent `conomi_archipelago` is not promoted to runtime).
- `taya_village`: runtime parent set to `null` (reference/Bible parent `taya_kingdom` is not promoted to runtime).
- `gosa_town`: runtime parent set to `null` (reference/Bible parent `conomi_archipelago` is not promoted to runtime).

## Location type normalization

- `reverse_mountain`: `landmark` → `wilderness`
- `twin_capes`: `landmark` → `port`
- `gyoncorde_plaza`: `landmark` → `city`
- `zou`: `other` → `island`
- `totto_land`: `region` → `kingdom`
- `udon`: `region` → `wilderness`

No new LocationType is required for these six entries.