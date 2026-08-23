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


# Batch D1.9-A — FAMILY / AFFILIATION / SOCIAL CLASS

Batch ID: `D19A_OPENING_FAMILY`
Event prefix: `ch_d19_family_`

All 16 roots use:

```json
"narrativeFamily": "origin_family",
"openingRole": "origin_echo"
```

## Mission

Make family structure, inherited affiliation and social class create *lived childhood*.

The player should feel the difference between growing up:
- around Marines;
- around pirates;
- around revolutionaries;
- around bandits;
- in captivity;
- in slavery;
- in royalty/privilege;
- in civilian poverty/modesty/wealth;
- without parents.

Do not reproduce the D1.8 anchor scenes. Create *other* moments inside those lives.

## Required 16-root coverage

Produce exactly:

- 2 Marine-family roots;
- 2 Pirate-family roots;
- 1 Revolutionary-family root;
- 1 Bandit-family root;
- 1 Prisoner-family root;
- 1 Slave-family root;
- 2 Royal/privileged roots, at least one specifically `royal_family`;
- 3 Civilian roots covering `poor`, `modest`, `wealthy`;
- 3 family-structure roots where `orphan`, `single_parent` or `two_parents` is materially central rather than decorative.

A root may satisfy two coverage bullets only when both axes genuinely create the premise, but the output must still contain 16 distinct roots.

## Content expectations

Favor:
- routines;
- visitors;
- work;
- household secrets;
- discipline;
- scarcity;
- status;
- family reputation;
- adults returning from dangerous work;
- what the child is allowed/not allowed to touch;
- how strangers treat the family;
- intimate parent reactions.

Use `player_parent_1` / `player_parent_2` only when physically present and include them in `cast`.

No new persistent NPC definition.

Emotional range must include:
- warmth;
- embarrassment;
- danger;
- humor;
- scarcity;
- pride;
- fear;
- curiosity.

Do not make every Pirate family criminal slapstick or every Marine family military discipline.
