# ACTIVE_GENERIC_SEA_01 — MANIFEST

## Batch

- **Batch ID:** `ACTIVE_GENERIC_SEA_01`
- **Prefix:** `active_generic_sea_01`
- **Scope:** 20 roots Active génériques en mer, multi-Career, centrés sur météo, visibilité, gréement, navigation, petits incidents de coque, fatigue ponctuelle, signaux, secours, navires inconnus et phénomènes marins raisonnables.
- **Root policy:** exactement 20 Events `kind: "normal"`, one-shot V1.
- **Active gate:** chaque root requiert `careerPhaseIs(active)`, `ageAtLeastMonths(180)` et `isAtSea`; certains roots ajoutent `hasShip` lorsque la coque/le gréement personnel est matériellement impliqué.
- **Persistent-definition policy:** aucune nouvelle définition persistante.

## ROOT_EVENTS

- `active_generic_sea_01_squall_staysail_snap`
- `active_generic_sea_01_fog_bell_contact`
- `active_generic_sea_01_overturned_longboat`
- `active_generic_sea_01_current_shear`
- `active_generic_sea_01_three_striped_sail`
- `active_generic_sea_01_dead_calm_watch`
- `active_generic_sea_01_night_mast_knock`
- `active_generic_sea_01_floating_timber_field`
- `active_generic_sea_01_missing_stars`
- `active_generic_sea_01_reef_birds`
- `active_generic_sea_01_salted_stores_argument`
- `active_generic_sea_01_luminous_wake`
- `active_generic_sea_01_horizon_pacer`
- `active_generic_sea_01_message_buoy`
- `active_generic_sea_01_rudder_shudder`
- `active_generic_sea_01_distant_flare`
- `active_generic_sea_01_cross_swell`
- `active_generic_sea_01_line_burn`
- `active_generic_sea_01_false_dawn`
- `active_generic_sea_01_drifting_net`

## IMMEDIATE_EVENTS

- `active_generic_sea_01_squall_staysail_snap_i1_running_line`
- `active_generic_sea_01_squall_staysail_snap_i2_crossed_sheet`
- `active_generic_sea_01_squall_staysail_snap_i3_mast_lurch`
- `active_generic_sea_01_squall_staysail_snap_i4_loose_canvas`
- `active_generic_sea_01_squall_staysail_snap_i5_last_knot`
- `active_generic_sea_01_fog_bell_contact_i1_second_tone`
- `active_generic_sea_01_fog_bell_contact_i2_shadow_close`
- `active_generic_sea_01_fog_bell_contact_i3_passing_words`
- `active_generic_sea_01_overturned_longboat_i1_first_hand`
- `active_generic_sea_01_overturned_longboat_i2_second_survivor`
- `active_generic_sea_01_overturned_longboat_i3_empty_seat`
- `active_generic_sea_01_current_shear_i1_sideways_wake`
- `active_generic_sea_01_current_shear_i2_hidden_foam`
- `active_generic_sea_01_current_shear_i3_clear_water`

## SCHEDULED_EVENTS

- `active_generic_sea_01_salted_stores_argument_later_watch`
- `active_generic_sea_01_horizon_pacer_return`
- `active_generic_sea_01_message_buoy_answering_signal`
- `active_generic_sea_01_distant_flare_grateful_lantern`
- `active_generic_sea_01_rival_s01`
- `active_generic_sea_01_rival_s02`
- `active_generic_sea_01_rival_s03`
- `active_generic_sea_01_rival_s04_a`
- `active_generic_sea_01_rival_s05_a`
- `active_generic_sea_01_rival_s04_b`
- `active_generic_sea_01_rival_s05_b`
- `active_generic_sea_01_rival_s04_c`
- `active_generic_sea_01_rival_s05_c`
- `active_generic_sea_01_rival_s06`
- `active_generic_sea_01_rival_s07_a`
- `active_generic_sea_01_rival_s07_b`
- `active_generic_sea_01_rival_s07_c`
- `active_generic_sea_01_rival_s08_a`
- `active_generic_sea_01_rival_s08_b`
- `active_generic_sea_01_rival_s08_c`
- `active_generic_sea_01_rival_s09`
- `active_generic_sea_01_rival_s10_a`
- `active_generic_sea_01_rival_s10_b`
- `active_generic_sea_01_rival_s10_c`
- `active_generic_sea_01_rival_s11_a`
- `active_generic_sea_01_rival_s11_b`
- `active_generic_sea_01_rival_s11_c`
- `active_generic_sea_01_rival_s12`
- `active_generic_sea_01_rival_s13_a`
- `active_generic_sea_01_rival_s13_b`
- `active_generic_sea_01_rival_s14_end`

