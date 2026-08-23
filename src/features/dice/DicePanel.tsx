import { Panel } from '@/components/ui';
import type { Translator } from '@/game/localization';
import { D20Roll } from './D20Roll';
import './dice-panel.css';

export type DicePanelStatus =
  | 'armed'
  | 'rolling'
  | 'success'
  | 'failure'
  | 'criticalSuccess'
  | 'criticalFailure';

export interface DicePanelProps {
  status: DicePanelStatus;
  modifier: number;
  statLabel?: string;
  result?: number;
  rollKey?: string | number;
  onRoll?: () => void;
  onComplete?: () => void;
  className?: string;
  translate: Translator;
}

const RESULT_KEYS: Record<
  Extract<DicePanelStatus, 'success' | 'failure' | 'criticalSuccess' | 'criticalFailure'>,
  string
> = {
  success: 'dice.success',
  failure: 'dice.failure',
  criticalSuccess: 'dice.criticalSuccess',
  criticalFailure: 'dice.criticalFailure',
};

function formatModifier(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function isResolvedStatus(status: DicePanelStatus): status is keyof typeof RESULT_KEYS {
  return status !== 'armed' && status !== 'rolling';
}

export function DicePanel({
  status,
  modifier,
  statLabel,
  result,
  rollKey,
  onRoll,
  onComplete,
  className = '',
  translate,
}: DicePanelProps) {
  const resolved = isResolvedStatus(status);
  const modifierSign = modifier > 0 ? 'positive' : modifier < 0 ? 'negative' : 'neutral';
  const panelAria = result === undefined
    ? translate('ui.dice.readyAria')
    : translate('ui.dice.resultAria', { result });

  return (
    <div className={`opfg-dice-module ${className}`.trim()}>
      <div className="opfg-dice-modifier" data-sign={modifierSign}>
        {statLabel && <span className="opfg-dice-modifier__label">{statLabel}</span>}
        <strong>{formatModifier(modifier)}</strong>
      </div>

      <Panel variant="strong" padding="none" className="opfg-dice-panel" aria-label={panelAria}>
        <D20Roll
          result={result}
          rollKey={rollKey}
          rolling={status === 'rolling'}
          onComplete={onComplete}
          translate={translate}
        />

        {status === 'armed' && (
          <button
            type="button"
            className="opfg-dice-panel__roll-trigger"
            onClick={onRoll}
            aria-label={translate('ui.dice.rollAria')}
          >
            <span className="opfg-dice-panel__roll-label">{translate('ui.dice.roll')}</span>
          </button>
        )}

        {resolved && (
          <div className="opfg-dice-panel__result" data-result={status} aria-live="assertive">
            <span>{translate(RESULT_KEYS[status])}</span>
          </div>
        )}
      </Panel>
    </div>
  );
}
