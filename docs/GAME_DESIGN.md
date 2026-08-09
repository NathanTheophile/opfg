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

### Relationship et loyalty

`relationship` mesure la relation entre le NPC et le joueur et évolue selon ses actes. `loyalty` est une caractéristique intrinsèque distincte : fidélité, stabilité, opportunisme ou propension à trahir. Une bonne relation n’implique donc pas une forte loyauté. Aucun seuil de loyauté ne provoque automatiquement un départ ; seuls des Events explicitement authorés peuvent la tester ou la modifier et produire une conséquence.

## 12. Crew System

L’équipage est constitué uniquement de NPC persistants dont `status === 'crew'`. Il n’existe aucun membre générique ou anonyme. Le joueur ne consomme jamais de capacité : `crewCapacity: 5` autorise cinq NPC crew, plus le joueur. Les NPC connus, unavailable et les passagers ne comptent pas dans cette capacité.

Un équipage peut exister sans bateau après un naufrage. Il n’est jamais réduit automatiquement lors d’une perte ou d’un changement de bateau, ni à cause d’une séparation géographique. Seuls une mort, un départ ou une autre conséquence d’Event explicitement authorée le réduisent.

Un recrutement peut introduire un NPC ou recruter un NPC déjà connu. Il n’existe aucune formule globale : Conditions, Choices, DiceChecks, relation et statistiques portent la difficulté. Faute de place, le Choice peut rester visible mais indisponible, et le runtime interdit malgré tout le passage à `crew`. Un bateau trop petit pour le crew actuel ne peut pas être acquis. Hors présence d’un bateau contrôlé par le joueur, aucune limite globale supplémentaire de taille de crew n’est définie.

Le joueur ne peut pas renvoyer librement un équipier depuis une UI générique. Départs, désertions, trahisons et renvois passent par le contenu. Un NPC blessé mais vivant reste crew. Aucune absence temporaire ne change automatiquement son statut ni ne libère sa place. Un Event peut toutefois authorer explicitement son passage à `unavailable`, par exemple lors d’une capture ; cette conséquence explicite le retire alors du crew.

### Passagers temporaires

Un passager est un NPC persistant temporairement transporté sans devenir membre du crew. Il ne consomme aucune `crewCapacity`, mais réserve exactement un slot de cale. Cette réservation est distincte des stacks d’Items. Aucun système plus fin de présence, séparation ou gestion tactique des passagers n’existe en V1.

### Rôles

Un NPC possède au maximum un rôle simple et narratif défini dans son `NpcDefinition`. Ce rôle fait partie de son identité authorée et ne change pas pendant la run V1. Plusieurs NPC peuvent partager le même rôle.

Une Condition telle que `hasCrewRole(navigator)` peut tester qu’au moins un NPC actuellement crew possède ce rôle, afin d’ouvrir ou griser un Choice ou d’activer un modificateur explicitement authoré. Aucun rôle n’accorde de bonus permanent, bonus de bateau, compétence globale ou simulation autonome. Aucun rôle n’est universellement requis pour naviguer ; le contenu porte les risques liés à son absence.

Il n’existe aucune statistique agrégée telle que `crewMorale`, `crewStrength` ou `crewLevel`. Les statistiques restent individuelles.

### Leadership

`isLeader` indique que le joueur possède l’autorité nécessaire pour gérer son crew et son navire. Ce concept est distinct de la présence d’un crew, de sa taille et de l’affiliation.

Un joueur non-Leader peut voyager avec un crew ou sur un navire narrativement contrôlé par une organisation ou un NPC, notamment dans un contexte Marine. Il ne peut pas, par une action de gestion ordinaire :

- recruter ou renvoyer son propre crew ;
- acquérir ou remplacer volontairement le navire ;
- vendre, détruire volontairement ou renommer le navire ;
- gérer sa cale.

Les Effects narratifs ou système peuvent explicitement contourner cette protection lorsque le contenu doit imposer une transition. Les déplacements et voyages restent possibles sans leadership.

Le contrat de contenu doit supporter au minimum `hasCrew`, `crewSizeAtLeast`, `hasCrewRole` et `isLeader`, ainsi qu’un Effect de changement de leadership. `setNpcStatus` reste l’Effect unique pour recrutement, départ et mort ; le rôle n’est pas mutable et ne nécessite aucun `setNpcRole`.

