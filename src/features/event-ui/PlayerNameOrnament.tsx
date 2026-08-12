import type { CareerAffiliationId } from '@/game/model/schema';
import './player-name-ornament.css';

export type PlayerNameOrnamentLevel = 0 | 1 | 2 | 3 | 4;

export interface PlayerNameOrnamentProps {
  name: string | null;
  title: string | null;
  affiliationId: CareerAffiliationId;
  reputation: number;
}

const ORNAMENT_PREFIX: Record<CareerAffiliationId, string> = {
  civilian: 'civil',
  marine: 'marine',
  pirate: 'pirate',
  revolutionary: 'revo',
  // The V1 textured set currently covers the four playable affiliations.
  // Keep a readable fallback if this locked affiliation is forced in debug.
  bounty_hunter: 'civil',
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
  return `/art/ornaments/${ORNAMENT_PREFIX[affiliationId]}${level + 1}.png`;
}

export function PlayerNameOrnament({
  name,
  title,
  affiliationId,
  reputation,
}: PlayerNameOrnamentProps) {
  const level = getPlayerNameOrnamentLevel(reputation);
  const src = getPlayerNameOrnamentSrc(affiliationId, level);

  return (
    <div
      className="opfg-name-ornament"
      data-affiliation={affiliationId}
      data-level={level}
      aria-label={[name, title].filter(Boolean).join(' · ')}
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
          <strong className="opfg-name-ornament__name">{name ?? '—'}</strong>
          {title && (
            <span className="opfg-name-ornament__title">{title}</span>
          )}
        </div>
      </div>
    </div>
  );
}
