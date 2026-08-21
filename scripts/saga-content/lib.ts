import { isDeepStrictEqual } from 'node:util';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { loadNodeContentCatalog } from '../../src/game/content/nodeContentCatalog';
import { validateContent } from '../../src/game/validation/validateContent';
import { createInitialGameState } from '../../src/game/model/initialState';
import { createDefaultNpcState } from '../../src/game/model/npcState';
import { selectNextEvent } from '../../src/game/engine/events';
import type { EventDefinition } from '../../src/game/content/schema';
import type { GameState, NpcStatus } from '../../src/game/model/schema';

export const SAGA_AUTHORING_FORMAT_VERSION = 1;

export interface LocalizedCopy {
  fr: string;
  en: string;
}

export interface SagaScenarioHistoryEntry {
  eventId: string;
  choiceId: string;
  outcomeId: string;
  ageMonths?: number;
}

export interface SagaScenario {
  id: string;

  // Canonical V1 shape.
  expectedEventId?: string;
  ageMonths?: number;
  raceId?: string;
  familyStructureId?: string;
  socialClassId?: string;
  profileAffiliationId?: string;
  careerAffiliationId?: string;
  npcStatuses?: Record<string, NpcStatus>;

  // Compact worker-output compatibility shape.
  expectNodeId?: string;
  given?: Array<Record<string, unknown>>;

  history: SagaScenarioHistoryEntry[];
}

export interface SagaAuthoringRules {
  enforceScenarioCoverage?: boolean;
  requireMiniArcForSpecializedRoots?: boolean;
  requireTerminalPersistentReward?: boolean;
  persistentRewardEffectTypes?: string[];
}

export interface SagaAuthoringSource {
  formatVersion: 1;
  sagaId: string;
  trackId: string;
  eventIdPrefix: string;
  runtimeDirectory: string;
  chapters: string[];
  rules: SagaAuthoringRules;
  events: AuthoringEvent[];
  scenarios: SagaScenario[];
  extraLocalization?: {
    fr?: Record<string, string>;
    en?: Record<string, string>;
  };
  notes?: string[];
}

export interface AuthoringEvent extends Record<string, unknown> {
  id: string;
  kind: string;
  title: LocalizedCopy;
  text: LocalizedCopy;
  titleKeyOverride?: string;
  textKeyOverride?: string;
  choices: AuthoringChoice[];
}

export interface AuthoringChoice extends Record<string, unknown> {
  id: string;
  text: LocalizedCopy;
  textKeyOverride?: string;
  resolution: AuthoringResolution;
}

export type AuthoringResolution =
  | {
      type: 'deterministic';
      outcome: AuthoringOutcome;
    }
  | {
      type: 'dice';
      statId: string;
      successThreshold: number;
      modifiers?: unknown[];
      traitOverrides?: unknown[];
      actor?: unknown;
      outcomes: Record<string, AuthoringOutcome>;
    };

export interface AuthoringOutcome extends Record<string, unknown> {
  id: string;
  text: LocalizedCopy;
  textKeyOverride?: string;
  effects: Array<Record<string, unknown>>;
}

export interface SagaCheckResult {
  errors: string[];
  warnings: string[];
}

export interface CompiledSaga {
  events: EventDefinition[];
  locales: {
    fr: Record<string, string>;
    en: Record<string, string>;
  };
  eventFilePaths: string[];
  managedLocaleKeys: string[];
}

interface SagaGeneratedManifest {
  formatVersion: 1;
  sagaId: string;
  eventFiles: string[];
  localeKeys: string[];
}

const DEFAULT_REWARD_EFFECT_TYPES = [
  'addItem',
  'addTrait',
  'modifyBerries',
  'modifyReputation',
  'setFlag',
  'setNpcStatus',
  'setCareerAffiliation',
  'setCareerRank',
  'setCareerTitle',
  'acquireShip',
  'setNpcDevilFruit',
  'awakenHaki',
  'raiseConquerorHakiTo',
];

export function sourcePath(rootDirectory: string, sagaId: string): string {
  return join(rootDirectory, 'content-authoring', 'sagas', `${sagaId}.authoring.json`);
}

export function generatedManifestPath(rootDirectory: string, sagaId: string): string {
  return join(rootDirectory, 'content-authoring', '.generated', `${sagaId}.manifest.json`);
}

export function listSagaSources(rootDirectory = process.cwd()): SagaAuthoringSource[] {
  const directory = join(rootDirectory, 'content-authoring', 'sagas');
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((name) => name.endsWith('.authoring.json'))
    .sort()
    .map((name) => readJson(join(directory, name)) as SagaAuthoringSource);
}

export function loadSagaSource(rootDirectory: string, sagaId: string): SagaAuthoringSource {
  const path = sourcePath(rootDirectory, sagaId);
  if (!existsSync(path)) {
    throw new Error(`Saga authoring source not found: ${relative(rootDirectory, path)}`);
  }
  return readJson(path) as SagaAuthoringSource;
}