## 13. Navire

Le joueur ne possède pas nécessairement de bateau : `ship == null` est un état valide. Lorsqu’un bateau existe, il s’agit d’une **instance persistante distincte** associée à un type de bateau authoré. Le contenu initial vise environ cinq types, sans imposer une progression strictement verticale entre eux.

Chaque type définit uniquement en V1 :

- ses HP maximum ;
- sa capacité maximale de personnes embarquées ;
- le nombre d’emplacements de sa cale.

Ces dimensions permettent des compromis de contenu : un navire marchand peut privilégier la cale, un navire orienté équipage la capacité humaine, et un bateau léger rester plus limité mais accessible plus tôt. Aucune valeur chiffrée ni liste définitive de navires n’est verrouillée ici.

La vitesse, les canons, la puissance navale, les modules, les upgrades, le poids de cargaison, le crafting, les flottes et la possession simultanée de plusieurs bateaux sont hors scope V1. Le type de bateau ne crée pas non plus de `navigationTier` universel : un voyage peut rester possible avec un bateau inadapté, mais devenir très dangereux par les Events et leurs Conditions.

### Instance et nom

L’instance conserve au minimum son type, son nom, ses HP actuels et sa cargaison. Tous les bateaux ont un nom. Le joueur peut le personnaliser ; à défaut, le jeu peut en générer un. Ce nom appartient à l’instance et non au type, et doit pouvoir être utilisé dans les textes d’Events pour donner une valeur narrative à la perte ou au remplacement du bateau. La méthode de génération n’est pas définie ici et le nom ne sert pas de Condition gameplay V1.

### HP et destruction

Chaque type possède ses propres HP maximum. Un bateau acquis commence par défaut à son maximum, mais un Event peut authorer une acquisition déjà endommagée. Une même modification de HP couvre dégâts et réparations.

Si `ship.health <= 0`, un Critical Event de destruction ou naufrage doit se déclencher. Le bateau ne doit pas être supprimé silencieusement avant que ce Critical ait traité la situation. Sa perte n’est **pas** un Game Over automatique : le Critical établit les conséquences narratives et le nouveau contexte géographique, et le joueur peut survivre sans bateau.

L’état `ship == null` avec `travelState == at_sea` est nécessairement critique. Il ne doit pas atteindre normalement le prochain slot Scheduled ou Normal : un Critical Event doit le résoudre. Son contenu précis dépendra plus tard du contexte, de l’équipage et d’autres Conditions déclaratives ; il n’est pas conçu dans cette passe.

La cargaison appartient au bateau. Lors d’une destruction, elle n’est jamais téléportée automatiquement dans l’inventaire personnel. Le Critical concerné décidera contextuellement si elle est perdue, sauvée en partie ou récupérée.

Il n’existe aucune action UI générique permettant au joueur de détruire volontairement son bateau. Une destruction volontaire doit être explicitement proposée par un Event.

### Équipage et capacité humaine

La capacité humaine couvre uniquement les NPC membres d’équipage. Les passagers temporaires utilisent le modèle minimal défini dans la section 12 et réservent des slots de cale, sans consommer de capacité humaine.

Un membre d’équipage ne disparaît jamais automatiquement lorsque le bateau est perdu ou remplacé, ni lorsque le groupe rejoint la terre. L’équipage ne diminue que par une conséquence explicitement authorée : Event, départ, mort ou autre résolution déclarée. Après un naufrage, le groupe peut donc rester ensemble sans bateau.

Un recrutement doit pouvoir rendre un Choice indisponible lorsque la capacité applicable est insuffisante, tout en le laissant visible et grisé si le contenu le souhaite. Seuls les NPC `crew` occupent cette capacité ; le joueur et les passagers n’y comptent pas. Cette règle repose sur deux protections complémentaires :

- authoring/UI par Conditions déclaratives ;
- invariant runtime empêchant un dépassement même si le contenu est incorrect.

De même, un bateau trop petit pour accueillir le crew actuel ne peut pas être acquis. Les passagers réservent séparément des slots de cale et doivent également tenir dans le nouveau bateau.

