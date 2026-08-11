export interface ContentValidationError {
  path: string;
  message: string;
}

type UnknownRecord = Record<string, unknown>;

const STAT_IDS = new Set([
  'morale',
  'strength',
  'agility',
  'observation',
  'intelligence',
  'navigation',
  'charisma',
  'luck',
]);
const NPC_STAT_IDS = new Set([
  'health',
  'morale',
  'strength',
  'observation',
  'intelligence',
  'luck',
  'loyalty',
  'calm',
]);
const HAKI_TYPES = new Set(['observation', 'armament', 'conqueror']);
const FRUIT_TYPES = new Set(['paramecia', 'zoan', 'logia']);
const FRUIT_TAGS = new Set(['flight', 'fire', 'cold', 'electricity', 'mobility', 'intangibility', 'transformation', 'enhanced_strength', 'healing', 'barrier', 'ranged', 'environmental']);
const CAREER_AFFILIATION_IDS = new Set(['civilian', 'pirate', 'marine', 'revolutionary', 'bounty_hunter']);
const LOCATION_TYPES = new Set(['city', 'facility', 'island', 'kingdom', 'marine_base', 'pirate_haven', 'port', 'village', 'wilderness']);
const SHIP_MARKETS = new Set(['none', 'small_craft', 'full']);
const VALID_LOCATION_SERVICES = new Set(LOCATION_SERVICES);
const VALID_LOCATION_TAGS = new Set(LOCATION_TAGS);
const CONDITION_TYPES = new Set([
  'all',
  'any',
  'not',
  'hasTrait',
  'statAtLeast',
  'hasFlag',
  'hasItem',
  'berriesAtLeast',
  'hasCrew',
  'crewSizeAtLeast',
  'hasCrewRole',
  'canRecruitNpc',
  'isLeader',
  'locationIs',
  'locationHasTag',
  'locationHasService',
  'locationWithin',
  'currentSeaIs',
  'sameIslandPortExists','currentSeaHasPort','fallbackStreakAtLeast','shipDestructionCauseIs','maritimeEmergencyActive','hasEligibleSwimmingRescuer','hasCrewMemberWithDevilFruit',
  'isAtSea',
  'isOnLand',
  'careerPhaseIs',
  'ageAtLeastMonths',
  'ageAtMostMonths',
  'hasShip',
  'shipIs',
  'shipHealthAtLeast',
  'shipHealthAtMost',
  'shipCrewCapacityAtLeast',
  'shipCargoSpaceAtLeast',
  'canAcquireShip',
  'canSellShip',
  'npcStatusIs',
  'npcRelationshipAtLeast',
  'npcRelationshipAtMost',
  'npcMonthsSinceInteractionAtLeast',
  'npcMonthsSinceInteractionAtMost',
  'npcStatAtLeast',
  'hasChosen',
  'hasPlayed',
  'hasOutcome',
  'raceIs',
  'originSeaIs',
  'affiliationIs',
  'familyStructureIs',
  'socialClassIs',
  'hasDevilFruit','canConsumeDevilFruit','devilFruitIs','devilFruitTypeIs','devilFruitHasTag','devilFruitAwakeningAtLeast','devilFruitIsAwakened','hakiAtLeast','hakiIsAwakened','hakiSourceTotalAtLeast','npcHasDevilFruit','npcDevilFruitIs','npcDevilFruitTypeIs','npcDevilFruitHasTag','npcDevilFruitAwakeningAtLeast','npcHakiAtLeast','npcHakiIsAwakened',
  'careerAffiliationIs','reputationAtLeast','reputationAtMost','bountyAtLeast','careerRankIs','careerRankAtLeast','careerTitleIs',
]);
const EFFECT_TYPES = new Set([
  'setFlag',
  'clearFlag',
  'addItem',
  'removeItem',
  'addTrait',
  'removeTrait',
  'modifyStat',
  'modifyHealth',
  'acquireShip',
  'modifyShipHealth',
  'addCargoItem',
  'removeCargoItem',
  'resolveShipReplacement',
  'modifyBerries',
  'moveToLocation',
  'setBirthLocation',
  'loseShip',
  'setNpcStatus',
  'setNpcPassenger',
  'setLeadership',
  'modifyNpcRelationship',
  'modifyNpcStat',
  'scheduleEvent',
  'queueImmediateEvent',
  'setCareerPhase',
  'setRace',
  'setOriginSea',
  'setAffiliation',
  'setFamilyStructure',
  'setSocialClass',
  'recoverTravel',
  'moveToSameIslandPort','recoverToLandInCurrentSea','recoverToOtherRegion','beginMaritimeEmergency','resolveMaritimeEmergencyLandfall',
  'endCareer',
  'consumeDevilFruit','increaseDevilFruitAwakening','awakenHaki','raiseConquerorHakiTo','setNpcDevilFruit','increaseNpcDevilFruitAwakening','raiseNpcHakiTo',
  'setCareerAffiliation','modifyReputation','setBounty','modifyBounty','setCareerRank','setCareerTitle','clearCareerTitle','endCareerWithEnding',
]);

