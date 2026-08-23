import { useState } from 'react';
import { Panel, PanelBody, PanelHeader, PanelTitle } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import { getLocationDisplayName } from '@/game/engine/locations';
import type { MonthlyNavigationChoice, MonthlyNavigationOption } from '@/game/engine/navigation';
import { ChoiceButton } from './ChoiceButton';

interface NavigationPanelProps {
  travelState: 'at_sea' | 'on_land';
  options: MonthlyNavigationOption[];
  catalog: ContentCatalog;
  translate: (key: string) => string;
  onChoice: (choice: MonthlyNavigationChoice) => void;
}

export function NavigationPanel({
  travelState,
  options,
  catalog,
  translate,
  onChoice,
}: NavigationPanelProps) {
  const [choosingDestination, setChoosingDestination] = useState(false);
  const sailOptions = options.filter((option) => option.destinationId !== undefined);
  const staticOptions = options.filter((option) => option.destinationId === undefined);

  const staticLabel = (id: MonthlyNavigationChoice) => id === 'stay'
    ? translate(travelState === 'at_sea' ? 'ui.navigation.staySea' : 'ui.navigation.stayLand')
    : translate('ui.navigation.dock');

  const destinationLabel = (option: MonthlyNavigationOption) => {
    if (!option.destinationId) return option.id;
    return getLocationDisplayName(catalog, option.destinationId, translate);
  };

  const destinationTriggerLabel = travelState === 'at_sea'
    ? translate('ui.navigation.changeCourse')
    : translate('ui.navigation.goToSea');

  return <Panel variant="strong" padding="none" className="w-full overflow-hidden shadow-overlay">
    <PanelHeader className="mb-0 bg-gradient-to-b from-black/[0.38] to-black/[0.24] px-5 pb-3 pt-3 md:px-7 md:pb-3 md:pt-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold">{translate('ui.navigation.eyebrow')}</p>
      <PanelTitle className="text-xl md:text-2xl">
        {translate(choosingDestination ? 'ui.navigation.chooseDestination' : 'ui.navigation.title')}
      </PanelTitle>
    </PanelHeader>

    <PanelBody className="border-t border-[var(--border-subtle)] px-5 py-4 md:px-7">
      <p className="text-sm text-fg-secondary">{translate('ui.navigation.body')}</p>
    </PanelBody>

    <div className="border-t border-[var(--border-subtle)] bg-black/[0.08] px-3 py-3 md:px-4 md:py-4">
      <div className="flex flex-col gap-2.5">
        {choosingDestination ? (
          <>
            {sailOptions.map((option) => (
              <ChoiceButton
                key={option.id}
                choice={{
                  id: option.id,
                  label: destinationLabel(option),
                  disabled: !option.available,
                }}
                onSelect={() => onChoice(option.id)}
              />
            ))}
            <ChoiceButton
              choice={{ id: 'navigation-back', label: translate('ui.navigation.back') }}
              onSelect={() => setChoosingDestination(false)}
            />
          </>
        ) : (
          <>
            {staticOptions.map((option) => (
              <ChoiceButton
                key={option.id}
                choice={{
                  id: option.id,
                  label: staticLabel(option.id),
                  disabled: !option.available,
                  requirement: option.available ? undefined : translate('ui.navigation.dockingBlocked'),
                }}
                onSelect={() => onChoice(option.id)}
              />
            ))}
            <ChoiceButton
              choice={{
                id: 'navigation-destination',
                label: destinationTriggerLabel,
                disabled: !sailOptions.some((option) => option.available),
              }}
              onSelect={() => setChoosingDestination(true)}
            />
          </>
        )}
      </div>
    </div>
  </Panel>;
}
