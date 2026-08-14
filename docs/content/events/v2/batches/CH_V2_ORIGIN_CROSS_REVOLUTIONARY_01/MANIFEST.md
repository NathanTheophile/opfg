# MANIFEST — CH_V2_ORIGIN_CROSS_REVOLUTIONARY_01

## Repository baseline

- Repository: `NathanTheophile/opfg`
- Branch reread: `dev`
- Exact HEAD used: `4ec9d642823fd05b8151ed0d892203725f577bde`
- Content Schema: **14**
- Save version: **21**
- Production mode: standalone package only.
- Repository mutation: **none**.
- No commit, branch, PR, Concept Index update, Migration Ledger update, schema/catalog/runtime edit or global localization edit.

Current authorities reread include `AGENTS.md`, `docs/GAME_DESIGN.md`, `docs/design/MAJOR_NARRATIVE_TRACKS.md`,
`docs/design/WORLD_TIMELINE_AND_CANON.md`, `docs/content/EVENT_AUTHORING_RULES.md`,
`docs/content/CONTENT_BIBLE.md`, `docs/content/TRAITS_CATALOG.md`,
`docs/content/events/v2/CHILDHOOD_V2_BATCH_CONTRACT.md`,
`docs/content/events/v2/EVENT_CONCEPT_INDEX_V2.md`, `docs/LOCALIZATION.md`,
`src/game/content/schema.ts`, `src/game/content/catalogFactory.ts`, and `src/game/engine/save.ts`.

Collision review also reread all five Wave 1 manifests and all four integrated Race Wave 2 manifests.
`content-authoring/sagas/family_revolutionary.authoring.json` was inspected as the protected Family authority.

## Batch identity

- Batch ID: `CH_V2_ORIGIN_CROSS_REVOLUTIONARY_01`
- Reserved prefix: `ch_v2_origin_cross_revolutionary_01_`
- Narrative family: `origin_cross`
- Inherited affiliation: `revolutionary`
- Exactly **4 Normal roots**
- Exactly **1 Human × Revolutionary root**
- Exactly **1 Fish-Man × Revolutionary root**
- Exactly **1 Mink × Revolutionary root**
- Exactly **1 Giant × Revolutionary root**
- `majorTrack`: **absent from every Event**
- Lifetime Thread seeds: **0**
- New persistent definitions: **0**

## Package inventory

- Normal roots: **4**
- Immediate EventDefinitions: **10**
- Scheduled EventDefinitions: **0**
- Total EventDefinitions: **14**
- French source/fallback localization: `localization/fr.fragment.json`
- Persistent NPC cast: **none**
- New NPC / Item / Trait / Flag / Location / Condition / Effect / mechanic: **none**

## Root registry

| Race × affiliation | Root ID | Age months | Root Dice | Dice approaches | Immediate depth | Core premise |
|---|---|---:|---:|---|---:|---|
| Human × Revolutionary | `ch_v2_origin_cross_revolutionary_01_human_sheltered_game` | 84–143 | yes | Agility 11 / Charisma 11 | 2 | A Human child can cross a neighbor's social boundary that already excludes a Fish-Man child temporarily sheltered by revolutionaries; a lost game piece threatens to expose the guest. |
| Fish-Man × Revolutionary | `ch_v2_origin_cross_revolutionary_01_fishman_ink_cistern` | 96–155 | yes | Observation 11 / Agility 11 | **3** | A clandestine printing plate falls into a water cistern; Fish-Man access makes immediate retrieval possible without draining it, while ordinary delivery traffic makes the evidence time-sensitive. |
| Mink × Revolutionary | `ch_v2_origin_cross_revolutionary_01_mink_troupe_cover` | 72–131 | no | — | 0 | A Revolutionary local is publicly passed off as a rehearsal room; the Mink child's real fur is mistaken for the troupe's “living costume,” turning neighborhood curiosity into a cover problem. |
| Giant × Revolutionary | `ch_v2_origin_cross_revolutionary_01_giant_ink_footprints` | 108–167 | yes | Observation 11 / Agility 11 | 2 | Giant-scale ink footprints accidentally draw a readable trail from a Revolutionary workshop to the public street; the child must break the trail before a sweeper follows it. |

All four root body texts are **29–30 French words** and all root Choice labels are **3–6 words**.

## Origin Cross test

### Human × Revolutionary

- Remove `revolutionary`: the Fish-Man child is no longer a temporarily concealed guest whose presence the adults cannot openly explain; the lost palet becomes an ordinary neighbor dispute.
- Remove `human`: the player's unequal ability to approach a neighbor who has already rejected the Fish-Man child disappears; the actionable social asymmetry changes.
- Both axes alter actor access, available action and immediate exposure risk.

