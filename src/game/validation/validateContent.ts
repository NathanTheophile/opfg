export interface ContentValidationError {
  path: string;
  message: string;
}

type UnknownRecord = Record<string, unknown>;

const STAT_IDS = new Set([
  'health',
  'morale',
  'strength',
  'observation',
  'intelligence',
  'navigation',
  'charisma',
  'luck',
  'awakening',
]);
const CONDITION_TYPES = new Set([
  'all',
  'any',
  'not',
  'hasTrait',
  'statAtLeast',
  'hasFlag',
  'hasItem',
  'locationIs',
  'isAtSea',
  'isOnLand',
  'careerPhaseIs',
  'ageAtLeastMonths',
  'ageAtMostMonths',
  'shipConditionAtLeast',
  'shipConditionAtMost',
  'npcStatusIs',
  'npcRelationshipAtLeast',
  'hasChosen',
  'hasPlayed',
  'hasOutcome',
  'monthAtLeast',
]);
const EFFECT_TYPES = new Set([
  'setFlag',
  'clearFlag',
  'addItem',
  'removeItem',
  'addTrait',
  'removeTrait',
  'modifyStat',
  'modifyShipCondition',
  'moveToLocation',
  'setNpcStatus',
  'modifyNpcRelationship',
  'scheduleEvent',
  'setCareerPhase',
  'endCareer',
]);