## ROOT_REGISTRY

| Root ID | conceptKey | Âge | Contexte principal | Mécanique dominante | Traits/NPC/Items | Immediate | Scheduled |
|---|---|---|---|---|---|---|---|
| `active_generic_sea_01_squall_staysail_snap` | squallStaysailSnap | 15+ (180+ mois) | `isAtSea` + `hasShip` | Dice Agility + Signature Immediate d5 | Ship HP; crew roles shipwright/navigator | d5 | — |
| `active_generic_sea_01_fog_bell_contact` | fogBellContact | 15+ (180+ mois) | `isAtSea` | Dice Observation + collision évitée dans le brouillard | crew role helmsman | d3 | — |
| `active_generic_sea_01_overturned_longboat` | overturnedLongboatRescue | 15+ (180+ mois) | `isAtSea` | Dice Strength + sauvetage continu | race fishman; crew role medic | d3 | — |
| `active_generic_sea_01_current_shear` | crossCurrentShear | 15+ (180+ mois) | `isAtSea` + `hasShip` | Dice Navigation + lecture de courant | crew roles navigator/helmsman; Ship HP | d3 | — |
| `active_generic_sea_01_three_striped_sail` | threeStripedSail | 15+ (180+ mois) | `isAtSea` | Lifetime Thread / rival maritime récurrent | Trait curious conditionnel | — | active_generic_sea_01_rival_s01 |
| `active_generic_sea_01_dead_calm_watch` | deadCalmWatch | 15+ (180+ mois) | `isAtSea` | Dice Morale / fatigue ponctuelle | — | — | — |
| `active_generic_sea_01_night_mast_knock` | nightMastKnock | 15+ (180+ mois) | `isAtSea` + `hasShip` | Diagnostic déterministe d’un bruit de gréement | crew role shipwright | — | — |
| `active_generic_sea_01_floating_timber_field` | floatingTimberField | 15+ (180+ mois) | `isAtSea` + `hasShip` | Dice Agility / obstacle flottant | leadership; Ship HP | — | — |
| `active_generic_sea_01_missing_stars` | missingStars | 15+ (180+ mois) | `isAtSea` | Navigation sans repères visibles | crew role navigator; Trait cautious | — | — |
| `active_generic_sea_01_reef_birds` | reefBirds | 15+ (180+ mois) | `isAtSea` | Observation d’oiseaux / prudence face aux hauts-fonds | Trait curious | — | — |
| `active_generic_sea_01_salted_stores_argument` | saltedStoresArgument | 15+ (180+ mois) | `isAtSea` | Dice Charisma / rationnement ponctuel sans ressource | — | — | active_generic_sea_01_salted_stores_argument_later_watch |
| `active_generic_sea_01_luminous_wake` | luminousWake | 15+ (180+ mois) | `isAtSea` | Phénomène marin local / curiosité | Traits superstitious, curious | — | — |
| `active_generic_sea_01_horizon_pacer` | horizonPacer | 15+ (180+ mois) | `isAtSea` | Navire inconnu gardant la distance | leadership; Trait suspicious | — | active_generic_sea_01_horizon_pacer_return |
| `active_generic_sea_01_message_buoy` | messageBuoy | 15+ (180+ mois) | `isAtSea` | Message de navigation anonyme sur bouée | Trait suspicious | — | active_generic_sea_01_message_buoy_answering_signal |
| `active_generic_sea_01_rudder_shudder` | rudderShudder | 15+ (180+ mois) | `isAtSea` + `hasShip` | Dice Intelligence / petite avarie de gouvernail | crew role shipwright; leadership; Ship HP | — | — |
| `active_generic_sea_01_distant_flare` | distantFlare | 15+ (180+ mois) | `isAtSea` | Signal de détresse lointain | leadership | — | active_generic_sea_01_distant_flare_grateful_lantern |
| `active_generic_sea_01_cross_swell` | crossSwell | 15+ (180+ mois) | `isAtSea` + `hasShip` | Dice Navigation / deux houles concurrentes | crew role navigator; Ship HP | — | — |
| `active_generic_sea_01_line_burn` | lineBurn | 15+ (180+ mois) | `isAtSea` + `hasShip` | Décision physique sur une corde sous tension | Trait resourceful | — | — |
| `active_generic_sea_01_false_dawn` | falseDawn | 15+ (180+ mois) | `isAtSea` | Erreur de lecture du ciel nocturne | Trait superstitious | — | — |
| `active_generic_sea_01_drifting_net` | driftingNet | 15+ (180+ mois) | `isAtSea` + `hasShip` | Filet dérivant / sécurité vs récupération | leadership; Trait greedy | — | — |

