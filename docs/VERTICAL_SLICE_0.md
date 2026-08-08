# Vertical Slice 0 — Contrat du moteur narratif

## 1. GameState minimal

Le premier `GameState` contient uniquement :

```text
GameState
├─ version
├─ rngState
├─ month
├─ locationId
├─ player
│  ├─ stats
│  └─ traits
├─ ship
│  └─ condition
├─ flags
├─ items
├─ npcs
├─ history
├─ scheduledEvents
├─ currentEventId
└─ careerStatus
```

### Valeurs concrètes du slice

```text
month = 0

locationId = "starter_port"

player.stats
  navigation
  charisma
  morale

player.profile
  name: string | null
  raceId: RaceId | null
  originSeaId: SeaId | null
  affiliationId: AffiliationId | null

player.traits
  TraitId[]

ship.condition
  entier 0–3
  0 = hors d'état
  1 = mauvais
  2 = correct
  3 = bon

flags
  FlagId[]

items
  ItemId[]

npcs
  Record<NpcId, NpcState>

NpcState
  status
  relationship
  stats

NpcStats
  health
  morale
  strength
  observation
  intelligence
  luck
  loyalty
  calm

status =
  known
  crew
  departed
  unavailable

relationship =
  entier, idéalement -100 → +100

history[]
  eventId
  choiceId
  outcomeId
  month
  ageMonths

scheduledEvents[]
  eventId
  dueAgeMonths
  sourceEventId
  sourceChoiceId

careerStatus =
  active
  ended
```

### Règle de sérialisation

Le `GameState` persistant doit être directement JSON-compatible.

Ne pas utiliser dans le GameState :

- `Set`;
- `Map`;
- `Date`;
- instances de classes;
- fonctions/callbacks.

### Explicitement absent

Pas encore de :

- argent ;
- réputation ;
- niveau ;
- XP ;
- inventaire quantitatif ;
- rôles d'équipage ;
- multiples bateaux ;
- factions ;
- `ArcState` générique ;
- système de mémoire séparé ;
- `usedEvents`.

Si un événement n'en a pas besoin, le champ n'existe pas.

Les événements déjà joués sont dérivés de `history`.

---

# 2. Mécaniques obligatoires du premier slice

Le slice doit impérativement permettre :

1. créer une carrière avec quelques stats et traits ;
2. sélectionner un événement compatible avec le GameState ;
3. afficher des choix toujours disponibles ou conditionnels ;
4. distinguer choix masqué et choix visible mais verrouillé ;
5. résoudre un choix déterministe ;
6. résoudre un choix avec jet de dé visible ;
7. appliquer des effets au GameState ;
8. faire revenir un PNJ avec sa relation précédente ;
9. déclencher un événement causé par une ancienne décision ;
10. programmer une conséquence plusieurs mois plus tard ;
11. faire progresser un mini-arc sur plusieurs événements ;
12. terminer une petite carrière ;
13. sauvegarder/restaurer le GameState via `localStorage`.

Tout ceci doit fonctionner avant d'ajouter des systèmes supplémentaires.

---

# 3. EventDefinition minimal

```text
EventDefinition
  id
  title
  text

  eligibility?
  priority

  choices[]
```

Tous les événements du premier slice sont **one-shot**.

Le moteur exclut automatiquement de la sélection les événements déjà présents dans `history`.

Pas de système `repeatable`, cooldown ou nombre maximum d'occurrences pour l'instant.

---

# 4. Conditions nécessaires

Les Conditions sont des discriminated unions TypeScript.

## Composition

```text
all
any
not
```

## Conditions atomiques nécessaires

```text
hasTrait(traitId)

statAtLeast(statId, value)

hasFlag(flagId)

hasItem(itemId)

locationIs(locationId)

shipConditionAtLeast(value)
shipConditionAtMost(value)

npcStatusIs(npcId, status)

npcRelationshipAtLeast(npcId, value)
npcStatAtLeast(npcId, statId, value)

hasChosen(eventId, choiceId)

monthAtLeast(value)
```

Cela suffit pour couvrir les catégories importantes du prototype :

