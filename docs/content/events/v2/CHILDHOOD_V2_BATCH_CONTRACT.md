# OPFG — Childhood V2 Batch Contract

> **Status: authoritative specialized V2 production contract.**
>
> **Scope:** ordinary Childhood V2 Event batches outside Major Narrative Tracks.
>
> This document is the dedicated V2 batch contract authorized by `docs/content/EVENT_AUTHORING_RULES.md` §24.1.
> For every Childhood V2 batch whose brief opts into this contract, the rules below override the legacy standard-batch quotas they explicitly replace.
>
> All non-overridden quality, schema, runtime, localization, geography, cast, Conditions/Effects, Situation → Reaction,
> text-budget, Choice-resolvability and canon rules from the current authorities remain active.

---

## 1. Purpose

Childhood V2 needs a broad ordinary Event pool around the guaranteed Family Legacy Saga.

Ordinary Childhood content must provide:

- breadth between Major Family chapters;
- concrete childhood situations rather than abstract life summaries;
- recurring people and secondary continuity;
- meaningful risk and tradeoffs;
- regular same-scene mini-arcs;
- long-lived secondary threads that can continue into Active and later ages;
- Race, birthplace, profile, History and current-state reactivity where the batch theme warrants it;
- enough age coverage that an ordinary Childhood slot is not starved of eligible content.

Ordinary Childhood batches are **not** Major Narrative Tracks and must not imitate their layered Major graph architecture.

---

## 2. Authority precedence

For batches explicitly authored under this contract, this document overrides the following legacy production requirements from
`EVENT_AUTHORING_RULES.md` where they conflict:

- §2.5 mandatory Signature Immediate Arc + three Secondary Immediate Arcs + legacy Lifetime graph quotas;
- §4.1 legacy `40–50%` Dice root target;
- §6.2 deterministic unconditional Trait acquisition;
- §9.2 and §9.3 mandatory Immediate depth-5/depth-3 structures;
- §10.5 and §10.5 bis legacy Lifetime breadth/topology quotas;
- any old measurable batch requirement that depends on those superseded quotas.

This contract does **not** change runtime semantics:

- Immediate still continues the current scene and consumes no additional root slot/time advance;
- Scheduled still represents a future consequence and consumes a future root slot when resolved;
- Major Saga progression remains separate from Scheduled chains;
- Conditions, Effects, Dice resolution and History use the existing runtime vocabulary only.

---

## 3. Batch sizes and root identity

### 3.1 Generalist Childhood batch

A generalist Childhood V2 batch contains **20 root Normal Events**.

Typical families include:

- Generic Early;
- Generic Late;
- Peers;
- Identity / World;
- Combat / Risk.

### 3.2 Specialized Childhood batch

A specialized Childhood V2 batch normally contains **16 root Normal Events**.

Typical families include:

- Race;
- Birthplace / Sea;
- Origin Cross.

A dedicated brief may choose another size when the domain requires it, but must state the reason explicitly.

### 3.3 Root rules

Every ordinary Childhood root produced under this contract must:

- be a Normal root, not an Immediate or Scheduled descendant;
- be eligible only during Childhood through the current runtime vocabulary;
- remain outside `majorTrack` / Major Saga membership;
- use the batch-specific ID prefix;
- be conceptually distinct from accepted V2 roots in `EVENT_CONCEPT_INDEX_V2.md`;
- respect the assigned age band and theme;
- remain resolvable for every state in which it can be selected.

The batch manifest must state its intended age coverage and identify any known eligibility gaps.

**Zero eligible ordinary content at a required Childhood slot is a content defect, not a desired fallback behavior.**

---

## 4. Immediate mini-arc quota

### 4.1 Mandatory frequency

At least **50% of root Events** in every Childhood V2 batch must open a genuine Immediate mini-arc.

Therefore:

- 20-root generalist batch → **at least 10** mini-arc roots;
- 16-root specialized batch → **at least 8** mini-arc roots.

The normal production band is roughly **50–60%**.
More is allowed when the theme genuinely benefits from same-scene continuation; do not add Immediate nodes only to inflate the percentage.

### 4.2 Normal structure

The default Childhood V2 mini-arc is:

```text
Root
→ 1–3 Immediate
→ resolution
```

Immediate means one continuous situation: confrontation, chase, search, negotiation, discovery, accident, game, argument,
escape, rescue, investigation, performance, or another sequence with no meaningful time ellipse.

### 4.3 Depth quality floor

Among the roots counted toward the Immediate quota:

- at least **40%** must have a reachable path containing **2 or more** consecutive Immediate Events after the root;
- at least **one** mini-arc per batch must have a reachable path containing **3** consecutive Immediate Events after the root.

A one-Immediate continuation remains valid when one extra decision genuinely completes the scene.