export function importSagaFromRuntime(rootDirectory: string, sagaId: string): SagaAuthoringSource {
  const catalog = loadNodeContentCatalog(rootDirectory);
  const track = catalog.majorNarrativeTracks.find(({ id }) => id === sagaId);
  if (!track) throw new Error(`Unknown Major Narrative Track "${sagaId}".`);

  const runtimeDirectory = join('src', 'game', 'content', 'events', 'v2', 'major-tracks', sagaId);
  const absoluteRuntimeDirectory = join(rootDirectory, runtimeDirectory);
  if (!existsSync(absoluteRuntimeDirectory)) {
    throw new Error(`Runtime Saga directory does not exist: ${runtimeDirectory}`);
  }

  const dictionaries = readLocaleDictionaries(rootDirectory);
  const eventPaths = findJsonFiles(absoluteRuntimeDirectory);
  const runtimeEvents = eventPaths
    .map((path) => readJson(path) as EventDefinition)
    .sort((left, right) => left.id.localeCompare(right.id));

  if (runtimeEvents.length === 0) throw new Error(`No runtime Events found for "${sagaId}".`);

  const eventIdPrefix = commonEventPrefix(runtimeEvents.map(({ id }) => id), sagaId);
  const events = runtimeEvents.map((event) => toAuthoringEvent(event, dictionaries));

  return {
    formatVersion: SAGA_AUTHORING_FORMAT_VERSION,
    sagaId,
    trackId: sagaId,
    eventIdPrefix,
    runtimeDirectory: runtimeDirectory.replaceAll('\\', '/'),
    chapters: track.chapters.map(({ id }) => id),
    rules: {
      enforceScenarioCoverage: false,
      requireMiniArcForSpecializedRoots: true,
      requireTerminalPersistentReward: true,
      persistentRewardEffectTypes: [...DEFAULT_REWARD_EFFECT_TYPES],
    },
    events,
    scenarios: [],
    notes: [
      'Imported losslessly from current runtime Events.',
      'Add route scenarios, then set rules.enforceScenarioCoverage=true before using this file as production authoring authority.',
    ],
  };
}

export function writeImportedSaga(rootDirectory: string, source: SagaAuthoringSource): void {
  const path = sourcePath(rootDirectory, source.sagaId);
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path)) {
    throw new Error(`Refusing to overwrite existing authoring source: ${relative(rootDirectory, path)}`);
  }
  writeJson(path, source);

  const compiled = compileSaga(source);
  const manifest: SagaGeneratedManifest = {
    formatVersion: 1,
    sagaId: source.sagaId,
    eventFiles: compiled.eventFilePaths,
    localeKeys: compiled.managedLocaleKeys,
  };
  const manifestPath = generatedManifestPath(rootDirectory, source.sagaId);
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeJson(manifestPath, manifest);
}

export function compileSaga(source: SagaAuthoringSource): CompiledSaga {
  const locales = {
    fr: { ...(source.extraLocalization?.fr ?? {}) },
    en: { ...(source.extraLocalization?.en ?? {}) },
  };

  const events = source.events.map((event) => fromAuthoringEvent(event, locales));
  const eventFilePaths = events.map(({ id }) =>
    join(source.runtimeDirectory, `${id}.json`).replaceAll('\\', '/')
  );
  const managedLocaleKeys = [...new Set([
    ...Object.keys(locales.fr),
    ...Object.keys(locales.en),
  ])].sort();

  return { events, locales, eventFilePaths, managedLocaleKeys };
}

export function writeCompiledSaga(rootDirectory: string, source: SagaAuthoringSource): void {
  const check = validateSagaAuthoring(source);
  if (check.errors.length > 0) {
    throw new Error(formatProblems('Saga authoring validation failed', check));
  }

  const compiled = compileSaga(source);
  const oldManifest = readGeneratedManifest(rootDirectory, source.sagaId);

  if (oldManifest) {
    for (const file of oldManifest.eventFiles) {
      const absolute = join(rootDirectory, file);
      if (existsSync(absolute)) rmSync(absolute);
    }
  }

  for (const [index, event] of compiled.events.entries()) {
    const file = join(rootDirectory, compiled.eventFilePaths[index]);
    mkdirSync(dirname(file), { recursive: true });
    writeJson(file, event);
  }

  updateManagedLocale(
    join(rootDirectory, 'src', 'game', 'localization', 'locales', 'fr.json'),
    oldManifest?.localeKeys ?? [],
    compiled.locales.fr,
  );
  updateManagedLocale(
    join(rootDirectory, 'src', 'game', 'localization', 'locales', 'en.json'),
    oldManifest?.localeKeys ?? [],
    compiled.locales.en,
  );

  const manifest: SagaGeneratedManifest = {
    formatVersion: 1,
    sagaId: source.sagaId,
    eventFiles: compiled.eventFilePaths,
    localeKeys: compiled.managedLocaleKeys,
  };
  const manifestPath = generatedManifestPath(rootDirectory, source.sagaId);
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeJson(manifestPath, manifest);
}

