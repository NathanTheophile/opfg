import {
  Brain,
  Clover,
  Compass,
  Dices,
  Dumbbell,
  Eye,
  Footprints,
  Heart,
  LockKeyhole,
  MessageCircle,
  Smile,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { dictionaries, supportedLocales } from '@/game/localization';
import type { EventChoiceViewModel } from './types';
import './choice-button.css';

export interface ChoiceButtonProps {
  choice: EventChoiceViewModel;
  onSelect: (choice: EventChoiceViewModel) => void;
}

type ChoiceStatId =
  | 'health'
  | 'morale'
  | 'strength'
  | 'agility'
  | 'observation'
  | 'intelligence'
  | 'navigation'
  | 'charisma'
  | 'luck'
  | 'awakening';

interface ChoiceStatMeta {
  icon: LucideIcon;
  localizationKey: string;
}

interface ParsedChoiceStatChange {
  id: string;
  statId: ChoiceStatId | 'unknown';
  label: string;
  displayValue: string;
  tone: 'positive' | 'negative' | 'neutral';
  Icon: LucideIcon;
}

const STAT_META: Record<ChoiceStatId, ChoiceStatMeta> = {
  health: { icon: Heart, localizationKey: 'stat.health' },
  morale: { icon: Smile, localizationKey: 'stat.morale' },
  strength: { icon: Dumbbell, localizationKey: 'stat.strength' },
  agility: { icon: Footprints, localizationKey: 'stat.agility' },
  observation: { icon: Eye, localizationKey: 'stat.observation' },
  intelligence: { icon: Brain, localizationKey: 'stat.intelligence' },
  navigation: { icon: Compass, localizationKey: 'stat.navigation' },
  charisma: { icon: MessageCircle, localizationKey: 'stat.charisma' },
  luck: { icon: Clover, localizationKey: 'stat.luck' },
  awakening: { icon: Sparkles, localizationKey: 'stat.awakening' },
};

const STAT_IDS = Object.keys(STAT_META) as ChoiceStatId[];

function normalizeLabel(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function resolveStatId(label: string): ChoiceStatId | null {
  const normalized = normalizeLabel(label);

  for (const statId of STAT_IDS) {
    const key = STAT_META[statId].localizationKey;

    for (const locale of supportedLocales) {
      const localized = dictionaries[locale][key];
      if (localized && normalizeLabel(localized) === normalized) {
        return statId;
      }
    }
  }

  return null;
}

function parseStatChange(change: string, index: number): ParsedChoiceStatChange | null {
  const match = change.trim().match(/^(.*?)\s+([+-]?\d+(?:[.,]\d+)?)$/);
  if (!match) return null;

  const [, rawLabel, rawValue] = match;
  const numericValue = Number(rawValue.replace(',', '.'));
  if (!Number.isFinite(numericValue)) return null;

  const statId = resolveStatId(rawLabel) ?? 'unknown';
  const explicitlySigned = /^[+-]/.test(rawValue);
  const tone =
    explicitlySigned && numericValue > 0
      ? 'positive'
      : explicitlySigned && numericValue < 0
        ? 'negative'
        : 'neutral';

  const displayValue =
    explicitlySigned && numericValue > 0
      ? `+${numericValue}`
      : String(numericValue);

  return {
    id: `${statId}-${index}-${displayValue}`,
    statId,
    label: rawLabel.trim(),
    displayValue,
    tone,
    Icon: statId === 'unknown' ? Sparkles : STAT_META[statId].icon,
  };
}

export function ChoiceButton({ choice, onSelect }: ChoiceButtonProps) {
  const probability = choice.dice
    ? `${Math.round(choice.dice.successProbability * 100)} %`
    : null;

  const parsedStatChanges =
    choice.statChanges
      ?.map((change, index) => parseStatChange(change, index))
      .filter((change): change is ParsedChoiceStatChange => change !== null) ?? [];

  return (
    <Button
      variant="glass"
      disabled={choice.disabled}
      onClick={() => onSelect(choice)}
      className="group h-auto min-h-14 w-full justify-between gap-4 whitespace-normal px-4 py-3 text-left font-medium leading-snug md:px-5"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-fg">{choice.label}</span>

        {choice.requirement && (
          <span className="mt-1 flex items-center gap-1.5 text-xs font-normal text-fg-muted">
            <LockKeyhole className="size-3.5 shrink-0" aria-hidden="true" />
            {choice.requirement}
          </span>
        )}

        {parsedStatChanges.length > 0 && (
          <span
            className="opfg-choice-stat-effects"
            aria-label={parsedStatChanges
              .map((change) => `${change.label} ${change.displayValue}`)
              .join(', ')}
          >
            {parsedStatChanges.map(({ id, statId, label, displayValue, tone, Icon }) => (
              <span
                key={id}
                className="opfg-choice-stat-effect"
                data-stat={statId}
                data-tone={tone}
                data-tooltip={`${label} ${displayValue}`}
                aria-label={`${label} ${displayValue}`}
              >
                <Icon className="opfg-choice-stat-effect__icon" aria-hidden="true" />
                <strong className="opfg-choice-stat-effect__value">
                  {displayValue}
                </strong>
              </span>
            ))}
          </span>
        )}
      </span>

      {choice.dice && (
        <Badge variant="gold" className="shrink-0 gap-1.5">
          <Dices className="size-3.5" aria-hidden="true" />
          {choice.dice.statLabel} · {probability}
        </Badge>
      )}
    </Button>
  );
}