export function validateContent(catalog: unknown, sourceDictionary: LocalizationDictionary = dictionaries[SOURCE_LOCALE]): ContentValidationError[] {
  const errors: ContentValidationError[] = [];
  if (!isRecord(catalog)) return [{ path: 'catalog', message: 'Expected an object.' }];
  if (catalog.schemaVersion !== CONTENT_SCHEMA_VERSION) errors.push({ path: 'schemaVersion', message: `Unsupported Content schema version "${String(catalog.schemaVersion)}".` });
  validateLocalizationKeys(catalog, 'catalog', sourceDictionary, errors);

  const events = readRecords(catalog.events, 'events', errors);
  const eventIds = collectIds(events, 'events', errors);
  const traits = readRecords(catalog.traits, 'traits', errors);
  const traitIds = collectIds(traits, 'traits', errors);
  const itemIds = collectIds(readRecords(catalog.items, 'items', errors), 'items', errors);
  const devilFruits = readRecords(catalog.devilFruits, 'devilFruits', errors);
  const devilFruitIds = collectIds(devilFruits, 'devilFruits', errors);
  const ships = readRecords(catalog.ships, 'ships', errors);
  const shipIds = collectIds(ships, 'ships', errors);
  const crewRoles = readRecords(catalog.crewRoles, 'crewRoles', errors);
  const crewRoleIds = collectIds(crewRoles, 'crewRoles', errors);
  const npcs = readRecords(catalog.npcs, 'npcs', errors);
  const npcIds = collectIds(npcs, 'npcs', errors);
  const races = readRecords(catalog.races, 'races', errors);
  const raceIds = collectIds(races, 'races', errors);
  const seas = readRecords(catalog.seas, 'seas', errors);
  const seaIds = collectIds(seas, 'seas', errors);
  const affiliations = readRecords(catalog.affiliations, 'affiliations', errors);
  const affiliationIds = collectIds(affiliations, 'affiliations', errors);
  const careerAffiliations = readRecords(catalog.careerAffiliations, 'careerAffiliations', errors);
  const careerAffiliationIds = collectIds(careerAffiliations, 'careerAffiliations', errors);
  const careerRanks = readRecords(catalog.careerRanks, 'careerRanks', errors);
  const careerRankIds = collectIds(careerRanks, 'careerRanks', errors);
  const careerTitles = readRecords(catalog.careerTitles, 'careerTitles', errors);
  const careerTitleIds = collectIds(careerTitles, 'careerTitles', errors);
  const endings = readRecords(catalog.endings, 'endings', errors);
  const endingIds = collectIds(endings, 'endings', errors);
  const familyStructures = readRecords(catalog.familyStructures, 'familyStructures', errors);
  const familyStructureIds = collectIds(familyStructures, 'familyStructures', errors);
  const socialClasses = readRecords(catalog.socialClasses, 'socialClasses', errors);
  const socialClassIds = collectIds(socialClasses, 'socialClasses', errors);
  const locations = readRecords(catalog.locations, 'locations', errors);
  const locationIds = collectIds(locations, 'locations', errors);
  const choicesByEvent = new Map<string, Set<string>>();
  const outcomesByEvent = new Map<string, Set<string>>();
  const scheduledEventIds = new Set<string>();
  const immediateEventIds = new Set<string>();

  for (const [eventIndex, event] of events.entries()) {
    const eventPath = `events[${eventIndex}]`;
    const eventId = stringValue(event.id);
    const choices = readRecords(event.choices, `${eventPath}.choices`, errors);
    const choiceIds = collectIds(choices, `${eventPath}.choices`, errors);
    if (eventId) {
      choicesByEvent.set(eventId, choiceIds);
      outcomesByEvent.set(eventId, collectOutcomeIds(choices));
    }
    if (eventId && event.kind === 'scheduled') scheduledEventIds.add(eventId);
    if (eventId && event.kind === 'immediate') immediateEventIds.add(eventId);
  }

  validateTraitOpposites(traits, traitIds, errors);
  const references = { eventIds, choicesByEvent, outcomesByEvent, traitIds, itemIds, devilFruitIds, shipIds, crewRoleIds, npcIds, raceIds, seaIds, affiliationIds, careerAffiliationIds, careerRankIds, careerTitleIds, endingIds, familyStructureIds, socialClassIds, locationIds, scheduledEventIds, immediateEventIds };
  devilFruits.forEach((fruit, index) => {
    const path = `devilFruits[${index}]`;
    if (typeof fruit.playableV1 !== 'boolean') errors.push({ path: `${path}.playableV1`, message: 'Devil Fruit requires playableV1.' });
    if (fruit.playableV1 === true) validateReference(fruit.itemId, itemIds, 'ItemId', `${path}.itemId`, errors);
    else if (fruit.itemId !== null) errors.push({ path: `${path}.itemId`, message: 'Reference-only Devil Fruit itemId must be null.' });
    if (!FRUIT_TYPES.has(String(fruit.type))) errors.push({ path: `${path}.type`, message: `Invalid Devil Fruit type "${String(fruit.type)}".` });
    if (!Array.isArray(fruit.tags)) errors.push({ path: `${path}.tags`, message: 'Devil Fruit tags must be an array.' });
    else fruit.tags.forEach((tag, tagIndex) => { if (!FRUIT_TAGS.has(String(tag))) errors.push({ path: `${path}.tags[${tagIndex}]`, message: `Unknown Devil Fruit tag "${String(tag)}".` }); });
  });
  validateNamedDefinitions(races, 'races', errors);
  validateNamedDefinitions(seas, 'seas', errors);
  validateNamedDefinitions(affiliations, 'affiliations', errors);
  validateNamedDefinitions(careerAffiliations, 'careerAffiliations', errors);
  validateNamedDefinitions(careerRanks, 'careerRanks', errors);
  validateNamedDefinitions(careerTitles, 'careerTitles', errors);
  validateNamedDefinitions(endings, 'endings', errors);
  careerAffiliations.forEach((definition, index) => { if (!CAREER_AFFILIATION_IDS.has(String(definition.id))) errors.push({ path: `careerAffiliations[${index}].id`, message: `Invalid CareerAffiliationId "${String(definition.id)}".` }); });
  [...careerTitles.map((definition, index) => [definition, `careerTitles[${index}]`] as const), ...endings.map((definition, index) => [definition, `endings[${index}]`] as const)]
    .forEach(([definition, path]) => { if (!stringValue(definition.descriptionKey)) errors.push({ path: `${path}.descriptionKey`, message: 'Definition descriptionKey must be a non-empty string.' }); });
  careerRanks.forEach((rank, index) => {
    const path = `careerRanks[${index}]`;
    if (!['marine', 'revolutionary', 'bounty_hunter'].includes(String(rank.affiliationId))) errors.push({ path: `${path}.affiliationId`, message: 'Career rank requires a ranked affiliation.' });
    if (!Number.isInteger(rank.sortOrder) || (rank.sortOrder as number) < 0) errors.push({ path: `${path}.sortOrder`, message: 'Career rank sortOrder must be a non-negative integer.' });
  });
  validateNamedDefinitions(familyStructures, 'familyStructures', errors);
  validateNamedDefinitions(socialClasses, 'socialClasses', errors);
  validateNamedDefinitions(crewRoles, 'crewRoles', errors);
  locations.forEach((location, index) => {
    const path = `locations[${index}]`;
    validateReference(location.seaId, seaIds, 'SeaId', `${path}.seaId`, errors);
    if (!stringValue(location.nameKey)) errors.push({ path: `${path}.nameKey`, message: 'Location requires nameKey.' });
    if (!stringValue(location.islandId)) errors.push({ path: `${path}.islandId`, message: 'Location requires islandId.' });
    if (location.parentLocationId !== null) {
      validateReference(location.parentLocationId, locationIds, 'LocationId', `${path}.parentLocationId`, errors);
      if (location.parentLocationId === location.id) errors.push({ path: `${path}.parentLocationId`, message: 'Location cannot be its own parent.' });
    }
    if (!LOCATION_TYPES.has(String(location.type))) errors.push({ path: `${path}.type`, message: `Invalid Location type "${String(location.type)}".` });
    if (!SHIP_MARKETS.has(String(location.shipMarket))) errors.push({ path: `${path}.shipMarket`, message: `Invalid shipMarket "${String(location.shipMarket)}".` });
    validateStringEnumArray(location.services, VALID_LOCATION_SERVICES, `${path}.services`, 'Location service', errors);
    validateStringEnumArray(location.tags, VALID_LOCATION_TAGS, `${path}.tags`, 'Location tag', errors);
    if (typeof location.canBeBirthLocation !== 'boolean') errors.push({ path: `${path}.canBeBirthLocation`, message: 'Location requires canBeBirthLocation.' });
    if (typeof location.blocksScheduledEvents !== 'boolean') errors.push({ path: `locations[${index}].blocksScheduledEvents`, message: 'Location requires blocksScheduledEvents.' });
    if (typeof location.allowsDocking !== 'boolean') errors.push({ path: `locations[${index}].allowsDocking`, message: 'Location requires allowsDocking.' });
  });
  validateLocationParentCycles(locations, errors);
  races.forEach((race, index) => validateOriginModifierDefinition(race, `races[${index}]`, true, errors));
  familyStructures.forEach((definition, index) => validateOriginModifierDefinition(definition, `familyStructures[${index}]`, false, errors));
  socialClasses.forEach((definition, index) => validateOriginModifierDefinition(definition, `socialClasses[${index}]`, false, errors));
  ships.forEach((ship, index) => {
    const path = `ships[${index}]`;
    if (!stringValue(ship.nameKey)) errors.push({ path: `${path}.nameKey`, message: 'Ship requires nameKey.' });
    for (const field of ['maxHealth', 'crewCapacity', 'cargoSlots'] as const) {
      if (!Number.isInteger(ship[field]) || (ship[field] as number) < (field === 'maxHealth' ? 1 : 0)) errors.push({ path: `${path}.${field}`, message: `${field} must be a valid non-negative integer${field === 'maxHealth' ? ' greater than zero' : ''}.` });
    }
  });
  validateNpcDefinitions(npcs, references, errors);
  for (const [eventIndex, event] of events.entries()) {
    validateEvent(event, `events[${eventIndex}]`, references, errors);
  }
  validateImmediateCycles(events, errors);

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
  devilFruitIds: Set<string>;
  shipIds: Set<string>;
  crewRoleIds: Set<string>;
  npcIds: Set<string>;
  raceIds: Set<string>;
  seaIds: Set<string>;
  affiliationIds: Set<string>;
  careerAffiliationIds: Set<string>;
  careerRankIds: Set<string>;
  careerTitleIds: Set<string>;
  endingIds: Set<string>;
  familyStructureIds: Set<string>;
  socialClassIds: Set<string>;
  locationIds: Set<string>;
  scheduledEventIds: Set<string>;
  immediateEventIds: Set<string>;
}

