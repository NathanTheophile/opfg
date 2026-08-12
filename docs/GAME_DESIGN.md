# OPFG — Game Design

> **Status: Game Design authority for the current jam scope**
>
> Toute règle de gameplay non présente ici doit être considérée comme non verrouillée, sauf si explicitement définie par un document spécialisé référencé.

Ce document consolide les décisions Game Design validées pour la jam. Les documents spécialisés restent autorités sur leurs domaines techniques, mais une ancienne hypothèse de gameplay contradictoire ne prévaut pas sur ce document.

### Délégation d’autorité

`GAME_DESIGN.md` reste l’autorité gameplay maîtresse et délègue les domaines spécialisés suivants :

- [Carrières, réputation et Endings](design/CAREER_AND_ENDINGS.md) ;
- [Economy & Items](design/ECONOMY_AND_ITEMS.md) ;
- [timeline mondiale et politique canon](design/WORLD_TIMELINE_AND_CANON.md) ;
- [Major Narrative Tracks / D2 narrative architecture](design/MAJOR_NARRATIVE_TRACKS.md) ;
- [règles de production du contenu](content/CONTENT_BIBLE.md) ;
- [catalogue V1 des 28 Traits](content/TRAITS_CATALOG.md) ;
- [vocabulaire contrôlé des tags de Locations](content/locations/OPFG_LOCATION_TAGS.md).

Le [catalogue géographique nettoyé](content/locations/OPFG_LOCATIONS_CATALOG.json) est une base de travail d’authoring de 502 entrées avec le statut `working_geographical_base`, et non l’autorité finale des Locations V1. Son [audit](content/locations/OPFG_LOCATION_REVIEW.md) et son [résumé](content/locations/OPFG_LOCATION_SUMMARY.md) sont des documents de support non autoritatifs.

Après ces autorités design viennent, dans l’ordre, `ARCHITECTURE.md`, `LOCALIZATION.md`, puis le schéma TypeScript runtime. Une divergence du code avec le design validé constitue une dette d’implémentation et ne réécrit pas silencieusement la règle de design.

## 1. Vision d’une run

Une run représente la construction puis la carrière d’un personnage dans un univers maritime aventureux inspiré de One Piece. Sa durée cible est d’environ **10 à 45 minutes**, selon la trajectoire et la longévité du personnage.

Une carrière traverse trois phases, dans cet ordre :

1. `origins` ;
2. `childhood` ;
3. `active`.

Le personnage peut mourir ou atteindre une Ending authorée. Toute fin affiche l’écran final complet, y compris la mort.

## 2. Origins

Origins représente la naissance et l’environnement initial. C’est une séquence fixe de questions à réponses fixes : **Nom → Race → Structure familiale → Affiliation familiale → Niveau social → Mer d’origine**. Il n’existe aucun Event « année 0 ». Après le choix de la mer d’origine, le système sélectionne immédiatement et de manière seedée uniforme le lieu de naissance parmi les **8 Birth Locations valides de cette Blue** ; ce choix n’est pas présenté comme un Event ou une question au joueur.

Origins est la seule phase qui affiche systématiquement les conséquences de statistiques avant chaque Choice. À partir de Childhood, le texte peut donner des indices, mais aucune UI globale ne révèle automatiquement les effets mécaniques.

Tous les attributs D20 commencent à `25`. La race fixe directement la Santé initiale et applique ses modificateurs. Structure familiale et niveau social appliquent ensuite leurs modificateurs une seule fois. Affiliation, mer et lieu de naissance ne modifient aucune statistique.

### Races V1

