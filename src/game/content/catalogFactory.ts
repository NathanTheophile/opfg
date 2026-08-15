import locationsData from './data/locationsV1.json';
import fruitsData from './data/devilFruitsV1.json';
import { CONTENT_SCHEMA_VERSION, type ContentCatalog, type DevilFruitDefinition, type EventDefinition, type LocationDefinition } from './schema';
import { affiliationNameKey, careerAffiliationNameKey, careerRankNameKey, careerTitleDescriptionKey, careerTitleNameKey, crewRoleNameKey, devilFruitNameKey, endingDescriptionKey, endingNameKey, itemNameKey, locationNameKey, npcNameKey, raceNameKey, seaNameKey, traitDescriptionKey, traitNameKey } from '../localization/keys';
import { createDefaultNpcStats } from '../model/npcState';
import { SINGLE_PARENT_SEX_BY_AFFILIATION } from './familySagaConfig';

const defaultNpcStats = createDefaultNpcStats;

const oppositePairs = [
  ['audacious', 'cautious'], ['merciful', 'ruthless'], ['generous', 'greedy'], ['disciplined', 'rebellious'], ['sociable', 'solitary'],
  ['patient', 'impulsive'], ['honest', 'deceptive'], ['loyal', 'disloyal'], ['forgiving', 'vengeful'], ['trusting', 'suspicious'],
] as const;
const independentTraits = ['resilient', 'curious', 'ambitious', 'superstitious', 'competitive', 'protective', 'resourceful', 'proud'] as const;
const rankLadders = {
  marine: ['marine_recruit','marine_petty_officer','marine_lieutenant','marine_commander','marine_captain','marine_commodore','marine_rear_admiral','marine_vice_admiral','marine_admiral','marine_fleet_admiral'],
  revolutionary: ['revolutionary_recruit','revolutionary_agent','revolutionary_operator','revolutionary_officer','revolutionary_regional_commander'],
  bounty_hunter: ['bounty_hunter_novice','bounty_hunter_tracker','bounty_hunter_confirmed','bounty_hunter_elite','bounty_hunter_master'],
} as const;

const locations = [...locationsData.blueLocations.map((location) => ({ ...location, seaId: location.seaId, canBeBirthLocation: location.canBeBirthLocation, blocksScheduledEvents: location.blocksScheduledEvents })), ...locationsData.outsideBlueLocations.map((location) => ({ ...location, seaId: location.zone, canBeBirthLocation: false, blocksScheduledEvents: false }))]
  .map(({ id, seaId, islandId, type, parentLocationId, canBeBirthLocation, allowsDocking, shipMarket, services, tags, blocksScheduledEvents }) => ({
    id, nameKey: locationNameKey(id), seaId, islandId, type, parentLocationId, canBeBirthLocation, allowsDocking, shipMarket, services, tags, blocksScheduledEvents,
    hasMarketHub: (services as readonly string[]).includes('trade') || shipMarket !== 'none',
    marketItemIds: (services as readonly string[]).includes('trade') ? ['timber'] : [],
  })) as LocationDefinition[];

const devilFruits = fruitsData.fruits.map(({ id, type, playableV1, tags }) => ({
  id, nameKey: devilFruitNameKey(id), type, playableV1, itemId: playableV1 ? `${id}_fruit_item` : null, tags,
})) as DevilFruitDefinition[];

