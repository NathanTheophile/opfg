# MAJOR_SAGA_RUNTIME_AUDIT

> **Projet :** One Piece: Destinies  
> **Repository audité :** `NathanTheophile/opfg`  
> **Branche :** `dev`  
> **HEAD vérifié :** `18979eb5e516c1d792278d2dc9dd444d7f992b84`  
> **Mission :** audit strictement read-only du runtime en vue de l'architecture **Major Narrative Tracks**.  
> **État constaté :** Content Schema `10`, Save `19`.

---

# Verdict exécutif

L'architecture cible peut être ajoutée **sans nouvel état persistant de saga dans `GameState`**.

Le runtime possède déjà les briques nécessaires :

- `HistoryEntry` mémorise `eventId`, `choiceId`, `outcomeId`, `ageMonths` ;
- les Conditions savent relire Race, affiliation familiale, structure familiale, classe sociale, Traits, History et états de NPC ;
- les parents sont déjà des NPC persistants materialisés selon la structure familiale ;
- les Normal Events consomment déjà un slot ;
- Immediate et Scheduled possèdent déjà leurs propres sémantiques de priorité et de consommation du temps ;
- le RNG seedé permet de choisir uniformément une variante parmi un pool éligible.

La solution minimale recommandée est donc :

1. ajouter des **définitions de Major Narrative Track** au `ContentCatalog` ;
2. annoter les **Normal Events de chapitre** avec `trackId + chapterId` ;
3. dériver les chapitres déjà joués depuis `History` ;
4. sélectionner dynamiquement la variante du prochain chapitre selon **l'état actuel** ;
5. empêcher les variantes Major Track d'entrer dans le pool Normal ordinaire ;
6. remplacer l'ancienne garantie `lifetimeThreadSeed` par la garantie Family Saga.

**Content Schema bump : oui, 10 → 11.**  
**Save bump requis par le système Major Saga seul : non.**  
**Save bump recommandé pour le Content Reset V2 global : oui**, car les saves V19 peuvent contenir des `currentEventId`, Immediate, Scheduled et History pointant vers des Events legacy qui seront retirés du runtime.

---

# 1. Fichiers runtime concernés

## Modifications nécessaires — cœur Major Saga

### `src/game/content/schema.ts`

Responsabilité actuelle :

- contrat Content Schema ;
- `Condition`, `Effect`, `EventDefinition` ;
- `ContentCatalog` ;
- metadata D1.9 `narrativeFamily` / `openingRole` ;
- `lifetimeThreadSeed`.

Changements nécessaires :

- `CONTENT_SCHEMA_VERSION = 11` ;
- types `MajorNarrativeTrackDefinition` / `MajorNarrativeChapterDefinition` ;
- metadata de rattachement d'un Normal Event à un chapitre ;
- ajout des Major Tracks au `ContentCatalog`.

### `src/game/content/catalogFactory.ts`

Responsabilité actuelle :

- définitions Race ;
- affiliations familiales ;
- structures familiales ;
- classes sociales ;
- NPC persistants ;
- assemblage du `ContentCatalog`.

Changements nécessaires :

- déclarer les 5 `family_legacy` tracks V1 jouables ;
- probablement centraliser les 5 checkpoints Childhood ;
- si le verrouillage Origins est traité dans la même migration, exposer la disponibilité V1 des Race/Affiliations ou les gates équivalentes.

### `src/game/engine/events.ts`

C'est le **point central de la refonte**.

Responsabilité actuelle :

- ordre global de sélection ;
- Critical ;
- Immediate ;
- Scheduled ;
- Normal ;
- D1.9 Opening composition ;
- garantie Lifetime Thread ;
- fallback Active ;
- RNG uniforme.

Changements nécessaires :

- dérivation des chapitres Major Track déjà joués depuis `History` ;
- identification du premier chapitre Family incomplet ;
- notion `due` / `overdue` ;
- sélection seedée d'une variante éligible ;
- exclusion des variantes Major Track du pool Normal ordinaire ;
- suppression/remplacement du selector D1.9 `selectEarlyChildhoodOpeningCandidates` lorsque le Content Reset V2 est effectif ;
- suppression de `shouldGuaranteeLifetimeThread` comme garantie narrative obligatoire.

## Modifications nécessaires — validation / diagnostics

### `src/game/validation/validateContent.ts`

À étendre pour valider :