### Fish-Man × Revolutionary

- Remove `revolutionary`: the object is no longer an incriminating printing plate whose recovery matters before routine traffic arrives; it becomes a generic dropped object.
- Remove `fishman`: immediate entry into the full cistern is no longer the child's distinctive route; the adults must drain/retrieve it another way.
- Both axes alter the practical action space and the reason the dropped object matters.

### Mink × Revolutionary

- Remove `revolutionary`: there is no rehearsing-troupe cover to protect; being mistaken for a costume is only an awkward neighborhood misunderstanding.
- Remove `mink`: the child's real fur can no longer be mistaken for the supposed stage creature, so the crowd-generating misunderstanding collapses.
- Both axes alter who attracts attention and why that attention threatens something immediate.

### Giant × Revolutionary

- Remove `revolutionary`: the footprints are only a cleanup problem; they no longer point toward a discreet workshop whose location should not be advertised.
- Remove `giant`: the unusually large, legible trail that visibly links doorway and street is no longer the defining accident.
- Both axes alter the physical evidence and its immediate stake.

No root is a generic Event plus decorative `raceIs` / `affiliationIs` Conditions.

## Root eligibility / resolvability

Every root is `kind: normal`, carries `narrativeFamily: origin_cross`, has no `majorTrack`, and explicitly requires:

- `careerPhaseIs(childhood)`
- one explicit `ageAtLeastMonths`
- one explicit `ageAtMostMonths`
- the intended `raceIs(...)`
- `affiliationIs(revolutionary)`

Every root and every Immediate has at least one unconditional Choice. No Event can resolve into an all-disabled Choice set.

## Dice audit

Exactly **3 / 4 roots** contain DiceChecks:

1. `ch_v2_origin_cross_revolutionary_01_human_sheltered_game` — Agility 11 / Charisma 11.
2. `ch_v2_origin_cross_revolutionary_01_fishman_ink_cistern` — Observation 11 / Agility 11.
3. `ch_v2_origin_cross_revolutionary_01_giant_ink_footprints` — Observation 11 / Agility 11.

Each Dice root offers **two materially different uncertain approaches** plus one deterministic tradeoff.

Every root Dice Choice follows the Childhood V2 progression profile on the rolled Stat:

- `criticalFailure`: **-1** plus a clearly worse fictional state;
- `failure`: **0** Stat progression plus a real loss/aggravation;
- `success`: **+2**;
- `criticalSuccess`: **+2**.

No +3 critical success is used. Race never forces a result and no racial modifier is authored as automatic success.

## Immediate audit

Exactly **3 / 4 roots** open Immediate mini-arcs:

| Root | Max consecutive Immediate depth |
|---|---:|
| `ch_v2_origin_cross_revolutionary_01_human_sheltered_game` | 2 |
| `ch_v2_origin_cross_revolutionary_01_fishman_ink_cistern` | **3** |
| `ch_v2_origin_cross_revolutionary_01_giant_ink_footprints` | 2 |

- Mini-arc roots: **3 / 4 exactly**
- Depth 2+ roots: **3**
- Mandatory depth-3 route: **Fish-Man × Revolutionary**
- Mink root intentionally resolves in one panel.
- No Immediate is a “Continue” screen: each changes the social/physical state, reveals a consequence, or asks a new reaction.

## Scheduled audit

Scheduled callbacks: **0**.

No callback was authored because every selected premise is one continuous childhood incident. Deferring any beat would consume a future Childhood root slot without adding biographical value.

## Reward / malus audit

- Root Dice progression: only **-1 / 0 / +2 / +2** on the rolled Stat.
- Ordinary deterministic positive Stat reward: maximum **+1**.
- Ordinary deterministic Stat malus: minimum **-1**.
- No deterministic reward above +1.
- No Stat malus below -1.
- No Health, Berrys, Reputation, Bounty, Item, NPC-state, Ship, career or Location mutation.
- Dice failure never receives compensating positive Stat progression.
- Immediate branches are mostly narrative consequences; negative deterministic exits use at most Morale -1.

## Trait audit

- Trait grants: **0**
- Trait removals: **0**
- Trait gates: **0**
- Only the current 28-Trait catalogue exists; this package introduces or references no extra Trait.
- Therefore no unconditional deterministic Choice grants a Trait and no opposite-pair conflict is possible.

## Age coverage

The specialized Origin Cross roots cover a staggered middle/late Childhood band:

