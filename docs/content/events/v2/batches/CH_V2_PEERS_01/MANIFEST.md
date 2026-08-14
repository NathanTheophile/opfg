# CH_V2_PEERS_01 — MANIFEST

## Repository baseline

- Repository: `NathanTheophile/opfg`
- Branch read: `dev`
- HEAD used for authoring: `3aa3b197b027c4508bb628c03d1c1dfd34acc829`
- Content Schema observed: `14`
- Production mode: standalone package only; no commit, merge, selector/runtime edit, shared localization edit, Concept Index edit or Migration Ledger edit.

## Scope

Ordinary Childhood V2 **Peers** content, approximately ages 4–14. The dramatic engine is always a peer relationship, peer group, friendship, rivalry, social status, loyalty, jealousy, accusation, humiliation, competition, pressure, fracture or reconciliation.

Protected territory deliberately excluded: Family Major Saga, Race-dependent premises, Birthplace-dependent premises, Origin Cross, wider-world/institution-first stories, and bodily danger as the core problem.

## Coordination locks honored

- `childhood_friend` introduction: **SEED-02 — Inventer une règle ensemble** → `ch_v2_peers_01_friend_rule_intro`.
- `childhood_rival` introduction: **SEED-06 — Une seule place pour deux assistants** → `ch_v2_peers_01_rival_assistant_intro`.
- Exactly one primary Lifetime Thread: **LT-CANDIDATE-A — rival as a measure of self**, seeded by `ch_v2_peers_01_rival_assistant_intro`.
- Reserved PEERS concepts used: `paper_boat_race`, peer-responsibility `broken_pane`, entrusted-tool loan, peer-secret `after_hours_repair`.
- Explicitly not produced: generic/dangerous dog, ditch jump, after-the-fall.
- No alternate friend/rival first-meeting root exists.
- Friend/rival callbacks use explicit History and Relationship gates or, for Scheduled Lifetime callbacks, History reachability plus Relationship-conditioned response choices.

## Files

- `events/`: 59 EventDefinition JSON files total.
- `localization/fr.fragment.json`: source-locale fragment containing 556 keys.
- English fragment not produced; current localization runtime falls back to source locale when an English key is absent.
- `PROPOSED_DEFINITIONS.md`: not present because no new persistent definition is required.

## Event IDs

### Root Event IDs

- `ch_v2_peers_01_friend_rule_intro`
- `ch_v2_peers_01_rival_assistant_intro`
- `ch_v2_peers_01_paper_boat_race`
- `ch_v2_peers_01_broken_pane_pact`
- `ch_v2_peers_01_entrusted_tool_loan`
- `ch_v2_peers_01_after_hours_repair`
- `ch_v2_peers_01_humiliating_initiation`
- `ch_v2_peers_01_shared_credit`
- `ch_v2_peers_01_blocked_passage`
- `ch_v2_peers_01_younger_lookouts`
- `ch_v2_peers_01_last_light`
- `ch_v2_peers_01_game_spreads`
- `ch_v2_peers_01_third_seat_jealousy`
- `ch_v2_peers_01_rival_praise_reversal`
- `ch_v2_peers_01_rival_asks_help`
- `ch_v2_peers_01_friend_rumor_exclusion`
- `ch_v2_peers_01_private_rule_repeated`
- `ch_v2_peers_01_missing_score_token`
- `ch_v2_peers_01_pretend_ship_captain`
- `ch_v2_peers_01_pane_reconciliation`

### Immediate Event IDs