- définitions de tracks ;
- références track/chapter ;
- nombre de chapitres ;
- checkpoints ;
- fallback de chapitre ;
- incompatibilités de metadata ;
- couverture minimale.

### `src/game/simulation/diagnostics.ts`

Les diagnostics actuels connaissent explicitement les Lifetime Threads.

À ajouter/remplacer :

- saga familiale manquante pour affiliation jouable ;
- chapitre manquant ;
- fallback manquant ;
- chapitre sans variante spécialisée ;
- couverture Race / structure familiale / classe sociale insuffisante ;
- track/chapter sans Event.

## Modifications nécessaires — simulations / métriques

### `src/game/simulation/simulateRun.ts`
### `src/game/simulation/simulateBatch.ts`
### `src/game/simulation/types.ts`

Les simulations exposent aujourd'hui :

- `lifetimeThreadStarted` ;
- `reachedActiveWithoutLifetimeThread`.

Il faut ajouter à terme :

- Family Saga sélectionnée ;
- nombre de chapitres Family résolus ;
- chapitre IDs résolus ;
- `reachedActiveWithoutFiveFamilyChapters` ;
- distribution de variantes par affiliation / Race / structure familiale.

La métrique Lifetime peut rester si les Lifetime Threads deviennent des trames secondaires facultatives, mais elle ne doit plus servir de critère de continuité principale.

---

# 1.1 Fichiers inspectés qui peuvent rester inchangés pour la feature pure

### `src/game/engine/resolution.ts`

Aucun changement requis si un chapitre Major Saga reste un **Normal Event**.

Le système actuel :

- applique les Effects ;
- écrit automatiquement l'Event dans `History` ;
- gère la queue Immediate ;
- consomme le slot Normal/Scheduled ;
- appelle ensuite `selectNextEvent`.

C'est exactement ce qu'il faut.

### `src/game/model/schema.ts`

Aucun nouvel état Saga n'est nécessaire si la progression est dérivée de `History`.

### `src/game/model/initialState.ts`

Pas de champ Saga à initialiser.

### `src/game/engine/time.ts`

Pas de changement nécessaire pour obtenir 5 chapitres Childhood.

Le rythme actuel produit 20 slots Childhood aux âges :

```text
12, 24, 36, 48, 60, 72, 84, 96,
108, 114, 120, 126, 132, 138, 144,
150, 156, 162, 168, 174 mois
```

Une cadence Family simple et bien espacée peut donc être :

```text
Chapter 1 : 12 mois   (~1 an)
Chapter 2 : 48 mois   (~4 ans)
Chapter 3 : 84 mois   (~7 ans)
Chapter 4 : 120 mois  (~10 ans)
Chapter 5 : 156 mois  (~13 ans)
```

Cela donne exactement **5 Family roots sur 20 slots Childhood**, soit 25 % des roots.

---

# 1.2 Fichiers concernés par le Content Reset, mais pas par Major Saga lui-même

### `src/game/content/eventCatalog.ts`

Le loader actuel charge récursivement :

```text
./events/**/*.json
```

Donc l'archive Legacy doit être physiquement hors de ce chemin, ou le glob doit être resserré vers le contenu V2.

### `src/game/engine/save.ts`

Pas nécessaire pour Major Saga seule.

Devient nécessaire si le Content Reset invalide les saves actuelles ou si une migration explicite est décidée.

---

# 1.3 Verrouillage temporaire Origins

Les Events :

- `origin_race.json`
- `origin_affiliation.json`

exposent actuellement toutes les options sans `availableIf`.

Le runtime possède déjà le comportement recherché :

```text
visible = true
available = false
```

via `ChoiceDefinition.availableIf` + `getChoiceState()`.

Mais il n'existe actuellement **aucune Condition propre représentant “option V1 verrouillée”**.

Il faut donc une petite décision séparée :

- soit un gate de contenu explicite dans le schema ;
- soit une disponibilité V1 sur les définitions + Condition associée ;
- éviter un faux `hasFlag` impossible servant uniquement de hack.

Cible :

```text
Affiliations jouables :
civilian
marine
pirate
revolutionary
royal_family

Affiliations visibles/verrouillées :
bandit
prisoner
slave
celestial_dragon

Races jouables :
human
fishman
mink
giant

Races visibles/verrouillées :
longarm
buccaneer
```

---

# 2. Fonctionnement actuel de sélection

