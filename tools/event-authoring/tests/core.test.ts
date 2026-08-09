import { describe, expect, it } from 'vitest';
import { createDemoProject } from '../src/authoring/demo';
import type { AuthoringProject } from '../src/authoring/types';
import { migrateImportedProject } from '../src/gameSchema/migrations';
import { CONTENT_SCHEMA_VERSION, type ContentCatalog, type EventDefinition } from '../src/gameSchema/current/contract';
import { exportToGameCatalog, toRuntimeCatalog, toRuntimeEvent } from '../src/gameSchema/current/exporter';
import { validateContent, validateSingleEventShape } from '../src/gameSchema/current/validator';
import { createEventsArchive, importEventFiles, parseEventImportFile, readEventsBundle } from '../src/io/events';
import { exportLocaleDictionary, setLocalizedText } from '../src/localization/store';
import { readZip } from '../src/utils/zip';
import { validateProject } from '../src/validation/validateProject';
import repositoryDeparture from '../../../src/game/content/events/active/departure.json';

const clone = <T>(value: T): T => structuredClone(value);
const eventJson = (event: EventDefinition) => JSON.stringify(event);
const emptyWorkspace = (): AuthoringProject => {
  const project = createDemoProject();
  project.events = [];
  project.nodes = [];
  project.edges = [];
  project.localization = {};
  return project;
};

const exhaustiveEvent = (project: AuthoringProject): EventDefinition => {
  const event = clone(project.events.find((value) => value.id === 'departure')!);
  if (event.kind !== 'normal' || event.choices[0].resolution.type !== 'deterministic') throw new Error('Unexpected demo fixture.');
  event.id = 'contract_exhaustive';
  event.titleKey = 'event.contract_exhaustive.title';
  event.textKey = 'event.contract_exhaustive.text';
  event.eligibility = { type: 'all', conditions: [
    { type: 'hasTrait', traitId: 'audacious' }, { type: 'statAtLeast', statId: 'strength', value: 20 },
    { type: 'hasFlag', flagId: 'storm_mastered' }, { type: 'hasItem', itemId: 'sealed_chart' },
    { type: 'locationIs', locationId: 'starter_port' }, { type: 'isAtSea' }, { type: 'isOnLand' },
    { type: 'careerPhaseIs', phase: 'active' }, { type: 'ageAtLeastMonths', value: 12 }, { type: 'ageAtMostMonths', value: 180 },
    { type: 'berriesAtLeast', value: 0 }, { type: 'hasCrew' }, { type: 'crewSizeAtLeast', value: 1 }, { type: 'hasCrewRole', roleId: 'navigator' }, { type: 'canRecruitNpc', npcId: 'mira' }, { type: 'isLeader' }, { type: 'hasShip' }, { type: 'shipIs', shipId: 'starter_sloop' }, { type: 'shipHealthAtLeast', value: 1 }, { type: 'shipHealthAtMost', value: 50 },
    { type: 'shipCrewCapacityAtLeast', value: 1 }, { type: 'shipCargoSpaceAtLeast', value: 1 }, { type: 'canAcquireShip', shipId: 'starter_sloop' }, { type: 'canSellShip' },
    { type: 'npcStatusIs', npcId: 'mira', status: 'dead' }, { type: 'npcRelationshipAtLeast', npcId: 'mira', value: -20 },
    { type: 'npcStatAtLeast', npcId: 'mira', statId: 'loyalty', value: 20 },
    { type: 'hasChosen', eventId: 'departure', choiceId: 'set_sail' }, { type: 'hasPlayed', eventId: 'departure' },
    { type: 'hasOutcome', eventId: 'departure', outcomeId: 'departed' }, { type: 'raceIs', raceId: 'human' },
    { type: 'originSeaIs', seaId: 'starter_sea' }, { type: 'affiliationIs', affiliationId: 'independent_family' },
    { type: 'familyStructureIs', familyStructureId: 'two_parents' }, { type: 'socialClassIs', socialClassId: 'modest' },
  ] };
  event.choices[0].id = 'resolve';
  event.choices[0].textKey = 'event.contract_exhaustive.choice.resolve.text';
  event.choices[0].resolution.outcome = { id: 'resolved', textKey: 'event.contract_exhaustive.choice.resolve.outcome.resolved.text', effects: [
    { type: 'setFlag', flagId: 'storm_mastered' }, { type: 'clearFlag', flagId: 'storm_mastered' },
    { type: 'addItem', itemId: 'sealed_chart', quantity: 1 }, { type: 'removeItem', itemId: 'sealed_chart', quantity: 1 },
    { type: 'addTrait', traitId: 'audacious' }, { type: 'removeTrait', traitId: 'cautious' },
    { type: 'modifyStat', statId: 'morale', amount: 1 }, { type: 'modifyHealth', amount: 10 }, { type: 'acquireShip', shipId: 'starter_sloop', name: 'Tool Ship', health: 20 }, { type: 'modifyShipHealth', amount: -1 },
    { type: 'addCargoItem', itemId: 'sealed_chart', quantity: 2 }, { type: 'removeCargoItem', itemId: 'sealed_chart', quantity: 1 },
    { type: 'resolveShipReplacement', disposition: 'sell', berries: 10 }, { type: 'modifyBerries', amount: 5 },
    { type: 'loseShip', locationId: 'starter_port', travelState: 'on_land' }, { type: 'moveToLocation', locationId: 'open_sea', travelState: 'at_sea' },
    { type: 'setNpcStatus', npcId: 'mira', status: 'dead' }, { type: 'setNpcPassenger', npcId: 'mira', passenger: true, allowWithoutLeadership: true }, { type: 'setLeadership', isLeader: false }, { type: 'modifyNpcRelationship', npcId: 'mira', amount: 1 },
    { type: 'modifyNpcStat', npcId: 'mira', statId: 'calm', amount: 1 }, { type: 'scheduleEvent', eventId: 'memory_returns', delayMonths: 6 },
    { type: 'setCareerPhase', phase: 'active' }, { type: 'setRace', raceId: 'human' }, { type: 'setOriginSea', seaId: 'starter_sea' },
    { type: 'setAffiliation', affiliationId: 'independent_family' }, { type: 'setFamilyStructure', familyStructureId: 'two_parents' }, { type: 'setSocialClass', socialClassId: 'modest' }, { type: 'setBirthLocation', locationId: 'starter_port' }, { type: 'endCareer', reason: 'legacy' },
  ] };
  return event;
};

