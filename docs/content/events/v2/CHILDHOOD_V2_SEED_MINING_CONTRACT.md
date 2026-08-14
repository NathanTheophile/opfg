# OPFG — Childhood V2 Seed Mining Contract

> **Status: authoritative V2 pre-production contract.**
>
> **Scope:** mining legacy/D1.9/archive material before authoring ordinary Childhood V2 batches.
>
> A SEED_POOL is an inspiration dossier, not an accepted Event catalogue and not runtime content.

---

## 1. Purpose

Each Childhood V2 production worker must receive a deliberately curated inspiration pool rather than the complete archives.

The mining phase exists to:

- recover strong concrete situations, roles, frictions and One Piece-flavored world details;
- prevent old Event structures from becoming accidental V2 authority;
- reduce duplication between parallel workers;
- give each batch a distinct creative territory;
- preserve useful legacy material without mechanically migrating it.

---

## 2. Authority order

The miner works in this order:

1. current V2 authorities;
2. `CHILDHOOD_V2_BATCH_CONTRACT.md`;
3. dedicated target-batch brief;
4. accepted V2 concept ledger;
5. migration ledger;
6. curated legacy/D1.9 seed archives;
7. old batch manifests;
8. raw archive/event material only when a specific promising seed needs deeper reconstruction.

Legacy material is always **non-authoritative**.

No old ID, JSON graph, Condition, Effect, text, quota or branch structure becomes accepted merely because it existed before V2.

---

## 3. Allowed mining sources

Primary idea mines include:

- `docs/content/events/legacy/LEGACY_CHILDHOOD_SEEDS.md`;
- `docs/content/events/legacy/D1_9_NARRATIVE_SEEDS.md`;
- `docs/content/events/legacy/EVENT_CONCEPT_INDEX_LEGACY.md` when targeted lookup is useful;
- relevant `docs/content/events/batches/CH_*` manifests;
- selected material under `archives/`;
- selected material under `docs/content/events/legacy/runtime-reset-archive/`.

Prefer curated seed documents and manifests before opening raw archived Event definitions.

Do not hand the full legacy index or full archive to the downstream worker.

---

## 4. Target SEED_POOL size

Each target batch should receive roughly **15–30 curated inspirations**.

Guideline:

- 20-root generalist batch → normally **20–30** seeds;
- 16-root specialized batch → normally **15–24** seeds.

The pool may contain more inspirations than final roots because:

- some seeds will be rejected during authoring;
- multiple seeds may be fused;
- one seed may inspire a mini-arc or Lifetime anchor rather than a root;
- the worker must retain creative freedom rather than translate seeds one-to-one.

Do not inflate the pool with weak ideas merely to reach a number.

---

## 5. Seed extraction format

For every retained inspiration, record:

- **source**: archive/file + old Event ID when available;
- **premise**: one concrete sentence;
- **people / relationship**: reusable person, social role, rivalry, peer, mentor, institution, etc.;
- **situation**: what is physically/socially happening now;
- **friction / stake**: what can be lost, broken, exposed, missed, damaged or changed;
- **world detail**: useful One Piece-flavored object, custom, institution, rumor, occupation, geography or social texture;
- **age fit**: approximate Childhood age band(s);
- **V2 target use**: ordinary root / Immediate mini-arc / Lifetime candidate / recurring NPC seed / Dice-rich situation / conditioned-choice opportunity;
- **why save it**: precise reason the concept remains strong;
- **do not carry over**: old structure/mechanics/text/assumption that must be discarded;
- **collision notes**: accepted V2 concepts or other target batches it could overlap with.

Keep each entry compact.

---

## 6. What qualifies as a strong seed

Prefer seeds with several of the following:

- a concrete scene rather than an abstract topic;
- a recognizable person or relationship;
- immediate friction;
- a consequence the player can care about;
- a physical action or social maneuver suitable for meaningful Choices;
- multiple plausible player approaches;
- natural Dice opportunities;
- natural conditioned Choices from Race, History, Trait, Item, relationship, family background or place;
- callback potential;
- a memorable prop/institution/world detail;
- age-specific agency;
- a premise that cannot be transplanted unchanged into five unrelated events.

A seed does **not** need to contain a complete Event.
It only needs enough narrative energy to justify V2 redevelopment.

---

## 7. Reject or downgrade

Reject, or keep only as a tiny ingredient, material that is:

- maintenance abstraction;
- vague “life lesson” content;
- generic “make a choice” situations;
- pure stat vending;
- a scene with no concrete stake;
- a noun-swap duplicate;
- dependent on obsolete runtime assumptions;
- already better represented by an accepted V2 concept;
- a Family Major Saga concept disguised as ordinary generic Childhood;
- an old long graph whose only value is its structure rather than its premise;
- canon fan-service without player friction;
- an Event whose choices can be transplanted to unrelated scenes with only noun changes.

Old Lifetime graphs should normally be **collapsed back to their durable anchor/premise** before being considered.

Do not migrate old graph topology automatically.

---

## 8. Batch exclusivity

Before mining a batch, define its exclusive creative territory.

A seed should normally appear in **one** Wave/batch SEED_POOL only.

If it plausibly fits several, assign it to the batch where its strongest dramatic function belongs and add a cross-reference note elsewhere rather than duplicating it.

Examples:

