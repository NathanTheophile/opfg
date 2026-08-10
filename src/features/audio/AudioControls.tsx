import { useState, type ReactNode } from 'react';
import {
  Music2,
  Pause,
  Play,
  SkipForward,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import { t } from '@/game/localization';
import { useObservedUiLocale } from '@/features/settings/localeSync';
import { useAudio } from './AudioProvider';

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
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--';

  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function MusicPlayer({
  audioLabel,
}: {
  audioLabel: string;
}) {
  const audio = useAudio();
  const track = audio.musicTrack;

  if (!track) return null;

  const hasDuration = Number.isFinite(audio.musicDuration) && audio.musicDuration > 0;
  const progressMax = hasDuration ? audio.musicDuration : 1;
  const progressValue = hasDuration
    ? Math.min(audio.musicCurrentTime, audio.musicDuration)
    : 0;
  const PlaybackIcon = audio.isMusicPlaying ? Pause : Play;

  return (
    <div className="w-72 rounded-md border border-amber-200/15 bg-stone-950/75 px-3 py-2 text-amber-100 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2">
        <Music2
          className="shrink-0 text-amber-300/80"
          size={15}
          aria-hidden="true"
        />

        <span
          className="min-w-0 flex-1 truncate text-xs font-medium"
          title={track.title}
        >
          {track.title}
        </span>

        <button
          type="button"
          className="grid size-7 shrink-0 place-items-center rounded text-amber-100/75 transition hover:bg-white/5 hover:text-amber-100"
          aria-label={audioLabel}
          onClick={() => void audio.toggleMusicPlayback()}
        >
          <PlaybackIcon size={15} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="grid size-7 shrink-0 place-items-center rounded text-amber-100/75 transition hover:bg-white/5 hover:text-amber-100"
          aria-label={audioLabel}
          onClick={() => void audio.nextMusic()}
        >
          <SkipForward size={15} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-1 grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2">
        <span className="text-[10px] tabular-nums text-amber-100/55">
          {formatTime(audio.musicCurrentTime)}
        </span>

        <input
          className="h-1.5 w-full cursor-pointer accent-amber-400 disabled:cursor-default disabled:opacity-40"
          type="range"
          min="0"
          max={progressMax}
          step="0.1"
          value={progressValue}
          disabled={!hasDuration}
          aria-label={audioLabel}
          onChange={(event) => audio.seekMusic(Number(event.target.value))}
        />

        <span className="text-right text-[10px] tabular-nums text-amber-100/55">
          {hasDuration ? formatTime(audio.musicDuration) : '--:--'}
        </span>
      </div>
    </div>
  );
}

export function AudioControls() {
  const [open, setOpen] = useState(false);
  const audio = useAudio();
  const locale = useObservedUiLocale();
  const VolumeIcon = audio.muted ? VolumeX : Volume2;
  const translate = (key: string) => t(key, locale);

  return (
    <div
      className="fixed bottom-5 right-5 z-[100] flex select-none items-end gap-2"
      onClick={(event) => event.stopPropagation()}
    >
      <MusicPlayer audioLabel={translate('ui.audio.music')} />

      <button
        type="button"
        className="grid size-10 shrink-0 place-items-center rounded-md border border-amber-200/20 bg-stone-950/75 text-amber-100 shadow-lg backdrop-blur transition hover:border-amber-200/35 hover:bg-stone-900/85"
        aria-label={translate('ui.audio.settings')}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <VolumeIcon size={18} />
      </button>

      {open && (
        <div className="absolute bottom-12 right-0 w-72 rounded-lg border border-amber-200/15 bg-stone-950/92 p-4 shadow-2xl backdrop-blur-md">
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
    </div>
  );
}