export function validateSagaAuthoring(source: SagaAuthoringSource): SagaCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (source.formatVersion !== SAGA_AUTHORING_FORMAT_VERSION) {
    errors.push(`Unsupported authoring formatVersion ${String(source.formatVersion)}.`);
  }
  if (!source.sagaId) errors.push('sagaId is required.');
  if (!source.trackId) errors.push('trackId is required.');
  if (!source.eventIdPrefix) errors.push('eventIdPrefix is required.');
  if (!source.runtimeDirectory) errors.push('runtimeDirectory is required.');
  if (!Array.isArray(source.chapters) || source.chapters.length === 0) errors.push('chapters must be a non-empty array.');
  if (!Array.isArray(source.events) || source.events.length === 0) errors.push('events must be a non-empty array.');

  const eventsById = new Map<string, AuthoringEvent>();
  for (const event of source.events ?? []) {
    if (!event?.id) {
      errors.push('Every authoring Event requires an id.');
      continue;
    }
    if (eventsById.has(event.id)) errors.push(`Duplicate Event ID "${event.id}".`);
    eventsById.set(event.id, event);
    if (!event.id.startsWith(source.eventIdPrefix)) {
      errors.push(`Event "${event.id}" does not use prefix "${source.eventIdPrefix}".`);
    }
    validateLocalized(event.title, `${event.id}.title`, errors);
    validateLocalized(event.text, `${event.id}.text`, errors);
    scanNullConditions(event, event.id, errors);
  }

  const immediateIds = new Set(
    source.events.filter(({ kind }) => kind === 'immediate').map(({ id }) => id),
  );
  const majorRoots = source.events.filter(
    (event) => event.kind === 'normal' && isRecord(event.majorTrack),
  );

  const immediateGraph = new Map<string, Set<string>>();
  for (const event of source.events) {
    const targets = collectQueuedImmediateTargets(event);
    immediateGraph.set(event.id, targets);
    for (const target of targets) {
      if (!immediateIds.has(target)) {
        errors.push(`${event.id} queues "${target}", but that ID is not an Immediate Event in this Saga source.`);
      }
    }
  }
  validateNoImmediateCycles(immediateGraph, errors);

  const reachedImmediate = new Set<string>();
  for (const root of majorRoots) {
    for (const id of reachableImmediateIds(root.id, immediateGraph)) reachedImmediate.add(id);
  }
  for (const id of immediateIds) {
    if (!reachedImmediate.has(id)) errors.push(`Immediate Event "${id}" is orphaned from every Major root.`);
  }

  const chapterRoots = new Map<string, AuthoringEvent[]>();
  for (const chapter of source.chapters) chapterRoots.set(chapter, []);
  for (const event of majorRoots) {
    const major = event.majorTrack as Record<string, unknown>;
    const chapterId = String(major.chapterId ?? '');
    if (!chapterRoots.has(chapterId)) {
      errors.push(`${event.id} references unknown chapter "${chapterId}".`);
      continue;
    }
    chapterRoots.get(chapterId)!.push(event);

    const isFallback = major.fallback === true;
    const parents = arrayOfStrings(major.parentNodeIds);
    if (!isFallback && parents.length > 0 && event.eligibility == null) {
      errors.push(`Specialized Major root "${event.id}" has parents but no eligibility gate.`);
    }
    if (
      source.rules?.requireMiniArcForSpecializedRoots !== false
      && !isFallback
      && collectQueuedImmediateTargets(event).size === 0
    ) {
      errors.push(`Specialized Major root "${event.id}" has no Immediate continuation.`);
    }
  }

  validateFallbackCoverage(source, chapterRoots, errors);
  validateScenarioCoverage(source, majorRoots, errors, warnings);
  validateTerminalRewards(source, chapterRoots, eventsById, immediateGraph, errors);
  validateInheritanceRewardDiversity(source, chapterRoots, eventsById, immediateGraph, errors, warnings);

  return { errors, warnings };
}

export function assertRuntimeMatchesSource(rootDirectory: string, source: SagaAuthoringSource): void {
  const compiled = compileSaga(source);
  const dictionaries = readLocaleDictionaries(rootDirectory);

  for (const [index, expected] of compiled.events.entries()) {
    const path = join(rootDirectory, compiled.eventFilePaths[index]);
    if (!existsSync(path)) throw new Error(`Generated runtime Event missing: ${compiled.eventFilePaths[index]}`);
    const actual = readJson(path);
    if (!isDeepStrictEqual(actual, expected)) {
      throw new Error(`Runtime Event differs from authoring source: ${compiled.eventFilePaths[index]}`);
    }
  }

  for (const locale of ['fr', 'en'] as const) {
    for (const [key, expected] of Object.entries(compiled.locales[locale])) {
      if (dictionaries[locale][key] !== expected) {
        throw new Error(`Locale ${locale} differs from authoring source for key "${key}".`);
      }
    }
  }
}

export function assertRoundTripFromRuntime(rootDirectory: string, sagaId: string): void {
  const imported = importSagaFromRuntime(rootDirectory, sagaId);
  const compiled = compileSaga(imported);
  const runtimeDirectory = join(rootDirectory, imported.runtimeDirectory);
  const actualEvents = findJsonFiles(runtimeDirectory)
    .map((path) => readJson(path) as EventDefinition)
    .sort((left, right) => left.id.localeCompare(right.id));

  if (actualEvents.length !== compiled.events.length) {
    throw new Error(`Round-trip Event count mismatch: runtime=${actualEvents.length}, compiled=${compiled.events.length}.`);
  }

  for (let index = 0; index < actualEvents.length; index += 1) {
    if (!isDeepStrictEqual(actualEvents[index], compiled.events[index])) {
      throw new Error(`Round-trip mismatch for Event "${actualEvents[index].id}".`);
    }
  }
}

