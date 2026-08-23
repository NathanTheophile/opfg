import { describe, expect, it } from 'vitest';
import type { ContentCatalog } from '../src/game/content/schema';
import { contentCatalog } from '../src/game/content/definitions';
import { evaluateCondition } from '../src/game/engine/conditions';
import { getLocationDisplayName } from '../src/game/engine/locations';
import { createInitialGameState } from '../src/game/model/initialState';
import { validateContent } from '../src/game/validation/validateContent';

function activeState(locationId = 'foosha_village') {
  const state = createInitialGameState(1);
  state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
  state.careerPhase = 'active';
  state.ageMonths = 180;
  state.locationId = locationId;
  state.travelState = 'on_land';
  state.navigationDecisionAgeMonths = null;
  return state;
}

describe('World V1 contracts', () => {
  it('evaluates currentSeaIs and hierarchical locationWithin', () => {
    const state = activeState('rainbase');
    expect(evaluateCondition(
      { type: 'currentSeaIs', seaId: 'grand_line_paradise' },
      state,
      contentCatalog,
    )).toBe(true);
    expect(evaluateCondition(
      { type: 'locationWithin', locationId: 'alabasta_kingdom' },
      state,
      contentCatalog,
    )).toBe(true);
    expect(evaluateCondition(
      { type: 'locationWithin', locationId: 'water_seven' },
      state,
      contentCatalog,
    )).toBe(false);
  });

  it('rejects missing, self and cyclic location parents', () => {
    for (const parentLocationId of ['missing', 'rainbase']) {
      const catalog = structuredClone(contentCatalog) as ContentCatalog;
      catalog.locations.find(({ id }) => id === 'rainbase')!.parentLocationId = parentLocationId;
      expect(validateContent(catalog).some(({ message }) => /parent|LocationId/i.test(message))).toBe(true);
    }

    const cyclic = structuredClone(contentCatalog) as ContentCatalog;
    cyclic.locations.find(({ id }) => id === 'alabasta_kingdom')!.parentLocationId = 'rainbase';
    expect(validateContent(cyclic).some(({ message }) => /cycle/i.test(message))).toBe(true);
  });

  it('formats root and child locations without snapshotting the whole world roster', () => {
    const translate = (key: string) => ({
      'location.alabasta_kingdom.name': 'Alabasta Kingdom',
      'location.rainbase.name': 'Rainbase',
      'location.water_seven.name': 'Water Seven',
    }[key] ?? key);

    expect(getLocationDisplayName(contentCatalog, 'rainbase', translate))
      .toBe('Alabasta Kingdom - Rainbase');
    expect(getLocationDisplayName(contentCatalog, 'water_seven', translate))
      .toBe('Water Seven');
  });
});
