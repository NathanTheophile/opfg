# CH_V2_GENERIC_LATE_01 — MANIFEST

## Source of truth

- Repository: `NathanTheophile/opfg`
- Branch reviewed: `dev`
- HEAD used for authoring: `3aa3b197b027c4508bb628c03d1c1dfd34acc829`
- Runtime content contract: **Content Schema 14**.
- Package generated outside the repository. No commit, merge, branch update or shared-file modification was performed.
- Coordination lock from the `GO AUTHORING` brief is treated as authoritative over the earlier seed pool.

Authorities reread at that HEAD: `AGENTS.md`, `docs/GAME_DESIGN.md`, `docs/design/MAJOR_NARRATIVE_TRACKS.md`, `docs/design/WORLD_TIMELINE_AND_CANON.md`, `docs/content/EVENT_AUTHORING_RULES.md`, `docs/content/CONTENT_BIBLE.md`, `docs/content/TRAITS_CATALOG.md`, `docs/content/events/v2/CHILDHOOD_V2_BATCH_CONTRACT.md`, `docs/content/events/v2/EVENT_CONCEPT_INDEX_V2.md`, `docs/content/events/migration/V2_CONCEPT_MIGRATION_LEDGER.md`, `docs/LOCALIZATION.md`, `src/game/content/schema.ts`, `src/game/content/catalogFactory.ts`, and the relevant runtime selection/effect/validation code.

## Batch scope

- Batch ID: `CH_V2_GENERIC_LATE_01`
- Event prefix: `ch_v2_generic_late_01_`
- Territory: ordinary Childhood, primarily **108–174 ageMonths / ages 9–14**.
- Dramatic engine: increasing autonomy, entrusted responsibility, small paid work, money/objects under custody, promises, secrets, mistakes, temptation, local authority, and decisions with memorable consequences.
- This batch is **not** a Major Narrative Track. Every root has `majorTrack` absent.
- Exactly one secondary Lifetime Thread is authored: **La chaîne des petits services**. No selector/runtime guarantee was added.

### Coordination lock compliance

Kept as final roots: `chain_of_favors`, `quiet_counter`, `missing_token`, `closing_bell`, `puppet_case`.

`after_hours_repair` is retained only in the authorized transformed form: **the player personally broke the mechanism and must repair or confess the fault**.

The two overlapping trial/learning seeds were fused into the single root `apprenticeship_trial`.

Explicitly not produced as roots: `borrowed_bucket`, `harbor_signals`, `broken_pane`, `small_delivery`, `storm_shutters`, `spilled_bucket`, `storm_banner`, `lost_button`, `borrowed_broom`.

## Package contents

- **20** Normal roots.
- **20** Immediate EventDefinitions.
- **19** Scheduled EventDefinitions.
- **59** EventDefinitions total.
- **570** French localization keys in `localization/fr.fragment.json`.
- No `en.fragment.json`: French is the source locale and the package does not ship a partial English translation.
- No `PROPOSED_DEFINITIONS.md`: no new persistent definition is required.

## Root registry

