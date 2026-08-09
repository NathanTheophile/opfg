import { Panel } from '@/components/ui';
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
}

const RESULT_LABELS: Record<
  Extract<DicePanelStatus, 'success' | 'failure' | 'criticalSuccess' | 'criticalFailure'>,
  string
> = {
  success: 'RÉUSSITE',
  failure: 'ÉCHEC',
  criticalSuccess: 'RÉUSSITE CRITIQUE',
  criticalFailure: 'ÉCHEC CRITIQUE',
};

function formatModifier(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function isResolvedStatus(
  status: DicePanelStatus,
): status is 'success' | 'failure' | 'criticalSuccess' | 'criticalFailure' {
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
}: DicePanelProps) {
  const resolved = isResolvedStatus(status);
  const modifierSign = modifier > 0 ? 'positive' : modifier < 0 ? 'negative' : 'neutral';

  return (
    <div className={`opfg-dice-module ${className}`.trim()}>
      <div className="opfg-dice-modifier" data-sign={modifierSign}>
        {statLabel && <span className="opfg-dice-modifier__label">{statLabel}</span>}
        <strong>{formatModifier(modifier)}</strong>
      </div>

      <Panel
        variant="strong"
        padding="none"
        className="opfg-dice-panel"
        aria-label={result === undefined ? 'Jet de d20 prêt' : `Jet de d20 : ${result}`}
      >
        <D20Roll
          result={result}
          rollKey={rollKey}
          rolling={status === 'rolling'}
          onComplete={onComplete}
        />

        {status === 'armed' && (
          <button
            type="button"
            className="opfg-dice-panel__roll-trigger"
            onClick={onRoll}
            aria-label="Lancer le d20"
          >
            <span className="opfg-dice-panel__roll-label">LANCER</span>
          </button>
        )}

        {resolved && (
          <div className="opfg-dice-panel__result" data-result={status} aria-live="assertive">
            <span>{RESULT_LABELS[status]}</span>
          </div>
        )}
      </Panel>
    </div>
  );
}
