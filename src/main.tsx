import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { GameShell } from './features/game-shell/GameShell';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameShell>
      <App />
    </GameShell>
  </StrictMode>,
);