- trait ;
- statistique ;
- possession ;
- membre d'équipage ;
- état du monde ;
- état du bateau ;
- relation ;
- choix passé ;
- progression temporelle.

### Pas encore nécessaire

Pas de :

```text
statBetween
relationshipBetween
itemQuantity
randomCondition
customScript
expression libre
```

Une condition narrative complexe doit être construite avec `all / any / not`.

Aucun callback JavaScript arbitraire dans les données.

---

# 5. Choix

```text
ChoiceDefinition
  id
  text

  visibleIf?
  availableIf?

  resolution
```

## Règles

### Toujours disponible

Aucune condition.

### Visible et verrouillé

```text
visibleIf = true
availableIf = condition
```

Exemple :

> `[Navigation 3] Identifier un passage dans les récifs`

Le joueur comprend que cette capacité aurait pu lui servir.

### Complètement masqué

```text
visibleIf = condition
```

Utilisé principalement pour :

- secrets ;
- anciens choix ;
- objets dont le joueur ignore l'utilité ;
- situations narratives qui seraient spoilées par un bouton grisé.

### Principe

Une stat élevée peut ouvrir une **solution certaine**.

Elle n'implique pas automatiquement un jet.

Exemple :

> Navigation 4 permet d'identifier immédiatement le chenal.

Aucun RNG.

---

# 6. Résolutions

Seulement deux formes.

```text
Resolution =
  DeterministicResolution
  DiceResolution
```

## Déterministe

```text
DeterministicResolution
  outcome
```

## Outcome

```text
Outcome
  id
  text
  advanceMonths
  effects[]
```

Le temps appartient au résultat et non à l'événement.

Deux choix différents peuvent donc consommer des durées différentes.

---

# 7. Effets nécessaires

Seulement :

```text
setFlag
clearFlag

addItem
removeItem

modifyStat

modifyShipCondition

moveToLocation

setNpcStatus
modifyNpcRelationship
modifyNpcStat

scheduleEvent

endCareer
```

Pas davantage dans Slice 0.

### Exemples

```text
modifyNpcRelationship("mira", +20)

setNpcStatus("mira", "crew")

modifyShipCondition(-1)

addItem("sealed_chart")

setFlag("helped_mira")

moveToLocation("open_sea")
```

### Conséquence différée

```text
scheduleEvent
  eventId = "mira_returns_favor"
  delayMonths = 6
```

Le moteur convertit cela en :

```text
dueAgeMonths = currentAgeMonths + 6
```

et conserve :

```text
sourceEventId
sourceChoiceId
```

pour le debug causal.

---

# 8. Temps et progression

Le temps est seulement :

```text
month: integer
```

Pas de jours, semaines, saisons ou calendrier réel.

Chaque `Outcome` avance typiquement de :

```text
1–3 mois
```

Une première carrière se déroule sur environ :

```text
12 mois
```

Un événement de fin devient prioritaire lorsque :

```text
month >= 12
```

### Progression du personnage

Pas de système XP.

La progression du slice vient simplement de :

- stats éventuellement modifiées ;
- traits déjà possédés ;
- état du bateau ;
- objets ;
- relations ;
- PNJ ;
- flags ;
- conséquences passées.

Cela suffit pour tester la carrière.

---

# 9. Sélection du prochain événement

Après chaque résolution :

## Étape 1 — événements différés dus

Chercher :

```text
scheduledEvent.dueAgeMonths <= currentAgeMonths
```

Ils doivent également satisfaire leur `eligibility`.

S'ils sont valides, ils passent avant les événements normaux.

S'ils sont actuellement invalides, ils restent programmés et seront réévalués plus tard.

## Étape 2 — événements normaux

Construire la liste des événements :

```text
non déjà joués
AND
eligibility == true
```

## Étape 3 — priorité

Prendre uniquement ceux ayant la `priority` maximale.

Exemple :

```text
0   événement contextuel normal
50  continuation importante d'un arc
100 événement obligatoire de fin
```

## Étape 4 — variation

S'il reste plusieurs événements de même priorité :

```text
sélection RNG seedée
```

Pas encore de poids différents.

Donc :

