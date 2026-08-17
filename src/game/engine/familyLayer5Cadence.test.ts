import { describe, expect, it } from 'vitest';
import { createContentCatalog } from '../content/catalogFactory';
import type { EventDefinition } from '../content/schema';
import { createInitialGameState } from '../model/initialState';
import type { GameState } from '../model/schema';
import { resolveChoice } from './resolution';
import { selectNextEvent } from './events';

const chapters = ['childhood_01', 'childhood_02', 'childhood_03', 'childhood_04', 'childhood_05'] as const;

function normalNode(id: string, chapterId: typeof chapters[number], nodeId: string, parentNodeIds: string[] = []): EventDefinition {
  return {
    id,
    kind: 'normal',
    titleKey: 'event.origin_name.title',
    textKey: 'event.origin_name.text',
    majorTrack: {
      trackId: 'family_marine',
      chapterId,
      nodeId,
      ...(parentNodeIds.length > 0 ? { parentNodeIds } : {}),
      fallback: true,
    },
    choices: [{
      id: 'ok',
      textKey: 'event.origin_name.choice.confirm.text',
      resolution: {
        type: 'deterministic',
        outcome: {
          id: 'done',
          textKey: 'event.origin_name.choice.confirm.outcome.named.text',
          effects: [],
        },
      },
    }],
  };
}

function scheduled(id: string, priority: 100 | 200 | 300 = 100): EventDefinition {
  return {
    id,
    kind: 'scheduled',
    priority,
    titleKey: 'event.origin_name.title',
    textKey: 'event.origin_name.text',
    choices: [{
      id: 'ok',
      textKey: 'event.origin_name.choice.confirm.text',
      resolution: {
        type: 'deterministic',
        outcome: {
          id: 'done',
          textKey: 'event.origin_name.choice.confirm.outcome.named.text',
          effects: [],
        },
      },
    }],
  };
}

const layerIds = ['family_test_l1', 'family_test_l2', 'family_test_l3', 'family_test_l4', 'family_test_l5'] as const;
const nodes = chapters.map((chapterId, index) => normalNode(
  layerIds[index],
  chapterId,
  layerIds[index],
  index === 0 ? [] : [layerIds[index - 1]],
));

function history(eventId: string, ageMonths: number) {
  return { eventId, choiceId: 'ok', outcomeId: 'done', ageMonths };
}

function childhoodState(ageMonths: number): GameState {
  const state = createInitialGameState(168);
  state.careerPhase = 'childhood';
  state.ageMonths = ageMonths;
  state.player.profile.affiliationId = 'marine';
  state.history = [
    history(layerIds[0], 12),
    history(layerIds[1], 48),
    history(layerIds[2], 84),
    history(layerIds[3], 120),
  ];
  state.currentEventId = null;
  state.immediateEventQueue = [];
  state.scheduledEvents = [];
  return state;
}

function catalogWith(...extraEvents: EventDefinition[]) {
  return createContentCatalog([...nodes, ...extraEvents]);
}

describe('Family Layer 5 cadence', () => {
  it('keeps Layers 1-4 unchanged and moves only Layer 5 to 168 months', () => {
    const catalog = catalogWith();
    for (const track of catalog.majorNarrativeTracks.filter(({ type }) => type === 'family_legacy')) {
      expect(track.chapters.map(({ dueAgeMonths }) => dueAgeMonths)).toEqual([12, 48, 84, 120, 168]);
    }
  });

  it('makes Layer 5 newly due at 168 months, not before', () => {
    const catalog = catalogWith();
    expect(selectNextEvent(childhoodState(167), catalog).currentEventId).toBeNull();
    expect(selectNextEvent(childhoodState(168), catalog).currentEventId).toBe(layerIds[4]);
  });

  it('lets a due Scheduled Event occupy 168 without losing Layer 5', () => {
    const scheduledEvent = scheduled('scheduled_at_168');
    const catalog = catalogWith(scheduledEvent);
    const state = childhoodState(168);
    state.scheduledEvents = [{ eventId: scheduledEvent.id, dueAgeMonths: 168, sourceEventId: 'test_source', sourceChoiceId: 'test_schedule' }];

    const selected = selectNextEvent(state, catalog);
    expect(selected.currentEventId).toBe(scheduledEvent.id);

    const afterScheduled = resolveChoice(selected, catalog, scheduledEvent.id, 'ok').state;
    expect(afterScheduled.ageMonths).toBe(174);
    expect(afterScheduled.careerPhase).toBe('childhood');
    expect(afterScheduled.currentEventId).toBe(layerIds[4]);
  });

  it('prioritizes overdue Layer 5 over another due Scheduled Event at 174', () => {
    const scheduledEvent = scheduled('scheduled_at_174', 300);
    const catalog = catalogWith(scheduledEvent);
    const state = childhoodState(174);
    state.scheduledEvents = [{ eventId: scheduledEvent.id, dueAgeMonths: 174, sourceEventId: 'test_source', sourceChoiceId: 'test_schedule' }];

    expect(selectNextEvent(state, catalog).currentEventId).toBe(layerIds[4]);
  });

  it('resolves missing Layer 5 before the normal Childhood -> Active boundary at 180', () => {
    const catalog = catalogWith();
    const selected = selectNextEvent(childhoodState(174), catalog);
    expect(selected.currentEventId).toBe(layerIds[4]);

    const afterLayer5 = resolveChoice(selected, catalog, layerIds[4], 'ok').state;
    expect(afterLayer5.ageMonths).toBe(180);
    expect(afterLayer5.careerPhase).toBe('active');
    expect(afterLayer5.history.some(({ eventId }) => eventId === layerIds[4])).toBe(true);
  });
});

