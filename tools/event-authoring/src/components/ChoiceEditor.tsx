import { createChoice } from '../gameSchema/current/defaults';
import type { ChoiceDefinition, GameRegistries } from '../gameSchema/current/contract';
import { choicePlaceholderKey } from '../localization/keys';
import { getText } from '../localization/store';
import type { LocalizationAuthoringStore } from '../localization/types';
import ConditionEditor from './ConditionEditor';
import { Field, NumberInput } from './EditorPrimitives';
import LocalizedField from './LocalizedField';
import ResolutionEditor from './ResolutionEditor';

interface Props {
  eventId: string;
  value: ChoiceDefinition;
  onChange: (value: ChoiceDefinition) => void;
  onRemove: () => void;
  registries: GameRegistries;
  eventIds: string[];
  scheduledEventIds: string[];
  localization: LocalizationAuthoringStore;
  activeLocale: string;
  sourceLocale: string;
  onLocalizedTextChange: (key: string, locale: string, text: string) => void;
}

export default function ChoiceEditor({ eventId, value, onChange, onRemove, registries, eventIds, scheduledEventIds, localization, activeLocale, sourceLocale, onLocalizedTextChange }: Props) {
  const summary = getText(localization, value.textKey, sourceLocale).trim() || 'Untitled Choice';
  return <details className="choice-editor" open>
    <summary><span>{summary}</span><code>{value.id || 'no-id'}</code></summary>
    <div className="stack choice-body">
      <div className="row end"><button className="danger-text" onClick={onRemove}>Delete choice</button></div>
      <Field label="Choice ID"><input value={value.id} onChange={(e) => onChange({ ...value, id: e.target.value })} /></Field>
      <LocalizedField label="Text" localization={localization} localizationKey={value.textKey} locale={activeLocale} sourceLocale={sourceLocale} multiline rows={2} onChange={(text) => onLocalizedTextChange(value.textKey, activeLocale, text)} />
      <Field label="Text input"><select value={value.input ? 'playerName' : ''} onChange={(e) => onChange({ ...value, input: e.target.value ? { type: 'text', target: 'playerName', minLength: 1, maxLength: 32, placeholderKey: choicePlaceholderKey(eventId, value.id) } : undefined })}><option value="">None</option><option value="playerName">text → playerName</option></select></Field>
      {value.input && <div className="two-columns"><Field label="Min length"><NumberInput value={value.input.minLength} min={0} onChange={(minLength) => onChange({ ...value, input: { ...value.input!, minLength } })} /></Field><Field label="Max length"><NumberInput value={value.input.maxLength} min={1} onChange={(maxLength) => onChange({ ...value, input: { ...value.input!, maxLength } })} /></Field></div>}
      {value.input?.placeholderKey && <LocalizedField label="Placeholder" localization={localization} localizationKey={value.input.placeholderKey} locale={activeLocale} sourceLocale={sourceLocale} onChange={(text) => onLocalizedTextChange(value.input!.placeholderKey!, activeLocale, text)} />}
      <div><div className="subheading">visibleIf</div><ConditionEditor value={value.visibleIf} onChange={(visibleIf) => onChange({ ...value, visibleIf })} registries={registries} eventIds={eventIds} /></div>
      <div><div className="subheading">availableIf</div><ConditionEditor value={value.availableIf} onChange={(availableIf) => onChange({ ...value, availableIf })} registries={registries} eventIds={eventIds} /></div>
      <ResolutionEditor value={value.resolution} onChange={(resolution) => onChange({ ...value, resolution })} registries={registries} eventIds={eventIds} scheduledEventIds={scheduledEventIds} eventId={eventId} choiceId={value.id} localization={localization} activeLocale={activeLocale} sourceLocale={sourceLocale} onLocalizedTextChange={onLocalizedTextChange} />
    </div>
  </details>;
}

export { createChoice };

