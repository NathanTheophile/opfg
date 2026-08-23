export interface CareerEndingCandidateDefinition {
  eventId: string;
  priority: number;
}

export const CAREER_ENDING_IDS = [
  "ending_pirate_world_scale_flag",
  "ending_pirate_free_harbor_power",
  "ending_pirate_last_impossible_score",
  "ending_pirate_beyond_chart",
  "ending_marine_top_command",
  "ending_marine_people_over_rank",
  "ending_marine_institutional_standard",
  "ending_revolutionary_network_preserved",
  "ending_revolutionary_cells_unbroken",
  "ending_revolutionary_truce_won",
  "ending_revolutionary_records_secured",
  "ending_civilian_trading_house",
  "ending_civilian_chartered_explorer",
  "ending_civilian_maritime_magnate",
  "ending_marine_last_order",
  "ending_civilian_work_outlives_you"
] as const;

export const CAREER_ENDING_CANDIDATES: readonly CareerEndingCandidateDefinition[] = [
  {
    "eventId": "active_ending_pirate_world_scale_flag",
    "priority": 400
  },
  {
    "eventId": "active_ending_pirate_free_harbor_power",
    "priority": 300
  },
  {
    "eventId": "active_ending_pirate_last_impossible_score",
    "priority": 200
  },
  {
    "eventId": "active_ending_pirate_beyond_chart",
    "priority": 100
  },
  {
    "eventId": "active_ending_marine_top_command",
    "priority": 400
  },
  {
    "eventId": "active_ending_marine_people_over_rank",
    "priority": 300
  },
  {
    "eventId": "active_ending_marine_last_order",
    "priority": 200
  },
  {
    "eventId": "active_ending_marine_institutional_standard",
    "priority": 100
  },
  {
    "eventId": "active_ending_revolutionary_network_preserved",
    "priority": 400
  },
  {
    "eventId": "active_ending_revolutionary_cells_unbroken",
    "priority": 300
  },
  {
    "eventId": "active_ending_revolutionary_truce_won",
    "priority": 200
  },
  {
    "eventId": "active_ending_revolutionary_records_secured",
    "priority": 100
  },
  {
    "eventId": "active_ending_civilian_maritime_magnate",
    "priority": 400
  },
  {
    "eventId": "active_ending_civilian_chartered_explorer",
    "priority": 300
  },
  {
    "eventId": "active_ending_civilian_trading_house",
    "priority": 200
  },
  {
    "eventId": "active_ending_civilian_work_outlives_you",
    "priority": 100
  }
];

export const CAREER_ENDING_ROOT_IDS = new Set<string>(
  CAREER_ENDING_CANDIDATES.map((entry) => entry.eventId),
);