export function createContentCatalog(events: EventDefinition[]): ContentCatalog {
  return {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    races: [
      { id: 'human', nameKey: raceNameKey('human'), playableV1: true, initialHealth: 35, attributeModifiers: { observation: 1, intelligence: 1, charisma: 1, luck: 1, morale: -2 } },
      { id: 'fishman', nameKey: raceNameKey('fishman'), playableV1: true, initialHealth: 45, attributeModifiers: { strength: 4, agility: 1, observation: 2, intelligence: -2, navigation: 3, charisma: -3, luck: -2, morale: -3 } },
      { id: 'mink', nameKey: raceNameKey('mink'), playableV1: true, initialHealth: 35, attributeModifiers: { strength: -1, agility: 4, observation: 4, intelligence: -2, navigation: -3, charisma: 1, luck: -2, morale: -1 } },
      { id: 'giant', nameKey: raceNameKey('giant'), playableV1: true, initialHealth: 60, attributeModifiers: { strength: 6, agility: -6, observation: -2, intelligence: -2, navigation: -4, charisma: -1, luck: -2, morale: 5 } },
      { id: 'longarm', nameKey: raceNameKey('longarm'), playableV1: false, initialHealth: 40, attributeModifiers: { strength: 2, agility: 4, observation: 3, intelligence: 1, navigation: -3, charisma: -2, luck: -2, morale: -3 } },
      { id: 'buccaneer', nameKey: raceNameKey('buccaneer'), playableV1: false, initialHealth: 50, attributeModifiers: { strength: 4, agility: -3, observation: 1, intelligence: -1, navigation: -2, charisma: -1, luck: -2, morale: 4 } },
    ],
    seas: ['east_blue', 'west_blue', 'north_blue', 'south_blue', 'grand_line_paradise', 'new_world', 'sky', 'underwater', 'calm_belt', 'red_line'].map((id) => ({ id, nameKey: seaNameKey(id) })),
    affiliations: ['civilian', 'marine', 'pirate', 'revolutionary', 'bandit', 'prisoner', 'slave', 'celestial_dragon', 'royal_family'].map((id) => ({ id, nameKey: affiliationNameKey(id), playableV1: ['civilian', 'marine', 'pirate', 'revolutionary', 'royal_family'].includes(id), singleParentSex: SINGLE_PARENT_SEX_BY_AFFILIATION[id] ?? null })),
    careerAffiliations: (['civilian', 'pirate', 'marine', 'revolutionary', 'bounty_hunter'] as const).map((id) => ({ id, nameKey: careerAffiliationNameKey(id) })),
    careerRanks: Object.entries(rankLadders).flatMap(([affiliationId, ranks]) => ranks.map((id, sortOrder) => ({ id, nameKey: careerRankNameKey(id), affiliationId: affiliationId as 'marine' | 'revolutionary' | 'bounty_hunter', sortOrder }))),
    careerTitles: ['rookie', 'veteran', 'legend'].map((id) => ({ id, nameKey: careerTitleNameKey(id), descriptionKey: careerTitleDescriptionKey(id) })),
    endings: ['career_complete', 'stranded', 'lost_at_sea', 'v1_career_horizon'].map((id) => ({ id, nameKey: endingNameKey(id), descriptionKey: endingDescriptionKey(id) })),
    familyStructures: [
      { id: 'two_parents', nameKey: 'familyStructure.two_parents.name', attributeModifiers: { morale: 2, charisma: 1, observation: -1, agility: -2 } },
      { id: 'single_parent', nameKey: 'familyStructure.single_parent.name', attributeModifiers: { intelligence: 2, observation: 1, morale: -2, luck: -1 } },
      { id: 'orphan', nameKey: 'familyStructure.orphan.name', attributeModifiers: { observation: 3, agility: 2, morale: -4, charisma: -1 } },
    ],
    socialClasses: [
      { id: 'poor', nameKey: 'socialClass.poor.name', attributeModifiers: { observation: 3, luck: -3 } },
      { id: 'modest', nameKey: 'socialClass.modest.name', attributeModifiers: {} },
      { id: 'wealthy', nameKey: 'socialClass.wealthy.name', attributeModifiers: { luck: 3, observation: -3 } },
    ],
    locations,
    traits: [
      ...oppositePairs.flatMap(([first, second]) => [
        { id: first, nameKey: traitNameKey(first), descriptionKey: traitDescriptionKey(first), oppositeTraitId: second },
        { id: second, nameKey: traitNameKey(second), descriptionKey: traitDescriptionKey(second), oppositeTraitId: first },
      ]),
      ...independentTraits.map((id) => ({ id, nameKey: traitNameKey(id), descriptionKey: traitDescriptionKey(id) })),
    ],
    economy: {},
    items: [
      { id: 'sealed_chart', nameKey: itemNameKey('sealed_chart'), category: 'item', stackLimit: 1, market: null },
      { id: 'family_marine_insignia', nameKey: itemNameKey('family_marine_insignia'), category: 'item', stackLimit: 1, market: null, unique: true },
      { id: 'family_marine_service_journal', nameKey: itemNameKey('family_marine_service_journal'), category: 'equipment', stackLimit: 1, market: null, unique: true, modifiers: { intelligence: 2, morale: 1 } },
      { id: 'family_marine_field_compass', nameKey: itemNameKey('family_marine_field_compass'), category: 'equipment', stackLimit: 1, market: null, unique: true, modifiers: { navigation: 2, observation: 1 } },
      { id: 'family_marine_sealed_report', nameKey: itemNameKey('family_marine_sealed_report'), category: 'item', stackLimit: 1, market: null, unique: true },
      { id: 'giant_marine_training_bracer', nameKey: itemNameKey('giant_marine_training_bracer'), category: 'equipment', stackLimit: 1, market: null, unique: true, modifiers: { strength: 3 } },
      { id: 'marine_courtyard_hound', nameKey: itemNameKey('marine_courtyard_hound'), category: 'item', stackLimit: 1, market: null, unique: true, companion: true, modifiers: { morale: 2, observation: 1 } },
      { id: 'civilian_workshop_toolkit', nameKey: itemNameKey('civilian_workshop_toolkit'), category: 'equipment', stackLimit: 1, market: null, unique: true, modifiers: { intelligence: 2, observation: 1 } },
      { id: 'civilian_trust_ledger', nameKey: itemNameKey('civilian_trust_ledger'), category: 'equipment', stackLimit: 1, market: null, unique: true, modifiers: { charisma: 2, intelligence: 1 } },
      { id: 'civilian_workshop_cat', nameKey: itemNameKey('civilian_workshop_cat'), category: 'item', stackLimit: 1, market: null, unique: true, companion: true, modifiers: { observation: 2, morale: 1 } },
      { id: 'family_pirate_black_flag_patch', nameKey: itemNameKey('family_pirate_black_flag_patch'), category: 'equipment', stackLimit: 1, market: null, unique: true, modifiers: { morale: 2, charisma: 1 } },
      { id: 'family_pirate_safe_harbor_key', nameKey: itemNameKey('family_pirate_safe_harbor_key'), category: 'item', stackLimit: 1, market: null, unique: true },
      { id: 'family_pirate_debt_ledger', nameKey: itemNameKey('family_pirate_debt_ledger'), category: 'item', stackLimit: 1, market: null, unique: true },
      { id: 'family_pirate_salt_chart', nameKey: itemNameKey('family_pirate_salt_chart'), category: 'equipment', stackLimit: 1, market: null, unique: true, modifiers: { navigation: 3 } },
      { id: 'family_pirate_diver_bell', nameKey: itemNameKey('family_pirate_diver_bell'), category: 'equipment', stackLimit: 1, market: null, unique: true, modifiers: { navigation: 1 } },
      { id: 'pirate_safe_harbor_gull', nameKey: itemNameKey('pirate_safe_harbor_gull'), category: 'item', stackLimit: 1, market: null, unique: true, companion: true, modifiers: { navigation: 2, luck: 1 } },
      { id: 'revolutionary_handoff_notebook', nameKey: itemNameKey('revolutionary_handoff_notebook'), category: 'equipment', stackLimit: 1, market: null, unique: true, modifiers: { intelligence: 2, observation: 1 } },
      { id: 'revolutionary_boundary_keys', nameKey: itemNameKey('revolutionary_boundary_keys'), category: 'equipment', stackLimit: 1, market: null, unique: true, modifiers: { agility: 1, observation: 1, morale: 1 } },
      { id: 'revolutionary_courier_ferret', nameKey: itemNameKey('revolutionary_courier_ferret'), category: 'item', stackLimit: 1, market: null, unique: true, companion: true, modifiers: { agility: 2, observation: 1 } },
      { id: 'family_royal_plain_seal', nameKey: itemNameKey('family_royal_plain_seal'), category: 'equipment', stackLimit: 1, market: null, unique: true, modifiers: { charisma: 2, intelligence: 1 } },
      { id: 'family_royal_unmarked_travel_boots', nameKey: itemNameKey('family_royal_unmarked_travel_boots'), category: 'equipment', stackLimit: 1, market: null, unique: true, modifiers: { agility: 2, navigation: 1 } },
      { id: 'royal_palace_hound', nameKey: itemNameKey('royal_palace_hound'), category: 'item', stackLimit: 1, market: null, unique: true, companion: true, modifiers: { morale: 2, charisma: 1 } },
      { id: 'mira_letter_of_passage', nameKey: itemNameKey('mira_letter_of_passage'), category: 'item', stackLimit: 1, market: null },
      { id: 'timber', nameKey: itemNameKey('timber'), category: 'item', stackLimit: 20, market: { basePriceBerries: 5000, mode: 'buy_sell' } },
      { id: 'paradise_log_pose', nameKey: itemNameKey('paradise_log_pose'), category: 'item', stackLimit: 1, market: null, unique: true, logPoseType: 'paradise' },
      { id: 'triple_log_pose', nameKey: itemNameKey('triple_log_pose'), category: 'item', stackLimit: 1, market: null, unique: true, logPoseType: 'new_world' },
      ...devilFruits.filter(({ playableV1 }) => playableV1).map(({ itemId }) => ({ id: itemId!, nameKey: itemNameKey(itemId!), category: 'item' as const, stackLimit: 1, market: null })),
    ],
    devilFruits,
    ships: [
      { id: 'dinghy', nameKey: 'ship.dinghy.name', maxHealth: 18, crewCapacity: 1, cargoSlots: 1, priceBerries: 5000 },
      { id: 'sloop', nameKey: 'ship.sloop.name', maxHealth: 30, crewCapacity: 3, cargoSlots: 2, priceBerries: 25000 },
      { id: 'caravel', nameKey: 'ship.caravel.name', maxHealth: 38, crewCapacity: 5, cargoSlots: 4, priceBerries: 150000 },
      { id: 'brig', nameKey: 'ship.brig.name', maxHealth: 50, crewCapacity: 7, cargoSlots: 3, priceBerries: 75000 },
      { id: 'merchant_ship', nameKey: 'ship.merchant_ship.name', maxHealth: 42, crewCapacity: 5, cargoSlots: 8, priceBerries: 300000 },
      { id: 'galleon', nameKey: 'ship.galleon.name', maxHealth: 65, crewCapacity: 9, cargoSlots: 6, priceBerries: 400000 },
    ],
    crewRoles: ['navigator','medic','cook','shipwright','helmsman','gunner','musician','scholar','fighter','quartermaster'].map((id) => ({ id, nameKey: crewRoleNameKey(id), annualPower: id === 'navigator' || id === 'medic' || id === 'shipwright' ? id : undefined })),
    npcs: [
      { id: 'mira', nameKey: npcNameKey('mira'), sex: 'female', raceId: null, originSeaId: null, affiliationId: null, crewRoleId: 'navigator', initialStats: defaultNpcStats() },
      { id: 'childhood_friend', nameKey: npcNameKey('childhood_friend'), sex: 'male', namePoolId: 'childhood_male', raceId: null, originSeaId: null, affiliationId: 'civilian', crewRoleId: null, initialStats: defaultNpcStats() },
      { id: 'childhood_rival', nameKey: npcNameKey('childhood_rival'), sex: 'female', namePoolId: 'childhood_female', raceId: null, originSeaId: null, affiliationId: 'civilian', crewRoleId: null, initialStats: defaultNpcStats() },
      { id: 'childhood_younger', nameKey: npcNameKey('childhood_younger'), sex: 'female', namePoolId: 'childhood_female', raceId: null, originSeaId: null, affiliationId: 'civilian', crewRoleId: null, initialStats: defaultNpcStats() },
      { id: 'neighborhood_merchant', nameKey: npcNameKey('neighborhood_merchant'), sex: 'male', namePoolId: 'childhood_male', raceId: null, originSeaId: null, affiliationId: 'civilian', crewRoleId: null, initialStats: defaultNpcStats() },
      { id: 'player_parent_1', nameKey: npcNameKey('player_parent_1'), sex: 'male', familyRole: 'father', namePoolId: 'childhood_male', raceId: null, originSeaId: null, affiliationId: null, crewRoleId: null, initialStats: defaultNpcStats() },
      { id: 'player_parent_2', nameKey: npcNameKey('player_parent_2'), sex: 'female', familyRole: 'mother', namePoolId: 'childhood_female', raceId: null, originSeaId: null, affiliationId: null, crewRoleId: null, initialStats: defaultNpcStats() },
    ],
    majorNarrativeTracks: [
      ['family_civilian', 'civilian'],
      ['family_marine', 'marine'],
      ['family_pirate', 'pirate'],
      ['family_revolutionary', 'revolutionary'],
      ['family_royal', 'royal_family'],
    ].map(([id, affiliationId]) => ({
      id,
      type: 'family_legacy' as const,
      eligibility: { type: 'affiliationIs' as const, affiliationId },
      chapters: [
        { id: 'childhood_01', phase: 'childhood' as const, dueAgeMonths: 12 },
        { id: 'childhood_02', phase: 'childhood' as const, dueAgeMonths: 48 },
        { id: 'childhood_03', phase: 'childhood' as const, dueAgeMonths: 84 },
        { id: 'childhood_04', phase: 'childhood' as const, dueAgeMonths: 120 },
        { id: 'childhood_05', phase: 'childhood' as const, dueAgeMonths: 168 },
      ],
    })),
    events,
  };
}
