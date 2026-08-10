OPFG ADVANCED UI TUNER V57

Copy the ZIP contents at repository root.

Main additions:
- src/styles/ui-system.css
- src/features/dev-ui/UITuner.tsx
- src/features/dev-ui/uiTunerConfig.ts
- src/features/dev-ui/ui-tuner.css
- docs/UI_TUNER.md

Updated complete files:
- src/main.tsx
- src/features/event-ui/EventPanel.tsx
- src/features/event-ui/ChoiceButton.tsx
- src/features/event-ui/TopWorldHud.tsx
- src/features/event-ui/top-world-hud.css
- src/features/event-ui/OutcomePanel.tsx
- src/features/event-ui/outcome-panel.css

The TopWorldHud included is based on V56 fixed (2x4 cargo, square slots).
The OutcomePanel included is based on V54 (hidden raw d20/total, colored result,
+0 failed stat feedback).

V57 does NOT modify gameplay state, engine, schema, localization dictionaries,
D20 engine logic, player stats component, or crew component.

DEV UX:
Ctrl+Shift+U opens/hides tuner.

The tuner is dynamically imported only when import.meta.env.DEV is true.

Validation:
- TS / TSX parser run on all generated TS/TSX files.
- explicit scan for mojibake markers.

Final cleanup:
- obvious noUnusedLocals hazards removed from UITuner
- CSS arithmetic kept browser-safe