export function checkSaga(rootDirectory: string, source: SagaAuthoringSource): SagaCheckResult {
  const result = validateSagaAuthoring(source);
  if (result.errors.length > 0) return result;

  try {
    assertRuntimeMatchesSource(rootDirectory, source);
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
  }

  const catalog = loadNodeContentCatalog(rootDirectory);
  for (const error of validateContent(catalog)) {
    result.errors.push(`runtime ${error.path}: ${error.message}`);
  }

  for (const scenario of source.scenarios) {
    try {
      runScenario(catalog, source, scenario);
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return result;
}

function runScenario(
  catalog: ReturnType<typeof loadNodeContentCatalog>,
  source: SagaAuthoringSource,
  scenario: SagaScenario,
): void {
  const expectedEventId = scenarioExpectedEventId(scenario);
  const state = createInitialGameState(0x5a6a);
  state.ageMonths = scenario.ageMonths ?? inferHistoryEntryAgeMonths(catalog, source, expectedEventId);
  state.careerPhase = state.ageMonths >= 180 ? 'active' : 'childhood';
  state.player.profile.affiliationId =
    (scenario.profileAffiliationId ?? affiliationFromTrack(catalog, source.trackId) ?? 'civilian') as never;
  if (scenario.raceId) state.player.profile.raceId = scenario.raceId as never;
  if (scenario.familyStructureId) state.player.profile.familyStructureId = scenario.familyStructureId as never;
  if (scenario.socialClassId) state.player.profile.socialClassId = scenario.socialClassId as never;
  if (scenario.careerAffiliationId) state.player.career.affiliationId = scenario.careerAffiliationId as never;

  for (const given of scenario.given ?? []) {
    applyScenarioGiven(state, catalog, given);
  }

  state.currentEventId = null;
  state.immediateEventQueue = [];
  state.scheduledEvents = [];
  state.history = scenario.history.map((entry) => ({
    ...entry,
    ageMonths: entry.ageMonths ?? inferHistoryEntryAgeMonths(catalog, source, entry.eventId),
  })) as GameState['history'];

  for (const [npcId, status] of Object.entries(scenario.npcStatuses ?? {})) {
    setScenarioNpcStatus(state, npcId, status);
  }

  const sagaEventIds = new Set(source.events.map(({ id }) => id));
  const scenarioCatalog = {
    ...catalog,
    events: catalog.events.filter(({ id }) => sagaEventIds.has(id)),
    majorNarrativeTracks: catalog.majorNarrativeTracks.filter(({ id }) => id === source.trackId),
  };

  const selected = selectNextEvent(state, scenarioCatalog).currentEventId;
  if (selected !== expectedEventId) {
    throw new Error(
      `Scenario "${source.sagaId}/${scenario.id}" expected "${expectedEventId}" but selected "${String(selected)}".`,
    );
  }
}

function scenarioExpectedEventId(scenario: SagaScenario): string {
  const expected = scenario.expectedEventId ?? scenario.expectNodeId;
  if (!expected) throw new Error(`Scenario "${scenario.id}" requires expectedEventId or expectNodeId.`);
  return expected;
}

function inferHistoryEntryAgeMonths(
  catalog: ReturnType<typeof loadNodeContentCatalog>,
  source: SagaAuthoringSource,
  eventId: string,
): number {
  const event = catalog.events.find(({ id }) => id === eventId);
  const chapterId = event?.majorTrack?.trackId === source.trackId ? event.majorTrack.chapterId : undefined;
  const track = catalog.majorNarrativeTracks.find(({ id }) => id === source.trackId);
  const dueAgeMonths = track?.chapters.find(({ id }) => id === chapterId)?.dueAgeMonths;
  if (dueAgeMonths === undefined) {
    throw new Error(`Cannot infer ageMonths for History Event "${eventId}" in Saga "${source.sagaId}".`);
  }
  return dueAgeMonths;
}

function applyScenarioGiven(
  state: GameState,
  catalog: ReturnType<typeof loadNodeContentCatalog>,
  given: Record<string, unknown>,
): void {
  const type = String(given.type ?? '');

  if (type === 'raceIs') {
    state.player.profile.raceId = String(given.raceId) as never;
    return;
  }
  if (type === 'familyStructureIs') {
    state.player.profile.familyStructureId = String(given.familyStructureId) as never;
    return;
  }
  if (type === 'socialClassIs') {
    state.player.profile.socialClassId = String(given.socialClassId) as never;
    return;
  }
  if (type === 'originSeaIs') {
    state.player.profile.originSeaId = String(given.seaId) as never;
    return;
  }
  if (type === 'affiliationIs') {
    state.player.profile.affiliationId = String(given.affiliationId) as never;
    return;
  }
  if (type === 'careerAffiliationIs') {
    state.player.career.affiliationId = String(given.affiliationId) as never;
    return;
  }
  if (type === 'npcStatusIs') {
    setScenarioNpcStatus(state, String(given.npcId), String(given.status) as NpcStatus);
    return;
  }
  if (type === 'npcRelationshipAtMost') {
    setScenarioNpcRelationship(state, String(given.npcId), Number(given.value));
    return;
  }
  if (type === 'npcRelationshipAtLeast') {
    setScenarioNpcRelationship(state, String(given.npcId), Number(given.value));
    return;
  }
  if (type === 'originParentPresent') {
    const npcId = catalog.npcs.find(({ familyRole }) => familyRole === given.role)?.id;
    if (!npcId) throw new Error(`Scenario given originParentPresent references unknown role "${String(given.role)}".`);
    setScenarioNpcStatus(state, npcId, 'known');
    return;
  }
  if (
    type === 'not'
    && typeof given.condition === 'object'
    && given.condition !== null
    && !Array.isArray(given.condition)
    && (given.condition as Record<string, unknown>).type === 'originParentPresent'
  ) {
    const role = (given.condition as Record<string, unknown>).role;
    const npcId = catalog.npcs.find(({ familyRole }) => familyRole === role)?.id;
    if (!npcId) throw new Error(`Scenario given not(originParentPresent) references unknown role "${String(role)}".`);
    setScenarioNpcStatus(state, npcId, 'departed');
    return;
  }

  throw new Error(`Unsupported compact Saga scenario given Condition "${type}". Use canonical explicit scenario fields for this case.`);
}

function setScenarioNpcStatus(state: GameState, npcId: string, status: NpcStatus): void {
  state.npcs[npcId] = {
    ...(state.npcs[npcId] ?? createDefaultNpcState()),
    status,
  };
}

function setScenarioNpcRelationship(state: GameState, npcId: string, relationship: number): void {
  state.npcs[npcId] = {
    ...(state.npcs[npcId] ?? createDefaultNpcState()),
    relationship,
  };
}

function validateFallbackCoverage(
  source: SagaAuthoringSource,
  chapterRoots: Map<string, AuthoringEvent[]>,
  errors: string[],
): void {
  const firstChapter = source.chapters[0];
  const firstRoots = chapterRoots.get(firstChapter) ?? [];
  const firstFallbacks = firstRoots.filter((event) => (event.majorTrack as Record<string, unknown>)?.fallback === true);
  if (firstRoots.length > 0 && firstFallbacks.length !== 1) {
    errors.push(`First authored chapter "${firstChapter}" requires exactly one fallback root; found ${firstFallbacks.length}.`);
  }

  for (let index = 1; index < source.chapters.length; index += 1) {
    const previous = chapterRoots.get(source.chapters[index - 1]) ?? [];
    const current = chapterRoots.get(source.chapters[index]) ?? [];
    if (current.length === 0) break;

    const fallbacks = current.filter((event) => (event.majorTrack as Record<string, unknown>)?.fallback === true);
    for (const parent of previous) {
      const count = fallbacks.filter((event) =>
        arrayOfStrings((event.majorTrack as Record<string, unknown>).parentNodeIds).includes(parent.id)
      ).length;
      if (count !== 1) {
        errors.push(
          `Route-local fallback coverage: "${parent.id}" requires exactly one fallback child in "${source.chapters[index]}"; found ${count}.`,
        );
      }
    }
  }
}

function validateScenarioCoverage(
  source: SagaAuthoringSource,
  roots: AuthoringEvent[],
  errors: string[],
  warnings: string[],
): void {
  const expectedIds = new Set(source.scenarios.map((scenario) => scenario.expectedEventId ?? scenario.expectNodeId).filter((id): id is string => typeof id === 'string'));
  const uncovered = roots.filter((event) => {
    const major = event.majorTrack as Record<string, unknown>;
    const hasParents = arrayOfStrings(major.parentNodeIds).length > 0;
    return hasParents && !expectedIds.has(event.id);
  });

  if (uncovered.length === 0) return;
  const message = `Routing scenarios do not cover ${uncovered.length} descendant Major root(s): ${uncovered.map(({ id }) => id).join(', ')}.`;
  if (source.rules?.enforceScenarioCoverage) errors.push(message);
  else warnings.push(message);
}


// D2.11 — Family inheritance reward diversity
function validateInheritanceRewardDiversity(
  source: SagaAuthoringSource,
  chapterRoots: Map<string, AuthoringEvent[]>,
  eventsById: Map<string, AuthoringEvent>,
  graph: Map<string, Set<string>>,
  errors: string[],
  warnings: string[],
): void {
  if (!source.trackId.startsWith('family_')) return;
  const terminalChapter = [...source.chapters].reverse().find(
    (chapter) => (chapterRoots.get(chapter)?.length ?? 0) > 0,
  );
  if (!terminalChapter) return;

  const leaves = (chapterRoots.get(terminalChapter) ?? []).flatMap((root) =>
    collectLeafOutcomes(root.id, eventsById, graph)
  );
  if (leaves.length < 6) return;

  const familyCounts = new Map<string, number>();
  for (const leaf of leaves) {
    const families = new Set<string>();
    for (const effect of Array.isArray(leaf.outcome.effects) ? leaf.outcome.effects : []) {
      const type = String(effect.type ?? '');
      if (type === 'addItem') families.add('tangible_asset');
      else if (type === 'modifyBerries' && Number(effect.amount) > 0) families.add('economic');
      else if (type === 'modifyReputation') families.add('reputation');
      else if (type === 'addTrait') families.add('trait');
      else if (type === 'setFlag') families.add('state_access');
      else if (type === 'setNpcStatus') families.add('npc');
      else if (type === 'acquireShip') families.add('ship');
      else if (type === 'setCareerAffiliation' || type === 'setCareerRank' || type === 'setCareerTitle') families.add('career');
      else if (type === 'setNpcDevilFruit' || type === 'awakenHaki' || type === 'raiseConquerorHakiTo') families.add('power');
    }
    for (const family of families) {
      familyCounts.set(family, (familyCounts.get(family) ?? 0) + 1);
    }
  }

  if (familyCounts.size <= 1) {
    errors.push(
      `Family inheritance reward monoculture: "${source.sagaId}" uses only ${[...familyCounts.keys()].join(', ') || 'no recognized reward family'} across ${leaves.length} Layer-5 leaves. Choose rewards from the fiction instead of defaulting every ending to one mechanic.`,
    );
    return;
  }

  if (familyCounts.size < 3) {
    warnings.push(
      `Family inheritance diversity: "${source.sagaId}" uses only ${familyCounts.size} recognized reward families across ${leaves.length} Layer-5 leaves. Mature Sagas should normally reach at least three when fiction supports it.`,
    );
  }

  const dominant = [...familyCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (dominant && dominant[1] / leaves.length > 0.75) {
    warnings.push(
      `Family inheritance concentration: "${source.sagaId}" gives ${dominant[0]} on ${dominant[1]}/${leaves.length} Layer-5 leaves (>75%). Keep only if the Saga fiction genuinely warrants that dominance.`,
    );
  }
}

function validateTerminalRewards(
  source: SagaAuthoringSource,
  chapterRoots: Map<string, AuthoringEvent[]>,
  eventsById: Map<string, AuthoringEvent>,
  graph: Map<string, Set<string>>,
  errors: string[],
): void {
  if (source.rules?.requireTerminalPersistentReward === false) return;
  const terminalChapter = [...source.chapters].reverse().find((chapter) => (chapterRoots.get(chapter)?.length ?? 0) > 0);
  if (!terminalChapter) return;

  const rewardTypes = new Set(source.rules?.persistentRewardEffectTypes ?? DEFAULT_REWARD_EFFECT_TYPES);
  for (const root of chapterRoots.get(terminalChapter) ?? []) {
    for (const leaf of collectLeafOutcomes(root.id, eventsById, graph)) {
      const effects = Array.isArray(leaf.outcome.effects) ? leaf.outcome.effects : [];
      if (!effects.some((effect) => rewardTypes.has(String(effect.type)) && (effect.type !== 'modifyBerries' || Number(effect.amount) > 0))) {
        errors.push(
          `Terminal leaf "${leaf.eventId}/${leaf.outcome.id}" reachable from "${root.id}" has no persistent gameplay reward effect.`,
        );
      }
    }
  }
}

function collectLeafOutcomes(
  rootId: string,
  eventsById: Map<string, AuthoringEvent>,
  graph: Map<string, Set<string>>,
): Array<{ eventId: string; outcome: AuthoringOutcome }> {
  const leaves: Array<{ eventId: string; outcome: AuthoringOutcome }> = [];
  const visited = new Set<string>();

  const visit = (eventId: string): void => {
    if (visited.has(eventId)) return;
    visited.add(eventId);
    const event = eventsById.get(eventId);
    if (!event) return;

    for (const outcome of allOutcomes(event)) {
      const targets = outcome.effects
        .filter((effect) => effect.type === 'queueImmediateEvent')
        .map((effect) => String(effect.eventId));
      if (targets.length === 0) leaves.push({ eventId, outcome });
      else targets.forEach(visit);
    }
  };

  visit(rootId);
  return leaves;
}

function validateNoImmediateCycles(graph: Map<string, Set<string>>, errors: string[]): void {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string, stack: string[]): void => {
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      errors.push(`Immediate cycle: ${[...stack.slice(start), id].join(' -> ')}.`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const target of graph.get(id) ?? []) visit(target, [...stack, id]);
    visiting.delete(id);
    visited.add(id);
  };

  for (const id of graph.keys()) visit(id, []);
}

function reachableImmediateIds(rootId: string, graph: Map<string, Set<string>>): Set<string> {
  const reached = new Set<string>();
  const visit = (id: string): void => {
    for (const target of graph.get(id) ?? []) {
      if (reached.has(target)) continue;
      reached.add(target);
      visit(target);
    }
  };
  visit(rootId);
  return reached;
}

function collectQueuedImmediateTargets(event: AuthoringEvent): Set<string> {
  const targets = new Set<string>();
  for (const outcome of allOutcomes(event)) {
    for (const effect of outcome.effects) {
      if (effect.type === 'queueImmediateEvent' && typeof effect.eventId === 'string') {
        targets.add(effect.eventId);
      }
    }
  }
  return targets;
}

function allOutcomes(event: AuthoringEvent): AuthoringOutcome[] {
  return event.choices.flatMap((choice) => {
    if (choice.resolution.type === 'deterministic') return [choice.resolution.outcome];
    return Object.values(choice.resolution.outcomes);
  });
}

function scanNullConditions(value: unknown, path: string, errors: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      if (entry === null) errors.push(`${path}[${index}] is null.`);
      else scanNullConditions(entry, `${path}[${index}]`, errors);
    });
    return;
  }
  if (!isRecord(value)) return;

  for (const [key, entry] of Object.entries(value)) {
    if (key === 'conditions' && Array.isArray(entry)) {
      entry.forEach((condition, index) => {
        if (condition === null || !isRecord(condition)) {
          errors.push(`${path}.${key}[${index}] must be a Condition object.`);
        }
      });
    }
    if (key === 'condition' && entry === null) {
      errors.push(`${path}.${key} must not be null.`);
    }
    scanNullConditions(entry, `${path}.${key}`, errors);
  }
}

