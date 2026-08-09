import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Badge, Button, Panel } from '@/components/ui';
import type { ChoiceDefinition, ContentCatalog, DiceResult, StatId } from '@/game/content/schema';
import { getChoiceState } from '@/game/engine/conditions';
import { getDicePreview, type DiceRollResult } from '@/game/engine/dice';
import type { StorageLike } from '@/game/engine/save';
import { loadLocale, saveLocale, supportedLocales, t, type LocaleId } from '@/game/localization';
import type { GameState, NpcStatId } from '@/game/model/schema';
import { useGameSession } from '@/game/session/useGameSession';
import { DiceTableStage, type DiceTableStageStatus } from '@/features/dice/DiceTableStage';
import { PlayerStatsRail } from './PlayerStatsRail';
import { TopWorldHud } from './TopWorldHud';
import { CrewRail } from './CrewRail';
import { EventPanel } from './EventPanel';
import { OutcomePanel } from './OutcomePanel';
import { NavigationPanel } from './NavigationPanel';
import { PowerStatus } from './PowerStatus';
import type { EventChoiceViewModel, EventViewModel, OutcomeEffectViewModel, OutcomeViewModel } from './types';
import './event-preview.css';

const STAT_KEYS: Record<keyof GameState['player']['stats'], string> = { health: 'stat.health', morale: 'stat.morale', strength: 'stat.strength', agility: 'stat.agility', observation: 'stat.observation', intelligence: 'stat.intelligence', navigation: 'stat.navigation', charisma: 'stat.charisma', luck: 'stat.luck' };
const NPC_STAT_KEYS: Record<NpcStatId, string> = { health: 'stat.health', morale: 'stat.morale', strength: 'stat.strength', observation: 'stat.observation', intelligence: 'stat.intelligence', luck: 'stat.luck', loyalty: 'npcStat.loyalty', calm: 'npcStat.calm' };
const RESULT_KEYS: Record<DiceResult, string> = { criticalFailure: 'dice.criticalFailure', failure: 'dice.failure', success: 'dice.success', criticalSuccess: 'dice.criticalSuccess' };
const PANEL_TRANSITION = { duration: 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };
const RESULT_HOLD_MS = 650;

interface PendingDice { status: DiceTableStageStatus; dice: DiceRollResult }

function originPreview(choice: ChoiceDefinition, catalog: ContentCatalog, translate: (key: string) => string): string[] {
  if (choice.resolution.type !== 'deterministic') return [];
  return choice.resolution.outcome.effects.flatMap((effect): string[] => {
    const format = (statId: keyof GameState['player']['stats'], value: number, absolute = false) => `${translate(STAT_KEYS[statId])} ${absolute ? value : `${value >= 0 ? '+' : ''}${value}`}`;
    if (effect.type === 'modifyStat') return [format(effect.statId, effect.amount)];
    if (effect.type === 'modifyHealth') return [format('health', effect.amount)];
    if (effect.type === 'setRace') {
      const race = catalog.races.find(({ id }) => id === effect.raceId);
      return race ? [format('health', race.initialHealth, true), ...Object.entries(race.attributeModifiers).map(([id, value]) => format(id as StatId, value))] : [];
    }
    const modifiers = effect.type === 'setFamilyStructure'
      ? catalog.familyStructures.find(({ id }) => id === effect.familyStructureId)?.attributeModifiers
      : effect.type === 'setSocialClass'
        ? catalog.socialClasses.find(({ id }) => id === effect.socialClassId)?.attributeModifiers
        : undefined;
    return Object.entries(modifiers ?? {}).map(([id, value]) => format(id as StatId, value));
  });
}

function transitionEffects(before: GameState | null, after: GameState | null, translate: (key: string) => string): OutcomeEffectViewModel[] {
  if (!before || !after) return [];
  const effects: OutcomeEffectViewModel[] = [];
  for (const statId of Object.keys(STAT_KEYS) as (keyof GameState['player']['stats'])[]) {
    const previous = before.player.stats[statId]; const next = after.player.stats[statId];
    if (typeof previous === 'number' && typeof next === 'number' && previous !== next) {
      const delta = next - previous;
      effects.push({ id: `stat-${statId}`, label: `${delta > 0 ? '+' : ''}${delta} ${translate(STAT_KEYS[statId])}`, tone: delta > 0 ? 'positive' : 'warning' });
    }
  }
  for (const traitId of after.player.traits.filter((id) => !before.player.traits.includes(id))) effects.push({ id: `trait-${traitId}`, label: `Trait : ${traitId}`, tone: 'positive' });
  return effects;
}

