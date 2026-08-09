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
      nameKey: 'trait.audacious.name',
      descriptionKey: 'trait.audacious.description',
      oppositeTraitId: 'cautious',
    });
  });

  it('validates ShipDefinition references, Location sale capability, and stack quantities', () => {
    const catalog = cloneCatalog();
    catalog.locations[0].allowsShipSale = 'yes';
    eventById(catalog, 'wreck').choices[0].resolution.outcome.effects[0].quantity = 0;
    eventById(catalog, 'year_one_end').choices[0].availableIf = { type: 'canAcquireShip', shipId: 'missing_ship' };
    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('Location requires allowsShipSale'));
    expect(errors).toContainEqual(expect.stringContaining('Item quantity must be a positive integer'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown ShipId "missing_ship"'));
  });

  it('validates CrewRole and recruitment references plus leadership override shape', () => {
    const catalog = cloneCatalog();
    catalog.npcs[0].crewRoleId = 'missing_role';
    eventById(catalog, 'mira_castaway').choices[0].availableIf.npcId = 'missing_npc';
    eventById(catalog, 'mira_castaway').choices[0].resolution.outcome.effects[0].allowWithoutLeadership = 'yes';
    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('Unknown CrewRoleId "missing_role"'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown NpcId "missing_npc"'));
    expect(errors).toContainEqual(expect.stringContaining('allowWithoutLeadership must be boolean'));
  });

  it('validates identity registries, NPC profile references, and text input', () => {
    const catalog = cloneCatalog();
    catalog.npcs[0].raceId = 'missing_race';
    eventById(catalog, 'origin_race').choices[0].resolution.outcome.effects[0].raceId = 'missing_race';
    eventById(catalog, 'childhood_middle').eligibility.conditions[3].conditions[0].seaId = 'missing_sea';
    eventById(catalog, 'origin_name').choices[0].input.target = 'unknown';
    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('Unknown RaceId "missing_race"'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown SeaId "missing_sea"'));
    expect(errors).toContainEqual(expect.stringContaining('Choice input must be text targeting playerName'));
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

  it('rejects unknown Event, NPC, Item, and Trait references recursively', () => {
    const catalog = cloneCatalog();
    eventById(catalog, 'origin_race').eligibility = {
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
    eventById(catalog, 'origin_name').eligibility = {
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
    eventById(catalog, 'origin_to_childhood').choices[0].resolution.outcome.effects[0] = {
      type: 'scheduleEvent',
      eventId: 'missing_event',
      delayMonths: 1,
    };

    expect(messages(catalog)).toContainEqual(expect.stringContaining('Unknown Scheduled EventId "missing_event"'));
  });

  it('rejects addTrait and removeTrait targeting unknown traits', () => {
    const catalog = cloneCatalog();
    eventById(catalog, 'origin_name').choices[0].resolution.outcome.effects = [
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

  it('validates NPC definitions, NPC stat conditions, and NPC stat effects', () => {
    const catalog = cloneCatalog();
    catalog.npcs[0].nameKey = '';
    catalog.npcs[0].initialStats.loyalty = 51;
    eventById(catalog, 'origin_name').eligibility = {
      type: 'npcStatAtLeast', npcId: 'missing_npc', statId: 'navigation', value: 51,
    };
    eventById(catalog, 'origin_name').choices[0].resolution.outcome.effects = [{
      type: 'modifyNpcStat', npcId: 'missing_npc', statId: 'charisma', amount: Number.POSITIVE_INFINITY,
    }];

    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('NPC nameKey must be a non-empty string'));
    expect(errors).toContainEqual(expect.stringContaining('loyalty must be a finite number from 0 to 50'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown NpcId "missing_npc"'));
    expect(errors).toContainEqual(expect.stringContaining('Invalid NpcStatId "navigation"'));
    expect(errors).toContainEqual(expect.stringContaining('npcStatAtLeast value must be a finite number from 0 to 50'));
    expect(errors).toContainEqual(expect.stringContaining('Invalid NpcStatId "charisma"'));
    expect(errors).toContainEqual(expect.stringContaining('modifyNpcStat amount must be finite'));
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
    eventById(catalog, 'origin_race').eligibility = { type: 'customScript' };
    eventById(catalog, 'origin_to_childhood').choices[0].resolution.outcome.effects[0] = { type: 'customEffect' };
    eventById(catalog, 'reefs').choices.find((choice: Record<string, any>) => choice.id === 'read_currents').availableIf.statId = 'legacy_stat';
    eventById(catalog, 'black_squall').choices[0].resolution.statId = 'health';

    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('Unknown Condition type "customScript"'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown Effect type "customEffect"'));
    expect(errors).toContainEqual(expect.stringContaining('Invalid StatId "legacy_stat"'));
    expect(errors).toContainEqual(expect.stringContaining('Invalid StatId "health"'));
  });

  it('rejects scheduling a normal event and accepts a scheduled target', () => {
    const invalidCatalog = cloneCatalog();
    eventById(invalidCatalog, 'departure').choices[0].resolution.outcome.effects[0] = {
      type: 'scheduleEvent',
      eventId: 'departure',
      delayMonths: 1,
    };

    expect(messages(invalidCatalog)).toContainEqual(
      expect.stringContaining('Unknown Scheduled EventId "departure"'),
    );
    expect(validateContent(contentCatalog)).toEqual([]);
  });

  it('rejects removed v1 fields and invalid v2 event variants', () => {
    const catalog = cloneCatalog();
    eventById(catalog, 'departure').eligibility = { type: 'monthAtLeast', value: 1 };
    eventById(catalog, 'departure').choices[0].resolution.outcome.advanceMonths = 1;
    eventById(catalog, 'departure').priority = 100;
    eventById(catalog, 'childhood_memory').scheduledReach = 'teleport';
    eventById(catalog, 'childhood_memory').fallbackEventId = 'departure';
    const errors = messages(catalog);
    expect(errors).toContainEqual(expect.stringContaining('Unknown Condition type "monthAtLeast"'));
    expect(errors).toContainEqual(expect.stringContaining('Outcome.advanceMonths is not supported'));
    expect(errors).toContainEqual(expect.stringContaining('Invalid Event kind field combination'));
    expect(errors).toContainEqual(expect.stringContaining('Invalid scheduledReach'));
    expect(errors).toContainEqual(expect.stringContaining('Unknown Scheduled EventId "departure"'));
  });
});
