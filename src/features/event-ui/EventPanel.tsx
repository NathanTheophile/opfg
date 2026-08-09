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
      <PanelHeader className="mb-0 px-5 pb-4 pt-5 md:px-7 md:pb-5 md:pt-6">
        {event.eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{event.eyebrow}</p>
        )}
        <PanelTitle className="text-2xl md:text-[1.75rem]">{event.title}</PanelTitle>
      </PanelHeader>

      <div className="h-px bg-[var(--border-subtle)]" />

      <PanelBody className="px-5 py-5 md:px-7 md:py-6">
        <p className="max-w-[68ch] text-[0.98rem] leading-7 text-fg-secondary md:text-base md:leading-7">
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
