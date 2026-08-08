import type { ContentCatalog } from './schema';

export const contentCatalog = {
  traits: [{ id: 'steady_nerves' }],
  items: [{ id: 'sealed_chart' }],
  npcs: [{ id: 'mira' }],
  events: [
    {
      id: 'test_departure',
      title: 'Departure',
      text: 'A minimal deterministic event used to validate the content contract.',
      priority: 100,
      choices: [
        {
          id: 'set_sail',
          text: 'Set sail',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'departed',
              text: 'The voyage begins.',
              advanceMonths: 1,
              effects: [
                { type: 'moveToLocation', locationId: 'open_sea' },
                { type: 'scheduleEvent', eventId: 'test_followup', delayMonths: 1 },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'test_followup',
      title: 'Open Sea',
      text: 'A minimal dice event used to validate references and bands.',
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'hasTrait', traitId: 'steady_nerves' },
          { type: 'hasItem', itemId: 'sealed_chart' },
          { type: 'npcStatusIs', npcId: 'mira', status: 'known' },
          { type: 'hasChosen', eventId: 'test_departure', choiceId: 'set_sail' },
        ],
      },
      priority: 0,
      choices: [
        {
          id: 'navigate',
          text: 'Navigate onward',
          resolution: {
            type: 'dice',
            check: {
              modifiers: [
                {
                  type: 'statModifier',
                  statId: 'navigation',
                  multiplier: 2,
                  displayLabel: 'Navigation',
                  displayInfluence: 'strong influence',
                },
              ],
              bands: [
                {
                  maxInclusive: 12,
                  outcome: {
                    id: 'rough_passage',
                    text: 'The passage is difficult.',
                    advanceMonths: 2,
                    effects: [{ type: 'modifyShipCondition', amount: -1 }],
                  },
                },
                {
                  maxInclusive: null,
                  outcome: {
                    id: 'safe_passage',
                    text: 'The passage is safe.',
                    advanceMonths: 1,
                    effects: [],
                  },
                },
              ],
            },
          },
        },
      ],
    },
  ],
} satisfies ContentCatalog;
