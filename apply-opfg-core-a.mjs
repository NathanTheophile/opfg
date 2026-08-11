import fs from 'node:fs';
import { execSync } from 'node:child_process';

const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
if (branch !== 'dev') {
  throw new Error(`Ce patch doit être appliqué sur la branche dev (branche actuelle: ${branch || '<detached>'}).`);
}

const edits = new Map();

function load(path) {
  if (edits.has(path)) return edits.get(path);
  const raw = fs.readFileSync(path, 'utf8');
  const bom = raw.startsWith('\uFEFF');
  const body = bom ? raw.slice(1) : raw;
  const eol = body.includes('\r\n') ? '\r\n' : '\n';
  const file = { path, text: body.replace(/\r\n/g, '\n'), eol, bom };
  edits.set(path, file);
  return file;
}

function replaceExact(path, before, after, label) {
  const file = load(path);
  const count = file.text.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`${path}: cible "${label}" attendue 1 fois, trouvée ${count}. Aucun fichier n'a été écrit.`);
  }
  file.text = file.text.replace(before, after);
}

function replaceRegexOnce(path, regex, replacement, label) {
  const file = load(path);
  const matches = [...file.text.matchAll(new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g'))];
  if (matches.length !== 1) {
    throw new Error(`${path}: cible regex "${label}" attendue 1 fois, trouvée ${matches.length}. Aucun fichier n'a été écrit.`);
  }
  file.text = file.text.replace(regex, replacement);
}

function replaceWhole(path, expected, next, label) {
  const file = load(path);
  if (file.text.trim() !== expected.trim()) {
    throw new Error(`${path}: le fichier local diffère de la version dev attendue (${label}). Aucun fichier n'a été écrit.`);
  }
  file.text = next.endsWith('\n') ? next : next + '\n';
}

function addLocaleKeys(path, values) {
  const file = load(path);
  if (file.text.includes('"ui.navigation.changeCourse"')) return;
  const regex = /^(\s*)"ui\.navigation\.goToSea"\s*:\s*"[^"\n]*(?:\\"[^"\n]*)*",?\s*$/m;
  const match = file.text.match(regex);
  if (!match) {
    throw new Error(`${path}: clé ui.navigation.goToSea introuvable. Aucun fichier n'a été écrit.`);
  }
  const indent = match[1];
  const original = match[0].replace(/,\s*$/, '');
  const insertion = [
    `${original},`,
    `${indent}"ui.navigation.changeCourse": ${JSON.stringify(values.changeCourse)},`,
    `${indent}"ui.navigation.chooseDestination": ${JSON.stringify(values.chooseDestination)},`,
    `${indent}"ui.navigation.back": ${JSON.stringify(values.back)},`,
  ].join('\n');
  file.text = file.text.replace(match[0], insertion);
}

// -----------------------------------------------------------------------------
// 1) Active: one root Event per month.
// -----------------------------------------------------------------------------
replaceExact(
  'src/game/engine/time.ts',
`  return state.slotInMonth === 0
    ? { ...state, slotInMonth: 1 }
    : { ...advanceAge(state, state.ageMonths + 1, catalog), slotInMonth: 0 };`,
`  return { ...advanceAge(state, state.ageMonths + 1, catalog), slotInMonth: 0 };`,
  'Active two-slot cadence',
);

// -----------------------------------------------------------------------------
// 2) Real navigation: reusable destination helper + destination choices.
// -----------------------------------------------------------------------------
replaceExact(
  'src/game/engine/locations.ts',
  `import type { GameState, LocationId, TravelState } from '../model/schema';`,
  `import type { GameState, LocationId, SeaId, TravelState } from '../model/schema';`,
  'locations SeaId import',
);

