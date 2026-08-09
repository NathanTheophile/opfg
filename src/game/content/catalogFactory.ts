import { CONTENT_SCHEMA_VERSION, type ContentCatalog, type EventDefinition } from './schema';
import { traitNameKey, traitDescriptionKey, itemNameKey, raceNameKey, seaNameKey, affiliationNameKey, crewRoleNameKey, npcNameKey } from '../localization/keys';

export function createContentCatalog(events: EventDefinition[]): ContentCatalog {
  return {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    races: [{ id: 'human', nameKey: raceNameKey('human') }],
    seas: [{ id: 'starter_sea', nameKey: seaNameKey('starter_sea') }],
    affiliations: [{ id: 'independent_family', nameKey: affiliationNameKey('independent_family') }],
    locations: [
      { id: 'starter_port', blocksScheduledEvents: false, allowsShipSale: true },
      { id: 'open_sea', blocksScheduledEvents: false, allowsShipSale: false },
      { id: 'outer_route', blocksScheduledEvents: false, allowsShipSale: false },
      { id: 'isolated_cove', blocksScheduledEvents: true, allowsShipSale: false },
      { id: 'shipwreck_shore', blocksScheduledEvents: false, allowsShipSale: false },
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
