import {
  StrictMode,
  Suspense,
  lazy,
} from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { AudioProvider } from './features/audio/AudioProvider';
import { AUDIO_TRACKS, MUSIC_PLAYLIST } from './features/audio/audioConfig';
import { GameShell } from './features/game-shell/GameShell';
import './styles/globals.css';
import './styles/ui-system.css';
import './styles/typography.css';
export const INITIAL_AMBIENCE: string | undefined = undefined;

const DevUITuner = import.meta.env.DEV
  ? lazy(async () => {
      const module = await import('./features/dev-ui/UITuner');
      return { default: module.UITuner };
    })
  : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AudioProvider
      initialAmbienceSrc={INITIAL_AMBIENCE}
      musicPlaylist={MUSIC_PLAYLIST}
    >
      <GameShell>
        <App />
      </GameShell>

      {DevUITuner && (
        <Suspense fallback={null}>
          <DevUITuner />
        </Suspense>
      )}
    </AudioProvider>
  </StrictMode>,
);