| Root ID | Age months | Context | Dice choices | Max Immediate depth | Core premise |
|---|---:|---|---:|---:|---|
| `ch_v2_generic_late_01_after_hours_repair` | 132–179 | universel | 2 | 2 | Pendant une tâche, tu as forcé un petit mécanisme jusqu’à le casser. Le lieu vient de fermer et le responsable revient bientôt chercher ses clés |
| `ch_v2_generic_late_01_apprenticeship_trial` | 108–179 | universel | 2 | 2 | Un artisan te laisse une seule après-midi d’essai. Une vraie commande attend sur l’établi, avec assez de matière pour deux tentatives seulement |
| `ch_v2_generic_late_01_blurred_tally` | 120–179 | service `trade` ou service `general_goods` ou service `food` | 2 | 0 | Une éclaboussure traverse le relevé d’un petit stock. Trois quantités deviennent illisibles alors que les caisses correspondantes sont encore devant toi |
| `ch_v2_generic_late_01_chain_of_favors` | 108–126 | universel | 0 | 0 | Le marchand du quartier rattache gratuitement la sangle du panier que tu as abîmé en rangeant son étal. Quand tu sors quelques Berrys, il repousse ta main : « Garde-les. Aide quelqu’un d’autre quand ce sera utile. » |
| `ch_v2_generic_late_01_closing_bell` | 108–167 | universel | 2 | 1 | Pour la première fois, on t’a confié la cloche qui arrête deux activités locales à heure fixe. Tu remarques le soleil trop bas : si tu tardes encore, certains seront payés ou libérés à la mauvaise heure. |
| `ch_v2_generic_late_01_commission_advance` | 120–179 | universel | 0 | 0 | Un adulte te confie une petite commission et avance une partie du paiement. Le travail peut être fini ce soir, mais l’argent est déjà dans ta main et une dépense personnelle tentante se trouve juste à côté. |
| `ch_v2_generic_late_01_community_box` | 120–179 | universel | 0 | 0 | On te confie pour une heure une petite boîte d’argent destinée à une dépense commune. Un adulte te demande d’en emprunter quelques pièces pour une urgence et jure de les rendre demain. |
| `ch_v2_generic_late_01_keyring_claimant` | 120–179 | universel | 2 | 1 | Un gardien te laisse son trousseau pendant qu’il s’absente. Un adulte arrive, désigne la bonne réserve et affirme qu’il a toujours accès à cette porte |
| `ch_v2_generic_late_01_market_price_shift` | 108–179 | service `food` ou service `general_goods` ou service `trade` | 2 | 1 | On t’a confié une liste et juste assez d’argent. Au comptoir, le total dépasse la somme remise |
| `ch_v2_generic_late_01_mislabeled_crate` | 108–179 | service `trade` ou service `general_goods` ou service `food` | 2 | 2 | Tu dois préparer trois caisses pour deux livraisons locales. L’une porte le bon sceau mais le mauvais nom par rapport au bordereau |
| `ch_v2_generic_late_01_missing_token` | 108–179 | universel | 2 | 2 | Le jeton qui prouve ta course glisse dans un tas de copeaux juste avant le retour du donneur d’ordre. Sans lui, tu ne peux pas prouver ce que tu as payé ni récupérer la consigne. |
| `ch_v2_generic_late_01_private_letter` | 132–179 | universel | 0 | 0 | Un travailleur local te tend une lettre et avoue à voix basse qu’il ne sait pas la lire. Deux personnes attendent à proximité |
| `ch_v2_generic_late_01_promised_shift` | 132–179 | universel | 0 | 0 | Tu as promis de couvrir la dernière demi-heure d’un poste local. Au même moment, quelqu’un propose une petite course payée qui doit partir immédiatement |
| `ch_v2_generic_late_01_puppet_case` | 120–179 | tag `entertainment` ou tag `urban` ou service `trade` | 2 | 3 | Un montreur de rue te confie sa malle pendant son numéro. Deux mains différentes reviennent près du loquet chaque fois que la foule rit |
| `ch_v2_generic_late_01_queue_steward` | 120–179 | service `food` ou service `general_goods` ou service `trade` | 2 | 2 | On te confie une pile de tickets pour distribuer un stock limité. Deux adultes présentent soudain le même numéro et chacun affirme être arrivé le premier |
| `ch_v2_generic_late_01_quiet_counter` | 108–167 | service `food` ou service `general_goods` ou service `trade` | 2 | 2 | Le marchand du quartier te laisse le comptoir cinq minutes. Un client pose un paquet, réclame un échange non prévu et affirme qu’on lui a toujours fait confiance ici. Une mauvaise décision peut coûter la marchandise. |
| `ch_v2_generic_late_01_reserved_stock` | 120–179 | service `food` ou service `general_goods` ou service `trade` | 0 | 0 | Tu as promis de garder le dernier lot jusqu’au retour d’un client. Avant l’heure prévue, un autre acheteur propose plus cher et pose déjà les Berrys sur le comptoir. |
| `ch_v2_generic_late_01_returned_change` | 108–179 | universel | 0 | 0 | Un vendeur pressé te rend nettement trop de monnaie puis se tourne vers le client suivant. Personne ne semble avoir remarqué l’erreur |
| `ch_v2_generic_late_01_sealed_envelope` | 120–179 | universel | 2 | 2 | Une voisine te confie une enveloppe scellée à remettre au coucher du soleil. Bien avant l’heure, un adulte inconnu donne le bon prénom du destinataire et affirme qu’il doit récupérer la lettre maintenant. |
| `ch_v2_generic_late_01_unequal_wage_offer` | 132–179 | universel | 0 | 0 | Après un travail ponctuel, le responsable te tend un paiement supérieur à celui annoncé et murmure de ne pas en parler aux autres travailleurs. L’argent est réel |

## Root coverage audit

- Universal/no-location-context roots: **13/20**.
- Context-restricted roots: **7/20**; they are additive breadth, not safety anchors.

### Restrictive eligibility and fallback coverage

- `ch_v2_generic_late_01_blurred_tally` — service `trade` ou service `general_goods` ou service `food`.
- `ch_v2_generic_late_01_market_price_shift` — service `food` ou service `general_goods` ou service `trade`.
- `ch_v2_generic_late_01_mislabeled_crate` — service `trade` ou service `general_goods` ou service `food`.
- `ch_v2_generic_late_01_puppet_case` — tag `entertainment` ou tag `urban` ou service `trade`.
- `ch_v2_generic_late_01_queue_steward` — service `food` ou service `general_goods` ou service `trade`.
- `ch_v2_generic_late_01_quiet_counter` — service `food` ou service `general_goods` ou service `trade`.
- `ch_v2_generic_late_01_reserved_stock` — service `food` ou service `general_goods` ou service `trade`.

