import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { dictionaries } from '../src/game/localization';
import { eventTitleKey } from '../src/game/localization/keys';
import { validateContent } from '../src/game/validation/validateContent';

function cloneCatalog(): Record<string, any> {
  return structuredClone(contentCatalog);
}

function messages(catalog: unknown, source = dictionaries.fr): string[] {
  return validateContent(catalog, source).map(({ path, message }) => `${path}: ${message}`);
}

function eventById(catalog: Record<string, any>, eventId: string): Record<string, any> {
  const event = catalog.events.find((entry: Record<string, any>) => entry.id === eventId);
  if (!event) throw new Error(`Missing event fixture "${eventId}".`);
  return event;
}

function replayableNormal(catalog: Record<string, any>): Record<string, any> {
  const event = catalog.events.find((entry: Record<string, any>) =>
    entry.kind === 'normal'
    && entry.replay === undefined
    && entry.lifetimeThreadSeed !== true
    && entry.majorTrack === undefined,
  );
  if (!event) throw new Error('Missing replayable Normal Event fixture.');
  return event;
}

describe('validateContent smoke contracts', () => {
  it('accepts the production catalog', () => {
    expect(validateContent(contentCatalog)).toEqual([]);
  });

  it('rejects duplicate EventIds and ChoiceIds', () => {
    const catalog = cloneCatalog();
    const originName = eventById(catalog, 'origin_name');
    catalog.events.push(structuredClone(originName));
    originName.choices.push(structuredClone(originName.choices[0]));

    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('Duplicate ID "origin_name"'));
    expect(errors).toContainEqual(expect.stringContaining('Duplicate ID "confirm_name"'));
  });

  it('rejects unknown references recursively', () => {
    const catalog = cloneCatalog();
    eventById(catalog, 'origin_name').eligibility = {
      type: 'all',
      conditions: [
        { type: 'hasItem', itemId: 'missing_item' },
        { type: 'not', condition: { type: 'hasTrait', traitId: 'missing_trait' } },
        { type: 'npcStatusIs', npcId: 'missing_npc', status: 'known' },
      ],
    };

    const errors = messages(catalog);
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining('Unknown ItemId "missing_item"'),
      expect.stringContaining('Unknown TraitId "missing_trait"'),
      expect.stringContaining('Unknown NpcId "missing_npc"'),
    ]));
  });

  it('rejects invalid replay and Event-kind contracts', () => {
    const catalog = cloneCatalog();
    const event = replayableNormal(catalog);
    event.replay = { cooldownMonths: 0, maxOccurrences: 1 };
    event.lifetimeThreadSeed = true;

    const nonNormal = catalog.events.find((entry: Record<string, any>) => entry.kind !== 'normal');
    if (!nonNormal) throw new Error('Missing non-Normal fixture.');
    nonNormal.lifetimeThreadSeed = true;

    const errors = messages(catalog);
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining('cooldownMonths must be an integer of at least 1'),
      expect.stringContaining('maxOccurrences must be an integer of at least 2'),
      expect.stringContaining('lifetimeThreadSeed Events cannot be replayable'),
      expect.stringContaining('Invalid Event kind field combination'),
    ]));
  });

  it('rejects a missing source localization key', () => {
    const source = { ...dictionaries.fr };
    delete source[eventTitleKey('origin_name')];

    expect(validateContent(contentCatalog, source)).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining('Missing source localization key'),
      }),
    );
  });
});
