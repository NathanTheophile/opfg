import { useState, type ReactNode } from 'react';
import {
  Music2,
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

export function AudioControls() {
  const [open, setOpen] = useState(false);
  const audio = useAudio();
  const locale = useObservedUiLocale();
  const VolumeIcon = audio.muted ? VolumeX : Volume2;
  const translate = (key: string) => t(key, locale);

  return (
    <div
      className="fixed bottom-5 right-5 z-[100] select-none"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="ml-auto grid size-10 place-items-center rounded-md border border-amber-200/20 bg-stone-950/75 text-amber-100 shadow-lg backdrop-blur transition hover:border-amber-200/35 hover:bg-stone-900/85"
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