`selectNextEvent()` suit actuellement cet ordre :

```text
0. careerStatus ended
   → aucun Event

1. Critical
   ↓
2. Monthly Navigation Decision
   ↓
3. Immediate queue
   ↓
4. Ship Market Arrival special injection
   ↓
5. Scheduled dû
   ↓
6. Normal candidates
   ↓
7. D1.9 Early Childhood Opening filtering
   ↓
8. Lifetime Thread guarantee à partir de 120 mois
   ↓
9. tirage Normal uniforme seedé
```

Si aucun Normal n'est disponible :

- Childhood/Origins → `currentEventId = null` : vrai content dead-end ;
- Active → tentative du fallback terre/mer.

## Sélection Scheduled

Les Scheduled dus sont :

1. filtrés sur `dueAgeMonths <= ageMonths` ;
2. annulés/remplacés via `cancelIf/fallbackEventId` ;
3. bloqués si la Location bloque le Scheduled normal ;
4. filtrés par `eligibility` ;
5. triés :

```text
priority DESC
dueAgeMonths ASC
eventId ASC
```

Le premier est joué.

---

# 3. Interactions Critical / Immediate / Scheduled / Normal

## Critical

Les Criticals sont évalués **avant tout le reste**.

Triggers actuels :

- joueur à 0 Health ;
- NPC à 0 Health ;
- bateau détruit ;
- bateau manquant en mer ;
- remplacement de bateau pending ;
- fallback streak ;
- horizon d'âge de carrière.

Un Critical ne consomme pas lui-même un slot Normal/Scheduled.

Il peut interrompre une chaîne puisque `selectNextEvent()` cherche d'abord un Critical avant de regarder `immediateEventQueue`.

## Immediate

Un Immediate :

- doit être à la tête de `immediateEventQueue` ;
- ne consomme pas un nouveau slot ;
- appartient à la résolution d'un Normal/Scheduled précédent ;
- est protégé par un guard de 1000 Immediate par chaîne.

Si un Normal/Scheduled a créé une queue Immediate :

```text
Normal/Scheduled
→ pendingSlotPhase mémorisé
→ Immediate(s)
→ slot consommé seulement quand la queue est vide
```

Si un Critical apparaît entre-temps, le slot reste pending jusqu'à résolution du Critical.

## Scheduled

Un Scheduled :

- est un Event distinct avec entrée `scheduledEvents` ;
- consomme **un slot**, comme un Normal ;
- peut lancer des Immediate ;
- reste pending s'il est dû mais momentanément inéligible/bloqué ;
- peut être annulé ou redirigé par `cancelIf/fallbackEventId`.

## Normal

Un Normal :

- est one-shot par défaut ;
- peut être replayable explicitement ;
- consomme un slot ;
- peut lancer Immediate et Scheduled ;
- est actuellement le support des D1.9 Opening Events et des Lifetime Thread seeds.

---

# 3.1 Priorité recommandée avec Major Saga

Pour garantir cinq chapitres sans écraser les Scheduled, je recommande :

```text
1. Critical
2. Navigation/System gate existant
3. Immediate
4. System injections existantes
5. Major Track OVERDUE
6. Scheduled dû
7. Major Track nouvellement DUE
8. Normal ordinaire
```

Raison :

- un Scheduled peut occuper le slot exact où un chapitre devient dû ;
- au slot suivant, le chapitre devient `overdue` et passe devant les nouveaux Scheduled ;
- le Scheduled conserve donc sa priorité ponctuelle ;
- la Major Saga ne peut pas être affamée pendant plusieurs années.

Exemple :

```text
Chapter IV due à 120
Scheduled dû à 120

120 : Scheduled
→ âge avance

126 : Chapter IV est overdue
→ Chapter IV prioritaire
```

Cette règle protège particulièrement le Chapter V avant le passage en Active.

---

# 4. Ancienne garantie Lifetime Thread

Le runtime possède une garantie dédiée :

```text
careerPhase === childhood
ageMonths >= 120
aucun lifetimeThreadSeed déjà vu
```

À ce moment, le pool Normal est filtré vers les Normal Events ayant :

```text
lifetimeThreadSeed: true
```

Si aucun seed n'est éligible, le moteur retombe sur le pool ordinaire.

Ce n'est donc pas une garantie absolue : c'est une préférence forcée lorsqu'un seed est disponible.

## Détection actuelle

