import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { selectNextEvent } from '../src/game/engine/events';
import { resolveChoice } from '../src/game/engine/resolution';
import { createInitialGameState } from '../src/game/model/initialState';
import { createDefaultPowerState } from '../src/game/engine/powers';

describe('critical events', () => {
  it('preempts scheduled and normal events without consuming a slot when the player dies', () => {
    const state = createInitialGameState();
    state.careerPhase = 'active'; state.ageMonths = 180; state.player.stats.health = 0;
    state.scheduledEvents = [{ eventId: 'mira_returns_favor', dueAgeMonths: 0, sourceEventId: 's', sourceChoiceId: 'c' }];
    const selected = selectNextEvent(state, contentCatalog);
    expect(selected.currentEventId).toBe('critical_player_death');
    const resolved = resolveChoice(selected, contentCatalog, 'critical_player_death', 'accept_death').state;
    expect(resolved).toMatchObject({ careerStatus: 'ended', careerEndReason: 'death', ageMonths: 180, slotInMonth: 0, currentEventId: null });
  });

  it('resolves NPC death before ship destruction and persists each consequence', () => {
    const state = createInitialGameState();
    state.careerPhase = 'active'; state.ageMonths = 180; state.ship = { shipId: 'starter_sloop', name: 'Wind Finch', health: 0, cargo: [] };
    state.npcs.mira = { status: 'crew', relationship: 0, powers: createDefaultPowerState(), stats: { health: 0, morale: 10, strength: 10, observation: 10, intelligence: 10, luck: 10, loyalty: 10, calm: 10 } };
    let selected = selectNextEvent(state, contentCatalog);
    expect(selected.currentEventId).toBe('critical_mira_death');
    selected = resolveChoice(selected, contentCatalog, 'critical_mira_death', 'mourn_mira').state;
    expect(selected.npcs.mira.status).toBe('dead');
    expect(selected.currentEventId).toBe('critical_ship_destroyed');
    selected = resolveChoice(selected, contentCatalog, 'critical_ship_destroyed', 'reach_shore').state;
    expect(selected.ship).toBeNull();
    expect(selected.locationId).toBe('shipwreck_shore');
    expect(selected.slotInMonth).toBe(0);
  });
});
