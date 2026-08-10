import { CONTENT_SCHEMA_VERSION, type EventDefinition, type GameRegistries } from '../gameSchema/current/contract';
import { eventKeys, outcomeKey, choiceKey, raceNameKey, seaNameKey, affiliationNameKey, traitNameKey, traitDescriptionKey, itemNameKey, shipNameKey, crewRoleNameKey, npcNameKey, modifierLabelKey } from '../localization/keys';
import { createEntry } from '../localization/store';
import type { AuthoringProject } from './types';

export const createDemoProject = (): AuthoringProject => {
  const departure: EventDefinition = {
    id: 'departure', ...eventKeys('departure'), kind: 'normal',
    eligibility: { type: 'all', conditions: [{ type: 'careerPhaseIs', phase: 'active' }, { type: 'locationIs', locationId: 'starter_port' }] },
    choices: [{ id: 'set_sail', textKey: choiceKey('departure', 'set_sail'), resolution: { type: 'deterministic', outcome: { id: 'departed', textKey: outcomeKey('departure', 'set_sail', 'departed'), effects: [{ type: 'moveToLocation', locationId: 'open_sea', travelState: 'at_sea' }] } } }],
  };
  const squall: EventDefinition = {
    id: 'black_squall_demo', ...eventKeys('black_squall_demo'), kind: 'normal', eligibility: { type: 'all', conditions: [{ type: 'isAtSea' }, { type: 'hasShip' }] }, choices: [{ id: 'navigate', textKey: choiceKey('black_squall_demo','navigate'), resolution: { type: 'dice', statId: 'navigation', successThreshold: 13, modifiers: [{ condition: { type: 'shipHealthAtMost', value: 25 }, value: -2, displayLabelKey: modifierLabelKey('black_squall_demo','navigate',0) }], outcomes: {
      criticalFailure: { id: 'cf', textKey: outcomeKey('black_squall_demo','navigate','cf'), effects: [{ type: 'modifyShipHealth', amount: -10 }] },
      failure: { id: 'f', textKey: outcomeKey('black_squall_demo','navigate','f'), effects: [{ type: 'modifyShipHealth', amount: -5 }] },
      success: { id: 's', textKey: outcomeKey('black_squall_demo','navigate','s'), effects: [] },
      criticalSuccess: { id: 'cs', textKey: outcomeKey('black_squall_demo','navigate','cs'), effects: [{ type: 'setFlag', flagId: 'storm_mastered' }] },
    } } }],
  };
  const scheduled: EventDefinition = { id: 'memory_returns', ...eventKeys('memory_returns'), kind: 'scheduled', priority: 100, scheduledReach: 'normal', choices: [{ id: 'remember', textKey: choiceKey('memory_returns','remember'), resolution: { type: 'deterministic', outcome: { id: 'remembered', textKey: outcomeKey('memory_returns','remember','remembered'), effects: [] } } }] };
  const critical: EventDefinition = { id: 'critical_mira_death', ...eventKeys('critical_mira_death'), kind: 'critical', trigger: { type: 'npcHealthDepleted', npcId: 'mira' }, choices: [{ id: 'mourn', textKey: choiceKey('critical_mira_death','mourn'), resolution: { type: 'deterministic', outcome: { id: 'mira_dead', textKey: outcomeKey('critical_mira_death','mourn','mira_dead'), effects: [{ type: 'setNpcStatus', npcId: 'mira', status: 'dead' }] } } }] };
  const events = [departure, squall, scheduled, critical];
  const registries: GameRegistries = {
    races: [{ id: 'human', nameKey: raceNameKey('human'), initialHealth: 35, attributeModifiers: { observation: 1 } }], seas: [{ id: 'starter_sea', nameKey: seaNameKey('starter_sea') }], affiliations: [{ id: 'independent_family', nameKey: affiliationNameKey('independent_family') }],
    careerAffiliations: [{ id: 'civilian', nameKey: 'careerAffiliation.civilian.name' }], careerRanks: [], careerTitles: [], endings: [],
    familyStructures: [{ id: 'two_parents', nameKey: 'familyStructure.two_parents.name', attributeModifiers: { morale: 2 } }],
    socialClasses: [{ id: 'modest', nameKey: 'socialClass.modest.name', attributeModifiers: {} }],
    locations: ['starter_port', 'open_sea', 'isolated_cove'].map((id) => ({ id, nameKey: `location.${id}.name`, seaId: 'starter_sea', islandId: id, type: 'port' as const, parentLocationId: null, canBeBirthLocation: id === 'starter_port', blocksScheduledEvents: id === 'isolated_cove', allowsDocking: id !== 'open_sea', shipMarket: id === 'starter_port' ? 'full' as const : 'none' as const, services: [], tags: [] })),
    traits: [{ id: 'audacious', nameKey: traitNameKey('audacious'), descriptionKey: traitDescriptionKey('audacious'), oppositeTraitId: 'cautious' }, { id: 'cautious', nameKey: traitNameKey('cautious'), descriptionKey: traitDescriptionKey('cautious'), oppositeTraitId: 'audacious' }],
    devilFruits: [],
    items: [{ id: 'sealed_chart', nameKey: itemNameKey('sealed_chart') }], ships: [{ id: 'sloop', nameKey: shipNameKey('sloop'), maxHealth: 30, crewCapacity: 3, cargoSlots: 2 }], crewRoles: [{ id: 'navigator', nameKey: crewRoleNameKey('navigator') }], npcs: [{ id: 'mira', nameKey: npcNameKey('mira'), raceId: null, originSeaId: null, affiliationId: null, crewRoleId: 'navigator', initialStats: { health: 25, morale: 25, strength: 25, observation: 25, intelligence: 25, luck: 25, loyalty: 25, calm: 25 } }],
    flags: [{ id: 'storm_mastered' }],
  };
  const localization: AuthoringProject['localization'] = {};
  const text: Record<string,string> = {
    [departure.titleKey]: 'Le grand dÃ©part', [departure.textKey]: 'Le port sâ€™Ã©loigne derriÃ¨re vous.', [departure.choices[0].textKey]: 'Prendre la mer', [departure.choices[0].resolution.type === 'deterministic' ? departure.choices[0].resolution.outcome.textKey : '']: 'Vous larguez les amarres.',
    [squall.titleKey]: 'Grain noir', [squall.textKey]: 'Le ciel se ferme.', [squall.choices[0].textKey]: 'Lire les courants', [modifierLabelKey('black_squall_demo','navigate',0)]: 'Navire endommagÃ©',
    [scheduled.titleKey]: 'Un souvenir revient', [scheduled.textKey]: 'Une vieille promesse refait surface.', [scheduled.choices[0].textKey]: 'Se souvenir',
    [critical.titleKey]: 'La fin de Mira', [critical.textKey]: 'Mira ne rÃ©pond plus.', [critical.choices[0].textKey]: 'Faire ses adieux',
    [raceNameKey('human')]: 'Humain', [seaNameKey('starter_sea')]: 'Mer de dÃ©part', [affiliationNameKey('independent_family')]: 'Famille indÃ©pendante', 'careerAffiliation.civilian.name': 'Civil', 'familyStructure.two_parents.name': 'Deux parents', 'socialClass.modest.name': 'Modeste', [traitNameKey('audacious')]: 'Audacieux', [traitDescriptionKey('audacious')]: 'Prend des risques.', [traitNameKey('cautious')]: 'Prudent', [traitDescriptionKey('cautious')]: 'Ã‰vite les risques.', [itemNameKey('sealed_chart')]: 'Carte scellÃ©e', [shipNameKey('sloop')]: 'Sloop', [crewRoleNameKey('navigator')]: 'Navigateur', [npcNameKey('mira')]: 'Mira',
  };
  for (const event of events) for (const key of [event.titleKey,event.textKey,...event.choices.flatMap((choice) => [choice.textKey, ...(choice.resolution.type === 'deterministic' ? [choice.resolution.outcome.textKey] : [...(choice.resolution.modifiers ?? []).map((m) => m.displayLabelKey), ...Object.values(choice.resolution.outcomes).map((o) => o.textKey)])])]) localization[key] = createEntry(key, text[key] ?? 'Texte de dÃ©monstration');
  for (const [key, value] of Object.entries(text)) if (!localization[key]) localization[key] = createEntry(key, value);
  const now = new Date().toISOString();
  return { authoringVersion: 11, gameSchemaVersion: CONTENT_SCHEMA_VERSION, name: 'OPFG Events Demo', sourceLocale: 'fr', supportedLocales: ['fr','en'], events, nodes: [
    { eventId: departure.id, position: { x: 80, y: 100 }, notes: '', status: 'draft', contentFolder: 'active' },
    { eventId: squall.id, position: { x: 310, y: 100 }, notes: '', status: 'draft', contentFolder: 'active' },
    { eventId: scheduled.id, position: { x: 540, y: 100 }, notes: '', status: 'draft', contentFolder: 'scheduled' },
    { eventId: critical.id, position: { x: 770, y: 100 }, notes: '', status: 'draft', contentFolder: 'critical' },
  ], edges: [], registries, localization, metadata: { createdAt: now, updatedAt: now } };
};
