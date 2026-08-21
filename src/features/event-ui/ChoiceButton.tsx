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
  type LucideIcon,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import type { EventChoiceViewModel, PlayerDisplayStatId } from './types';
import './choice-button.css';

export interface ChoiceButtonProps {
  choice: EventChoiceViewModel;
  onSelect: (choice: EventChoiceViewModel) => void;
}

const STAT_ICONS: Record<PlayerDisplayStatId, LucideIcon> = {
  health: Heart,
  morale: Smile,
  strength: Dumbbell,
  agility: Footprints,
  observation: Eye,
  intelligence: Brain,
  navigation: Compass,
  charisma: MessageCircle,
  luck: Clover,
};

function formatChange(value: number, absolute = false): string {
  if (!absolute && value > 0) return `+${value}`;
  return String(value);
}

export function ChoiceButton({
  choice,
  onSelect,
}: ChoiceButtonProps) {
  const probability = choice.dice
    ? `${Math.round(choice.dice.successProbability * 100)} %`
    : null;

  return (
    <Button
      variant="glass"
      disabled={choice.disabled}
      onClick={() => onSelect(choice)}
      className="opfg-choice-button"
      data-has-dice={choice.dice ? 'true' : undefined}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-fg">
          {choice.label}
        </span>

        {choice.requirement && (
          <span className="mt-1 flex items-center gap-1.5 text-xs font-normal text-fg-muted">
            <LockKeyhole
              className="size-3.5 shrink-0"
              aria-hidden="true"
            />
            {choice.requirement}
          </span>
        )}

        {choice.statChanges && choice.statChanges.length > 0 && (
          <span
            className="opfg-choice-stat-effects"
            aria-label={choice.statChanges
              .map((change) => `${change.label} ${formatChange(change.value, change.absolute)}`)
              .join(', ')}
          >
            {choice.statChanges.map((change, index) => {
              const Icon = STAT_ICONS[change.statId];
              const displayValue = formatChange(change.value, change.absolute);
              const tone = change.absolute
                ? 'neutral'
                : change.value > 0
                  ? 'positive'
                  : change.value < 0
                    ? 'negative'
                    : 'neutral';

              return (
                <span
                  key={`${change.statId}-${index}-${displayValue}`}
                  className="opfg-choice-stat-effect"
                  data-stat={change.statId}
                  data-tone={tone}
                  data-tooltip={`${change.label} ${displayValue}`}
                  aria-label={`${change.label} ${displayValue}`}
                >
                  <Icon
                    className="opfg-choice-stat-effect__icon"
                    aria-hidden="true"
                  />
                  <strong className="opfg-choice-stat-effect__value">
                    {displayValue}
                  </strong>
                </span>
              );
            })}
          </span>
        )}
      </span>

      {choice.dice && (
        <Badge
          variant="gold"
          className="opfg-choice-dice-badge shrink-0 gap-1.5"
        >
          <Dices
            className="size-3.5"
            aria-hidden="true"
          />
          {choice.dice.statLabel} · {probability}
        </Badge>
      )}
    </Button>
  );
}
