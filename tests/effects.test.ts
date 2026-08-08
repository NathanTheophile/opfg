import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { applyEffects } from '../src/game/engine/effects';
import { createInitialGameState } from '../src/game/model/initialState';

const context = { sourceEventId: 'source', sourceChoiceId: 'choice' };

describe('effects v2', () => {
  it('keeps effects immutable and schedules against absolute age', () => {
    const state = createInitialGameState();
    state.ageMonths = 25;
    const result = applyEffects(state, contentCatalog, [
      { type: 'setFlag', flagId: 'ready' },
      { type: 'scheduleEvent', eventId: 'childhood_memory', delayMonths: 2 },
    ], context);
    expect(state.flags).toEqual([]);
    expect(result.flags).toEqual(['ready']);
    expect(result.scheduledEvents[0]).toEqual({ eventId: 'childhood_memory', dueAgeMonths: 27, ...context });
  });

  it('rejects an opposite trait and applies loseShip', () => {
    const state = createInitialGameState();
    state.player.traits = ['audacious'];
    const unchanged = applyEffects(state, contentCatalog, [{ type: 'addTrait', traitId: 'cautious' }], context);
    expect(unchanged.player.traits).toEqual(['audacious']);
    const lost = applyEffects(unchanged, contentCatalog, [{ type: 'loseShip', locationId: 'shipwreck_shore', travelState: 'on_land' }], context);
    expect(lost).toMatchObject({ ship: null, locationId: 'shipwreck_shore', travelState: 'on_land' });
  });

  it('cannot modify a missing ship', () => {
    const state = { ...createInitialGameState(), ship: null };
    expect(() => applyEffects(state, contentCatalog, [{ type: 'modifyShipCondition', amount: 1 }], context)).toThrow(/ship/i);
  });
});
