import fr from './locales/fr.json';
import en from './locales/en.json';
import runHistoryFr from './locales/run-history.fr.json';
import runHistoryEn from './locales/run-history.en.json';
import yearEndFr from './locales/year-end.fr.json';
import yearEndEn from './locales/year-end.en.json';
import { interpolate, extractPlaceholders, type InterpolationParams } from './interpolate';
import type { LocalizationKey } from './keys';
export const SOURCE_LOCALE = 'fr' as const;
export const supportedLocales = ['fr', 'en'] as const;
export type LocaleId = typeof supportedLocales[number];
export type LocalizationDictionary = Record<string, string>;
export type Translator = (key: LocalizationKey, params?: InterpolationParams) => string;

const landingDictionaries: Record<LocaleId, LocalizationDictionary> = {
  fr: {
    'ui.landing.title': 'One Piece: Destinies',
    'ui.landing.kicker': 'Forge ta destinée',
    'ui.landing.tagline': 'Une vie entière à construire, des mers à traverser et des choix qui laissent des traces.',
    'ui.landing.continue': 'Continuer',
    'ui.landing.newGame': 'Nouvelle partie',
    'ui.landing.achievements': 'Achievements',
    'ui.landing.shop': 'Boutique',
    'ui.landing.history': 'Historique',
    'ui.landing.secondaryNavigation': 'Navigation secondaire',
    'ui.landing.unnamed': 'Sans nom',
    'ui.landing.affiliationUnknown': 'Affiliation à définir',
    'ui.landing.ageYears': '{years} ans',
    'ui.landing.ageYearsMonths': '{years} ans · {months} mois',
    'ui.landing.placeholder': 'Cette section est réservée dans la landing et sera branchée dans une prochaine passe.',
    'ui.landing.close': 'Fermer',
    'ui.landing.cancel': 'Annuler',
    'ui.landing.resetTitle': 'Commencer une nouvelle partie ?',
    'ui.landing.resetBody': "La partie active sera supprimée. Les runs déjà terminées resteront disponibles dans l'Historique.",
    'ui.landing.resetConfirm': 'Supprimer et recommencer',
  },
  en: {
    'ui.landing.title': 'One Piece: Destinies',
    'ui.landing.kicker': 'Forge your destiny',
    'ui.landing.tagline': 'Build an entire life, cross the seas and make choices that leave a mark.',
    'ui.landing.continue': 'Continue',
    'ui.landing.newGame': 'New game',
    'ui.landing.achievements': 'Achievements',
    'ui.landing.shop': 'Shop',
    'ui.landing.history': 'History',
    'ui.landing.secondaryNavigation': 'Secondary navigation',
    'ui.landing.unnamed': 'Unnamed',
    'ui.landing.affiliationUnknown': 'Affiliation not chosen',
    'ui.landing.ageYears': '{years} years',
    'ui.landing.ageYearsMonths': '{years} years · {months} months',
    'ui.landing.placeholder': 'This section is reserved in the landing page and will be connected in a later pass.',
    'ui.landing.close': 'Close',
    'ui.landing.cancel': 'Cancel',
    'ui.landing.resetTitle': 'Start a new game?',
    'ui.landing.resetBody': 'The active game will be deleted. Completed runs will remain available in History.',
    'ui.landing.resetConfirm': 'Delete and restart',
  },
};

