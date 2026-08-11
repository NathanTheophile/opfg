import type { ContentCatalog } from '../content/schema';

export type DiagnosticCode =
  | 'scheduled-never-scheduled'
  | 'trait-never-granted'
  | 'item-never-granted'
  | 'flag-read-never-written'
  | 'flag-written-never-read'
  | 'location-no-entry-path'
  | 'npc-never-referenced'
  | 'replay-persistent-effect'
  | 'replay-self-history'
  | 'health-no-restoration'
  | 'health-high-damage'
  | 'normal-pool-low'
  | 'critical-player-death-missing'
  | 'career-horizon-missing';

const REPLAY_SUSPECT_EFFECTS = new Set([
  'setFlag','clearFlag','addItem','removeItem','addTrait','removeTrait','modifyStat','modifyHealth',
  'acquireShip','loseShip','modifyShipHealth','addCargoItem','removeCargoItem','resolveShipReplacement',
  'modifyBerries','moveToLocation','setBirthLocation','setNpcStatus','setNpcPassenger','setLeadership',
  'modifyNpcRelationship','modifyNpcStat','scheduleEvent','queueImmediateEvent','setCareerPhase','setRace',
  'setOriginSea','setAffiliation','setFamilyStructure','setSocialClass','endCareer','consumeDevilFruit',
  'increaseDevilFruitAwakening','awakenHaki','raiseConquerorHakiTo','setNpcDevilFruit',
  'increaseNpcDevilFruitAwakening','raiseNpcHakiTo','setCareerAffiliation','modifyReputation','setBounty',
  'modifyBounty','setCareerRank','setCareerTitle','clearCareerTitle','endCareerWithEnding',
]);

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
  const reachableLocations = new Set<string>(['foosha_village']);
  const referencedNpcs = new Set<string>();

  visit(catalog.events, (record) => {
    const type = record.type;
    if (type === 'scheduleEvent') addString(record.eventId, scheduledTargets);
    if (type === 'addTrait') addString(record.traitId, grantedTraits);
    if (type === 'addItem') addString(record.itemId, grantedItems);
    if (type === 'hasFlag') addString(record.flagId, readFlags);
    if (type === 'setFlag' || type === 'clearFlag') addString(record.flagId, writtenFlags);
    if (type === 'locationIs' || type === 'locationWithin') addString(record.locationId, referencedLocations);
    if (type === 'moveToLocation' || type === 'loseShip' || type === 'setBirthLocation') addString(record.locationId, reachableLocations);
    if (typeof record.npcId === 'string') referencedNpcs.add(record.npcId);
  });

  const warnings: ContentDiagnostic[] = [];
  for (const event of catalog.events) {
    if (event.kind === 'scheduled' && !scheduledTargets.has(event.id)) {
      warnings.push(warning('scheduled-never-scheduled', event.id, `Scheduled Event "${event.id}" is never scheduled.`));
    }
    if (event.kind === 'normal' && event.replay !== undefined) {
      const suspectTypes = new Set<string>();
      let selfHistory = false;
      visit(event, (record) => {
        if (typeof record.type === 'string' && REPLAY_SUSPECT_EFFECTS.has(record.type)) suspectTypes.add(record.type);
        if (['hasPlayed', 'hasChosen', 'hasOutcome'].includes(String(record.type)) && record.eventId === event.id) selfHistory = true;
      });
      if (suspectTypes.size > 0) warnings.push(warning('replay-persistent-effect', event.id, `Replayable Event "${event.id}" contains persistent/suspect effects: ${[...suspectTypes].sort().join(', ')}.`));
      if (selfHistory) warnings.push(warning('replay-self-history', event.id, `Replayable Event "${event.id}" depends on its own History.`));
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
  const healthAmounts: number[] = [];
  visit(catalog.events, (record) => { if (record.type === 'modifyHealth' && typeof record.amount === 'number') healthAmounts.push(record.amount); });
  if (!healthAmounts.some((amount) => amount > 0)) warnings.push(warning('health-no-restoration', 'player', 'No authored player Health restoration exists outside initialization (annual recovery still applies).'));
  const maxHealth = Math.max(...catalog.races.map(({ initialHealth }) => initialHealth), 0);
  if (healthAmounts.some((amount) => amount < -maxHealth)) warnings.push(warning('health-high-damage', 'player', `Some Health damage exceeds the highest racial max Health (${maxHealth}).`));
  const activeNormals = catalog.events.filter((event) => event.kind === 'normal' && event.eligibility !== undefined && JSON.stringify(event.eligibility).includes('"phase":"active"'));
  for (const travel of ['isAtSea', 'isOnLand'] as const) {
    const count = activeNormals.filter((event) => JSON.stringify(event.eligibility).includes(`"type":"${travel}"`)).length;
    if (count < 10) warnings.push(warning('normal-pool-low', travel, `Statically identified Active Normal pool for ${travel} is low (${count}).`));
  }
  if (!catalog.events.some((event) => event.kind === 'critical' && event.trigger.type === 'playerHealthDepleted')) warnings.push(warning('critical-player-death-missing', 'critical_player_death', 'Critical player death Event is missing.'));
  const horizon = catalog.events.find((event) => event.kind === 'critical' && event.trigger.type === 'careerAgeAtLeast' && event.trigger.value === 420);
  if (!horizon || !catalog.endings.some(({ id }) => id === 'v1_career_horizon')) warnings.push(warning('career-horizon-missing', 'v1_career_horizon', 'V1 career horizon Critical Event or Ending is missing.'));
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
