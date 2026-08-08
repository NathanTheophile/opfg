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
  it('accepts the playable catalog', () => {
    expect(validateContent(contentCatalog)).toEqual([]);
  });

  it('rejects duplicate EventIds and ChoiceIds', () => {
    const catalog = cloneCatalog();
    catalog.events.push(structuredClone(catalog.events[0]));
    catalog.events[0].choices.push(structuredClone(catalog.events[0].choices[0]));

    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('Duplicate ID "departure"'));
    expect(errors).toContainEqual(expect.stringContaining('Duplicate ID "set_sail"'));
  });

  it('rejects unknown Event, NPC, Item, and Trait references recursively', () => {
    const catalog = cloneCatalog();
    catalog.events[1].eligibility = {
      type: 'all',
      conditions: [
        { type: 'hasChosen', eventId: 'missing_event', choiceId: 'missing_choice' },
        {
          type: 'any',
          conditions: [
            { type: 'hasItem', itemId: 'missing_item' },
            { type: 'not', condition: { type: 'hasTrait', traitId: 'missing_trait' } },
          ],
        },
        { type: 'npcStatusIs', npcId: 'missing_npc', status: 'known' },
      ],
    };

    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('Unknown EventId "missing_event"'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown ItemId "missing_item"'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown TraitId "missing_trait"'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown NpcId "missing_npc"'));
  });

  it('rejects scheduleEvent targeting an unknown event', () => {
    const catalog = cloneCatalog();
    catalog.events[0].choices[0].resolution.outcome.effects[0] = {
      type: 'scheduleEvent',
      eventId: 'missing_event',
      delayMonths: 1,
    };

    expect(messages(catalog)).toContainEqual(expect.stringContaining('Unknown EventId "missing_event"'));
  });

  it('rejects empty, unordered, and non-terminal DiceCheck bands', () => {
    const catalog = cloneCatalog();
    const choice = catalog.events[0].choices[0];
    choice.resolution = {
      type: 'dice',
      check: { modifiers: [], bands: [] },
    };
    expect(messages(catalog)).toContainEqual(expect.stringContaining('requires at least one band'));

    choice.resolution.check.bands = [
      { maxInclusive: 12, outcome: { id: 'a', text: 'a', advanceMonths: 0, effects: [] } },
      { maxInclusive: 10, outcome: { id: 'b', text: 'b', advanceMonths: 0, effects: [] } },
    ];
    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('strictly increasing'));
    expect(errors).toContainEqual(expect.stringContaining('Final dice band must be unbounded'));
  });

  it('rejects unknown Condition and Effect types and invalid StatIds', () => {
    const catalog = cloneCatalog();
    catalog.events[1].eligibility = { type: 'customScript' };
    catalog.events[0].choices[0].resolution.outcome.effects[0] = { type: 'customEffect' };
    catalog.events[2].choices[0].availableIf.statId = 'luck';

    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('Unknown Condition type "customScript"'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown Effect type "customEffect"'));
    expect(errors).toContainEqual(expect.stringContaining('Invalid StatId "luck"'));
  });
});
