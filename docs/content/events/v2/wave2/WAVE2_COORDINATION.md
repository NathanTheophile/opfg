# OPFG ACTIVE V1 — WAVE 2 COORDINATION

## Baseline checked

- Repository: `NathanTheophile/opfg`
- Branch: `dev`
- HEAD observed before Wave 2 prep: `dc3819121ae8e74aaa898afefedbc7cdb5666df8`
- Content Schema observed: `15`

The current history contains all Wave 1 Active integrations:
1. Generic Sea 01
2. Generic Sea 02
3. Generic Sea 03
4. Generic Sea 04
5. Generic Sea 05
6. Civilian Career Saga
7. Marine Career Saga
8. Pirate Career Saga
9. Revolutionary Career Saga

## Parallel authoring set

LAND:
1. `ACTIVE_GENERIC_LAND_01_SOCIAL`
2. `ACTIVE_GENERIC_LAND_02_COMMERCE`
3. `ACTIVE_GENERIC_LAND_03_MYSTERY`
4. `ACTIVE_GENERIC_LAND_04_CONFLICT`
5. `ACTIVE_GENERIC_LAND_05_STRANGE`

BLUES:
6. `ACTIVE_BLUE_EAST_BLUE_01`
7. `ACTIVE_BLUE_WEST_BLUE_01`
8. `ACTIVE_BLUE_NORTH_BLUE_01`
9. `ACTIVE_BLUE_SOUTH_BLUE_01`

Each worker receives:
- `01_MASTER_ACTIVE_CONTENT_WORKER_CONTRACT_WAVE2.md`
- exactly one matching `*.prompt.md`

## Integration order

1. LAND 01 SOCIAL
2. LAND 02 COMMERCE
3. LAND 03 MYSTERY
4. LAND 04 CONFLICT
5. LAND 05 STRANGE
6. EAST BLUE
7. WEST BLUE
8. NORTH BLUE
9. SOUTH BLUE

After each batch:
- inspect diff;
- merge namespaced localization into runtime dictionaries if worker kept fragments isolated;
- `npm run validate-content`;
- targeted tests if supplied.

After LAND 01–05:
```bash
npm test
npm run validate-content
npm run build
```

After all four BLUES:
```bash
npm test
npm run validate-content
npm run build
```

Do not stack all nine integrations before the intermediate LAND validation.

## Acceptance numbers

### Generic Land
- 20 Normal roots
- ~15 mini-arc roots (~75%)
- 11–13 Dice roots
- 0 Scheduled
- 0 Lifetime

### Each Blue
- 30 Normal roots
- ~15 mini-arc roots (~50%)
- 17–19 Dice roots
- 5 short Scheduled threads
- 1 regional Lifetime
- land + sea
- mix Blue-wide + selected exact-location content

## Next wave after Wave 2

Wave 3:
- NPC Recruitment x3
- Paradise Roads x7

Recruitment integrates before the large Rival pass.

Wave 4:
- Career Saga final hardening
- 4 long-form Rivals

## Cut line

At H8 of the remaining production window:
- no new large batch;
- integration / validation / dedup / starvation / playtest / critical fixes only.