## SIGNATURE_IMMEDIATE_ARCS

**Root ID:** `active_generic_sea_01_squall_staysail_snap`  
**arcKey:** `squallRiggingCascade`  
**Maximum reachable Immediate depth:** **5**  
**Premise:** Un grain transversal fait courir une drisse, croise les lignes puis déstabilise successivement mât, toile et dernière attache avant l’inspection post-grain.

## SECONDARY_IMMEDIATE_ARCS

- active_generic_sea_01_fog_bell_contact — **arcKey:** `fogClosePassArc` — **depth 3** — Une cloche mobile dans le brouillard devient un croisement à très courte distance puis un dernier échange entre deux ponts.
- active_generic_sea_01_overturned_longboat — **arcKey:** `overturnedLongboatRescueArc` — **depth 3** — Trois rescapés agrippés à une barque retournée imposent des priorités de sauvetage successives jusqu’à la vérification finale.
- active_generic_sea_01_current_shear — **arcKey:** `currentShearEscapeArc` — **depth 3** — Une cassure de courant déporte le navire, révèle une frontière d’écume puis une sortie ambiguë avant le retour à une eau normale.

## LIFETIME_THREADS

### active_generic_sea_01_three_striped_sail — `threeStripedSailRivalry`

**Ancre durable:** une goélette reconnaissable à trois bandes de toile claire, rencontrée uniquement lorsque la conséquence devient exécutable en mer ; continuité portée par History et la chaîne Scheduled verticale, sans NPC, ShipDefinition, Item, Flag ou état de thread nouveau.  
**Longest reachable Scheduled depth:** 14  
**Total distinct reachable Scheduled EventDefinitions:** 27  
**Vrais points de divergence long-terme:** 4 — S3 (`cooperate` / `race` / `distance`), S6 (`help` / `challenge` / `keep_clear`), S9 (`cooperate_publicly` / `rival_story` / `cut_story`), S12 (`trust_together` / `separate_safe`).  
**Topologie:** `strongly_branching` — les trois premiers splits gardent des branches distinctes pendant deux chapitres Scheduled avant reconvergence ; la branche S9 `cut_story` se termine à S11C, tandis que coopération/rivalité continuent vers S12 ; S12 crée une dernière séparation de vécu avant la conclusion commune. Scheduling strictement vertical : chaque chapitre ne programme que son futur direct.  
**Span visé:** environ 14 ans entre le seed et la conclusion sur le chemin le plus long (gaps typiques de 8–18 mois), donc typiquement d’environ 15 ans à la fin de la vingtaine si le seed arrive tôt en Active. La thread reste portable géographiquement : elle attend `isAtSea` et ne déplace jamais ni le joueur ni la goélette par Effect.

### Branch map

- Seed → `rival_s01` → `s02` → `s03`.
- **Split 1:** `s03` → `s04_a → s05_a` / `s04_b → s05_b` / `s04_c → s05_c` → reconvergence `s06`.
- **Split 2:** `s06` → `s07_a → s08_a` / `s07_b → s08_b` / `s07_c → s08_c` → reconvergence `s09`.
- **Split 3:** `s09` → `s10_a → s11_a` / `s10_b → s11_b` / `s10_c → s11_c`; `s11_c` termine la thread, A/B reconvergent vers `s12`.
- **Split 4:** `s12` → `s13_a` / `s13_b` → `s14_end`.

## PERSISTENT_IDS_USED

