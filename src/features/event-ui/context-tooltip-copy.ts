export type TooltipLocale = 'fr' | 'en';

export type ContextStatId =
  | 'health'
  | 'morale'
  | 'strength'
  | 'agility'
  | 'observation'
  | 'intelligence'
  | 'navigation'
  | 'charisma'
  | 'luck'
  | 'loyalty'
  | 'calm';

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
  loyalty: '#D0A84B',
  calm: '#62A5C5',
};

const STAT_DETAILS: Record<
  TooltipLocale,
  Record<ContextStatId, string>
> = {
  fr: {
    health:
      "DÃ©termine combien de dÃ©gÃ¢ts vous pouvez encaisser avant de vous effondrer. Les bandages ne sont pas une stratÃ©gie, mÃªme si certains Ã©quipages semblent penser le contraireâ€¦",
    morale:
      "Aide Ã  encaisser la peur, les dÃ©faites et les trÃ¨s mauvaises nouvelles. Un bon banquet rÃ¨gle beaucoup de choses. Pas tout.",
    strength:
      "Sert au combat rapprochÃ© et au dÃ©veloppement du Haki de lâ€™Armement. Vous perdrez quand mÃªme face aux Kung-Fu Dugongsâ€¦",
    agility:
      "Sert Ã  esquiver, poursuivre et vous sortir des situations qui exigent des jambes. Courir sur lâ€™eau reste rÃ©servÃ© aux gens beaucoup trop entraÃ®nÃ©s.",
    observation:
      "Aide Ã  repÃ©rer les dangers, lire lâ€™adversaire et dÃ©velopper le Haki de lâ€™Observation. Voir venir le coup ne garantit pas que vous saurez lâ€™Ã©viter.",
    intelligence:
      "Sert Ã  comprendre, planifier et rÃ©soudre les problÃ¨mes qui ne cÃ¨dent pas aprÃ¨s trois coups de poing. Oui, il y en a.",
    navigation:
      "Sert Ã  lire les mers, les courants et les routes impossibles de Grand Line. Sans Ã§a, mÃªme un Log Pose ressemble surtout Ã  une dÃ©coration.",
    charisma:
      "Aide Ã  convaincre, recruter et imposer votre prÃ©sence. Crier que vous serez Roi des Pirates fonctionne Ã©tonnamment bien, mais pas sur tout le monde.",
    luck:
      "Intervient quand le plan est mauvais mais que lâ€™univers hÃ©site encore Ã  vous punir. Ne remplace ni un navigateur ni un cerveau.",
    loyalty:
      "Mesure lâ€™attachement dâ€™un membre Ã  lâ€™Ã©quipage et sa volontÃ© de rester quand tout part mal. Les chansons autour dâ€™un tonneau aident.",
    calm:
      "Mesure sa capacitÃ© Ã  garder la tÃªte froide sous pression. Utile lorsquâ€™un Amiral dÃ©cide que votre journÃ©e Ã©tait trop tranquille.",
  },
  en: {
    health:
      "How much punishment you can take before collapsing. Bandages are not a strategy, even if some crews seem convinced otherwiseâ€¦",
    morale:
      "Helps you endure fear, defeats and extremely bad news. A proper banquet fixes many things. Not everything.",
    strength:
      "Used for close combat and developing Armament Haki. You will still lose to the Kung-Fu Dugongsâ€¦",
    agility:
      "Used to dodge, chase and escape situations that require functioning legs. Running on water is still reserved for absurdly trained people.",
    observation:
      "Helps you spot danger, read opponents and develop Observation Haki. Seeing the hit coming does not guarantee you can dodge it.",
    intelligence:
      "Used to understand, plan and solve problems that do not surrender after three punches. Yes, those exist.",
    navigation:
      "Used to read seas, currents and Grand Line's impossible routes. Without it, even a Log Pose mostly looks decorative.",
    charisma:
      "Helps persuade, recruit and impose your presence. Shouting that you will become Pirate King works surprisingly often, but not on everyone.",
    luck:
      "Matters when the plan is terrible but the universe has not decided to punish you yet. Does not replace a navigator or a brain.",
    loyalty:
      "Measures how attached a crewmate is and how willing they are to stay when everything goes wrong. Songs around a barrel help.",
    calm:
      "Measures the ability to keep a cool head under pressure. Useful when an Admiral decides your day was going too well.",
  },
};

const UI_DETAILS = {
  fr: {
    world:
      "Votre position actuelle et lâ€™Ã©tat du voyage. Si le nom du lieu ne vous dit rien, blÃ¢mez le navigateur avec assurance.",
    time:
      "Votre Ã¢ge et la phase actuelle de votre carriÃ¨re. Sur Grand Line, vieillir est dÃ©jÃ  une forme de rÃ©ussite.",
    ship:
      "Votre navire, son type et son Ã©tat. Ã€ 0 PV, il devient surtout un trÃ¨s mauvais sous-marin.",
    crewRole:
      "Le poste principal de ce membre Ã  bord. MÃªme les pirates finissent par dÃ©couvrir les joies de lâ€™organigramme.",
    crew:
      "Membres actuellement embarquÃ©s par rapport Ã  la capacitÃ© du navire. Au-delÃ , quelquâ€™un finit forcÃ©ment par dormir dans les tonneaux.",
  },
  en: {
    world:
      "Your current position and travel state. If the place name means nothing to you, confidently blame the navigator.",
    time:
      "Your age and current career phase. On the Grand Line, getting older is already an achievement.",
    ship:
      "Your ship, its type and condition. At 0 HP, it mostly becomes a very poor submarine.",
    crewRole:
      "This crewmate's main job aboard the ship. Even pirates eventually discover the joys of an org chart.",
    crew:
      "Current crewmates versus ship capacity. Go over it and someone inevitably ends up sleeping in a barrel.",
  },
} as const;

export function inferTooltipLocale(healthLabel: string): TooltipLocale {
  return healthLabel.trim().toLocaleLowerCase().startsWith('vie')
    ? 'fr'
    : 'en';
}

export function getStatTooltipDetail(
  statId: ContextStatId,
  locale: TooltipLocale,
): string {
  return STAT_DETAILS[locale][statId];
}

export function getUiTooltipDetail(
  id: keyof typeof UI_DETAILS.fr,
  locale: TooltipLocale,
): string {
  return UI_DETAILS[locale][id];
}
