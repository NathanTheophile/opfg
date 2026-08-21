import { describe, expect, it } from 'vitest';
import type { ContentCatalog } from '../src/game/content/schema';
import { getActiveYearEndSummary } from '../src/game/engine/yearEndSummary';

const catalog: ContentCatalog = {
  schemaVersion: 17,
  races: [],
  seas: [],
  affiliations: [],
  careerAffiliations: [],
  careerRanks: [],
  careerTitles: [],
  endings: [],
  familyStructures: [],
  socialClasses: [],
  locations: [],
  traits: [],
  economy: {},
  items: [
    {
      id: 'year_end_unique',
      nameKey: 'item.year_end_unique.name',
      category: 'item',
      stackLimit: 1,
      market: null,
      unique: true,
    },
  ],
  devilFruits: [],
  ships: [],
  crewRoles: [],
  npcs: [],
  majorNarrativeTracks: [],
  events: [
    {
      id: 'year_start_event',
      kind: 'normal',
      titleKey: 'x',
      textKey: 'x',
      choices: [
        {
          id: 'take_path',
          textKey: 'x',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'started',
              textKey: 'x',
              effects: [
                { type: 'modifyStat', statId: 'strength', amount: 2 },
                { type: 'setNpcStatus', npcId: 'mira', status: 'crew' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'mid_year_event',
      kind: 'normal',
      titleKey: 'x',
      textKey: 'x',
      choices: [
        {
          id: 'keep_it',
          textKey: 'x',
          resolution: {
            type: 'dice',
            statId: 'luck',
            successThreshold: 10,
            outcomes: {
              criticalFailure: { id: 'cf', textKey: 'x', effects: [] },
              failure: { id: 'f', textKey: 'x', effects: [] },
              success: {
                id: 'found',
                textKey: 'x',
                effects: [
                  { type: 'addItem', itemId: 'year_end_unique', quantity: 1 },
                  { type: 'modifyHealth', amount: -3 },
                ],
              },
              criticalSuccess: { id: 'cs', textKey: 'x', effects: [] },
            },
          },
        },
      ],
    },
    {
      id: 'year_end_event',
      kind: 'normal',
      titleKey: 'x',
      textKey: 'x',
      choices: [
        {
          id: 'finish',
          textKey: 'x',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'finished',
              textKey: 'x',
              effects: [
                { type: 'modifyStat', statId: 'strength', amount: -1 },
              ],
            },
          },
        },
      ],
    },
  ],
};

const history = [
  { eventId: 'year_start_event', choiceId: 'take_path', outcomeId: 'started', ageMonths: 180 },
  { eventId: 'mid_year_event', choiceId: 'keep_it', outcomeId: 'found', ageMonths: 185 },
  { eventId: 'year_end_event', choiceId: 'finish', outcomeId: 'finished', ageMonths: 191 },
];

describe('Active year-end summary', () => {
  it('aggregates the completed Active year without creating a fake Event', () => {
    const summary = getActiveYearEndSummary(
      { ageMonths: 191, careerPhase: 'active', history: history.slice(0, 2) },
      { ageMonths: 192, careerPhase: 'active', history },
      catalog,
    );

    expect(summary).toEqual({
      fromAge: 15,
      toAge: 16,
      eventsResolved: 3,
      statChanges: [
        { statId: 'health', amount: -3 },
        { statId: 'strength', amount: 1 },
      ],
      highlights: [
        { type: 'crewRecruit', npcId: 'mira' },
        { type: 'uniqueItem', itemId: 'year_end_unique' },
      ],
    });
  });

  it('does not create a yearly recap during Childhood', () => {
    expect(
      getActiveYearEndSummary(
        { ageMonths: 107, careerPhase: 'childhood', history: [] },
        { ageMonths: 108, careerPhase: 'childhood', history: [] },
        catalog,
      ),
    ).toBeNull();
  });

  it('does not create a recap on an ordinary Active month', () => {
    expect(
      getActiveYearEndSummary(
        { ageMonths: 190, careerPhase: 'active', history },
        { ageMonths: 191, careerPhase: 'active', history },
        catalog,
      ),
    ).toBeNull();
  });
});
