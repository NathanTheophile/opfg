# OPFG — Game Design

> **Status: Game Design authority for the current jam scope**
>
> Toute règle de gameplay non présente ici doit être considérée comme non verrouillée, sauf si explicitement définie par un document spécialisé référencé.

Ce document consolide les décisions Game Design validées pour la jam. Les documents spécialisés restent autorités sur leurs domaines techniques, mais une ancienne hypothèse de gameplay contradictoire ne prévaut pas sur ce document.

## 1. Vision d’une run

Une run représente la construction puis la carrière d’un personnage dans un univers maritime aventureux inspiré de One Piece. Sa durée cible est d’environ **10 à 45 minutes**, selon la trajectoire et la longévité du personnage.

Une carrière traverse trois phases, dans cet ordre :

1. `origins` ;
2. `childhood` ;
3. `active`.

Le personnage peut mourir. D’autres formes de fin ou de legacy pourront exister, mais elles ne sont pas encore définies.

## 2. Origins

Les Origins forment une **séquence fixe de questions à réponses fixes**. Elles construisent progressivement le profil du personnage :

- nom ;
- race ;
- mer d’origine ;
- affiliation familiale héritée des parents ;
- background familial et environnement de naissance ;
- autres paramètres qui seront définis ultérieurement.

L’affiliation du profil désigne l’origine familiale, pas nécessairement une future affiliation active. Une éventuelle distinction avec une affiliation actuelle sera conçue plus tard.

Les réponses peuvent appliquer des bonus ou malus de statistiques. Ces conséquences sont **toujours visibles avant le choix**, afin que le joueur puisse orienter volontairement son build, par exemple `+2 Observation / -1 Force`.

La valeur de référence initiale est `25`, mais les Origins peuvent déjà différencier le profil. Aucun budget universel rigide de bonus ou malus n’est fixé à ce stade.

## 3. Statistiques du joueur

| Statistique | ID |
| --- | --- |
| Santé | `health` |
| Moral | `morale` |
| Force | `strength` |
| Observation | `observation` |
| Intelligence | `intelligence` |
| Navigation | `navigation` |
| Charisme | `charisma` |
| Chance | `luck` |
| Éveil | `awakening` |

La plage normale est `0–50`. `awakening` reste `null` et inaccessible tant que son système n’est pas activé. La valeur technique de départ actuelle est `25`, avant modifications des Origins.

### Modificateur D20 dérivé

| Valeur | Modificateur |
| --- | --- |
| 0–3 | -5 |
| 4–7 | -4 |
| 8–11 | -3 |
| 12–15 | -2 |
| 16–19 | -1 |
| 20–30 | 0 |
| 31–34 | +1 |
| 35–38 | +2 |
| 39–42 | +3 |
| 43–46 | +4 |
| 47–50 | +5 |

La zone `20–30` est neutre. Au-dessus de 30 ou sous 20, chaque palier de quatre points ajoute respectivement `+1` ou `-1`.

## 4. Childhood

Childhood couvre la vie avant l’aventure principale, qui commence toujours à **15 ans**. La naissance et la création du profil appartiennent aux Origins : il n’existe aucun Event pour « l’année 0 ».

### Cadence et temps

| Âges | Cadence | Nombre de slots | Temps par Event consommé |
| --- | --- | --- | --- |
| 1 à 8 ans inclus | 1 Event par an | 8 | +12 mois |
| 9 à 14 ans inclus | 2 Events par an | 12 | +6 mois |

Une enfance complète comporte donc **20 slots**. À 15 ans, la carrière passe en `active`.

Le temps appartient à la boucle de phase : un Outcome Childhood normal ne choisit pas librement sa durée.

### Nature des Events Childhood

L’enfance doit structurer le personnage. Ses Events peuvent notamment :

- modifier des statistiques ;
- donner des Traits positifs ou négatifs ;
- créer rencontres et relations ;
- introduire objets, souvenirs ou flags ;
- ouvrir des mini-arcs ;
- programmer des conséquences différées.

Tous les Events n’accordent pas nécessairement une récompense numérique. Pour un ensemble représentatif de 20 Events, la cible de production est approximativement :

- 12 Events principalement statistiques ;
- 3 Events orientés Traits ;
- 5 Events narratifs ou non statistiques.

Cette répartition guide la production de contenu ; ce n’est pas un quota construit par le runtime. Une enfance complète doit permettre l’acquisition d’au moins **2 Traits**.

## 5. Active

Active commence toujours à **15 ans** et utilise **2 slots d’Event par mois**, soit au maximum 24 Events consommant un slot par année complète, hors Critical Events.

Un slot peut être consommé par un Event normal, Scheduled, une conséquence, une suite d’arc ou une rencontre programmée. La provenance ne change pas son coût.

Le GameState doit conceptuellement suivre `slotInMonth: 0 | 1` :

- mois 0, slot 0 ;
- mois 0, slot 1 ;
- puis mois 1, slot 0.

