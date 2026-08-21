import { useEffect, useState } from 'react';
import { contentCatalog } from '../game/content/definitions';
import { archiveCompletedRun } from '../game/engine/completedRuns';
import { clearGameState, loadGameState } from '../game/engine/save';
import { assertValidContent } from '../game/validation/validateContent';
import { EventPreview } from '../features/event-ui/EventPreview';
import { LandingPage } from '../features/landing/LandingPage';

assertValidContent(contentCatalog);

type AppView = 'landing' | 'continue' | 'new';

export function App() {
  const [view, setView] = useState<AppView>('landing');

  useEffect(() => {
    if (view !== 'landing') return;

    const completedSave = loadGameState(window.localStorage);
    if (completedSave?.careerStatus === 'ended') {
      archiveCompletedRun(window.localStorage, completedSave);
    }
  }, [view]);

  if (view !== 'landing') {
    return (
      <EventPreview
        catalog={contentCatalog}
        storage={window.localStorage}
        autoStartNewRun={view === 'new'}
        onHome={() => setView('landing')}
      />
    );
  }

  const loadedSave = loadGameState(window.localStorage);
  const activeSave =
    loadedSave?.careerStatus === 'active'
      ? loadedSave
      : null;

  return (
    <LandingPage
      catalog={contentCatalog}
      storage={window.localStorage}
      activeSave={activeSave}
      onContinue={() => setView('continue')}
      onNewGame={() => {
        clearGameState(window.localStorage);
        setView('new');
      }}
    />
  );
}
