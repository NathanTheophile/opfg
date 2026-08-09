import type { ChoiceDefinition, ContentCatalog, EventDefinition } from './contract';
import {
  validateContent as validateCanonicalContent,
  type ContentValidationError,
} from '../../../../../src/game/validation/validateContent';

export type ShapeIssue = ContentValidationError;
export type { ContentValidationError };

const permissiveLocalization = new Proxy<Record<string, string>>({}, { get: () => '' });

/** Full runtime validation is delegated to OPFG's canonical validator. */
export function validateContent(catalog: unknown, sourceDictionary = permissiveLocalization): ContentValidationError[] {
  return validateCanonicalContent(catalog, sourceDictionary);
}

/**
 * Validate one imported Event before it joins a workspace. Reference targets are
 * represented by minimal placeholders; the full project validation checks the
 * real registries and references after import.
 */
export function validateSingleEventShape(value: unknown): ShapeIssue[] {
  const event = value as EventDefinition;
  const references = collectReferences(value);
  const supportEvents = [...references.eventIds]
    .filter((id) => id !== event?.id)
    .map((id): EventDefinition => {
      const choices: ChoiceDefinition[] = [...(references.choicesByEvent.get(id) ?? ['choice'])].map((choiceId) => ({
        id: choiceId,
        textKey: `event.${id}.choice.${choiceId}.text`,
        resolution: {
          type: 'deterministic',
          outcome: {
            id: [...(references.outcomesByEvent.get(id) ?? ['outcome'])][0],
            textKey: `event.${id}.choice.${choiceId}.outcome.outcome.text`,
            effects: [],
          },
        },
      }));
      const base = { id, titleKey: `event.${id}.title`, textKey: `event.${id}.text`, choices };
      return references.scheduledEventIds.has(id)
        ? { ...base, kind: 'scheduled', priority: 100 }
        : references.immediateEventIds.has(id)
          ? { ...base, kind: 'immediate' }
        : { ...base, kind: 'normal' };
    });
  const catalog: ContentCatalog = {
    schemaVersion: 2,
    races: [...references.raceIds].map((id) => ({ id, nameKey: `race.${id}.name`, initialHealth: 35, attributeModifiers: {} })),
    seas: [...references.seaIds].map((id) => ({ id, nameKey: `sea.${id}.name` })),
    affiliations: [...references.affiliationIds].map((id) => ({ id, nameKey: `affiliation.${id}.name` })),
    familyStructures: [...references.familyStructureIds].map((id) => ({ id, nameKey: `familyStructure.${id}.name`, attributeModifiers: {} })),
    socialClasses: [...references.socialClassIds].map((id) => ({ id, nameKey: `socialClass.${id}.name`, attributeModifiers: {} })),
    locations: [...references.locationIds].map((id) => ({ id, seaId: null, blocksScheduledEvents: false, allowsShipSale: false, allowsDocking: false })),
    traits: [...references.traitIds].map((id) => ({ id, nameKey: `trait.${id}.name`, descriptionKey: `trait.${id}.description` })),
    items: [...references.itemIds].map((id) => ({ id, nameKey: `item.${id}.name` })),
    ships: [...references.shipIds].map((id) => ({ id, nameKey: `ship.${id}.name`, maxHealth: 1, crewCapacity: 0, cargoSlots: 0 })),
    crewRoles: [...references.crewRoleIds].map((id) => ({ id, nameKey: `crewRole.${id}.name` })),
    npcs: [...references.npcIds].map((id) => ({
      id, nameKey: `npc.${id}.name`, raceId: null, originSeaId: null, affiliationId: null, crewRoleId: null,
      initialStats: { health: 25, morale: 25, strength: 25, observation: 25, intelligence: 25, luck: 25, loyalty: 25, calm: 25 },
    })),
    events: [event, ...supportEvents],
  };
  return validateCanonicalContent(catalog, permissiveLocalization).filter(({ path }) => path.startsWith('events[0]'));
}

export function validateEventDefinitionsShape(value: unknown): ShapeIssue[] {
  if (!Array.isArray(value)) return [{ path: 'events', message: 'Expected an array.' }];
  return value.flatMap((event, index) => validateSingleEventShape(event).map((issue) => ({
    ...issue,
    path: issue.path.replace(/^events\[0\]/, `events[${index}]`),
  })));
}

function collectReferences(value: unknown) {
  const result = {
    eventIds: new Set<string>(), scheduledEventIds: new Set<string>(), immediateEventIds: new Set<string>(),
    choicesByEvent: new Map<string, Set<string>>(), outcomesByEvent: new Map<string, Set<string>>(),
    traitIds: new Set<string>(), itemIds: new Set<string>(), shipIds: new Set<string>(), crewRoleIds: new Set<string>(), npcIds: new Set<string>(), locationIds: new Set<string>(),
    raceIds: new Set<string>(), seaIds: new Set<string>(), affiliationIds: new Set<string>(), familyStructureIds: new Set<string>(), socialClassIds: new Set<string>(),
  };
  walk(value, (record) => {
    add(record.traitId, result.traitIds); add(record.itemId, result.itemIds); add(record.shipId, result.shipIds); add(record.roleId, result.crewRoleIds); add(record.npcId, result.npcIds);
    add(record.locationId, result.locationIds); add(record.raceId, result.raceIds); add(record.seaId, result.seaIds);
    add(record.affiliationId, result.affiliationIds);
    add(record.familyStructureId, result.familyStructureIds); add(record.socialClassId, result.socialClassIds);
    if (typeof record.eventId === 'string') {
      result.eventIds.add(record.eventId);
      if (record.type === 'scheduleEvent') result.scheduledEventIds.add(record.eventId);
      if (record.type === 'queueImmediateEvent') result.immediateEventIds.add(record.eventId);
      if (typeof record.choiceId === 'string') mapAdd(result.choicesByEvent, record.eventId, record.choiceId);
      if (typeof record.outcomeId === 'string') mapAdd(result.outcomesByEvent, record.eventId, record.outcomeId);
    }
    if (typeof record.fallbackEventId === 'string') {
      result.eventIds.add(record.fallbackEventId);
      result.scheduledEventIds.add(record.fallbackEventId);
    }
  });
  return result;
}

function walk(value: unknown, visit: (record: Record<string, unknown>) => void): void {
  if (Array.isArray(value)) return value.forEach((entry) => walk(entry, visit));
  if (typeof value !== 'object' || value === null) return;
  const record = value as Record<string, unknown>;
  visit(record);
  Object.values(record).forEach((entry) => walk(entry, visit));
}

function add(value: unknown, target: Set<string>): void { if (typeof value === 'string' && value.length > 0) target.add(value); }
function mapAdd(target: Map<string, Set<string>>, key: string, value: string): void {
  if (!target.has(key)) target.set(key, new Set());
  target.get(key)!.add(value);
}
