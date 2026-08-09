import { D20Roll } from './D20Roll';
import './dice-table-stage.css';

export type DiceTableStageStatus =
  | 'armed'
  | 'rolling'
  | 'success'
  | 'failure'
  | 'criticalSuccess'
  | 'criticalFailure';

export interface DiceTableStageProps {
  visible: boolean;
  status: DiceTableStageStatus;
  modifier: number;
  statLabel?: string;
  result?: number;
  rollKey?: string | number;
  onRoll?: () => void;
  onComplete?: () => void;
}

const RESULT_LABELS: Record<
  Extract<
    DiceTableStageStatus,
    'success' | 'failure' | 'criticalSuccess' | 'criticalFailure'
  >,
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

function isResolved(
  status: DiceTableStageStatus,
): status is 'success' | 'failure' | 'criticalSuccess' | 'criticalFailure' {
  return status !== 'armed' && status !== 'rolling';
}

export function DiceTableStage({
  visible,
  status,
  modifier,
  statLabel,
  result,
  rollKey,
  onRoll,
  onComplete,
}: DiceTableStageProps) {
  const modifierSign = modifier > 0 ? 'positive' : modifier < 0 ? 'negative' : 'neutral';
  const resolved = isResolved(status);

  return (
    <div
      className={`opfg-dice-table-stage ${visible ? 'is-visible' : ''}`}
      aria-hidden={!visible}
    >
      <div className="opfg-dice-table-stage__module">
        <div className="opfg-dice-table-stage__meta" data-sign={modifierSign}>
          {statLabel && <span>{statLabel}</span>}
          <strong>{formatModifier(modifier)}</strong>
        </div>

        <div className="opfg-dice-table-stage__field">
          <D20Roll
            result={result}
            rollKey={rollKey}
            rolling={status === 'rolling'}
            onComplete={onComplete}
          />

          {status === 'armed' && (
            <button
              type="button"
              className="opfg-dice-table-stage__trigger"
              onClick={onRoll}
              aria-label="Lancer le d20 sur la table"
            >
              <span>LANCER</span>
            </button>
          )}

          {resolved && (
            <div
              className="opfg-dice-table-stage__result"
              data-result={status}
              aria-live="assertive"
            >
              <span>{RESULT_LABELS[status]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
