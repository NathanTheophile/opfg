import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { CONTENT_SCHEMA_VERSION } from '../src/game/content/schema';
import { dictionaries, loadLocale, LOCALE_STORAGE_KEY, saveLocale, t, validateLocalePlaceholders } from '../src/game/localization';
import { extractPlaceholders, interpolate } from '../src/game/localization/interpolate';
import { eventTitleKey } from '../src/game/localization/keys';
import { validateContent } from '../src/game/validation/validateContent';

describe('localization runtime', () => {
  it('keeps authoritative French labels as Unicode without mojibake', () => {
    expect(dictionaries.fr['power.awakening']).toBe('Éveil');
    expect(dictionaries.fr['race.giant.name']).toBe('Géant');
    expect(dictionaries.fr['stat.agility']).toBe('Agilité');
    expect(dictionaries.fr['stat.health']).toBe('Santé');
    expect(dictionaries.fr['npcStatus.crew']).toBe('Équipage');
    expect(dictionaries.fr['affiliation.revolutionary.name']).toBe('Révolutionnaire');
    expect(dictionaries.fr['power.haki.observation']).toBe('Haki de l’Observation');
    expect(dictionaries.fr['power.haki.armament']).toBe('Haki de l’Armement');
    expect(dictionaries.fr['power.haki.conqueror']).toBe('Haki du Conquérant');
    expect(dictionaries.fr['ui.navigation.goToSea']).toBe('Prendre la mer');
    expect(dictionaries.fr['ui.navigation.dock']).toBe('Accoster');
    for (const value of Object.values(dictionaries.fr)) {
      expect(value).not.toMatch(/Ãƒ|Ã‚|â€™|â€œ|â€|ï¿½|�/u);
    }
  });

  it('looks up French, uses English when present, and falls back to French', () => {
    expect(t(eventTitleKey('black_squall'), 'fr')).toBe('Le grain noir');
    expect(t('ui.field.name', 'en')).toBe('Name');
    expect(t(eventTitleKey('black_squall'), 'en')).toBe('Le grain noir');
    expect(t('missing.key', 'fr')).toBe('[MISSING: missing.key]');
  });

  it('interpolates parameters and extracts stable placeholder sets', () => {
    expect(interpolate('Bonjour {{playerName}}', { playerName: 'Robin' })).toBe('Bonjour Robin');
    expect(extractPlaceholders('{{other}} puis {{playerName}} et {{other}}')).toEqual(['other', 'playerName']);
    expect(t('event.origin_race.text', 'en', { playerName: 'Robin' })).toContain('Robin');
  });

  it('detects placeholder mismatches in secondary translations', () => {
    dictionaries.en['event.origin_race.text'] = 'Hello';
    expect(validateLocalePlaceholders('en')).toContainEqual(expect.stringContaining('placeholders differ'));
    dictionaries.en['event.origin_race.text'] = '{{playerName}}, what people do you come from?';
  });

  it('validates schema version and every source localization key', () => {
    expect(contentCatalog.schemaVersion).toBe(CONTENT_SCHEMA_VERSION);
    expect(validateContent(contentCatalog)).toEqual([]);
    const source = { ...dictionaries.fr };
    delete source[eventTitleKey('origin_name')];
    expect(validateContent(contentCatalog, source)).toContainEqual(expect.objectContaining({ message: expect.stringContaining('Missing source localization key') }));
    expect(validateContent({ ...contentCatalog, schemaVersion: 109 })).toContainEqual(expect.objectContaining({ path: 'schemaVersion' }));
  });

  it('persists locale independently from GameState', () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    expect(loadLocale(storage, 'fr-FR')).toBe('fr');
    expect(saveLocale(storage, 'en')).toBe(true);
    expect(values.get(LOCALE_STORAGE_KEY)).toBe('en');
    expect(loadLocale(storage, 'fr-FR')).toBe('en');
  });
});
