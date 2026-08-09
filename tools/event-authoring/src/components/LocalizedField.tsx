import type { LocalizationAuthoringStore } from '../localization/types';
import { getStatus, getText } from '../localization/store';

interface Props {
  label: string;
  localization: LocalizationAuthoringStore;
  localizationKey: string;
  locale: string;
  sourceLocale: string;
  onChange: (text: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}

export default function LocalizedField({ label, localization, localizationKey, locale, sourceLocale, onChange, multiline, rows = 3, placeholder }: Props) {
  const value = getText(localization, localizationKey, locale);
  const status = getStatus(localization, localizationKey, locale, sourceLocale);
  return <label className="field localized-field">
    <span className="localized-label"><span>{label}</span><code>{localizationKey}</code></span>
    {multiline
      ? <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      : <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
    {locale !== sourceLocale && status === 'outdated' && <span className="loc-warning">⚠ Translation outdated · source changed.</span>}
    {status === 'missing' && <span className={`loc-warning ${locale === sourceLocale ? 'error' : ''}`}>{locale === sourceLocale ? 'Source text missing.' : 'Translation missing.'}</span>}
  </label>;
}

