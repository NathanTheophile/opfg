import {
  CalendarRange,
  PackageCheck,
  TrendingDown,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import {
  Button,
  NineSliceFrame,
  Panel,
  PanelBody,
  PanelHeader,
  PanelTitle,
} from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import type {
  YearEndStatId,
  YearEndSummary,
} from '@/game/engine/yearEndSummary';
import type { Translator } from '@/game/localization';
import type { GameState } from '@/game/model/schema';
import parchmentTextFrame from './assets/parchment-text-frame.webp';
import './year-end-summary.css';

interface YearEndSummaryPanelProps {
  summary: YearEndSummary;
  state: GameState;
  catalog: ContentCatalog;
  translate: Translator;
  statLabel: (statId: YearEndStatId) => string;
  onContinue: () => void;
}

function crewName(
  npcId: string,
  state: GameState,
  catalog: ContentCatalog,
  translate: Translator,
) {
  const definition = catalog.npcs.find(({ id }) => id === npcId);
  return state.npcs[npcId]?.displayName
    ?? (definition
      ? translate(definition.nameKey)
      : translate('ui.yearEnd.unknownCrewmate'));
}

function itemName(
  itemId: string,
  catalog: ContentCatalog,
  translate: Translator,
) {
  const definition = catalog.items.find(({ id }) => id === itemId);
  return definition
    ? translate(definition.nameKey)
    : translate('ui.yearEnd.unknownItem');
}

export function YearEndSummaryPanel({
  summary,
  state,
  catalog,
  translate,
  statLabel,
  onContinue,
}: YearEndSummaryPanelProps) {
  return (
    <Panel
      variant="strong"
      padding="none"
      className="opfg-event-panel opfg-year-end-summary w-full"
      aria-label={translate('ui.yearEnd.title')}
    >
      <PanelHeader className="opfg-event-panel__header">
        <div className="opfg-event-panel__header-layout">
          <div className="opfg-event-panel__header-copy">
            <span className="opfg-event-panel__meta-location">
              <CalendarRange className="size-[0.85rem]" aria-hidden="true" />
              <span>{translate('ui.yearEnd.eyebrow')}</span>
            </span>
            <PanelTitle className="opfg-event-panel__title">
              {translate('ui.yearEnd.title')}
            </PanelTitle>
          </div>

          <span className="opfg-event-panel__meta-time">
            <span className="opfg-year-end-summary__age-range">
              {summary.fromAge} → {summary.toAge} {translate('ui.unit.years')}
            </span>
          </span>
        </div>
      </PanelHeader>

      <div className="opfg-event-panel__divider" />

      <PanelBody className="opfg-event-panel__body opfg-parchment-surface opfg-year-end-summary__body">
        <NineSliceFrame
          className="opfg-parchment-nine-slice"
          texture={parchmentTextFrame}
        />

        <div className="opfg-year-end-summary__content">
          <div className="opfg-year-end-summary__intro">
            <p>{translate('ui.yearEnd.description')}</p>
            <span>
              <strong>{summary.eventsResolved}</strong>
              {' '}{translate('ui.yearEnd.eventsResolved')}
            </span>
          </div>

          <section className="opfg-year-end-summary__section">
            <h3>{translate('ui.yearEnd.statsTitle')}</h3>
            {summary.statChanges.length > 0 ? (
              <div className="opfg-year-end-summary__stats">
                {summary.statChanges.map(({ statId, amount }) => {
                  const positive = amount > 0;
                  const Icon = positive ? TrendingUp : TrendingDown;
                  return (
                    <div
                      key={statId}
                      className="opfg-year-end-summary__stat"
                      data-tone={positive ? 'positive' : 'negative'}
                    >
                      <Icon aria-hidden="true" />
                      <span>{statLabel(statId)}</span>
                      <strong>{positive ? '+' + amount : amount}</strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="opfg-year-end-summary__empty">
                {translate('ui.yearEnd.statsEmpty')}
              </p>
            )}
          </section>

          <section className="opfg-year-end-summary__section">
            <h3>{translate('ui.yearEnd.highlightsTitle')}</h3>
            {summary.highlights.length > 0 ? (
              <div className="opfg-year-end-summary__highlights">
                {summary.highlights.map((highlight) => {
                  if (highlight.type === 'crewRecruit') {
                    return (
                      <div
                        key={'crew-' + highlight.npcId}
                        className="opfg-year-end-summary__highlight"
                      >
                        <UserPlus aria-hidden="true" />
                        <span>
                          {translate('ui.yearEnd.recruited')}
                          <strong>{crewName(highlight.npcId, state, catalog, translate)}</strong>
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={'item-' + highlight.itemId}
                      className="opfg-year-end-summary__highlight"
                    >
                      <PackageCheck aria-hidden="true" />
                      <span>
                        {translate('ui.yearEnd.uniqueItem')}
                        <strong>{itemName(highlight.itemId, catalog, translate)}</strong>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="opfg-year-end-summary__empty">
                {translate('ui.yearEnd.highlightsEmpty')}
              </p>
            )}
          </section>
        </div>
      </PanelBody>

      <div className="opfg-event-panel__choices">
        <Button
          variant="glass"
          className="opfg-year-end-summary__continue"
          onClick={onContinue}
        >
          {translate('ui.yearEnd.continue')}
        </Button>
      </div>
    </Panel>
  );
}