| Race | Santé | Modificateurs d’attributs |
| --- | ---: | --- |
| Humain (`human`) | 35 | Observation +1, Intelligence +1, Charisme +1, Chance +1, Moral -2 |
| Homme-poisson (`fishman`) | 45 | Force +4, Agilité +1, Observation +2, Intelligence -2, Navigation +3, Charisme -3, Chance -2, Moral -3 |
| Mink (`mink`) | 35 | Force -1, Agilité +4, Observation +4, Intelligence -2, Navigation -3, Charisme +1, Chance -2, Moral -1 |
| Géant (`giant`) | 60 | Force +6, Agilité -6, Observation -2, Intelligence -2, Navigation -4, Charisme -1, Chance -2, Moral +5 |
| Long-bras (`longarm`) | 40 | Force +2, Agilité +4, Observation +3, Intelligence +1, Navigation -3, Charisme -2, Chance -2, Moral -3 |
| Boucanier (`buccaneer`) | 50 | Force +4, Agilité -3, Observation +1, Intelligence -1, Navigation -2, Charisme -1, Chance -2, Moral +4 |

La race crée un archétype sans RaceSystem dédié. Le contenu utilise `raceIs` pour les situations exclusives, aquatiques ou morphologiques. Il n’existe pas de sous-races. Peuple du Ciel, Lunarien et Tontatta sont réservés pour plus tard.

<!-- D2_WAVE2_NARRATIVE_RESET:ORIGIN_RACE_AVAILABILITY -->
**Disponibilité narrative D2 V1 :** Humain, Homme-poisson, Mink et Géant sont jouables. Long-bras et Boucanier restent visibles dans Origins mais verrouillés jusqu'à une future passe de contenu dédiée. Le verrouillage réduit la surface de production ; il ne supprime ni leurs définitions ni leur place future dans le monde.

### Structure familiale

- Deux parents (`two_parents`) : Moral +2, Charisme +1, Observation -1, Agilité -2.
- Parent seul (`single_parent`) : Intelligence +2, Observation +1, Moral -2, Chance -1.
- Orphelin (`orphan`) : Observation +3, Agilité +2, Moral -4, Charisme -1.

La structure reste persistante et testable par les Events. Origins instancie immédiatement des parents NPC persistants : deux pour `two_parents`, un pour `single_parent`, aucun par défaut pour `orphan`. En V1, ils utilisent la Race du joueur. Les frères et sœurs ne sont pas générés systématiquement et aucun pool contrôlé de noms familiaux n’est requis.

### Affiliation familiale

Les affiliations V1 sont `civilian`, `marine`, `pirate`, `revolutionary`, `bandit`, `prisoner`, `slave`, `celestial_dragon` et `royal_family`. Elles ne modifient aucune stat. `player.profile.affiliationId` désigne exclusivement l’affiliation familiale héritée, pas une affiliation de carrière Active.

<!-- D2_WAVE2_NARRATIVE_RESET:ORIGIN_FAMILY_AVAILABILITY -->
**Disponibilité narrative D2 V1 :** les affiliations familiales jouables sont `civilian`, `marine`, `pirate`, `revolutionary` et `royal_family`. `bandit`, `prisoner`, `slave` et `celestial_dragon` restent visibles dans Origins mais verrouillées. Elles seront rouvertes uniquement lorsqu'un traitement narratif suffisamment complet pourra les accompagner.

## Carrière V1, réputation et fins

La carrière Active est stockée séparément dans `player.career`. Son affiliation est l’une de `civilian`, `pirate`, `marine`, `revolutionary` ou `bounty_hunter`. Changer d’affiliation ne modifie automatiquement ni la réputation, ni la prime, ni le grade, ni le titre, ni le leadership.

La réputation est un entier `0..100`, initialisé à 0, qui peut augmenter ou diminuer. Elle mesure la quantité de notoriété, pas la moralité, et reste conservée lors d’un changement de carrière. La prime est un entier indépendant `>= 0`, sans plafond et distinct des Berrys possédés ; elle peut exister pour toute affiliation et persiste jusqu’à modification explicite par un Event.

Pirate et Civil n’ont pas de grade rigide et peuvent porter un titre personnalisé. Marine utilise une échelle compressée de 10 grades se terminant par Amiral en chef ; Révolutionnaire et Chasseur de primes utilisent chacun une échelle de 5 grades. Les échelles détaillées sont définies dans [Career & Endings](design/CAREER_AND_ENDINGS.md). Tout changement de carrière, promotion, prime ou titre passe exclusivement par un Event authoré ; rien n’est accordé automatiquement.

