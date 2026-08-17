# ACTIVE_GENERIC_LAND_02_COMMERCE — MANIFEST

## Batch

- Batch ID: `ACTIVE_GENERIC_LAND_02_COMMERCE`
- Production profile: Active V1 / Ordinary Generic Land
- Source baseline read: `dev` at `dc3819121ae8e74aaa898afefedbc7cdb5666df8`
- Content Schema: `15`
- Save version: `22`
- Exclusive theme: markets, bargaining, cargo/service disputes, workshops, repairs, ship-market opportunities, one-off work and constrained exchange.
- Explicit exclusions: pure social-status scenes, investigation-led mysteries, violent seizure/extortion, absurd novelty markets, profession/business management, passive income, Scheduled/Lifetime content and exact-destination navigation.
- Runtime directory: `src/game/content/events/v2/ordinary/ACTIVE_GENERIC_LAND_02_COMMERCE/`
- Localization namespace: `event.active_generic_land_02_commerce_*`

## Production metrics

- Normal roots: **20**
- Immediate Events: **17**
- Scheduled Events: **0**
- Lifetime seeds: **0**
- Roots opening a meaningful Immediate mini-arc: **15/20 = 75%**
- Dice roots: **12/20 = 60%**
- L3 roots (Root → I01 → I02): **2**
- New persistent definitions: **0**
- FR localization keys: **367**
- EN localization keys: **367**

## Root IDs

- `active_generic_land_02_commerce_disputed_scale`
- `active_generic_land_02_commerce_wet_timber_lot`
- `active_generic_land_02_commerce_timber_resale_dispute`
- `active_generic_land_02_commerce_repair_quote`
- `active_generic_land_02_commerce_warehouse_clock`
- `active_generic_land_02_commerce_auction_misheard_bid`
- `active_generic_land_02_commerce_clipped_change`
- `active_generic_land_02_commerce_delivery_shortfall`
- `active_generic_land_02_commerce_repair_parts_queue`
- `active_generic_land_02_commerce_ship_market_inspection`
- `active_generic_land_02_commerce_sealed_cargo_claim`
- `active_generic_land_02_commerce_stall_collapse`
- `active_generic_land_02_commerce_overbooked_berth`
- `active_generic_land_02_commerce_old_merchant_settlement`
- `active_generic_land_02_commerce_porter_day_wage`
- `active_generic_land_02_commerce_medical_shortage_counter`
- `active_generic_land_02_commerce_mispriced_rigging_bundle`
- `active_generic_land_02_commerce_dock_tax_rounding`
- `active_generic_land_02_commerce_workshop_test_piece`
- `active_generic_land_02_commerce_cart_deposit`

## Immediate mini-arc roots

- `active_generic_land_02_commerce_disputed_scale` — depth 1
- `active_generic_land_02_commerce_wet_timber_lot` — depth 1
- `active_generic_land_02_commerce_timber_resale_dispute` — depth 1
- `active_generic_land_02_commerce_repair_quote` — depth 1
- `active_generic_land_02_commerce_warehouse_clock` — depth 2
- `active_generic_land_02_commerce_auction_misheard_bid` — depth 1
- `active_generic_land_02_commerce_clipped_change` — depth 1
- `active_generic_land_02_commerce_delivery_shortfall` — depth 1
- `active_generic_land_02_commerce_repair_parts_queue` — depth 1
- `active_generic_land_02_commerce_ship_market_inspection` — depth 2
- `active_generic_land_02_commerce_sealed_cargo_claim` — depth 1
- `active_generic_land_02_commerce_stall_collapse` — depth 1
- `active_generic_land_02_commerce_overbooked_berth` — depth 1
- `active_generic_land_02_commerce_old_merchant_settlement` — depth 1
- `active_generic_land_02_commerce_porter_day_wage` — depth 1

## Dice roots

- `active_generic_land_02_commerce_disputed_scale`
- `active_generic_land_02_commerce_wet_timber_lot`
- `active_generic_land_02_commerce_timber_resale_dispute`
- `active_generic_land_02_commerce_repair_quote`
- `active_generic_land_02_commerce_warehouse_clock`
- `active_generic_land_02_commerce_auction_misheard_bid`
- `active_generic_land_02_commerce_clipped_change`
- `active_generic_land_02_commerce_delivery_shortfall`
- `active_generic_land_02_commerce_ship_market_inspection`
- `active_generic_land_02_commerce_sealed_cargo_claim`
- `active_generic_land_02_commerce_stall_collapse`
- `active_generic_land_02_commerce_old_merchant_settlement`

## Immediate Event IDs

- `active_generic_land_02_commerce_disputed_scale_i01_reweigh`
- `active_generic_land_02_commerce_wet_timber_lot_i01_final_lot`
- `active_generic_land_02_commerce_timber_resale_dispute_i01_unloading_fee`
- `active_generic_land_02_commerce_repair_quote_i01_final_invoice`
- `active_generic_land_02_commerce_warehouse_clock_i01_jammed_door`
- `active_generic_land_02_commerce_warehouse_clock_i02_foreman_settlement`
- `active_generic_land_02_commerce_auction_misheard_bid_i01_clerk_desk`
- `active_generic_land_02_commerce_clipped_change_i01_cashbox_open`
- `active_generic_land_02_commerce_delivery_shortfall_i01_broker_settlement`
- `active_generic_land_02_commerce_repair_parts_queue_i01_substitute_part`
- `active_generic_land_02_commerce_ship_market_inspection_i01_purchase_desk`
- `active_generic_land_02_commerce_ship_market_inspection_i02_launch_papers`
- `active_generic_land_02_commerce_sealed_cargo_claim_i01_claim_counter`
- `active_generic_land_02_commerce_stall_collapse_i01_vendor_offer`
- `active_generic_land_02_commerce_overbooked_berth_i01_loading_window`
- `active_generic_land_02_commerce_old_merchant_settlement_i01_old_accounts`
- `active_generic_land_02_commerce_porter_day_wage_i01_broken_seal`

