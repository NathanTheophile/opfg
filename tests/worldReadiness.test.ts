import { describe, expect, it } from 'vitest';
import type { ContentCatalog, EventDefinition } from '../src/game/content/schema';
import { contentCatalog } from '../src/game/content/definitions';
import worldData from '../src/game/content/data/locationsV1.json';
import { evaluateCondition } from '../src/game/engine/conditions';
import { selectNextEvent } from '../src/game/engine/events';
import { getLocationDisplayName } from '../src/game/engine/locations';
import { getMonthlyNavigationOptions } from '../src/game/engine/navigation';
import { createInitialGameState } from '../src/game/model/initialState';
import { simulateRun } from '../src/game/simulation/simulateRun';
import { validateContent } from '../src/game/validation/validateContent';

const blues = ['east_blue', 'west_blue', 'north_blue', 'south_blue'];

function activeState(locationId = 'foosha_village', travelState: 'on_land' | 'at_sea' = 'on_land') {
  const state = createInitialGameState(1);
  state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
  state.careerPhase = 'active'; state.ageMonths = 180; state.locationId = locationId; state.travelState = travelState;
  state.navigationDecisionAgeMonths = state.ageMonths;
  return state;
}

describe('World V1 readiness', () => {
  it('loads the exact runtime roster while Origins remains limited to the four Blues', () => {
    expect(contentCatalog.locations).toHaveLength(188);
    for (const seaId of blues) {
      const locations = contentCatalog.locations.filter((location) => location.seaId === seaId);
      expect(locations).toHaveLength(20);
      expect(locations.filter(({ canBeBirthLocation }) => canBeBirthLocation)).toHaveLength(8);
    }
    expect(contentCatalog.locations.filter(({ seaId, canBeBirthLocation }) => !blues.includes(seaId) && canBeBirthLocation)).toHaveLength(0);
    expect(contentCatalog.locations.some(({ id }) => id === 'egghead_island')).toBe(false);
    expect(contentCatalog.seas.map(({ id }) => id)).toEqual(expect.arrayContaining(['grand_line_paradise', 'new_world', 'sky', 'underwater', 'calm_belt', 'red_line']));
    expect(contentCatalog.events.find(({ id }) => id === 'origin_sea')?.choices.map(({ id }) => id)).toEqual(blues);
  });

  it('evaluates currentSeaIs and hierarchical locationWithin', () => {
    const state = activeState('rainbase');
    expect(evaluateCondition({ type: 'currentSeaIs', seaId: 'grand_line_paradise' }, state, contentCatalog)).toBe(true);
    expect(evaluateCondition({ type: 'locationWithin', locationId: 'rainbase' }, state, contentCatalog)).toBe(true);
    expect(evaluateCondition({ type: 'locationWithin', locationId: 'alabasta_kingdom' }, state, contentCatalog)).toBe(true);
    expect(evaluateCondition({ type: 'locationWithin', locationId: 'water_seven' }, state, contentCatalog)).toBe(false);
  });

  it('rejects missing, self, and cyclic parents', () => {
    for (const parentLocationId of ['missing', 'rainbase']) {
      const catalog = structuredClone(contentCatalog) as ContentCatalog;
      catalog.locations.find(({ id }) => id === 'rainbase')!.parentLocationId = parentLocationId;
      expect(validateContent(catalog).some(({ message }) => /parent|LocationId/i.test(message))).toBe(true);
    }
    const cyclic = structuredClone(contentCatalog) as ContentCatalog;
    cyclic.locations.find(({ id }) => id === 'alabasta_kingdom')!.parentLocationId = 'rainbase';
    expect(validateContent(cyclic).some(({ message }) => /cycle/i.test(message))).toBe(true);
  });

  it('formats root and child, or the current root alone', () => {
    const translate = (key: string) => ({ 'location.alabasta_kingdom.name': 'Alabasta Kingdom', 'location.rainbase.name': 'Rainbase', 'location.water_seven.name': 'Water Seven' }[key] ?? key);
    expect(getLocationDisplayName(contentCatalog, 'rainbase', translate)).toBe('Alabasta Kingdom - Rainbase');
    expect(getLocationDisplayName(contentCatalog, 'water_seven', translate)).toBe('Water Seven');
  });

  it('allows destination sailing through a dockable ancestor and blocks inaccessible land', () => {
    const ancestor = activeState('rainbase'); ancestor.navigationDecisionAgeMonths = null;
    const inaccessible = activeState('arlong_park'); inaccessible.navigationDecisionAgeMonths = null;
    expect(getMonthlyNavigationOptions(ancestor, contentCatalog)).toContainEqual({ id: 'sailTo:jaya_island', destinationId: 'jaya_island', available: true });
    expect(getMonthlyNavigationOptions(inaccessible, contentCatalog).filter(({ id }) => id.startsWith('sailTo:')).every(({ available }) => !available)).toBe(true);
  });

  it('keeps seeded Normal selection uniform without route state', () => {
    const events = ['route_a', 'route_b'].map((id): EventDefinition => ({ id, kind: 'normal', titleKey: 'x', textKey: 'x', choices: [] }));
    const catalog = { ...contentCatalog, events };
    const selected = new Set(Array.from({ length: 64 }, (_, seed) => selectNextEvent({ ...activeState(), rngState: seed }, catalog).currentEventId));
    expect(selected).toEqual(new Set(['route_a', 'route_b']));
    expect('routeId' in activeState()).toBe(false);
  });

  it('uses repeatable Active-only fallbacks only after the real Normal pool is empty', () => {
    const real = contentCatalog.events.find(({ id }) => id === 'departure')!;
    const fallbacks = contentCatalog.events.filter(({ id }) => id === 'dead_end_on_land' || id === 'dead_end_at_sea');
    const eligibleReal = { ...real, eligibility: undefined } as EventDefinition;
    expect(selectNextEvent(activeState(), { ...contentCatalog, events: [eligibleReal, ...fallbacks] }).currentEventId).toBe('departure');
    const fallbackCatalog = { ...contentCatalog, events: fallbacks };
    expect(selectNextEvent(activeState(), fallbackCatalog).currentEventId).toBe('dead_end_on_land');
    expect(selectNextEvent(activeState('foosha_village', 'at_sea'), fallbackCatalog).currentEventId).toBe('dead_end_at_sea');
    const repeated = activeState(); repeated.history.push({ eventId: 'dead_end_on_land', choiceId: 'recover', outcomeId: 'recovered', ageMonths: 180 });
    expect(selectNextEvent(repeated, fallbackCatalog).currentEventId).toBe('dead_end_on_land');
    const childhood = activeState(); childhood.careerPhase = 'childhood';
    expect(selectNextEvent(childhood, fallbackCatalog).currentEventId).toBeNull();
  });

  it('aggregates fallback diagnostics', () => {
    const fallbacks = contentCatalog.events.filter(({ id }) => id === 'dead_end_on_land' || id === 'dead_end_at_sea');
    const result = simulateRun({ seed: 1, catalog: { ...contentCatalog, events: fallbacks }, initialState: activeState(), maxResolvedEvents: 2 });
    expect(result.fallbackEvents).toEqual({ land: 1, sea: 1, total: 2 });
    const metadata = worldData.outsideBlueLocations.find(({ id }) => id === result.finalState.locationId);
    expect(metadata?.access === undefined || metadata.access === 'normal' || metadata.access === 'route').toBe(true);
    expect(result.finalState.locationId).not.toBe('egghead_island');
  });
});