```text
Scheduled due
→ Eligibility
→ Priority
→ RNG seulement entre candidats équivalents
```

---

# 10. RNG / DiceCheck vNext

Un seul dé :

```text
d20
```

Tous les jets utilisent le PRNG seedé de la carrière.

Jamais `Math.random()` directement pour une décision de gameplay.

## Contrat

```text
DiceResolution
  statId
  successThreshold
  modifiers?[]
  traitOverrides?[]
  outcomes
    criticalFailure
    failure
    success
    criticalSuccess
```

Une seule statistique principale est utilisée. Les statistiques actives sont limitées à `0–50` et converties en modificateur : zone neutre `20–30`, puis `±1` par tranche de quatre points, jusqu’à `±5`.

Les autres influences sont des modificateurs conditionnels explicites :

ConditionalDiceModifier
  condition
  value
  displayLabel
```

Exemple :

```text
if ship.condition <= 1
  -4

"Bateau endommagé"
```

## Résultat

```text
raw 1
  → criticalFailure absolu

sinon total =
  d20
  + modificateur de stat
  + modificateurs conditionnels actifs

total >= 20
  → criticalSuccess

sinon total >= successThreshold
  → success

sinon
  → failure
```

Les Trait overrides secrets sont appliqués après le résultat numérique, sauf sur un raw 1 qui arrête immédiatement la résolution. La probabilité affichée énumère les 20 résultats possibles sans appliquer ces overrides et n’est jamais persistée.

---

# 11. Contenu test : 7–8 événements

Le but n'est pas encore d'écrire leur prose définitive.

Ils servent de tests fonctionnels.

## E01 — Départ

Fonction :

- événement initial imposé ;
- choix déterministes ;
- départ du port ;
- première modification du GameState.

Teste :

```text
choice
effects
location
time
```

## E02 — La naufragée

Introduction d'un PNJ temporairement nommé `Mira`.

Choix possibles :

```text
la secourir
l'intégrer à l'équipage
la déposer au prochain port
l'abandonner
```

Selon le choix :

```text
relationship
npc.status
flags
```

Teste :

```text
PNJ persistant
relation
conséquence déterministe
```

## E03 — Le grain noir

Tempête en mer.

Choix :

```text
affronter la tempête
chercher un détour
```

Le premier produit un DiceCheck :

```text
Navigation = forte influence
Moral = influence moyenne
Bateau endommagé = malus
```

Résultats possibles :

- catastrophe ;
- échec ;
- réussite avec coût ;
- réussite ;
- réussite exceptionnelle.

Teste :

```text
DiceCheck
modifiers
ship condition
```

## E04 — L'épave

Choix déterministe permettant éventuellement de récupérer :

```text
sealed_chart
```

Pas de RNG.

Teste :

```text
item
choix sans incertitude
```

## E05 — Les récifs

Plusieurs solutions :

```text
Passer au hasard
```

toujours disponible, avec DiceCheck.

```text
[Navigation >= 3] Identifier le chenal
```

visible mais verrouillée si insuffisante.

```text
[sealed_chart] Utiliser la carte
```

masquée sans l'objet.

Une quatrième option peut dépendre d'un trait.

Teste simultanément :

```text
stat condition
item condition
trait condition
hidden vs locked choice
```

---

# 12. Mini-arc de test : Mira

Pas de runtime `Arc` dans Slice 0.

Le moteur voit seulement les événements et le GameState.

## Étape A — `mira_castaway`

Le joueur rencontre Mira.

S'il la recrute :

```text
npc.status = crew
relationship = valeur selon le choix
```

## Étape B — `mira_confession`

Éligibilité :

```text
npcStatusIs("mira", crew)
AND
monthAtLeast(3)
```

Priorité supérieure aux événements contextuels.

Mira révèle qu'elle a volontairement caché une information importante.

Choix :

```text
lui faire confiance
la confronter
la chasser
```

Les choix changent fortement `relationship` et éventuellement `status`.

## Étape C — `mira_hunters`

Éligibilité par exemple :

```text
hasChosen("mira_confession", "trust_mira")
AND
npcStatusIs("mira", crew)
```

Une option supplémentaire apparaît si :

```text
relationship >= 40
```

Cela prouve qu'un arc peut dépendre simultanément :

- d'un événement passé ;
- d'un choix précis ;
- du statut actuel du PNJ ;
- d'une relation persistante.

Aucun objet `ArcState` n'est nécessaire pour ce test.

---

# 13. Conséquence différée de test

Dans `mira_castaway`, si le joueur :

```text
secourt Mira
mais ne la recrute pas
```

alors :

```text
scheduleEvent("mira_returns_favor", +6 mois)
```

Six mois plus tard :

## `mira_returns_favor`

Mira réapparaît parce que le joueur l'a sauvée.

L'événement doit explicitement rappeler cette décision.

Il peut par exemple :

- prévenir le joueur d'un danger ;
- lui fournir une solution spéciale ;
- lui donner un objet ;
- éviter un futur malus.

L'objectif n'est pas l'importance de la récompense.

L'objectif est que le joueur pense :

> « Ça arrive maintenant parce que j'ai fait ça il y a six mois. »

C'est le test le plus important du vertical slice.

---

# 14. PNJ / relation persistante de test

`Mira` suffit pour Slice 0.

Il n'est pas nécessaire d'implémenter cinq PNJ.

Il faut démontrer qu'un seul PNJ peut :

```text
être rencontré
→ obtenir une relation
→ rejoindre ou non l'équipage
→ disparaître
→ revenir
→ offrir des choix différents selon la relation
```

Si cela fonctionne correctement, le modèle sera généralisable aux autres PNJ.

---

# 15. Sauvegarde

Sauvegarde automatique du `GameState` après chaque Outcome résolu.

Le premier slice nécessite uniquement :

```text
New Career
Continue Career
Restart Career
```

Un seul slot.

Pas :

- cloud ;
- comptes ;
- export/import ;
- plusieurs sauvegardes.

---

# 16. Validation minimale obligatoire

Avant de charger le contenu, vérifier au minimum :

```text
IDs d'événements uniques
IDs de choix uniques dans l'événement
références EventId existantes
références NPC/Item/Trait/Stat valides
Conditions reconnues
Effects reconnus
DiceCheck avec bandes valides
ScheduledEvent ciblant un événement existant
```

Les données invalides doivent provoquer une erreur claire en développement.

---

# 17. Mécaniques explicitement repoussées

Après Slice 0 seulement :

- vraie réputation ;
- factions ;
- économie ;
- ressources quantitatives ;
- boutiques ;
- inventaire complexe ;
- rôles/stats des membres d'équipage ;
- recrutement générique ;
- progression XP/niveaux ;
- nouveaux traits en cours de partie ;
- blessures complexes ;
- combat dédié ;
- plusieurs bateaux ;
- modules/améliorations du bateau ;
- déplacement sur carte ;
- distance réelle entre lieux ;
- événements répétables ;
- cooldowns ;
- poids dynamiques des événements ;
- système générique d'arcs ;
- système générique de mémoire ;
- relations PNJ ↔ PNJ ;
- quêtes ;
- journal complexe ;
- texte narratif conditionnel à l'intérieur d'un même événement ;
- génération procédurale de narration ;
- backend ;
- comptes ;
- multijoueur ;
- éditeur de contenu.

---

# 18. Critères d'acceptation du vertical slice

Le slice est considéré fonctionnel si une carrière peut produire une chaîne de ce genre :

```text
Départ
↓
Rencontre Mira
↓
Décision concernant Mira
↓
Tempête influencée par stats + bateau
↓
Obtention éventuelle d'une carte
↓
Passage des récifs avec choix différents selon le GameState
↓
Suite de l'arc Mira OU autre événement
↓
Avancement temporel
↓
Retour différé de Mira plusieurs mois plus tard
↓
Fin de la première année
```

Et surtout si, en rechargeant la page :

```text
la carrière reprend exactement avec
les mêmes choix passés
les mêmes relations
le même bateau
les mêmes conséquences programmées
et le même état narratif.
```

À ce stade, le moteur aura prouvé toutes les propriétés structurantes dont nous avons besoin pour commencer la vraie production de contenu.
