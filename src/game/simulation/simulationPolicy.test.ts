import { describe, expect, it } from 'vitest';
import type { ChoiceDefinition, ContentCatalog, EventDefinition } from '../content/schema';
import type { GameState } from '../model/schema';
import {
  progressionSimulationPolicy,
  randomSimulationPolicy,
  type SimulationDecisionContext,
} from './simulationPolicy';

const deterministicChoice = (id: string): ChoiceDefinition => ({
  id,
  textKey: 'test.choice' as ChoiceDefinition['textKey'],
  resolution: {
    type: 'deterministic',
    outcome: {
      id: `${id}_outcome`,
      textKey: 'test.outcome' as any,
      effects: [],
    },
  },
});

const choices = (...ids: string[]) => ids.map(deterministicChoice);

const catalog = {
  races: [
    { id: 'human', initialHealth: 35 },
  ],
  ships: [
    { id: 'dinghy', nameKey: 'ship.dinghy.name', maxHealth: 18, crewCapacity: 1, cargoSlots: 1, priceBerries: 5_000 },
    { id: 'sloop', nameKey: 'ship.sloop.name', maxHealth: 30, crewCapacity: 3, cargoSlots: 2, priceBerries: 25_000 },
    { id: 'brig', nameKey: 'ship.brig.name', maxHealth: 50, crewCapacity: 7, cargoSlots: 3, priceBerries: 75_000 },
  ],
  locations: [
    {
      id: 'test_port',
      shipMarket: 'small_craft',
      marketItemIds: [],
    },
    {
      id: 'test_full_port',
      shipMarket: 'full',
      marketItemIds: [],
    },
  ],
} as unknown as ContentCatalog;

function state(overrides: Partial<GameState> = {}): GameState {
  return {
    ageMonths: 240,
    ship: null,
    pendingShip: null,
    isLeader: true,
    berries: 5_000,
    locationId: 'test_port',
    passengerNpcIds: [],
    npcs: {},
    crewRoleLastUsedYear: {},
    player: {
      profile: { raceId: 'human' },
      stats: { health: 35 },
    } as unknown as GameState['player'],
    ...overrides,
  } as unknown as GameState;
}

function context(eventId: string, currentState: GameState): SimulationDecisionContext {
  return {
    event: {
      id: eventId,
      kind: 'system',
      titleKey: 'test.title',
      textKey: 'test.body',
      choices: [],
    } as unknown as EventDefinition,
    state: currentState,
    catalog,
  };
}

function choose(eventId: string, ids: string[], currentState = state()) {
  return progressionSimulationPolicy.choose(
    choices(...ids),
    123456,
    context(eventId, currentState),
  ).choice.id;
}

