# OPFG — Economy & Items

> **D2.6 authoritative amendment.** Content Schema 12 / Save 21 replaces the temporary economy below. The only Item categories are `item` and `equipment`. There are no consumables, crafting, durability, ammunition, rarity, weight, local price multipliers, or passive maintenance.

Players have two pockets, two equipment slots, one active Log Pose slot, and one active companion slot. Equipment is inert while stored; equipped modifiers are derived and capped at 50. Two-handed equipment occupies both equipment slots. Owned stacks carry provenance batches whose quantities sum to the stack quantity.

Marketable objects and ships use fixed catalog prices for both purchase and base resale. Resale applies `max(0, 1 + 0.10 × (Charisma d20 modifier + Luck d20 modifier))`; optional negotiation then applies ±20%. Quantities acquired at the seller's current Location cannot be resold there. Locations explicitly author their market mode and catalog.

Ship prices/cargo slots are: Chaloupe 5,000/1; Sloop 25,000/2; Brick 75,000/3; Caravelle 150,000/4; Galion 400,000/6; Navire marchand 300,000/8.

> **Status: validated D2 engine/design authority for the V2 content rebuild.**

## 1. Purpose

The V2 rebuild must stop treating Items and Berrys as mostly decorative Effect payloads. Items are persistent narrative/gameplay assets and Berrys are a real constrained currency used by authored Events and generic market interactions.

This remains a narrative life-sim economy, not a trading simulator. There is no inflation model, auction house, daily upkeep or autonomous NPC economy in V1.

## 2. Currency

- The only V1 currency is **Berrys**.
- Berrys can never become negative.
- Bounty is **not money** and is never automatically paid to the player.
- Reputation is not purchasing power.
- Social class represents the player's **family environment**, not cash carried by the child. A wealthy Childhood profile does not automatically receive personal Berrys.
- Income and exceptional expenses remain Event-driven.

## 3. Item model

Every Item definition declares:

- category;
- stack limit;
- optional generic market definition.

V1 categories:

- key;
- document;
- material;
- trade_good;
- consumable;
- equipment;
- treasure;
- devil_fruit.

An Item with `market: null` has no generic buy/sell price. It may still be exchanged, stolen, rewarded or valued by authored Events. This is the default for quest documents, unique story objects and Devil Fruits.

## 4. Inventory

The personal inventory remains slot-based and separate from ship cargo. One distinct Item type consumes one slot; quantity lives in a stack. Stack limits are now defined by the Item itself and enforced by the engine.

The current personal capacity remains **2 slots** until a later explicit inventory-expansion design decision. This makes carried objects meaningful and prevents inventory from becoming an unlimited archive.

No generic "use item" button is required in V1. Events consume or test Items declaratively. Equipment may unlock Choices through Item Conditions before a dedicated equipment subsystem is justified.

## 5. Generic market contract

A marketable Item declares:

- a required Location service;
- a base purchase price in Berrys.

A generic purchase requires all of:

- the current Location exposes that service;
- enough Berrys;
- enough inventory/stack capacity.

Generic resale uses **50% of base purchase price**, rounded down per unit with a minimum of 1 Berry for an item that has a market price.

The engine exposes atomic `buyItem` / `sellItem` Effects so money and inventory cannot partially update.

Authored exceptional deals may still use explicit narrative Effects when the fiction requires a special price, gift, theft, debt or barter.

## 6. Authoring conditions

V2 supports:

- `hasItem`;
- `itemQuantityAtLeast`;
- `inventoryFreeSlotsAtLeast`;
- `canBuyItem`;
- `canSellItem`;
- `berriesAtLeast`.

This is enough for Event-driven shops, bribes, travel preparation, tools, documents, materials and resource tradeoffs without adding a generic shop screen.

## 7. Initial price anchor

Only existing generic material `timber` receives a baseline generic market price in this foundation pass: **500 Berrys per unit** at Locations with the `trade` service.

Existing unique documents and Devil Fruit Items remain non-market by default. Future V2 Item batches must establish their prices deliberately rather than inheriting arbitrary values from legacy Events.

## 8. Future extension points

Before Active content production, the economy may add:

- ship purchase prices;
- weapons/tools/medical/food catalogs;
- black-market-only goods;
- cargo-focused trade goods;
- authored inventory-capacity upgrades.

These extensions must preserve the principle that the economy supports narrative choices rather than replacing them with passive simulation.

<!-- D2.11_FAMILY_ECONOMIC_INHERITANCE -->
## 9. Family economic inheritance — D2.11

Layer-5 Family resolution may grant Berrys with `modifyBerries` when the fiction transfers real money or liquid value: savings, a travel fund, wages, a pirate share, a settlement, restitution, liquidation of family assets, or another explicit transfer.

This does **not** change the rule that Social Class is household context rather than an automatic child wallet.

Authoring anchors:

| Transfer scale | Suggested amount |
| --- | ---: |
| small personal stake | 2,500–7,500 |
| meaningful starting inheritance | 10,000–25,000 |
| exceptional settlement/restitution | above 25,000 only with specific justification |

For comparison, the current ship ladder begins at 5,000 Berrys for a Dinghy and 25,000 for a Sloop. Family inheritance must not casually trivialize early Active progression.

A negative money effect is a cost, not a persistent reward. Do not make a repayment scene grant money merely because the Saga needs economic variety; choose the inheritance that the scene actually resolves.
