# OPFG — Family Authority + Inheritance V3.1

V3.1 fixes the brittle `GAME_DESIGN Family DAG` anchor in V3.

It is safe to run after the partially failed V3 attempt. V3 may already have edited `scripts/saga-content/lib.ts`, `docs/content/EVENT_AUTHORING_RULES.md`, and `docs/design/MAJOR_NARRATIVE_TRACKS.md`; V3.1 detects those edits and does not duplicate them. The Family authoring JSON sources are written later in the patcher, so the reported GAME_DESIGN failure occurred before the reward rework was persisted.

Run from the OPFG repository root:

```powershell
Expand-Archive -Force ".\opfg-family-authority-inheritance-v3_1.zip" ".\opfg-family-authority-inheritance-v3_1"

powershell -ExecutionPolicy Bypass -File ".\opfg-family-authority-inheritance-v3_1\apply-family-authority-inheritance-v3_1.ps1" -Verify
```

Do not revert the partial V3 changes first. V3.1 resumes from them.