replaceExact(
  'src/game/engine/locations.ts',
`export function findDockableAccess(catalog: ContentCatalog, locationId: LocationId): LocationDefinition | undefined {
  const current = findLocation(catalog, locationId);
  return [current, ...getLocationAncestors(catalog, locationId)].find((location) => location?.allowsDocking);
}
`,
`export function findDockableAccess(catalog: ContentCatalog, locationId: LocationId): LocationDefinition | undefined {
  const current = findLocation(catalog, locationId);
  return [current, ...getLocationAncestors(catalog, locationId)].find((location) => location?.allowsDocking);
}

const PLAYER_DIRECT_NAVIGATION_SEAS = new Set<SeaId>([
  'east_blue',
  'west_blue',
  'north_blue',
  'south_blue',
  'grand_line_paradise',
]);

export function getNavigableDestinationIds(currentId: LocationId, catalog: ContentCatalog): LocationId[] {
  const current = findLocation(catalog, currentId);
  if (!current || !PLAYER_DIRECT_NAVIGATION_SEAS.has(current.seaId)) return [];

  return fallbackDestinationIds(currentId, catalog)
    .filter((id) => {
      const destination = findLocation(catalog, id);
      return destination !== undefined && destination.islandId !== current.islandId;
    });
}
`,
  'navigation destination helper insertion point',
);

const oldNavigation = `import type { ContentCatalog } from '../content/schema';
import type { GameState } from '../model/schema';
import { findDockableAccess } from './locations';

export type MonthlyNavigationChoice = 'stay' | 'goToSea' | 'dock';

export interface MonthlyNavigationOption {
  id: MonthlyNavigationChoice;
  available: boolean;
}

export function needsMonthlyNavigationDecision(state: GameState): boolean {
  return state.careerStatus === 'active'
    && state.careerPhase === 'active'
    && state.slotInMonth === 0
    && state.pendingSlotPhase === null
    && state.immediateEventQueue.length === 0
    && state.isLeader
    && state.ship !== null
    && state.navigationDecisionAgeMonths !== state.ageMonths;
}

export function getMonthlyNavigationOptions(state: GameState, catalog: ContentCatalog): MonthlyNavigationOption[] {
  if (!needsMonthlyNavigationDecision(state)) return [];
  if (state.travelState === 'on_land') return [
    { id: 'stay', available: true },
    { id: 'goToSea', available: findDockableAccess(catalog, state.locationId) !== undefined },
  ];
  const location = catalog.locations.find(({ id }) => id === state.locationId);
  return [
    { id: 'stay', available: true },
    { id: 'dock', available: location?.allowsDocking === true },
  ];
}

export function applyMonthlyNavigationChoice(state: GameState, catalog: ContentCatalog, choice: MonthlyNavigationChoice): GameState {
  const option = getMonthlyNavigationOptions(state, catalog).find(({ id }) => id === choice);
  if (!option?.available) throw new Error(\`Monthly navigation choice "\${choice}" is not available.\`);
  const travelState = choice === 'goToSea' ? 'at_sea' : choice === 'dock' ? 'on_land' : state.travelState;
  return { ...state, travelState, navigationDecisionAgeMonths: state.ageMonths, currentEventId: null };
}
`;

const newNavigation = `import type { ContentCatalog } from '../content/schema';
import type { GameState, LocationId } from '../model/schema';
import {
  findDockableAccess,
  findLocation,
  getNavigableDestinationIds,
  movePlayerToLocation,
} from './locations';

export type MonthlyNavigationChoice = 'stay' | 'dock' | \`sailTo:\${LocationId}\`;

export interface MonthlyNavigationOption {
  id: MonthlyNavigationChoice;
  available: boolean;
  destinationId?: LocationId;
}

export function needsMonthlyNavigationDecision(state: GameState): boolean {
  return state.careerStatus === 'active'
    && state.careerPhase === 'active'
    && state.slotInMonth === 0
    && state.pendingSlotPhase === null
    && state.immediateEventQueue.length === 0
    && state.isLeader
    && state.ship !== null
    && state.navigationDecisionAgeMonths !== state.ageMonths;
}

export function getMonthlyNavigationOptions(state: GameState, catalog: ContentCatalog): MonthlyNavigationOption[] {
  if (!needsMonthlyNavigationDecision(state)) return [];

  const canDepart = state.travelState === 'at_sea'
    || findDockableAccess(catalog, state.locationId) !== undefined;

  const sailOptions: MonthlyNavigationOption[] = getNavigableDestinationIds(state.locationId, catalog)
    .map((destinationId) => ({
      id: \`sailTo:\${destinationId}\` as MonthlyNavigationChoice,
      available: canDepart,
      destinationId,
    }));

  if (state.travelState === 'on_land') {
    return [
      { id: 'stay', available: true },
      ...sailOptions,
    ];
  }

  const location = findLocation(catalog, state.locationId);
  return [
    { id: 'stay', available: true },
    { id: 'dock', available: location?.allowsDocking === true },
    ...sailOptions,
  ];
}

export function applyMonthlyNavigationChoice(
  state: GameState,
  catalog: ContentCatalog,
  choice: MonthlyNavigationChoice,
): GameState {
  const option = getMonthlyNavigationOptions(state, catalog).find(({ id }) => id === choice);
  if (!option?.available) throw new Error(\`Monthly navigation choice "\${choice}" is not available.\`);

  const next: GameState = {
    ...state,
    navigationDecisionAgeMonths: state.ageMonths,
    currentEventId: null,
  };

  if (option.destinationId) {
    movePlayerToLocation(next, option.destinationId, 'at_sea');
    return next;
  }

  if (choice === 'dock') {
    next.travelState = 'on_land';
  }

  return next;
}
`;

