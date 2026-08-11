import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { evaluateCondition } from '../src/game/engine/conditions';
import { applyEffects } from '../src/game/engine/effects';
import { canAcquireShip } from '../src/game/engine/ship';
import { deserializeGameState } from '../src/game/engine/save';
import { createInitialGameState } from '../src/game/model/initialState';

const context = { sourceEventId: 'readiness', sourceChoiceId: 'check' };

describe('Content Authoring Readiness V1', () => {
  it('exposes the exact V1 trait, crew, ship, rank, Location, and Fruit rosters', () => {
    expect(contentCatalog.traits).toHaveLength(28);
    expect(contentCatalog.traits.filter(({ oppositeTraitId }) => oppositeTraitId !== undefined)).toHaveLength(20);
    expect(contentCatalog.crewRoles.map(({ id }) => id)).toEqual(['navigator','medic','cook','shipwright','helmsman','gunner','musician','scholar','fighter','quartermaster']);
    expect(contentCatalog.ships.map(({ id }) => id)).toEqual(['dinghy','sloop','caravel','brig','merchant_ship','galleon']);
    expect(contentCatalog.careerRanks.filter(({ affiliationId }) => affiliationId === 'marine')).toHaveLength(10);
    expect(contentCatalog.careerRanks.filter(({ affiliationId }) => affiliationId === 'revolutionary')).toHaveLength(5);
    expect(contentCatalog.careerRanks.filter(({ affiliationId }) => affiliationId === 'bounty_hunter')).toHaveLength(5);
    expect(contentCatalog.locations).toHaveLength(188);
    expect(contentCatalog.locations.filter(({ seaId }) => seaId === 'east_blue')).toHaveLength(20);
    expect(contentCatalog.locations.filter(({ seaId }) => seaId === 'west_blue')).toHaveLength(20);
    expect(contentCatalog.locations.filter(({ seaId }) => seaId === 'north_blue')).toHaveLength(20);
    expect(contentCatalog.locations.filter(({ seaId }) => seaId === 'south_blue')).toHaveLength(20);
    expect(contentCatalog.devilFruits).toHaveLength(45);
    expect(contentCatalog.devilFruits.filter(({ playableV1 }) => playableV1)).toHaveLength(20);
    expect(contentCatalog.devilFruits.filter(({ playableV1 }) => !playableV1)).toHaveLength(25);
  });

  it('evaluates generic ranks plus authored Location tags and services', () => {
    const state = createInitialGameState();
    state.player.career = { affiliationId: 'revolutionary', reputation: 0, bounty: 0, rankId: 'revolutionary_officer', titleId: null };
    state.locationId = 'loguetown';
    expect(evaluateCondition({ type: 'careerRankAtLeast', rankId: 'revolutionary_agent' }, state, contentCatalog)).toBe(true);
    expect(evaluateCondition({ type: 'careerRankAtLeast', rankId: 'marine_recruit' }, state, contentCatalog)).toBe(false);
    const location = contentCatalog.locations.find(({ id }) => id === 'loguetown')!;
    expect(evaluateCondition({ type: 'locationHasTag', tagId: location.tags[0] }, state, contentCatalog)).toBe(true);
    expect(evaluateCondition({ type: 'locationHasService', serviceId: location.services[0] }, state, contentCatalog)).toBe(true);
  });

  it('enforces ship markets and keeps reference-only Fruits non-consumable', () => {
    const state = createInitialGameState();
    state.ship = null;
    state.locationId = 'arlong_park';
    expect(canAcquireShip(state, contentCatalog, 'dinghy')).toBe(false);
    state.locationId = 'foosha_village';
    expect(canAcquireShip(state, contentCatalog, 'dinghy')).toBe(true);
    expect(canAcquireShip(state, contentCatalog, 'galleon')).toBe(false);
    state.locationId = 'loguetown';
    expect(canAcquireShip(state, contentCatalog, 'galleon')).toBe(true);
    const referenceOnly = contentCatalog.devilFruits.find(({ playableV1 }) => !playableV1)!;
    expect(referenceOnly.itemId).toBeNull();
    expect(evaluateCondition({ type: 'canConsumeDevilFruit', fruitId: referenceOnly.id }, state, contentCatalog)).toBe(false);
  });

  it('instantiates stable same-race parent NPCs and preserves them through save/load', () => {
    let state = createInitialGameState();
    state = applyEffects(state, contentCatalog, [{ type: 'setRace', raceId: 'mink' }, { type: 'setFamilyStructure', familyStructureId: 'two_parents' }], context);
    expect(state.npcs.player_parent_1.raceId).toBe('mink');
    expect(state.npcs.player_parent_2.raceId).toBe('mink');
    expect(deserializeGameState(JSON.stringify(state))?.npcs.player_parent_2.raceId).toBe('mink');
  });

  it('migrates v14 rank, Reputation, NPC race, and legacy ship IDs to the current save version', () => {
    const legacy = structuredClone(createInitialGameState()) as unknown as Record<string, any>;
    legacy.version = 14;
    legacy.player.career = { affiliationId: 'marine', reputation: 140, bounty: 0, marineRankId: 'captain', titleId: null };
    legacy.ship = { shipId: 'starter_sloop', name: 'Legacy Sloop', health: 30, cargo: [] };
    for (const npc of Object.values(legacy.npcs) as Record<string, any>[]) delete npc.raceId;
    expect(deserializeGameState(JSON.stringify(legacy))).toMatchObject({
      version: 17,
      ship: { shipId: 'sloop' },
      player: { career: { affiliationId: 'marine', reputation: 100, rankId: 'marine_commodore' } },
      npcs: { mira: { raceId: null } },
    });
  });
});