Un Event authoré sélectionne une famille d’Ending et termine la run ; une logique déterministe de fin sélectionne ensuite la variante exacte selon l’état final. La cible est d’environ cinq Endings de base par carrière, quatre variantes chacune, complétées par des Endings universelles. La mort reçoit le même écran final complet et peut atteindre `100/100`. Le score final est distinct de la Réputation et utilise les six axes pondérés définis dans [Career & Endings](design/CAREER_AND_ENDINGS.md).

### Niveau social

- Pauvre (`poor`) : Observation +3, Chance -3.
- Modeste (`modest`) : aucun modificateur.
- Aisé (`wealthy`) : Chance +3, Observation -3.

Le niveau social reste persistant et testable. Il n’accorde aucun Berry initial.

### Mer et lieu de naissance

Les quatre mers sélectionnables dans Origins sont `east_blue`, `west_blue`, `north_blue` et `south_blue`. Le runtime World V1 contient aussi `grand_line_paradise`, `new_world`, `sky`, `underwater`, `calm_belt` et `red_line`, sans les proposer comme origines. La mer ne modifie aucune stat et n’accorde aucun Trait caché. Après le choix de la mer, le runtime tire de manière seedée uniforme une vraie Location parmi les exactement **8 Locations `canBeBirthLocation`** de la Blue choisie. Cette Location devient immédiatement la `locationId` du joueur sans modifier ses statistiques.

## 3. Statistiques du joueur

| Statistique | ID |
| --- | --- |
| Santé | `health` |
| Moral | `morale` |
| Force | `strength` |
| Agilité | `agility` |
| Observation | `observation` |
| Intelligence | `intelligence` |
| Navigation | `navigation` |
| Charisme | `charisma` |
| Chance | `luck` |

`health` est une réserve de points de vie distincte des attributs D20. Son maximum est `RaceDefinition.initialHealth` et toute modification est clampée entre `0` et ce maximum. Elle ne produit aucun modificateur D20 et ne peut jamais servir de `statId` à un DiceCheck. `health <= 0` conserve la règle de mort Critical existante.

Les attributs D20 V1 sont `morale`, `strength`, `agility`, `observation`, `intelligence`, `navigation`, `charisma` et `luck`. Leur plage est `0–50` et leur base neutre avant Origins est `25`. L’Éveil d’un Fruit du Démon appartient exclusivement au PowerState et n’est pas une statistique D20.

Agilité couvre déplacement, esquive, fuite, équilibre, escalade, acrobaties et précision corporelle ou manuelle lorsque nécessaire. Aucune statistique `dexterity` ou « adresse » distincte n’existe. Observation conserve son nom.

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

### Family Legacy Saga — garantie narrative V2

<!-- D2_WAVE2_NARRATIVE_RESET:FAMILY_GUARANTEE -->
La garantie narrative obligatoire de Childhood n'est plus l'initiation d'une ancienne `Lifetime Thread`. Chaque personnage reçoit la **Family Legacy Saga correspondant à son affiliation familiale héritée**.

Une Childhood complète contient **exactement cinq root Events de Family Saga**, dus aux checkpoints 12, 48, 84, 120 et 156 mois. Chaque chapitre est un pool horizontal de variantes et évalue l'état **actuel** du personnage au moment de sa résolution : Race, structure familiale initiale, statut/présence des parents, relations, classe sociale, History, Traits et autres Conditions réellement pertinentes.

Une seule variante est vécue par chapitre. Le chapitre entier est ensuite considéré comme terminé via History. Chaque chapitre doit posséder exactement un fallback universel, utilisé seulement lorsqu'aucune variante spécialisée n'est éligible.

Les variantes Family restent des Normal Events mais sont exclues du pool Normal ordinaire ; seul l'orchestrateur Major Narrative Track peut les sélectionner. La progression ne nécessite aucun `ArcState` ni compteur persistant dédié.

La Family Saga est conçue pour continuer après 15 ans et réagir plus tard à l'affiliation personnelle choisie par le joueur. Son authoring adulte est différé, pas annulé.

