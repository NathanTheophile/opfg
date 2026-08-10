import fr from './locales/fr.json';
import en from './locales/en.json';
import { interpolate, extractPlaceholders, type InterpolationParams } from './interpolate';
import type { LocalizationKey } from './keys';
export const SOURCE_LOCALE = 'fr' as const;
export const supportedLocales = ['fr', 'en'] as const;
export type LocaleId = typeof supportedLocales[number];
export type LocalizationDictionary = Record<string, string>;
export type Translator = (key: LocalizationKey, params?: InterpolationParams) => string;
export const dictionaries: Record<LocaleId, LocalizationDictionary> = {
  fr: { ...fr },
  en: { ...en },
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
