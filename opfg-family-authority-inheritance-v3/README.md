# OPFG — Family Authority + Inheritance V3

This bundle applies the D2.11 post-Marine/Pirate/Royal authority refresh and targeted Layer-5 inheritance rework.

It does **not** add a new gameplay primitive or rewrite the Family DAGs.

## What it changes

- updates the master/specialized narrative authorities with lessons from Marine, Pirate and Royal;
- updates the accepted V2 Concept Index, which was still empty;
- adds a generated Family inheritance reward audit;
- diversifies Layer-5 rewards in Marine, Pirate and Royal;
- adds `modifyBerries` to the Saga persistent-reward vocabulary;
- adds Saga-level reward-diversity checks to the authoring pipeline;
- preserves all existing Major roots, route topology, scenario IDs and Active handoff Outcome IDs.

## Run

From the OPFG repository root:

```powershell
powershell -ExecutionPolicy Bypass -File ".\opfg-family-authority-inheritance-v3\apply-family-authority-inheritance-v3.ps1" -Verify
```

`-Verify` runs:

1. the patcher;
2. compile + saga check for Marine, Pirate and Royal;
3. `npm test`;
4. `npm run validate-content`;
5. `npm run build`.

The patcher stops on missing expected authority anchors or missing Event/Outcome IDs instead of silently applying against an unexpected source.
