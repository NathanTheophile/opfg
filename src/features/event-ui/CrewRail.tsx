import { Brain, ChevronRight, Clover, Compass, Dumbbell, Eye, Heart, ShieldCheck, Smile, UsersRound, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Panel } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import type { Translator } from '@/game/localization';
import type { GameState, NpcStatId } from '@/game/model/schema';
import { ContextTooltip } from './ContextTooltip';
import { getStatTooltipKey, getUiTooltipKey, STAT_TOOLTIP_COLORS } from './context-tooltip-copy';
import './crew-rail.css';

const NPC_STAT_IDS: NpcStatId[] = ['health', 'morale', 'strength', 'observation', 'intelligence', 'luck', 'loyalty', 'calm'];
const ICONS: Record<NpcStatId, LucideIcon> = { health: Heart, morale: Smile, strength: Dumbbell, observation: Eye, intelligence: Brain, luck: Clover, loyalty: ShieldCheck, calm: Compass };

export interface CrewRailProps { state: GameState; catalog: ContentCatalog; translate: Translator; statLabel: (statId: NpcStatId) => string }

export function CrewRail({ state, catalog, translate, statLabel }: CrewRailProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const crew = Object.entries(state.npcs).filter(([, npc]) => npc.status === 'crew');
  const shipDefinition = state.ship ? catalog.ships.find(({ id }) => id === state.ship?.shipId) : undefined;
  const capacity = shipDefinition?.crewCapacity ?? 0;

  return <div className="opfg-crew-rail" aria-label={translate('ui.crew')}>
    <Panel
      variant="strong"
      padding="none"
      className="opfg-crew-header"
      aria-label={translate('ui.crew.capacityAria', { count: crew.length, capacity })}
    >
      <ContextTooltip
        title={translate('ui.crew')}
        detail={translate(getUiTooltipKey('crew'))}
        meta={`${crew.length} / ${capacity}`}
        side="left"
      >
        <UsersRound className="opfg-crew-header__icon size-[1.05rem]" aria-hidden="true" />
      </ContextTooltip>
      <span>{translate('ui.crew')}</span>
      <strong>{crew.length}/{capacity}</strong>
    </Panel>

    {crew.length === 0 && (
      <Panel variant="strong" padding="none" className="opfg-crew-member-panel">
        <div className="px-4 py-3 text-sm text-fg-muted">{translate('ui.crew.empty')}</div>
      </Panel>
    )}

    {crew.map(([npcId, npc]) => {
      const definition = catalog.npcs.find(({ id }) => id === npcId);
      const role = catalog.crewRoles.find(({ id }) => id === definition?.crewRoleId);
      const roleLabel = role ? translate(role.nameKey) : translate('ui.crew.member');
      const expanded = expandedId === npcId;

      return <Panel key={npcId} variant="strong" padding="none" className={`opfg-crew-member-panel ${expanded ? 'is-expanded' : ''}`}>
        <button type="button" className="opfg-crew-member__toggle" onClick={() => setExpandedId((current) => current === npcId ? null : npcId)} aria-expanded={expanded}>
          <ContextTooltip
            className="opfg-crew-member__role has-rich-tooltip"
            title={roleLabel}
            detail={translate(getUiTooltipKey('crewRole'))}
            side="left"
          >
            <UsersRound className="size-[1.05rem]" aria-hidden="true" />
          </ContextTooltip>

          <strong className="opfg-crew-member__name">{definition ? translate(definition.nameKey) : translate('ui.crew.member')}</strong>
          <ChevronRight className="opfg-crew-member__chevron size-4" aria-hidden="true" />
        </button>

        <div className="opfg-crew-member__stats" aria-hidden={!expanded}>
          {NPC_STAT_IDS.map((statId) => {
            const Icon = ICONS[statId];
            const label = statLabel(statId);
            return <ContextTooltip
              key={statId}
              className="opfg-crew-stat has-rich-tooltip"
              title={label}
              detail={translate(getStatTooltipKey(statId))}
              meta={translate('ui.stats.valueMeta', { value: npc.stats[statId] })}
              accent={STAT_TOOLTIP_COLORS[statId]}
              side="left"
            >
              <Icon className="size-3" aria-hidden="true" />
              <b>{npc.stats[statId]}</b>
            </ContextTooltip>;
          })}
        </div>
      </Panel>;
    })}
  </div>;
}
