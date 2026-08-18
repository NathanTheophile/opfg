import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import { t } from '@/game/localization';
import { useObservedUiLocale } from '@/features/settings/localeSync';
import { useAudio } from './AudioProvider';
import './utility-controls.css';

type MixerRowProps = {
  icon: ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function MixerRow({
  icon,
  label,
  value,
  onChange,
}: MixerRowProps) {
  return (
    <label className="grid grid-cols-[1.25rem_4.75rem_1fr_2.5rem] items-center gap-2 text-xs text-amber-50/85">
      <span className="text-amber-300/80">{icon}</span>
      <span>{label}</span>

      <input
        className="h-1.5 w-full cursor-pointer accent-amber-400"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
      />

      <span className="text-right tabular-nums text-amber-100/60">
        {Math.round(value * 100)}%
      </span>
    </label>
  );
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '--:--';
  }

  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function ScrollingTrackTitle({
  title,
}: {
  title: string;
}) {
  const viewportRef =
    useRef<HTMLDivElement | null>(null);
  const textRef =
    useRef<HTMLSpanElement | null>(null);
  const [distance, setDistance] =
    useState(0);

  useEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current;
      const text = textRef.current;
      if (!viewport || !text) return;

      setDistance(
        Math.max(
          0,
          text.scrollWidth - viewport.clientWidth,
        ),
      );
    };

    measure();

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(measure)
        : null;

    if (viewportRef.current) {
      observer?.observe(viewportRef.current);
    }
    if (textRef.current) {
      observer?.observe(textRef.current);
    }

    return () => observer?.disconnect();
  }, [title]);

  const style = {
    '--opfg-track-scroll-distance':
      `${distance}px`,
  } as CSSProperties;

  return (
    <div
      ref={viewportRef}
      className="opfg-music-title"
      title={title}
    >
      <span
        ref={textRef}
        className={
          distance > 0
            ? 'is-scrolling'
            : undefined
        }
        style={style}
      >
        {title}
      </span>
    </div>
  );
}

function MusicPlayer({
  audioLabel,
}: {
  audioLabel: string;
}) {
  const audio = useAudio();
  const track = audio.musicTrack;

  if (!track) return null;

  const hasDuration =
    Number.isFinite(audio.musicDuration) &&
    audio.musicDuration > 0;
  const progressMax =
    hasDuration ? audio.musicDuration : 1;
  const progressValue =
    hasDuration
      ? Math.min(
          audio.musicCurrentTime,
          audio.musicDuration,
        )
      : 0;
  const progressPercent =
    hasDuration
      ? Math.max(
          0,
          Math.min(
            100,
            (progressValue / audio.musicDuration) * 100,
          ),
        )
      : 0;
  const PlaybackIcon =
    audio.isMusicPlaying ? Pause : Play;

  return (
    <div className="opfg-music-player">
      <div className="opfg-music-player__title-row">
        <Music2
          size={14}
          aria-hidden="true"
        />
        <ScrollingTrackTitle
          title={track.title}
        />
      </div>

      <div className="opfg-music-player__controls">
        <button
          type="button"
          className="opfg-music-player__control"
          aria-label={audioLabel}
          onClick={() =>
            void audio.previousMusic()
          }
        >
          <SkipBack size={15} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="opfg-music-player__control is-primary"
          aria-label={audioLabel}
          onClick={() =>
            void audio.toggleMusicPlayback()
          }
        >
          <PlaybackIcon
            size={16}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          className="opfg-music-player__control"
          aria-label={audioLabel}
          onClick={() =>
            void audio.nextMusic()
          }
        >
          <SkipForward
            size={15}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="opfg-music-player__progress">
        <span>
          {formatTime(audio.musicCurrentTime)}
        </span>

        <input
          className="opfg-music-player__seek"
          style={{
            '--opfg-seek-progress':
              `${progressPercent}%`,
          } as CSSProperties}
          type="range"
          min="0"
          max={progressMax}
          step="0.1"
          value={progressValue}
          disabled={!hasDuration}
          aria-label={audioLabel}
          onChange={(event) =>
            audio.seekMusic(
              Number(event.target.value),
            )
          }
        />

        <span className="text-right">
          {hasDuration
            ? formatTime(audio.musicDuration)
            : '--:--'}
        </span>
      </div>
    </div>
  );
}

export function AudioControls() {
  const [open, setOpen] =
    useState(false);
  const [playerOpen, setPlayerOpen] =
    useState(false);
  const audio = useAudio();
  const locale = useObservedUiLocale();
  const VolumeIcon =
    audio.muted ? VolumeX : Volume2;
  const translate = (key: string) =>
    t(key, locale);

  return (
    <div
      className="opfg-audio-controls"
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      <button
        type="button"
        className="opfg-utility-square"
        aria-label={translate(
          'ui.audio.settings',
        )}
        aria-expanded={open}
        onClick={() =>
          setOpen((current) => !current)
        }
      >
        <SlidersHorizontal
          size={17}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="opfg-audio-mixer">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-amber-100">
              <SlidersHorizontal size={15} />
              {translate('ui.audio.title')}
            </div>

            <button
              type="button"
              className="grid size-7 place-items-center rounded text-amber-100/70 transition hover:bg-white/5 hover:text-amber-100"
              aria-label={
                audio.muted
                  ? translate('ui.audio.unmute')
                  : translate('ui.audio.mute')
              }
              onClick={audio.toggleMute}
            >
              <VolumeIcon size={16} />
            </button>
          </div>

          <div className="space-y-3.5">
            <MixerRow
              icon={<Volume2 size={14} />}
              label={translate('ui.audio.master')}
              value={audio.master}
              onChange={audio.setMasterVolume}
            />

            <MixerRow
              icon={<Waves size={14} />}
              label={translate('ui.audio.ambience')}
              value={audio.ambience}
              onChange={audio.setAmbienceVolume}
            />

            <MixerRow
              icon={<Music2 size={14} />}
              label={translate('ui.audio.music')}
              value={audio.music}
              onChange={audio.setMusicVolume}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        className="opfg-utility-square opfg-music-player-toggle"
        aria-label={translate('ui.audio.music')}
        aria-expanded={playerOpen}
        onClick={() =>
          setPlayerOpen((current) => !current)
        }
      >
        <Music2 size={17} aria-hidden="true" />
      </button>

      <MusicPlayer
        audioLabel={translate('ui.audio.music')}
      />

      {playerOpen && (
        <div className="opfg-music-player-popover">
          <MusicPlayer
            audioLabel={translate('ui.audio.music')}
          />
        </div>
      )}
    </div>
  );
}
