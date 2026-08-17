import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../content/definitions';
import { createInitialGameState } from '../model/initialState';
import { createDefaultNpcState } from '../model/npcState';
import type { ContentCatalog } from '../content/schema';
import { evaluateCondition } from './conditions';
import { applyEffects } from './effects';
import { moveItem } from './inventory';
import { deserializeGameState, serializeGameState } from './save';
import { canUseCrewRolePower } from './crewPowers';
import { countCurrentCrew } from './ship';
import { effectivePlayerStat } from './stats';
import { validateContent } from '../validation/validateContent';

const stack = (itemId: string) => ({
  itemId,
  quantity: 1,
  provenance: [{ locationId: null, quantity: 1 }],
});

function withCompanions(): ContentCatalog {
  const catalog = structuredClone(contentCatalog);
  catalog.items.push(
    {
      id: 'test_puppy',
      nameKey: 'item.sealed_chart.name',
      category: 'item',
      stackLimit: 1,
      market: null,
      unique: true,
      companion: true,
      modifiers: { morale: 2 },
    },
    {
      id: 'test_gull',
      nameKey: 'item.sealed_chart.name',
      category: 'item',
      stackLimit: 1,
      market: null,
      unique: true,
      companion: true,
      modifiers: { navigation: 1 },
    },
    {
      id: 'test_charm',
      nameKey: 'item.sealed_chart.name',
      category: 'equipment',
      stackLimit: 1,
      market: null,
      modifiers: { morale: 3 },
    },
  );
  return catalog;
}

