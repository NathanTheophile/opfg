import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import type { Condition, Effect, EventDefinition } from '../src/game/content/schema';

const PREFIX = 'active_generic_sea_04_nav_hazard_';
const batch = contentCatalog.events.filter(({ id }) => id.startsWith(PREFIX));
const roots = batch.filter(({ kind }) => kind === 'normal');
const immediates = batch.filter(({ kind }) => kind === 'immediate');
const byId = new Map(batch.map((event) => [event.id, event] as const));

function hasCondition(condition: Condition | undefined, type: Condition['type'], fields: Record<string, unknown> = {}): boolean {
  if (!condition) return false;
  if (condition.type === type && Object.entries(fields).every(([key, value]) => (condition as unknown as Record<string, unknown>)[key] === value)) return true;
  if (condition.type === 'all' || condition.type === 'any') return condition.conditions.some((child) => hasCondition(child, type, fields));
  if (condition.type === 'not') return hasCondition(condition.condition, type, fields);
  return false;
}

function outcomes(event: EventDefinition) {
  return event.choices.flatMap(({ resolution }) =>
    resolution.type === 'deterministic' ? [resolution.outcome] : Object.values(resolution.outcomes));
}

function effects(event: EventDefinition): Effect[] {
  return outcomes(event).flatMap((outcome) => outcome.effects);
}

function queueTargets(event: EventDefinition): string[] {
  return effects(event)
    .filter((effect): effect is Extract<Effect, { type: 'queueImmediateEvent' }> => effect.type === 'queueImmediateEvent')
    .map(({ eventId }) => eventId);
}

function hasRootDice(event: EventDefinition): boolean {
  return event.choices.some(({ resolution }) => resolution.type === 'dice');
}

function maxImmediateDepth(eventId: string, visited = new Set<string>()): number {
  if (visited.has(eventId)) throw new Error(`Immediate cycle at ${eventId}`);
  const nextVisited = new Set(visited);
  nextVisited.add(eventId);
  const event = byId.get(eventId);
  if (!event) throw new Error(`Missing Event ${eventId}`);
  const targets = queueTargets(event);
  return targets.length === 0
    ? 0
    : 1 + Math.max(...targets.map((target) => maxImmediateDepth(target, nextVisited)));
}

describe('ACTIVE_GENERIC_SEA_04_NAV_HAZARD', () => {
  it('owns exactly 20 Normal roots and 18 Immediate continuations, with no Scheduled content', () => {
    expect(batch).toHaveLength(38);
    expect(roots).toHaveLength(20);
    expect(immediates).toHaveLength(18);
    expect(batch.some(({ kind }) => kind === 'scheduled')).toBe(false);
    expect(batch.every((event) => !('lifetimeThreadSeed' in event) && !('majorTrack' in event) && !('replay' in event))).toBe(true);
  });

  it('keeps every root Active + at-sea + personal-ship eligible and always resolvable', () => {
    for (const root of roots) {
      expect(hasCondition(root.eligibility, 'careerPhaseIs', { phase: 'active' }), root.id).toBe(true);
      expect(hasCondition(root.eligibility, 'isAtSea'), root.id).toBe(true);
      expect(hasCondition(root.eligibility, 'hasShip'), root.id).toBe(true);
      expect(root.choices.some((choice) => choice.availableIf === undefined), root.id).toBe(true);
    }
  });

  it('hits the Generic Sea continuity and Dice targets without inflating depth', () => {
    const miniArcRoots = roots.filter((root) => queueTargets(root).length > 0);
    const diceRoots = roots.filter(hasRootDice);
    const depths = roots.map(({ id }) => maxImmediateDepth(id));

    expect(miniArcRoots).toHaveLength(15);
    expect(diceRoots).toHaveLength(13);
    expect(depths.filter((depth) => depth === 2)).toHaveLength(3);
    expect(Math.max(...depths)).toBe(2);
  });

  it('keeps all Immediate links inside the batch and marks every ship-damage outcome as an accident', () => {
    for (const event of batch) {
      for (const target of queueTargets(event)) {
        expect(target.startsWith(PREFIX), `${event.id} -> ${target}`).toBe(true);
        expect(byId.get(target)?.kind, `${event.id} -> ${target}`).toBe('immediate');
      }

      for (const outcome of outcomes(event)) {
        const damagesShip = outcome.effects.some((effect) => effect.type === 'modifyShipHealth' && effect.amount < 0);
        if (damagesShip) expect(outcome.shipDamageCause, `${event.id}/${outcome.id}`).toBe('accident');
      }
    }
  });

  it('does not author travel, Scheduled, career-change or persistent-definition side effects', () => {
    const forbidden = new Set([
      'scheduleEvent',
      'moveToLocation',
      'recoverTravel',
      'moveToSameIslandPort',
      'recoverToLandInCurrentSea',
      'recoverToOtherRegion',
      'setCareerAffiliation',
      'setFlag',
      'clearFlag',
      'addItem',
      'removeItem',
      'acquireShip',
      'loseShip',
      'beginMaritimeEmergency',
    ]);

    for (const event of batch) {
      for (const effect of effects(event)) {
        expect(forbidden.has(effect.type), `${event.id}: ${effect.type}`).toBe(false);
      }
    }
  });

  it('uses Paradise no-Log-Pose pressure only as a modifier inside the magnetic-squall scene', () => {
    const magnetic = byId.get(`${PREFIX}magnetic_squall`);
    expect(magnetic?.kind).toBe('normal');

    const modifierChoices = magnetic!.choices
      .filter(({ resolution }) => resolution.type === 'dice')
      .flatMap(({ resolution }) => resolution.type === 'dice' ? resolution.modifiers ?? [] : []);

    expect(modifierChoices).toHaveLength(3);
    for (const modifier of modifierChoices) {
      expect(modifier.value).toBe(-2);
      expect(hasCondition(modifier.condition, 'currentSeaIs', { seaId: 'grand_line_paradise' })).toBe(true);
      expect(hasCondition(modifier.condition, 'activeLogPoseIs', { logPoseType: 'paradise' })).toBe(true);
      expect(modifier.condition.type).toBe('all');
    }
  });
});