`hasStartedLifetimeThread()` :

1. construit la liste des IDs actuellement déclarés `lifetimeThreadSeed` dans le catalogue ;
2. regarde si un de ces IDs apparaît dans `History`.

Conséquence importante :

> si un ancien seed disparaît du catalogue, son ancienne entrée History ne compte plus comme Lifetime Thread démarrée.

## Recommandation

Avec Family Legacy Saga garantie :

- supprimer `shouldGuaranteeLifetimeThread()` ;
- supprimer son influence sur le selector ;
- remplacer les tests de garantie ;
- remplacer les critères simulation associés.

`lifetimeThreadSeed` peut être conservé temporairement comme metadata pour des **trames secondaires facultatives**, mais ne doit plus représenter la colonne vertébrale obligatoire d'une run.

---

# 5. Changements schema nécessaires

## Content Schema

**Bump recommandé : 10 → 11.**

API minimale :

```ts
export type MajorNarrativeTrackType =
  | 'family_legacy'
  | 'personal_affiliation';

export interface MajorNarrativeChapterDefinition {
  id: string;
  phase: CareerPhase;
  dueAgeMonths: number;
}

export interface MajorNarrativeTrackDefinition {
  id: string;
  type: MajorNarrativeTrackType;
  eligibility: Condition;
  chapters: MajorNarrativeChapterDefinition[];
}

export interface MajorTrackEventRef {
  trackId: string;
  chapterId: string;
  fallback?: true;
}
```

Puis seulement sur les Normal Events :

```ts
kind: 'normal';
majorTrack?: MajorTrackEventRef;
```

Et dans le catalogue :

```ts
majorNarrativeTracks: MajorNarrativeTrackDefinition[];
```

## Pourquoi le track est une définition séparée

Cela évite de répéter sur chaque Event :

- type de saga ;
- ordre des chapitres ;
- checkpoints ;
- activation globale.

Les Events ne décrivent que :

> « je suis une variante du chapitre X de la saga Y ».

## Pourquoi le chapitre reste un Normal Event

Cela conserve gratuitement :

- Conditions ;
- Choices ;
- Dice ;
- Effects ;
- cast ;
- localisation ;
- History ;
- Immediate ;
- Scheduled ;
- consommation d'un slot ;
- RNG existant.

Aucun `MajorSagaEvent` kind supplémentaire n'est nécessaire.

---

# 5.1 Règle de fallback recommandée

Chaque chapitre doit avoir **exactement un fallback**.

Exemple :

```ts
majorTrack: {
  trackId: 'family_marine',
  chapterId: 'childhood_03',
  fallback: true
}
```

Sélection d'un chapitre :

```text
variantes spécialisées éligibles ?
    oui → tirage uniforme entre elles
    non → fallback
```

Le fallback ne doit normalement avoir aucune eligibility restrictive propre.

Cela résout deux problèmes :

1. la saga ne deadlock jamais ;
2. le fallback générique ne dilue pas les variantes Race / parents / classe lorsqu'une variante spécialisée existe.

---

# 5.2 Progression dérivée de History

Pour un track :

```text
History
→ Event IDs
→ lookup EventDefinition
→ majorTrack.trackId/chapterId
→ set des chapitres déjà joués
→ premier chapitre incomplet
```

Aucun compteur :

```text
familySagaChapter = 3
```

n'est nécessaire dans `GameState`.

Les choix antérieurs restent disponibles via :

- `hasChosen`
- `hasOutcome`
- `hasPlayed`

Les parents peuvent être interrogés via :

- `npcStatusIs`
- relationship
- Stats
- récence d'interaction.

La structure familiale initiale reste distincte de l'état actuel des parents.

Exemple important :

```text
familyStructureIs(two_parents)
```

signifie :

> le personnage est né avec deux parents.

Cela ne signifie pas :

> les deux parents sont encore vivants/présents.

Une variante tardive doit donc combiner, selon le besoin :

```text
familyStructureIs(...)
npcStatusIs(player_parent_1, ...)
npcStatusIs(player_parent_2, ...)
```

---

# 6. Peut-on éviter un Save bump ?

## Pour Major Saga seule : OUI

Aucun champ supplémentaire n'est nécessaire dans `GameState`.

Actuellement :

```text
Save version = 19
```

peut rester valide si :

