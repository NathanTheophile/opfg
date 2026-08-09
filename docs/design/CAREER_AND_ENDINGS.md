# OPFG — Career & Endings

> Status: **validated specialized design authority**.
> Scope: Active career, Reputation, Bounty, ranks/titles, Endings, final score and end screen.

## 1. Career affiliation

Family affiliation and active career affiliation are distinct.

- `player.profile.affiliationId` is the inherited/family affiliation chosen during Origins.
- Active career uses a separate career affiliation state.
- V1 careers: `civilian`, `pirate`, `marine`, `revolutionary`, `bounty_hunter`.
- Career changes happen only through authored Events.
- There is no generic “change career” action.
- Previous career history remains reconstructible after a change.

## 2. Reputation

Reputation is a dedicated persistent value, separate from D20 Stats.

- Range: `0..100`.
- Initial value: `0`.
- It may increase or decrease.
- It measures **quantity of notoriety**, not moral quality.
- Infamy can therefore produce very high Reputation.
- It is preserved across career changes.
- It never grants automatic Dice modifiers.
- It never silently promotes, grants a title, changes a bounty or changes career.
- Career milestones are always authored Events made eligible by Conditions such as `reputationAtLeast`.

There is no universal engine Reputation tier. Authoring cadence is career-specific.

### Pirate cadence

Pirates have no rigid rank ladder. As an authoring convention, a new bounty/progression Event can become plausible roughly every **9 Reputation points**, with ordinary gains often around +1/+2 and rare major jumps for exceptional feats.

### Ranked careers

Marine, Revolutionary and Bounty Hunter use rigid ladders. The first rank is obtained on entering the career; later promotion Events are distributed approximately through the `0..90` Reputation range. Large Reputation gains may make higher promotion Events eligible directly: sequential rank-by-rank promotion is not required.

## 3. Bounty

Bounty is independent from owned Berrys.

- Persistent integer `>= 0`, no artificial maximum.
- May apply to any career, including Revolutionaries and former criminals.
- Persists across career changes until an Event explicitly changes/clears it.
- Displayed separately under the main career rank/title whenever `bounty > 0`.
- Preserve `maxBounty` for final reporting and fun facts.

## 4. Rank and title presentation

The career UI has a main status line plus a separate bounty line when wanted.

### Pirate

- No rigid rank.
- One active custom Career Title may be displayed.
- A later Event may replace it.
- Previous titles remain discoverable through History.

### Civilian

- No rigid rank.
- One active custom Career Title may be displayed.
- Civilian lives can represent merchants, explorers, navigators, doctors, local heroes, notable citizens, etc. through Events + titles rather than adding a career for every profession.

### Marine — compressed V1 ladder

OPFG deliberately compresses the larger canon Marine hierarchy to **10 progression ranks** while keeping canon rank names:

1. `marine_recruit` — Recrue
2. `marine_petty_officer` — Officier marinier
3. `marine_lieutenant` — Lieutenant
4. `marine_commander` — Commandant
5. `marine_captain` — Capitaine
6. `marine_commodore` — Commodore
7. `marine_rear_admiral` — Contre-amiral
8. `marine_vice_admiral` — Vice-amiral
9. `marine_admiral` — Amiral
10. `marine_fleet_admiral` — Amiral en chef

This is a gameplay compression, not a claim that intermediary canon ranks do not exist.

### Revolutionary — V1 ladder

Rigid 5-rank progression, intentionally more distinctive while remaining a conventional organizational ladder:

1. `revolutionary_recruit` — Recrue
2. `revolutionary_agent` — Agent
3. `revolutionary_operator` — Opérateur
4. `revolutionary_officer` — Officier
5. `revolutionary_regional_commander` — Commandant régional

This is an OPFG progression abstraction. Canon Revolutionary organization remains the lore reference for named leadership roles.

### Bounty Hunter — V1 ladder

1. `bounty_hunter_novice` — Novice
2. `bounty_hunter_tracker` — Traqueur
3. `bounty_hunter_confirmed` — Chasseur confirmé
4. `bounty_hunter_elite` — Chasseur d’élite
5. `bounty_hunter_master` — Maître chasseur

These ranks represent professional recognition, not a newly invented worldwide guild.

## 5. Historical progression

- Old ranks cease to be the active displayed rank after leaving the organization.
- Highest rank reached remains reconstructible/persisted for final reporting.
- Old titles remain in History.
- Bounty remains until an Event changes it.

## 6. Leadership

No Career Leadership stat exists.

The existing structural `isLeader` permission remains independent from Reputation, rank, title and career. Events may change leadership narratively.

## 7. Endings

Ending resolution is hybrid.

1. An authored Event terminates the run / selects an Ending family.
2. The engine selects the exact Ending variant using final state and deterministic Conditions, with score-based fallback.

Selection may consider:

- final career;
- Reputation;
- rank/title;
- current and maximum bounty;
- Stats;
- Haki;
- Devil Fruit / Awakening;
- crew and important NPC relationships;
- wealth/assets;
- Traits;
- History / major accomplishments;
- death/survival context.

### Ending inventory target

- About **5 base Endings per career** for launch.
- Universal Endings may also exist: death, disappearance, generic retirement, etc.
- Each base Ending supports **4 narrative variants** by default.
- Variants are selected through explicit Conditions + score fallback, not only by total score.
- A death can still produce a perfect or legendary run and may score `100/100`.

## 8. Power evaluation

Do not create a persistent `powerLevel`.

Ending/final-screen power is derived from existing Stats, Haki, Devil Fruit, Awakening and other relevant persistent state.

## 9. Final score

Global score is separate from Reputation and ranges `0..100`.

The same six top-level axes apply to all careers, while the **Career Accomplishment** axis is computed differently by career.

| Axis | Weight |
| --- | ---: |
| Reputation | 20 |
| Career accomplishment | 25 |
| Power | 20 |
| Relationships / Crew | 15 |
| Fortune / Assets | 10 |
| Legacy / Ending | 10 |
| **Total** | **100** |

### Axis interpretation

- **Reputation:** final notoriety `/100`.
- **Career accomplishment:** career-specific rank/title/bounty/exploits and relevant History.
- **Power:** derived from Stats + Powers; no new Power stat.
- **Relationships / Crew:** crew plus important NPC relationships and final state of close allies.
- **Fortune / Assets:** Berrys + ship + cargo/important owned items.
- **Legacy / Ending:** outcome quality and major lasting accomplishments.

Moral Traits do not directly add/remove score. A ruthless or infamous life can still score highly if it is accomplished.

## 10. Final screen

Always shown, including after death.

Must display at least:

- global score `/100`;
- textual appreciation/tier;
- Reputation `/100` separately;
- Ending title and variant;
- deterministic 5–8 moment life summary;
- run statistics;
- deterministic fun facts.

## 11. Summary & fun facts

- No runtime LLM required.
- Summary is derived from History + final state.
- Prefer deriving trivia from existing data rather than adding many lifetime counters.
- Accepted dedicated helper: `maxBounty`.
- No dedicated `maxReputation` required.
- Highest rank reached must remain available/reconstructible.
