import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AnimatePresence,
  motion,
} from 'motion/react';
import { Button, Panel } from '@/components/ui';
import type {
  ChoiceDefinition,
  ContentCatalog,
  DiceResult,
  StatId,
} from '@/game/content/schema';
import { getChoiceState } from '@/game/engine/conditions';
import {
  getDicePreview,
  type DiceRollResult,
} from '@/game/engine/dice';
import type { StorageLike } from '@/game/engine/save';
import {
  loadLocale,
  saveLocale,
  t,
  type LocaleId,
  type Translator,
} from '@/game/localization';
import type {
  GameState,
  NpcStatId,
} from '@/game/model/schema';
import { useGameSession } from '@/game/session/useGameSession';
import { npcInterpolationParams } from '@/game/engine/npcNames';
import {
  DiceTableStage,
  type DiceTableStageStatus,
} from '@/features/dice/DiceTableStage';
import { LanguageControls } from '@/features/settings/LanguageControls';
import { notifyUiLocaleChanged } from '@/features/settings/localeSync';
import { PlayerStatsRail } from './PlayerStatsRail';
import {
  InventoryHudPanel,
  ShipHudPanel,
  TopWorldHud,
} from './TopWorldHud';
import { CrewRail } from './CrewRail';
import { EventPanel } from './EventPanel';
import { OutcomePanel } from './OutcomePanel';
import { NavigationPanel } from './NavigationPanel';
import { MobileSideDrawers } from './MobileSideDrawers';
import type {
  ChoiceStatChangeViewModel,
  EventChoiceViewModel,
  EventViewModel,
  OutcomeEffectViewModel,
  OutcomeViewModel,
  PlayerDisplayStatId,
} from './types';
import './event-preview.css';

const STAT_KEYS: Record<
  keyof GameState['player']['stats'],
  string
> = {
  health: 'stat.health',
  morale: 'stat.morale',
  strength: 'stat.strength',
  agility: 'stat.agility',
  observation: 'stat.observation',
  intelligence: 'stat.intelligence',
  navigation: 'stat.navigation',
  charisma: 'stat.charisma',
  luck: 'stat.luck',
};

const NPC_STAT_KEYS: Record<NpcStatId, string> = {
  health: 'stat.health',
  morale: 'stat.morale',
  strength: 'stat.strength',
  observation: 'stat.observation',
  intelligence: 'stat.intelligence',
  luck: 'stat.luck',
  loyalty: 'npcStat.loyalty',
  calm: 'npcStat.calm',
};

const RESULT_KEYS: Record<DiceResult, string> = {
  criticalFailure: 'dice.criticalFailure',
  failure: 'dice.failure',
  success: 'dice.success',
  criticalSuccess: 'dice.criticalSuccess',
};

const PANEL_TRANSITION = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1] as [
    number,
    number,
    number,
    number,
  ],
};

const RESULT_HOLD_MS = 650;

interface PendingDice {
  status: DiceTableStageStatus;
  choiceId: string;
  input?: string;
  statId: StatId;
  modifierTotal: number;
  dice?: DiceRollResult;
}

function originPreview(
  choice: ChoiceDefinition,
  catalog: ContentCatalog,
  translate: Translator,
): ChoiceStatChangeViewModel[] {
  if (choice.resolution.type !== 'deterministic') return [];

  return choice.resolution.outcome.effects.flatMap((effect): ChoiceStatChangeViewModel[] => {
    const format = (statId: PlayerDisplayStatId, value: number, absolute = false): ChoiceStatChangeViewModel => ({
      statId,
      label: translate(STAT_KEYS[statId]),
      value,
      absolute,
    });

    if (effect.type === 'modifyStat') return [format(effect.statId, effect.amount)];
    if (effect.type === 'modifyHealth') return [format('health', effect.amount)];
    if (effect.type === 'setRace') {
      const race = catalog.races.find(({ id }) => id === effect.raceId);
      return race
        ? [format('health', race.initialHealth, true), ...Object.entries(race.attributeModifiers).map(([id, value]) => format(id as StatId, value))]
        : [];
    }

    const modifiers = effect.type === 'setFamilyStructure'
      ? catalog.familyStructures.find(({ id }) => id === effect.familyStructureId)?.attributeModifiers
      : effect.type === 'setSocialClass'
        ? catalog.socialClasses.find(({ id }) => id === effect.socialClassId)?.attributeModifiers
        : undefined;
    return Object.entries(modifiers ?? {}).map(([id, value]) => format(id as StatId, value));
  });
}

