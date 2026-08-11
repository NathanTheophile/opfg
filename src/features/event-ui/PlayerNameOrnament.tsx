import type { CareerAffiliationId } from '@/game/model/schema';
import './player-name-ornament.css';

export type PlayerNameOrnamentLevel = 0 | 1 | 2 | 3 | 4;

export interface PlayerNameOrnamentProps {
  name: string | null;
  affiliationId: CareerAffiliationId;
  reputation: number;
}

export function getPlayerNameOrnamentLevel(reputation: number): PlayerNameOrnamentLevel {
  const value = Math.max(0, Math.min(100, reputation));
  if (value >= 80) return 4;
  if (value >= 60) return 3;
  if (value >= 40) return 2;
  if (value >= 20) return 1;
  return 0;
}

interface CareerWingProps {
  affiliationId: CareerAffiliationId;
  side: 'left' | 'right';
}

function CareerWing({ affiliationId, side }: CareerWingProps) {
  return (
    <svg
      className={`opfg-name-ornament__wing is-${side}`}
      viewBox="0 0 108 44"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <g className="opfg-name-ornament__layer is-base">
        <path d="M6 22H72" />
        <path d="M70 18l8 4-8 4" />
      </g>

      {affiliationId === 'civilian' && (
        <>
          <g className="opfg-name-ornament__identity"><path d="M84 17l5 5-5 5-5-5 5-5Z" /></g>
          <g className="opfg-name-ornament__layer is-1"><path d="M56 22c7-8 15-8 22 0" /><circle cx="62" cy="19" r="2" /></g>
          <g className="opfg-name-ornament__layer is-2"><path d="M46 22c9-13 23-16 35-8" /><path d="M66 13c4 2 7 5 9 9" /></g>
          <g className="opfg-name-ornament__layer is-3"><path d="M43 28c10 4 20 3 30-3" /><path d="M58 30l5-7 6 5" /></g>
          <g className="opfg-name-ornament__layer is-4"><path d="M42 12c7 0 12 3 16 8M49 9c5 1 9 4 11 8" /><path d="M77 13l7 9-7 9" /></g>
        </>
      )}

      {affiliationId === 'pirate' && (
        <>
          <g className="opfg-name-ornament__identity"><path d="M80 15l11 4-6 3 7 5-12 1 4-6-4-7Z" /></g>
          <g className="opfg-name-ornament__layer is-1"><path d="M56 22l10-8 14 3-7 5 8 5-15 2Z" /></g>
          <g className="opfg-name-ornament__layer is-2"><path d="M45 18c7-7 14-9 21-6" /><circle cx="52" cy="16" r="2.2" /><circle cx="61" cy="12" r="1.7" /></g>
          <g className="opfg-name-ornament__layer is-3"><path d="M43 29c9-5 16-5 24-1" /><path d="M52 31l5-7 5 6" /></g>
          <g className="opfg-name-ornament__layer is-4"><path d="M39 13l9 4-5 6 10 7" /><path d="M69 9l7 7 8-3-3 9 5 7" /></g>
        </>
      )}

      {affiliationId === 'marine' && (
        <>
          <g className="opfg-name-ornament__identity"><path d="M78 17l6 5-6 5M84 17l6 5-6 5" /></g>
          <g className="opfg-name-ornament__layer is-1"><path d="M54 16h20l7 6-7 6H54" /></g>
          <g className="opfg-name-ornament__layer is-2"><path d="M48 13h24M48 31h24" /><path d="M63 13l6 9-6 9" /></g>
          <g className="opfg-name-ornament__layer is-3"><path d="M42 10h14l5 5M42 34h14l5-5" /></g>
          <g className="opfg-name-ornament__layer is-4"><path d="M39 8h20l9 14-9 14H39" /><path d="M72 12l12 10-12 10" /></g>
        </>
      )}

      {affiliationId === 'revolutionary' && (
        <>
          <g className="opfg-name-ornament__identity"><path d="M79 30l5-15 4 6 6-5-5 13-5-5-5 6Z" /></g>
          <g className="opfg-name-ornament__layer is-1"><path d="M55 29l8-14 6 6 8-7" /></g>
          <g className="opfg-name-ornament__layer is-2"><path d="M47 31l8-16M57 33l8-20" /></g>
          <g className="opfg-name-ornament__layer is-3"><path d="M41 27c10-1 18-6 25-15" /><path d="M51 34c9-3 17-8 24-16" /></g>
          <g className="opfg-name-ornament__layer is-4"><path d="M40 12l9 5-6 7 11 8" /><path d="M69 10l6 8 10-4-5 10 7 6" /></g>
        </>
      )}

      {affiliationId === 'bounty_hunter' && (
        <>
          <g className="opfg-name-ornament__identity"><path d="M78 15h12v4h5v6h-5v4H78l5-7-5-7Z" /></g>
          <g className="opfg-name-ornament__layer is-1"><path d="M54 15h21v14H54l5-7-5-7Z" /></g>
          <g className="opfg-name-ornament__layer is-2"><circle cx="65" cy="22" r="7" /><path d="M65 11v5M65 28v5M54 22h5M71 22h5" /></g>
          <g className="opfg-name-ornament__layer is-3"><path d="M45 13h12v18H45" /><circle cx="50" cy="17" r="1.5" /><circle cx="50" cy="27" r="1.5" /></g>
          <g className="opfg-name-ornament__layer is-4"><path d="M40 9h24l17 13-17 13H40" /><path d="M73 14l10 8-10 8" /></g>
        </>
      )}
    </svg>
  );
}

export function PlayerNameOrnament({ name, affiliationId, reputation }: PlayerNameOrnamentProps) {
  const level = getPlayerNameOrnamentLevel(reputation);

  return (
    <div
      className="opfg-name-ornament"
      data-affiliation={affiliationId}
      data-level={level}
    >
      <span className="opfg-name-ornament__rail is-left" aria-hidden="true" />
      <CareerWing affiliationId={affiliationId} side="left" />
      <span className="opfg-name-ornament__name-wrap">
        <span key={`${affiliationId}-${level}`} className="opfg-name-ornament__sheen" aria-hidden="true" />
        <strong className="opfg-name-ornament__name">{name ?? '—'}</strong>
      </span>
      <CareerWing affiliationId={affiliationId} side="right" />
      <span className="opfg-name-ornament__rail is-right" aria-hidden="true" />
    </div>
  );
}
