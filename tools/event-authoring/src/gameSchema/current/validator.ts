import { CONTENT_SCHEMA_VERSION, type EventDefinition } from './contract';
import {
  validateContent as validateCanonicalContent,
  type ContentValidationError,
} from '../../../../../src/game/validation/validateContent';

export type ShapeIssue = ContentValidationError;
export type { ContentValidationError };

const permissiveLocalization = new Proxy<Record<string, string>>({}, { get: () => '' });

export function validateContent(catalog: unknown, sourceDictionary = permissiveLocalization): ContentValidationError[] {
  return validateCanonicalContent(catalog, sourceDictionary);
}

/**
 * Event-only import validation is intentionally structural/permissive.
 * Full reference, Major-graph and registry validation happens at project/catalog
 * level where the real track definitions and neighboring nodes are available.
 */
export function validateSingleEventShape(value: unknown): ShapeIssue[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return [{ path: 'events[0]', message: 'Event must be an object.' }];
  }
  const event = value as Partial<EventDefinition>;
  const issues: ShapeIssue[] = [];
  if (typeof event.id !== 'string' || !event.id) issues.push({ path: 'events[0].id', message: 'Event requires a non-empty id.' });
  if (!['system', 'normal', 'immediate', 'scheduled', 'critical'].includes(String(event.kind))) issues.push({ path: 'events[0].kind', message: 'Invalid Event kind.' });
  if (typeof event.titleKey !== 'string' || !event.titleKey) issues.push({ path: 'events[0].titleKey', message: 'Event requires titleKey.' });
  if (typeof event.textKey !== 'string' || !event.textKey) issues.push({ path: 'events[0].textKey', message: 'Event requires textKey.' });
  if (!Array.isArray(event.choices)) issues.push({ path: 'events[0].choices', message: 'Event requires choices array.' });

  if (event.majorTrack !== undefined) {
    if (event.kind !== 'normal' || typeof event.majorTrack !== 'object' || event.majorTrack === null) {
      issues.push({ path: 'events[0].majorTrack', message: 'majorTrack is valid only on Normal Events.' });
    } else {
      const ref = event.majorTrack as Record<string, unknown>;
      for (const key of ['trackId', 'chapterId', 'nodeId']) {
        if (typeof ref[key] !== 'string' || !(ref[key] as string)) issues.push({ path: `events[0].majorTrack.${key}`, message: `Major Track Event requires ${key}.` });
      }
      if (ref.parentNodeIds !== undefined && !Array.isArray(ref.parentNodeIds)) issues.push({ path: 'events[0].majorTrack.parentNodeIds', message: 'parentNodeIds must be an array.' });
      if (ref.selectionPriority !== undefined && (!Number.isInteger(ref.selectionPriority) || Number(ref.selectionPriority) < 0 || Number(ref.selectionPriority) > 100)) issues.push({ path: 'events[0].majorTrack.selectionPriority', message: 'selectionPriority must be an integer from 0 to 100.' });
    }
  }

  return issues;
}

export function validateEventDefinitionsShape(value: unknown): ShapeIssue[] {
  if (!Array.isArray(value)) return [{ path: 'events', message: 'Expected an array.' }];
  return value.flatMap((event, index) => validateSingleEventShape(event).map((issue) => ({
    ...issue,
    path: issue.path.replace(/^events\[0\]/, `events[${index}]`),
  })));
}

export { CONTENT_SCHEMA_VERSION };
