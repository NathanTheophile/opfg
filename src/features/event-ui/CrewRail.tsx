import { Brain, ChevronRight, Clover, Compass, Dumbbell, Eye, Heart, ShieldCheck, Smile, UsersRound, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Panel } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import type { GameState, NpcStatId } from '@/game/model/schema';
import './crew-rail.css';

const NPC_STAT_IDS: NpcStatId[] = ['health', 'morale', 'strength', 'observation', 'intelligence', 'luck', 'loyalty', 'calm'];
const ICONS: Record<NpcStatId, LucideIcon> = { health: Heart, morale: Smile, strength: Dumbbell, observation: Eye, intelligence: Brain, luck: Clover, loyalty: ShieldCheck, calm: Compass };

export interface CrewRailProps { state: GameState; catalog: ContentCatalog; translate: (key: string) => string; statLabel: (statId: NpcStatId) => string }

export function CrewRail({ state, catalog, translate, statLabel }: CrewRailProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const crew = Object.entries(state.npcs).filter(([, npc]) => npc.status === 'crew');
  const shipDefinition = state.ship ? catalog.ships.find(({ id }) => id === state.ship?.shipId) : undefined;
  return <div className="opfg-crew-rail" aria-label="Équipage">
    <Panel variant="strong" padding="none" className="opfg-crew-header" aria-label={`Équipage ${crew.length} sur ${shipDefinition?.crewCapacity ?? 0}`}><UsersRound className="opfg-crew-header__icon size-[1.05rem]" aria-hidden="true" /><span>CREW</span><strong>{crew.length}/{shipDefinition?.crewCapacity ?? 0}</strong></Panel>
    {crew.length === 0 && <Panel variant="strong" padding="none" className="opfg-crew-member-panel"><div className="px-4 py-3 text-sm text-fg-muted">Aucun membre d'équipage</div></Panel>}
    {crew.map(([npcId, npc]) => {
      const definition = catalog.npcs.find(({ id }) => id === npcId);
      const role = catalog.crewRoles.find(({ id }) => id === definition?.crewRoleId);
      const expanded = expandedId === npcId;
      return <Panel key={npcId} variant="strong" padding="none" className={`opfg-crew-member-panel ${expanded ? 'is-expanded' : ''}`}>
        <button type="button" className="opfg-crew-member__toggle" onClick={() => setExpandedId((current) => current === npcId ? null : npcId)} aria-expanded={expanded}>
          <span className="opfg-crew-member__role" data-tooltip={role ? translate(role.nameKey) : 'Membre'}><UsersRound className="size-[1.05rem]" aria-hidden="true" /></span>
          <strong className="opfg-crew-member__name">{definition ? translate(definition.nameKey) : npcId}</strong><ChevronRight className="opfg-crew-member__chevron size-4" aria-hidden="true" />
        </button>
        <div className="opfg-crew-member__stats" aria-hidden={!expanded}>{NPC_STAT_IDS.map((statId) => { const Icon = ICONS[statId]; return <span key={statId} className="opfg-crew-stat" data-stat={statId} data-tooltip={statLabel(statId)}><Icon className="size-3" aria-hidden="true" /><b>{npc.stats[statId]}</b></span>; })}</div>
      </Panel>;
    })}
  </div>;
}
