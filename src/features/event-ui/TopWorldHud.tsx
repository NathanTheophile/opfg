import { Anchor, CalendarDays, Clock3, Compass, MapPin, Waves } from 'lucide-react';
import { Panel } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import type { GameState } from '@/game/model/schema';
import { ContextTooltip } from './ContextTooltip';
import {
  getUiTooltipDetail,
  inferTooltipLocale,
} from './context-tooltip-copy';
import './top-world-hud.css';

export interface TopWorldHudProps { state: GameState; catalog: ContentCatalog; translate: (key: string) => string }

export function TopWorldHud({ state, catalog, translate }: TopWorldHudProps) {
  const sea = catalog.seas.find(({ id }) => id === state.player.profile.originSeaId);
  const shipDefinition = state.ship ? catalog.ships.find(({ id }) => id === state.ship?.shipId) : undefined;
  const shipPercent = state.ship && shipDefinition ? Math.max(0, Math.min(100, Math.round(state.ship.health / shipDefinition.maxHealth * 100))) : 0;
  const tooltipLocale = inferTooltipLocale(translate('stat.health'));

  return <Panel variant="strong" padding="none" className="opfg-top-world-hud" aria-label="Informations du monde et du navire">
    <section className="opfg-top-world-hud__section opfg-top-world-hud__world">
      <ContextTooltip
        className="opfg-top-world-hud__eyebrow"
        title={tooltipLocale === 'fr' ? 'Monde' : 'World'}
        detail={getUiTooltipDetail('world', tooltipLocale)}
        side="bottom"
      >
        <MapPin className="size-4" aria-hidden="true" />
        {tooltipLocale === 'fr' ? 'Monde' : 'World'}
      </ContextTooltip>

      <div className="opfg-top-world-hud__primary">{state.locationId}</div>
      <div className="opfg-top-world-hud__secondary">
        <span><Waves className="size-3.5" aria-hidden="true" />{sea ? translate(sea.nameKey) : '—'}</span>
        <span><Compass className="size-3.5" aria-hidden="true" />{translate(`travel.${state.travelState}`)}</span>
      </div>
    </section>

    <div className="opfg-top-world-hud__divider" />

    <section className="opfg-top-world-hud__section opfg-top-world-hud__time">
      <div className="opfg-top-world-hud__character-name" aria-label="Nom du personnage">{state.player.profile.name ?? '—'}</div>

      <ContextTooltip
        className="opfg-top-world-hud__eyebrow"
        title={tooltipLocale === 'fr' ? 'Temps' : 'Time'}
        detail={getUiTooltipDetail('time', tooltipLocale)}
        side="bottom"
      >
        <Clock3 className="size-4" aria-hidden="true" />
        {tooltipLocale === 'fr' ? 'Temps' : 'Time'}
      </ContextTooltip>

      <div className="opfg-top-world-hud__primary">{Math.floor(state.ageMonths / 12)} ans · {state.ageMonths % 12} mois</div>
      <div className="opfg-top-world-hud__secondary">
        <span><CalendarDays className="size-3.5" aria-hidden="true" />{translate(`phase.${state.careerPhase}`)}</span>
        {state.careerPhase === 'active' && <span>Slot {state.slotInMonth + 1} / 2</span>}
      </div>
    </section>

    <div className="opfg-top-world-hud__divider" />

    <section className="opfg-top-world-hud__section opfg-top-world-hud__ship">
      <ContextTooltip
        className="opfg-top-world-hud__ship-icon"
        title={tooltipLocale === 'fr' ? 'Navire' : 'Ship'}
        detail={getUiTooltipDetail('ship', tooltipLocale)}
        meta={state.ship ? `${state.ship.health} HP · ${shipPercent} %` : undefined}
        side="left"
      >
        <Anchor className="size-5" aria-hidden="true" />
      </ContextTooltip>

      <div className="opfg-top-world-hud__ship-copy">
        <div className="opfg-top-world-hud__eyebrow">{tooltipLocale === 'fr' ? 'Navire' : 'Ship'}</div>
        <div className="opfg-top-world-hud__primary">{state.ship?.name ?? (tooltipLocale === 'fr' ? 'Aucun navire' : 'No ship')}</div>
        <div className="opfg-top-world-hud__secondary">
          <span>{shipDefinition ? translate(shipDefinition.nameKey) : '—'}</span>
          <span>{state.ship ? `${state.ship.health} HP · ${shipPercent} %` : '—'}</span>
        </div>
      </div>

      <div className="opfg-top-world-hud__ship-condition" aria-label={state.ship ? `État du navire : ${shipPercent}%` : 'Aucun navire'}>
        <span style={{ width: `${shipPercent}%` }} />
      </div>
    </section>
  </Panel>;
}
