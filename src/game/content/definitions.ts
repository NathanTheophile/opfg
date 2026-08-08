import type { ContentCatalog } from './schema';

export const contentCatalog = {
  traits: [{
    id: 'audacious',
    name: 'Audacieux',
    description: 'Vous avez tendance à privilégier les solutions risquées et directes.',
  }],
  items: [{ id: 'sealed_chart' }, { id: 'mira_letter_of_passage' }],
  npcs: [{
    id: 'mira',
    name: 'Mira',
    initialStats: {
      health: 25,
      morale: 25,
      strength: 25,
      observation: 25,
      intelligence: 25,
      luck: 25,
      loyalty: 25,
      calm: 25,
    },
  }],
  events: [
    {
      id: 'departure',
      title: 'Le départ',
      text: 'Le navire est prêt à quitter le port d’origine.',
      scheduledOnly: false,
      eligibility: { type: 'locationIs', locationId: 'starter_port' },
      priority: 100,
      choices: [
        {
          id: 'set_sail',
          text: 'Prendre la mer.',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'departure_set_sail',
              text: 'La carrière commence en pleine mer.',
              advanceMonths: 1,
              effects: [
                { type: 'setFlag', flagId: 'career_departed' },
                { type: 'moveToLocation', locationId: 'open_sea', travelState: 'at_sea' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'mira_castaway',
      title: 'Une naufragée',
      text: 'Une naufragée nommée Mira dérive au large.',
      scheduledOnly: false,
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'hasFlag', flagId: 'career_departed' },
          { type: 'locationIs', locationId: 'open_sea' },
          { type: 'npcStatusIs', npcId: 'mira', status: 'unavailable' },
        ],
      },
      priority: 90,
      choices: [
        {
          id: 'rescue_recruit',
          text: 'La secourir et lui proposer de rejoindre l’équipage.',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_castaway_recruited',
              text: 'Mira rejoint l’équipage.',
              advanceMonths: 1,
              effects: [
                { type: 'setNpcStatus', npcId: 'mira', status: 'crew' },
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: 25 },
                { type: 'setFlag', flagId: 'mira_rescued' },
                { type: 'setFlag', flagId: 'castaway_resolved' },
              ],
            },
          },
        },
        {
          id: 'rescue_dropoff',
          text: 'La secourir, mais la déposer au prochain endroit sûr.',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_castaway_dropped_off',
              text: 'Mira est déposée en sécurité.',
              advanceMonths: 1,
              effects: [
                { type: 'setNpcStatus', npcId: 'mira', status: 'departed' },
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: 15 },
                { type: 'setFlag', flagId: 'mira_rescued' },
                { type: 'setFlag', flagId: 'castaway_resolved' },
                { type: 'scheduleEvent', eventId: 'mira_returns_favor', delayMonths: 6 },
              ],
            },
          },
        },
        {
          id: 'leave_mira',
          text: 'Ne pas prendre le risque de la récupérer.',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_castaway_abandoned',
              text: 'Le navire poursuit sa route sans Mira.',
              advanceMonths: 1,
              effects: [
                { type: 'setNpcStatus', npcId: 'mira', status: 'unavailable' },
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: -20 },
                { type: 'setFlag', flagId: 'mira_abandoned' },
                { type: 'setFlag', flagId: 'castaway_resolved' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'black_squall',
      title: 'Le grain noir',
      text: 'Un grain noir barre la route du navire.',
      scheduledOnly: false,
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'hasFlag', flagId: 'castaway_resolved' },
          { type: 'locationIs', locationId: 'open_sea' },
        ],
      },
      priority: 80,
      choices: [
        {
          id: 'cut_through_squall',
          text: 'Maintenir le cap et traverser le grain.',
          resolution: {
            type: 'dice',
            statId: 'navigation',
            successThreshold: 13,
            modifiers: [
              {
                condition: { type: 'shipConditionAtMost', value: 1 },
                value: -4,
                displayLabel: 'Bateau endommagé',
              },
            ],
            outcomes: {
              criticalFailure: {
                    id: 'black_squall_catastrophe', text: 'Le grain tourne à la catastrophe.', advanceMonths: 4,
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'setFlag', flagId: 'black_squall_disaster' },
                      { type: 'setFlag', flagId: 'black_squall_resolved' },
                    ],
              },
              failure: {
                    id: 'black_squall_failure', text: 'Le navire sort endommagé du grain.', advanceMonths: 3,
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'setFlag', flagId: 'black_squall_resolved' },
                    ],
              },
              success: {
                    id: 'black_squall_success', text: 'Le navire traverse le grain.', advanceMonths: 3,
                    effects: [{ type: 'setFlag', flagId: 'black_squall_resolved' }],
              },
              criticalSuccess: {
                    id: 'black_squall_exceptional', text: 'Le grain est parfaitement maîtrisé.', advanceMonths: 3,
                    effects: [
                      { type: 'setFlag', flagId: 'black_squall_mastered' },
                      { type: 'setFlag', flagId: 'black_squall_resolved' },
                    ],
              },
            },
          },
        },
        {
          id: 'heave_to',
          text: 'Réduire la voilure et attendre que le grain passe.',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'black_squall_waited', text: 'Le navire attend la fin du grain.', advanceMonths: 4,
              effects: [
                { type: 'setFlag', flagId: 'black_squall_delayed' },
                { type: 'setFlag', flagId: 'black_squall_resolved' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'wreck',
      title: 'L’épave',
      text: 'Une épave dérive non loin de la route.',
      scheduledOnly: false,
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'hasFlag', flagId: 'black_squall_resolved' },
          { type: 'locationIs', locationId: 'open_sea' },
        ],
      },
      priority: 70,
      choices: [
        {
          id: 'search_wreck',
          text: 'Explorer l’épave avant de repartir.',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'wreck_chart_found', text: 'Une carte scellée est retrouvée.', advanceMonths: 3,
              effects: [
                { type: 'addItem', itemId: 'sealed_chart' },
                { type: 'setFlag', flagId: 'wreck_searched' },
                { type: 'setFlag', flagId: 'wreck_resolved' },
              ],
            },
          },
        },
        {
          id: 'leave_wreck',
          text: 'Ne pas perdre de temps et poursuivre la route.',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'wreck_ignored', text: 'L’épave est laissée derrière.', advanceMonths: 3,
              effects: [{ type: 'setFlag', flagId: 'wreck_resolved' }],
            },
          },
        },
      ],
    },
    {
      id: 'reefs',
      title: 'Les récifs',
      text: 'Une barrière de récifs bloque la route extérieure.',
      scheduledOnly: false,
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'hasFlag', flagId: 'wreck_resolved' },
          { type: 'locationIs', locationId: 'open_sea' },
        ],
      },
      priority: 70,
      choices: [
        {
          id: 'force_passage',
          text: 'Tenter de trouver un passage au milieu des récifs.',
          resolution: {
            type: 'dice',
            statId: 'navigation',
            successThreshold: 13,
            modifiers: [{
              condition: { type: 'shipConditionAtMost', value: 1 },
              value: -3,
              displayLabel: 'Bateau endommagé',
            }],
            outcomes: {
              criticalFailure: {
                    id: 'reefs_force_catastrophe', text: 'La traversée est catastrophique.', advanceMonths: 4,
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'setFlag', flagId: 'reefs_hard_crossing' },
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
              failure: {
                    id: 'reefs_force_failure', text: 'Le passage endommage le navire.', advanceMonths: 3,
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
              success: {
                    id: 'reefs_force_success', text: 'Le passage est franchi.', advanceMonths: 3,
                    effects: [
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
              criticalSuccess: {
                    id: 'reefs_force_exceptional', text: 'Le passage est franchi sans difficulté.', advanceMonths: 3,
                    effects: [
                      { type: 'setFlag', flagId: 'reefs_clean_crossing' },
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
            },
          },
        },
        {
          id: 'read_currents',
          text: '[Navigation 35] Repérer le chenal à partir des courants.',
          availableIf: { type: 'statAtLeast', statId: 'navigation', value: 35 },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'reefs_navigation_solution', text: 'Les courants révèlent un chenal sûr.', advanceMonths: 3,
              effects: [
                { type: 'setFlag', flagId: 'reefs_clean_crossing' },
                { type: 'setFlag', flagId: 'reefs_crossed' },
                { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
              ],
            },
          },
        },
        {
          id: 'use_sealed_chart',
          text: 'Utiliser la carte trouvée dans l’épave.',
          visibleIf: { type: 'hasItem', itemId: 'sealed_chart' },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'reefs_chart_solution', text: 'La carte indique une route sûre.', advanceMonths: 3,
              effects: [
                { type: 'setFlag', flagId: 'reefs_clean_crossing' },
                { type: 'setFlag', flagId: 'reefs_crossed' },
                { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
              ],
            },
          },
        },
        {
          id: 'ride_breakers',
          text: '[Audacieux] Profiter des brisants pour forcer un passage rapide.',
          visibleIf: { type: 'hasTrait', traitId: 'audacious' },
          resolution: {
            type: 'dice',
            statId: 'morale',
            successThreshold: 13,
            modifiers: [{
              condition: { type: 'shipConditionAtMost', value: 1 },
              value: -3,
              displayLabel: 'Bateau endommagé',
            }],
            outcomes: {
              criticalFailure: {
                    id: 'reefs_breakers_catastrophe', text: 'Les brisants malmènent le navire.', advanceMonths: 4,
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'setFlag', flagId: 'reefs_hard_crossing' },
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
              failure: {
                    id: 'reefs_breakers_failure', text: 'Le navire franchit les brisants avec des dégâts.', advanceMonths: 3,
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
              success: {
                    id: 'reefs_breakers_success', text: 'Les brisants offrent un passage rapide.', advanceMonths: 3,
                    effects: [
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
              criticalSuccess: {
                    id: 'reefs_breakers_exceptional', text: 'Le passage est parfaitement exécuté.', advanceMonths: 3,
                    effects: [
                      { type: 'setFlag', flagId: 'reefs_clean_crossing' },
                      { type: 'setFlag', flagId: 'reefs_crossed' },
                      { type: 'moveToLocation', locationId: 'outer_route', travelState: 'at_sea' },
                    ],
              },
            },
          },
        },
      ],
    },
    {
      id: 'mira_confession',
      title: 'L’aveu de Mira',
      text: 'Mira révèle pourquoi des hommes la recherchent.',
      scheduledOnly: false,
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'hasFlag', flagId: 'black_squall_resolved' },
          { type: 'npcStatusIs', npcId: 'mira', status: 'crew' },
          { type: 'monthAtLeast', value: 5 },
        ],
      },
      priority: 85,
      choices: [
        {
          id: 'trust_mira',
          text: 'Lui faire confiance et accepter qu’elle reste à bord.',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_confession_trusted', text: 'Mira reste à bord avec votre confiance.', advanceMonths: 1,
              effects: [
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: 20 },
                { type: 'setFlag', flagId: 'mira_trusted' },
                { type: 'setFlag', flagId: 'mira_confession_resolved' },
              ],
            },
          },
        },
        {
          id: 'keep_watch',
          text: 'La laisser rester, mais la garder sous surveillance.',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_confession_watched', text: 'Mira reste sous surveillance.', advanceMonths: 1,
              effects: [
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: -5 },
                { type: 'setFlag', flagId: 'mira_mistrusted' },
                { type: 'setFlag', flagId: 'mira_confession_resolved' },
              ],
            },
          },
        },
        {
          id: 'put_mira_ashore',
          text: 'La débarquer pour éviter ses problèmes.',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_confession_exiled', text: 'Mira quitte le navire.', advanceMonths: 1,
              effects: [
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: -20 },
                { type: 'setNpcStatus', npcId: 'mira', status: 'departed' },
                { type: 'setFlag', flagId: 'mira_confession_resolved' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'mira_hunters',
      title: 'Les chasseurs de Mira',
      text: 'Les poursuivants de Mira retrouvent votre navire.',
      scheduledOnly: false,
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'hasFlag', flagId: 'reefs_crossed' },
          { type: 'locationIs', locationId: 'outer_route' },
          { type: 'npcStatusIs', npcId: 'mira', status: 'crew' },
          {
            type: 'any',
            conditions: [
              { type: 'hasChosen', eventId: 'mira_confession', choiceId: 'trust_mira' },
              { type: 'hasChosen', eventId: 'mira_confession', choiceId: 'keep_watch' },
            ],
          },
          { type: 'monthAtLeast', value: 10 },
        ],
      },
      priority: 85,
      choices: [
        {
          id: 'let_mira_speak',
          text: '[Relation Mira 40] Faire confiance à Mira pour négocier.',
          availableIf: { type: 'npcRelationshipAtLeast', npcId: 'mira', value: 40 },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_hunters_negotiated', text: 'Mira obtient une issue pacifique.', advanceMonths: 1,
              effects: [
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: 10 },
                { type: 'setFlag', flagId: 'mira_hunters_peaceful' },
                { type: 'setFlag', flagId: 'mira_hunters_resolved' },
              ],
            },
          },
        },
        {
          id: 'bluff_hunters',
          text: '[Charisme 35] Convaincre les poursuivants qu’ils se trompent de navire.',
          availableIf: { type: 'statAtLeast', statId: 'charisma', value: 35 },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_hunters_bluffed', text: 'Le bluff éloigne les poursuivants.', advanceMonths: 1,
              effects: [
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: 5 },
                { type: 'setFlag', flagId: 'mira_hunters_resolved' },
              ],
            },
          },
        },
        {
          id: 'outrun_hunters',
          text: 'Tenter de semer leurs navires.',
          resolution: {
            type: 'dice',
            statId: 'navigation',
            successThreshold: 13,
            modifiers: [{
              condition: { type: 'shipConditionAtMost', value: 1 },
              value: -4,
              displayLabel: 'Bateau endommagé',
            }],
            outcomes: {
              criticalFailure: {
                    id: 'mira_hunters_escape_catastrophe', text: 'La fuite tourne à la catastrophe.', advanceMonths: 1,
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'modifyNpcRelationship', npcId: 'mira', amount: -10 },
                      { type: 'setNpcStatus', npcId: 'mira', status: 'departed' },
                      { type: 'setFlag', flagId: 'mira_hunters_resolved' },
                    ],
              },
              failure: {
                    id: 'mira_hunters_escape_failure', text: 'La fuite coûte cher au navire.', advanceMonths: 1,
                    effects: [
                      { type: 'modifyShipCondition', amount: -1 },
                      { type: 'modifyNpcRelationship', npcId: 'mira', amount: -5 },
                      { type: 'setFlag', flagId: 'mira_hunters_resolved' },
                    ],
              },
              success: {
                    id: 'mira_hunters_escape_success', text: 'Les poursuivants sont semés.', advanceMonths: 1,
                    effects: [
                      { type: 'modifyNpcRelationship', npcId: 'mira', amount: 10 },
                      { type: 'setFlag', flagId: 'mira_hunters_resolved' },
                    ],
              },
              criticalSuccess: {
                    id: 'mira_hunters_escape_exceptional', text: 'La fuite est une réussite éclatante.', advanceMonths: 1,
                    effects: [
                      { type: 'modifyNpcRelationship', npcId: 'mira', amount: 15 },
                      { type: 'setFlag', flagId: 'mira_hunters_resolved' },
                    ],
              },
            },
          },
        },
        {
          id: 'hand_over_mira',
          text: 'Livrer Mira pour éviter un affrontement.',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_hunters_betrayed', text: 'Mira est livrée à ses poursuivants.', advanceMonths: 1,
              effects: [
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: -50 },
                { type: 'setNpcStatus', npcId: 'mira', status: 'unavailable' },
                { type: 'setFlag', flagId: 'mira_betrayed' },
                { type: 'setFlag', flagId: 'mira_hunters_resolved' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'mira_returns_favor',
      title: 'Une dette honorée',
      text: 'Mira revient honorer la dette née de son sauvetage.',
      scheduledOnly: true,
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'hasChosen', eventId: 'mira_castaway', choiceId: 'rescue_dropoff' },
          { type: 'npcStatusIs', npcId: 'mira', status: 'departed' },
        ],
      },
      priority: 100,
      choices: [
        {
          id: 'accept_mira_favor',
          text: 'Accepter la lettre de passage que Mira a obtenue.',
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'mira_favor_received', text: 'Mira remet une lettre de passage.', advanceMonths: 0,
              effects: [
                { type: 'addItem', itemId: 'mira_letter_of_passage' },
                { type: 'modifyNpcRelationship', npcId: 'mira', amount: 10 },
                { type: 'setFlag', flagId: 'mira_returned_favor' },
              ],
            },
          },
        },
      ],
    },
    {
      id: 'year_one_end',
      title: 'Un an en mer',
      text: 'La première année de carrière touche à sa fin.',
      scheduledOnly: false,
      eligibility: {
        type: 'all',
        conditions: [
          { type: 'hasFlag', flagId: 'reefs_crossed' },
          { type: 'locationIs', locationId: 'outer_route' },
          { type: 'monthAtLeast', value: 11 },
          {
            type: 'any',
            conditions: [
              { type: 'not', condition: { type: 'npcStatusIs', npcId: 'mira', status: 'crew' } },
              { type: 'hasFlag', flagId: 'mira_hunters_resolved' },
            ],
          },
        ],
      },
      priority: 100,
      choices: [
        {
          id: 'press_on',
          text: 'Poursuivre la route vers des mers plus dangereuses.',
          availableIf: { type: 'shipConditionAtLeast', value: 1 },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'year_one_continues', text: 'La carrière continue au-delà de la première année.', advanceMonths: 1,
              effects: [{ type: 'setFlag', flagId: 'ending_press_on' }, { type: 'endCareer', reason: 'legacy' }],
            },
          },
        },
        {
          id: 'use_mira_passage',
          text: 'Utiliser la route que Mira vous a fait parvenir.',
          visibleIf: {
            type: 'all',
            conditions: [
              { type: 'hasItem', itemId: 'mira_letter_of_passage' },
              { type: 'shipConditionAtLeast', value: 1 },
            ],
          },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'year_one_mira_favor', text: 'La lettre ouvre une nouvelle route.', advanceMonths: 1,
              effects: [{ type: 'setFlag', flagId: 'ending_mira_favor' }, { type: 'endCareer', reason: 'legacy' }],
            },
          },
        },
        {
          id: 'sail_with_mira',
          text: 'Continuer l’aventure avec Mira à bord.',
          visibleIf: {
            type: 'all',
            conditions: [
              { type: 'npcStatusIs', npcId: 'mira', status: 'crew' },
              { type: 'npcRelationshipAtLeast', npcId: 'mira', value: 40 },
              { type: 'shipConditionAtLeast', value: 1 },
            ],
          },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'year_one_with_mira', text: 'Mira reste à bord pour la suite.', advanceMonths: 1,
              effects: [{ type: 'setFlag', flagId: 'ending_with_mira' }, { type: 'endCareer', reason: 'legacy' }],
            },
          },
        },
        {
          id: 'make_landfall',
          text: 'Le bateau ne peut plus continuer. Faire escale.',
          visibleIf: { type: 'shipConditionAtMost', value: 0 },
          resolution: {
            type: 'deterministic',
            outcome: {
              id: 'year_one_ship_broken', text: 'La première expédition prend fin à terre.', advanceMonths: 1,
              effects: [{ type: 'setFlag', flagId: 'ending_ship_broken' }, { type: 'endCareer', reason: 'legacy' }],
            },
          },
        },
      ],
    },
  ],
} satisfies ContentCatalog;