### Acquisition et remplacement

Si `ship == null`, un Event peut attribuer directement un bateau. Si `ship != null`, l’acquisition d’un nouveau bateau crée un remplacement en attente et déclenche une résolution forcée sous forme de Critical Event :

```text
acquisition proposée
→ remplacement en attente
→ Critical Event de remplacement
→ résolution de l’ancien bateau et de sa cargaison
→ nouveau bateau actif
```

Le nouveau bateau ne devient actif qu’après cette résolution. Le joueur ne possède jamais deux bateaux actifs simultanément.

Le Critical de remplacement propose les possibilités V1 suivantes pour l’ancien bateau :

- **détruire**, uniquement à terre ; pendant la jam, cela ne produit aucune ressource ;
- **vendre**, uniquement dans une Location explicitement compatible avec la vente de navires, contre des Berrys ; être simplement `on_land` ne suffit pas ;
- **abandonner**, partout et sans compensation automatique, afin que le remplacement reste toujours résoluble.

La cargaison est transférée automatiquement vers le nouveau bateau lorsqu’elle tient dans sa cale. Si elle contient plus de stacks distincts que la nouvelle capacité, le joueur devra à terme choisir les stacks abandonnés. Cette règle est verrouillée, mais aucune UI ni logique complexe de sélection n’est requise pour la jam puisque la cale initiale reste vide.

Aucun `previousShips[]` n’est conservé. L’Event, son Outcome, l’historique de carrière et les textes utilisant le nom du bateau suffisent à préserver sa trace narrative.

### Contrat de contenu attendu

Le contrat déclaratif devra pouvoir exprimer au minimum les Conditions suivantes :

- `hasShip` ;
- `shipIs` ;
- `shipHealthAtLeast` et `shipHealthAtMost` ;
- `shipCrewCapacityAtLeast` ;
- `shipCargoSpaceAtLeast` ;
- `canAcquireShip`, qui vérifie notamment la compatibilité avec les occupants actuels.

Il devra également pouvoir exprimer au minimum les Effects `acquireShip`, `loseShip`, `modifyShipHealth`, `addCargoItem` et `removeCargoItem`. `acquireShip` autorise des HP initiaux authorés, avec le maximum par défaut. Le nom personnalisé pourra passer par l’input texte sans imposer un Effect générique dédié.

## 14. Inventaires et Items

Les possessions personnelles du joueur et la cale du bateau sont deux inventaires distincts.

L’inventaire personnel possède par défaut **2 emplacements**. La cale possède un nombre fixe d’emplacements défini par le type de bateau. Ses slots sont partagés entre stacks de cargaison et passagers temporaires. Les inventaires d’Items utilisent des stacks :

```text
1 type d’Item distinct = 1 emplacement
une quantité supérieure à 1 reste dans le même emplacement
```

Il n’existe en V1 ni poids, ni volume ou taille variable par Item, ni limite maximale de stack définie. Les opérations d’ajout et de retrait devront porter sur des quantités. Aucun système complexe de transfert entre inventaire personnel et cale n’est défini.

La cale fait partie du modèle dès la première implémentation du Ship System afin d’éviter une migration structurelle ultérieure. Elle reste toutefois vide dans le contenu initial de jam : aucune boucle de cargaison, logistique ou crafting, ni gameplay actif de cale n’est requis maintenant. Elle peut seulement être exposée conceptuellement dans l’UI.

## 15. Berrys

Le joueur possède une quantité persistante de Berrys. Cette ressource existe en V1 afin que les Events puissent la tester, l’ajouter ou la retirer, notamment lors de la vente d’un bateau. Le contrat pourra donc fournir les concepts `berriesAtLeast` et `modifyBerries`.

Cela ne définit pas une économie générale. Les shops génériques, prix dynamiques, salaires, consommation quotidienne, nourriture, entretien automatique et commerce détaillé restent hors scope. La formule exacte du prix de vente d’un bateau n’est pas verrouillée.

## 16. Santé et mort du joueur

Si `player.health <= 0`, le joueur meurt et la carrière prend immédiatement fin avec la raison `death`.

