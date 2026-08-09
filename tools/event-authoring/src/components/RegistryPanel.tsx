import { useState } from 'react';
import type { AuthoringProject } from '../authoring/types';
import { createNpcStats } from '../gameSchema/current/defaults';
import { NPC_STAT_IDS } from '../gameSchema/current/contract';
import { affiliationNameKey, crewRoleNameKey, itemNameKey, npcNameKey, raceNameKey, seaNameKey, shipNameKey, traitDescriptionKey, traitNameKey } from '../localization/keys';
import { ensureKeys } from '../localization/store';
import { IdSelect, NumberInput } from './EditorPrimitives';
import LocalizedField from './LocalizedField';

type RegistryTab = 'races' | 'seas' | 'affiliations' | 'traits' | 'items' | 'ships' | 'crewRoles' | 'npcs' | 'locations' | 'flags';
const TABS: RegistryTab[] = ['races','seas','affiliations','traits','items','ships','crewRoles','npcs','locations','flags'];

interface Props {
  open: boolean;
  project: AuthoringProject;
  activeLocale: string;
  onClose: () => void;
  onChange: (project: AuthoringProject) => void;
  onLocalizedTextChange: (key: string, locale: string, text: string) => void;
}

export default function RegistryPanel({ open, project, activeLocale, onClose, onChange, onLocalizedTextChange }: Props) {
  const [tab, setTab] = useState<RegistryTab>('races');
  const [newId, setNewId] = useState('');
  if (!open) return null;
  const sourceLocale = project.sourceLocale;
  const r = project.registries;
  const exists = (id: string) => r[tab].some((entry) => entry.id === id);

  const add = () => {
    const id = newId.trim(); if (!id || exists(id)) return;
    const next = structuredClone(project);
    if (tab === 'races') { next.registries.races.push({ id, nameKey: raceNameKey(id) }); next.localization = ensureKeys(next.localization, [raceNameKey(id)]); }
    if (tab === 'seas') { next.registries.seas.push({ id, nameKey: seaNameKey(id) }); next.localization = ensureKeys(next.localization, [seaNameKey(id)]); }
    if (tab === 'affiliations') { next.registries.affiliations.push({ id, nameKey: affiliationNameKey(id) }); next.localization = ensureKeys(next.localization, [affiliationNameKey(id)]); }
    if (tab === 'traits') { next.registries.traits.push({ id, nameKey: traitNameKey(id), descriptionKey: traitDescriptionKey(id) }); next.localization = ensureKeys(next.localization, [traitNameKey(id), traitDescriptionKey(id)]); }
    if (tab === 'items') { next.registries.items.push({ id, nameKey: itemNameKey(id) }); next.localization = ensureKeys(next.localization, [itemNameKey(id)]); }
    if (tab === 'ships') { next.registries.ships.push({ id, nameKey: shipNameKey(id), maxHealth: 1, crewCapacity: 0, cargoSlots: 0 }); next.localization = ensureKeys(next.localization, [shipNameKey(id)]); }
    if (tab === 'crewRoles') { next.registries.crewRoles.push({ id, nameKey: crewRoleNameKey(id) }); next.localization = ensureKeys(next.localization, [crewRoleNameKey(id)]); }
    if (tab === 'npcs') { next.registries.npcs.push({ id, nameKey: npcNameKey(id), raceId: null, originSeaId: null, affiliationId: null, crewRoleId: null, initialStats: createNpcStats() }); next.localization = ensureKeys(next.localization, [npcNameKey(id)]); }
    if (tab === 'locations') next.registries.locations.push({ id, blocksScheduledEvents: false, allowsShipSale: false });
    if (tab === 'flags') next.registries.flags.push({ id });
    onChange(next); setNewId('');
  };

  const remove = (id: string) => {
    const next = structuredClone(project);
    if (tab === 'races') next.registries.races = next.registries.races.filter((x) => x.id !== id);
    if (tab === 'seas') next.registries.seas = next.registries.seas.filter((x) => x.id !== id);
    if (tab === 'affiliations') next.registries.affiliations = next.registries.affiliations.filter((x) => x.id !== id);
    if (tab === 'traits') next.registries.traits = next.registries.traits.filter((x) => x.id !== id);
    if (tab === 'items') next.registries.items = next.registries.items.filter((x) => x.id !== id);
    if (tab === 'ships') next.registries.ships = next.registries.ships.filter((x) => x.id !== id);
    if (tab === 'crewRoles') next.registries.crewRoles = next.registries.crewRoles.filter((x) => x.id !== id);
    if (tab === 'npcs') next.registries.npcs = next.registries.npcs.filter((x) => x.id !== id);
    if (tab === 'locations') next.registries.locations = next.registries.locations.filter((x) => x.id !== id);
    if (tab === 'flags') next.registries.flags = next.registries.flags.filter((x) => x.id !== id);
    onChange(next);
  };

  const localized = (key: string, label: string, multiline = false) => <LocalizedField label={label} localization={project.localization} localizationKey={key} locale={activeLocale} sourceLocale={sourceLocale} multiline={multiline} rows={2} onChange={(text) => onLocalizedTextChange(key, activeLocale, text)} />;
  const nullableSelect = (value: string | null, options: { id: string }[], onValue: (value: string | null) => void) => <select value={value ?? ''} onChange={(e) => onValue(e.target.value || null)}><option value="">— none —</option>{options.map((option) => <option key={option.id} value={option.id}>{option.id}</option>)}</select>;

  return <div className="modal-backdrop"><div className="registry-panel">
    <div className="modal-header"><strong>Registries</strong><span className="muted">Locale {activeLocale.toUpperCase()}</span><button onClick={onClose}>Close</button></div>
    <div className="registry-tabs">{TABS.map((value) => <button key={value} className={tab === value ? 'active' : ''} onClick={() => setTab(value)}>{value}{value === 'flags' ? ' (authoring)' : ''}</button>)}</div>
    <div className="registry-add"><input value={newId} placeholder={`new ${tab.slice(0, -1)} id`} onChange={(e) => setNewId(e.target.value)} /><button onClick={add}>Add</button></div>
    {tab === 'flags' && <div className="hint">Flags are authoring-only autocomplete metadata. They are never emitted as a ContentCatalog field.</div>}
    <div className="registry-list">
      {tab === 'races' && r.races.map((entry) => <div className="registry-card" key={entry.id}><div className="registry-id"><code>{entry.id}</code><button className="danger-text" onClick={() => remove(entry.id)}>Delete</button></div>{localized(entry.nameKey, 'Name')}</div>)}
      {tab === 'seas' && r.seas.map((entry) => <div className="registry-card" key={entry.id}><div className="registry-id"><code>{entry.id}</code><button className="danger-text" onClick={() => remove(entry.id)}>Delete</button></div>{localized(entry.nameKey, 'Name')}</div>)}
      {tab === 'affiliations' && r.affiliations.map((entry) => <div className="registry-card" key={entry.id}><div className="registry-id"><code>{entry.id}</code><button className="danger-text" onClick={() => remove(entry.id)}>Delete</button></div>{localized(entry.nameKey, 'Name')}</div>)}
      {tab === 'traits' && r.traits.map((entry, index) => <div className="registry-card" key={entry.id}><div className="registry-id"><code>{entry.id}</code><button className="danger-text" onClick={() => remove(entry.id)}>Delete</button></div>{localized(entry.nameKey, 'Name')}{localized(entry.descriptionKey, 'Description', true)}<label className="field"><span>Opposite Trait</span><IdSelect value={entry.oppositeTraitId ?? ''} options={r.traits.filter((x) => x.id !== entry.id)} onChange={(oppositeTraitId) => { const next = structuredClone(project); next.registries.traits[index].oppositeTraitId = oppositeTraitId || undefined; onChange(next); }} /></label></div>)}
      {tab === 'items' && r.items.map((entry) => <div className="registry-card" key={entry.id}><div className="registry-id"><code>{entry.id}</code><button className="danger-text" onClick={() => remove(entry.id)}>Delete</button></div>{localized(entry.nameKey, 'Name')}</div>)}
      {tab === 'ships' && r.ships.map((entry, index) => <div className="registry-card" key={entry.id}><div className="registry-id"><code>{entry.id}</code><button className="danger-text" onClick={() => remove(entry.id)}>Delete</button></div>{localized(entry.nameKey, 'Name')}<div className="three-columns"><label className="field"><span>Max HP</span><NumberInput value={entry.maxHealth} min={1} onChange={(maxHealth) => { const next = structuredClone(project); next.registries.ships[index].maxHealth = maxHealth; onChange(next); }} /></label><label className="field"><span>Crew capacity</span><NumberInput value={entry.crewCapacity} min={0} onChange={(crewCapacity) => { const next = structuredClone(project); next.registries.ships[index].crewCapacity = crewCapacity; onChange(next); }} /></label><label className="field"><span>Cargo slots</span><NumberInput value={entry.cargoSlots} min={0} onChange={(cargoSlots) => { const next = structuredClone(project); next.registries.ships[index].cargoSlots = cargoSlots; onChange(next); }} /></label></div></div>)}
      {tab === 'crewRoles' && r.crewRoles.map((entry) => <div className="registry-card" key={entry.id}><div className="registry-id"><code>{entry.id}</code><button className="danger-text" onClick={() => remove(entry.id)}>Delete</button></div>{localized(entry.nameKey, 'Name')}</div>)}
      {tab === 'npcs' && r.npcs.map((entry, index) => <div className="registry-card" key={entry.id}><div className="registry-id"><code>{entry.id}</code><button className="danger-text" onClick={() => remove(entry.id)}>Delete</button></div>{localized(entry.nameKey, 'Name')}<div className="three-columns"><label className="field"><span>Race</span>{nullableSelect(entry.raceId, r.races, (raceId) => { const next = structuredClone(project); next.registries.npcs[index].raceId = raceId; onChange(next); })}</label><label className="field"><span>Origin Sea</span>{nullableSelect(entry.originSeaId, r.seas, (originSeaId) => { const next = structuredClone(project); next.registries.npcs[index].originSeaId = originSeaId; onChange(next); })}</label><label className="field"><span>Affiliation</span>{nullableSelect(entry.affiliationId, r.affiliations, (affiliationId) => { const next = structuredClone(project); next.registries.npcs[index].affiliationId = affiliationId; onChange(next); })}</label><label className="field"><span>Crew role</span>{nullableSelect(entry.crewRoleId, r.crewRoles, (crewRoleId) => { const next = structuredClone(project); next.registries.npcs[index].crewRoleId = crewRoleId; onChange(next); })}</label></div><div className="npc-stats">{NPC_STAT_IDS.map((stat) => <label className="field" key={stat}><span>{stat}</span><NumberInput value={entry.initialStats[stat]} onChange={(value) => { const next = structuredClone(project); next.registries.npcs[index].initialStats[stat] = value; onChange(next); }} /></label>)}</div></div>)}
      {tab === 'locations' && r.locations.map((entry, index) => <div className="registry-card simple" key={entry.id}><code>{entry.id}</code><label className="checkbox-inline"><input type="checkbox" checked={entry.blocksScheduledEvents} onChange={(e) => { const next = structuredClone(project); next.registries.locations[index].blocksScheduledEvents = e.target.checked; onChange(next); }} /> blocks scheduled</label><label className="checkbox-inline"><input type="checkbox" checked={entry.allowsShipSale} onChange={(e) => { const next = structuredClone(project); next.registries.locations[index].allowsShipSale = e.target.checked; onChange(next); }} /> ship sales</label><button className="danger-text" onClick={() => remove(entry.id)}>Delete</button></div>)}
      {tab === 'flags' && r.flags.map((entry) => <div className="registry-card simple" key={entry.id}><code>{entry.id}</code><button className="danger-text" onClick={() => remove(entry.id)}>Delete</button></div>)}
    </div>
  </div></div>;
}
