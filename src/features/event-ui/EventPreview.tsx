import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Badge } from '@/components/ui';
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
      { id: 'dice-note', label: 'Résultat DiceCheck mocké pour la preview', tone: 'warning' },
      { id: 'observation', label: '+2 Observation', tone: 'positive' },
    ],
  },
};

const PANEL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const PANEL_TRANSITION = { duration: 0.28, ease: PANEL_EASE };

export function EventPreview() {
  const [outcome, setOutcome] = useState<OutcomeViewModel | null>(null);

  const selectChoice = (choice: EventChoiceViewModel) => {
    if (choice.disabled) return;
    setOutcome(MOCK_OUTCOMES[choice.id] ?? MOCK_OUTCOMES.listen);
  };

  return (
    <main className="flex min-h-dvh w-full items-center justify-center overflow-y-auto pl-[max(var(--layout-gutter),var(--safe-area-left))] pr-[max(var(--layout-gutter),var(--safe-area-right))] pt-[max(var(--layout-gutter),var(--safe-area-top))] pb-[max(var(--layout-gutter),var(--safe-area-bottom))]">
      <div className="w-full max-w-[52rem]">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <Badge variant="default" className="bg-surface-strong shadow-control">
              UI Preview
            </Badge>
            <span className="text-xs font-medium text-fg-muted">Mock data · moteur non branché</span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {outcome ? (
              <motion.div
                key="outcome"
                initial={{ opacity: 0, y: 12, scale: 0.992 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.996 }}
                transition={PANEL_TRANSITION}
              >
                <OutcomePanel outcome={outcome} onContinue={() => setOutcome(null)} />
              </motion.div>
            ) : (
              <motion.div
                key="event"
                initial={{ opacity: 0, y: 12, scale: 0.992 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.996 }}
                transition={PANEL_TRANSITION}
              >
                <EventPanel event={MOCK_EVENT} onChoice={selectChoice} />
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </main>
  );
}
