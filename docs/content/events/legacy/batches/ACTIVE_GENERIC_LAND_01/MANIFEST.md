# ACTIVE_GENERIC_LAND_01

Scope: Active V1 — Generic Land. Exactly 20 one-shot Normal roots; Immediate and Scheduled definitions are additional.

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal |
|---|---|---|---|
| `active_generic_land_01_courtyard_sinkhole` | `courtyardSinkhole` | 15+ | isOnLand + urban/village/rural |
| `active_generic_land_01_switchback_rockslide` | `switchbackRockslide` | 15+ | isOnLand + mountain |
| `active_generic_land_01_forest_snare_line` | `forestSnareLine` | 15+ | isOnLand + forest |
| `active_generic_land_01_tainted_well` | `taintedWell` | 15+ | isOnLand + village/rural |
| `active_generic_land_01_false_safety_record` | `falseSafetyRecord` | 15+ | isOnLand + urban/village/rural/industrial |
| `active_generic_land_01_withheld_wages` | `withheldWages` | 15+ | isOnLand + food/lodging/general_goods/industrial |
| `active_generic_land_01_clinic_debt` | `clinicDebt` | 15+ | isOnLand + medical service |
| `active_generic_land_01_water_diversion` | `waterDiversion` | 15+ | isOnLand + rural/agricultural |
| `active_generic_land_01_shared_passage_lockout` | `sharedPassageLockout` | 15+ | isOnLand + urban/village |
| `active_generic_land_01_storm_shelter_limit` | `stormShelterLimit` | 15+ | isOnLand + wilderness/rural/mountain |
| `active_generic_land_01_crowd_bottleneck` | `crowdBottleneck` | 15+ | isOnLand + urban/entertainment |
| `active_generic_land_01_backroom_violence` | `backroomViolence` | 15+ | isOnLand + criminal |
| `active_generic_land_01_frozen_pump` | `frozenPump` | 15+ | isOnLand + snow |
| `active_generic_land_01_tree_boundary` | `treeBoundary` | 15+ | isOnLand + forest/rural |
| `active_generic_land_01_unsafe_bridge_warning` | `unsafeBridgeWarning` | 15+ | isOnLand + wilderness/rural/mountain |
| `active_generic_land_01_isolated_emergency_store` | `isolatedEmergencyStore` | 15+ | isOnLand + isolated |
| `active_generic_land_01_retaining_wall_dispute` | `retainingWallDispute` | 15+ | isOnLand + urban/village |
| `active_generic_land_01_inspection_bribe` | `inspectionBribe` | 15+ | isOnLand + marine_presence/government |
| `active_generic_land_01_paid_room_storm` | `paidRoomStorm` | 15+ | isOnLand + lodging service |
| `active_generic_land_01_overloaded_pack_animal` | `overloadedPackAnimal` | 15+ | isOnLand + rural/village |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `active_generic_land_01_courtyard_sinkhole`  
**arcKey:** `courtyardSinkholeRescue`  
**Maximum reachable Immediate depth:** **5**  
**Premise:** Un affaissement de cour ouvre une ancienne citerne ; la scène enchaîne dégagement, sauvetage au bord, ancrage défaillant, montée d’eau, intrusion du propriétaire puis sécurisation finale sans ellipse.

## SECONDARY_IMMEDIATE_ARCS

- active_generic_land_01_switchback_rockslide — **arcKey:** switchbackRockslideCascade — **depth 3** — Une route de montagne part en éboulement : victime coincée, seconde coulée puis décision de fermeture/réouverture.
- active_generic_land_01_forest_snare_line — **arcKey:** forestSnareConfrontation — **depth 3** — Une ligne de pièges blesse un voyageur, fait revenir le poseur puis oblige à décider du sort des pièges restants.
- active_generic_land_01_tainted_well — **arcKey:** taintedWellResponsibility — **depth 3** — Une contamination de puits devient conflit d’usage, identification de la fuite puis décision de responsabilité et de réouverture.

## LIFETIME_THREADS

### active_generic_land_01_false_safety_record — witnessStatementNetwork
**Ancre durable:** Chaîne informelle de témoignages, copies et méthodes de vérification née d’un rapport de blessure falsifié ; continuité reconstruite uniquement via History et scheduling vertical, sans NPC, Item, Flag, organisation persistante ni état de thread nouveau.  
**Longest reachable Scheduled depth:** 14  
**Total distinct reachable Scheduled EventDefinitions:** 26  
**Vrais points de divergence long-terme:** 3 — S1 public vs copies protégées ; S8 réunion publique vs médiation privée vs retrait ; S17 mémoire ouverte vs cercle privé vs terminaison.  
**Topologie:** `strongly_branching` — deux splits reconvergent seulement après 2–3 chapitres distincts ; le troisième est persistant et terminal avec deux branches de 4 chapitres sans reconvergence + une terminaison courte.  
**Span visé:** Environ 15–18 ans sur les chemins les plus longs, avec délais de 9 à 18 mois ; portable entre Locations et Careers, mais chaque chapitre physique attend `isOnLand`.

### Lifetime topology

