import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Badge } from '@/components/ui';
import { rollD20 } from '@/game/engine/dice';
import { DiceTableStage, type DiceTableStageStatus } from '@/features/dice/DiceTableStage';
import { PlayerStatsRail } from './PlayerStatsRail';
import { TopWorldHud } from './TopWorldHud';
import { CrewRail } from './CrewRail';
import { EventPanel } from './EventPanel';
import { OutcomePanel } from './OutcomePanel';
import type { EventChoiceViewModel, EventViewModel, OutcomeViewModel } from './types';
import './event-preview.css';

const MOCK_EVENT: EventViewModel = {
  eyebrow: 'Enfance · East Blue',
  title: 'La table des vieux loups de mer',
  body:
    "La taverne est presque vide lorsque trois marins s'installent près de vous. Ils parlent bas, mais quelques mots traversent le bruit de la pluie : une crique isolée, une cargaison abandonnée et une carte qu'aucun d'eux ne semble vouloir montrer aux autres.",
  choices: [
    {
      id: 'listen',
      label: 'Rester en retrait et écouter leur conversation.',
    },
    {
      id: 'observe',
      label: 'Observer discrètement celui qui garde la main sur sa poche.',
      dice: {
        statLabel: 'Observation',
        successProbability: 0.64,
        modifierTotal: 2,
      },
    },
    {
      id: 'crew-only',
      label: "Leur proposer directement vos services pour l'expédition.",
      disabled: true,
      requirement: 'Requiert le Trait : Marin aguerri',
    },
  ],
};

const MOCK_OUTCOMES: Record<string, OutcomeViewModel> = {
  listen: {
    title: 'Des mots qui valent de l’or',
    body:
      "Vous ne bougez pas. À force de patience, les fragments finissent par former une histoire cohérente : la cargaison existe bel et bien, et l'un des marins compte partir avant l'aube sans prévenir les deux autres. Vous mémorisez le nom de la crique.",
    effects: [
      { id: 'observation', label: '+2 Observation', tone: 'positive' },
      { id: 'lead', label: 'Nouvelle piste mémorisée', tone: 'default' },
    ],
  },
  observe: {
    title: 'Un détail révélateur',
    body:
      "Votre regard s'attarde sur ses gestes plutôt que sur ses paroles. La poche qu'il protège ne contient pas de pièces : le papier rigide qui dépasse un instant ressemble beaucoup trop à un morceau de carte marine pour être une coïncidence.",
    effects: [
      { id: 'observation', label: '+2 Observation', tone: 'positive' },
      { id: 'lead', label: 'Fragment de carte repéré', tone: 'default' },
    ],
  },
};

const MOCK_FAILURE_OUTCOME: OutcomeViewModel = {
  title: 'Un regard de trop',
  body:
    "Vous insistez une seconde de trop. Le marin rabat aussitôt sa veste sur sa poche et balaie la salle du regard. Vous n'avez pas pu distinguer ce qu'il cachait, et il se montre désormais beaucoup plus prudent.",
  effects: [
    { id: 'dice-failure', label: 'Échec du DiceCheck', tone: 'warning' },
  ],
};

const PANEL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const PANEL_TRANSITION = { duration: 0.28, ease: PANEL_EASE };
const RESULT_HOLD_MS = 820;

type ResolvedDiceStatus = Extract<
  DiceTableStageStatus,
  'success' | 'failure' | 'criticalSuccess' | 'criticalFailure'
>;

interface PendingDice {
  choice: EventChoiceViewModel;
  status: DiceTableStageStatus;
  modifier: number;
  result?: number;
  rollKey?: number;
}

function resolveMockDiceStatus(result: number, successProbability: number): ResolvedDiceStatus {
  if (result === 1) return 'criticalFailure';
  if (result === 20) return 'criticalSuccess';

  const successfulFaces = Math.max(0, Math.min(20, Math.round(successProbability * 20)));
  const threshold = 21 - successfulFaces;
  return result >= threshold ? 'success' : 'failure';
}

function outcomeForDiceStatus(status: ResolvedDiceStatus): OutcomeViewModel {
  if (status === 'failure' || status === 'criticalFailure') {
    return {
      ...MOCK_FAILURE_OUTCOME,
      effects: [
        {
          id: 'dice-result',
          label: status === 'criticalFailure' ? 'Échec critique' : 'Échec',
          tone: status === 'criticalFailure' ? 'critical' : 'warning',
        },
        ...(MOCK_FAILURE_OUTCOME.effects ?? []),
      ],
    };
  }

  const successOutcome = MOCK_OUTCOMES.observe;
  return {
    ...successOutcome,
    effects: [
      {
        id: 'dice-result',
        label: status === 'criticalSuccess' ? 'Réussite critique' : 'Réussite',
        tone: 'positive',
      },
      ...(successOutcome.effects ?? []),
    ],
  };
}

