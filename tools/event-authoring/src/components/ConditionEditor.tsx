import { createCondition } from '../gameSchema/current/defaults';
import { NPC_STAT_IDS, NPC_STATUSES, PLAYER_STAT_IDS, type Condition, type GameRegistries } from '../gameSchema/current/contract';
import { IdSelect, NumberInput } from './EditorPrimitives';

const TYPES: Condition['type'][] = [
  'all','any','not','hasTrait','statAtLeast','hasFlag','hasItem','berriesAtLeast','locationIs','isAtSea','isOnLand','careerPhaseIs',
  'ageAtLeastMonths','ageAtMostMonths','hasShip','shipIs','shipHealthAtLeast','shipHealthAtMost','shipCrewCapacityAtLeast','shipCargoSpaceAtLeast','canAcquireShip','canSellShip','npcStatusIs','npcRelationshipAtLeast',
  'npcStatAtLeast','hasChosen','hasPlayed','hasOutcome','raceIs','originSeaIs','affiliationIs',
];

interface Props { value?: Condition; onChange: (value?: Condition) => void; registries: GameRegistries; eventIds: string[]; }
export default function ConditionEditor({ value, onChange, registries, eventIds }: Props) {
  if (!value) return <select className="add-select" value="" onChange={(e) => e.target.value && onChange(createCondition(e.target.value as Condition['type']))}><option value="">+ Condition…</option>{TYPES.map((type) => <option key={type}>{type}</option>)}</select>;
  const header = <div className="condition-header"><select value={value.type} onChange={(e) => onChange(createCondition(e.target.value as Condition['type']))}>{TYPES.map((type) => <option key={type}>{type}</option>)}</select><button className="icon danger" onClick={() => onChange(undefined)}>×</button></div>;
  const child = (condition: Condition | undefined, set: (next?: Condition) => void) => <ConditionEditor value={condition} onChange={set} registries={registries} eventIds={eventIds} />;
  const body = (() => {
    switch (value.type) {
      case 'all': case 'any': return <div className="condition-children">{value.conditions.map((condition, index) => <div className="condition-child" key={index}>{child(condition, (next) => { const conditions = [...value.conditions]; if (next) conditions[index] = next; else conditions.splice(index, 1); onChange({ ...value, conditions }); })}<div className="row compact"><button className="tiny" disabled={index === 0} onClick={() => { const conditions = [...value.conditions]; [conditions[index - 1], conditions[index]] = [conditions[index], conditions[index - 1]]; onChange({ ...value, conditions }); }}>↑</button><button className="tiny" disabled={index === value.conditions.length - 1} onClick={() => { const conditions = [...value.conditions]; [conditions[index], conditions[index + 1]] = [conditions[index + 1], conditions[index]]; onChange({ ...value, conditions }); }}>↓</button><button className="tiny" onClick={() => onChange({ ...value, conditions: [...value.conditions.slice(0, index + 1), structuredClone(condition), ...value.conditions.slice(index + 1)] })}>Duplicate</button></div></div>)}<button className="ghost" onClick={() => onChange({ ...value, conditions: [...value.conditions, createCondition('hasFlag')] })}>+ Child</button></div>;
      case 'not': return <div className="condition-children">{child(value.condition, (next) => next && onChange({ ...value, condition: next }))}</div>;
      case 'hasTrait': return <IdSelect value={value.traitId} options={registries.traits} onChange={(traitId) => onChange({ ...value, traitId })} />;
      case 'statAtLeast': return <div className="inline-fields"><select value={value.statId} onChange={(e) => onChange({ ...value, statId: e.target.value as typeof value.statId })}>{PLAYER_STAT_IDS.map((id) => <option key={id}>{id}</option>)}</select><NumberInput value={value.value} onChange={(next) => onChange({ ...value, value: next })} /></div>;
      case 'hasFlag': return <IdSelect value={value.flagId} options={registries.flags} onChange={(flagId) => onChange({ ...value, flagId })} />;
      case 'hasItem': return <IdSelect value={value.itemId} options={registries.items} onChange={(itemId) => onChange({ ...value, itemId })} />;
      case 'shipIs': case 'canAcquireShip': return <IdSelect value={value.shipId} options={registries.ships} onChange={(shipId) => onChange({ ...value, shipId })} />;
      case 'raceIs': return <IdSelect value={value.raceId} options={registries.races} onChange={(raceId) => onChange({ ...value, raceId })} />;
      case 'originSeaIs': return <IdSelect value={value.seaId} options={registries.seas} onChange={(seaId) => onChange({ ...value, seaId })} />;
      case 'affiliationIs': return <IdSelect value={value.affiliationId} options={registries.affiliations} onChange={(affiliationId) => onChange({ ...value, affiliationId })} />;
      case 'locationIs': return <IdSelect value={value.locationId} options={registries.locations} onChange={(locationId) => onChange({ ...value, locationId })} />;
      case 'isAtSea': case 'isOnLand': case 'hasShip': case 'canSellShip': return <span className="muted">No parameters</span>;
      case 'careerPhaseIs': return <select value={value.phase} onChange={(e) => onChange({ ...value, phase: e.target.value as typeof value.phase })}><option value="origins">origins</option><option value="childhood">childhood</option><option value="active">active</option></select>;
      case 'ageAtLeastMonths': case 'ageAtMostMonths': return <NumberInput value={value.value} min={0} onChange={(next) => onChange({ ...value, value: next })} />;
      case 'berriesAtLeast': case 'shipHealthAtLeast': case 'shipHealthAtMost': case 'shipCrewCapacityAtLeast': case 'shipCargoSpaceAtLeast': return <NumberInput value={value.value} min={0} onChange={(next) => onChange({ ...value, value: next })} />;
      case 'npcStatusIs': return <div className="inline-fields"><IdSelect value={value.npcId} options={registries.npcs} onChange={(npcId) => onChange({ ...value, npcId })} /><select value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value as typeof value.status })}>{NPC_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></div>;
      case 'npcRelationshipAtLeast': return <div className="inline-fields"><IdSelect value={value.npcId} options={registries.npcs} onChange={(npcId) => onChange({ ...value, npcId })} /><NumberInput value={value.value} onChange={(next) => onChange({ ...value, value: next })} /></div>;
      case 'npcStatAtLeast': return <div className="inline-fields"><IdSelect value={value.npcId} options={registries.npcs} onChange={(npcId) => onChange({ ...value, npcId })} /><select value={value.statId} onChange={(e) => onChange({ ...value, statId: e.target.value as typeof value.statId })}>{NPC_STAT_IDS.map((id) => <option key={id}>{id}</option>)}</select><NumberInput value={value.value} onChange={(next) => onChange({ ...value, value: next })} /></div>;
      case 'hasChosen': return <div className="inline-fields"><IdSelect value={value.eventId} options={eventIds.map((id) => ({ id }))} onChange={(eventId) => onChange({ ...value, eventId })} /><input value={value.choiceId} placeholder="choiceId" onChange={(e) => onChange({ ...value, choiceId: e.target.value })} /></div>;
      case 'hasPlayed': return <IdSelect value={value.eventId} options={eventIds.map((id) => ({ id }))} onChange={(eventId) => onChange({ ...value, eventId })} />;
      case 'hasOutcome': return <div className="inline-fields"><IdSelect value={value.eventId} options={eventIds.map((id) => ({ id }))} onChange={(eventId) => onChange({ ...value, eventId })} /><input value={value.outcomeId} placeholder="outcomeId" onChange={(e) => onChange({ ...value, outcomeId: e.target.value })} /></div>;
    }
  })();
  return <div className="condition-box">{header}{body}</div>;
}