Deux slots consommés font avancer l’âge biologique d’un mois. Comme en Childhood, le temps appartient à la boucle de phase, pas à l’Outcome.

## 6. Sélection des Events normaux

À chaque slot normal :

1. déterminer tous les Events normaux éligibles ;
2. exclure ceux déjà joués ;
3. tirer uniformément parmi les Events restants.

Tous les Events normaux sont **one-shot en V1**. Il n’existe ni `repeatable`, ni cooldown, ni compteur de répétition. Deux situations proches nécessitent deux Events distincts.

Il n’existe aucun poids de rareté (`weight`, common/uncommon/rare ou probabilité individuelle cachée). La rareté découle uniquement des Conditions d’éligibilité : âge, géographie, voyage, profil, statistiques, Traits, historique, flags, items, NPC et autres Conditions déclaratives supportées. Une fois éligibles, les Events ont la même probabilité.

La priorité ne sert pas à sélectionner les Events normaux.

## 7. Temps et Conditions temporelles

- `ageAtLeastMonths` porte sur l’âge biologique absolu ;
- `ageAtMostMonths` fixe sa borne supérieure ;
- `delayMonths` exprime un délai calendaire relatif pour une conséquence programmée.

Une conséquence programmée à 17 ans avec `delayMonths: 18` devient due 18 mois calendaires plus tard.

`monthAtLeast` est considéré comme redondant puisque l’ancienneté Active est dérivable de l’âge biologique. Il doit être retiré du contrat de contenu lors de la prochaine passe technique. **Aucune suppression n’est réalisée dans la présente tâche documentaire.**

## 8. Scheduled Events

Un Event `scheduledOnly` ne peut jamais venir du pool normal : une conséquence antérieure doit l’avoir programmé. Lorsqu’il est joué, il consomme un slot normal. Une conséquence Childhood peut devenir due pendant Childhood ou après le passage en Active.

### Sélection et priorité

Avant le pool normal :

1. chercher les Scheduled Events dus ;
2. conserver ceux actuellement exécutables ;
3. sélectionner le plus prioritaire ;
4. laisser les autres pending ;
5. utiliser le pool normal seulement si aucun Scheduled Event exécutable n’existe.

Niveaux conventionnels :

- `50` : faible ;
- `100` : normal ;
- `200` : important ;
- `300` : critique.

À priorité égale, l’échéance la plus ancienne gagne, puis l’Event ID départage déterministement. La priorité représente l’urgence narrative, jamais la rareté.

Un Scheduled Event dû mais temporairement impossible reste pending et est réévalué aux slots suivants.

### Portée géographique

Une Location pourra définir `blocksScheduledEvents: boolean`. Un Scheduled Event disposera de :

- `scheduledReach: 'normal'` : respecte le blocage et reste pending si nécessaire ;
- `scheduledReach: 'unrestricted'` : peut arriver malgré ce blocage.

Aucune autre portée n’est définie en V1.

### Annulation et fallback

Un Scheduled Event pourra définir `cancelIf?: Condition` et éventuellement `fallbackEventId?: EventId` :

- `cancelIf` faux ou absent : une impossibilité temporaire laisse l’Event pending ;
- `cancelIf` vrai avec fallback : utiliser le fallback ;
- `cancelIf` vrai sans fallback : annuler définitivement l’Event.

L’architecture doit permettre le fallback, mais le contenu initial n’a pas besoin d’en utiliser.

## 9. Traits

Les Traits sont des caractéristiques importantes, positives ou négatives, acquises au cours de la vie. Ils peuvent servir de Conditions, contrôler la visibilité ou la disponibilité de Choices et interagir secrètement avec un DiceCheck uniquement lorsque ce dernier le déclare explicitement.

Deux Traits contradictoires ne peuvent pas coexister. Les oppositions sont définies symétriquement ; acquérir un Trait rend son opposé incompatible. Les Traits et statistiques du joueur sont inspectables : il n’existe pas de système général de statistiques cachées.

## 10. D20

Un DiceCheck combine :

- un d20 ;
- une Stat et son modificateur dérivé ;
- d’éventuels modificateurs conditionnels explicites ;
- un seuil de réussite ;
- quatre résultats : `criticalFailure`, `failure`, `success`, `criticalSuccess`.

Un 1 naturel est immédiatement un échec critique. Un total supérieur ou égal à 20 est un succès critique. Les interactions secrètes de Traits ne s’appliquent que si le DiceCheck les configure explicitement.

Une future animation 3D du d20 sera purement visuelle : le moteur détermine toujours le résultat avant l’animation.

## 11. NPC

Un NPC persistant possède actuellement :

- `status` ;
- `relationship` entre -100 et 100 ;
- des statistiques `health`, `morale`, `strength`, `observation`, `intelligence`, `luck`, `loyalty` et `calm`, entre 0 et 50.

`loyalty` décrit une caractéristique du NPC. `relationship` décrit sa relation avec le joueur. Ces valeurs sont indépendantes.

### Mort d’un NPC

