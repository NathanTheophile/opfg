import { ArrowRight } from 'lucide-react';
import { Badge, Button, Panel, PanelBody, PanelFooter, PanelHeader, PanelTitle } from '@/components/ui';
import type { OutcomeEffectTone, OutcomeViewModel } from './types';

const EFFECT_VARIANT: Record<OutcomeEffectTone, 'default' | 'success' | 'warning' | 'critical'> = {
  default: 'default',
  positive: 'success',
  warning: 'warning',
  critical: 'critical',
};

export interface OutcomePanelProps {
  outcome: OutcomeViewModel;
  onContinue: () => void;
}

export function OutcomePanel({ outcome, onContinue }: OutcomePanelProps) {
  return (
    <Panel
      variant="strong"
      padding="none"
      className="w-full overflow-hidden shadow-overlay"
    >
      <PanelHeader className="mb-0 px-5 pb-4 pt-5 md:px-7 md:pb-5 md:pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Conséquence</p>
        <PanelTitle className="text-2xl md:text-[1.75rem]">{outcome.title ?? 'La suite de votre histoire'}</PanelTitle>
      </PanelHeader>

      <div className="h-px bg-[var(--border-subtle)]" />

      <PanelBody className="px-5 py-5 md:px-7 md:py-6">
        <p className="max-w-[68ch] text-[0.98rem] leading-7 text-fg-secondary md:text-base md:leading-7">
          {outcome.body}
        </p>

        {outcome.effects && outcome.effects.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Effets de la conséquence">
            {outcome.effects.map((effect) => (
              <Badge key={effect.id} variant={EFFECT_VARIANT[effect.tone ?? 'default']}>
                {effect.label}
              </Badge>
            ))}
          </div>
        )}
      </PanelBody>

      <PanelFooter className="mt-0 border-t border-[var(--border-subtle)] bg-black/[0.08] px-4 py-4 md:px-6">
        <Button variant="glass" size="lg" onClick={onContinue}>
          Continuer
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </PanelFooter>
    </Panel>
  );
}
