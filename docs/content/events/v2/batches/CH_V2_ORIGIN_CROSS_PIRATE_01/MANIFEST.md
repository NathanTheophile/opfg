# CH_V2_ORIGIN_CROSS_PIRATE_01 — MANIFEST

## Repository baseline

- Repository: `NathanTheophile/opfg`
- Branch reviewed: `dev`
- HEAD: `4ec9d642823fd05b8151ed0d892203725f577bde`
- Content Schema: `14`
- Save version: `21`
- Repository modifications: **none**
- Package only: this batch is staged outside the repository for review/import.

## Batch contract

- Affiliation: `pirate`
- Narrative family: `origin_cross`
- Normal roots: **exactly 4**
- Dice roots: **exactly 2 / 4**
- Immediate mini-arc roots: **exactly 2 / 4**
- Lifetime Threads: **0**
- Major Track nodes: **0**
- Scheduled callbacks: **0**
- New persistent definitions: **0**

## Root matrix

| Root | Race × Affiliation | Age window | Dice | Immediate depth |
|---|---|---:|---|---:|
| `ch_v2_origin_cross_pirate_01_human_false_messenger` | Human × Pirate | 72–119 months | Charisma / Observation, Standard 11 | 0 |
| `ch_v2_origin_cross_pirate_01_fishman_false_flag` | Fish-Man × Pirate | 84–131 months | — | 1 |
| `ch_v2_origin_cross_pirate_01_mink_missing_share` | Mink × Pirate | 108–155 months | Intelligence / Charisma, Standard 11 | 0 |
| `ch_v2_origin_cross_pirate_01_giant_overmark` | Giant × Pirate | 120–179 months | — | 2 |

Every root explicitly requires:
- `careerPhaseIs(childhood)`
- `ageAtLeastMonths`
- `ageAtMostMonths`
- its required `raceIs(...)`
- `affiliationIs(pirate)`

## Origin Cross audit

### Human × Pirate — `human_false_messenger`

**Concept:** a rival pirate lookout mistakes the child for his own young messenger because the expected messenger is also human, and accidentally gives away a countersign.

- Remove **Pirate**: the rival lookout, countersign, competing pirate group and immediate tactical opening disappear; the premise no longer exists.
- Remove **Human**: the mistaken identity no longer follows from matching the expected messenger's visible Race; the initiating error materially changes.
- Human is used as a concrete mistaken-identity fit inside a pirate signalling routine, not as “no particularity”.

### Fish-Man × Pirate — `fishman_false_flag`

**Concept:** a merchant uses a freshly repainted pirate flag bearing a Fish-Man skull as supposed evidence that the child's pirate household/group robbed him; inspection reveals deliberate framing.

- Remove **Pirate**: the flag ceases to function as evidence assigning a raid to the child's group; the accusation premise collapses.
- Remove **Fish-Man**: the added Fish-Man emblem no longer singles out this child/group as the intended culprit; the frame-up mechanism changes.
- Explicitly **not** about swimming, underwater work, hull access, aquatic coercion, underwater loot, Fish-Man Karate, or Pirate inheritance.

### Mink × Pirate — `mink_missing_share`

**Concept:** during an ordinary pirate split, one pirate excludes the child from the shares specifically because the child is Mink.

- Remove **Pirate**: the share custom, captured take and authority of the pirate doing the split disappear; the conflict changes category.
- Remove **Mink**: the exclusion rule that creates the dispute disappears; it is not a generic unfair split.
- No Electro, Sulong, instinct, scent/tracking or automatic perception is assumed.

### Giant × Pirate — `giant_overmark`

**Concept:** pirates mark claimed crates with tar; the Giant child's handprint physically overlaps rival claim marks and is interpreted as an intentional multi-crate claim.

- Remove **Pirate**: the claim-mark custom and rival-equipment dispute disappear; the oversized mark has no equivalent immediate stake.
- Remove **Giant**: the physical overmark that creates the false multi-crate claim disappears.
- No SizeSystem, lifting shortcut, stupidity/slowness stereotype, tight-space beat or visibility/search beat is used.

All four concepts pass the mandatory two-axis removal test.

## Dice audit

Dice roots:
1. `ch_v2_origin_cross_pirate_01_human_false_messenger`
   - `Jouer le messager` → Charisma, Standard 11
   - `Mémoriser son rituel` → Observation, Standard 11
2. `ch_v2_origin_cross_pirate_01_mink_missing_share`
   - `Refaire le compte devant tous` → Intelligence, Standard 11
   - `Faire voter ta part` → Charisma, Standard 11

For every Dice Choice:
- `criticalFailure`: **-1** to the rolled Stat plus a clearly worse fictional result;
- `failure`: **0 Stat progression** plus loss/aggravation of the opportunity;
- `success`: **+2** to the rolled Stat;
- `criticalSuccess`: **+2** to the rolled Stat;
- no racial modifier forces a result;
- each Dice root offers two materially different uncertain approaches.

## Immediate audit

Mini-arc roots:
- `ch_v2_origin_cross_pirate_01_fishman_false_flag` → `ch_v2_origin_cross_pirate_01_fishman_false_flag_reveal` — depth **1**
- `ch_v2_origin_cross_pirate_01_giant_overmark` → `ch_v2_origin_cross_pirate_01_giant_overmark_dispute` → `ch_v2_origin_cross_pirate_01_giant_overmark_boundary` — depth **2**