### 4.4 No quota padding

Every Immediate must introduce at least one of:

- a new meaningful Choice;
- new information;
- a changed tactical/social situation;
- a DiceCheck;
- a consequence of the previous Choice;
- a real resolution decision.

`Continue` screens, paraphrased Choices and cosmetic branches do not satisfy the mini-arc quota.

---

## 5. Dice quota and Dice-choice design

### 5.1 Mandatory root frequency

**55–65% of root Events** in every Childhood V2 batch must contain at least one DiceCheck in the root Event itself.

Therefore:

- 20-root generalist batch → **11–13 Dice roots**;
- 16-root specialized batch → **9–10 Dice roots**.

DiceChecks in Immediate or Scheduled descendants are welcome when justified but do **not** count toward this root quota.

A DiceCheck exists because an uncertain action genuinely depends on a Stat.
Do not manufacture uncertainty or mention a Stat merely to hit the quota.

### 5.2 Multiple Dice approaches

When an Event offers a DiceCheck, it should normally offer **at least two materially different DiceCheck Choices**
when the scene plausibly supports multiple risky approaches.

Example:

```text
A cart runs downhill.

→ Sprint ahead and pull the child away       [Agility]
→ Grab the wheel and force it sideways        [Strength]
→ Command the crowd to clear a path           [Charisma]
→ Drop a stall into its path                  [deterministic cost/tradeoff]
```

The player should choose **how** to attempt the uncertain action, not merely whether to click the one special Dice button.

A Dice Event with only one DiceCheck Choice is allowed when the fiction genuinely presents one relevant uncertain action.
The batch manifest must list such roots and briefly justify them.

### 5.3 Dice outcome profile

Dice is a wager.

For **player Stat progression**, the normal Childhood V2 profile is:

```text
criticalFailure → -1
failure         →  0
success         → +2 potential
criticalSuccess → +2, occasionally +3 potential
```

This is an authoring profile, not an automatic runtime transformation.

Important:

- ordinary failure at `0` means **0 Stat progression delta**, not consequence-free failure;
- ordinary failure should normally still lose or worsen something the player can care about: opportunity, relationship, resource, reputation, future branch, NPC state, safety, access, position, or another scene-specific stake;
- critical failure should normally include the `-1` Stat consequence and/or another clearly worse consequence;
- more than `-1` Stat on a Dice critical failure is rare and requires exceptional fiction;
- success does not need to grant a Stat when another persistent or narrative reward is more appropriate.

---

## 6. Choice rewards, maluses and progression gradient

### 6.1 Deterministic Choices may be negative

Ordinary deterministic Choices are not protected from mechanical maluses.

For player-Stat changes:

- **-1 is the normal authored malus**;
- **-2 is uncommon** and requires a clearly stronger fictional cost;
- **-3 is exceptional** and must be justified by an unusually severe event/consequence;
- values below -3 are outside ordinary Childhood production unless a future authority explicitly permits them.

A batch where deterministic Choices systematically avoid all negative consequences should be rejected or reworked.

Malus does not need to appear in every Event.
It must emerge naturally from bad bargains, harmful priorities, reckless behavior, humiliation, neglect, injury, betrayal,
lost discipline, or another concrete consequence.

### 6.2 Ordinary accessible Choice baseline

For player-Stat progression, an ordinary universally available deterministic Choice should generally live around:

```text
-1 / 0 / +1
```

`+2` on a fully ordinary safe Choice should be uncommon and justified by a substantial sacrifice,
exceptional lesson, or other meaningful cost.

### 6.3 Risk / specialization reward gradient

A response that requires uncertainty or prior character/world state may have slightly stronger upside than a comparable ordinary response.

Normal hierarchy:

```text
ordinary universally available Choice
< genuinely conditioned Choice
≈ successful DiceCheck Choice
< exceptional criticalSuccess / rare major conditioned payoff
```

This hierarchy is a design tendency, not a requirement that every special Choice be numerically larger.

The stronger upside may be expressed through:

- Stat progression;
- Relationship;
- resource;
- safer future branch;
- Scheduled consequence;
- persistent access;
- Trait;
- another scene-specific persistent benefit.

Do not stack rewards merely because a Choice is special.

### 6.4 Conditioned Choice advantage

A Choice locked by a genuine pre-existing Condition should normally have **slightly better upside**
than a comparable universally available Choice when that Condition provides real fictional leverage.

Examples of valid leverage include:

- Race physiology/culture materially solving part of the problem;
- a Trait expressing a relevant learned behavior;
- an Item actually used in the scene;
- prior History revealing information or trust;
- an NPC relationship changing access;
- family/career/world knowledge relevant to the concrete situation.

Do not add a Condition solely to justify a stronger reward.

---

## 7. Trait acquisition gate

### 7.1 Superseding deterministic acquisition

