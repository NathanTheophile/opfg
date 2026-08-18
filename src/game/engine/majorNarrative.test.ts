import { describe, expect, it } from 'vitest';
import { createContentCatalog } from '../content/catalogFactory';
import type { EventDefinition } from '../content/schema';
import { createInitialGameState } from '../model/initialState';
import { completedMajorNarrativeMilestones, selectNextEvent } from './events';

function node(
  id: string,
  chapterId: string,
  nodeId: string,
  options: {
    parents?: string[];
    fallback?: boolean;
    priority?: number;
    eligibility?: EventDefinition['eligibility'];
    specialPathId?: string;
    milestoneId?: string;
  } = {},
): EventDefinition {
  return {
    id,
    kind: 'normal',
    titleKey: 'event.origin_name.title',
    textKey: 'event.origin_name.text',
    eligibility: options.eligibility,
    majorTrack: {
      trackId: 'family_marine',
      chapterId,
      nodeId,
      ...(options.parents ? { parentNodeIds: options.parents } : {}),
      ...(options.fallback ? { fallback: true as const } : {}),
      ...(options.priority !== undefined ? { selectionPriority: options.priority } : {}),
      ...(options.specialPathId ? { specialPathId: options.specialPathId } : {}),
      ...(options.milestoneId ? { milestoneId: options.milestoneId } : {}),
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

function marineCatalog(events: EventDefinition[]) {
  const catalog = createContentCatalog(events);
  catalog.majorNarrativeTracks = [{
    id: 'family_marine',
    type: 'family_legacy',
    eligibility: { type: 'affiliationIs', affiliationId: 'marine' },
    chapters: [
      { id: 'childhood_01', phase: 'childhood', dueAgeMonths: 12 },
      { id: 'childhood_02', phase: 'childhood', dueAgeMonths: 48 },
      { id: 'childhood_03', phase: 'childhood', dueAgeMonths: 84 },
      { id: 'childhood_04', phase: 'childhood', dueAgeMonths: 120 },
      { id: 'childhood_05', phase: 'childhood', dueAgeMonths: 168 },
    ],
  }];
  return catalog;
}

function history(eventId: string, ageMonths: number) {
  return { eventId, choiceId: 'ok', outcomeId: 'done', ageMonths };
}

describe('Layered Major Narrative Track selection', () => {
  it('prefers specialized first-layer roots over the generic fallback', () => {
    const catalog = marineCatalog([
      node('marine_root_default', 'childhood_01', 'root_default', { fallback: true }),
      node('marine_root_nonhuman', 'childhood_01', 'root_nonhuman', {
        eligibility: { type: 'not', condition: { type: 'raceIs', raceId: 'human' } },
      }),
    ]);
    const state = createInitialGameState(123);
    state.careerPhase = 'childhood';
    state.ageMonths = 12;
    state.player.profile.affiliationId = 'marine';
    state.player.profile.raceId = 'giant';

    expect(selectNextEvent(state, catalog).currentEventId).toBe('marine_root_nonhuman');
  });

  it('uses the generic first-layer fallback when no specialized root is eligible', () => {
    const catalog = marineCatalog([
      node('marine_root_default', 'childhood_01', 'root_default', { fallback: true }),
      node('marine_root_nonhuman', 'childhood_01', 'root_nonhuman', {
        eligibility: { type: 'not', condition: { type: 'raceIs', raceId: 'human' } },
      }),
    ]);
    const state = createInitialGameState(123);
    state.careerPhase = 'childhood';
    state.ageMonths = 12;
    state.player.profile.affiliationId = 'marine';
    state.player.profile.raceId = 'human';

    expect(selectNextEvent(state, catalog).currentEventId).toBe('marine_root_default');
  });

  it('only selects descendants of the actually played previous node', () => {
    const catalog = marineCatalog([
      node('marine_root_default', 'childhood_01', 'root_default', { fallback: true }),
      node('marine_root_race', 'childhood_01', 'root_race'),
      node('marine_04_default', 'childhood_02', 'n04_default', { parents: ['root_default'], fallback: true }),
      node('marine_04_race', 'childhood_02', 'n04_race', { parents: ['root_race'], fallback: true }),
    ]);
    const state = createInitialGameState(123);
    state.careerPhase = 'childhood';
    state.ageMonths = 48;
    state.player.profile.affiliationId = 'marine';
    state.history = [history('marine_root_race', 12)];

    expect(selectNextEvent(state, catalog).currentEventId).toBe('marine_04_race');
  });

  it('allows an explicit crossing from multiple previous pyramids', () => {
    const catalog = marineCatalog([
      node('marine_root_default', 'childhood_01', 'root_default', { fallback: true }),
      node('marine_root_race', 'childhood_01', 'root_race'),
      node('marine_04_cross', 'childhood_02', 'n04_cross', {
        parents: ['root_default', 'root_race'],
      }),
      node('marine_04_default_fallback', 'childhood_02', 'n04_default_fallback', { parents: ['root_default'], fallback: true }),
      node('marine_04_race_fallback', 'childhood_02', 'n04_race_fallback', { parents: ['root_race'], fallback: true }),
    ]);
    const state = createInitialGameState(123);
    state.careerPhase = 'childhood';
    state.ageMonths = 48;
    state.player.profile.affiliationId = 'marine';
    state.history = [history('marine_root_race', 12)];

    expect(selectNextEvent(state, catalog).currentEventId).toBe('marine_04_cross');
  });

  it('lets a high-specificity Giant continuation outrank a broader eligible non-human node', () => {
    const catalog = marineCatalog([
      node('marine_root_race', 'childhood_01', 'root_race', { fallback: true }),
      node('marine_04_nonhuman', 'childhood_02', 'n04_nonhuman', {
        parents: ['root_race'],
        priority: 10,
        eligibility: { type: 'not', condition: { type: 'raceIs', raceId: 'human' } },
      }),
      node('marine_04_giant', 'childhood_02', 'n04_giant', {
        parents: ['root_race'],
        priority: 20,
        eligibility: { type: 'raceIs', raceId: 'giant' },
        specialPathId: 'marine_giant',
      }),
      node('marine_04_race_fallback', 'childhood_02', 'n04_race_fallback', { parents: ['root_race'], fallback: true }),
    ]);
    const state = createInitialGameState(123);
    state.careerPhase = 'childhood';
    state.ageMonths = 48;
    state.player.profile.affiliationId = 'marine';
    state.player.profile.raceId = 'giant';
    state.history = [history('marine_root_race', 12)];

    expect(selectNextEvent(state, catalog).currentEventId).toBe('marine_04_giant');
  });

  it('derives special-path milestones from History without Saga progress state', () => {
    const catalog = marineCatalog([
      node('marine_giant_heritage', 'childhood_05', 'giant_heritage', {
        parents: ['placeholder_previous'],
        specialPathId: 'marine_giant',
        milestoneId: 'marine_giant_inheritance',
      }),
    ]);
    const state = createInitialGameState(123);
    state.history = [history('marine_giant_heritage', 168)];

    expect(completedMajorNarrativeMilestones(state, catalog)).toEqual(['marine_giant_inheritance']);
  });

  it('exposes Adult Family cadence for V1 families while keeping Royal compatibility inactive', () => {
    const catalog = createContentCatalog([]);
    const activeFamilies = ['family_civilian', 'family_marine', 'family_pirate', 'family_revolutionary'];

    for (const trackId of activeFamilies) {
      const track = catalog.majorNarrativeTracks.find(({ id }) => id === trackId)!;
      expect(track.chapters.filter(({ phase }) => phase === 'active').map(({ id, dueAgeMonths }) => [id, dueAgeMonths])).toEqual([
        ['adult_family_01', 222],
        ['adult_family_02', 270],
        ['adult_family_03', 318],
        ['adult_family_04', 366],
        ['adult_family_05', 414],
      ]);
    }

    const royal = catalog.majorNarrativeTracks.find(({ id }) => id === 'family_royal')!;
    expect(royal.chapters.some(({ phase }) => phase === 'active')).toBe(false);
    expect(catalog.affiliations.find(({ id }) => id === 'royal_family')?.playableV1).toBe(false);
  });
});