- `ch_v2_peers_01_friend_rule_intro_i01_rule_test`
- `ch_v2_peers_01_friend_rule_intro_i02_new_player`
- `ch_v2_peers_01_rival_assistant_intro_i01_shared_tray`
- `ch_v2_peers_01_rival_assistant_intro_i02_one_stool`
- `ch_v2_peers_01_paper_boat_race_i01_last_bend`
- `ch_v2_peers_01_broken_pane_pact_i01_owner_returns`
- `ch_v2_peers_01_broken_pane_pact_i02_shared_story`
- `ch_v2_peers_01_after_hours_repair_i01_missing_piece`
- `ch_v2_peers_01_after_hours_repair_i02_second_crack`
- `ch_v2_peers_01_after_hours_repair_i03_owner_at_door`
- `ch_v2_peers_01_humiliating_initiation_i01_next_target`
- `ch_v2_peers_01_humiliating_initiation_i02_group_vote`
- `ch_v2_peers_01_shared_credit_i01_friend_response`
- `ch_v2_peers_01_blocked_passage_i01_new_toll`
- `ch_v2_peers_01_blocked_passage_i02_younger_watch`
- `ch_v2_peers_01_younger_lookouts_i01_signal_changes`
- `ch_v2_peers_01_younger_lookouts_i02_blame`
- `ch_v2_peers_01_friend_rumor_exclusion_i01_story_changes`
- `ch_v2_peers_01_friend_rumor_exclusion_i02_group_door`
- `ch_v2_peers_01_pretend_ship_captain_i01_storm_rule`

### Scheduled Event IDs

- `ch_v2_peers_01_lt_rival_s01_new_measure`
- `ch_v2_peers_01_lt_rival_s02a_fair_rematch`
- `ch_v2_peers_01_lt_rival_s03a_shared_score`
- `ch_v2_peers_01_lt_rival_s02b_public_taunt`
- `ch_v2_peers_01_lt_rival_s03b_grudging_score`
- `ch_v2_peers_01_lt_rival_s04_distant_mark`
- `ch_v2_peers_01_lt_rival_s05_ask_for_help`
- `ch_v2_peers_01_lt_rival_s06a_cooperate`
- `ch_v2_peers_01_lt_rival_s07a_shared_win`
- `ch_v2_peers_01_lt_rival_s06b_refuse_help`
- `ch_v2_peers_01_lt_rival_s07b_solo_cost`
- `ch_v2_peers_01_lt_rival_s08_same_question`
- `ch_v2_peers_01_lt_rival_s09_name_travels`
- `ch_v2_peers_01_lt_rival_s10a_send_praise`
- `ch_v2_peers_01_lt_rival_s11a_parallel_paths`
- `ch_v2_peers_01_lt_rival_s10b_send_challenge`
- `ch_v2_peers_01_lt_rival_s11b_long_distance`
- `ch_v2_peers_01_lt_rival_s12_last_scorecard`
- `ch_v2_peers_01_lt_rival_s13_better_than_before`

## Persistent definitions used

- NPCs: `childhood_friend`, `childhood_rival`.
- Traits granted: competitive, proud.
- Items / equipment: none.
- Flags: none.
- Locations / tags / services required: none; physical context remains generic/local and no Location Condition is used.
- Careers / ranks / titles / bounty: none.
- Devil Fruits / Haki / ships / crew roles: none.
- No new Item, NPC, Trait, Flag, Location, system, Condition or Effect.
- Existing runtime Conditions/Effects only.
- Dependencies on other batches: none; all friend/rival introductions required by this package are contained here.
- Timeline/canon: Childhood roots remain before 180 months; Lifetime continuation uses distance-safe correspondence/rumor and no major canon entity.

## Root coverage audit

- Root count: **20 Normal roots exactly**.
- Age territory: **48–179 months (approximately 4–14 years)**.
- Ages 1–3 are deliberately outside this batch brief and must be covered by other ordinary Childhood batches plus Major content.