Les anciennes `Lifetime Thread` deviennent du matériau legacy ou, si elles sont reconstruites plus tard, des trames secondaires facultatives. Elles ne portent plus la garantie principale d'une run.

Voir `docs/design/MAJOR_NARRATIVE_TRACKS.md` pour le contrat complet.

## 5. Active

Active commence toujours à **15 ans** et utilise **1 root Event par mois**, soit au maximum 12 Events consommant le slot mensuel par année complète, hors Critical et continuations Immediate.

### Navigation mensuelle

Au début de chaque mois Active, avant l’unique root Event, un joueur Leader disposant d’un navire choisit une seule fois son contexte de navigation. À terre, il peut rester ou prendre la mer vers une destination accessible ; en mer, il peut rester en mer, changer de cap vers une destination accessible ou accoster lorsque la Location l’autorise. Cette décision ne consomme aucun Event et reste acquise pour le mois. Dans les quatre Blues, le joueur choisit directement parmi les destinations dockables d’une autre île de la même mer. Paradise conserve la progression avant imposée par son graphe de routes ; les régions qui n’autorisent pas la navigation directe restent déplacées par Events. Un joueur non-Leader ou sans navire ne reçoit pas ce choix.

Le root slot mensuel peut être consommé par un Event Normal ou Scheduled. La provenance ne change pas son coût. Les continuations `immediate` prolongent explicitement ce même root sans coût temporel supplémentaire ; les Critical ne consomment aucun mois.

Le GameState conserve `slotInMonth: 0 | 1` pour compatibilité de Save, mais la boucle Active V1 utilise désormais uniquement le slot 0 : une fois le root et toutes ses continuations Immediate terminés, l’âge avance immédiatement d’un mois et `slotInMonth` reste ou revient à 0. Une ancienne Save chargée avec `slotInMonth = 1` est naturellement normalisée au prochain root consommé.

Comme en Childhood, le temps appartient à la boucle de phase, pas à l’Outcome.

### Continuous / Immediate Events

Un Event `immediate` est la continuation directe de la scène courante. Il est déclenché explicitement par un Outcome, n’entre jamais dans le pool Normal, ne consomme aucun slot et ne fait pas avancer le temps. Une chaîne peut contenir plusieurs Immediate Events et conserve le moment temporel de son Event racine. Le slot du Normal ou Scheduled racine n’est finalisé qu’après la fin complète de la chaîne.

Un Immediate se distingue d’un Scheduled : l’Immediate continue la scène actuelle sans temps, tandis que le Scheduled représente une conséquence future dans la chronologie. Critical conserve la priorité et peut interrompre temporairement une chaîne Immediate avant sa reprise.

## 6. Sélection des Events normaux

À chaque slot normal :

1. déterminer tous les Events normaux éligibles ;
2. exclure ceux déjà joués ;
3. appliquer, uniquement en Childhood, la garantie Lifetime Thread décrite ci-dessus si son checkpoint est atteint et qu’aucune Lifetime Thread n’a encore commencé ;
4. sinon tirer uniformément parmi les Events restants.

Hors cette exception de garantie narrative, tous les Normal Events éligibles conservent exactement la même probabilité : aucun poids de rareté n’est introduit.

Les Events normaux authorés sont **one-shot par défaut**. Un petit pool d’Events Active véritablement evergreen peut déclarer un cooldown et un nombre maximal d’occurrences ; l’éligibilité est dérivée de `history`, sans nouvel état persistant. Les Lifetime Threads, storylines, Signature Events et états uniques restent one-shot. Les deux Events système Active `dead_end_on_land` et `dead_end_at_sea` rétablissent un contexte navigable quand le contenu normal est épuisé et restent un signal diagnostique de contenu manquant.

Il n’existe aucun poids de rareté (`weight`, common/uncommon/rare ou probabilité individuelle cachée). La rareté découle uniquement des Conditions d’éligibilité : âge, géographie, voyage, profil, statistiques, Traits, historique, flags, items, NPC et autres Conditions déclaratives supportées. Une fois éligibles, les Events ont la même probabilité.

La priorité ne sert pas à sélectionner les Events normaux.