- Mink: 72–131 months (ages 6–10)
- Human: 84–143 months (ages 7–11)
- Fish-Man: 96–155 months (ages 8–12)
- Giant: 108–167 months (ages 9–13)

This 4-root batch is additive specialized coverage, not a global Childhood safety pool. It creates no zero-content fallback assumption.

## Geography audit

- Exact `locationIs`: **0**
- `locationHasTag` / `locationHasService`: **0**
- Origin sea requirement: **0**
- Birth Location requirement: **0**
- Movement Effects: **0**

Scenes use portable local spaces — house courtyard, workshop yard, small local/rehearsal room — supplied by the inherited Revolutionary environment rather than by a specific runtime Location. The roots therefore remain compatible with all valid Blue Birth Locations.

## Family Revolutionary Saga collision audit

The current Revolutionary Family Saga was treated as protected territory.

Its sole Special Association is `revolutionary_wealthy_patronage`; this batch uses neither Wealthy gating nor donor/patronage material.

Protected Saga motifs deliberately not reused as the dramatic engine include:

- donor envelopes / donor ledger / respectable patronage;
- coded buttons, chalk/shutter signals and contact-verification codes;
- family maps, addresses, safehouse keys and household-access arguments;
- relief-ration debt or recruitment-through-aid;
- orphan guardian substitution;
- household storage/refuge progression;
- Layer-5 inheritance or Active affiliation handoff.

No parent NPC is cast. No scene asks whether the family should support the Revolutionaries, how the household should evolve, or what career the child should choose. Revolutionary context is already established before each ordinary incident begins.

## Wave 1 collision audit

Reviewed against:

- `CH_V2_GENERIC_EARLY_01`
- `CH_V2_GENERIC_LATE_01`
- `CH_V2_PEERS_01`
- `CH_V2_IDENTITY_WORLD_01`
- `CH_V2_COMBAT_RISK_01`

Notable separation:

- Human sheltered-game root is not a PEERS friend/rival introduction and uses no persistent peer; its engine is Human social access × clandestinely sheltered Fish-Man guest.
- Fish-Man cistern root is not generic spill/cleaning content because the submerged object is clandestine print evidence and Fish-Man water access defines the response.
- Mink troupe-cover root is not the generic Revolutionary leaflet/world-discovery Event; the player already lives inside the inherited environment and the problem is bodily misclassification threatening an existing cover.
- Giant footprints root is not generic accident/risk content because the trail's meaning depends on both Giant scale and the discreet Revolutionary workshop.

## Wave 2 Race collision audit

Reviewed against all four integrated Race manifests.

- Human: no standard measurements, default-size interface, harness, tool fit or human-height machinery.
- Fish-Man: no rescue, paid aquatic service, hull inspection, net/piling work, strength dosage, public entitlement, swimming stat, respiration system or Karate.
- Mink: no hearing/scent filtering, tracking, scent screen, wet/sticky fur, touch-boundary scene, Electro, Sulong or instinct assumption.
- Giant: no doorway/room-fit problem, crowd visibility, fragile tiny-object handling, assumed authority, stair geometry, noise/discretion problem or Strength-auto-win premise.

Each Wave 3 root adds affiliation-specific stakes rather than restaging its standalone Race batch.

## Definitions / runtime audit

New persistent definitions: **zero**.

Referenced runtime vocabulary is limited to existing Schema 14 primitives:

- Conditions: `all`, `careerPhaseIs`, `ageAtLeastMonths`, `ageAtMostMonths`, `raceIs`, `affiliationIs`.
- Effects: `modifyStat`, `queueImmediateEvent`.
- Dice Stats: `agility`, `observation`, `charisma`.
- Narrative family: `origin_cross`.

No new NPC ID, Item ID, Trait ID, Flag ID, Location ID, Condition, Effect, Event kind or gameplay mechanic is invented.

## Final static validation

Package self-checks performed before ZIP creation:

- all Event JSON parses successfully;
- all Event IDs are unique and use the reserved prefix;
- exactly 4 Normal roots;
- exactly 3 root Dice Events;
- exactly 3 mini-arc roots;
- Immediate depths are 2 / 3 / 2;
- no Scheduled EventDefinition;
- no Lifetime seed;
- no `majorTrack`;
- every `queueImmediateEvent` target exists;
- Immediate graph is acyclic;
- every referenced localization key exists in the French fragment;
- every Event has at least one unconditional Choice;
- every root contains phase, age, Race and Revolutionary affiliation gates;
- only existing Schema 14 Condition/Effect/Stat IDs are referenced;
- no persistent-definition reference is introduced.