```text
Seed -> S1
S1 -> A1 -> A2 -> A3 -> S8
   -> B1 -> B2 -> B3 -> S8
S8 -> P1 -> P2 -> P3 -> S16
   -> M1 -> M2 --------> S16
   -> Q1 -> Q2 --------> S16
S16 -> S17
S17 -> R1 -> R2 -> R3 -> R4 (terminal)
    -> S1p -> S2p -> S3p -> S4p (terminal)
    -> T1 (terminal)
```

Verticalité: chaque Outcome ne programme que son descendant direct. Aucun pré-queue global. La seed Active reste un Normal one-shot sans garantie spéciale de sélection.

## EVENT_LISTS

### Roots (20)
- `active_generic_land_01_backroom_violence`
- `active_generic_land_01_clinic_debt`
- `active_generic_land_01_courtyard_sinkhole`
- `active_generic_land_01_crowd_bottleneck`
- `active_generic_land_01_false_safety_record`
- `active_generic_land_01_forest_snare_line`
- `active_generic_land_01_frozen_pump`
- `active_generic_land_01_inspection_bribe`
- `active_generic_land_01_isolated_emergency_store`
- `active_generic_land_01_overloaded_pack_animal`
- `active_generic_land_01_paid_room_storm`
- `active_generic_land_01_retaining_wall_dispute`
- `active_generic_land_01_shared_passage_lockout`
- `active_generic_land_01_storm_shelter_limit`
- `active_generic_land_01_switchback_rockslide`
- `active_generic_land_01_tainted_well`
- `active_generic_land_01_tree_boundary`
- `active_generic_land_01_unsafe_bridge_warning`
- `active_generic_land_01_water_diversion`
- `active_generic_land_01_withheld_wages`

### Immediate (14)
- `active_generic_land_01_courtyard_sinkhole_i1_hanging_edge`
- `active_generic_land_01_courtyard_sinkhole_i2_bad_anchor`
- `active_generic_land_01_courtyard_sinkhole_i3_rising_water`
- `active_generic_land_01_courtyard_sinkhole_i4_owner_pushes_in`
- `active_generic_land_01_courtyard_sinkhole_i5_close_the_gap`
- `active_generic_land_01_forest_snare_line_i1_trapped_traveler`
- `active_generic_land_01_forest_snare_line_i2_trapper_arrives`
- `active_generic_land_01_forest_snare_line_i3_remaining_snares`
- `active_generic_land_01_switchback_rockslide_i1_pinned_ankle`
- `active_generic_land_01_switchback_rockslide_i2_second_slide`
- `active_generic_land_01_switchback_rockslide_i3_path_decision`
- `active_generic_land_01_tainted_well_i1_residents_argue`
- `active_generic_land_01_tainted_well_i2_leaking_barrel`
- `active_generic_land_01_tainted_well_i3_cleanup_decision`

### Scheduled (30)
- `active_generic_land_01_clinic_debt_return`
- `active_generic_land_01_inspection_fee_followup`
- `active_generic_land_01_lt_01_second_statement`
- `active_generic_land_01_lt_08_crossroads_request`
- `active_generic_land_01_lt_16_common_return`
- `active_generic_land_01_lt_17_what_to_keep`
- `active_generic_land_01_lt_a1_public_names`
- `active_generic_land_01_lt_a2_copy_reaches_far`
- `active_generic_land_01_lt_a3_public_backlash`
- `active_generic_land_01_lt_b1_anonymous_copies`
- `active_generic_land_01_lt_b2_quiet_verification`
- `active_generic_land_01_lt_b3_missing_signature`
- `active_generic_land_01_lt_m1_private_table`
- `active_generic_land_01_lt_m2_compromise_line`
- `active_generic_land_01_lt_p1_open_room`
- `active_generic_land_01_lt_p2_conflicting_accounts`
- `active_generic_land_01_lt_p3_public_cost`
- `active_generic_land_01_lt_q1_closed_door`
- `active_generic_land_01_lt_q2_last_witness`
- `active_generic_land_01_lt_r1_open_archive`
- `active_generic_land_01_lt_r2_imitation_risk`
- `active_generic_land_01_lt_r3_distant_reference`
- `active_generic_land_01_lt_r4_public_legacy`
- `active_generic_land_01_lt_s1_private_circle`
- `active_generic_land_01_lt_s2_selective_request`
- `active_generic_land_01_lt_s3_favoritism_test`
- `active_generic_land_01_lt_s4_quiet_legacy`
- `active_generic_land_01_lt_t1_end_letters`
- `active_generic_land_01_shared_passage_followup`
- `active_generic_land_01_withheld_wages_collective_reply`

## PERSISTENT_IDS_USED

- Traits queried only: `protective`, `resourceful`, `suspicious`, `cautious`, `rebellious`, `generous`.
- Existing Items: None.
- Existing persistent NPCs: None.
- Flags: None.
- Ships / Crew / Devil Fruits / Haki: None.
- Career affiliations/ranks/titles/endings changed: None.
- Bounty changes: None.
- Reputation is modified only by explicitly public/notable acts, generally +1/+2, with one +3 exceptional rescue/intervention outcome.
- Berrys: only authored local payments/expenses (`withheld_wages`, `clinic_debt`, `overloaded_pack_animal` and their direct follow-ups).