## 7. Temps et Conditions temporelles

Le joueur naît deux ans après Luffy. Son entrée en phase Active à 15 ans correspond donc approximativement au début du voyage principal de Luffy à 17 ans ; après l’ellipse canon de deux ans, le joueur a environ 17 ans. Les conséquences majeures du canon restent protégées : le joueur agit surtout dans les interstices narratifs et ne remplace pas le rôle central des protagonistes canoniques.

Les personnages, organisations et Locations sensibles au canon doivent porter des indications ou métadonnées de disponibilité temporelle exprimées relativement à `ageMonths`, sans inventer une précision calendaire absente des sources. La politique complète est définie dans [World Timeline & Canon](design/WORLD_TIMELINE_AND_CANON.md).

- `ageAtLeastMonths` porte sur l’âge biologique absolu ;
- `ageAtMostMonths` fixe sa borne supérieure ;
- `delayMonths` exprime un délai calendaire relatif pour une conséquence programmée.

Une conséquence programmée à 17 ans avec `delayMonths: 18` devient due 18 mois calendaires plus tard.

`monthAtLeast` est redondant puisque l’ancienneté Active est dérivable de l’âge biologique et a été retiré du contrat de contenu/runtime. Utiliser `ageAtLeastMonths`, `ageAtMostMonths` et `delayMonths` selon le besoin ; ne pas réintroduire `monthAtLeast`.

## 8. Scheduled Events

Un Event `kind: "scheduled"` ne peut jamais venir du pool normal : une conséquence antérieure doit l’avoir programmé. Lorsqu’il est joué, il consomme un slot normal. Une conséquence Childhood peut devenir due pendant Childhood ou après le passage en Active.

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

## 10 bis. Powers V1

Les Fruits du Démon appartiennent à un catalogue central. Chaque définition possède un type `paramecia`, `zoan` ou `logia`, un vocabulaire fini de tags narratifs et référence l’Item qui représente physiquement le Fruit. Trouver ou transporter cet Item ne donne aucun pouvoir : le Player, limité à un seul Fruit, doit le consommer explicitement. La consommation retire un exemplaire de l’Item et initialise son Éveil à `0`.

L’Éveil d’un Fruit est une progression persistante et monotone de `0` à `10`. Le niveau `10` signifie que le Fruit est éveillé ; aucun booléen redondant n’est stocké. Les Conditions peuvent tester le Fruit exact, son type, ses tags et son Éveil. La faiblesse à la mer n’applique aucun effet universel : les Events et Critical Events en déterminent toujours explicitement les conséquences. Il n’existe ni techniques, ni cooldowns, ni système de combat ou bonus D20 automatique attaché aux Fruits.

Les trois formes de Haki — Observation, Armement et Conquérant — sont des maîtrises persistantes et monotones de `0` à `5`. Le niveau initial `0 → 1` exige toujours un Effect d’Event explicite. Pour le Haki de l’Observation, cet éveil exige `Observation + Intelligence >= 75`; pour l’Armement, `Strength + Agility >= 75`. Une fois éveillé, le moteur acquiert automatiquement et sans perte les niveaux permis par les paliers `75 / 80 / 85 / 90 / 95`, même si les Stats diminuent ensuite.

Le Haki du Conquérant existe dès V1, mais ses conditions d’éveil et de progression restent entièrement Event-driven : aucun potentiel, tirage caché ou couple de Stats ne lui est associé. Le Haki autorise des Choices et Events ; un éventuel modifier D20 reste explicitement authoré dans le DiceCheck concerné. Les NPC peuvent posséder les mêmes Fruits, niveaux d’Éveil et formes de Haki via le même PowerState, avec une progression Event-driven.

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

L’autorité design et runtime des marchés navals est `shipMarket: 'none' | 'small_craft' | 'full'`, distinct de `allowsDocking`. Les six châssis génériques et les règles de marché sont définis dans la [Content Bible](content/CONTENT_BIBLE.md) ; les navires canoniques nommés peuvent être mentionnés mais ne sont pas obtenables en V1.

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