replaceWhole('src/game/engine/navigation.ts', oldNavigation, newNavigation, 'monthly navigation v17');

// -----------------------------------------------------------------------------
// 3) Navigation UI: two-step destination choice without persisting UI state.
// -----------------------------------------------------------------------------
const oldNavigationPanel = `import { Panel, PanelBody, PanelHeader, PanelTitle } from '@/components/ui';
import type { MonthlyNavigationChoice, MonthlyNavigationOption } from '@/game/engine/navigation';
import { ChoiceButton } from './ChoiceButton';

interface NavigationPanelProps {
  travelState: 'at_sea' | 'on_land';
  options: MonthlyNavigationOption[];
  translate: (key: string) => string;
  onChoice: (choice: MonthlyNavigationChoice) => void;
}

export function NavigationPanel({ travelState, options, translate, onChoice }: NavigationPanelProps) {
  const label = (id: MonthlyNavigationChoice) => id === 'stay'
    ? translate(travelState === 'at_sea' ? 'ui.navigation.staySea' : 'ui.navigation.stayLand')
    : translate(id === 'goToSea' ? 'ui.navigation.goToSea' : 'ui.navigation.dock');
  return <Panel variant="strong" padding="none" className="w-full overflow-hidden shadow-overlay">
    <PanelHeader className="mb-0 bg-gradient-to-b from-black/[0.38] to-black/[0.24] px-5 pb-3 pt-3 md:px-7 md:pb-3 md:pt-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold">{translate('ui.navigation.eyebrow')}</p>
      <PanelTitle className="text-xl md:text-2xl">{translate('ui.navigation.title')}</PanelTitle>
    </PanelHeader>
    <PanelBody className="border-t border-[var(--border-subtle)] px-5 py-4 md:px-7"><p className="text-sm text-fg-secondary">{translate('ui.navigation.body')}</p></PanelBody>
    <div className="border-t border-[var(--border-subtle)] bg-black/[0.08] px-3 py-3 md:px-4 md:py-4">
      <div className="flex flex-col gap-2.5">{options.map((option) => <ChoiceButton key={option.id} choice={{ id: option.id, label: label(option.id), disabled: !option.available, requirement: option.available ? undefined : translate('ui.navigation.dockingBlocked') }} onSelect={() => onChoice(option.id)} />)}</div>
    </div>
  </Panel>;
}
`;

const newNavigationPanel = `import { useState } from 'react';
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
`;

replaceWhole(
  'src/features/event-ui/NavigationPanel.tsx',
  oldNavigationPanel,
  newNavigationPanel,
  'NavigationPanel destination picker',
);

// EventPreview: pass catalog and keep a stable motion wrapper/key across content changes.
replaceExact(
  'src/features/event-ui/EventPreview.tsx',
`                  <NavigationPanel
                    travelState={
                      state.travelState
                    }
                    options={
                      session.navigationOptions
                    }
                    translate={
                      translate
                    }`,
`                  <NavigationPanel
                    travelState={
                      state.travelState
                    }
                    options={
                      session.navigationOptions
                    }
                    catalog={catalog}
                    translate={
                      translate
                    }`,
  'NavigationPanel catalog prop',
);