- **Traits (conditions only):** `curious`, `cautious`, `superstitious`, `suspicious`, `trusting`, `resourceful`, `greedy`, `proud`.
- **Race (condition only):** `fishman`.
- **Crew roles (conditions only):** `navigator`, `medic`, `shipwright`, `helmsman`.
- **Ship chassis IDs:** None. Le batch utilise seulement `hasShip`, `isLeader` et `modifyShipHealth`; il n’acquiert, ne remplace et ne vend aucun navire.
- **NPC IDs:** None.
- **Item IDs / Cargo IDs:** None.
- **Flag IDs:** None.
- **Location IDs:** None.
- **Career Rank / Career Title / Ending IDs:** None.
- **Devil Fruit / Haki IDs:** None.

## DEPENDENCIES

- Runtime content schema v6.
- Active loop avec 2 slots par mois.
- Immediate chain = même slot que le root.
- Scheduled priority/reach V1.
- Existing Traits, crew roles, race and ship state only.
- No dependency on another authored batch.

## CAREER_RANK_TITLE_BOUNTY_CONTEXT

- Compatible avec `civilian`, `pirate`, `marine`, `revolutionary`, `bounty_hunter`.
- Aucun root n’exige une Career précise.
- Aucun changement de Career, rank, title ou bounty.
- `modifyReputation` est utilisé uniquement lorsque l’acte peut plausiblement être vu/retransmis : sauvetage, coordination entre navires, chaîne d’avertissements ou rivalité devenue connue.

## SHIP_CREW_POWERS_CONTEXT

- Plusieurs incidents de coque/gréement exigent `hasShip`; les décisions de commandement restent visibles mais grisées via `availableIf: isLeader`.
- Un joueur non-Leader conserve toujours au moins une Choice inconditionnelle.
- Les rôles `navigator`, `medic`, `shipwright`, `helmsman` ouvrent seulement des Choices contextuelles ; aucun bonus universel.
- Aucun système de provisions, carburant, combat naval, module, upgrade, flotte ou cargaison active.
- Aucun Fruit du Démon ou Haki distribué, éveillé ou requis.

## TIMELINE_AND_CANON

- Tous les roots sont Active et commencent au plus tôt à `ageMonths = 180`.
- Aucun personnage canon majeur, organisation canon sensible ou événement canon majeur.
- Les scènes se placent dans les interstices maritimes ordinaires et restent compatibles avec plusieurs mers.
- La Lifetime n’impose aucun lieu, route Paradise, entrée Grand Line ou destination New World.

## GEOGRAPHY_AND_MOVEMENT

- **Ingress connus:** `isAtSea`; pour les scènes matérielles de coque/gréement, `hasShip`.
- **Egress connus:** None — aucun `moveToLocation`, aucun changement de `travelState`.
- **Transitions parent/sous-location:** None.
- **Transitions gated/special:** None.
- **Cross-route rares:** None.
- **Contribution à la couverture de déplacement normal:** None. Le batch densifie le temps passé en mer mais ne choisit ni ne modifie les destinations.
- `recoverTravel`, `dead_end_on_land` et `dead_end_at_sea` ne sont jamais utilisés.

## COVERAGE_SUMMARY

- **Root Events:** 20 Normal.
- **DiceCheck roots:** **9/20**.
- **Roots créant du Scheduled:** **5/20** : 1 Lifetime seed + 4 roots à conséquence Scheduled ordinaire.
- **Scheduled hors Lifetime descendants:** 4.
- **Immediate Events:** 14.
- **Mini-arcs Immediate qualifiants:** 4 : 1 Signature depth 5 + 3 Secondary depth 3.
- **Lifetime Scheduled nodes:** 27 distincts atteignables.
- **Lifetime longest path:** 14 Scheduled.
- **Lifetime meaningful long-term divergences:** 4.
- **Root Dice Stats:** `agility`, `observation`, `strength`, `navigation`, `morale`, `charisma`, `intelligence` ; la couverture root est volontairement large et ne se réduit pas à Navigation/Observation.
- **Additional Dice Stats in Immediate:** `strength`, `agility`, `charisma`, `intelligence`.
- **Traits queried:** `curious`, `cautious`, `superstitious`, `suspicious`, `trusting`, `resourceful`, `greedy`, `proud`.
- **Traits acquired/removed:** None.
- **Geography:** exclusivement `isAtSea`; aucun `locationIs`, aucune destination ou téléportation.
- **Ship context:** `hasShip`, `isLeader`, `modifyShipHealth`.
- **Crew context:** 4 rôles existants utilisés uniquement en Choices grisées.

