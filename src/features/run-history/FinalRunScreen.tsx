import {
  ArrowLeft,
  Crown,
  History,
  Skull,
  Trophy,
} from 'lucide-react';
import { Button, Panel } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import { buildFinalRunReport } from '@/game/engine/finalRun';
import { npcInterpolationParams } from '@/game/engine/npcNames';
import { originNarrativeInterpolationParams } from '@/game/engine/originNarrative';
import {
  t,
  type LocaleId,
  type Translator,
} from '@/game/localization';
import type {
  GameState,
  PlayerAttributeId,
} from '@/game/model/schema';
import './run-history.css';

const STAT_KEYS: Record<PlayerAttributeId, string> = {
  morale: 'stat.morale',
  strength: 'stat.strength',
  agility: 'stat.agility',
  observation: 'stat.observation',
  intelligence: 'stat.intelligence',
  navigation: 'stat.navigation',
  charisma: 'stat.charisma',
  luck: 'stat.luck',
};

export interface FinalRunScreenProps {
  state: GameState;
  catalog: ContentCatalog;
  locale: LocaleId;
  onHome?: () => void;
  compact?: boolean;
}

export function FinalRunScreen({
  state,
  catalog,
  locale,
  onHome,
  compact = false,
}: FinalRunScreenProps) {
  const report = buildFinalRunReport(state, catalog);
  const translate: Translator = (key, params) =>
    t(key, locale, {
      playerName: state.player.profile.name ?? '',
      ...originNarrativeInterpolationParams(
        state,
        catalog,
        (originKey, originParams) =>
          t(originKey, locale, originParams),
      ),
      ...npcInterpolationParams(
        state,
        catalog,
        (nameKey) => t(nameKey, locale),
      ),
      ...params,
    });
  const playerName =
    state.player.profile.name?.trim()
    || translate('ui.landing.unnamed');
  const endingTitle = report.endingNameKey
    ? translate(report.endingNameKey)
    : translate('ui.runHistory.endingFallback');
  const endingDescription = report.endingDescriptionKey
    ? translate(report.endingDescriptionKey)
    : null;
  const ship = report.stats.shipId
    ? catalog.ships.find(({ id }) => id === report.stats.shipId)
    : null;
  const highestRank = report.stats.highestRankId
    ? catalog.careerRanks.find(({ id }) => id === report.stats.highestRankId)
    : null;
  const closestNpcDefinition = report.facts.closestNpcId
    ? catalog.npcs.find(({ id }) => id === report.facts.closestNpcId)
    : null;
  const closestNpcName = report.facts.closestNpcId
    ? (
        state.npcs[report.facts.closestNpcId]?.displayName
        ?? (
          closestNpcDefinition
            ? translate(closestNpcDefinition.nameKey)
            : report.facts.closestNpcId
        )
      )
    : null;

  return (
    <section
      className={`opfg-final-run${
        compact ? ' opfg-final-run--compact' : ''
      }`}
    >
      <div className="opfg-final-run__header">
        <div>
          <span className="opfg-final-run__eyebrow">
            {translate('ui.runHistory.lifeOf', { name: playerName })}
          </span>
          <h1>
            {state.careerEndReason === 'death'
              ? <Skull aria-hidden="true" />
              : <Crown aria-hidden="true" />}
            {endingTitle}
          </h1>
          {endingDescription && <p>{endingDescription}</p>}
        </div>

        <Panel
          variant="strong"
          padding="sm"
          className="opfg-final-run__score"
          aria-label={translate('ui.runHistory.scoreLabel', {
            score: report.score,
          })}
        >
          <Trophy aria-hidden="true" />
          <strong>{report.score}</strong>
          <span>/100</span>
          <small>
            {translate(`ui.runHistory.tier.${report.tier}`)}
          </small>
        </Panel>
      </div>

      <div
        className="opfg-final-run__axes"
        aria-label={translate('ui.runHistory.scoreBreakdown')}
      >
        {report.axes.map((axis) => (
          <div key={axis.id}>
            <span>
              {translate(`ui.runHistory.axis.${axis.id}`)}
            </span>
            <strong>
              {axis.points}/{axis.maxPoints}
            </strong>
          </div>
        ))}
      </div>

      <Panel
        variant="strong"
        className="opfg-final-run__section"
      >
        <h2>
          <History aria-hidden="true" />
          {translate('ui.runHistory.lifeSummary')}
        </h2>

        {report.moments.length === 0 ? (
          <p>{translate('ui.runHistory.noMoments')}</p>
        ) : (
          <ol className="opfg-final-run__timeline">
            {report.moments.map((moment) => (
              <li key={`${moment.eventId}-${moment.ageMonths}`}>
                <span>
                  {formatRunAge(moment.ageMonths, translate)}
                </span>
                <div>
                  <strong>{translate(moment.titleKey)}</strong>
                  {moment.outcomeTextKey && (
                    <p>{translate(moment.outcomeTextKey)}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Panel>

      <div className="opfg-final-run__grid">
        <Panel
          variant="strong"
          className="opfg-final-run__section"
        >
          <h2>{translate('ui.runHistory.statistics')}</h2>
          <dl className="opfg-final-run__facts">
            <Fact
              label={translate('ui.runHistory.stat.age')}
              value={formatRunAge(report.stats.ageMonths, translate)}
            />
            <Fact
              label={translate('ui.runHistory.stat.events')}
              value={report.stats.historyEntries}
            />
            <Fact
              label={translate('ui.runHistory.stat.reputation')}
              value={`${report.stats.reputation}/100`}
            />
            <Fact
              label={translate('ui.runHistory.stat.currentBounty')}
              value={formatRunBerries(
                report.stats.bounty,
                locale,
                translate,
              )}
            />
            <Fact
              label={translate('ui.runHistory.stat.maxBounty')}
              value={formatRunBerries(
                report.stats.maxBounty,
                locale,
                translate,
              )}
            />
            <Fact
              label={translate('ui.runHistory.stat.berries')}
              value={formatRunBerries(
                report.stats.berries,
                locale,
                translate,
              )}
            />
            <Fact
              label={translate('ui.runHistory.stat.crew')}
              value={report.stats.crewSize}
            />
            <Fact
              label={translate('ui.runHistory.stat.traits')}
              value={report.stats.traitCount}
            />
            <Fact
              label={translate('ui.runHistory.stat.ship')}
              value={
                ship
                  ? translate(ship.nameKey)
                  : translate('ui.runHistory.none')
              }
            />
          </dl>
        </Panel>

        <Panel
          variant="strong"
          className="opfg-final-run__section"
        >
          <h2>{translate('ui.runHistory.funFacts')}</h2>
          <dl className="opfg-final-run__facts">
            <Fact
              label={translate('ui.runHistory.fact.strongestStat')}
              value={translate('ui.runHistory.inlineValue', {
                label: translate(
                  STAT_KEYS[report.facts.strongestAttributeId],
                ),
                value: report.facts.strongestAttributeValue,
              })}
            />
            <Fact
              label={translate('ui.runHistory.fact.closestAlly')}
              value={
                closestNpcName
                  ? translate('ui.runHistory.inlineValue', {
                      label: closestNpcName,
                      value:
                        report.facts.closestNpcRelationship ?? 0,
                    })
                  : translate('ui.runHistory.none')
              }
            />
            <Fact
              label={translate('ui.runHistory.fact.highestRank')}
              value={
                highestRank
                  ? translate(highestRank.nameKey)
                  : translate('ui.runHistory.none')
              }
            />
            <Fact
              label={translate('ui.runHistory.fact.majorRoots')}
              value={report.stats.majorTrackRoots}
            />
            <Fact
              label={translate('ui.runHistory.fact.haki')}
              value={report.facts.totalHakiLevels}
            />
            <Fact
              label={translate('ui.runHistory.fact.devilFruit')}
              value={
                report.facts.devilFruitId
                  ? translate(
                      catalog.devilFruits.find(
                        ({ id }) =>
                          id === report.facts.devilFruitId,
                      )?.nameKey
                      ?? `devilFruit.${report.facts.devilFruitId}.name`,
                    )
                  : translate('ui.runHistory.none')
              }
            />
          </dl>
        </Panel>
      </div>

      {onHome && (
        <div className="opfg-final-run__actions">
          <Button
            variant="glass"
            onClick={onHome}
          >
            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />
            {translate('ui.runHistory.home')}
          </Button>
        </div>
      )}
    </section>
  );
}

function Fact({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function formatRunAge(
  ageMonths: number,
  translate: Translator,
): string {
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;

  return months === 0
    ? translate('ui.runHistory.ageYears', { years })
    : translate('ui.runHistory.ageYearsMonths', {
        years,
        months,
      });
}

function formatRunBerries(
  value: number,
  locale: LocaleId,
  translate: Translator,
): string {
  return translate('ui.runHistory.berriesValue', {
    value: new Intl.NumberFormat(locale).format(value),
  });
}