replaceExact(
  'src/features/event-ui/EventPreview.tsx',
`                key="event-outcome"
                initial={{`,
`                key="adventure-panel"
                layout
                initial={{`,
  'persistent outcome wrapper',
);

replaceExact(
  'src/features/event-ui/EventPreview.tsx',
`                key="dice-pending"
                className="opfg-adventure-stack"`,
`                key="adventure-panel"
                layout
                className="opfg-adventure-stack"`,
  'persistent dice wrapper',
);

replaceExact(
  'src/features/event-ui/EventPreview.tsx',
`                key={
                  session.navigationOptions
                    .length > 0
                    ? 'navigation'
                    : session
                        .currentEvent
                        ?.id ??
                      'no-event'
                }
                initial={{`,
`                key="adventure-panel"
                layout
                initial={{`,
  'persistent event/navigation wrapper',
);

// HUD: one monthly root slot.
replaceExact(
  'src/features/event-ui/TopWorldHud.tsx',
`const MONTH_EVENT_SLOTS = 2;`,
`const MONTH_EVENT_SLOTS = 1;`,
  'monthly HUD slot count',
);

replaceExact(
  'src/features/event-ui/TopWorldHud.tsx',
`   * Number of resolved normal/scheduled Events to show in the current
   * monthly two-slot progress indicator: 0, 1 or 2.`,
`   * Number of resolved root Events to show in the current
   * monthly one-slot progress indicator: 0 or 1.`,
  'monthly HUD slot documentation',
);

// Locales for navigation UI.
addLocaleKeys('src/game/localization/locales/fr.json', {
  changeCourse: 'Changer de cap',
  chooseDestination: 'Choisir une destination',
  back: 'Retour',
});
addLocaleKeys('src/game/localization/locales/en.json', {
  changeCourse: 'Change course',
  chooseDestination: 'Choose a destination',
  back: 'Back',
});

// -----------------------------------------------------------------------------
// Tests adjusted to one-slot cadence and destination navigation.
// -----------------------------------------------------------------------------
const oldMonthlyNavigationTest = `import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { applyMonthlyNavigationChoice, getMonthlyNavigationOptions, needsMonthlyNavigationDecision } from '../src/game/engine/navigation';
import { deserializeGameState, serializeGameState } from '../src/game/engine/save';
import { createInitialGameState } from '../src/game/model/initialState';

const activeState = () => {
  const state = createInitialGameState(1);
  state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
  state.careerPhase = 'active'; state.ageMonths = 180; state.slotInMonth = 0; state.locationId = 'foosha_village'; state.travelState = 'on_land';
  return state;
};

describe('monthly navigation', () => {
  it('offers stay/go to sea on land and consumes no slot', () => {
    const state = activeState();
    expect(getMonthlyNavigationOptions(state, contentCatalog).map(({ id, available }) => [id, available])).toEqual([['stay', true], ['goToSea', true]]);
    const next = applyMonthlyNavigationChoice(state, contentCatalog, 'goToSea');
    expect(next).toMatchObject({ travelState: 'at_sea', ageMonths: 180, slotInMonth: 0, navigationDecisionAgeMonths: 180 });
    expect(needsMonthlyNavigationDecision(next)).toBe(false);
  });

  it('offers docking at a port and blocks it where docking is forbidden', () => {
    const state = activeState(); state.travelState = 'at_sea';
    expect(getMonthlyNavigationOptions(state, contentCatalog)).toContainEqual({ id: 'dock', available: true });
    state.locationId = 'arlong_park';
    expect(getMonthlyNavigationOptions(state, contentCatalog)).toContainEqual({ id: 'dock', available: false });
    expect(() => applyMonthlyNavigationChoice(state, contentCatalog, 'dock')).toThrow('not available');
  });

  it('does not prompt non-Leaders or players without ships', () => {
    const state = activeState(); state.isLeader = false;
    expect(needsMonthlyNavigationDecision(state)).toBe(false);
    state.isLeader = true; state.ship = null;
    expect(needsMonthlyNavigationDecision(state)).toBe(false);
  });

  it('persists the monthly decision and only asks again next month after chains finish', () => {
    let state = applyMonthlyNavigationChoice(activeState(), contentCatalog, 'stay');
    const restored = deserializeGameState(serializeGameState(state))!;
    expect(needsMonthlyNavigationDecision(restored)).toBe(false);
    state = { ...restored, travelState: 'at_sea', slotInMonth: 1 };
    expect(needsMonthlyNavigationDecision(state)).toBe(false);
    state = { ...state, slotInMonth: 0, ageMonths: 181, pendingSlotPhase: 'active', immediateEventQueue: ['continuation'] };
    expect(needsMonthlyNavigationDecision(state)).toBe(false);
    state = { ...state, pendingSlotPhase: null, immediateEventQueue: [] };
    expect(needsMonthlyNavigationDecision(state)).toBe(true);
  });
});
`;

