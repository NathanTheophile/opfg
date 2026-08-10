# OPFG UI Tuner

## Purpose

The tuner exists to make visual iteration fast enough that you can search for
the UI you like instead of asking for a new code change for every 2 px tweak.

It is DEV-only. The production build gets the centralized `ui-system.css`, but
not the tuner overlay.

## Open / hide

- `Ctrl + Shift + U`: show / hide the tuner.
- `Esc`: collapse the tuner.
- `Ctrl + Z`: undo.
- `Ctrl + Shift + Z`: redo.

The overlay is dockable left/right and its own width/opacity are adjustable.

## Live workflow

1. Run `npm run dev`.
2. Open the tuner.
3. Move sliders: values update instantly through CSS custom properties.
4. Use quick presets (`Compact`, `Balanced`, `Spacious`, `Cinematic`) to jump
   between large visual directions.
5. Use section randomization for controlled ±7.5% exploration.
6. Save candidates into A/B/C/D.
7. Load A/B/C/D instantly to compare.
8. Hold `Compare` to temporarily preview the baseline/default design.
9. Use Layout / Hitboxes / Freeze for inspection.
10. Copy CSS once you decide.

## Persistence

Current values and A/B/C/D are stored in localStorage:

- `opfg.uiTuner.values.v1`
- `opfg.uiTuner.presets.v1`
- `opfg.uiTuner.ui.v1`

A browser refresh does not erase your work.

## Export

- `CSS`: copies a complete `:root { ... }` block.
- `JSON`: copies the editable tuner snapshot.
- Download button: downloads `opfg-ui-tuning.json`.
- Import button: loads a previously exported JSON snapshot.

When a direction is validated, copy the chosen values into the defaults in
`src/styles/ui-system.css`. That makes the design canonical rather than
depending on localStorage.

## Architecture

`src/styles/tokens.css`
- raw palette / semantic baseline / shadcn bridge.

`src/styles/ui-system.css`
- shared UI construction tokens and component dimensions.
- centralized stat palette.
- tunable defaults.
- shared cross-feature visual grammar.
- production-safe.

Feature CSS
- component-specific structure and animation details.
- may keep fallback values.
- `ui-system.css` has deliberately higher selector specificity for the shared
  decisions it owns, without relying on `!important`.

`src/features/dev-ui/*`
- DEV-only visual editor.
- only manipulates CSS custom properties and debug root classes.
- does not mutate gameplay state.

## What is tunable in V57

- foundation / surfaces / radii / borders / shadows / motion;
- complete desktop top HUD proportions;
- inventory/cargo slot sizing;
- Event padding / typography / Choice density;
- player stats rail dimensions / icons / watermark / gauge / traits;
- Crew widths / row density;
- Outcome effect + impact sizing/timing;
- tooltip dimensions/typography;
- glass blur/border/shadow/stretch;
- full 9-stat color palette.

The schema is data-driven in `uiTunerConfig.ts`. Adding a new slider generally
means adding one definition and using its CSS variable in `ui-system.css`.
