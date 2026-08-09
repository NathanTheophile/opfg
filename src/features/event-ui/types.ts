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
  statChanges?: string[];
  textInput?: { minLength: number; maxLength: number; placeholder?: string };
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
  dice?: { statLabel: string; rawRoll: number; modifier: number; total: number; resultLabel: string };
}
