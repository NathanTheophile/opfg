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
import { PLAYER_NAME_MAX_LENGTH } from '@/game/model/playerName';
import { useGameSession } from '@/game/session/useGameSession';
import { moveItem, resolveOverflow, type StorageSlot } from '@/game/engine/inventory';
import { useCrewRolePower } from '@/game/engine/crewPowers';
import { npcInterpolationParams } from '@/game/engine/npcNames';
import { originNarrativeInterpolationParams } from '@/game/engine/originNarrative';
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
  agility: 'stat.agility',
  navigation: 'stat.navigation',
  charisma: 'stat.charisma',
};

const RESULT_KEYS: Record<DiceResult, string> = {
  criticalFailure: 'dice.criticalFailure',
  failure: 'dice.failure',
  success: 'dice.success',
  criticalSuccess: 'dice.criticalSuccess',
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

function renderNarrativeBody(
  text: string,
  cast: readonly string[] | undefined,
  state: GameState,
  catalog: ContentCatalog,
  translate: Translator,
) {
  if (!cast || cast.length === 0) return text;

  const entities = cast
    .map((npcId) => {
      const definition = catalog.npcs.find(({ id }) => id === npcId);
      if (!definition) return null;

      const name =
        state.npcs[npcId]?.displayName ??
        translate(definition.nameKey);

      return {
        npcId,
        name,
        relation:
          npcId === 'player_parent_1' ||
          npcId === 'player_parent_2'
            ? translate('ui.npc.relation.parent')
            : null,
      };
    })
    .filter(
      (
        entity,
      ): entity is {
        npcId: string;
        name: string;
        relation: string | null;
      } => entity !== null && entity.name.length > 0,
    )
    .sort((a, b) => b.name.length - a.name.length);

  if (entities.length === 0) return text;

  const escaped = entities.map(({ name }) =>
    name.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\export interface EventPreviewProps {'),
  );

  const matcher = new RegExp(
    `(${escaped.join('|')})`,
    'g',
  );

  const byName = new Map(
    entities.map((entity) => [entity.name, entity]),
  );

  return (
    <>
      {text.split(matcher).map((part, index) => {
        const entity = byName.get(part);
        if (!entity) return part;

        return (
          <span
            key={`${entity.npcId}-${index}`}
            className="opfg-narrative-person"
          >
            <strong className="opfg-narrative-person__name">
              {entity.name}
            </strong>
            {entity.relation && (
              <span className="opfg-narrative-person__relation">
                {' '}({entity.relation})
              </span>
            )}
          </span>
        );
      })}
    </>
  );
}

export interface EventPreviewProps {
  catalog: ContentCatalog;
  storage: StorageLike;
  autoStartNewRun?: boolean;
}

export function EventPreview({
  catalog,
  storage,
  autoStartNewRun = false,
}: EventPreviewProps) {
  const session = useGameSession(
    catalog,
    storage,
  );

  const autoStartHandledRef = useRef(false);

  useEffect(() => {
    if (
      !autoStartNewRun ||
      autoStartHandledRef.current
    ) return;

    autoStartHandledRef.current = true;
    session.startNewRun();
  }, [autoStartNewRun, session.startNewRun]);

  const [locale, setLocale] =
    useState<LocaleId>(() =>
      loadLocale(
        storage,
        navigator.language,
      ),
    );

  const [inputError, setInputError] =
    useState<string | null>(null);

  const [homeOpen, setHomeOpen] =
    useState(false);

  const [showOutcome, setShowOutcome] =
    useState(false);

  const [
    outcomeRevealed,
    setOutcomeRevealed,
  ] = useState(false);

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
  const [selectedStorageSlot, setSelectedStorageSlot] = useState<StorageSlot | null>(null);
  const selectedStorageSlotRef = useRef<StorageSlot | null>(null);

  const adventureScrollRef =
    useRef<HTMLDivElement | null>(null);

  const translate: Translator = (key, params) =>
    t(key, locale, {
      playerName: session.gameState?.player.profile.name ?? '',
      ...originNarrativeInterpolationParams(
        session.gameState,
        catalog,
        (originKey, originParams) =>
          t(
            originKey,
            locale,
            originParams,
          ),
      ),
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
                label: translate(choice.textKey, choice.interpolation),
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
                        choice.input.target === 'playerName'
                          ? Math.min(choice.input.maxLength, PLAYER_NAME_MAX_LENGTH)
                          : choice.input.maxLength,
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
        title: translate(session.currentEvent.titleKey),
        body: renderNarrativeBody(
          translate(session.currentEvent.textKey, session.currentEvent.interpolation),
          session.currentEvent.cast,
          state,
          catalog,
          translate,
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

  useEffect(() => {
    if (!showOutcome || !outcomeView) {
      setOutcomeRevealed(false);
      return undefined;
    }

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

    const revealTimer =
      window.setTimeout(
        () => {
          setOutcomeRevealed(true);
        },
        reducedMotion ? 1 : 310,
      );

    return () =>
      window.clearTimeout(
        revealTimer,
      );
  }, [showOutcome, outcomeView]);

  useEffect(() => {
    if (!outcomeRevealed) {
      return undefined;
    }

    const scrollTimer =
      window.setTimeout(() => {
        const viewport =
          adventureScrollRef.current;
        if (!viewport) return;

        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior:
            window.matchMedia(
              '(prefers-reduced-motion: reduce)',
            ).matches
              ? 'auto'
              : 'smooth',
        });
      }, 80);

    return () =>
      window.clearTimeout(
        scrollTimer,
      );
  }, [outcomeRevealed]);

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
    adventureScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    setOutcomeRevealed(false);
    setShowOutcome(false);
    setPendingDice(null);
    clearResolvedEventUi();
    session.continueAfterResolution();
  };

  const restartRun = () => {
    setHomeOpen(false);
    setOutcomeRevealed(false);
    setShowOutcome(false);
    setPendingDice(null);
    setInputError(null);
    clearResolvedEventUi();
    session.restartRun();
  };

  const handleStorageSlot = (slot: StorageSlot) => {
    const source = selectedStorageSlotRef.current;
    if (!source) {
      selectedStorageSlotRef.current = slot;
      setSelectedStorageSlot(slot);
      return;
    }
    session.applySystemAction((next) => { moveItem(next, catalog, source, slot); });
    selectedStorageSlotRef.current = null;
    setSelectedStorageSlot(null);
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

  if (homeOpen) {
    return (
      <main className="min-h-dvh grid place-items-center p-4 sm:p-6">
        <Panel
          variant="strong"
          className="w-full max-w-lg text-center"
        >
          <h1 className="text-3xl font-bold text-gold">
            {translate('ui.app.title')}
          </h1>

          <p className="my-5 text-fg-secondary">
            {translate('ui.newRun.prompt')}
          </p>

          <Button size="lg" onClick={() => setHomeOpen(false)}>
            {translate('ui.action.close')}
          </Button>
        </Panel>
      </main>
    );
  }

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
      catalog={catalog}
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
      onUseRolePower={(roleId, destinationId) => session.applySystemAction((next) => useCrewRolePower(next, catalog, roleId, destinationId))}
    />
  );

  const outcomePresentationState =
    showOutcome && session.previousState
      ? session.previousState
      : null;

  const calendarAgeMonths =
    outcomePresentationState?.ageMonths ??
    displayState.ageMonths;

  const hudProps = {
    state: displayState,
    catalog,
    translate,
    locale,
    calendarAgeMonths,
    selectedStorageSlot,
    onStorageSlot: handleStorageSlot,
    onHome: () => setHomeOpen(true),
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

          <div
            ref={adventureScrollRef}
            className="opfg-adventure-scroll"
          >
            <motion.div
              className="opfg-adventure-size-shell"
            >
              <div
                className={
                  showOutcome || pendingDice
                    ? 'opfg-adventure-stack'
                    : undefined
                }
              >
                  {state.pendingOverflow ? (
                    <Panel variant="strong" className="opfg-overflow-panel" aria-label={translate('ui.overflow.title')}>
                      <h2>{translate('ui.overflow.title')}</h2>
                      <p>{translate('ui.overflow.description')}</p>
                      {[...state.player.inventory.stacks.map((stack, index) => ({ stack, storage: 'pocket' as const, index })), ...(state.ship?.cargo ?? []).map((stack, index) => ({ stack, storage: 'cargo' as const, index }))].map(({ stack, storage, index }) => {
                        const definition = catalog.items.find(({ id }) => id === stack.itemId);
                        return <Button key={`${storage}-${index}`} onClick={() => session.applySystemAction((next) => resolveOverflow(next, catalog, { type: 'discardStored', storage, index }))}>
                          {translate('ui.overflow.replace', { item: definition ? translate(definition.nameKey) : stack.itemId })}
                        </Button>;
                      })}
                      {!state.pendingOverflow.mandatory && <Button onClick={() => session.applySystemAction((next) => resolveOverflow(next, catalog, { type: 'abandonIncoming' }))}>{translate('ui.overflow.abandon')}</Button>}
                    </Panel>
                  ) : showOutcome && outcomeView ? (
                    <>
                      {resolvedEventView && (
                        <EventPanel
                          event={resolvedEventView}
                          onChoice={() => {}}
                          mode="resolved"
                          selectedChoiceId={selectedChoiceId}
                        />
                      )}

                      <AnimatePresence
                        initial={false}
                      >
                        {outcomeRevealed && (
                          <motion.div
                            key="outcome"
                            initial={{
                              opacity: 0,
                              y: -4,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                            }}
                            transition={{
                              duration: 0.16,
                              ease: [
                                0.16,
                                1,
                                0.3,
                                1,
                              ],
                            }}
                          >
                            <OutcomePanel
                              outcome={outcomeView}
                              onContinue={continueFromOutcome}
                              translate={translate}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : pendingDice ? (
                    <>
                      {resolvedEventView && (
                        <EventPanel
                          event={resolvedEventView}
                          onChoice={() => {}}
                          mode="collapsed"
                          selectedChoiceId={selectedChoiceId}
                        />
                      )}

                      <div
                        className="min-h-[14rem]"
                        aria-hidden="true"
                      />
                    </>
                  ) : session.navigationOptions.length > 0 ? (
                    <NavigationPanel
                      travelState={state.travelState}
                      options={session.navigationOptions}
                      catalog={catalog}
                      translate={translate}
                      onChoice={session.chooseNavigation}
                    />
                  ) : eventView ? (
                    <EventPanel
                      event={eventView}
                      onChoice={selectChoice}
                      error={inputError}
                    />
                  ) : (
                    <Panel
                      variant="strong"
                      className="text-center"
                    >
                      {state.careerStatus === 'ended'
                        ? translate('ui.careerComplete')
                        : translate('ui.noEvent')}
                    </Panel>
                  )}
              </div>
            </motion.div>
          </div>
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