Le statut `dead` est prévu. Si un membre d’équipage ou NPC critique atteint `health <= 0`, un Critical Event NPC se déclenche. Son issue V1 est la mort définitive et le passage au statut `dead`. Cette mort peut rendre des Scheduled Events annulables via `cancelIf`.

## 12. Navire

Si `ship.condition <= 0`, un Critical Event de destruction ou naufrage se déclenche. La perte du navire n’est **pas** un Game Over automatique : le joueur perd l’embarcation et le Critical Event établit le nouveau contexte narratif et géographique.

## 13. Santé et mort du joueur

Si `player.health <= 0`, le joueur meurt et la carrière prend immédiatement fin avec la raison `death`.

Il n’existe en V1 ni jet de survie, ni résurrection, ni interception par objet, ni sauvetage automatique, ni seconde chance universelle. Des variantes textuelles contextuelles pourront être ajoutées sans modifier cette règle.

## 14. Critical Events

Les Critical Events traitent un petit ensemble de leviers vérifiés **avant chaque slot** :

- santé du joueur à zéro ou moins ;
- santé d’un membre d’équipage ou NPC critique à zéro ou moins ;
- condition du navire à zéro ou moins.

Ils ne consomment **jamais** de slot.

### Boucle de résolution

1. vérifier les triggers critiques ;
2. sélectionner exactement un Critical Event de la famille la plus prioritaire ;
3. le résoudre ;
4. recalculer le GameState ;
5. recommencer toutes les vérifications ;
6. continuer jusqu’à stabilisation ;
7. traiter seulement ensuite Scheduled Events et pool normal.

Les triggers ne doivent pas être capturés en lot : chaque résolution peut modifier le contexte des suivantes.

Ordre V1 des familles :

1. joueur ;
2. équipage / NPC ;
3. navire ;
4. futurs systèmes explicitement définis.

Si le joueur et le navire atteignent zéro simultanément, le Critical Event joueur est traité en premier.

## 15. Ordre global avant chaque slot

1. boucle de Critical Events jusqu’à stabilité ;
2. Scheduled Events dus et exécutables ;
3. pool normal.

| Type | Automatique | Consomme un slot | Sélection |
| --- | --- | --- | --- |
| Critical | Oui | Non | Famille critique prioritaire |
| Scheduled | Non | Oui | Urgence, échéance, puis ID |
| Normal | Non | Oui | Tirage uniforme parmi les éligibles |

## 16. Géographie

Le GameState distingue la Location actuelle et l’état `at_sea` / `on_land`. La géographie est une dimension majeure d’éligibilité : certains Events appartiennent à un lieu précis, à la mer ou à la terre.

Le catalogue réel de mers, îles, ports et lieux n’est pas finalisé et n’est pas défini ici.

## 17. Principes de contenu

Les Events doivent privilégier :

- la cohérence avec l’âge et la géographie ;
- la continuité et les conséquences de décisions passées ;
- les rencontres persistantes et trajectoires distinctes ;
- les mini-arcs ;
- la construction progressive d’une ligne de vie.

La variété provient du volume d’Events authorés, des Conditions, de l’historique, du profil, des lieux, Traits, NPC et conséquences Scheduled. Les Events sont écrits à l’avance et validés. Aucune IA runtime ne les génère.

## 18. Non-objectifs V1 et systèmes non définis

Ne sont pas considérés comme décidés :

- génération ou héritage détaillé ;
- Devil Fruits et Haki détaillés ;
- combat NPC autonome, DiceChecks NPC ou Traits NPC ;
- affiliation active distincte de l’origine familiale ;
- système générique de quêtes ou `ArcState` ;
- répétition et cooldown d’Events ;
- rareté pondérée ;
- backend, comptes ou cloud ;
- système complet de fallback déjà utilisé dans le contenu.

Ces sujets nécessitent une décision ultérieure explicite.

## 19. Statut du batch de 30 Events

Le batch précédemment généré est uniquement un test de génération en volume. Il ne constitue pas le contenu Game Design définitif et ne doit pas servir à équilibrer ou définir les règles. Il sera réévalué ou remplacé après stabilisation de la boucle de gameplay.

## 20. Technical implications pending implementation

Les décisions suivantes sont verrouillées mais pas nécessairement implémentées :

- modèle explicite de slots propre aux phases ;
- `slotInMonth: 0 | 1` en Active ;
- progression du temps retirée du contrôle des Outcomes ;
- suppression future de `monthAtLeast` ;
- Scheduled Events prioritaires sur le pool normal ;
- priorités Scheduled `50 / 100 / 200 / 300` ;
- `blocksScheduledEvents` sur les Locations ;
- `scheduledReach: 'normal' | 'unrestricted'` ;
- `cancelIf` et fallback optionnel ;
- statut NPC `dead` ;
- Critical Events sans consommation de slot ;
- re-check complet après chaque Critical Event ;
- tous les Events normaux one-shot ;
- sélection uniforme sans weights.

Cette liste prépare la prochaine passe technique ; elle ne décrit pas l’état actuel du code.
