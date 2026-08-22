import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../content/definitions';
import { createInitialGameState } from '../model/initialState';
import { createDefaultNpcState } from '../model/npcState';
import { assignCrewRoleToRecruit, completeAnnualCrewReassignment } from './crew';
import { canUseCrewRolePower, useCrewRolePower } from './crewPowers';
import { evaluateCondition } from './conditions';
import { applyEffects } from './effects';
import { ensureNpcMaterialized } from './npcNames';
import { canAcquireShip, canRecruitNpc, maxCrewSize } from './ship';
import { effectiveNpcStat, effectivePlayerStat } from './stats';
import { consumePhaseSlot } from './time';

const crewNpc = (roleId: string | null, health = 25) => ({
  ...createDefaultNpcState(),
  status: 'crew' as const,
  crewRoleId: roleId,
  statsGenerated: true,
  stats: { ...createDefaultNpcState().stats, health },
});

describe('crew runtime redesign', () => {
  it('derives crew capacity from no-ship base 3 or the owned ship', () => {
    const state = createInitialGameState();
    expect(maxCrewSize(state, contentCatalog)).toBe(3);
    state.ship = { shipId: 'caravel', name: 'Test', health: 38, cargo: [] };
    expect(maxCrewSize(state, contentCatalog)).toBe(5);
  });

  it('keeps an overflowing crew after ship loss and blocks recruitment', () => {
    const state = createInitialGameState();
    state.npcs.a = crewNpc('cook');
    state.npcs.b = crewNpc('musician');
    state.npcs.c = crewNpc('scholar');
    state.npcs.d = crewNpc('helmsman');
    expect(maxCrewSize(state, contentCatalog)).toBe(3);
    expect(canRecruitNpc(state, contentCatalog, 'mira')).toBe(false);
    expect(Object.values(state.npcs).filter(({ status }) => status === 'crew')).toHaveLength(4);
  });

  it('refuses ships that cannot hold the current crew', () => {
    const state = createInitialGameState();
    state.locationId = 'loguetown';
    state.npcs.a = crewNpc('cook');
    state.npcs.b = crewNpc('musician');
    state.npcs.c = crewNpc('scholar');
    expect(canAcquireShip(state, contentCatalog, 'dinghy')).toBe(false);
    expect(canAcquireShip(state, contentCatalog, 'sloop')).toBe(true);
  });

  it('assigns a recruited crewmate to one vacant runtime role', () => {
    const state = createInitialGameState();
    state.npcs.mira = crewNpc(null);
    assignCrewRoleToRecruit(state, contentCatalog, 'mira', 'navigator');
    expect(state.npcs.mira.crewRoleId).toBe('navigator');
    expect(() => assignCrewRoleToRecruit(state, contentCatalog, 'mira', 'cook')).toThrow();
  });

  it('atomically swaps the whole crew only during the annual panel', () => {
    const state = createInitialGameState();
    state.npcs.a = crewNpc('cook');
    state.npcs.b = crewNpc('musician');
    state.crewReassignmentPending = true;
    completeAnnualCrewReassignment(state, contentCatalog, { cook: 'b', musician: 'a' });
    expect(state.npcs.a.crewRoleId).toBe('musician');
    expect(state.npcs.b.crewRoleId).toBe('cook');
    expect(state.crewReassignmentPending).toBe(false);
  });

  it('disables every Active Role without a ship', () => {
    const state = createInitialGameState();
    state.npcs.mira = crewNpc('navigator');
    expect(canUseCrewRolePower(state, contentCatalog, 'navigator')).toBe(false);
  });

  it('keeps annual cooldown on the role and lets First Mate recharge another role', () => {
    const state = createInitialGameState();
    state.player.profile.raceId = 'human';
    state.ship = { shipId: 'sloop', name: 'Test', health: 30, cargo: [] };
    state.npcs.a = crewNpc('medic', 10);
    state.npcs.b = crewNpc('first_mate');
    useCrewRolePower(state, contentCatalog, 'medic');
    expect(canUseCrewRolePower(state, contentCatalog, 'medic')).toBe(false);
    expect(canUseCrewRolePower(state, contentCatalog, 'first_mate')).toBe(true);
    useCrewRolePower(state, contentCatalog, 'first_mate', 'medic');
    expect(canUseCrewRolePower(state, contentCatalog, 'medic')).toBe(true);
    expect(() => useCrewRolePower(state, contentCatalog, 'first_mate', 'first_mate')).toThrow();
  });

  it('Medic heals Player and every living crewmate', () => {
    const state = createInitialGameState();
    state.player.profile.raceId = 'human';
    state.player.stats.health = 10;
    state.ship = { shipId: 'sloop', name: 'Test', health: 30, cargo: [] };
    state.npcs.a = crewNpc('medic', 5);
    state.npcs.b = crewNpc('cook', 7);
    useCrewRolePower(state, contentCatalog, 'medic');
    expect(state.player.stats.health).toBe(15);
    expect(state.npcs.a.stats.health).toBe(10);
    expect(state.npcs.b.stats.health).toBe(12);
  });

  it('applies passive role and active Companion Stats globally to Player + Crew', () => {
    const catalog = structuredClone(contentCatalog);
    const cook = catalog.crewRoles.find(({ id }) => id === 'cook')!;
    cook.passive = { type: 'globalStats', statIds: ['strength', 'agility'], amount: 2 };
    catalog.items.push({
      id: 'test_companion',
      nameKey: 'item.sealed_chart.name',
      category: 'item',
      stackLimit: 1,
      market: null,
      companion: true,
      modifiers: { strength: 3 },
    });

    const state = createInitialGameState();
    state.npcs.a = crewNpc('cook');
    state.npcs.b = crewNpc('musician');
    state.player.companion = { itemId: 'test_companion', quantity: 1, provenance: [{ locationId: null, quantity: 1 }] };

    expect(effectivePlayerStat(state, catalog, 'strength')).toBe(30);
    expect(effectiveNpcStat(state, catalog, 'a', 'strength')).toBe(30);
    expect(effectiveNpcStat(state, catalog, 'b', 'strength')).toBe(30);
  });

  it('resolves hasCrewRole from runtime assignment, not NpcDefinition', () => {
    const state = createInitialGameState();
    state.npcs.mira = crewNpc('cook');
    expect(evaluateCondition({ type: 'hasCrewRole', roleId: 'cook' }, state, contentCatalog)).toBe(true);
    expect(evaluateCondition({ type: 'hasCrewRole', roleId: 'navigator' }, state, contentCatalog)).toBe(false);
  });

  it('generates seeded NPC Stats once, in 10..40, with a guaranteed 10 and 40', () => {
    const a = createInitialGameState(12345);
    const b = createInitialGameState(12345);
    const c = createInitialGameState(54321);

    const aNpc = ensureNpcMaterialized(a, contentCatalog, 'childhood_friend');
    const bNpc = ensureNpcMaterialized(b, contentCatalog, 'childhood_friend');
    const cNpc = ensureNpcMaterialized(c, contentCatalog, 'childhood_friend');

    expect(aNpc.stats).toEqual(bNpc.stats);
    expect(cNpc.stats).not.toEqual(aNpc.stats);
    expect(Object.values(aNpc.stats).every((value) => value >= 10 && value <= 40)).toBe(true);
    const d20 = ['morale', 'strength', 'agility', 'observation', 'intelligence', 'navigation', 'charisma', 'luck'] as const;
    expect(d20.map((id) => aNpc.stats[id])).toContain(10);
    expect(d20.map((id) => aNpc.stats[id])).toContain(40);

    const snapshot = structuredClone(aNpc.stats);
    expect(ensureNpcMaterialized(a, contentCatalog, 'childhood_friend').stats).toEqual(snapshot);
  });

  it('allows explicit fixed NPC Stats as an exception', () => {
    const catalog = structuredClone(contentCatalog);
    catalog.npcs.push({
      id: 'fixed_test',
      nameKey: 'npc.mira.name',
      sex: 'male',
      raceId: null,
      originSeaId: null,
      affiliationId: null,
      initialStats: {
        health: 12, morale: 13, strength: 14, agility: 15, observation: 16,
        intelligence: 17, navigation: 18, charisma: 19, luck: 20,
      },
    });
    const state = createInitialGameState(1);
    expect(ensureNpcMaterialized(state, catalog, 'fixed_test').stats.strength).toBe(14);
  });

  it('locks a role vacated by departure until the next year', () => {
    const state = createInitialGameState();
    state.ageMonths = 180;
    state.npcs.a = crewNpc('cook');
    state.npcs.b = crewNpc(null);
    const context = { sourceEventId: 'fixture', sourceChoiceId: 'choice' };
    const departed = applyEffects(state, contentCatalog, [{ type: 'setNpcStatus', npcId: 'a', status: 'departed' }], context);
    expect(departed.crewRoleVacatedYear.cook).toBe(15);
    expect(() => assignCrewRoleToRecruit(departed, contentCatalog, 'b', 'cook')).toThrow(/vacated this year/);
    departed.ageMonths = 192;
    assignCrewRoleToRecruit(departed, contentCatalog, 'b', 'cook');
    expect(departed.npcs.b.crewRoleId).toBe('cook');
  });

  it('opens the annual crew reassignment gate at a birthday', () => {
    const state = createInitialGameState();
    state.careerPhase = 'active';
    state.ageMonths = 191;
    state.player.profile.raceId = 'human';
    state.npcs.a = crewNpc('cook');
    const next = consumePhaseSlot(state, 'active', contentCatalog);
    expect(next.ageMonths).toBe(192);
    expect(next.crewReassignmentPending).toBe(true);
  });

  it('regenerates 2 Player HP on each birthday', () => {
    const state = createInitialGameState();
    state.careerPhase = 'active';
    state.ageMonths = 191;
    state.player.profile.raceId = 'human';
    state.player.stats.health = 20;
    const next = consumePhaseSlot(state, 'active', contentCatalog);
    expect(next.ageMonths).toBe(192);
    expect(next.player.stats.health).toBe(22);
  });
});
