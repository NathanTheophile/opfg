# OPFG Location Review

> Status: audit/support document. Not a gameplay authority and not final V1 runtime data.

This file contains the cases intentionally not resolved by silent assumptions.

## Source limitations

- The raw extraction reports 1,063 Leaflet layers but only 853 marker locations. The 210 non-marker layers are not represented as location records in the supplied dump.
- Marker coordinates are map-space values, not real-world latitude/longitude.
- Marker `popupText`, links and images are empty in the supplied data, so descriptive authoring context cannot be source-derived.
- `index` and `index.html` contain the same 311 markers. `index.html` was treated as a mirror, not as an independent source.
- The dump contains no marker named `Ohara`; it was not invented or added.

## Deduplication decisions

- Raw markers: **853**.
- After removing the `index.html` mirror: **542**.
- Final catalogue: **502**.
- Four `Calm Belt` markers were consolidated into one regional location.
- Six split `Red` / `Line` labels were consolidated into one `Red Line` entry.
- `100%` and `Notice` were excluded as clear non-location/technical artifacts.
- Global-map + dedicated-submap repetitions were merged when the place name/context matched.
- `Gate of Justice`, `Main Gate`, `B1`, `Rooftop` and `Birka` remain distinct across contexts to avoid unsafe merges.
- `Shipbuilding Island` remains separate from `Water Seven` and is flagged for identity review instead of being silently merged.

## Decisions requiring validation

1. **Canon policy:** 195 entries remain `sourceType: uncertain`. Many may be anime/movie/game/SBS-derived or simply unfamiliar; decide whether OPFG should retain non-manga material, remove it, or verify it later.
2. **Origins coverage:** the conservative V1 birth pool currently has 8 East Blue, 2 West Blue, 1 North Blue and 3 South Blue locations. North/West/South need either approved uncertain locations or later custom locations.
3. **Water Seven:** validate whether `Shipbuilding Island` should be merged into `water_seven` as an alias/descriptor.
4. **Birka:** two `Birka` markers were deliberately kept distinct (world map vs space map). Validate whether they refer to distinct places for OPFG.
5. **Bluestar:** global and space-map `Bluestar` references were merged but remain `needs_review` because this is a planetary/lore marker, not a normal gameplay location.
6. **Sea inference:** many world-map `seaId` values are inferred from the map quadrants and Grand Line band rather than explicit text fields. The rule is documented in each entry's provenance.
7. **Ship sales:** `allowsShipSale` is `true` only for Water Seven in this pass. This is intentionally restrictive.
8. **Scheduled blocking:** only Impel Down, Mirror World, Moon and Space are proposed as blocking normal Scheduled Events.

## Identity/name review

- `bluestar` — **Bluestar**: Canon status not established from the dump alone.; Sea/region cannot be determined safely from the dump.; Name/identity requires human confirmation.; Space-map marker is outside normal OPFG geography and may be symbolic or lore-only.
- `pants_hazard` — **Pants Hazard**: Canon status not established from the dump alone.; Name/identity requires human confirmation.
- `mirror_world` — **Mirror World**: Canon status not established from the dump alone.; Name/identity requires human confirmation.
- `birka_index` — **Birka**: Name/identity requires human confirmation.
- `shipbuilding_island` — **Shipbuilding Island**: Name/identity requires human confirmation.
- `birka_space` — **Birka**: Sea/region cannot be determined safely from the dump.; Name/identity requires human confirmation.; Space-map marker is outside normal OPFG geography and may be symbolic or lore-only.

## Unknown sea/region

- `bluestar` — **Bluestar** (index, space.html)
- `birka_space` — **Birka** (space.html)
- `pole_star` — **Pole Star** (space.html)
- `sniper_island` — **Sniper Island** (space.html)
- `sun` — **Sun** (space.html)
- `space_pirates` — **Space Pirates** (space.html)
- `moon` — **Moon** (space.html)
- `third_world` — **Third World** (space.html)
- `second_world` — **Second World** (space.html)
- `first_world` — **First World** (space.html)
- `space` — **Space** (space.html)

## Organization/faction markers retained as LORE_ONLY

