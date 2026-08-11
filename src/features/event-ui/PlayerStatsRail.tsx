import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Clover,
  Compass,
  Dumbbell,
  Eye,
  Footprints,
  Heart,
  MessageCircle,
  Plus,
  Smile,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Panel } from '@/components/ui';
import type { Translator } from '@/game/localization';
import { ContextTooltip } from './ContextTooltip';
import { getStatTooltipKey, STAT_TOOLTIP_COLORS } from './context-tooltip-copy';
import { statToDiceModifier } from '@/game/engine/dice';
import type { GameState } from '@/game/model/schema';
import './player-stats-rail.css';

type PlayerStatId = keyof GameState['player']['stats'];
const STAT_IMPACT_EVENT = 'opfg:stat-impact';
const STAT_IDS: PlayerStatId[] = ['health', 'morale', 'strength', 'agility', 'observation', 'intelligence', 'navigation', 'charisma', 'luck'];
const STAT_ICONS: Record<PlayerStatId, LucideIcon> = { health: Heart, morale: Smile, strength: Dumbbell, agility: Footprints, observation: Eye, intelligence: Brain, navigation: Compass, charisma: MessageCircle, luck: Clover };
function StatGlyph({
  Icon,
  watermark = false,
}: {
  Icon: LucideIcon;
  watermark?: boolean;
}) {
  return watermark
    ? <Icon />
    : <Icon className="size-[1.05rem]" />;
}

function signed(value: number): string { return value > 0 ? `+${value}` : String(value); }

function buildPresentationStats(state: GameState, previousState?: GameState | null): GameState['player']['stats'] {
  const current = { ...state.player.stats };
  if (!previousState) return current;
  for (const id of STAT_IDS) {
    const previous = previousState.player.stats[id];
    const next = state.player.stats[id];
    if (typeof previous === 'number' && typeof next === 'number' && previous !== next) current[id] = previous as never;
  }
  return current;
}

export interface PlayerStatsRailProps {
  state: GameState;
  previousState?: GameState | null;
  statLabel: (statId: PlayerStatId) => string;
  traitLabel: (traitId: string) => string;
  translate: Translator;
}

export function PlayerStatsRail({ state, previousState, statLabel, traitLabel, translate }: PlayerStatsRailProps) {
  const [expanded, setExpanded] = useState(false);
  const [displayedStats, setDisplayedStats] = useState<GameState['player']['stats']>(() => buildPresentationStats(state, previousState));
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => { setDisplayedStats(buildPresentationStats(state, previousState)); }, [state, previousState]);
  useEffect(() => {
    const handleStatImpact = (event: Event) => {
      const custom = event as CustomEvent<{ statId?: PlayerStatId; delta?: number }>;
      const id = custom.detail?.statId;
      if (!id || !STAT_IDS.includes(id)) return;
      const resolvedValue = stateRef.current.player.stats[id];
      setDisplayedStats((current) => current[id] === resolvedValue ? current : { ...current, [id]: resolvedValue });
    };
    window.addEventListener(STAT_IMPACT_EVENT, handleStatImpact);
    return () => window.removeEventListener(STAT_IMPACT_EVENT, handleStatImpact);
  }, []);

  const traits = state.player.traits.map((id) => ({ id, label: traitLabel(id) }));
  const compactTraits = traits.slice(0, 3);

  return (
    <div className={`opfg-player-stats-module ${expanded ? 'is-expanded' : ''}`}>
      <Panel variant="strong" padding="none" className="opfg-player-stats-rail" aria-label={translate('ui.stats.playerAria')}>
        <div className="opfg-player-stats-rail__list">
          {STAT_IDS.map((id) => {
            const value = displayedStats[id];
            if (value === null) return null;
            const Icon = STAT_ICONS[id];
            const label = statLabel(id);
            const modifier = id === 'health' ? null : statToDiceModifier(value);
            const tooltipDetail = translate(getStatTooltipKey(id));
            const tooltipMeta = modifier === null
              ? translate('ui.stats.valueMeta', { value })
              : translate('ui.stats.valueRollMeta', { value, modifier: signed(modifier) });

            return (
              <div key={id} className="opfg-player-stat has-rich-tooltip" data-stat={id} data-tooltip={label}>
                <span className="opfg-player-stat__watermark" aria-hidden="true">
                  <StatGlyph Icon={Icon} watermark />
                </span>
                <ContextTooltip
                  className="opfg-player-stat__tooltip-hitbox"
                  title={label}
                  detail={tooltipDetail}
                  meta={tooltipMeta}
                  accent={STAT_TOOLTIP_COLORS[id]}
                  side="right"
                  focusable
                >
                  <span className="sr-only">{label}</span>
                </ContextTooltip>
                <span className="opfg-player-stat__icon" aria-hidden="true">
                  <StatGlyph Icon={Icon} />
                </span>
                <span className="opfg-player-stat__label">{label}</span>
                <strong className="opfg-player-stat__value">{value}</strong>

                {modifier !== null && (
                  <div
                    className="opfg-player-stat__bonus-scale"
                    data-tooltip={translate('ui.stats.rollBonus', { modifier: signed(modifier) })}
                    aria-label={translate('ui.stats.rollBonusAria', { label, modifier: signed(modifier) })}
                  >
                    <div className="opfg-player-stat__segments" aria-hidden="true">
                      <span className="is-red" /><span className="is-red" /><span className="is-red" /><span className="is-red" />
                      <span className="is-orange is-safe" /><span className="is-green" /><span className="is-green" /><span className="is-green" /><span className="is-green" />
                    </div>
                    <span className="opfg-player-stat__marker" style={{ left: `${Math.max(0, Math.min(100, value * 2))}%` }} aria-hidden="true" />
                  </div>
                )}

                <span
                  className="opfg-player-stat__modifier"
                  data-modifier={modifier === null || modifier === 0 ? 'neutral' : modifier > 0 ? 'positive' : 'negative'}
                  aria-label={modifier === null
                    ? translate('ui.stats.healthAria', { label })
                    : translate('ui.stats.rollBonusAria', { label, modifier: signed(modifier) })}
                >
                  {modifier === null || modifier === 0 ? '' : signed(modifier)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="opfg-player-traits" aria-label={translate('ui.traits.playerAria')}>
          <div className="opfg-player-traits__compact">
            {compactTraits.map((trait) => (
              <span key={trait.id} className="opfg-player-trait" data-tooltip={trait.label}>
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
            ))}
            <span
              className="opfg-player-trait opfg-player-trait--more"
              data-tooltip={traits.length > 3
                ? translate('ui.traits.more', { count: traits.length - 3 })
                : traits.length === 0
                  ? translate('ui.traits.none')
                  : translate('ui.traits.label')}
            >
              <Plus className="size-4" aria-hidden="true" />
            </span>
          </div>
          <div className="opfg-player-traits__expanded">
            {traits.map((trait) => (
              <span key={trait.id} className="opfg-player-trait" data-tooltip={trait.label}>
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="opfg-player-stats-rail__toggle-bottom"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-label={translate(expanded ? 'ui.stats.collapse' : 'ui.stats.expand')}
        >
          {expanded ? <ChevronRight className="size-4" aria-hidden="true" /> : <ChevronLeft className="size-4" aria-hidden="true" />}
        </button>
      </Panel>
    </div>
  );
}
