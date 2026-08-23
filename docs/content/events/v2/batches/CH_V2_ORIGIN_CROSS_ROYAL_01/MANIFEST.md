# MANIFEST — CH_V2_ORIGIN_CROSS_ROYAL_01

## Repository baseline

- Repository authority: `NathanTheophile/opfg`
- Branch: `dev`
- Exact HEAD read: `4ec9d642823fd05b8151ed0d892203725f577bde`
- HEAD commit subject: `Integrate V2 race batch wave 2`
- Content Schema: **14**
- Save version: **21**
- Production mode: standalone package only.
- Repository mutation: **none** — no commit, branch, PR, Concept Index edit, Migration Ledger edit, runtime edit, schema edit, catalog edit, Family Saga edit or shared localization edit.

Current authorities checked at this HEAD: `AGENTS.md`, `docs/GAME_DESIGN.md`,
`docs/design/MAJOR_NARRATIVE_TRACKS.md`, `docs/design/WORLD_TIMELINE_AND_CANON.md`,
`docs/content/EVENT_AUTHORING_RULES.md`, `docs/content/CONTENT_BIBLE.md`,
`docs/content/TRAITS_CATALOG.md`, `docs/content/events/v2/CHILDHOOD_V2_BATCH_CONTRACT.md`,
`docs/content/events/v2/EVENT_CONCEPT_INDEX_V2.md`, `src/game/content/schema.ts`,
`src/game/content/catalogFactory.ts`, `docs/JAM_STATE.md`, and the current Royal Family authoring source.

Collision review also covered all five integrated Wave 1 manifests and all four integrated Race Wave 2 manifests.

## Batch identity

- Batch ID: `CH_V2_ORIGIN_CROSS_ROYAL_01`
- Reserved Event prefix: `ch_v2_origin_cross_royal_01_`
- Inherited affiliation: `royal_family`
- Narrative family: `origin_cross`
- Normal roots: **4 exactly**
- Major Track roots: **0**
- Lifetime Thread seeds: **0**
- Scheduled EventDefinitions: **0**
- New persistent definitions: **0**

## Root matrix

| Root | Race × Affiliation | Age months | Dice root | Dice approaches | Immediate depth |
|---|---|---:|---|---|---:|
| `ch_v2_origin_cross_royal_01_human_unmarked_page` | Human × Royal | 96–143 | yes | Charisma 11 / Observation 11 | 2 |
| `ch_v2_origin_cross_royal_01_fishman_added_epithet` | Fish-Man × Royal | 108–155 | no | — | 2 |
| `ch_v2_origin_cross_royal_01_mink_velvet_collar` | Mink × Royal | 120–167 | yes | Charisma 11 / Observation 11 | 0 |
| `ch_v2_origin_cross_royal_01_giant_misread_kneel` | Giant × Royal | 96–143 | yes | Charisma 11 / Observation 11 | 3 |

Quota audit:
- Dice roots: **3 / 4 exactly**
- Immediate mini-arc roots: **3 / 4 exactly**
- Mini-arcs with depth 2+: **3**
- Required depth-3 route: **yes**, Giant root
- Scheduled callbacks: **0**
- Lifetime Threads: **0**

## Origin Cross indispensability audit

### Human × Royal — `human_unmarked_page`

Premise: a stained royal insignia is removed; Human pages nearby wear the same plain clothing, so a newly assigned guard sorts the royal Human child into their group while the receiving line starts.

- Remove `royal_family`: there is no protected receiving-line access, royal insignia, precedence formula or identity reversal to recover.
- Remove `human`: the direct visual match with the Human page group disappears; the misclassification mechanism is no longer the same.
- Cross-owned change: **access + recognition protocol + available social proof**.

This is deliberately not Wave 2 Human “standard fit/measurement” content: no garment sizing, human-scale interface, harness, tool, crank, benchmark or leverage problem drives the scene.

### Fish-Man × Royal — `fishman_added_epithet`

Premise: a court calligrapher appends “des mers” to a Fish-Man royal child’s formal title without authorization, and the altered wording has already propagated into protocol copies.

