import { CONTENT_SCHEMA_VERSION } from '../../gameSchema/current/contract';
import { choicePlaceholderKey, modifierLabelKey } from '../../localization/keys';
import { createEntry, ensureKeys } from '../../localization/store';
import type { ContentFolder } from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

interface Result { project: Record<string, unknown>; reviewEventIds: string[]; warnings: string[]; }

const inferFolder = (event: Record<string, unknown>): ContentFolder => {
  if (event.kind === 'scheduled') return 'scheduled';
  if (event.kind === 'critical') return 'critical';
  const findPhase = (condition: unknown): string | undefined => {
    if (!isRecord(condition)) return undefined;
    if (condition.type === 'careerPhaseIs' && typeof condition.phase === 'string') return condition.phase;
    if (condition.type === 'all' && Array.isArray(condition.conditions)) return condition.conditions.map(findPhase).find(Boolean);
    return undefined;
  };
  const phase = findPhase(event.eligibility);
  return phase === 'origins' ? 'origins' : phase === 'childhood' ? 'childhood' : 'active';
};

export const migrateAuthoringV3ToV4 = (input: Record<string, unknown>): Result => {
  const raw = structuredClone(input);
  const warnings: string[] = [];
  const review = new Set<string>();
  const localization = isRecord(raw.localization) ? structuredClone(raw.localization) as Record<string, unknown> : {};
  const warn = (eventId: string, message: string) => { warnings.push(`${eventId}: ${message}`); review.add(eventId); };

  const migrateCondition = (value: unknown, eventId: string): unknown => {
    if (!isRecord(value)) return value;
    if (value.type === 'monthAtLeast') { warn(eventId, `removed obsolete monthAtLeast (${JSON.stringify(value)}); manual replacement required.`); return undefined; }
    if (value.type === 'ageAtLeastMonths' || value.type === 'ageAtMostMonths') return { type: value.type, value: typeof value.value === 'number' ? value.value : typeof value.months === 'number' ? value.months : 0 };
    if (value.type === 'all' || value.type === 'any') return { type: value.type, conditions: asArray(value.conditions).map((x) => migrateCondition(x, eventId)).filter((x) => x !== undefined) };
    if (value.type === 'not') { const condition = migrateCondition(value.condition, eventId); if (condition === undefined) { warn(eventId, 'removed not(monthAtLeast) branch; manual review required.'); return undefined; } return { type: 'not', condition }; }
    if (value.type === 'npcStatusIs' && !['known','crew','departed','unavailable','dead'].includes(String(value.status))) {
      warn(eventId, `legacy NPC status "${String(value.status)}" has no exact v2 equivalent; set to "known" for manual correction.`);
      return { ...value, status: 'known' };
    }
    return structuredClone(value);
  };

  const migrateEffect = (value: unknown, eventId: string): unknown => {
    if (!isRecord(value)) return value;
    if (value.type === 'setNpcStatus' && !['known','crew','departed','unavailable','dead'].includes(String(value.status))) {
      warn(eventId, `legacy setNpcStatus "${String(value.status)}" has no exact v2 equivalent; set to "known" for manual correction.`);
      return { ...value, status: 'known' };
    }
    return structuredClone(value);
  };

  const migrateOutcome = (value: unknown, eventId: string): unknown => {
    if (!isRecord(value)) return value;
    if (typeof value.advanceMonths === 'number' && value.advanceMonths !== 0) warn(eventId, `dropped Outcome.advanceMonths=${value.advanceMonths}; time is now phase-owned.`);
    return { id: value.id, textKey: value.textKey, effects: asArray(value.effects).map((effect) => migrateEffect(effect, eventId)) };
  };

  const events = asArray(raw.events).flatMap((value) => {
    if (!isRecord(value) || typeof value.id !== 'string') return [];
    const eventId = value.id;
    const scheduled = value.scheduledOnly === true;
    let event: Record<string, unknown> = { id: value.id, titleKey: value.titleKey, textKey: value.textKey, kind: scheduled ? 'scheduled' : 'normal' };
    const eligibility = migrateCondition(value.eligibility, eventId); if (eligibility !== undefined) event.eligibility = eligibility;
    if (scheduled) {
      const oldPriority = typeof value.priority === 'number' ? value.priority : 100;
      const priority = [50,100,200,300].includes(oldPriority) ? oldPriority : 100;
      event.priority = priority; event.scheduledReach = 'normal';
      if (priority !== oldPriority) warn(eventId, `legacy scheduled priority ${oldPriority} is not valid in v2; set to 100.`);
    } else if (typeof value.priority === 'number' && value.priority !== 0) warn(eventId, `dropped legacy Normal priority ${value.priority}; Normal Events are uniformly selected in v2.`);
    event.choices = asArray(value.choices).flatMap((choiceValue) => {
      if (!isRecord(choiceValue)) return [];
      const choiceId = typeof choiceValue.id === 'string' ? choiceValue.id : 'choice';
      const choice: Record<string, unknown> = { id: choiceId, textKey: choiceValue.textKey };
      const visibleIf = migrateCondition(choiceValue.visibleIf, eventId); if (visibleIf !== undefined) choice.visibleIf = visibleIf;
      const availableIf = migrateCondition(choiceValue.availableIf, eventId); if (availableIf !== undefined) choice.availableIf = availableIf;
      if (isRecord(choiceValue.input) && choiceValue.input.type === 'text' && choiceValue.input.target === 'playerName') {
        const minLength = typeof choiceValue.input.minLength === 'number' ? choiceValue.input.minLength : 1;
        const maxLength = typeof choiceValue.input.maxLength === 'number' ? choiceValue.input.maxLength : 32;
        if (choiceValue.input.minLength === undefined || choiceValue.input.maxLength === undefined) warn(eventId, `text input "${choiceId}" had no min/max; defaulted to 1/32 for manual review.`);
        choice.input = { type: 'text', target: 'playerName', minLength, maxLength, placeholderKey: choiceValue.input.placeholderKey ?? choicePlaceholderKey(eventId, choiceId) };
      }
      const rv = isRecord(choiceValue.resolution) ? choiceValue.resolution : {};
      if (rv.type === 'dice') {
        const outcomes = isRecord(rv.outcomes) ? rv.outcomes : {};
        const modifiers = asArray(rv.modifiers).map((m, index) => {
          const modifier = isRecord(m) ? structuredClone(m) : {};
          const condition = migrateCondition(modifier.condition, eventId) ?? { type: 'hasFlag', flagId: '' };
          const displayLabelKey = typeof modifier.displayLabelKey === 'string' ? modifier.displayLabelKey : modifierLabelKey(eventId, choiceId, index);
          if (modifier.displayLabelKey === undefined) { warn(eventId, `Dice modifier ${choiceId}[${index}] lacked displayLabelKey; generated ${displayLabelKey}.`); if (!localization[displayLabelKey]) localization[displayLabelKey] = createEntry(displayLabelKey, ''); }
          return { condition, value: typeof modifier.value === 'number' ? modifier.value : 0, displayLabelKey };
        });
        choice.resolution = { type: 'dice', statId: rv.statId, successThreshold: rv.successThreshold, modifiers, traitOverrides: Array.isArray(rv.traitOverrides) ? structuredClone(rv.traitOverrides) : [], outcomes: {
          criticalFailure: migrateOutcome(outcomes.criticalFailure, eventId), failure: migrateOutcome(outcomes.failure, eventId), success: migrateOutcome(outcomes.success, eventId), criticalSuccess: migrateOutcome(outcomes.criticalSuccess, eventId),
        } };
      } else choice.resolution = { type: 'deterministic', outcome: migrateOutcome(rv.outcome, eventId) };
      return [choice];
    });
    return [event];
  });

  const registries = isRecord(raw.registries) ? structuredClone(raw.registries) : {};
  const traits = asArray(registries.traits).flatMap((value) => isRecord(value) ? [{ ...value, oppositeTraitId: value.oppositeTraitId ?? value.opposedTraitId, opposedTraitId: undefined }] : []);
  const npcs = asArray(registries.npcs).flatMap((value) => isRecord(value) ? [{ ...value, raceId: typeof value.raceId === 'string' && value.raceId ? value.raceId : null, originSeaId: typeof value.originSeaId === 'string' && value.originSeaId ? value.originSeaId : null, affiliationId: typeof value.affiliationId === 'string' && value.affiliationId ? value.affiliationId : null, initialStats: isRecord(value.initialStats) ? value.initialStats : isRecord(value.stats) ? value.stats : {}, stats: undefined }] : []);
  const locations = asArray(registries.locations).flatMap((value) => {
    if (!isRecord(value) || typeof value.id !== 'string') return [];
    if (typeof value.blocksScheduledEvents !== 'boolean') warnings.push(`location ${value.id}: blocksScheduledEvents was absent in v0.3; defaulted to false and should be reviewed.`);
    return [{ id: value.id, blocksScheduledEvents: value.blocksScheduledEvents === true }];
  });
  const nextRegistries = { ...registries, traits, npcs, locations, flags: asArray(registries.flags) };
  const eventById = new Map(events.map((event) => [String(event.id), event]));
  const nodes: Array<Record<string, unknown>> = asArray(raw.nodes).flatMap<Record<string, unknown>>((value, index) => {
    if (!isRecord(value) || typeof value.eventId !== 'string') return [];
    const event = eventById.get(value.eventId); if (!event) return [];
    const warningLines = warnings.filter((x) => x.startsWith(`${value.eventId}:`));
    const notes = [typeof value.notes === 'string' ? value.notes : '', warningLines.length ? `v0.4 migration:\n${warningLines.join('\n')}` : ''].filter(Boolean).join('\n\n');
    return [{ ...value, position: isRecord(value.position) ? value.position : { x: (index % 5) * 210 + 70, y: Math.floor(index / 5) * 130 + 70 }, notes, status: review.has(value.eventId) ? 'needsReview' : value.status ?? 'migrated', contentFolder: inferFolder(event) }];
  });
  const existingNodeIds = new Set(nodes.map((node) => String(node.eventId)));
  events.forEach((event, index) => { if (!existingNodeIds.has(String(event.id))) nodes.push({ eventId: event.id, position: { x: (index % 5) * 210 + 70, y: Math.floor(index / 5) * 130 + 70 }, notes: '', status: review.has(String(event.id)) ? 'needsReview' : 'migrated', contentFolder: inferFolder(event) }); });

  return { project: { ...raw, authoringVersion: 4, gameSchemaVersion: CONTENT_SCHEMA_VERSION, events, nodes, registries: nextRegistries, localization, metadata: { ...(isRecord(raw.metadata) ? raw.metadata : {}), migrationWarnings: warnings } }, reviewEventIds: [...review], warnings };
};

