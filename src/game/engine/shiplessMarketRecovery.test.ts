import { describe, expect, it } from 'vitest';
import { createContentCatalog } from '../content/catalogFactory';
import type { EventDefinition } from '../content/schema';
import { createInitialGameState } from '../model/initialState';
import { chooseInSession, createSessionState, dismissResolution } from '../session/gameSession';
import { findCurrentEvent } from './events';

const landFallback: EventDefinition = {
  id: 'dead_end_on_land',
  kind: 'normal',
  replay: { cooldownMonths: 1 },
  eligibility: {
    type: 'all',
    conditions: [
      { type: 'careerPhaseIs', phase: 'active' },
      { type: 'isOnLand' },
    ],
  },
  titleKey: 'x',
  textKey: 'x',
  choices: [{
    id: 'resume',
    textKey: 'x',
    resolution: {
      type: 'deterministic',
      outcome: {
        id: 'resume',
        textKey: 'x',
        effects: [{ type: 'recoverTravel', mode: 'land' }],
      },
    },
  }],
};

function recoveryState() {
  const catalog = createContentCatalog([landFallback]);
  const location = catalog.locations.find(
    ({ hasMarketHub, shipMarket, allowsDocking }) => hasMarketHub && shipMarket !== 'none' && allowsDocking,
  );
  if (!location) throw new Error('Expected at least one dockable Market Hub with a Ship Market.');

  const state = createInitialGameState(1);
  state.careerPhase = 'active';
  state.ageMonths = 180;
  state.locationId = location.id;
  state.travelState = 'on_land';
  state.ship = null;
  state.berries = 100_000;
  state.shipMarketArrivalPending = false;
  state.currentEventId = null;
  return { catalog, state };
}

describe('shipless market recovery', () => {
  it('offers the existing port as a slotless System Event when local roots are exhausted', () => {
    const { catalog, state } = recoveryState();
    const beforeAge = state.ageMonths;
    const beforeSlot = state.slotInMonth;
    const beforeHistoryLength = state.history.length;

    let session = createSessionState(state, catalog);
    expect(session.gameState?.currentEventId).toBe('system_market:shipless_recovery');
    expect(session.gameState && findCurrentEvent(session.gameState, catalog)?.kind).toBe('system');

    session = dismissResolution(
      chooseInSession(session, catalog, 'market:port'),
      catalog,
    );
    expect(session.gameState?.currentEventId).toBe('system_market:port');
    expect(session.gameState?.ageMonths).toBe(beforeAge);
    expect(session.gameState?.slotInMonth).toBe(beforeSlot);
    expect(session.gameState?.history).toHaveLength(beforeHistoryLength);
  });

  it('does not loop if the player leaves the recovery market without buying a ship', () => {
    const { catalog, state } = recoveryState();
    let session = createSessionState(state, catalog);

    session = dismissResolution(
      chooseInSession(session, catalog, 'market:port'),
      catalog,
    );
    session = dismissResolution(
      chooseInSession(session, catalog, 'market:explore'),
      catalog,
    );

    expect(session.gameState?.currentEventId).toBe('dead_end_on_land');
    expect(session.gameState?.flags.some((flagId) =>
      flagId.startsWith(`market_shipless_recovery:${state.locationId}:`),
    )).toBe(true);
  });

  it('lets the player buy a ship through the unchanged Market flow', () => {
    const { catalog, state } = recoveryState();
    let session = createSessionState(state, catalog);

    session = dismissResolution(
      chooseInSession(session, catalog, 'market:port'),
      catalog,
    );
    session = dismissResolution(
      chooseInSession(session, catalog, 'market:ship:buy:dinghy'),
      catalog,
    );
    expect(session.gameState?.currentEventId).toBe('system_market:confirm:ship:buy:dinghy');

    session = dismissResolution(
      chooseInSession(session, catalog, 'market:accept'),
      catalog,
    );
    expect(session.gameState?.ship?.shipId).toBe('dinghy');
    expect(session.gameState?.currentEventId).toBe('system_market:port');
  });

  it('never offers shipless recovery to a player who already owns a ship', () => {
    const { catalog, state } = recoveryState();
    state.ship = { shipId: 'dinghy', name: 'Test', health: 18, cargo: [] };

    const session = createSessionState(state, catalog);
    expect(session.gameState?.currentEventId).not.toBe('system_market:shipless_recovery');
  });
});