- les anciens Event IDs restent dans le catalogue ;
- aucune queue/entrée Scheduled existante n'est invalidée ;
- on ajoute simplement les nouvelles metadata et la nouvelle sélection.

## Pour le Content Reset V2 global : JE DÉCONSEILLE de conserver V19

Le loader V19 accepte des History Entries uniquement comme chaînes :

```text
eventId
choiceId
outcomeId
ageMonths
```

Il ne vérifie pas que l'Event existe encore dans le catalogue.

Après une table rase runtime, une ancienne save peut donc contenir :

### `currentEventId` supprimé

La save charge, mais `findCurrentEvent()` ne trouvera plus l'Event.

### `immediateEventQueue` supprimée

`selectNextEvent()` lève explicitement une erreur si l'Immediate pending n'existe plus.

### `scheduledEvents` supprimés

Un Scheduled dont la définition n'existe plus est ignoré par le selector, mais son entrée reste dans la liste.

### `History` Legacy

Les anciennes lignes restent chargées, mais leurs anciennes metadata ne peuvent plus être reconstruites si les EventDefinitions sont sorties du catalogue.

### Progression Family Saga sur une save déjà âgée

Un personnage chargé à 11 ans sans chapitres V2 en History ne peut pas magiquement avoir vécu les chapitres 1–3.

## Recommandation de migration

Distinguer deux changements :

### Major Saga Runtime
Peut techniquement rester Save 19.

### Content Reset V2
Faire volontairement un **Save 20 / nouvelle run obligatoire**, ou une migration explicitement assumée.

Vu la refonte complète du catalogue, la nouvelle run est nettement plus sûre qu'une pseudo-compatibilité sémantiquement fausse.

---

# 7. Modifications validator nécessaires

## Erreurs structurelles

Le validator doit refuser :

### Track invalide

- ID dupliqué ;
- type inconnu ;
- eligibility invalide ;
- chapitre dupliqué ;
- checkpoints non strictement croissants ;
- checkpoint incompatible avec `phase`.

### Family Legacy invalide

Pour la V1 actuelle :

- aucune saga pour une affiliation jouable ;
- plusieurs sagas Family éligibles pour la même affiliation ;
- nombre de chapitres Childhood différent de 5 ;
- chapitre à `ageMonths >= 180`.

### Event variant invalide

- `majorTrack` sur autre chose qu'un Normal ;
- `trackId` inconnu ;
- `chapterId` inconnu ;
- Event `majorTrack` replayable ;
- Event `majorTrack` également `lifetimeThreadSeed` ;
- Event `majorTrack` également `openingRole` ;
- plusieurs fallbacks pour le même chapitre ;
- aucun fallback.

## Diagnostics / warnings

Ajouter au minimum :

```text
major-track-chapter-low-variants
major-track-race-coverage
major-track-family-structure-coverage
major-track-social-class-coverage
major-track-history-branching-low
```

Ces diagnostics sont des heuristiques de qualité, pas des preuves de reachability.

Le validator doit rester strict sur la structure, pas prétendre résoudre toutes les intersections de Conditions.

---

# 8. Tests à ajouter / remplacer

## A. Sélection de saga

1. `family_marine` sélectionné pour une origine Marine.
2. aucune saga Family concurrente sélectionnée.
3. variante Fish-Man choisissable uniquement si `raceIs(fishman)`.
4. variante orphan différente d'une variante parents.
5. variante social class réévaluée avec l'état courant.
6. choix antérieur (`hasChosen/hasOutcome`) affecte un chapitre ultérieur.
7. changement de statut d'un parent entre deux chapitres modifie la variante sélectionnée.

## B. Progression

8. Chapter 1 ne peut être joué qu'une fois.
9. une autre variante du même chapitre ne peut jamais ressortir après complétion.
10. Chapter 2 n'apparaît pas avant Chapter 1.
11. exactement 5 chapitres Family avant Active.
12. aucun sixième chapitre Childhood.
13. chapitre dû mais retardé devient `overdue`.
14. chapitre overdue n'est pas perdu.

## C. Priorités

15. Critical > Major Track.
16. Immediate > Major Track.
17. Scheduled > Major Track lorsqu'il vient juste d'être dû au même checkpoint.
18. Major Track overdue > nouveau Scheduled.
19. un Major chapter avec Immediate chain ne consomme toujours qu'un slot.

## D. RNG