Si `player.stats.health <= 0`, le joueur meurt et la carrière prend immédiatement fin avec la raison `death`.

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

Le catalogue final V1 de mers, îles, ports et lieux n’est pas encore verrouillé. Le [catalogue nettoyé de 502 entrées](content/locations/OPFG_LOCATIONS_CATALOG.json) reste une base géographique de travail, pas une source runtime finale. Birka/Birka Moon, Water Seven/Shipbuilding Island, les Birth Locations personnalisées, `shipMarket`, `services[]` et la sélection finale CORE/Birth restent à revoir.

## 20. Principes de contenu

Les Events doivent privilégier :

- la cohérence avec l’âge et la géographie ;
- la continuité et les conséquences de décisions passées ;
- les rencontres persistantes et trajectoires distinctes ;
- les mini-arcs ;
- la construction progressive d’une ligne de vie.

La variété provient du volume d’Events authorés, des Conditions, de l’historique, du profil, des lieux, Traits, NPC et conséquences Scheduled. Les Events sont écrits à l’avance et validés. Aucune IA runtime ne les génère.

En V1, les Choices spéciales ou bloquées restent généralement visibles mais grisées/désactivées afin de rendre perceptible la profondeur des trajectoires possibles. L’authoring privilégie donc `availableIf` à `visibleIf` pour ces possibilités ; les cacher doit être une décision narrative explicite.

## 21. Non-objectifs V1 et systèmes non définis

Ne sont pas considérés comme décidés :

- génération de fratrie systématique ou héritage détaillé au-delà des parents V1 ;
- combat NPC autonome, DiceChecks NPC ou Traits NPC ;
- système générique de quêtes ou `ArcState` ;
- framework générique de répétition au-delà du replay conservateur des Events evergreen ;
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
- Scheduled Events prioritaires sur le pool normal ;
- priorités Scheduled `50 / 100 / 200 / 300` ;
- `blocksScheduledEvents` sur les Locations ;
- `scheduledReach: 'normal' | 'unrestricted'` ;
- `cancelIf` et fallback optionnel ;
- statut NPC `dead` ;
- Critical Events sans consommation de slot ;
- re-check complet après chaque Critical Event ;
- Events normaux one-shot par défaut, avec replay History-based réservé aux evergreen explicitement taggés ;
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

## D2 — Major Narrative Tracks and Content Reset V2

<!-- D2_WAVE2_NARRATIVE_RESET:D2_AMENDMENT -->
> **Authoritative amendment.** This section supersedes the D1.8/D1.9 early-Childhood orchestration and any earlier rule that treats the old narrative Event catalogue as automatically accepted runtime content.

The complete architecture is delegated to [Major Narrative Tracks](design/MAJOR_NARRATIVE_TRACKS.md).

### Content Reset

Pre-V2 narrative EventDefinitions are legacy reference material. D1.9 is preserved as a high-quality narrative seed archive, not migrated as runtime EventDefinitions. The pre-V2 Event Concept Index is frozen; the V2 accepted-content ledger starts empty.

### Childhood spine

For the current V2 target, Childhood has 20 root slots, of which exactly 5 belong to the inherited Family Legacy Saga. The remaining 15 slots preserve room for Race, Birthplace, Origin Cross mini-arcs, peer relationships, Traits, generic adventures and secondary callbacks.

The former representative `12 stat / 3 Trait / 5 narrative` mix is no longer a blocking quota when it conflicts with the five-chapter Family spine; future balancing is evaluated across the assembled V2 Childhood corpus.

### Major-track priority target

Once implemented, the target ordering is: Critical/system gates → Immediate → mandatory system injections → overdue Major chapter → due Scheduled → newly due Major chapter → ordinary Normal. This permits a due Scheduled Event to take the exact checkpoint slot while preventing Family chapters from being starved afterward.

### Future Active spine

At age 15 the Family Legacy Saga is intended to continue. A second Major Narrative Track — Personal Affiliation Saga — will later begin around the player's chosen Active affiliation and represent the career the character decides to build. Adult cadence and career-change semantics remain deliberately open until the Active redesign.
