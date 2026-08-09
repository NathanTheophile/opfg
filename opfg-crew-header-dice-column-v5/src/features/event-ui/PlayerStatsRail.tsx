import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Clover,
  Compass,
  Dumbbell,
  Eye,
  Heart,
  MessageCircle,
  Smile,
  Sparkles,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { Panel } from '@/components/ui';
import './player-stats-rail.css';

interface StatPreview {
  id: string;
  label: string;
  value: number | string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

const MOCK_STATS: StatPreview[] = [
  { id: 'health', label: 'Santé', value: 32, icon: Heart },
  { id: 'morale', label: 'Moral', value: 26, icon: Smile },
  { id: 'strength', label: 'Force', value: 24, icon: Dumbbell },
  { id: 'observation', label: 'Observation', value: 34, icon: Eye },
  { id: 'intelligence', label: 'Intelligence', value: 22, icon: Brain },
  { id: 'navigation', label: 'Navigation', value: 28, icon: Compass },
  { id: 'charisma', label: 'Charisme', value: 30, icon: MessageCircle },
  { id: 'luck', label: 'Chance', value: 18, icon: Clover },
  { id: 'awakening', label: 'Éveil', value: '—', icon: Sparkles },
];

export function PlayerStatsRail() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`opfg-player-stats-module ${expanded ? 'is-expanded' : ''}`}>
      <Panel
        variant="strong"
        padding="none"
        className="opfg-player-stats-header"
        aria-label="Statistiques"
      >
        STAT
      </Panel>

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
          <ChevronLeft className="size-4" aria-hidden="true" />
        ) : (
          <ChevronRight className="size-4" aria-hidden="true" />
        )}
      </button>

      <div className="opfg-player-stats-rail__list">
        {MOCK_STATS.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.id}
              className="opfg-player-stat"
              data-tooltip={stat.label}
            >
              <span className="opfg-player-stat__icon" aria-hidden="true">
                <Icon className="size-[1.05rem]" />
              </span>

              <span className="opfg-player-stat__label">{stat.label}</span>

              <strong className="opfg-player-stat__value">{stat.value}</strong>
            </div>
          );
        })}
      </div>
      </Panel>
    </div>
  );
}