const newMonthlyNavigationTest = `import { describe, expect, it } from 'vitest';
import { contentCatalog } from '../src/game/content/definitions';
import { applyMonthlyNavigationChoice, getMonthlyNavigationOptions, needsMonthlyNavigationDecision } from '../src/game/engine/navigation';
import { deserializeGameState, serializeGameState } from '../src/game/engine/save';
import { createInitialGameState } from '../src/game/model/initialState';

const activeState = () => {
  const state = createInitialGameState(1);
  state.ship = { shipId: 'sloop', name: 'Test Sloop', health: 30, cargo: [] };
  state.careerPhase = 'active'; state.ageMonths = 180; state.slotInMonth = 0; state.locationId = 'foosha_village'; state.travelState = 'on_land';
  return state;
};

describe('monthly navigation', () => {
  it('offers real destinations on land and sailing changes Location without consuming time', () => {
    const state = activeState();
    const options = getMonthlyNavigationOptions(state, contentCatalog);
    expect(options).toContainEqual({ id: 'stay', available: true });

    const sail = options.find((option) => option.destinationId !== undefined && option.available);
    expect(sail?.destinationId).toBeTruthy();

    const origin = contentCatalog.locations.find(({ id }) => id === state.locationId)!;
    const destination = contentCatalog.locations.find(({ id }) => id === sail!.destinationId)!;
    expect(destination.islandId).not.toBe(origin.islandId);

    const next = applyMonthlyNavigationChoice(state, contentCatalog, sail!.id);
    expect(next).toMatchObject({
      travelState: 'at_sea',
      locationId: sail!.destinationId,
      ageMonths: 180,
      slotInMonth: 0,
      navigationDecisionAgeMonths: 180,
    });
    expect(needsMonthlyNavigationDecision(next)).toBe(false);
  });

  it('offers docking at a port and blocks it where docking is forbidden', () => {
    const state = activeState(); state.travelState = 'at_sea';
    expect(getMonthlyNavigationOptions(state, contentCatalog)).toContainEqual({ id: 'dock', available: true });
    state.locationId = 'arlong_park';
    expect(getMonthlyNavigationOptions(state, contentCatalog)).toContainEqual({ id: 'dock', available: false });
    expect(() => applyMonthlyNavigationChoice(state, contentCatalog, 'dock')).toThrow('not available');
  });

  it('does not prompt non-Leaders or players without ships', () => {
    const state = activeState(); state.isLeader = false;
    expect(needsMonthlyNavigationDecision(state)).toBe(false);
    state.isLeader = true; state.ship = null;
    expect(needsMonthlyNavigationDecision(state)).toBe(false);
  });

  it('persists the monthly decision and only asks again next month after chains finish', () => {
    let state = applyMonthlyNavigationChoice(activeState(), contentCatalog, 'stay');
    const restored = deserializeGameState(serializeGameState(state))!;
    expect(needsMonthlyNavigationDecision(restored)).toBe(false);
    state = { ...restored, ageMonths: 181, pendingSlotPhase: 'active', immediateEventQueue: ['continuation'] };
    expect(needsMonthlyNavigationDecision(state)).toBe(false);
    state = { ...state, pendingSlotPhase: null, immediateEventQueue: [] };
    expect(needsMonthlyNavigationDecision(state)).toBe(true);
  });
});
`;

replaceWhole('tests/monthlyNavigation.test.ts', oldMonthlyNavigationTest, newMonthlyNavigationTest, 'monthly navigation tests');

