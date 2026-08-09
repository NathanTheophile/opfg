import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { AudioProvider } from './features/audio/AudioProvider';
import { AUDIO_TRACKS } from './features/audio/audioConfig';
import { GameShell } from './features/game-shell/GameShell';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AudioProvider initialAmbienceSrc={AUDIO_TRACKS.ambience.tavern}>
      <GameShell>
        <App />
      </GameShell>
    </AudioProvider>
  </StrictMode>,
);
