import civil1 from '@/assets/ui/ornaments/civil1.png';
import civil2 from '@/assets/ui/ornaments/civil2.png';
import civil3 from '@/assets/ui/ornaments/civil3.png';
import civil4 from '@/assets/ui/ornaments/civil4.png';
import civil5 from '@/assets/ui/ornaments/civil5.png';
import marine1 from '@/assets/ui/ornaments/marine1.png';
import marine2 from '@/assets/ui/ornaments/marine2.png';
import marine3 from '@/assets/ui/ornaments/marine3.png';
import marine4 from '@/assets/ui/ornaments/marine4.png';
import marine5 from '@/assets/ui/ornaments/marine5.png';
import pirate1 from '@/assets/ui/ornaments/pirate1.png';
import pirate2 from '@/assets/ui/ornaments/pirate2.png';
import pirate3 from '@/assets/ui/ornaments/pirate3.png';
import pirate4 from '@/assets/ui/ornaments/pirate4.png';
import pirate5 from '@/assets/ui/ornaments/pirate5.png';
import revo1 from '@/assets/ui/ornaments/revo1.png';
import revo2 from '@/assets/ui/ornaments/revo2.png';
import revo3 from '@/assets/ui/ornaments/revo3.png';
import revo4 from '@/assets/ui/ornaments/revo4.png';
import revo5 from '@/assets/ui/ornaments/revo5.png';
import type { CareerAffiliationId } from '@/game/model/schema';
import './player-name-ornament.css';

export type PlayerNameOrnamentLevel = 0 | 1 | 2 | 3 | 4;

export interface PlayerNameOrnamentProps {
  name: string | null;
  title: string | null;
  affiliationId: CareerAffiliationId;
  reputation: number;
}

const ORNAMENT_URLS: Record<CareerAffiliationId, readonly [
  string,
  string,
  string,
  string,
  string,
]> = {
  civilian: [civil1, civil2, civil3, civil4, civil5],
  marine: [marine1, marine2, marine3, marine4, marine5],
  pirate: [pirate1, pirate2, pirate3, pirate4, pirate5],
  revolutionary: [revo1, revo2, revo3, revo4, revo5],
  bounty_hunter: [civil1, civil2, civil3, civil4, civil5],
};

export function getPlayerNameOrnamentLevel(reputation: number): PlayerNameOrnamentLevel {
  const value = Math.max(0, Math.min(100, reputation));
  if (value >= 80) return 4;
  if (value >= 60) return 3;
  if (value >= 40) return 2;
  if (value >= 20) return 1;
  return 0;
}

export function getPlayerNameOrnamentSrc(
  affiliationId: CareerAffiliationId,
  level: PlayerNameOrnamentLevel,
): string {
  return ORNAMENT_URLS[affiliationId][level];
}

export function PlayerNameOrnament({
  name,
  title,
  affiliationId,
  reputation,
}: PlayerNameOrnamentProps) {
  const level = getPlayerNameOrnamentLevel(reputation);
  const src = getPlayerNameOrnamentSrc(affiliationId, level);
  const displayName = name?.trim() || '—';
  const displayTitle = title?.trim() || null;

  return (
    <div
      className="opfg-name-ornament"
      data-affiliation={affiliationId}
      data-level={level}
    >
      <div key={src} className="opfg-name-ornament__canvas">
        <img
          className="opfg-name-ornament__texture"
          src={src}
          alt=""
          draggable={false}
          aria-hidden="true"
        />

        <div className="opfg-name-ornament__text-zone">
          <strong
            className="opfg-name-ornament__name"
            title={displayName === '—' ? undefined : displayName}
          >
            {displayName}
          </strong>
          {displayTitle && (
            <span className="opfg-name-ornament__title" title={displayTitle}>
              {displayTitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
