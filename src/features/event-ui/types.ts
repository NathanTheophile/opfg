import type { ReactNode } from 'react';
import type { DiceResult, StatId } from '@/game/content/schema';

export type PlayerDisplayStatId = 'health' | StatId;

export interface DiceChoicePreview {
  statId: StatId;
  statLabel: string;
  successProbability: number;
  modifierTotal?: number;
}

export interface ChoiceStatChangeViewModel {
  statId: PlayerDisplayStatId;
  label: string;
  value: number;
  absolute?: boolean;
}

export interface EventChoiceViewModel {
  id: string;
  label: string;
  disabled?: boolean;
  requirement?: string;
  dice?: DiceChoicePreview;
  statChanges?: ChoiceStatChangeViewModel[];
  textInput?: { minLength: number; maxLength: number; placeholder?: string };
}

export interface EventViewModel {
  eyebrow?: string;
  title: string;
  body: ReactNode;
  choices: EventChoiceViewModel[];
}

export type OutcomeEffectTone = 'default' | 'positive' | 'warning' | 'critical';

export interface OutcomeEffectViewModel {
  id: string;
  label: string;
  tone?: OutcomeEffectTone;
  statId?: PlayerDisplayStatId;
  delta?: number;
  traitId?: string;
}

export interface OutcomeViewModel {
  title?: string;
  body: string;
  effects?: OutcomeEffectViewModel[];
  dice?: {
    statId: StatId;
    statLabel: string;
    rawRoll: number;
    modifier: number;
    total: number;
    result: DiceResult;
    resultLabel: string;
  };
}
