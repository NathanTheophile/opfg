# OPFG Sims V2

Série de simulations spécialisées pour la stabilisation release.

## Pré-requis

La policy `progression` V2 attend le patch de simulation des pouvoirs de Crew appliqué précédemment (`progressionSimulationPolicy.chooseCrewPower` + hook `onCrewPowerUsed`). Les policies `random` et `minmax` restent utilisables sans comportement actif de Crew.

## Principes V2

- une simulation = une question principale ;
- CLI commune ;
- policies communes : `random`, `progression`, `minmax` ;
- progression visible par défaut ;
- vitesse réelle, temps écoulé et ETA ;
- JSON structuré avec un bloc `common` comparable entre suites ;
- cohorts Race / Career / Crew disponibles dans les rapports ;
- aucun remplacement des scripts V1 dans `scripts/`.

## CLI commune

```powershell
npx jiti Sims/V2/health.ts `
  --policy progression `
  --runs 500 `
  --seed 200001 `
  --max-events 1000 `
  --json Sims/V2/reports/health-progression-500.json
```

Options :

```text
--policy random|progression|minmax
--runs N
--seed N
--max-events N
--json PATH
--progress
--no-progress
--progress-every SECONDS
--top N
--include-runs
--help
```

La progression est activée par défaut et ressemble à :

```text
[████████████············] | 251/500 | 50.2% | 0.96 runs/s | elapsed 04:22 | ETA 04:20 | deaths=194 (77.3%) | medic=81 | medicUsed=49
```

## Les 9 suites

### 1. Sanity

Question : le runtime de simulation termine-t-il proprement ?

```powershell
npx jiti Sims/V2/sanity.ts --policy progression --runs 200 --seed 100001
```

Mesure notamment : errors, dead ends, safety limits, immediate guards, critical loops, `at_sea` sans ship.

### 2. Health

Question : qui meurt, quand, pourquoi, et quel est l'impact du Medic ?

```powershell
npx jiti Sims/V2/health.ts --policy progression --runs 500 --seed 200001
```

Mesure : mortalité globale / Race / Career, damage/healing, Medic, mer/terre, lethal events.

### 3. Travel

Question : jusqu'où arrivent les runs dans le monde ?

```powershell
npx jiti Sims/V2/travel.ts --policy progression --runs 300 --seed 300001
```

Funnel : Blues → Reverse Mountain → Paradise → Sabaody → Fish-Man Island → New World, impact Navigator et contrôle Thriller Bark → Sabaody.

### 4. Crew

Question : le Crew existe-t-il suffisamment et ses rôles/pouvoirs servent-ils réellement ?

```powershell
npx jiti Sims/V2/crew.ts --policy progression --runs 500 --seed 400001
```

Mesure : recrutement, rôle par run, années de présence/disponibilité/utilisation, Medic, Navigator, pouvoirs annuels.

### 5. Economy / Ships

Question : l'économie et la progression navale fonctionnent-elles ?

```powershell
npx jiti Sims/V2/economy-ships.ts --policy progression --runs 500 --seed 500001
```

Mesure : income/spend, acquisition de ship, pertes, réacquisitions, ship final, Shipwright et invariants mer/navire.

### 6. Progression

Question : le personnage progresse-t-il jusqu'à l'horizon prévu ?

```powershell
npx jiti Sims/V2/progression.ts --policy progression --runs 500 --seed 600001
```

Mesure : âge 35, stats, Traits, Haki, Fruits, Awakening, Career.

### 7. Narrative

Question : le pool narratif reste-t-il sain et suffisamment alimenté ?

```powershell
npx jiti Sims/V2/narrative.ts --policy progression --runs 300 --seed 700001
```

Mesure : couverture Events, Lifetime, Scheduled/Critical/Immediate, fallbacks, starvation et Events surreprésentés.

### 8. Dice

Question : les DiceChecks ont-ils une distribution saine en situation réelle ?

```powershell
npx jiti Sims/V2/dice.ts --policy progression --runs 1000 --seed 800001
```

Mesure : raw d20 1–20, outcomes, modifiers, stats utilisées et jets Player/Crew.

### 9. Endings

Question : les runs se terminent-elles correctement et dans quels états ?

```powershell
npx jiti Sims/V2/endings.ts --policy progression --runs 500 --seed 900001
```

Mesure : âge 35, mort/legacy, Ending, Race/Career/geography finale.

## Exécuter toute la série

Pour un smoke test seulement :

```powershell
npx jiti Sims/V2/all.ts --policy progression --runs 5 --seed 990001 --max-events 1000
```

`all.ts` lance réellement les 9 suites : `--runs 500` signifie donc 4500 runs. Utiliser les scripts individuels pour les grosses campagnes release.

## Comparer des policies

Lancer le même objectif et la même plage de seeds :

```powershell
npx jiti Sims/V2/health.ts --policy random      --runs 500 --seed 200001 --json Sims/V2/reports/health-random.json
npx jiti Sims/V2/health.ts --policy progression --runs 500 --seed 200001 --json Sims/V2/reports/health-progression.json
npx jiti Sims/V2/health.ts --policy minmax      --runs 500 --seed 200001 --json Sims/V2/reports/health-minmax.json
```

## Validation recommandée après intégration

```powershell
npx jiti Sims/V2/sanity.ts --policy progression --runs 3 --seed 1 --max-events 1000
npx jiti Sims/V2/health.ts --policy progression --runs 3 --seed 1 --max-events 1000
npx jiti Sims/V2/travel.ts --policy progression --runs 3 --seed 1 --max-events 1000
npm test
npm run build
```
