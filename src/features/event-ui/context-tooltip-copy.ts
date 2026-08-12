export type ContextStatId =
  | 'health'
  | 'morale'
  | 'strength'
  | 'agility'
  | 'observation'
  | 'intelligence'
  | 'navigation'
  | 'charisma'
  | 'luck';

export const STAT_TOOLTIP_COLORS: Record<ContextStatId, string> = {
  health: '#C94F4A',
  morale: '#4FA58B',
  strength: '#D8783F',
  agility: '#8AAA4D',
  observation: '#54A9B7',
  intelligence: '#806EB0',
  navigation: '#397FA8',
  charisma: '#BD6687',
  luck: '#D1A33C',
};

const STAT_TOOLTIP_KEYS: Record<ContextStatId, string> = {
  health: 'stat.health.description',
  morale: 'stat.morale.description',
  strength: 'stat.strength.description',
  agility: 'stat.agility.description',
  observation: 'stat.observation.description',
  intelligence: 'stat.intelligence.description',
  navigation: 'stat.navigation.description',
  charisma: 'stat.charisma.description',
  luck: 'stat.luck.description',
};

const UI_TOOLTIP_KEYS = {
  world: 'ui.tooltip.world',
  time: 'ui.tooltip.time',
  ship: 'ui.tooltip.ship',
  crewRole: 'ui.tooltip.crewRole',
  crew: 'ui.tooltip.crew',
} as const;

export type UiTooltipId = keyof typeof UI_TOOLTIP_KEYS;

export function getStatTooltipKey(statId: ContextStatId): string {
  return STAT_TOOLTIP_KEYS[statId];
}

export function getUiTooltipKey(id: UiTooltipId): string {
  return UI_TOOLTIP_KEYS[id];
}