| Root | Age months | Dice at root | Immediate depth | Persistent peer / gating |
|---|---:|---:|---:|---|
| `ch_v2_peers_01_friend_rule_intro` | 48–83 | no | 2 | friend introduction |
| `ch_v2_peers_01_rival_assistant_intro` | 60–95 | yes (2) | 2 | rival introduction + Lifetime seed |
| `ch_v2_peers_01_paper_boat_race` | 60–95 | yes (2) | 1 | local peer group |
| `ch_v2_peers_01_broken_pane_pact` | 72–119 | yes (2) | 2 | friend: intro History + Relationship >= -5 |
| `ch_v2_peers_01_entrusted_tool_loan` | 108–155 | no | 0 | friend: intro History + Relationship >= 3 |
| `ch_v2_peers_01_after_hours_repair` | 120–179 | yes (2) | 3 | friend: intro History + Relationship >= 0 |
| `ch_v2_peers_01_humiliating_initiation` | 132–179 | yes (2) | 2 | local peer group |
| `ch_v2_peers_01_shared_credit` | 108–167 | yes (2) | 1 | friend: intro History + Relationship >= 3 |
| `ch_v2_peers_01_blocked_passage` | 120–179 | yes (2) | 2 | local peer hierarchy |
| `ch_v2_peers_01_younger_lookouts` | 120–167 | yes (2) | 2 | local older/younger peer groups |
| `ch_v2_peers_01_last_light` | 132–179 | no | 0 | friend: intro History + Relationship >= 5 |
| `ch_v2_peers_01_game_spreads` | 84–143 | no | 0 | friend: intro History + Relationship >= 3 |
| `ch_v2_peers_01_third_seat_jealousy` | 96–143 | no | 0 | friend: intro History + Relationship >= 5 |
| `ch_v2_peers_01_rival_praise_reversal` | 108–167 | yes (2) | 0 | rival: intro History + non-neutral Relationship band |
| `ch_v2_peers_01_rival_asks_help` | 108–167 | no | 0 | rival: intro History + Relationship >= 6 |
| `ch_v2_peers_01_friend_rumor_exclusion` | 108–167 | yes (2) | 2 | friend: intro History + Relationship >= 2 |
| `ch_v2_peers_01_private_rule_repeated` | 96–155 | no | 0 | friend: intro History + Relationship >= 4 |
| `ch_v2_peers_01_missing_score_token` | 84–143 | yes (2) | 0 | local peer group |
| `ch_v2_peers_01_pretend_ship_captain` | 72–131 | yes (2) | 1 | local peer group |
| `ch_v2_peers_01_pane_reconciliation` | 132–179 | no | 0 | friend: broken-pane History + intro History + Relationship <= 5 |

### Restrictive eligibility and fallback coverage

Restrictive callback roots: `ch_v2_peers_01_broken_pane_pact`, `ch_v2_peers_01_entrusted_tool_loan`, `ch_v2_peers_01_after_hours_repair`, `ch_v2_peers_01_shared_credit`, `ch_v2_peers_01_last_light`, `ch_v2_peers_01_game_spreads`, `ch_v2_peers_01_third_seat_jealousy`, `ch_v2_peers_01_rival_praise_reversal`, `ch_v2_peers_01_rival_asks_help`, `ch_v2_peers_01_friend_rumor_exclusion`, `ch_v2_peers_01_private_rule_repeated`, `ch_v2_peers_01_pane_reconciliation`.

They are **optional callbacks**, never sole age-band coverage. Their History/Relationship requirements intentionally suppress scenes when the relationship never formed or evolved incompatibly. The batch retains broad non-persistent peer roots across middle/late Childhood (`ch_v2_peers_01_paper_boat_race`, `ch_v2_peers_01_humiliating_initiation`, `ch_v2_peers_01_blocked_passage`, `ch_v2_peers_01_younger_lookouts`, `ch_v2_peers_01_missing_score_token`, `ch_v2_peers_01_pretend_ship_captain`) so those callbacks are not treated as universal fallback content.

No root depends on Race, Birth Location, Family affiliation or a newly proposed definition.

## Immediate quota audit

- Mini-arc roots: **11/20 = 55%**.
- Depth 2+ mini-arcs: **8/11 = 73%**.
- Maximum depth: **3**.
- Required depth-3 root: `ch_v2_peers_01_after_hours_repair`.

| Root | Max consecutive Immediate depth |
|---|---:|
| `ch_v2_peers_01_friend_rule_intro` | 2 |
| `ch_v2_peers_01_rival_assistant_intro` | 2 |
| `ch_v2_peers_01_paper_boat_race` | 1 |
| `ch_v2_peers_01_broken_pane_pact` | 2 |
| `ch_v2_peers_01_after_hours_repair` | 3 |
| `ch_v2_peers_01_humiliating_initiation` | 2 |
| `ch_v2_peers_01_shared_credit` | 1 |
| `ch_v2_peers_01_blocked_passage` | 2 |
| `ch_v2_peers_01_younger_lookouts` | 2 |
| `ch_v2_peers_01_friend_rumor_exclusion` | 2 |
| `ch_v2_peers_01_pretend_ship_captain` | 1 |