describe('Content Schema v3', () => {
  it('uses schema v2 and accepts Normal, Scheduled, Critical, current NPC/location/trait contracts', () => {
    const project = createDemoProject();
    const catalog = toRuntimeCatalog(project);
    expect(CONTENT_SCHEMA_VERSION).toBe(3);
    expect(catalog.events.map((event) => event.kind)).toEqual(expect.arrayContaining(['normal', 'scheduled', 'critical']));
    expect(catalog.npcs[0].initialStats).toHaveProperty('calm', 25);
    expect(catalog.events.find((event) => event.kind === 'critical')).toMatchObject({ trigger: { type: 'npcHealthDepleted', npcId: 'mira' } });
    expect(catalog.locations.find((location) => location.id === 'isolated_cove')).toMatchObject({ blocksScheduledEvents: true });
    expect(catalog.traits[0]).toHaveProperty('oppositeTraitId');
    expect(validateContent(catalog)).toEqual([]);
  });

  it('accepts every current Condition and Effect family', () => {
    const project = createDemoProject();
    const event = exhaustiveEvent(project);
    const immediate = clone(project.events.find((value) => value.kind === 'normal')!);
    Object.assign(immediate, { id: 'immediate_followup', kind: 'immediate', titleKey: 'event.immediate_followup.title', textKey: 'event.immediate_followup.text' });
    if (event.kind !== 'normal' || event.choices[0].resolution.type !== 'deterministic') throw new Error('Unexpected exhaustive fixture.');
    event.choices[0].resolution.outcome.effects.push({ type: 'queueImmediateEvent', eventId: 'immediate_followup' });
    const catalog = toRuntimeCatalog(project);
    catalog.events.push(event, immediate);
    expect(validateContent(catalog)).toEqual([]);
  });

  it('rejects monthAtLeast, Outcome.advanceMonths and invalid Normal priority', () => {
    const event = clone(createDemoProject().events[0]) as unknown as Record<string, any>;
    event.eligibility = { type: 'monthAtLeast', value: 1 };
    event.priority = 100;
    event.choices[0].resolution.outcome.advanceMonths = 1;
    const messages = validateSingleEventShape(event).map((issue) => issue.message).join('\n');
    expect(messages).toContain('Unknown Condition type "monthAtLeast"');
    expect(messages).toContain('Outcome.advanceMonths is not supported');
    expect(messages).toContain('Invalid Event kind field combination');
  });

  it('validates Dice v2, including modifier label and exactly four outcomes', () => {
    const project = createDemoProject();
    const dice = clone(project.events.find((event) => event.id === 'black_squall_demo')!) as any;
    expect(validateSingleEventShape(dice)).toEqual([]);
    delete dice.choices[0].resolution.modifiers[0].displayLabelKey;
    dice.choices[0].resolution.outcomes.partialSuccess = dice.choices[0].resolution.outcomes.success;
    const messages = validateSingleEventShape(dice).map((issue) => issue.message).join('\n');
    expect(messages).toContain('ConditionalDiceModifier requires displayLabelKey');
    expect(messages).toContain('Unknown DiceResult "partialSuccess"');
  });

  it('rejects duplicate Event IDs in a ContentCatalog', () => {
    const catalog = toRuntimeCatalog(createDemoProject());
    catalog.events.push(clone(catalog.events[0]));
    expect(validateContent(catalog).some((issue) => issue.message.includes('Duplicate ID "departure"'))).toBe(true);
  });
});

