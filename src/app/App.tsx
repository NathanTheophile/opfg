import { useState } from 'react';
import { contentCatalog } from '../game/content/definitions';
import { clearGameState, loadGameState } from '../game/engine/save';
import { assertValidContent } from '../game/validation/validateContent';
import { EventPreview } from '../features/event-ui/EventPreview';
import { LandingPage } from '../features/landing/LandingPage';

assertValidContent(contentCatalog);

type AppView = 'landing' | 'continue' | 'new';

export function App() {
  const [view, setView] = useState<AppView>('landing');

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