For Childhood V2 batches under this contract, `EVENT_AUTHORING_RULES.md` §6.2 is overridden.

A Trait may be acquired **only** through an Outcome belonging to:

1. a Choice containing a DiceCheck; or
2. a Choice genuinely gated by a meaningful pre-existing `availableIf` Condition.

An unconditional deterministic Choice may **not** grant a Trait.

### 7.2 Dice-gated Traits

A Dice-gated Trait should normally be granted on `success` or `criticalSuccess`
when the successful action demonstrates the durable identity change.

A failure or critical failure may grant the Trait only when **choosing/attempting the action itself**,
rather than succeeding, clearly demonstrates that durable behavior.
Such cases must be narratively explicit and uncommon.

### 7.3 Condition-gated Traits

A conditioned Choice may grant a Trait only when:

- the Condition is not decorative;
- the resulting action genuinely demonstrates the new Trait;
- opposite-Trait compatibility rules remain satisfied.

Traits remain rare persistent identity markers, not routine reward currency.

---

## 8. Mandatory Lifetime Thread

### 8.1 One qualifying Lifetime per batch

Every Childhood V2 batch must contain **exactly one primary qualifying Lifetime Thread seed root**
unless a dedicated brief explicitly requires more.

The seed:

- is one of the batch's Normal roots;
- uses the current Lifetime-thread metadata if that metadata remains part of the accepted source format;
- opens a coherent secondary story anchored by a durable person, rivalry, obligation, mystery, craft, promise,
  local institution, recurring relationship, evolving commitment, or comparable long-term subject;
- may also open an Immediate mini-arc if the opening scene warrants it.

The Lifetime is a **secondary continuity thread**, never a competing Major Saga.

### 8.2 Intended lived length

A qualifying Lifetime should contain:

- **10 Scheduled chapters minimum** on at least one complete reachable lived path after the seed;
- a normal longest meaningful lived path of roughly **10–14 Scheduled chapters**;
- approximately **18–24 distinct reachable Scheduled EventDefinitions** across the complete authored graph
  when the premise supports that breadth;
- **at least 3 meaningful structural divergence points** across the complete thread.

Do not pad a finished story to hit a preferred count.
The 10-chapter reachable-path floor remains mandatory for the qualifying thread.

### 8.3 Braided-linear topology

Childhood V2 Lifetime Threads must use a **braided-linear** Scheduled topology rather than a multi-pyramidal Major-Saga-like structure.

Preferred pattern:

```text
Seed
 ↓
S1
 ├─ Choice A → S2A
 └─ Choice B → S2B
                ↓
          reconvergence
                S3
              /    \
           S4A      S4B
              \    /
                S5
```

A structural divergence should normally:

1. choose an **exclusive next Scheduled chapter** based on the resolved Choice/Dice outcome;
2. remain distinct for roughly **1–3 Scheduled chapters** when the difference deserves persistence;
3. then reconverge naturally, terminate, or transform the thread into one stable continuation;
4. allow a later divergence only after the earlier structural split has reconverged or terminated.

### 8.4 No multi-pyramidal expansion

A qualifying Lifetime Thread must **not** recursively fan out into a widening tree comparable to a Major Narrative Track.

Hard authoring rules:

- do not create a new structural Scheduled split inside a branch that is already part of an unresolved structural split;
- branch-local Choices may still change Effects, History, NPC state and prose without creating another nested Scheduled fork;
- do not enqueue sibling branch chapters simultaneously;
- on a given run, a resolved Lifetime chapter should normally schedule **one next Lifetime chapter**.

Early termination is valid when a Choice genuinely ends the relationship/story.

### 8.5 Vertical scheduling

The Lifetime must be authored vertically:

```text
Seed schedules S1
S1 schedules the consequence selected from S1
S2A or S2B schedules the next consequence of that lived branch
...
```

Never schedule the full future Lifetime graph from the seed.

### 8.6 Childhood slot protection and advanced-age continuity

The Lifetime exists partly to solve content scarcity at later ages, but Scheduled chapters consume future root slots.

Therefore:

- a normal complete path should resolve **no more than 4 Lifetime Scheduled descendants before age 15**;
- the thread must deliberately be capable of crossing Childhood → Active when its fiction remains valid;
- most of its lived path should therefore remain available after the Childhood boundary;
- spacing should be biographical rather than quest-log-like, with meaningful gaps measured in months/years as appropriate;
- a mature thread should normally aim to still have authored life in the player's twenties and, when the premise supports it, beyond.

The batch manifest must list:

- intended age/time span;
- maximum expected number of pre-15 Lifetime Scheduled descendants on a normal complete path.

### 8.7 Recall and branch causality

Every returning Lifetime chapter must make the causal thread recognizable.

The player should understand:

- who/what is returning;
- which earlier decision or relationship matters;
- what changed since the previous chapter;
- why a different branch is occurring if prior Choices changed it.

Do not write generic callbacks that could belong to any player history.

---

## 9. Scheduled consequences outside the Lifetime

Scheduled callbacks outside the mandatory Lifetime remain allowed but should be **sparse** during Childhood
because they consume future root slots.

Prefer Immediate continuation for same-scene depth.

Use an extra Scheduled callback only for a consequence that genuinely needs time to pass
and is worth displacing a future ordinary root.

A dedicated batch brief may set a stricter Scheduled budget for its domain.

---

## 10. Relationship between mini-arcs, Dice and Lifetime

The quotas are independent but may overlap naturally.

Examples:

- a Lifetime seed may also count as one of the 50% Immediate mini-arc roots;
- an Immediate mini-arc root may also count toward the Dice-root quota if the **root itself** contains a DiceCheck;
- a Lifetime Scheduled chapter may contain DiceChecks, but those do not count toward the root Dice quota;
- a single root may satisfy Immediate + Dice + Lifetime-seed roles only when the fiction genuinely supports all three.

Do not force structures together merely to reduce the number of authored roots.

---

## 11. Batch manifest additions

In addition to the current general manifest requirements, every Childhood V2 batch manifest must report:

### Root coverage

- batch root count;
- intended age band(s);
- root IDs by age coverage;
- roots with restrictive eligibility and their fallback coverage;
- known overlap/collision risks with accepted V2 concepts.

### Immediate quota

- Immediate mini-arc root IDs;
- percentage of roots opening a mini-arc;
- maximum reachable Immediate depth for each;
- count/percentage reaching depth 2+;
- at least one root reaching depth 3.

### Dice quota

- Dice root IDs;
- percentage of roots containing DiceChecks;
- number of DiceCheck Choices per Dice Event;
- justification for every Dice Event containing only one DiceCheck Choice;
- difficulty distribution;
- notable conditioned Dice/Trait interactions.

### Reward / malus audit

- examples of ordinary positive, neutral and negative deterministic outcomes;
- any Stat malus below `-1` and its justification;
- any ordinary deterministic Stat reward above `+1` and its justification;
- Trait grants and the qualifying Dice/Condition gate for each;
- confirmation that no unconditional deterministic Choice grants a Trait.

### Lifetime audit

- seed root ID;
- recurring anchor/cast;
- longest reachable Scheduled depth;
- complete distinct Scheduled-definition count;
- meaningful divergence count;
- branch/reconvergence map;
- early termination branches;
- intended age/time span;
- maximum normal-path Lifetime Scheduled descendants before age 15;
- confirmation that no unresolved structural split contains a nested Scheduled split;
- confirmation that each lived chapter normally schedules only one next Lifetime chapter.

---

## 12. Acceptance checklist

A Childhood V2 batch fails acceptance if any of the following is true:

1. root count/scope does not match its dedicated brief;
2. fewer than 50% of roots open genuine Immediate mini-arcs;
3. mini-arcs are padded with non-decisions;
4. Dice roots fall outside the 55–65% band without an explicit approved exception;
5. Dice scenes routinely provide only one Dice approach despite obvious alternative risky approaches;
6. Dice failure is routinely consequence-free merely because its Stat delta is 0;
7. deterministic Choices are mechanically sanitized so that negative consequences almost never exist;
8. Stat maluses routinely exceed -1 without strong fiction;
9. an unconditional deterministic Choice grants a Trait;
10. conditioned bonus Choices use decorative Conditions with no fictional leverage;
11. the mandatory Lifetime lacks a 10-Scheduled reachable path;
12. the Lifetime recursively fans out into a multi-pyramidal graph;
13. an unresolved Lifetime branch contains another structural Scheduled split;
14. too many Lifetime chapters consume Childhood slots before age 15;
15. the Lifetime ends entirely in Childhood without an exceptional premise-specific reason;
16. roots duplicate accepted V2 concepts or intrude on Family Major Saga territory;
17. age/eligibility coverage can leave required ordinary Childhood slots with no eligible content.

---

## 13. Production workflow

No Childhood V2 worker should author a batch directly from the full archive.

The normal workflow is:

```text
Current V2 authorities
→ dedicated batch brief
→ curated SEED_POOL
→ worker authoring
→ schema/editorial review
→ concept deduplication
→ integration
→ accepted concepts added to EVENT_CONCEPT_INDEX_V2
→ deliberate adaptations recorded in V2_CONCEPT_MIGRATION_LEDGER
```

Seed mining is governed separately by:

`docs/content/events/v2/CHILDHOOD_V2_SEED_MINING_CONTRACT.md`

The worker receives the curated `SEED_POOL`, not the complete frozen legacy catalogue.
