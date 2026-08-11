import { useEffect, useRef, useState } from 'react';
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

  const [displayEvent, setDisplayEvent] =
    useState(event);
  const [displayMode, setDisplayMode] =
    useState(mode);
  const [
    displaySelectedChoiceId,
    setDisplaySelectedChoiceId,
  ] = useState(selectedChoiceId);
  const [contentVisible, setContentVisible] =
    useState(true);
  const transitionTimerRef =
    useRef<number[]>([]);

  useEffect(() => {
    const presentationChanged =
      displayEvent !== event ||
      displayMode !== mode ||
      displaySelectedChoiceId !== selectedChoiceId;

    if (!presentationChanged) return undefined;

    transitionTimerRef.current.forEach((timer) =>
      window.clearTimeout(timer),
    );
    transitionTimerRef.current = [];

    // 1. Fade only the existing panel contents. The Panel itself stays mounted.
    setContentVisible(false);

    const swapTimer = window.setTimeout(() => {
      // 2. Swap Event + mode + selected Choice while everything is invisible.
      setDisplayEvent(event);
      setDisplayMode(mode);
      setDisplaySelectedChoiceId(selectedChoiceId);
      setInputs({});

      // 3. Leave the new contents invisible while layout/height settles.
      const revealTimer = window.setTimeout(() => {
        // 4. Fade the new contents back in.
        setContentVisible(true);
      }, 190);

      transitionTimerRef.current.push(revealTimer);
    }, 110);

    transitionTimerRef.current.push(swapTimer);

    return () => {
      transitionTimerRef.current.forEach((timer) =>
        window.clearTimeout(timer),
      );
      transitionTimerRef.current = [];
    };
  }, [
    event,
    mode,
    selectedChoiceId,
  ]);

  const collapsed = displayMode === 'collapsed';
  const resolved = displayMode === 'resolved';

  return (
    <Panel
      variant="strong"
      padding="none"
      className="opfg-event-panel w-full overflow-hidden shadow-overlay"
      data-mode={displayMode}
      data-content-visible={contentVisible ? 'true' : 'false'}
    >
      <PanelHeader className="opfg-event-panel__header mb-0 bg-gradient-to-b from-black/[0.38] to-black/[0.24] px-5 md:px-6">
        {displayEvent.eyebrow && (
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold">
            {displayEvent.eyebrow}
          </p>
        )}

        <PanelTitle className="opfg-event-panel__title">
          {displayEvent.title}
        </PanelTitle>
      </PanelHeader>

      {!collapsed && (
        <>
          <div className="h-px bg-[var(--border-subtle)]" />

          <PanelBody className="opfg-event-panel__body px-5 md:px-6">
            <p className="opfg-event-panel__body-copy">
              {displayEvent.body}
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

              {displayEvent.choices.map((choice) => {
                const selected =
                  choice.id === displaySelectedChoiceId;

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
