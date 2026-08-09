import { Anchor, CalendarDays, Clock3, Compass, MapPin, Waves } from 'lucide-react';
import { Panel } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import type { GameState } from '@/game/model/schema';
import './top-world-hud.css';

export interface TopWorldHudProps { state: GameState; catalog: ContentCatalog; translate: (key: string) => string }

export function TopWorldHud({ state, catalog, translate }: TopWorldHudProps) {
  const sea = catalog.seas.find(({ id }) => id === state.player.profile.originSeaId);
  const shipDefinition = state.ship ? catalog.ships.find(({ id }) => id === state.ship?.shipId) : undefined;
  const shipPercent = state.ship && shipDefinition ? Math.max(0, Math.min(100, Math.round(state.ship.health / shipDefinition.maxHealth * 100))) : 0;
  return <Panel variant="strong" padding="none" className="opfg-top-world-hud" aria-label="Informations du monde et du navire">
    <section className="opfg-top-world-hud__section opfg-top-world-hud__world">
      <div className="opfg-top-world-hud__eyebrow"><MapPin className="size-4" aria-hidden="true" />Monde</div>
      <div className="opfg-top-world-hud__primary">{state.locationId}</div>
      <div className="opfg-top-world-hud__secondary"><span><Waves className="size-3.5" aria-hidden="true" />{sea ? translate(sea.nameKey) : '—'}</span><span><Compass className="size-3.5" aria-hidden="true" />{translate(`travel.${state.travelState}`)}</span></div>
    </section>
    <div className="opfg-top-world-hud__divider" />
    <section className="opfg-top-world-hud__section opfg-top-world-hud__time">
      <div className="opfg-top-world-hud__character-name" aria-label="Nom du personnage">{state.player.profile.name ?? '—'}</div>
      <div className="opfg-top-world-hud__eyebrow"><Clock3 className="size-4" aria-hidden="true" />Temps</div>
      <div className="opfg-top-world-hud__primary">{Math.floor(state.ageMonths / 12)} ans · {state.ageMonths % 12} mois</div>
      <div className="opfg-top-world-hud__secondary"><span><CalendarDays className="size-3.5" aria-hidden="true" />{translate(`phase.${state.careerPhase}`)}</span>{state.careerPhase === 'active' && <span>Slot {state.slotInMonth + 1} / 2</span>}</div>
    </section>
    <div className="opfg-top-world-hud__divider" />
    <section className="opfg-top-world-hud__section opfg-top-world-hud__ship">
      <div className="opfg-top-world-hud__ship-icon" aria-hidden="true"><Anchor className="size-5" /></div>
      <div className="opfg-top-world-hud__ship-copy"><div className="opfg-top-world-hud__eyebrow">Navire</div><div className="opfg-top-world-hud__primary">{state.ship?.name ?? 'Aucun navire'}</div><div className="opfg-top-world-hud__secondary"><span>{shipDefinition ? translate(shipDefinition.nameKey) : '—'}</span><span>{state.ship ? `${state.ship.health} HP · ${shipPercent} %` : '—'}</span></div></div>
      <div className="opfg-top-world-hud__ship-condition" aria-label={state.ship ? `État du navire : ${shipPercent}%` : 'Aucun navire'}><span style={{ width: `${shipPercent}%` }} /></div>
    </section>
  </Panel>;
}
