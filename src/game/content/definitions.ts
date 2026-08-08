import type { ContentCatalog } from './schema';

export const contentCatalog = {
  traits: [{ id: 'steady_nerves' }],
  items: [{ id: 'sealed_chart' }],
  npcs: [{ id: 'mira' }],
  events: [
    {
      id: 'departure',
      title: 'Departure',
      text: 'Your ship is ready at the starter port.',
      priority: 100,
      choices: [
        {
          id: 'set_sail',
          text: 'Set sail',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'left_port',
              text: 'The voyage begins.',
              advanceMonths: 1,
              effects: [
                { type: 'setFlag', flagId: 'left_starter_port' },
                { type: 'scheduleEvent', eventId: 'delayed_warning', delayMonths: 2 },
                { type: 'moveToLocation', locationId: 'open_sea' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'open_sea',
      title: 'Open Sea',
      text: 'An abandoned chart case drifts alongside the ship.',
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'hasChosen', eventId: 'departure', choiceId: 'set_sail' },
          { type: 'hasFlag', flagId: 'left_starter_port' },
          { type: 'locationIs', locationId: 'open_sea' },
        ],
      },
      priority: 50,
      choices: [
        {
          id: 'recover_chart',
          text: 'Recover the chart and continue',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'chart_recovered',
              text: 'The sealed chart shows a path through nearby reefs.',
              advanceMonths: 1,
              effects: [
                { type: 'addItem', itemId: 'sealed_chart' },
                { type: 'modifyShipCondition', amount: -1 },
                { type: 'moveToLocation', locationId: 'reefs' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'delayed_warning',
      title: 'A Delayed Warning',
      text: 'A message sent after your departure finally catches up with the ship.',
      scheduledOnly: true,
      priority: 0,
      choices: [
        {
          id: 'heed_warning',
          text: 'Heed the warning',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'warning_received',
              text: 'The warning confirms that dangerous reefs lie ahead.',
              advanceMonths: 0,
              effects: [{ type: 'setFlag', flagId: 'received_delayed_warning' }],
            },
          },
        },
      ],
    },
    {
      id: 'reefs',
      title: 'The Reefs',
      text: 'Sharp reefs block the route ahead.',
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'hasChosen', eventId: 'open_sea', choiceId: 'recover_chart' },
          { type: 'locationIs', locationId: 'reefs' },
        ],
      },
      priority: 50,
      choices: [
        {
          id: 'risk_crossing',
          text: 'Risk a crossing through the reefs',
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
                {
                  type: 'conditionalModifier',
                  condition: { type: 'shipConditionAtMost', value: 2 },
                  value: -2,
                  displayLabel: 'Damaged ship',
                  displayInfluence: 'significant penalty',
                },
              ],
              bands: [
                {
                  maxInclusive: 7,
                  outcome: {
                    id: 'reef_disaster',
                    text: 'The ship is wrecked against the reefs.',
                    advanceMonths: 1,
                    effects: [
                      { type: 'modifyShipCondition', amount: -3 },
                      { type: 'endCareer' },
                    ],
                  },
                },
                {
                  maxInclusive: 14,
                  outcome: {
                    id: 'reef_costly_crossing',
                    text: 'You cross the reefs, but the hull takes another hit.',
                    advanceMonths: 1,
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'endCareer' },
                    ],
                  },
                },
                {
                  maxInclusive: null,
                  outcome: {
                    id: 'reef_safe_crossing',
                    text: 'You find a clean line through the reefs.',
                    advanceMonths: 1,
                    effects: [{ type: 'endCareer' }],
                  },
                },
              ],
            },
          },
        },
        {
          id: 'read_currents',
          text: '[Navigation 3] Read the currents',
          availableIf: { type: 'statAtLeast', statId: 'navigation', value: 3 },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'currents_crossed',
              text: 'You guide the ship safely through.',
              advanceMonths: 1,
              effects: [{ type: 'endCareer' }],
            },
          },
        },
        {
          id: 'use_chart',
          text: 'Use the sealed chart',
          visibleIf: { type: 'hasItem', itemId: 'sealed_chart' },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'chart_crossing',
              text: 'The chart reveals a safe channel.',
              advanceMonths: 1,
              effects: [
                { type: 'removeItem', itemId: 'sealed_chart' },
                { type: 'endCareer' },
              ],
            },
          },
        },
        {
          id: 'steady_course',
          text: '[Steady Nerves] Hold a perfect course',
          visibleIf: { type: 'hasTrait', traitId: 'steady_nerves' },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'steady_crossing',
              text: 'You never waver.',
              advanceMonths: 1,
              effects: [{ type: 'endCareer' }],
            },
          },
        },
      ],
    },
  ],
} satisfies ContentCatalog;
