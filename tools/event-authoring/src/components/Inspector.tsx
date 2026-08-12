import type { AuthoringStatus, ContentFolder } from '../authoring/types';
import type { EventDefinition, GameRegistries } from '../gameSchema/current/contract';
import type { LocalizationAuthoringStore } from '../localization/types';
import type { ValidationIssue } from '../validation/validateProject';
import ChoiceEditor, { createChoice } from './ChoiceEditor';
import ConditionEditor from './ConditionEditor';
import { Field, IdSelect, Section } from './EditorPrimitives';
import LocalizedField from './LocalizedField';

interface Props {
  event?: EventDefinition;
  contentFolder: ContentFolder;
  notes: string;
  status: AuthoringStatus;
  issues: ValidationIssue[];
  registries: GameRegistries;
  eventIds: string[];
  scheduledEventIds: string[];
  immediateEventIds: string[];
  localization: LocalizationAuthoringStore;
  activeLocale: string;
  sourceLocale: string;
  supportedLocales: string[];
  onLocaleChange: (locale: string) => void;
  onLocalizedTextChange: (key: string, locale: string, text: string) => void;
  onChange: (event: EventDefinition) => void;
  onContentFolderChange: (folder: ContentFolder) => void;
  onRename: (newId: string) => void;
  onNotesChange: (notes: string) => void;
  onStatusChange: (status: AuthoringStatus) => void;
}

const convertKind = (event: EventDefinition, kind: EventDefinition['kind']): EventDefinition => {
  const { id, titleKey, textKey, eligibility, choices } = event;
  const base = { id, titleKey, textKey, eligibility, choices };
  if (kind === 'scheduled') return { ...base, kind, priority: 100, scheduledReach: 'normal' };
  if (kind === 'critical') return { ...base, kind, trigger: { type: 'playerHealthDepleted' } };
  if (kind === 'immediate') return { ...base, kind };
  return { ...base, kind: 'normal' };
};

