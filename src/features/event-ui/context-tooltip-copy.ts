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
  health: 'var(--stat-health)',
  morale: 'var(--stat-morale)',
  strength: 'var(--stat-strength)',
  agility: 'var(--stat-agility)',
  observation: 'var(--stat-observation)',
  intelligence: 'var(--stat-intelligence)',
  navigation: 'var(--stat-navigation)',
  charisma: 'var(--stat-charisma)',
  luck: 'var(--stat-luck)',
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
