export interface ContentValidationError {
  path: string;
  message: string;
}

type UnknownRecord = Record<string, unknown>;

const STAT_IDS = new Set(['navigation', 'presence', 'willpower']);
const CONDITION_TYPES = new Set([
  'all',
  'any',
  'not',
  'hasTrait',
  'statAtLeast',
  'hasFlag',
  'hasItem',
  'locationIs',
  'shipConditionAtLeast',
  'shipConditionAtMost',
  'npcStatusIs',
  'npcRelationshipAtLeast',
  'hasChosen',
  'monthAtLeast',
]);
const EFFECT_TYPES = new Set([
  'setFlag',
  'clearFlag',
  'addItem',
  'removeItem',
  'modifyStat',
  'modifyShipCondition',
  'moveToLocation',
  'setNpcStatus',
  'modifyNpcRelationship',
  'scheduleEvent',
  'endCareer',
]);

export function validateContent(catalog: unknown): ContentValidationError[] {
  const errors: ContentValidationError[] = [];
  if (!isRecord(catalog)) return [{ path: 'catalog', message: 'Expected an object.' }];

  const events = readRecords(catalog.events, 'events', errors);
  const eventIds = collectIds(events, 'events', errors);
  const traitIds = collectIds(readRecords(catalog.traits, 'traits', errors), 'traits', errors);
  const itemIds = collectIds(readRecords(catalog.items, 'items', errors), 'items', errors);
  const npcIds = collectIds(readRecords(catalog.npcs, 'npcs', errors), 'npcs', errors);
  const choicesByEvent = new Map<string, Set<string>>();
  const scheduledOnlyEventIds = new Set<string>();

  for (const [eventIndex, event] of events.entries()) {
    const eventPath = `events[${eventIndex}]`;
    const eventId = stringValue(event.id);
    const choices = readRecords(event.choices, `${eventPath}.choices`, errors);
    const choiceIds = collectIds(choices, `${eventPath}.choices`, errors);
    if (eventId) choicesByEvent.set(eventId, choiceIds);
    if (eventId && event.scheduledOnly === true) scheduledOnlyEventIds.add(eventId);
  }

  const references = { eventIds, choicesByEvent, traitIds, itemIds, npcIds, scheduledOnlyEventIds };
  for (const [eventIndex, event] of events.entries()) {
    validateEvent(event, `events[${eventIndex}]`, references, errors);
  }

  return errors;
}

export function assertValidContent(catalog: unknown): void {
  const errors = validateContent(catalog);
  if (errors.length > 0) {
    throw new Error(errors.map(({ path, message }) => `${path}: ${message}`).join('\n'));
  }
}

interface References {
  eventIds: Set<string>;
  choicesByEvent: Map<string, Set<string>>;
  traitIds: Set<string>;
  itemIds: Set<string>;
  npcIds: Set<string>;
  scheduledOnlyEventIds: Set<string>;
}

function validateEvent(
  event: UnknownRecord,
  path: string,
  references: References,
  errors: ContentValidationError[],
): void {
  if (event.eligibility !== undefined) {
    validateCondition(event.eligibility, `${path}.eligibility`, references, errors);
  }

  const choices = readRecords(event.choices, `${path}.choices`, errors);
  for (const [choiceIndex, choice] of choices.entries()) {
    const choicePath = `${path}.choices[${choiceIndex}]`;
    if (choice.visibleIf !== undefined) {
      validateCondition(choice.visibleIf, `${choicePath}.visibleIf`, references, errors);
    }
    if (choice.availableIf !== undefined) {
      validateCondition(choice.availableIf, `${choicePath}.availableIf`, references, errors);
    }
    validateResolution(choice.resolution, `${choicePath}.resolution`, references, errors);
  }
}

function validateCondition(
  value: unknown,
  path: string,
  references: References,
  errors: ContentValidationError[],
): void {
  if (!isRecord(value)) {
    errors.push({ path, message: 'Condition must be an object.' });
    return;
  }

  const type = stringValue(value.type);
  if (!type || !CONDITION_TYPES.has(type)) {
    errors.push({ path, message: `Unknown Condition type "${String(value.type)}".` });
    return;
  }

  if (type === 'all' || type === 'any') {
    if (!Array.isArray(value.conditions)) {
      errors.push({ path, message: `${type} requires a conditions array.` });
      return;
    }
    value.conditions.forEach((condition, index) =>
      validateCondition(condition, `${path}.conditions[${index}]`, references, errors),
    );
    return;
  }

  if (type === 'not') {
    validateCondition(value.condition, `${path}.condition`, references, errors);
    return;
  }

  if (type === 'hasTrait') validateReference(value.traitId, references.traitIds, 'TraitId', path, errors);
  if (type === 'hasItem') validateReference(value.itemId, references.itemIds, 'ItemId', path, errors);
  if (type === 'npcStatusIs' || type === 'npcRelationshipAtLeast') {
    validateReference(value.npcId, references.npcIds, 'NpcId', path, errors);
  }
  if (type === 'statAtLeast') validateStat(value.statId, path, errors);
  if (type === 'hasChosen') {
    const eventId = validateReference(value.eventId, references.eventIds, 'EventId', path, errors);
    if (eventId && references.eventIds.has(eventId)) {
      validateReference(value.choiceId, references.choicesByEvent.get(eventId) ?? new Set(), 'ChoiceId', path, errors);
    }
  }
}

