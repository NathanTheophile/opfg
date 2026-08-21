import {
  useMemo,
  useState,
} from 'react';
import {
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import type { CompletedRun } from '@/game/engine/completedRuns';
import { buildFinalRunReport } from '@/game/engine/finalRun';
import {
  t,
  type LocaleId,
  type Translator,
} from '@/game/localization';
import {
  FinalRunScreen,
  formatRunAge,
} from './FinalRunScreen';

export function RunHistoryPanel({
  runs,
  catalog,
  locale,
}: {
  runs: CompletedRun[];
  catalog: ContentCatalog;
  locale: LocaleId;
}) {
  const [selectedRunId, setSelectedRunId] =
    useState<string | null>(null);
  const selectedRun =
    runs.find(({ id }) => id === selectedRunId) ?? null;
  const rows = useMemo(
    () =>
      runs.map((run) => ({
        run,
        report: buildFinalRunReport(run.state, catalog),
      })),
    [runs, catalog],
  );
  const translate: Translator = (key, params) =>
    t(key, locale, params);

  if (selectedRun) {
    return (
      <div className="opfg-run-history__detail">
        <Button
          variant="subtle"
          onClick={() => setSelectedRunId(null)}
        >
          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />
          {translate('ui.landing.history')}
        </Button>

        <FinalRunScreen
          state={selectedRun.state}
          catalog={catalog}
          locale={locale}
          compact
        />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="opfg-run-history__empty">
        {translate('ui.runHistory.noCompletedRuns')}
      </p>
    );
  }

  return (
    <div className="opfg-run-history__list">
      {rows.map(({ run, report }) => {
        const name =
          run.state.player.profile.name?.trim()
          || translate('ui.landing.unnamed');
        const ending = report.endingNameKey
          ? t(report.endingNameKey, locale)
          : translate('ui.runHistory.careerEnding');
        const age = formatRunAge(
          run.state.ageMonths,
          translate,
        );

        return (
          <button
            key={run.id}
            type="button"
            className="opfg-run-history__row"
            onClick={() => setSelectedRunId(run.id)}
          >
            <span>
              <strong>{name}</strong>
              <small>
                {translate('ui.runHistory.rowMeta', {
                  ending,
                  age,
                })}
              </small>
            </span>

            <span className="opfg-run-history__row-score">
              {report.score}/100
            </span>

            <ChevronRight
              className="size-4"
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