- Remove `royal_family`: there is no formal royal titulature whose wording is about to be announced and copied as protocol.
- Remove `fishman`: the unauthorized Race-coded epithet has no reason to exist.
- Cross-owned change: **official wording + representational expectation + immediate protocol correction**.

This avoids Royal Family Saga Fish-Man territory: no basin, moisture accommodation, separate entrance, harbor gate, public reform promise or multi-layer family progression. It also avoids Wave 2 Fish-Man aquatic service/access mechanics.

### Mink × Royal — `mink_velvet_collar`

Premise: an envoy presents a collar specifically because the recipient is Mink and expects the royal child to wear it during the official welcome, making refusal a diplomatic act rather than a private reaction.

- Remove `royal_family`: the object loses its official-gift / diplomatic-performance stake.
- Remove `mink`: the collar’s animalizing premise and the envoy’s expectation disappear.
- Cross-owned change: **gift protocol + public expectation + diplomatic cost of refusal**.

This does not use Electro, Sulong, instinct, tracking, scent, hearing, fur maintenance or touch-boundary mechanics already owned by Wave 2 Mink.

### Giant × Royal — `giant_misread_kneel`

Premise: the Giant royal child lowers one knee only to hear a quiet guest; observers read the scale-driven posture as a royal act of submission, and protocol begins recursively copying the mistake.

- Remove `royal_family`: kneeling has no comparable precedence/status consequence.
- Remove `giant`: the practical need to lower the body to hear at the guest’s level, and therefore the ambiguous gesture, disappears.
- Cross-owned change: **gesture meaning + protocol interpretation + public expectation**.

This avoids Giant access/architecture and small-object territory: no doorway, stair, platform, tiny mechanism, crowd visibility problem, Strength shortcut or SizeSystem is used.

## Immediate graph

```text
human_unmarked_page
-> human_unmarked_page_i01_side_door
-> human_unmarked_page_i02_receiving_line

fishman_added_epithet
-> fishman_added_epithet_i01_protocol_copy
-> fishman_added_epithet_i02_spoken_title

mink_velvet_collar
-> resolution

giant_misread_kneel
-> giant_misread_kneel_i01_guest_mirrors
-> giant_misread_kneel_i02_herald_version
-> giant_misread_kneel_i03_next_guest
```

Every Immediate changes the scene:
- Human: mistaken role -> competing access route -> identity without regalia.
- Fish-Man: one altered card -> propagated copies -> spoken repetition by a guest.
- Giant: ambiguous kneel -> mirrored kneel -> official explanation -> next guest copying the misunderstanding.

No Continue-only panel exists.

## Dice audit

Dice appears only where the player is attempting an uncertain social/read-the-room action.

- Human: establish status through `charisma` or identify a household counter-sign through `observation`.
- Mink: force the envoy to state intent through `charisma` or inspect the dedication through `observation`.
- Giant: repair the interpretation through `charisma` or identify the correct ceremonial gesture through `observation`.

All root Dice use threshold **11 (Standard)**.

Player-Stat Dice profile:
- `criticalFailure`: **-1** rolled Stat + clearly worse fiction.
- `failure`: **0** Stat progression + concrete loss/aggravation.
- `success`: **+2** rolled Stat.
- `criticalSuccess`: **+2** rolled Stat.
- No +3 critical success.
- No racial modifier or automatic success is authored.

## Reward / malus audit

- Ordinary deterministic Stat deltas: only **-1 / 0 / +1**.
- Deterministic deltas below -1: **none**.
- Ordinary deterministic rewards above +1: **none**.
- Dice success / critical success: **+2** only.
- Dice critical failure: **-1** only.
- Health effects: **none**.
- Berrys, Items, Reputation, NPC state/relationship, career, flags and Locations: **none**.
- Mechanical neutrality is used where the fictional tradeoff itself resolves the scene.

Representative deterministic consequences:
- Human `wait_for_ribbon`: Morale -1 for accepting a visible delay to preserve protocol.
- Giant `stand_now`: Charisma -1 when abruptly cutting off the guest to repair appearances.
- Positive +1 outcomes are limited to clear observation/social-handling payoffs.

## Trait audit

- Trait grants: **0**
- Trait removals: **0**
- Trait-gated Choices: **0**
- Opposite-Trait conflicts: impossible in this package.
- Only the existing 28-Trait runtime catalogue remains in scope; none is mutated.