describe('Companion Item architecture', () => {
  it('models Companion as an Item, never an NPC definition', () => {
    const catalog = withCompanions();
    expect(catalog.items.find(({ id }) => id === 'test_puppy')).toMatchObject({ category: 'item', companion: true });
    expect(catalog.npcs.some(({ id }) => id === 'test_puppy')).toBe(false);
  });

  it('allows several Companion Items to be owned simultaneously', () => {
    const state = createInitialGameState();
    state.player.inventory.stacks = [stack('test_puppy'), stack('test_gull')];
    expect(state.player.inventory.stacks.map(({ itemId }) => itemId)).toEqual(['test_puppy', 'test_gull']);
  });

  it('activates exactly one Companion and swaps it atomically', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.inventory.stacks = [stack('test_puppy'), stack('test_gull')];

    expect(moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' })).toBe(true);
    expect(state.player.companion?.itemId).toBe('test_puppy');
    expect(state.player.inventory.stacks.map(({ itemId }) => itemId)).toEqual(['test_gull']);

    expect(moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' })).toBe(true);
    expect(state.player.companion?.itemId).toBe('test_gull');
    expect(state.player.inventory.stacks.map(({ itemId }) => itemId)).toEqual(['test_puppy']);
  });

  it('unequips the active Companion back to storage', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.inventory.stacks = [stack('test_puppy')];
    moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' });

    expect(moveItem(state, catalog, { type: 'companion' }, { type: 'pocket', index: 0 })).toBe(true);
    expect(state.player.companion).toBeNull();
    expect(state.player.inventory.stacks[0].itemId).toBe('test_puppy');
  });

  it('applies the active Companion bonus exactly once without mutating base Stats', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.inventory.stacks = [stack('test_puppy')];
    moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' });

    expect(state.player.stats.morale).toBe(25);
    expect(effectivePlayerStat(state, catalog, 'morale')).toBe(27);
    expect(effectivePlayerStat(state, catalog, 'morale')).toBe(27);
    expect(state.player.stats.morale).toBe(25);
  });

  it('removes the Companion bonus when unequipped', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.inventory.stacks = [stack('test_puppy')];
    moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' });
    moveItem(state, catalog, { type: 'companion' }, { type: 'pocket', index: 0 });

    expect(effectivePlayerStat(state, catalog, 'morale')).toBe(25);
  });

  it('combines Equipment and Companion modifiers without sharing slots', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.equipment[0] = stack('test_charm');
    state.player.companion = stack('test_puppy');

    expect(effectivePlayerStat(state, catalog, 'morale')).toBe(30);
    expect(state.player.equipment[0]?.itemId).toBe('test_charm');
    expect(state.player.companion?.itemId).toBe('test_puppy');
  });

  it('does not consume crew capacity', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.ship = { shipId: 'dinghy', name: 'Test', health: 18, cargo: [] };
    state.player.companion = stack('test_puppy');

    expect(countCurrentCrew(state)).toBe(0);
    expect(catalog.ships.find(({ id }) => id === 'dinghy')?.crewCapacity).toBe(1);
  });

  it('does not create NpcState while activating or swapping', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    const beforeNpcIds = Object.keys(state.npcs);
    state.player.inventory.stacks = [stack('test_puppy'), stack('test_gull')];

    moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' });
    moveItem(state, catalog, { type: 'pocket', index: 0 }, { type: 'companion' });

    expect(Object.keys(state.npcs)).toEqual(beforeNpcIds);
  });

  it('evaluates hasActiveCompanion against the Item slot', () => {
    const state = createInitialGameState();
    expect(evaluateCondition({ type: 'hasActiveCompanion' }, state)).toBe(false);
    state.player.companion = stack('test_puppy');
    expect(evaluateCondition({ type: 'hasActiveCompanion' }, state)).toBe(true);
  });

  it('evaluates activeCompanionIs with ItemId', () => {
    const state = createInitialGameState();
    state.player.companion = stack('test_puppy');
    expect(evaluateCondition({ type: 'activeCompanionIs', itemId: 'test_puppy' }, state)).toBe(true);
    expect(evaluateCondition({ type: 'activeCompanionIs', itemId: 'test_gull' }, state)).toBe(false);
  });

  it('preserves the active Companion through save/load', () => {
    const state = createInitialGameState();
    state.player.companion = stack('test_puppy');
    expect(deserializeGameState(serializeGameState(state))?.player.companion).toEqual(stack('test_puppy'));
  });

  it('migrates Save 21 through Save 23 without keeping the legacy NPC-Companion model', () => {
    const current = createInitialGameState();
    const { companion: _companion, ...legacyPlayer } = current.player;
    const legacy = {
      ...current,
      version: 21,
      player: legacyPlayer,
      companionNpcId: 'mira',
    };

    const migrated = deserializeGameState(JSON.stringify(legacy));
    expect(migrated?.version).toBe(23);
    expect(migrated?.player.companion).toBeNull();
    expect(migrated && 'companionNpcId' in migrated).toBe(false);
  });

  it.each(['dead', 'departed'] as const)('NPC %s does not affect the active Companion Item', (status) => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.companion = stack('test_puppy');
    state.npcs.mira = { ...createDefaultNpcState(), status: 'known' };

    const next = applyEffects(
      state,
      catalog,
      [{ type: 'setNpcStatus', npcId: 'mira', status, allowWithoutLeadership: true }],
      { sourceEventId: 'test', sourceChoiceId: 'test' },
    );

    expect(next.npcs.mira.status).toBe(status);
    expect(next.player.companion?.itemId).toBe('test_puppy');
  });

  it('keeps Crew powers independent from Companion Items', () => {
    const catalog = withCompanions();
    const state = createInitialGameState();
    state.player.companion = stack('test_puppy');
    state.npcs.mira = { ...createDefaultNpcState(), status: 'crew', crewRoleId: 'navigator', statsGenerated: true };
    state.locationId = 'foosha_village';
    state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
    state.isLeader = true;

    expect(countCurrentCrew(state)).toBe(1);
    expect(canUseCrewRolePower(state, catalog, 'navigator')).toBe(true);
  });

  it('validates activeCompanionIs against Companion Item IDs, not NPC IDs', () => {
    const catalog = withCompanions();
    const event = catalog.events.find(({ kind }) => kind === 'normal');
    expect(event).toBeDefined();

    event!.eligibility = { type: 'activeCompanionIs', itemId: 'test_puppy' };
    expect(validateContent(catalog).some(({ message }) => message.includes('Companion ItemId'))).toBe(false);

    event!.eligibility = { type: 'activeCompanionIs', itemId: 'mira' };
    expect(validateContent(catalog).some(({ message }) => message.includes('Companion ItemId'))).toBe(true);
  });
});
