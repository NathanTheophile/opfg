import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
} from 'motion/react';
import {
  CalendarDays,
  Clock3,
  MapPin,
} from 'lucide-react';
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
  meta?: {
    location: string;
    age: string;
    date: string;
  };
  onChoice: (
    choice: EventChoiceViewModel,
    input?: string,
  ) => void;
  error?: string | null;
  mode?: EventPanelMode;
  selectedChoiceId?: string | null;
}

function isSameNarrative(
  current: EventViewModel,
  incoming: EventViewModel,
): boolean {
  if (
    current.eyebrow !== incoming.eyebrow ||
    current.title !== incoming.title ||
    current.body !== incoming.body ||
    current.choices.length !== incoming.choices.length
  ) {
    return false;
  }

  return current.choices.every((choice, index) => {
    const next = incoming.choices[index];
    return (
      next !== undefined &&
      choice.id === next.id &&
      choice.label === next.label
    );
  });
}

export function EventPanel({
  event,
  meta,
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
    const sameNarrative =
      isSameNarrative(displayEvent, event);

    /*
     * Event -> Outcome is NOT a full panel transition.
     *
     * Header/body stay exactly where they are. Switching to resolved mode
     * only removes the non-selected Choices; AnimatePresence handles their
     * fade/collapse below.
     */
    if (
      sameNarrative &&
      mode === 'resolved' &&
      displayMode !== 'resolved'
    ) {
      transitionTimerRef.current.forEach((timer) =>
        window.clearTimeout(timer),
      );
      transitionTimerRef.current = [];

      setDisplaySelectedChoiceId(
        selectedChoiceId,
      );
      setDisplayMode('resolved');
      return undefined;
    }

    const presentationChanged =
      displayEvent !== event ||
      displayMode !== mode ||
      displaySelectedChoiceId !==
        selectedChoiceId;

    if (!presentationChanged) {
      return undefined;
    }

    transitionTimerRef.current.forEach((timer) =>
      window.clearTimeout(timer),
    );
    transitionTimerRef.current = [];

    /*
     * Full Event -> Event transition:
     * old copy fades -> hidden swap -> resize -> new copy fades in.
     */
    setContentVisible(false);

    const swapTimer =
      window.setTimeout(() => {
        setDisplayEvent(event);
        setDisplayMode(mode);
        setDisplaySelectedChoiceId(
          selectedChoiceId,
        );
        setInputs({});

        const revealTimer =
          window.setTimeout(() => {
            setContentVisible(true);
          }, 190);

        transitionTimerRef.current.push(
          revealTimer,
        );
      }, 110);

    transitionTimerRef.current.push(
      swapTimer,
    );

    return () => {
      transitionTimerRef.current.forEach(
        (timer) =>
          window.clearTimeout(timer),
      );
      transitionTimerRef.current = [];
    };
  }, [
    event,
    mode,
    selectedChoiceId,
  ]);

  const collapsed =
    displayMode === 'collapsed';
  const resolved =
    displayMode === 'resolved';

  const visibleChoices =
    resolved &&
    displaySelectedChoiceId !== null
      ? displayEvent.choices.filter(
          ({ id }) =>
            id ===
            displaySelectedChoiceId,
        )
      : displayEvent.choices;

  /*
   * AnimatePresence must persist while the SAME Event goes
   * interactive -> resolved so unselected Choices can fade/collapse.
   *
   * But it must remount immediately when displayEvent itself changes.
   * Otherwise exiting Choices from the previous Event coexist in layout
   * with the new Event Choices and temporarily double the Panel height.
   */
  const choicePresenceKey = [
    displayEvent.eyebrow ?? '',
    displayEvent.title,
    displayEvent.body,
    ...displayEvent.choices.map(
      ({ id }) => id,
    ),
  ].join('\u001f');

  return (
    <Panel
      variant="strong"
      padding="none"
      className="opfg-event-panel w-full overflow-hidden shadow-overlay"
      data-mode={displayMode}
      data-content-visible={
        contentVisible ? 'true' : 'false'
      }
    >
      <PanelHeader className="opfg-event-panel__header mb-0 bg-gradient-to-b from-black/[0.38] to-black/[0.24] px-5 md:px-6">
        {meta ? (
          <div className="opfg-event-panel__header-layout">
            <div className="opfg-event-panel__header-copy">
              <span className="opfg-event-panel__meta-location">
                <MapPin className="size-[0.85rem]" aria-hidden="true" />
                <span>{meta.location}</span>
              </span>

              <PanelTitle className="opfg-event-panel__title">
                {displayEvent.title}
              </PanelTitle>
            </div>

            <span className="opfg-event-panel__meta-time">
              <span>
                {meta.age}
                <Clock3 className="size-3" aria-hidden="true" />
              </span>
              <span>
                {meta.date}
                <CalendarDays className="size-3" aria-hidden="true" />
              </span>
            </span>
          </div>
        ) : (
          <>
            {displayEvent.eyebrow && (
              <p className="opfg-event-panel__location-flag text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold">
                {displayEvent.eyebrow}
              </p>
            )}

            <PanelTitle className="opfg-event-panel__title">
              {displayEvent.title}
            </PanelTitle>
          </>
        )}
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

              <AnimatePresence
                key={choicePresenceKey}
                initial={false}
              >
                {visibleChoices.map(
                  (choice) => {
                    const selected =
                      choice.id ===
                      displaySelectedChoiceId;

                    return (
                      <motion.div
                        key={choice.id}
                        layout="position"
                        initial={false}
                        animate={{
                          opacity: 1,
                          height: 'auto',
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          transition: {
                            opacity: {
                              duration: 0.1,
                              ease: 'easeOut',
                            },
                            height: {
                              duration: 0.17,
                              delay: 0.09,
                              ease: [
                                0.16,
                                1,
                                0.3,
                                1,
                              ],
                            },
                          },
                        }}
                        transition={{
                          layout: {
                            duration: 0.17,
                            ease: [
                              0.16,
                              1,
                              0.3,
                              1,
                            ],
                          },
                        }}
                        className="opfg-event-panel__choice flex flex-col gap-2 overflow-hidden"
                        data-selected={
                          selected
                            ? 'true'
                            : 'false'
                        }
                        data-resolved={
                          resolved
                            ? 'true'
                            : 'false'
                        }
                        aria-current={
                          selected
                            ? 'true'
                            : undefined
                        }
                      >
                        {choice.textInput &&
                          !resolved && (
                            <input
                              className="opfg-event-panel__input rounded-lg border border-[var(--border-subtle)] bg-black/20 px-4 py-3 text-fg"
                              value={
                                inputs[
                                  choice.id
                                ] ?? ''
                              }
                              minLength={
                                choice
                                  .textInput
                                  .minLength
                              }
                              maxLength={
                                choice
                                  .textInput
                                  .maxLength
                              }
                              placeholder={
                                choice
                                  .textInput
                                  .placeholder
                              }
                              onChange={(
                                inputEvent,
                              ) =>
                                setInputs(
                                  (
                                    current,
                                  ) => ({
                                    ...current,
                                    [choice.id]:
                                      inputEvent
                                        .target
                                        .value,
                                  }),
                                )
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
                            onSelect={(
                              selectedChoice,
                            ) =>
                              onChoice(
                                selectedChoice,
                                selectedChoice
                                  .textInput
                                  ? inputs[
                                      selectedChoice
                                        .id
                                    ] ?? ''
                                  : undefined,
                              )
                            }
                          />
                        </div>
                      </motion.div>
                    );
                  },
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}
