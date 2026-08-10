import type { Translator } from '@/game/localization';
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
  total?: number;
  rollKey?: string | number;
  onRoll?: () => void;
  onComplete?: () => void;
  translate: Translator;
}

const RESULT_KEYS: Record<
  Extract<DiceTableStageStatus, 'success' | 'failure' | 'criticalSuccess' | 'criticalFailure'>,
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

function isResolved(status: DiceTableStageStatus): status is keyof typeof RESULT_KEYS {
  return status !== 'armed' && status !== 'rolling';
}

export function DiceTableStage({
  visible,
  status,
  modifier,
  statLabel,
  result,
  total,
  rollKey,
  onRoll,
  onComplete,
  translate,
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
            translate={translate}
          />

          {status === 'armed' && (
            <button
              type="button"
              className="opfg-dice-table-stage__trigger"
              onClick={onRoll}
              aria-label={translate('ui.dice.rollTableAria')}
            >
              <span>{translate('ui.dice.roll')}</span>
            </button>
          )}

          {resolved && (
            <div
              className="opfg-dice-table-stage__result"
              data-result={status}
              aria-live="assertive"
            >
              <span>{translate(RESULT_KEYS[status])}</span>
              {total !== undefined && (
                <small>{translate('ui.dice.total')} {total}</small>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
