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


# Batch D1.9-D — HIGH-YIELD ORIGIN CROSSES

Batch ID: `D19D_OPENING_CROSS`
Event prefix: `ch_d19_cross_`

All 16 roots use:

```json
"narrativeFamily": "origin_cross",
"openingRole": "origin_echo"
```

## Mission

Produce the most personalized early-childhood content in D1.9.

Every root must materially require at least **two Origins axes**.

A generic scene with `raceIs` added as decoration is a rejection.

## Required high-yield combinations

Author exactly one root for each slot below:

1. Mink × Royal Family
2. Mink × Marine family
3. Fish-Man × Marine family
4. Fish-Man × `royal` or `wealthy` Birth Location
5. Orphan × `port` or `trade`
6. Orphan × `wealthy` or `capital`
7. Pirate family × `royal` or `wealthy` Birth Location
8. Pirate family × `marine_presence` or `government`
9. Revolutionary family × `marine_presence` or `government`
10. Revolutionary family × `poor` or `industrial`
11. Giant × `urban` or `city`
12. Giant × poor/modest household
13. Longarm × `shipyard` or `industrial`
14. Buccaneer × `military` or `government`
15. Slave family × `royal` or `wealthy`
16. Bandit family × `rural`, `forest` or `mountain`

You may use `familyStructureIs`, `socialClassIs`, `affiliationIs`, `raceIs`, `locationHasTag`, and Birth Location context as appropriate.

## Tone

Do not make this a misery batch.

Across 16 roots include:
- at least 4 warm/funny/positive scenes;
- at least 4 tense or socially uncomfortable scenes;
- at least 3 practical/environmental scenes;
- at least 2 scenes where the child's family protects or supports them;
- at least 2 scenes where family status makes the problem worse.

For Buccaneer content, do not reveal canon-secret government knowledge.