Fallback/safety coverage is provided by the universal roots rather than by a dedicated fallback Event. No exact Location, Race, inherited affiliation, family structure, social class, Item, NPC relationship, or prior-History requirement is necessary to keep the generic pool alive.

### Ordinary-slot coverage checkpoints

| ageMonths | Eligible roots from this batch | Count |
|---:|---|---:|
| 108 | `ch_v2_generic_late_01_apprenticeship_trial`, `ch_v2_generic_late_01_chain_of_favors`, `ch_v2_generic_late_01_closing_bell`, `ch_v2_generic_late_01_market_price_shift`, `ch_v2_generic_late_01_mislabeled_crate`, `ch_v2_generic_late_01_missing_token`, `ch_v2_generic_late_01_quiet_counter`, `ch_v2_generic_late_01_returned_change` | 8 |
| 114 | `ch_v2_generic_late_01_apprenticeship_trial`, `ch_v2_generic_late_01_chain_of_favors`, `ch_v2_generic_late_01_closing_bell`, `ch_v2_generic_late_01_market_price_shift`, `ch_v2_generic_late_01_mislabeled_crate`, `ch_v2_generic_late_01_missing_token`, `ch_v2_generic_late_01_quiet_counter`, `ch_v2_generic_late_01_returned_change` | 8 |
| 120 | `ch_v2_generic_late_01_apprenticeship_trial`, `ch_v2_generic_late_01_blurred_tally`, `ch_v2_generic_late_01_chain_of_favors`, `ch_v2_generic_late_01_closing_bell`, `ch_v2_generic_late_01_commission_advance`, `ch_v2_generic_late_01_community_box`, `ch_v2_generic_late_01_keyring_claimant`, `ch_v2_generic_late_01_market_price_shift`, `ch_v2_generic_late_01_mislabeled_crate`, `ch_v2_generic_late_01_missing_token`, `ch_v2_generic_late_01_puppet_case`, `ch_v2_generic_late_01_queue_steward`, `ch_v2_generic_late_01_quiet_counter`, `ch_v2_generic_late_01_reserved_stock`, `ch_v2_generic_late_01_returned_change`, `ch_v2_generic_late_01_sealed_envelope` | 16 |
| 126 | `ch_v2_generic_late_01_apprenticeship_trial`, `ch_v2_generic_late_01_blurred_tally`, `ch_v2_generic_late_01_chain_of_favors`, `ch_v2_generic_late_01_closing_bell`, `ch_v2_generic_late_01_commission_advance`, `ch_v2_generic_late_01_community_box`, `ch_v2_generic_late_01_keyring_claimant`, `ch_v2_generic_late_01_market_price_shift`, `ch_v2_generic_late_01_mislabeled_crate`, `ch_v2_generic_late_01_missing_token`, `ch_v2_generic_late_01_puppet_case`, `ch_v2_generic_late_01_queue_steward`, `ch_v2_generic_late_01_quiet_counter`, `ch_v2_generic_late_01_reserved_stock`, `ch_v2_generic_late_01_returned_change`, `ch_v2_generic_late_01_sealed_envelope` | 16 |
| 132 | `ch_v2_generic_late_01_after_hours_repair`, `ch_v2_generic_late_01_apprenticeship_trial`, `ch_v2_generic_late_01_blurred_tally`, `ch_v2_generic_late_01_closing_bell`, `ch_v2_generic_late_01_commission_advance`, `ch_v2_generic_late_01_community_box`, `ch_v2_generic_late_01_keyring_claimant`, `ch_v2_generic_late_01_market_price_shift`, `ch_v2_generic_late_01_mislabeled_crate`, `ch_v2_generic_late_01_missing_token`, `ch_v2_generic_late_01_private_letter`, `ch_v2_generic_late_01_promised_shift`, `ch_v2_generic_late_01_puppet_case`, `ch_v2_generic_late_01_queue_steward`, `ch_v2_generic_late_01_quiet_counter`, `ch_v2_generic_late_01_reserved_stock`, `ch_v2_generic_late_01_returned_change`, `ch_v2_generic_late_01_sealed_envelope`, `ch_v2_generic_late_01_unequal_wage_offer` | 19 |
| 138 | `ch_v2_generic_late_01_after_hours_repair`, `ch_v2_generic_late_01_apprenticeship_trial`, `ch_v2_generic_late_01_blurred_tally`, `ch_v2_generic_late_01_closing_bell`, `ch_v2_generic_late_01_commission_advance`, `ch_v2_generic_late_01_community_box`, `ch_v2_generic_late_01_keyring_claimant`, `ch_v2_generic_late_01_market_price_shift`, `ch_v2_generic_late_01_mislabeled_crate`, `ch_v2_generic_late_01_missing_token`, `ch_v2_generic_late_01_private_letter`, `ch_v2_generic_late_01_promised_shift`, `ch_v2_generic_late_01_puppet_case`, `ch_v2_generic_late_01_queue_steward`, `ch_v2_generic_late_01_quiet_counter`, `ch_v2_generic_late_01_reserved_stock`, `ch_v2_generic_late_01_returned_change`, `ch_v2_generic_late_01_sealed_envelope`, `ch_v2_generic_late_01_unequal_wage_offer` | 19 |
| 144 | `ch_v2_generic_late_01_after_hours_repair`, `ch_v2_generic_late_01_apprenticeship_trial`, `ch_v2_generic_late_01_blurred_tally`, `ch_v2_generic_late_01_closing_bell`, `ch_v2_generic_late_01_commission_advance`, `ch_v2_generic_late_01_community_box`, `ch_v2_generic_late_01_keyring_claimant`, `ch_v2_generic_late_01_market_price_shift`, `ch_v2_generic_late_01_mislabeled_crate`, `ch_v2_generic_late_01_missing_token`, `ch_v2_generic_late_01_private_letter`, `ch_v2_generic_late_01_promised_shift`, `ch_v2_generic_late_01_puppet_case`, `ch_v2_generic_late_01_queue_steward`, `ch_v2_generic_late_01_quiet_counter`, `ch_v2_generic_late_01_reserved_stock`, `ch_v2_generic_late_01_returned_change`, `ch_v2_generic_late_01_sealed_envelope`, `ch_v2_generic_late_01_unequal_wage_offer` | 19 |
| 150 | `ch_v2_generic_late_01_after_hours_repair`, `ch_v2_generic_late_01_apprenticeship_trial`, `ch_v2_generic_late_01_blurred_tally`, `ch_v2_generic_late_01_closing_bell`, `ch_v2_generic_late_01_commission_advance`, `ch_v2_generic_late_01_community_box`, `ch_v2_generic_late_01_keyring_claimant`, `ch_v2_generic_late_01_market_price_shift`, `ch_v2_generic_late_01_mislabeled_crate`, `ch_v2_generic_late_01_missing_token`, `ch_v2_generic_late_01_private_letter`, `ch_v2_generic_late_01_promised_shift`, `ch_v2_generic_late_01_puppet_case`, `ch_v2_generic_late_01_queue_steward`, `ch_v2_generic_late_01_quiet_counter`, `ch_v2_generic_late_01_reserved_stock`, `ch_v2_generic_late_01_returned_change`, `ch_v2_generic_late_01_sealed_envelope`, `ch_v2_generic_late_01_unequal_wage_offer` | 19 |
| 156 | `ch_v2_generic_late_01_after_hours_repair`, `ch_v2_generic_late_01_apprenticeship_trial`, `ch_v2_generic_late_01_blurred_tally`, `ch_v2_generic_late_01_closing_bell`, `ch_v2_generic_late_01_commission_advance`, `ch_v2_generic_late_01_community_box`, `ch_v2_generic_late_01_keyring_claimant`, `ch_v2_generic_late_01_market_price_shift`, `ch_v2_generic_late_01_mislabeled_crate`, `ch_v2_generic_late_01_missing_token`, `ch_v2_generic_late_01_private_letter`, `ch_v2_generic_late_01_promised_shift`, `ch_v2_generic_late_01_puppet_case`, `ch_v2_generic_late_01_queue_steward`, `ch_v2_generic_late_01_quiet_counter`, `ch_v2_generic_late_01_reserved_stock`, `ch_v2_generic_late_01_returned_change`, `ch_v2_generic_late_01_sealed_envelope`, `ch_v2_generic_late_01_unequal_wage_offer` | 19 |
| 162 | `ch_v2_generic_late_01_after_hours_repair`, `ch_v2_generic_late_01_apprenticeship_trial`, `ch_v2_generic_late_01_blurred_tally`, `ch_v2_generic_late_01_closing_bell`, `ch_v2_generic_late_01_commission_advance`, `ch_v2_generic_late_01_community_box`, `ch_v2_generic_late_01_keyring_claimant`, `ch_v2_generic_late_01_market_price_shift`, `ch_v2_generic_late_01_mislabeled_crate`, `ch_v2_generic_late_01_missing_token`, `ch_v2_generic_late_01_private_letter`, `ch_v2_generic_late_01_promised_shift`, `ch_v2_generic_late_01_puppet_case`, `ch_v2_generic_late_01_queue_steward`, `ch_v2_generic_late_01_quiet_counter`, `ch_v2_generic_late_01_reserved_stock`, `ch_v2_generic_late_01_returned_change`, `ch_v2_generic_late_01_sealed_envelope`, `ch_v2_generic_late_01_unequal_wage_offer` | 19 |
| 168 | `ch_v2_generic_late_01_after_hours_repair`, `ch_v2_generic_late_01_apprenticeship_trial`, `ch_v2_generic_late_01_blurred_tally`, `ch_v2_generic_late_01_commission_advance`, `ch_v2_generic_late_01_community_box`, `ch_v2_generic_late_01_keyring_claimant`, `ch_v2_generic_late_01_market_price_shift`, `ch_v2_generic_late_01_mislabeled_crate`, `ch_v2_generic_late_01_missing_token`, `ch_v2_generic_late_01_private_letter`, `ch_v2_generic_late_01_promised_shift`, `ch_v2_generic_late_01_puppet_case`, `ch_v2_generic_late_01_queue_steward`, `ch_v2_generic_late_01_reserved_stock`, `ch_v2_generic_late_01_returned_change`, `ch_v2_generic_late_01_sealed_envelope`, `ch_v2_generic_late_01_unequal_wage_offer` | 17 |
| 174 | `ch_v2_generic_late_01_after_hours_repair`, `ch_v2_generic_late_01_apprenticeship_trial`, `ch_v2_generic_late_01_blurred_tally`, `ch_v2_generic_late_01_commission_advance`, `ch_v2_generic_late_01_community_box`, `ch_v2_generic_late_01_keyring_claimant`, `ch_v2_generic_late_01_market_price_shift`, `ch_v2_generic_late_01_mislabeled_crate`, `ch_v2_generic_late_01_missing_token`, `ch_v2_generic_late_01_private_letter`, `ch_v2_generic_late_01_promised_shift`, `ch_v2_generic_late_01_puppet_case`, `ch_v2_generic_late_01_queue_steward`, `ch_v2_generic_late_01_reserved_stock`, `ch_v2_generic_late_01_returned_change`, `ch_v2_generic_late_01_sealed_envelope`, `ch_v2_generic_late_01_unequal_wage_offer` | 17 |