describe('Event import/export', () => {
  it('round-trips a real repository Event through the Tool and canonical validator', () => {
    const workspace = emptyWorkspace();
    const imported = importEventFiles(workspace, [{
      name: 'departure.json',
      path: 'events/active/departure.json',
      text: JSON.stringify(repositoryDeparture),
    }]);
    expect(imported.report.rejected).toEqual([]);
    expect(imported.project.events).toHaveLength(1);
    const exported = toRuntimeEvent(imported.project.events[0]);
    expect(exported).toEqual(repositoryDeparture);
    expect(validateContent(toRuntimeCatalog(imported.project))).toEqual([]);
  });

  it('imports one repository-style Event JSON and preserves the physical folder metadata', () => {
    const source = createDemoProject().events[0];
    const parsed = parseEventImportFile({ name: `${source.id}.json`, path: `events/active/${source.id}.json`, text: eventJson(source) });
    expect(parsed.errors).toEqual([]);
    expect(parsed.event).toEqual(source);
    expect(parsed.folder).toBe('active');
  });

  it('imports and exports Immediate Events in their dedicated folder', async () => {
    const immediate = { ...clone(createDemoProject().events[0]), id: 'followup', kind: 'immediate' as const };
    const imported = importEventFiles(emptyWorkspace(), [{ name: 'followup.json', path: 'events/immediate/followup.json', text: eventJson(immediate) }]);
    expect(imported.report.rejected).toEqual([]);
    expect(imported.project.nodes[0].contentFolder).toBe('immediate');
    const zip = await readZip(createEventsArchive(imported.project, { bundle: false, includeLocales: false }));
    expect([...zip.keys()]).toContain('events/immediate/followup.json');
  });

  it('imports multiple valid Events without aborting on one invalid file', () => {
    const source = createDemoProject();
    const normal = clone(source.events[0]); normal.id = 'batch_normal'; normal.titleKey = 'event.batch_normal.title'; normal.textKey = 'event.batch_normal.text';
    const scheduled = clone(source.events.find((event) => event.kind === 'scheduled')!); scheduled.id = 'batch_scheduled'; scheduled.titleKey = 'event.batch_scheduled.title'; scheduled.textKey = 'event.batch_scheduled.text';
    const result = importEventFiles(emptyWorkspace(), [
      { name: 'batch_normal.json', path: 'events/active/batch_normal.json', text: eventJson(normal) },
      { name: 'broken.json', path: 'events/active/broken.json', text: '{ nope' },
      { name: 'batch_scheduled.json', path: 'events/scheduled/batch_scheduled.json', text: eventJson(scheduled) },
    ]);
    expect(result.report.imported).toBe(2);
    expect(result.report.rejected).toHaveLength(1);
    expect(result.project.nodes.find((node) => node.eventId === 'batch_scheduled')?.contentFolder).toBe('scheduled');
  });

  it('rejects duplicate Event IDs in a batch and against the workspace', () => {
    const source = clone(createDemoProject().events[0]); source.id = 'duplicate'; source.titleKey = 'event.duplicate.title'; source.textKey = 'event.duplicate.text';
    const workspace = emptyWorkspace();
    const first = importEventFiles(workspace, [
      { name: 'duplicate.json', text: eventJson(source) },
      { name: 'duplicate.json', text: eventJson(source) },
    ]);
    expect(first.report.imported).toBe(1);
    expect(first.report.rejected[0].message).toContain('Duplicate EventId');
    const second = importEventFiles(first.project, [{ name: 'duplicate.json', text: eventJson(source) }]);
    expect(second.report.imported).toBe(0);
    expect(second.report.rejected[0].message).toContain('already exists');
  });

  it('exports one runtime Event without authoring metadata', () => {
    const project = createDemoProject(); const event = toRuntimeEvent(project.events[0]) as unknown as Record<string, unknown>;
    expect(event).not.toHaveProperty('contentFolder');
    expect(event).not.toHaveProperty('notes');
    expect(event).not.toHaveProperty('status');
    expect(event).toHaveProperty('kind', 'normal');
  });

  it('exports all Events under events/<contentFolder>/<EventId>.json', async () => {
    const project = createDemoProject();
    const zip = await readZip(createEventsArchive(project, { bundle: false, includeLocales: false }));
    expect([...zip.keys()]).toEqual(expect.arrayContaining([
      'events/active/departure.json',
      'events/scheduled/memory_returns.json',
      'events/critical/critical_mira_death.json',
    ]));
    expect([...zip.keys()].some((path) => path.startsWith('locales/'))).toBe(false);
  });

  it('round-trips an OPFG bundle with manifest, Events and localization dictionaries', async () => {
    const project = createDemoProject();
    const bundle = createEventsArchive(project, { bundle: true, includeLocales: true });
    const read = await readEventsBundle(bundle);
    expect(read.manifest).toMatchObject({ format: 'opfg-events-bundle', version: 1, schemaVersion: 3, eventCount: project.events.length });
    expect(read.eventFiles).toHaveLength(project.events.length);
    expect(read.dictionaries.fr['event.departure.title']).toBe(exportLocaleDictionary(project.localization, 'fr')['event.departure.title']);
    const imported = importEventFiles(emptyWorkspace(), read.eventFiles);
    expect(imported.report.imported).toBe(project.events.length);
  });

  it('round-trips Unicode localization through bundle export and import', async () => {
    const expected = 'Équipage d’élite — l’île n’était déjà plus visible.';
    const project = createDemoProject();
    project.localization = setLocalizedText(project.localization, 'event.departure.title', 'fr', expected);

    const first = await readEventsBundle(createEventsArchive(project, { bundle: true, includeLocales: true }));
    expect(first.dictionaries.fr['event.departure.title']).toBe(expected);

    const imported = importEventFiles(emptyWorkspace(), first.eventFiles);
    const withLocales = { ...imported.project, localization: project.localization };
    const second = await readEventsBundle(createEventsArchive(withLocales, { bundle: true, includeLocales: true }));
    expect(second.dictionaries.fr['event.departure.title']).toBe(expected);
  });
});