const activeSystemDictionaries: Record<LocaleId, LocalizationDictionary> = {
  fr: {
    'ui.crew.power.confirm.title': 'Utiliser ce pouvoir ?',
    'ui.crew.power.confirm.body': 'Êtes-vous sûr de vouloir utiliser le pouvoir du {role} ?',
    'ui.crew.power.confirm.yes': 'Oui',
    'ui.crew.power.confirm.no': 'Non',
    'ui.departure.title': 'Prendre la mer ?',
    'ui.departure.body': 'Tu peux quitter cette île maintenant, ou rester encore ici.',
    'ui.departure.depart': 'Prendre la mer',
    'ui.departure.stay': 'Rester ici',
    'ui.departure.departOutcome': 'Le navire quitte la côte.',
    'ui.departure.stayOutcome': 'Tu restes encore quelque temps.',
    'event.active_reverse_mountain_01_entry.title': 'Le courant grimpe',
    'event.active_reverse_mountain_01_entry.text': "Reverse Mountain se dresse devant toi. L'eau remonte la pente comme un mur lancé vers le ciel.",
    'event.active_reverse_mountain_01_entry.choice.hold_line.text': 'Tenir la ligne',
    'event.active_reverse_mountain_01_entry.choice.read_current.text': 'Lire les remous',
    'event.active_reverse_mountain_01_entry.outcome.criticalFailure.text': 'Le courant vous écrase contre la pente avant que vous repreniez le contrôle.',
    'event.active_reverse_mountain_01_entry.outcome.failure.text': 'La montée vous secoue violemment, mais vous restez dans le courant.',
    'event.active_reverse_mountain_01_entry.outcome.success.text': 'Vous trouvez la ligne qui porte le navire vers le sommet.',
    'event.active_reverse_mountain_01_entry.outcome.criticalSuccess.text': 'Tu lis la montée parfaitement et gardes tout le monde concentré.',
    'event.active_reverse_mountain_01_climb.title': "Jusqu'au sommet",
    'event.active_reverse_mountain_01_climb.text': 'La pente se resserre. Une erreur maintenant suffit à vous rejeter hors du chenal.',
    'event.active_reverse_mountain_01_climb.choice.force_passage.text': 'Forcer le passage',
    'event.active_reverse_mountain_01_climb.choice.follow_current.text': 'Suivre le courant',
    'event.active_reverse_mountain_01_climb.outcome.criticalFailure.text': 'Tu encaisses le choc de plein fouet avant que la trajectoire se redresse.',
    'event.active_reverse_mountain_01_climb.outcome.failure.text': 'Le passage coûte cher en énergie, mais le sommet approche.',
    'event.active_reverse_mountain_01_climb.outcome.success.text': 'Vous franchissez la dernière cassure sans perdre le rythme.',
    'event.active_reverse_mountain_01_climb.outcome.criticalSuccess.text': 'Le sommet arrive exactement là où tu l’avais prévu.',
    'event.active_reverse_mountain_01_descent.title': "De l'autre côté",
    'event.active_reverse_mountain_01_descent.text': "Au sommet, la mer bascule. Grand Line s'ouvre en contrebas, avec Twin Capes au bout de la descente.",
    'event.active_reverse_mountain_01_descent.choice.enter_paradise.text': 'Descendre vers Twin Capes',
    'event.active_reverse_mountain_01_descent.outcome.entered.text': 'La descente vous recrache enfin à Twin Capes.',
    'event.active_paradise_sea_crossing.title': 'Courants de Grand Line',
    'event.active_paradise_sea_crossing.text': "La mer change d'humeur sans prévenir. Il faut garder le cap jusqu'à la prochaine île.",
    'event.active_paradise_sea_crossing.choice.hold_course.text': 'Tenir le cap',
    'event.active_paradise_sea_crossing.choice.watch_weather.text': 'Lire le ciel',
    'event.active_paradise_sea_crossing.outcome.criticalFailure.text': 'Une mauvaise lecture vous fait encaisser la mer de travers.',
    'event.active_paradise_sea_crossing.outcome.failure.text': 'La route tient, mais le bateau souffre.',
    'event.active_paradise_sea_crossing.outcome.success.text': 'Vous gardez un cap propre malgré les courants.',
    'event.active_paradise_sea_crossing.outcome.criticalSuccess.text': 'Tu exploites le changement de courant au lieu de le subir.',
    'event.active_paradise_no_log_pose_hazard.title': 'Aiguille muette',
    'event.active_paradise_no_log_pose_hazard.text': 'Sans Log Pose actif, aucun cap ne tient longtemps. La mer vous entraîne loin de toute route sûre.',
    'event.active_paradise_no_log_pose_hazard.choice.trust_instinct.text': "Naviguer à l'instinct",
    'event.active_paradise_no_log_pose_hazard.choice.wait_for_sign.text': 'Chercher un signe dans le ciel',
    'event.active_paradise_no_log_pose_hazard.outcome.criticalFailure.text': 'Vous vous jetez dans un courant brutal et le navire encaisse le choc.',
    'event.active_paradise_no_log_pose_hazard.outcome.failure.text': 'Vous perdez du temps et le navire fatigue dans les courants.',
    'event.active_paradise_no_log_pose_hazard.outcome.success.text': 'Un indice suffit pour éviter le pire.',
    'event.active_paradise_no_log_pose_hazard.outcome.criticalSuccess.text': 'Tu reconstruis un cap cohérent là où la mer semblait illisible.',
    'event.active_paradise_route_start_p1_classic.title': 'La route des grandes escales',
    'event.active_paradise_route_start_p1_classic.text': 'À Twin Capes, un courant ouvre la voie vers Cactus Island. Cette route traverse des escales très différentes avant les grands carrefours de Paradise.',
    'event.active_paradise_route_start_p2_trade.title': 'La route des marchands',
    'event.active_paradise_route_start_p2_trade.text': 'Des navires marchands quittent Twin Capes vers Glassreef Island. Leur sillage dessine une route de ports, marchés et chantiers à travers Paradise.',
    'event.active_paradise_route_start_p3_wild.title': 'La route sauvage',
    'event.active_paradise_route_start_p3_wild.text': 'Au large de Twin Capes, les vents poussent vers Tempest Key. La route qui suit privilégie reliefs, survie et îles peu accueillantes.',
    'event.active_paradise_route_start_p4_kingdoms.title': 'La route des royaumes',
    'event.active_paradise_route_start_p4_kingdoms.text': 'Un cap vers Goldfish Empire s’impose depuis Twin Capes. Au-delà, la route enchaîne royaumes, frontières et territoires où chaque pavillon compte.',
    'event.active_paradise_route_start_p5_outcasts.title': 'La route des sans-pavillon',
    'event.active_paradise_route_start_p5_outcasts.text': 'Les courants entraînent vers Driftwood Atoll. Cette voie traverse communautés marginales, récupérateurs et réseaux discrets plutôt que les grands ports.',
    'event.active_paradise_route_start_p6_strange.title': 'La route étrange',
    'event.active_paradise_route_start_p6_strange.text': 'Le premier cap pointe vers Ukkari Onsen Island. La route qui s’ouvre promet des escales imprévisibles où les règles ordinaires tiennent rarement longtemps.',
    'event.active_paradise_route_start_p7_hazard.title': 'La route des périls',
    'event.active_paradise_route_start_p7_hazard.text': 'Depuis Twin Capes, le courant file vers Emberfall Island. Cette route traverse des mers et des îles où météo, navire et préparation seront constamment testés.',
    'event.active_paradise_route_start.choice.take_course.text': 'Suivre ce cap',
    'event.active_paradise_route_start.outcome.course_set.text': 'La route est fixée. La prochaine traversée partira de Twin Capes.',
  },
  en: {
    'ui.crew.power.confirm.title': 'Use this power?',
    'ui.crew.power.confirm.body': "Are you sure you want to use the {role}'s power?",
    'ui.crew.power.confirm.yes': 'Yes',
    'ui.crew.power.confirm.no': 'No',
    'ui.departure.title': 'Set sail?',
    'ui.departure.body': 'You can leave this island now, or stay here a while longer.',
    'ui.departure.depart': 'Set sail',
    'ui.departure.stay': 'Stay here',
    'ui.departure.departOutcome': 'The ship leaves the coast behind.',
    'ui.departure.stayOutcome': 'You stay here a while longer.',
    'event.active_reverse_mountain_01_entry.title': 'The Current Climbs',
    'event.active_reverse_mountain_01_entry.text': 'Reverse Mountain towers ahead. The water runs uphill like a wall thrown at the sky.',
    'event.active_reverse_mountain_01_entry.choice.hold_line.text': 'Hold the line',
    'event.active_reverse_mountain_01_entry.choice.read_current.text': 'Read the current',
    'event.active_reverse_mountain_01_entry.outcome.criticalFailure.text': 'The current slams you into the slope before you regain control.',
    'event.active_reverse_mountain_01_entry.outcome.failure.text': 'The climb throws you around, but you stay inside the current.',
    'event.active_reverse_mountain_01_entry.outcome.success.text': 'You find the line carrying the ship toward the summit.',
    'event.active_reverse_mountain_01_entry.outcome.criticalSuccess.text': 'You read the climb perfectly and keep everyone focused.',
    'event.active_reverse_mountain_01_climb.title': 'To the Summit',
    'event.active_reverse_mountain_01_climb.text': 'The channel tightens. One mistake now is enough to throw you out of the flow.',
    'event.active_reverse_mountain_01_climb.choice.force_passage.text': 'Force the passage',
    'event.active_reverse_mountain_01_climb.choice.follow_current.text': 'Follow the current',
    'event.active_reverse_mountain_01_climb.outcome.criticalFailure.text': 'You take the impact head-on before the course straightens.',
    'event.active_reverse_mountain_01_climb.outcome.failure.text': 'The passage drains you, but the summit is close.',
    'event.active_reverse_mountain_01_climb.outcome.success.text': 'You clear the last break without losing momentum.',
    'event.active_reverse_mountain_01_climb.outcome.criticalSuccess.text': 'The summit arrives exactly where you expected it.',
    'event.active_reverse_mountain_01_descent.title': 'The Other Side',
    'event.active_reverse_mountain_01_descent.text': 'At the summit, the sea tips over. The Grand Line opens below, with Twin Capes at the end of the descent.',
    'event.active_reverse_mountain_01_descent.choice.enter_paradise.text': 'Descend toward Twin Capes',
    'event.active_reverse_mountain_01_descent.outcome.entered.text': 'The descent finally throws you out at Twin Capes.',
    'event.active_paradise_sea_crossing.title': 'Grand Line Currents',
    'event.active_paradise_sea_crossing.text': 'The sea changes mood without warning. You need to hold course until the next island.',
    'event.active_paradise_sea_crossing.choice.hold_course.text': 'Hold course',
    'event.active_paradise_sea_crossing.choice.watch_weather.text': 'Read the sky',
    'event.active_paradise_sea_crossing.outcome.criticalFailure.text': 'A bad read leaves you taking the sea broadside.',
    'event.active_paradise_sea_crossing.outcome.failure.text': 'The route holds, but the ship takes a beating.',
    'event.active_paradise_sea_crossing.outcome.success.text': 'You keep a clean course through the currents.',
    'event.active_paradise_sea_crossing.outcome.criticalSuccess.text': 'You use the current shift instead of fighting it.',
    'event.active_paradise_no_log_pose_hazard.title': 'Silent Needle',
    'event.active_paradise_no_log_pose_hazard.text': 'Without an active Log Pose, no heading lasts. The sea drags you away from any safe route.',
    'event.active_paradise_no_log_pose_hazard.choice.trust_instinct.text': 'Navigate by instinct',
    'event.active_paradise_no_log_pose_hazard.choice.wait_for_sign.text': 'Look for a sign in the sky',
    'event.active_paradise_no_log_pose_hazard.outcome.criticalFailure.text': 'You commit to a brutal current and the ship takes the hit.',
    'event.active_paradise_no_log_pose_hazard.outcome.failure.text': 'You lose time and the ship wears down in the currents.',
    'event.active_paradise_no_log_pose_hazard.outcome.success.text': 'One clue is enough to avoid the worst.',
    'event.active_paradise_no_log_pose_hazard.outcome.criticalSuccess.text': 'You rebuild a coherent course where the sea looked unreadable.',
    'event.active_paradise_route_start_p1_classic.title': 'The Major Stops Route',
    'event.active_paradise_route_start_p1_classic.text': 'At Twin Capes, a current opens the way toward Cactus Island. This route crosses very different stops before the major crossroads of Paradise.',
    'event.active_paradise_route_start_p2_trade.title': 'The Merchants Route',
    'event.active_paradise_route_start_p2_trade.text': 'Merchant ships leave Twin Capes toward Glassreef Island. Their wake traces a route of ports, markets and shipyards across Paradise.',
    'event.active_paradise_route_start_p3_wild.title': 'The Wild Route',
    'event.active_paradise_route_start_p3_wild.text': 'Beyond Twin Capes, the winds push toward Tempest Key. The route ahead favors rough terrain, survival and sparsely settled islands.',
    'event.active_paradise_route_start_p4_kingdoms.title': 'The Kingdoms Route',
    'event.active_paradise_route_start_p4_kingdoms.text': 'A course toward Goldfish Empire takes shape from Twin Capes. Beyond it, the route crosses kingdoms, borders and territories where every flag matters.',
    'event.active_paradise_route_start_p5_outcasts.title': 'The Flagless Route',
    'event.active_paradise_route_start_p5_outcasts.text': 'The currents pull toward Driftwood Atoll. This path runs through marginal communities, salvagers and quiet networks instead of the major ports.',
    'event.active_paradise_route_start_p6_strange.title': 'The Strange Route',
    'event.active_paradise_route_start_p6_strange.text': 'The first course points toward Ukkari Onsen Island. The route ahead promises unpredictable stops where ordinary rules rarely hold for long.',
    'event.active_paradise_route_start_p7_hazard.title': 'The Hazard Route',
    'event.active_paradise_route_start_p7_hazard.text': 'From Twin Capes, the current runs toward Emberfall Island. This route crosses seas and islands where weather, ship and preparation will be tested constantly.',
    'event.active_paradise_route_start.choice.take_course.text': 'Take this course',
    'event.active_paradise_route_start.outcome.course_set.text': 'The route is fixed. The next crossing will leave from Twin Capes.',
  },
};

