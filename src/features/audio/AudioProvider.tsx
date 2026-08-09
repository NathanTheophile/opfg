import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type AudioChannel = 'ambience' | 'music';

type AudioSettings = {
  master: number;
  ambience: number;
  music: number;
  muted: boolean;
};

type PlayOptions = {
  fadeSeconds?: number;
  loop?: boolean;
};

type AudioContextValue = AudioSettings & {
  setMasterVolume: (value: number) => void;
  setAmbienceVolume: (value: number) => void;
  setMusicVolume: (value: number) => void;
  toggleMute: () => void;
  playAmbience: (src: string, options?: PlayOptions) => Promise<void>;
  playMusic: (src: string, options?: PlayOptions) => Promise<void>;
  stopAmbience: (fadeSeconds?: number) => void;
  stopMusic: (fadeSeconds?: number) => void;
};

type AudioProviderProps = PropsWithChildren<{
  initialAmbienceSrc?: string;
}>;

type ChannelState = {
  activeIndex: 0 | 1;
  src: string | null;
  animationFrame: number | null;
};

const STORAGE_KEY = 'opfg.audio.v1';
const DEFAULT_FADE_SECONDS = 1.5;
const DEFAULT_SETTINGS: AudioSettings = {
  master: 0.8,
  ambience: 0.65,
  music: 0.65,
  muted: false,
};

const AudioContext = createContext<AudioContextValue | null>(null);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const getEnvelope = (audio: HTMLAudioElement) => Number(audio.dataset.audioEnvelope ?? '0');
const setEnvelope = (audio: HTMLAudioElement, value: number) => {
  audio.dataset.audioEnvelope = String(clamp01(value));
};