export function EventPreview() {
  const [outcome, setOutcome] = useState<OutcomeViewModel | null>(null);
  const [previewRngState, setPreviewRngState] = useState(0x0f6a2d91);
  const [pendingDice, setPendingDice] = useState<PendingDice | null>(null);
  const resolutionTimerRef = useRef<number | null>(null);
  const eventMeasureRef = useRef<HTMLDivElement | null>(null);
  const [eventExpandedHeight, setEventExpandedHeight] = useState<number | null>(null);
  const [eventHeaderHeight, setEventHeaderHeight] = useState(104);

  useEffect(() => {
    return () => {
      if (resolutionTimerRef.current !== null) {
        window.clearTimeout(resolutionTimerRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const node = eventMeasureRef.current;
    if (!node) return;

    const measure = () => {
      const fullHeight = Math.ceil(node.getBoundingClientRect().height);
      if (fullHeight > 0) setEventExpandedHeight(fullHeight);

      const panel = node.querySelector(':scope > section');
      const header = panel?.firstElementChild as HTMLElement | null;
      const divider = header?.nextElementSibling as HTMLElement | null;

      if (header) {
        const measuredHeaderHeight =
          Math.ceil(header.getBoundingClientRect().height) +
          Math.ceil(divider?.getBoundingClientRect().height ?? 1);

        setEventHeaderHeight(Math.max(72, measuredHeaderHeight));
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const selectChoice = (choice: EventChoiceViewModel) => {
    if (choice.disabled || pendingDice) return;

    if (choice.dice) {
      setPendingDice({
        choice,
        status: 'armed',
        modifier: choice.dice.modifierTotal ?? 0,
      });
      return;
    }

    setOutcome(MOCK_OUTCOMES[choice.id] ?? MOCK_OUTCOMES.listen);
  };

  const rollPendingDice = () => {
    if (!pendingDice || pendingDice.status !== 'armed') return;

    const roll = rollD20(previewRngState);
    setPreviewRngState(roll.nextRngState);
    setPendingDice({
      ...pendingDice,
      status: 'rolling',
      result: roll.rawRoll,
      rollKey: roll.nextRngState,
    });
  };

  const completeDiceRoll = () => {
    if (
      !pendingDice ||
      pendingDice.status !== 'rolling' ||
      pendingDice.result === undefined ||
      !pendingDice.choice.dice
    ) {
      return;
    }

    const resolvedStatus = resolveMockDiceStatus(
      pendingDice.result,
      pendingDice.choice.dice.successProbability,
    );

    setPendingDice({
      ...pendingDice,
      status: resolvedStatus,
    });

    const resolvedOutcome = outcomeForDiceStatus(resolvedStatus);

    resolutionTimerRef.current = window.setTimeout(() => {
      setOutcome(resolvedOutcome);
      setPendingDice(null);
      resolutionTimerRef.current = null;
    }, RESULT_HOLD_MS);
  };

  const continueFromOutcome = () => {
    setOutcome(null);
    setPendingDice(null);
  };

  const showDice = pendingDice !== null;

  return (
    <main className="min-h-dvh w-full overflow-x-hidden overflow-y-auto pl-[max(var(--layout-gutter),var(--safe-area-left))] pr-[max(var(--layout-gutter),var(--safe-area-right))] pt-[max(var(--layout-gutter),var(--safe-area-top))] pb-[max(var(--layout-gutter),var(--safe-area-bottom))]">
      <div className="mx-auto w-full max-w-[78rem]">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <Badge variant="default" className="bg-surface-strong shadow-control">
            UI Preview
          </Badge>
          <span className="text-xs font-medium text-fg-muted">
            Mock HUD · world / ship / crew
          </span>
        </div>

        <TopWorldHud />

        <div className="relative mx-auto mt-4 w-full max-w-[52rem]">
          <div className="absolute right-[calc(100%+1rem)] top-0 z-10 hidden w-[14rem] justify-end xl:flex">
            <PlayerStatsRail />
          </div>

          <div className="absolute left-[calc(100%+1rem)] top-0 z-10 hidden xl:block">
            <CrewRail />
          </div>

          <div className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              {outcome ? (
                <motion.div
                  key="outcome"
                  initial={{ opacity: 0, y: 12, scale: 0.992 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.996 }}
                  transition={PANEL_TRANSITION}
                >
                  <OutcomePanel outcome={outcome} onContinue={continueFromOutcome} />
                </motion.div>
              ) : (
                <motion.div
                  key="event"
                  className={`relative rounded-[var(--radius-panel)] ${
                    pendingDice ? 'pointer-events-none select-none' : ''
                  }`}
                  initial={{ opacity: 0, y: 12, scale: 0.992 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    height: pendingDice
                      ? eventHeaderHeight
                      : eventExpandedHeight ?? 'auto',
                  }}
                  exit={{ opacity: 0, y: -8, scale: 0.996 }}
                  transition={{
                    opacity: PANEL_TRANSITION,
                    y: PANEL_TRANSITION,
                    scale: PANEL_TRANSITION,
                    height: { duration: 0.42, ease: PANEL_EASE },
                  }}
                  style={{ overflow: 'hidden' }}
                >
                  <div ref={eventMeasureRef}>
                    <EventPanel event={MOCK_EVENT} onChoice={selectChoice} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 grid gap-3 xl:hidden">
            <PlayerStatsRail />
            <CrewRail />
          </div>

        </div>
      </div>

      <DiceTableStage
        visible={showDice}
        status={pendingDice?.status ?? 'armed'}
        modifier={pendingDice?.modifier ?? 0}
        statLabel={pendingDice?.choice.dice?.statLabel}
        result={pendingDice?.result}
        rollKey={pendingDice?.rollKey}
        onRoll={rollPendingDice}
        onComplete={completeDiceRoll}
      />
    </main>
  );
}