## DEDUP_NOTES

Le ledger courant contient les batches Childhood acceptés. Les 20 roots ci-dessous ont été revus contre leurs prémisses, leurs Immediate arcs et leurs Lifetime Threads ; aucun ancien JSON retiré n’a été recyclé.

- `active_generic_sea_01_squall_staysail_snap` — Grain transversal + rupture progressive du gréement sur un navire adulte ; distinct du `stormBanner` Childhood et des incidents de mise à l’eau/local port.
- `active_generic_sea_01_fog_bell_contact` — Risque de croisement de deux coques dans un brouillard fermé ; distinct de `harborSignalMismatch`, qui portait sur une signalisation de quai.
- `active_generic_sea_01_overturned_longboat` — Sauvetage de trois adultes agrippés à une barque retournée, avec recherche sous coque ; distinct des anciennes prémisses de simple barque dérivante ou d’accident d’enfant.
- `active_generic_sea_01_current_shear` — Cassure de courant qui déporte tout le navire et doit être lue en mouvement ; distinct des exercices cartographiques Childhood et des courants de port.
- `active_generic_sea_01_three_striped_sail` — Relation pluriannuelle avec une goélette rivale récurrente ; distincte de toutes les Lifetimes Childhood (peur, faveurs, dette familiale, carnet, signaux, atlas, agriculture, mémoire historique).
- `active_generic_sea_01_dead_calm_watch` — Torpeur d’un calme plat et discipline de veille adulte ; pas un exercice de persévérance Childhood.
- `active_generic_sea_01_night_mast_knock` — Diagnostic nocturne d’une vibration du gréement par le roulis ; distinct d’une réparation d’atelier ou d’un objet cassé à terre.
- `active_generic_sea_01_floating_timber_field` — Champ de gros bois flottés semi-submergés menaçant directement la coque ; distinct d’une collecte de débris ou d’un jeu d’observation côtier.
- `active_generic_sea_01_missing_stars` — Perte temporaire de repères célestes au large ; distinct d’un carnet/cartographie scolaire.
- `active_generic_sea_01_reef_birds` — Oiseaux de mer ambigus utilisés comme indice de hauts-fonds ou de banc de poissons ; distinct de `fallen_nest` et des scènes animales terrestres.
- `active_generic_sea_01_salted_stores_argument` — Stores salés par une entrée d’eau et dispute adulte sur l’allocation immédiate ; explicitement sans jauge de provisions, distinct d’un simple `ration_argument` abstrait.
- `active_generic_sea_01_luminous_wake` — Bioluminescence dans le sillage comme phénomène marin raisonnable ; distinct du `tidepool_glint` côtier Childhood.
- `active_generic_sea_01_horizon_pacer` — Voile inconnue qui copie les changements d’allure puis réapparaît plus tard ; distinct de `foreign_sails`, qui était une arrivée au port et une rencontre culturelle.
- `active_generic_sea_01_message_buoy` — Bouée de sécurité anonyme qui porte des messages entre navigateurs ; distinct des signaux de Loguetown et du carnet itinérant Childhood.
- `active_generic_sea_01_rudder_shudder` — Tremblement du gouvernail lié à un débris coincé, diagnostic en mer ; distinct des réparations d’atelier et du `jammed_winch` retiré.
- `active_generic_sea_01_distant_flare` — Fusée de détresse lointaine avec réponse différée par lanternes ; distinct des sauvetages immédiats et des signaux portuaires.
- `active_generic_sea_01_cross_swell` — Deux houles superposées qui créent un rythme dangereux pour la coque ; pas un simple orage ou une épreuve de force.
- `active_generic_sea_01_line_burn` — Brûlure de corde et choix de prise sous charge ; scène de geste marin adulte, distincte des manipulations d’outils Childhood.
- `active_generic_sea_01_false_dawn` — Lune diffusée prise pour une fausse aube, test de discipline d’orientation ; distinct des histoires de superstition générales.
- `active_generic_sea_01_drifting_net` — Filet abandonné comme danger d’enchevêtrement, avec récupération seulement comme option de leadership ; distinct d’un événement de cargaison/commerce.

## PROPOSED_DEFINITIONS

None.
