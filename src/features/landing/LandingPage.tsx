import {
  BookOpen,
  Coffee,
  Compass,
  Gamepad2,
  History as HistoryIcon,
  Music2,
  Newspaper,
  Play,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import {
  useLayoutEffect, useMemo, useRef, useState, } from 'react';
import { Button, Panel, NineSliceFrame } from '@/components/ui';
import { loadMetaProgression } from '@/game/achievements/storage';
import type { ContentCatalog } from '@/game/content/schema';
import { loadCompletedRuns } from '@/game/engine/completedRuns';
import type { StorageLike } from '@/game/engine/save';
import { AchievementsPanel } from '@/features/achievements/AchievementsPanel';
import {
  loadLocale,
  saveLocale,
  t,
  type LocaleId,
  type Translator,
} from '@/game/localization';
import type { GameState } from '@/game/model/schema';
import { LanguageControls } from '@/features/settings/LanguageControls';
import { notifyUiLocaleChanged } from '@/features/settings/localeSync';
import { RunHistoryPanel } from '@/features/run-history/RunHistoryPanel';
import logoMark from '@/assets/branding/opfg-logo-vertical.png';
import './landing-page.css';

type LandingSection =
  | 'achievements'
  | 'shop'
  | 'history';

interface LandingPageProps {
  catalog: ContentCatalog;
  storage: StorageLike;
  activeSave: GameState | null;
  onContinue: () => void;
  onNewGame: () => void;
}

const SECONDARY_ACTIONS = [
  {
    id: 'achievements',
    labelKey: 'ui.landing.achievements',
    Icon: Trophy,
  },
  {
    id: 'shop',
    labelKey: 'ui.landing.shop',
    Icon: ShoppingBag,
  },
  {
    id: 'history',
    labelKey: 'ui.landing.history',
    Icon: HistoryIcon,
  },
] as const;
const COMMUNITY_LINKS = [
  {
    id: 'x-global',
    label: 'X',
    href:
      import.meta.env.VITE_SOCIAL_X_URL ||
      'https://x.com/OPDestinies',
  },
  {
    id: 'x-fr',
    label: 'X FR',
    href:
      import.meta.env.VITE_SOCIAL_X_FR_URL ||
      'https://x.com/OPDestiniesFR',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    href:
      import.meta.env.VITE_SOCIAL_YOUTUBE_URL ||
      'https://www.youtube.com/channel/UCYfktg5W_ylyZ4vdYyWZBbA',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    href: import.meta.env.VITE_SOCIAL_TIKTOK_URL ||
      'https://www.tiktok.com/@onepiecedestinies',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: import.meta.env.VITE_SOCIAL_INSTAGRAM_URL ||
      'https://www.instagram.com/onepiecedestinies/',
  },
  {
    id: 'discord',
    label: 'Discord',
    href: import.meta.env.VITE_DISCORD_URL,
  },
] as const;

const KOFI_URL =
  import.meta.env.VITE_KOFI_URL ||
  'https://ko-fi.com/opdestinies';

/* OPFG LANDING V2 PROPOSAL */
const LANDING_SHOWCASE_COPY = {
  fr: {
    proofPoints: [
      'Choix persistants',
      'Vies rejouables',
      'Destinées multiples',
    ],
    resumeEyebrow: 'Reprendre votre destinée',
    newEyebrow: 'Écrire une nouvelle destinée',
    gazetteTitle: 'La Gazette des Destinées',
    gazetteSubtitle: 'Devlog & prochaines escales',
    news: [
      {
        eyebrow: 'DEVLOG',
        title: 'Derniers préparatifs',
        body:
          'Polish mobile, performances et dernière passe de QA avant la V1.',
        tone: 'gold',
      },
      {
        eyebrow: 'À VENIR',
        title: 'Plus de destinées',
        body:
          'Nouvelles routes, davantage d’événements Active et de nouvelles fins.',
        tone: 'sea',
      },
      {
        eyebrow: 'ROADMAP',
        title: 'Fruits & pouvoirs',
        body:
          'Fruits du Démon et nouvelles progressions de puissance après la V1.',
        tone: 'red',
      },
    ],
  },
  en: {
    proofPoints: [
      'Persistent choices',
      'Replayable lives',
      'Multiple destinies',
    ],
    resumeEyebrow: 'Continue your destiny',
    newEyebrow: 'Write a new destiny',
    gazetteTitle: 'The Destinies Gazette',
    gazetteSubtitle: 'Devlog & next stops',
    news: [
      {
        eyebrow: 'DEVLOG',
        title: 'Final preparations',
        body:
          'Mobile polish, performance work and the final QA pass before V1.',
        tone: 'gold',
      },
      {
        eyebrow: 'COMING NEXT',
        title: 'More destinies',
        body:
          'New routes, more Active events and additional endings.',
        tone: 'sea',
      },
      {
        eyebrow: 'ROADMAP',
        title: 'Fruits & powers',
        body:
          'Devil Fruits and new power progression after V1.',
        tone: 'red',
      },
    ],
  },
} as const;

const LANDING_NEWS_ICONS = [
  BookOpen,
  Compass,
  Sparkles,
] as const;

function YoutubeBrandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="opfg-landing__brand-svg"
    >
      <path
        fill="currentColor"
        d="M22 7.1a2.9 2.9 0 0 0-2-2C18.2 4.6 12 4.6 12 4.6s-6.2 0-8 .5a2.9 2.9 0 0 0-2 2A30 30 0 0 0 1.5 12 30 30 0 0 0 2 16.9a2.9 2.9 0 0 0 2 2c1.8.5 8 .5 8 .5s6.2 0 8-.5a2.9 2.9 0 0 0 2-2 30 30 0 0 0 .5-4.9 30 30 0 0 0-.5-4.9ZM9.9 15.2V8.8l5.4 3.2-5.4 3.2Z"
      />
    </svg>
  );
}

function InstagramBrandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="opfg-landing__brand-svg"
    >
      <rect
        x="3.2"
        y="3.2"
        width="17.6"
        height="17.6"
        rx="5.2"
        ry="5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <circle
        cx="12"
        cy="12"
        r="4.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <circle
        cx="17.5"
        cy="6.7"
        r="1.15"
        fill="currentColor"
      />
    </svg>
  );
}

function LandingSocialIcon({
  id,
}: {
  id: (typeof COMMUNITY_LINKS)[number]['id'];
}) {
  if (id === 'youtube') {
    return <YoutubeBrandIcon />;
  }

  if (id === 'instagram') {
    return <InstagramBrandIcon />;
  }

  if (id === 'tiktok') {
    return <Music2 aria-hidden="true" />;
  }

  if (id === 'discord') {
    return <Gamepad2 aria-hidden="true" />;
  }

  return (
    <span
      className="opfg-landing__x-mark"
      aria-hidden="true"
    >
      X
    </span>
  );
}

function formatAge(
  ageMonths: number,
  translate: Translator,
): string {
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;

  const localized = months === 0
    ? translate('ui.landing.ageYears', { years })
    : translate('ui.landing.ageYearsMonths', {
        years,
        months,
      });

  // Some current landing locale strings still use legacy single-brace tokens.
  // Keep age derived from GameState.ageMonths and normalize only presentation.
  return localized
    .replaceAll('{years}', String(years))
    .replaceAll('{months}', String(months));
}