function validateEvent(
  event: UnknownRecord,
  path: string,
  references: References,
  errors: ContentValidationError[],
): void {
  if (!['normal', 'immediate', 'scheduled', 'critical'].includes(String(event.kind))) errors.push({ path, message: `Invalid Event kind "${String(event.kind)}".` });
  if (event.scheduledOnly !== undefined
    || (event.kind !== 'scheduled' && [event.priority, event.scheduledReach, event.cancelIf, event.fallbackEventId].some((value) => value !== undefined))
    || (event.kind !== 'critical' && event.trigger !== undefined)
    || (event.kind !== 'normal' && (event.lifetimeThreadSeed !== undefined || event.replay !== undefined))) errors.push({ path, message: 'Invalid Event kind field combination.' });
  if (event.kind === 'normal' && event.lifetimeThreadSeed !== undefined && event.lifetimeThreadSeed !== true) errors.push({ path: `${path}.lifetimeThreadSeed`, message: 'lifetimeThreadSeed must be true when present.' });
  if (event.kind === 'normal' && event.replay !== undefined) {
    if (!isRecord(event.replay)) errors.push({ path: `${path}.replay`, message: 'replay must be an object.' });
    else {
      if (!Number.isInteger(event.replay.cooldownMonths) || (event.replay.cooldownMonths as number) < 1) errors.push({ path: `${path}.replay.cooldownMonths`, message: 'replay cooldownMonths must be an integer of at least 1.' });
      if (event.replay.maxOccurrences !== undefined && (!Number.isInteger(event.replay.maxOccurrences) || (event.replay.maxOccurrences as number) < 2)) errors.push({ path: `${path}.replay.maxOccurrences`, message: 'replay maxOccurrences must be an integer of at least 2.' });
    }
    if (event.lifetimeThreadSeed === true) errors.push({ path: `${path}.replay`, message: 'lifetimeThreadSeed Events cannot be replayable.' });
  }
  if (event.kind === 'scheduled') {
    if (![50, 100, 200, 300].includes(Number(event.priority))) errors.push({ path, message: 'Scheduled priority must be 50, 100, 200, or 300.' });
    if (event.scheduledReach !== undefined && !['normal', 'unrestricted'].includes(String(event.scheduledReach))) errors.push({ path, message: 'Invalid scheduledReach.' });
    if (event.cancelIf !== undefined) validateCondition(event.cancelIf, `${path}.cancelIf`, references, errors);
    if (event.fallbackEventId !== undefined) {
      const fallback = validateReference(event.fallbackEventId, references.scheduledEventIds, 'Scheduled EventId', `${path}.fallbackEventId`, errors);
      if (fallback === event.id) errors.push({ path: `${path}.fallbackEventId`, message: 'Scheduled Event cannot fallback to itself.' });
    }
  }
  if (event.kind === 'critical') {
    if (!isRecord(event.trigger) || !['playerHealthDepleted', 'npcHealthDepleted', 'shipDestroyed', 'shipMissingAtSea', 'shipReplacementPending', 'fallbackStreakAtLeast', 'careerAgeAtLeast'].includes(String(event.trigger.type))) errors.push({ path: `${path}.trigger`, message: 'Invalid Critical trigger.' });
    else if (event.trigger.type === 'npcHealthDepleted') validateReference(event.trigger.npcId, references.npcIds, 'NpcId', `${path}.trigger`, errors);
    else if (event.trigger.type === 'fallbackStreakAtLeast' && (!Number.isInteger(event.trigger.value) || (event.trigger.value as number) < 1)) errors.push({ path: `${path}.trigger`, message: 'fallbackStreakAtLeast trigger requires a positive integer.' });
    else if (event.trigger.type === 'careerAgeAtLeast' && (!Number.isInteger(event.trigger.value) || (event.trigger.value as number) < 1)) errors.push({ path: `${path}.trigger`, message: 'careerAgeAtLeast trigger requires a positive integer.' });
  }
  if (event.eligibility !== undefined) {
    validateCondition(event.eligibility, `${path}.eligibility`, references, errors);
  }
  if (event.cast !== undefined) {
    if (!Array.isArray(event.cast)) errors.push({ path: `${path}.cast`, message: 'Event cast must be an array of NpcIds.' });
    else {
      const seen = new Set<string>();
      event.cast.forEach((npcId, index) => {
        const id = validateReference(npcId, references.npcIds, 'NpcId', `${path}.cast[${index}]`, errors);
        if (id && seen.has(id)) errors.push({ path: `${path}.cast[${index}]`, message: `Duplicate NpcId "${id}" in Event cast.` });
        if (id) seen.add(id);
      });
    }
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
    if (choice.input !== undefined) validateChoiceInput(choice.input, `${choicePath}.input`, errors);
    validateResolution(choice.resolution, `${choicePath}.resolution`, references, errors);
    if (containsEffectType(choice.resolution, 'modifyShipHealth') && !conditionGuaranteesHasShip(event.eligibility) && !conditionGuaranteesHasShip(choice.availableIf)) {
      errors.push({ path: choicePath, message: `Event "${event.id}" modifyShipHealth requires an explicit hasShip guard on Event eligibility or Choice availability.` });
    }
    if (isRecord(choice.resolution) && choice.resolution.type === 'dice') {
      const statId = stringValue(choice.resolution.statId);
      if (statId && diceStatIds.has(statId)) {
        errors.push({ path: choicePath, message: `Multiple DiceChoices in one Event cannot use StatId "${statId}".` });
      } else if (statId) diceStatIds.add(statId);
    }
  }
}

