import { Anchor, CalendarDays, Clock3, Compass, MapPin, Waves } from 'lucide-react';
import { Panel } from '@/components/ui';
import './top-world-hud.css';

export function TopWorldHud() {
  return (
    <Panel
      variant="strong"
      padding="none"
      className="opfg-top-world-hud"
      aria-label="Informations du monde et du navire"
    >
      <section className="opfg-top-world-hud__section opfg-top-world-hud__world">
        <div className="opfg-top-world-hud__eyebrow">
          <MapPin className="size-4" aria-hidden="true" />
          Monde
        </div>

        <div className="opfg-top-world-hud__primary">
          Port de Brume
        </div>

        <div className="opfg-top-world-hud__secondary">
          <span>
            <Waves className="size-3.5" aria-hidden="true" />
            East Blue
          </span>
          <span>
            <Compass className="size-3.5" aria-hidden="true" />
            À quai
          </span>
        </div>
      </section>

      <div className="opfg-top-world-hud__divider" />

      <section className="opfg-top-world-hud__section opfg-top-world-hud__time">
        <div className="opfg-top-world-hud__character-name" aria-label="Nom du personnage">
          Aster Vane
        </div>

        <div className="opfg-top-world-hud__eyebrow">
          <Clock3 className="size-4" aria-hidden="true" />
          Temps
        </div>

        <div className="opfg-top-world-hud__primary">
          12 ans · 6 mois
        </div>

        <div className="opfg-top-world-hud__secondary">
          <span>
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Enfance
          </span>
          <span>Événement 1 / 2</span>
        </div>
      </section>

      <div className="opfg-top-world-hud__divider" />

      <section className="opfg-top-world-hud__section opfg-top-world-hud__ship">
        <div className="opfg-top-world-hud__ship-icon" aria-hidden="true">
          <Anchor className="size-5" />
        </div>

        <div className="opfg-top-world-hud__ship-copy">
          <div className="opfg-top-world-hud__eyebrow">Navire</div>
          <div className="opfg-top-world-hud__primary">Le Mistral</div>
          <div className="opfg-top-world-hud__secondary">
            <span>Sloop léger</span>
            <span>État 86 %</span>
          </div>
        </div>

        <div className="opfg-top-world-hud__ship-condition" aria-label="État du navire : 86%">
          <span style={{ width: '86%' }} />
        </div>
      </section>
    </Panel>
  );
}