function validateLocalized(copy: LocalizedCopy | undefined, path: string, errors: string[]): void {
  if (!copy || typeof copy.fr !== 'string' || copy.fr.trim() === '') errors.push(`${path}.fr is required.`);
  if (!copy || typeof copy.en !== 'string' || copy.en.trim() === '') errors.push(`${path}.en is required.`);
}

function toAuthoringEvent(
  event: EventDefinition,
  dictionaries: ReturnType<typeof readLocaleDictionaries>,
): AuthoringEvent {
  const raw = structuredClone(event) as unknown as Record<string, unknown>;
  const titleKey = String(raw.titleKey);
  const textKey = String(raw.textKey);
  delete raw.titleKey;
  delete raw.textKey;

  const runtimeChoices = raw.choices as Array<Record<string, unknown>>;
  delete raw.choices;

  const authoring: AuthoringEvent = {
    ...raw,
    id: event.id,
    kind: event.kind,
    title: localizedFromKey(titleKey, dictionaries),
    text: localizedFromKey(textKey, dictionaries),
    choices: runtimeChoices.map((choice) => toAuthoringChoice(event.id, choice, dictionaries)),
  };
  if (titleKey !== titleKeyFor(event.id)) authoring.titleKeyOverride = titleKey;
  if (textKey !== textKeyFor(event.id)) authoring.textKeyOverride = textKey;
  return authoring;
}

