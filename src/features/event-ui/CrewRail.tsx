import { Brain, ChevronRight, Clover, Compass, Dumbbell, Eye, Heart, Gauge, MessageCircle, Smile, UsersRound, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, Panel } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import type { Translator } from '@/game/localization';
import type { GameState, NpcStatId } from '@/game/model/schema';
import { ContextTooltip } from './ContextTooltip';
import { getStatTooltipKey, getUiTooltipKey, STAT_TOOLTIP_COLORS } from './context-tooltip-copy';
import './hud-panel-header.css';
import './crew-rail.css';
import { effectiveNpcStat } from '@/game/engine/stats';
import { canUseCrewRolePower, navigatorDestinations } from '@/game/engine/crewPowers';
import { maxCrewSize } from '@/game/engine/ship';
import type { CrewRoleId, LocationId } from '@/game/model/schema';
import { firstMateTargetRoleIds } from './crewManagementView';

const NPC_STAT_IDS: NpcStatId[] = ['health', 'morale', 'strength', 'agility', 'observation', 'intelligence', 'navigation', 'charisma', 'luck'];
const ICONS: Record<NpcStatId, LucideIcon> = { health: Heart, morale: Smile, strength: Dumbbell, agility: Gauge, observation: Eye, intelligence: Brain, navigation: Compass, charisma: MessageCircle, luck: Clover };

export interface CrewRailProps {
  state: GameState;
  catalog: ContentCatalog;
  translate: Translator;
  statLabel: (statId: NpcStatId) => string;
  onUseRolePower?: (roleId: CrewRoleId, destinationId?: LocationId) => void;
}

