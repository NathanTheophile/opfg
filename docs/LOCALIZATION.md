# Localization

French (`fr`) is the source locale and runtime fallback. The game ships with `fr` and partial `en` dictionaries. Missing secondary translations fall back to French; missing French keys render as `[MISSING: key]`.

Gameplay content is unique and locale-neutral. `ContentCatalog` contains stable localization references such as:

```text
event.<eventId>.title
event.<eventId>.text
event.<eventId>.choice.<choiceId>.text
event.<eventId>.choice.<choiceId>.outcome.<outcomeId>.text
trait.<traitId>.name
item.<itemId>.name
```

Pure helpers in `src/game/localization/keys.ts` generate these keys. IDs are never translated. Flat JSON dictionaries live under `src/game/localization/locales/`.

Interpolation supports named `{{placeholder}}` values plus the narrow locale-local selector `{{select:param|value:text|other:...}}` for grammatical variation. Secondary translations must preserve exactly the ordinary named placeholder set; selectors are intentionally locale-local because agreement needs differ by language. No HTML, arbitrary expressions, gameplay conditions, ICU, or pluralization is evaluated.

Runtime-named NPCs use `{{npc_<npcId>}}` placeholders (for example `{{npc_childhood_friend}}`). The value comes from the run-persistent `NpcState.displayName`; fixed-name NPCs fall back to their normal `nameKey`. Schema 13 also exposes NPC grammar parameters from immutable `NpcDefinition.sex` metadata; see the authority section below.

`CONTENT_SCHEMA_VERSION = 14` versions the authoring/runtime content contract independently from save `GameState.version = 21`. Runtime content validation rejects unsupported schema versions and missing source-French keys. New D2.6 system UI copy is authored in both French and English; older missing English entries may still fall back to French.

The UI locale is stored separately under `jam-op-fan-game.locale`; it is never part of career state.

## Player-facing copy rule

Every production string visible or exposed to the player must come from a localization key. This includes JSX copy, labels, buttons, titles, tooltips, fallbacks, empty states, validation/error messages intended for the player, `aria-label`, `title`, and `data-tooltip`.

Do not keep parallel FR/EN copy in TypeScript and do not infer locale, IDs, result types, stats, or other semantics from translated text. Carry stable IDs/enums in view models and translate only at the render boundary. The locale JSON dictionaries are the single source of truth for localized copy.

Allowed non-localized strings are non-linguistic/internal values such as stable IDs, CSS/data tokens, DOM event names, file paths, debug/log output not rendered to the player, DEV-only tooling, and explicitly invariant notation such as `HP`, `d20`, `%`, and `×`.

<!-- D2.7_NPC_GRAMMAR_AUTHORITY -->
## Dynamic NPC grammar — Schema 13 authority

Every authored `NpcDefinition` has an explicit immutable `sex: "male" | "female"`. This is content identity, not mutable `GameState`, so Schema 13 does not require a Save-version bump.

For every NPC, the Event render context automatically exposes:

```text
{{npc_<id>}}                 generated/fixed display name
{{npc_<id>_sex}}             male | female
{{npc_<id>_subject}}         il / elle ; he / she
{{npc_<id>_subject_cap}}     Il / Elle ; He / She
{{npc_<id>_direct_object}}   le / la ; him / her
{{npc_<id>_tonic}}           lui / elle ; him / her
{{npc_<id>_reflexive}}       lui-même / elle-même ; himself / herself
{{npc_<id>_role}}            père / mère ; father / mother — canonical family-role NPCs only
```

Use ready pronoun placeholders only where the grammatical form is safe. French possessives, elision and many adjective/participle agreements depend on surrounding words, so there is deliberately no generic `his/her` or suffix placeholder.

For agreement, use a short locale-local selector:

```text
FR:
{{npc_player_parent_1_subject_cap}} est
{{select:npc_player_parent_1_sex|male:revenu|female:revenue}} avant l'aube.

EN:
{{npc_player_parent_1_subject_cap}} returned before dawn.
```

Selector syntax:

```text
{{select:<interpolationParam>|<value>:<localized fragment>|<value>:<localized fragment>|other:<fallback>}}
```

Rules:

- selector branches are localization-only grammar fragments, never gameplay logic;
- branch fragments cannot contain another `{{...}}` interpolation;
- if a parameter or matching branch is missing, the selector remains visible instead of silently guessing;
- selectors do not have to match between languages; ordinary named placeholders still do;
- prefer rewriting the whole localized phrase when grammar becomes awkward instead of composing many micro-suffixes;
- never encode sex decisions in translated text: the source of truth is NPC/content metadata.

Canonical family roles are stable IDs `father` and `mother`. Player-facing strings should use “père/mère”, “father/mother”, or the NPC's actual name where known — not “parent 1/parent 2”.

If a future feature introduces genuinely run-randomized NPC sex, that selected identity must be persisted (or represented by a persisted selected Family Track) before these grammar parameters are used. Never reroll grammatical identity per Event.
