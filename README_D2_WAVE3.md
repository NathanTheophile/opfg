# OPFG — D2 Wave 3 Platform Foundation

This patch is the engine step between the D2 content reset and new V2 Event production.

## Included

### D2.2 — Origins V1 locking

Playable:

- Family affiliation: civilian, marine, pirate, revolutionary, royal_family
- Race: human, fishman, mink, giant

Visible but locked:

- Family affiliation: bandit, prisoner, slave, celestial_dragon
- Race: longarm, buccaneer

The lock is data-driven through `playableV1` definitions and real `availableIf` Conditions. `resolveChoice()` therefore also rejects a locked choice.

### D2.3 — Major Narrative Track runtime

- Content Schema 11.
- Generic Major Narrative Track definitions.
- Normal Event `majorTrack: { trackId, chapterId, fallback? }` metadata.
- Progress reconstructed from History; no ArcState/GameState Saga counter.
- Major variants excluded from the ordinary Normal pool.
- Specialized variants win over fallback.
- Due/overdue priority:
  - overdue Major > Scheduled;
  - newly due Scheduled > Major;
  - ordinary Normal last.
- Multiple future tracks are supported by choosing the oldest due chapter, so Family + Personal Affiliation can later coexist.
- Legacy D1.9 opening orchestration is removed.
- Lifetime Thread metadata remains supported only as optional secondary content; its mandatory selection guarantee is removed.

### D2.4 — Save / validator / tests

- Save 20; V19 is intentionally not migrated into the post-reset catalog.
- new regression tests for Major Track variant/fallback selection.
- validator support for Major Track references and Family chapter structure.

### D2.5 — Items & Economy foundation

- new `docs/design/ECONOMY_AND_ITEMS.md` authority;
- Item categories, stack limits, optional generic market price;
- stack limits enforced in personal inventory and cargo;
- `itemQuantityAtLeast`, `inventoryFreeSlotsAtLeast`, `canBuyItem`, `canSellItem`;
- atomic `buyItem` / `sellItem` Effects;
- generic market checks Location services, Berrys and inventory capacity;
- generic resale = 50% of base price;
- current personal inventory remains 2 slots;
- no generic use/equipment subsystem yet: Events keep using Items declaratively.

Current market anchor:

- `timber`: 500 Berrys/unit at `trade` Locations;
- unique documents and Devil Fruits: no generic market price.

## Deliberately not included yet

- Family Saga content;
- five runtime Family Track definitions with authored variants;
- Personal Affiliation Saga content;
- generic shop UI;
- equipment slots;
- full weapons/medical/food/trade-goods catalog;
- ship purchase price refactor.

Those happen only after this foundation is green.

## Apply

From repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\apply-d2-wave3-platform.ps1 -Check
powershell -ExecutionPolicy Bypass -File .\apply-d2-wave3-platform.ps1
```

Then run:

```powershell
npm test
npm run validate-content
npm run build
```

Because D2.1 intentionally removed narrative content, the game can still reach a content dead-end after Origins until the first V2 saga/ordinary content is authored. That is expected during this refactor; TypeScript/validator/test failures are not expected.