function transitionEffects(
  before: GameState | null,
  after: GameState | null,
  catalog: ContentCatalog,
  translate: Translator,
): OutcomeEffectViewModel[] {
  if (!before || !after) return [];
  const effects: OutcomeEffectViewModel[] = [];

  for (const statId of Object.keys(STAT_KEYS) as PlayerDisplayStatId[]) {
    const previous = before.player.stats[statId];
    const next = after.player.stats[statId];
    if (typeof previous === 'number' && typeof next === 'number' && previous !== next) {
      const delta = next - previous;
      effects.push({
        id: `stat-${statId}`,
        label: `${delta > 0 ? '+' : ''}${delta} ${translate(STAT_KEYS[statId])}`,
        tone: delta > 0 ? 'positive' : 'warning',
        statId,
        delta,
      });
    }
  }

  for (const traitId of after.player.traits.filter((id) => !before.player.traits.includes(id))) {
    const trait = catalog.traits.find((entry) => entry.id === traitId);
    const traitLabel = trait ? translate(trait.nameKey) : translate('ui.trait.unknown');
    effects.push({
      id: `trait-${traitId}`,
      label: translate('ui.outcome.traitAdded', { trait: traitLabel }),
      tone: 'positive',
      traitId,
    });
  }
  return effects;
}

export interface EventPreviewProps {
  catalog: ContentCatalog;
  storage: StorageLike;
}

