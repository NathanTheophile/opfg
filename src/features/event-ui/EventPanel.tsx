import { useState } from 'react';
import {
  Panel,
  PanelBody,
  PanelHeader,
  PanelTitle,
} from '@/components/ui';
import { ChoiceButton } from './ChoiceButton';
import type {
  EventChoiceViewModel,
  EventViewModel,
} from './types';

export interface EventPanelProps {
  event: EventViewModel;
  onChoice: (
    choice: EventChoiceViewModel,
    input?: string,
  ) => void;
  error?: string | null;
}

export function EventPanel({
  event,
  onChoice,
  error,
}: EventPanelProps) {
  const [inputs, setInputs] = useState<Record<string, string>>(
    {},
  );

  return (
    <Panel
      variant="strong"
      padding="none"
      className="opfg-event-panel w-full overflow-hidden shadow-overlay"
    >
      <PanelHeader className="opfg-event-panel__header mb-0 bg-gradient-to-b from-black/[0.38] to-black/[0.24] px-5 pb-3 pt-3 md:px-7 md:pb-3 md:pt-4">
        {event.eyebrow && (
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold">
            {event.eyebrow}
          </p>
        )}

        <PanelTitle className="opfg-event-panel__title text-xl md:text-2xl">
          {event.title}
        </PanelTitle>
      </PanelHeader>

      <div className="h-px bg-[var(--border-subtle)]" />

      <PanelBody className="opfg-event-panel__body px-5 pb-4 pt-3 md:px-7 md:pb-5 md:pt-4">
        <p className="opfg-event-panel__body-copy max-w-[68ch] text-sm leading-6 text-fg-secondary md:text-[0.94rem] md:leading-6">
          {event.body}
        </p>
      </PanelBody>

      <div className="opfg-event-panel__choices border-t border-[var(--border-subtle)] bg-black/[0.08] px-3 py-3 md:px-4 md:py-4">
        <div className="opfg-event-panel__choice-list flex flex-col gap-2.5">
          {error && (
            <p
              role="alert"
              className="text-sm text-red-300"
            >
              {error}
            </p>
          )}

          {event.choices.map((choice) => (
            <div
              key={choice.id}
              className="flex flex-col gap-2"
            >
              {choice.textInput && (
                <input
                  className="opfg-event-panel__input rounded-lg border border-[var(--border-subtle)] bg-black/20 px-4 py-3 text-fg"
                  value={inputs[choice.id] ?? ''}
                  minLength={choice.textInput.minLength}
                  maxLength={choice.textInput.maxLength}
                  placeholder={choice.textInput.placeholder}
                  onChange={(inputEvent) =>
                    setInputs((current) => ({
                      ...current,
                      [choice.id]: inputEvent.target.value,
                    }))
                  }
                />
              )}

              <ChoiceButton
                choice={choice}
                onSelect={(selected) =>
                  onChoice(
                    selected,
                    selected.textInput
                      ? inputs[selected.id] ?? ''
                      : undefined,
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
