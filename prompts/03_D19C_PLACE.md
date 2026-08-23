# OPFG D1.9 — OPENING BREADTH CONTENT BATCH

Execute this prompt completely.

You are producing an independent **content pack**, not modifying runtime code and not modifying the repository.

The project authorities available in this GPT's sources are authoritative. In particular use the updated:

- `GAME_DESIGN.md`
- `CONTENT_BIBLE.md`
- `EVENT_AUTHORING_RULES.md`
- Content Schema 10 `schema.ts`
- current `catalogFactory.ts`
- World/Location authorities
- Timeline/Canon authority
- Traits catalog
- `D1_9_EXISTING_OPENING_INDEX.md`

If an older source contradicts the D1.9 authority sections, the D1.9 sections win.

## Global output contract

Produce exactly **16 Normal root Events**.

This is an `OPENING_BREADTH` batch:

- no Lifetime Thread;
- no Scheduled Events;
- no mandatory Immediate arcs;
- produce zero Immediate Events unless this prompt explicitly requests otherwise;
- do not add new runtime systems;
- do not add new persistent definitions unless explicitly requested;
- all roots target Childhood ages 1–5 only;
- all visible prose must use localization keys;
- source language is French;
- also provide faithful English localization.

Every root must include:

- unique stable Event ID using the batch prefix;
- `kind: "normal"`;
- `narrativeFamily`;
- `openingRole`;
- concrete eligibility;
- normally 3–4 Choices;
- complete deterministic/Dice resolution objects;
- all Outcomes and effects;
- `cast` when a persistent NPC physically participates.

Text targets remain blocking:

- root body: 20–45 French words, normally 1–2 sentences;
- Outcome: 5–25 words, normally 1 sentence;
- Choice: 2–10 words.

The content must use Situation → Reaction:
WHO → concrete action → physical context → immediate friction/stake → player choice.

No abstract/admin filler. No moral summary. No numeric consequence in prose.

## Early-childhood standard

Age plausibility is blocking.

Ages 1–3:
- point;
- offer;
- hide;
- imitate;
- cling;
- make noise;
- move a small object;
- watch a specific thing;
- refuse;
- simple exchange.

Ages 4–5 additionally allow:
- running;
- games with rules;
- simple bargaining;
- small lies;
- basic plans;
- fetching someone;
- minor physical intervention.

Do not give toddlers adult reasoning or adult physical agency.

## Mechanical standard

Do not make every Outcome a Stat reward.

Use:
- ±1 Stat normally;
- Relationship when a persistent cast member genuinely reacts;
- neutral narrative Outcomes when meaningful;
- small Morale costs/benefits where fiction supports them.

DiceChecks should be uncommon before age 4.

## Output files

Return a ZIP containing:

```text
<batch-id>/
  MANIFEST.md
  CONCEPT_AUDIT.md
  events/
    <event-id>.json
    ...
  localization/
    fr.delta.json
    en.delta.json
```

`MANIFEST.md` must list:
- all 16 roots;
- narrativeFamily/openingRole;
- age window;
- Origins Conditions used;
- Location tags used;
- persistent cast used;
- mechanical effects summary.

`CONCEPT_AUDIT.md` must explain for every root:
- what Origins choice(s) cause the scene;
- what concrete worldbuilding information is conveyed;
- why it is not a duplicate of the D1.8 opening index;
- emotional tone;
- age-coherence check.

Do not output a patcher. Do not edit authoritative documents. Do not run simulations.


# Batch D1.9-C — BIRTHPLACE / LOCAL WORLD

Batch ID: `D19C_OPENING_PLACE`
Event prefix: `ch_d19_place_`

All 16 roots use:

```json
"narrativeFamily": "origin_birthplace",
"openingRole": "origin_echo"
```

## Mission

Make the Birth Location feel like a place where a child actually grows up.

Use controlled `locationHasTag` conditions. Prefer reusable tag-driven situations over hardcoding a single canon island unless a Location-specific premise is exceptional.

The scene must teach worldbuilding through what is happening, not through exposition.

## Required 16-root coverage

Create 16 roots covering these context families without duplicating the D1.8 props:

1. `marine_presence` / `military`
2. `pirate_presence` / `criminal`
3. `port` / `trade`
4. `shipyard` / `industrial`
5. `royal` / `government`
6. `wealthy` / `capital`
7. `poor`
8. `agricultural` / `rural`
9. `medical`
10. `historic` / `religious`
11. `entertainment` / `touristic`
12. `isolated`
13. `urban` / `city`
14. `coastal`
15. cold/northern context such as `snow`
16. wild/natural context such as `forest`, `mountain`, `tropical` or `wilderness`

Use `{{birthplaceName}}` where naming the place improves the sentence.

## Worldbuilding target

Each root should make at least one local fact visible:
- who works there;
- what people carry;
- what rule organizes the place;
- what danger is ordinary;
- what children can access;
- what adults value;
- what sound/smell/object defines daily life.
