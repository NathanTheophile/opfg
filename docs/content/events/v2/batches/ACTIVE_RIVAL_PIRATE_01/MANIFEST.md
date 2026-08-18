# ACTIVE_RIVAL_PIRATE_01 — Manifest

## Scope

- Batch: `ACTIVE_RIVAL_PIRATE_01`
- Territory: Pirate Active secondary Rival thread.
- Runtime namespace: `active_rival_pirate_01_*`
- Source baseline audited: current `dev` content at `4cb9cfbb8d96c04a7b2b8c87efba89432a8e3368`.
- Career Saga hook: **none**. `career_pirate.authoring.json` is not modified.
- Profile: one Normal seed followed by a braided long-form Scheduled thread.
- Authored EventDefinitions: **16** = 1 Normal seed + 15 Scheduled definitions.
- Temporal layers: **9**.
- Nominal seed-to-terminal elapsed time: **124 months**.
- Seed window: `192..252 ageMonths` (ages 16–21), on land, Pirate career.
- Nominal terminal window: `316..376 ageMonths`, before the V1 `420 ageMonths` horizon.

## Persistent NPC audit

### Existing cast reviewed

Current persistent cast includes Family/Childhood NPCs, Mira, East Blue recurring NPCs and Wave 3 recruitment candidates. None is already established as an independent Pirate captain whose career identity can safely carry this thread without conflating a different persistent role.

### New definition

`active_rival_pirate_01_captain`

- original Pirate captain;
- female;
- `namePoolId: childhood_female`, matching current generated-name infrastructure;
- generated/persisted runtime Stats by omission of `initialStats`;
- `affiliationId: pirate`;
- no intrinsic CrewRole;
- persistent Relationship is the sole trajectory state;
- no Rival enum/counter/quest state/flag is introduced.

The fallback localization name is “Rival Captain” / “Capitaine rivale”; normal runs materialize a seeded display name from the pool.

## Narrative anchor

The rival carries a cracked brass bell used to start or settle contested pirate scores. The bell recurs across races, betrayals, temporary alliances and the final resolution, so callbacks remain recognizable without adding an Item or Flag.

## Graph

| Layer | Event | Delay from previous | Role | Dice |
|---|---|---:|---|---|
| L1 | `active_rival_pirate_01_bell_claim` | — | Normal seed; first contested salvage | Agility / Charisma |
| L2 | `active_rival_pirate_01_s02_second_claim` | 12m | tests whether the first bargain still applies | — |
| L3A | `active_rival_pirate_01_s03_clean_score` | 14m | clean competitive route | Navigation / Observation |
| L3B | `active_rival_pirate_01_s03_blood_score` | 14m | hostile competitive route | Agility / Strength |
| L4 | `active_rival_pirate_01_s04_hunter_net` | 16m | forced shared danger; first reconvergence | Observation / Charisma / Strength |
| L5A | `active_rival_pirate_01_s05_truce_debt` | 18m | cooperation/truce debt | — |
| L5B | `active_rival_pirate_01_s05_splinter_debt` | 18m | hostility/debt | Agility / Strength |
| L6 | `active_rival_pirate_01_s06_same_poster` | 18m | public comparison; second reconvergence | — |
| L7A | `active_rival_pirate_01_s07_friend_in_crossfire` | 18m | friendship-capable route | Navigation / Charisma |
| L7B | `active_rival_pirate_01_s07_race_for_the_bell` | 18m | competitive-respect route | Navigation / Agility |
| L7C | `active_rival_pirate_01_s07_knife_wake` | 18m | hostility route | Observation / Strength |
| L8 | `active_rival_pirate_01_s08_storm_shelter` | 16m | third reconvergence; History + Relationship resolution routing | — |
| L9A | `active_rival_pirate_01_s09_two_flags` | 12m | friendship terminal | — |
| L9B | `active_rival_pirate_01_s09_clean_horizon` | 12m | competitive-respect terminal | — |
| L9C | `active_rival_pirate_01_s09_parallel_wakes` | 12m | circumstantial-alliance terminal | — |
| L9D | `active_rival_pirate_01_s09_broken_bell` | 12m | hostility terminal | Strength / Agility |

```text
L1 Bell Claim
  |
  +12
  v
L2 Second Claim
  | clean / fair               | seize all
  v                            v
L3A Clean Score             L3B Blood Score
  \                            /
   +---------- +16 -----------+
                v
          L4 Hunter Net
           | cooperate        | betray/fail
           v                  v
      L5A Truce Debt     L5B Splinter Debt
           \                  /
            +------ +18 ------+
                    v
             L6 Same Poster
             /       |        \
       rel/high   neutral    rel/low
          v          v          v
     L7A Friend   L7B Race   L7C Knife
          \          |          /
           +------- +16 -------+
                    v
             L8 Storm Shelter
          / friend | respect | truce | hostile
         v         v         v        v
       L9A       L9B       L9C      L9D
```

## Branch / reconvergence audit

1. **L2 divergence** uses the actual lived Choice:
   - keep the original split / call a clean race → L3A;
   - seize the whole score → L3B.
2. **L3 reconverges** at L4.
3. **L4 divergence** is material:
   - successful cooperation or the History-gated callback to the original split → L5A;
   - betrayal/failure → L5B.
4. **L5 reconverges** at L6.
5. **L6 divergence** reacts to current Relationship:
   - `>= 18` unlocks the friendship route;
   - `<= -10` unlocks the hostility route;
   - unconditional clean-race/ignore options preserve resolvability and route to competitive respect.