## Existing persistent definitions used

No new persistent definition is created.

Existing runtime primitives/definitions used:

- Berrys;
- `timber` through atomic `buyItem` / `sellItem` and `canBuyItem` / `canSellItem`;
- current ShipState / ship health;
- generic ship chassis `dinghy` and `sloop` through `canAcquireShip` / `buyShip`;
- existing persistent NPC `neighborhood_merchant` in one restrictive callback-style commerce root;
- optional crew role `shipwright`;
- player Stats and Health;
- Reputation, positive-only;
- History through normal one-shot Events and Immediate causality.

## Location context

The majority of roots do **not** require an exact named Location. Contextual Conditions are limited to fictionally material services/tags:

- `trade` service / tag for market, warehouse and delivery premises;
- `general_goods` for supply-shop premises;
- `medical` for the shortage-counter service scene;
- `ship_repair` for repair-yard/workshop premises;
- `port` for berth, delivery, portage and dock-fee premises;
- ship-market root uses `canAcquireShip(dinghy|sloop)` so the existing market contract decides whether the purchase is actually valid.

No `locationIs` Condition is used.

## Restrictive eligibility

Restrictive roots are deliberate and backed by the rest of the broad land pool:

- `timber_resale_dispute` requires `canSellItem(timber, 1)`;
- `ship_market_inspection` requires at least one valid `canAcquireShip` for Dinghy/Sloop;
- repair-yard roots require `hasShip` + `ship_repair`;
- `old_merchant_settlement` requires `neighborhood_merchant` currently `known`;
- several port/service roots require the corresponding Location tag/service.

The other roots remain broad Active-on-land content. No root requires a precise sea, island, Race, Trait, age sub-window, rank or title.

## Dice design

Dice roots: **12**. Most provide two materially different Dice approaches when the scene naturally supports them. The one-Dice roots are:

- `active_generic_land_02_commerce_timber_resale_dispute` — the second meaningful resolution is economic/deterministic rather than another plausible Stat contest.

Failure costs vary between Berrys, Health, worse settlement, lost opportunity or relationship pressure. Critical failure is normally worse than failure. Success does not automatically vend Stats.

## Consequence spread

This batch intentionally mixes:

- Berrys: fees, refunds, wages, negotiated losses, deposits and compensation;
- Health: physical market/workshop mishaps;
- Reputation: public commercial disputes and visible fair dealing;
- NPC relationship: `neighborhood_merchant` old-account settlement;
- Items/assets: real `timber` buy/sell, ship purchases, ship-health repairs;
- opportunity/History: walking away, lost lots, priority slots and one-shot commercial opportunities;
- occasional Stats: only where the action itself plausibly trains Strength/Agility/Intelligence.

No negative Reputation and no bounty Effects are authored.

## Economy compliance

- Ordinary `timber` transactions use current atomic fixed-price `buyItem` / `sellItem` primitives.
- The ship market uses `canAcquireShip` and `buyShip`; the hull price remains the current catalog price.
- Authored ship-broker fee rebates/surcharges are explicit narrative exceptions around side fees, not hidden catalog-price changes.
- Scene-local supplies/services are not invented as new persistent Items merely to make a transaction tangible.
- No passive income, profession state, business ledger system, durability, crafting or second market system is introduced.

## Collision audit

Wave 1 Active was inspected only for collision/schema/integration style. The batch avoids SEA_02 salvage/floating-cargo territory and does not reuse its root concepts. It also avoids sea danger/navigation/strange premises and career-saga progression.

Parallel Wave 2 LAND workers are not authoritative creative sources for this batch; territory exclusions are enforced from the brief: social-status, mystery, conflict/extortion and strange novelty cores are excluded.

## Shared integration still required

The batch intentionally owns only namespaced runtime Event JSON plus namespaced FR/EN fragments and reports. Shared production localization files/catalogue wiring are not modified here because Wave 2 integration is sequential.

Required integration step after acceptance:

1. copy the Event JSON directory into the repository;
2. merge `localization.fr.json` / `localization.en.json` into the shared production localization dictionaries using the existing integration workflow;
3. run repository-level `npm run validate-content`, `npm test`, and `npm run build` after all parallel Wave 2 batches are integrated.

## Validation performed in isolated workspace

- deterministic JSON parse of every authored Event file;
- exact 20 Normal-root count;
- exact 15 mini-arc-root count / 75%;
- 12 Dice roots / 60%;
- zero Scheduled EventDefinitions;
- zero `scheduleEvent` Effects;
- zero Lifetime seeds;
- all Immediate targets exist and are reachable from authored roots;
- maximum Immediate depth = 2;
- every root explicitly contains `careerPhaseIs(active)` + `isOnLand`;
- no navigation movement Effects;
- no career/rank/title/bounty Effects;
- no negative Reputation Effects;
- FR/EN localization-key coverage exact;
- text-budget audit recorded in `VALIDATION.json`.

Repository-level tests/build were **not executable in this environment** because no writable repository checkout is available and Git network access is blocked. GitHub was read through the connected repository API; no commit/push/PR was created.