replaceRegexOnce(
  'tests/eventLoop.test.ts',
/  it\('consumes two active normal events per month', \(\) => \{[\s\S]*?  \}\);\n(?=\}\);)/,
`  it('consumes one active root event per month', () => {
    const content = catalog([event('a'), event('b'), event('c')]);
    let state = createInitialGameState(1);
    state.careerPhase = 'active';
    state.ageMonths = 180;
    state.navigationDecisionAgeMonths = 180;
    state = selectNextEvent(state, content);
    state = resolveChoice(state, content, state.currentEventId!, 'go').state;
    expect(state).toMatchObject({ ageMonths: 181, slotInMonth: 0 });
  });
`,
  'event loop two-slot test',
);

replaceExact(
  'tests/immediateEvents.test.ts',
`    state = resolveChoice(state, content, 'b', 'go').state;
    expect(state).toMatchObject({ ageMonths: 180, slotInMonth: 1, pendingSlotPhase: null });`,
`    state = resolveChoice(state, content, 'b', 'go').state;
    expect(state).toMatchObject({ ageMonths: 181, slotInMonth: 0, pendingSlotPhase: null });`,
  'Immediate chain finalizes one monthly slot',
);

replaceExact(
  'tests/immediateEvents.test.ts',
`  it('finishes a slot-2 chain before advancing the month', () => {`,
`  it('normalizes a legacy slot-1 chain by advancing the month once', () => {`,
  'Immediate legacy slot test title',
);

replaceExact(
  'tests/immediateEvents.test.ts',
`    expect(state.slotInMonth).toBe(1);`,
`    expect(state).toMatchObject({ ageMonths: 181, slotInMonth: 0 });`,
  'Critical then Immediate monthly finalization',
);

replaceExact(
  'tests/immediateEvents.test.ts',
`    const state = resolveChoice(root, content, 'root', 'go').state;
    expect(state).toMatchObject({ ageMonths: 180, slotInMonth: 1, pendingSlotPhase: null });`,
`    const state = resolveChoice(root, content, 'root', 'go').state;
    expect(state).toMatchObject({ ageMonths: 181, slotInMonth: 0, pendingSlotPhase: null });`,
  'Skipped Immediate monthly finalization',
);

// -----------------------------------------------------------------------------
// Authorities: lock the new cadence/navigation rule so future authoring doesn't regress it.
// -----------------------------------------------------------------------------
replaceExact(
  'docs/GAME_DESIGN.md',
`Active commence toujours à **15 ans** et utilise **2 slots d’Event par mois**, soit au maximum 24 Events consommant un slot par année complète, hors Critical Events.`,
`Active commence toujours à **15 ans** et utilise **1 root Event par mois**, soit au maximum 12 Events consommant le slot mensuel par année complète, hors Critical et continuations Immediate.`,
  'GAME_DESIGN Active cadence',
);

replaceExact(
  'docs/GAME_DESIGN.md',
`Au début de chaque mois Active, avant le premier slot, un joueur Leader disposant d’un navire choisit une seule fois son contexte initial : rester à terre ou prendre la mer, rester en mer ou accoster lorsque la Location autorise l’accostage. Cette décision ne consomme ni Event ni slot et reste acquise pour le mois, même si un Event change ensuite le contexte de voyage. Un joueur non-Leader ou sans navire ne reçoit pas ce choix. La destination reste contrôlée exclusivement par les Events et leurs Effects.`,
`Au début de chaque mois Active, avant l’unique root Event, un joueur Leader disposant d’un navire choisit une seule fois son contexte de navigation. À terre, il peut rester ou prendre la mer vers une destination accessible ; en mer, il peut rester en mer, changer de cap vers une destination accessible ou accoster lorsque la Location l’autorise. Cette décision ne consomme aucun Event et reste acquise pour le mois. Dans les quatre Blues, le joueur choisit directement parmi les destinations dockables d’une autre île de la même mer. Paradise conserve la progression avant imposée par son graphe de routes ; les régions qui n’autorisent pas la navigation directe restent déplacées par Events. Un joueur non-Leader ou sans navire ne reçoit pas ce choix.`,
  'GAME_DESIGN navigation rule',
);