Every Immediate changes information, social position, available decision, or consequence; none is a continue-only panel.

## Dice quota audit

- Dice roots: **12/20 = 60%**.
- Every Dice root contains **2 materially different DiceCheck Choices**; no one-Dice-choice exception is used.
- Root Dice IDs: `ch_v2_peers_01_rival_assistant_intro`, `ch_v2_peers_01_paper_boat_race`, `ch_v2_peers_01_broken_pane_pact`, `ch_v2_peers_01_after_hours_repair`, `ch_v2_peers_01_humiliating_initiation`, `ch_v2_peers_01_shared_credit`, `ch_v2_peers_01_blocked_passage`, `ch_v2_peers_01_younger_lookouts`, `ch_v2_peers_01_rival_praise_reversal`, `ch_v2_peers_01_friend_rumor_exclusion`, `ch_v2_peers_01_missing_score_token`, `ch_v2_peers_01_pretend_ship_captain`.
- Root Dice thresholds: 11, 12, 11, 12, 12, 11, 13, 12, 13, 12, 11, 12, 12, 12, 12, 13, 13, 12, 13, 12, 12, 13, 11, 12.
- Threshold distribution: 11×5, 12×13, 13×6.
- Stats exercised at root: `agility`, `charisma`, `intelligence`, `morale`, `navigation`, `observation`.

Normal Dice Stat progression profile is respected: critical failure `-1`, failure `0`, success `+2`, critical success `+2`. Failures also lose social position, trust, clarity, opportunity or branch leverage in prose and, where a persistent peer participates, commonly Relationship.

### Conditioned Dice / Trait interactions

- `ch_v2_peers_01_rival_assistant_intro` Dice success/critical success on `colors` may grant existing Trait `competitive`.
- `ch_v2_peers_01_humiliating_initiation` Dice success/critical success on `reverse` may grant existing Trait `proud`.
- Both grants originate from Dice choices; neither Trait has an opposite-Trait compatibility issue because both are independent Traits.

## Reward / malus audit

Examples of ordinary deterministic outcomes:

- Positive: `ch_v2_peers_01_friend_rule_intro:invent` → Intelligence +1 and friend Relationship gain.
- Neutral/mechanical-light: `ch_v2_peers_01_game_spreads:accept` primarily changes Relationship/social meaning with only ordinary +1 Charisma.
- Negative: `ch_v2_peers_01_friend_rule_intro:keep` → Morale -1 and friend Relationship loss; `ch_v2_peers_01_last_light:stay` → Morale -1 despite social approval; `ch_v2_peers_01_pane_reconciliation:close` → Morale -1 and major Relationship loss.

Deterministic Stat maluses below -1: **none**.
Ordinary deterministic Stat rewards above +1: **none**.
Trait grants: 4 total authored grant sites, all Dice-qualified.
No unconditional deterministic Choice grants a Trait: **confirmed**.

## Lifetime audit — rival as measure of self

- Seed root: `ch_v2_peers_01_rival_assistant_intro` (`lifetimeThreadSeed: true`).
- Durable anchor/cast: existing `childhood_rival`; the first assistant contest remains the remembered starting measure.
- Scheduled definitions: **19 distinct**.
- Longest complete reachable Scheduled path after seed: **13**.
- Meaningful structural divergences: **3** at `ch_v2_peers_01_lt_rival_s01_new_measure`, `ch_v2_peers_01_lt_rival_s05_ask_for_help`, `ch_v2_peers_01_lt_rival_s09_name_travels`.
- Each split persists for exactly two branch-specific Scheduled chapters before reconvergence.
- No branch contains another Scheduled split before reconvergence: **confirmed**.
- Each lived chapter normally schedules at most one next Lifetime chapter: **confirmed**.
- Early termination is available at each of the three divergence nodes.
- Intended span: introduction around ages 5–8; Childhood rematches through roughly 14; correspondence/rumor callbacks continue deliberately through Active and can remain relevant into the late twenties/early thirties depending seed age and branch.
- Maximum normal-path Scheduled descendants before age 15: **4** (worst case: seed at 60 months, S1/S2/S3/S4 at 84/108/132/156 months; S5 is delayed to at least 192 months).
- Geography: S1–S3 are pre-15 local encounters while Childhood remains at the birth region; S4 onward uses traveler-delivered cards, letters, rumors and other distance-safe channels. The rival never teleports to the player's current Location.

