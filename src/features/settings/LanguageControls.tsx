import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  t,
  type LocaleId,
} from '@/game/localization';
import frFlag from './flags/fr.svg';
import enFlag from './flags/en.svg';

interface LanguageControlsProps {
  locale: LocaleId;
  onLocaleChange: (locale: LocaleId) => void;
}

const OPTIONS: Array<{
  id: LocaleId;
  flag: string;
  labelKey: string;
}> = [
  {
    id: 'fr',
    flag: frFlag,
    labelKey: 'ui.language.fr',
  },
  {
    id: 'en',
    flag: enFlag,
    labelKey: 'ui.language.en',
  },
];

export function LanguageControls({
  locale,
  onLocaleChange,
}: LanguageControlsProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const current =
    OPTIONS.find(({ id }) => id === locale) ?? OPTIONS[0];

  const translate = (key: string) => t(key, locale);

  useEffect(() => {
    if (!open) return;

    const closeIfOutside = (event: PointerEvent) => {
      const root = rootRef.current;
      if (
        root &&
        event.target instanceof Node &&
        !root.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('pointerdown', closeIfOutside);
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('pointerdown', closeIfOutside);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed bottom-5 right-[4.5rem] z-[100] select-none"
    >
      <button
        type="button"
        className="grid size-10 place-items-center rounded-md border border-amber-200/20 bg-stone-950/75 shadow-lg backdrop-blur transition hover:border-amber-200/35 hover:bg-stone-900/85"
        aria-label={translate('ui.language.settings')}
        aria-expanded={open}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <img
          src={current.flag}
          alt=""
          className="h-[1.05rem] w-[1.55rem] rounded-[0.12rem] object-cover shadow-[0_1px_4px_rgb(0_0_0/0.55)]"
        />
      </button>

      {open && (
        <div className="absolute bottom-12 right-0 w-48 overflow-hidden rounded-lg border border-amber-200/15 bg-stone-950/92 p-2 shadow-2xl backdrop-blur-md">
          <div className="px-2 pb-2 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-amber-100/55">
            {translate('ui.language.settings')}
          </div>

          <div className="grid gap-1">
            {OPTIONS.map((option) => {
              const selected = option.id === locale;

              return (
                <button
                  key={option.id}
                  type="button"
                  className="grid grid-cols-[1.75rem_1fr_1rem] items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-amber-50/85 transition hover:bg-white/5 disabled:bg-amber-200/[0.06]"
                  disabled={selected}
                  onClick={() => {
                    onLocaleChange(option.id);
                    setOpen(false);
                  }}
                >
                  <img
                    src={option.flag}
                    alt=""
                    className="h-[0.9rem] w-[1.35rem] rounded-[0.1rem] object-cover shadow-[0_1px_3px_rgb(0_0_0/0.5)]"
                  />
                  <span>{translate(option.labelKey)}</span>
                  {selected && (
                    <Check
                      className="size-3.5 text-amber-300"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
