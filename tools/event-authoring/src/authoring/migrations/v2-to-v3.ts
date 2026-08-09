import { choiceKey, choicePlaceholderKey, eventKeys, outcomeKey } from '../../localization/keys';
import { createEntry } from '../../localization/store';
import type { LocalizationAuthoringStore } from '../../localization/types';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): string => typeof value === 'string' ? value : '';
const put = (store: LocalizationAuthoringStore, key: string, value: unknown) => { if (!store[key]) store[key] = createEntry(key, text(value)); };

export interface AuthoringV2ToV3Result {
  project: Record<string, unknown>;
  reviewEventIds: string[];
  migrationNotes: Record<string, string>;
}

/** Legacy localization migration only. Game-schema v1 -> v2 is handled by v3-to-v4. */
export const migrateAuthoringV2ToV3 = (input: Record<string, unknown>): AuthoringV2ToV3Result => {
  const raw = structuredClone(input);
  const store: LocalizationAuthoringStore = {};
  const reviewEventIds: string[] = [];
  const migrationNotes: Record<string, string> = {};
  const events = (Array.isArray(raw.events) ? raw.events : []).flatMap((eventValue) => {
    if (!isRecord(eventValue)) return [];
    const eventId = text(eventValue.id) || 'event';
    const keys = eventKeys(eventId); put(store, keys.titleKey, eventValue.title); put(store, keys.textKey, eventValue.text);
    let needsReview = false; const removed: string[] = [];
    const choices = (Array.isArray(eventValue.choices) ? eventValue.choices : []).flatMap((choiceValue) => {
      if (!isRecord(choiceValue)) return [];
      const choiceId = text(choiceValue.id) || 'choice'; const textKey = choiceKey(eventId, choiceId); put(store, textKey, choiceValue.text);
      let input: unknown;
      if (isRecord(choiceValue.input) && choiceValue.input.type === 'text' && choiceValue.input.target === 'playerName') {
        const placeholderKey = choicePlaceholderKey(eventId, choiceId); put(store, placeholderKey, choiceValue.placeholder ?? choiceValue.input.placeholder);
        input = { type: 'text', target: 'playerName', placeholderKey };
      }
      const rv = isRecord(choiceValue.resolution) ? choiceValue.resolution : {};
      const migrateOutcome = (value: unknown, fallback: string) => {
        const o = isRecord(value) ? value : {}; const id = text(o.id) || fallback; const key = outcomeKey(eventId, choiceId, id); put(store, key, o.text);
        return { id, textKey: key, advanceMonths: typeof o.advanceMonths === 'number' ? o.advanceMonths : 0, effects: Array.isArray(o.effects) ? structuredClone(o.effects) : [] };
      };
      let resolution: unknown;
      if (rv.type === 'dice') {
        const outcomes = isRecord(rv.outcomes) ? rv.outcomes : {};
        if ('partialSuccess' in outcomes) { needsReview = true; removed.push(`${choiceId}: ${JSON.stringify(outcomes.partialSuccess)}`); }
        resolution = {
          type: 'dice', statId: text(rv.statId) || 'luck', successThreshold: typeof rv.successThreshold === 'number' ? rv.successThreshold : 12,
          modifiers: Array.isArray(rv.modifiers) ? structuredClone(rv.modifiers) : [], traitOverrides: Array.isArray(rv.traitOverrides) ? structuredClone(rv.traitOverrides) : [],
          outcomes: { criticalFailure: migrateOutcome(outcomes.criticalFailure, 'critical_failure'), failure: migrateOutcome(outcomes.failure, 'failure'), success: migrateOutcome(outcomes.success, 'success'), criticalSuccess: migrateOutcome(outcomes.criticalSuccess, 'critical_success') },
        };
      } else resolution = { type: 'deterministic', outcome: migrateOutcome(rv.outcome, 'outcome') };
      return [{ id: choiceId, textKey, input, visibleIf: isRecord(choiceValue.visibleIf) ? structuredClone(choiceValue.visibleIf) : undefined, availableIf: isRecord(choiceValue.availableIf) ? structuredClone(choiceValue.availableIf) : undefined, resolution }];
    });
    if (needsReview) { reviewEventIds.push(eventId); migrationNotes[eventId] = `Legacy five-band DiceCheck removed partialSuccess.\n${removed.join('\n')}`; }
    return [{ id: eventId, ...keys, priority: typeof eventValue.priority === 'number' ? eventValue.priority : 0, scheduledOnly: eventValue.scheduledOnly === true ? true : undefined, eligibility: isRecord(eventValue.eligibility) ? structuredClone(eventValue.eligibility) : undefined, choices }];
  });
  const nodes = Array.isArray(raw.nodes) ? structuredClone(raw.nodes) as Array<Record<string, unknown>> : [];
  for (const node of nodes) if (typeof node.eventId === 'string' && reviewEventIds.includes(node.eventId)) { node.status = 'needsReview'; node.notes = `${typeof node.notes === 'string' ? node.notes : ''}\n${migrationNotes[node.eventId]}`.trim(); }
  return { project: { ...raw, authoringVersion: 3, gameSchemaVersion: 1, sourceLocale: 'fr', supportedLocales: Array.isArray(raw.supportedLocales) ? raw.supportedLocales : ['fr','en'], events, nodes, localization: store }, reviewEventIds, migrationNotes };
};