20. plusieurs variantes spécialisées éligibles → sélection uniforme seedée.
21. même seed + même état → même variante.
22. fallback sélectionné uniquement si aucune variante spécialisée n'est éligible.

## E. Validator

23. track ID inconnu rejeté.
24. chapter ID inconnu rejeté.
25. chapitre sans fallback rejeté.
26. deux fallbacks rejetés.
27. Major variant replayable rejeté.
28. track Family avec != 5 chapitres rejeté.
29. checkpoint >= 180 rejeté.

## F. Origins locking

30. Longarm visible mais `available === false`.
31. Buccaneer visible mais verrouillé.
32. Bandit/Prisoner/Slave/Celestial Dragon visibles mais verrouillés.
33. appel direct `resolveChoice()` sur un choix verrouillé → erreur.
34. les 4 Race jouables restent sélectionnables.
35. les 5 affiliations familiales jouables restent sélectionnables.

## G. Simulation

Remplacer l'ancien critère :

```text
reachedActiveWithoutLifetimeThread === 0
```

par :

```text
reachedActiveWithoutFiveFamilyChapters === 0
```

Et mesurer la diversité des variantes entre runs.

---

# 9. Risques de migration / architecture

## Risque 1 — collision avec D1.9 Opening

`events.ts` possède déjà un selector spécial 1–5 ans.

Si on laisse simultanément :

- `openingRole` hard selection ;
- Major Saga Chapter I/II ;
- garantie Lifetime Thread ;

on obtient trois systèmes qui se disputent le même pool Childhood.

**Recommandation :** dans le Content Reset V2, retirer le comportement runtime D1.9 Opening. Les idées D1.9 deviennent des seeds d'authoring, pas une seconde orchestration concurrente.

---

## Risque 2 — variantes Major présentes dans le pool Normal

Un Major Chapter reste techniquement `kind: normal`.

Si le pool Normal ne les exclut pas explicitement, une variante de Chapter IV peut être tirée comme Event ordinaire.

**Blocant :**

```text
Normal ordinary pool
EXCLUT event.majorTrack !== undefined
```

Seul le selector Major Track peut les injecter.

---

## Risque 3 — autre variante d'un chapitre déjà joué

`isNormalOccurrenceEligible()` ne bloque que le même Event ID.

Après :

```text
family_marine_ch02_fishman
```

il autoriserait encore :

```text
family_marine_ch02_generic
```

car ce sont deux IDs différents.

Le selector Major Track doit donc bloquer **le chapitre entier** via History, pas seulement l'Event déjà joué.

---

## Risque 4 — starvation par Scheduled

Si Scheduled reste toujours au-dessus d'une saga due, une série de callbacks peut repousser le Chapter V jusqu'à Active.

La distinction `due / overdue` règle ce problème sans sacrifier la priorité ponctuelle des Scheduled.

---

## Risque 5 — trous de couverture horizontale

Un chapitre peut avoir :

- une variante Fish-Man ;
- une variante deux parents ;
- une variante riche ;

sans rien pour :

```text
Giant + orphan + poor
```

D'où l'obligation d'un fallback universel par chapitre.

---

## Risque 6 — sur-spécialisation combinatoire

Ne pas créer le produit cartésien :

```text
Race × parents × classe × lieu × choix précédents
```

Les variantes doivent exister seulement lorsque la combinaison change réellement la situation.

Le fallback garantit la sécurité ; les diagnostics mesurent la largeur.

---

## Risque 7 — contenu Legacy dans les saves

La table rase physique rend les IDs Legacy potentiellement orphelins dans :

- current Event ;
- Immediate queue ;
- Scheduled queue ;
- History.

C'est le principal argument pour un reset de save lors du passage V2.

---

## Risque 8 — RNG stream

Ajouter une sélection Major Track seedée introduit de nouveaux appels à `nextRandom`.

Les runs avec un seed historique ne reproduiront donc pas nécessairement la même biographie qu'avant D2.

Ce n'est pas un bug.

Le contrat à conserver est :

> même version de contenu + même état + même seed = même résultat.

Pas :

> un seed V1 doit produire la même run après refonte narrative.

---

## Risque 9 — future Personal Affiliation Saga

Le moteur peut être générique dès maintenant, mais il ne faut pas figer trop tôt la sémantique du changement de carrière.

Questions à laisser explicitement ouvertes pour Active :