6. **L7 reconverges** at L8.
7. **L8 terminal routing** reacts to both History and Relationship:
   - prior L7 friendship + Relationship `>= 18` → friendship;
   - Relationship `>= 0` → respect;
   - prior L7 hostility + Relationship `<= -8` → hostility;
   - unconditional one-night truce → circumstantial alliance.

No persistent branch variable exists. All route memory is History + current NPC Relationship.

## Relationship trajectory coverage

- **Friendship:** repeated clean dealing/cooperation, L7 rescue, then L8 `put_weapons_down_first` → `s09_two_flags`.
- **Competitive respect:** clean races, fair concessions, mutually acknowledged wins → `s09_clean_horizon`.
- **Circumstantial alliance:** neither trust nor hatred is required; L8 allows a bounded one-night truce → `s09_parallel_wakes`.
- **Hostility:** theft, betrayal, cheap shots and hostile History/Relationship → `s09_broken_bell`.

The hostile terminal sets the Rival NPC to `departed`; the other terminals leave the relationship persistent without forcing recruitment.

## Dice audit

Dice EventDefinitions: **9 / 16 = 56.25%**.

- `bell_claim`: 2 Dice approaches, threshold 11.
- `s03_clean_score`: 2 Dice approaches, threshold 14.
- `s03_blood_score`: 2 Dice approaches, threshold 14.
- `s04_hunter_net`: 3 Dice approaches, threshold 14.
- `s05_splinter_debt`: 2 Dice approaches, threshold 14.
- `s07_friend_in_crossfire`: 2 Dice approaches, threshold 14.
- `s07_race_for_the_bell`: 2 Dice approaches, threshold 14.
- `s07_knife_wake`: 2 Dice approaches, threshold 14.
- `s09_broken_bell`: 2 Dice approaches, threshold 17.

Risky failure changes concrete state: Relationship, Health, branch direction and/or Bounty exposure. Critical Failure is normally worse. The thread does not use automatic player Stat gains.

## Travel / Scheduled audit

- Seed is a broad on-land encounter; no tiny Location ID/tag/service is required.
- Every Scheduled node is geography-agnostic in eligibility and uses `scheduledReach: normal`.
- A due node therefore remains pending while the player occupies a Location that blocks normal Scheduled events, then can resolve after returning to a normal context.
- All Scheduled nodes use `priority: 100`.
- `cancelIf` removes pending thread callbacks if:
  - the player is no longer Pirate; or
  - the Rival is `dead`, `departed`, `unavailable`, or `crew`.
- No event requires a ship, crew, exact sea or exact Location.
- No Event moves the player, preventing this secondary thread from hijacking navigation.
- Nominal latest terminal is 376 ageMonths, leaving 44 months before the V1 horizon for ordinary scheduler drift.

## Dead-schedule / starvation audit

- Each resolved non-terminal outcome schedules **exactly one** next Rival Event.
- No outcome schedules two sibling Rival nodes.
- No node schedules itself or an ancestor.
- Terminal nodes schedule none.
- All Scheduled nodes share broad Active/Pirate eligibility and do not deadlock on geography.
- Every Event has at least one unconditional Choice.
- Conditional route Choices at L6/L8 are additive; they never remove the unconditional fallback action.
- A cancellation does not schedule a fallback Rival node; it cleanly terminates the pending Rival chain.
- Rival Scheduled nodes can be delayed by higher-priority/overdue mandatory content, but do not recursively enqueue while waiting.

## Crew audit

- No CrewRole Condition/actor/effect.
- Rival NPC has no intrinsic CrewRole.
- No `hasCrew` / `hasShip` coupling.
- No recruitment reward.
- No shipless crew-cap interaction.

## Reputation / Bounty audit

- **No negative Reputation Effect exists.**
- Reputation gains occur only for public feats or notable wins.
- Bounty is separate and increases only on explicitly criminal/escalatory actions such as cutting a claim line, taking a whole criminal score, using the Rival as bait, striking before an agreed count, or an infamous hostile finish.
- No Marine bounty logic is touched.
- No rank ladder or Pirate rank is authored.

## Canon audit

- Rival and supporting actors are original/generic.
- No canon character appears.
- No canon Location or major canonical outcome is required or changed.
- The player remains a competing Pirate captain in narrative interstices rather than replacing a canonical protagonist.

## Persistent systems audit

Not introduced or used:
- RivalState / Rival enum / Rival counter;
- QuestState / ArcState;
- new Flag;
- new Item;
- new CrewRole;
- organization/fleet state;
- profession state;
- second affiliation;
- career change;
- Bounty Hunter route.

## Localization

Complete FR + EN fragments are included for:
- NPC fallback name;
- all Event titles/bodies;
- all Choice labels;
- all deterministic and Dice Outcome text.

NPC copy uses `{{npc_active_rival_pirate_01_captain}}`, resolved by current persistent NPC interpolation.

## Integration files

- Runtime Events:
  - `src/game/content/events/v2/ordinary/ACTIVE_RIVAL_PIRATE_01/*.json`
- Manifest:
  - `docs/content/events/v2/batches/ACTIVE_RIVAL_PIRATE_01/MANIFEST.md`
- NPC insertion:
  - `src/game/content/catalogFactory.ts`
- Localization merge:
  - `src/game/localization/locales/fr.json`
  - `src/game/localization/locales/en.json`

The included `apply-active-rival-pirate-01.mjs` performs the low-volume NPC/localization integration plus file copies against a local checkout.

## Validation status

Package-local structural validation is provided by `validate-batch.mjs`.

Repository commands required after applying to a real checkout:

```bash
git diff --check
npm test
npm run validate-content
npm run build
```

These repository commands are **not claimed as executed by this worker package** unless reported separately after running against a local checkout.
