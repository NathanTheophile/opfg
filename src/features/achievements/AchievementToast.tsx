import { useEffect, useRef } from 'react';
import { Trophy, X } from 'lucide-react';
import type { AchievementId } from '@/game/achievements/model';
import { ACHIEVEMENT_UI_COPY, getAchievementText } from '@/game/achievements/copy';
import type { LocaleId } from '@/game/localization';
import './achievements.css';

interface AchievementToastProps {
  achievementId: AchievementId;
  locale: LocaleId;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 4000;

export function AchievementToast({ achievementId, locale, onDismiss }: AchievementToastProps) {
  const copy = getAchievementText(achievementId, locale);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const timer = window.setTimeout(() => onDismissRef.current(), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [achievementId]);

  return (
    <aside className="opfg-achievement-toast" role="status" aria-live="polite">
      <span className="opfg-achievement-toast__icon" aria-hidden="true">
        <Trophy className="size-5" />
      </span>
      <span className="opfg-achievement-toast__copy">
        <small>{ACHIEVEMENT_UI_COPY[locale].unlocked}</small>
        <strong>{copy.name}</strong>
      </span>
      <button type="button" onClick={onDismiss} aria-label={locale === 'fr' ? 'Fermer' : 'Close'} className="opfg-achievement-toast__close">
        <X className="size-4" />
      </button>
    </aside>
  );
}
