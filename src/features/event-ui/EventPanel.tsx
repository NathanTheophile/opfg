import { Panel, PanelBody, PanelHeader, PanelTitle } from '@/components/ui';
import { ChoiceButton } from './ChoiceButton';
import type { EventChoiceViewModel, EventViewModel } from './types';

export interface EventPanelProps {
  event: EventViewModel;
  onChoice: (choice: EventChoiceViewModel) => void;
}

export function EventPanel({ event, onChoice }: EventPanelProps) {
  return (
    <Panel
      variant="strong"
      padding="none"
      className="w-full overflow-hidden shadow-overlay"
    >
      <PanelHeader className="mb-0 bg-gradient-to-b from-black/[0.38] to-black/[0.24] px-5 pb-3 pt-3 md:px-7 md:pb-3 md:pt-4">
        {event.eyebrow && (
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold">{event.eyebrow}</p>
        )}
        <PanelTitle className="text-xl md:text-2xl">{event.title}</PanelTitle>
      </PanelHeader>

      <div className="h-px bg-[var(--border-subtle)]" />

      <PanelBody className="px-5 pb-4 pt-3 md:px-7 md:pb-5 md:pt-4">
        <p className="max-w-[68ch] text-sm leading-6 text-fg-secondary md:text-[0.94rem] md:leading-6">
          {event.body}
        </p>
      </PanelBody>

      <div className="border-t border-[var(--border-subtle)] bg-black/[0.08] px-3 py-3 md:px-4 md:py-4">
        <div className="flex flex-col gap-2.5">
          {event.choices.map((choice) => (
            <ChoiceButton key={choice.id} choice={choice} onSelect={onChoice} />
          ))}
        </div>
      </div>
    </Panel>
  );
}
