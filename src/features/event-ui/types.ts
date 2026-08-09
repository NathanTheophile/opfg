export interface DiceChoicePreview {
  statLabel: string;
  successProbability: number;
  modifierTotal?: number;
}

export interface EventChoiceViewModel {
  id: string;
  label: string;
  disabled?: boolean;
  requirement?: string;
  dice?: DiceChoicePreview;
}

export interface EventViewModel {
  eyebrow?: string;
  title: string;
  body: string;
  choices: EventChoiceViewModel[];
}

export type OutcomeEffectTone = 'default' | 'positive' | 'warning' | 'critical';

export interface OutcomeEffectViewModel {
  id: string;
  label: string;
  tone?: OutcomeEffectTone;
}

export interface OutcomeViewModel {
  title?: string;
  body: string;
  effects?: OutcomeEffectViewModel[];
}
