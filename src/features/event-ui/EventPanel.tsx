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

export type EventPanelMode =
  | 'interactive'
  | 'resolved'
  | 'collapsed';

export interface EventPanelProps {
  event: EventViewModel;
  onChoice: (
    choice: EventChoiceViewModel,
    input?: string,
  ) => void;
  error?: string | null;
  mode?: EventPanelMode;
  selectedChoiceId?: string | null;
}

export function EventPanel({
  event,
  onChoice,
  error,
  mode = 'interactive',
  selectedChoiceId = null,
}: EventPanelProps) {
  const [inputs, setInputs] =
    useState<Record<string, string>>({});

  const collapsed = mode === 'collapsed';
  const resolved = mode === 'resolved';

  return (
    <Panel
      variant="strong"
      padding="none"
      className="opfg-event-panel w-full overflow-hidden shadow-overlay"
      data-mode={mode}
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

      {!collapsed && (
        <>
          <div className="h-px bg-[var(--border-subtle)]" />

          <PanelBody className="opfg-event-panel__body px-5 pb-4 pt-3 md:px-7 md:pb-5 md:pt-4">
            <p className="opfg-event-panel__body-copy max-w-[68ch] text-sm leading-6 text-fg-secondary md:text-[0.94rem] md:leading-6">
              {event.body}
            </p>
          </PanelBody>

          <div className="opfg-event-panel__choices border-t border-[var(--border-subtle)] bg-black/[0.08] px-3 py-3 md:px-4 md:py-4">
            <div className="opfg-event-panel__choice-list flex flex-col gap-2.5">
              {error && !resolved && (
                <p
                  role="alert"
                  className="text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              {event.choices.map((choice) => {
                const selected =
                  choice.id === selectedChoiceId;

                return (
                  <div
                    key={choice.id}
                    className="opfg-event-panel__choice flex flex-col gap-2"
                    data-selected={
                      selected ? 'true' : 'false'
                    }
                    data-resolved={
                      resolved ? 'true' : 'false'
                    }
                    aria-current={
                      selected ? 'true' : undefined
                    }
                  >
                    {choice.textInput && !resolved && (
                      <input
                        className="opfg-event-panel__input rounded-lg border border-[var(--border-subtle)] bg-black/20 px-4 py-3 text-fg"
                        value={
                          inputs[choice.id] ?? ''
                        }
                        minLength={
                          choice.textInput.minLength
                        }
                        maxLength={
                          choice.textInput.maxLength
                        }
                        placeholder={
                          choice.textInput.placeholder
                        }
                        onChange={(inputEvent) =>
                          setInputs((current) => ({
                            ...current,
                            [choice.id]:
                              inputEvent.target.value,
                          }))
                        }
                      />
                    )}

                    <div
                      className={
                        resolved
                          ? 'pointer-events-none'
                          : undefined
                      }
                    >
                      <ChoiceButton
                        choice={choice}
                        onSelect={(selectedChoice) =>
                          onChoice(
                            selectedChoice,
                            selectedChoice.textInput
                              ? inputs[
                                  selectedChoice.id
                                ] ?? ''
                              : undefined,
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}