export const dictionaries: Record<LocaleId, LocalizationDictionary> = {
  fr: { ...fr, ...landingDictionaries.fr, ...activeSystemDictionaries.fr, ...runHistoryFr, ...yearEndFr },
  en: { ...en, ...landingDictionaries.en, ...activeSystemDictionaries.en, ...runHistoryEn, ...yearEndEn },
};
export const LOCALE_STORAGE_KEY = 'jam-op-fan-game.locale';
export interface LocaleStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
export function detectLocale(language: string): LocaleId { return language.toLowerCase().startsWith('fr') ? 'fr' : 'en'; }
export function loadLocale(storage: LocaleStorage, language: string): LocaleId {
  try { const saved = storage.getItem(LOCALE_STORAGE_KEY); return saved === 'fr' || saved === 'en' ? saved : detectLocale(language); }
  catch { return detectLocale(language); }
}
export function saveLocale(storage: LocaleStorage, locale: LocaleId): boolean {
  try { storage.setItem(LOCALE_STORAGE_KEY, locale); return true; } catch { return false; }
}
export function t(key: LocalizationKey, locale: LocaleId, params?: InterpolationParams): string {
  const text = dictionaries[locale][key] ?? dictionaries[SOURCE_LOCALE][key];
  return text === undefined ? `[MISSING: ${key}]` : interpolate(text, params);
}
export function validateLocalePlaceholders(locale: LocaleId): string[] {
  if (locale === SOURCE_LOCALE) return [];
  return Object.entries(dictionaries[locale]).flatMap(([key, text]) => {
    const source = dictionaries[SOURCE_LOCALE][key];
    return source === undefined || JSON.stringify(extractPlaceholders(text)) === JSON.stringify(extractPlaceholders(source)) ? [] : [`${locale}.${key}: placeholders differ from ${SOURCE_LOCALE}.`];
  });
}