function toAuthoringChoice(
  eventId: string,
  choice: Record<string, unknown>,
  dictionaries: ReturnType<typeof readLocaleDictionaries>,
): AuthoringChoice {
  const raw = structuredClone(choice);
  const choiceId = String(raw.id);
  const textKey = String(raw.textKey);
  const resolution = raw.resolution as Record<string, unknown>;
  delete raw.textKey;
  delete raw.resolution;

  const authoring: AuthoringChoice = {
    ...raw,
    id: choiceId,
    text: localizedFromKey(textKey, dictionaries),
    resolution: toAuthoringResolution(eventId, choiceId, resolution, dictionaries),
  };
  if (textKey !== choiceTextKeyFor(eventId, choiceId)) authoring.textKeyOverride = textKey;
  return authoring;
}

function toAuthoringResolution(
  eventId: string,
  choiceId: string,
  resolution: Record<string, unknown>,
  dictionaries: ReturnType<typeof readLocaleDictionaries>,
): AuthoringResolution {
  if (resolution.type === 'deterministic') {
    return {
      type: 'deterministic',
      outcome: toAuthoringOutcome(eventId, choiceId, resolution.outcome as Record<string, unknown>, dictionaries),
    };
  }

  const outcomes = resolution.outcomes as Record<string, Record<string, unknown>>;
  const authoring: AuthoringResolution = {
    type: 'dice',
    statId: String(resolution.statId),
    successThreshold: Number(resolution.successThreshold),
    outcomes: Object.fromEntries(
      Object.entries(outcomes).map(([band, outcome]) => [
        band,
        toAuthoringOutcome(eventId, choiceId, outcome, dictionaries),
      ]),
    ),
  };
  if (resolution.modifiers !== undefined) authoring.modifiers = structuredClone(resolution.modifiers) as unknown[];
  if (resolution.traitOverrides !== undefined) authoring.traitOverrides = structuredClone(resolution.traitOverrides) as unknown[];
  if (resolution.actor !== undefined) authoring.actor = structuredClone(resolution.actor);
  return authoring;
}

