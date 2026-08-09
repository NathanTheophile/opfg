import { Brain, ChevronLeft, ChevronRight, Clover, Compass, Dumbbell, Eye, Footprints, Heart, MessageCircle, Plus, Smile, Sparkles, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Panel } from '@/components/ui';
import { statToDiceModifier } from '@/game/engine/dice';
import type { GameState } from '@/game/model/schema';
import './player-stats-rail.css';

type PlayerStatId = keyof GameState['player']['stats'];
const STAT_IDS: PlayerStatId[] = ['health', 'morale', 'strength', 'agility', 'observation', 'intelligence', 'navigation', 'charisma', 'luck', 'awakening'];
const STAT_ICONS: Record<PlayerStatId, LucideIcon> = { health: Heart, morale: Smile, strength: Dumbbell, agility: Footprints, observation: Eye, intelligence: Brain, navigation: Compass, charisma: MessageCircle, luck: Clover, awakening: Sparkles };

function signed(value: number): string { return value > 0 ? `+${value}` : String(value); }

export interface PlayerStatsRailProps {
  state: GameState;
  previousState?: GameState | null;
  statLabel: (statId: PlayerStatId) => string;
  traitLabel: (traitId: string) => string;
}

export function PlayerStatsRail({ state, previousState, statLabel, traitLabel }: PlayerStatsRailProps) {
  const [expanded, setExpanded] = useState(false);
  const traits = state.player.traits.map((id) => ({ id, label: traitLabel(id) }));
  const compactTraits = traits.slice(0, 3);

  return <div className={`opfg-player-stats-module ${expanded ? 'is-expanded' : ''}`}>
    <Panel variant="strong" padding="none" className="opfg-player-stats-rail" aria-label="Statistiques du joueur">
      <div className="opfg-player-stats-rail__list">
        {STAT_IDS.map((id) => {
          const value = state.player.stats[id];
          if (value === null) return null;
          const Icon = STAT_ICONS[id];
          const label = statLabel(id);
          const modifier = id === 'health' ? null : statToDiceModifier(value);
          const previous = previousState?.player.stats[id];
          const delta = typeof previous === 'number' ? value - previous : 0;
          const display = delta !== 0 ? delta : modifier;
          return <div key={id} className="opfg-player-stat" data-stat={id} data-tooltip={label}>
            <span className="opfg-player-stat__watermark" aria-hidden="true"><Icon /></span>
            <span className="opfg-player-stat__icon" aria-hidden="true"><Icon className="size-[1.05rem]" /></span>
            <span className="opfg-player-stat__label">{label}</span>
            <strong className="opfg-player-stat__value">{value}</strong>
            {modifier !== null && <div className="opfg-player-stat__bonus-scale" data-tooltip={`Bonus de jet : ${signed(modifier)}`} aria-label={`${label}, bonus de jet ${signed(modifier)}`}>
              <div className="opfg-player-stat__segments" aria-hidden="true"><span className="is-red" /><span className="is-red" /><span className="is-red" /><span className="is-red" /><span className="is-orange is-safe" /><span className="is-green" /><span className="is-green" /><span className="is-green" /><span className="is-green" /></div>
              <span className="opfg-player-stat__marker" style={{ left: `${Math.max(0, Math.min(100, value * 2))}%` }} aria-hidden="true" />
            </div>}
            <span className="opfg-player-stat__modifier" data-modifier={display === null ? 'neutral' : display > 0 ? 'positive' : display < 0 ? 'negative' : 'neutral'} aria-label={delta !== 0 ? `${label}, variation ${signed(delta)}` : modifier === null ? `${label}, points de vie` : `${label}, bonus de jet ${signed(modifier)}`}>{display === null || display === 0 ? '' : signed(display)}</span>
          </div>;
        })}
      </div>
      <div className="opfg-player-traits" aria-label="Traits du joueur">
        <div className="opfg-player-traits__compact">
          {compactTraits.map((trait) => <span key={trait.id} className="opfg-player-trait" data-tooltip={trait.label}><Sparkles className="size-4" aria-hidden="true" /></span>)}
          <span className="opfg-player-trait opfg-player-trait--more" data-tooltip={traits.length > 3 ? `+${traits.length - 3} traits` : traits.length === 0 ? 'Aucun trait' : 'Traits'}><Plus className="size-4" aria-hidden="true" /></span>
        </div>
        <div className="opfg-player-traits__expanded">{traits.map((trait) => <span key={trait.id} className="opfg-player-trait" data-tooltip={trait.label}><Sparkles className="size-4" aria-hidden="true" /></span>)}</div>
      </div>
      <button type="button" className="opfg-player-stats-rail__toggle-bottom" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-label={expanded ? 'Replier les statistiques' : 'Déplier les statistiques'}>{expanded ? <ChevronRight className="size-4" aria-hidden="true" /> : <ChevronLeft className="size-4" aria-hidden="true" />}</button>
    </Panel>
  </div>;
}