## Immediate mini-arc audit

- Mini-arc roots: **11/20 = 55%**.
- Roots with reachable Immediate depth 2+: **8/11 = 72.7%**.
- Roots with reachable depth 3: **1**.
- Every counted Immediate node changes information, pressure, available decision, or resolution; no continue-only panels are used.

| Root | Max depth | Immediate descendants |
|---|---:|---|
| `ch_v2_generic_late_01_after_hours_repair` | 2 | `ch_v2_generic_late_01_after_hours_repair_i01_owner_early`, `ch_v2_generic_late_01_after_hours_repair_i02_test_repair` |
| `ch_v2_generic_late_01_apprenticeship_trial` | 2 | `ch_v2_generic_late_01_apprenticeship_trial_i01_last_blank`, `ch_v2_generic_late_01_apprenticeship_trial_i02_customer_waits` |
| `ch_v2_generic_late_01_closing_bell` | 1 | `ch_v2_generic_late_01_closing_bell_i01_mixed_stop` |
| `ch_v2_generic_late_01_keyring_claimant` | 1 | `ch_v2_generic_late_01_keyring_claimant_i01_collateral_bundle` |
| `ch_v2_generic_late_01_market_price_shift` | 1 | `ch_v2_generic_late_01_market_price_shift_i01_price_board` |
| `ch_v2_generic_late_01_mislabeled_crate` | 2 | `ch_v2_generic_late_01_mislabeled_crate_i01_driver_waits`, `ch_v2_generic_late_01_mislabeled_crate_i02_runner_reply` |
| `ch_v2_generic_late_01_missing_token` | 2 | `ch_v2_generic_late_01_missing_token_i01_two_tokens`, `ch_v2_generic_late_01_missing_token_i02_mark_check` |
| `ch_v2_generic_late_01_puppet_case` | 3 | `ch_v2_generic_late_01_puppet_case_i01_crowd_surge`, `ch_v2_generic_late_01_puppet_case_i02_missing_mask`, `ch_v2_generic_late_01_puppet_case_i03_wrong_accusation` |
| `ch_v2_generic_late_01_queue_steward` | 2 | `ch_v2_generic_late_01_queue_steward_i01_side_deal`, `ch_v2_generic_late_01_queue_steward_i02_one_short` |
| `ch_v2_generic_late_01_quiet_counter` | 2 | `ch_v2_generic_late_01_quiet_counter_i01_extra_coin`, `ch_v2_generic_late_01_quiet_counter_i02_owner_returns` |
| `ch_v2_generic_late_01_sealed_envelope` | 2 | `ch_v2_generic_late_01_sealed_envelope_i01_claim_details`, `ch_v2_generic_late_01_sealed_envelope_i02_true_recipient` |

