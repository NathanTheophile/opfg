import { createEffect } from '../gameSchema/current/defaults';
import { NPC_STAT_IDS, NPC_STATUSES, PLAYER_STAT_IDS, type Effect, type GameRegistries } from '../gameSchema/current/contract';
import { IdSelect, NumberInput } from './EditorPrimitives';

export const EFFECT_TYPES: Effect['type'][] = [
  'setFlag','clearFlag','addItem','removeItem','addTrait','removeTrait','modifyStat','modifyShipCondition','loseShip',
  'moveToLocation','setNpcStatus','modifyNpcRelationship','modifyNpcStat','scheduleEvent','setCareerPhase','setRace',
  'setOriginSea','setAffiliation','endCareer',
];

interface Props { value: Effect; onChange: (value: Effect) => void; onRemove: () => void; registries: GameRegistries; eventIds: string[]; scheduledEventIds: string[]; }
export default function EffectEditor({ value, onChange, onRemove, registries, eventIds, scheduledEventIds }: Props) {
  const params = (() => {
    switch (value.type) {
      case 'setFlag': case 'clearFlag': return <IdSelect value={value.flagId} options={registries.flags} onChange={(flagId) => onChange({ ...value, flagId })} />;
      case 'addItem': case 'removeItem': return <IdSelect value={value.itemId} options={registries.items} onChange={(itemId) => onChange({ ...value, itemId })} />;
      case 'addTrait': case 'removeTrait': return <IdSelect value={value.traitId} options={registries.traits} onChange={(traitId) => onChange({ ...value, traitId })} />;
      case 'modifyStat': return <div className="inline-fields"><select value={value.statId} onChange={(e) => onChange({ ...value, statId: e.target.value as typeof value.statId })}>{PLAYER_STAT_IDS.map((id) => <option key={id}>{id}</option>)}</select><NumberInput value={value.amount} onChange={(amount) => onChange({ ...value, amount })} /></div>;
      case 'modifyShipCondition': return <NumberInput value={value.amount} onChange={(amount) => onChange({ ...value, amount })} />;
      case 'moveToLocation': case 'loseShip': return <div className="inline-fields"><IdSelect value={value.locationId} options={registries.locations} onChange={(locationId) => onChange({ ...value, locationId })} /><select value={value.travelState} onChange={(e) => onChange({ ...value, travelState: e.target.value as typeof value.travelState })}><option value="at_sea">at_sea</option><option value="on_land">on_land</option></select></div>;
      case 'setNpcStatus': return <div className="inline-fields"><IdSelect value={value.npcId} options={registries.npcs} onChange={(npcId) => onChange({ ...value, npcId })} /><select value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value as typeof value.status })}>{NPC_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></div>;
      case 'modifyNpcRelationship': return <div className="inline-fields"><IdSelect value={value.npcId} options={registries.npcs} onChange={(npcId) => onChange({ ...value, npcId })} /><NumberInput value={value.amount} onChange={(amount) => onChange({ ...value, amount })} /></div>;
      case 'modifyNpcStat': return <div className="inline-fields"><IdSelect value={value.npcId} options={registries.npcs} onChange={(npcId) => onChange({ ...value, npcId })} /><select value={value.statId} onChange={(e) => onChange({ ...value, statId: e.target.value as typeof value.statId })}>{NPC_STAT_IDS.map((id) => <option key={id}>{id}</option>)}</select><NumberInput value={value.amount} onChange={(amount) => onChange({ ...value, amount })} /></div>;
      case 'scheduleEvent': return <div className="inline-fields"><IdSelect value={value.eventId} options={scheduledEventIds.map((id) => ({ id }))} onChange={(eventId) => onChange({ ...value, eventId })} /><NumberInput value={value.delayMonths} min={0} onChange={(delayMonths) => onChange({ ...value, delayMonths })} /></div>;
      case 'setCareerPhase': return <select value={value.phase} onChange={(e) => onChange({ ...value, phase: e.target.value as typeof value.phase })}><option value="origins">origins</option><option value="childhood">childhood</option><option value="active">active</option></select>;
      case 'setRace': return <IdSelect value={value.raceId} options={registries.races} onChange={(raceId) => onChange({ ...value, raceId })} />;
      case 'setOriginSea': return <IdSelect value={value.seaId} options={registries.seas} onChange={(seaId) => onChange({ ...value, seaId })} />;
      case 'setAffiliation': return <IdSelect value={value.affiliationId} options={registries.affiliations} onChange={(affiliationId) => onChange({ ...value, affiliationId })} />;
      case 'endCareer': return <select value={value.reason} onChange={(e) => onChange({ ...value, reason: e.target.value as typeof value.reason })}><option value="death">death</option><option value="legacy">legacy</option></select>;
    }
  })();
  return <div className="effect-row"><select value={value.type} onChange={(e) => onChange(createEffect(e.target.value as Effect['type']))}>{EFFECT_TYPES.map((type) => <option key={type}>{type}</option>)}</select><div className="effect-params">{params}</div><button className="icon danger" onClick={onRemove}>×</button></div>;
}

