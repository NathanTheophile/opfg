import { useEffect, useState } from 'react';
import {
  supportedLocales,
  type LocaleId,
} from '@/game/localization';

const LOCALE_STORAGE_KEY = 'jam-op-fan-game.locale';
const LOCALE_CHANGED_EVENT = 'opfg:locale-changed';

function isLocaleId(value: string | null): value is LocaleId {
  return (
    value !== null &&
    supportedLocales.includes(value as LocaleId)
  );
}

function getInitialLocale(): LocaleId {
  if (typeof window === 'undefined') return 'fr';

  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (isLocaleId(stored)) return stored;

  const browserLanguage = window.navigator.language
    .toLowerCase()
    .split('-')[0];

  return isLocaleId(browserLanguage)
    ? browserLanguage
    : 'fr';
}

export function notifyUiLocaleChanged(locale: LocaleId): void {
  window.dispatchEvent(
    new CustomEvent(LOCALE_CHANGED_EVENT, {
      detail: { locale },
    }),
  );
}

export function useObservedUiLocale(): LocaleId {
  const [locale, setLocale] = useState<LocaleId>(getInitialLocale);

  useEffect(() => {
    const syncFromStorage = () => {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocaleId(stored)) setLocale(stored);
    };

    const handleCustomLocaleChange = (event: Event) => {
      const custom = event as CustomEvent<{ locale?: LocaleId }>;
      const next = custom.detail?.locale;

      if (next && supportedLocales.includes(next)) {
        setLocale(next);
      }
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener(
      LOCALE_CHANGED_EVENT,
      handleCustomLocaleChange,
    );

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener(
        LOCALE_CHANGED_EVENT,
        handleCustomLocaleChange,
      );
    };
  }, []);

  return locale;
}
