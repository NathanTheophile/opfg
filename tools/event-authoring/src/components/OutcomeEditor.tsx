import { createEffect } from '../gameSchema/current/defaults';
import type { Effect, GameRegistries, Outcome } from '../gameSchema/current/contract';
import type { LocalizationAuthoringStore } from '../localization/types';
import { Field } from './EditorPrimitives';
import EffectEditor, { EFFECT_TYPES } from './EffectEditor';
import LocalizedField from './LocalizedField';

interface Props {
  value: Outcome;
  onChange: (value: Outcome) => void;
  registries: GameRegistries;
  eventIds: string[];
  scheduledEventIds: string[];
  immediateEventIds: string[];
  localization: LocalizationAuthoringStore;
  activeLocale: string;
  sourceLocale: string;
  onLocalizedTextChange: (key: string, locale: string, text: string) => void;
}

export default function OutcomeEditor({ value, onChange, registries, eventIds, scheduledEventIds, immediateEventIds, localization, activeLocale, sourceLocale, onLocalizedTextChange }: Props) {
  return <div className="outcome-editor">
    <Field label="Outcome ID"><input value={value.id} onChange={(e) => onChange({ ...value, id: e.target.value })} /></Field>
    <LocalizedField label="Narrative text" localization={localization} localizationKey={value.textKey} locale={activeLocale} sourceLocale={sourceLocale} multiline rows={3} onChange={(text) => onLocalizedTextChange(value.textKey, activeLocale, text)} />
    <div className="subheading">Effects</div>
    <div className="stack">
      {value.effects.map((effect, index) => <EffectEditor key={index} value={effect} registries={registries} eventIds={eventIds} scheduledEventIds={scheduledEventIds} immediateEventIds={immediateEventIds} onChange={(next) => { const effects = [...value.effects]; effects[index] = next; onChange({ ...value, effects }); }} onRemove={() => onChange({ ...value, effects: value.effects.filter((_, i) => i !== index) })} />)}
      <select className="add-select" value="" onChange={(e) => { if (!e.target.value) return; onChange({ ...value, effects: [...value.effects, createEffect(e.target.value as Effect['type'])] }); }}><option value="">+ Effect…</option>{EFFECT_TYPES.map((type) => <option key={type}>{type}</option>)}</select>
    </div>
  </div>;
}