export function EventPreview({
  catalog,
  storage,
}: EventPreviewProps) {
  const session = useGameSession(
    catalog,
    storage,
  );

  const [locale, setLocale] =
    useState<LocaleId>(() =>
      loadLocale(
        storage,
        navigator.language,
      ),
    );

  const [inputError, setInputError] =
    useState<string | null>(null);

  const [showOutcome, setShowOutcome] =
    useState(false);

  const [pendingDice, setPendingDice] =
    useState<PendingDice | null>(null);

  const [
    resolvedEventView,
    setResolvedEventView,
  ] = useState<EventViewModel | null>(null);

  const [
    selectedChoiceId,
    setSelectedChoiceId,
  ] = useState<string | null>(null);

  const timerRef =
    useRef<number | null>(null);

  const translate: Translator = (key, params) =>
    t(key, locale, {
      playerName: session.gameState?.player.profile.name ?? '',
      ...npcInterpolationParams(
        session.gameState,
        catalog,
        (nameKey) => t(nameKey, locale),
      ),
      ...params,
    });

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(
          timerRef.current,
        );
      }
    },
    [],
  );

  const eventView =
    useMemo<EventViewModel | null>(() => {
      if (
        !session.gameState ||
        !session.currentEvent
      ) {
        return null;
      }

      const state = session.gameState;
      const sea = catalog.seas.find(
        ({ id }) =>
          id ===
          state.player.profile.originSeaId,
      );

      const choices =
        session.currentEvent.choices.flatMap(
          (
            choice,
          ): EventChoiceViewModel[] => {
            const choiceState =
              getChoiceState(
                choice,
                state,
                catalog,
              );

            if (!choiceState.visible) {
              return [];
            }

            const preview =
              choice.resolution.type === 'dice'
                ? getDicePreview(
                    choice.resolution,
                    state,
                    catalog,
                  )
                : null;

            return [
              {
                id: choice.id,
                label: translate(
                  choice.textKey,
                ),
                disabled:
                  !choiceState.available,
                requirement:
                  !choiceState.available
                    ? translate(
                        'ui.choice.conditionsUnmet',
                      )
                    : undefined,
                statChanges:
                  state.careerPhase ===
                  'origins'
                    ? originPreview(
                        choice,
                        catalog,
                        translate,
                      )
                    : undefined,
                textInput: choice.input
                  ? {
                      minLength:
                        choice.input
                          .minLength,
                      maxLength:
                        choice.input
                          .maxLength,
                      placeholder:
                        choice.input
                          .placeholderKey
                          ? translate(
                              choice.input
                                .placeholderKey,
                            )
                          : undefined,
                    }
                  : undefined,
                dice: preview?.available
                  ? {
                      statLabel:
                        translate(
                          STAT_KEYS[
                            preview.statId
                          ],
                        ),
                      successProbability:
                        preview.successProbability,
                      modifierTotal:
                        preview.knownModifierTotal +
                        preview.statModifier,
                    }
                  : undefined,
              },
            ];
          },
        );

      return {
        eyebrow: `${translate(
          `phase.${state.careerPhase}`,
        )}${
          sea
            ? ` · ${translate(
                sea.nameKey,
              )}`
            : ''
        }`,
        title: translate(
          session.currentEvent.titleKey,
        ),
        body: translate(
          session.currentEvent.textKey,
        ),
        choices,
      };
    }, [
      catalog,
      locale,
      session.currentEvent,
      session.gameState,
    ]);

  const outcomeView =
    useMemo<OutcomeViewModel | null>(() => {
      if (!session.lastResolution) {
        return null;
      }

      const dice =
        session.lastResolution.dice;

      return {
        body: translate(
          session.lastResolution.outcome
            .textKey,
        ),
        effects: transitionEffects(
          session.previousState,
          session.gameState,
          catalog,
          translate,
        ),
        dice: dice
          ? {
              statId: dice.statId,
              statLabel: translate(
                STAT_KEYS[dice.statId],
              ),
              rawRoll: dice.rawRoll,
              modifier:
                dice.modifierTotal,
              total: dice.total,
              result: dice.result,
              resultLabel: translate(
                RESULT_KEYS[dice.result],
              ),
            }
          : undefined,
      };
    }, [
      locale,
      session.gameState,
      session.lastResolution,
      session.previousState,
    ]);

  const clearResolvedEventUi = () => {
    setResolvedEventView(null);
    setSelectedChoiceId(null);
  };

  const selectChoice = (
    choice: EventChoiceViewModel,
    input?: string,
  ) => {
    if (
      choice.disabled ||
      pendingDice
    ) {
      return;
    }

    try {
      const runtimeChoice =
        session.currentEvent?.choices.find(
          ({ id }) => id === choice.id,
        );

      if (
        !runtimeChoice ||
        !session.gameState
      ) {
        throw new Error(
          'Cannot resolve Choice without a current Event.',
        );
      }

      setInputError(null);
      setResolvedEventView(eventView);
      setSelectedChoiceId(choice.id);

      if (
        runtimeChoice.resolution.type ===
        'dice'
      ) {
        const preview = getDicePreview(
          runtimeChoice.resolution,
          session.gameState,
          catalog,
        );

        if (!preview.available) {
          throw new Error(
            'DiceCheck is not currently available.',
          );
        }

        setPendingDice({
          status: 'armed',
          choiceId: choice.id,
          input,
          statId: preview.statId,
          modifierTotal:
            preview.knownModifierTotal +
            preview.statModifier,
        });

        return;
      }

      session.choose(
        choice.id,
        input,
      );

      setShowOutcome(true);
    } catch (error) {
      clearResolvedEventUi();

      console.error('[EventPreview] Choice resolution failed.', error);
      setInputError(translate('ui.choice.invalid'));
    }
  };

  const rollPendingDice = () => {
    if (
      !pendingDice ||
      pendingDice.status !== 'armed'
    ) {
      return;
    }

    try {
      const resolution =
        session.choose(
          pendingDice.choiceId,
          pendingDice.input,
        );

      if (!resolution?.dice) {
        throw new Error(
          'Expected a DiceCheck resolution.',
        );
      }

      setInputError(null);

      setPendingDice({
        ...pendingDice,
        status: 'rolling',
        statId:
          resolution.dice.statId,
        modifierTotal:
          resolution.dice.modifierTotal,
        dice: resolution.dice,
      });
    } catch (error) {
      setPendingDice(null);
      clearResolvedEventUi();

      console.error('[EventPreview] Choice resolution failed.', error);
      setInputError(translate('ui.choice.invalid'));
    }
  };

  const completeDiceRoll = () => {
    if (
      !pendingDice ||
      pendingDice.status !==
        'rolling' ||
      !pendingDice.dice
    ) {
      return;
    }

    setPendingDice({
      ...pendingDice,
      status:
        pendingDice.dice.result,
    });

    timerRef.current =
      window.setTimeout(() => {
        setShowOutcome(true);
        setPendingDice(null);
        timerRef.current = null;
      }, RESULT_HOLD_MS);
  };

  const continueFromOutcome = () => {
    setShowOutcome(false);
    setPendingDice(null);
    clearResolvedEventUi();
    session.continueAfterResolution();
  };

  const restartRun = () => {
    setShowOutcome(false);
    setPendingDice(null);
    setInputError(null);
    clearResolvedEventUi();
    session.restartRun();
  };

  const changeLocale = (
    next: LocaleId,
  ) => {
    saveLocale(storage, next);
    setLocale(next);
    notifyUiLocaleChanged(next);
  };

  if (!session.gameState) {
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <Panel
          variant="strong"
          className="max-w-lg text-center"
        >
          <h1 className="text-3xl font-bold text-gold">
            {translate(
              'ui.app.title',
            )}
          </h1>

          <p className="my-5 text-fg-secondary">
            {translate(
              'ui.newRun.prompt',
            )}
          </p>

          <Button
            size="lg"
            onClick={() =>
              session.startNewRun()
            }
          >
            {translate(
              'ui.action.newCareer',
            )}
          </Button>
        </Panel>
      </main>
    );
  }

  const state = session.gameState;

  const displayState =
    pendingDice &&
    session.previousState
      ? session.previousState
      : state;

  const displayPreviousState =
    pendingDice
      ? null
      : session.previousState;

  const statsRail = (
    <PlayerStatsRail
      state={displayState}
      previousState={
        displayPreviousState
      }
      statLabel={(id) =>
        translate(STAT_KEYS[id])
      }
      translate={translate}
      traitLabel={(id) => {
        const trait =
          catalog.traits.find(
            (entry) =>
              entry.id === id,
          );

        return trait
          ? translate(trait.nameKey)
          : id;
      }}
    />
  );

  const crewRail = (
    <CrewRail
      state={displayState}
      catalog={catalog}
      translate={translate}
      statLabel={(id) =>
        translate(
          NPC_STAT_KEYS[id],
        )
      }
    />
  );

  const outcomePresentationState =
    showOutcome && session.previousState
      ? session.previousState
      : null;

  const calendarAgeMonths =
    outcomePresentationState?.ageMonths ??
    displayState.ageMonths;

  const monthEventProgress =
    displayState.careerPhase === 'active'
      ? outcomePresentationState
        ? Math.min(
            2,
            outcomePresentationState.slotInMonth + 1,
          )
        : displayState.slotInMonth
      : 0;

  const hudProps = {
    state: displayState,
    catalog,
    translate,
    locale,
    calendarAgeMonths,
    monthEventProgress,
  };

  return (
    <main className="min-h-dvh w-full overflow-x-hidden overflow-y-auto pl-[max(var(--layout-gutter),var(--safe-area-left))] pr-[max(var(--layout-gutter),var(--safe-area-right))] pt-[max(var(--layout-gutter),var(--safe-area-top))] pb-[max(var(--layout-gutter),var(--safe-area-bottom))]">
      <div className="mx-auto w-full max-w-[78rem]">
        <div className="mb-3 flex items-center justify-end gap-3 px-1">
          <button
            className="text-xs text-fg-muted transition hover:text-fg-secondary"
            onClick={restartRun}
          >
            {translate(
              'ui.action.restartRun',
            )}
          </button>
        </div>

        <TopWorldHud {...hudProps} />

        <div className="relative mx-auto mt-4 w-full max-w-[52rem]">
          <div className="absolute right-[calc(100%+1rem)] top-0 z-10 hidden w-[14rem] justify-end xl:flex">
            {statsRail}
          </div>

          <div className="absolute left-[calc(100%+1rem)] top-0 z-10 hidden xl:block">
            {crewRail}
          </div>

          <AnimatePresence
            mode="wait"
            initial={false}
          >
            {showOutcome &&
            outcomeView ? (
              <motion.div
                key="adventure-panel"
                layout
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                transition={
                  PANEL_TRANSITION
                }
              >
                <OutcomePanel
                  outcome={outcomeView}
                  onContinue={
                    continueFromOutcome
                  }
                  translate={translate}
                />
              </motion.div>
            ) : pendingDice ? (
              <motion.div
                key="adventure-panel"
                layout
                className="opfg-adventure-stack"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={
                  PANEL_TRANSITION
                }
              >
                {resolvedEventView && (
                  <EventPanel
                    event={
                      resolvedEventView
                    }
                    onChoice={() => {}}
                    mode="collapsed"
                    selectedChoiceId={
                      selectedChoiceId
                    }
                  />
                )}

                <div
                  className="min-h-[14rem]"
                  aria-hidden="true"
                />
              </motion.div>
            ) : (
              <motion.div
                key="adventure-panel"
                layout
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                transition={
                  PANEL_TRANSITION
                }
              >
                {session
                  .navigationOptions
                  .length > 0 ? (
                  <NavigationPanel
                    travelState={
                      state.travelState
                    }
                    options={
                      session.navigationOptions
                    }
                    catalog={catalog}
                    translate={
                      translate
                    }
                    onChoice={
                      session.chooseNavigation
                    }
                  />
                ) : eventView ? (
                  <EventPanel
                    event={eventView}
                    onChoice={
                      selectChoice
                    }
                    error={
                      inputError
                    }
                  />
                ) : (
                  <Panel
                    variant="strong"
                    className="text-center"
                  >
                    {state.careerStatus ===
                    'ended'
                      ? translate(
                          'ui.careerComplete',
                        )
                      : translate(
                          'ui.noEvent',
                        )}
                  </Panel>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <MobileSideDrawers
        translate={translate}
        stats={statsRail}
        inventory={
          <InventoryHudPanel
            {...hudProps}
          />
        }
        crew={crewRail}
        ship={
          <ShipHudPanel
            {...hudProps}
          />
        }
      />

      <LanguageControls
        locale={locale}
        onLocaleChange={
          changeLocale
        }
      />

      <DiceTableStage
        translate={translate}
        visible={pendingDice !== null}
        status={
          pendingDice?.status ??
          'armed'
        }
        modifier={
          pendingDice?.dice
            ?.modifierTotal ??
          pendingDice?.modifierTotal ??
          0
        }
        statLabel={
          pendingDice
            ? translate(
                STAT_KEYS[
                  pendingDice.dice
                    ?.statId ??
                    pendingDice.statId
                ],
              )
            : undefined
        }
        result={
          pendingDice?.dice?.rawRoll
        }
        total={
          pendingDice?.dice?.total
        }
        rollKey={
          pendingDice?.dice
            ? `${pendingDice.dice.rawRoll}-${state.rngState}`
            : undefined
        }
        onRoll={rollPendingDice}
        onComplete={
          completeDiceRoll
        }
      />
    </main>
  );
}
