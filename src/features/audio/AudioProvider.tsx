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

export type MusicTrack = {
  id: string;
  title: string;
  src: string;
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
  musicTrack: MusicTrack | null;
  isMusicPlaying: boolean;
  musicCurrentTime: number;
  musicDuration: number;
  toggleMusicPlayback: () => Promise<void>;
  previousMusic: () => Promise<void>;
  nextMusic: () => Promise<void>;
  seekMusic: (seconds: number) => void;
};

type AudioProviderProps = PropsWithChildren<{
  initialAmbienceSrc?: string;
  musicPlaylist?: readonly MusicTrack[];
}>;

type ChannelState = {
  activeIndex: 0 | 1;
  src: string | null;
  animationFrame: number | null;
};

const STORAGE_KEY = 'opfg.audio.v1';
const MUSIC_PLAYBACK_STORAGE_KEY = 'opfg.audio.musicPlayback.v1';
const DEFAULT_FADE_SECONDS = 1.5;
const MUSIC_FADE_SECONDS = 0.6;
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

function loadMusicPlaybackPreference(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(MUSIC_PLAYBACK_STORAGE_KEY) !== 'paused';
  } catch {
    return true;
  }
}

function saveMusicPlaybackPreference(playing: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MUSIC_PLAYBACK_STORAGE_KEY, playing ? 'playing' : 'paused');
  } catch {
    // Audio still works when storage is unavailable.
  }
}

function inferTrackTitle(src: string): string {
  const fileName = decodeURIComponent(src.split('/').pop()?.split('?')[0] ?? src);
  const withoutExtension = fileName.replace(/\.[^.]+$/, '');
  return withoutExtension.replace(/[-_]+/g, ' ') || 'Music';
}

function resetPlayer(player: HTMLAudioElement) {
  player.pause();
  player.currentTime = 0;
  player.removeAttribute('src');
  player.load();
  setEnvelope(player, 0);
}

