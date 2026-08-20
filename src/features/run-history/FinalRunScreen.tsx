import { ArrowLeft, Crown, History, Skull, Trophy } from 'lucide-react';
import { Button, Panel } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import { buildFinalRunReport } from '@/game/engine/finalRun';
import { t, type Translator, type LocaleId } from '@/game/localization';
import { npcInterpolationParams } from '@/game/engine/npcNames';
import { originNarrativeInterpolationParams } from '@/game/engine/originNarrative';
import type { GameState, PlayerAttributeId } from '@/game/model/schema';
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
  const translate: Translator = (key, params) => t(key, locale, {
    playerName: state.player.profile.name ?? '',
    ...originNarrativeInterpolationParams(
      state,
      catalog,
      (originKey, originParams) => t(originKey, locale, originParams),
    ),
    ...npcInterpolationParams(state, catalog, (nameKey) => t(nameKey, locale)),
    ...params,
  });
  const copy = (key: RunCopyKey, params?: Record<string, string | number>) => runCopy(locale, key, params);
  const playerName = state.player.profile.name?.trim() || translate('ui.landing.unnamed');
  const endingTitle = report.endingNameKey ? translate(report.endingNameKey) : copy('endingFallback');
  const endingDescription = report.endingDescriptionKey ? translate(report.endingDescriptionKey) : null;
  const ship = report.stats.shipId ? catalog.ships.find(({ id }) => id === report.stats.shipId) : null;
  const highestRank = report.stats.highestRankId ? catalog.careerRanks.find(({ id }) => id === report.stats.highestRankId) : null;
  const closestNpcDefinition = report.facts.closestNpcId ? catalog.npcs.find(({ id }) => id === report.facts.closestNpcId) : null;
  const closestNpcName = report.facts.closestNpcId
    ? state.npcs[report.facts.closestNpcId]?.displayName ?? (closestNpcDefinition ? translate(closestNpcDefinition.nameKey) : report.facts.closestNpcId)
    : null;

  return (
    <section className={`opfg-final-run${compact ? ' opfg-final-run--compact' : ''}`}>
      <div className="opfg-final-run__header">
        <div>
          <span className="opfg-final-run__eyebrow">{copy('lifeOf', { name: playerName })}</span>
          <h1>{state.careerEndReason === 'death' ? <Skull aria-hidden="true" /> : <Crown aria-hidden="true" />}{endingTitle}</h1>
          {endingDescription && <p>{endingDescription}</p>}
        </div>
        <div className="opfg-final-run__score" aria-label={copy('scoreLabel', { score: report.score })}>
          <Trophy aria-hidden="true" />
          <strong>{report.score}</strong>
          <span>/100</span>
          <small>{copy(`tier.${report.tier}` as RunCopyKey)}</small>
        </div>
      </div>

      <div className="opfg-final-run__axes" aria-label={copy('scoreBreakdown')}>
        {report.axes.map((axis) => (
          <div key={axis.id}>
            <span>{copy(`axis.${axis.id}` as RunCopyKey)}</span>
            <strong>{axis.points}/{axis.maxPoints}</strong>
          </div>
        ))}
      </div>

      <Panel variant="strong" className="opfg-final-run__section">
        <h2><History aria-hidden="true" />{copy('lifeSummary')}</h2>
        {report.moments.length === 0 ? (
          <p>{copy('noMoments')}</p>
        ) : (
          <ol className="opfg-final-run__timeline">
            {report.moments.map((moment) => (
              <li key={`${moment.eventId}-${moment.ageMonths}`}>
                <span>{formatAge(moment.ageMonths, copy)}</span>
                <div>
                  <strong>{translate(moment.titleKey)}</strong>
                  {moment.outcomeTextKey && <p>{translate(moment.outcomeTextKey)}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Panel>

      <div className="opfg-final-run__grid">
        <Panel variant="strong" className="opfg-final-run__section">
          <h2>{copy('statistics')}</h2>
          <dl className="opfg-final-run__facts">
            <Fact label={copy('stat.age')} value={formatAge(report.stats.ageMonths, copy)} />
            <Fact label={copy('stat.events')} value={report.stats.historyEntries} />
            <Fact label={copy('stat.reputation')} value={`${report.stats.reputation}/100`} />
            <Fact label={copy('stat.maxBounty')} value={formatBerries(report.stats.maxBounty)} />
            <Fact label={copy('stat.berries')} value={formatBerries(report.stats.berries)} />
            <Fact label={copy('stat.crew')} value={report.stats.crewSize} />
            <Fact label={copy('stat.traits')} value={report.stats.traitCount} />
            <Fact label={copy('stat.ship')} value={ship ? translate(ship.nameKey) : copy('none')} />
          </dl>
        </Panel>

        <Panel variant="strong" className="opfg-final-run__section">
          <h2>{copy('funFacts')}</h2>
          <dl className="opfg-final-run__facts">
            <Fact label={copy('fact.strongestStat')} value={`${translate(STAT_KEYS[report.facts.strongestAttributeId])} · ${report.facts.strongestAttributeValue}`} />
            <Fact label={copy('fact.closestAlly')} value={closestNpcName ? `${closestNpcName} · ${report.facts.closestNpcRelationship}` : copy('none')} />
            <Fact label={copy('fact.highestRank')} value={highestRank ? translate(highestRank.nameKey) : copy('none')} />
            <Fact label={copy('fact.majorRoots')} value={report.stats.majorTrackRoots} />
            <Fact label={copy('fact.haki')} value={report.facts.totalHakiLevels} />
            <Fact label={copy('fact.devilFruit')} value={report.facts.devilFruitId ? translate(catalog.devilFruits.find(({ id }) => id === report.facts.devilFruitId)?.nameKey ?? `devilFruit.${report.facts.devilFruitId}.name`) : copy('none')} />
          </dl>
        </Panel>
      </div>

      {onHome && (
        <div className="opfg-final-run__actions">
          <Button variant="glass" onClick={onHome}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            {copy('home')}
          </Button>
        </div>
      )}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function formatAge(ageMonths: number, copy: (key: RunCopyKey, params?: Record<string, string | number>) => string): string {
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  return months === 0 ? copy('ageYears', { years }) : copy('ageYearsMonths', { years, months });
}

function formatBerries(value: number): string {
  return `${new Intl.NumberFormat().format(value)} B`;
}

export type RunCopyKey = keyof typeof RUN_COPY.fr;
const RUN_COPY = {
  fr: {
    lifeOf: 'La vie de {name}',
    endingFallback: 'Fin de carrière',
    scoreLabel: 'Score final : {score} sur 100',
    scoreBreakdown: 'Détail du score',
    lifeSummary: 'Les moments de ta vie',
    noMoments: "Aucun événement n'a été enregistré pour cette run.",
    statistics: 'Statistiques de la run',
    funFacts: 'Faits marquants',
    home: 'Retour au menu',
    history: 'Historique',
    noCompletedRuns: "Aucune run terminée pour l'instant.",
    careerEnding: 'Fin de carrière',
    yearsShort: 'ans',
    none: 'Aucun',
    unnamed: 'Sans nom',
    ageYears: '{years} ans',
    ageYearsMonths: '{years} ans · {months} mois',
    'tier.ordinary': 'Une vie discrète',
    'tier.notable': 'Une vie remarquée',
    'tier.remarkable': 'Une destinée marquante',
    'tier.legendary': 'Une vie de légende',
    'tier.mythic': 'Une destinée mythique',
    'axis.reputation': 'Réputation',
    'axis.career': 'Carrière',
    'axis.power': 'Puissance',
    'axis.relationships': 'Relations & équipage',
    'axis.assets': 'Fortune & possessions',
    'axis.legacy': 'Héritage & Ending',
    'stat.age': 'Âge final',
    'stat.events': 'Événements vécus',
    'stat.reputation': 'Réputation finale',
    'stat.maxBounty': 'Prime maximale',
    'stat.berries': 'Berrys',
    'stat.crew': "Membres d'équipage",
    'stat.traits': 'Traits acquis',
    'stat.ship': 'Navire final',
    'fact.strongestStat': 'Attribut dominant',
    'fact.closestAlly': 'Relation la plus proche',
    'fact.highestRank': 'Plus haut grade atteint',
    'fact.majorRoots': 'Chapitres majeurs vécus',
    'fact.haki': 'Niveaux de Haki cumulés',
    'fact.devilFruit': 'Fruit du Démon',
  },
  en: {
    lifeOf: "{name}'s life",
    endingFallback: 'Career ending',
    scoreLabel: 'Final score: {score} out of 100',
    scoreBreakdown: 'Score breakdown',
    lifeSummary: 'Moments from your life',
    noMoments: 'No event was recorded for this run.',
    statistics: 'Run statistics',
    funFacts: 'Notable facts',
    home: 'Back to menu',
    history: 'History',
    noCompletedRuns: 'No completed run yet.',
    careerEnding: 'Career ending',
    yearsShort: 'years',
    none: 'None',
    unnamed: 'Unnamed',
    ageYears: '{years} years',
    ageYearsMonths: '{years} years · {months} months',
    'tier.ordinary': 'A quiet life',
    'tier.notable': 'A notable life',
    'tier.remarkable': 'A remarkable destiny',
    'tier.legendary': 'A legendary life',
    'tier.mythic': 'A mythical destiny',
    'axis.reputation': 'Reputation',
    'axis.career': 'Career',
    'axis.power': 'Power',
    'axis.relationships': 'Relationships & crew',
    'axis.assets': 'Fortune & assets',
    'axis.legacy': 'Legacy & Ending',
    'stat.age': 'Final age',
    'stat.events': 'Events lived',
    'stat.reputation': 'Final reputation',
    'stat.maxBounty': 'Maximum bounty',
    'stat.berries': 'Berrys',
    'stat.crew': 'Crew members',
    'stat.traits': 'Traits acquired',
    'stat.ship': 'Final ship',
    'fact.strongestStat': 'Strongest attribute',
    'fact.closestAlly': 'Closest relationship',
    'fact.highestRank': 'Highest rank reached',
    'fact.majorRoots': 'Major chapters lived',
    'fact.haki': 'Combined Haki levels',
    'fact.devilFruit': 'Devil Fruit',
  },
} as const;

export function runCopy(locale: LocaleId, key: RunCopyKey, params?: Record<string, string | number>): string {
  let text: string = RUN_COPY[locale][key] ?? RUN_COPY.fr[key];
  for (const [name, value] of Object.entries(params ?? {})) text = text.replaceAll(`{${name}}`, String(value));
  return text;
}
