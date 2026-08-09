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
  | 'awakening'
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
  awakening: '#D0A84B',
  loyalty: '#D0A84B',
  calm: '#62A5C5',
};

const STAT_DETAILS: Record<
  TooltipLocale,
  Record<ContextStatId, string>
> = {
  fr: {
    health:
      "Détermine combien de dégâts vous pouvez encaisser avant de vous effondrer. Les bandages ne sont pas une stratégie, même si certains équipages semblent penser le contraire…",
    morale:
      "Aide à encaisser la peur, les défaites et les très mauvaises nouvelles. Un bon banquet règle beaucoup de choses. Pas tout.",
    strength:
      "Sert au combat rapproché et au développement du Haki de l’Armement. Vous perdrez quand même face aux Kung-Fu Dugongs…",
    agility:
      "Sert à esquiver, poursuivre et vous sortir des situations qui exigent des jambes. Courir sur l’eau reste réservé aux gens beaucoup trop entraînés.",
    observation:
      "Aide à repérer les dangers, lire l’adversaire et développer le Haki de l’Observation. Voir venir le coup ne garantit pas que vous saurez l’éviter.",
    intelligence:
      "Sert à comprendre, planifier et résoudre les problèmes qui ne cèdent pas après trois coups de poing. Oui, il y en a.",
    navigation:
      "Sert à lire les mers, les courants et les routes impossibles de Grand Line. Sans ça, même un Log Pose ressemble surtout à une décoration.",
    charisma:
      "Aide à convaincre, recruter et imposer votre présence. Crier que vous serez Roi des Pirates fonctionne étonnamment bien, mais pas sur tout le monde.",
    luck:
      "Intervient quand le plan est mauvais mais que l’univers hésite encore à vous punir. Ne remplace ni un navigateur ni un cerveau.",
    awakening:
      "Représente votre progression vers l’Éveil de votre Fruit du Démon. Si vous n’avez aucune idée de ce que vous faites, rassurez-vous : le Fruit non plus.",
    loyalty:
      "Mesure l’attachement d’un membre à l’équipage et sa volonté de rester quand tout part mal. Les chansons autour d’un tonneau aident.",
    calm:
      "Mesure sa capacité à garder la tête froide sous pression. Utile lorsqu’un Amiral décide que votre journée était trop tranquille.",
  },
  en: {
    health:
      "How much punishment you can take before collapsing. Bandages are not a strategy, even if some crews seem convinced otherwise…",
    morale:
      "Helps you endure fear, defeats and extremely bad news. A proper banquet fixes many things. Not everything.",
    strength:
      "Used for close combat and developing Armament Haki. You will still lose to the Kung-Fu Dugongs…",
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
    awakening:
      "Represents your progress toward awakening your Devil Fruit. If you have no idea what you are doing, take comfort: the Fruit probably does not either.",
    loyalty:
      "Measures how attached a crewmate is and how willing they are to stay when everything goes wrong. Songs around a barrel help.",
    calm:
      "Measures the ability to keep a cool head under pressure. Useful when an Admiral decides your day was going too well.",
  },
};

const UI_DETAILS = {
  fr: {
    world:
      "Votre position actuelle et l’état du voyage. Si le nom du lieu ne vous dit rien, blâmez le navigateur avec assurance.",
    time:
      "Votre âge et la phase actuelle de votre carrière. Sur Grand Line, vieillir est déjà une forme de réussite.",
    ship:
      "Votre navire, son type et son état. À 0 PV, il devient surtout un très mauvais sous-marin.",
    crewRole:
      "Le poste principal de ce membre à bord. Même les pirates finissent par découvrir les joies de l’organigramme.",
    crew:
      "Membres actuellement embarqués par rapport à la capacité du navire. Au-delà, quelqu’un finit forcément par dormir dans les tonneaux.",
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
