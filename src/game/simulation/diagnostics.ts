import type { ContentCatalog } from '../content/schema';

export type DiagnosticCode =
  | 'scheduled-never-scheduled'
  | 'trait-never-granted'
  | 'item-never-granted'
  | 'flag-read-never-written'
  | 'flag-written-never-read'
  | 'location-no-entry-path'
  | 'npc-never-referenced';

export interface ContentDiagnostic {
  severity: 'warning';
  code: DiagnosticCode;
  id: string;
  message: string;
}

export function diagnoseContent(catalog: ContentCatalog): ContentDiagnostic[] {
  const scheduledTargets = new Set<string>();
  const grantedTraits = new Set<string>();
  const grantedItems = new Set<string>();
  const readFlags = new Set<string>();
  const writtenFlags = new Set<string>();
  const referencedLocations = new Set<string>();
  const reachableLocations = new Set<string>(['starter_port']);
  const referencedNpcs = new Set<string>();

  visit(catalog.events, (record) => {
    const type = record.type;
    if (type === 'scheduleEvent') addString(record.eventId, scheduledTargets);
    if (type === 'addTrait') addString(record.traitId, grantedTraits);
    if (type === 'addItem') addString(record.itemId, grantedItems);
    if (type === 'hasFlag') addString(record.flagId, readFlags);
    if (type === 'setFlag' || type === 'clearFlag') addString(record.flagId, writtenFlags);
    if (type === 'locationIs') addString(record.locationId, referencedLocations);
    if (type === 'moveToLocation' || type === 'loseShip') addString(record.locationId, reachableLocations);
    if (typeof record.npcId === 'string') referencedNpcs.add(record.npcId);
  });

  const warnings: ContentDiagnostic[] = [];
  for (const event of catalog.events) {
    if (event.kind === 'scheduled' && !scheduledTargets.has(event.id)) {
      warnings.push(warning('scheduled-never-scheduled', event.id, `Scheduled Event "${event.id}" is never scheduled.`));
    }
  }
  for (const trait of catalog.traits) {
    if (!grantedTraits.has(trait.id)) warnings.push(warning('trait-never-granted', trait.id, `Trait "${trait.id}" is never granted.`));
  }
  for (const item of catalog.items) {
    if (!grantedItems.has(item.id)) warnings.push(warning('item-never-granted', item.id, `Item "${item.id}" is never granted.`));
  }
  for (const id of readFlags) {
    if (!writtenFlags.has(id)) warnings.push(warning('flag-read-never-written', id, `Flag "${id}" is read but never written.`));
  }
  for (const id of writtenFlags) {
    if (!readFlags.has(id)) warnings.push(warning('flag-written-never-read', id, `Flag "${id}" is written but never read.`));
  }
  for (const id of referencedLocations) {
    if (!reachableLocations.has(id)) warnings.push(warning('location-no-entry-path', id, `Location "${id}" is referenced but has no moveToLocation/loseShip entry path.`));
  }
  for (const npc of catalog.npcs) {
    if (!referencedNpcs.has(npc.id)) warnings.push(warning('npc-never-referenced', npc.id, `NPC "${npc.id}" is never referenced by an Event.`));
  }
  return warnings.sort((left, right) => left.code.localeCompare(right.code) || left.id.localeCompare(right.id));
}

function visit(value: unknown, callback: (record: Record<string, unknown>) => void): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => visit(entry, callback));
    return;
  }
  if (typeof value !== 'object' || value === null) return;
  const record = value as Record<string, unknown>;
  callback(record);
  Object.values(record).forEach((entry) => visit(entry, callback));
}

function addString(value: unknown, target: Set<string>): void {
  if (typeof value === 'string') target.add(value);
}

function warning(code: DiagnosticCode, id: string, message: string): ContentDiagnostic {
  return { severity: 'warning', code, id, message };
}