Il n’existe en V1 ni jet de survie, ni résurrection, ni interception par objet, ni sauvetage automatique, ni seconde chance universelle. Des variantes textuelles contextuelles pourront être ajoutées sans modifier cette règle.

## 17. Critical Events

Les Critical Events traitent un petit ensemble de leviers vérifiés **avant chaque slot** :

- santé du joueur à zéro ou moins ;
- santé d’un membre d’équipage ou NPC critique à zéro ou moins ;
- HP du navire à zéro ou moins ;
- absence de navire en mer ;
- remplacement de navire en attente.

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

## 18. Ordre global avant chaque slot

1. boucle de Critical Events jusqu’à stabilité ;
2. Scheduled Events dus et exécutables ;
3. pool normal.

| Type | Automatique | Consomme un slot | Sélection |
| --- | --- | --- | --- |
| Critical | Oui | Non | Famille critique prioritaire |
| Scheduled | Non | Oui | Urgence, échéance, puis ID |
| Normal | Non | Oui | Tirage uniforme parmi les éligibles |

## 19. Géographie

Le GameState distingue la Location actuelle et l’état `at_sea` / `on_land`. La géographie est une dimension majeure d’éligibilité : certains Events appartiennent à un lieu précis, à la mer ou à la terre.

Le catalogue réel de mers, îles, ports et lieux n’est pas finalisé et n’est pas défini ici.

## 20. Principes de contenu

Les Events doivent privilégier :

- la cohérence avec l’âge et la géographie ;
- la continuité et les conséquences de décisions passées ;
- les rencontres persistantes et trajectoires distinctes ;
- les mini-arcs ;
- la construction progressive d’une ligne de vie.

La variété provient du volume d’Events authorés, des Conditions, de l’historique, du profil, des lieux, Traits, NPC et conséquences Scheduled. Les Events sont écrits à l’avance et validés. Aucune IA runtime ne les génère.

## 21. Non-objectifs V1 et systèmes non définis

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

Sont également explicitement hors scope V1 malgré les fondations du Ship System :

- plusieurs bateaux actifs ou flotte historique structurée ;
- statistiques de bateau autres que HP, capacité humaine et slots de cale ;
- modules, upgrades, crafting et logistique de cargaison ;
- économie générale au-delà des opérations de Berrys authorées par les Events ;
- action UI générique de destruction volontaire du bateau.

Sont hors scope Crew System V1 :

- combat ou IA autonome de crew ;
- bonus automatiques, skills, rôles multiples ou évolution des rôles ;
- statistiques globales de crew et présence physique détaillée ;
- UI complète de management du crew ou des passagers.

Les sujets non décidés nécessitent une décision ultérieure explicite. Les exclusions Ship System ci-dessus sont, elles, verrouillées pour la V1.

## 22. Questions Ship System encore ouvertes

Les décisions suivantes ne sont pas verrouillées et ne doivent pas être déduites par l’implémentation :

- quelle formule détermine le prix de vente d’un bateau ;
- existe-t-il une limite quantitative maximale par stack d’Items.

## 23. Statut du batch de 30 Events

Le batch précédemment généré est uniquement un test de génération en volume. Il ne constitue pas le contenu Game Design définitif et ne doit pas servir à équilibrer ou définir les règles. Il sera réévalué ou remplacé après stabilisation de la boucle de gameplay.

## 24. Technical implications pending implementation

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
- sélection uniforme sans weights ;
- instance de navire persistante et nullable, distincte de son type authoré ;
- HP, nom et cale propres à l’instance du navire ;
- capacité humaine et capacité de cale définies par le type ;
- Critical de naufrage, d’absence de bateau en mer et de remplacement en attente ;
- inventaire personnel de 2 slots distinct de la cale ;
- Items stackables avec quantités ;
- Berrys persistants et opérations déclaratives minimales ;
- Conditions et Effects Ship listés dans la section 13 ;
- crew composé exclusivement des NPC au statut `crew`, joueur exclu de la capacité ;
- passagers persistants réservant chacun un slot de cale ;
- rôle immuable par `NpcDefinition` et Conditions de rôle ;
- leadership persistant et protection runtime des opérations de gestion.

Cette liste prépare la prochaine passe technique ; elle ne décrit pas l’état actuel du code.
