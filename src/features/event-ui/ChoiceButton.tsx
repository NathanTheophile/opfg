import { Dices, LockKeyhole } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import type { EventChoiceViewModel } from './types';

export interface ChoiceButtonProps {
  choice: EventChoiceViewModel;
  onSelect: (choice: EventChoiceViewModel) => void;
}

export function ChoiceButton({ choice, onSelect }: ChoiceButtonProps) {
  const probability = choice.dice ? `${Math.round(choice.dice.successProbability * 100)} %` : null;

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
