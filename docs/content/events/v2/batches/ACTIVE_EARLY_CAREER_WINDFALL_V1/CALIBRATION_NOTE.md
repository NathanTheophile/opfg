# Early Career Windfall — Integration Calibration

The returned generator batch passed the structural/content audit:

- 56 EventDefinitions
- 8 Normal roots
- 48 Immediate Events
- exactly 6 Immediate Events per root
- exact Root → i01 → ... → i06 topology on every living path
- all terminal payouts are 10k / 20k / 30k / 40k
- no intermediate Berry payout
- no negative Berrys
- no negative Reputation
- no direct ship acquisition
- complete FR/EN localization
- no persistent definitions proposed
- three combat decision scenes per story (`i03`, `i05`, `i06`)

## One calibration applied before integration

All terminal `i06` Dice choices now use:

```json
"successThreshold": 10
```

The generator used mostly threshold 14. That made the intended 30,000-Berry "normal/good" outcome too uncommon for the locked design goal: after this milestone, a 25,000-Berry Sloop should normally be immediately realistic.

With threshold 10 and a neutral Dice modifier:

- critical failure remains possible;
- failure still produces 20k (10k on critical failure);
- success/critical success produces 30k/40k;
- 30k+ is a majority outcome before positive stat modifiers.

No localization, narrative beat, payout tier, combat scene, topology, eligibility, or secondary Effect was otherwise changed.
