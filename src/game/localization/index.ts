import fr from './locales/fr.json';
import en from './locales/en.json';
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
    'ui.landing.resetBody': "La partie active sera supprimée. L'historique des anciennes parties n'est pas encore branché dans cette ébauche.",
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
    'ui.landing.resetBody': 'The active game will be deleted. Previous-run history is not connected in this first draft yet.',
    'ui.landing.resetConfirm': 'Delete and restart',
  },
};

const activeSystemDictionaries: Record<LocaleId, LocalizationDictionary> = {
  fr: {
    'ui.departure.title': 'Prendre la mer ?',
    'ui.departure.body': 'Tu peux quitter cette île maintenant, ou rester encore ici.',
    'ui.departure.depart': 'Prendre la mer',
    'ui.departure.stay': 'Rester ici',
    'ui.departure.departOutcome': 'Le navire quitte la côte.',
    'ui.departure.stayOutcome': 'Tu restes encore quelque temps.',
  },
  en: {
    'ui.departure.title': 'Set sail?',
    'ui.departure.body': 'You can leave this island now, or stay here a while longer.',
    'ui.departure.depart': 'Set sail',
    'ui.departure.stay': 'Stay here',
    'ui.departure.departOutcome': 'The ship leaves the coast behind.',
    'ui.departure.stayOutcome': 'You stay here a while longer.',
  },
};

export const dictionaries: Record<LocaleId, LocalizationDictionary> = {
  fr: { ...fr, ...landingDictionaries.fr, ...activeSystemDictionaries.fr },
  en: { ...en, ...landingDictionaries.en, ...activeSystemDictionaries.en },
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
