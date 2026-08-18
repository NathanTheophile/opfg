import {
  Check,
  Lock,
} from 'lucide-react';
import { ACHIEVEMENTS } from '@/game/achievements/catalog';
import { ACHIEVEMENT_FAMILY_LABELS, ACHIEVEMENT_UI_COPY, getAchievementText } from '@/game/achievements/copy';
import type { AchievementFamily, MetaProgressionState } from '@/game/achievements/model';
import type { LocaleId } from '@/game/localization';
import './achievements.css';

interface AchievementsPanelProps {
  metaProgression: MetaProgressionState;
  locale: LocaleId;
}

const FAMILY_ORDER: readonly AchievementFamily[] = [
  'progression', 'origins', 'family', 'grades', 'bounty', 'powers', 'world', 'crew', 'endings',
];

const FAMILY_MARKS: Record<AchievementFamily, string> = {
  progression: '★',
  origins: '✦',
  family: '♛',
  grades: '◆',
  bounty: '⚑',
  powers: '✧',
  world: '◎',
  crew: '✚',
  endings: '⚓',
};

export function AchievementsPanel({ metaProgression, locale }: AchievementsPanelProps) {
  const unlockedCount = Object.keys(metaProgression.unlocks).length;
  const progressPercent = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  return (
    <div className="opfg-achievements">
      <div className="opfg-achievements__summary">
        <strong>{unlockedCount} / {ACHIEVEMENTS.length}</strong>
        <span>{ACHIEVEMENT_UI_COPY[locale].progress}</span>
      </div>
      <div className="opfg-achievements__progress" aria-hidden="true">
        <span style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="opfg-achievements__groups">
        {FAMILY_ORDER.map((family) => {
          const achievements = ACHIEVEMENTS.filter((entry) => entry.family === family);
          if (achievements.length === 0) return null;
          const familyUnlockedCount = achievements.filter(({ id }) => metaProgression.unlocks[id] !== undefined).length;

          return (
            <section key={family} className="opfg-achievements__group">
              <h3>
                <span>{ACHIEVEMENT_FAMILY_LABELS[locale][family]}</span>
                <strong>{familyUnlockedCount}/{achievements.length}</strong>
              </h3>
              <div className="opfg-achievements__list">
                {achievements.map(({ id, family }) => {
                  const unlocked = metaProgression.unlocks[id] !== undefined;
                  const copy = getAchievementText(id, locale);
                  return (
                    <article
                      key={id}
                      className={`opfg-achievement-card${unlocked ? ' is-unlocked' : ''}`}
                      data-family={family}
                    >
                      <span className="opfg-achievement-card__ornament" aria-hidden="true">
                        {FAMILY_MARKS[family]}
                      </span>
                      <span className="opfg-achievement-card__icon" aria-hidden="true">
                        {unlocked ? <Check className="size-4" /> : <Lock className="size-4" />}
                      </span>
                      <span>
                        <strong>{copy.name}</strong>
                        <small>{copy.description}</small>
                      </span>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