## Dice audit

- Dice roots: **12/20 = 60%**.
- Every Dice root contains **two materially different Dice Choices at the root**; there are no one-Dice-Choice exceptions to justify.
- Root Dice Choices total: **24**.
- Difficulty distribution: **15 Standard (11)**, **9 Difficult (14)**, **0 Easy (8)**, **0 Very Difficult (17)**.
- Critical-success Stat profile: **21 choices at +2**, **3 exceptional choices at +3**.
- All Dice critical failures apply the normal `-1` tested-Stat profile; ordinary failures apply `0` tested-Stat progression while fiction/opportunity/Immediate escalation still changes.

| Root | Dice approaches |
|---|---|
| `ch_v2_generic_late_01_after_hours_repair` | `intelligence`/14, `agility`/14 |
| `ch_v2_generic_late_01_apprenticeship_trial` | `intelligence`/14, `agility`/14 |
| `ch_v2_generic_late_01_blurred_tally` | `intelligence`/14, `observation`/11 |
| `ch_v2_generic_late_01_closing_bell` | `agility`/14, `charisma`/11 |
| `ch_v2_generic_late_01_keyring_claimant` | `observation`/11, `charisma`/11 |
| `ch_v2_generic_late_01_market_price_shift` | `charisma`/11, `intelligence`/11 |
| `ch_v2_generic_late_01_mislabeled_crate` | `intelligence`/11, `observation`/11 |
| `ch_v2_generic_late_01_missing_token` | `observation`/11, `luck`/14 |
| `ch_v2_generic_late_01_puppet_case` | `observation`/11, `agility`/14 |
| `ch_v2_generic_late_01_queue_steward` | `charisma`/11, `observation`/11 |
| `ch_v2_generic_late_01_quiet_counter` | `charisma`/11, `intelligence`/11 |
| `ch_v2_generic_late_01_sealed_envelope` | `observation`/11, `charisma`/14 |