function validateResolution(
  value: unknown,
  path: string,
  references: References,
  errors: ContentValidationError[],
): void {
  if (!isRecord(value)) {
    errors.push({ path, message: 'Resolution must be an object.' });
    return;
  }
  if (value.type === 'deterministic') {
    validateOutcome(value.outcome, `${path}.outcome`, references, errors);
    return;
  }
  if (value.type === 'dice') {
    validateDiceCheck(value.check, `${path}.check`, references, errors);
    return;
  }
  errors.push({ path, message: `Unknown Resolution type "${String(value.type)}".` });
}

function validateDiceCheck(
  value: unknown,
  path: string,
  references: References,
  errors: ContentValidationError[],
): void {
  if (!isRecord(value)) {
    errors.push({ path, message: 'DiceCheck must be an object.' });
    return;
  }

  const modifiers = readRecords(value.modifiers, `${path}.modifiers`, errors);
  for (const [index, modifier] of modifiers.entries()) {
    const modifierPath = `${path}.modifiers[${index}]`;
    if (modifier.type === 'statModifier') validateStat(modifier.statId, modifierPath, errors);
    else if (modifier.type === 'conditionalModifier') {
      validateCondition(modifier.condition, `${modifierPath}.condition`, references, errors);
    } else errors.push({ path: modifierPath, message: `Unknown DiceModifier type "${String(modifier.type)}".` });
  }

  const bands = readRecords(value.bands, `${path}.bands`, errors);
  if (bands.length === 0) {
    errors.push({ path: `${path}.bands`, message: 'DiceCheck requires at least one band.' });
    return;
  }

  let previousMax = Number.NEGATIVE_INFINITY;
  bands.forEach((band, index) => {
    const bandPath = `${path}.bands[${index}]`;
    const max = band.maxInclusive;
    if (max === null) {
      if (index !== bands.length - 1) errors.push({ path: bandPath, message: 'Only the final band may be unbounded.' });
    } else if (typeof max !== 'number' || !Number.isFinite(max) || max <= previousMax) {
      errors.push({ path: bandPath, message: 'maxInclusive must be a finite, strictly increasing number or final null.' });
    } else previousMax = max;
    validateOutcome(band.outcome, `${bandPath}.outcome`, references, errors);
  });
  if (bands.at(-1)?.maxInclusive !== null) {
    errors.push({ path: `${path}.bands`, message: 'Final dice band must be unbounded (maxInclusive: null).' });
  }
}

function validateOutcome(
  value: unknown,
  path: string,
  references: References,
  errors: ContentValidationError[],
): void {
  if (!isRecord(value)) {
    errors.push({ path, message: 'Outcome must be an object.' });
    return;
  }
  const effects = readRecords(value.effects, `${path}.effects`, errors);
  effects.forEach((effect, index) =>
    validateEffect(effect, `${path}.effects[${index}]`, references, errors),
  );
}

function validateEffect(
  effect: UnknownRecord,
  path: string,
  references: References,
  errors: ContentValidationError[],
): void {
  const type = stringValue(effect.type);
  if (!type || !EFFECT_TYPES.has(type)) {
    errors.push({ path, message: `Unknown Effect type "${String(effect.type)}".` });
    return;
  }
  if (type === 'addItem' || type === 'removeItem') {
    validateReference(effect.itemId, references.itemIds, 'ItemId', path, errors);
  }
  if (type === 'setNpcStatus' || type === 'modifyNpcRelationship') {
    validateReference(effect.npcId, references.npcIds, 'NpcId', path, errors);
  }
  if (type === 'modifyStat') validateStat(effect.statId, path, errors);
  if (type === 'scheduleEvent') {
    const eventId = validateReference(effect.eventId, references.eventIds, 'EventId', path, errors);
    if (eventId && references.eventIds.has(eventId) && !references.scheduledOnlyEventIds.has(eventId)) {
      errors.push({ path, message: `Scheduled EventId "${eventId}" must target an event with scheduledOnly: true.` });
    }
  }
}

function validateStat(value: unknown, path: string, errors: ContentValidationError[]): void {
  if (typeof value !== 'string' || !STAT_IDS.has(value)) {
    errors.push({ path, message: `Invalid StatId "${String(value)}".` });
  }
}

function validateReference(
  value: unknown,
  ids: Set<string>,
  label: string,
  path: string,
  errors: ContentValidationError[],
): string | undefined {
  const id = stringValue(value);
  if (!id || !ids.has(id)) errors.push({ path, message: `Unknown ${label} "${String(value)}".` });
  return id;
}

function collectIds(records: UnknownRecord[], path: string, errors: ContentValidationError[]): Set<string> {
  const ids = new Set<string>();
  records.forEach((record, index) => {
    const id = stringValue(record.id);
    if (!id) errors.push({ path: `${path}[${index}].id`, message: 'Expected a non-empty string ID.' });
    else if (ids.has(id)) errors.push({ path: `${path}[${index}].id`, message: `Duplicate ID "${id}".` });
    else ids.add(id);
  });
  return ids;
}

function readRecords(value: unknown, path: string, errors: ContentValidationError[]): UnknownRecord[] {
  if (!Array.isArray(value)) {
    errors.push({ path, message: 'Expected an array.' });
    return [];
  }
  const records: UnknownRecord[] = [];
  value.forEach((entry, index) => {
    if (isRecord(entry)) records.push(entry);
    else errors.push({ path: `${path}[${index}]`, message: 'Expected an object.' });
  });
  return records;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