function loadSettings(): AudioSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<AudioSettings>;
    return {
      master: typeof stored.master === 'number' ? clamp01(stored.master) : DEFAULT_SETTINGS.master,
      ambience: typeof stored.ambience === 'number' ? clamp01(stored.ambience) : DEFAULT_SETTINGS.ambience,
      music: typeof stored.music === 'number' ? clamp01(stored.music) : DEFAULT_SETTINGS.music,
      muted: typeof stored.muted === 'boolean' ? stored.muted : DEFAULT_SETTINGS.muted,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function AudioProvider({ children, initialAmbienceSrc }: AudioProviderProps) {
  const [settings, setSettings] = useState(loadSettings);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const ambiencePlayers = useRef<[HTMLAudioElement | null, HTMLAudioElement | null]>([null, null]);
  const musicPlayers = useRef<[HTMLAudioElement | null, HTMLAudioElement | null]>([null, null]);
  const channelState = useRef<Record<AudioChannel, ChannelState>>({
    ambience: { activeIndex: 0, src: null, animationFrame: null },
    music: { activeIndex: 0, src: null, animationFrame: null },
  });

  const getPlayers = useCallback(
    (channel: AudioChannel) => (channel === 'ambience' ? ambiencePlayers.current : musicPlayers.current),
    [],
  );

  const applyVolume = useCallback((audio: HTMLAudioElement, channel: AudioChannel) => {
    const current = settingsRef.current;
    const channelVolume = channel === 'ambience' ? current.ambience : current.music;
    audio.volume = current.muted ? 0 : clamp01(current.master * channelVolume * getEnvelope(audio));
  }, []);

  const fadeChannel = useCallback(
    (channel: AudioChannel, targetIndex: 0 | 1 | null, fadeSeconds = DEFAULT_FADE_SECONDS) => {
      const state = channelState.current[channel];
      const players = getPlayers(channel);
      const durationMs = Math.max(0, fadeSeconds * 1000);
      const startEnvelopes = players.map((player) => (player ? getEnvelope(player) : 0));

      if (state.animationFrame !== null) cancelAnimationFrame(state.animationFrame);

      const finish = () => {
        players.forEach((player, index) => {
          if (!player || index === targetIndex) return;
          player.pause();
          player.currentTime = 0;
          player.removeAttribute('src');
          player.load();
          setEnvelope(player, 0);
        });
        state.animationFrame = null;
      };

      if (durationMs === 0) {
        players.forEach((player, index) => {
          if (!player) return;
          setEnvelope(player, index === targetIndex ? 1 : 0);
          applyVolume(player, channel);
        });
        finish();
        return;
      }

      const startedAt = performance.now();
      const tick = (now: number) => {
        const t = clamp01((now - startedAt) / durationMs);

        players.forEach((player, index) => {
          if (!player) return;
          const target = index === targetIndex ? 1 : 0;
          const start = startEnvelopes[index] ?? 0;
          setEnvelope(player, start + (target - start) * t);
          applyVolume(player, channel);
        });

        if (t < 1) state.animationFrame = requestAnimationFrame(tick);
        else finish();
      };

      state.animationFrame = requestAnimationFrame(tick);
    },
    [applyVolume, getPlayers],
  );

  const playChannel = useCallback(
    async (channel: AudioChannel, src: string, options: PlayOptions = {}) => {
      const state = channelState.current[channel];
      const players = getPlayers(channel);
      const fadeSeconds = options.fadeSeconds ?? DEFAULT_FADE_SECONDS;

      if (state.src === src) {
        const active = players[state.activeIndex];
        if (!active) return;
        active.loop = options.loop ?? true;
        if (active.paused) {
          try {
            await active.play();
          } catch {
            return;
          }
        }
        fadeChannel(channel, state.activeIndex, fadeSeconds);
        return;
      }

      const nextIndex = (state.activeIndex === 0 ? 1 : 0) as 0 | 1;
      const next = players[nextIndex];
      if (!next) return;

      next.src = src;
      next.loop = options.loop ?? true;
      next.currentTime = 0;
      setEnvelope(next, 0);
      applyVolume(next, channel);

      try {
        await next.play();
      } catch {
        next.removeAttribute('src');
        next.load();
        return;
      }

      state.activeIndex = nextIndex;
      state.src = src;
      fadeChannel(channel, nextIndex, fadeSeconds);
    },
    [applyVolume, fadeChannel, getPlayers],
  );

  const stopChannel = useCallback(
    (channel: AudioChannel, fadeSeconds = DEFAULT_FADE_SECONDS) => {
      channelState.current[channel].src = null;
      fadeChannel(channel, null, fadeSeconds);
    },
    [fadeChannel],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Audio still works when storage is unavailable.
    }

    (['ambience', 'music'] as const).forEach((channel) => {
      getPlayers(channel).forEach((player) => player && applyVolume(player, channel));
    });
  }, [applyVolume, getPlayers, settings]);

  const playAmbience = useCallback(
    (src: string, options?: PlayOptions) => playChannel('ambience', src, options),
    [playChannel],
  );
  const playMusic = useCallback(
    (src: string, options?: PlayOptions) => playChannel('music', src, options),
    [playChannel],
  );
  const stopAmbience = useCallback((fadeSeconds?: number) => stopChannel('ambience', fadeSeconds), [stopChannel]);
  const stopMusic = useCallback((fadeSeconds?: number) => stopChannel('music', fadeSeconds), [stopChannel]);

  useEffect(() => {
    if (!initialAmbienceSrc) return;

    const startInitialAmbience = () => {
      void playAmbience(initialAmbienceSrc);
      window.removeEventListener('pointerdown', startInitialAmbience);
      window.removeEventListener('keydown', startInitialAmbience);
    };

    window.addEventListener('pointerdown', startInitialAmbience, { once: true });
    window.addEventListener('keydown', startInitialAmbience, { once: true });

    return () => {
      window.removeEventListener('pointerdown', startInitialAmbience);
      window.removeEventListener('keydown', startInitialAmbience);
    };
  }, [initialAmbienceSrc, playAmbience]);

  useEffect(
    () => () => {
      (['ambience', 'music'] as const).forEach((channel) => {
        const state = channelState.current[channel];
        if (state.animationFrame !== null) cancelAnimationFrame(state.animationFrame);
      });
    },
    [],
  );

  const value = useMemo<AudioContextValue>(
    () => ({
      ...settings,
      setMasterVolume: (master) => setSettings((current) => ({ ...current, master: clamp01(master) })),
      setAmbienceVolume: (ambience) => setSettings((current) => ({ ...current, ambience: clamp01(ambience) })),
      setMusicVolume: (music) => setSettings((current) => ({ ...current, music: clamp01(music) })),
      toggleMute: () => setSettings((current) => ({ ...current, muted: !current.muted })),
      playAmbience,
      playMusic,
      stopAmbience,
      stopMusic,
    }),
    [playAmbience, playMusic, settings, stopAmbience, stopMusic],
  );

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio ref={(element) => { ambiencePlayers.current[0] = element; }} preload="auto" />
      <audio ref={(element) => { ambiencePlayers.current[1] = element; }} preload="auto" />
      <audio ref={(element) => { musicPlayers.current[0] = element; }} preload="auto" />
      <audio ref={(element) => { musicPlayers.current[1] = element; }} preload="auto" />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used inside AudioProvider.');
  return context;
}
