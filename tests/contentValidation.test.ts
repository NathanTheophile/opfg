import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { validateContent } from '../src/game/validation/validateContent';

function cloneCatalog(): Record<string, any> {
  return structuredClone(contentCatalog);
}

function messages(catalog: unknown): string[] {
  return validateContent(catalog).map(({ path, message }) => `${path}: ${message}`);
}

function eventById(catalog: Record<string, any>, eventId: string): Record<string, any> {
  const event = catalog.events.find((entry: Record<string, any>) => entry.id === eventId);
  if (!event) throw new Error(`Missing event fixture "${eventId}".`);
  return event;
}

describe('validateContent', () => {
  it('accepts the playable catalog', () => {
    expect(validateContent(contentCatalog)).toEqual([]);
    expect(contentCatalog.traits).toContainEqual({
      id: 'audacious',
      name: 'Audacieux',
      description: expect.any(String),
    });
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

  it('validates hasPlayed and deterministic or dice hasOutcome references', () => {
    const catalog = cloneCatalog();
    catalog.events[0].eligibility = {
      type: 'all',
      conditions: [
        { type: 'hasPlayed', eventId: 'missing_event' },
        { type: 'hasOutcome', eventId: 'departure', outcomeId: 'missing_outcome' },
        { type: 'hasOutcome', eventId: 'black_squall', outcomeId: 'missing_dice_outcome' },
      ],
    };

    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('Unknown EventId "missing_event"'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown OutcomeId "missing_outcome"'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown OutcomeId "missing_dice_outcome"'));
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

  it('rejects addTrait and removeTrait targeting unknown traits', () => {
    const catalog = cloneCatalog();
    catalog.events[0].choices[0].resolution.outcome.effects = [
      { type: 'addTrait', traitId: 'missing_trait' },
      { type: 'removeTrait', traitId: 'another_missing_trait' },
    ];

    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('Unknown TraitId "missing_trait"'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown TraitId "another_missing_trait"'));
  });

  it('rejects invalid opposite Trait references and asymmetric relationships', () => {
    const missing = cloneCatalog();
    missing.traits[0].oppositeTraitId = 'missing_trait';
    expect(messages(missing)).toContainEqual(expect.stringContaining('Unknown TraitId "missing_trait"'));

    const self = cloneCatalog();
    self.traits[0].oppositeTraitId = 'audacious';
    expect(messages(self)).toContainEqual(expect.stringContaining('cannot be its own opposite'));

    const asymmetric = cloneCatalog();
    asymmetric.traits.push({ id: 'cautious', name: 'Cautious', description: 'Careful.' });
    asymmetric.traits[0].oppositeTraitId = 'cautious';
    expect(messages(asymmetric)).toContainEqual(expect.stringContaining('must be symmetric'));
  });

  it('validates the vNext DiceResolution contract and rejects legacy fields', () => {
    const catalog = cloneCatalog();
    const choice = eventById(catalog, 'black_squall').choices[0];
    choice.resolution.successThreshold = 20;
    delete choice.resolution.outcomes.failure;
    choice.resolution.check = { bands: [] };
    choice.resolution.traitOverrides = [
      { traitId: 'missing_trait', forceResult: 'success' },
      { traitId: 'audacious', forceResult: 'criticalFailure' },
      { traitId: 'audacious', forceResult: 'criticalFailure' },
    ];
    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('successThreshold must be an integer from 2 to 19'));
    expect(errors).toContainEqual(expect.stringContaining('Legacy DiceCheck fields are not supported'));
    expect(errors).toContainEqual(expect.stringContaining('Outcome must be an object'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown TraitId "missing_trait"'));
    expect(errors).toContainEqual(expect.stringContaining('Invalid forced DiceResult "success"'));
    expect(errors).toContainEqual(expect.stringContaining('Duplicate TraitResultOverride'));
  });

  it('rejects two DiceChoices using the same main stat in one Event', () => {
    const catalog = cloneCatalog();
    const reefs = eventById(catalog, 'reefs');
    reefs.choices.find((choice: Record<string, any>) => choice.id === 'ride_breakers').resolution.statId = 'navigation';

    expect(messages(catalog)).toContainEqual(
      expect.stringContaining('Multiple DiceChoices in one Event cannot use StatId "navigation"'),
    );
  });

  it('rejects unknown Condition and Effect types and invalid StatIds', () => {
    const catalog = cloneCatalog();
    catalog.events[1].eligibility = { type: 'customScript' };
    catalog.events[0].choices[0].resolution.outcome.effects[0] = { type: 'customEffect' };
    eventById(catalog, 'reefs').choices.find((choice: Record<string, any>) => choice.id === 'read_currents').availableIf.statId = 'legacy_stat';

    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('Unknown Condition type "customScript"'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown Effect type "customEffect"'));
    expect(errors).toContainEqual(expect.stringContaining('Invalid StatId "legacy_stat"'));
  });

  it('rejects scheduling a normal event and accepts a scheduledOnly target', () => {
    const invalidCatalog = cloneCatalog();
    eventById(invalidCatalog, 'departure').choices[0].resolution.outcome.effects[0] = {
      type: 'scheduleEvent',
      eventId: 'departure',
      delayMonths: 1,
    };

    expect(messages(invalidCatalog)).toContainEqual(
      expect.stringContaining('must target an event with scheduledOnly: true'),
    );
    expect(validateContent(contentCatalog)).toEqual([]);
  });
});
