import { CONTENT_SCHEMA_VERSION, type ContentCatalog, type EventDefinition } from './schema';
import { traitNameKey, traitDescriptionKey, itemNameKey, raceNameKey, seaNameKey, affiliationNameKey, crewRoleNameKey, npcNameKey } from '../localization/keys';

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
    seas: ['east_blue', 'west_blue', 'north_blue', 'south_blue'].map((id) => ({ id, nameKey: seaNameKey(id) })),
    affiliations: ['civilian', 'marine', 'pirate', 'revolutionary', 'bandit', 'prisoner', 'slave', 'celestial_dragon', 'royal_family']
      .map((id) => ({ id, nameKey: affiliationNameKey(id) })),
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
    locations: [
      { id: 'east_blue_port', seaId: 'east_blue', blocksScheduledEvents: false, allowsShipSale: true, allowsDocking: true },
      { id: 'west_blue_port', seaId: 'west_blue', blocksScheduledEvents: false, allowsShipSale: true, allowsDocking: true },
      { id: 'north_blue_port', seaId: 'north_blue', blocksScheduledEvents: false, allowsShipSale: true, allowsDocking: true },
      { id: 'south_blue_port', seaId: 'south_blue', blocksScheduledEvents: false, allowsShipSale: true, allowsDocking: true },
      { id: 'starter_port', seaId: 'east_blue', blocksScheduledEvents: false, allowsShipSale: true, allowsDocking: true },
      { id: 'open_sea', seaId: null, blocksScheduledEvents: false, allowsShipSale: false, allowsDocking: false },
      { id: 'outer_route', seaId: null, blocksScheduledEvents: false, allowsShipSale: false, allowsDocking: false },
      { id: 'isolated_cove', seaId: null, blocksScheduledEvents: true, allowsShipSale: false, allowsDocking: true },
      { id: 'shipwreck_shore', seaId: null, blocksScheduledEvents: false, allowsShipSale: false, allowsDocking: true },
    ],
    traits: [
      { id: 'audacious', nameKey: traitNameKey('audacious'), descriptionKey: traitDescriptionKey('audacious'), oppositeTraitId: 'cautious' },
      { id: 'cautious', nameKey: traitNameKey('cautious'), descriptionKey: traitDescriptionKey('cautious'), oppositeTraitId: 'audacious' },
      { id: 'resilient', nameKey: traitNameKey('resilient'), descriptionKey: traitDescriptionKey('resilient') },
    ],
    items: [
      { id: 'sealed_chart', nameKey: itemNameKey('sealed_chart') },
      { id: 'mira_letter_of_passage', nameKey: itemNameKey('mira_letter_of_passage') },
    ],
    ships: [
      { id: 'starter_sloop', nameKey: 'ship.starter_sloop.name', maxHealth: 30, crewCapacity: 3, cargoSlots: 2 },
      { id: 'trade_cog', nameKey: 'ship.trade_cog.name', maxHealth: 45, crewCapacity: 5, cargoSlots: 6 },
    ],
    crewRoles: [
      { id: 'navigator', nameKey: crewRoleNameKey('navigator') },
      { id: 'medic', nameKey: crewRoleNameKey('medic') },
    ],
    npcs: [{
      id: 'mira', nameKey: npcNameKey('mira'), raceId: null, originSeaId: null, affiliationId: null, crewRoleId: 'navigator',
      initialStats: { health: 25, morale: 25, strength: 25, observation: 25, intelligence: 25, luck: 25, loyalty: 25, calm: 25 },
    }],
    events,
  };
}
