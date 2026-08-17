# ACTIVE_GENERIC_SEA_03_DANGER — MANIFEST

## Baseline
- Repository: `NathanTheophile/opfg`
- Branch read: `dev`
- Exact HEAD: `7d2d4805f07dc00990bedd51e3c673cb65fceafd`
- Content Schema: `15`
- Save version: `22`
- Profile: Ordinary Generic Sea / Danger

## Territory
Violent maritime danger only: boarding, hostile naval tactics, sabotage, sea-creature attacks and direct bodily/ship risk. This deliberately excludes SEA_01's vessel encounters/signals/social dilemmas and SEA_02's salvage/cargo/opportunity/resource-discovery core.

## Counts
- Normal roots: **20**
- Immediate Events: **18**
- Scheduled Events: **0**
- Lifetime seeds: **0**
- Roots opening Immediate mini-arcs: **15/20 = 75%**
- Dice roots: **12/20 = 60%**
- L3 visible mini-arcs (Root + 2 Immediate): **3/20 roots** / **3/15 arcs**
- New persistent definitions: **0**

## Root Event IDs
- `active_generic_sea_03_danger_grapple_hooks`
- `active_generic_sea_03_danger_chain_shot`
- `active_generic_sea_03_danger_firepots`
- `active_generic_sea_03_danger_ram_skiff`
- `active_generic_sea_03_danger_lit_keg`
- `active_generic_sea_03_danger_knife_swimmers`
- `active_generic_sea_03_danger_boarding_net`
- `active_generic_sea_03_danger_wreck_ambush`
- `active_generic_sea_03_danger_waterline_hit`
- `active_generic_sea_03_danger_mast_sniper`
- `active_generic_sea_03_danger_harpooned_bull`
- `active_generic_sea_03_danger_squid_arm`
- `active_generic_sea_03_danger_electric_jellies`
- `active_generic_sea_03_danger_razorwings`
- `active_generic_sea_03_danger_shellback_surge`
- `active_generic_sea_03_danger_burning_wad`
- `active_generic_sea_03_danger_baited_predator`
- `active_generic_sea_03_danger_bomb_barrels`
- `active_generic_sea_03_danger_black_flag_toll`
- `active_generic_sea_03_danger_spiked_chain`

## Immediate Event IDs
- `active_generic_sea_03_danger_grapple_hooks_i01_boarders`
- `active_generic_sea_03_danger_grapple_hooks_i02_last_line`
- `active_generic_sea_03_danger_chain_shot_i01_hanging_spar`
- `active_generic_sea_03_danger_firepots_i01_smoke_skiff`
- `active_generic_sea_03_danger_ram_skiff_i01_scrape`
- `active_generic_sea_03_danger_lit_keg_i01_second_fuse`
- `active_generic_sea_03_danger_knife_swimmers_i01_surface`
- `active_generic_sea_03_danger_boarding_net_i01_tangle`
- `active_generic_sea_03_danger_wreck_ambush_i01_grapple`
- `active_generic_sea_03_danger_waterline_hit_i01_second_shot`
- `active_generic_sea_03_danger_mast_sniper_i01_swing`
- `active_generic_sea_03_danger_harpooned_bull_i01_under_bow`
- `active_generic_sea_03_danger_harpooned_bull_i02_whipline`
- `active_generic_sea_03_danger_squid_arm_i01_capstan`
- `active_generic_sea_03_danger_electric_jellies_i01_rudder_chain`
- `active_generic_sea_03_danger_razorwings_i01_return_pass`
- `active_generic_sea_03_danger_bomb_barrels_i01_tethered`
- `active_generic_sea_03_danger_bomb_barrels_i02_short_fuse`

## Immediate audit
- `active_generic_sea_03_danger_boarding_net` — max Immediate depth 1
- `active_generic_sea_03_danger_bomb_barrels` — max Immediate depth 2
- `active_generic_sea_03_danger_chain_shot` — max Immediate depth 1
- `active_generic_sea_03_danger_electric_jellies` — max Immediate depth 1
- `active_generic_sea_03_danger_firepots` — max Immediate depth 1
- `active_generic_sea_03_danger_grapple_hooks` — max Immediate depth 2
- `active_generic_sea_03_danger_harpooned_bull` — max Immediate depth 2
- `active_generic_sea_03_danger_knife_swimmers` — max Immediate depth 1
- `active_generic_sea_03_danger_lit_keg` — max Immediate depth 1
- `active_generic_sea_03_danger_mast_sniper` — max Immediate depth 1
- `active_generic_sea_03_danger_ram_skiff` — max Immediate depth 1
- `active_generic_sea_03_danger_razorwings` — max Immediate depth 1
- `active_generic_sea_03_danger_squid_arm` — max Immediate depth 1
- `active_generic_sea_03_danger_waterline_hit` — max Immediate depth 1
- `active_generic_sea_03_danger_wreck_ambush` — max Immediate depth 1

L3 roots:
- `active_generic_sea_03_danger_grapple_hooks`
- `active_generic_sea_03_danger_harpooned_bull`
- `active_generic_sea_03_danger_bomb_barrels`