export function validateContent(catalog: unknown): ContentValidationError[] {
  const errors: ContentValidationError[] = [];
  if (!isRecord(catalog)) return [{ path: 'catalog', message: 'Expected an object.' }];

  const events = readRecords(catalog.events, 'events', errors);
  const eventIds = collectIds(events, 'events', errors);
  const traits = readRecords(catalog.traits, 'traits', errors);
  const traitIds = collectIds(traits, 'traits', errors);
  const itemIds = collectIds(readRecords(catalog.items, 'items', errors), 'items', errors);
  const npcIds = collectIds(readRecords(catalog.npcs, 'npcs', errors), 'npcs', errors);
  const choicesByEvent = new Map<string, Set<string>>();
  const outcomesByEvent = new Map<string, Set<string>>();
  const scheduledOnlyEventIds = new Set<string>();

  for (const [eventIndex, event] of events.entries()) {
    const eventPath = `events[${eventIndex}]`;
    const eventId = stringValue(event.id);
    const choices = readRecords(event.choices, `${eventPath}.choices`, errors);
    const choiceIds = collectIds(choices, `${eventPath}.choices`, errors);
    if (eventId) {
      choicesByEvent.set(eventId, choiceIds);
      outcomesByEvent.set(eventId, collectOutcomeIds(choices));
    }
    if (eventId && event.scheduledOnly === true) scheduledOnlyEventIds.add(eventId);
  }

  validateTraitOpposites(traits, traitIds, errors);
  const references = { eventIds, choicesByEvent, outcomesByEvent, traitIds, itemIds, npcIds, scheduledOnlyEventIds };
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
  outcomesByEvent: Map<string, Set<string>>;
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
  const diceStatIds = new Set<string>();
  for (const [choiceIndex, choice] of choices.entries()) {
    const choicePath = `${path}.choices[${choiceIndex}]`;
    if (choice.visibleIf !== undefined) {
      validateCondition(choice.visibleIf, `${choicePath}.visibleIf`, references, errors);
    }
    if (choice.availableIf !== undefined) {
      validateCondition(choice.availableIf, `${choicePath}.availableIf`, references, errors);
    }
    validateResolution(choice.resolution, `${choicePath}.resolution`, references, errors);
    if (isRecord(choice.resolution) && choice.resolution.type === 'dice') {
      const statId = stringValue(choice.resolution.statId);
      if (statId && diceStatIds.has(statId)) {
        errors.push({ path: choicePath, message: `Multiple DiceChoices in one Event cannot use StatId "${statId}".` });
      } else if (statId) diceStatIds.add(statId);
    }
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
  if (type === 'careerPhaseIs' && !['origins', 'childhood', 'active'].includes(String(value.phase))) {
    errors.push({ path, message: `Invalid CareerPhase "${String(value.phase)}".` });
  }
  if ((type === 'ageAtLeastMonths' || type === 'ageAtMostMonths') && !isNonNegativeNumber(value.value)) {
    errors.push({ path, message: `${type} requires a non-negative number.` });
  }
  if (type === 'hasChosen') {
    const eventId = validateReference(value.eventId, references.eventIds, 'EventId', path, errors);
    if (eventId && references.eventIds.has(eventId)) {
      validateReference(value.choiceId, references.choicesByEvent.get(eventId) ?? new Set(), 'ChoiceId', path, errors);
    }
  }
  if (type === 'hasPlayed') {
    validateReference(value.eventId, references.eventIds, 'EventId', path, errors);
  }
  if (type === 'hasOutcome') {
    const eventId = validateReference(value.eventId, references.eventIds, 'EventId', path, errors);
    if (eventId && references.eventIds.has(eventId)) {
      validateReference(value.outcomeId, references.outcomesByEvent.get(eventId) ?? new Set(), 'OutcomeId', path, errors);
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
    validateDiceResolution(value, path, references, errors);
    return;
  }
  errors.push({ path, message: `Unknown Resolution type "${String(value.type)}".` });
}

function validateDiceResolution(
  value: unknown,
  path: string,
  references: References,
  errors: ContentValidationError[],
): void {
  if (!isRecord(value)) {
    errors.push({ path, message: 'DiceResolution must be an object.' });
    return;
  }
  validateStat(value.statId, path, errors);
  if (!Number.isInteger(value.successThreshold) || (value.successThreshold as number) < 2 || (value.successThreshold as number) > 19) {
    errors.push({ path, message: 'successThreshold must be an integer from 2 to 19.' });
  }
  if (value.check !== undefined || value.bands !== undefined) {
    errors.push({ path, message: 'Legacy DiceCheck fields are not supported.' });
  }

  const modifiers = value.modifiers === undefined ? [] : readRecords(value.modifiers, `${path}.modifiers`, errors);
  for (const [index, modifier] of modifiers.entries()) {
    const modifierPath = `${path}.modifiers[${index}]`;
    validateCondition(modifier.condition, `${modifierPath}.condition`, references, errors);
    if (typeof modifier.value !== 'number' || !Number.isFinite(modifier.value)) {
      errors.push({ path: modifierPath, message: 'ConditionalDiceModifier value must be finite.' });
    }
    if (!stringValue(modifier.displayLabel)) {
      errors.push({ path: modifierPath, message: 'ConditionalDiceModifier requires displayLabel.' });
    }
  }

  const overrides = value.traitOverrides === undefined
    ? []
    : readRecords(value.traitOverrides, `${path}.traitOverrides`, errors);
  const overrideKeys = new Set<string>();
  for (const [index, override] of overrides.entries()) {
    const overridePath = `${path}.traitOverrides[${index}]`;
    validateReference(override.traitId, references.traitIds, 'TraitId', overridePath, errors);
    if (!(override.forceResult === 'criticalFailure' || override.forceResult === 'criticalSuccess')) {
      errors.push({ path: overridePath, message: `Invalid forced DiceResult "${String(override.forceResult)}".` });
    }
    const key = `${String(override.traitId)}:${String(override.forceResult)}`;
    if (overrideKeys.has(key)) errors.push({ path: overridePath, message: 'Duplicate TraitResultOverride.' });
    overrideKeys.add(key);
  }

  if (!isRecord(value.outcomes)) {
    errors.push({ path: `${path}.outcomes`, message: 'DiceResolution requires exactly four Outcomes.' });
    return;
  }
  const resultKeys = ['criticalFailure', 'failure', 'success', 'criticalSuccess'];
  for (const key of resultKeys) validateOutcome(value.outcomes[key], `${path}.outcomes.${key}`, references, errors);
  for (const key of Object.keys(value.outcomes)) {
    if (!resultKeys.includes(key)) errors.push({ path: `${path}.outcomes.${key}`, message: `Unknown DiceResult "${key}".` });
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
  if (!stringValue(value.id)) errors.push({ path: `${path}.id`, message: 'Outcome requires a non-empty ID.' });
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
  if (type === 'addTrait' || type === 'removeTrait') {
    validateReference(effect.traitId, references.traitIds, 'TraitId', path, errors);
  }
  if (type === 'setNpcStatus' || type === 'modifyNpcRelationship') {
    validateReference(effect.npcId, references.npcIds, 'NpcId', path, errors);
  }
  if (type === 'modifyStat') validateStat(effect.statId, path, errors);
  if (type === 'moveToLocation' && !['at_sea', 'on_land'].includes(String(effect.travelState))) {
    errors.push({ path, message: `Invalid TravelState "${String(effect.travelState)}".` });
  }
  if (type === 'setCareerPhase' && !['origins', 'childhood', 'active'].includes(String(effect.phase))) {
    errors.push({ path, message: `Invalid CareerPhase "${String(effect.phase)}".` });
  }
  if (type === 'endCareer' && !['death', 'legacy'].includes(String(effect.reason))) {
    errors.push({ path, message: `Invalid CareerEndReason "${String(effect.reason)}".` });
  }
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

function collectOutcomeIds(choices: UnknownRecord[]): Set<string> {
  const outcomeIds = new Set<string>();
  const addOutcome = (value: unknown) => {
    if (!isRecord(value)) return;
    const id = stringValue(value.id);
    if (id) outcomeIds.add(id);
  };
  for (const choice of choices) {
    if (!isRecord(choice.resolution)) continue;
    if (choice.resolution.type === 'deterministic') addOutcome(choice.resolution.outcome);
    if (choice.resolution.type === 'dice' && isRecord(choice.resolution.outcomes)) {
      Object.values(choice.resolution.outcomes).forEach(addOutcome);
    }
  }
  return outcomeIds;
}

function validateTraitOpposites(
  traits: UnknownRecord[],
  traitIds: Set<string>,
  errors: ContentValidationError[],
): void {
  const traitsById = new Map(traits.flatMap((trait) => {
    const id = stringValue(trait.id);
    return id ? [[id, trait] as const] : [];
  }));
  traits.forEach((trait, index) => {
    const id = stringValue(trait.id);
    if (!id || trait.oppositeTraitId === undefined) return;
    const path = `traits[${index}].oppositeTraitId`;
    const oppositeId = validateReference(trait.oppositeTraitId, traitIds, 'TraitId', path, errors);
    if (!oppositeId || !traitIds.has(oppositeId)) return;
    if (oppositeId === id) errors.push({ path, message: 'A Trait cannot be its own opposite.' });
    else if (traitsById.get(oppositeId)?.oppositeTraitId !== id) {
      errors.push({ path, message: `Opposite Trait relationship "${id}" / "${oppositeId}" must be symmetric.` });
    }
  });
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

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}