/* OPFG MOBILE FIXES V4.5 */
export function LandingPage({
  catalog,
  storage,
  activeSave,
  onContinue,
  onNewGame,
}: LandingPageProps) {
  const [locale, setLocale] =
    useState<LocaleId>(() =>
      loadLocale(
        storage,
        navigator.language,
      ),
    );

  const [activeSection, setActiveSection] =
    useState<LandingSection | null>(null);
  const [confirmReset, setConfirmReset] =
    useState(false);

  const landingRef = useRef<HTMLElement | null>(null);

  // OPFG landing viewport scale
  useLayoutEffect(() => {
    const landing = landingRef.current;
    if (!landing) return undefined;

    let frame = 0;

    const fit = () => {
      window.cancelAnimationFrame(frame);

      frame = window.requestAnimationFrame(() => {
        const viewport = window.visualViewport;
        const width =
          viewport?.width
          ?? document.documentElement.clientWidth
          ?? window.innerWidth;
        const height =
          viewport?.height
          ?? document.documentElement.clientHeight
          ?? window.innerHeight;

        const portrait = height > width;

        /*
         * Scale from a stable design reference instead of shrinking the whole
         * landing until every child happens to fit.
         *
         * Desktop reference: 1600 x 900
         * Mobile reference:   390 x 844
         */
        /* OPFG LANDING V4.1 SCALE PARITY */

        const referenceWidth = portrait ? 390 : 1280;
        const referenceHeight = portrait ? 844 : 720;

        const rawScale = Math.min(
          width / referenceWidth,
          height / referenceHeight,
        );

        const minScale = portrait ? 0.72 : 0.76;
        const maxScale = portrait ? 1.12 : 4;

        const scale = Math.min(
          maxScale,
          Math.max(minScale, rawScale),
        );

        const scaleValue = scale.toFixed(4);

        landing.style.setProperty(
          '--opfg-landing-scale',
          scaleValue,
        );
        document.documentElement.style.setProperty(
          '--opfg-landing-scale',
          scaleValue,
        );
      });
    };

    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    window.visualViewport?.addEventListener('resize', fit);
    fit();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
      window.visualViewport?.removeEventListener('resize', fit);
      document.documentElement.style.removeProperty(
        '--opfg-landing-scale',
      );
    };
  }, []);

  const translate: Translator = (key, params) =>
    t(key, locale, params);

  const saveDetails = useMemo(() => {
    if (!activeSave) return null;

    const affiliation =
      activeSave.careerPhase === 'active'
        ? catalog.careerAffiliations.find(
            ({ id }) =>
              id ===
              activeSave.player.career.affiliationId,
          )
        : activeSave.player.profile.affiliationId
          ? catalog.affiliations.find(
              ({ id }) =>
                id ===
                activeSave.player.profile.affiliationId,
            )
          : null;

    return {
      name:
        activeSave.player.profile.name?.trim() ||
        translate('ui.landing.unnamed'),
      affiliation: affiliation
        ? translate(affiliation.nameKey)
        : translate('ui.landing.affiliationUnknown'),
      age: formatAge(
        activeSave.ageMonths,
        translate,
      ),
    };
  }, [activeSave, catalog, locale]);

  const changeLocale = (next: LocaleId) => {
    saveLocale(storage, next);
    setLocale(next);
    notifyUiLocaleChanged(next);
  };

  const requestNewGame = () => {
    if (!activeSave) {
      onNewGame();
      return;
    }

    setConfirmReset(true);
  };

  const activeSectionLabel =
    activeSection
      ? translate(
          SECONDARY_ACTIONS.find(
            ({ id }) => id === activeSection,
          )?.labelKey ??
            'ui.landing.history',
        )
      : '';
  const showcaseCopy =
    locale === 'fr'
      ? LANDING_SHOWCASE_COPY.fr
      : LANDING_SHOWCASE_COPY.en;

  return (
    <main
      ref={landingRef}
      className="opfg-landing"
    >
      <div
        className="opfg-landing__vignette"
        aria-hidden="true"
      />

      <section className="opfg-landing__content">
        <aside
          className="opfg-landing__news-column"
          aria-labelledby="landing-gazette-title"
        >
          <header className="opfg-landing__gazette-heading">
            <span
              className="opfg-landing__gazette-icon"
              aria-hidden="true"
            >
              <Newspaper className="size-5" />
            </span>

            <span>
              <strong id="landing-gazette-title">
                {showcaseCopy.gazetteTitle}
              </strong>
              <small>{showcaseCopy.gazetteSubtitle}</small>
            </span>
          </header>

          <div className="opfg-landing__news-scroll">
            {showcaseCopy.news.map((item, index) => {
              const NewsIcon = LANDING_NEWS_ICONS[index];

              return (
                <article
                  key={item.title}
                  className="opfg-landing__news-card"
                  data-tone={item.tone}
                >
                  <span
                    className="opfg-landing__news-card-icon"
                    aria-hidden="true"
                  >
                    <NewsIcon className="size-4" />
                  </span>

                  <span className="opfg-landing__news-card-copy">
                    <small>{item.eyebrow}</small>
                    <strong>{item.title}</strong>
                    <span>{item.body}</span>
                  </span>
                </article>
              );
            })}
          </div>
        </aside>

        <section className="opfg-landing__hero-column">
          <header className="opfg-landing__brand">
            <div
              className="opfg-landing__logo-stage"
              aria-hidden="true"
            >
              <span className="opfg-landing__logo-halo" />
              <img
                src={logoMark}
                alt=""
                draggable={false}
                className="opfg-landing__logo"
              />
            </div>

            <h1 className="opfg-landing__title sr-only">
              {translate('ui.landing.title')}
            </h1>
          </header>

          <div className="opfg-landing__menu-column">
            <span className="opfg-landing__menu-eyebrow">
              {saveDetails
                ? showcaseCopy.resumeEyebrow
                : showcaseCopy.newEyebrow}
            </span>

            <div className="opfg-landing__primary">
              {saveDetails ? (
                <>
                  <button
                    type="button"
                    className="opfg-landing__continue"
                    onClick={onContinue}
                  >
                    <NineSliceFrame />

                    <span className="opfg-landing__continue-title">
                      <Play
                        className="size-5"
                        aria-hidden="true"
                      />
                      {translate('ui.landing.continue')}
                    </span>

                    <span className="opfg-landing__save-details">
                      <strong>{saveDetails.name}</strong>
                      <span aria-hidden="true">·</span>
                      <span>{saveDetails.affiliation}</span>
                      <span aria-hidden="true">·</span>
                      <span>{saveDetails.age}</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="opfg-landing__new-secondary"
                    onClick={requestNewGame}
                  >
                    <NineSliceFrame />
                    <RotateCcw
                      className="size-4"
                      aria-hidden="true"
                    />
                    {translate('ui.landing.newGame')}
                  </button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="opfg-landing__new-primary"
                  onClick={requestNewGame}
                >
                  <NineSliceFrame />
                  <Play
                    className="size-5"
                    aria-hidden="true"
                  />
                  {translate('ui.landing.newGame')}
                </Button>
              )}
            </div>

            <nav
              className="opfg-landing__secondary"
              aria-label={translate(
                'ui.landing.secondaryNavigation',
              )}
            >
              {SECONDARY_ACTIONS.map(
                ({ id, labelKey, Icon }) => (
                  <Button
                    key={id}
                    variant="glass"
                    className="opfg-landing__secondary-button"
                    onClick={() => setActiveSection(id)}
                  >
                    <NineSliceFrame />
                    <Icon
                      className="size-4"
                      aria-hidden="true"
                    />
                    {translate(labelKey)}
                  </Button>
                ),
              )}
            </nav>
          </div>
        </section>

        <div className="opfg-landing__community">
          <div className="opfg-landing__socials">
            {COMMUNITY_LINKS.map(({ id, label, href }) =>
              href ? (
                <a
                  key={id}
                  className="opfg-landing__community-link"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  data-social={id}
                >
                  <NineSliceFrame />
                  <LandingSocialIcon id={id} />
                  {id === 'x-fr' && (
                    <span className="opfg-landing__social-badge">
                      FR
                    </span>
                  )}
                </a>
              ) : null,
            )}
          </div>

          {KOFI_URL ? (
            <a
              className="opfg-landing__community-link opfg-landing__community-link--kofi"
              href={KOFI_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Ko-fi"
              title="Ko-fi"
            >
              <NineSliceFrame />
              <Coffee aria-hidden="true" />
            </a>
          ) : (
            <span
              className="opfg-landing__community-link opfg-landing__community-link--kofi opfg-landing__community-link--disabled"
              aria-disabled="true"
            >
              <NineSliceFrame />
              <Coffee aria-hidden="true" />
            </span>
          )}
        </div>
      </section>

      <aside
        className="opfg-landing__mobile-news-dock"
        aria-labelledby="landing-mobile-gazette-title"
      >
        <header className="opfg-landing__gazette-heading">
          <span
            className="opfg-landing__gazette-icon"
            aria-hidden="true"
          >
            <Newspaper className="size-5" />
          </span>

          <span>
            <strong id="landing-mobile-gazette-title">
              {showcaseCopy.gazetteTitle}
            </strong>
            <small>{showcaseCopy.gazetteSubtitle}</small>
          </span>
        </header>

        <div className="opfg-landing__news-scroll">
          {showcaseCopy.news.map((item, index) => {
            const NewsIcon = LANDING_NEWS_ICONS[index];

            return (
              <article
                key={item.title}
                className="opfg-landing__news-card"
                data-tone={item.tone}
              >
                <span
                  className="opfg-landing__news-card-icon"
                  aria-hidden="true"
                >
                  <NewsIcon className="size-4" />
                </span>

                <span className="opfg-landing__news-card-copy">
                  <small>{item.eyebrow}</small>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </span>
              </article>
            );
          })}
        </div>
      </aside>

      <div
        className="opfg-landing__mobile-social-rail"
        aria-label="Social"
      >
        {COMMUNITY_LINKS.map(({ id, label, href }) =>
          href ? (
            <a
              key={id}
              className="opfg-landing__mobile-social-link"
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              title={label}
              data-social={id}
            >
              <NineSliceFrame />
              <LandingSocialIcon id={id} />
              {id === 'x-fr' && (
                <span className="opfg-landing__social-badge">
                  FR
                </span>
              )}
            </a>
          ) : null,
        )}

        {KOFI_URL ? (
          <a
            className="opfg-landing__mobile-social-link opfg-landing__mobile-social-link--kofi"
            href={KOFI_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Ko-fi"
            title="Ko-fi"
          >
            <NineSliceFrame />
            <Coffee aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <LanguageControls
        locale={locale}
        onLocaleChange={changeLocale}
      />

      {activeSection && (
        <div
          className="opfg-landing__modal-layer"
          role="presentation"
        >
          <button
            type="button"
            className="opfg-landing__modal-backdrop"
            aria-label={translate('ui.landing.close')}
            onClick={() => setActiveSection(null)}
          />

          <Panel
            variant="strong"
            className={`opfg-landing__modal${
              activeSection === 'achievements'
                ? ' opfg-landing__modal--achievements'
                : activeSection === 'history'
                  ? ' opfg-landing__modal--history'
                  : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={activeSectionLabel}
          >
            <button
              type="button"
              className="opfg-landing__modal-close"
              aria-label={translate('ui.landing.close')}
              onClick={() => setActiveSection(null)}
            >
              <X className="size-4" />
            </button>

            <h2>{activeSectionLabel}</h2>
            {activeSection === 'achievements' ? (
              <AchievementsPanel
                metaProgression={loadMetaProgression(storage)}
                locale={locale}
              />
            ) : activeSection === 'history' ? (
              <RunHistoryPanel
                runs={loadCompletedRuns(storage)}
                catalog={catalog}
                locale={locale}
              />
            ) : (
              <p>{translate('ui.landing.placeholder')}</p>
            )}
          </Panel>
        </div>
      )}

      {confirmReset && (
        <div
          className="opfg-landing__modal-layer"
          role="presentation"
        >
          <button
            type="button"
            className="opfg-landing__modal-backdrop"
            aria-label={translate('ui.landing.cancel')}
            onClick={() => setConfirmReset(false)}
          />

          <Panel
            variant="strong"
            className="opfg-landing__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-reset-title"
          >
            <h2 id="landing-reset-title">
              {translate('ui.landing.resetTitle')}
            </h2>
            <p>{translate('ui.landing.resetBody')}</p>

            <div className="opfg-landing__modal-actions">
              <Button
                variant="subtle"
                onClick={() => setConfirmReset(false)}
              >
                {translate('ui.landing.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={onNewGame}
              >
                {translate('ui.landing.resetConfirm')}
              </Button>
            </div>
          </Panel>
        </div>
      )}
    </main>
  );
}
