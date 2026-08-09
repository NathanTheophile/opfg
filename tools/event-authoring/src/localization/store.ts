import type { EventDefinition } from '../gameSchema/current/contract';
import { collectEventLocalizationKeys, mapEventLocalizationKeys } from './keys';
import type { LocalizedAuthoringEntry, LocalizationAuthoringStore, LocalizationStatus } from './types';

export const SOURCE_LOCALE = 'fr' as const;

export const createEntry = (key: string, sourceText = ''): LocalizedAuthoringEntry => ({
  key,
  sourceRevision: 1,
  values: { fr: { text: sourceText, sourceRevision: 1 } },
});

export const getText = (store: LocalizationAuthoringStore, key: string, locale: string = SOURCE_LOCALE): string =>
  store[key]?.values[locale]?.text ?? '';

export const getStatus = (store: LocalizationAuthoringStore, key: string, locale: string, sourceLocale: string = SOURCE_LOCALE): LocalizationStatus => {
  const entry = store[key];
  const value = entry?.values[locale];
  if (!entry || !value?.text.trim()) return 'missing';
  if (locale === sourceLocale) return 'current';
  return value.sourceRevision < entry.sourceRevision ? 'outdated' : 'current';
};

export const setLocalizedText = (
  store: LocalizationAuthoringStore,
  key: string,
  locale: string,
  text: string,
  sourceLocale: string = SOURCE_LOCALE,
): LocalizationAuthoringStore => {
  const next = structuredClone(store);
  const entry = next[key] ?? createEntry(key, '');
  next[key] = entry;

  if (locale === sourceLocale) {
    const previous = entry.values[sourceLocale]?.text ?? '';
    if (previous === text) return next;
    entry.sourceRevision += 1;
    entry.values[sourceLocale] = { text, sourceRevision: entry.sourceRevision };
    return next;
  }

  entry.values[locale] = { text, sourceRevision: entry.sourceRevision };
  return next;
};

export const ensureKeys = (store: LocalizationAuthoringStore, keys: string[]): LocalizationAuthoringStore => {
  const next = structuredClone(store);
  for (const key of keys) if (!next[key]) next[key] = createEntry(key, '');
  return next;
};

export const syncEventLocalization = (
  store: LocalizationAuthoringStore,
  previous: EventDefinition,
  nextEvent: EventDefinition,
  duplicate = false,
): LocalizationAuthoringStore => {
  const next = structuredClone(store);
  for (const [oldKey, newKey] of mapEventLocalizationKeys(previous, nextEvent)) {
    if (oldKey === newKey) continue;
    if (next[oldKey]) {
      next[newKey] = { ...structuredClone(next[oldKey]), key: newKey };
      if (!duplicate) delete next[oldKey];
    }
  }
  return ensureKeys(next, collectEventLocalizationKeys(nextEvent));
};

export const removeEventLocalization = (store: LocalizationAuthoringStore, event: EventDefinition): LocalizationAuthoringStore => {
  const next = structuredClone(store);
  for (const key of collectEventLocalizationKeys(event)) delete next[key];
  return next;
};

export const eventLocalizationStatus = (
  store: LocalizationAuthoringStore,
  event: EventDefinition,
  locale: string,
  sourceLocale: string = SOURCE_LOCALE,
): LocalizationStatus => {
  const statuses = collectEventLocalizationKeys(event).map((key) => getStatus(store, key, locale, sourceLocale));
  if (statuses.includes('missing')) return 'missing';
  if (statuses.includes('outdated')) return 'outdated';
  return 'current';
};

export const extractPlaceholders = (text: string): string[] => text.match(/{{[^{}]+}}/g)?.sort() ?? [];
export const placeholdersMatch = (source: string, translation: string): boolean => {
  const a = extractPlaceholders(source);
  const b = extractPlaceholders(translation);
  return a.length === b.length && a.every((value, index) => value === b[index]);
};

export const exportLocaleDictionary = (store: LocalizationAuthoringStore, locale: string): Record<string, string> => {
  const dictionary: Record<string, string> = {};
  for (const [key, entry] of Object.entries(store)) {
    const text = entry.values[locale]?.text;
    if (text?.trim()) dictionary[key] = text;
  }
  return dictionary;
};

