import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { EventPreview } from './features/event-ui/EventPreview';
import { GameShell } from './features/game-shell/GameShell';
import './styles/globals.css';

const previewMode = new URLSearchParams(window.location.search).get('preview');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameShell>
      {previewMode === 'event' ? <EventPreview /> : <App />}
    </GameShell>
  </StrictMode>,
);