### Branch / reconvergence map

```text
Seed ch_v2_peers_01_rival_assistant_intro
  -> S1 new measure
      ├─ fair route -> S2A -> S3A ─┐
      ├─ public route -> S2B -> S3B ├-> S4 distant mark
      └─ stop (early termination) ───┘
  -> S5 asks for help
      ├─ full help -> S6A -> S7A ───┐
      ├─ partial/refusal -> S6B -> S7B ├-> S8 same question
      └─ silence (early termination) ───┘
  -> S9 name travels
      ├─ sincere praise -> S10A -> S11A ─┐
      ├─ renewed challenge -> S10B -> S11B ├-> S12 scorecard -> S13 meaning of better
      └─ release the score (early termination) ─┘
```

Relationship memory is active throughout: every Lifetime Scheduled chapter is reachable only through previous History, and each returning chapter offers Relationship-gated warm/sharp responses or branch options instead of treating the rival as a fresh acquaintance.

## Callback audit

Normal friend/rival callbacks always combine History with Relationship eligibility. Examples:

- friend warm callback `ch_v2_peers_01_game_spreads`: `hasPlayed(ch_v2_peers_01_friend_rule_intro)` + Relationship >= 3;
- rival callback `ch_v2_peers_01_rival_asks_help`: `hasPlayed(ch_v2_peers_01_rival_assistant_intro)` + Relationship >= 6;
- strained-friend reconciliation `ch_v2_peers_01_pane_reconciliation`: `hasPlayed(ch_v2_peers_01_broken_pane_pact)` + `hasPlayed(ch_v2_peers_01_friend_rule_intro)` + Relationship <= 5.

No callback uses a generated NPC name as proof that the relationship has been introduced.

## Geography / canon audit

- No hard-coded Location ID.
- No Race/Birth Location dependency.
- No major canon character or protected canon event.
- No physical post-Childhood rival reunion is assumed by the Lifetime; distant communication carries continuity after travel begins.
- No travel, ship, career rank, bounty, Haki or Devil Fruit mechanics are introduced.

## Collision / dedup audit

- Family Saga territory is excluded: no parent progression, inherited affiliation destiny, inheritance resolution, or age-15 career handoff.
- `paper_boat_race` remains peer competition rather than water danger or Generic filler.
- `broken_pane` is rewritten around friend loyalty/responsibility and has explicit friend History/Relationship gating.
- entrusted-tool loan is explicitly about trust in an established friend; the tool itself is not a persistent Item.
- `after_hours_repair` is explicitly about the friend's secrecy/accountability and contains a three-Immediate social escalation.
- Rival Lifetime is not a combat ladder. Its three eras change the meaning of “better”: fair/public comparison → willingness to help → reaction to the rival's independent success → self-defined measure.
- No root duplicates the locked friend or rival introduction with another first meeting.

## Authoring quality audit

- Root bodies target 20–45 words. Generated body-count outliers: `{}`.
- Immediate/Scheduled bodies target 12–40 words. Generated body-count outliers: `{}`.
- Choice labels target 2–10 words. Generated label-count outliers: `{}`.
- Situation → Reaction applied to every root: actor(s), current action, and immediate stake are stated before Choices.
- Roots normally have 3–4 Choices; each root includes at least two premise-specific actions.
- No universal `help / wait / get an adult / leave` template is used.
- Youngest root begins at 4 years with simple rule-making; complex secrecy, public reputation and repair scenes are reserved for later ages.

## Proposed definitions

None. No `PROPOSED_DEFINITIONS.md` is required.
