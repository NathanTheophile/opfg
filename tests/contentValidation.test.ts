import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { validateContent } from '../src/game/validation/validateContent';

function cloneCatalog(): Record<string, any> {
  return structuredClone(contentCatalog);
}

function messages(catalog: unknown): string[] {
  return validateContent(catalog).map(({ path, message }) => `${path}: ${message}`);
}

describe('validateContent', () => {
  it('accepts the minimal typed catalog', () => {
    expect(validateContent(contentCatalog)).toEqual([]);
  });

  it('rejects duplicate EventIds', () => {
    const catalog = cloneCatalog();
    catalog.events.push(structuredClone(catalog.events[0]));

    expect(messages(catalog)).toContainEqual(expect.stringContaining('Duplicate ID "test_departure"'));
  });

  it('rejects duplicate ChoiceIds inside an event', () => {
    const catalog = cloneCatalog();
    catalog.events[0].choices.push(structuredClone(catalog.events[0].choices[0]));

    expect(messages(catalog)).toContainEqual(expect.stringContaining('Duplicate ID "set_sail"'));
  });

  it('rejects an unknown EventId in hasChosen', () => {
    const catalog = cloneCatalog();
    catalog.events[1].eligibility.conditions[3].eventId = 'missing_event';

    expect(messages(catalog)).toContainEqual(expect.stringContaining('Unknown EventId "missing_event"'));
  });

  it.each([
    ['TraitId', 0, 'traitId', 'missing_trait'],
    ['ItemId', 1, 'itemId', 'missing_item'],
    ['NpcId', 2, 'npcId', 'missing_npc'],
  ])('rejects an unknown %s reference', (label, conditionIndex, field, missingId) => {
    const catalog = cloneCatalog();
    catalog.events[1].eligibility.conditions[conditionIndex][field] = missingId;

    expect(messages(catalog)).toContainEqual(expect.stringContaining(`Unknown ${label} "${missingId}"`));
  });

  it('rejects scheduleEvent targeting an unknown event', () => {
    const catalog = cloneCatalog();
    catalog.events[0].choices[0].resolution.outcome.effects[1].eventId = 'missing_event';

    expect(messages(catalog)).toContainEqual(expect.stringContaining('Unknown EventId "missing_event"'));
  });

  it('recursively visits all, any, and not conditions', () => {
    const catalog = cloneCatalog();
    catalog.events[1].eligibility = {
      type: 'all',
      conditions: [
        {
          type: 'any',
          conditions: [{ type: 'not', condition: { type: 'hasTrait', traitId: 'missing_trait' } }],
        },
      ],
    };

    expect(messages(catalog)).toContainEqual(expect.stringContaining('Unknown TraitId "missing_trait"'));
  });

  it('rejects a DiceCheck without bands', () => {
    const catalog = cloneCatalog();
    catalog.events[1].choices[0].resolution.check.bands = [];

    expect(messages(catalog)).toContainEqual(expect.stringContaining('requires at least one band'));
  });

  it('rejects unordered and non-terminal dice bands', () => {
    const catalog = cloneCatalog();
    const bands = catalog.events[1].choices[0].resolution.check.bands;
    bands[0].maxInclusive = 12;
    bands[1].maxInclusive = 10;

    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('strictly increasing'));
    expect(errors).toContainEqual(expect.stringContaining('Final dice band must be unbounded'));
  });

  it('rejects unknown Condition and Effect discriminants', () => {
    const catalog = cloneCatalog();
    catalog.events[1].eligibility = { type: 'customScript' };
    catalog.events[0].choices[0].resolution.outcome.effects[0] = { type: 'customEffect' };

    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('Unknown Condition type "customScript"'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown Effect type "customEffect"'));
  });

  it('rejects invalid StatIds', () => {
    const catalog = cloneCatalog();
    catalog.events[1].choices[0].resolution.check.modifiers[0].statId = 'luck';

    expect(messages(catalog)).toContainEqual(expect.stringContaining('Invalid StatId "luck"'));
  });
});