export interface EventPreviewProps { catalog: ContentCatalog; storage: StorageLike }

export function EventPreview({ catalog, storage }: EventPreviewProps) {
  const session = useGameSession(catalog, storage);
  const [locale, setLocale] = useState<LocaleId>(() => loadLocale(storage, navigator.language));
  const [inputError, setInputError] = useState<string | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [pendingDice, setPendingDice] = useState<PendingDice | null>(null);
  const timerRef = useRef<number | null>(null);
  const translate = (key: string) => t(key, locale, { playerName: session.gameState?.player.profile.name ?? '' });

  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); }, []);

  const eventView = useMemo<EventViewModel | null>(() => {
    if (!session.gameState || !session.currentEvent) return null;
    const state = session.gameState;
    const sea = catalog.seas.find(({ id }) => id === state.player.profile.originSeaId);
    const choices = session.currentEvent.choices.flatMap((choice): EventChoiceViewModel[] => {
      const choiceState = getChoiceState(choice, state, catalog);
      if (!choiceState.visible) return [];
      const preview = choice.resolution.type === 'dice' ? getDicePreview(choice.resolution, state, catalog) : null;
      return [{ id: choice.id, label: translate(choice.textKey), disabled: !choiceState.available, requirement: !choiceState.available ? 'Conditions non remplies' : undefined,
        statChanges: state.careerPhase === 'origins' ? originPreview(choice, catalog, translate) : undefined,
        textInput: choice.input ? { minLength: choice.input.minLength, maxLength: choice.input.maxLength, placeholder: choice.input.placeholderKey ? translate(choice.input.placeholderKey) : undefined } : undefined,
        dice: preview?.available ? { statLabel: translate(STAT_KEYS[preview.statId]), successProbability: preview.successProbability, modifierTotal: preview.knownModifierTotal + preview.statModifier } : undefined }];
    });
    return { eyebrow: `${translate(`phase.${state.careerPhase}`)}${sea ? ` Â· ${translate(sea.nameKey)}` : ''}`, title: translate(session.currentEvent.titleKey), body: translate(session.currentEvent.textKey), choices };
  }, [catalog, locale, session.currentEvent, session.gameState]);

  const outcomeView = useMemo<OutcomeViewModel | null>(() => {
    if (!session.lastResolution) return null;
    const dice = session.lastResolution.dice;
    return { body: translate(session.lastResolution.outcome.textKey), effects: transitionEffects(session.previousState, session.gameState, translate), dice: dice ? { statLabel: translate(STAT_KEYS[dice.statId]), rawRoll: dice.rawRoll, modifier: dice.modifierTotal, total: dice.total, resultLabel: translate(RESULT_KEYS[dice.result]) } : undefined };
  }, [locale, session.gameState, session.lastResolution, session.previousState]);

  const selectChoice = (choice: EventChoiceViewModel, input?: string) => {
    if (choice.disabled || pendingDice) return;
    try {
      const resolution = session.choose(choice.id, input);
      setInputError(null);
      if (resolution?.dice) setPendingDice({ status: 'armed', dice: resolution.dice });
      else setShowOutcome(true);
    } catch (error) { setInputError(error instanceof Error ? error.message : 'Choice invalide.'); }
  };
  const rollPendingDice = () => pendingDice?.status === 'armed' && setPendingDice({ ...pendingDice, status: 'rolling' });
  const completeDiceRoll = () => {
    if (!pendingDice || pendingDice.status !== 'rolling') return;
    setPendingDice({ ...pendingDice, status: pendingDice.dice.result });
    timerRef.current = window.setTimeout(() => { setShowOutcome(true); setPendingDice(null); timerRef.current = null; }, RESULT_HOLD_MS);
  };
  const continueFromOutcome = () => { setShowOutcome(false); setPendingDice(null); session.continueAfterResolution(); };
  const changeLocale = (next: LocaleId) => { saveLocale(storage, next); setLocale(next); };

  if (!session.gameState) return <main className="min-h-dvh grid place-items-center p-6"><Panel variant="strong" className="max-w-lg text-center"><h1 className="text-3xl font-bold text-gold">{translate('ui.app.title')}</h1><p className="my-5 text-fg-secondary">Commencez une nouvelle histoire.</p><Button size="lg" onClick={() => session.startNewRun()}>New Run</Button></Panel></main>;

  const state = session.gameState;
  return <main className="min-h-dvh w-full overflow-x-hidden overflow-y-auto pl-[max(var(--layout-gutter),var(--safe-area-left))] pr-[max(var(--layout-gutter),var(--safe-area-right))] pt-[max(var(--layout-gutter),var(--safe-area-top))] pb-[max(var(--layout-gutter),var(--safe-area-bottom))]">
    <div className="mx-auto w-full max-w-[78rem]">
      <div className="mb-3 flex items-center justify-between gap-3 px-1"><div className="flex gap-2">{supportedLocales.map((id) => <button key={id} className="text-xs text-fg-muted" disabled={locale === id} onClick={() => changeLocale(id)}>{id.toUpperCase()}</button>)}</div><button className="text-xs text-fg-muted" onClick={() => session.restartRun()}>Restart Run</button></div>
      <TopWorldHud state={state} catalog={catalog} translate={translate} />
      <PowerStatus state={state} catalog={catalog} translate={translate} />
      <div className="relative mx-auto mt-4 w-full max-w-[52rem]">
        <div className="absolute right-[calc(100%+1rem)] top-0 z-10 hidden w-[14rem] justify-end xl:flex"><PlayerStatsRail state={state} previousState={session.previousState} statLabel={(id) => translate(STAT_KEYS[id])} traitLabel={(id) => { const trait = catalog.traits.find((entry) => entry.id === id); return trait ? translate(trait.nameKey) : id; }} /></div>
        <div className="absolute left-[calc(100%+1rem)] top-0 z-10 hidden xl:block"><CrewRail state={state} catalog={catalog} translate={translate} statLabel={(id) => translate(NPC_STAT_KEYS[id])} /></div>
        <AnimatePresence mode="wait" initial={false}>{showOutcome && outcomeView ? <motion.div key="outcome" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={PANEL_TRANSITION}><OutcomePanel outcome={outcomeView} onContinue={continueFromOutcome} /></motion.div> : <motion.div key={session.navigationOptions.length > 0 ? 'navigation' : session.currentEvent?.id ?? 'no-event'} className={pendingDice ? 'pointer-events-none select-none' : ''} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={PANEL_TRANSITION}>{session.navigationOptions.length > 0 ? <NavigationPanel travelState={state.travelState} options={session.navigationOptions} translate={translate} onChoice={session.chooseNavigation} /> : eventView ? <EventPanel event={eventView} onChoice={selectChoice} error={inputError} /> : <Panel variant="strong" className="text-center">{state.careerStatus === 'ended' ? translate('ui.careerComplete') : translate('ui.noEvent')}</Panel>}</motion.div>}</AnimatePresence>
        <div className="mt-4 grid gap-3 xl:hidden"><PlayerStatsRail state={state} previousState={session.previousState} statLabel={(id) => translate(STAT_KEYS[id])} traitLabel={(id) => id} /><CrewRail state={state} catalog={catalog} translate={translate} statLabel={(id) => translate(NPC_STAT_KEYS[id])} /></div>
      </div>
    </div>
    <DiceTableStage visible={pendingDice !== null} status={pendingDice?.status ?? 'armed'} modifier={pendingDice?.dice.modifierTotal ?? 0} statLabel={pendingDice ? translate(STAT_KEYS[pendingDice.dice.statId]) : undefined} result={pendingDice?.dice.rawRoll} total={pendingDice?.dice.total} rollKey={pendingDice ? `${pendingDice.dice.rawRoll}-${state.rngState}` : undefined} onRoll={rollPendingDice} onComplete={completeDiceRoll} />
  </main>;
}