describe('v0.3 project migration and validation', () => {
  it('migrates safe fields, removes obsolete concepts, and marks ambiguous changes for review', () => {
    const legacy = {
      authoringVersion: 3,
      gameSchemaVersion: 1,
      name: 'Legacy v0.3', sourceLocale: 'fr', supportedLocales: ['fr'],
      events: [{
        id: 'legacy_event', titleKey: 'event.legacy_event.title', textKey: 'event.legacy_event.text', priority: 200,
        eligibility: { type: 'monthAtLeast', months: 3 },
        choices: [{ id: 'go', textKey: 'event.legacy_event.choice.go.text', resolution: { type: 'deterministic', outcome: { id: 'done', textKey: 'event.legacy_event.choice.go.outcome.done.text', advanceMonths: 6, effects: [] } } }],
      }],
      nodes: [{ eventId: 'legacy_event', position: { x: 0, y: 0 }, notes: '', status: 'draft' }], edges: [],
      registries: { races: [], seas: [], affiliations: [], traits: [], items: [], npcs: [], locations: [{ id: 'legacy_port' }], flags: [] },
      localization: {}, metadata: { createdAt: '2026-08-08T00:00:00Z', updatedAt: '2026-08-08T00:00:00Z' },
    };
    const result = migrateImportedProject(legacy);
    const event = result.project.events[0] as any;
    expect(result.project.authoringVersion).toBe(9);
    expect(result.project.registries.ships).toEqual([]);
    expect(result.project.registries.crewRoles).toEqual([]);
    expect(result.project.registries.locations[0]).toHaveProperty('allowsShipSale', false);
    expect(result.project.gameSchemaVersion).toBe(3);
    expect(event.kind).toBe('normal');
    expect(event.eligibility).toBeUndefined();
    expect(event.priority).toBeUndefined();
    expect(event.choices[0].resolution.outcome.advanceMonths).toBeUndefined();
    expect(result.project.nodes[0].status).toBe('needsReview');
    expect(result.warnings.join('\n')).toContain('monthAtLeast');
    expect(result.warnings.join('\n')).toContain('advanceMonths');
    expect(result.project.registries.locations[0].blocksScheduledEvents).toBe(false);
  });

  it('keeps flags authoring-only and exports a schema-v3 ContentCatalog', () => {
    const project = createDemoProject();
    const result = exportToGameCatalog(project);
    expect(result.catalog?.schemaVersion).toBe(3);
    expect(result.catalog).not.toHaveProperty('flags');
    expect(result.catalog).not.toHaveProperty('nodes');
    expect(result.locales?.fr['event.departure.title']).toBeTruthy();
  });

  it('validates a complete authoring workspace against runtime + authoring rules', () => {
    const result = validateProject(createDemoProject());
    expect(result.issues.filter((issue) => issue.severity === 'error')).toEqual([]);
  });

  it('validates a compact ContentCatalog v2 directly', () => {
    const catalog: ContentCatalog = toRuntimeCatalog(createDemoProject());
    expect(validateContent(catalog)).toEqual([]);
  });
});
