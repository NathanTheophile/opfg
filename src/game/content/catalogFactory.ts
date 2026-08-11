import locationsData from './data/locationsV1.json';
import fruitsData from './data/devilFruitsV1.json';
import { CONTENT_SCHEMA_VERSION, type ContentCatalog, type DevilFruitDefinition, type EventDefinition, type LocationDefinition } from './schema';
import { affiliationNameKey, careerAffiliationNameKey, careerRankNameKey, careerTitleDescriptionKey, careerTitleNameKey, crewRoleNameKey, devilFruitNameKey, endingDescriptionKey, endingNameKey, itemNameKey, locationNameKey, npcNameKey, raceNameKey, seaNameKey, traitDescriptionKey, traitNameKey } from '../localization/keys';

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
  })) as LocationDefinition[];

const devilFruits = fruitsData.fruits.map(({ id, type, playableV1, tags }) => ({
  id, nameKey: devilFruitNameKey(id), type, playableV1, itemId: playableV1 ? `${id}_fruit_item` : null, tags,
})) as DevilFruitDefinition[];

export function createContentCatalog(events: EventDefinition[]): ContentCatalog {
  return {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    races: [
      { id: 'human', nameKey: raceNameKey('human'), initialHealth: 35, attributeModifiers: { observation: 1, intelligence: 1, charisma: 1, luck: 1, morale: -2 } },
      { id: 'fishman', nameKey: raceNameKey('fishman'), initialHealth: 45, attributeModifiers: { strength: 4, agility: 1, observation: 2, intelligence: -2, navigation: 3, charisma: -3, luck: -2, morale: -3 } },
      { id: 'mink', nameKey: raceNameKey('mink'), initialHealth: 35, attributeModifiers: { strength: -1, agility: 4, observation: 4, intelligence: -2, navigation: -3, charisma: 1, luck: -2, morale: -1 } },
      { id: 'giant', nameKey: raceNameKey('giant'), initialHealth: 60, attributeModifiers: { strength: 6, agility: -6, observation: -2, intelligence: -2, navigation: -4, charisma: -1, luck: -2, morale: 5 } },
      { id: 'longarm', nameKey: raceNameKey('longarm'), initialHealth: 40, attributeModifiers: { strength: 2, agility: 4, observation: 3, intelligence: 1, navigation: -3, charisma: -2, luck: -2, morale: -3 } },
      { id: 'buccaneer', nameKey: raceNameKey('buccaneer'), initialHealth: 50, attributeModifiers: { strength: 4, agility: -3, observation: 1, intelligence: -1, navigation: -2, charisma: -1, luck: -2, morale: 4 } },
    ],
    seas: ['east_blue', 'west_blue', 'north_blue', 'south_blue', 'grand_line_paradise', 'new_world', 'sky', 'underwater', 'calm_belt', 'red_line'].map((id) => ({ id, nameKey: seaNameKey(id) })),
    affiliations: ['civilian', 'marine', 'pirate', 'revolutionary', 'bandit', 'prisoner', 'slave', 'celestial_dragon', 'royal_family'].map((id) => ({ id, nameKey: affiliationNameKey(id) })),
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
    items: [
      { id: 'sealed_chart', nameKey: itemNameKey('sealed_chart') },
      { id: 'mira_letter_of_passage', nameKey: itemNameKey('mira_letter_of_passage') },
      { id: 'timber', nameKey: itemNameKey('timber') },
      ...devilFruits.filter(({ playableV1 }) => playableV1).map(({ itemId }) => ({ id: itemId!, nameKey: itemNameKey(itemId!) })),
    ],
    devilFruits,
    ships: [
      { id: 'dinghy', nameKey: 'ship.dinghy.name', maxHealth: 18, crewCapacity: 1, cargoSlots: 1 },
      { id: 'sloop', nameKey: 'ship.sloop.name', maxHealth: 30, crewCapacity: 3, cargoSlots: 2 },
      { id: 'caravel', nameKey: 'ship.caravel.name', maxHealth: 38, crewCapacity: 5, cargoSlots: 3 },
      { id: 'brig', nameKey: 'ship.brig.name', maxHealth: 50, crewCapacity: 7, cargoSlots: 2 },
      { id: 'merchant_ship', nameKey: 'ship.merchant_ship.name', maxHealth: 42, crewCapacity: 5, cargoSlots: 7 },
      { id: 'galleon', nameKey: 'ship.galleon.name', maxHealth: 65, crewCapacity: 9, cargoSlots: 5 },
    ],
    crewRoles: ['navigator','medic','cook','shipwright','helmsman','gunner','musician','scholar','fighter','quartermaster'].map((id) => ({ id, nameKey: crewRoleNameKey(id) })),
    npcs: [
      { id: 'mira', nameKey: npcNameKey('mira'), raceId: null, originSeaId: null, affiliationId: null, crewRoleId: 'navigator', initialStats: { health: 25, morale: 25, strength: 25, observation: 25, intelligence: 25, luck: 25, loyalty: 25, calm: 25 } },
      ...['player_parent_1', 'player_parent_2'].map((id) => ({ id, nameKey: npcNameKey(id), raceId: null, originSeaId: null, affiliationId: 'civilian', crewRoleId: null, initialStats: { health: 25, morale: 25, strength: 25, observation: 25, intelligence: 25, luck: 25, loyalty: 25, calm: 25 } })),
    ],
    events,
  };
}