- a rivalry whose core is peer status → `PEERS`, even if a fight occurs;
- a dangerous physical mishap whose core is bodily risk → `COMBAT_RISK`, even if peers witness it;
- a rumor, poster, foreign sailor or institution revealing the wider world → `IDENTITY_WORLD`;
- a small everyday childhood problem without a stronger specialized identity → `GENERIC_EARLY` / `GENERIC_LATE`;
- material whose premise genuinely depends on Race → reserve for `RACE`;
- material whose premise genuinely depends on a birthplace/sea → reserve for the relevant Place batch;
- material caused by the intersection of two Origins axes → reserve for `ORIGIN_CROSS`.

---

## 9. Family Saga exclusion

Ordinary Childhood batches must preserve the Family Legacy Saga's territory.

Reject or heavily transform seeds whose main dramatic engine is:

- family affiliation destiny;
- inheritance;
- parent-household progression already covered by a Family Major Saga;
- a five-stage family trajectory;
- choosing the player's Active affiliation at the Childhood handoff.

A family member may still appear in an ordinary Event when the **actual premise belongs to the ordinary batch theme**.

---

## 10. Lifetime candidate mining

Every Childhood V2 batch requires one qualifying Lifetime Thread, so the SEED_POOL must identify **at least 3 Lifetime candidates** when the source material supports them.

A strong Lifetime candidate has:

- a durable anchor: recurring peer, rival, mentor, craft, debt, promise, mystery, institution, correspondence, obligation, reputation, or evolving local relationship;
- plausible changes over years;
- reasons to return after age 15;
- at least three natural future decision points;
- short divergent consequences that can later reconverge;
- no need for a multi-pyramidal Major-Saga architecture.

Do **not** fully author the Lifetime during mining.

For each Lifetime candidate record only:

- seed premise;
- durable anchor;
- why it can span many years;
- 3–5 possible future beats;
- 2–4 plausible divergence ideas;
- likely reconvergence logic;
- likely age span;
- risks of competing with Major Saga or another batch.

The authoring worker chooses and develops exactly one primary qualifying Lifetime unless the dedicated brief says otherwise.

---

## 11. Dice-rich seed mining

Because Childhood V2 targets 55–65% Dice roots, the pool must contain enough situations with genuine uncertainty.

Mark a seed `DICE_RICH` when it naturally supports **two or more different risky approaches**.

Examples:

- chase: Agility vs deception vs environmental improvisation;
- social confrontation: Charisma vs observation vs threat;
- accident/rescue: Strength vs Agility vs technical improvisation;
- contest/game: multiple Stats reflecting different tactics.

Do not mark a seed Dice-rich merely because “the player could roll something.”

The uncertain action must matter to the fiction.

---

## 12. Condition-rich seed mining

Mark a seed `CONDITION_RICH` when pre-existing player/world state can plausibly provide a **real alternate solution**, not cosmetic flavor.

Useful axes include:

- Race;
- Trait;
- Item/equipment;
- prior History;
- prior Outcome/Choice;
- NPC Relationship/status;
- family/current household state when not intruding on Major Saga;
- birthplace/sea;
- career/world knowledge where age-appropriate.

Condition-rich inspirations are especially useful because conditioned Choices may have slightly stronger upside and may qualify for Trait acquisition.

---

## 13. Trait-seed caution

Never decide during mining that a seed “gives Trait X.”

Instead record:

- what durable behavior/identity the situation could demonstrate;
- which risky or conditioned action might plausibly justify a Trait;
- whether an opposite Trait may conflict.

Trait acquisition is decided during actual Event authoring and must obey `CHILDHOOD_V2_BATCH_CONTRACT.md`.

---

## 14. SEED_POOL output structure

Each produced file should use:

```text
# SEED_POOL — <BATCH_ID>

## Batch territory
## Explicit exclusions
## Coverage goals
## Source files mined

## Curated seeds
### SEED-01 — <short label>
...
### SEED-NN — <short label>

## Lifetime candidates
## Dice-rich shortlist
## Condition-rich shortlist
## Recurring NPC/relationship opportunities
## Collision/dedup notes
## Archive concepts deliberately rejected
```

The final `Archive concepts deliberately rejected` section should name the most tempting rejected concepts and explain why they were excluded.
This prevents a downstream worker from rediscovering and reintroducing them.

---

## 15. Mining does not accept concepts

A SEED_POOL is not the V2 Concept Index.

During mining:

- do not append concepts to `EVENT_CONCEPT_INDEX_V2.md`;
- do not mark migration ledger rows as `ADAPTED`;
- do not generate runtime JSON;
- do not create final Event IDs;
- do not silently accept new Items, NPCs, Traits, flags, systems, Conditions or Effects.

Only after actual V2 authoring, review and integration can an accepted root/structure enter the V2 concept ledger.

---

## 16. Handoff to worker

The worker receives only:

1. current V2 authority set;
2. `CHILDHOOD_V2_BATCH_CONTRACT.md`;
3. its dedicated batch brief;
4. its own `SEED_POOL`;
5. current `EVENT_CONCEPT_INDEX_V2.md`;
6. current schema/runtime vocabulary necessary to author valid content.

Do not attach the full frozen legacy archives by default.

The worker may depart from a seed, fuse seeds, or invent new material inside its batch territory.
Seeds are inspiration, not mandatory implementation.
