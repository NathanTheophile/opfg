import { useEffect, useState } from 'react';
import type { CareerAffiliationId, GameState, PlayerStats } from '@/game/model/schema';
import './debug-panel.css';

type StatId = keyof PlayerStats;
type Patch = (state: GameState) => GameState;

export interface DebugPanelProps {
  state: GameState;
  disabled?: boolean;
  onPatch: (patch: Patch) => void;
}

const CAREERS: CareerAffiliationId[] = ['civilian', 'pirate', 'marine', 'revolutionary', 'bounty_hunter'];
const CAREER_LABELS: Record<CareerAffiliationId, string> = {
  civilian: 'Civilian', pirate: 'Pirate', marine: 'Marine', revolutionary: 'Revolutionary', bounty_hunter: 'Bounty Hunter',
};
const STAT_LABELS: Record<StatId, string> = {
  health: 'Health', morale: 'Morale', strength: 'Strength', agility: 'Agility', observation: 'Observation',
  intelligence: 'Intelligence', navigation: 'Navigation', charisma: 'Charisma', luck: 'Luck',
};
const STAT_IDS = Object.keys(STAT_LABELS) as StatId[];
const REP_PRESETS = [0, 19, 20, 39, 40, 59, 60, 79, 80, 100] as const;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? Math.round(value) : min));

export function DebugPanel({ state, disabled = false, onPatch }: DebugPanelProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if (event.key !== 'F2') return;
      event.preventDefault();
      setOpen((value) => !value);
    };
    window.addEventListener('keydown', toggle);
    return () => window.removeEventListener('keydown', toggle);
  }, []);

  const patchName = (name: string) => onPatch((s) => ({ ...s, player: { ...s.player, profile: { ...s.player.profile, name: name || null } } }));
  const patchCareer = (affiliationId: CareerAffiliationId) => onPatch((s) => ({
    ...s, player: { ...s.player, career: { ...s.player.career, affiliationId, rankId: null, titleId: null } },
  }));
  const patchReputation = (reputation: number) => onPatch((s) => ({
    ...s, player: { ...s.player, career: { ...s.player.career, reputation: clamp(reputation, 0, 100) } },
  }));
  const patchStat = (id: StatId, value: number) => onPatch((s) => ({
    ...s, player: { ...s.player, stats: { ...s.player.stats, [id]: clamp(value, 0, 50) } },
  }));
  const patchAllStats = (value: number) => onPatch((s) => ({
    ...s,
    player: {
      ...s.player,
      stats: STAT_IDS.reduce<PlayerStats>((stats, id) => ({ ...stats, [id]: clamp(value, 0, 50) }), { ...s.player.stats }),
    },
  }));
  const patchEconomy = (key: 'berries' | 'bounty', value: number) => onPatch((s) => {
    const next = Math.max(0, Math.round(Number.isFinite(value) ? value : 0));
    return key === 'berries' ? { ...s, berries: next } : { ...s, player: { ...s.player, career: { ...s.player.career, bounty: next } } };
  });

  if (!open) return <button type="button" className="opfg-debug-toggle" onClick={() => setOpen(true)} title="Debug panel (F2)">DEV</button>;

  return (
    <aside className="opfg-debug-panel" aria-label="Development debug panel">
      <header className="opfg-debug-panel__header">
        <div><strong>Runtime Debug</strong><span>F2 to toggle</span></div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close debug panel">×</button>
      </header>
      {disabled && <div className="opfg-debug-panel__warning">Finish the current dice/outcome transition before editing state.</div>}
      <div className="opfg-debug-panel__scroll" aria-disabled={disabled}>
        <section className="opfg-debug-section">
          <h2>Identity / ornament</h2>
          <label className="opfg-debug-field"><span>Name</span><input type="text" maxLength={32} value={state.player.profile.name ?? ''} disabled={disabled} onChange={(e) => patchName(e.currentTarget.value)} /></label>
          <div className="opfg-debug-actions">
            <button type="button" disabled={disabled} onClick={() => patchName('Nox')}>Short name</button>
            <button type="button" disabled={disabled} onClick={() => patchName('Alexandre D. Montfaucon')}>Long name</button>
          </div>
          <div className="opfg-debug-careers">
            {CAREERS.map((career) => <button key={career} type="button" disabled={disabled} data-active={state.player.career.affiliationId === career} onClick={() => patchCareer(career)}>{CAREER_LABELS[career]}</button>)}
          </div>
          <label className="opfg-debug-range"><span>Reputation <strong>{state.player.career.reputation}</strong></span><input type="range" min={0} max={100} value={state.player.career.reputation} disabled={disabled} onChange={(e) => patchReputation(e.currentTarget.valueAsNumber)} /></label>
          <div className="opfg-debug-presets">
            {REP_PRESETS.map((value) => <button key={value} type="button" disabled={disabled} data-active={state.player.career.reputation === value} onClick={() => patchReputation(value)}>{value}</button>)}
          </div>
        </section>
        <section className="opfg-debug-section">
          <div className="opfg-debug-section__heading"><h2>Player stats</h2><div className="opfg-debug-actions">{[0, 25, 50].map((value) => <button key={value} type="button" disabled={disabled} onClick={() => patchAllStats(value)}>All {value}</button>)}</div></div>
          <div className="opfg-debug-stats">
            {STAT_IDS.map((id) => <label key={id} className="opfg-debug-stat"><span>{STAT_LABELS[id]}</span><input type="range" min={0} max={50} value={state.player.stats[id]} disabled={disabled} onChange={(e) => patchStat(id, e.currentTarget.valueAsNumber)} /><input type="number" min={0} max={50} value={state.player.stats[id]} disabled={disabled} onChange={(e) => patchStat(id, e.currentTarget.valueAsNumber)} /></label>)}
          </div>
        </section>
        <section className="opfg-debug-section">
          <h2>Economy</h2>
          <div className="opfg-debug-economy">
            <label className="opfg-debug-field"><span>Berries</span><input type="number" min={0} value={state.berries} disabled={disabled} onChange={(e) => patchEconomy('berries', e.currentTarget.valueAsNumber)} /></label>
            <label className="opfg-debug-field"><span>Bounty</span><input type="number" min={0} value={state.player.career.bounty} disabled={disabled} onChange={(e) => patchEconomy('bounty', e.currentTarget.valueAsNumber)} /></label>
          </div>
        </section>
      </div>
    </aside>
  );
}
