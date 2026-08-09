import { createDiceResolution, createDeterministicResolution } from '../gameSchema/current/defaults';
import type { Condition, GameRegistries, Resolution, TraitResultOverride } from '../gameSchema/current/contract';
import { PLAYER_STAT_IDS } from '../gameSchema/current/contract';
import { modifierLabelKey } from '../localization/keys';
import type { LocalizationAuthoringStore } from '../localization/types';
import ConditionEditor from './ConditionEditor';
import { Field, IdSelect, NumberInput } from './EditorPrimitives';
import LocalizedField from './LocalizedField';
import OutcomeEditor from './OutcomeEditor';

interface Props {
  value: Resolution;
  onChange: (value: Resolution) => void;
  registries: GameRegistries;
  eventIds: string[];
  scheduledEventIds: string[];
  immediateEventIds: string[];
  eventId: string;
  choiceId: string;
  localization: LocalizationAuthoringStore;
  activeLocale: string;
  sourceLocale: string;
  onLocalizedTextChange: (key: string, locale: string, text: string) => void;
}

export default function ResolutionEditor(props: Props) {
  const { value, onChange, registries, eventIds, scheduledEventIds, immediateEventIds, eventId, choiceId, localization, activeLocale, sourceLocale, onLocalizedTextChange } = props;
  const setType = (type: Resolution['type']) => onChange(type === 'deterministic' ? createDeterministicResolution(eventId, choiceId) : createDiceResolution(eventId, choiceId));
  const outcomeProps = { registries, eventIds, scheduledEventIds, immediateEventIds, localization, activeLocale, sourceLocale, onLocalizedTextChange };

  return <div className="resolution-editor">
    <Field label="Resolution"><select value={value.type} onChange={(e) => setType(e.target.value as Resolution['type'])}><option value="deterministic">Deterministic</option><option value="dice">Dice</option></select></Field>
    {value.type === 'deterministic'
      ? <OutcomeEditor {...outcomeProps} value={value.outcome} onChange={(outcome) => onChange({ ...value, outcome })} />
      : <div className="stack">
        <div className="two-columns">
          <Field label="Main Stat"><select value={value.statId} onChange={(e) => onChange({ ...value, statId: e.target.value as typeof value.statId })}>{PLAYER_STAT_IDS.map((id) => <option key={id}>{id}</option>)}</select></Field>
          <Field label="Success Threshold"><NumberInput value={value.successThreshold} min={2} onChange={(successThreshold) => onChange({ ...value, successThreshold })} /></Field>
        </div>
        <div className="subheading">Conditional modifiers</div>
        {value.modifiers?.map((modifier, index) => <div className="modifier-box" key={index}>
          <div className="modifier-row"><NumberInput value={modifier.value} onChange={(nextValue) => { const modifiers = [...(value.modifiers ?? [])]; modifiers[index] = { ...modifier, value: nextValue }; onChange({ ...value, modifiers }); }} /><ConditionEditor value={modifier.condition} onChange={(condition) => { if (!condition) return; const modifiers = [...(value.modifiers ?? [])]; modifiers[index] = { ...modifier, condition }; onChange({ ...value, modifiers }); }} registries={registries} eventIds={eventIds} /><button className="icon danger" onClick={() => onChange({ ...value, modifiers: value.modifiers?.filter((_, i) => i !== index) })}>×</button></div>
          <LocalizedField label="Display label" localization={localization} localizationKey={modifier.displayLabelKey} locale={activeLocale} sourceLocale={sourceLocale} onChange={(text) => onLocalizedTextChange(modifier.displayLabelKey, activeLocale, text)} />
        </div>)}
        <button className="ghost" onClick={() => onChange({ ...value, modifiers: [...(value.modifiers ?? []), { value: 0, condition: { type: 'hasFlag', flagId: '' } as Condition, displayLabelKey: modifierLabelKey(eventId, choiceId, value.modifiers?.length ?? 0) }] })}>+ Modifier</button>
        <div className="subheading">Secret Trait Overrides</div>
        {value.traitOverrides?.map((override, index) => <div className="inline-fields" key={index}><IdSelect value={override.traitId} options={registries.traits} onChange={(traitId) => { const traitOverrides = [...(value.traitOverrides ?? [])]; traitOverrides[index] = { ...override, traitId }; onChange({ ...value, traitOverrides }); }} /><select value={override.forceResult} onChange={(e) => { const traitOverrides = [...(value.traitOverrides ?? [])]; traitOverrides[index] = { ...override, forceResult: e.target.value as TraitResultOverride['forceResult'] }; onChange({ ...value, traitOverrides }); }}><option value="criticalFailure">criticalFailure</option><option value="criticalSuccess">criticalSuccess</option></select><button className="icon danger" onClick={() => onChange({ ...value, traitOverrides: value.traitOverrides?.filter((_, i) => i !== index) })}>×</button></div>)}
        <button className="ghost" onClick={() => onChange({ ...value, traitOverrides: [...(value.traitOverrides ?? []), { traitId: '', forceResult: 'criticalSuccess' }] })}>+ Trait Override</button>
        {(['criticalFailure','failure','success','criticalSuccess'] as const).map((key) => <details className="outcome-fold" key={key} open><summary>{key}</summary><OutcomeEditor {...outcomeProps} value={value.outcomes[key]} onChange={(outcome) => onChange({ ...value, outcomes: { ...value.outcomes, [key]: outcome } })} /></details>)}
      </div>}
  </div>;
}
