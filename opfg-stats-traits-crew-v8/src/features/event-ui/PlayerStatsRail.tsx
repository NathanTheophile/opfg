import {
  Anchor,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clover,
  Compass,
  Dumbbell,
  Eye,
  Flame,
  Handshake,
  Heart,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Smile,
  Sparkles,
  Waves,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { Panel } from '@/components/ui';
import './player-stats-rail.css';

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

interface StatPreview {
  id: string;
  label: string;
  value: number;
  icon: IconType;
}

interface TraitPreview {
  id: string;
  label: string;
  icon: IconType;
}

const MOCK_HAS_DEVIL_FRUIT = false;

const MOCK_STATS: StatPreview[] = [
  { id: 'health', label: 'Santé', value: 32, icon: Heart },
  { id: 'morale', label: 'Moral', value: 26, icon: Smile },
  { id: 'strength', label: 'Force', value: 24, icon: Dumbbell },
  { id: 'observation', label: 'Observation', value: 34, icon: Eye },
  { id: 'intelligence', label: 'Intelligence', value: 22, icon: Brain },
  { id: 'navigation', label: 'Navigation', value: 28, icon: Compass },
  { id: 'charisma', label: 'Charisme', value: 30, icon: MessageCircle },
  { id: 'luck', label: 'Chance', value: 18, icon: Clover },
  ...(MOCK_HAS_DEVIL_FRUIT
    ? [{ id: 'awakening', label: 'Éveil', value: 12, icon: Sparkles }]
    : []),
];

const MOCK_TRAITS: TraitPreview[] = [
  { id: 'brave', label: 'Courageux', icon: Flame },
  { id: 'curious', label: 'Curieux', icon: Search },
  { id: 'steadfast', label: 'Tenace', icon: ShieldCheck },
  { id: 'sea-instinct', label: 'Instinct marin', icon: Waves },
  { id: 'loyal', label: 'Loyal', icon: Handshake },
  { id: 'sailor', label: 'Marin aguerri', icon: Anchor },
];

function statToPreviewModifier(value: number): number {
  if (value >= 20 && value <= 30) return 0;
  if (value > 30) return Math.min(4, Math.ceil((value - 30) / 5));
  return -Math.min(4, Math.ceil((20 - value) / 5));
}

function formatModifier(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

export function PlayerStatsRail() {
  const [expanded, setExpanded] = useState(false);
  const compactTraits = MOCK_TRAITS.slice(0, 3);
  const hiddenTraitCount = Math.max(0, MOCK_TRAITS.length - compactTraits.length);

  return (
    <div className={`opfg-player-stats-module ${expanded ? 'is-expanded' : ''}`}>
      <Panel
        variant="strong"
        padding="none"
        className="opfg-player-stats-rail"
        aria-label="Statistiques du joueur"
      >
        <button
          type="button"
          className="opfg-player-stats-rail__toggle"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Replier les statistiques' : 'Déplier les statistiques'}
        >
          {expanded ? (
            <ChevronRight className="size-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="size-4" aria-hidden="true" />
          )}
        </button>

        <div className="opfg-player-stats-rail__list">
          {MOCK_STATS.map((stat) => {
            const Icon = stat.icon;
            const modifier = statToPreviewModifier(stat.value);

            return (
              <div
                key={stat.id}
                className="opfg-player-stat"
                data-stat={stat.id}
                data-tooltip={stat.label}
              >
                <span className="opfg-player-stat__icon" aria-hidden="true">
                  <Icon className="size-[1.05rem]" />
                </span>

                <span className="opfg-player-stat__label">{stat.label}</span>

                <strong className="opfg-player-stat__value">{stat.value}</strong>

                <div className="opfg-player-stat__secondary">
                  <span
                    className="opfg-player-stat__compact-modifier"
                    data-modifier={modifier > 0 ? 'positive' : modifier < 0 ? 'negative' : 'neutral'}
                    aria-label={modifier === 0 ? `${stat.label}, aucun bonus de jet` : `${stat.label}, bonus de jet ${formatModifier(modifier)}`}
                  >
                    {modifier === 0 ? '' : formatModifier(modifier)}
                  </span>

                  <div
                    className="opfg-player-stat__bonus-scale"
                    data-tooltip={`Bonus de jet : ${formatModifier(modifier)}`}
                    aria-label={`${stat.label}, bonus de jet ${formatModifier(modifier)}`}
                  >
                    <div className="opfg-player-stat__segments" aria-hidden="true">
                      <span className="is-red" />
                      <span className="is-red" />
                      <span className="is-red" />
                      <span className="is-red" />
                      <span className="is-orange is-safe" />
                      <span className="is-green" />
                      <span className="is-green" />
                      <span className="is-green" />
                      <span className="is-green" />
                    </div>
                    <span
                      className="opfg-player-stat__marker"
                      style={{ left: `${Math.max(0, Math.min(100, stat.value * 2))}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="opfg-player-traits" aria-label="Traits du joueur">
          <div className="opfg-player-traits__compact">
            {compactTraits.map((trait) => {
              const Icon = trait.icon;
              return (
                <span
                  key={trait.id}
                  className="opfg-player-trait"
                  data-tooltip={trait.label}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              );
            })}

            <span
              className="opfg-player-trait opfg-player-trait--more"
              data-tooltip={hiddenTraitCount > 0 ? `+${hiddenTraitCount} traits` : 'Traits'}
            >
              <Plus className="size-4" aria-hidden="true" />
            </span>
          </div>

          <div className="opfg-player-traits__expanded">
            {MOCK_TRAITS.map((trait) => {
              const Icon = trait.icon;
              return (
                <span
                  key={trait.id}
                  className="opfg-player-trait"
                  data-tooltip={trait.label}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              );
            })}
          </div>
        </div>
      </Panel>
    </div>
  );
}