function conditionGuaranteesHasShip(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return value.type === 'hasShip' || (value.type === 'all' && Array.isArray(value.conditions) && value.conditions.some(conditionGuaranteesHasShip));
}

function containsEffectType(value: unknown, effectType: string): boolean {
  if (Array.isArray(value)) return value.some((entry) => containsEffectType(entry, effectType));
  if (!isRecord(value)) return false;
  return value.type === effectType || Object.values(value).some((entry) => containsEffectType(entry, effectType));
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
  if (type === 'shipIs' || type === 'canAcquireShip') validateReference(value.shipId, references.shipIds, 'ShipId', path, errors);
  if (type === 'hasCrewRole') validateReference(value.roleId, references.crewRoleIds, 'CrewRoleId', path, errors);
  if (type === 'canRecruitNpc') validateReference(value.npcId, references.npcIds, 'NpcId', path, errors);
  if (type === 'locationIs' || type === 'locationWithin') validateReference(value.locationId, references.locationIds, 'LocationId', path, errors);
  if (type === 'currentSeaIs') validateReference(value.seaId, references.seaIds, 'SeaId', path, errors);
  if (type === 'fallbackStreakAtLeast' && (!Number.isInteger(value.value) || (value.value as number) < 1)) errors.push({ path, message: 'fallbackStreakAtLeast requires a positive integer.' });
  if (type === 'shipDestructionCauseIs' && !['enemy', 'accident'].includes(String(value.cause))) errors.push({ path, message: 'Invalid ship destruction cause.' });
  if (type === 'locationHasTag' && !VALID_LOCATION_TAGS.has(String(value.tagId) as never)) errors.push({ path, message: `Unknown Location tag "${String(value.tagId)}".` });
  if (type === 'locationHasService' && !VALID_LOCATION_SERVICES.has(String(value.serviceId) as never)) errors.push({ path, message: `Unknown Location service "${String(value.serviceId)}".` });
  if (['npcStatusIs', 'npcRelationshipAtLeast', 'npcRelationshipAtMost', 'npcMonthsSinceInteractionAtLeast', 'npcMonthsSinceInteractionAtMost', 'npcStatAtLeast'].includes(type)) {
    validateReference(value.npcId, references.npcIds, 'NpcId', path, errors);
  }
  if (['npcMonthsSinceInteractionAtLeast', 'npcMonthsSinceInteractionAtMost'].includes(type) && (!Number.isInteger(value.value) || (value.value as number) < 0)) {
    errors.push({ path, message: `${type} requires a non-negative integer.` });
  }
  if (['npcRelationshipAtLeast', 'npcRelationshipAtMost'].includes(type) && !isNumberInRange(value.value, -100, 100)) {
    errors.push({ path, message: `${type} value must be a finite number from -100 to 100.` });
  }
  if (type === 'npcStatAtLeast') {
    validateNpcStat(value.statId, path, errors);
    if (!isNumberInRange(value.value, 0, 50)) {
      errors.push({ path, message: 'npcStatAtLeast value must be a finite number from 0 to 50.' });
    }
  }
  if (type === 'statAtLeast') validateStat(value.statId, path, errors);
  if (type === 'careerPhaseIs' && !['origins', 'childhood', 'active'].includes(String(value.phase))) {
    errors.push({ path, message: `Invalid CareerPhase "${String(value.phase)}".` });
  }
  if ((type === 'ageAtLeastMonths' || type === 'ageAtMostMonths') && !isNonNegativeNumber(value.value)) {
    errors.push({ path, message: `${type} requires a non-negative number.` });
  }
  if (['berriesAtLeast', 'crewSizeAtLeast', 'shipHealthAtLeast', 'shipHealthAtMost', 'shipCrewCapacityAtLeast', 'shipCargoSpaceAtLeast'].includes(type) && !isNonNegativeNumber(value.value)) {
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
  if (type === 'raceIs') validateReference(value.raceId, references.raceIds, 'RaceId', path, errors);
  if (type === 'originSeaIs') validateReference(value.seaId, references.seaIds, 'SeaId', path, errors);
  if (type === 'affiliationIs') validateReference(value.affiliationId, references.affiliationIds, 'AffiliationId', path, errors);
  if (type === 'familyStructureIs') validateReference(value.familyStructureId, references.familyStructureIds, 'FamilyStructureId', path, errors);
  if (type === 'socialClassIs') validateReference(value.socialClassId, references.socialClassIds, 'SocialClassId', path, errors);
  if (type === 'canConsumeDevilFruit' || type === 'devilFruitIs' || type === 'npcDevilFruitIs') validateReference(value.fruitId, references.devilFruitIds, 'DevilFruitId', path, errors);
  if (type === 'devilFruitTypeIs' || type === 'npcDevilFruitTypeIs') { if (!FRUIT_TYPES.has(String(value.fruitType))) errors.push({ path, message: 'Invalid Devil Fruit type.' }); }
  if (type === 'devilFruitHasTag' || type === 'npcDevilFruitHasTag') { if (!FRUIT_TAGS.has(String(value.tagId))) errors.push({ path, message: 'Unknown Devil Fruit tag.' }); }
  if (type.startsWith('npc')) validateReference(value.npcId, references.npcIds, 'NpcId', path, errors);
  if (type === 'devilFruitAwakeningAtLeast' || type === 'npcDevilFruitAwakeningAtLeast') { if (!isIntegerInRange(value.value, 0, 10)) errors.push({ path, message: 'Devil Fruit Awakening threshold must be an integer from 0 to 10.' }); }
  if (type === 'hakiAtLeast' || type === 'npcHakiAtLeast') { if (!HAKI_TYPES.has(String(value.hakiType)) || !isIntegerInRange(value.level, 0, 5)) errors.push({ path, message: 'Haki condition requires a valid type and level from 0 to 5.' }); }
  if (type === 'hakiIsAwakened' || type === 'npcHakiIsAwakened') { if (!HAKI_TYPES.has(String(value.hakiType))) errors.push({ path, message: 'Unknown Haki type.' }); }
  if (type === 'hakiSourceTotalAtLeast' && (!['observation', 'armament'].includes(String(value.hakiType)) || !isNumberInRange(value.value, 0, 100))) errors.push({ path, message: 'Haki source threshold requires observation/armament and a value from 0 to 100.' });
  if (type === 'careerAffiliationIs') validateReference(value.affiliationId, references.careerAffiliationIds, 'CareerAffiliationId', path, errors);
  if (type === 'careerRankIs' || type === 'careerRankAtLeast') validateReference(value.rankId, references.careerRankIds, 'CareerRankId', path, errors);
  if (type === 'careerTitleIs') validateReference(value.titleId, references.careerTitleIds, 'CareerTitleId', path, errors);
  if (['reputationAtLeast', 'reputationAtMost', 'bountyAtLeast'].includes(type) && (!Number.isInteger(value.value) || (value.value as number) < 0)) errors.push({ path, message: `${type} value must be a non-negative integer.` });
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
  if (value.actor !== undefined) {
    if (!isRecord(value.actor) || !['player', 'bestCrew'].includes(String(value.actor.type))) errors.push({ path: `${path}.actor`, message: 'Invalid Dice actor.' });
    else if (value.actor.type === 'bestCrew') {
      validateNpcStat(value.actor.statId, `${path}.actor`, errors);
      if (value.actor.requireNoDevilFruit !== undefined && typeof value.actor.requireNoDevilFruit !== 'boolean') errors.push({ path: `${path}.actor`, message: 'requireNoDevilFruit must be boolean.' });
    }
  }
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
    if (!stringValue(modifier.displayLabelKey)) {
      errors.push({ path: modifierPath, message: 'ConditionalDiceModifier requires displayLabelKey.' });
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
  if (value.advanceMonths !== undefined) errors.push({ path, message: 'Outcome.advanceMonths is not supported in Content Schema v2.' });
  if (value.shipDamageCause !== undefined && !['enemy', 'accident'].includes(String(value.shipDamageCause))) errors.push({ path: `${path}.shipDamageCause`, message: 'Invalid shipDamageCause.' });
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
    validatePositiveQuantity(effect.quantity, path, errors);
  }
  if (type === 'addCargoItem' || type === 'removeCargoItem') {
    validateReference(effect.itemId, references.itemIds, 'ItemId', path, errors);
    validatePositiveQuantity(effect.quantity, path, errors);
  }
  if (type === 'acquireShip') {
    validateReference(effect.shipId, references.shipIds, 'ShipId', path, errors);
    if (!stringValue(effect.name)) errors.push({ path, message: 'acquireShip requires a non-empty name.' });
    if (effect.health !== undefined && (!isNonNegativeNumber(effect.health) || effect.health === 0)) errors.push({ path, message: 'acquireShip health must be greater than zero.' });
  }
  if (type === 'addTrait' || type === 'removeTrait') {
    validateReference(effect.traitId, references.traitIds, 'TraitId', path, errors);
  }
  if (type === 'setNpcStatus' || type === 'modifyNpcStat') {
    validateNpcTarget(effect, path, references, errors);
  } else if (type === 'setNpcPassenger' || type === 'modifyNpcRelationship') {
    validateReference(effect.npcId, references.npcIds, 'NpcId', path, errors);
  }
  if (type === 'setNpcPassenger' && typeof effect.passenger !== 'boolean') errors.push({ path, message: 'setNpcPassenger requires a boolean passenger field.' });
  if (type === 'setLeadership' && typeof effect.isLeader !== 'boolean') errors.push({ path, message: 'setLeadership requires a boolean isLeader field.' });
  if (['acquireShip', 'loseShip', 'addCargoItem', 'removeCargoItem', 'resolveShipReplacement', 'setNpcStatus', 'setNpcPassenger'].includes(type) && effect.allowWithoutLeadership !== undefined && typeof effect.allowWithoutLeadership !== 'boolean') errors.push({ path, message: 'allowWithoutLeadership must be boolean when provided.' });
  if (type === 'modifyNpcStat') {
    validateNpcStat(effect.statId, path, errors);
    if (typeof effect.amount !== 'number' || !Number.isFinite(effect.amount)) {
      errors.push({ path, message: 'modifyNpcStat amount must be finite.' });
    }
  }
  if (type === 'modifyStat') validateStat(effect.statId, path, errors);
  if (['modifyStat', 'modifyHealth', 'modifyShipHealth', 'modifyBerries', 'modifyNpcRelationship'].includes(type) && (typeof effect.amount !== 'number' || !Number.isFinite(effect.amount))) errors.push({ path, message: `${type} amount must be finite.` });
  if (type === 'resolveShipReplacement') {
    if (!['destroy', 'sell', 'abandon'].includes(String(effect.disposition))) errors.push({ path, message: 'Invalid ship replacement disposition.' });
    if (effect.berries !== undefined && (!Number.isInteger(effect.berries) || (effect.berries as number) < 0)) errors.push({ path, message: 'Replacement sale Berrys must be a non-negative integer.' });
    if (effect.disposition !== 'sell' && effect.berries !== undefined) errors.push({ path, message: 'Only a ship sale may grant Berrys.' });
  }
  if ((type === 'moveToLocation' || type === 'loseShip') && !['at_sea', 'on_land'].includes(String(effect.travelState))) {
    errors.push({ path, message: `Invalid TravelState "${String(effect.travelState)}".` });
  }
  if (type === 'moveToLocation' || type === 'loseShip' || type === 'setBirthLocation') validateReference(effect.locationId, references.locationIds, 'LocationId', path, errors);
  if (type === 'setCareerPhase' && !['origins', 'childhood', 'active'].includes(String(effect.phase))) {
    errors.push({ path, message: `Invalid CareerPhase "${String(effect.phase)}".` });
  }
  if (type === 'setRace') validateReference(effect.raceId, references.raceIds, 'RaceId', path, errors);
  if (type === 'setOriginSea') validateReference(effect.seaId, references.seaIds, 'SeaId', path, errors);
  if (type === 'setAffiliation') validateReference(effect.affiliationId, references.affiliationIds, 'AffiliationId', path, errors);
  if (type === 'setFamilyStructure') validateReference(effect.familyStructureId, references.familyStructureIds, 'FamilyStructureId', path, errors);
  if (type === 'setSocialClass') validateReference(effect.socialClassId, references.socialClassIds, 'SocialClassId', path, errors);
  if (type === 'recoverTravel' && !['land', 'sea'].includes(String(effect.mode))) errors.push({ path, message: 'recoverTravel mode must be land or sea.' });
  if (type === 'beginMaritimeEmergency' && !['enemy', 'accident', 'ship_missing', 'sea_monster'].includes(String(effect.cause))) errors.push({ path, message: 'Invalid maritime emergency cause.' });
  if (type === 'endCareer' && !['death', 'legacy'].includes(String(effect.reason))) {
    errors.push({ path, message: `Invalid CareerEndReason "${String(effect.reason)}".` });
  }
  if (type === 'scheduleEvent') {
    validateReference(effect.eventId, references.scheduledEventIds, 'Scheduled EventId', path, errors);
    if (!Number.isInteger(effect.delayMonths) || (effect.delayMonths as number) < 0) errors.push({ path, message: 'scheduleEvent delayMonths must be a non-negative integer.' });
  }
  if (type === 'queueImmediateEvent') validateReference(effect.eventId, references.immediateEventIds, 'Immediate EventId', path, errors);
  if (type === 'consumeDevilFruit' || type === 'setNpcDevilFruit') validateReference(effect.fruitId, references.devilFruitIds, 'DevilFruitId', path, errors);
  if (type === 'setNpcDevilFruit' || type === 'increaseNpcDevilFruitAwakening' || type === 'raiseNpcHakiTo') validateReference(effect.npcId, references.npcIds, 'NpcId', path, errors);
  if (type === 'increaseDevilFruitAwakening' || type === 'increaseNpcDevilFruitAwakening') { if (!Number.isInteger(effect.amount) || (effect.amount as number) <= 0) errors.push({ path, message: 'Awakening increase must be a positive integer.' }); }
  if (type === 'awakenHaki' && !HAKI_TYPES.has(String(effect.hakiType))) errors.push({ path, message: 'Unknown Haki type.' });
  if (type === 'raiseConquerorHakiTo' && !isIntegerInRange(effect.level, 1, 5)) errors.push({ path, message: 'Conqueror Haki level must be an integer from 1 to 5.' });
  if (type === 'raiseNpcHakiTo' && (!HAKI_TYPES.has(String(effect.hakiType)) || !isIntegerInRange(effect.level, 1, 5))) errors.push({ path, message: 'NPC Haki requires a valid type and level from 1 to 5.' });
  if (type === 'setCareerAffiliation') validateReference(effect.affiliationId, references.careerAffiliationIds, 'CareerAffiliationId', path, errors);
  if (type === 'setCareerRank' && effect.rankId !== null) validateReference(effect.rankId, references.careerRankIds, 'CareerRankId', path, errors);
  if (type === 'setCareerTitle') validateReference(effect.titleId, references.careerTitleIds, 'CareerTitleId', path, errors);
  if (type === 'endCareerWithEnding') {
    validateReference(effect.endingId, references.endingIds, 'EndingId', path, errors);
    if (effect.reason !== undefined && !['death', 'legacy'].includes(String(effect.reason))) errors.push({ path, message: 'Invalid endCareerWithEnding reason.' });
  }
  if (['modifyReputation', 'modifyBounty'].includes(type) && !Number.isInteger(effect.amount)) errors.push({ path, message: `${type} amount must be an integer.` });
  if (type === 'setBounty' && (!Number.isInteger(effect.value) || (effect.value as number) < 0)) errors.push({ path, message: 'setBounty value must be a non-negative integer.' });
}

function validateNpcTarget(effect: UnknownRecord, path: string, references: References, errors: ContentValidationError[]): void {
  const hasId = effect.npcId !== undefined;
  const hasSelector = effect.npcSelector !== undefined;
  if (hasId === hasSelector) {
    errors.push({ path, message: 'NPC-targeting Effect requires exactly one of npcId or npcSelector.' });
    return;
  }
  if (hasId) validateReference(effect.npcId, references.npcIds, 'NpcId', path, errors);
  if (hasSelector && !['diceActor', 'highestRelationshipCrewWithDevilFruit'].includes(String(effect.npcSelector))) errors.push({ path, message: 'Unknown npcSelector.' });
}

function validateImmediateCycles(events: UnknownRecord[], errors: ContentValidationError[]): void {
  const graph = new Map<string, Set<string>>();
  for (const event of events) {
    const source = stringValue(event.id);
    if (!source) continue;
    const targets = new Set<string>();
    walkRecords(event.choices, (record) => {
      if (record.type === 'queueImmediateEvent' && stringValue(record.eventId)) targets.add(String(record.eventId));
    });
    graph.set(source, targets);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string, path: string[]): void => {
    if (visiting.has(id)) {
      const start = path.indexOf(id);
      errors.push({ path: 'events', message: `Immediate Event cycle detected: ${[...path.slice(start), id].join(' -> ')}.` });
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const target of graph.get(id) ?? []) visit(target, [...path, id]);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of graph.keys()) visit(id, []);
}

function walkRecords(value: unknown, visitor: (record: UnknownRecord) => void): void {
  if (Array.isArray(value)) return value.forEach((entry) => walkRecords(entry, visitor));
  if (!isRecord(value)) return;
  visitor(value);
  Object.values(value).forEach((entry) => walkRecords(entry, visitor));
}

function validatePositiveQuantity(value: unknown, path: string, errors: ContentValidationError[]): void {
  if (!Number.isInteger(value) || (value as number) <= 0) errors.push({ path, message: 'Item quantity must be a positive integer.' });
}

function validateStat(value: unknown, path: string, errors: ContentValidationError[]): void {
  if (typeof value !== 'string' || !STAT_IDS.has(value)) {
    errors.push({ path, message: `Invalid StatId "${String(value)}".` });
  }
}

function validateNpcStat(value: unknown, path: string, errors: ContentValidationError[]): void {
  if (typeof value !== 'string' || !NPC_STAT_IDS.has(value)) {
    errors.push({ path, message: `Invalid NpcStatId "${String(value)}".` });
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

function validateLocationParentCycles(locations: UnknownRecord[], errors: ContentValidationError[]): void {
  const parents = new Map<string, string>();
  locations.forEach((location) => {
    const id = stringValue(location.id);
    const parentId = stringValue(location.parentLocationId);
    if (id && parentId) parents.set(id, parentId);
  });
  for (const id of parents.keys()) {
    const seen = new Set<string>();
    let current: string | undefined = id;
    while (current && parents.has(current)) {
      if (seen.has(current)) {
        errors.push({ path: 'locations', message: `Location parent cycle detected from "${id}".` });
        break;
      }
      seen.add(current);
      current = parents.get(current);
    }
  }
}

function validateNpcDefinitions(npcs: UnknownRecord[], references: References, errors: ContentValidationError[]): void {
  npcs.forEach((npc, index) => {
    const path = `npcs[${index}]`;
    if (!stringValue(npc.nameKey)) errors.push({ path: `${path}.nameKey`, message: 'NPC nameKey must be a non-empty string.' });
    validateNullableReference(npc.raceId, references.raceIds, 'RaceId', `${path}.raceId`, errors);
    validateNullableReference(npc.originSeaId, references.seaIds, 'SeaId', `${path}.originSeaId`, errors);
    validateNullableReference(npc.affiliationId, references.affiliationIds, 'AffiliationId', `${path}.affiliationId`, errors);
    validateNullableReference(npc.crewRoleId, references.crewRoleIds, 'CrewRoleId', `${path}.crewRoleId`, errors);
    if (!isRecord(npc.initialStats)) {
      errors.push({ path: `${path}.initialStats`, message: 'NPC initialStats must be an object.' });
      return;
    }
    for (const statId of NPC_STAT_IDS) {
      if (!isNumberInRange(npc.initialStats[statId], 0, 50)) {
        errors.push({ path: `${path}.initialStats.${statId}`, message: `${statId} must be a finite number from 0 to 50.` });
      }
    }
  });
}

function validateNamedDefinitions(definitions: UnknownRecord[], path: string, errors: ContentValidationError[]): void {
  definitions.forEach((definition, index) => {
    if (!stringValue(definition.nameKey)) errors.push({ path: `${path}[${index}].nameKey`, message: 'Definition nameKey must be a non-empty string.' });
  });
}

function validateOriginModifierDefinition(definition: UnknownRecord, path: string, requiresHealth: boolean, errors: ContentValidationError[]): void {
  if (requiresHealth && (!isNonNegativeNumber(definition.initialHealth) || definition.initialHealth === 0)) {
    errors.push({ path: `${path}.initialHealth`, message: 'Race initialHealth must be greater than zero.' });
  }
  if (!isRecord(definition.attributeModifiers)) {
    errors.push({ path: `${path}.attributeModifiers`, message: 'attributeModifiers must be an object.' });
    return;
  }
  for (const [statId, amount] of Object.entries(definition.attributeModifiers)) {
    validateStat(statId, `${path}.attributeModifiers.${statId}`, errors);
    if (typeof amount !== 'number' || !Number.isFinite(amount)) errors.push({ path: `${path}.attributeModifiers.${statId}`, message: 'Attribute modifier must be finite.' });
  }
}

function validateNullableReference(value: unknown, ids: Set<string>, label: string, path: string, errors: ContentValidationError[]): void {
  if (value !== null) validateReference(value, ids, label, path, errors);
}

function validateStringEnumArray(value: unknown, allowed: ReadonlySet<string>, path: string, label: string, errors: ContentValidationError[]): void {
  if (!Array.isArray(value)) {
    errors.push({ path, message: `${label}s must be an array.` });
    return;
  }
  const seen = new Set<string>();
  value.forEach((entry, index) => {
    if (typeof entry !== 'string' || !allowed.has(entry)) errors.push({ path: `${path}[${index}]`, message: `Unknown ${label} "${String(entry)}".` });
    else if (seen.has(entry)) errors.push({ path: `${path}[${index}]`, message: `Duplicate ${label} "${entry}".` });
    else seen.add(entry);
  });
}

function validateChoiceInput(value: unknown, path: string, errors: ContentValidationError[]): void {
  if (!isRecord(value) || value.type !== 'text' || value.target !== 'playerName') {
    errors.push({ path, message: 'Choice input must be text targeting playerName.' });
    return;
  }
  if (!Number.isInteger(value.minLength) || !Number.isInteger(value.maxLength) || (value.minLength as number) < 1 || (value.maxLength as number) > 32 || (value.minLength as number) > (value.maxLength as number)) {
    errors.push({ path, message: 'Text input length must be an integer range within 1 to 32.' });
  }
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

function validateLocalizationKeys(value: unknown, path: string, dictionary: LocalizationDictionary, errors: ContentValidationError[]): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validateLocalizationKeys(entry, `${path}[${index}]`, dictionary, errors));
    return;
  }
  if (!isRecord(value)) return;
  for (const [property, child] of Object.entries(value)) {
    const childPath = `${path}.${property}`;
    if (property.endsWith('Key')) {
      if (!stringValue(child) || dictionary[String(child)] === undefined) errors.push({ path: childPath, message: `Missing source localization key "${String(child)}".` });
    } else validateLocalizationKeys(child, childPath, dictionary, errors);
  }
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isNumberInRange(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum;
}

function isIntegerInRange(value: unknown, minimum: number, maximum: number): value is number {
  return Number.isInteger(value) && (value as number) >= minimum && (value as number) <= maximum;
}
import { CONTENT_SCHEMA_VERSION, LOCATION_SERVICES, LOCATION_TAGS } from '../content/schema';
import { dictionaries, SOURCE_LOCALE, type LocalizationDictionary } from '../localization';