## DEPENDENCIES
None. The batch references only V1 schema/catalog IDs and History of its own EventDefinitions.

## CAREER_RANK_TITLE_BOUNTY_CONTEXT
Career-neutral. No career change, rank, title, bounty or ending effect. Family affiliation is not queried.

## SHIP_CREW_POWERS_CONTEXT
None. No ship acquisition/sale/repair, Crew role, Devil Fruit distribution/awakening or Haki change.

## TIMELINE_CANON
All roots require `careerPhaseIs(active)` + `ageAtLeastMonths(180)`. No canon character, canon organization outcome or time-sensitive canon event is used. Scenes occupy peripheral local life and remain compatible with the protected canon policy.

## DICE_STATS_TRAITS_LOCATIONS_COVERAGE

- Roots with DiceCheck: 10/20 (`courtyard_sinkhole`, `switchback_rockslide`, `forest_snare_line`, `tainted_well`, `withheld_wages`, `water_diversion`, `storm_shelter_limit`, `crowd_bottleneck`, `backroom_violence`, `frozen_pump`).
- D20 Stats used on roots: `observation`, `strength`, `agility`, `intelligence`, `charisma`, `morale`. `health` is never used as a Dice stat.
- Thresholds used: 11 and 14; all Dice resolutions define exactly criticalFailure/failure/success/criticalSuccess.
- Trait-gated visible choices use `availableIf`; no Trait is granted or removed.
- Location vocabulary used: tags `urban`, `village`, `rural`, `industrial`, `mountain`, `forest`, `agricultural`, `wilderness`, `entertainment`, `criminal`, `snow`, `isolated`, `marine_presence`, `government`; services `food`, `lodging`, `general_goods`, `medical`.
- Every root includes `isOnLand`; no `locationIs` is used. Contextual roots rely on controlled tags/services only.

## SCHEDULED_OUTSIDE_LIFETIME

- `active_generic_land_01_withheld_wages` -> `active_generic_land_01_withheld_wages_collective_reply` (+2 months).
- `active_generic_land_01_clinic_debt` -> `active_generic_land_01_clinic_debt_return` (+4 months).
- `active_generic_land_01_shared_passage_lockout` -> `active_generic_land_01_shared_passage_followup` (+3 months).
- `active_generic_land_01_inspection_bribe` -> `active_generic_land_01_inspection_fee_followup` (+2 months).
All four remain pending while `isOnLand` is false; no permanent invalidation condition exists, so no `cancelIf`/fallback is required.

## MOVEMENT_COVERAGE

- Known ingress: None.
- Known egress: None.
- Parent/sub-location transitions: None.
- Gated/special transitions: None.
- Rare cross-route transitions: None.
- Contribution to normal travel movement/recovery: None.
- `moveToLocation`, `recoverTravel`, `dead_end_on_land` and `dead_end_at_sea` are not used.

## DEDUP_NOTES

- `courtyardSinkhole` is a subsurface civic collapse/rescue, not a reskin of Childhood runaway carts, counterweights, icefall, narrow-stair carrying or roof-load scenes.
- `switchbackRockslide` is an adult multi-stage mountain emergency, not the rotated milestone, loose pathstones or ordinary road-maintenance Childhood premises.
- `forestSnareLine` centers a human-made hidden hazard, an injured traveler and confrontation with the trapper; it is distinct from boar crossing, barking dog and fallen-nest Childhood scenes.
- `taintedWell` is contamination investigation plus communal shutdown/responsibility, not water-cask handling, saltwater backflow or simple supply chores.
- `falseSafetyRecord` is an adult workplace-falsification and witness-network Lifetime. It is not the household debt ledger, chain of favors, traveling notebook, living atlas, signal legacy, saltwind practice or contested historical-memory threads already accepted.
- `withheldWages` concerns real adult compensation and collective leverage, distinct from Childhood shared credit, work-for-supper and delegated-counter responsibility.
- `inspectionBribe` concerns an invented local fee and witness response, not Childhood drills, notice-board disputes or bounty-board interpretation.
- Remaining roots were checked against accepted Childhood premises for adult responsibility, geography and causal stakes rather than age-up reskins.

## INTEGRATION_CHECKS

- Content schema target: 6.
- Active cadence contract: 2 slots/month. A Normal/Scheduled root plus its full Immediate chain consumes one slot total; this batch adds no time-changing Effects.
- Exactly 20 `kind: normal` roots; all are one-shot by V1 Normal-selection rules.
- Signature d5: 1. Secondary d3: 3 distinct other roots.
- Lifetime: 26 reachable Scheduled nodes, longest path 14, 3 meaningful long-term divergences, strict vertical scheduling.
- No silent persistent definitions. `PROPOSED_DEFINITIONS.md` = None.
- No `recoverTravel`, dead-end fallback Event, `weight`, cooldown, repetition field, ArcState/thread state, route state, invented Condition or invented Effect.
- FR localization file contains only keys introduced by this batch.