function toAuthoringOutcome(
  eventId: string,
  choiceId: string,
  outcome: Record<string, unknown>,
  dictionaries: ReturnType<typeof readLocaleDictionaries>,
): AuthoringOutcome {
  const raw = structuredClone(outcome);
  const outcomeId = String(raw.id);
  const textKey = String(raw.textKey);
  delete raw.textKey;
  const authoring: AuthoringOutcome = {
    ...raw,
    id: outcomeId,
    text: localizedFromKey(textKey, dictionaries),
    effects: structuredClone(raw.effects ?? []) as Array<Record<string, unknown>>,
  };
  if (textKey !== outcomeTextKeyFor(eventId, choiceId, outcomeId)) authoring.textKeyOverride = textKey;
  return authoring;
}

function fromAuthoringEvent(
  event: AuthoringEvent,
  locales: CompiledSaga['locales'],
): EventDefinition {
  const raw = structuredClone(event) as Record<string, unknown>;
  const title = raw.title as LocalizedCopy;
  const text = raw.text as LocalizedCopy;
  const titleKey = String(raw.titleKeyOverride ?? titleKeyFor(event.id));
  const textKey = String(raw.textKeyOverride ?? textKeyFor(event.id));
  const choices = raw.choices as AuthoringChoice[];
  delete raw.title;
  delete raw.text;
  delete raw.titleKeyOverride;
  delete raw.textKeyOverride;
  delete raw.choices;

  registerLocalized(locales, titleKey, title);
  registerLocalized(locales, textKey, text);

  return {
    ...raw,
    id: event.id,
    kind: event.kind,
    titleKey,
    textKey,
    choices: choices.map((choice) => fromAuthoringChoice(event.id, choice, locales)),
  } as unknown as EventDefinition;
}

function fromAuthoringChoice(
  eventId: string,
  choice: AuthoringChoice,
  locales: CompiledSaga['locales'],
): Record<string, unknown> {
  const raw = structuredClone(choice) as Record<string, unknown>;
  const text = raw.text as LocalizedCopy;
  const textKey = String(raw.textKeyOverride ?? choiceTextKeyFor(eventId, choice.id));
  const resolution = raw.resolution as AuthoringResolution;
  delete raw.text;
  delete raw.textKeyOverride;
  delete raw.resolution;

  registerLocalized(locales, textKey, text);
  return {
    ...raw,
    id: choice.id,
    textKey,
    resolution: fromAuthoringResolution(eventId, choice.id, resolution, locales),
  };
}