Exceptional +3 critical-success approaches:

- `puppet_case.watch_hands` — exceptional crowd-reading clarity.
- `missing_token.rummage_fast` — exceptional Luck result on a deliberately difficult scramble.
- `market_price_shift.bargain_bundle` — exceptional negotiation result.

No Dice modifier or Trait override is authored merely to inflate success odds.

## Reward / malus audit

- Ordinary deterministic Stat changes stay inside **-1 / 0 / +1**.
- No deterministic Stat malus below `-1` exists.
- No ordinary deterministic Stat reward above `+1` exists.
- Deterministic Choices are not mechanically sanitized: several choices trade money, trust, opportunity, or future expectation without receiving compensating Stat growth.
- Negative Berry effects are guarded by `berriesAtLeast(50)` before they can resolve.
- `commission_advance.spend_personal` gives no Berry gain: the advance is spent before delivery, so the player loses the payment opportunity rather than being rewarded for the temptation.

Examples:

- Positive deterministic progression: `apprenticeship_trial.ask_demo` → Observation +1 while opening the same-scene continuation.
- Neutral deterministic consequence: `returned_change.return_extra` changes the life history but grants no automatic Stat reward.
- Negative deterministic progression/cost: `community_box.lend_own_money` costs 50 Berrys; `reserved_stock.sell_higher` gains money but records the broken reservation in History without a morality-Stat penalty.

### Trait acquisition

- `ch_v2_generic_late_01_after_hours_repair.rebuild_mechanism` → `resourceful` only on Dice outcome `rebuild_mechanism_cs` (`dice`).
- `ch_v2_generic_late_01_after_hours_repair.fit_by_hand` → `resourceful` only on Dice outcome `fit_by_hand_cs` (`dice`).
- `ch_v2_generic_late_01_apprenticeship_trial.plan_steps` → `resilient` only on Dice outcome `plan_steps_cs` (`dice`).
- `ch_v2_generic_late_01_apprenticeship_trial.copy_gesture` → `resilient` only on Dice outcome `copy_gesture_cs` (`dice`).

- `resilient` is demonstrated by exceptional performance under the limited-attempt apprenticeship trial.
- `resourceful` is demonstrated by exceptional repair of the player’s own broken mechanism.
- **No unconditional deterministic Choice grants a Trait.**
- Existing Trait-gated Choices (`suspicious`, `honest`, `loyal`, `greedy`, `curious`, `resourceful`) provide scene-specific leverage only; they do not silently define new Traits.

## Lifetime Thread audit — La chaîne des petits services

- Seed root: `ch_v2_generic_late_01_chain_of_favors`.
- Durable anchor: a personal rule learned from one concrete local favor — small help may be passed onward instead of settled immediately.
- Recurring physical NPC at seed only: `neighborhood_merchant`. Later chapters intentionally use current-local throwaway people so no NPC teleports with the player.
- Topology: **braided-linear**.
- Longest complete lived path after the seed: **12 Scheduled chapters**.
- Distinct reachable Scheduled EventDefinitions: **19**.
- Meaningful structural divergences: **4**.
- Scheduled priority: `100`.
- Scheduled reach: `normal` on all Lifetime descendants. If the current Location blocks Scheduled Events, the chapter waits rather than forcing a geographically implausible scene.
- Vertical scheduling: each resolved chapter schedules only the next lived consequence; the seed never pre-enqueues the future graph.
- No unresolved structural split contains another Scheduled split.
- On continued paths, each chapter normally schedules exactly one next Lifetime chapter.
- Early termination exists at `favor_s04_draw_a_line.end_thread` and `favor_s07_public_or_quiet.end_thread`.

### Branch / reconvergence map