describe('progressionSimulationPolicy', () => {
  it('buys the Dinghy when it is the cheapest normally purchasable ship', () => {
    expect(choose('system_market:arrival', ['market:merchant', 'market:port', 'market:explore']))
      .toBe('market:port');
    expect(choose('system_market:port', ['market:ship:buy:dinghy', 'market:ship:buy:sloop', 'market:explore']))
      .toBe('market:ship:buy:dinghy');
    expect(choose('system_market:confirm:ship:buy:dinghy', ['market:accept', 'market:negotiate', 'market:port']))
      .toBe('market:accept');
  });

  it('does not enter an unaffordable Sloop confirmation', () => {
    const poor = state({ berries: 1_000 });
    expect(choose('system_market:port', ['market:ship:buy:dinghy', 'market:ship:buy:sloop', 'market:explore'], poor))
      .toBe('market:explore');
  });

  it('waits for a Sloop before age 20 instead of spending early funds on a Dinghy', () => {
    const earlyPoor = state({ ageMonths: 200, berries: 5_000 });
    expect(choose('system_market:port', ['market:ship:buy:dinghy', 'market:ship:buy:sloop', 'market:explore'], earlyPoor))
      .toBe('market:explore');

    const earlyFunded = state({ ageMonths: 200, berries: 30_000 });
    expect(choose('system_market:port', ['market:ship:buy:dinghy', 'market:ship:buy:sloop', 'market:explore'], earlyFunded))
      .toBe('market:ship:buy:sloop');
  });

  it('prioritizes Medic then Navigator for the first two Progression crew roles', () => {
    const first = progressionSimulationPolicy.chooseCrewRole?.(
      ['navigator', 'medic', 'cook'],
      123456,
      undefined,
    );
    expect(first?.roleId).toBe('medic');

    const second = progressionSimulationPolicy.chooseCrewRole?.(
      ['navigator', 'cook'],
      123456,
      undefined,
    );
    expect(second?.roleId).toBe('navigator');
  });

  it('uses the Sloop when Dinghy capacity is too small and Sloop is affordable', () => {
    const twoCrew = state({
      berries: 25_000,
      npcs: {
        a: { status: 'crew' },
        b: { status: 'crew' },
      } as unknown as GameState['npcs'],
    });

    expect(choose('system_market:port', ['market:ship:buy:dinghy', 'market:ship:buy:sloop', 'market:explore'], twoCrew))
      .toBe('market:ship:buy:sloop');
  });

  it('chooses the cheapest valid larger ship at a full port when small craft cannot carry the crew', () => {
    const fourCrew = state({
      locationId: 'test_full_port',
      berries: 100_000,
      npcs: {
        a: { status: 'crew' },
        b: { status: 'crew' },
        c: { status: 'crew' },
        d: { status: 'crew' },
      } as unknown as GameState['npcs'],
    });

    expect(choose(
      'system_market:port',
      ['market:ship:buy:dinghy', 'market:ship:buy:sloop', 'market:ship:buy:brig', 'market:explore'],
      fourCrew,
    )).toBe('market:ship:buy:brig');
  });

  it('leaves the port instead of selling or browsing when a ship is already owned', () => {
    const withShip = state({
      ship: {
        shipId: 'dinghy',
        name: 'Test',
        health: 18,
        cargo: [],
      },
    });

    expect(choose('system_market:port', ['market:ship:sell:dinghy', 'market:merchant', 'market:explore'], withShip))
      .toBe('market:explore');
  });

  it('always departs when the departure System Event offers departure', () => {
    expect(choose('system_navigation:departure', ['navigation:stay', 'navigation:depart']))
      .toBe('navigation:depart');
  });

  it('uses the Medic annual power when the player is meaningfully wounded', () => {
    const wounded = state({
      player: {
        profile: { raceId: 'human' },
        stats: { health: 20 },
      } as unknown as GameState['player'],
    });

    const selection = progressionSimulationPolicy.chooseCrewPower?.(
      ['medic'],
      123456,
      { state: wounded, catalog },
    );

    expect(selection?.roleId).toBe('medic');
  });

  it('does not waste the Medic annual power at full health', () => {
    const selection = progressionSimulationPolicy.chooseCrewPower?.(
      ['medic'],
      123456,
      { state: state(), catalog },
    );

    expect(selection).toBeUndefined();
  });

  it('keeps ordinary narrative choices on the same seeded-random policy', () => {
    const narrativeChoices = choices('a', 'b', 'c', 'd');
    const narrativeContext = context('ordinary_story_event', state());

    const fuzz = randomSimulationPolicy.choose(narrativeChoices, 999, narrativeContext);
    const progression = progressionSimulationPolicy.choose(narrativeChoices, 999, narrativeContext);

    expect(progression.choice.id).toBe(fuzz.choice.id);
    expect(progression.nextRngState).toBe(fuzz.nextRngState);
  });

  it('preserves deterministic random policy behavior for equal seed/input', () => {
    const narrativeChoices = choices('a', 'b', 'c');
    const first = randomSimulationPolicy.choose(narrativeChoices, 42);
    const second = randomSimulationPolicy.choose(narrativeChoices, 42);

    expect(second).toEqual(first);
  });
});