export default function Inspector(props: Props) {
  const { event, contentFolder, notes, status, issues, registries, eventIds, scheduledEventIds, immediateEventIds, localization, activeLocale, sourceLocale, supportedLocales, onLocaleChange, onLocalizedTextChange, onChange, onContentFolderChange, onRename, onNotesChange, onStatusChange } = props;
  if (!event) return <aside className="inspector empty-panel"><span>Select an Event card.</span></aside>;
  const normalFolders: ContentFolder[] = ['origins','childhood','active','fixtures/childhood'];
  const selectedMajorTrack = event.kind === 'normal' && event.majorTrack
    ? registries.majorNarrativeTracks.find(({ id }) => id === event.majorTrack?.trackId)
    : undefined;
  return <aside className="inspector"><div className="inspector-scroll">
    <div className="locale-tabs">{supportedLocales.map((locale) => <button key={locale} className={activeLocale === locale ? 'active' : ''} onClick={() => onLocaleChange(locale)}>{locale.toUpperCase()}</button>)}</div>
    <Section title="General">
      <Field label="Event ID"><input value={event.id} onChange={(e) => onRename(e.target.value)} /></Field>
      <div className="two-columns">
        <Field label="Kind"><select value={event.kind} onChange={(e) => onChange(convertKind(event, e.target.value as EventDefinition['kind']))}><option value="normal">normal</option><option value="immediate">immediate</option><option value="scheduled">scheduled</option><option value="critical">critical</option></select></Field>
        <Field label="Content folder"><select value={contentFolder} disabled={event.kind !== 'normal'} onChange={(e) => onContentFolderChange(e.target.value as ContentFolder)}>{event.kind === 'immediate' ? <option value="immediate">immediate</option> : event.kind === 'scheduled' ? <option value="scheduled">scheduled</option> : event.kind === 'critical' ? <option value="critical">critical</option> : normalFolders.map((folder) => <option key={folder} value={folder}>{folder}</option>)}</select></Field>
      </div>
      <LocalizedField label="Title" localization={localization} localizationKey={event.titleKey} locale={activeLocale} sourceLocale={sourceLocale} onChange={(text) => onLocalizedTextChange(event.titleKey, activeLocale, text)} />
      <LocalizedField label="Text" localization={localization} localizationKey={event.textKey} locale={activeLocale} sourceLocale={sourceLocale} multiline rows={5} onChange={(text) => onLocalizedTextChange(event.textKey, activeLocale, text)} />
      {event.kind === 'scheduled' && <div className="stack compact-block">
        <div className="two-columns">
          <Field label="Priority"><select value={event.priority} onChange={(e) => onChange({ ...event, priority: Number(e.target.value) as typeof event.priority })}>{[50,100,200,300].map((p) => <option key={p} value={p}>{p}</option>)}</select></Field>
          <Field label="Scheduled reach"><select value={event.scheduledReach ?? ''} onChange={(e) => onChange({ ...event, scheduledReach: e.target.value ? e.target.value as 'normal' | 'unrestricted' : undefined })}><option value="">default (normal)</option><option value="normal">normal</option><option value="unrestricted">unrestricted</option></select></Field>
        </div>
        <div><div className="subheading">cancelIf</div><ConditionEditor value={event.cancelIf} onChange={(cancelIf) => onChange({ ...event, cancelIf })} registries={registries} eventIds={eventIds} /></div>
        <Field label="Fallback Scheduled Event"><IdSelect value={event.fallbackEventId ?? ''} options={scheduledEventIds.map((id) => ({ id }))} onChange={(fallbackEventId) => onChange({ ...event, fallbackEventId: fallbackEventId || undefined })} /></Field>
      </div>}
      {event.kind === 'critical' && <div className="stack compact-block">
        <Field label="Critical trigger"><select value={event.trigger.type} onChange={(e) => { const type = e.target.value; onChange({ ...event, trigger: type === 'npcHealthDepleted' ? { type, npcId: '' } : type === 'shipDestroyed' ? { type } : { type: 'playerHealthDepleted' } }); }}><option value="playerHealthDepleted">playerHealthDepleted</option><option value="npcHealthDepleted">npcHealthDepleted</option><option value="shipDestroyed">shipDestroyed</option></select></Field>
        {event.trigger.type === 'npcHealthDepleted' && <Field label="NPC"><IdSelect value={event.trigger.npcId} options={registries.npcs} onChange={(npcId) => onChange({ ...event, trigger: { type: 'npcHealthDepleted', npcId } })} /></Field>}
      </div>}
    </Section>
    {event.kind === 'normal' && <Section title="Major Narrative">
      {event.majorTrack === undefined ? (
        <button className="primary subtle" disabled={registries.majorNarrativeTracks.length === 0} onClick={() => {
          const track = registries.majorNarrativeTracks[0];
          const chapter = track?.chapters[0];
          if (!track || !chapter) return;
          onChange({ ...event, majorTrack: { trackId: track.id, chapterId: chapter.id, nodeId: event.id } });
        }}>Attach to Major Track</button>
      ) : <div className="stack compact-block">
        <Field label="Track">
          <select value={event.majorTrack.trackId} onChange={(e) => {
            const track = registries.majorNarrativeTracks.find(({ id }) => id === e.target.value);
            const chapterId = track?.chapters[0]?.id ?? event.majorTrack!.chapterId;
            onChange({ ...event, majorTrack: { ...event.majorTrack!, trackId: e.target.value, chapterId, parentNodeIds: undefined } });
          }}>
            {registries.majorNarrativeTracks.map((track) => <option key={track.id} value={track.id}>{track.id}</option>)}
          </select>
        </Field>
        <div className="two-columns">
          <Field label="Temporal layer">
            <select value={event.majorTrack.chapterId} onChange={(e) => onChange({ ...event, majorTrack: { ...event.majorTrack!, chapterId: e.target.value, parentNodeIds: undefined } })}>
              {(selectedMajorTrack?.chapters ?? []).map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.id} · {chapter.dueAgeMonths}m</option>)}
            </select>
          </Field>
          <Field label="Node ID"><input value={event.majorTrack.nodeId} onChange={(e) => onChange({ ...event, majorTrack: { ...event.majorTrack!, nodeId: e.target.value } })} /></Field>
        </div>
        <Field label="Parent node IDs (comma-separated)">
          <input value={(event.majorTrack.parentNodeIds ?? []).join(', ')} placeholder="previous_node_a, previous_node_b" onChange={(e) => onChange({
            ...event,
            majorTrack: {
              ...event.majorTrack!,
              parentNodeIds: e.target.value.split(',').map((value) => value.trim()).filter(Boolean).length
                ? e.target.value.split(',').map((value) => value.trim()).filter(Boolean)
                : undefined,
            },
          })} />
        </Field>
        <div className="two-columns">
          <Field label="Selection priority"><input type="number" min={0} max={100} value={event.majorTrack.selectionPriority ?? 0} onChange={(e) => onChange({ ...event, majorTrack: { ...event.majorTrack!, selectionPriority: Number(e.target.value) || undefined } })} /></Field>
          <Field label="Route fallback"><input type="checkbox" checked={event.majorTrack.fallback === true} onChange={(e) => onChange({ ...event, majorTrack: { ...event.majorTrack!, fallback: e.target.checked ? true : undefined } })} /></Field>
        </div>
        <div className="two-columns">
          <Field label="Special path ID"><input value={event.majorTrack.specialPathId ?? ''} placeholder="marine_giant" onChange={(e) => onChange({ ...event, majorTrack: { ...event.majorTrack!, specialPathId: e.target.value || undefined, milestoneId: e.target.value ? event.majorTrack!.milestoneId : undefined } })} /></Field>
          <Field label="Milestone ID"><input value={event.majorTrack.milestoneId ?? ''} disabled={!event.majorTrack.specialPathId} placeholder="marine_giant_inheritance" onChange={(e) => onChange({ ...event, majorTrack: { ...event.majorTrack!, milestoneId: e.target.value || undefined } })} /></Field>
        </div>
        <div className="hint">Connect two Major nodes in the graph to add the source node as a structural parent. Use hasChosen/hasOutcome in Eligibility for Choice-specific descent.</div>
        <button className="danger-text" onClick={() => { const { majorTrack: _majorTrack, ...rest } = event; onChange(rest as EventDefinition); }}>Detach Major Track</button>
      </div>}
    </Section>}
    <Section title="Eligibility"><ConditionEditor value={event.eligibility} onChange={(eligibility) => onChange({ ...event, eligibility })} registries={registries} eventIds={eventIds} /></Section>
    <Section title={`Choices · ${event.choices.length}`}><div className="stack">
      {event.choices.map((choice, index) => <ChoiceEditor key={`${choice.id}-${index}`} eventId={event.id} value={choice} registries={registries} eventIds={eventIds} scheduledEventIds={scheduledEventIds} immediateEventIds={immediateEventIds} localization={localization} activeLocale={activeLocale} sourceLocale={sourceLocale} onLocalizedTextChange={onLocalizedTextChange} onChange={(next) => { const choices = [...event.choices]; choices[index] = next; onChange({ ...event, choices }); }} onRemove={() => onChange({ ...event, choices: event.choices.filter((_, i) => i !== index) })} />)}
      <button className="primary subtle" onClick={() => { const id = `choice_${event.choices.length + 1}`; onChange({ ...event, choices: [...event.choices, createChoice(event.id, id)] }); }}>+ Choice</button>
    </div></Section>
    <Section title="Authoring"><Field label="Status"><select value={status} onChange={(e) => onStatusChange(e.target.value as AuthoringStatus)}><option value="draft">Draft</option><option value="ready">Ready</option><option value="migrated">Migrated</option><option value="needsReview">Needs Review</option></select></Field><Field label="Notes"><textarea rows={5} value={notes} onChange={(e) => onNotesChange(e.target.value)} /></Field></Section>
    <Section title={`Validation · ${issues.length}`}>{issues.length === 0 ? <div className="success-message">No issues.</div> : <div className="issue-list">{issues.map((issue, index) => <div key={`${issue.code}-${index}`} className={`issue ${issue.severity}`}><strong>{issue.category} · {issue.severity}</strong><span>{issue.message}</span></div>)}</div>}</Section>
  </div></aside>;
}