The depth-2 requirement is satisfied by Giant × Pirate.

Each Immediate either:
- reveals new evidence;
- changes the disputed situation;
- or introduces a new resolution decision.

No continuation exists solely to pad depth.

## Scheduled audit

- Scheduled callbacks: **0**
- `scheduleEvent` effects: **0**

No delayed callback was justified strongly enough to displace a future Childhood root slot.

## Reward / malus audit

- Dice progression follows the V2 profile exactly: `-1 / 0 / +2 / +2`.
- Deterministic positive Stat changes never exceed `+1`.
- Deterministic negative Stat changes never exceed `-1`.
- Human deterministic exit is mechanically neutral.
- Fish-Man refusal/evidence branches use at most a small `+1` identity/observation gain.
- Giant de-escalation/appropriation branches include ordinary `-1` Morale costs where the chosen action carries a clear personal cost.
- No Berrys, Item, Reputation, persistent NPC Relationship or Health effects are introduced.

## Trait audit

- Trait grants: **0**
- `addTrait`: **0**
- `removeTrait`: **0**
- No opposite-pair issue can occur.

## Age coverage

- Human: 72–119 months
- Fish-Man: 84–131 months
- Mink: 108–155 months
- Giant: 120–179 months

All are strictly Childhood-gated. The batch intentionally spans middle to late Childhood rather than consuming the earliest Family checkpoints.

## Geography audit

- Exact `locationIs`: **0**
- Location tag/service gates: **0**
- Current-sea gates: **0**
- New Locations: **0**
- Scenes use portable pirate/market/cargo situations and do not require one specific Birth Location.
- No canon-sensitive named Location or character is used.

## Cast / definition audit

Persistent cast references: **0**.

All merchants, rival pirates, lookouts and messengers are throwaway prose-only actors.

New definitions:
- `NpcDefinition`: **0**
- `ItemDefinition`: **0**
- Trait: **0**
- system Flag: **0**
- Location: **0**
- Condition type: **0**
- Effect type: **0**
- mechanic: **0**

Only existing Schema 14 vocabulary is used.

## Family Saga collision audit

Reviewed the current `family_pirate` authoring source and its existing Special Association territory.

This batch does **not** reproduce:
- family inheritance;
- Layer-5 rewards;
- age-15 career handoff;
- central parent/child conflict;
- household progression;
- Family Major nodes;
- Family Saga items;
- Special Association paths.

Special watch `pirate_fishman_underkeel`:
- no coercion around aquatic capability;
- no under-keel work;
- no swimming task;
- no submerged cargo/loot;
- no Pirate inheritance;
- no continuation of that Special Association.

The Fish-Man root is instead an ordinary false-attribution incident built around a repainted pirate emblem.

## Wave 1 / Wave 2 collision audit

Reviewed all five Wave 1 manifests:
- `CH_V2_GENERIC_EARLY_01`
- `CH_V2_GENERIC_LATE_01`
- `CH_V2_PEERS_01`
- `CH_V2_IDENTITY_WORLD_01`
- `CH_V2_COMBAT_RISK_01`

Closest practical collision areas checked included wanted-poster/misidentification material, storeroom intrusion, cart/raid beats, concealment and authority scenes. None of the four roots reuses those root premises.

Reviewed all four Race Wave 2 manifests present on current `dev`:
- `CH_V2_RACE_HUMAN_01`
- `CH_V2_RACE_FISHMAN_01`
- `CH_V2_RACE_MINK_01`
- `CH_V2_RACE_GIANT_01`

Separation:
- Human root is pirate-signalling mistaken identity, not a generic Human “baseline” scene.
- Fish-Man root avoids the Wave 2 aquatic-capability territory entirely.
- Mink root avoids scent, fur, instinct, tracking, Electro and Sulong.
- Giant root avoids visibility, narrow spaces and strength/lifting beats.

## Runtime / package self-check

- JSON parses successfully: **PASS**
- Event IDs unique: **PASS**
- Normal root count = 4: **PASS**
- Race × Pirate matrix = 4/4: **PASS**
- Dice root count = 2: **PASS**
- Mini-arc root count = 2: **PASS**
- Immediate targets exist: **PASS**
- Immediate graph acyclic: **PASS**
- Maximum Immediate depth = 2: **PASS**
- Scheduled definitions/effects = 0: **PASS**
- Localization keys referenced by all Events/Choices/Outcomes present in FR fragment: **PASS**
- Every Event has at least one unconditional Choice: **PASS**
- All root IDs use required prefix: **PASS**
- `majorTrack` absent: **PASS**
- `lifetimeThreadSeed` absent: **PASS**
- no invented Condition/Effect vocabulary: **PASS**
- no new persistent definition references: **PASS**

## Files

### EventDefinitions

- `events/ch_v2_origin_cross_pirate_01_human_false_messenger.json`
- `events/ch_v2_origin_cross_pirate_01_fishman_false_flag.json`
- `events/ch_v2_origin_cross_pirate_01_fishman_false_flag_reveal.json`
- `events/ch_v2_origin_cross_pirate_01_mink_missing_share.json`
- `events/ch_v2_origin_cross_pirate_01_giant_overmark.json`
- `events/ch_v2_origin_cross_pirate_01_giant_overmark_dispute.json`
- `events/ch_v2_origin_cross_pirate_01_giant_overmark_boundary.json`

### Localization

- `localization/fr.CH_V2_ORIGIN_CROSS_PIRATE_01.fragment.json`