function fromAuthoringResolution(
  eventId: string,
  choiceId: string,
  resolution: AuthoringResolution,
  locales: CompiledSaga['locales'],
): Record<string, unknown> {
  if (resolution.type === 'deterministic') {
    return {
      type: 'deterministic',
      outcome: fromAuthoringOutcome(eventId, choiceId, resolution.outcome, locales),
    };
  }
  const result: Record<string, unknown> = {
    type: 'dice',
    statId: resolution.statId,
    successThreshold: resolution.successThreshold,
    outcomes: Object.fromEntries(
      Object.entries(resolution.outcomes).map(([band, outcome]) => [
        band,
        fromAuthoringOutcome(eventId, choiceId, outcome, locales),
      ]),
    ),
  };
  if (resolution.modifiers !== undefined) result.modifiers = structuredClone(resolution.modifiers);
  if (resolution.traitOverrides !== undefined) result.traitOverrides = structuredClone(resolution.traitOverrides);
  if (resolution.actor !== undefined) result.actor = structuredClone(resolution.actor);
  return result;
}

function fromAuthoringOutcome(
  eventId: string,
  choiceId: string,
  outcome: AuthoringOutcome,
  locales: CompiledSaga['locales'],
): Record<string, unknown> {
  const raw = structuredClone(outcome) as Record<string, unknown>;
  const text = raw.text as LocalizedCopy;
  const textKey = String(raw.textKeyOverride ?? outcomeTextKeyFor(eventId, choiceId, outcome.id));
  delete raw.text;
  delete raw.textKeyOverride;
  registerLocalized(locales, textKey, text);
  return {
    ...raw,
    id: outcome.id,
    textKey,
  };
}

function readLocaleDictionaries(rootDirectory: string): { fr: Record<string, string>; en: Record<string, string> } {
  return {
    fr: readJson(join(rootDirectory, 'src', 'game', 'localization', 'locales', 'fr.json')) as Record<string, string>,
    en: readJson(join(rootDirectory, 'src', 'game', 'localization', 'locales', 'en.json')) as Record<string, string>,
  };
}

function localizedFromKey(
  key: string,
  dictionaries: ReturnType<typeof readLocaleDictionaries>,
): LocalizedCopy {
  const fr = dictionaries.fr[key];
  const en = dictionaries.en[key];
  if (typeof fr !== 'string') throw new Error(`Missing FR localization key "${key}" while importing.`);
  if (typeof en !== 'string') throw new Error(`Missing EN localization key "${key}" while importing.`);
  return { fr, en };
}

function registerLocalized(
  locales: CompiledSaga['locales'],
  key: string,
  copy: LocalizedCopy,
): void {
  for (const locale of ['fr', 'en'] as const) {
    const current = locales[locale][key];
    if (current !== undefined && current !== copy[locale]) {
      throw new Error(`Localization collision for "${key}" (${locale}).`);
    }
    locales[locale][key] = copy[locale];
  }
}

function updateManagedLocale(
  file: string,
  oldKeys: string[],
  additions: Record<string, string>,
): void {
  const dictionary = readJson(file) as Record<string, string>;
  for (const key of oldKeys) delete dictionary[key];
  for (const [key, value] of Object.entries(additions)) dictionary[key] = value;
  writeJson(file, dictionary);
}

function readGeneratedManifest(rootDirectory: string, sagaId: string): SagaGeneratedManifest | null {
  const path = generatedManifestPath(rootDirectory, sagaId);
  return existsSync(path) ? readJson(path) as SagaGeneratedManifest : null;
}

function commonEventPrefix(ids: string[], sagaId: string): string {
  const preferred = `${sagaId.replace(/^family_/, 'family_')}_`;
  if (ids.every((id) => id.startsWith(preferred))) return preferred;
  return `${sagaId}_`;
}

function affiliationFromTrack(
  catalog: ReturnType<typeof loadNodeContentCatalog>,
  trackId: string,
): string | null {
  const track = catalog.majorNarrativeTracks.find(({ id }) => id === trackId);
  if (!track || track.eligibility.type !== 'affiliationIs') return null;
  return track.eligibility.affiliationId;
}

function titleKeyFor(eventId: string): string {
  return `event.${eventId}.title`;
}
function textKeyFor(eventId: string): string {
  return `event.${eventId}.text`;
}
function choiceTextKeyFor(eventId: string, choiceId: string): string {
  return `event.${eventId}.choice.${choiceId}.text`;
}
function outcomeTextKeyFor(eventId: string, choiceId: string, outcomeId: string): string {
  return `event.${eventId}.choice.${choiceId}.outcome.${outcomeId}.text`;
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function findJsonFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? findJsonFiles(path)
      : entry.isFile() && entry.name.endsWith('.json')
        ? [path]
        : [];
  });
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8')) as unknown;
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function formatProblems(title: string, result: SagaCheckResult): string {
  return [
    title,
    ...result.errors.map((error) => `ERROR ${error}`),
    ...result.warnings.map((warning) => `WARNING ${warning}`),
  ].join('\n');
}