replaceExact(
  'docs/GAME_DESIGN.md',
`Un slot peut être consommé par un Event normal, Scheduled, une conséquence future ou une rencontre programmée. La provenance ne change pas son coût. Les continuations \`immediate\` définies ci-dessous constituent l’exception explicite : elles prolongent le même slot sans coût supplémentaire.

Le GameState doit conceptuellement suivre \`slotInMonth: 0 | 1\` :

- mois 0, slot 0 ;
- mois 0, slot 1 ;
- puis mois 1, slot 0.

Deux slots consommés font avancer l’âge biologique d’un mois. Comme en Childhood, le temps appartient à la boucle de phase, pas à l’Outcome.`,
`Le root slot mensuel peut être consommé par un Event Normal ou Scheduled. La provenance ne change pas son coût. Les continuations \`immediate\` prolongent explicitement ce même root sans coût temporel supplémentaire ; les Critical ne consomment aucun mois.

Le GameState conserve \`slotInMonth: 0 | 1\` pour compatibilité de Save, mais la boucle Active V1 utilise désormais uniquement le slot 0 : une fois le root et toutes ses continuations Immediate terminés, l’âge avance immédiatement d’un mois et \`slotInMonth\` reste ou revient à 0. Une ancienne Save chargée avec \`slotInMonth = 1\` est naturellement normalisée au prochain root consommé.

Comme en Childhood, le temps appartient à la boucle de phase, pas à l’Outcome.`,
  'GAME_DESIGN slot model',
);

replaceExact(
  'docs/ARCHITECTURE.md',
`Save v15 stores one clock, \`ageMonths\`, plus \`slotInMonth: 0 | 1\`. Origins ends at age 12. Childhood consumes eight annual slots followed by twelve half-year slots and enters Active at age 180. Outside Active the slot is always zero. In Active, slot zero becomes one without changing age; consuming slot one resets it and increments age by one month. Saves v7 à v14 sont migrées séquentiellement au chargement vers v15 ; la migration v15 généralise le rang, borne la Reputation, ajoute la Race persistante des NPC et migre les anciens IDs de navires.`,
`Save v15 stores one clock, \`ageMonths\`, plus the legacy-compatible \`slotInMonth: 0 | 1\`. Origins ends at age 12. Childhood consumes eight annual slots followed by twelve half-year slots and enters Active at age 180. Outside Active the slot is always zero. Active now consumes one root slot per month: once the root and its Immediate chain finish, age advances by one month and the runtime returns to slot zero. The value 1 remains accepted for old Saves and is normalized by the next consumed root. Saves v7 à v14 sont migrées séquentiellement au chargement vers v15 ; la migration v15 généralise le rang, borne la Reputation, ajoute la Race persistante des NPC et migre les anciens IDs de navires.`,
  'ARCHITECTURE Active timing',
);

replaceExact(
  'docs/ARCHITECTURE.md',
`At an Active month boundary the engine may expose a monthly navigation decision before Event selection. This session prompt is derived from persisted GameState and is not an authored Event. The selection order is Critical, pending navigation when applicable, Immediate, Scheduled, then Normal; an already-started Immediate chain always completes before the next month prompt.`,
`At an Active month boundary the engine may expose a monthly navigation decision before Event selection. This session prompt is derived from persisted GameState and is not an authored Event. In the four Blues, a Leader with a ship can select a dockable destination on another island; selecting it changes the current Location and enters \`at_sea\` for that month's root Event, with docking available from the next monthly navigation prompt. Paradise destination options follow the authored forward route graph; other regions remain Event-driven. The selection order is Critical, pending navigation when applicable, Immediate, Scheduled, then Normal; an already-started Immediate chain always completes before the next month prompt.`,
  'ARCHITECTURE navigation',
);

// Write only after every check/transform succeeded.
for (const file of edits.values()) {
  let output = file.text.replace(/\n/g, file.eol);
  if (file.bom) output = '\uFEFF' + output;
  fs.writeFileSync(file.path, output, 'utf8');
}

console.log('');
console.log(`OK — A appliqué sur ${edits.size} fichiers.`);
console.log('  • Active: 1 root Event / mois');
console.log('  • Navigation: choix réel de destination dans les Blues + route Paradise');
console.log('  • UI: wrapper aventure stable, sans depop/repop entre Events');
console.log('  • HUD/tests/docs/locales mis à jour');
console.log('');
console.log('Aucune simulation n’a été lancée.');
console.log('Validation recommandée: npm test && npm run build');
