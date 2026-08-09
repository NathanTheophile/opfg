import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { LocalizationStatus } from '../localization/types';

export type EventNodeData = {
  eventId: string;
  title: string;
  kind: 'normal' | 'scheduled' | 'critical';
  priority?: number;
  folder: string;
  choiceCount: number;
  status: 'draft' | 'ready' | 'migrated' | 'needsReview' | 'invalid';
  badges: string[];
  localeStatuses: Array<{ locale: string; status: LocalizationStatus }>;
  onCreateChild: (eventId: string) => void;
};
export type EventFlowNode = Node<EventNodeData, 'event'>;
const symbol = (status: LocalizationStatus) => status === 'current' ? '✓' : status === 'outdated' ? '⚠' : '✕';

export default function EventNode({ data, selected }: NodeProps<EventFlowNode>) {
  return <div className={`event-node ${selected ? 'selected' : ''} status-${data.status}`}>
    <Handle type="target" position={Position.Left} />
    <div className="node-header"><div className="node-title">{data.title || 'Untitled Event'}</div><button className="node-add nodrag" title="Create child Event" onClick={(event) => { event.stopPropagation(); data.onCreateChild(data.eventId); }}>+</button></div>
    <code className="node-id">{data.eventId || 'no-id'}</code>
    <div className="node-meta"><span>{data.kind}{data.priority ? ` P${data.priority}` : ''}</span><span>{data.choiceCount} choices</span><span className={`status-pill ${data.status}`}>{data.status}</span></div>
    <div className="node-folder">{data.folder}</div>
    {data.badges.length > 0 && <div className="badges">{data.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>}
    <div className="locale-badges">{data.localeStatuses.map(({ locale, status }) => <span key={locale} className={`loc-${status}`}>{locale.toUpperCase()} {symbol(status)}</span>)}</div>
    <Handle type="source" position={Position.Right} />
  </div>;
}

