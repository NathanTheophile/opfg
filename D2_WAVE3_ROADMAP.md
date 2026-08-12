# D2 — Updated refactor roadmap

## Completed before this pack

- Wave 1: D1.9 seeds, Legacy Childhood seeds, Major Saga runtime audit.
- Wave 2: V2 authorities + frozen Legacy Concept Index + empty V2 Concept Index.
- D2.1: physical runtime content reset.

## This pack

- D2.2 Origins V1 locking.
- D2.3 Content Schema 11 + generic Major Narrative Track runtime.
- D2.4 Save 20 + validator/tests foundation.
- D2.5 Item management + first real Berry economy contract.

## Next, before narrative production

### D2.6 Systems hardening

Review and complete the economic/item surface before any large V2 Event batch:

1. define the initial V2 Item catalog by gameplay family:
   - weapons;
   - tools;
   - medicine;
   - food/supplies where narratively useful;
   - documents/key items;
   - treasure;
   - materials/trade goods;
2. define ship purchase/resale prices and connect Ship Market to the economy contract;
3. decide whether personal inventory remains 2 slots or receives authored expansion items/events;
4. decide whether a dedicated equipment state is genuinely needed before adding one;
5. add economy diagnostics and anti-arbitrage tests;
6. add initial FR/EN Item descriptions only once the catalog is accepted.

### D2.7 Major Saga content blueprint

Create complete high-level blueprints for:

- family_civilian;
- family_marine;
- family_pirate;
- family_revolutionary;
- family_royal.

Each blueprint maps the whole life conceptually but authors only Childhood first.

### D2.8 Marine vertical prototype

- exactly 5 Childhood chapters;
- 2–4 variants per chapter;
- deliberate Race / parent-state / social-class / History branching;
- no mass production yet.

### D2.9 Architecture playtest

Compare several Marine profiles. Accept only if the same Family Saga is recognizable but materially different across Origins.

### D2.10 Family Saga production

Only after the prototype passes:

- 10 Family Saga batches (2 per affiliation);
- then Origin Cross mini-arcs;
- then ordinary V2 Childhood breadth.

## Content-production gate

No large V2 Event generation begins until:

- Major Track runtime is green;
- Origins locks are green;
- Save 20 reset is green;
- Item/economy foundation is green;
- D2.6 economy/item catalog decisions are locked.