## Dice audit
- `active_generic_sea_03_danger_grapple_hooks`
- `active_generic_sea_03_danger_chain_shot`
- `active_generic_sea_03_danger_firepots`
- `active_generic_sea_03_danger_ram_skiff`
- `active_generic_sea_03_danger_knife_swimmers`
- `active_generic_sea_03_danger_wreck_ambush`
- `active_generic_sea_03_danger_waterline_hit`
- `active_generic_sea_03_danger_mast_sniper`
- `active_generic_sea_03_danger_harpooned_bull`
- `active_generic_sea_03_danger_squid_arm`
- `active_generic_sea_03_danger_electric_jellies`
- `active_generic_sea_03_danger_bomb_barrels`

Difficulty distribution uses thresholds 11 / 14 / 17. Every Dice root offers two player approaches where the scene supports it; five roots add an optional CrewRole approach. No root's only resolvable action depends on a CrewRole.

## CrewRole approaches
| Root | Role | Purpose | Crew risk on failure |
|---|---|---|---|
| `active_generic_sea_03_danger_chain_shot` | `shipwright` | free damaged rigging | yes, NPC Health |
| `active_generic_sea_03_danger_waterline_hit` | `shipwright` | patch waterline breach | yes, NPC Health |
| `active_generic_sea_03_danger_mast_sniper` | `gunner` | counter-sniper | yes, NPC Health |
| `active_generic_sea_03_danger_squid_arm` | `fighter` | pull player free | yes, NPC Health |
| `active_generic_sea_03_danger_electric_jellies` | `navigator` | route through jelly field | yes, NPC Health |

Dynamic CrewRole Dice actors use the current `crewRole` actor contract. Their failure branches target `npcSelector: diceActor` Health, creating real persistent crew injury risk without inventing crew state or NPC definitions.

## Eligibility / coverage
Every root requires:
- `careerPhaseIs(active)`;
- `isAtSea`;
- `hasShip`.

This batch is intentionally for concrete personal/temporary `ShipState` maritime play. Shipless maritime emergencies remain outside this ordinary pool and are handled by existing emergency/system content.

Career coverage: Civilian / Pirate / Marine / Revolutionary, with no career-specific gating.
Age coverage: all Active ages supported by phase contract.
Location coverage: sea-agnostic; no exact destination, route, Location ID or teleport effect.

## Ship / health / resource stakes
- deliberate attacks use negative `modifyShipHealth` with `shipDamageCause: enemy`; creature/environment collisions use `accident`;
- player injury uses negative `modifyHealth`;
- crew-role failures can reduce the selected crew NPC's Health;
- `black_flag_toll` can cost 2,000 Berrys when the player chooses payment;
- no positive ship Health is granted;
- no automatic generic cargo/item reward is created.

## Existing persistent definitions used
- CrewRoles: `shipwright`, `gunner`, `fighter`, `navigator`;
- equipped cutting weapon condition in `spiked_chain`;
- Berrys;
- player/ship/NPC existing Stats.

## Proposed persistent definitions
None.

## Progression / career safety
- no career affiliation change;
- no Bounty Hunter content;
- no rank/title/bounty changes;
- no Devil Fruit/Haki acquisition;
- no Conqueror Haki;
- no recruitment event;
- no Scheduled/Lifetime content;
- no movement Effects;
- no `recoverTravel` / destination selection.

## Dedup / collision audit
SEA_03 avoids the current SEA_01 territory of ordinary encounters, signals, distress, information and social tension, and SEA_02 territory of salvage, floating cargo, ship supplies, greed/opportunity and cargo pressure. It also avoids the legacy SEA_01 concepts visible in prior audit material such as drifting nets, line burn, overturned longboats, current shear, distant flare, false dawn, fog-bell contact, missing stars, reef birds, rudder shudder, cross swell, floating timber, message buoy and squall staysail snap.

## Starvation / fallback risks
The only restrictive gate is `hasShip`. That is deliberate for physical ship-danger scenes. This batch should not be counted as shipless-rescue coverage; integration still needs other Active pools/system handling for `isAtSea && !hasShip` emergency states.

## Localization
Namespaced FR/EN keys are supplied as patch-support fragments. `apply-localization.mjs` merges them into current `src/game/localization/locales/fr.json` and `en.json`, refusing conflicting pre-existing values.

## Validation status
Static pack validation performed locally on generated artifacts:
- unique IDs / filename = Event ID;
- queue targets exist and are Immediate;
- no queue cycles by authored topology;
- four Dice outcome branches present;
- every Event has an unconditional Choice;
- all FR/EN keys referenced by the batch exist in the fragments;
- every negative ship-health Outcome declares `shipDamageCause`;
- counts/percentages match the brief;
- no Scheduled Event authored.

Repository commands were **not executable in this environment** because the repository is available through the GitHub connector but not as a writable local clone. Required integration verification remains:
`npm run validate-content` → `npm test` → `npm run build`.