export function CrewRail({ state, catalog, translate, statLabel, onUseRolePower }: CrewRailProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [navigatorRoleId, setNavigatorRoleId] = useState<CrewRoleId | null>(null);
  const [firstMateRoleId, setFirstMateRoleId] = useState<CrewRoleId | null>(null);
  const [pendingRolePowerId, setPendingRolePowerId] = useState<CrewRoleId | null>(null);
  const crew = Object.entries(state.npcs).filter(([, npc]) => npc.status === 'crew');
  const capacity = maxCrewSize(state, catalog);
  const firstMateTargets = firstMateTargetRoleIds(state, catalog);

  useEffect(() => {
    if (firstMateRoleId && firstMateTargets.length === 0) {
      setFirstMateRoleId(null);
    }
  }, [firstMateRoleId, firstMateTargets.length]);

  const pendingRole = pendingRolePowerId
    ? catalog.crewRoles.find(({ id }) => id === pendingRolePowerId)
    : undefined;

  const confirmRolePower = () => {
    if (!pendingRolePowerId || !pendingRole?.annualPower) return;
    const roleId = pendingRolePowerId;
    setPendingRolePowerId(null);
    if (pendingRole.annualPower === 'navigator') setNavigatorRoleId(roleId);
    else if (pendingRole.annualPower === 'first_mate') setFirstMateRoleId(roleId);
    else onUseRolePower?.(roleId);
  };

  return <div className="opfg-crew-rail" aria-label={translate('ui.crew')}>
    <Panel
      variant="strong"
      padding="none"
      className="opfg-crew-header opfg-hud-section-header"
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
      <span className="opfg-hud-section-title">{translate('ui.crew')}</span>
      <strong>{crew.length}/{capacity}</strong>
    </Panel>

    {crew.length === 0 && (
      <Panel variant="strong" padding="none" className="opfg-crew-member-panel">
        <div className="px-4 py-3 text-sm text-fg-muted">{translate('ui.crew.empty')}</div>
      </Panel>
    )}

    {crew.map(([npcId, npc]) => {
      const definition = catalog.npcs.find(({ id }) => id === npcId);
      const role = catalog.crewRoles.find(({ id }) => id === npc.crewRoleId);
      const roleLabel = role ? translate(role.nameKey) : translate('ui.crew.member');
      const expanded = expandedId === npcId;
      const rolePowerAvailable = role?.annualPower !== undefined
        && canUseCrewRolePower(state, catalog, role.id)
        && (role.annualPower !== 'shipwright' || state.ship !== null)
        && (role.annualPower !== 'navigator' || navigatorDestinations(state, catalog).length > 0);

      return <Panel key={npcId} variant="strong" padding="none" className={`opfg-crew-member-panel ${expanded ? 'is-expanded' : ''}`}>
        <div className="opfg-crew-member__header">
          <button type="button" className="opfg-crew-member__toggle" onClick={() => setExpandedId((current) => current === npcId ? null : npcId)} aria-expanded={expanded}>
            <ContextTooltip
              className="opfg-crew-member__role has-rich-tooltip"
              title={roleLabel}
              detail={translate(getUiTooltipKey('crewRole'))}
              side="left"
            >
              <UsersRound className="size-[1.05rem]" aria-hidden="true" />
            </ContextTooltip>

            <strong className="opfg-crew-member__name">{npc.displayName ?? (definition ? translate(definition.nameKey) : translate('ui.crew.member'))}</strong>
            <ChevronRight className="opfg-crew-member__chevron size-4" aria-hidden="true" />
          </button>

          {role?.annualPower && (
            <button
              type="button"
              className="opfg-crew-action opfg-crew-member__power"
              disabled={!onUseRolePower || !rolePowerAvailable}
              title={translate(`ui.crew.power.${role.annualPower}.tooltip`)}
              onClick={() => setPendingRolePowerId(role.id)}
              aria-label={translate(`ui.crew.power.${role.annualPower}.action`)}
            >
              {translate(`ui.crew.power.${role.annualPower}.action`)}
            </button>
          )}
        </div>

        <div className="opfg-crew-member__stats" aria-hidden={!expanded}>
          {NPC_STAT_IDS.map((statId) => {
            const Icon = ICONS[statId];
            const label = statLabel(statId);
            return <ContextTooltip
              key={statId}
              className="opfg-crew-stat has-rich-tooltip"
              title={label}
              detail={translate(getStatTooltipKey(statId))}
              meta={translate('ui.stats.valueMeta', { value: effectiveNpcStat(state, catalog, npcId, statId) })}
              accent={STAT_TOOLTIP_COLORS[statId]}
              side="left"
            >
              <Icon className="size-3" aria-hidden="true" />
              <b>{effectiveNpcStat(state, catalog, npcId, statId)}</b>
            </ContextTooltip>;
          })}
        </div>
      </Panel>;
    })}
    {navigatorRoleId && (
      <Panel variant="strong" padding="none" className="opfg-crew-destinations" aria-label={translate('ui.crew.power.navigator.destination')}>
        <strong>{translate('ui.crew.power.navigator.destination')}</strong>
        {navigatorDestinations(state, catalog).map((location) => (
          <button key={location.id} type="button" className="opfg-crew-action" onClick={() => {
            onUseRolePower?.(navigatorRoleId, location.id);
            setNavigatorRoleId(null);
          }}>{translate(location.nameKey)}</button>
        ))}
        <button type="button" className="opfg-crew-action" onClick={() => setNavigatorRoleId(null)}>{translate('ui.action.cancel')}</button>
      </Panel>
    )}
    {firstMateRoleId && (
      <Panel variant="strong" padding="none" className="opfg-crew-destinations" aria-label={translate('ui.crew.power.first_mate.target')}>
        <strong>{translate('ui.crew.power.first_mate.target')}</strong>
        {firstMateTargets.map((roleId) => {
          const role = catalog.crewRoles.find(({ id }) => id === roleId);
          if (!role) return null;
          return (
            <button
              key={roleId}
              type="button"
              className="opfg-crew-action"
              onClick={() => {
                onUseRolePower?.(firstMateRoleId, roleId);
                setFirstMateRoleId(null);
              }}
            >
              {translate(role.nameKey)}
            </button>
          );
        })}
        <button type="button" className="opfg-crew-action" onClick={() => setFirstMateRoleId(null)}>{translate('ui.action.cancel')}</button>
      </Panel>
    )}
    {pendingRole && (
      <Modal open={pendingRolePowerId !== null} onOpenChange={(open) => !open && setPendingRolePowerId(null)}>
        <ModalContent className="w-[min(calc(100vw_-_2rem),24rem)]">
          <ModalHeader>
            <ModalTitle>{translate('ui.crew.power.confirm.title')}</ModalTitle>
            <ModalDescription>
              {translate('ui.crew.power.confirm.body', {
                role: translate(pendingRole.nameKey).toLocaleLowerCase(),
              })}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <button type="button" className="opfg-crew-action" onClick={() => setPendingRolePowerId(null)}>
              {translate('ui.crew.power.confirm.no')}
            </button>
            <button type="button" className="opfg-crew-action opfg-crew-power-confirm" onClick={confirmRolePower}>
              {translate('ui.crew.power.confirm.yes')}
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )}
  </div>;
}