```text
chain_of_favors
  -> S01 first_return
      DIV-1
      -> S02A pass_it_on -> S03A no_price_tag --\
      -> S02B settle_it  -> S03B exact_account --+-> S04 draw_a_line

      DIV-2 at S04
      -> S05A within_limits -> S06A limit_respected --\
      -> S05B open_ended    -> S06B cost_arrives -----+-> S07 public_or_quiet
      -> END

      DIV-3 at S07
      -> S08A known_for_it -> S09A requests_multiply -----\
      -> S08B kept_quiet   -> S09B one_name_at_a_time ---+-> S10 what_it_costs
      -> END

      DIV-4 at S10
      -> S11A gifted_time --\
      -> S11B fair_exchange -+-> S12 your_version -> END
```

### Lifetime timing

- Seed eligibility: **108–126 ageMonths**.
- Seed → S01 delay: **18 months**.
- Every later continued step: **24 months**.
- Earliest full route: seed at 108 → terminal around **390 ageMonths / 32.5 years**.
- Latest seeded full route within the target seed window: seed at 126 → terminal around **408 ageMonths / 34 years**.
- Maximum normal-path Lifetime descendants before age 15: **3** (earliest route at 126, 150, 174 months).
- The majority of the route therefore resolves in Active and remains biographical rather than quest-log-like.

## Scheduled Event IDs

- `ch_v2_generic_late_01_favor_s01_first_return`
- `ch_v2_generic_late_01_favor_s02a_pass_it_on`
- `ch_v2_generic_late_01_favor_s02b_settle_it`
- `ch_v2_generic_late_01_favor_s03a_no_price_tag`
- `ch_v2_generic_late_01_favor_s03b_exact_account`
- `ch_v2_generic_late_01_favor_s04_draw_a_line`
- `ch_v2_generic_late_01_favor_s05a_within_limits`
- `ch_v2_generic_late_01_favor_s05b_open_ended`
- `ch_v2_generic_late_01_favor_s06a_limit_respected`
- `ch_v2_generic_late_01_favor_s06b_cost_arrives`
- `ch_v2_generic_late_01_favor_s07_public_or_quiet`
- `ch_v2_generic_late_01_favor_s08a_known_for_it`
- `ch_v2_generic_late_01_favor_s08b_kept_quiet`
- `ch_v2_generic_late_01_favor_s09a_requests_multiply`
- `ch_v2_generic_late_01_favor_s09b_one_name_at_a_time`
- `ch_v2_generic_late_01_favor_s10_what_it_costs`
- `ch_v2_generic_late_01_favor_s11a_gifted_time`
- `ch_v2_generic_late_01_favor_s11b_fair_exchange`
- `ch_v2_generic_late_01_favor_s12_your_version`

## Immediate Event IDs

- `ch_v2_generic_late_01_after_hours_repair_i01_owner_early`
- `ch_v2_generic_late_01_after_hours_repair_i02_test_repair`
- `ch_v2_generic_late_01_apprenticeship_trial_i01_last_blank`
- `ch_v2_generic_late_01_apprenticeship_trial_i02_customer_waits`
- `ch_v2_generic_late_01_closing_bell_i01_mixed_stop`
- `ch_v2_generic_late_01_keyring_claimant_i01_collateral_bundle`
- `ch_v2_generic_late_01_market_price_shift_i01_price_board`
- `ch_v2_generic_late_01_mislabeled_crate_i01_driver_waits`
- `ch_v2_generic_late_01_mislabeled_crate_i02_runner_reply`
- `ch_v2_generic_late_01_missing_token_i01_two_tokens`
- `ch_v2_generic_late_01_missing_token_i02_mark_check`
- `ch_v2_generic_late_01_puppet_case_i01_crowd_surge`
- `ch_v2_generic_late_01_puppet_case_i02_missing_mask`
- `ch_v2_generic_late_01_puppet_case_i03_wrong_accusation`
- `ch_v2_generic_late_01_queue_steward_i01_side_deal`
- `ch_v2_generic_late_01_queue_steward_i02_one_short`
- `ch_v2_generic_late_01_quiet_counter_i01_extra_coin`
- `ch_v2_generic_late_01_quiet_counter_i02_owner_returns`
- `ch_v2_generic_late_01_sealed_envelope_i01_claim_details`
- `ch_v2_generic_late_01_sealed_envelope_i02_true_recipient`

## Existing persistent definitions used

### NPCs
- `neighborhood_merchant` — used only where a true local merchant relationship matters (`chain_of_favors`, `quiet_counter` and its Immediate continuation).

### Traits
- Granted: `resilient`, `resourceful`.
- Queried as gated leverage: `suspicious`, `honest`, `loyal`, `greedy`, `curious`, `resourceful`.

### Player Stats used
- `morale`, `agility`, `observation`, `intelligence`, `charisma`, `luck`.
- `health` is never used as a Dice stat.

### Berrys
- Small local amounts only: 25–150 Berrys in authored consequences.
- No generic market price or Item definition is invented.

### Not used
- No new NPC, Item, Trait, Flag, Location, Ship, career, Haki, Devil Fruit, crew role, reputation concept, or system.
- No `childhood_friend` / `childhood_rival` familiarity is assumed.

