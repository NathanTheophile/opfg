import {
  History as HistoryIcon,
  Play,
  RotateCcw,
  ShoppingBag,
  Trophy,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Panel } from '@/components/ui';
import type { ContentCatalog } from '@/game/content/schema';
import type { StorageLike } from '@/game/engine/save';
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

function formatAge(
  ageMonths: number,
  translate: Translator,
): string {
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;

  return months === 0
    ? translate('ui.landing.ageYears', { years })
    : translate('ui.landing.ageYearsMonths', {
        years,
        months,
      });
}

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

  return (
    <main className="opfg-landing">
      <div
        className="opfg-landing__vignette"
        aria-hidden="true"
      />

      <section className="opfg-landing__content">
        <header className="opfg-landing__brand">
          <span className="opfg-landing__kicker">
            {translate('ui.landing.kicker')}
          </span>
          <h1 className="opfg-landing__title">
            {translate('ui.landing.title')}
          </h1>
          <p className="opfg-landing__tagline">
            {translate('ui.landing.tagline')}
          </p>
        </header>

        <div className="opfg-landing__primary">
          {saveDetails ? (
            <>
              <button
                type="button"
                className="opfg-landing__continue"
                onClick={onContinue}
              >
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
                <RotateCcw
                  className="size-3.5"
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
                <Icon
                  className="size-4"
                  aria-hidden="true"
                />
                {translate(labelKey)}
              </Button>
            ),
          )}
        </nav>
      </section>

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
            className="opfg-landing__modal"
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
            <p>{translate('ui.landing.placeholder')}</p>
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
