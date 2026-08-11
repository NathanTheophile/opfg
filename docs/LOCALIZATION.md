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

Interpolation supports only named `{{placeholder}}` values. Secondary translations must preserve exactly the source placeholder set. No HTML, expressions, conditions, ICU, or pluralization is evaluated.

`CONTENT_SCHEMA_VERSION = 8` versions the authoring/runtime content contract independently from save `GameState.version = 18`. Runtime content validation rejects unsupported schema versions and missing source-French keys. Missing English entries are valid.

The UI locale is stored separately under `jam-op-fan-game.locale`; it is never part of career state.

## Player-facing copy rule

Every production string visible or exposed to the player must come from a localization key. This includes JSX copy, labels, buttons, titles, tooltips, fallbacks, empty states, validation/error messages intended for the player, `aria-label`, `title`, and `data-tooltip`.

Do not keep parallel FR/EN copy in TypeScript and do not infer locale, IDs, result types, stats, or other semantics from translated text. Carry stable IDs/enums in view models and translate only at the render boundary. The locale JSON dictionaries are the single source of truth for localized copy.

Allowed non-localized strings are non-linguistic/internal values such as stable IDs, CSS/data tokens, DOM event names, file paths, debug/log output not rendered to the player, DEV-only tooling, and explicitly invariant notation such as `HP`, `d20`, `%`, and `×`.