## Locations / tags / services

- Exact Locations: **none**.
- Services used in root eligibility: `food`, `general_goods`, `trade`.
- Tags used in root eligibility: `urban`, `entertainment`.
- No Race, Birth Location, Blue, or Origin-cross premise is required; those territories remain reserved for their dedicated batches.

## Collision / dedup audit

- Repository code search at the reviewed HEAD returned no existing `ch_v2_generic_late_01` prefix collision.
- Accepted Family Major content is treated as protected for all five runtime tracks: `family_civilian`, `family_marine`, `family_pirate`, `family_revolutionary`, `family_royal`. No root in this package carries `majorTrack`.
- `quiet_counter`, `missing_token`, `closing_bell`, `puppet_case`, and `chain_of_favors` deliberately rebuild reserved Generic Late ideas under the V2 contract rather than copying legacy IDs/graphs/effects.
- `after_hours_repair` is structurally distinct from the PEERS-reserved version because the player caused the damage personally; no peer asks the player to hide another person’s fault.
- `apprenticeship_trial` is the single fused trial/learning concept, preventing duplicate “third attempt” / “apprenticeship” roots.
- Peer-status/group-belonging, bodily danger/combat, large-world discovery/institutional identity, Race, Place, Origin Cross, and Family destiny are not used as the primary dramatic engine.

## Canon / timeline audit

- No canon character appears.
- No protected canon outcome is touched.
- All roots are ordinary local situations plausible during the player’s pre-Luffy-voyage Childhood window.
- Lifetime continuation into Active remains generic and current-local; it does not require a canon institution, fixed island, or traveling persistent NPC.

## Localization audit

- French source fragment only: `localization/fr.fragment.json`.
- Flat localization-key structure: `event.<eventId>...`.
- All Event title/body/Choice/Outcome localization references resolve inside the fragment.
- Text-budget static pass: all Normal root bodies are 20–45 words; all Immediate/Scheduled bodies are 12–40 words; all Choice labels are 2–10 words; all Outcome texts are 5–25 words.

## Static/schema audit

- All 59 Event JSON files parse successfully.
- Event IDs are unique.
- All Immediate/Scheduled event references resolve inside this package.
- All 20 roots are `kind: normal`, Childhood-gated, one-shot, and outside Major Tracks.
- All 20 Immediate descendants are `kind: immediate`.
- All 19 Lifetime descendants are `kind: scheduled`, priority 100, `scheduledReach: normal`.
- Every Event has at least one unconditional Choice; gated bonus Choices never make an Event unresolvable.
- Every `modifyNpcRelationship` use targets an NPC present in the Event `cast`.
- No `modifyStat` amount 0 is authored; Dice failure uses an empty tested-Stat effect list instead.
- No negative Berry effect can reduce Berrys below zero because those Choices are gated by `berriesAtLeast(50)`.
- No current persistent-definition reference outside the reviewed catalog is introduced.

### Integration-validation status

This is a standalone authoring package and was **not merged into `dev`**. Therefore repository-level `npm test`, `npm run validate-content`, and `npm run build` were not run against an integrated catalog. The package received static JSON/reference/localization/graph/coverage audits against the current Schema 14 contract and current validator/runtime vocabulary. Integration should run the repository commands after merging the package fragments into an integration branch.

## Contract checklist

- [x] Exactly 20 Normal Childhood roots.
- [x] 11 mini-arc roots (55%).
- [x] 8/11 mini-arc roots reach depth 2+ (72.7%).
- [x] `puppet_case` reaches depth 3.
- [x] 12 root Dice Events (60%).
- [x] Multiple Dice approaches: 2 Dice Choices on every Dice root.
- [x] Dice progression uses CF -1 / failure 0 / success +2; criticalSuccess +2 normally, +3 only 3/24 times.
- [x] Exactly one primary qualifying Lifetime seed.
- [x] Lifetime longest route = 12 Scheduled chapters.
- [x] Lifetime distinct Scheduled definitions = 19.
- [x] Lifetime meaningful structural divergences = 4.
- [x] Lifetime topology braided-linear, no nested unresolved structural fork.
- [x] At most 3 Lifetime descendants before age 15 on the earliest normal route.
- [x] Lifetime deliberately continues through Active into the early/mid-thirties.
- [x] No selector/runtime Lifetime guarantee added.
- [x] No unconditional deterministic Trait acquisition.
- [x] No new persistent definitions.
- [x] No shared file modified.

## Dependencies

- Runtime Schema 14 Condition/Effect/Event vocabulary.
- Existing `neighborhood_merchant` NPC definition.
- Existing Trait definitions listed above.
- Current Event selector semantics for Normal / Immediate / Scheduled priority and current `materializeEventCast` behavior.
- No dependency on another ordinary Childhood batch.

## Proposed definitions

**None.** `PROPOSED_DEFINITIONS.md` is intentionally omitted.
