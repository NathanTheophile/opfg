import { describe, expect, it } from 'vitest';
import { createContentCatalog } from '../src/game/content/catalogFactory';
import type { Effect } from '../src/game/content/schema';
import { evaluateCondition } from '../src/game/engine/conditions';
import { applyEffects } from '../src/game/engine/effects';
import { createInitialGameState } from '../src/game/model/initialState';
import { validateContent } from '../src/game/validation/validateContent';

const catalog = createContentCatalog([]);

describe('Career V1', () => {
  it('evaluates career conditions, including ordered Marine ranks', () => {
    const state = createInitialGameState();
    state.player.career = { affiliationId: 'marine', reputation: 12, bounty: 40, marineRankId: 'lieutenant', titleId: 'veteran' };
    expect(evaluateCondition({ type: 'careerAffiliationIs', affiliationId: 'marine' }, state, catalog)).toBe(true);
    expect(evaluateCondition({ type: 'reputationAtLeast', value: 12 }, state, catalog)).toBe(true);
    expect(evaluateCondition({ type: 'reputationAtMost', value: 12 }, state, catalog)).toBe(true);
    expect(evaluateCondition({ type: 'bountyAtLeast', value: 40 }, state, catalog)).toBe(true);
    expect(evaluateCondition({ type: 'marineRankAtLeast', rankId: 'officer' }, state, catalog)).toBe(true);
    expect(evaluateCondition({ type: 'careerTitleIs', titleId: 'veteran' }, state, catalog)).toBe(true);
  });

  it('applies explicit effects, clamps counters, and preserves unrelated career data', () => {
    const state = createInitialGameState();
    state.player.career.reputation = 3;
    state.player.career.bounty = 2;
    const next = applyEffects(state, catalog, [
      { type: 'setCareerAffiliation', affiliationId: 'pirate' },
      { type: 'modifyReputation', amount: -10 },
      { type: 'modifyBounty', amount: -10 },
      { type: 'setMarineRank', rankId: 'recruit' },
      { type: 'setCareerTitle', titleId: 'rookie' },
    ] satisfies Effect[], { sourceEventId: 'x', sourceChoiceId: 'y' });
    expect(next.player.career).toEqual({ affiliationId: 'pirate', reputation: 0, bounty: 0, marineRankId: 'recruit', titleId: 'rookie' });
  });

  it('ends a career with a localized Ending reference', () => {
    const state = createInitialGameState();
    const next = applyEffects(state, catalog, [{ type: 'endCareerWithEnding', endingId: 'career_complete' }], { sourceEventId: 'x', sourceChoiceId: 'y' });
    expect(next).toMatchObject({ careerStatus: 'ended', careerEndReason: 'legacy', endingId: 'career_complete', currentEventId: null });
  });

  it('validates Career references and integer constraints', () => {
    const event = { id: 'career', kind: 'normal', titleKey: 'fixture.childhood.title', textKey: 'fixture.childhood.text', eligibility: { type: 'marineRankIs', rankId: 'missing' }, choices: [{ id: 'go', textKey: 'fixture.childhood.choice', resolution: { type: 'deterministic', outcome: { id: 'done', textKey: 'fixture.childhood.outcome', effects: [{ type: 'setBounty', value: -1 }, { type: 'endCareerWithEnding', endingId: 'missing' }] } } }] };
    const errors = validateContent({ ...catalog, events: [event] });
    expect(errors.some(({ message }) => message.includes('MarineRankId'))).toBe(true);
    expect(errors.some(({ message }) => message.includes('non-negative integer'))).toBe(true);
    expect(errors.some(({ message }) => message.includes('EndingId'))).toBe(true);
  });
});
