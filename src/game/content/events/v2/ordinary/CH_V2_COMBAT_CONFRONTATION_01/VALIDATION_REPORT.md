# VALIDATION REPORT — CH_V2_COMBAT_CONFRONTATION_01 — ADJUST PASS

## Snapshot

- HEAD used by the standalone authoring package: `17eaade6661b28b4c338b604dc10a67a87396468`
- Content Schema observed during authoring: `14`
- Save generation observed: `21`
- Delivery mode: standalone package; no repository integration.
- Corrective basis: `REVIEW_CH_V2_COMBAT_CONFRONTATION_01(1).md` — verdict **ADJUST**.

## Static package checks

**Verdict: PASS**

- EventDefinition files: **78**
- Normal roots: **20**
- Immediate nodes: **38**
- Scheduled Lifetime nodes: **20**
- Duplicate Event IDs: **0**
- Event filename / EventId mismatch: **0**
- Missing FR referenced keys: **0**
- Missing EN referenced keys: **0**
- FR/EN keyset mismatch: **0**
- Missing Immediate targets: **0**
- Missing Scheduled targets: **0**
- Immediate cycles: **0**
- Scheduled cycles: **0**

## Corrective review gates

- FR outcome keys: **306 / 306 unique** — PASS
- EN outcome keys: **306 / 306 unique** — PASS
- Exact repeated FR outcome strings: **0** — PASS
- Root Dice choices: **24**
- Dice `failure` outcomes with only queue/schedule effects: **0 / 24** — PASS
- Dice failures preserve **0 progression on the rolled Stat**; added costs use Health, Morale or `childhood_friend` Relationship depending on scene.
- Dice critical-success prose is distinct on **24/24** checks.
- CriticalSuccess has an additional mechanical relationship benefit on **2/24** checks (the recurring friend seed only); other CS differences remain fiction-first to avoid reward inflation.
- Two surrender/retreat choices that could not truthfully enter the shared Immediate now terminate: `cornered_tag/accept_tag`, `hand_over_token/drop_token`.

## Dedicated quota checks

- Direct adversarial roots: **14 / 20** — PASS
- Training/sparring roots: **6 / 20**
- Root Dice Events: **12 / 20 = 60%** — PASS
- Root Dice composition: **STR 9, AGI 9, OBS 3, INT 3** — PASS
- Mini-arc roots: **20 / 20** — PASS
- Depth 2+ roots: **16** — PASS
- Depth 3 roots: **2** — PASS
- Health-risk roots: **16** — PASS
- Roots with Strength gain: **18** — PASS
- Roots with Agility gain: **20** — PASS
- Combined branch-neutral STR+AGI positive budget: **64.7%** — PASS
- Strength budget: **13.333**
- Agility budget: **20.333**
- Strength below Agility by **34.4%** — still inside the dedicated ~35% asymmetry guard.

### Positive branch-neutral budget after mapping corrections

| Stat | Budget |
|---|---:|
| Strength | 13.333 |
| Agility | 20.333 |
| Observation | 6.333 |
| Intelligence | 2.667 |
| Morale | 7.333 |
| Charisma | 2.000 |
| **Total** | **52.000** |

Mapping changes deliberately reduce artificial Strength pressure:

- `water_cup_bully/carry_between`: **Strength +1 → Morale +1**;
- `water_cup_bully_i03/twist_rim`: **Strength +1 → Agility +1**;
- `moving_target_drill`, `padded_stick_mark_i01`, `sleeve_grip_i01`, `younger_surrounded_i01` keep Strength only after the Choice/action copy was rewritten to show real resisted contact;
- Lifetime `s02/control` keeps Strength because the Event now explicitly plays the ground-hold session before awarding progression.

## Lifetime checks

- Primary Lifetime seeds: **1** — PASS
- Anchor: `childhood_friend`
- Distinct Scheduled EventDefinitions: **20**
- Longest reachable Scheduled path: **14**
- Structural divergences: **3**
- Nested unresolved structural divergence: **0 by authored topology**
- Lifetime outcomes and selected chapter bodies were rewritten to foreground letters, jokes, bruises, names, remembered objects and the friendship rather than instructional combat language.

## Text / localization checks

- Root FR bodies: **26–33 words**
- Immediate FR bodies: **23–35 words**
- Scheduled FR bodies: **28–44 words**
- Choice labels: **2–10 words**
- Outcome texts: **19–34 words**
- Old repeated template phrases (`verrouiller la situation`, `rapport de force`, `changer d’angle`, `imposer assez d’espace`, `reset`) in FR outcomes: **0**.

## Repository-wide integration gate

The package-local checks above were executed. The following repository commands could **not** be executed in this isolated sandbox because the repository checkout is not mounted and outbound Git access is unavailable:

```bash
npm test
npm run validate-content
npm run build
```

They remain mandatory after copying the adjusted package into the current `dev` tree.
