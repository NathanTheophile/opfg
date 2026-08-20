import { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import type { CompletedRun } from '@/game/engine/completedRuns';
import { buildFinalRunReport } from '@/game/engine/finalRun';
import { t, type LocaleId } from '@/game/localization';
import { FinalRunScreen, runCopy } from './FinalRunScreen';

export function RunHistoryPanel({
  runs,
  catalog,
  locale,
}: {
  runs: CompletedRun[];
  catalog: ContentCatalog;
  locale: LocaleId;
}) {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const selectedRun = runs.find(({ id }) => id === selectedRunId) ?? null;
  const rows = useMemo(() => runs.map((run) => ({
    run,
    report: buildFinalRunReport(run.state, catalog),
  })), [runs, catalog]);

  if (selectedRun) {
    return (
      <div className="opfg-run-history__detail">
        <Button variant="subtle" onClick={() => setSelectedRunId(null)}>← {runCopy(locale, 'history')}</Button>
        <FinalRunScreen state={selectedRun.state} catalog={catalog} locale={locale} compact />
      </div>
    );
  }

  if (rows.length === 0) {
    return <p>{runCopy(locale, 'noCompletedRuns')}</p>;
  }

  return (
    <div className="opfg-run-history__list">
      {rows.map(({ run, report }) => {
        const name = run.state.player.profile.name?.trim() || runCopy(locale, 'unnamed');
        const ending = report.endingNameKey ? t(report.endingNameKey, locale) : runCopy(locale, 'careerEnding');
        return (
          <button key={run.id} type="button" className="opfg-run-history__row" onClick={() => setSelectedRunId(run.id)}>
            <span><strong>{name}</strong><small>{ending} · {Math.floor(run.state.ageMonths / 12)} {runCopy(locale, 'yearsShort')}</small></span>
            <span className="opfg-run-history__row-score">{report.score}/100</span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