- `big_mom_pirates` — **Big Mom Pirates**
- `cross_guild` — **Cross Guild**
- `beasts_pirates` — **Beasts Pirates**
- `straw_hat_crew` — **Straw Hat Crew**
- `revolutionary_army` — **Revolutionary Army**
- `whitebeard_pirates` — **Whitebeard Pirates**
- `blackbeard_pirates` — **Blackbeard Pirates**
- `red_hair_pirates` — **Red-Hair Pirates**
- `world_govt` — **World Govt.**
- `space_pirates` — **Space Pirates**
- `baroque_works` — **Baroque Works**
- `cipher_pol` — **Cipher Pol**
- `donquixote_family` — **Donquixote Family**
- `world_government` — **World Government**

## Uncertain canon/source status (195)

These are retained for reference but should not be mass-promoted to runtime content until the project decides its canon policy.

- `north_pole` — **North Pole** — east_blue / LORE_ONLY
- `south_pole` — **South Pole** — south_blue / LORE_ONLY
- `bluestar` — **Bluestar** — unknown / LORE_ONLY
- `hachimakinamazu_village` — **Hachimakinamazu Village** — grand_line_paradise / SECONDARY
- `shift_station` — **Shift Station** — grand_line_paradise / SECONDARY
- `flavor` — **Flavor** — new_world / LORE_ONLY
- `package` — **Package** — new_world / LORE_ONLY
- `jam` — **Jam** — new_world / LORE_ONLY
- `cacao` — **Cacao** — new_world / LORE_ONLY
- `milk` — **Milk** — new_world / LORE_ONLY
- `kimi` — **Kimi** — new_world / LORE_ONLY
- `topping` — **Topping** — new_world / LORE_ONLY
- `unique` — **Unique** — new_world / LORE_ONLY
- `liqueur` — **Liqueur** — new_world / LORE_ONLY
- `funwari` — **Funwari** — new_world / LORE_ONLY
- `nuts` — **Nuts** — new_world / LORE_ONLY
- `candy` — **Candy** — new_world / LORE_ONLY
- `biscuit` — **Biscuit** — new_world / LORE_ONLY
- `poripori` — **Poripori** — new_world / LORE_ONLY
- `futoru` — **Futoru** — new_world / LORE_ONLY
- `margarine` — **Margarine** — new_world / LORE_ONLY
- `cutlery` — **Cutlery** — new_world / LORE_ONLY
- `jelly` — **Jelly** — new_world / LORE_ONLY
- `milenge` — **Milenge** — new_world / LORE_ONLY
- `rokumitsu` — **Rokumitsu** — new_world / LORE_ONLY
- `kinko` — **Kinko** — new_world / LORE_ONLY
- `ice` — **Ice** — new_world / LORE_ONLY
- `fruits` — **Fruits** — new_world / LORE_ONLY
- `komugi` — **Komugi** — new_world / LORE_ONLY
- `potato` — **Potato** — new_world / LORE_ONLY
- `black` — **Black** — new_world / LORE_ONLY
- `piepie` — **Piepie** — new_world / LORE_ONLY
- `kibo` — **Kibo** — new_world / LORE_ONLY
- `loving` — **Loving** — new_world / LORE_ONLY
- `noko` — **Noko** — new_world / LORE_ONLY
- `sanshoku` — **Sanshoku** — new_world / LORE_ONLY
- `tanega` — **Tanega** — new_world / LORE_ONLY
- `yakigashi` — **Yakigashi** — new_world / LORE_ONLY
- `77th_branch` — **77th Branch** — east_blue / SECONDARY
- `cipher_pol_intelligence_bureau` — **Cipher Pol Intelligence Bureau** — grand_line_paradise / LORE_ONLY
- `g_3_branch` — **G-3 Branch** — grand_line_paradise / SECONDARY
- `first_stretch` — **First Stretch** — grand_line_paradise / LORE_ONLY
- `vira` — **Vira** — grand_line_paradise / LORE_ONLY
- `pants_hazard` — **Pants Hazard** — grand_line_paradise / LORE_ONLY
- `g_4_branch` — **G-4 Branch** — grand_line_paradise / SECONDARY
- `goldfish_empire` — **Goldfish Empire** — grand_line_paradise / SECONDARY
- `kyuuka_island` — **Kyuuka Island** — grand_line_paradise / SECONDARY
- `marine_penitentiary` — **Marine Penitentiary** — grand_line_paradise / LORE_ONLY
- `g_6_branch` — **G-6 Branch** — grand_line_paradise / SECONDARY
- `renaisse` — **Renaisse** — grand_line_paradise / LORE_ONLY
- `bourgeois_kingdom` — **Bourgeois Kingdom** — grand_line_paradise / SECONDARY
- `shade_port` — **Shade Port** — grand_line_paradise / SECONDARY
- `g_10_branch` — **G-10 Branch** — grand_line_paradise / SECONDARY
- `one_man_resort` — **One-Man Resort** — grand_line_paradise / LORE_ONLY
- `porco_kingdom` — **Porco Kingdom** — grand_line_paradise / SECONDARY
- `mt_kintoki` — **Mt. Kintoki** — grand_line_paradise / SECONDARY
- `g_13_branch` — **G-13 Branch** — grand_line_paradise / SECONDARY
- `nanimonai_island` — **Nanimonai Island** — grand_line_paradise / SECONDARY
- `ukkari_onsen_island` — **Ukkari Onsen Island** — grand_line_paradise / SECONDARY
- `kenzan_island` — **Kenzan Island** — grand_line_paradise / SECONDARY
- `tehna_gehna_kingdom` — **Tehna Gehna Kingdom** — grand_line_paradise / SECONDARY
- `panda_island` — **Panda Island** — new_world / SECONDARY
- `rommel_kingdom` — **Rommel Kingdom** — grand_line_paradise / SECONDARY
- `eigisu_kingdom` — **Eigisu Kingdom** — grand_line_paradise / SECONDARY
- `g_8_branch` — **G-8 Branch** — grand_line_paradise / SECONDARY
- `long_ring_long_land` — **Long Ring Long Land** — grand_line_paradise / LORE_ONLY
- `lu_feld_conglomerate` — **Lu Feld Conglomerate** — grand_line_paradise / LORE_ONLY
- `pucci` — **Pucci** — grand_line_paradise / LORE_ONLY
- `st_poplar` — **St. Poplar** — grand_line_paradise / LORE_ONLY
- `guanhao` — **Guanhao** — grand_line_paradise / LORE_ONLY
- `rusukaina` — **Rusukaina** — calm_belt / LORE_ONLY
- `ottankaina_kingdom` — **Ottankaina Kingdom** — grand_line_paradise / SECONDARY
- `foolshout_island` — **Foolshout Island** — grand_line_paradise / SECONDARY
- `g_2_branch` — **G-2 Branch** — grand_line_paradise / SECONDARY
- `merveille` — **Merveille** — grand_line_paradise / LORE_ONLY
- `deep_sea` — **Deep Sea** — underwater / LORE_ONLY
- `red_port_w` — **Red Port (W)** — red_line / SECONDARY
- `sea_trench` — **Sea Trench** — underwater / SECONDARY
- `tarai_current` — **Tarai Current** — grand_line_paradise / SECONDARY
- `san_faldo` — **San Faldo** — grand_line_paradise / LORE_ONLY
- `g_11_branch` — **G-11 Branch** — grand_line_paradise / SECONDARY
- `red_port_e` — **Red Port (E)** — red_line / SECONDARY
- `mystoria_island` — **Mystoria Island** — new_world / SECONDARY
- `kaidous_darling_island` — **Kaidou's Darling Island** — new_world / SECONDARY
- `sea_beast_town` — **Sea Beast Town** — new_world / SECONDARY
- `applenine_island` — **Applenine Island** — new_world / SECONDARY
- `world_economic_newspaper` — **World Economic Newspaper** — new_world / LORE_ONLY
- `mogaro_kingdom` — **Mogaro Kingdom** — new_world / SECONDARY
- `ballon_terminal` — **Ballon Terminal** — new_world / LORE_ONLY
- `gartel_island` — **Gartel Island** — new_world / SECONDARY
- `edd_war` — **Edd War** — new_world / LORE_ONLY
- `g_12_branch` — **G-12 Branch** — new_world / SECONDARY
- `tajine_kingdom` — **Tajine Kingdom** — new_world / SECONDARY
- `standing_kingdom` — **Standing Kingdom** — new_world / SECONDARY
- `big_mom_pirates` — **Big Mom Pirates** — new_world / LORE_ONLY
- `g_7_branch` — **G-7 Branch** — new_world / SECONDARY
- `hot_hot_sea` — **Hot Hot Sea** — new_world / LORE_ONLY
- `yari` — **Yari** — new_world / LORE_ONLY
- `kari_bari_island` — **Kari Bari Island** — new_world / SECONDARY
- `buggy_town` — **Buggy Town** — new_world / SECONDARY
- `saint_germain` — **Saint Germain** — new_world / LORE_ONLY
- `bunt_kingdom` — **Bunt Kingdom** — new_world / SECONDARY
- `mirror_world` — **Mirror World** — new_world / LORE_ONLY
- `umit_shipping_hq` — **UMIT Shipping HQ** — new_world / SECONDARY
- `dyed_goods_town` — **Dyed Goods Town** — new_world / SECONDARY
- `foot_colony` — **Foot Colony** — new_world / LORE_ONLY
- `sleepfog_belt` — **Sleepfog Belt** — new_world / SECONDARY
- `cross_guild` — **Cross Guild** — new_world / LORE_ONLY
- `beasts_pirates` — **Beasts Pirates** — new_world / LORE_ONLY
- `straw_hat_crew` — **Straw Hat Crew** — new_world / LORE_ONLY
- `g_14_branch` — **G-14 Branch** — new_world / SECONDARY
- `gs_general_hospital` — **GS General Hospital** — new_world / SECONDARY
- `enishi` — **Enishi** — new_world / LORE_ONLY
- `aoi_kingdom` — **Aoi Kingdom** — new_world / SECONDARY
- `g_9_branch` — **G-9 Branch** — new_world / SECONDARY
- `revolutionary_army` — **Revolutionary Army** — grand_line_paradise / LORE_ONLY
- `whitebeard_pirates` — **Whitebeard Pirates** — new_world / LORE_ONLY
- `blackbeard_pirates` — **Blackbeard Pirates** — new_world / LORE_ONLY
- `red_hair_pirates` — **Red-Hair Pirates** — new_world / LORE_ONLY
- `sahtsuruzo_kingdom` — **Sahtsuruzo Kingdom** — east_blue / SECONDARY
- `briss_kingdom` — **Briss Kingdom** — south_blue / SECONDARY
- `karate_island` — **Karate Island** — south_blue / SECONDARY
- `majiatsuka_kingdom` — **Majiatsuka Kingdom** — south_blue / SECONDARY
- `dias` — **Dias** — south_blue / LORE_ONLY
- `samba_kingdom` — **Samba Kingdom** — south_blue / SECONDARY
- `evil_black_drum_kingdom` — **Evil Black Drum Kingdom** — south_blue / SECONDARY
- `rushwan_kingdom` — **Rushwan Kingdom** — south_blue / SECONDARY
- `centaurea` — **Centaurea** — south_blue / SECONDARY
- `tumi` — **Tumi** — south_blue / LORE_ONLY
- `spider_miles` — **Spider Miles** — north_blue / LORE_ONLY
- `downs` — **Downs** — north_blue / LORE_ONLY
- `rakesh` — **Rakesh** — north_blue / LORE_ONLY
- `whiteland_kingdom` — **Whiteland Kingdom** — north_blue / SECONDARY
- `deul_kingdom` — **Deul Kingdom** — north_blue / SECONDARY
- `kuen_village` — **Kuen Village** — north_blue / SECONDARY
- `micqueot` — **Micqueot** — north_blue / LORE_ONLY
- `goat_island` — **Goat Island** — east_blue / SECONDARY
- `kumate_island` — **Kumate Island** — east_blue / SECONDARY
- `rare_animal_island` — **Rare Animal Island** — east_blue / SECONDARY
- `mirrorball_island` — **Mirrorball Island** — east_blue / SECONDARY
- `frauce_kingdom` — **Frauce Kingdom** — east_blue / SECONDARY
- `cozia` — **Cozia** — east_blue / LORE_ONLY
- `sambas_sea_region` — **Sambas Sea Region** — east_blue / LORE_ONLY
- `twinsnakes_island` — **Twinsnakes Island** — west_blue / SECONDARY
- `five_great_families_of_the_west` — **Five Great Families of the West** — west_blue / LORE_ONLY
- `toroa` — **Toroa** — west_blue / LORE_ONLY
- `bollywood_kingdom` — **Bollywood Kingdom** — west_blue / SECONDARY
- `kamigata` — **Kamigata** — west_blue / LORE_ONLY
- `esperia_kingdom` — **Esperia Kingdom** — west_blue / SECONDARY
- `taya_kingdom` — **Taya Kingdom** — south_blue / SECONDARY
- `kutsukku_island` — **Kutsukku Island** — south_blue / SECONDARY
- `samuwanai_island` — **Samuwanai Island** — south_blue / SECONDARY
- `vespa_kingdom_territory` — **Vespa Kingdom Territory** — south_blue / SECONDARY
- `nagagutsu_kingdom` — **Nagagutsu Kingdom** — east_blue / SECONDARY
- `80th_branch` — **80th Branch** — west_blue / SECONDARY
- `las_camp` — **Las Camp** — west_blue / LORE_ONLY
- `corkwood` — **Corkwood** — new_world / LORE_ONLY
- `rum_wolf` — **Rum Wolf** — west_blue / LORE_ONLY
- `bourbon_wolf` — **Bourbon Wolf** — south_blue / LORE_ONLY
- `vodka_wolf` — **Vodka Wolf** — north_blue / LORE_ONLY
- `aspacchee` — **Aspacchee** — west_blue / LORE_ONLY
- `mt_mauri` — **Mt. Mauri** — west_blue / SECONDARY
- `sankan_kingdom` — **Sankan Kingdom** — west_blue / SECONDARY
- `pepe_kingdom` — **Pepe Kingdom** — north_blue / SECONDARY
- `shishano_kingdom` — **Shishano Kingdom** — west_blue / SECONDARY
- `yano_country` — **Yano Country** — grand_line_paradise / SECONDARY
- `south_fire_kingdom` — **South Fire Kingdom** — south_blue / SECONDARY
- `somewhere_kingdom` — **Somewhere Kingdom** — west_blue / SECONDARY
- `ringo_kingdom` — **Ringo Kingdom** — west_blue / SECONDARY
- `czach_kingdom` — **Czach Kingdom** — west_blue / SECONDARY
- `jambalaya_kingdom` — **Jambalaya Kingdom** — west_blue / SECONDARY
- `gingapore_kingdom` — **Gingapore Kingdom** — north_blue / SECONDARY
- `beef_kingdom` — **Beef Kingdom** — south_blue / SECONDARY
- `jewel_ice_sheet` — **Jewel Ice Sheet** — south_blue / SECONDARY
- `cameron_kingdom` — **Cameron Kingdom** — south_blue / SECONDARY
- `ice_country` — **Ice Country** — south_blue / SECONDARY
- `euro_peninsula` — **Euro Peninsula** — west_blue / LORE_ONLY
- `cefran_conglomerate` — **Cefran Conglomerate** — west_blue / LORE_ONLY
- `enoa_academy` — **Enoa Academy** — west_blue / SECONDARY
- `asshina_gainone_kingdom` — **Asshina Gainone Kingdom** — grand_line_paradise / SECONDARY
- `high_west` — **High West** — sky / LORE_ONLY
- `nakrowa` — **Nakrowa** — new_world / LORE_ONLY
- `doerena_kingdom` — **Doerena Kingdom** — new_world / SECONDARY
- `bestland_kingdom` — **Bestland Kingdom** — grand_line_paradise / SECONDARY
- `emerald_capital` — **Emerald Capital** — new_world / LORE_ONLY
- `world_govt` — **World Govt.** — new_world / LORE_ONLY
- `pole_star` — **Pole Star** — unknown / LORE_ONLY
- `sniper_island` — **Sniper Island** — unknown / LORE_ONLY
- `sun` — **Sun** — unknown / LORE_ONLY
- `space_pirates` — **Space Pirates** — unknown / LORE_ONLY
- `moon` — **Moon** — unknown / LORE_ONLY
- `third_world` — **Third World** — unknown / LORE_ONLY
- `second_world` — **Second World** — unknown / LORE_ONLY
- `first_world` — **First World** — unknown / LORE_ONLY
- `space` — **Space** — unknown / LORE_ONLY