- une carrière changée active-t-elle un nouveau Personal Track ?
- l'ancien track continue-t-il ?
- un changement temporaire suspend-il ou termine-t-il la saga ?
- combien de tracks personnels peuvent coexister ?

Le schema générique peut exister sans décider ces règles maintenant.

---

# 10. Proposition minimale d'API / metadata générique

## Content definitions

```ts
type MajorNarrativeTrackType =
  | 'family_legacy'
  | 'personal_affiliation';

interface MajorNarrativeChapterDefinition {
  id: string;
  phase: CareerPhase;
  dueAgeMonths: number;
}

interface MajorNarrativeTrackDefinition {
  id: string;
  type: MajorNarrativeTrackType;
  eligibility: Condition;
  chapters: MajorNarrativeChapterDefinition[];
}

interface MajorTrackEventRef {
  trackId: string;
  chapterId: string;
  fallback?: true;
}
```

## Normal Event

```ts
{
  id: 'family_marine_c03_fishman_parent',
  kind: 'normal',

  majorTrack: {
    trackId: 'family_marine',
    chapterId: 'childhood_03'
  },

  eligibility: {
    type: 'all',
    conditions: [
      { type: 'raceIs', raceId: 'fishman' },
      { type: 'familyStructureIs', familyStructureId: 'single_parent' },
      { type: 'npcStatusIs', npcId: 'player_parent_1', status: 'known' }
    ]
  },

  ...
}
```

## Fallback

```ts
{
  id: 'family_marine_c03_fallback',
  kind: 'normal',

  majorTrack: {
    trackId: 'family_marine',
    chapterId: 'childhood_03',
    fallback: true
  },

  ...
}
```

## Runtime derivation

Conceptuellement :

```text
eligible Major Tracks
→ Family track correspondant à Origins
→ History → chapitres déjà résolus
→ premier chapitre incomplet
→ checkpoint atteint ?
→ due / overdue
→ variantes spécialisées du chapitre
→ evaluateCondition(state ACTUEL)
→ tirage seedé uniforme
→ sinon fallback
```

Aucun :

```text
ArcState
currentSagaChapter
familySagaProgress
chapterCounter
```

dans `GameState`.

---

# 10.1 Structure V1 Family recommandée

```text
family_civilian
family_marine
family_pirate
family_revolutionary
family_royal
```

Chapitres :

```text
childhood_01 @ 12
childhood_02 @ 48
childhood_03 @ 84
childhood_04 @ 120
childhood_05 @ 156
```

Tous les chapitres sont sélectionnés selon l'état actuel.

La Race, les parents, la richesse et les choix antérieurs sont donc des **axes horizontaux de variantes**, pas des sagas séparées.

---

# Plan d'implémentation recommandé après validation design

## Étape A — Content Reset / autorités

Avant le moteur :

- geler Legacy ;
- retirer D1.9 du statut runtime accepté ;
- créer les autorités V2 ;
- figer le contrat Major Track.

## Étape B — Origins lock

Petit changement indépendant.

## Étape C — Schema 11

Ajouter uniquement :

- Major Track definitions ;
- Event ref ;
- éventuellement le content gate Origins.

## Étape D — selector

Refactor ciblé de `events.ts` :

- retirer D1.9 hard selector ;
- retirer garantie Lifetime obligatoire ;
- ajouter Major due/overdue ;
- exclure Major variants du Normal pool.

## Étape E — validator + diagnostics

Avant la production massive.

## Étape F — prototype Marine

Seulement :

```text
5 chapitres
2–4 variantes par chapitre
```

Puis playtests sur plusieurs Origins.

---

# Conclusion

Le runtime actuel est **bien adapté** à cette refonte.

La meilleure propriété à préserver est sa philosophie actuelle :

> le contenu décrit les situations ; `History` porte la mémoire ; le moteur orchestre sans stocker un ArcState parallèle.

La Major Saga doit être un **orchestrateur de pools de Normal Events**, pas un nouveau scheduler et pas un nouveau système de quête.

Le changement technique principal est concentré dans `events.ts` + Content Schema/validator.

Le changement risqué n'est pas Major Saga lui-même : c'est **la compatibilité des anciennes saves avec la table rase du catalogue**.

Décision recommandée :

```text
Major Saga architecture
→ aucun nouveau GameState
→ Schema 11
→ 5 Family chapters dérivés de History
→ Save bump non requis techniquement

Content Reset V2
→ nouvelle run / Save 20 recommandé
```
