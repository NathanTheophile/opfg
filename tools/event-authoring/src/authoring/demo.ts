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
    id: 'black_squall_demo', ...eventKeys('black_squall_demo'), kind: 'normal', eligibility: { type: 'isAtSea' }, choices: [{ id: 'navigate', textKey: choiceKey('black_squall_demo','navigate'), resolution: { type: 'dice', statId: 'navigation', successThreshold: 13, modifiers: [{ condition: { type: 'shipHealthAtMost', value: 25 }, value: -2, displayLabelKey: modifierLabelKey('black_squall_demo','navigate',0) }], outcomes: {
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
    familyStructures: [{ id: 'two_parents', nameKey: 'familyStructure.two_parents.name', attributeModifiers: { morale: 2 } }],
    socialClasses: [{ id: 'modest', nameKey: 'socialClass.modest.name', attributeModifiers: {} }],
    locations: [{ id: 'starter_port', seaId: 'starter_sea', blocksScheduledEvents: false, allowsShipSale: true, allowsDocking: true }, { id: 'east_blue_port', seaId: 'starter_sea', blocksScheduledEvents: false, allowsShipSale: true, allowsDocking: true }, { id: 'west_blue_port', seaId: 'starter_sea', blocksScheduledEvents: false, allowsShipSale: true, allowsDocking: true }, { id: 'north_blue_port', seaId: 'starter_sea', blocksScheduledEvents: false, allowsShipSale: true, allowsDocking: true }, { id: 'south_blue_port', seaId: 'starter_sea', blocksScheduledEvents: false, allowsShipSale: true, allowsDocking: true }, { id: 'open_sea', seaId: null, blocksScheduledEvents: false, allowsShipSale: false, allowsDocking: false }, { id: 'isolated_cove', seaId: null, blocksScheduledEvents: true, allowsShipSale: false, allowsDocking: true }],
    traits: [{ id: 'audacious', nameKey: traitNameKey('audacious'), descriptionKey: traitDescriptionKey('audacious'), oppositeTraitId: 'cautious' }, { id: 'cautious', nameKey: traitNameKey('cautious'), descriptionKey: traitDescriptionKey('cautious'), oppositeTraitId: 'audacious' }],
    devilFruits: [],
    items: [{ id: 'sealed_chart', nameKey: itemNameKey('sealed_chart') }], ships: [{ id: 'starter_sloop', nameKey: shipNameKey('starter_sloop'), maxHealth: 30, crewCapacity: 3, cargoSlots: 2 }], crewRoles: [{ id: 'navigator', nameKey: crewRoleNameKey('navigator') }], npcs: [{ id: 'mira', nameKey: npcNameKey('mira'), raceId: null, originSeaId: null, affiliationId: null, crewRoleId: 'navigator', initialStats: { health: 25, morale: 25, strength: 25, observation: 25, intelligence: 25, luck: 25, loyalty: 25, calm: 25 } }],
    flags: [{ id: 'storm_mastered' }],
  };
  const localization: AuthoringProject['localization'] = {};
  const text: Record<string,string> = {
    [departure.titleKey]: 'Le grand départ', [departure.textKey]: 'Le port s’éloigne derrière vous.', [departure.choices[0].textKey]: 'Prendre la mer', [departure.choices[0].resolution.type === 'deterministic' ? departure.choices[0].resolution.outcome.textKey : '']: 'Vous larguez les amarres.',
    [squall.titleKey]: 'Grain noir', [squall.textKey]: 'Le ciel se ferme.', [squall.choices[0].textKey]: 'Lire les courants', [modifierLabelKey('black_squall_demo','navigate',0)]: 'Navire endommagé',
    [scheduled.titleKey]: 'Un souvenir revient', [scheduled.textKey]: 'Une vieille promesse refait surface.', [scheduled.choices[0].textKey]: 'Se souvenir',
    [critical.titleKey]: 'La fin de Mira', [critical.textKey]: 'Mira ne répond plus.', [critical.choices[0].textKey]: 'Faire ses adieux',
    [raceNameKey('human')]: 'Humain', [seaNameKey('starter_sea')]: 'Mer de départ', [affiliationNameKey('independent_family')]: 'Famille indépendante', 'familyStructure.two_parents.name': 'Deux parents', 'socialClass.modest.name': 'Modeste', [traitNameKey('audacious')]: 'Audacieux', [traitDescriptionKey('audacious')]: 'Prend des risques.', [traitNameKey('cautious')]: 'Prudent', [traitDescriptionKey('cautious')]: 'Évite les risques.', [itemNameKey('sealed_chart')]: 'Carte scellée', [shipNameKey('starter_sloop')]: 'Sloop de départ', [crewRoleNameKey('navigator')]: 'Navigateur', [npcNameKey('mira')]: 'Mira',
  };
  for (const event of events) for (const key of [event.titleKey,event.textKey,...event.choices.flatMap((choice) => [choice.textKey, ...(choice.resolution.type === 'deterministic' ? [choice.resolution.outcome.textKey] : [...(choice.resolution.modifiers ?? []).map((m) => m.displayLabelKey), ...Object.values(choice.resolution.outcomes).map((o) => o.textKey)])])]) localization[key] = createEntry(key, text[key] ?? 'Texte de démonstration');
  for (const [key, value] of Object.entries(text)) if (!localization[key]) localization[key] = createEntry(key, value);
  const now = new Date().toISOString();
  return { authoringVersion: 7, gameSchemaVersion: CONTENT_SCHEMA_VERSION, name: 'OPFG Events Demo', sourceLocale: 'fr', supportedLocales: ['fr','en'], events, nodes: [
    { eventId: departure.id, position: { x: 80, y: 100 }, notes: '', status: 'draft', contentFolder: 'active' },
    { eventId: squall.id, position: { x: 310, y: 100 }, notes: '', status: 'draft', contentFolder: 'active' },
    { eventId: scheduled.id, position: { x: 540, y: 100 }, notes: '', status: 'draft', contentFolder: 'scheduled' },
    { eventId: critical.id, position: { x: 770, y: 100 }, notes: '', status: 'draft', contentFolder: 'critical' },
  ], edges: [], registries, localization, metadata: { createdAt: now, updatedAt: now } };
};
