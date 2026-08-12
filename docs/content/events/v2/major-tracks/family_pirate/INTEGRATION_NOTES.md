# Family Pirate integration V1

Accepted source:
- 45 Major roots
- 135 Immediate Events
- 180 EventDefinitions total
- 40 routing scenarios
- single-parent lock: female / mother
- special path: pirate_fishman_underkeel

Integration-only changes:
- install the accepted authoring source;
- lock pirate single-parent sex to female;
- register five narrative-only unique inheritance Items;
- add FR/EN Item names;
- map all 33 final History Outcomes to Pirate/Civilian at the real 180-month boundary;
- add 3 low-volume integration tests.

One copy typo was fixed during integration:
`On te répond seulement: « Pour partir vite.` -> `On te répond seulement : « Pour partir vite. »`

No Schema bump, Save bump, new Condition, Effect, Flag, Scheduled callback, or Saga state.


## Routing hotfix V1

First real-selector check found two dead fallback fixtures and two incorrect scenario signals.
The authoring source was corrected rather than weakening `saga:check`.
