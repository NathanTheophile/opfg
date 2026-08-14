# OPFG — Event-driven Commerce Architecture

> **Authoritative runtime amendment.** Commerce is an Event-domain feature. Generic merchants, port ship markets, buying, selling, browsing and negotiation must not create a parallel shop/session gameplay mode.

## Contract

All player-facing commerce is represented by `EventDefinition` flows.

- Arrival at a Location with a market hub may select a runtime-materialized `kind: "system"` Event.
- Market hub, merchant, port catalogue and confirmation screens are System Events with ordinary Choices.
- Negotiation uses the normal Dice resolution pipeline.
- Transactions use the normal atomic Effects (`buyItem`, `sellItem`, `buyShip`, `sellShip`).
- Inventory and ship cargo remain the normal unified gameplay state. Commerce owns no separate inventory.
- System commerce Events are not narrative History entries and consume no phase slot or month.
- Leaving the market returns to `selectNextEvent()` without advancing time.
- The simulator must resolve commerce through the same `findCurrentEvent()` / `resolveChoice()` path as the UI.

Runtime-materialized market Events are dynamic because available Items, Ships, prices and transaction Choices depend on current state and Location. Dynamic materialization does **not** make them a separate gameplay system: the materialized objects are normal `EventDefinition`s and are resolved by the Event engine.

## Arrival semantics

A market arrival is caused by a real landfall.

- Sailing to a destination while still `at_sea` is not a market arrival.
- Docking at that destination is a market arrival.
- An Event/effect that genuinely moves the player to a different on-land Location is also a landfall.
- Childhood → Active at 15 years old is **not** an arrival and must never set a market-arrival flag by itself.
- A pending arrival at a landed Location without a market hub is consumed without opening commerce.
- Legacy states that still carry the arrival flag while at sea retain it until docking instead of silently losing it.

## Layer boundaries

`marketEvents.ts` owns dynamic Event authoring/materialization only.

`events.ts` owns selection and current-Event lookup.

`resolution.ts` owns Choice resolution and advances a market System Event to its next market Event (or back to ordinary selection).

`gameSession.ts` is a thin UI/session adapter. It must not inject Events into a temporary catalogue and must not maintain a second `systemEvent` / `pendingSystemEvent` state machine.

UI components render the current Event. They do not decide market progression.

## Regression rules

The following are regressions:

- returning `currentEventId = null` solely to hand commerce to UI;
- creating a shop/market screen that mutates gameplay outside Event Choices/Effects;
- advancing age or consuming a gameplay slot during market browsing/transaction;
- forcing a market arrival on phase transition;
- dropping a pending arrival because the destination was first reached at sea;
- requiring the simulator to special-case commerce;
- maintaining a second inventory for merchant or port interactions.
