import { describe, expect, it } from 'vitest';
import { createContentCatalog } from '../content/catalogFactory';
import type { EventDefinition } from '../content/schema';
import { createInitialGameState } from '../model/initialState';
import { selectNextEvent } from './events';

function deterministicEvent(id: string, chapterId: string, fallback = false, eligibility?: EventDefinition['eligibility']): EventDefinition {
  return {
    id, kind: 'normal', titleKey: 'event.origin_name.title', textKey: 'event.origin_name.text', eligibility,
    majorTrack: { trackId: 'family_marine', chapterId, ...(fallback ? { fallback: true as const } : {}) },
    choices: [{ id: 'ok', textKey: 'event.origin_name.choice.confirm.text', resolution: { type: 'deterministic', outcome: { id: 'done', textKey: 'event.origin_name.choice.confirm.outcome.named.text', effects: [] } } }],
  };
}

describe('Major Narrative Track selection', () => {
  it('prefers a specialized current-state variant over fallback', () => {
    const events = [
      deterministicEvent('marine_c1_fallback', 'childhood_01', true),
      deterministicEvent('marine_c1_fishman', 'childhood_01', false, { type: 'raceIs', raceId: 'fishman' }),
    ];
    const catalog = createContentCatalog(events);
    catalog.majorNarrativeTracks = [{
      id: 'family_marine', type: 'family_legacy', eligibility: { type: 'affiliationIs', affiliationId: 'marine' },
      chapters: [
        { id: 'childhood_01', phase: 'childhood', dueAgeMonths: 12 },
        { id: 'childhood_02', phase: 'childhood', dueAgeMonths: 48 },
        { id: 'childhood_03', phase: 'childhood', dueAgeMonths: 84 },
        { id: 'childhood_04', phase: 'childhood', dueAgeMonths: 120 },
        { id: 'childhood_05', phase: 'childhood', dueAgeMonths: 156 },
      ],
    }];
    const state = createInitialGameState(123);
    state.careerPhase = 'childhood'; state.ageMonths = 12; state.player.profile.affiliationId = 'marine'; state.player.profile.raceId = 'fishman';
    expect(selectNextEvent(state, catalog).currentEventId).toBe('marine_c1_fishman');
  });

  it('uses fallback when no specialized variant is eligible', () => {
    const events = [
      deterministicEvent('marine_c1_fallback', 'childhood_01', true),
      deterministicEvent('marine_c1_fishman', 'childhood_01', false, { type: 'raceIs', raceId: 'fishman' }),
    ];
    const catalog = createContentCatalog(events);
    catalog.majorNarrativeTracks = [{ id: 'family_marine', type: 'family_legacy', eligibility: { type: 'affiliationIs', affiliationId: 'marine' }, chapters: [
      { id: 'childhood_01', phase: 'childhood', dueAgeMonths: 12 }, { id: 'childhood_02', phase: 'childhood', dueAgeMonths: 48 }, { id: 'childhood_03', phase: 'childhood', dueAgeMonths: 84 }, { id: 'childhood_04', phase: 'childhood', dueAgeMonths: 120 }, { id: 'childhood_05', phase: 'childhood', dueAgeMonths: 156 },
    ] }];
    const state = createInitialGameState(123);
    state.careerPhase = 'childhood'; state.ageMonths = 12; state.player.profile.affiliationId = 'marine'; state.player.profile.raceId = 'human';
    expect(selectNextEvent(state, catalog).currentEventId).toBe('marine_c1_fallback');
  });
});