export function AudioProvider({
  children,
  initialAmbienceSrc,
  musicPlaylist = [],
}: AudioProviderProps) {
  const [settings, setSettings] = useState(loadSettings);
  const [musicTrack, setMusicTrack] = useState<MusicTrack | null>(() => musicPlaylist[0] ?? null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const musicIndexRef = useRef(0);
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

  const syncMusicState = useCallback((playerIndex: 0 | 1) => {
    if (channelState.current.music.activeIndex !== playerIndex) return;

    const player = musicPlayers.current[playerIndex];
    if (!player) return;

    setIsMusicPlaying(!player.paused && !player.ended);
    setMusicCurrentTime(Number.isFinite(player.currentTime) ? player.currentTime : 0);
    setMusicDuration(Number.isFinite(player.duration) ? player.duration : 0);
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
          resetPlayer(player);
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
    async (channel: AudioChannel, src: string, options: PlayOptions = {}): Promise<boolean> => {
      const state = channelState.current[channel];
      const players = getPlayers(channel);
      const fadeSeconds = options.fadeSeconds ?? DEFAULT_FADE_SECONDS;
      const loop = options.loop ?? channel === 'ambience';

      if (state.src === src) {
        const active = players[state.activeIndex];
        if (!active) return false;

        active.loop = loop;
        if (active.ended) active.currentTime = 0;

        if (active.paused) {
          try {
            await active.play();
          } catch {
            return false;
          }
        }

        if (channel === 'music') saveMusicPlaybackPreference(true);
        fadeChannel(channel, state.activeIndex, fadeSeconds);
        if (channel === 'music') syncMusicState(state.activeIndex);
        return true;
      }

      const nextIndex = (state.activeIndex === 0 ? 1 : 0) as 0 | 1;
      const next = players[nextIndex];
      if (!next) return false;

      next.src = src;
      next.loop = loop;
      next.currentTime = 0;
      setEnvelope(next, 0);
      applyVolume(next, channel);

      try {
        await next.play();
      } catch {
        resetPlayer(next);
        return false;
      }

      if (channel === 'music') saveMusicPlaybackPreference(true);
      state.activeIndex = nextIndex;
      state.src = src;
      fadeChannel(channel, nextIndex, fadeSeconds);
      if (channel === 'music') syncMusicState(nextIndex);
      return true;
    },
    [applyVolume, fadeChannel, getPlayers, syncMusicState],
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
    async (src: string, options?: PlayOptions) => {
      await playChannel('ambience', src, options);
    },
    [playChannel],
  );

  const playMusic = useCallback(
    async (src: string, options: PlayOptions = {}) => {
      const playlistIndex = musicPlaylist.findIndex((track) => track.src === src);

      if (playlistIndex >= 0) {
        musicIndexRef.current = playlistIndex;
        setMusicTrack(musicPlaylist[playlistIndex] ?? null);
      } else {
        setMusicTrack({ id: src, title: inferTrackTitle(src), src });
      }

      setMusicCurrentTime(0);
      await playChannel('music', src, {
        ...options,
        loop: options.loop ?? false,
      });
    },
    [musicPlaylist, playChannel],
  );

  const playPlaylistTrack = useCallback(
    async (index: number) => {
      if (musicPlaylist.length === 0) return;

      const normalizedIndex = ((index % musicPlaylist.length) + musicPlaylist.length) % musicPlaylist.length;
      const track = musicPlaylist[normalizedIndex];
      if (!track) return;

      musicIndexRef.current = normalizedIndex;
      setMusicTrack(track);
      setMusicCurrentTime(0);
      setMusicDuration(0);

      await playChannel('music', track.src, {
        loop: false,
        fadeSeconds: MUSIC_FADE_SECONDS,
      });
    },
    [musicPlaylist, playChannel],
  );

  const previousMusic = useCallback(
    async () => {
      if (musicPlaylist.length === 0) return;
      await playPlaylistTrack(
        musicIndexRef.current - 1,
      );
    },
    [musicPlaylist, playPlaylistTrack],
  );

  const nextMusic = useCallback(async () => {
    if (musicPlaylist.length === 0) return;

    if (musicPlaylist.length === 1) {
      const state = channelState.current.music;
      const active = musicPlayers.current[state.activeIndex];
      const onlyTrack = musicPlaylist[0];

      if (active && onlyTrack && state.src === onlyTrack.src) {
        active.currentTime = 0;
        if (active.paused) {
          try {
            await active.play();
          } catch {
            return;
          }
        }
        syncMusicState(state.activeIndex);
        return;
      }
    }

    await playPlaylistTrack(musicIndexRef.current + 1);
  }, [musicPlaylist, playPlaylistTrack, syncMusicState]);

  const toggleMusicPlayback = useCallback(async () => {
    const track = musicTrack ?? musicPlaylist[0] ?? null;
    if (!track) return;

    const state = channelState.current.music;
    const active = musicPlayers.current[state.activeIndex];

    if (!active || state.src !== track.src) {
      const playlistIndex = musicPlaylist.findIndex((entry) => entry.src === track.src);
      if (playlistIndex >= 0) await playPlaylistTrack(playlistIndex);
      else await playMusic(track.src);
      return;
    }

    if (active.paused) {
      if (active.ended) active.currentTime = 0;
      try {
        await active.play();
      } catch {
        return;
      }
      saveMusicPlaybackPreference(true);
      setEnvelope(active, 1);
      applyVolume(active, 'music');
    } else {
      if (state.animationFrame !== null) {
        cancelAnimationFrame(state.animationFrame);
        state.animationFrame = null;
      }

      musicPlayers.current.forEach((player, index) => {
        if (!player) return;
        if (index === state.activeIndex) {
          setEnvelope(player, 1);
          applyVolume(player, 'music');
          player.pause();
          saveMusicPlaybackPreference(false);
        } else {
          resetPlayer(player);
        }
      });
    }

    syncMusicState(state.activeIndex);
  }, [applyVolume, musicPlaylist, musicTrack, playMusic, playPlaylistTrack, syncMusicState]);

  const seekMusic = useCallback(
    (seconds: number) => {
      const state = channelState.current.music;
      const active = musicPlayers.current[state.activeIndex];
      if (!active || !Number.isFinite(active.duration) || active.duration <= 0) return;

      active.currentTime = Math.min(active.duration, Math.max(0, seconds));
      syncMusicState(state.activeIndex);
    },
    [syncMusicState],
  );

  const stopAmbience = useCallback((fadeSeconds?: number) => stopChannel('ambience', fadeSeconds), [stopChannel]);
  const stopMusic = useCallback(
    (fadeSeconds?: number) => {
      stopChannel('music', fadeSeconds);
      setIsMusicPlaying(false);
      setMusicCurrentTime(0);
    },
    [stopChannel],
  );

  // D1.8 initial music bootstrap:
  // attempt autoplay immediately, then retry on the first user gesture
  // when browser autoplay policy blocks audible media.
  useEffect(() => {
    if (musicPlaylist.length === 0 || !loadMusicPlaybackPreference()) {
      return undefined;
    }

    let disposed = false;

    const alreadyStarted = () =>
      channelState.current.music.src !== null;

    const start = () => {
      if (disposed || alreadyStarted()) return;
      void playPlaylistTrack(
        musicIndexRef.current,
      );
    };

    const removeGestureListeners = () => {
      window.removeEventListener(
        'pointerdown',
        onPointerDown,
        true,
      );
      window.removeEventListener(
        'keydown',
        onKeyDown,
        true,
      );
    };

    const onPointerDown = (
      event: PointerEvent,
    ) => {
      const target =
        event.target instanceof Element
          ? event.target
          : null;

      // Manual player interaction keeps its own semantics.
      if (
        target?.closest(
          '.opfg-audio-controls',
        )
      ) {
        return;
      }

      start();
      removeGestureListeners();
    };

    const onKeyDown = () => {
      start();
      removeGestureListeners();
    };

    // Works immediately where autoplay is allowed.
    start();

    // Reliable fallback for Chrome/Firefox/Safari autoplay policies.
    window.addEventListener(
      'pointerdown',
      onPointerDown,
      true,
    );
    window.addEventListener(
      'keydown',
      onKeyDown,
      true,
    );

    return () => {
      disposed = true;
      removeGestureListeners();
    };
  }, [musicPlaylist, playPlaylistTrack]);

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
      musicTrack,
      isMusicPlaying,
      musicCurrentTime,
      musicDuration,
      toggleMusicPlayback,
      previousMusic,
      nextMusic,
      seekMusic,
    }),
    [
      isMusicPlaying,
      musicCurrentTime,
      musicDuration,
      musicTrack,
      nextMusic,
      previousMusic,
      playAmbience,
      playMusic,
      seekMusic,
      settings,
      stopAmbience,
      stopMusic,
      toggleMusicPlayback,
    ],
  );

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio ref={(element) => { ambiencePlayers.current[0] = element; }} preload="auto" />
      <audio ref={(element) => { ambiencePlayers.current[1] = element; }} preload="auto" />
      <audio
        ref={(element) => { musicPlayers.current[0] = element; }}
        preload="metadata"
        onTimeUpdate={() => syncMusicState(0)}
        onLoadedMetadata={() => syncMusicState(0)}
        onDurationChange={() => syncMusicState(0)}
        onPlay={() => syncMusicState(0)}
        onPause={() => syncMusicState(0)}
        onEnded={() => {
          if (channelState.current.music.activeIndex === 0) void nextMusic();
        }}
      />
      <audio
        ref={(element) => { musicPlayers.current[1] = element; }}
        preload="metadata"
        onTimeUpdate={() => syncMusicState(1)}
        onLoadedMetadata={() => syncMusicState(1)}
        onDurationChange={() => syncMusicState(1)}
        onPlay={() => syncMusicState(1)}
        onPause={() => syncMusicState(1)}
        onEnded={() => {
          if (channelState.current.music.activeIndex === 1) void nextMusic();
        }}
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used inside AudioProvider.');
  return context;
}