## Age coverage

- Human: 96–143 months (8–11 years)
- Fish-Man: 108–155 months (9–12 years)
- Mink: 120–167 months (10–13 years)
- Giant: 96–143 months (8–11 years)

All four roots are explicit Childhood-only windows and end before Active at 180 months.

## Geography audit

- Exact `locationIs`: **0**
- `originSeaIs`: **0**
- Location tag/service requirements: **0**
- Movement Effects: **0**

Scenes use a portable royal-household reception context rather than a specific palace, kingdom or Birth Location. They remain compatible with the playable Birth Location surface because no runtime Location property is required.

## Family Royal collision audit

Current `family_royal` protections observed:
- `royal_orphan_burden` signature path: not used.
- `royal_fallen_house` / Poor restoration pressure: not used.
- succession, inheritance, house restoration, ruler pressure, Layer-5 reward and Active handoff: absent.
- Fish-Man Family path (`fishman_balcony_basin` -> `fishman_proof` -> `fishman_harbor_question` before rejoin): not reproduced.
- Giant Family scenes (`giant_archway`, `giant_servant_steps`): not reproduced.
- Parent/child Family conflict: absent.
- No Family `majorTrack`, `specialPathId`, `milestoneId` or Saga History condition appears.

These are ordinary one-scene biography incidents. No outcome establishes a future Family claim or inheritance.

## Wave 1 / Wave 2 collision audit

Wave 1 checked:
- `CH_V2_GENERIC_EARLY_01`
- `CH_V2_GENERIC_LATE_01`
- `CH_V2_PEERS_01`
- `CH_V2_IDENTITY_WORLD_01`
- `CH_V2_COMBAT_RISK_01`

Avoided overlapping engines including generic entrusted-object tasks, privileged public queue / crest drawing, peer-status stories, mechanisms/tools, evacuation and physical-hazard roots.

Wave 2 checked:
- `CH_V2_RACE_HUMAN_01`
- `CH_V2_RACE_FISHMAN_01`
- `CH_V2_RACE_MINK_01`
- `CH_V2_RACE_GIANT_01`

The four roots add Royal protocol as an indispensable second axis and avoid each Race batch’s owned core premises described above.

## Persistent-definition / runtime-vocabulary audit

New definitions:
- NpcDefinition: **0**
- ItemDefinition: **0**
- TraitDefinition: **0**
- Flag: **0**
- Location: **0**
- Condition: **0**
- Effect: **0**
- Mechanic/system: **0**

Runtime vocabulary used:
- Conditions: `all`, `careerPhaseIs`, `ageAtLeastMonths`, `ageAtMostMonths`, `raceIs`, `affiliationIs`
- Effects: `modifyStat`, `queueImmediateEvent`
- Event kinds: `normal`, `immediate`
- Dice Stats: `charisma`, `observation`
- Narrative family: `origin_cross`

Persistent NPC cast: **none**. All guards, valets, calligraphers, clerks, envoys, guests, heralds and officiants are throwaway prose-only actors.

## Localization audit

- Source/fallback locale: **FR**
- File: `localization/fr.fragment.json`
- Every `titleKey`, `textKey`, Choice key and Outcome key referenced by the package is present.
- No global localization dictionary is modified.

## Package-local validation

The package was checked locally for:
- valid JSON for every EventDefinition and the FR fragment;
- unique Event IDs and ID-prefix compliance;
- exactly four Normal roots;
- exactly four Race × `royal_family` combinations;
- exact 3/4 root Dice quota;
- exact 3/4 Immediate-root quota;
- Immediate depths 2 / 2 / 0 / 3;
- no Immediate cycles;
- every queued Immediate target exists;
- zero Scheduled EventDefinitions / `scheduleEvent` effects;
- zero Lifetime Thread seed;
- zero `majorTrack`;
- mandatory root phase/age/Race/affiliation gates;
- every Event has at least one unconditional resolvable Choice;
- localization completeness;
- Dice progression profile;
- no unknown Condition/Effect/Event kind used relative to Content Schema 14;
- no new persistent runtime reference.
